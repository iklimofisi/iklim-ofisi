import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { JsonLd, SITE } from "@/components/YapisalVeri";
import SikSorulanSorular, { sssYapisalVeri, type Sss } from "@/components/SikSorulanSorular";

// -----------------------------------------------------------------------------
// HAVA PERDESİ SAYFASI (/hava-perdesi) — Niva ve Olefini
// Niva seri bilgileri (boylar, takılabilir yükseklik) Niva bayi listesinden alınmıştır.
// Fiyat yazılmaz. Görseller: public/hava-perdesi/
// -----------------------------------------------------------------------------

export const dynamic = "force-dynamic";

const SAYFA = `${SITE}/hava-perdesi`;

export const metadata: Metadata = {
  title: "Hava Perdesi — Isıtıcılı ve Isıtıcısız Niva, Olefini Modelleri | İstanbul",
  description:
    "Hava perdesi nedir, ne işe yarar? Niva ve Olefini hava perdeleri: ısıtıcılı ve ısıtıcısız modeller, 85–250 cm boy, 12 m'ye kadar montaj yüksekliği. Mağaza, restoran, otel, AVM ve endüstriyel kapılar için İstanbul'da satış, keşif ve montaj.",
  keywords: [
    "hava perdesi",
    "hava perdesi nedir",
    "hava perdesi ne işe yarar",
    "ısıtıcılı hava perdesi",
    "Niva hava perdesi",
    "Olefini hava perdesi",
    "endüstriyel hava perdesi",
    "kapı hava perdesi",
    "hava perdesi İstanbul",
  ],
  alternates: { canonical: "/hava-perdesi" },
  openGraph: {
    title: "Niva ve Olefini Hava Perdeleri | İklim Ofisi",
    description: "Isıtıcılı ve ısıtıcısız hava perdeleri; satış, keşif ve montaj.",
    url: SAYFA,
    images: [{ url: "/og/hava-perdesi.jpg", width: 1200, height: 630, alt: "Niva ve Olefini hava perdeleri" }],
  },
};

type Seri = { ad: string; tip: string; gorsel: string; boy: string; yukseklik: string; not: string };

// Niva bayi listesindeki seriler (ısıtıcısız / ısıtıcılı takılabilir yükseklik)
const NIVA: Seri[] = [
  { ad: "Linda", tip: "Genel tip", gorsel: "linda", boy: "85 – 200 cm", yukseklik: "3,0 m / 2,5 m", not: "Mağaza, ofis ve konut girişleri" },
  { ad: "Life", tip: "Ticari tip", gorsel: "life", boy: "100 – 250 cm", yukseklik: "4,0 m / 3,5 m", not: "Restoran, market ve ticari girişler" },
  { ad: "Smart Kaset", tip: "Tavana gömme", gorsel: "kaset", boy: "120 – 200 cm", yukseklik: "3,8 m / 3,5 m", not: "Asma tavana gömülü, görünmez montaj" },
  { ad: "Lena", tip: "Endüstriyel tip", gorsel: "lena", boy: "85 – 120 cm", yukseklik: "6,0 m / 6,0 m", not: "Depo, atölye ve yüksek kapılar" },
  { ad: "Dikey", tip: "Dikey montaj", gorsel: "dikey", boy: "200 – 300 cm yükseklik", yukseklik: "3,0 m genişlik", not: "Kapı üstünde yer olmayan girişler" },
  { ad: "Turbo", tip: "Endüstriyel tip", gorsel: "turbo", boy: "100 cm", yukseklik: "12 m", not: "Fabrika ve hangar gibi çok yüksek kapılar" },
];

const NEDEN: [string, string][] = [
  ["Enerji tasarrufu", "Kapı açıkken ısıtılan ya da soğutulan hava içeride kalır; klima ve kalorifer daha az çalışır."],
  ["Girişte konfor", "Kapı önündeki soğuk hava akımı ve cereyan hissedilmez; kasa ve karşılama alanı rahatlar."],
  ["Isıtıcılı modeller", "Kışın girişe sıcak hava bariyeri; ek ısıtıcıya gerek kalmadan kapı önü ısınır."],
  ["Kapı açık çalışma", "Müşteri trafiği yoğun mağaza ve restoranlarda kapı açık kalabilir, iklimlendirme bozulmaz."],
];

