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

  // 금액 추출 (가장 큰 숫자)
  const amounts = text.match(/[\d,]+원?/g) ?? [];
  const maxAmount = amounts
    .map((a) => parseInt(a.replace(/[^\d]/g, "")))
    .filter((n) => n > 0)
    .sort((a, b) => b - a)[0] ?? 0;

  // 날짜 추출
  const dateMatch =
    text.match(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/) ??
    text.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  const 날짜 = dateMatch
    ? `${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`
    : new Date().toISOString().slice(0, 10);

  // 승인번호 추출
  const approvalMatch = text.match(/승인번호[:\s]*([A-Z0-9]+)/i);
  const 승인번호 = approvalMatch?.[1] ?? "";

  // 업체명 (첫 번째 줄 사용)
  const 업체명 = lines[0] ?? "";

  // 통화 감지
  const 통화 = text.includes("$") || text.includes("USD")
    ? "USD"
    : text.includes("¥") || text.includes("JPY")
    ? "JPY"
    : "KRW";

  return { 업체명, 날짜, 금액: maxAmount, 통화, 승인번호, confidence: 0.8 };
}
