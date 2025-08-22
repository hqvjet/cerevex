import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

const people = [
  { name: "Ts. Đặng Đại Thọ", role: "Cố vấn", img: "/assets/images/dr_dang_dai_tho.png", email: "ddtho@vku.udn.vn" },
  { name: "Mai Nguyễn Xuân Thảo", role: "Sinh viên", img: "/assets/images/ms_mai_nguyen_xuan_thao.png", email: "thaomnx.20qk@vku.udn.vn" },
  { name: "Hoàng Quốc Việt", role: "Sinh viên", img: "/assets/images/mr_hoang_quoc_viet.png", email: "vietdq.21it@vku.udn.vn" },
  { name: "Trần Phạm Song Nguyên", role: "Sinh viên", img: "/assets/images/ms_tran_pham_song_nguyen.png", email: "nguyen.tps.20qk@vku.udn.vn" },
];

export default function Team() {
  return (
  <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-6xl px-4">
    <h2 className="text-3xl md:text-4xl font-extrabold text-center text-[#0B4AA3] mb-10">Về Chúng Tôi</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {people.map((p) => (
      <Card key={p.name} className="text-center bg-white border-[1.5px] border-[#D7E5FF]">
        <CardContent className="pt-6">
                <div className="relative mx-auto size-28 rounded-full overflow-hidden ring-2 ring-blue-100">
                  <Image src={p.img} alt={p.name} fill className="object-cover" />
                </div>
                <div className="mt-4">
                  <p className="font-semibold text-slate-900">{p.name}</p>
                  <p className="text-sm text-slate-600">{p.role}</p>
                  <p className="text-xs text-slate-500 mt-1">{p.email}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
