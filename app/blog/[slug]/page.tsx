import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MAKALELER } from "../data";

export const dynamic = "force-dynamic";

export default function BlogDetayPage({ params }: { params: { slug: string } }) {
  const makale = MAKALELER.find((m) => m.slug === params.slug);

  if (!makale) notFound();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      <Header />

      <main className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          
          <Link href="/blog" className="text-xs font-bold text-teal-700 hover:underline inline-block">
            ← Tüm Makalelere Dön
          </Link>

          <div className="space-y-3 border-b border-slate-200 pb-6">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
              {makale.kategori}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight pt-2">
              {makale.baslik}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Yayınlanma: {makale.tarih} · {makale.okumaSuresi}
            </p>
          </div>

          {/* İÇERİK METNİ */}
          <div
            className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm space-y-4 text-sm leading-relaxed text-slate-700 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: makale.icerikHtml }}
          />

          {/* ÇAĞRI BANNERI */}
          <div className="bg-slate-900 text-white rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-bold">Projeniz İçin Teknik Danışmanlık Alın</h3>
              <p className="text-xs text-slate-300">
                Uzman mühendislerimiz binanız için doğru kapasiteyi ücretsiz keşifle belirlesin.
              </p>
            </div>
            <Link
              href="/iletisim"
              className="shrink-0 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg transition-colors"
            >
              Ücretsiz Keşif İsteğin →
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}