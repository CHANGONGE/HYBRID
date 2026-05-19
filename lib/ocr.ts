export interface OcrResult {
  업체명: string;
  날짜: string;
  금액: number;
  통화: string;
  승인번호: string;
  confidence: number;
}

export async function extractReceiptData(
  imageBase64: string
): Promise<OcrResult> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) throw new Error("Google Vision API 키가 설정되지 않았습니다.");

  const resp = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: imageBase64 },
            features: [{ type: "TEXT_DETECTION", maxResults: 1 }],
          },
        ],
      }),
    }
  );

  const data = await resp.json();
  const text: string =
    data.responses?.[0]?.fullTextAnnotation?.text ?? "";

  return parseReceiptText(text);
}

function parseReceiptText(text: string): OcrResult {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // ── 금액 추출 ──────────────────────────────────────────
  // 1순위: 합계/결제금액/총금액 패턴
  let 금액 = 0;
  const totalPatterns = [
    /(?:합\s*계|결제금액|총\s*금액|받을금액|청구금액|지불금액|total)[^\d]*([\d,]+)/i,
    /[\d,]+\s*원\b/g,
  ];
  const totalMatch = text.match(totalPatterns[0]);
  if (totalMatch) {
    금액 = parseInt(totalMatch[1].replace(/,/g, ""));
  } else {
    // 2순위: "원" 단위 금액 중 가장 큰 것 (4자리 이상, 전화번호·날짜 제외)
    const wonAmounts = [...text.matchAll(/(\d[\d,]{2,})\s*원/g)]
      .map((m) => parseInt(m[1].replace(/,/g, "")))
      .filter((n) => n >= 100 && n <= 100_000_000);
    if (wonAmounts.length) {
      금액 = Math.max(...wonAmounts);
    } else {
      // 3순위: 4~8자리 독립 숫자 중 가장 큰 것
      const nums = [...text.matchAll(/(?<!\d)(\d{4,8})(?!\d)/g)]
        .map((m) => parseInt(m[1]))
        .filter((n) => n >= 1000 && n <= 10_000_000);
      if (nums.length) 금액 = Math.max(...nums);
    }
  }

  // ── 날짜 추출 ──────────────────────────────────────────
  const dateMatch =
    text.match(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/) ??
    text.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  const 날짜 = dateMatch
    ? `${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`
    : new Date().toISOString().slice(0, 10);

  // ── 승인번호 추출 ──────────────────────────────────────
  const approvalMatch = text.match(/승인\s*번호[:\s]*([A-Z0-9]{6,})/i)
    ?? text.match(/승인[:\s]*([0-9]{6,})/i);
  const 승인번호 = approvalMatch?.[1] ?? "";

  // ── 업체명 추출 ────────────────────────────────────────
  // 전화번호·숫자만인 줄·날짜줄·주소줄 제외하고 첫 번째 의미있는 줄
  const skipPattern = /^[\d\s\-\.\/\(\)]+$|^(서울|경기|인천|부산|대구|광주|대전|http|www|tel|fax)/i;
  const meaningfulLines = lines.filter(
    (l) => l.length >= 2 && !skipPattern.test(l)
  );
  const 업체명 = meaningfulLines[0] ?? lines[0] ?? "";

  // ── 통화 감지 ──────────────────────────────────────────
  const 통화 = text.includes("$") || /USD/i.test(text)
    ? "USD"
    : text.includes("¥") || /JPY/i.test(text)
    ? "JPY"
    : "KRW";

  return { 업체명, 날짜, 금액, 통화, 승인번호, confidence: 0.8 };
}
