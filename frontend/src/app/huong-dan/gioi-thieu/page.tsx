import { DocsLayout } from "@/components/layout/DocsLayout";
export const metadata = { title: "Giới thiệu | Hướng dẫn Cerevex" };
export default function GuideIntro() {
  return (
    <DocsLayout current="gioi-thieu">
  <h1 className="mb-2">Giới thiệu hệ thống</h1>
  <p className="text-lg text-slate-700">💡 <strong>Cerevex</strong> hiện làm 3 việc chính: (1) gom các bình luận theo từng sản phẩm, (2) tự gắn nhãn cảm xúc tích cực / trung tính / tiêu cực cho file bạn tải lên và bình luận đã đồng bộ, (3) tổng hợp số liệu để bạn xem nhanh ở dashboard theo vai trò.</p>
      <section>
        <h2>Giải quyết vấn đề gì?</h2>
        <div className="grid gap-4 md:grid-cols-2 not-prose mb-4">
          <div className="rounded-lg border border-slate-200 bg-white/60 p-4">
            <h3 className="font-semibold mb-1 text-slate-800">Trước đây</h3>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
              <li>Bình luận nằm rải rác, khó tổng hợp.</li>
              <li>Phải đọc thủ công để đoán cảm xúc.</li>
              <li>Khó phát hiện sản phẩm xuống chất lượng sớm.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold mb-1 text-slate-800">Với Cerevex</h3>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
              <li>Tập trung bình luận theo sản phẩm.</li>
              <li>Tự động gắn nhãn cảm xúc (3 nhãn).</li>
              <li>Dashboard theo vai trò hiển thị số tổng và cảnh báo cơ bản.</li>
            </ul>
          </div>
        </div>
      </section>
      <section>
        <h2>Giá trị cốt lõi</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 not-prose mb-2">
          {[
            { t: "Tập trung", d: "Gộp cảm xúc theo sản phẩm." },
            { t: "Tự động", d: "Máy gắn nhãn cảm xúc giúp tiết kiệm thời gian." },
            { t: "Phân vai", d: "Mỗi vai trò thấy đúng phần cần thiết." },
            { t: "Sẵn sàng mở rộng", d: "Kiến trúc chờ bổ sung chủ đề & cảnh báo nâng cao." },
          ].map(b => (
            <div key={b.t} className="rounded-md border border-slate-200 bg-white/70 p-3 shadow-sm">
              <p className="font-semibold text-slate-800 mb-1">{b.t}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{b.d}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2>Dòng chảy tổng quát</h2>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>Đồng bộ bình luận (bằng nút &quot;Đồng bộ&quot;).</li>
          <li>Hệ thống gắn nhãn cảm xúc.</li>
          <li>Dashboard và trang kết quả hiển thị số liệu tổng.</li>
          <li>(Tương lai) Chủ đề & cảnh báo nâng cao.</li>
        </ol>
      </section>
      <aside className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-slate-700">
  <strong>Lưu ý:</strong> Chỉ mô tả <span className="font-semibold">những gì đang có trong mã</span>; phần ghi &quot;Tương lai&quot; là định hướng chưa triển khai.
      </aside>
    </DocsLayout>
  );
}
