import Link from "next/link";
import { cn } from "@/lib/utils";

interface DocsLayoutProps {
  children: React.ReactNode;
  current?: string; // slug
}

const chapters = [
  { slug: "gioi-thieu", title: "Giới thiệu" },
  { slug: "tong-quan-role", title: "Vai trò & quyền" },
  { slug: "ai-dong-bo", title: "AI & Đồng bộ dữ liệu" },
  { slug: "bat-dau", title: "Bắt đầu" },
  { slug: "dashboard", title: "Dashboard" },
  { slug: "phan-tich", title: "Phân tích dữ liệu" },
  { slug: "quan-ly-tai-khoan", title: "Quản lý tài khoản" },
  { slug: "quan-ly-cong-ty", title: "Quản lý công ty" },
  { slug: "extension", title: "Extension" },
  { slug: "faq", title: "FAQ" },
];

export function DocsLayout({ children, current }: DocsLayoutProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Chương</h2>
            <nav className="flex flex-col gap-1">
              {chapters.map((c, i) => (
                <Link
                  key={c.slug}
                  href={`/huong-dan/${c.slug}`}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    current === c.slug
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <span className="mr-1 text-[11px] opacity-60">{i + 1}.</span>
                  {c.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </aside>
      <main className="min-w-0">
        <div className="mb-8 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/huong-dan" className="hover:text-blue-600">Hướng dẫn</Link>
          <span>/</span>
          {current && <span className="text-slate-700 font-medium capitalize">{current.replace(/-/g, " ")}</span>}
        </div>
  <article className="docs-article prose prose-slate max-w-none prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl">
          {children}
        </article>
      </main>
    </div>
  );
}

export function guideChapters() { return chapters; }
