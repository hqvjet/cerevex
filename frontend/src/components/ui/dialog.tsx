"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Dialog({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
}

export function DialogHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="px-6 pt-6 pb-2">
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      {description ? <p className="text-sm text-slate-500 mt-1">{description}</p> : null}
    </div>
  );
}

export function DialogBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-4 flex items-center justify-end gap-3 bg-slate-50 rounded-b-2xl border-t border-slate-200">{children}</div>;
}
