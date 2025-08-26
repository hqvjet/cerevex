import Image from "next/image";

const pubs = [
  {
    title:
      "E2V-PhoBERT: Enhanced Vietnamese Sentiment Analysis with Emoji Integration (Published)",
    conf: "CIIDS 2025",
    icon: "/assets/icons/aciids_icon.png",
    authors: [
      "Dai Tho Dang",
      "Quoc Viet Hoang",
      "Nguyen Xuan Thao Mai",
      "Ngoc Thanh Nguyen"
    ],
    venue: "Communications in Computer and Information Science, vol.2493 (Springer)",
    indexed: "Scopus"
  },
  {
    title:
      "VED_PhoBERT: Integrating Emoji Descriptions for Improved Vietnamese Sentiment Detection (Accepted)",
    conf: "CITA",
    icon: "/assets/icons/cita_icon.png",
    authors: [
      "Cong Phap Huynh",
      "Quoc Viet Hoang",
      "Nguyen Xuan Thao Mai",
      "Pham Song Nguyen Tran"
    ],
    venue: "—",
    indexed: "Scopus"
  },
  {
    title: "Sentiment Analysis of Hotel Customer Reviews (Accepted)",
    conf: "ICIIT",
    icon: "/assets/icons/iciit_icon.png",
    authors: [
      "Nguyen Xuan Thao Mai",
      "Pham Song Nguyen Tran",
      "Cong Phap Huynh",
      "Dai Tho Dang"
    ],
    venue: "—",
    indexed: "Scopus"
  },
];

export default function Publications() {
  return (
    <section className="relative py-16 md:py-24">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/assets/images/academic_publish_background.png"
          alt="bg"
          fill
          className="object-cover opacity-100"
        />
        <div className="absolute inset-0 bg-white/50" />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-[#0B4AA3] mb-10">
          Công Bố Khoa Học
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {pubs.map((p) => (
            <div
              key={p.title}
              className="group rounded-xl bg-white p-6 border border-[#E2ECFF] shadow-sm hover:shadow-md hover:border-[#BCD5FF] transition-all duration-200"
            >
              <div className="relative w-full mb-4 flex items-start justify-start">
                <div className="relative size-16">
                  <Image src={p.icon} alt={p.conf} fill className="object-contain" />
                </div>
              </div>
              <h3 className="text-[13px] font-semibold leading-snug text-red-600 tracking-wide">
                {p.title}
              </h3>
              <p className="mt-3 text-[11px] text-slate-700 leading-relaxed">
                {p.authors.join(", ")}
              </p>
              <p className="mt-3 text-[11px] text-slate-500 leading-relaxed italic">
                {p.venue}
              </p>
              <p className="mt-4 text-[11px] text-slate-600">
                <span className="font-medium">Indexed:</span> {p.indexed}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
