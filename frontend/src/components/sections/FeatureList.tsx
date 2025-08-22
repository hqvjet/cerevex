import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Hiểu Ngôn Ngữ Tự Nhiên",
    desc:
      "CEREVEx ứng dụng AI và Xử lý ngôn ngữ tự nhiên (NLP) để hiểu sâu sắc từng câu chữ trong đánh giá, bình luận và phản hồi của khách hàng tiếng Việt.",
    img: "/assets/images/analysis.png",
  },
  {
    title: "Phân Tích Đúng Cảm Xúc",
    desc:
      "Hệ thống nhận diện cảm xúc ẩn sau ngôn ngữ – từ tích cực, tiêu cực đến trung tính – với độ chính xác cao, giúp doanh nghiệp hiểu rõ cảm nhận thật của khách hàng.",
    img: "/assets/images/ai_idea.png",
  },
];

export default function FeatureList() {
  return (
    <section id="features" className="relative py-16 md:py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white to-slate-50" />
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-[#0B4AA3] mb-2">
          Hãy Đến Và Làm Chủ Dữ Liệu Của Bạn
        </h2>
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {features.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <CardTitle className="text-[#0B4AA3]">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-[220px_1fr] gap-6 items-center">
                <div className="relative w-full h-48 md:h-40">
                  <Image src={f.img} alt={f.title} fill className="object-contain" />
                </div>
                <p className="text-slate-700 leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
