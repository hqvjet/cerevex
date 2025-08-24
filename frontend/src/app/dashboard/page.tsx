"use client";
import Image from "next/image";
import Protected from "@/components/auth/Protected";
import { useAuth } from "@/lib/auth";
import { AnalystNavbar } from "@/components/analysis/AnalystNavbar";
import { ROLES, hasAnyRole, parseRoles } from "@/lib/auth/roles";

function StatCard({ label, value, delta, tone }: { label: string; value: string; delta?: string; tone?: "up" | "down" }) {
  const cls = tone === "down" ? "text-red-600" : "text-green-600";
  const sign = tone === "down" ? "▼" : "▲";
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {delta && <div className={`mt-1 text-xs ${cls}`}>{sign} {delta} so với tuần trước</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const roles = parseRoles(user?.role);
  const showAnalystNavbar = hasAnyRole(roles, [
    ROLES.DATA_ANALYSIST,
    ROLES.PRODUCT_INSIGHT_ANALYSIST,
    ROLES.ADMIN,
    ROLES.SYSTEM_ADMIN,
  ]);
  return (
    <Protected>
      {showAnalystNavbar && <AnalystNavbar />}
      {/* Banner matching landing style */}
      <section className="relative overflow-hidden bg-[#0B4AA3] text-white">
        <div className="absolute inset-0">
          <Image src="/assets/images/hero_frame.png" alt="bg" fill className="object-cover opacity-40" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">Bảng điều khiển</h1>
          <p className="text-white/90">Tổng quan nhanh về hiệu quả phân tích và phản hồi khách hàng.</p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* KPI cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Bản ghi phân tích" value="1,264" delta="+8.3%" />
          <StatCard label="Tỉ lệ tích cực" value="62%" delta="+3.1%" />
          <StatCard label="Tỉ lệ tiêu cực" value="18%" delta="-1.2%" tone="down" />
          <StatCard label="Trung lập" value="20%" />
        </div>

        {/* Charts */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="font-semibold">Xu hướng cảm xúc 7 ngày</h3>
            <div className="mt-4 h-48 grid place-items-center text-slate-400 text-sm border rounded-xl bg-slate-50">
              Placeholder biểu đồ đường
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="font-semibold">Phân bổ cảm xúc</h3>
            <div className="mt-4 h-48 grid place-items-center text-slate-400 text-sm border rounded-xl bg-slate-50">
              Placeholder biểu đồ tròn
            </div>
          </div>
        </div>

        {/* Recent */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="font-semibold">Nhận xét gần đây</h3>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="p-3 rounded-xl border bg-slate-50">Dịch vụ rất tuyệt, nhân viên hỗ trợ nhanh. <span className="text-green-700">(Tích cực)</span></li>
              <li className="p-3 rounded-xl border bg-slate-50">Giá hơi cao so với chất lượng. <span className="text-red-700">(Tiêu cực)</span></li>
              <li className="p-3 rounded-xl border bg-slate-50">Sản phẩm ổn, giao hàng đúng thời gian. <span className="text-slate-700">(Trung lập)</span></li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="font-semibold">Top chủ đề</h3>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {['Chất lượng','Giá cả','Dịch vụ','Giao hàng','Trải nghiệm','Bảo hành'].map(t => (
                <span key={t} className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </Protected>
  );
}
