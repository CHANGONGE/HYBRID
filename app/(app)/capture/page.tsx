"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ExpenseForm, ExpenseFormData } from "@/components/expenses/ExpenseForm";

export default function CapturePage() {
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const setFieldRef = useRef<(<K extends keyof ExpenseFormData>(k: K, v: ExpenseFormData[K]) => void) | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleFormReady = useCallback(
    (fn: <K extends keyof ExpenseFormData>(k: K, v: ExpenseFormData[K]) => void) => {
      setFieldRef.current = fn;
    },
    []
  );

  async function runOcr(base64: string) {
    setIsOcrRunning(true);
    try {
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      if (!res.ok) return;
      const { result } = await res.json();
      const setField = setFieldRef.current;
      if (!setField) return;
      if (result.업체명) setField("업체명", result.업체명);
      if (result.금액 > 0) setField("금액", result.금액);
      if (result.날짜) setField("날짜", result.날짜);
      if (result.통화) setField("통화", result.통화);
      if (result.승인번호) setField("승인번호", result.승인번호);
      toast.success("정보 자동 추출 완료. 확인 후 수정하세요.");
    } catch {
      // 무시 - 수동 입력 가능
    } finally {
      setIsOcrRunning(false);
    }
  }

  async function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일을 선택해주세요.");
      return;
    }

    // 미리보기 + 자동 OCR
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      runOcr(base64);
    };
    reader.readAsDataURL(file);

    // Supabase 업로드
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/storage", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setImageUrl(data.url);
    } catch {
      toast.error("이미지 업로드 실패. 등록은 가능합니다.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(data: ExpenseFormData) {
    setIsSaving(true);
    try {
      const payload = { ...data, 이미지: imageUrl };
      const res = await fetch("/api/notion/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "등록 실패");
      }
      toast.success("경비가 등록되었습니다.");
      router.push("/list");
    } catch (error: any) {
      toast.error(error.message ?? "등록 중 오류 발생");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-6">영수증 추가</h1>

      {/* 이미지 영역 */}
      <div className="mb-4">
        {imagePreview ? (
          <div className="relative">
            <img src={imagePreview} alt="영수증" className="w-full rounded-2xl object-contain max-h-72 bg-gray-100 dark:bg-gray-800" />
            {(isUploading || isOcrRunning) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
                <p className="text-white text-sm font-semibold">
                  {isOcrRunning ? "정보 추출 중..." : "업로드 중..."}
                </p>
              </div>
            )}
            <button
              onClick={() => { setImagePreview(null); setImageUrl(""); }}
              className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center text-sm"
            >✕</button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center gap-3">
            <div className="text-4xl">📷</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">영수증 이미지를 추가하세요</p>
            <div className="flex gap-3 w-full">
              <button type="button" onClick={() => cameraInputRef.current?.click()}
                className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl">
                카메라 촬영
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl">
                갤러리 선택
              </button>
            </div>
          </div>
        )}
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
      </div>

      {/* 경비 입력 폼 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
        <ExpenseForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          submitLabel="경비 등록"
          isLoading={isSaving}
          onFormReady={handleFormReady}
        />
      </div>
    </div>
  );
}
