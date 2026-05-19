"""
영수증샘플 폴더 → Supabase Storage 업로드 + Notion DB 이미지 필드 URL 업데이트

매칭 방식: 파일명에서 3자리 번호(NNN) 추출 후 매핑
  Notion: sample_영수증_038_스마트문구센터_스마트문구센터.png → 038
  Local:  영수증_038_스마트문구센터.png → 038

실행: python scripts/upload_receipts.py
"""

import os, re, json, requests
from pathlib import Path

# ── 설정 ──────────────────────────────────────────────────────────
NOTION_KEY  = os.environ.get("NOTION_API_KEY", "")
NOTION_DB   = os.environ.get("NOTION_DB_ID", "")
SB_URL      = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SB_KEY      = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
ADMIN_EMAIL = "skydot.cjw@gmail.com"
RECEIPTS_DIR = Path(r"C:\AI 작업\2 Weekly\경비정산\영수증샘플")
BUCKET      = "receipts"

NOTION_H = {
    "Authorization": f"Bearer {NOTION_KEY}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
}

def extract_num(filename: str) -> str | None:
    m = re.search(r'_(\d{3})_', filename)
    return m.group(1) if m else None

# ── 1. 로컬 파일 목록 (번호→파일 매핑) ────────────────────────────
local_files = {}
for f in RECEIPTS_DIR.glob("*.png"):
    n = extract_num(f.name)
    if n:
        local_files[n] = f
print(f"로컬 파일: {len(local_files)}개")

# ── 2. Notion 레코드 전체 조회 ──────────────────────────────────
def notion_post(url, payload):
    r = requests.post(url, headers=NOTION_H,
                      data=json.dumps(payload).encode())
    r.raise_for_status()
    return r.json()

rows, cursor = [], None
while True:
    payload = {"page_size": 100}
    if cursor:
        payload["start_cursor"] = cursor
    data = notion_post(f"https://api.notion.com/v1/databases/{NOTION_DB}/query", payload)
    rows.extend(data.get("results", []))
    if not data.get("has_more"):
        break
    cursor = data.get("next_cursor")
print(f"Notion 레코드: {len(rows)}개")

# ── 3. 업로드 + Notion 업데이트 ────────────────────────────────
uploaded = skipped = already = errors = 0

for page in rows:
    img_field = page["properties"].get("이미지", {}).get("rich_text", [])
    img_val = img_field[0]["text"]["content"] if img_field else ""

    # 이미 Supabase URL
    if img_val.startswith("http"):
        already += 1
        continue

    # 번호 추출 → 로컬 파일 찾기
    num = extract_num(img_val) if img_val else None
    if not num or num not in local_files:
        print(f"  ⚠️  매칭 실패 (num={num}): {img_val[:60]}")
        skipped += 1
        continue

    local_path = local_files[num]
    remote_path = f"{ADMIN_EMAIL}/{local_path.name}"

    # Supabase 업로드 (REST API)
    with open(local_path, "rb") as f:
        data = f.read()

    upload_url = f"{SB_URL}/storage/v1/object/{BUCKET}/{remote_path}"
    r = requests.post(
        upload_url,
        headers={
            "Authorization": f"Bearer {SB_KEY}",
            "Content-Type": "image/png",
            "x-upsert": "true",
        },
        data=data,
    )
    if r.status_code not in (200, 201):
        print(f"  ❌ 업로드 실패 {local_path.name}: {r.status_code} {r.text[:100]}")
        errors += 1
        continue

    pub_url = f"{SB_URL}/storage/v1/object/public/{BUCKET}/{remote_path}"

    # Notion 업데이트
    r2 = requests.patch(
        f"https://api.notion.com/v1/pages/{page['id']}",
        headers=NOTION_H,
        data=json.dumps({"properties": {
            "이미지": {"rich_text": [{"text": {"content": pub_url}}]}
        }}).encode(),
    )
    if r2.status_code != 200:
        print(f"  ❌ Notion 업데이트 실패: {r2.status_code}")
        errors += 1
        continue

    print(f"  ✅ {num}: {local_path.name}")
    uploaded += 1

print(f"\n완료: 업로드 {uploaded} / 이미 URL {already} / 매칭실패 {skipped} / 오류 {errors}")
