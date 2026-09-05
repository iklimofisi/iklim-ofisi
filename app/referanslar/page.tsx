import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getSirketAyarlari } from "@/lib/sirket";

export const dynamic = "force-dynamic";

export default async function ReferanslarPage() {
  const sirket = await getSirketAyarlari();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      <Header />

      <main className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              SAHA TECRÜBEMİZ
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Referans Projelerimiz
            </h1>
            <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              {sirket.unvan} tarafından tamamlanan otel, plaza, konut ve endüstriyel iklimlendirme referans projelerimiz güncellenmektedir.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <p className="text-4xl">📐</p>
            <h3 className="font-bold text-slate-900 text-lg">Referans Listesi Güncellenmektedir</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Daha önce tamamladığımız VRF iklimlendirme, Buderus kaskad ısıtma ve mekanik tesisat referanslarımızın detaylı görsel kataloğu hazırlanmaktadır.
            </p>
            <div className="pt-2">
              <Link
                href="/iletisim"
                className="inline-block px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Projeniz İçin Bize Ulaşın →
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}