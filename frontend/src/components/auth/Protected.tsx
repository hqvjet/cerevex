"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { parseRoles, type Role } from "@/lib/auth/roles";

export default function Protected({ children, allow }: { children: React.ReactNode; allow?: (roles: Role[]) => boolean }) {
  const router = useRouter();
  const { status, user, initialized } = useAuth();

  const redirectTimer = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!initialized) return;
    if (status === "unauthenticated") {
      // Delay redirect slightly to allow signin to flip status
      redirectTimer.current = setTimeout(() => {
        router.replace("/signin");
      }, 250);
      return () => {
        if (redirectTimer.current) clearTimeout(redirectTimer.current);
      };
    }
  }, [status, router, initialized]);

  if (!initialized) return null;
  if (status !== "authenticated") return null;

  const roles = parseRoles(user?.role);
  if (allow && !allow(roles)) {
    // If not allowed, send to dashboard
    if (typeof window !== "undefined") router.replace("/dashboard");
    return null;
  }
  return <>{children}</>;
}
