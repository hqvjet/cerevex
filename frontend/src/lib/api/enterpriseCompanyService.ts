import { httpDirect as http } from "./client";

// Mirror enterprise-service/app/schemas.py CompanyCreate & CompanyOut
export interface CompanyCreate {
  company_name: string;
  tax_code: string;
  province: string;
  hotline: string;
  company_email: string;
  address: string;
  industry_type: string;
  registered_at?: string | null; // ISO datetime
}

export interface CompanyOut extends CompanyCreate {
  company_id: string;
}

function enterpriseBase() {
  return "/enterprise"; // service mounted prefix
}

export const enterpriseCompanyService = {
  create: (payload: CompanyCreate) =>
    http.post<CompanyOut, CompanyCreate>(`${enterpriseBase()}/companies`, payload),
  get: (companyId: string) =>
    http.get<CompanyOut>(`${enterpriseBase()}/companies/${encodeURIComponent(companyId)}`),
  update: (companyId: string, partial: Partial<CompanyCreate>) =>
    http.patch<CompanyOut, Partial<CompanyCreate>>(`${enterpriseBase()}/companies/${encodeURIComponent(companyId)}`, partial),
};
