"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/phan-tich", label: "Phân tích" },
  { href: "/bao-cao", label: "Báo cáo" },
];

export function AnalystNavbar() {
  const pathname = usePathname();
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
      </div>
    </header>
  );
}
