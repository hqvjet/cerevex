import { DocsLayout } from "@/components/layout/DocsLayout";

export const metadata = { title: "Vai trò & quyền hạn | Hướng dẫn Cerevex" };

// Chỉ liệt kê các hành động quan sát được trong mã nguồn hiện tại.
const roleDetails: Record<string, { name: string; desc: string; actions: string[]; tips?: string } > = {
  SYSTEM_ADMIN: {
    name: "System Admin",
    desc: "Truy cập dashboard hệ thống (placeholder).",
    actions: ["Xem System Dashboard (đang tối giản)"]
  },
  ADMIN: {
    name: "Admin",
    desc: "Chia sẻ phạm vi System Dashboard với System Admin.",
    actions: ["Xem System Dashboard (đang tối giản)"]
  },
  COMPANY_ADMIN: {
    name: "Company Admin",
    desc: "Quản lý sản phẩm & xem cảm xúc mức công ty.",
    actions: ["Xem Company Dashboard", "Đồng bộ bình luận thủ công", "Gỡ sản phẩm khỏi theo dõi"],
    tips: "Dùng nút 'Đồng bộ bình luận' khi cần số liệu mới trước chu kỳ kế tiếp."
  },
  DATA_ANALYST: {
    name: "Data Analyst",
    desc: "Phân tích file đã tải lên & xem lịch sử report.",
    actions: ["Upload & phân tích file", "Xem Data Analyst Dashboard"],
    tips: "Giữ tên file rõ ràng để dễ tra cứu lại report."
  },
  PRODUCT_INSIGHT_ANALYST: {
    name: "Product Insight Analyst",
    desc: "Theo dõi cảm xúc từng sản phẩm & cảnh báo đơn giản.",
    actions: ["Xem Product Dashboard", "Đồng bộ bình luận", "Lọc sản phẩm & xem cảnh báo"],
    tips: "Ưu tiên xử lý sản phẩm có cảnh báo 'Tiêu cực ≥ Tích cực + Trung tính'."
  }
};
export default function GuideRoles() {
  return (
    <DocsLayout current="tong-quan-role">
  <h1>Vai trò & quyền hạn</h1>
  <p>Một người dùng có thể mang nhiều <strong>vai trò</strong> cùng lúc; giao diện sẽ gộp quyền để hiển thị những phần phù hợp.</p>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white/70 backdrop-blur shadow-sm mb-6">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-100/70 text-left text-slate-600">
              <th className="px-4 py-2 font-semibold">Vai trò</th>
              <th className="px-4 py-2 font-semibold">Mô tả ngắn</th>
              <th className="px-4 py-2 font-semibold">Thao tác hiện có</th>
              <th className="px-4 py-2 font-semibold">Gợi ý</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(roleDetails).map(([k, v]) => (
              <tr key={k} className="border-t border-slate-200/70">
                <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{v.name}</td>
                <td className="px-4 py-3 text-slate-600">{v.desc}</td>
                <td className="px-4 py-3 text-slate-600">
                  <ul className="list-disc pl-5 space-y-1">
                    {v.actions.map(a => <li key={a}>{a}</li>)}
                  </ul>
                </td>
                <td className="px-4 py-3 text-blue-700 text-xs max-w-[180px]">{v.tips}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
        <strong>Lưu ý:</strong> Chỉ liệt kê hành động xuất hiện trong mã hiện tại. Tính năng chưa có sẽ không được nêu.
      </div>
    </DocsLayout>
  );
}
