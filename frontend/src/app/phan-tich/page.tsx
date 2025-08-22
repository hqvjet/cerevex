"use client";
import Protected from "@/components/auth/Protected";
import { ROLES, hasAnyRole, parseRoles } from "@/lib/auth/roles";
import { useAuth } from "@/lib/auth";

export default function PhanTichPage() {
  const { user } = useAuth();
  const roles = parseRoles(user?.role);
  const allowed = hasAnyRole(roles, [ROLES.DATA_ANALYSIST, ROLES.PRODUCT_INSIGHT_ANALYSIST, ROLES.SYSTEM_ADMIN]);
  return (
    <Protected allow={() => allowed}>
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Phân tích</h1>
        <p className="text-slate-600">Khu vực dành cho phân tích dữ liệu.</p>
      </main>
    </Protected>
  );
}
