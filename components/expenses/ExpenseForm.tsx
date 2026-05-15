"use client";

import { useState } from "react";
import { Expense, Category, Currency } from "@/types";

const CATEGORIES: Category[] = [
  "식비", "교통비", "숙박비", "사무용품", "회의비", "통신비", "접대비", "기타",
];

const CURRENCIES: Currency[] = [
  "KRW", "USD", "EUR", "JPY", "CNY", "GBP", "AUD", "SGD",
];

const CARDS = [
  "법인카드A", "법인카드B", "개인카드", "기타",
];

export type ExpenseFormData = Omit<Expense, "id" | "등록자" | "한도초과" | "한도태그">;

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "저장",
  isLoading = false,
}: ExpenseFormProps) {
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState<ExpenseFormData>({
    업체명: initialData?.업체명 ?? "",
    날짜: initialData?.날짜 ?? today,
    카테고리: initialData?.카테고리 ?? "식비",
    금액: initialData?.금액 ?? 0,
    통화: initialData?.통화 ?? "KRW",
    결제수단: initialData?.결제수단 ?? "카드",
    카드명: initialData?.카드명 ?? "",
    승인번호: initialData?.승인번호 ?? "",
    이미지: initialData?.이미지 ?? "",
    메모: initialData?.메모 ?? "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>({});

  function validate(): boolean {
    const newErrors: Partial<Record<keyof ExpenseFormData, string>> = {};
    if (!form.업체명.trim()) newErrors.업체명 = "업체명을 입력해주세요.";
    if (!form.날짜) newErrors.날짜 = "날짜를 선택해주세요.";
    if (form.금액 <= 0) newErrors.금액 = "금액을 올바르게 입력해주세요.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  }

  function setField<K extends keyof ExpenseFormData>(key: K, value: ExpenseFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4 pb-safe">
      {/* 업체명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          업체명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.업체명}
          onChange={(e) => setField("업체명", e.target.value)}
          placeholder="업체명 입력"
          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.업체명 && (
          <p className="text-xs text-red-500 mt-1">{errors.업체명}</p>
        )}
      </div>

      {/* 날짜 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          날짜 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={form.날짜}
          onChange={(e) => setField("날짜", e.target.value)}
          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.날짜 && (
          <p className="text-xs text-red-500 mt-1">{errors.날짜}</p>
        )}
      </div>

      {/* 카테고리 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          카테고리
        </label>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setField("카테고리", cat)}
              className={`py-2 rounded-xl text-xs font-medium transition-colors ${
                form.카테고리 === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 금액 + 통화 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          금액 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={form.금액 === 0 ? "" : form.금액}
            onChange={(e) => setField("금액", Number(e.target.value))}
            placeholder="0"
            min="0"
            className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={form.통화}
            onChange={(e) => setField("통화", e.target.value as Currency)}
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        {errors.금액 && (
          <p className="text-xs text-red-500 mt-1">{errors.금액}</p>
        )}
      </div>

      {/* 결제수단 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          결제수단
        </label>
        <div className="flex gap-2">
          {(["카드", "현금"] as const).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setField("결제수단", method)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                form.결제수단 === method
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* 카드명 (카드 선택 시) */}
      {form.결제수단 === "카드" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            카드명
          </label>
          <select
            value={form.카드명}
            onChange={(e) => setField("카드명", e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">카드 선택</option>
            {CARDS.map((card) => (
              <option key={card} value={card}>{card}</option>
            ))}
          </select>
        </div>
      )}

      {/* 승인번호 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          승인번호
        </label>
        <input
          type="text"
          value={form.승인번호}
          onChange={(e) => setField("승인번호", e.target.value)}
          placeholder="카드 승인번호 (선택)"
          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 메모 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          메모
        </label>
        <textarea
          value={form.메모}
          onChange={(e) => setField("메모", e.target.value)}
          placeholder="메모 (선택)"
          rows={3}
          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "저장 중..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
