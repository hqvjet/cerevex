"use client";
import Protected from "@/components/auth/Protected";
import { ROLES } from "@/lib/auth/roles";

export default function BasicUserDashboard() {
  return (
    <Protected allow={roles => roles.includes(ROLES.USER)}>
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">User Dashboard</h1>
        <p className="text-sm text-slate-500">Bạn hiện chưa thuộc công ty nào. Tạo công ty để bắt đầu sử dụng đầy đủ tính năng.</p>
        <div className="rounded-xl border bg-white p-6 text-sm text-slate-600 space-y-2">
          <p>- Tạo công ty mới để trở thành Company Admin.</p>
          <p>- Sau đó bạn có thể mời Data Analyst và Product Insight Analyst.</p>
        </div>
      </main>
    </Protected>
  );
}
