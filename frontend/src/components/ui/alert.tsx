import { cn } from "@/lib/utils";
import React from "react";

type Variant = "success" | "error" | "info" | "warning";

const base = "rounded-md border px-3 py-2 text-sm flex items-start gap-2";
const styles: Record<Variant, string> = {
  success: "bg-emerald-50 border-emerald-300 text-emerald-800",
  error: "bg-rose-50 border-rose-300 text-rose-800",
  info: "bg-blue-50 border-blue-300 text-blue-800",
  warning: "bg-amber-50 border-amber-300 text-amber-800",
};

export function Alert({ variant = "info", title, children, onClose, className }: { variant?: Variant; title?: string; children?: React.ReactNode; onClose?: () => void; className?: string }) {
  return (
    <div className={cn(base, styles[variant], className)}>
      <div className="flex-1 min-w-0">
        {title && <div className="font-medium mb-0.5">{title}</div>}
        {children}
      </div>
      {onClose && (
        <button onClick={onClose} className="ml-2 text-xs opacity-70 hover:opacity-100" aria-label="Đóng">
          ✕
        </button>
      )}
    </div>
  );
}
