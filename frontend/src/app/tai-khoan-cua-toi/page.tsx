"use client";
import Protected from "@/components/auth/Protected";
import { ROLES } from "@/lib/auth/roles";

export default function TaiKhoanCuaToiPage() {
  return (
    <Protected allow={(roles) => roles.includes(ROLES.COMPANY_ADMIN) || roles.includes(ROLES.SYSTEM_ADMIN)}>
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Tài khoản của tôi</h1>
        <p className="text-slate-600">Quản lý tài khoản công ty và người dùng.</p>
      </main>
    </Protected>
  );
}
