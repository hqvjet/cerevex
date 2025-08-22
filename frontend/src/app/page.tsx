"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import AuthShell from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/auth-context";

export default function Home() {
  const router = useRouter();
  const { signin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function errorMessage(err: unknown): string {
    if (err && typeof err === "object") {
      const obj = err as { detail?: unknown; message?: unknown };
      const detail = typeof obj.detail === "string" ? obj.detail : undefined;
      const message = typeof obj.message === "string" ? obj.message : undefined;
      return String(detail ?? message ?? "Đăng nhập thất bại");
    }
    return "Đăng nhập thất bại";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
  await signin(email, password);
  router.push("/dashboard");
    } catch (err: unknown) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={<>
        Cảm xúc khách hàng,<br /> hiểu đúng để phục vụ tốt hơn
      </>}
      subtitle="Chưa có tài khoản? Đăng ký ngay để bắt đầu phân tích cảm xúc bình luận và phản hồi của khách hàng."
      cta={<Link href="/landing" className="text-blue-600 hover:underline text-sm">Tìm hiểu nền tảng</Link>}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
  <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button className="w-full h-11 text-base" disabled={loading}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</Button>
        <div className="text-center">
          <Link href="#" className="text-sm text-blue-600 hover:underline">Quên mật khẩu?</Link>
        </div>
        <div className="h-px bg-slate-200" />
        <Button asChild variant="secondary" className="w-full h-10 bg-green-600 text-white hover:bg-green-700">
          <Link href="/signup">Tạo tài khoản mới</Link>
        </Button>
      </form>
    </AuthShell>
  );
}
