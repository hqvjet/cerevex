"use client";
import Protected from "@/components/auth/Protected";
import { ROLES } from "@/lib/auth/roles";
import CompanySentiment360 from "../../components/analysis/CompanySentiment360";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { enterpriseService, type EnterpriseProduct, type SyncResponse } from "@/lib/api/enterpriseService";
import { Alert } from "@/components/ui/alert";

// Shared helper for sentiment score
function computeScore(p: EnterpriseProduct): number {
  const total = p.num_positive + p.num_neutral + p.num_negative;
  if (!total) return 0;
  const raw = (p.num_positive - p.num_negative) / total;
  return +(raw * 100).toFixed(1);
}

export default function PhanTichHeThongPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<EnterpriseProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<SyncResponse | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: 'score' | 'name' | 'total'; dir: 'asc' | 'desc' }>({ key: 'score', dir: 'desc' });
  const toggleSort = toggleSortFactory(setSort);

  useEffect(() => {
    const load = async () => {
      if (!user?.company_id) return;
      setLoadingProducts(true);
      try {
        const data = await enterpriseService.listProducts(user.company_id);
        setProducts(data);
      } catch (e) {
        console.error("Fetch products failed", e);
      } finally {
        setLoadingProducts(false);
      }
    };
    load();
  }, [user?.company_id]);

  async function handleSync() {
    setSyncing(true);
    setNotice(null);
    try {
      const res = await enterpriseService.sync();
      setLastSync(res);
      if (user?.company_id) {
        const data = await enterpriseService.listProducts(user.company_id);
        setProducts(data);
      }
      setNotice({ type: "success", msg: `Đồng bộ: +${res.new_products_created} mới, ${res.updated_products} cập nhật, ${res.errors} lỗi.` });
    } catch (e: unknown) {
      const msg = getErrorMessage(e);
      setNotice({ type: "error", msg: `Đồng bộ thất bại: ${msg}` });
    } finally {
      setSyncing(false);
    }
  }

  function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === 'object' && err && 'message' in err) {
      const maybeMsg = (err as { message?: unknown }).message;
      if (typeof maybeMsg === 'string') return maybeMsg;
    }
    return 'Không xác định';
  }

  // Sentiment score formula reused (see top-level helper)

  function classify(products: EnterpriseProduct[]) {
    const good: { product: EnterpriseProduct; score: number }[] = [];
    const bad: { product: EnterpriseProduct; score: number }[] = [];
    for (const p of products) {
      const score = computeScore(p);
      if (score >= 20) good.push({ product: p, score });
      else if (score <= -20) bad.push({ product: p, score });
    }
    return { good, bad };
  }
  const { good, bad } = classify(products);

  // Derived analytics
  const withScore = products.map(p => ({ p, score: computeScore(p), total: p.num_positive + p.num_neutral + p.num_negative }));
  const avgScore = withScore.length ? (withScore.reduce((s, x) => s + x.score, 0) / withScore.length).toFixed(1) : '0.0';
  const riskRatio = products.length ? ((bad.length / products.length) * 100).toFixed(1) : '0.0';
  const positiveCoverage = (() => {
    const agg = products.reduce((a,c)=>{a.pos+=c.num_positive;a.neg+=c.num_negative;a.neu+=c.num_neutral;return a;},{pos:0,neg:0,neu:0});
    const total = agg.pos+agg.neg+agg.neu; return total? ((agg.pos/total)*100).toFixed(1):'0.0';
  })();

  const filtered = withScore.filter(x => !query || x.p.product_name.toLowerCase().includes(query.toLowerCase()) || (x.p.third_party_id||'').toLowerCase().includes(query.toLowerCase()));
  filtered.sort((a,b)=>{
    const dir = sort.dir === 'asc' ? 1 : -1;
    if (sort.key === 'score') return (a.score - b.score)*dir;
    if (sort.key === 'total') return (a.total - b.total)*dir;
    return a.p.product_name.localeCompare(b.p.product_name)*dir;
  });

  return (
    <Protected
      allow={(roles) =>
        roles.includes(ROLES.SYSTEM_ADMIN) ||
        roles.includes(ROLES.ADMIN) ||
        roles.includes(ROLES.PRODUCT_INSIGHT_ANALYST)
      }
    >
      <main className="max-w-6xl mx-auto p-6 space-y-10">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Phân tích sản phẩm doanh nghiệp</h1>
          <p className="text-sm text-slate-500 mt-1">Góc nhìn hợp nhất về sức khỏe cảm xúc khách hàng & hiệu suất sản phẩm.</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-700">Sức khỏe cảm xúc doanh nghiệp</h2>
          <p className="text-xs text-slate-500">Chỉ số hợp nhất hỗ trợ phát hiện sớm rủi ro & cơ hội cải thiện trải nghiệm.</p>
          <Suspense fallback={<div className="text-sm text-slate-500">Đang tải tổng quan...</div>}>
            <CompanySentiment360 />
          </Suspense>
          {/* KPI cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPI title="Điểm trung bình" value={avgScore} hint="Trung bình score tất cả sản phẩm" trend={parseFloat(avgScore) >= 0 ? 'up' : 'down'} />
            <KPI title="Tỷ lệ sản phẩm rủi ro" value={riskRatio + '%'} hint="Score ≤ -20" trend={parseFloat(riskRatio) > 0 ? 'down' : 'flat'} />
            <KPI title="Tỷ lệ cảm xúc tích cực" value={positiveCoverage + '%'} hint="Positive share" trend={parseFloat(positiveCoverage) >= 50 ? 'up' : 'down'} />
            <KPI title="Sản phẩm" value={`${products.length}`} hint="Tổng đã đồng bộ" trend="flat" />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center flex-wrap gap-3">
            <h2 className="text-xl font-semibold text-slate-700 mb-0">Danh sách & phân loại sản phẩm</h2>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncing ? "Đang đồng bộ..." : "Đồng bộ"}
            </button>
            <button
              onClick={() => user?.company_id && enterpriseService.listProducts(user.company_id).then(setProducts)}
              disabled={loadingProducts || syncing}
              className="inline-flex items-center rounded-md bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-300 disabled:opacity-50"
            >
              Làm mới
            </button>
            {lastSync && (
              <span className="text-xs text-slate-500">Lần đồng bộ cuối: {new Date(lastSync.synced_at).toLocaleTimeString()} (+{lastSync.new_products_created} mới, {lastSync.updated_products} cập nhật, {lastSync.errors} lỗi)</span>
            )}
          </div>
          {notice && (
            <Alert
              variant={notice.type === "success" ? "success" : "error"}
              title={notice.type === "success" ? "Thành công" : "Thất bại"}
              onClose={() => setNotice(null)}
            >
              {notice.msg}
            </Alert>
          )}
          {products.length > 0 && (
            <div className="flex flex-wrap gap-3 items-center">
              <input
                value={query}
                onChange={e=>setQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm hoặc 3rd id..."
                className="w-72 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search products"
              />
              <span className="text-xs text-slate-400">{filtered.length}/{products.length} hiển thị</span>
            </div>
          )}
          {loadingProducts && <div className="text-sm text-slate-500">Đang tải danh sách sản phẩm...</div>}
          {!loadingProducts && products.length === 0 && (
            <div className="text-sm text-slate-500">Chưa có sản phẩm nào. Bấm &quot;Đồng bộ&quot; để lấy dữ liệu.</div>
          )}
          {products.length > 0 && (
            <div className="overflow-x-auto border border-slate-200 rounded-md shadow-sm bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium cursor-pointer" onClick={()=>toggleSort('name')}>Sản phẩm {sort.key==='name' && (sort.dir==='asc'?'▲':'▼')}</th>
                    <th className="px-3 py-2 text-left font-medium">3rd ID / Liên kết</th>
                    <th className="px-3 py-2 text-right font-medium text-emerald-600">Tích cực</th>
                    <th className="px-3 py-2 text-right font-medium text-amber-600">Trung tính</th>
                    <th className="px-3 py-2 text-right font-medium text-rose-600">Tiêu cực</th>
                    <th className="px-3 py-2 text-right font-medium cursor-pointer" onClick={()=>toggleSort('total')}>Tổng {sort.key==='total' && (sort.dir==='asc'?'▲':'▼')}</th>
                    <th className="px-3 py-2 text-right font-medium cursor-pointer" onClick={()=>toggleSort('score')}>Điểm {sort.key==='score' && (sort.dir==='asc'?'▲':'▼')}</th>
                    <th className="px-3 py-2 text-left font-medium">Phân bố</th>
                    <th className="px-3 py-2 text-left font-medium">Tóm tắt</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(({p, score, total}) => {
                    const scoreClass = score >= 20 ? 'text-emerald-600' : score <= -20 ? 'text-rose-600' : 'text-slate-500';
                    const aggTotal = total || 1;
                    const posPct = (p.num_positive/aggTotal)*100;
                    const neuPct = (p.num_neutral/aggTotal)*100;
                    const negPct = (p.num_negative/aggTotal)*100;
                    return (
                      <tr key={p.product_id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{p.product_name}</td>
                        <td className="px-3 py-2 text-slate-500 whitespace-nowrap">
                          {p.third_party_id ? (
                            <a href={`${process.env.NEXT_PUBLIC_THIRD_PARTY_WEB_URL}/product/${p.third_party_id}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{p.third_party_id}</a>
                          ) : <span className="text-slate-400">-</span>}
                        </td>
                        <td className="px-3 py-2 text-right text-emerald-600">{p.num_positive}</td>
                        <td className="px-3 py-2 text-right text-amber-600">{p.num_neutral}</td>
                        <td className="px-3 py-2 text-right text-rose-600">{p.num_negative}</td>
                        <td className="px-3 py-2 text-right font-medium">{total}</td>
                        <td className={`px-3 py-2 text-right font-medium ${scoreClass}`}>{score}</td>
                        <td className="px-3 py-2">
                          <div className="flex h-2 w-40 overflow-hidden rounded bg-slate-100">
                            <span style={{width: posPct+'%'}} className="bg-emerald-500" />
                            <span style={{width: neuPct+'%'}} className="bg-amber-400" />
                            <span style={{width: negPct+'%'}} className="bg-rose-500" />
                          </div>
                        </td>
                        <td className="px-3 py-2 text-slate-500 max-w-xs truncate" title={p.short_summary}>{p.short_summary}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {products.length > 0 && (
            <div className="overflow-x-auto border border-slate-200 rounded-md shadow-sm bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Sản phẩm tốt (≥ 20)</th>
                    <th className="px-3 py-2 text-left font-medium">Sản phẩm xấu (≤ -20)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="align-top">
                    <td className="px-3 py-3 space-y-1">
                      {good.length === 0 && <div className="text-xs text-slate-400">(Không)</div>}
                      {good.map(({product, score}) => (
                        <div key={product.product_id} className="text-emerald-700">• {product.product_name} <span className="text-xs text-slate-500">({score})</span></div>
                      ))}
                    </td>
                    <td className="px-3 py-3 space-y-1">
                      {bad.length === 0 && <div className="text-xs text-slate-400">(Không)</div>}
                      {bad.map(({product, score}) => (
                        <div key={product.product_id} className="text-rose-700">• {product.product_name} <span className="text-xs text-slate-500">({score})</span></div>
                      ))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>
        {/* Action suggestions for analyst */}
        <ActionSuggestions products={products} />
      </main>
    </Protected>
  );
}

