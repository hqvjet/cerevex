import { cn } from "@/lib/utils";
import * as React from "react";

export function Badge({ className, variant = "secondary", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: "primary" | "secondary" | "outline" }) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors";
  const variants = {
    primary: "bg-[#6C5CE7] text-white",
    secondary: "bg-[#F0E9FF] text-[#6C5CE7]",
    outline: "border border-slate-300 text-slate-700",
  } as const;
  return <span className={cn(base, variants[variant], className)} {...props} />;
}
