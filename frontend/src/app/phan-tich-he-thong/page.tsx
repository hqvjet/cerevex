"use client";
import Protected from "@/components/auth/Protected";
import { ROLES } from "@/lib/auth/roles";

export default function PhanTichHeThongPage() {
  return (
  <Protected allow={(roles) => roles.includes(ROLES.SYSTEM_ADMIN) || roles.includes(ROLES.ADMIN)}>
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Phân tích hệ thống</h1>
      </main>
    </Protected>
  );
}
