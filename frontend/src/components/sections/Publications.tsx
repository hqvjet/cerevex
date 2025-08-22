import Image from "next/image";

const pubs = [
  {
    title:
      "VEZ-PhoBERT: Enhanced Vietnamese Sentiment Analysis with Emoji Integration (Published)",
    conf: "CIIDS 2025",
    icon: "/assets/icons/aciids_icon.png",
  },
  {
    title:
      "VED_PhoBERT: Integrating Emoji Descriptions for Improved Vietnamese Sentiment Detection (Accepted)",
    conf: "CITA",
    icon: "/assets/icons/cita_icon.png",
  },
  {
    title: "Sentiment Analysis of Hotel Customer Reviews (Accepted)",
    conf: "ICIIT",
    icon: "/assets/icons/iciit_icon.png",
  },
];

export default function Publications() {
  return (
    <section className="relative py-16 md:py-24 bg-white">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <Image
          src="/assets/images/academic_publish_background.png"
          alt="bg"
          fill
          className="object-cover opacity-20"
        />
      </div>
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-[#0B4AA3] mb-10">
          Công Bố Khoa Học
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {pubs.map((p) => (
            <div key={p.title} className="rounded-xl bg-white p-6 border-[1.5px] border-[#D7E5FF] shadow-[0_8px_28px_rgba(25,87,200,0.08)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative size-12">
                  <Image src={p.icon} alt={p.conf} fill className="object-contain" />
                </div>
                <p className="font-semibold text-slate-900">{p.conf}</p>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">{p.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