// ---------- Action Suggestions Component ----------
interface SuggestionsProps { products: EnterpriseProduct[] }
function ActionSuggestions({ products }: SuggestionsProps) {
  if (!products.length) return null;
  const agg = products.reduce((acc, p) => {
    acc.pos += p.num_positive; acc.neu += p.num_neutral; acc.neg += p.num_negative; return acc;
  }, { pos: 0, neu: 0, neg: 0 });
  const total = agg.pos + agg.neu + agg.neg;
  const negPct = total ? (agg.neg / total) * 100 : 0;
  const posPct = total ? (agg.pos / total) * 100 : 0;

  const bad: { name: string; score: number }[] = products.map(p => ({ name: p.product_name, score: computeScore(p) }))
    .filter(p => p.score <= -20)
    .sort((a,b) => a.score - b.score);
  const nearRisk = products.map(p => ({ name: p.product_name, score: computeScore(p) }))
    .filter(p => p.score < 10 && p.score > -20)
    .sort((a,b)=> a.score - b.score)
    .slice(0,3);

  const ideas: string[] = [];
  if (bad.length) ideas.push(`Ưu tiên phân tích phản hồi tiêu cực cho ${bad.slice(0,3).map(b=>b.name).join(', ')} (score ≤ -20).`);
  if (negPct > 30) ideas.push(`Tỷ lệ tiêu cực toàn công ty ${negPct.toFixed(1)}% > 30%: kích hoạt quy trình phản hồi khách hàng & rà soát luồng onboarding.`);
  if (posPct < 45) ideas.push(`Tỷ lệ tích cực thấp (${posPct.toFixed(1)}%): xem xét chiến dịch tăng tương tác hoặc cải thiện tính năng cốt lõi.`);
  if (!ideas.length) ideas.push("Chỉ số ổn định – tiếp tục theo dõi định kỳ và thu thập thêm dữ liệu định tính.");
  if (nearRisk.length && !bad.length) ideas.push(`Theo dõi sát các sản phẩm biên: ${nearRisk.map(n=>n.name).join(', ')} (score < 10).`);

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-700">Đề xuất hành động</h2>
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm relative">
        <SeverityBadge negPct={negPct} posPct={posPct} />
        <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
          {ideas.map((i, idx) => <li key={idx}>{i}</li>)}
        </ul>
        <p className="mt-4 text-[11px] uppercase tracking-wide text-slate-400">Gợi ý được tạo động dựa trên điểm cảm xúc & phân bố tích cực/tiêu cực.</p>
      </div>
    </section>
  );
}

