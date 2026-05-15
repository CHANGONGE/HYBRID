export interface Expense {
  id: string;
  업체명: string;
  날짜: string;
  카테고리: Category;
  금액: number;
  통화: Currency;
  결제수단: "카드" | "현금";
  카드명: string;
  승인번호: string;
  이미지: string;
  메모: string;
  등록자: string; // Google 이메일
  한도초과?: boolean;
  한도태그?: string;
}

export type Category =
  | "식비" | "교통비" | "숙박비" | "사무용품"
  | "회의비" | "통신비" | "접대비" | "기타";

export type Currency =
  | "KRW" | "USD" | "EUR" | "JPY" | "CNY" | "GBP" | "AUD" | "SGD";

export interface KPIData {
  thisMonthTotal: number;
  totalCount: number;
  usedAmount: number;
  limitExceeded: number;
  unprocessed: number;
}

export interface UserRole {
  email: string;
  isAdmin: boolean;
  name?: string;
  image?: string;
}

export interface PushNotification {
  type: "limit_exceeded" | "weekly_report" | "unprocessed" | "month_end";
  title: string;
  body: string;
  userId?: string;
}
