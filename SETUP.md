# 諛고룷 ???ㅼ젙 媛?대뱶

## 1. Google Cloud Console (OAuth + Vision API)

1. https://console.cloud.google.com ?묒냽 (skydot.cjw@gmail.com 濡쒓렇??
2. ???꾨줈?앺듃 ?앹꽦 ???대쫫: `expense-hybrid`
3. **OAuth ?ㅼ젙**
   - 醫뚯륫 硫붾돱 ??API 諛??쒕퉬????OAuth ?숈쓽 ?붾㈃
   - ?ъ슜???좏삎: ?몃? ??留뚮뱾湲?   - ???대쫫, ?대찓???낅젰 ?????   - 醫뚯륫 ???ъ슜???몄쬆 ?뺣낫 ???ъ슜???몄쬆 ?뺣낫 留뚮뱾湲???OAuth ?대씪?댁뼵??ID
   - ?좏삎: ???좏뵆由ъ??댁뀡
   - ?뱀씤??由щ뵒?됱뀡 URI:
     - http://localhost:3000/api/auth/callback/google
     - https://your-app.vercel.app/api/auth/callback/google
   - 諛쒓툒??**?대씪?댁뼵??ID**, **?대씪?댁뼵??蹂댁븞 鍮꾨?** ??.env.local???낅젰

4. **Vision API ?쒖꽦??*
   - 醫뚯륫 硫붾돱 ??API 諛??쒕퉬?????쇱씠釉뚮윭由?   - "Cloud Vision API" 寃?????ъ슜 ?ㅼ젙
   - ?ъ슜???몄쬆 ?뺣낫 ??API ??留뚮뱾湲?   - 諛쒓툒??**API ??* ??.env.local GOOGLE_VISION_API_KEY???낅젰

---

## 2. Supabase (?대?吏 ??μ냼)

1. https://supabase.com ?묒냽 ???뚯썝媛??(Google 怨꾩젙 ?ъ슜 媛??
2. New Project ???대쫫: `expense-hybrid`, 鍮꾨?踰덊샇 ?ㅼ젙, 吏?? Northeast Asia (Seoul)
3. **Storage 踰꾪궥 ?앹꽦**
   - 醫뚯륫 Storage ??New Bucket
   - ?대쫫: `receipts`, Public: ON
4. **API ???뺤씤**
   - 醫뚯륫 Settings ??API
   - Project URL ??NEXT_PUBLIC_SUPABASE_URL
   - anon public ??NEXT_PUBLIC_SUPABASE_ANON_KEY
   - service_role ??SUPABASE_SERVICE_ROLE_KEY

---

## 3. Firebase (?몄떆 ?뚮┝)

1. https://console.firebase.google.com ?묒냽 (媛숈? Google 怨꾩젙)
2. ?꾨줈?앺듃 異붽? ???대쫫: `expense-hybrid`
3. **?????깅줉**
   - ?꾨줈?앺듃 ?ㅼ젙 ????異붽? ????</>) ?좏깮
   - ???됰꽕?? expense-hybrid
   - 諛쒓툒??firebaseConfig 媛믩뱾 ??.env.local??媛곴컖 ?낅젰
4. **FCM VAPID ??*
   - ?꾨줈?앺듃 ?ㅼ젙 ???대씪?곕뱶 硫붿떆吏??????몄떆 ?몄쬆???앹꽦
   - 諛쒓툒??????NEXT_PUBLIC_FIREBASE_VAPID_KEY
5. **?쒕쾭 ??*
   - ?대씪?곕뱶 硫붿떆吏????쒕쾭 ????FIREBASE_SERVER_KEY (Vercel ?섍꼍蹂?섏뿉留?

---

## 4. GitHub + Vercel 諛고룷

1. https://github.com ?먯꽌 ????μ냼 ?앹꽦 (private 沅뚯옣)
2. HYBRID ?대뜑?먯꽌:
   ```
   git init
   git add .
   git commit -m "珥덇린 而ㅻ컠"
   git remote add origin https://github.com/蹂몄씤ID/expense-hybrid.git
   git push -u origin main
   ```
3. https://vercel.com ??Add New Project ??GitHub ??μ냼 ?좏깮
4. **?섍꼍蹂???ㅼ젙** (Vercel ??Settings ??Environment Variables)
   .env.local??紐⑤뱺 ??ぉ ?낅젰 (NEXTAUTH_URL? 諛고룷 URL濡?蹂寃?
5. Deploy ?대┃

---

## 5. 留덉씠洹몃젅?댁뀡 ?ㅽ뻾 (諛고룷 ??

```bash
cd "C:\AI ?묒뾽\2 Weekly\寃쎈퉬?뺤궛"
pip install supabase requests
set NOTION_API_KEY=ntn_발급받은_Notion_통합키
set NOTION_DB_ID=35dc2b54-24d3-8134-92b1-f802f5e13aba
set SUPABASE_URL=https://xxx.supabase.co
set SUPABASE_SERVICE_ROLE_KEY=xxx
set ADMIN_EMAIL=skydot.cjw@gmail.com
python HYBRID/scripts/migrate.py
```

---

## .env.local 理쒖쥌 ?쒗뵆由?
```
NOTION_API_KEY=ntn_발급받은_Notion_통합키
NOTION_DB_ID=35dc2b54-24d3-8134-92b1-f802f5e13aba
GOOGLE_CLIENT_ID=諛쒓툒諛쏆?媛?GOOGLE_CLIENT_SECRET=諛쒓툒諛쏆?媛?NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=?쒕뜡臾몄옄??2?먯씠??ADMIN_EMAILS=skydot.cjw@gmail.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=諛쒓툒諛쏆?媛?SUPABASE_SERVICE_ROLE_KEY=諛쒓툒諛쏆?媛?GOOGLE_VISION_API_KEY=諛쒓툒諛쏆?媛?NEXT_PUBLIC_FIREBASE_API_KEY=諛쒓툒諛쏆?媛?NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=expense-hybrid
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=諛쒓툒諛쏆?媛?NEXT_PUBLIC_FIREBASE_APP_ID=諛쒓툒諛쏆?媛?NEXT_PUBLIC_FIREBASE_VAPID_KEY=諛쒓툒諛쏆?媛?FIREBASE_SERVER_KEY=諛쒓툒諛쏆?媛?```
