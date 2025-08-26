import { cn } from "@/lib/utils";
import React from "react";

// Modern, minimal shell (neutral background, no flashy colors)
export function DashboardShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="min-h-screen bg-slate-50/60">
      <div className={cn("relative", className)}>{children}</div>
    </div>
  );
}
