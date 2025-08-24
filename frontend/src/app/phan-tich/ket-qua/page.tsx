"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Protected from "@/components/auth/Protected";
import { ROLES, hasAnyRole, parseRoles } from "@/lib/auth/roles";
import { useAuth } from "@/lib/auth";
import { AnalystNavbar } from "@/components/analysis/AnalystNavbar";
import type { FileAnalysisResult } from "@/lib/api/analysisService";
import { ChartContainer, ChartHeader } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";

export default function KetQuaPage() {
  const { user } = useAuth();
  const roles = parseRoles(user?.role);
  const allowed = hasAnyRole(roles, [ROLES.DATA_ANALYSIST, ROLES.PRODUCT_INSIGHT_ANALYSIST, ROLES.SYSTEM_ADMIN, ROLES.ADMIN]);

  const [fileRes, setFileRes] = useState<FileAnalysisResult | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = sessionStorage.getItem("analysis:last:file");
      if (raw) {
        try { setFileRes(JSON.parse(raw)); } catch {}
      }
    }
  }, []);

  const chartData = useMemo(() => {
    if (!fileRes) return [] as { name: string; key: string; value: number; color: string }[];
    // Map known labels to VN names and brand palette
    const map: Record<string, { name: string; color: string }> = {
      positive: { name: "Tích Cực", color: "#7AD9B3" },
      neutral: { name: "Trung Tính", color: "#FFD66B" },
      negative: { name: "Tiêu Cực", color: "#FFAEA5" },
    };
    return Object.entries(fileRes.label_distribution).map(([k, v]) => {
      const key = k.toLowerCase();
      const conf = map[key] ?? { name: k, color: "#8b5cf6" };
      return { key, name: conf.name, value: Number(v as number), color: conf.color };
    });
  }, [fileRes]);

  const totals = useMemo(() => chartData.reduce((s, d) => s + d.value, 0), [chartData]);

  // ---- Tabs state ----
  type TabKey = "analysis" | "positive" | "neutral" | "negative";
  const [tab, setTab] = useState<TabKey>("analysis");

  // ---- Rows: prefer server-provided items; fallback to deterministic samples
  type Row = { id: string; title: string; content: string; label: "positive" | "neutral" | "negative"; score?: number };
  const sampleRows = useMemo<Row[]>(() => {
    if (!fileRes) return [];
    // If backend provided raw items, map them with synthetic ids & scores
    if (fileRes.items && fileRes.items.length > 0) {
      return fileRes.items.map((it, i) => ({
        id: `${"RVJAFX"[i % 5]}${1000 + ((i * 137) % 9000)}`,
        title: it.title ?? "",
        content: it.content,
        label: (it.label?.toLowerCase?.() as Row["label"]) || "neutral",
        score: 70 + (i % 25),
      }));
    }
    const genId = (i: number) => {
      const prefixes = ["RVJ", "AFX", "ZXC", "YUI", "QWE", "PLM"];
      const num = 1000 + ((i * 137) % 9000);
      return `${prefixes[i % prefixes.length]}-${num}`;
    };
    const pick = (arr: string[], i: number) => arr[i % arr.length];
    const posTitles = [
      "Hài lòng từ A đến Z",
      "Trải nghiệm đáng nhớ",
      "Dịch vụ tuyệt vời",
      "Nhân viên thân thiện",
      "Rất đáng để quay lại",
    ];
    const posContents = [
      "Phòng rộng, view đẹp, nhân viên rất dễ thương",
      "Giao hàng nhanh, đóng gói cẩn thận",
      "Ứng dụng chạy mượt, tính năng hữu ích",
      "Chăm sóc khách hàng nhiệt tình",
      "Sản phẩm đúng mô tả, chất lượng tốt",
    ];
    const negTitles = [
      "Dịch vụ chuyến bay",
      "Trải nghiệm cần cải thiện",
      "Chậm trễ không mong muốn",
      "Chất lượng dưới kỳ vọng",
      "Hỗ trợ chưa kịp thời",
    ];
    const negContents = [
      "Delay 2 tiếng nhưng hoàn tiền gặp đôi, yếu lắm :3",
      "Ship chậm và gói hàng móp nhẹ",
      "Ứng dụng hay bị lỗi đăng nhập",
      "Phản hồi hỗ trợ quá chậm",
      "Hàng không đúng màu đã chọn",
    ];
    const neuTitles = [
      "Thông tin tham khảo",
      "Ghi chú chung",
      "Đánh giá sơ bộ",
      "Nhận xét ban đầu",
      "Tổng quan sử dụng",
    ];
    const neuContents = [
      "Tính năng ổn, cần thêm tùy chọn nâng cao",
      "Đóng gói bình thường, giao đúng hẹn",
      "Thiết kế ổn, màu sắc như hình",
      "Hiệu năng đủ dùng, chưa thử lâu dài",
      "Trải nghiệm bình thường, không có vấn đề lớn",
    ];
    const confRange = (label: string) =>
      label === "positive" ? [82, 96] : label === "negative" ? [72, 90] : [60, 86];

  return [] as Row[]; // Unused path since items are now required; kept for type safety
    
  }, [fileRes]);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const labelFilter = tab === "analysis" ? null : tab;
  const filtered = useMemo(() => {
    const base = labelFilter ? sampleRows.filter((r) => r.label === labelFilter) : sampleRows;
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter((r) => r.id.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.content.toLowerCase().includes(q));
  }, [sampleRows, labelFilter, query]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Protected allow={() => allowed}>
      <AnalystNavbar />
      <section className="relative overflow-hidden bg-[#0B4AA3] text-white">
        <div className="absolute inset-0">
          <Image src="/assets/images/hero_frame.png" alt="bg" fill className="object-cover opacity-40" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide text-center">
            Nền tảng phân tích cảm xúc
          </h1>
          <p className="mt-3 text-center text-white/90 max-w-2xl mx-auto">
            Khám phá cảm xúc phía sau lời viết với nền tảng phân tích cảm xúc thông minh từ AI.
          </p>
          <ChartContainer className="mt-8 bg-white/95 backdrop-blur">
            {/* Top statistic pills */}
            <div className="flex flex-wrap items-center gap-3 border-b border-[#D7E5FF] pb-3 justify-between">
              <div className="flex flex-wrap items-center gap-3">
                {fileRes && (
                  <>
                    <Badge
                      className="gap-2 cursor-pointer"
                      variant={tab === "analysis" ? "primary" : "secondary"}
                      onClick={() => { setTab("analysis"); setPage(1); }}
                    >
                      <span>📊</span>
                      Analysis <span className="ml-1 rounded bg-[#C07CFF] text-white px-1.5">{fileRes.total_rows}</span>
                    </Badge>
                    {chartData.map((d) => (
                      <Badge key={d.key} className="gap-2 cursor-pointer" variant={tab === (d.key as TabKey) ? "primary" : "secondary"} onClick={() => { setTab(d.key as TabKey); setPage(1); }}>
                        <span>{d.key === "positive" ? "😊" : d.key === "neutral" ? "🙂" : "😠"}</span>
                        {d.name}
                        <span className="ml-1 rounded bg-[#C07CFF] text-white px-1.5">{d.value}</span>
                      </Badge>
                    ))}
                  </>
                )}
              </div>
              <div className="mt-2 md:mt-0">
                <Button asChild variant="outline" size="sm">
                  <Link href="/phan-tich">Phân tích tệp khác</Link>
                </Button>
              </div>
            </div>

            {/* Tabs content */}
            {tab === "analysis" ? (
              <>
                <ChartHeader title="Phân Phối Nhãn" />
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
                  <div className="h-[320px] md:h-[380px]">
                    {chartData.length > 0 ? (
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
                            data={chartData}
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
                              const pct = totals ? Math.round((p.value / totals) * 100) : 0;
                              return (
                                <text x={x} y={y} fill="#1f2937" textAnchor="middle" dominantBaseline="central" style={{ fontWeight: 700 }}>
                                  {pct}%
                                </text>
                              );
                            }}
                          >
                            {chartData.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="grid h-full place-items-center text-slate-600 text-sm">Không có dữ liệu.</div>
                    )}
                  </div>
                  {chartData.length > 0 && (
                    <ul className="space-y-3 pr-4">
                      {chartData.map((d) => {
                        const pct = totals ? Math.round((d.value / totals) * 100) : 0;
                        return (
                          <li key={d.key} className="flex items-center gap-3">
                            <span className="inline-flex size-4 rounded" style={{ backgroundColor: d.color }} />
                            <span className="text-slate-700 font-medium">{d.name}</span>
                            <Badge className="ml-2" variant="primary">{d.value}</Badge>
                            <span className="ml-auto text-slate-500">{pct}%</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </>
            ) : (
              <>
                <ChartHeader title="Danh sách đánh giá" subtitle="Bảng dữ liệu trực quan theo từng nhãn cảm xúc" />
                {/* Toolbar */}
                <div className="mb-3 flex items-center gap-3 rounded-lg bg-[#F6FAFF] p-3">
                  <button className="inline-flex items-center gap-2 rounded-md border border-[#C9DAFF] bg-white px-3 py-1.5 text-sm text-[#0B4AA3] shadow-sm">
                    <span>🔎</span> Bộ lọc
                  </button>
                  <div className="relative flex-1">
                    <input
                      value={query}
                      onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                      placeholder="Tìm kiếm theo ID, tiêu đề hoặc nội dung"
                      className="w-full rounded-md border border-[#C9DAFF] bg-white px-3 py-2 text-sm text-slate-700 shadow-inner placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#88B2FF]"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-[#D7E5FF]">
                  <table className="w-full table-fixed">
                    <thead>
                      <tr className="bg-[#F6FAFF] text-xs text-slate-600">
                        <th className="px-4 py-2 text-left w-[120px]">ID</th>
                        <th className="px-4 py-2 text-left w-[220px]">TIÊU ĐỀ</th>
                        <th className="px-4 py-2 text-left">NỘI DUNG</th>
                        <th className="px-4 py-2 text-left w-[180px]">LOẠI CẢM XÚC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((r, i) => (
                        <tr key={r.id} className="border-t border-[#EEF4FF] text-sm">
                          <td className="px-4 py-3 font-medium text-slate-700">{r.id}</td>
                          <td className="px-4 py-3 text-slate-700">{r.title}</td>
                          <td className="px-4 py-3 text-slate-600 truncate">{r.content}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-flex size-3 rounded"
                                style={{ backgroundColor: r.label === "positive" ? "#7AD9B3" : r.label === "neutral" ? "#FFD66B" : "#FFAEA5" }}
                              />
                              <span className="text-slate-700 font-medium">
                                {r.label === "positive" ? "TÍCH CỰC" : r.label === "neutral" ? "TRUNG TÍNH" : "TIÊU CỰC"}
                              </span>
                              {typeof r.score === "number" && (
                                <span className="ml-2 text-xs text-slate-500">{r.score}%</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {pageRows.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-500">Không có dữ liệu phù hợp</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {/* Pagination */}
                  <div className="flex items-center justify-end gap-2 p-3 text-xs text-slate-600">
                    <span>
                      {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} / {filtered.length}
                    </span>
                    <button
                      className="rounded border border-[#C9DAFF] px-2 py-1 disabled:opacity-50"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      ‹
                    </button>
                    <button
                      className="rounded border border-[#C9DAFF] px-2 py-1 disabled:opacity-50"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      ›
                    </button>
                  </div>
                </div>
              </>
            )}
          </ChartContainer>
        </div>
      </section>

  <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="w-10 h-10 rounded-full grid place-items-center bg-green-100 text-green-700 text-xl mb-3">🙂</div>
            <h3 className="font-semibold">Cảm xúc Tích Cực</h3>
            <p className="text-sm text-slate-600 mt-1">
              Phát hiện cảm xúc tích cực, sự hài lòng và biểu hiện lạc quan trong nội dung.
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="w-10 h-10 rounded-full grid place-items-center bg-amber-100 text-amber-700 text-xl mb-3">😐</div>
            <h3 className="font-semibold">Cảm xúc Trung Lập</h3>
            <p className="text-sm text-slate-600 mt-1">
              Thể hiện thông tin khách quan, ít thiên kiến để đánh giá bối cảnh chung.
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="w-10 h-10 rounded-full grid place-items-center bg-red-100 text-red-700 text-xl mb-3">🙁</div>
            <h3 className="font-semibold">Cảm xúc Tiêu Cực</h3>
            <p className="text-sm text-slate-600 mt-1">
              Nhận diện lời phàn nàn, phản hồi chỉ trích giúp bạn biết rõ vấn đề trọng tâm.
            </p>
          </div>
        </div>
      </main>
    </Protected>
  );
}
