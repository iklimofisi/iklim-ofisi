import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* BÜYÜTÜLMÜŞ LOGO */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo-icon.png"
            alt="İklim Ofisi"
            width={44}
            height={48}
            className="w-auto h-11 object-contain group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-slate-950">
              İklim <span className="text-teal-700">Ofisi</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase -mt-1">
              Mühendislik
            </span>
          </div>
        </Link>

        {/* MENÜ LİNKLERİ (Hakkımızda Öne Alındı) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-700">
          <Link href="/hakkimizda" className="hover:text-teal-700 transition-colors">
            Hakkımızda
          </Link>
          <Link href="/hizmetler" className="hover:text-teal-700 transition-colors">
            Hizmetler
          </Link>
          <Link href="/urunler" className="hover:text-teal-700 transition-colors">
            Ürünler
          </Link>
          <Link href="/referanslar" className="hover:text-teal-700 transition-colors">
            Referanslar
          </Link>
          <Link href="/hesaplama" className="hover:text-teal-700 transition-colors">
            Kapasite Hesaplama
          </Link>
          <Link href="/blog" className="hover:text-teal-700 transition-colors">
            Blog
          </Link>
          <Link href="/iletisim" className="hover:text-teal-700 transition-colors">
            İletişim
          </Link>
        </nav>

        {/* TEKLİF İSTEYİN BUTONU */}
        <div className="flex items-center gap-3">
          <Link
            href="/iletisim"
            className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-teal-700 transition-all shadow-sm"
          >
            Teklif İsteyin
          </Link>
        </div>
      </div>
    </header>
  );
}