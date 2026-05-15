import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { getExpenses, getAllExpenses, addExpense } from "@/lib/notion";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const expenses = isAdmin(session.user.email)
      ? await getAllExpenses()
      : await getExpenses(session.user.email);

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error("GET /api/notion/expenses error:", error);
    return NextResponse.json(
      { error: "경비 목록을 불러오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = {
      ...body,
      등록자: session.user.email,
    };

    const id = await addExpense(data);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/notion/expenses error:", error);
    return NextResponse.json(
      { error: "경비 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}
