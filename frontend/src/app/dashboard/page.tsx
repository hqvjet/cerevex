"use client";
import Protected from "@/components/auth/Protected";

export default function DashboardPage() {
  return (
    <Protected>
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Bảng điều khiển</h1>
        <p className="text-slate-600">Chào mừng bạn trở lại.</p>
      </main>
    </Protected>
  );
}
