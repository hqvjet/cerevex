"use client";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { parseRoles, ROLES, type Role } from "@/lib/auth/roles";
import { useRouter } from "next/navigation";
import Protected from "@/components/auth/Protected";

function pickPrimaryRole(roleStr: string | null | undefined) {
  const roles = parseRoles(roleStr);
  const order: Role[] = [
    ROLES.SYSTEM_ADMIN,
    ROLES.ADMIN,
    ROLES.COMPANY_ADMIN,
    ROLES.PRODUCT_INSIGHT_ANALYST,
    ROLES.DATA_ANALYST,
    ROLES.USER,
  ];
  return order.find(r => roles.includes(r)) || null;
}

export default function DashboardRedirectPage() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    const primary = pickPrimaryRole(user?.role);
    if (!primary) return;
    const mapping: Record<string, string> = {
      [ROLES.SYSTEM_ADMIN]: "/dashboard/system",
      [ROLES.ADMIN]: "/dashboard/system",
      [ROLES.COMPANY_ADMIN]: "/dashboard/company",
      [ROLES.PRODUCT_INSIGHT_ANALYST]: "/dashboard/product",
      [ROLES.DATA_ANALYST]: "/dashboard/data-analyst",
      [ROLES.USER]: "/dashboard/user",
    };
    const dest = mapping[primary];
    if (dest) router.replace(dest);
  }, [user, router]);
  return (
    <Protected>
      <div className="p-8 text-sm text-slate-500">Đang chuyển hướng tới dashboard phù hợp...</div>
    </Protected>
  );
}
