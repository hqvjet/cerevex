"use client";
import Protected from "@/components/auth/Protected";
import { ROLES } from "@/lib/auth/roles";

export default function QuanLyCongTyPage() {
  return (
    <Protected allow={(roles) => roles.includes(ROLES.SYSTEM_ADMIN)}>
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Quản lý công ty</h1>
      </main>
    </Protected>
  );
}
