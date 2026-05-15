import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { extractReceiptData } from "@/lib/ocr";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "이미지 데이터가 없습니다." },
        { status: 400 }
      );
    }

    // data:image/... 접두사 제거
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
    const result = await extractReceiptData(base64Data);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("POST /api/ocr error:", error);
    return NextResponse.json(
      { error: "OCR 처리에 실패했습니다." },
      { status: 500 }
    );
  }
}
