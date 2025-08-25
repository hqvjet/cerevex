"use client";
import Protected from "@/components/auth/Protected";
import { ROLES } from "@/lib/auth/roles";

export default function CompanyAdminDashboard() {
  return (
    <Protected allow={roles => roles.includes(ROLES.COMPANY_ADMIN)}>
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Company Dashboard</h1>
        <p className="text-sm text-slate-500">Quản trị công ty: tổng quan sản phẩm, người dùng nội bộ, hiệu suất.</p>
        <div className="grid gap-4 md:grid-cols-4">
          {['Sản phẩm','Data Analyst','PI Analyst','Tổng bình luận'].map(label => (
            <div key={label} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="text-xs text-slate-500">{label}</div>
              <div className="mt-1 text-xl font-semibold">--</div>
            </div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-white p-6 h-64 flex items-center justify-center text-slate-400 text-sm">(Biểu đồ sản phẩm - TODO)</div>
          <div className="rounded-xl border bg-white p-6 h-64 flex items-center justify-center text-slate-400 text-sm">(Top cảnh báo - TODO)</div>
        </div>
      </main>
    </Protected>
  );
}
