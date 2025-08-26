import { DocsLayout } from "@/components/layout/DocsLayout";

export const metadata = { title: "Extension | Hướng dẫn Cerevex" };

export default function GuideExtension(){
  return <DocsLayout current="extension">
    <h1>Extension trình duyệt</h1>
  <p className="text-slate-700 text-sm">Extension (Cerevex Advisor) giúp bạn <strong>xem nhanh cảm xúc & khuyến nghị mua</strong> ngay trên trang sản phẩm nguồn thứ ba đã hỗ trợ. Nó đọc các bình luận công khai của trang, gửi lên API phân tích rồi trả về tóm tắt ngắn.</p>

    <section className="mt-6">
      <h2>Đối tượng hướng tới</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Product Insight Analyst</strong>: cần tín hiệu nhanh trước khi vào dashboard chi tiết.</li>
        <li><strong>Company Admin</strong>: kiểm tra nhanh sản phẩm đang theo dõi mà không phải mở ứng dụng chính.</li>
        <li><strong>Nhân sự mua hàng / vận hành</strong>: tham khảo khuyến nghị mua (buy recommendation) dựa trên cảm xúc tổng hợp.</li>
      </ul>
    </section>

    <section className="mt-8">
      <h2>Giá trị cốt lõi</h2>
      <div className="grid md:grid-cols-2 gap-4 not-prose">
        {[{t:'Nhận diện tự động',d:'Tự phát hiện URL & product id nếu thuộc domain hỗ trợ.'},{t:'Thu thập nhẹ',d:'Chỉ lấy nội dung bình luận (content/title), bỏ phần thừa.'},{t:'Phân tích tức thời',d:'Gửi danh sách bình luận tới endpoint public-product-insight.'},{t:'Tóm tắt gọn',d:'Hiển thị nhãn khuyến nghị, phân bố sentiment, ví dụ tiêu biểu.'}].map(b=> (
          <div key={b.t} className="rounded-lg border border-slate-200 bg-white/60 p-4">
            <h3 className="font-semibold text-sm mb-1">{b.t}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{b.d}</p>
          </div>
        ))}
      </div>
    </section>

  {/* Hai section hướng dẫn chi tiết luồng & diễn giải trường đã được lược bỏ theo yêu cầu để giữ nội dung gọn */}

    <section className="mt-8">
      <h2>Giới hạn hiện tại</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm">
  <li>Không cache: mở lại sẽ gọi API lần nữa.</li>
  <li>Không có biểu đồ (đã lược bỏ để nhẹ).</li>
  <li>Chưa ghi kết quả ngược vào hệ thống.</li>
  <li>Chỉ nhận diện một pattern URL; domain khác sẽ không chạy.</li>
  <li>Không phân trang bình luận lớn (lấy tất cả rồi lọc trên trình duyệt).</li>
      </ul>
    </section>

    <section className="mt-8">
      <h2>Khi nào nên dùng?</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm">
  <li>Khảo sát sơ bộ trước khi mở dashboard.</li>
  <li>So sánh nhanh nhiều tab sản phẩm.</li>
  <li>Hướng dẫn thành viên mới làm quen sentiment.</li>
      </ul>
    </section>

    <aside className="mt-8 rounded-md border border-indigo-200 bg-indigo-50 p-4 text-sm text-slate-700">
  <strong>Lưu ý:</strong> Chưa có lưu lịch sử cục bộ, nhiều nguồn, biểu đồ hay ghi ngược về server.
    </aside>
  </DocsLayout>;
}
