"use client";
import Protected from "@/components/auth/Protected";
import { ROLES } from "@/lib/auth/roles";

export default function SystemDashboard() {
  return (
    <Protected allow={roles => roles.includes(ROLES.SYSTEM_ADMIN) || roles.includes(ROLES.ADMIN)}>
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">System Dashboard</h1>
        <p className="text-sm text-slate-500">Tổng quan toàn hệ thống: số công ty, người dùng, tiến trình xử lý, tải mô hình...</p>
        <div className="grid gap-4 md:grid-cols-4">
          {['Công ty','Người dùng','Jobs đang chạy','Tổng phân tích'].map(label => (
            <div key={label} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="text-xs text-slate-500">{label}</div>
              <div className="mt-1 text-xl font-semibold">--</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border bg-white p-6 h-64 flex items-center justify-center text-slate-400 text-sm">(Biểu đồ hệ thống - TODO)</div>
      </main>
    </Protected>
  );
}
