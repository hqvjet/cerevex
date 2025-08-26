"use client";
import Protected from "@/components/auth/Protected";
import { ROLES } from "@/lib/auth/roles";
import { useEffect, useMemo, useState } from "react";
import { analysisService, AnalysisReportOut } from "@/lib/api/analysisService";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Metrics {
  totalFiles: number;
  totalPositive: number;
  totalNeutral: number;
  totalNegative: number;
  avgPosRatio: number; // positive / all
}

function computeMetrics(reports: AnalysisReportOut[]): Metrics {
  const totalFiles = reports.length;
  let totalPositive = 0, totalNeutral = 0, totalNegative = 0;
  reports.forEach(r => {
    totalPositive += r.num_positive;
    totalNeutral += r.num_neutral;
    totalNegative += r.num_negative;
  });
  const denom = totalPositive + totalNeutral + totalNegative || 1;
  return {
    totalFiles,
    totalPositive,
    totalNeutral,
    totalNegative,
    avgPosRatio: totalPositive / denom
  };
}

export default function DataAnalystDashboard() {
  const [reports, setReports] = useState<AnalysisReportOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const metrics = useMemo(() => computeMetrics(reports), [reports]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    analysisService.listReports()
      .then(res => { if(!ignore) setReports(res || []); })
      .catch(e => { if(!ignore) {
        const message = e instanceof Error ? e.message : 'Lỗi tải reports';
        setError(message);
      } })
      .finally(() => { if(!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!file) return;
    setUploading(true); setError(null);
    try {
      await analysisService.analyzeFiles([file]);
      const refreshed = await analysisService.listReports();
      setReports(refreshed || []);
      setFile(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload thất bại';
      setError(message);
    } finally { setUploading(false); }
  };

  const refreshReports = async () => {
    setLoading(true);
    try {
      const refreshed = await analysisService.listReports();
      setReports(refreshed || []);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Làm mới thất bại';
      setError(message);
    } finally { setLoading(false); }
  };

  return (
    <Protected allow={roles => roles.includes(ROLES.DATA_ANALYST)}>
      <DashboardShell>
        <main className="max-w-7xl mx-auto p-6 space-y-8">
          <header className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">Bảng điều khiển phân tích dữ liệu</h1>
            <p className="text-sm text-slate-600">Theo dõi tiến trình phân tích file & phân bố cảm xúc tổng hợp.</p>
          </header>

          {error && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">Lỗi: {error}</div>}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard tone="primary" label="Files" value={metrics.totalFiles} />
            <StatCard tone="positive" label="Positive" value={metrics.totalPositive} />
            <StatCard tone="neutral" label="Neutral" value={metrics.totalNeutral} />
            <StatCard tone="negative" label="Negative" value={metrics.totalNegative} />
            <StatCard tone="primary" label="Tỉ lệ Positive" value={(metrics.avgPosRatio*100).toFixed(1)} suffix="%" />
          </div>

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-6">
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold tracking-wide text-slate-600">Upload file mới</h2>
                  <Button variant="secondary" size="sm" onClick={refreshReports} disabled={loading}>{loading? '...' : 'Làm mới'}</Button>
                </div>
                <form onSubmit={onUpload} className="flex flex-col gap-3">
                  <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="text-sm" />
                  <Button type="submit" disabled={!file || uploading} className="justify-center">
                    {uploading? 'Đang phân tích...' : 'Phân tích ngay'}
                  </Button>
                  {file && !uploading && <span className="text-xs text-slate-500 line-clamp-1">{file.name}</span>}
                </form>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                <h2 className="text-sm font-semibold tracking-wide text-slate-600">Tổng quan nhanh</h2>
                <ul className="text-xs space-y-2">
                  <li className="flex justify-between"><span>Số samples</span><span className="font-medium">{metrics.totalPositive + metrics.totalNeutral + metrics.totalNegative}</span></li>
                  <li className="flex justify-between"><span>Positive ratio</span><span className="font-medium">{(metrics.avgPosRatio*100).toFixed(1)}%</span></li>
                  <li className="flex justify-between"><span>Updated</span><span className="font-medium">{reports[0] ? formatRelative(reports[0].created_at) : '—'}</span></li>
                </ul>
              </div>
            </div>
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Lịch sử Reports</h2>
                {loading && <span className="text-xs text-slate-400">Đang tải...</span>}
              </div>
              <div className="relative">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left border-b bg-slate-50/60">
                      <th className="py-2 px-2 font-medium">Summary</th>
                      <th className="py-2 px-2 font-medium">Positive</th>
                      <th className="py-2 px-2 font-medium">Neutral</th>
                      <th className="py-2 px-2 font-medium">Negative</th>
                      <th className="py-2 px-2 font-medium hidden md:table-cell">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.slice(0,100).map(r => (
                      <tr key={r.report_id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="py-2 px-2 font-medium max-w-[220px] truncate">{r.short_summary || 'Không có summary'}</td>
                        <td className="py-2 px-2 text-green-600 tabular-nums">{r.num_positive}</td>
                        <td className="py-2 px-2 text-slate-600 tabular-nums">{r.num_neutral}</td>
                        <td className="py-2 px-2 text-red-600 tabular-nums">{r.num_negative}</td>
                        <td className="py-2 px-2 text-xs text-slate-500 hidden md:table-cell">{formatRelative(r.created_at)}</td>
                      </tr>
                    ))}
                    {reports.length === 0 && !loading && (
                      <tr><td colSpan={5} className="py-8 text-center text-slate-400">Chưa có report nào</td></tr>
                    )}
                    {loading && (
                      <tr><td colSpan={5} className="py-8 text-center text-slate-400">Đang tải...</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </DashboardShell>
    </Protected>
  );
}

// Removed unused MetricCard component

function formatRelative(iso: string) {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const sec = Math.floor(diff/1000);
  if (sec < 60) return `${sec}s trước`;
  const min = Math.floor(sec/60);
  if (min < 60) return `${min}m trước`;
  const h = Math.floor(min/60);
  if (h < 24) return `${h}h trước`;
  const d = Math.floor(h/24);
  if (d < 7) return `${d}d trước`;
  return date.toLocaleDateString();
}

function StatCard({ label, value, suffix, tone }: { label: string; value: number|string; suffix?: string; tone?: "primary"|"positive"|"negative"|"neutral" }) {
  const colorMap: Record<string, string> = {
    primary: "from-emerald-500 to-teal-500 text-emerald-600",
    positive: "from-green-500 to-emerald-500 text-green-600",
    negative: "from-rose-500 to-red-500 text-rose-600",
    neutral: "from-slate-400 to-slate-500 text-slate-600",
  };
  const toneKey = tone || "primary";
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm p-5 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.12)] transition">
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br", colorMap[toneKey].replace(/text-[^ ]+/g,''),"/10")} />
      <div className="relative flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
        <div className={cn("text-2xl font-bold tabular-nums flex items-baseline gap-1", colorMap[toneKey].split(' ').pop())}>
          <NumberTicker value={Number(value)} />{suffix && <span className="text-xs font-normal text-slate-400">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}
