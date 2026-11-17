import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { makaleler, makaleIsoTarihi, makaleOgGorseli, makaleTarihi } from "../data";
import { dilAlternatifleri, OG_DIL, yol, type Dil } from "@/lib/dil";
import { dilAl } from "@/lib/dil-sunucu";
import { JsonLd, SITE } from "@/components/YapisalVeri";
import { sssYapisalVeri } from "@/components/SikSorulanSorular";

export const dynamic = "force-dynamic";

// Yayındaki eski makale adresleri yeni adreslere kalıcı (308) yönlendirilir.
const ESKI_SLUGLAR: Record<string, string> = {
  "vrf-sistemler-ve-mitsu-samsung-teknolojisi": "vrf-rehberi-mitsubishi-electric-ve-tcl",
};

// MAKALE SAYFASI METİNLERİ (Türkçe / English / Deutsch)
const YAZI: Record<Dil, { geri: string; yayin: string; sss: string; ctaBaslik: string; ctaMetin: string; ctaDugme: string; diger: string; dilKodu: string; site: string }> = {
  tr: {
    geri: "← Tüm Makalelere Dön",
    yayin: "Yayınlanma",
    sss: "Sık Sorulan Sorular",
    ctaBaslik: "Projeniz İçin Teknik Danışmanlık Alın",
    ctaMetin: "Uzman mühendislerimiz binanız için doğru kapasiteyi ücretsiz keşifle belirlesin.",
    ctaDugme: "Ücretsiz Keşif İsteyin →",
    diger: "Diğer Makaleler",
    dilKodu: "tr-TR",
    site: "İklim Ofisi Mühendislik",
  },
  en: {
    geri: "← Back to All Articles",
    yayin: "Published",
    sss: "Frequently Asked Questions",
    ctaBaslik: "Get Technical Advice for Your Project",
    ctaMetin: "Let our expert engineers determine the right capacity for your building with a free site survey.",
    ctaDugme: "Request a Free Site Survey →",
    diger: "More Articles",
    dilKodu: "en",
    site: "İklim Ofisi Engineering",
  },
  de: {
    geri: "← Zurück zu allen Artikeln",
    yayin: "Veröffentlicht",
    sss: "Häufig gestellte Fragen",
    ctaBaslik: "Technische Beratung für Ihr Projekt",
    ctaMetin: "Unsere Fachingenieure ermitteln bei einer kostenlosen Besichtigung die richtige Leistung für Ihr Gebäude.",
    ctaDugme: "Kostenlose Besichtigung anfordern →",
    diger: "Weitere Artikel",
    dilKodu: "de",
    site: "İklim Ofisi Engineering",
  },
};

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const dil = dilAl();
  const makale = makaleler(dil).find((m) => m.slug === params.slug);
  if (!makale) return {};
  const yolu = yol(dil, `/blog/${makale.slug}`);
  return {
    // seoBaslik: Google'da kısalmadan görünsün diye site adı eklenmeden kullanılır
    title: makale.seoBaslik ? { absolute: makale.seoBaslik } : makale.baslik,
    description: makale.seoAciklama ?? makale.ozet,
    alternates: dilAlternatifleri(dil, `/blog/${makale.slug}`),
    openGraph: {
      title: makale.baslik,
      description: makale.ozet,
      type: "article",
      url: `${SITE}${yolu}`,
      siteName: YAZI[dil].site,
      locale: OG_DIL[dil],
      // Türkçe paylaşım görselinde Türkçe başlık yazılı; diğer dillerde makale fotoğrafı kullanılır
      images: [dil === "tr" ? { url: makaleOgGorseli(makale.slug), width: 1200, height: 630, alt: makale.baslik } : { url: makale.gorsel, alt: makale.baslik }],
      ...(makaleIsoTarihi(makale.tarih) ? { publishedTime: makaleIsoTarihi(makale.tarih)! } : {}),
    },
  };
}

