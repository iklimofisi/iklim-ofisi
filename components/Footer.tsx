import { getSirketAyarlari } from "@/lib/sirket";
import Link from "next/link";

export default async function Footer() {
  // Şirket bilgilerini panel veritabanından dinamik çeker
  const sirket = await getSirketAyarlari();

  return (
    <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-2">{sirket.unvan}</h3>
          <p className="text-slate-400 text-sm">{sirket.slogan}</p>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3 text-slate-300">İletişim & Adres</h4>
          <p className="text-slate-400 text-sm mb-1">{sirket.adres}</p>
          <p className="text-slate-400 text-sm">Tel: {sirket.telefon}</p>
          <p className="text-slate-400 text-sm">E-posta: {sirket.email}</p>
        </div>

        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-teal-400">Kurumsal Sayfalar</h4>
          <div className="flex flex-col space-y-2 text-xs text-slate-400 font-medium">
            <Link href="/hizmetler" className="hover:text-white transition-colors">Hizmetlerimiz</Link>
            <Link href="/urunler" className="hover:text-white transition-colors">Ürün Kataloğu</Link>
            <Link href="/hesaplama" className="hover:text-white transition-colors">Kapasite Hesaplama</Link>
            <Link href="/hakkimizda" className="hover:text-white transition-colors">Hakkımızda</Link>
            <Link href="/iletisim" className="hover:text-white transition-colors">İletişim & Konum</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}