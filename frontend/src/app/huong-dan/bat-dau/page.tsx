import { DocsLayout } from "@/components/layout/DocsLayout";
export const metadata = { title: "Bắt đầu | Hướng dẫn Cerevex" };
export default function GuideGettingStarted(){
  return <DocsLayout current="bat-dau">
    <h1>Bắt đầu</h1>
  <p className="text-slate-700">Các bước nhanh để làm quen sau khi bạn có tài khoản.</p>
    <section className="mt-6">
  <h2>Checklist nhanh</h2>
      <ol className="list-decimal pl-5 space-y-1 text-sm">
        <li><strong>Đăng ký:</strong> /signup (nhập email + mật khẩu).</li>
        <li><strong>Đăng nhập:</strong> /signin.</li>
  <li><strong>Xác định vai trò:</strong> nhìn dashboard được chuyển tới để biết quyền hiện tại.</li>
  <li><strong>Tải thử 1 tệp</strong> ở trang Phân tích để kiểm tra luồng xử lý.</li>
      </ol>
    </section>
    <section className="mt-8">
      <h2>Company Admin nên làm gì trước</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white/60 p-4">
          <h3 className="font-semibold mb-1">1. Kiểm tra sản phẩm</h3>
          <p className="text-xs text-slate-600">Mở Company / Product dashboard xem có sản phẩm & dữ liệu hay chưa.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white/60 p-4">
          <h3 className="font-semibold mb-1">2. Đồng bộ dữ liệu</h3>
          <p className="text-xs text-slate-600">Nhấn nút &quot;Đồng bộ bình luận&quot; để lấy bình luận mới.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white/60 p-4">
          <h3 className="font-semibold mb-1">3. Gỡ sản phẩm test</h3>
          <p className="text-xs text-slate-600">Dùng hành động Gỡ nếu sản phẩm thử nghiệm không còn cần.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white/60 p-4">
          <h3 className="font-semibold mb-1">4. Cấp vai trò bổ sung</h3>
          <p className="text-xs text-slate-600">Thêm Data Analyst / Product Insight Analyst trong trang Quản lý tài khoản khi cần.</p>
        </div>
      </div>
    </section>
    <section className="mt-8">
      <h2>Tình huống thường gặp</h2>
      <ul className="space-y-2 text-sm">
  <li><strong>Không thấy dashboard đúng:</strong> có thể còn thiếu vai trò.</li>
  <li><strong>Số liệu không đổi sau đồng bộ:</strong> có thể chưa có bình luận mới hoặc lỗi kết nối.</li>
  <li><strong>Cần thêm quyền:</strong> nhờ Company Admin gán.</li>
      </ul>
    </section>
    <aside className="mt-8 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-700">
  <strong>Lưu ý:</strong> Chưa có chính sách mật khẩu nâng cao, xác thực email tự động hay cấu hình timezone.
    </aside>
  </DocsLayout>;
}
