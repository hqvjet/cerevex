import { DocsLayout } from "@/components/layout/DocsLayout";
export const metadata = { title: "Dashboard | Hướng dẫn Cerevex" };
export default function GuideDashboard(){
  return <DocsLayout current="dashboard">
    <h1>Sử dụng Dashboard</h1>
  <p className="text-slate-700">Dashboard cho bạn <strong>bức tranh nhanh</strong> để quyết định có cần đi sâu phân tích.</p>
    <section className="mt-6">
  <h2>Hiện đang có</h2>
      <div className="not-prose grid gap-4 md:grid-cols-3">
        {[{ t:"Số liệu sản phẩm", d:"Đếm sản phẩm, bình luận theo cảm xúc" }, { t:"Đồng bộ thủ công", d:"Nút Đồng bộ để kéo dữ liệu mới" }, { t:"Cảnh báo đơn giản", d:"Danh sách sản phẩm tiêu cực ≥ tích cực + trung tính (ở Product dashboard)" }].map(b => (
          <div key={b.t} className="rounded-lg border border-slate-200 bg-white/60 p-4 shadow-sm">
            <h3 className="font-semibold text-sm mb-1">{b.t}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{b.d}</p>
          </div>
        ))}
      </div>
    </section>
    <section className="mt-8">
  <h2>Cách đọc nhanh</h2>
  <p className="text-sm text-slate-600">Chưa có biểu đồ thời gian hay thống kê nâng cao; tập trung nhìn số tổng và mục cảnh báo.</p>
    </section>
    <section className="mt-8">
      <h2>Mẹo sử dụng</h2>
      <ul className="space-y-1 text-sm">
    <li>Đồng bộ xong nhớ làm mới để thấy số mới.</li>
    <li>Ưu tiên mở sản phẩm nằm trong danh sách cảnh báo.</li>
      </ul>
    </section>
  <aside className="mt-8 rounded-md border border-indigo-200 bg-indigo-50 p-4 text-sm text-slate-700"><strong>Lưu ý:</strong> Chưa có biểu đồ xu hướng và ngưỡng cảnh báo tùy chỉnh.</aside>
  </DocsLayout>;
}
