"use client";
import Protected from "@/components/auth/Protected";
import { ROLES } from "@/lib/auth/roles";
import { useAuth } from "@/lib/auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import { enterpriseService, type EnterpriseProduct, type SyncResponse } from "@/lib/api/enterpriseService";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { cn } from "@/lib/utils";
import { ChartContainer, ChartHeader } from "@/components/ui/chart";

interface SentimentAgg { total: number; posPct: number; negPct: number; neuPct: number; }

function calcAgg(products: EnterpriseProduct[]): SentimentAgg {
  let p=0,n=0,neu=0; products.forEach(pr=>{p+=pr.num_positive; n+=pr.num_negative; neu+=pr.num_neutral;});
  const total = p+n+neu || 1; return { total, posPct: p/total, negPct: n/total, neuPct: neu/total };
}

export default function ProductInsightDashboard() {
  const { user } = useAuth();
  const companyId = user?.company_id || "";
  const [products, setProducts] = useState<EnterpriseProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResponse | null>(null);
  const [filter, setFilter] = useState("");

  const load = useCallback(async () => {
    if(!companyId) return;
    setLoading(true); setError(null);
    try {
      const data = await enterpriseService.listProducts(companyId);
      setProducts(data);
  } catch(e: unknown){ setError(e instanceof Error ? e.message : 'Load failed'); }
    finally { setLoading(false); }
  }, [companyId]);

  useEffect(()=>{ load(); }, [load]);

  const agg = useMemo(()=>calcAgg(products),[products]);
  const filtered = useMemo(()=> products.filter(p=> !filter || p.product_name.toLowerCase().includes(filter.toLowerCase())), [products, filter]);
  const alerts = useMemo(()=> filtered.filter(p => p.num_negative >= (p.num_positive + p.num_neutral) ).slice(0,5), [filtered]);

  async function doSync(){
    setSyncing(true); setError(null);
    try {
      const res = await enterpriseService.sync();
      setSyncResult(res);
      await load();
  } catch(e: unknown){ setError(e instanceof Error ? e.message : 'Sync failed'); }
    finally { setSyncing(false); }
  }

  return (
    <Protected allow={roles => roles.includes(ROLES.PRODUCT_INSIGHT_ANALYST)}>
      <DashboardShell>
        <main className="max-w-7xl mx-auto p-6 space-y-8">
          <header className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Bảng phân tích sản phẩm</h1>
            <p className="text-sm text-slate-600">Theo dõi chất lượng cảm xúc, phát hiện sản phẩm rủi ro & đồng bộ dữ liệu mới.</p>
          </header>

          {error && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" onClick={load} disabled={loading}>{loading? 'Đang tải...' : 'Làm mới'}</Button>
            <Button size="sm" variant="secondary" onClick={doSync} disabled={syncing}>{syncing? 'Đang đồng bộ...' : 'Đồng bộ ngay'}</Button>
            <input placeholder="Tìm / lọc sản phẩm..." value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-md border px-2 py-1 text-sm" />
            {syncResult && <span className="text-xs text-slate-500">Đồng bộ: +{syncResult.new_products_created} mới, {syncResult.updated_products} cập nhật, {syncResult.skipped_products} bỏ qua</span>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
            <Stat label="Sản phẩm" value={products.length} tone="primary" />
            <Stat label="Tổng mẫu" value={agg.total} tone="neutral" />
            <Stat label="% Tích cực" value={(agg.posPct*100).toFixed(1)} suffix="%" tone="positive" />
            <Stat label="% Tiêu cực" value={(agg.negPct*100).toFixed(1)} suffix="%" tone="negative" />
            <Stat label="Cảnh báo" value={alerts.length} tone="warn" />
          </div>

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm p-5 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Danh sách sản phẩm đang theo dõi</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="text-left border-b bg-slate-50">
                        <th className="py-2 px-2 font-medium">Sản phẩm</th>
                        <th className="py-2 px-2 font-medium">+ Tích cực</th>
                        <th className="py-2 px-2 font-medium">= Trung tính</th>
                        <th className="py-2 px-2 font-medium">- Tiêu cực</th>
                        <th className="py-2 px-2 font-medium">Điểm sức khỏe</th>
                        <th className="py-2 px-2 font-medium hidden md:table-cell">Tóm tắt ngắn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(p => {
                        const tot = p.num_positive + p.num_neutral + p.num_negative || 1;
                        const health = (p.num_positive - p.num_negative)/tot; // -1..1
                        return (
                          <tr key={p.product_id} className="border-b last:border-0 hover:bg-slate-50">
                            <td className="py-2 px-2 font-medium max-w-[180px] truncate">{p.product_name}</td>
                            <td className="py-2 px-2 text-green-600 tabular-nums">{p.num_positive}</td>
                            <td className="py-2 px-2 text-slate-600 tabular-nums">{p.num_neutral}</td>
                            <td className="py-2 px-2 text-red-600 tabular-nums">{p.num_negative}</td>
                            <td className="py-2 px-2">
                              <span className={cn("text-xs font-semibold px-2 py-1 rounded", health>0.3?"bg-emerald-50 text-emerald-600": health<-0.3?"bg-rose-50 text-rose-600":"bg-amber-50 text-amber-600")}>{health.toFixed(2)}</span>
                            </td>
                            <td className="py-2 px-2 text-xs text-slate-500 hidden md:table-cell max-w-[260px] truncate">{p.short_summary}</td>
                          </tr>
                        );
                      })}
                      {filtered.length===0 && !loading && <tr><td colSpan={6} className="py-8 text-center text-slate-400">Không có sản phẩm</td></tr>}
                      {loading && <tr><td colSpan={6} className="py-8 text-center text-slate-400">Đang tải...</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Cảnh báo (Tiêu cực ≥ Tích cực + Trung tính)</h2>
                <ul className="space-y-2 text-sm">
                  {alerts.map(a => (
                    <li key={a.product_id} className="flex items-center justify-between rounded-md border px-3 py-2 bg-rose-50/60">
                      <span className="font-medium">{a.product_name}</span>
                      <span className="text-xs text-rose-600">Neg {a.num_negative} / Pos {a.num_positive} / Neu {a.num_neutral}</span>
                    </li>
                  ))}
                  {alerts.length===0 && <li className="text-slate-500 text-xs">Không có cảnh báo.</li>}
                </ul>
              </div>
            </div>
            <div className="space-y-6">
              <ChartContainer className="h-64">
                <ChartHeader title="Biểu đồ cảm xúc" subtitle="Tỉ lệ hiện tại" />
                <div className="flex h-[calc(100%-84px)] items-center justify-center text-xs text-slate-500">
                  {/* Placeholder donut */}
                  <div className="relative h-40 w-40">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-400 via-amber-300 to-rose-400 opacity-75" />
                    <div className="absolute inset-4 rounded-full bg-white flex flex-col items-center justify-center">
                      <div className="text-sm font-semibold">{(agg.posPct*100).toFixed(1)}% Tích cực</div>
                      <div className="text-[10px] text-slate-400">Tiêu cực {(agg.negPct*100).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              </ChartContainer>
              <ChartContainer className="h-64">
                <ChartHeader title="Chỉ số sức khỏe" subtitle="(Tích cực - Tiêu cực) / Tổng" />
                <div className="px-2 h-[calc(100%-84px)] flex items-center justify-center">
                  <div className="grid grid-cols-5 gap-2 w-full">
                    {products.slice(0,15).map(p => { const tot=p.num_positive+p.num_negative+p.num_neutral||1; const h=(p.num_positive-p.num_negative)/tot; return (
                      <div key={p.product_id} className="flex flex-col items-center gap-1">
                        <span className="truncate max-w-[70px] text-[10px] font-medium">{p.product_name}</span>
                        <div className={cn("h-20 w-4 rounded-full relative overflow-hidden", h>0.3?"bg-emerald-100": h<-0.3?"bg-rose-100":"bg-amber-100")}> 
                          <div className={cn("absolute bottom-0 w-full", h>0?"bg-emerald-500":"bg-rose-500")} style={{height: `${Math.min(Math.abs(h)*100,100)}%`}} />
                        </div>
                        <span className="text-[10px] text-slate-500">{h.toFixed(2)}</span>
                      </div> ); })}
                  </div>
                </div>
              </ChartContainer>
            </div>
          </section>
        </main>
      </DashboardShell>
    </Protected>
  );
}

function Stat({ label, value, suffix, tone }: { label: string; value: number|string; suffix?: string; tone?: 'primary'|'positive'|'negative'|'neutral'|'warn' }) {
  const map: Record<string,string> = {
    primary: 'from-blue-500 to-indigo-500 text-blue-600',
    positive: 'from-emerald-500 to-teal-500 text-emerald-600',
    negative: 'from-rose-500 to-red-500 text-rose-600',
    neutral: 'from-slate-400 to-slate-500 text-slate-600',
    warn: 'from-amber-500 to-orange-500 text-amber-600'
  };
  const toneCls = map[tone||'primary'];
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm p-5 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.06)] transition hover:shadow-[0_8px_28px_-4px_rgba(0,0,0,0.12)]">
      <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br', toneCls.replace(/text-[^ ]+/g,''), '/15')} />
      <div className="relative flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
        <div className={cn('text-2xl font-bold tabular-nums flex items-baseline gap-1', toneCls.split(' ').pop())}>
          <NumberTicker value={Number(value)} />{suffix && <span className="text-xs font-normal text-slate-400">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}
