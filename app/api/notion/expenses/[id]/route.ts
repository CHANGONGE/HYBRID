import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { getExpenses, updateExpense, deleteExpense } from "@/lib/notion";

async function checkPermission(
  expenseId: string,
  userEmail: string
): Promise<{ allowed: boolean; reason?: string }> {
  if (isAdmin(userEmail)) return { allowed: true };

  // 본인 자료인지 확인
  const expenses = await getExpenses(userEmail);
  const found = expenses.find((e) => e.id === expenseId);
  if (!found) {
    return { allowed: false, reason: "해당 경비를 찾을 수 없거나 권한이 없습니다." };
  }
  return { allowed: true };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { allowed, reason } = await checkPermission(
    params.id,
    session.user.email
  );
  if (!allowed) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  try {
    const body = await request.json();
    // 등록자 필드는 수정 불가
    const { 등록자, id, ...updateData } = body;
    await updateExpense(params.id, updateData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/notion/expenses/[id] error:", error);
    return NextResponse.json(
      { error: "경비 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { allowed, reason } = await checkPermission(
    params.id,
    session.user.email
  );
  if (!allowed) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  try {
    await deleteExpense(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/notion/expenses/[id] error:", error);
    return NextResponse.json(
      { error: "경비 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
