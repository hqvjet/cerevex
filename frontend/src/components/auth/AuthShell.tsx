"use client";
import type { PropsWithChildren, ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import BrandLogo from "@/components/BrandLogo";

export default function AuthShell({
  title,
  subtitle,
  children,
  cta,
}: PropsWithChildren<{ title: ReactNode; subtitle?: ReactNode; cta?: ReactNode }>) {
  return (
    <main className="min-h-[100svh] relative overflow-hidden bg-gradient-to-b from-white to-[#F1F6FF]">
      {/* background */}
      <div className="absolute inset-0 -z-10">
        <Image src="/assets/images/hero_frame.png" alt="bg" fill className="object-cover opacity-[0.05]" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-100 blur-3xl opacity-70" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-100 blur-3xl opacity-70" />
      </div>

      <div className="mx-auto max-w-md w-full px-4 py-16">
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BrandLogo />
          <h1 className="mt-6 text-3xl font-extrabold text-[#0B4AA3] leading-tight">{title}</h1>
          {subtitle ? <p className="mt-3 text-slate-600 max-w-prose">{subtitle}</p> : null}
          {cta ? <div className="mt-3">{cta}</div> : null}
        </motion.div>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          <div className="relative w-full rounded-2xl bg-white/90 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(25,87,200,0.18)] border border-white/60">
            <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br from-blue-200 to-indigo-200 opacity-60 blur-2xl" />
            {children}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
