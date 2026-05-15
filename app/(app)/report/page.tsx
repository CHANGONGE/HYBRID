"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Expense } from "@/types";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#3b82f6", "#ef4444", "#8b5cf6", "#22c55e",
  "#eab308", "#f97316", "#ec4899", "#6b7280",
];

export default function ReportPage() {
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/notion/expenses");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setExpenses(data.expenses);

        // 현재 월을 기본 선택
        const now = new Date();
        setSelectedMonth(
          `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
        );
      } catch {
        console.error("경비 로드 실패");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // 월 목록 생성
  const months = [
    ...new Set(expenses.map((e) => e.날짜.slice(0, 7))),
  ].sort((a, b) => b.localeCompare(a));

  // 선택 월 경비
  const monthExpenses = expenses.filter(
    (e) => !selectedMonth || e.날짜.startsWith(selectedMonth)
  );

  // 월별 합계 (KRW)
  const monthlyData = months.slice(0, 6).map((month) => {
    const total = expenses
      .filter((e) => e.날짜.startsWith(month) && e.통화 === "KRW")
      .reduce((sum, e) => sum + e.금액, 0);
    return { name: month.replace("-", "/"), total };
  }).reverse();

  // 카테고리별 집계 (선택 월)
  const catMap: Record<string, number> = {};
  monthExpenses
    .filter((e) => e.통화 === "KRW")
    .forEach((e) => {
      catMap[e.카테고리] = (catMap[e.카테고리] ?? 0) + e.금액;
    });
  const categoryData = Object.entries(catMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 카드별 집계 (선택 월)
  const cardMap: Record<string, number> = {};
  monthExpenses
    .filter((e) => e.통화 === "KRW" && e.카드명)
    .forEach((e) => {
      cardMap[e.카드명] = (cardMap[e.카드명] ?? 0) + e.금액;
    });
  const cardData = Object.entries(cardMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const totalKrw = monthExpenses
    .filter((e) => e.통화 === "KRW")
    .reduce((sum, e) => sum + e.금액, 0);

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-1/2" />
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          집계 리포트
        </h1>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none"
        >
          <option value="">전체 기간</option>
          {months.map((m) => (
            <option key={m} value={m}>{m.replace("-", "년 ")}월</option>
          ))}
        </select>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">KRW 합계</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {totalKrw.toLocaleString()}원
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">총 건수</p>
          <p className="text-lg font-bold text-gray-800 dark:text-white">
            {monthExpenses.length}건
          </p>
        </div>
      </div>

      {/* 월별 지출 추이 */}
      {monthlyData.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">
            월별 지출 추이 (KRW)
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString()}원`, "금액"]} />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 카테고리별 도넛 차트 */}
      {categoryData.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">
            카테고리별 지출
          </h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()}원`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-800 dark:text-white">
                    {totalKrw > 0 ? Math.round((item.value / totalKrw) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 카드별 지출 */}
      {cardData.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">
            카드별 지출 (KRW)
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={cardData}
              layout="vertical"
              margin={{ top: 0, right: 0, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
              />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString()}원`, "금액"]} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {expenses.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
          <p className="text-gray-400 text-sm">집계할 경비 데이터가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
