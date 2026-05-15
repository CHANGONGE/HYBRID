"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const CARDS = ["법인카드A", "법인카드B", "개인카드", "기타"];

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const admin = (session?.user as any)?.isAdmin ?? false;

  // 관리자 설정 상태
  const [monthlyLimit, setMonthlyLimit] = useState<number>(500000);
  const [mealLimit, setMealLimit] = useState<number>(30000);
  const [entertainLimit, setEntertainLimit] = useState<number>(100000);
  const [adminEmails] = useState<string[]>(
    (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",").filter(Boolean)
  );
  const [isSavingLimits, setIsSavingLimits] = useState(false);

  // 알림 설정 상태
  const [notifyLimitExceeded, setNotifyLimitExceeded] = useState(true);
  const [notifyWeeklyReport, setNotifyWeeklyReport] = useState(true);
  const [notifyMonthEnd, setNotifyMonthEnd] = useState(false);
  const [isSavingNotify, setIsSavingNotify] = useState(false);

  async function handleSaveLimits() {
    setIsSavingLimits(true);
    try {
      // 실제 구현 시 한도를 Notion 또는 DB에 저장
      await new Promise((r) => setTimeout(r, 500)); // 시뮬레이션
      toast.success("한도 설정이 저장되었습니다.");
    } catch {
      toast.error("저장에 실패했습니다.");
    } finally {
      setIsSavingLimits(false);
    }
  }

  async function handleSaveNotify() {
    setIsSavingNotify(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      toast.success("알림 설정이 저장되었습니다.");
    } catch {
      toast.error("저장에 실패했습니다.");
    } finally {
      setIsSavingNotify(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
        >
          ‹
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">설정</h1>
      </div>

      {/* 관리자 전용: 한도 설정 */}
      {admin && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">
            💰 한도 설정 (관리자)
          </h2>

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              월 경비 한도 (KRW)
            </label>
            <input
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(Number(e.target.value))}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              1회 식비 한도 (KRW)
            </label>
            <input
              type="number"
              value={mealLimit}
              onChange={(e) => setMealLimit(Number(e.target.value))}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              1회 접대비 한도 (KRW)
            </label>
            <input
              type="number"
              value={entertainLimit}
              onChange={(e) => setEntertainLimit(Number(e.target.value))}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSaveLimits}
            disabled={isSavingLimits}
            className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
          >
            {isSavingLimits ? "저장 중..." : "한도 저장"}
          </button>
        </div>
      )}

      {/* 관리자 전용: 카드 관리 */}
      {admin && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">
            💳 카드 관리 (관리자)
          </h2>
          <div className="space-y-2">
            {CARDS.map((card) => (
              <div
                key={card}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">{card}</span>
                <button className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                  삭제
                </button>
              </div>
            ))}
          </div>
          <button className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            + 카드 추가
          </button>
        </div>
      )}

      {/* 관리자 전용: 관리자 이메일 목록 */}
      {admin && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">
            👤 관리자 이메일
          </h2>
          <p className="text-xs text-gray-400">
            환경변수(ADMIN_EMAILS)로 관리됩니다.
          </p>
          <div className="space-y-1">
            {adminEmails.length > 0 ? (
              adminEmails.map((email) => (
                <div
                  key={email}
                  className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2"
                >
                  {email}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">설정된 관리자가 없습니다.</p>
            )}
          </div>
        </div>
      )}

      {/* 알림 설정 (모든 사용자) */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">
          🔔 알림 설정
        </h2>

        <ToggleRow
          label="한도 초과 알림"
          sub="경비 한도 초과 시 즉시 알림"
          checked={notifyLimitExceeded}
          onChange={setNotifyLimitExceeded}
        />
        <ToggleRow
          label="주간 리포트 알림"
          sub="매주 월요일 지난 주 집계 알림"
          checked={notifyWeeklyReport}
          onChange={setNotifyWeeklyReport}
        />
        <ToggleRow
          label="월말 마감 알림"
          sub="매월 마지막 날 미처리 경비 알림"
          checked={notifyMonthEnd}
          onChange={setNotifyMonthEnd}
        />

        <button
          onClick={handleSaveNotify}
          disabled={isSavingNotify}
          className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
        >
          {isSavingNotify ? "저장 중..." : "알림 설정 저장"}
        </button>
      </div>

      {/* 계정 정보 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-2">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">
          계정
        </h2>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-500">이메일</span>
          <span className="text-sm text-gray-800 dark:text-white">
            {session?.user?.email}
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-500">역할</span>
          <span className="text-sm text-gray-800 dark:text-white">
            {admin ? "관리자" : "일반 사용자"}
          </span>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string;
  sub: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
