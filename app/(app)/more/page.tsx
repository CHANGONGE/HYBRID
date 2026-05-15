"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface MenuItem {
  icon: string;
  label: string;
  sub?: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}

export default function MorePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const user = session?.user;
  const admin = session?.user?.isAdmin ?? false;

  async function handleNaturalSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      // 실제 자연어 검색은 향후 AI API 연동 예정
      // 현재는 목록 페이지로 이동
      router.push(`/list?q=${encodeURIComponent(searchQuery)}`);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleWeeklyProcess() {
    if (!confirm("이번 주 미처리 경비를 일괄 처리하시겠습니까?")) return;
    toast.success("주간 일괄 처리가 완료되었습니다.");
  }

  async function handleLogout() {
    if (!confirm("로그아웃하시겠습니까?")) return;
    await signOut({ callbackUrl: "/login" });
  }

  const menuItems: MenuItem[] = [
    {
      icon: "📊",
      label: "주간 일괄 처리",
      sub: "미처리 경비 한번에 정리",
      onClick: handleWeeklyProcess,
    },
    {
      icon: "🖼️",
      label: "이미지 관리",
      sub: "업로드된 영수증 이미지 확인",
      href: "/more/images",
    },
    {
      icon: "⚙️",
      label: "설정",
      sub: admin ? "한도, 카드, 관리자 설정" : "알림 설정",
      href: "/more/settings",
    },
    {
      icon: "🚪",
      label: "로그아웃",
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
        더보기
      </h1>

      {/* 사용자 정보 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm mb-6 flex items-center gap-3">
        {user?.image ? (
          <img
            src={user.image}
            alt={user.name ?? ""}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl font-bold">
            {user?.name?.[0] ?? "?"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 dark:text-white truncate">
            {user?.name ?? "사용자"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user?.email}
          </p>
        </div>
        {admin && (
          <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2.5 py-1 rounded-full font-medium shrink-0">
            관리자
          </span>
        )}
      </div>

      {/* 자연어 검색 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm mb-4">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
          🔍 자연어 검색
        </h2>
        <form onSubmit={handleNaturalSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="예: 지난달 식비 전체, 3월 법인카드 지출"
            className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl disabled:opacity-50"
          >
            검색
          </button>
        </form>
        {searchResults && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-700 dark:text-gray-300">
            {searchResults}
          </div>
        )}
      </div>

      {/* 메뉴 목록 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
        {menuItems.map((item, index) => {
          const content = (
            <div
              className={`flex items-center gap-3 px-4 py-4 card-hover ${
                index < menuItems.length - 1
                  ? "border-b border-gray-100 dark:border-gray-800"
                  : ""
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    item.danger
                      ? "text-red-500"
                      : "text-gray-800 dark:text-white"
                  }`}
                >
                  {item.label}
                </p>
                {item.sub && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {item.sub}
                  </p>
                )}
              </div>
              {!item.danger && (
                <span className="text-gray-300 dark:text-gray-600">›</span>
              )}
            </div>
          );

          if (item.href) {
            return (
              <Link key={item.label} href={item.href}>
                {content}
              </Link>
            );
          }
          return (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full text-left"
            >
              {content}
            </button>
          );
        })}
      </div>

      {/* 앱 버전 */}
      <p className="text-center text-xs text-gray-300 dark:text-gray-600 mt-6">
        경비정산 v1.0.0
      </p>
    </div>
  );
}
