import { DocsLayout } from "@/components/layout/DocsLayout";

export const metadata = { title: "AI & Đồng bộ dữ liệu | Hướng dẫn Cerevex" };

export default function GuideAICore() {
  return (
    <DocsLayout current="ai-dong-bo">
      <h1>AI & Đồng bộ dữ liệu</h1>
  <p className="text-slate-700 text-sm">Hiện tại hệ thống làm hai việc chính: (1) gắn nhãn cảm xúc cho bình luận và file bạn tải lên; (2) đồng bộ bình luận thủ công bằng nút &quot;Đồng bộ&quot; (chưa có chạy tự động hay webhook).</p>
      <section className="mt-6">
        <h2>AI mang lại giá trị gì?</h2>
        <ul className="space-y-1 text-sm">
          <li><strong>Gom & lọc</strong>: nhóm phản hồi theo sản phẩm, bỏ bớt nhiễu đơn giản.</li>
          <li><strong>Nhận diện cảm xúc</strong>: biết nhanh tỉ lệ tích cực / trung tính / tiêu cực.</li>
          <li><strong>(Định hướng)</strong> Chủ đề, từ khoá nổi bật.</li>
          <li><strong>(Định hướng)</strong> Cảnh báo sớm khi tiêu cực tăng đột biến.</li>
        </ul>
      </section>
      <section className="mt-8">
        <h2>Đồng bộ dữ liệu hiện tại</h2>
  <p className="text-sm text-slate-600">Hiện chỉ có thao tác thủ công: nhấn nút đồng bộ ở Company / Product dashboard để lấy dữ liệu mới (gọi enterpriseService.sync). Chưa có lịch nền hoặc webhook.</p>
      </section>
      <section className="mt-8">
        <h2>Cách lấy dữ liệu mới</h2>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li>Mở Company hoặc Product dashboard.</li>
          <li>Nhấn nút <strong>Đồng bộ bình luận</strong> / <strong>Đồng bộ ngay</strong>.</li>
          <li>Chờ trạng thái kết thúc, sau đó nhấn làm mới để cập nhật bảng.</li>
        </ol>
      </section>
      <section className="mt-8">
        <h2>Kiểm tra dữ liệu mới</h2>
        <ul className="text-sm space-y-1">
          <li>Số bình luận tích cực / tiêu cực trên dashboard tăng.</li>
          <li>Bảng sản phẩm hiển thị số liệu mới khi làm mới dữ liệu.</li>
        </ul>
      </section>
      <section className="mt-8">
        <h2>Sự cố thường gặp</h2>
        <ul className="text-xs space-y-1">
    <li><strong>Đồng bộ xong số liệu không đổi:</strong> nguồn chưa có bình luận mới.</li>
    <li><strong>Báo lỗi đỏ:</strong> xem nội dung thông báo ở khung lỗi trên dashboard.</li>
        </ul>
      </section>
  <aside className="mt-8 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-slate-700"><strong>Lưu ý:</strong> Các phần như lịch tự động, webhook, cấu hình SKU chưa tồn tại trong mã nên không đề cập chi tiết.</aside>
    </DocsLayout>
  );
}
