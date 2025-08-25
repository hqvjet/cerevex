"use client";
import { useEffect, useState } from "react";
import { ChartContainer, ChartHeader } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/lib/auth";
import { enterpriseService } from "@/lib/api/enterpriseService";

interface SentimentSlice { label: string; value: number; color: string; }

export default function CompanySentiment360() {
  const { user } = useAuth();
  const [data, setData] = useState<SentimentSlice[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const run = async () => {
      if (!user?.company_id) return;
      setLoading(true); setError(null);
      try {
        const agg = await enterpriseService.sentimentSummary(user.company_id);
        setData([
          { label: "Tích cực", value: agg.num_positive, color: "#16a34a" },
          { label: "Trung tính", value: agg.num_neutral, color: "#f59e0b" },
          { label: "Tiêu cực", value: agg.num_negative, color: "#dc2626" },
        ]);
  } catch {
        setError("Không lấy được dữ liệu cảm xúc");
      } finally { setLoading(false); }
    };
    run();
  }, [user?.company_id]);
  const total = data?.reduce((s, d) => s + d.value, 0) ?? 0;
  const posPct = total ? (data?.[0].value || 0) / total * 100 : 0;
  const negPct = total ? (data?.[2].value || 0) / total * 100 : 0;
  const healthLabel = negPct > 35 ? 'Rủi ro cao' : negPct > 25 ? 'Cảnh báo' : posPct < 40 ? 'Giám sát' : 'Ổn định';

  return (
    <ChartContainer>
      <ChartHeader title="Chỉ số cảm xúc doanh nghiệp" subtitle="Tổng hợp cộng dồn từ toàn bộ sản phẩm / nguồn dữ liệu" />
      {loading && <div className="p-6 text-sm text-slate-500">Đang tải dữ liệu tổng quan...</div>}
      {error && <div className="p-6 text-sm text-rose-600">{error}</div>}
      {!loading && !error && data && (
        <div className="mt-4 flex flex-col md:flex-row items-center justify-center gap-12">
          <div className="w-[360px] h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="label"
                >
                  {data.map(d => <Cell key={d.label} fill={d.color} />)}
                </Pie>
                <Tooltip
                  formatter={(value: unknown, name: unknown) => {
                    const v = typeof value === 'number' ? value.toLocaleString() : String(value ?? '');
                    const n = typeof name === 'string' ? name : String(name ?? '');
                    return [v, n];
                  }}
                  contentStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2 w-[260px]">
            {data.map(d => {
              const pct = total ? Math.round((d.value / total) * 100) : 0;
              return (
                <li key={d.label} className="flex items-center gap-3">
                  <span className="inline-flex size-3 rounded" style={{ backgroundColor: d.color }} />
                  <span className="text-sm font-medium text-slate-700">{d.label}</span>
                  <Badge variant="secondary">{d.value.toLocaleString()}</Badge>
                  <span className="ml-auto text-xs text-slate-500">{pct}%</span>
                </li>
              );
            })}
            <li className="flex flex-col gap-1 pt-2 border-t text-sm">
              <div className="flex justify-between font-medium"><span>Tổng lượt</span><span>{total.toLocaleString()}</span></div>
              <div className="flex justify-between text-xs text-slate-500"><span>Chỉ số sức khỏe</span><span>{healthLabel}</span></div>
              <div className="flex justify-between text-xs text-slate-500"><span>Pos/Neg Ratio</span><span>{( (data[0].value)/( (data[2].value||1)) ).toFixed(2)}</span></div>
            </li>
          </ul>
        </div>
      )}
    </ChartContainer>
  );
}
