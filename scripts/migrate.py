"""
기존 경비정산 시스템 → HYBRID 마이그레이션 스크립트

작업 내용:
1. Notion DB에 '등록자' 필드 추가
2. 기존 이미지(uploads/) → Supabase Storage 업로드
3. Notion DB의 이미지 필드를 로컬경로 → Supabase URL로 업데이트

실행 전 .env 파일에 아래 값 설정 필요:
  NOTION_API_KEY, NOTION_DB_ID
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
  ADMIN_EMAIL (기존 데이터의 등록자로 설정할 이메일)

실행: python scripts/migrate.py
"""

import os, json, requests
from pathlib import Path
from supabase import create_client

# ── 설정 ──────────────────────────────────────────────
NOTION_KEY = os.environ.get("NOTION_API_KEY", "")
NOTION_DB  = os.environ.get("NOTION_DB_ID", "")
SB_URL     = os.environ.get("SUPABASE_URL", "")
SB_KEY     = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "skydot.cjw@gmail.com")
UPLOADS_DIR = Path(__file__).parent.parent.parent / "경비정산" / "uploads"
BUCKET      = "receipts"

NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_KEY}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
}

def notion_get(url):
    r = requests.get(url, headers=NOTION_HEADERS)
    r.raise_for_status()
    return r.json()

def notion_patch(url, payload):
    r = requests.patch(url, headers=NOTION_HEADERS,
                       data=json.dumps(payload, ensure_ascii=False).encode())
    r.raise_for_status()
    return r.json()

def notion_post(url, payload):
    r = requests.post(url, headers=NOTION_HEADERS,
                      data=json.dumps(payload, ensure_ascii=False).encode())
    r.raise_for_status()
    return r.json()

def step1_add_registrant_field():
    """Notion DB에 '등록자' email 필드 추가"""
    print("\n[1단계] Notion DB에 등록자 필드 추가 중...")
    db = notion_get(f"https://api.notion.com/v1/databases/{NOTION_DB}")
    if "등록자" in db.get("properties", {}):
        print("  ✅ 이미 존재합니다.")
        return
    notion_patch(
        f"https://api.notion.com/v1/databases/{NOTION_DB}",
        {"properties": {"등록자": {"email": {}}}}
    )
    print("  ✅ 등록자 필드 추가 완료")

def step2_set_registrant():
    """기존 레코드 전체에 등록자 이메일 설정"""
    print(f"\n[2단계] 기존 레코드에 등록자({ADMIN_EMAIL}) 설정 중...")
    rows, cursor = [], None
    while True:
        payload = {"page_size": 100}
        if cursor:
            payload["start_cursor"] = cursor
        data = notion_post(
            f"https://api.notion.com/v1/databases/{NOTION_DB}/query", payload
        )
        rows.extend(data.get("results", []))
        if not data.get("has_more"):
            break
        cursor = data.get("next_cursor")

    updated = 0
    for page in rows:
        props = page.get("properties", {})
        if props.get("등록자", {}).get("email"):
            continue  # 이미 설정된 경우 스킵
        notion_patch(
            f"https://api.notion.com/v1/pages/{page['id']}",
            {"properties": {"등록자": {"email": ADMIN_EMAIL}}}
        )
        updated += 1
        print(f"  업데이트: {page['id'][:8]}...")

    print(f"  ✅ {updated}건 업데이트 완료 (총 {len(rows)}건)")

def step3_upload_images():
    """로컬 이미지 → Supabase Storage 업로드 + Notion URL 업데이트"""
    print("\n[3단계] 이미지 Supabase 업로드 중...")
    if not SB_URL or not SB_KEY:
        print("  ⚠️  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 미설정 — 건너뜀")
        return

    sb = create_client(SB_URL, SB_KEY)

    # Notion에서 이미지 필드가 있는 레코드 조회
    rows, cursor = [], None
    while True:
        payload = {"page_size": 100}
        if cursor:
            payload["start_cursor"] = cursor
        data = notion_post(
            f"https://api.notion.com/v1/databases/{NOTION_DB}/query", payload
        )
        rows.extend(data.get("results", []))
        if not data.get("has_more"):
            break
        cursor = data.get("next_cursor")

    migrated = skipped = 0
    for page in rows:
        img_field = page["properties"].get("이미지", {}).get("rich_text", [])
        if not img_field:
            skipped += 1
            continue

        img_val = img_field[0]["text"]["content"]

        # 이미 Supabase URL이면 스킵
        if img_val.startswith("http"):
            skipped += 1
            continue

        # 로컬 파일 찾기
        local_path = UPLOADS_DIR / Path(img_val).name
        if not local_path.exists():
            print(f"  ⚠️  파일 없음: {local_path.name}")
            skipped += 1
            continue

        # Supabase 업로드
        remote_path = f"{ADMIN_EMAIL}/{local_path.name}"
        with open(local_path, "rb") as f:
            sb.storage.from_(BUCKET).upload(
                remote_path, f.read(),
                file_options={"content-type": "image/png", "upsert": "true"}
            )

        pub = sb.storage.from_(BUCKET).get_public_url(remote_path)

        # Notion 업데이트
        notion_patch(
            f"https://api.notion.com/v1/pages/{page['id']}",
            {"properties": {"이미지": {"rich_text": [{"text": {"content": pub}}]}}}
        )
        migrated += 1
        print(f"  ✅ {local_path.name} → {pub[:60]}...")

    print(f"\n  ✅ 완료: 업로드 {migrated}건 / 스킵 {skipped}건")

if __name__ == "__main__":
    if not NOTION_KEY or not NOTION_DB:
        print("❌ NOTION_API_KEY, NOTION_DB_ID 환경변수를 설정하세요.")
        exit(1)

    step1_add_registrant_field()
    step2_set_registrant()
    step3_upload_images()
    print("\n🎉 마이그레이션 완료!")
