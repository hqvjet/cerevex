"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

const PUBLIC_PATHS = new Set<string>(["/", "/signin", "/signup"]);

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, initialized } = useAuth();

  useEffect(() => {
    if (!initialized) return;
    // Skip guard for public paths
    if (PUBLIC_PATHS.has(pathname || "/")) return;
    if (status === "unauthenticated") {
      router.replace("/signin");
    }
  }, [pathname, status, initialized, router]);

  return <>{children}</>;
}
