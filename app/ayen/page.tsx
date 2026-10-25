import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { JsonLd, SITE } from "@/components/YapisalVeri";

// -----------------------------------------------------------------------------
// AYEN ALÜMİNYUM RADYATÖR SAYFASI (/ayen)
// Değerler Ayen ürün kataloğundan alınmıştır (dilim başına ısıl güç: Δt 60, 90/70/20 °C).
// Görseller kataloğun ürün sayfalarından kesildi: public/ayen/
// Sitede katalog PDF'i paylaşılmaz.
// -----------------------------------------------------------------------------

export const dynamic = "force-dynamic";

const SAYFA = `${SITE}/ayen`;

export const metadata: Metadata = {
  title: "Ayen Alüminyum Radyatör ve Havlupan Modelleri | İstanbul",
  description:
    "Ayen alüminyum radyatör: 9 dilimli panel serisi (300–1900 mm), 9 alüminyum havlupan modeli, 30 renk seçeneği. %98 alüminyum, EN 442 ve TSE belgeli, her radyatör 15 bar testli. İstanbul'da satış, keşif ve montaj.",
  keywords: ["Ayen radyatör", "Ayen alüminyum radyatör", "alüminyum radyatör", "alüminyum havlupan", "dekoratif radyatör", "renkli radyatör", "alüminyum radyatör İstanbul"],
  alternates: { canonical: "/ayen" },
  openGraph: {
    title: "Ayen Alüminyum Radyatör | İklim Ofisi",
    description: "Panel radyatör ve havlupan modelleri, 30 renk seçeneği. Satış, keşif ve montaj.",
    url: SAYFA,
    images: [{ url: "/og/ayen.jpg", width: 1200, height: 630, alt: "Ayen alüminyum radyatör ve havlupan" }],
  },
};

// [ad, görsel, dilim genişliği mm, kalınlık mm, yükseklik aralığı, 600 mm yükseklikte dilim başına W]
const PANEL: [string, string, number, number, string, number][] = [
  ["Class", "class", 100, 40, "270 – 1870", 151],
  ["Orkide", "orkide", 80, 40, "270 – 1870", 122],
  ["Lale", "lale", 50, 40, "270 – 1770", 98],
  ["Alya", "alya", 100, 60, "285 – 1885", 163],
  ["Electra", "electra", 100, 60, "285 – 1885", 163],
  ["Anka", "anka", 50, 60, "285 – 1885", 98],
  ["Heka", "heka", 50, 60, "285 – 1885", 98],
  ["Açelya", "acelya", 100, 50, "270 – 1870", 151],
  ["Akasya", "akasya", 100, 50, "270 – 1870", 151],
];

// [ad, görsel, yükseklik aralığı mm]
const HAVLUPAN: [string, string, string][] = [
  ["Stil", "stil", "690 – 1600"],
  ["Rigel", "rigel", "700 – 1665"],
  ["Elit", "elit", "700 – 1665"],
  ["Capella", "capella", "700 – 1700"],
  ["Luna", "luna", "670 – 1720"],
  ["Vega", "vega", "670 – 1720"],
  ["Venüs", "venus", "740 – 1770"],
  ["Spica", "spica", "680 – 1800"],
  ["Star", "star", "705 – 1715"],
];

const ONE_CIKANLAR: [string, string][] = [
  ["%98 alüminyum", "AlMgSi0,5 alaşımı, ekstrüzyonla tek parça profil"],
  ["15 bar", "Her radyatör sızdırmazlık testinden geçer"],
  ["90 °C · 10 bar", "Maksimum işletme sıcaklığı ve basıncı"],
  ["EN 442 · TSE", "Avrupa radyatör normu ve TSE belgesi"],
  ["30 renk", "RAL renkleri, gold, krom ve ahşap desenleri"],
  ["Yerli üretim", "İstanbul'da üretilen Ayen markası"],
];

