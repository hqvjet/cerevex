"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-[#0B4AA3] text-white">
      <div className="absolute inset-0">
        <Image
          src="/assets/images/hero_frame.png"
          alt="background"
          fill
          priority
          className="object-cover opacity-50"
        />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 py-14 md:py-20 grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-extrabold leading-tight uppercase tracking-wide"
          >
            Trí Tuệ Cảm Xúc
            <br />
            Cho Ngành Dịch Vụ Việt
          </motion.h1>
          <p className="text-white/90 max-w-xl">
            Giúp doanh nghiệp hiểu sâu cảm xúc thật, tối ưu trải nghiệm và nâng cao chất lượng phục vụ.
          </p>
          <div className="flex gap-4 pt-2">
            <Button className="bg-white text-blue-700 hover:bg-slate-100 shadow" size="lg">Trải nghiệm ngay</Button>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative h-64 md:h-[360px]"
        >
          <Image src="/assets/images/hero_image.png" alt="hero" fill className="object-contain" />
        </motion.div>
      </div>
    </section>
  );
}
