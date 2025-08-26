"use client";
import Protected from "@/components/auth/Protected";
import { ROLES } from "@/lib/auth/roles";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { userService, type CompanyUserOut } from "@/lib/api/userService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

type Tab = "list" | "create";

export default function QuanLyTaiKhoanPage() {
  return (
    <Protected allow={(roles) => roles.includes(ROLES.COMPANY_ADMIN)}>
      <AdminAccountsScreen />
    </Protected>
  );
}

function AdminAccountsScreen() {
  const [tab, setTab] = useState<Tab>("list");
  return (
  <main className="min-h-[calc(100dvh-72px)] bg-white">
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
  <h1 className="text-3xl font-extrabold tracking-tight text-blue-700">Tài khoản nội bộ</h1>
    <p className="text-slate-500 mt-1">Thêm cộng sự & cấp quyền phân tích để cùng theo dõi khách hàng hiệu quả.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={tab === "list" ? "primary" : "secondary"} onClick={() => setTab("list")}>Danh sách người dùng</Button>
            <Button variant={tab === "create" ? "primary" : "secondary"} onClick={() => setTab("create")}>Tạo mới</Button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-12">
        {tab === "list" ? <UsersList /> : <CreateUserForm onCreated={() => setTab("list")} />}
      </section>
    </main>
  );
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object" && "message" in e && typeof (e as { message?: unknown }).message === "string") {
    return (e as { message: string }).message;
  }
  try { return JSON.stringify(e); } catch { return "Đã xảy ra lỗi"; }
}

