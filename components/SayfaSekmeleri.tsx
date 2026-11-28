import Link from "next/link";

// -----------------------------------------------------------------------------
// SAYFA SEKMELERİ — aynı konudaki sayfaları tek başlık altında sekme olarak bağlar
// (ör. Raporlar: Aylık rapor · Ciro & personel; Ürünler: Katalog · Stok & maliyet).
// -----------------------------------------------------------------------------
export default function SayfaSekmeleri({
  sekmeler,
  aktif,
  etiket,
}: {
  sekmeler: { anahtar: string; href: string; ad: string; disari?: boolean }[];
  aktif: string;
  etiket: string;
}) {
  return (
    <nav aria-label={etiket} className="flex flex-wrap gap-1 border-b border-hat mb-6 print:hidden">
      {sekmeler.map((s) => {
        const secili = s.anahtar === aktif;
        const sinif = `focus-ring -mb-px px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
          secili ? "border-soguk text-soguk-dim" : "border-transparent text-metin/55 hover:text-metin"
        }`;
        return s.disari ? (
          <a key={s.anahtar} href={s.href} target="_blank" rel="noopener" className={sinif}>
            {s.ad} ↗
          </a>
        ) : (
          <Link key={s.anahtar} href={s.href} aria-current={secili ? "page" : undefined} className={sinif}>
            {s.ad}
          </Link>
        );
      })}
    </nav>
  );
}
