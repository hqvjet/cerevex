import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

type Person = {
  name: string;
  role: string; // Cố Vấn | Sinh Viên
  img: string;
  email?: string;
  affiliation?: string; // dòng mô tả thêm
};

const UNI = "Trường Đại Học Công Nghệ Thông Tin và Truyền Thông Việt - Hàn";

const people: Person[] = [
  {
    name: "Ts. Đặng Đại Thọ",
  role: "Cố Vấn",
    img: "/assets/images/dr_dang_dai_tho.png",
    email: "ddtho@vku.udn.vn",
  affiliation: `Giảng Viên tại ${UNI}`,
  },
  {
    name: "Ts. Nguyễn Thị Thanh Huyền",
  role: "Cố Vấn",
    img: "/assets/images/dr_nguyen_thi_thanh_huyen.png",
    email: "ntthuyen@vku.udn.vn",
  affiliation: `Giảng Viên tại ${UNI}`,
  },
  {
    name: "Mai Nguyễn Xuân Thảo",
  role: "Sinh Viên",
    img: "/assets/images/ms_mai_nguyen_xuan_thao.png",
    email: "thaomnx.20ad@vku.udn.vn",
  affiliation: `Sinh Viên tại ${UNI}`,
  },
  {
    name: "Hoàng Quốc Việt",
  role: "Sinh Viên",
    img: "/assets/images/mr_hoang_quoc_viet.png",
    email: "vietdq.21it@vku.udn.vn",
  affiliation: `Sinh Viên tại ${UNI}`,
  },
  {
    name: "Trần Phạm Song Nguyên",
  role: "Sinh Viên",
    img: "/assets/images/ms_tran_pham_song_nguyen.png",
    email: "nguyen.tps.20ad@vku.udn.vn",
  affiliation: `Sinh Viên tại ${UNI}`,
  },
  {
    name: "Nguyễn Cửu Kim Anh",
  role: "Sinh Viên",
    img: "/assets/images/ms_nguyen_cuu_kim_anh.png",
    email: "anhnnk.22el@vku.udn.vn",
  affiliation: `Sinh Viên tại ${UNI}`,
  },
];

const advisors = people.filter(p => p.role === "Cố Vấn");
const students = people.filter(p => p.role === "Sinh Viên");

export default function Team() {
  return (
  <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-6xl px-4">
    <h2 className="text-3xl md:text-4xl font-extrabold text-center text-[#0B4AA3] mb-10">Về Chúng Tôi</h2>
        {/* Advisors */}
        <div className="grid gap-6 md:grid-cols-2 mb-12">
          {advisors.map(p => (
            <Card key={p.name} className="relative overflow-hidden text-center bg-white border-[1.5px] border-[#BBD6FF] shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-50/60 via-transparent to-indigo-50/60" />
              <CardContent className="pt-8 relative">
                <div className="relative mx-auto size-36 rounded-full overflow-hidden ring-4 ring-blue-100 shadow">
                  <Image src={p.img} alt={p.name} fill className="object-cover" />
                </div>
                <div className="mt-5">
                  <p className="font-semibold text-lg text-slate-900">{p.name}</p>
                  {p.email && <p className="text-xs text-slate-500 mt-1">{p.email}</p>}
                  {p.affiliation && (
                    <p className="text-xs font-medium text-slate-700 mt-3 leading-relaxed">
                      {p.affiliation}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Students */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {students.map(p => (
            <Card key={p.name} className="text-center bg-white border-[1.5px] border-[#D7E5FF] hover:border-blue-200 transition-colors">
              <CardContent className="pt-6">
                <div className="relative mx-auto size-28 rounded-full overflow-hidden ring-2 ring-blue-100">
                  <Image src={p.img} alt={p.name} fill className="object-cover" />
                </div>
                <div className="mt-4">
                  <p className="font-semibold text-slate-900">{p.name}</p>
                  {p.email && <p className="text-xs text-slate-500 mt-1">{p.email}</p>}
                  {p.affiliation && (
                    <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">{p.affiliation}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
