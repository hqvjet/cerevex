"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthShell from "@/components/auth/AuthShell";
import { useAuth } from "@/lib/auth/auth-context";

export default function SignIn() {
  const router = useRouter();
  const { signin, status, initialized } = useAuth();
  useEffect(() => {
    if (!initialized) return;
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, initialized, router]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signin(email, password);
    } catch (err: any) {
      const msg = err?.detail || err?.message || "Đăng nhập thất bại";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={<>Chào mừng trở lại</>}
      subtitle="Đăng nhập để tiếp tục quản lý và phân tích dữ liệu cảm xúc."
      cta={<Link href="/signup" className="text-blue-600 hover:underline text-sm">Chưa có tài khoản? Đăng ký</Link>}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <Input type="email" placeholder="you@example.com" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
          <Input type="password" placeholder="••••••••" aria-label="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button className="w-full h-11 text-base" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
        <div className="text-center">
          <Link href="#" className="text-sm text-blue-600 hover:underline">Quên mật khẩu?</Link>
        </div>
      </form>
    </AuthShell>
  );
}
