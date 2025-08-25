"use client";
import Protected from "@/components/auth/Protected";
import { ROLES } from "@/lib/auth/roles";

export default function ProductInsightDashboard() {
  return (
    <Protected allow={roles => roles.includes(ROLES.PRODUCT_INSIGHT_ANALYST)}>
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Product Insight Dashboard</h1>
        <p className="text-sm text-slate-500">Phân tích sâu sản phẩm: xu hướng cảm xúc, cảnh báo, top vấn đề.</p>
        <div className="grid gap-4 md:grid-cols-4">
          {['Sản phẩm theo dõi','Cảnh báo','Positive %','Negative %'].map(label => (
            <div key={label} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="text-xs text-slate-500">{label}</div>
              <div className="mt-1 text-xl font-semibold">--</div>
            </div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-xl border bg-white p-6 h-64 flex items-center justify-center text-slate-400 text-sm">(Xu hướng cảm xúc - TODO)</div>
          <div className="rounded-xl border bg-white p-6 h-64 flex items-center justify-center text-slate-400 text-sm">(Phân bổ cảm xúc - TODO)</div>
        </div>
      </main>
    </Protected>
  );
}
