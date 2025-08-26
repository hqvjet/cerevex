"use client";
import Protected from "@/components/auth/Protected";
import { ROLES } from "@/lib/auth/roles";
import { useAuth } from "@/lib/auth";
import { useCallback, useEffect, useState } from "react";
import { enterpriseCompanyService, type CompanyCreate, type CompanyOut } from "@/lib/api/enterpriseCompanyService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/layout/DashboardShell";
function fmt(dt: string | Date | null | undefined) {
  if (!dt) return "";
  const d = typeof dt === "string" ? new Date(dt) : dt;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CongTyCuaToiPage() {
  const { user } = useAuth();
  const companyId = user?.company_id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [company, setCompany] = useState<CompanyOut | null>(null);
  const [form, setForm] = useState<Partial<CompanyCreate>>({});

  const dirty = JSON.stringify({
    company_name: form.company_name ?? company?.company_name,
    tax_code: form.tax_code ?? company?.tax_code,
    province: form.province ?? company?.province,
    hotline: form.hotline ?? company?.hotline,
    company_email: form.company_email ?? company?.company_email,
    address: form.address ?? company?.address,
    industry_type: form.industry_type ?? company?.industry_type,
  }) !== JSON.stringify({
    company_name: company?.company_name,
    tax_code: company?.tax_code,
    province: company?.province,
    hotline: company?.hotline,
    company_email: company?.company_email,
    address: company?.address,
    industry_type: company?.industry_type,
  });

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const c = await enterpriseCompanyService.get(companyId);
      setCompany(c);
      setForm({});
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Không tải được dữ liệu công ty";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  function update<K extends keyof CompanyCreate>(k: K, v: CompanyCreate[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId || !dirty) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await enterpriseCompanyService.update(companyId, form);
      setCompany(updated);
      setForm({});
      setSavedAt(new Date().toISOString());
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Lưu thất bại";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
  <Protected allow={(roles) => roles.includes(ROLES.COMPANY_ADMIN) || roles.includes(ROLES.SYSTEM_ADMIN) || roles.includes(ROLES.ADMIN)}>
    <DashboardShell>
    <main className="max-w-5xl mx-auto p-6 space-y-10">
        <header>
      <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">Công ty của tôi</h1>
      <p className="text-slate-600 text-sm">Quản lý cấu hình & thông tin nhận diện doanh nghiệp.</p>
        </header>
        {!companyId && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">Bạn chưa gắn với công ty nào.</div>
        )}
        {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {company && (
          <form onSubmit={save} className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-8 space-y-8 shadow-sm">
              <div className="relative">
                <h2 className="text-xl font-semibold tracking-tight">Thông tin cơ bản</h2>
                <p className="text-xs text-slate-500 mt-1">Những trường quan trọng để định danh và tích hợp.</p>
              </div>
              <div className="relative grid gap-6 md:grid-cols-2">
                <Field label="Tên công ty">
                  <Input value={form.company_name ?? company.company_name} onChange={e => update("company_name", e.target.value)} required />
                </Field>
                <Field label="Mã số thuế">
                  <Input value={form.tax_code ?? company.tax_code} onChange={e => update("tax_code", e.target.value)} required />
                </Field>
                <Field label="Tỉnh/Thành phố">
                  <Input value={form.province ?? company.province} onChange={e => update("province", e.target.value)} required />
                </Field>
                <Field label="Hotline">
                  <Input value={form.hotline ?? company.hotline} onChange={e => update("hotline", e.target.value)} required />
                </Field>
                <Field label="Email công ty">
                  <Input type="email" value={form.company_email ?? company.company_email} onChange={e => update("company_email", e.target.value)} required />
                </Field>
                <Field label="Ngành">
                  <Input value={form.industry_type ?? company.industry_type} onChange={e => update("industry_type", e.target.value)} required />
                </Field>
                <Field label="Địa chỉ" full>
                  <Input value={form.address ?? company.address} onChange={e => update("address", e.target.value)} required />
                </Field>
              </div>
              <div className="relative space-y-4 pt-2">
                <div className="text-[11px] text-slate-500 flex flex-wrap gap-4">
                  <span>ID: <code className="font-mono">{company.company_id}</code></span>
                  {company.registered_at && <span>Đăng ký: {fmt(company.registered_at)}</span>}
                  {savedAt && <span>Đã lưu: {fmt(savedAt)}</span>}
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={!dirty || saving}>{saving ? "Đang lưu..." : dirty ? "Lưu thay đổi" : "Đã lưu"}</Button>
                  <Button type="button" variant="secondary" disabled={saving || !dirty} onClick={() => setForm({})}>Huỷ</Button>
                  <Button type="button" variant="secondary" disabled={loading} onClick={load}>Tải lại</Button>
                </div>
              </div>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm p-6 space-y-4 text-sm text-slate-600 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.08)]">
              <h2 className="text-sm font-semibold text-slate-800">Ghi chú</h2>
              <ul className="list-disc list-inside space-y-1 marker:text-blue-500">
                <li>Các thay đổi áp dụng ngay trên toàn hệ thống.</li>
                <li>Đảm bảo mã số thuế & email chính xác để tích hợp bên thứ ba.</li>
                <li>Trường ngành giúp nâng cấp phân tích sâu trong tương lai.</li>
              </ul>
            </section>
          </form>
        )}
        {loading && <div className="text-sm text-slate-500">Đang tải...</div>}
      </main>
      </DashboardShell>
    </Protected>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={full ? "md:col-span-2 space-y-1" : "space-y-1"}>
      <span className="block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