const AVANTAJ: [string, string][] = [
  ["Hızlı ısınır, az su ister", "Alüminyumun yüksek ısı iletimi sayesinde oda kısa sürede ısınır; dilim başına su hacmi düşüktür."],
  ["Kaynaksız, contasız gövde", "Su kanalları özel burç ile sıkı geçme yöntemiyle birleştirilir; 2,10 mm et kalınlığı."],
  ["Tortu tutmayan kanallar", "Pürüzsüz su kanallarında tortu birikmez; verim zamanla düşmez, korozyona dayanıklıdır."],
  ["Termostatik vana ile tasarruf", "Termostat kontrollü tesisatta odaya göre ısı ayarı ile enerji tasarrufu."],
  ["Her bağlantıya uygun", "Yandan, alttan ve çapraz bağlantı; havlupanlarda üstten, ortadan ve alttan giriş."],
  ["Elektrostatik toz boya", "Dayanıklı yüzey; istenirse elektrikli ısıtıcı kiti ile kullanılabilen havlupanlar."],
];

// Renk kartelası (renkler katalogdaki örneklerden alınmıştır, ekranda yaklaşık görünür)
const RENKLER: [string, string][] = [
  ["RAL 9003", "#ECECE7"], ["RAL 9001", "#E9E0D2"], ["Süt beyaz", "#F2F0EB"], ["Kırık beyaz", "#F0EBE0"], ["RAL 1013", "#E3D9C6"],
  ["RAL 1015", "#E7D2B5"], ["RAL 1019", "#A48F7A"], ["RAL 1035", "#908370"], ["RAL 1036", "#81653F"], ["RAL 3015", "#D9A0A6"],
  ["RAL 5003", "#1F3855"], ["RAL 5013", "#0E2E4F"], ["RAL 5024", "#6093AC"], ["RAL 6003", "#50533C"], ["RAL 6038", "#1BB24B"],
  ["RAL 7004", "#9B9B9B"], ["RAL 7006", "#766A5F"], ["RAL 7010", "#585C56"], ["RAL 7012", "#585E5F"], ["RAL 7022", "#4C4B45"],
  ["RAL 7030", "#928E85"], ["RAL 7032", "#B5B0A1"], ["RAL 7044", "#BFB6AD"], ["Antrasit", "#393E42"], ["RAL 8007", "#70462B"],
  ["Siyah", "#101011"], ["Krom", "linear-gradient(135deg,#d9d9d9,#8f8f8f 55%,#e6e6e6)"], ["Gold", "#CFB151"],
  ["Açık ahşap", "repeating-linear-gradient(100deg,#b58a55 0 6px,#a37b47 6px 9px)"], ["Koyu ahşap", "repeating-linear-gradient(100deg,#93683a 0 6px,#7e5830 6px 9px)"],
];

