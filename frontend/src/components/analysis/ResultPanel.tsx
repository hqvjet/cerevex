import React from "react";
import type { SentimentResult } from "@/lib/api/analysisService";

export function ResultPanel({ result }: { result: SentimentResult | null }) {
  if (!result) return null;

  const color =
    result.label === "positive" ? "text-green-700 bg-green-50 border-green-200" :
    result.label === "negative" ? "text-red-700 bg-red-50 border-red-200" :
    "text-slate-700 bg-slate-50 border-slate-200";

  const labelVi =
    result.label === "positive" ? "Cảm xúc Tích Cực" :
    result.label === "negative" ? "Cảm xúc Tiêu Cực" :
    "Cảm xúc Trung Lập";

  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{labelVi}</h3>
        <span className="text-sm">Độ tin cậy: {(result.score * 100).toFixed(1)}%</span>
      </div>
      {result.reasons && result.reasons.length > 0 && (
        <ul className="mt-3 list-disc pl-6 text-sm">
          {result.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