const SECIM: [string, string][] = [
  ["Kapı genişliği", "Hava perdesinin boyu kapı genişliğine eşit ya da biraz fazla olmalı; geniş kapılarda yan yana birden fazla cihaz kullanılır."],
  ["Montaj yüksekliği", "Cihazın takılacağı yükseklik seriyi belirler: 3 m'ye kadar Linda, 4 m'ye kadar Life, 6 m'ye kadar Lena, 12 m'ye kadar Turbo."],
  ["Isıtıcılı mı, ısıtıcısız mı", "Yalnız klimalı ortamlar için ısıtıcısız; kışın girişin ısınması isteniyorsa ısıtıcılı model seçilir."],
  ["Elektrik altyapısı", "Isıtıcılı modeller daha yüksek güç çeker; keşifte sigorta ve kablo kesitini birlikte kontrol ediyoruz."],
];

// Cevaplar yalnız bu sayfadaki Niva / Olefini bilgilerine dayanır
const SSS: Sss[] = [
  [
    "Hava perdesi ne işe yarar?",
    "Hava perdesi, kapının üstünden aşağıya doğru güçlü bir hava akımı üfleyerek kapı açıkken iç ve dış ortam arasında görünmez bir bariyer oluşturur. Böylece kışın ısıtılmış, yazın soğutulmuş hava içeride kalır; kapı önündeki cereyan azalır ve iş yerleri kapılarını açık tutabilir.",
  ],
  [
    "Hava perdesi enerji tasarrufu sağlar mı?",
    "Evet. Kapıdan kaçan şartlandırılmış hava azaldığı için klima ve kalorifer daha az çalışır. Kapısı gün boyu açılıp kapanan mağaza, restoran ve market gibi işletmelerde tasarruf daha belirgindir.",
  ],
  [
    "Isıtıcılı mı, ısıtıcısız hava perdesi mi almalıyım?",
    "Mekân zaten klima veya kaloriferle iyi ısıtılıyorsa ısıtıcısız model yeterli olabilir. Kışın giriş bölümünün de ısınması isteniyorsa ısıtıcılı model seçilir. Isıtıcılı modeller daha yüksek elektrik gücü çektiği için sigorta ve kablo kesiti keşifte kontrol edilir.",
  ],
  [
    "Hava perdesi boyu nasıl seçilir?",
    "Hava perdesinin boyu kapı genişliğine eşit ya da biraz fazla olmalıdır; hava akımı kapının tamamını kapsamazsa kenarlardan hava kaçar. Niva modelleri seriye göre 85 cm ile 250 cm arasında boylarda üretilir; daha geniş kapılarda birden fazla cihaz yan yana monte edilir.",
  ],
  [
    "Hava perdesi kaç metre yüksekliğe takılabilir?",
    "Montaj yüksekliği seriyi belirler. Niva ısıtıcısız modellerde Linda 3 m'ye, Smart Kaset 3,8 m'ye, Life 4 m'ye, endüstriyel Lena 6 m'ye ve Turbo 12 m'ye kadar uygundur. Isıtıcılı modellerde bu yükseklikler biraz daha düşüktür (ör. Linda 2,5 m, Life 3,5 m).",
  ],
  [
    "Kapının üstünde yer yoksa ne yapılır?",
    "Asma tavanlı mekânlarda tavana gömme Smart Kaset modeli görünmez bir çözüm sunar. Kapı üstünde hiç yer yoksa Niva Dikey modeli kapının yanına dikey olarak monte edilir.",
  ],
];