export default function AyenPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      <Header />
      <JsonLd
        veri={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: SITE },
                { "@type": "ListItem", position: 2, name: "Ürünler", item: `${SITE}/urunler` },
                { "@type": "ListItem", position: 3, name: "Ayen Alüminyum Radyatör", item: SAYFA },
              ],
            },
            {
              "@type": "ProductGroup",
              "@id": `${SAYFA}#panel`,
              name: "Ayen Alüminyum Panel Radyatörler",
              brand: { "@type": "Brand", name: "Ayen" },
              category: "Alüminyum radyatör",
              url: SAYFA,
              image: `${SITE}/ayen/ayen-class.jpg`,
              hasVariant: PANEL.map(([ad, g, dilim, kal, yuk, w]) => ({
                "@type": "Product",
                name: `Ayen ${ad} alüminyum radyatör`,
                brand: { "@type": "Brand", name: "Ayen" },
                image: `${SITE}/ayen/ayen-${g}.jpg`,
                additionalProperty: [
                  { "@type": "PropertyValue", name: "Dilim genişliği", value: dilim, unitText: "mm" },
                  { "@type": "PropertyValue", name: "Radyatör kalınlığı", value: kal, unitText: "mm" },
                  { "@type": "PropertyValue", name: "Yükseklik", value: yuk, unitText: "mm" },
                  { "@type": "PropertyValue", name: "Isıl güç (600 mm, dilim başına, Δt 60)", value: w, unitText: "W" },
                ],
              })),
            },
            {
              "@type": "ProductGroup",
              "@id": `${SAYFA}#havlupan`,
              name: "Ayen Alüminyum Havlupanlar",
              brand: { "@type": "Brand", name: "Ayen" },
              category: "Alüminyum havlupan",
              url: `${SAYFA}#havlupan`,
              hasVariant: HAVLUPAN.map(([ad, g]) => ({
                "@type": "Product",
                name: `Ayen ${ad} alüminyum havlupan`,
                brand: { "@type": "Brand", name: "Ayen" },
                image: `${SITE}/ayen/ayen-havlupan-${g}.jpg`,
              })),
            },
          ],
        }}
      />

      <main>
        {/* 1. HERO */}
        <section className="bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <nav aria-label="Sayfa yolu" className="text-xs text-slate-500">
                <Link href="/" className="hover:text-teal-700">Ana Sayfa</Link> <span aria-hidden>/</span>{" "}
                <Link href="/urunler" className="hover:text-teal-700">Ürünler</Link> <span aria-hidden>/</span>{" "}
                <span className="text-slate-700">Ayen Alüminyum Radyatör</span>
              </nav>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                AYEN · ALÜMİNYUM RADYATÖR
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">Ayen Alüminyum Radyatör</h1>
              <p className="text-lg font-semibold text-teal-700">Panel radyatör ve havlupan modelleri, 30 renk seçeneği.</p>
              <p className="text-base text-slate-600 leading-relaxed">
                Hızlı ısınan, hafif ve uzun ömürlü alüminyum radyatörler. Konut, ofis, otel ve villalar için 9 panel radyatör ve 9
                havlupan serisi; 300 mm&apos;den 1900 mm&apos;ye kadar yükseklik. Isı kaybı hesabına göre dilim sayısını belirliyor,
                radyatörü tesisatıyla birlikte satıyor ve monte ediyoruz.
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <a href="#panel" className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center font-bold text-slate-700 hover:border-teal-500/50 hover:text-teal-800 transition-colors">
                  Panel Radyatörler
                </a>
                <a href="#havlupan" className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center font-bold text-slate-700 hover:border-teal-500/50 hover:text-teal-800 transition-colors">
                  Havlupanlar
                </a>
                <a href="#renkler" className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center font-bold text-slate-700 hover:border-teal-500/50 hover:text-teal-800 transition-colors">
                  Renkler
                </a>
              </div>
              <div className="pt-2">
                <Link href="/iletisim" className="inline-block px-8 py-4 rounded-lg bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 shadow-sm transition-all text-center">
                  Fiyat Teklifi İsteyin →
                </Link>
              </div>
            </div>
            <div className="relative w-full aspect-[8/5] rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100">
              <Image src="/ayen/ayen-slider.jpg" alt="Ahşap desenli Ayen Class alüminyum radyatör" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          </div>
        </section>

        {/* 2. ÖNE ÇIKANLAR */}
        <section className="py-14 md:py-16">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
            {ONE_CIKANLAR.map(([deger, aciklama]) => (
              <div key={deger} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <p className="text-2xl sm:text-3xl font-bold text-teal-700">{deger}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{aciklama}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. PANEL RADYATÖRLER */}
        <section id="panel" className="scroll-mt-28 py-14 md:py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 space-y-8">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">PANEL RADYATÖRLER</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">9 dilimli alüminyum radyatör serisi</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Radyatör boyu dilim sayısıyla belirlenir; yükseklik 100 mm adımlarla seçilir. Isıl güçler 600 mm yükseklikte, dilim başına
                verilmiştir (Δt 60, 90/70/20 °C).
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {PANEL.map(([ad, g, dilim, kal, yuk, w]) => (
                <article key={ad} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="relative aspect-[1241/780] bg-slate-200">
                    <Image src={`/ayen/ayen-${g}.jpg`} alt={`Ayen ${ad} alüminyum radyatör`} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" className="object-cover" />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">Ayen {ad}</h3>
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                      <dt className="text-slate-500">Dilim genişliği</dt>
                      <dd className="text-right font-semibold text-slate-800">{dilim} mm</dd>
                      <dt className="text-slate-500">Kalınlık</dt>
                      <dd className="text-right font-semibold text-slate-800">{kal} mm</dd>
                      <dt className="text-slate-500">Yükseklik</dt>
                      <dd className="text-right font-semibold text-slate-800">{yuk} mm</dd>
                      <dt className="text-slate-500">Isıl güç (600&apos;lük)</dt>
                      <dd className="text-right font-semibold text-teal-700">{w} W / dilim</dd>
                    </dl>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 4. HAVLUPANLAR */}
        <section id="havlupan" className="scroll-mt-28 py-14 md:py-16">
          <div className="max-w-7xl mx-auto px-6 space-y-8">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">HAVLUPANLAR</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Alüminyum havlupan modelleri</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Banyolar için 9 farklı tasarım. Tüm modeller üstten, ortadan veya alttan bağlanabilir; yaz aylarında elektrikli ısıtıcı kiti
                ile de kullanılabilir.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {HAVLUPAN.map(([ad, g, yuk]) => (
                <figure key={ad} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="relative aspect-[894/1008] bg-slate-200">
                    <Image src={`/ayen/ayen-havlupan-${g}.jpg`} alt={`Ayen ${ad} alüminyum havlupan`} fill sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 45vw" className="object-cover" />
                  </div>
                  <figcaption className="p-3">
                    <p className="text-sm font-bold text-slate-900">Ayen {ad}</p>
                    <p className="text-[11px] text-slate-500">Yükseklik {yuk} mm</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* 5. NEDEN ALÜMİNYUM */}
        <section className="py-14 md:py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 space-y-8">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">NEDEN ALÜMİNYUM RADYATÖR</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Hafif, hızlı ve uzun ömürlü</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {AVANTAJ.map(([baslik, metin]) => (
                <div key={baslik} className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">✓</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{baslik}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{metin}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. RENKLER */}
        <section id="renkler" className="scroll-mt-28 py-14 md:py-16">
          <div className="max-w-7xl mx-auto px-6 space-y-6">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">RENK SEÇENEKLERİ</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Dekorasyonunuza uygun 30 renk</h2>
              <p className="text-sm text-slate-600 leading-relaxed">Renkler ekranda yaklaşık görünür; kesin renk için numune kartelasını gösteriyoruz.</p>
            </div>
            <ul className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-3">
              {RENKLER.map(([ad, renk]) => (
                <li key={ad} className="text-center">
                  <span className="block aspect-square rounded-lg border border-slate-300 shadow-sm" style={{ background: renk }} />
                  <span className="block text-[11px] text-slate-600 mt-1.5">{ad}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 7. CTA */}
        <section className="py-16 md:py-20 bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">SATIŞ · KEŞİF · MONTAJ</p>
              <h2 className="text-2xl sm:text-3xl font-bold">Doğru dilim sayısını birlikte belirleyelim</h2>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Oda oda ısı kaybı hesabı ve radyatör boyu seçimi</li>
                <li>• Eski radyatörlerin sökülüp yenisiyle değiştirilmesi</li>
                <li>• Termostatik vana, boru muhafazası ve havlupan elektrik kiti</li>
                <li>• Kombi, yoğuşmalı kazan veya ısı pompası ile uyumlu tesisat</li>
              </ul>
              <p className="text-sm text-slate-300 leading-relaxed">
                Isı kaybınızı kabaca görmek için{" "}
                <Link href="/hesaplama" className="text-teal-300 underline underline-offset-2">
                  kapasite hesaplama
                </Link>{" "}
                aracımızı kullanabilirsiniz. Alüminyum ve çelik panel radyatör farklarını{" "}
                <Link href="/blog/aluminyum-radyator-mu-celik-panel-radyator-mu" className="text-teal-300 underline underline-offset-2">
                  bu yazımızda
                </Link>{" "}
                anlattık.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-10 space-y-5">
              <h3 className="text-xl sm:text-2xl font-bold">Ayen radyatör fiyat teklifi alın.</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Oda ölçülerini, istediğiniz model ve rengi paylaşın; radyatör ve montaj teklifini hazırlayalım.
              </p>
              <Link href="/iletisim" className="block py-3.5 bg-teal-600 hover:bg-teal-500 text-white text-center font-bold text-sm rounded-lg transition-colors shadow-md">
                Teklif İsteyin →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
