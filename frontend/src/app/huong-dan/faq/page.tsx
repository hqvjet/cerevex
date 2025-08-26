import { DocsLayout } from "@/components/layout/DocsLayout";
export const metadata = { title: "FAQ | Hướng dẫn Cerevex" };
export default function GuideFAQ(){
  return <DocsLayout current="faq">
  <h1>Câu hỏi thường gặp</h1>
    <details className="group border-b py-3">
  <summary className="cursor-pointer font-medium text-slate-700 flex items-center justify-between">Có xuất dữ liệu kết quả được không?<span className="text-xs text-slate-400 group-open:rotate-90 transition-transform">▶</span></summary>
  <p className="mt-2 text-sm">Chưa có nút Export ở trang kết quả.</p>
    </details>
    <details className="group border-b py-3">
  <summary className="cursor-pointer font-medium text-slate-700 flex items-center justify-between">Không thấy mục Phân tích?<span className="text-xs text-slate-400 group-open:rotate-90 transition-transform">▶</span></summary>
  <p className="mt-2 text-sm">Có thể bạn chưa được gán Data Analyst hoặc Product Insight Analyst. Hỏi Company Admin.</p>
    </details>
    <details className="group border-b py-3">
  <summary className="cursor-pointer font-medium text-slate-700 flex items-center justify-between">Đồng bộ có tự động chạy?<span className="text-xs text-slate-400 group-open:rotate-90 transition-transform">▶</span></summary>
  <p className="mt-2 text-sm">Chưa, hiện phải nhấn nút thủ công.</p>
    </details>
  <p className="mt-6 text-sm text-slate-600">Không thấy câu trả lời? Liên hệ <a href="mailto:support@cerevex.local" className="text-blue-600 hover:underline">support@cerevex.local</a>.</p>
  </DocsLayout>;
}
