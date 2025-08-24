import { httpDirect as http } from "./client";

export type SentimentLabel = "positive" | "negative" | "neutral";

export interface SentimentResult {
  label: SentimentLabel;
  score: number; // 0..1 confidence
  reasons?: string[];
}

export interface AnalyzeTextRequest {
  text: string;
  language?: "vi" | "en";
}

export interface AnalyzeTextResponse {
  result: SentimentResult;
}

// Try backend first; if it fails, use a tiny client-side heuristic as fallback.
function heuristicAnalyze(text: string): SentimentResult {
  const t = text.toLowerCase();
  const posWords = ["tuyệt", "hài lòng", "tốt", "yêu", "đẹp", "ok", "ổn", "nhanh", "rẻ", "cảm ơn"];
  const negWords = ["tệ", "chán", "ghét", "xấu", "chậm", "đắt", "bực", "không hài lòng", "lỗi", "kém"];
  let pos = 0;
  let neg = 0;
  for (const w of posWords) if (t.includes(w)) pos += 1;
  for (const w of negWords) if (t.includes(w)) neg += 1;
  if (pos === 0 && neg === 0) return { label: "neutral", score: 0.5 };
  if (pos > neg) return { label: "positive", score: Math.min(0.4 + (pos - neg) * 0.15, 0.95) };
  if (neg > pos) return { label: "negative", score: Math.min(0.4 + (neg - pos) * 0.15, 0.95) };
  return { label: "neutral", score: 0.5 };
}

export const analysisService = {
  analyzeText: async (payload: AnalyzeTextRequest): Promise<AnalyzeTextResponse> => {
    try {
      // Optional text endpoint; will fallback to heuristic if not available
      const data = await http.post<AnalyzeTextResponse, AnalyzeTextRequest>("/analyze/text", payload);
      return data;
    } catch {
      return { result: heuristicAnalyze(payload.text) };
    }
  },
  // --- OpenAPI-based endpoints ---
  // Calls always use /analyze/*; client decides base (/api or NEXT_PUBLIC_API_URL)
  analyzeFiles: async (files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
  return http.post<FileAnalysisResult, FormData>(`/analyze/files`, form);
  },
  analyzeComments: async (payload: CommentsPayload) => {
  return http.post<CommentsAnalysisResult, CommentsPayload>(`/analyze/comments`, payload);
  },
  productInsights: async (payload: CommentsPayload) => {
  return http.post<ProductInsight, CommentsPayload>(`/analyze/product-insights`, payload);
  },
};

// ===== OpenAPI Types =====
export interface CommentItem {
  content: string;
  title?: string | null;
}

export interface CommentsPayload {
  comments: CommentItem[];
}

export interface CommentsAnalysisResult {
  total: number;
  avg_content_len: number;
  label_distribution: Record<string, number>;
  labels: string[];
}

export interface FileAnalysisResult {
  total_rows: number;
  with_title: number;
  without_title: number;
  avg_content_len: number;
  label_distribution: Record<string, number>;
  items: Array<{
    content: string;
    title?: string | null;
    label: string;
  }>;
}

export interface ProductInsight {
  summary: string;
  buy_recommendation: string;
  confidence: number;
  top_positive_examples?: string[];
  top_negative_examples?: string[];
  label_distribution: Record<string, number>;
}
