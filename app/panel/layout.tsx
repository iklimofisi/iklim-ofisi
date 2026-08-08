import Link from "next/link";

const menu = [
  { href: "/panel", label: "Özet" },
  { href: "/panel/musteriler", label: "Müşteriler" },
  { href: "/panel/teklifler", label: "Teklifler" },
  { href: "/panel/cari", label: "Cari Hesap" },
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-zemin">
      <aside className="w-56 shrink-0 border-r border-hat bg-yuzey hidden sm:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-hat">
          <Link href="/" className="font-display font-semibold text-metin">
            İklim <span className="text-soguk">Ofisi</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          {menu.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="focus-ring block px-3 py-2 rounded-md text-sm font-medium text-metin/75 hover:bg-soguk-light hover:text-soguk-dim transition-colors"
            >
              {m.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-hat">
          <Link href="/" className="text-xs text-metin/50 hover:text-metin focus-ring">
            ← Siteye dön
          </Link>
        </div>
      </aside>
      <main className="flex-1 px-6 sm:px-10 py-10 max-w-5xl">{children}</main>
    </div>
  );
}