// ---------- KPI Card Component ----------
function KPI({ title, value, hint, trend }: { title: string; value: string; hint?: string; trend?: 'up'|'down'|'flat' }) {
  const trendSymbol = trend==='up'?'▲':trend==='down'?'▼':'─';
  const trendColor = trend==='up'?'text-emerald-600':trend==='down'?'text-rose-600':'text-slate-400';
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-slate-500">{title}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-slate-800">{value}</span>
        <span className={`text-sm ${trendColor}`}>{trendSymbol}</span>
      </div>
      {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
    </div>
  );
}

// ---------- Severity Badge ----------
function SeverityBadge({ negPct, posPct }: { negPct: number; posPct: number }) {
  let label = 'Ổn định'; let color = 'bg-emerald-500';
  if (negPct > 35) { label = 'Cảnh báo cao'; color='bg-rose-600'; }
  else if (negPct > 25) { label='Cảnh báo'; color='bg-amber-500'; }
  else if (posPct < 40) { label='Giám sát'; color='bg-blue-500'; }
  return (
    <div className="absolute -top-3 -right-3 flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium shadow border border-slate-200">
      <span className={`inline-block h-2 w-2 rounded-full ${color}`} />{label}
    </div>
  );
}

// ---------- Sorting helper ----------
function toggleSortFactory(setSort: React.Dispatch<React.SetStateAction<{key:'score'|'name'|'total';dir:'asc'|'desc'}>>) {
  return (key: 'score' | 'name' | 'total') => {
    setSort(prev => prev.key === key ? { key, dir: prev.dir==='asc'?'desc':'asc' } : { key, dir: key==='name'?'asc':'desc' });
  };
}

