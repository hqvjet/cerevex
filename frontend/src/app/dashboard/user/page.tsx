"use client";
import Protected from "@/components/auth/Protected";
import { ROLES } from "@/lib/auth/roles";
import { useAuth } from "@/lib/auth";
import { useState, useEffect, useMemo } from "react";
import { enterpriseCompanyService, type CompanyCreate } from "@/lib/api/enterpriseCompanyService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { parseRoles, ROLES as ROLE_MAP } from "@/lib/auth/roles";

export default function BasicUserDashboard() {
  const { user, refreshMe } = useAuth();
  const router = useRouter();
  const [openForm, setOpenForm] = useState(true); // show by default if no company
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<CompanyCreate>({
    company_name: "",
    tax_code: "",
    province: "",
    hotline: "",
    company_email: user?.email || "",
    address: "",
    industry_type: "",
    registered_at: new Date().toISOString(),
  });

  // Field-level validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});

  function validateField(key: keyof CompanyCreate, value: string): string | null {
    switch (key) {
      case "company_name":
        if (!value.trim()) return "Tên công ty bắt buộc";
        if (value.length < 3) return "Tên quá ngắn";
        return null;
      case "tax_code":
        if (!/^[0-9]{10,13}$/.test(value)) return "Mã số thuế phải 10-13 chữ số";
        return null;
      case "hotline":
        if (!/^[0-9\s+()-]{8,20}$/.test(value)) return "Hotline không hợp lệ";
        return null;
      case "company_email":
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return "Email không hợp lệ";
        return null;
      case "province":
        if (!value.trim()) return "Bắt buộc";
        return null;
      case "address":
        if (!value.trim()) return "Bắt buộc";
        return null;
      case "industry_type":
        if (!value.trim()) return "Bắt buộc";
        return null;
      default:
        return null;
    }
  }

  function update<K extends keyof CompanyCreate>(k: K, v: CompanyCreate[K]) {
    setForm(f => ({ ...f, [k]: v }));
    if (typeof v === "string") {
      setFieldErrors(fe => ({ ...fe, [k]: validateField(k, v) }));
    }
  }

  const formValid = useMemo(() => {
    // Trigger validation for required fields
    const keys: (keyof CompanyCreate)[] = ["company_name","tax_code","province","hotline","company_email","address","industry_type"];
    return keys.every(k => {
      const val = form[k] as string;
      const err = validateField(k, val);
      return !err;
    });
  }, [form]);

  // Redirect if role escalated
  useEffect(() => {
    if (!user) return;
    const roles = parseRoles(user.role);
    if (user.company_id && roles.includes(ROLE_MAP.COMPANY_ADMIN)) {
      router.replace("/dashboard/company");
    }
  }, [user, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await enterpriseCompanyService.create(form);
      await refreshMe(); // user now has company_id & elevated role (expected backend to upgrade role?)
      setSuccess("Tạo công ty thành công. Đang làm mới thông tin người dùng...");
      setOpenForm(false);
    } catch (err: unknown) {
      let detail: string;
      if (err && typeof err === 'object' && 'detail' in err) {
        const d = (err as { detail?: unknown }).detail;
        detail = typeof d === 'string' ? d : 'Tạo công ty thất bại';
      } else if (err instanceof Error) {
        detail = err.message;
      } else {
        detail = 'Tạo công ty thất bại';
      }
      setError(detail);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Protected allow={roles => roles.includes(ROLES.USER)}>
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">User Dashboard</h1>
        {!user?.company_id && (
          <>
            <p className="text-sm text-slate-500">Bạn hiện chưa thuộc công ty nào. Tạo công ty để bắt đầu sử dụng đầy đủ tính năng.</p>
            <div className="rounded-xl border bg-white p-6 text-sm text-slate-600 space-y-2">
              <p>- Tạo công ty mới để trở thành Company Admin.</p>
              <p>- Sau đó bạn có thể mời Data Analyst và Product Insight Analyst.</p>
            </div>
            {openForm && (
              <form onSubmit={submit} className="mt-4 space-y-4 rounded-xl border bg-white p-6 relative">
                <h2 className="text-lg font-semibold">Tạo công ty</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">Tên công ty</label>
                    <Input value={form.company_name} onChange={e => update("company_name", e.target.value)} required placeholder="VD: Công ty TNHH ABC" />
                    {fieldErrors.company_name && <p className="text-xs text-red-600">{fieldErrors.company_name}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">Mã số thuế</label>
                    <Input value={form.tax_code} onChange={e => update("tax_code", e.target.value)} required placeholder="0101234567" />
                    {fieldErrors.tax_code && <p className="text-xs text-red-600">{fieldErrors.tax_code}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">Tỉnh/Thành phố</label>
                    <Input value={form.province} onChange={e => update("province", e.target.value)} required placeholder="Hà Nội" />
                    {fieldErrors.province && <p className="text-xs text-red-600">{fieldErrors.province}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">Hotline</label>
                    <Input value={form.hotline} onChange={e => update("hotline", e.target.value)} required placeholder="0981 234 567" />
                    {fieldErrors.hotline && <p className="text-xs text-red-600">{fieldErrors.hotline}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">Email công ty</label>
                    <Input type="email" value={form.company_email} onChange={e => update("company_email", e.target.value)} required placeholder="contact@company.vn" />
                    {fieldErrors.company_email && <p className="text-xs text-red-600">{fieldErrors.company_email}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">Ngành</label>
                    <Input value={form.industry_type} onChange={e => update("industry_type", e.target.value)} required placeholder="Thương mại điện tử" />
                    {fieldErrors.industry_type && <p className="text-xs text-red-600">{fieldErrors.industry_type}</p>}
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-xs font-medium text-slate-600">Địa chỉ</label>
                    <Input value={form.address} onChange={e => update("address", e.target.value)} required placeholder="Số 1 Tràng Tiền, Hoàn Kiếm" />
                    {fieldErrors.address && <p className="text-xs text-red-600">{fieldErrors.address}</p>}
                  </div>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}
                <div className="flex gap-3">
                  <Button type="submit" disabled={loading || !formValid}>{loading ? "Đang tạo..." : "Tạo công ty"}</Button>
                  <Button type="button" variant="secondary" onClick={() => setOpenForm(false)}>Huỷ</Button>
                </div>
                <p className="text-xs text-slate-400">Sau khi tạo thành công bạn sẽ được nâng quyền thành company_admin.</p>
                {loading && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
                    <div className="h-8 w-8 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" />
                    <p className="mt-2 text-xs text-slate-600">Đang xử lý...</p>
                  </div>
                )}
              </form>
            )}
          </>
        )}
        {user?.company_id && (
          <div className="rounded-xl border bg-green-50 p-6 text-sm text-green-700">
            Bạn đã thuộc công ty với ID: <span className="font-mono font-semibold">{user.company_id}</span>. {parseRoles(user.role).includes(ROLE_MAP.COMPANY_ADMIN) ? (
              <Button size="sm" className="ml-2" onClick={() => router.replace("/dashboard/company")}>Đi tới Company Dashboard</Button>
            ) : (
              <span className="ml-1">(Chờ hệ thống nâng quyền company_admin...)</span>
            )}
          </div>
        )}
      </main>
    </Protected>
  );
}
