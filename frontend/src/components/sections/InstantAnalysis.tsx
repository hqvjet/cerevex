import Image from "next/image";

const bullets = [
  "Tốc độ cao hơn các giải pháp dùng LLM",
  "Độ chính xác tương đối cao",
  "Có khả năng hiểu biểu tượng cảm xúc",
  "Có thể kết hợp cả tiêu đề trong bình luận",
  "Giá thành vừa túi",
];

export default function InstantAnalysis() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-[#0B4AA3]">
          Phân Tích Cảm Xúc Tức Thì
        </h2>
        <p className="text-center text-[#0B4AA3] mt-2 font-semibold">Chúng Tôi Có</p>

        <div className="mt-10 grid md:grid-cols-2 gap-10 items-center">
          <div className="relative h-64 md:h-80">
            <Image src="/assets/images/analysis.png" alt="analysis" fill className="object-contain" />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
            <ul className="space-y-4 text-slate-700">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-4">
                  <span className="mt-1 inline-block size-2 rounded-full bg-blue-600" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
