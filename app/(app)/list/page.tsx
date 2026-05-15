"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Expense, Category } from "@/types";
import { ExpenseDetail } from "@/components/expenses/ExpenseDetail";

const CATEGORIES: Category[] = [
  "식비", "교통비", "숙박비", "사무용품", "회의비", "통신비", "접대비", "기타",
];

const CAT_COLOR: Record<string, string> = {
  식비: "bg-red-100 text-red-700",
  교통비: "bg-blue-100 text-blue-700",
  숙박비: "bg-purple-100 text-purple-700",
  사무용품: "bg-green-100 text-green-700",
  회의비: "bg-yellow-100 text-yellow-700",
  통신비: "bg-orange-100 text-orange-700",
  접대비: "bg-pink-100 text-pink-700",
  기타: "bg-gray-100 text-gray-700",
};

export default function ListPage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email ?? "";
  const admin = session?.user?.isAdmin ?? false;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterCategory, setFilterCategory] = useState<Category | "">("");
  const [filterCard, setFilterCard] = useState("");

  const loadExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notion/expenses");
      if (!res.ok) throw new Error("로드 실패");
      const data = await res.json();
      setExpenses(data.expenses);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const filtered = expenses.filter((e) => {
    if (dateFrom && e.날짜 < dateFrom) return false;
    if (dateTo && e.날짜 > dateTo) return false;
    if (filterCategory && e.카테고리 !== filterCategory) return false;
    if (filterCard && e.카드명 !== filterCard) return false;
    return true;
  });

  const cards = [...new Set(expenses.map((e) => e.카드명).filter(Boolean))];

  function openDetail(expense: Expense) {
    setSelectedExpense(expense);
    setIsDetailOpen(true);
  }

  const canEdit = (expense: Expense) =>
    admin || expense.등록자 === userEmail;

  const grouped: Record<string, Expense[]> = {};
  filtered.forEach((e) => {
    const month = e.날짜.slice(0, 7);
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(e);
  });
  const sortedMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        경비 목록
      </h1>

      {/* 필터 영역 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-4 shadow-sm space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">시작일</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">종료일</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as Category | "")}
            className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 카테고리</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={filterCard}
            onChange={(e) => setFilterCard(e.target.value)}
            className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 카드</option>
            {cards.map((card) => (
              <option key={card} value={card}>{card}</option>
            ))}
          </select>
        </div>
        {(dateFrom || dateTo || filterCategory || filterCard) && (
          <button
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              setFilterCategory("");
              setFilterCard("");
            }}
            className="text-xs text-blue-600 dark:text-blue-400 font-medium"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* 결과 요약 */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          총 <span className="font-semibold text-gray-800 dark:text-white">{filtered.length}건</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          KRW 합계:{" "}
          <span className="font-semibold text-gray-800 dark:text-white">
            {filtered
              .filter((e) => e.통화 === "KRW")
              .reduce((sum, e) => sum + e.금액, 0)
              .toLocaleString()}원
          </span>
        </p>
      </div>

      {/* 목록 */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
          <p className="text-gray-400 text-sm">조건에 맞는 경비가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedMonths.map((month) => (
            <div key={month}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400">
                  {month.replace("-", "년 ")}월
                </h2>
                <span className="text-xs text-gray-400">
                  {grouped[month]
                    .filter((e) => e.통화 === "KRW")
                    .reduce((sum, e) => sum + e.금액, 0)
                    .toLocaleString()}원
                </span>
              </div>
              <div className="space-y-2">
                {grouped[month].map((expense) => (
                  <button
                    key={expense.id}
                    onClick={() => openDetail(expense)}
                    className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm card-hover text-left"
                  >
                    <div className="text-2xl">
                      {expense.이미지 ? "🧾" : "📋"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                        {expense.업체명}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{expense.날짜}</span>
                        {admin && (
                          <span className="text-xs text-gray-400 truncate">
                            · {expense.등록자}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-800 dark:text-white text-sm">
                        {expense.금액.toLocaleString()}
                        <span className="text-xs font-normal ml-0.5">{expense.통화}</span>
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          CAT_COLOR[expense.카테고리] ?? CAT_COLOR["기타"]
                        }`}
                      >
                        {expense.카테고리}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedExpense && (
        <ExpenseDetail
          expense={selectedExpense}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          canEdit={canEdit(selectedExpense)}
          onUpdated={loadExpenses}
          onDeleted={loadExpenses}
        />
      )}
    </div>
  );
}
