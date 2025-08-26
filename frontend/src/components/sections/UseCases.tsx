import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

const cases = [
  {
    title: "Hiểu Ngôn Ngữ Tự Nhiên",
    desc:
      "CEREVEx ứng dụng AI và Xử lý ngôn ngữ tự nhiên (NLP) để hiểu sâu sắc từng câu chữ trong đánh giá, bình luận và phản hồi của khách hàng tiếng Việt.",
    img: "/assets/images/ai_idea.png",
  },
  {
    title: "Phân Tích Đúng Cảm Xúc",
    desc:
      "Hệ thống nhận diện cảm xúc ẩn sau ngôn ngữ – từ tích cực, tiêu cực đến trung tính – với độ chính xác cao, giúp doanh nghiệp hiểu rõ cảm nhận thật của khách hàng.",
    img: "/assets/images/ai_routing.png",
  },
];

export default function UseCases() {
  return (
    <section className="relative py-16 md:py-24">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/assets/images/academic_publish_background.png"
          alt="pattern"
          fill
          className="object-cover opacity-100"
        />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-[#0B4AA3]">
          Hãy Đến Và Làm Chủ Dữ Liệu Của Bạn
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {cases.map((c) => (
            <Card
              key={c.title}
              className="bg-white border-[1.5px] border-[#D7E5FF] rounded-xl shadow-[0_8px_28px_rgba(25,87,200,0.08)]"
            >
              <CardContent className="pt-6">
                <div className="mx-auto relative h-24 w-full max-w-[140px]">
                  <Image src={c.img} alt={c.title} fill className="object-contain" />
                </div>
                <div className="mt-4 text-center">
                  <CardTitle className="text-[#0B4AA3] mb-2">{c.title}</CardTitle>
                  <p className="text-slate-700 text-sm leading-relaxed">{c.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
