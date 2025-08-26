import { DocsLayout } from "@/components/layout/DocsLayout";
export const metadata = { title: "Quản lý tài khoản | Hướng dẫn Cerevex" };
export default function GuideUserMgmt(){
  return <DocsLayout current="quan-ly-tai-khoan">
    <h1>Quản lý tài khoản</h1>
  <p className="text-slate-700 text-sm">Dành cho Company Admin. Bạn có thể: tạo thành viên (email + mật khẩu tạm), thêm hoặc bỏ hai vai trò phân tích, gỡ thành viên khỏi công ty.</p>
    <section className="mt-6">
  <h2>Thao tác chính</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        {[
          {t:"Tạo người dùng", d:"Email + mật khẩu tạm + chọn vai trò"},
          {t:"Cập nhật vai trò", d:"Thêm/bớt data_analyst hoặc product_insight_analyst"},
          {t:"Gỡ khỏi công ty", d:"Xóa thành viên (quyền company_admin hiện không chỉnh tại đây)"},
          {t:"Tìm kiếm", d:"Lọc theo email hoặc vai trò"}
        ].map(x => (
          <div key={x.t} className="rounded-lg border border-slate-200 bg-white/60 p-4">
            <h3 className="font-semibold text-sm mb-1">{x.t}</h3>
            <p className="text-xs text-slate-600">{x.d}</p>
          </div>
        ))}
      </div>
    </section>
    <section className="mt-8">
  <h2>Nguyên tắc phân quyền</h2>
      <ol className="list-decimal pl-5 space-y-1">
  <li>Chỉ cấp quyền thực sự cần (least privilege).</li>
  <li>Rà soát định kỳ (hiện làm thủ công).</li>
  <li>Thu hồi ngay khi thành viên rời nhóm.</li>
  <li>Không dùng chung tài khoản / mật khẩu.</li>
      </ol>
    </section>
    <section className="mt-8">
  <h2>Giới hạn</h2>
      <ul className="list-disc pl-5 text-sm space-y-1">
  <li>Chưa có khoá tạm (suspend) – chỉ có gỡ.</li>
  <li>Chưa có reset mật khẩu tại đây.</li>
  <li>Chưa có xác thực email hoặc log audit chi tiết.</li>
      </ul>
    </section>
  <aside className="mt-8 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-slate-700"><strong>Lưu ý:</strong> Khoá tạm, reset mật khẩu & nhật ký chi tiết sẽ được cập nhật khi có trong mã.</aside>
  </DocsLayout>;
}