export default function BlogDetayPage({ params }: { params: { slug: string } }) {
  const yeniSlug = ESKI_SLUGLAR[params.slug];
  const dil = dilAl();
  const y = YAZI[dil];
  if (yeniSlug) permanentRedirect(yol(dil, `/blog/${yeniSlug}`));

  const MAKALELER = makaleler(dil);
  const makale = MAKALELER.find((m) => m.slug === params.slug);

  if (!makale) notFound();

  // Diğer makaleler: önce aynı kategori, sonra en yeniler (iç bağlantı)
  const digerMakaleler = [
    ...MAKALELER.filter((m) => m.slug !== makale.slug && m.kategori === makale.kategori),
    ...MAKALELER.filter((m) => m.slug !== makale.slug && m.kategori !== makale.kategori),
  ].slice(0, 3);

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
              ...(makale.guncelleme && makaleIsoTarihi(makale.guncelleme) ? { dateModified: makaleIsoTarihi(makale.guncelleme) } : {}),
              inLanguage: y.dilKodu,
              mainEntityOfPage: `${SITE}${yol(dil, `/blog/${makale.slug}`)}`,
              image: [`${SITE}${makaleOgGorseli(makale.slug)}`, `${SITE}${makale.gorsel}`],
              author: { "@type": "Organization", name: "İklim Ofisi Mühendislik", url: SITE },
              publisher: {
                "@type": "Organization",
                name: "İklim Ofisi Mühendislik",
                logo: { "@type": "ImageObject", url: `${SITE}/logo-hat.png` },
              },
            }}
          />
          {makale.sss && makale.sss.length > 0 && (
            <JsonLd veri={{ "@context": "https://schema.org", ...sssYapisalVeri(makale.sss) }} />
          )}
          <Link href={yol(dil, "/blog")} className="text-xs font-bold text-teal-700 hover:underline inline-block">
            {y.geri}
          </Link>

          <div className="space-y-3 border-b border-slate-200 pb-6">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
              {makale.kategori}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight pt-2">
              {makale.baslik}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              {y.yayin}: {makaleTarihi(dil, makale.tarih)} · {makale.okumaSuresi}
            </p>
          </div>

          {/* KAPAK FOTOĞRAFI */}
          <div className={`relative aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200/90 ${makale.gorselSigdir ? "bg-white" : "bg-slate-100"}`}>
            <Image
              src={makale.gorsel}
              alt={makale.gorselAlt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className={makale.gorselSigdir ? "object-contain p-6" : "object-cover"}
            />
          </div>

          {/* İÇERİK METNİ */}
          <div
            className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm space-y-4 text-sm leading-relaxed text-slate-700 max-w-none [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:pt-3 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-900 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_strong]:text-slate-900 [&_a]:text-teal-700 [&_a]:underline [&_a]:underline-offset-2 [&_aside]:bg-teal-50 [&_aside]:border [&_aside]:border-teal-200 [&_aside]:rounded-xl [&_aside]:p-4 [&_.tablo]:overflow-x-auto [&_table]:w-full [&_table]:text-xs [&_table]:border-collapse [&_th]:bg-slate-50 [&_th]:text-left [&_th]:font-bold [&_th]:text-slate-900 [&_th]:p-2 [&_th]:border [&_th]:border-slate-200 [&_td]:p-2 [&_td]:border [&_td]:border-slate-200 [&_td]:align-top"
            dangerouslySetInnerHTML={{ __html: makale.icerikHtml }}
          />

          {/* SIK SORULAN SORULAR */}
          {makale.sss && makale.sss.length > 0 && (
            <section className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-slate-900">{y.sss}</h2>
              {makale.sss.map(([soru, cevap]) => (
                <details key={soru} className="group border border-slate-200 rounded-xl p-4">
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-4 font-bold text-slate-900 text-sm">
                    <h3>{soru}</h3>
                    <span className="text-teal-700 group-open:rotate-45 transition-transform text-lg leading-none" aria-hidden>
                      +
                    </span>
                  </summary>
                  <p className="text-sm text-slate-600 leading-relaxed mt-3">{cevap}</p>
                </details>
              ))}
            </section>
          )}

          {/* ÇAĞRI BANNERI */}
          <div className="bg-slate-900 text-white rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-bold">{y.ctaBaslik}</h3>
              <p className="text-xs text-slate-300">
                {y.ctaMetin}
              </p>
            </div>
            <Link
              href={yol(dil, "/iletisim")}
              className="shrink-0 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg transition-colors"
            >
              {y.ctaDugme}
            </Link>
          </div>

          {/* DİĞER MAKALELER */}
          {digerMakaleler.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{y.diger}</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {digerMakaleler.map((m) => (
                  <Link
                    key={m.slug}
                    href={yol(dil, `/blog/${m.slug}`)}
                    className="block bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm hover:border-teal-300 transition-colors"
                  >
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">{m.kategori}</span>
                    <span className="block text-sm font-bold text-slate-900 leading-snug mt-1">{m.baslik}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}