import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-4 gap-8">
        <div>
          <Image src="/assets/icons/logo.png" alt="logo" width={140} height={32} />
          <p className="text-xs text-slate-500 mt-3">Copyright © 2025 Cerevex</p>
          <div className="flex gap-2 mt-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="size-5 rounded-full bg-slate-200" />
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Company</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li><Link href="#">About us</Link></li>
            <li><Link href="#">Pricing</Link></li>
            <li><Link href="#">Privacy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Support</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li><Link href="#">Help center</Link></li>
            <li><Link href="#">Terms</Link></li>
            <li><Link href="#">Security</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Stay up to date</h4>
          <div className="flex">
            <input className="flex-1 rounded-l-md border border-slate-300 px-3 py-2 text-sm focus:outline-none" placeholder="your email" />
            <button className="rounded-r-md bg-blue-600 px-3 text-white text-sm">→</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
