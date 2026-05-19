# 초기 설정 가이드 (SETUP)

## 1. Google Cloud Console (OAuth + Vision API)

1. https://console.cloud.google.com 접속 (skydot.cjw@gmail.com 로그인)
2. 프로젝트: hybrid-cee0c
3. OAuth 동의 화면 → 테스트 사용자 추가
4. 사용자 인증 정보 → OAuth 클라이언트 ID 확인
   - 클라이언트 ID: 169846683321-mb2b0tcdsp6s81ldeso8rtkguf4a4u73.apps.googleusercontent.com
   - 승인된 리다이렉션 URI: https://hybrid-virid.vercel.app/api/auth/callback/google

## 2. Supabase

- 프로젝트 URL: https://okajkwmpxqdocertzueq.supabase.co
- 버킷: receipts (공개)
- 영수증 이미지: receipt_NNN.png 형식으로 저장

## 3. Notion DB

- DB ID: 35dc2b54-24d3-8134-92b1-f802f5e13aba
- 관리자: skydot.cjw@gmail.com
- 데이터: 100건

## 4. Vercel 환경변수

| 변수 | 상태 |
|------|------|
| GOOGLE_CLIENT_ID | ✅ |
| GOOGLE_CLIENT_SECRET | ✅ |
| NEXTAUTH_URL | ✅ https://hybrid-virid.vercel.app |
| NEXTAUTH_SECRET | ✅ |
| ADMIN_EMAILS | ✅ skydot.cjw@gmail.com |
| NOTION_API_KEY | ✅ |
| NOTION_DB_ID | ✅ |
| NEXT_PUBLIC_SUPABASE_URL | ✅ |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ |
| SUPABASE_SERVICE_ROLE_KEY | ✅ |
| GOOGLE_VISION_API_KEY | ✅ |
| NEXT_PUBLIC_FIREBASE_* | ✅ |
| FIREBASE_SERVER_KEY | ❌ 미설정 (푸시알림 발송 불가) |

## 5. 로컬 개발 서버

```bash
cd "C:/AI 작업/2 Weekly/경비정산/HYBRID"
npm run dev -- -H 0.0.0.0
# 모바일 접속: http://192.168.35.138:3000
```

## 6. Firebase 푸시알림 (미완료)

Firebase 콘솔 → 프로젝트 설정 → 클라우드 메시징
→ Cloud Messaging API (Legacy) 활성화 → 서버 키 복사
→ Vercel 환경변수에 FIREBASE_SERVER_KEY 추가 후 Redeploy
