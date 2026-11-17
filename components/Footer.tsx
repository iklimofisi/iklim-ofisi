import { getSirketAyarlari } from "@/lib/sirket";
import Link from "next/link";
import IletisimButonlari from "@/components/IletisimButonlari";
import { IsletmeYapisalVerisi } from "@/components/YapisalVeri";
import { ISTIRAK_METNI, SOSYAL_MEDYA } from "@/lib/kurumsal";
import { yol } from "@/lib/dil";
import { dilAl } from "@/lib/dil-sunucu";
import { SITE_METNI } from "@/lib/site-metin";

export default async function Footer() {
  const sirket = await getSirketAyarlari();
  const dil = dilAl();
  const t = SITE_METNI[dil].alt;
  // Türkçede paneldeki slogan; diğer dillerde çevirisi
  const slogan = dil === "tr" ? sirket.slogan : sirket.slogan && t.slogan;

  return (
    <footer className="bg-slate-950 text-white pt-12 pb-24 sm:pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-base mb-1 text-white">{sirket.unvan}</h3>
          {slogan && <p className="text-slate-400 text-xs">{slogan}</p>}
          {ISTIRAK_METNI && dil === "tr" && <p className="text-slate-500 text-xs mt-3 leading-relaxed">{ISTIRAK_METNI}</p>}
        </div>

        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-teal-400">{t.ofis}</h4>
          {sirket.adres && (
            <p className="text-slate-300 text-xs mb-1">
              📍 {sirket.adres}
            </p>
          )}
          {sirket.telefon && <p className="text-slate-400 text-xs">{t.tel}: {sirket.telefon}</p>}
          {sirket.email && <p className="text-slate-400 text-xs">{t.eposta}: {sirket.email}</p>}

          {SOSYAL_MEDYA.length > 0 && (
            <>
              <h4 className="font-bold text-xs uppercase tracking-wider mt-6 mb-3 text-teal-400">{t.sosyal}</h4>
              <div className="flex flex-wrap gap-2">
                {SOSYAL_MEDYA.map((s) => (
                  <a
                    key={s.ad}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.ad}
                    title={s.ad}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:border-teal-500 hover:text-white transition-colors"
                  >
                    <SosyalSimge ad={s.ad} />
                    {s.ad}
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-teal-400">{t.kurumsal}</h4>
          <div className="flex flex-col space-y-2 text-xs text-slate-400 font-medium">
            {t.linkler.map((l) => (
              <Link key={l.href} href={yol(dil, l.href)} className="hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row gap-2 sm:justify-end text-[11px] text-slate-500">
        <Link href={yol(dil, "/kvkk")} className="hover:text-white transition-colors">
          {t.kvkk}
        </Link>
      </div>

      <IletisimButonlari telefon={sirket.telefon} whatsapp={sirket.whatsapp} dil={dil} />
      <IsletmeYapisalVerisi sirket={sirket} dil={dil} />
    </footer>
  );
}

function SosyalSimge({ ad }: { ad: string }) {
  if (ad === "Instagram") {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (ad === "LinkedIn") {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
      </svg>
    );
  }
  return null;
}