import { getSirketAyarlari } from "@/lib/sirket";
import Link from "next/link";

export default async function Footer() {
  const sirket = await getSirketAyarlari();

  return (
    <footer className="bg-slate-950 text-white py-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-base mb-1 text-white">{sirket.unvan}</h3>
          {sirket.slogan && <p className="text-slate-400 text-xs">{sirket.slogan}</p>}
        </div>

        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-teal-400">Ofis & İletişim</h4>
          {sirket.adres && (
            <p className="text-slate-300 text-xs mb-1">
              📍 {sirket.adres}
            </p>
          )}
          {sirket.telefon && <p className="text-slate-400 text-xs">Tel: {sirket.telefon}</p>}
          {sirket.email && <p className="text-slate-400 text-xs">E-posta: {sirket.email}</p>}
        </div>

        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-teal-400">Kurumsal Sayfalar</h4>
          <div className="flex flex-col space-y-2 text-xs text-slate-400 font-medium">
            <Link href="/hakkimizda" className="hover:text-white transition-colors">Hakkımızda</Link>
            <Link href="/hizmetler" className="hover:text-white transition-colors">Hizmetlerimiz</Link>
            <Link href="/urunler" className="hover:text-white transition-colors">Ürün Kataloğu</Link>
            <Link href="/referanslar" className="hover:text-white transition-colors">Referans Projeler</Link>
            <Link href="/hesaplama" className="hover:text-white transition-colors">Kapasite Hesaplama</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog & Teknik Makaleler</Link>
            <Link href="/iletisim" className="hover:text-white transition-colors">İletişim & Konum</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}