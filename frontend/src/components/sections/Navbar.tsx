"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { parseRoles, ROLES, hasAnyRole } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const router = useRouter();
  const { status, user, signout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function onSignout() {
    await signout();
    router.push("/signin");
  }
  const roles = parseRoles(user?.role);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-2 grid grid-cols-[auto_1fr_auto] items-center gap-4">
        {/* Left: Logo */}
        <Link href="/landing" className="flex items-center gap-2">
          <Image src="/assets/icons/logo.png" alt="Cerevex" width={140} height={30} />
        </Link>

        {/* Center: Nav items (no user box) */}
        <nav className="flex items-center justify-center gap-4 text-sm">
          {status === "authenticated" ? (
            <>
              <Link href="/dashboard" className={`px-2.5 py-1.5 hover:underline ${pathname?.startsWith("/dashboard") ? "text-blue-700 font-semibold" : "text-slate-700"}`}>Dashboard</Link>
              {roles.includes(ROLES.DATA_ANALYST) && (
                <Link href="/phan-tich" className={`px-2.5 py-1.5 hover:underline ${pathname?.startsWith("/phan-tich") ? "text-blue-700 font-semibold" : "text-slate-700"}`}>Phân tích</Link>
              )}
              {roles.includes(ROLES.PRODUCT_INSIGHT_ANALYST) && (
                <>
                  {/* Product Insight Analyst: bổ sung mục Phân tích hệ thống (Dashboard đã hiển thị chung) */}
                  <Link href="/phan-tich-he-thong" className={`px-2.5 py-1.5 hover:underline ${pathname === "/phan-tich-he-thong" ? "text-blue-700 font-semibold" : "text-slate-700"}`}>Phân tích hệ thống</Link>
                </>
              )}
              {roles.includes(ROLES.COMPANY_ADMIN) && (
                <>
                  <Link href="/cong-ty-cua-toi" className={`px-2.5 py-1.5 hover:underline ${pathname === "/cong-ty-cua-toi" ? "text-blue-700 font-semibold" : "text-slate-700"}`}>Công ty của tôi</Link>
                  <Link href="/quan-ly-tai-khoan" className={`px-2.5 py-1.5 hover:underline ${pathname === "/quan-ly-tai-khoan" ? "text-blue-700 font-semibold" : "text-slate-700"}`}>Quản lý tài khoản</Link>
                </>
              )}
              {hasAnyRole(roles, [ROLES.SYSTEM_ADMIN, ROLES.ADMIN]) && (
                <>
                  <Link href="/phan-tich-he-thong" className={`px-2.5 py-1.5 hover:underline ${pathname === "/phan-tich-he-thong" ? "text-blue-700 font-semibold" : "text-slate-700"}`}>Phân tích hệ thống</Link>
                  <Link href="/quan-ly-tai-khoan" className={`px-2.5 py-1.5 hover:underline ${pathname === "/quan-ly-tai-khoan" ? "text-blue-700 font-semibold" : "text-slate-700"}`}>Quản lý tài khoản</Link>
                  <Link href="/quan-ly-cong-ty" className={`px-2.5 py-1.5 hover:underline ${pathname === "/quan-ly-cong-ty" ? "text-blue-700 font-semibold" : "text-slate-700"}`}>Quản lý công ty</Link>
                </>
              )}
            </>
          ) : null}
        </nav>

        {/* Right: Auth actions / user box */}
        <div className="flex items-center justify-end gap-2">
          {status === "authenticated" ? (
            <div className="relative">
              <button
                onClick={() => setOpen((o) => !o)}
                className="group flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-3 pl-2 pr-3 py-1.5 text-sm text-slate-700 shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-white transition-all"
              >
                <span className="relative inline-flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-500 to-sky-400 text-white text-xs font-semibold ring-2 ring-white shadow-inner">
                  {user?.email?.[0]?.toUpperCase() ?? "U"}
                  <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full bg-emerald-400 ring-2 ring-white" />
                </span>
                <span className="flex flex-col items-start leading-tight max-w-[170px]">
                  <span className="truncate font-medium text-slate-900 group-hover:text-blue-700 transition-colors">{user?.email ?? "Tài khoản"}</span>
                  {roles?.length ? (
                    <span className="text-[10px] uppercase tracking-wide text-slate-500">
                      {roles[0]}
                    </span>
                  ) : null}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 20 20"
                  className={`transition-transform ${open ? "rotate-180" : ""}`}
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 8L10 12L14 8"
                    stroke="#334155"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-64 origin-top-right animate-scale-in overflow-hidden rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm shadow-xl ring-1 ring-black/5">
                  <div className="px-4 pt-4 pb-3 flex items-center gap-3">
                    <div className="relative inline-flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-500 to-sky-400 text-white text-sm font-semibold">
                      {user?.email?.[0]?.toUpperCase() ?? "U"}
                      <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user?.email}</p>
                      {roles?.length ? (
                        <p className="text-[11px] uppercase tracking-wide text-blue-600 font-medium truncate">{roles.join(", ")}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="px-4 pb-3 flex gap-2">
                    <button
                      onClick={() => {
                        if (user?.email) navigator.clipboard.writeText(user.email);
                      }}
                      className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
                    >
                      Copy Email
                    </button>
                    <Link
                      href="/huong-dan"
                      className="flex-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-medium text-blue-700 hover:bg-white transition-colors text-center"
                    >
                      Hướng dẫn
                    </Link>
                  </div>
                  <div className="border-t border-slate-200" />
                  <div className="p-2 flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start text-red-600 hover:bg-red-50"
                      onClick={async () => {
                        await onSignout();
                      }}
                    >
                      Đăng xuất
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/signin"
                className="px-3 py-1.5 rounded-md text-blue-700 hover:text-blue-800 hover:bg-blue-50 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/signup"
                className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                Tạo tài khoản
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
