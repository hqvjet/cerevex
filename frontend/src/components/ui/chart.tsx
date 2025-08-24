"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function ChartContainer({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("relative w-full rounded-xl border border-[#D7E5FF] bg-white p-4 shadow-[0_8px_24px_rgba(11,74,163,0.08)]", className)} {...props}>
      {children}
    </div>
  );
}

export function ChartHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-4 pt-2 pb-4">
      <h3 className="text-center text-2xl font-extrabold text-[#0B4AA3]">{title}</h3>
      {subtitle ? <p className="mt-1 text-center text-sm text-slate-600">{subtitle}</p> : null}
    </div>
  );
}
