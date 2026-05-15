"use client";

import Link from "next/link";
import { Expense } from "@/types";

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

export function DashboardClient({
  recent,
  isAdmin,
}: {
  recent: Expense[];
  isAdmin: boolean;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-700 dark:text-gray-200">
          최근 경비
        </h2>
        <Link href="/list" className="text-sm text-blue-600 dark:text-blue-400 font-medium">
          전체 보기 →
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
          <p className="text-gray-400 text-sm">등록된 경비가 없습니다</p>
          <Link href="/capture"
            className="mt-3 inline-block bg-blue-600 text-white text-sm px-4 py-2 rounded-xl">
            첫 영수증 추가하기
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {recent.map((e) => (
            <div key={e.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm card-hover">
              <div className="text-2xl">🧾</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                  {e.업체명}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{e.날짜}</span>
                  {isAdmin && (
                    <span className="text-xs text-gray-400 truncate">· {e.등록자}</span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-gray-800 dark:text-white text-sm">
                  {e.금액.toLocaleString()}
                  <span className="text-xs font-normal ml-0.5">{e.통화}</span>
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${CAT_COLOR[e.카테고리] ?? CAT_COLOR["기타"]}`}>
                  {e.카테고리}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 빠른 추가 버튼 */}
      <Link href="/capture"
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-xl text-white text-2xl card-hover z-40"
        style={{ bottom: "calc(64px + env(safe-area-inset-bottom) + 16px)" }}>
        +
      </Link>
    </div>
  );
}
