"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartHeader } from "@/components/ui/chart";
import { BarChart3 } from "lucide-react";

type SentimentDatum = { name: string; value: number; color: string; short?: string };

const data: SentimentDatum[] = [
  { name: "Tích Cực", short: "positive", value: 3543, color: "#7AD9B3" },
  { name: "Trung Tính", short: "neutral", value: 1232, color: "#FFD66B" },
  { name: "Tiêu Cực", short: "negative", value: 2453, color: "#FFAEA5" },
];

const totals = data.reduce((s, d) => s + d.value, 0);

export default function SentimentOverview() {
  return (
    <section className="relative bg-[#0B4AA3] text-white py-16 md:py-24 overflow-hidden">
      {/* starry backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -inset-40 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.12),rgba(11,74,163,0)_70%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-3xl md:text-5xl font-extrabold"
        >
          Nền tảng phân tích cảm xúc
        </motion.h2>
  <p className="mt-2 text-center text-white/85">Khám phá cảm xúc phía sau lời viết với nền tảng phân tích cảm xúc thông minh từ AI.</p>
  <p className="text-center text-white/75 text-sm">Chia sẻ nội dung của bạn và để AI cho bạn thấy điều ẩn giấu bên trong.</p>

        <ChartContainer className="mt-8 bg-white">
          {/* top pills */}
          <div className="flex flex-wrap items-center gap-3 border-b border-[#D7E5FF] pb-3">
            <Badge className="gap-2" variant="secondary">
              <BarChart3 className="size-3.5" />
              Analysis <span className="ml-1 rounded-full bg-[#A855F7] px-2 text-white">{totals}</span>
            </Badge>
            <Badge className="gap-2" variant="secondary">
              <span>😍</span>
              Tích Cực <span className="ml-1 rounded-full bg-[#A855F7] px-2 text-white">{data[0].value}</span>
            </Badge>
            <Badge className="gap-2" variant="secondary">
              <span>🙂</span>
              Trung Tính <span className="ml-1 rounded-full bg-[#A855F7] px-2 text-white">{data[1].value}</span>
            </Badge>
            <Badge className="gap-2" variant="secondary">
              <span>😡</span>
              Tiêu Cực <span className="ml-1 rounded-full bg-[#A855F7] px-2 text-white">{data[2].value}</span>
            </Badge>
          </div>

          <ChartHeader title="Phân Phối Nhãn" />
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
            {/* Chart */}
            <div className="h-[320px] md:h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, borderColor: "#D7E5FF" }}
                    formatter={(value: unknown, name: unknown) => {
                      const v = typeof value === "number" || typeof value === "string" ? value : "";
                      const n = typeof name === "string" ? name : "";
                      return [v, n];
                    }}
                  />
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    innerRadius={70}
                    strokeWidth={3}
                    stroke="#fff"
                    isAnimationActive
                    animationBegin={100}
                    animationDuration={900}
                    labelLine={false}
                    label={(props: unknown) => {
                      const p = props as { value?: number; cx?: number; cy?: number; midAngle?: number; innerRadius?: number; outerRadius?: number };
                      if (typeof p.value !== "number" || typeof p.cx !== "number" || typeof p.cy !== "number" || typeof p.midAngle !== "number" || typeof p.innerRadius !== "number" || typeof p.outerRadius !== "number") return null;
                      const RADIAN = Math.PI / 180;
                      const radius = p.innerRadius + (p.outerRadius - p.innerRadius) * 0.6;
                      const x = p.cx + radius * Math.cos(-p.midAngle * RADIAN);
                      const y = p.cy + radius * Math.sin(-p.midAngle * RADIAN);
                      const pct = Math.round((p.value / totals) * 100);
                      return (
                        <text x={x} y={y} fill="#1f2937" textAnchor="middle" dominantBaseline="central" style={{ fontWeight: 700 }}>
                          {pct}%
                        </text>
                      );
                    }}
                  >
                    {data.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <motion.ul
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="space-y-3 pr-4"
            >
      {data.map((d) => {
                const pct = Math.round((d.value / totals) * 100);
                return (
                  <li key={d.name} className="flex items-center gap-3">
                    <span className="inline-flex size-4 rounded" style={{ backgroundColor: d.color }} />
        <span className="text-slate-700 font-medium">{d.name}</span>
        <Badge className="ml-2" variant="primary">{d.value}</Badge>
                    <span className="ml-auto text-slate-500">{pct}%</span>
                  </li>
                );
              })}
            </motion.ul>
          </div>
        </ChartContainer>
      </div>
    </section>
  );
}
