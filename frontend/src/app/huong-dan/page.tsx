import Link from "next/link";
import { guideChapters } from "@/components/layout/DocsLayout";

export const metadata = { title: "Hướng dẫn sử dụng | Cerevex" };

export default function UserGuideIndex() {
  const chapters = guideChapters();
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-blue-700 to-sky-500 bg-clip-text text-transparent">Hướng dẫn sử dụng Cerevex</h1>
  <p className="text-slate-600 max-w-2xl mx-auto">Tài liệu ngắn gọn theo từng vai trò. Mỗi chương có checklist và mẹo dùng thực tế.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {chapters.map((c, i) => (
          <Link key={c.slug} href={`/huong-dan/${c.slug}`} className="group rounded-xl border border-slate-200 bg-white/70 backdrop-blur p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col">
            <span className="text-[11px] font-mono uppercase tracking-wider text-blue-600/70 mb-2">Chương {i + 1}</span>
            <h3 className="font-semibold text-slate-800 group-hover:text-blue-700 mb-2 text-lg">{c.title}</h3>
            <p className="text-xs text-slate-500 line-clamp-3">Nhấp để mở chương.</p>
            <span className="mt-3 text-xs text-blue-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">Xem chi tiết
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M7 5L13 10L7 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
