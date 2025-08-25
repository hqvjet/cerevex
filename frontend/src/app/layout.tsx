import type { Metadata } from "next";
import { Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import AuthGate from "../components/auth/AuthGate";
import Navbar from "@/components/sections/Navbar";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: [
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
  ],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cerevex — Trí tuệ cảm xúc cho ngành dịch vụ Việt",
  description:
    "Nền tảng phân tích cảm xúc tiếng Việt chính xác, nhanh và tiết kiệm cho doanh nghiệp dịch vụ.",
  icons: {
  icon: "/favicon.ico",
  shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html lang="vi">
      <body
  className={`${montserrat.variable} ${geistMono.variable} antialiased bg-white text-slate-900`}
      >
        <AuthProvider>
          <AuthGate>
            <Navbar />
            {children}
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
