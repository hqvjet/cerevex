"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { parseRoles, type Role } from "@/lib/auth/roles";

export default function Protected({ children, allow }: { children: React.ReactNode; allow?: (roles: Role[]) => boolean }) {
  const router = useRouter();
  const { status, user, initialized } = useAuth();

  const redirectTimer = useRef<NodeJS.Timeout | null>(null);
  // Always declare hooks before any early returns
  const roles = useMemo(() => parseRoles(user?.role), [user?.role]);
  const isAllowed = allow ? allow(roles) : true;

  // Handle unauthenticated redirect
  useEffect(() => {
    if (!initialized) return;
    if (status === "unauthenticated") {
      redirectTimer.current = setTimeout(() => {
        router.replace("/signin");
      }, 250);
    }
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, [status, router, initialized]);

  // Redirect when authenticated but not allowed
  useEffect(() => {
    if (!initialized) return;
    if (status === "authenticated" && allow && !isAllowed) {
      router.replace("/dashboard");
    }
  }, [initialized, status, allow, isAllowed, router]);

  // Render gates
  if (!initialized) return null;
  if (status !== "authenticated") return null;
  if (allow && !isAllowed) return null;
  return <>{children}</>;
}
