import Link from "next/link";

const links = [
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

export default function Header() {
  return (
    <header className="border-b border-hat bg-yuzey/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-semibold text-lg tracking-tight text-metin">
          İklim <span className="text-soguk">Ofisi</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-8 font-body text-sm text-metin/80">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="focus-ring hover:text-soguk transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/panel"
          className="focus-ring text-sm font-medium bg-metin text-zemin px-4 py-2 rounded-md hover:bg-soguk-dim transition-colors"
        >
          Panel Girişi
        </Link>
      </div>
    </header>
  );
}
