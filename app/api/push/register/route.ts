import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { fcmTokens } from "@/lib/fcmTokenStore";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await req.json();
  if (!token)
    return NextResponse.json({ error: "토큰 없음" }, { status: 400 });

  fcmTokens.set(session.user.email, token);
  return NextResponse.json({ ok: true });
}
