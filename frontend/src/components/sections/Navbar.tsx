"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { parseRoles, ROLES } from "@/lib/auth/roles";

export default function Navbar() {
  const router = useRouter();
  const { status, user, signout } = useAuth();
  usePathname();

  async function onSignout() {
    await signout();
    router.push("/signin");
  }
  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/landing" className="flex items-center gap-2">
          <Image src="/assets/icons/logo.png" alt="Cerevex" width={150} height={32} />
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {status === "authenticated" ? (
            <>
              {/* Dynamic menu per role */}
              <Link href="/dashboard" className="px-3 py-2 hover:underline">Dashboard</Link>
              {/* data_analysist */}
              {parseRoles(user?.role).includes(ROLES.DATA_ANALYSIST) && (
                <Link href="/phan-tich" className="px-3 py-2 hover:underline">Phân tích</Link>
              )}
              {/* product_insight_analysist */}
              {parseRoles(user?.role).includes(ROLES.PRODUCT_INSIGHT_ANALYSIST) && (
                <>
                  <Link href="/bao-cao" className="px-3 py-2 hover:underline">Báo cáo</Link>
                  <Link href="/phan-tich" className="px-3 py-2 hover:underline">Phân tích</Link>
                </>
              )}
              {/* company_admin */}
              {parseRoles(user?.role).includes(ROLES.COMPANY_ADMIN) && (
                <>
                  <Link href="/tai-khoan-cua-toi" className="px-3 py-2 hover:underline">Tài khoản của tôi</Link>
                  <Link href="/cong-ty-cua-toi" className="px-3 py-2 hover:underline">Công ty của tôi</Link>
                </>
              )}
              {/* system_admin */}
              {parseRoles(user?.role).includes(ROLES.SYSTEM_ADMIN) && (
                <>
                  <Link href="/phan-tich-he-thong" className="px-3 py-2 hover:underline">Phân tích hệ thống</Link>
                  <Link href="/quan-ly-tai-khoan" className="px-3 py-2 hover:underline">Quản lý tài khoản</Link>
                  <Link href="/quan-ly-cong-ty" className="px-3 py-2 hover:underline">Quản lý công ty</Link>
                </>
              )}
              <span className="text-slate-700 hidden sm:inline ml-2">{user?.email}</span>
              <button
                onClick={onSignout}
                className="ml-2 px-4 py-2 rounded-md text-blue-700 hover:text-blue-800 hover:bg-blue-50 transition-colors"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="px-4 py-2 rounded-md text-blue-700 hover:text-blue-800 hover:bg-blue-50 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                Tạo tài khoản
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
