import Link from "next/link";

// -----------------------------------------------------------------------------
// SIK SORULAN SORULAR — ürün sayfalarında ortak bölüm
// Sorular açılır-kapanır listede görünür; aynı sorular sayfanın yapısal verisine
// (sssYapisalVeri → schema.org FAQPage) de eklenir, böylece Google soru-cevapları okur.
// Cevaplar yalnız sayfada / katalogda yazan bilgilere dayanmalıdır.
// -----------------------------------------------------------------------------

export type Sss = [soru: string, cevap: string];

export const sssYapisalVeri = (sss: Sss[]) => ({
  "@type": "FAQPage",
  mainEntity: sss.map(([s, c]) => ({ "@type": "Question", name: s, acceptedAnswer: { "@type": "Answer", text: c } })),
});

export default function SikSorulanSorular({
  baslik,
  sss,
  ilgili = [],
  zemin = "",
}: {
  baslik: string;
  sss: Sss[];
  ilgili?: { href: string; ad: string }[];
  zemin?: string; // bölümün arka plan sınıfları (ör. "bg-white border-y border-slate-200/80")
}) {
  return (
    <section id="sss" className={`scroll-mt-28 py-14 md:py-16 ${zemin}`}>
      <div className="max-w-4xl mx-auto px-6 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">SIK SORULAN SORULAR</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{baslik}</h2>
        </div>
        <div className="space-y-3">
          {sss.map(([soru, cevap]) => (
            <details key={soru} className="group bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <summary className="cursor-pointer list-none flex items-start justify-between gap-4 font-bold text-slate-900 text-sm">
                <h3>{soru}</h3>
                <span className="text-teal-700 group-open:rotate-45 transition-transform text-lg leading-none" aria-hidden>
                  +
                </span>
              </summary>
              <p className="text-sm text-slate-600 leading-relaxed mt-3">{cevap}</p>
            </details>
          ))}
        </div>
        {ilgili.length > 0 && (
          <p className="text-xs text-slate-500 leading-relaxed">
            İlgili yazılar:{" "}
            {ilgili.map((l, i) => (
              <span key={l.href}>
                {i > 0 && " · "}
                <Link href={l.href} className="text-teal-700 underline underline-offset-2">
                  {l.ad}
                </Link>
              </span>
            ))}
          </p>
        )}
      </div>
    </section>
  );
}
