"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthShell from "@/components/auth/AuthShell";
import { useAuth } from "@/lib/auth/auth-context";

export default function SignUp() {
  const router = useRouter();
  const { signup, status, initialized } = useAuth();
  useEffect(() => {
    if (!initialized) return;
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, initialized, router]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function errorMessage(err: unknown): string {
    if (err && typeof err === "object") {
      const obj = err as { detail?: unknown; message?: unknown };
      const detail = typeof obj.detail === "string" ? obj.detail : undefined;
      const message = typeof obj.message === "string" ? obj.message : undefined;
      return String(detail ?? message ?? "Đăng ký thất bại");
    }
    return "Đăng ký thất bại";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Mật khẩu không trùng khớp");
      return;
    }
    setLoading(true);
    try {
      await signup(email, password);
      router.push("/signin");
    } catch (err: unknown) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={<>Tạo tài khoản Cerevex</>}
      subtitle="Miễn phí và luôn như vậy — bắt đầu từ vài giây."
      cta={<Link href="/signin" className="text-blue-600 hover:underline text-sm">Đã có tài khoản? Đăng nhập</Link>}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <Input type="email" placeholder="you@example.com" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
            <Input type="password" placeholder="••••••••" aria-label="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Nhập lại mật khẩu</label>
            <Input type="password" placeholder="••••••••" aria-label="Nhập lại mật khẩu" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button className="w-full h-11 text-base" disabled={loading}>
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </Button>
      </form>
    </AuthShell>
  );
}
