import { Client } from "@notionhq/client";
import { Expense, Category, Currency } from "@/types";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_ID = process.env.NOTION_DB_ID!;

function pageToExpense(page: any): Expense {
  const p = page.properties;
  return {
    id: page.id,
    업체명: p["업체명"]?.title?.[0]?.text?.content ?? "",
    날짜: p["날짜"]?.date?.start ?? "",
    카테고리: (p["카테고리"]?.select?.name ?? "기타") as Category,
    금액: p["금액"]?.number ?? 0,
    통화: (p["통화"]?.select?.name ?? "KRW") as Currency,
    결제수단: p["결제수단"]?.select?.name ?? "카드",
    카드명: p["카드명"]?.select?.name ?? "",
    승인번호: p["승인번호"]?.rich_text?.[0]?.text?.content ?? "",
    이미지: p["이미지"]?.rich_text?.[0]?.text?.content ?? "",
    메모: p["메모"]?.rich_text?.[0]?.text?.content ?? "",
    등록자: p["등록자"]?.email ?? "",
  };
}

export async function getExpenses(userEmail?: string): Promise<Expense[]> {
  const results: Expense[] = [];
  let cursor: string | undefined;

  const filter = userEmail
    ? {
        property: "등록자",
        email: { equals: userEmail },
      }
    : undefined;

  while (true) {
    const resp = await notion.databases.query({
      database_id: DB_ID,
      filter: filter as any,
      sorts: [{ property: "날짜", direction: "descending" }],
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    resp.results.forEach((p) => results.push(pageToExpense(p)));
    if (!resp.has_more) break;
    cursor = resp.next_cursor ?? undefined;
  }

  return results;
}

export async function getAllExpenses(): Promise<Expense[]> {
  return getExpenses();
}

export async function addExpense(data: Omit<Expense, "id">): Promise<string> {
  const resp = await notion.pages.create({
    parent: { database_id: DB_ID },
    properties: {
      업체명: { title: [{ text: { content: data.업체명 } }] },
      날짜: { date: { start: data.날짜 } },
      카테고리: { select: { name: data.카테고리 } },
      금액: { number: data.금액 },
      통화: { select: { name: data.통화 } },
      결제수단: { select: { name: data.결제수단 } },
      ...(data.카드명 ? { 카드명: { select: { name: data.카드명 } } } : {}),
      승인번호: { rich_text: [{ text: { content: data.승인번호 ?? "" } }] },
      이미지: { rich_text: [{ text: { content: data.이미지 ?? "" } }] },
      메모: { rich_text: [{ text: { content: data.메모 ?? "" } }] },
      등록자: { email: data.등록자 },
    } as any,
  });
  return resp.id;
}

export async function updateExpense(
  id: string,
  data: Partial<Omit<Expense, "id">>
): Promise<void> {
  const props: any = {};
  if (data.업체명 !== undefined)
    props["업체명"] = { title: [{ text: { content: data.업체명 } }] };
  if (data.날짜 !== undefined) props["날짜"] = { date: { start: data.날짜 } };
  if (data.카테고리 !== undefined)
    props["카테고리"] = { select: { name: data.카테고리 } };
  if (data.금액 !== undefined) props["금액"] = { number: data.금액 };
  if (data.통화 !== undefined) props["통화"] = { select: { name: data.통화 } };
  if (data.결제수단 !== undefined)
    props["결제수단"] = { select: { name: data.결제수단 } };
  if (data.카드명 !== undefined)
    props["카드명"] = { select: { name: data.카드명 } };
  if (data.승인번호 !== undefined)
    props["승인번호"] = { rich_text: [{ text: { content: data.승인번호 } }] };
  if (data.이미지 !== undefined)
    props["이미지"] = { rich_text: [{ text: { content: data.이미지 } }] };
  if (data.메모 !== undefined)
    props["메모"] = { rich_text: [{ text: { content: data.메모 } }] };

  await notion.pages.update({ page_id: id, properties: props });
}

export async function deleteExpense(id: string): Promise<void> {
  await notion.pages.update({ page_id: id, properties: {}, archived: true });
}

export async function getKPI(userEmail?: string) {
  const expenses = userEmail
    ? await getAllExpenses()
    : await getExpenses(userEmail);

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const thisMonthExpenses = expenses.filter((e) =>
    e.날짜.startsWith(thisMonth)
  );

  return {
    thisMonthTotal: thisMonthExpenses
      .filter((e) => e.통화 === "KRW")
      .reduce((sum, e) => sum + e.금액, 0),
    totalCount: expenses.length,
    usedAmount: expenses.reduce(
      (sum, e) => sum + (e.통화 === "KRW" ? e.금액 : 0),
      0
    ),
    limitExceeded: expenses.filter((e) => e.한도초과).length,
    unprocessed: expenses.filter((e) => !e.이미지).length,
  };
}