export default function HavaPerdesiPage() {
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
                { "@type": "ListItem", position: 3, name: "Hava Perdesi", item: SAYFA },
              ],
            },
            {
              "@type": "ProductGroup",
              "@id": `${SAYFA}#niva`,
              name: "Niva Hava Perdeleri",
              brand: { "@type": "Brand", name: "Niva" },
              category: "Hava perdesi",
              url: `${SAYFA}#niva`,
              hasVariant: NIVA.map((s) => ({
                "@type": "Product",
                name: `Niva ${s.ad} hava perdesi`,
                brand: { "@type": "Brand", name: "Niva" },
                image: `${SITE}/hava-perdesi/niva-${s.gorsel}.jpg`,
                description: `${s.tip}. ${s.not}.`,
              })),
            },
            {
              "@type": "Product",
              "@id": `${SAYFA}#olefini`,
              name: "Olefini Hava Perdeleri",
              brand: { "@type": "Brand", name: "Olefini" },
              category: "Hava perdesi",
              image: `${SITE}/hava-perdesi/olefini-giris.jpg`,
              url: `${SAYFA}#olefini`,
            },
            sssYapisalVeri(SSS),
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
                <span className="text-slate-700">Hava Perdesi</span>
              </nav>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                NİVA · OLEFİNİ
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">Hava Perdeleri</h1>
              <p className="text-lg font-semibold text-teal-700">Kapı açıkken bile ısıtılan ya da soğutulan hava içeride kalsın.</p>
              <p className="text-base text-slate-600 leading-relaxed">
                Mağaza, restoran, otel, AVM, depo ve fabrika girişleri için Niva ve Olefini hava perdeleri. Isıtıcılı ve ısıtıcısız
                modeller; 85 cm&apos;den 250 cm&apos;ye kadar boy, 12 m&apos;ye kadar montaj yüksekliği. Kapınıza uygun modeli seçiyor,
                satışını ve montajını yapıyoruz.
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <a href="#niva" className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center font-bold text-slate-700 hover:border-teal-500/50 hover:text-teal-800 transition-colors">
                  Niva
                </a>
                <a href="#olefini" className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center font-bold text-slate-700 hover:border-teal-500/50 hover:text-teal-800 transition-colors">
                  Olefini
                </a>
                <a href="#secim" className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center font-bold text-slate-700 hover:border-teal-500/50 hover:text-teal-800 transition-colors">
                  Nasıl seçilir?
                </a>
              </div>
              <div className="pt-2">
                <Link href="/iletisim" className="inline-block px-8 py-4 rounded-lg bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 shadow-sm transition-all text-center">
                  Fiyat Teklifi İsteyin →
                </Link>
              </div>
            </div>
            <div className="relative w-full aspect-[768/633] rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100">
              <Image src="/hava-perdesi/olefini-giris.jpg" alt="Cam giriş kapısı üzerinde Olefini hava perdesi" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          </div>
        </section>

        {/* 2. NEDEN HAVA PERDESİ */}
        <section className="py-14 md:py-16">
          <div className="max-w-7xl mx-auto px-6 space-y-8">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">NEDEN HAVA PERDESİ</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Hava perdesi ne işe yarar?</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Hava perdesi kapının üstünden aşağıya doğru güçlü bir hava akımı üfler. Bu görünmez bariyer iç ve dış ortam arasındaki
                hava geçişini azaltır.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {NEDEN.map(([baslik, metin]) => (
                <div key={baslik} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900">{baslik}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{metin}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. NİVA */}
        <section id="niva" className="scroll-mt-28 py-14 md:py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 space-y-8">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">NİVA</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Niva hava perdeleri</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Genel, ticari, tavana gömme, endüstriyel ve dikey tipte 6 seri. Seriler ısıtıcılı ve ısıtıcısız olarak üretilir
                (Turbo yalnız ısıtıcısız).
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {NIVA.map((s) => (
                <article key={s.ad} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                  <div className="relative aspect-[720/396] bg-white">
                    <Image src={`/hava-perdesi/niva-${s.gorsel}.jpg`} alt={`Niva ${s.ad} hava perdesi`} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" className="object-contain" />
                  </div>
                  <div className="p-4 space-y-2 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-lg font-bold text-slate-900">Niva {s.ad}</h3>
                      <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wide">{s.tip}</span>
                    </div>
                    <p className="text-xs text-slate-600">{s.not}</p>
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs pt-1">
                      <dt className="text-slate-500">{s.ad === "Dikey" ? "Cihaz" : "Boy"}</dt>
                      <dd className="text-right font-semibold text-slate-800">{s.boy}</dd>
                      <dt className="text-slate-500">{s.ad === "Dikey" ? "Takılabilir" : s.ad === "Turbo" ? "Takılabilir yükseklik" : "Takılabilir yükseklik*"}</dt>
                      <dd className="text-right font-semibold text-slate-800">{s.yukseklik}</dd>
                    </dl>
                  </div>
                </article>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">* Isıtıcısız / ısıtıcılı model için en fazla montaj yüksekliği.</p>
          </div>
        </section>

        {/* 4. OLEFİNİ */}
        <section id="olefini" className="scroll-mt-28 py-14 md:py-16">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">OLEFİNİ</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Olefini hava perdeleri</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Şık tasarımı ve dijital kontrol paneliyle Olefini hava perdeleri; mağaza, otel, restoran ve ofis girişlerinde
                dekorasyonla uyumlu bir çözüm sunar. Kapınızın ölçüsüne ve montaj yüksekliğine göre doğru modeli
                belirleyip teklif hazırlıyoruz.
              </p>
              <Link href="/iletisim" className="inline-block px-6 py-3 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-teal-700 transition-colors">
                Olefini için teklif isteyin →
              </Link>
            </div>
            <div className="lg:col-span-3 grid grid-cols-2 gap-4">
              <div className="relative aspect-[768/633] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <Image src="/hava-perdesi/olefini-giris.jpg" alt="Cam giriş kapısı üzerinde Olefini hava perdesi" fill sizes="(min-width: 1024px) 28vw, 45vw" className="object-cover" />
              </div>
              <div className="relative aspect-[768/633] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <Image src="/hava-perdesi/olefini-kapi.jpg" alt="Ahşap çift kanatlı kapı üzerinde Olefini hava perdesi" fill sizes="(min-width: 1024px) 28vw, 45vw" className="object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* 5. SEÇİM */}
        <section id="secim" className="scroll-mt-28 py-14 md:py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 space-y-8">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">NASIL SEÇİLİR</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Doğru hava perdesi için 4 ölçü</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SECIM.map(([baslik, metin], i) => (
                <div key={baslik} className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <p className="text-2xl font-bold text-teal-700">{i + 1}</p>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{baslik}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{metin}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Seçim ve montaj ipuçlarını daha ayrıntılı anlattığımız yazı:{" "}
              <Link href="/blog/hava-perdesi-nedir-nasil-secilir" className="text-teal-700 underline underline-offset-2">
                Hava Perdesi Nedir, Ne İşe Yarar, Nasıl Seçilir?
              </Link>
            </p>
          </div>
        </section>

        {/* 6. SIK SORULAN SORULAR */}
        <SikSorulanSorular
          baslik="Hava perdesi hakkında merak edilenler"
          sss={SSS}
          ilgili={[{ href: "/blog/hava-perdesi-nedir-nasil-secilir", ad: "Hava Perdesi Nedir, Ne İşe Yarar, Nasıl Seçilir?" }]}
        />

        {/* 7. CTA */}
        <section className="py-16 md:py-20 bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">SATIŞ · KEŞİF · MONTAJ</p>
              <h2 className="text-2xl sm:text-3xl font-bold">Kapınıza uygun hava perdesini birlikte seçelim</h2>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Kapı ölçüsü ve montaj yüksekliğine göre model seçimi</li>
                <li>• Isıtıcılı modellerde elektrik altyapısı kontrolü</li>
                <li>• Montaj, kumanda bağlantısı ve devreye alma</li>
              </ul>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-10 space-y-5">
              <h3 className="text-xl sm:text-2xl font-bold">Hava perdesi fiyat teklifi alın.</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Kapı genişliğini, montaj yüksekliğini ve ısıtıcılı/ısıtıcısız tercihinizi paylaşın; Niva ve Olefini seçenekleriyle
                teklif hazırlayalım.
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
