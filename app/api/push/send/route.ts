import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { fcmTokens } from "@/lib/fcmTokenStore";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email))
    return NextResponse.json({ error: "관리자만 발송 가능" }, { status: 403 });

  const { title, body, targetEmail } = await req.json();
  const serverKey = process.env.FIREBASE_SERVER_KEY;
  if (!serverKey)
    return NextResponse.json({ error: "Firebase 키 미설정" }, { status: 500 });

  const targets = targetEmail
    ? [fcmTokens.get(targetEmail)].filter(Boolean)
    : [...fcmTokens.values()];

  const results = await Promise.allSettled(
    targets.map((token) =>
      fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          Authorization: `key=${serverKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: token,
          notification: { title, body },
          data: { click_action: "/" },
        }),
      })
    )
  );

  return NextResponse.json({ sent: results.length });
}
