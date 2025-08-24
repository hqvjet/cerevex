import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {/* Positive */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mx-auto grid place-items-center">
              <div className="grid place-items-center rounded-full border-4 border-blue-500/70 text-blue-600 size-10">🙂</div>
              <div className="mt-3 h-0.5 w-24 bg-green-400/80 rounded" />
            </div>
            <h4 className="mt-3 text-center font-semibold text-blue-800">Cảm xúc Tích Cực</h4>
            <p className="mt-2 text-center text-sm text-slate-600">
              Phát hiện cảm xúc tích cực, sự hài lòng và những biểu hiện lạc quan trong nội dung của bạn với độ chính xác cao.
            </p>
          </div>

          {/* Negative */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mx-auto grid place-items-center">
              <div className="grid place-items-center rounded-full border-4 border-blue-500/70 text-blue-600 size-10">🙁</div>
              <div className="mt-3 h-0.5 w-24 bg-rose-400/80 rounded" />
            </div>
            <h4 className="mt-3 text-center font-semibold text-blue-800">Cảm xúc Tiêu Cực</h4>
            <p className="mt-2 text-center text-sm text-slate-600">
              Nhận diện cảm xúc tiêu cực, lời phàn nàn và phản hồi chỉ trích, giúp bạn hiểu rõ những mối quan ngại trong nội dung.
            </p>
          </div>

          {/* Neutral */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mx-auto grid place-items-center">
              <div className="grid place-items-center rounded-full border-4 border-blue-500/70 text-blue-600 size-10">😐</div>
              <div className="mt-3 h-0.5 w-24 bg-slate-400/70 rounded" />
            </div>
            <h4 className="mt-3 text-center font-semibold text-blue-800">Cảm xúc Trung Lập</h4>
            <p className="mt-2 text-center text-sm text-slate-600">
              Thể hiện thông tin trung tính, khách quan, không thiên lệch bởi cảm xúc hay quan điểm cá nhân.
            </p>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Image src="/assets/icons/logo.png" alt="logo" width={110} height={26} />
            <span>© 2025 Cerevex</span>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="size-5 rounded-full bg-slate-200" />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
