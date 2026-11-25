import Link from "next/link";

// -----------------------------------------------------------------------------
// PROJELER SEKMELERİ — "Proje Listesi" (/panel/projeler) ve "Takip Tablosu"
// (/panel/proje-takip, Excel indir / yükle) aynı başlık altında iki sekme.
// -----------------------------------------------------------------------------
const SEKMELER = [
  { anahtar: "liste", href: "/panel/projeler", ad: "Proje Listesi" },
  { anahtar: "tablo", href: "/panel/proje-takip", ad: "Takip Tablosu (Excel)" },
] as const;

export default function ProjeSekmeleri({ aktif }: { aktif: "liste" | "tablo" }) {
  return (
    <nav aria-label="Proje sayfaları" className="flex gap-1 border-b border-hat mb-6 print:hidden">
      {SEKMELER.map((s) => {
        const secili = s.anahtar === aktif;
        return (
          <Link
            key={s.anahtar}
            href={s.href}
            aria-current={secili ? "page" : undefined}
            className={`focus-ring -mb-px px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              secili ? "border-soguk text-soguk-dim" : "border-transparent text-metin/55 hover:text-metin"
            }`}
          >
            {s.ad}
          </Link>
        );
      })}
    </nav>
  );
}
