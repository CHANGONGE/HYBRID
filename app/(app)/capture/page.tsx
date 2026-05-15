"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ExpenseForm, ExpenseFormData } from "@/components/expenses/ExpenseForm";

export default function CapturePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [ocrDone, setOcrDone] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [initialFormData, setInitialFormData] = useState<Partial<ExpenseFormData>>({});
  const [formKey, setFormKey] = useState(0); // OCR 결과로 폼 리셋용

  async function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일을 선택해주세요.");
      return;
    }

    // 미리보기
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Supabase 업로드
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/storage", { method: "POST", body: formData });
      if (!res.ok) throw new Error("업로드 실패");
      const data = await res.json();
      setImageUrl(data.url);
      setOcrDone(false);
      toast.success("이미지가 업로드되었습니다.");
    } catch (error) {
      toast.error("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleOcr() {
    if (!imagePreview) return;
    setIsOcrRunning(true);
    try {
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: imagePreview }),
      });
      if (!res.ok) throw new Error("OCR 실패");
      const data = await res.json();
      const result = data.result;

      setInitialFormData((prev) => ({
        ...prev,
        업체명: result.업체명 || prev.업체명,
        날짜: result.날짜 || prev.날짜,
        금액: result.금액 || prev.금액,
        통화: result.통화 || prev.통화,
        승인번호: result.승인번호 || prev.승인번호,
      }));
      setFormKey((k) => k + 1);
      setOcrDone(true);
      toast.success("OCR 추출 완료! 내용을 확인해주세요.");
    } catch (error) {
      toast.error("OCR 처리에 실패했습니다.");
    } finally {
      setIsOcrRunning(false);
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
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message ?? "등록 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
        영수증 추가
      </h1>

      {/* 이미지 영역 */}
      <div className="mb-6">
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="영수증 미리보기"
              className="w-full rounded-2xl object-contain max-h-72 bg-gray-100 dark:bg-gray-800"
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
                <div className="text-white text-sm font-medium">업로드 중...</div>
              </div>
            )}
            <button
              onClick={() => {
                setImagePreview(null);
                setImageUrl("");
                setOcrDone(false);
              }}
              className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center text-sm"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center gap-3">
            <div className="text-4xl">📷</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              영수증 이미지를 추가하세요
            </p>
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl"
              >
                카메라 촬영
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl"
              >
                갤러리 선택
              </button>
            </div>
          </div>
        )}

        {/* 숨겨진 파일 입력 */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />
      </div>

      {/* OCR 버튼 */}
      {imagePreview && !isUploading && (
        <button
          type="button"
          onClick={handleOcr}
          disabled={isOcrRunning}
          className="w-full py-3 mb-6 rounded-xl border-2 border-blue-500 text-blue-600 dark:text-blue-400 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isOcrRunning ? (
            <>
              <span className="animate-spin">⏳</span> OCR 분석 중...
            </>
          ) : ocrDone ? (
            "✅ OCR 재추출"
          ) : (
            "🔍 자동 정보 추출 (OCR)"
          )}
        </button>
      )}

      {/* 경비 입력 폼 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
        <ExpenseForm
          key={formKey}
          initialData={initialFormData}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          submitLabel="경비 등록"
          isLoading={isSaving}
        />
      </div>
    </div>
  );
}
