"use client";

import { useState } from "react";
import { Expense } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { ExpenseForm, ExpenseFormData } from "@/components/expenses/ExpenseForm";
import toast from "react-hot-toast";

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

interface ExpenseDetailProps {
  expense: Expense;
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean; // 본인 자료이거나 관리자
  onUpdated: () => void;
  onDeleted: () => void;
}

export function ExpenseDetail({
  expense,
  isOpen,
  onClose,
  canEdit,
  onUpdated,
  onDeleted,
}: ExpenseDetailProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleUpdate(data: ExpenseFormData) {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/notion/expenses/${expense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "수정 실패");
      }
      toast.success("경비가 수정되었습니다.");
      setMode("view");
      onUpdated();
    } catch (error: any) {
      toast.error(error.message ?? "수정 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/notion/expenses/${expense.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "삭제 실패");
      }
      toast.success("경비가 삭제되었습니다.");
      onClose();
      onDeleted();
    } catch (error: any) {
      toast.error(error.message ?? "삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (mode === "edit") {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => { setMode("view"); onClose(); }}
        title="경비 수정"
      >
        <ExpenseForm
          initialData={expense}
          onSubmit={handleUpdate}
          onCancel={() => setMode("view")}
          submitLabel="수정 저장"
          isLoading={isSaving}
        />
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="경비 상세">
      <div className="px-4 py-4 space-y-4 pb-safe">
        {/* 영수증 이미지 */}
        {expense.이미지 && (
          <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={expense.이미지}
              alt="영수증"
              className="w-full object-contain max-h-60"
            />
          </div>
        )}

        {/* 핵심 정보 */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              {expense.업체명}
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                CAT_COLOR[expense.카테고리] ?? CAT_COLOR["기타"]
              }`}
            >
              {expense.카테고리}
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {expense.금액.toLocaleString()}
            <span className="text-base font-normal ml-1">{expense.통화}</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{expense.날짜}</p>
        </div>

        {/* 상세 정보 */}
        <div className="space-y-2">
          <DetailRow label="결제수단" value={expense.결제수단} />
          {expense.카드명 && <DetailRow label="카드명" value={expense.카드명} />}
          {expense.승인번호 && <DetailRow label="승인번호" value={expense.승인번호} />}
          {expense.메모 && <DetailRow label="메모" value={expense.메모} />}
          <DetailRow label="등록자" value={expense.등록자} />
        </div>

        {/* 버튼 */}
        {canEdit && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 py-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium disabled:opacity-50"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </button>
            <button
              onClick={() => setMode("edit")}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold"
            >
              수정
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-gray-100 dark:border-gray-800">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm text-gray-800 dark:text-white font-medium text-right max-w-[60%] break-words">
        {value}
      </span>
    </div>
  );
}
