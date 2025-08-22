"use client";
import Protected from "@/components/auth/Protected";
import { ROLES } from "@/lib/auth/roles";

export default function BaoCaoPage() {
  return (
    <Protected allow={(roles) => roles.includes(ROLES.PRODUCT_INSIGHT_ANALYSIST) || roles.includes(ROLES.SYSTEM_ADMIN)}>
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Báo cáo</h1>
        <p className="text-slate-600">Tổng quan và báo cáo chuyên sâu.</p>
      </main>
    </Protected>
  );
}
