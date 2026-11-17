import Link from "next/link";
import { LogoTam } from "@/components/Logo";
import MobilMenu from "@/components/MobilMenu";
import DilSecici from "@/components/DilSecici";
import { yol } from "@/lib/dil";
import { dilAl } from "@/lib/dil-sunucu";
import { SITE_METNI } from "@/lib/site-metin";

export default function Header() {
  const dil = dilAl();
  const t = SITE_METNI[dil];
  const m = t.menu;
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-3">
        
        {/* BÜYÜTÜLMÜŞ LOGO */}
        <Link href={yol(dil, "/")} aria-label={t.anaSayfaEtiketi} className="flex items-center group shrink-0">
          {/* 1024–1279 px arası menü sığsın diye alt yazısız (kısa) logo */}
          <LogoTam boyut={40} className="sm:hidden lg:inline-flex xl:hidden" altYazi={false} />
          <LogoTam boyut={44} className="hidden sm:inline-flex lg:hidden xl:inline-flex" altYaziMetni={t.logoAltYazi} />
        </Link>

        {/* MENÜ LİNKLERİ (Hakkımızda Öne Alındı) */}
        <nav className="hidden lg:flex items-center gap-3 xl:gap-5 2xl:gap-6 text-sm font-semibold text-slate-700 whitespace-nowrap">
          <Link href={yol(dil, "/hakkimizda")} className="hover:text-teal-700 transition-colors">
            {m.hakkimizda}
          </Link>
          <Link href={yol(dil, "/hizmetler")} className="hover:text-teal-700 transition-colors">
            {m.hizmetler}
          </Link>
          <Link href={yol(dil, "/urunler")} className="hover:text-teal-700 transition-colors">
            {m.urunler}
          </Link>
          <Link href={yol(dil, "/tcl-vrf")} className="hover:text-teal-700 transition-colors">
            {m.tclVrf}
          </Link>
          <Link href={yol(dil, "/referanslar")} className="hover:text-teal-700 transition-colors">
            {m.referanslar}
          </Link>
          <Link href={yol(dil, "/hesaplama")} className="hover:text-teal-700 transition-colors">
            <span className="2xl:hidden">{m.hesaplamaKisa}</span>
            <span className="hidden 2xl:inline">{m.hesaplamaUzun}</span>
          </Link>
          <Link href={yol(dil, "/blog")} className="hover:text-teal-700 transition-colors">
            {m.blog}
          </Link>
          <Link href={yol(dil, "/iletisim")} className="hover:text-teal-700 transition-colors">
            {m.iletisim}
          </Link>
        </nav>

        {/* TEKLİF İSTEYİN BUTONU */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dil seçimi: geniş ekranda burada, küçük ekranda menünün içinde */}
          <div className="hidden lg:block">
            <DilSecici dil={dil} etiket={t.dilSec} />
          </div>
          <Link
            href={yol(dil, "/iletisim")}
            className="px-3 sm:px-5 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-teal-700 transition-all shadow-sm whitespace-nowrap"
          >
            {dil === "tr" ? (
              t.teklifIsteyin
            ) : (
              <>
                <span className="sm:hidden">{t.teklifKisa}</span>
                <span className="hidden sm:inline">{t.teklifIsteyin}</span>
              </>
            )}
          </Link>
          <MobilMenu dil={dil} />
        </div>
      </div>
    </header>
  );
}