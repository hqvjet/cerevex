"use client";
import Protected from "@/components/auth/Protected";
import { ROLES } from "@/lib/auth/roles";
import { useAuth } from "@/lib/auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import { enterpriseService, type EnterpriseProduct } from "@/lib/api/enterpriseService";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NumberTicker } from "@/components/ui/number-ticker";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function CompanyAdminDashboard() {
  const { user } = useAuth();
  const companyId = user?.company_id || "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<EnterpriseProduct[]>([]);
  const [sentiment, setSentiment] = useState<{ num_positive: number; num_neutral: number; num_negative: number; product_count: number } | null>(null);
  // Removed unused creating state
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const [prod, senti] = await Promise.all([
        enterpriseService.listProducts(companyId),
        enterpriseService.sentimentSummary(companyId),
      ]);
      setProducts(prod);
      setSentiment(senti);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Tải dữ liệu thất bại";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  async function remove(product: EnterpriseProduct) {
    if (!companyId) return;
    if (!confirm(`Xoá sản phẩm ${product.product_name}?`)) return;
    try {
      await enterpriseService.removeProduct(companyId, product.product_id);
      setProducts(p => p.filter(x => x.product_id !== product.product_id));
      const senti = await enterpriseService.sentimentSummary(companyId);
      setSentiment(senti);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Xoá thất bại";
      setError(message);
    }
  }

  async function syncNow() {
    setSyncing(true);
    try {
      await enterpriseService.sync();
      await load();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Đồng bộ thất bại";
      setError(message);
    } finally {
      setSyncing(false);
    }
  }

  const stats = useMemo(() => ({
    product: sentiment?.product_count ?? products.length,
    totalComments: (sentiment?.num_positive ?? 0) + (sentiment?.num_neutral ?? 0) + (sentiment?.num_negative ?? 0),
    positive: sentiment?.num_positive ?? 0,
    negative: sentiment?.num_negative ?? 0,
  }), [sentiment, products.length]);

  return (
    <Protected allow={roles => roles.includes(ROLES.COMPANY_ADMIN)}>
      <DashboardShell>
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Bảng điều khiển công ty</h1>
          <p className="text-sm text-slate-600">Theo dõi sản phẩm & cảm xúc khách hàng theo thời gian thực.</p>
        </header>

  {error && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">Lỗi: {error}</div>}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Tổng số sản phẩm" value={stats.product} loading={loading} tone="primary" />
          <StatCard label="Bình luận tích cực" value={stats.positive} loading={loading} tone="positive" />
          <StatCard label="Bình luận tiêu cực" value={stats.negative} loading={loading} tone="negative" />
          <StatCard label="Tổng bình luận" value={stats.totalComments} loading={loading} tone="neutral" />
        </div>

        <section className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Danh sách sản phẩm đã theo dõi</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={load} disabled={loading}>{loading ? "Đang tải..." : "Làm mới dữ liệu"}</Button>
                <Button size="sm" onClick={syncNow} disabled={syncing}>{syncing ? "Đang đồng bộ..." : "Đồng bộ bình luận"}</Button>
              </div>
            </div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b bg-slate-50">
                  <th className="py-2 px-2 font-medium">Sản phẩm</th>
                  <th className="py-2 px-2 font-medium hidden md:table-cell">Mã nguồn (3rd)</th>
                  <th className="py-2 px-2 font-medium">+ Tích cực</th>
                  <th className="py-2 px-2 font-medium">= Trung tính</th>
                  <th className="py-2 px-2 font-medium">- Tiêu cực</th>
                  <th className="py-2 px-2 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.product_id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="py-2 px-2 font-medium">{p.product_name}</td>
                    <td className="py-2 px-2 hidden md:table-cell text-slate-500">{p.third_party_id}</td>
                    <td className="py-2 px-2 text-green-600">{p.num_positive}</td>
                    <td className="py-2 px-2 text-slate-600">{p.num_neutral}</td>
                    <td className="py-2 px-2 text-red-600">{p.num_negative}</td>
                    <td className="py-2 px-2 text-right"><Button size="sm" variant="outline" onClick={() => remove(p)}>Gỡ</Button></td>
                  </tr>
                ))}
                {products.length === 0 && !loading && (
                  <tr><td colSpan={6} className="py-6 text-center text-slate-400">Chưa có sản phẩm nào được ghi nhận.</td></tr>
                )}
                {loading && (
                  <tr><td colSpan={6} className="py-6 text-center text-slate-400">Đang tải dữ liệu...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      </DashboardShell>
    </Protected>
  );
}

function StatCard({ label, value, loading, tone }: { label: string; value: number; loading?: boolean; tone?: "primary"|"positive"|"negative"|"neutral" }) {
  const colorMap: Record<string, string> = {
    primary: "from-blue-500 to-indigo-500 text-blue-600",
    positive: "from-emerald-500 to-teal-500 text-emerald-600",
    negative: "from-rose-500 to-red-500 text-rose-600",
    neutral: "from-slate-400 to-slate-500 text-slate-600",
  };
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm p-5 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.06)] transition hover:shadow-[0_8px_28px_-4px_rgba(0,0,0,0.12)]">
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br", colorMap[tone||"primary"].replace(/text-[^ ]+/g,''),"/15")} />
      <div className="relative flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
        <div className={cn("text-2xl font-bold tabular-nums", loading && "animate-pulse text-slate-300", !loading && colorMap[tone||"primary"].split(' ').pop())}>
          {loading ? "--" : <NumberTicker value={value} />}
        </div>
      </div>
    </div>
  );
}
