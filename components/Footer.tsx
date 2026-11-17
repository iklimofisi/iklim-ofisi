import { getSirketAyarlari } from "@/lib/sirket";
import Link from "next/link";
import IletisimButonlari from "@/components/IletisimButonlari";
import { IsletmeYapisalVerisi } from "@/components/YapisalVeri";
import { ISTIRAK_METNI } from "@/lib/kurumsal";
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