function UsersList() {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<CompanyUserOut[]>([]);
  const [confirm, setConfirm] = useState<CompanyUserOut | null>(null);
  const [editing, setEditing] = useState<CompanyUserOut | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await userService.companyUsers.list();
        setUsers(data);
      } catch (e: unknown) {
        setError(getErrorMessage(e) || "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return users;
    return users.filter((u) => u.email.toLowerCase().includes(k) || u.roles.join(",").includes(k));
  }, [q, users]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle>Danh sách thành viên</CardTitle>
          <div className="w-full sm:w-80">
            <Input placeholder="Tìm nhanh theo email hoặc vai trò..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner size={22} /><span className="ml-2 text-slate-600">Đang tải...</span></div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-500">Chưa có thành viên nào trong công ty.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Vai trò</th>
                  <th className="py-3 pr-4">Tạo lúc</th>
                  <th className="py-3 pr-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isSelf = (authUser?.user_id && u.user_id === authUser.user_id) || (authUser?.email && u.email === authUser.email);
                  return (
                    <tr
                      key={u.user_id}
                      className={`border-b last:border-0 ${isSelf ? "bg-blue-50/50" : ""}`}
                    >
                      <td className="py-3 pr-4 font-medium">
                        <div className="flex items-center gap-2">
                          <span>{u.email}</span>
                          {isSelf && (
                            <span className="inline-flex items-center rounded-full bg-blue-600/90 text-white px-2 py-0.5 text-[10px] uppercase tracking-wide">Bạn</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-2">
                        {u.roles.map((r) => {
                          const role = r as string;
                          const style = role === "company_admin"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : role === "data_analyst"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : role === "product_insight_analyst"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-700 border-slate-200";
                          const label = role === "company_admin" ? "Company Administrator"
                            : role === "data_analyst" ? "Data Analyst"
                            : role === "product_insight_analyst" ? "Product Insight Analyst"
                            : "User";
                          return (
                            <span key={role} className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${style}`}>
                              {label}
                            </span>
                          );
                        })}
                      </div>
                      </td>
                      <td className="py-3 pr-4 text-slate-500">{new Date(u.created_at).toLocaleString()}</td>
                      <td className="py-3 pr-0">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setEditing(u)}>Sửa quyền</Button>
                        <Button variant="outline" size="sm" onClick={() => setConfirm(u)}>Gỡ khỏi công ty</Button>
                      </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Confirm remove */}
      <Dialog open={!!confirm} onClose={() => setConfirm(null)}>
  <DialogHeader title="Gỡ người dùng khỏi công ty" description="Thành viên sẽ bị xoá khỏi công ty và trở về quyền 'user'." />
        <DialogBody>
          <p>
            Bạn muốn gỡ <strong>{confirm?.email}</strong> khỏi công ty? Thao tác này có thể hoàn tác bằng cách mời lại.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setConfirm(null)}>Hủy</Button>
          <Button
            onClick={async () => {
              if (!confirm) return;
              setSaving(true);
              try {
                await userService.companyUsers.remove(confirm.user_id);
                setUsers((prev) => prev.filter((x) => x.user_id !== confirm.user_id));
                setConfirm(null);
              } catch (e: unknown) {
                alert(getErrorMessage(e) || "Không thể xóa");
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
          >
            {saving ? <Spinner /> : "Đồng ý"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit roles */}
      <EditRolesDialog
        user={editing}
        onClose={() => setEditing(null)}
        onSaved={(updated) => {
          setUsers((prev) => prev.map((x) => (x.user_id === updated.user_id ? updated : x)));
          setEditing(null);
        }}
      />
    </Card>
  );
}

function EditRolesDialog({ user, onClose, onSaved }: { user: CompanyUserOut | null; onClose: () => void; onSaved: (u: CompanyUserOut) => void }) {
  const open = !!user;
  const [roles, setRoles] = useState<string[]>(user?.roles ?? []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRoles(user?.roles ?? []);
  }, [user]);

  const toggle = (r: string) => {
    setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  };

  // Only allow editing analyst roles (data & product insight). company_admin is immutable here.
  const roleOptions: { value: string; label: string }[] = [
    { value: "data_analyst", label: "Data Analyst" },
    { value: "product_insight_analyst", label: "Product Insight Analyst" },
  ];

  return (
    <Dialog open={open} onClose={onClose}>
  <DialogHeader title="Cập nhật quyền phân tích" description={user?.email} />
      <DialogBody>
        <div className="grid grid-cols-1 gap-2">
          {roleOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={roles.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-slate-700">{opt.label}</span>
            </label>
          ))}
          {user?.roles.includes("company_admin") && (
            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
              <span className="inline-flex items-center rounded-full bg-indigo-600 text-white px-2 py-0.5 text-[10px] font-semibold">company_admin</span>
              <span>Quyền quản trị không thể chỉnh tại đây.</span>
            </div>
          )}
        </div>
  <p className="text-xs text-slate-500 mt-3">Chỉ thêm hoặc bỏ hai quyền phân tích. Quyền quản trị (company_admin) cố định để đảm bảo an toàn.</p>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>Đóng</Button>
        <Button
          onClick={async () => {
            if (!user) return;
            setSaving(true);
            try {
              const updated = await userService.companyUsers.updateRoles(user.user_id, { roles });
              onSaved(updated);
            } catch (e: unknown) {
              alert(getErrorMessage(e) || "Không thể cập nhật vai trò");
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
        >
          {saving ? <Spinner /> : "Lưu"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

function CreateUserForm({ onCreated }: { onCreated: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (r: string) => setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  // Only allow assigning analyst roles here (company_admin creation bị giới hạn UI)
  const roleOptions: { value: string; label: string }[] = [
    { value: "data_analyst", label: "Data Analyst" },
    { value: "product_insight_analyst", label: "Product Insight Analyst" },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="relative">
        <CardHeader>
          <CardTitle>Thêm thành viên mới</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div> : null}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Email</label>
              <Input type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Mật khẩu tạm (tự gửi cho thành viên)</label>
              <Input type="text" placeholder="Ít nhất 8 ký tự" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chọn quyền phân tích</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            {roleOptions.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" checked={roles.includes(opt.value)} onChange={() => toggle(opt.value)} className="h-4 w-4" />
                <span className="text-sm font-medium text-slate-700">{opt.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">Không thể cấp quyền quản trị tại đây. Chỉ chọn quyền phân tích cần thiết.</p>
          <div className="flex justify-end mt-6">
            <Button
              onClick={async () => {
                setSaving(true);
                setError(null);
                try {
                  await userService.companyUsers.create({ email, password, roles });
                  onCreated();
                } catch (e: unknown) {
                  setError(getErrorMessage(e) || "Không thể tạo người dùng");
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving || !email || !password}
            >
              {saving ? <Spinner /> : "Tạo thành viên"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

