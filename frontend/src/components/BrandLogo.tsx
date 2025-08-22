import Image from "next/image";
import Link from "next/link";

export default function BrandLogo({ href = "/landing", size = 180 }: { href?: string; size?: number }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2">
      <Image src="/assets/icons/logo.png" alt="Cerevex" width={size} height={Math.round(size / 5)} />
    </Link>
  );
}
