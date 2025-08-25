"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import Protected from "@/components/auth/Protected";
import { ROLES, hasAnyRole, parseRoles } from "@/lib/auth/roles";
import { useAuth } from "@/lib/auth";
import { analysisService } from "@/lib/api/analysisService";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PhanTichPage() {
  const { user } = useAuth();
  const roles = parseRoles(user?.role);
  const allowed = hasAnyRole(roles, [ROLES.DATA_ANALYST, ROLES.PRODUCT_INSIGHT_ANALYST, ROLES.SYSTEM_ADMIN, ROLES.ADMIN]);

  const router = useRouter();
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function runAnalyzeFiles() {
    const selected = files ?? (fileInputRef.current?.files ? Array.from(fileInputRef.current.files) : null);
    if (!selected || selected.length === 0) return;
    setFileError(null);
    setFileLoading(true);
    try {
      const res = await analysisService.analyzeFiles(selected);
      // persist to session and navigate to results page
      if (typeof window !== "undefined") {
        sessionStorage.setItem("analysis:last:file", JSON.stringify(res));
      }
      router.push("/phan-tich/ket-qua");
  } catch {
      setFileError("Không thể phân tích tệp. Vui lòng thử lại.");
    } finally {
      setFileLoading(false);
    }
  }

  return (
  <Protected allow={() => allowed}>
      {/* Hero banner in landing style */}
      <section className="relative overflow-hidden bg-[#0B4AA3] text-white">
        <div className="absolute inset-0">
          <Image src="/assets/images/hero_frame.png" alt="bg" fill className="object-cover opacity-40" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide text-center">
            Nền tảng phân tích cảm xúc
          </h1>
          <p className="mt-3 text-center text-white/90 max-w-2xl mx-auto">
            Khám phá cảm xúc phía sau lời viết với nền tảng phân tích cảm xúc thông minh từ AI.
          </p>

          {/* Upload card like screenshot #1 */}
          <div className="mt-8 md:mt-10 rounded-2xl border border-white/60 bg-white/95 p-6 md:p-8 shadow-2xl backdrop-blur">
            <div className="rounded-xl border-2 border-dashed border-slate-300/80 bg-gradient-to-b from-white to-slate-50 p-6 md:p-8">
              <h3 className="text-center text-lg font-semibold text-slate-800">Tải nội dung lên</h3>
              <div className="mt-6 grid place-items-center">
                <div className="pointer-events-none select-none rounded-full bg-blue-50 p-4 text-blue-600 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
                    <path fillRule="evenodd" d="M11.47 3.72a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 1 1-1.06 1.06L12.75 6.56V15a.75.75 0 0 1-1.5 0V6.56L8.03 9.28A.75.75 0 1 1 6.97 8.22l4.5-4.5Z" clipRule="evenodd" />
                    <path d="M3.75 15A2.25 2.25 0 0 0 6 17.25h12A2.25 2.25 0 0 0 20.25 15v-1.5a.75.75 0 0 1 1.5 0V15A3.75 3.75 0 0 1 18 18.75H6A3.75 3.75 0 0 1 2.25 15v-1.5a.75.75 0 0 1 1.5 0V15Z" />
                  </svg>
                </div>
                <p className="mt-4 text-center text-sm text-slate-500">Chọn tệp của bạn hoặc kéo và thả</p>
                <p className="text-xs text-slate-400">Chấp nhận: .csv, .txt</p>
                <div className="mt-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    className="hidden"
                    onChange={(e) => setFiles(e.currentTarget.files ? Array.from(e.currentTarget.files) : null)}
                  />
                  <Button onClick={() => fileInputRef.current?.click()} variant="primary" className="shadow-md">
                    Chọn tệp
                  </Button>
                </div>
                {files && files.length > 0 && (
                  <div className="mt-3 text-xs text-slate-600">Đã chọn {files.length} tệp</div>
                )}
                <div className="mt-5 flex items-center justify-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setFiles(null);
                      setFileError(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    Hủy
                  </Button>
                  <Button disabled={!files || fileLoading} onClick={runAnalyzeFiles}>
                    {fileLoading ? "Đang xử lý..." : "Tải lên"}
                  </Button>
                </div>
                {fileError && <p className="mt-3 text-sm text-red-600">{fileError}</p>}
              </div>
            </div>
          </div>
        </div>
      </section>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Positive card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="mx-auto grid place-items-center">
              <div className="grid place-items-center size-12 rounded-full border-4 border-blue-500/70 text-blue-600 text-2xl">🙂</div>
              <div className="mt-3 h-0.5 w-24 rounded bg-green-400/80" />
            </div>
            <h3 className="mt-3 text-center font-semibold text-blue-800">Cảm xúc Tích Cực</h3>
            <p className="mt-2 text-center text-sm text-slate-600">
              Phát hiện cảm xúc tích cực, sự hài lòng và những biểu hiện lạc quan trong nội dung.
            </p>
          </div>

          {/* Negative card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="mx-auto grid place-items-center">
              <div className="grid place-items-center size-12 rounded-full border-4 border-blue-500/70 text-blue-600 text-2xl">🙁</div>
              <div className="mt-3 h-0.5 w-24 rounded bg-rose-400/80" />
            </div>
            <h3 className="mt-3 text-center font-semibold text-blue-800">Cảm xúc Tiêu Cực</h3>
            <p className="mt-2 text-center text-sm text-slate-600">
              Nhận diện lời phàn nàn, phản hồi chỉ trích giúp bạn biết rõ vấn đề trọng tâm.
            </p>
          </div>

          {/* Neutral card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="mx-auto grid place-items-center">
              <div className="grid place-items-center size-12 rounded-full border-4 border-blue-500/70 text-blue-600 text-2xl">😐</div>
              <div className="mt-3 h-0.5 w-24 rounded bg-slate-400/70" />
            </div>
            <h3 className="mt-3 text-center font-semibold text-blue-800">Cảm xúc Trung Lập</h3>
            <p className="mt-2 text-center text-sm text-slate-600">
              Thể hiện thông tin khách quan, ít thiên kiến để đánh giá bối cảnh chung.
            </p>
          </div>
        </div>
      </main>
    </Protected>
  );
}
