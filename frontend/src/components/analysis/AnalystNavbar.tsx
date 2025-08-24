"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/phan-tich", label: "Phân tích" },
  { href: "/bao-cao", label: "Báo cáo" },
];

export function AnalystNavbar() {
  const pathname = usePathname();
  const { user, signout } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/assets/icons/logo.png" alt="Cerevex" width={120} height={26} />
          <span className="text-sm text-slate-600 hidden sm:inline">Data Analyst</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "px-3 py-1.5 rounded-md hover:bg-blue-50",
                pathname === l.href ? "text-blue-700 font-medium" : "text-slate-700"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="relative ml-3">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs">
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </span>
            <span className="max-w-[160px] truncate">{user?.email ?? "Tài khoản"}</span>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8L10 12L14 8" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-44 rounded-md border border-slate-200 bg-white shadow-lg">
              <div className="px-3 py-2 text-xs text-slate-500">Đã đăng nhập</div>
              <div className="px-3 pb-2 text-sm font-medium truncate">{user?.email}</div>
              <div className="border-t border-slate-200" />
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:bg-red-50"
                  onClick={async () => {
                    await signout();
                    window.location.href = "/signin";
                  }}
                >
                  Đăng xuất
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
