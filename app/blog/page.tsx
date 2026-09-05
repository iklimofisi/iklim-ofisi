import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { MAKALELER } from "./data";

export const dynamic = "force-dynamic";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      <Header />

      <main className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              TEKNİK REHBER & MÜHENDİSLİK BLOGU
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              İklimlendirme ve Tesisat <br />
              <span className="text-teal-700 underline decoration-teal-300/80 decoration-4 underline-offset-8">
                Teknik Makaleleri.
              </span>
            </h1>
            <p className="text-base text-slate-600 leading-relaxed pt-2">
              Mitsubishi Electric, Samsung VRF teknolojileri, Buderus ısıtma çözümleri ve mekanik tesisat hakkında uzman mühendislerimizin hazırladığı rehber yazılar.
            </p>
          </div>

          {/* MAKALELER GRİDİ */}
          <div className="grid md:grid-cols-2 gap-8">
            {MAKALELER.map((m) => (
              <div
                key={m.slug}
                className="bg-white border border-slate-200/90 rounded-2xl p-8 hover:shadow-lg hover:border-teal-500/40 transition-all duration-300 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold tracking-wider text-teal-700 uppercase">
                      {m.kategori}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {m.tarih} · {m.okumaSuresi}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 hover:text-teal-700 transition-colors">
                    <Link href={`/blog/${m.slug}`}>{m.baslik}</Link>
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {m.ozet}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href={`/blog/${m.slug}`}
                    className="text-xs font-bold text-teal-700 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Makalenin Tamamını Okuyun</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}