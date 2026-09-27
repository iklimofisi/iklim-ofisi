import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { MAKALELER, makaleIsoTarihi } from "../data";
import { JsonLd, SITE } from "@/components/YapisalVeri";

export const dynamic = "force-dynamic";

// Yayındaki eski makale adresleri yeni adreslere kalıcı (308) yönlendirilir.
const ESKI_SLUGLAR: Record<string, string> = {
  "vrf-sistemler-ve-mitsu-samsung-teknolojisi": "vrf-rehberi-mitsubishi-electric-ve-tcl",
};

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const makale = MAKALELER.find((m) => m.slug === params.slug);
  if (!makale) return {};
  return {
    title: makale.baslik,
    description: makale.ozet,
    alternates: { canonical: `/blog/${makale.slug}` },
    openGraph: {
      title: makale.baslik,
      description: makale.ozet,
      type: "article",
      url: `${SITE}/blog/${makale.slug}`,
      siteName: "İklim Ofisi Mühendislik",
      locale: "tr_TR",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: makale.baslik }],
      ...(makaleIsoTarihi(makale.tarih) ? { publishedTime: makaleIsoTarihi(makale.tarih)! } : {}),
    },
  };
}

export default function BlogDetayPage({ params }: { params: { slug: string } }) {
  const yeniSlug = ESKI_SLUGLAR[params.slug];
  if (yeniSlug) permanentRedirect(`/blog/${yeniSlug}`);

  const makale = MAKALELER.find((m) => m.slug === params.slug);

  if (!makale) notFound();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      <Header />

      <main className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          
          <JsonLd
            veri={{
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: makale.baslik,
              description: makale.ozet,
              ...(makaleIsoTarihi(makale.tarih) ? { datePublished: makaleIsoTarihi(makale.tarih) } : {}),
              inLanguage: "tr-TR",
              mainEntityOfPage: `${SITE}/blog/${makale.slug}`,
              image: `${SITE}/og-image.png`,
              author: { "@type": "Organization", name: "İklim Ofisi Mühendislik", url: SITE },
              publisher: {
                "@type": "Organization",
                name: "İklim Ofisi Mühendislik",
                logo: { "@type": "ImageObject", url: `${SITE}/logo-icon.png` },
              },
            }}
          />
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
            className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm space-y-4 text-sm leading-relaxed text-slate-700 max-w-none [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:pt-3 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-900 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_strong]:text-slate-900"
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
              Ücretsiz Keşif İsteyin →
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}