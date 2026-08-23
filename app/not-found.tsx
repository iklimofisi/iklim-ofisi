import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="flex justify-center">
          <Image src="/logo-icon.png" alt="İklim Ofisi" width={56} height={56} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-teal-700 font-mono bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            404 — Sayfa Bulunamadı
          </span>
          <h1 className="text-2xl font-bold text-slate-900 pt-2">Aradığınız Sayfaya Ulaşılamadı</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Aradığınız adres silinmiş, ismi değiştirilmiş veya geçici olarak kullanım dışı kalmış olabilir.
          </p>
        </div>

        <div>
          <Link
            href="/"
            className="inline-block w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            ← Ana Sayfaya Dönün
          </Link>
        </div>
      </div>
    </div>
  );
}