import { httpDirect as http } from "./client";

export interface EnterpriseProduct {
  product_id: string;
  company_id: string;
  product_name: string;
  third_party_id: string;
  num_positive: number;
  num_neutral: number;
  num_negative: number;
  short_summary: string;
  added_at?: string | null;
}

export interface SyncResultProduct {
  third_party_id: string;
  action: "created" | "updated" | "skipped" | "error";
  product_id?: string;
  new_counts?: Record<string, number>;
  reason?: string;
}

export interface SyncResponse {
  company_id: string;
  new_products_created: number;
  updated_products: number;
  skipped_products: number;
  errors: number;
  details: SyncResultProduct[];
  synced_at: string;
}

function enterpriseBase() {
  // Expect NEXT_PUBLIC_API_URL points to gateway; enterprise service mounted under /enterprise
  return "/enterprise"; // rely on httpDirect base or absolute override
}

function thirdPartyBase() {
  // Third-party service prefix
  return "/third-party";
}

export const enterpriseService = {
  listProducts: async (companyId: string) => {
    return http.get<EnterpriseProduct[]>(`${enterpriseBase()}/companies/${encodeURIComponent(companyId)}/products`);
  },
  createProduct: async (companyId: string, payload: {
    product_name: string;
    third_party_id: string;
    short_summary: string;
    num_positive?: number;
    num_neutral?: number;
    num_negative?: number;
    added_at?: string | null;
  }) => {
    return http.post<EnterpriseProduct>(`${enterpriseBase()}/companies/${encodeURIComponent(companyId)}/products`, {
      num_positive: 0,
      num_neutral: 0,
      num_negative: 0,
      added_at: new Date().toISOString(),
      ...payload,
    });
  },
  removeProduct: async (companyId: string, productId: string) => {
    return http.delete<void>(`${enterpriseBase()}/companies/${encodeURIComponent(companyId)}/products/${encodeURIComponent(productId)}`);
  },
  sync: async (): Promise<SyncResponse> => {
    return http.post<SyncResponse>(`${thirdPartyBase()}/sync`);
  },
  sentimentSummary: async (companyId: string) => {
    return http.get<{ num_positive: number; num_neutral: number; num_negative: number; product_count: number }>(`${enterpriseBase()}/companies/${encodeURIComponent(companyId)}/sentiment-summary`);
  }
};
