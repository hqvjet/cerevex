import { DocsLayout } from "@/components/layout/DocsLayout";
export const metadata = { title: "Phân tích dữ liệu | Hướng dẫn Cerevex" };
export default function GuideAnalysis(){
  return <DocsLayout current="phan-tich">
    <h1>Phân tích dữ liệu</h1>
  <p className="text-slate-700 text-sm">Dành cho <strong>Data Analyst</strong> & <strong>Product Insight Analyst</strong>. Bạn có thể tải tệp (.csv, .txt) và nhận phân bố cảm xúc (tích cực / trung tính / tiêu cực) kèm danh sách dòng đã gắn nhãn.</p>
    <section>
  <h2>Quy trình</h2>
      <div className="not-prose rounded-xl border border-slate-200 bg-white/60 p-4 shadow-sm">
        <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-700">
          <li>Chọn tệp nguồn (định dạng hỗ trợ: .csv, .txt).</li>
          <li>Nhấn Phân tích / Tải lên.</li>
          <li>Mở trang Kết quả để xem biểu đồ phân bố cảm xúc.</li>
          <li>Lọc theo nhãn hoặc tìm kiếm nhanh trong bảng dữ liệu.</li>
        </ol>
      </div>
    </section>
    <section>
      <h2>Đọc kết quả</h2>
      <ul>
        <li><strong>% mỗi nhãn</strong>: phần trăm các nhãn trên biểu đồ dạng vòng.</li>
        <li><strong>Bảng dữ liệu</strong>: lọc bằng badge hoặc ô tìm kiếm.</li>
      </ul>
    </section>
    <section>
  <h2>Giới hạn</h2>
      <ul className="list-disc pl-5 text-sm space-y-1">
        <li>Chưa có chủ đề (topic) hay keyword trending.</li>
        <li>Chưa có preset bộ lọc hoặc huấn luyện lại mô hình từ giao diện.</li>
        <li>Không có nút xuất dữ liệu ở trang kết quả.</li>
      </ul>
    </section>
    <aside className="mt-6 rounded-md border border-indigo-200 bg-indigo-50 p-4 text-sm">
  <strong>Lưu ý:</strong> Chủ đề, keyword trending và preset bộ lọc chưa được triển khai.
    </aside>
  </DocsLayout>;
}
