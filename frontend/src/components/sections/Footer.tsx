"use client";
import Image from "next/image";
import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand + Social */}
            <div>
              <Image src="/assets/icons/logo.png" alt="Cerevex" width={140} height={34} />
              <p className="mt-6 text-sm text-slate-600 max-w-xs">Phân tích chuẩn - Hành động đúng</p>
              <p className="mt-6 text-xs text-slate-500">Copyright © 2025 Cerevex<br/>Tất cả các quyền được bảo lưu</p>
              <div className="mt-6 flex gap-3">
                {['ig','x','tw','yt'].map((k) => (
                  <button key={k} aria-label={k} className="size-8 grid place-items-center rounded-full border border-slate-200 text-blue-600 hover:bg-blue-50 transition-colors">
                    <span className="text-[11px] font-semibold">{k.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>
          {/* Company */}
          <div>
            <h4 className="font-semibold text-slate-900">Công Ty</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li><a href="#ve-chung-toi" className="hover:text-blue-600">Về chúng tôi</a></li>
              <li><a href="#bang-gia" className="hover:text-blue-600">Bảng giá</a></li>
              <li><a href="#chuong-trinh" className="hover:text-blue-600">Chương trình</a></li>
            </ul>
          </div>
          {/* Support */}
          <div>
            <h4 className="font-semibold text-slate-900">Hỗ Trợ</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li><a href="#tro-giup" className="hover:text-blue-600">Trung tâm trợ giúp</a></li>
              <li><a href="#dieu-khoan" className="hover:text-blue-600">Điều khoản dịch vụ</a></li>
              <li><a href="#phap-ly" className="hover:text-blue-600">Pháp lý</a></li>
              <li><a href="#bao-mat" className="hover:text-blue-600">Chính sách bảo mật</a></li>
              <li><a href="#trang-thai" className="hover:text-blue-600">Trạng thái hệ thống</a></li>
            </ul>
          </div>
          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-slate-900">Nhận Thông Tin Mới</h4>
            <p className="mt-4 text-sm text-slate-600">Cập nhật tính năng & nghiên cứu mới qua email.</p>
            <form className="mt-5 flex items-center gap-2" onSubmit={(e)=>e.preventDefault()}>
              <div className="relative flex-1">
                <input type="email" required placeholder="Địa chỉ email" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <Mail className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              </div>
              <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">Gửi</button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
}
