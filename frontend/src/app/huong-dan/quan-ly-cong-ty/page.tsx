import { DocsLayout } from "@/components/layout/DocsLayout";
export const metadata = { title: "Quản lý công ty | Hướng dẫn Cerevex" };
export default function GuideCompanyMgmt(){
  return <DocsLayout current="quan-ly-cong-ty">
    <h1>Quản lý công ty</h1>
  <p className="text-slate-700 text-sm">Trang này hiện chỉ là placeholder; thao tác thật đang ở Company Dashboard và Product Dashboard.</p>
    <section className="mt-6">
  <h2>Đang có</h2>
  <p className="text-sm text-slate-600">Company Dashboard: đồng bộ bình luận, xem số liệu tổng, danh sách sản phẩm, gỡ sản phẩm test.</p>
    </section>
    <section className="mt-8">
  <h2>Chưa có</h2>
      <ul className="list-disc pl-5 text-sm space-y-1">
        <li>Không có form cấu hình hồ sơ công ty.</li>
        <li>Không có quota sản phẩm hiển thị.</li>
        <li>Không có chính sách mật khẩu / bảo mật tuỳ chỉnh.</li>
      </ul>
    </section>
    <section className="mt-8">
      <h2>Ghi chú</h2>
  <p className="text-sm text-slate-600">Quota, timezone, bảo mật… chỉ ghi khi có mã thực tế.</p>
    </section>
  <aside className="mt-8 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700"><strong>Lưu ý:</strong> Tiếp tục dùng dashboard cho mọi thao tác quản trị công ty.</aside>
  </DocsLayout>;
}
