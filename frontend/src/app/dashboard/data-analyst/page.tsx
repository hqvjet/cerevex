"use client";
import Protected from "@/components/auth/Protected";
import { ROLES } from "@/lib/auth/roles";

export default function DataAnalystDashboard() {
  return (
    <Protected allow={roles => roles.includes(ROLES.DATA_ANALYST)}>
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Data Analyst Dashboard</h1>
        <p className="text-sm text-slate-500">Tập trung vào tiến trình phân tích file và chất lượng dữ liệu.</p>
        <div className="grid gap-4 md:grid-cols-3">
          {['Files đã phân tích','Pending','Failed','Tốc độ trung bình'].slice(0,3).map(label => (
            <div key={label} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="text-xs text-slate-500">{label}</div>
              <div className="mt-1 text-xl font-semibold">--</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border bg-white p-6 h-64 flex items-center justify-center text-slate-400 text-sm">(Chi tiết hàng đợi / queue - TODO)</div>
      </main>
    </Protected>
  );
}
