"use client";
import { useEffect, useState } from "react";
import { ChartContainer, ChartHeader } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";

interface SentimentSlice { label: string; value: number; color: string; }

async function fetchProductSentiment(productId: string | null): Promise<SentimentSlice[] | null> {
  if (!productId) return null;
  await new Promise(r => setTimeout(r, 250));
  // mock different distributions
  const base = {
    p1: [430, 120, 210],
    p2: [120, 260, 340],
    p3: [800, 300, 100],
  } as const;
  const pick = base[productId as keyof typeof base] ?? [0,0,0];
  return [
    { label: "Tích cực", value: pick[0], color: "#7AD9B3" },
    { label: "Trung tính", value: pick[1], color: "#FFD66B" },
    { label: "Tiêu cực", value: pick[2], color: "#FFAEA5" },
  ];
}

export default function ProductSentiment360({ productId }: { productId: string | null }) {
  const [data, setData] = useState<SentimentSlice[] | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    fetchProductSentiment(productId).then(d => { setData(d); setLoading(false); });
  }, [productId]);
  const total = data?.reduce((s, d) => s + d.value, 0) ?? 0;
  return (
    <ChartContainer>
      <ChartHeader title="Cảm xúc sản phẩm" subtitle={productId ? `Product: ${productId}` : "Chưa chọn sản phẩm"} />
      {!productId ? (
        <div className="p-6 text-sm text-slate-500">Hãy chọn 1 sản phẩm để xem chi tiết.</div>
      ) : loading ? (
        <div className="p-6 text-sm text-slate-500">Đang tải dữ liệu...</div>
      ) : !data ? (
        <div className="p-6 text-sm text-slate-500">Không có dữ liệu.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <ul className="space-y-2 md:col-span-1">
            {data.map(d => {
              const pct = total ? Math.round((d.value / total) * 100) : 0;
              return (
                <li key={d.label} className="flex items-center gap-3">
                  <span className="inline-flex size-3 rounded" style={{ backgroundColor: d.color }} />
                  <span className="text-sm font-medium text-slate-700">{d.label}</span>
                  <Badge variant="secondary">{d.value}</Badge>
                  <span className="ml-auto text-xs text-slate-500">{pct}%</span>
                </li>
              );
            })}
            <li className="flex justify-between pt-2 border-t text-sm font-medium">
              <span>Tổng</span>
              <span>{total}</span>
            </li>
          </ul>
          <div className="md:col-span-2 flex items-center justify-center min-h-[240px] text-slate-400 text-sm">
            (Biểu đồ tròn / timeline cảm xúc theo thời gian - TODO)
          </div>
        </div>
      )}
    </ChartContainer>
  );
}
