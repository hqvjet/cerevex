import { CheckCircle2 } from "lucide-react";

const items = [
  "Tốc độ cao hơn các giải pháp dùng LLM",
  "Độ chính xác tương đối cao",
  "Khả năng hiểu biểu tượng cảm xúc",
  "Kết hợp cả tiêu đề trong bình luận",
  "Giá thành vừa túi",
];

export default function Capabilities() {
  return (
  <section className="relative py-16 md:py-24 bg-white">
      <div className="absolute inset-0 -z-10">
        <div className="h-full w-full bg-[radial-gradient(ellipse_at_center,rgba(11,74,163,0.08),transparent_60%)]" />
      </div>
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-xl md:rounded-2xl border-[1.5px] border-[#D7E5FF] bg-white p-6 md:p-8 shadow-[0_8px_28px_rgba(25,87,200,0.08)] max-w-lg">
          <h3 className="text-xl font-semibold text-[#0B4AA3] mb-4">Chúng Tôi Có</h3>
          <ul className="space-y-3 text-slate-700">
            {items.map((t) => (
              <li key={t} className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-blue-600 mt-0.5" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
