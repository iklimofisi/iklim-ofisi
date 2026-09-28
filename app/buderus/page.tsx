import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { JsonLd, SITE } from "@/components/YapisalVeri";

export const dynamic = "force-dynamic";

const KATALOG = "/kataloglar/buderus-logamax-plus-gb272-katalog.pdf";

export const metadata: Metadata = {
  title: "Buderus Logamax plus GB272 Yoğuşmalı Kazan — 49–150 kW, Kaskad",
  description:
    "Buderus Logamax plus GB272 duvar tipi yoğuşmalı kazan: 49, 69, 100, 125 ve 150 kW, 16 kazana kadar kaskad ile 2.400 kW. Teknik veriler, kaskad çözümleri ve PDF katalog. İstanbul'da projelendirme ve montaj.",
  alternates: { canonical: "/buderus" },
  openGraph: {
    title: "Buderus Logamax plus GB272 | İklim Ofisi",
    description: "49–150 kW duvar tipi yoğuşmalı kazan; kaskad ile 2.400 kW'a kadar merkezi ısıtma çözümleri.",
    url: "https://iklimofisi.com/buderus",
    images: [{ url: "/buderus/gb272-slider.jpg", width: 1200, height: 750, alt: "Buderus Logamax plus GB272 yoğuşmalı kazan" }],
  },
};

// Değerler Buderus Logamax plus GB272 kataloğundaki "Teknik veriler" tablosundan alınmıştır.
const MODELLER = ["49", "69", "100", "125", "150"] as const;

const TEKNIK: { baslik: string; satirlar: [string, string, string[]][] }[] = [
  {
    baslik: "Kapasite ve verim",
    satirlar: [
      ["Kazan kapasitesi, tam yük (80/60 °C)", "kW", ["46,5", "62,6", "94,5", "118,1", "141,7"]],
      ["Kazan kapasitesi, tam yük (50/30 °C)", "kW", ["49,9", "69,5", "99,5", "124,5", "146"]],
      ["Kazan kapasitesi, min. yük (50/30 °C)", "kW", ["14,3", "14,3", "19", "26,2", "26,2"]],
      ["Standart verim Hs/Hi (40/30 °C)", "%", ["98,7 / 109,7", "99,4 / 110,4", "99,3 / 110,3", "99,4 / 110,4", "99,6 / 110,6"]],
      ["Standart verim Hs/Hi (75/60 °C)", "%", ["95,4 / 106,0", "96,2 / 106,9", "96,1 / 106,8", "96,5 / 107,2", "96,6 / 107,3"]],
      ["Maks. gidiş suyu sıcaklığı", "°C", ["85", "85", "85", "85", "85"]],
      ["Maks. çalışma basıncı", "bar", ["6", "6", "6", "6", "6"]],
    ],
  },
  {
    baslik: "Emisyon ve ses",
    satirlar: [
      ["NOx emisyonu, tam yük (EN 15502)", "mg/kWh", ["25", "34", "38", "40", "45"]],
      ["NOx sınıfı", "–", ["6", "6", "6", "6", "6"]],
      ["Ses gücü seviyesi, %100 kapasite", "dB(A)", ["55", "61", "60,7", "59,5", "64,3"]],
      ["Maks. yoğuşma suyu miktarı", "l/h", ["6", "7,6", "11", "13,5", "16"]],
    ],
  },
  {
    baslik: "Bağlantılar ve diğer",
    satirlar: [
      ["Isıtma gidiş / dönüş bağlantısı", "inç", ["G1½", "G1½", "G1½", "G1½", "G1½"]],
      ["Gaz bağlantısı", "inç", ["R1", "R1", "R1", "R1", "R1"]],
      ["Baca bağlantı çapı", "–", ["DN110/160", "DN110/160", "DN110/160", "DN110/160", "DN110/160"]],
      ["Ağırlık", "kg", ["74", "74", "74", "96", "96"]],
      ["Su hacmi", "l", ["5", "5", "5", "10,9", "10,9"]],
      ["Elektrik tüketimi (pompa hariç)", "W", ["31", "64", "133", "152", "243"]],
      ["Elektrik beslemesi", "V / Hz", ["230 / 50", "230 / 50", "230 / 50", "230 / 50", "230 / 50"]],
    ],
  },
];

const ONE_CIKANLAR: [string, string][] = [
  ["49 – 150 kW", "5 farklı kapasite: 49, 69, 100, 125 ve 150 kW"],
  ["2.400 kW", "16 kazana kadar kaskad, tek kumanda üzerinden"],
  ["%110+", "Norm kullanma verimi (alt ısıl değere göre)"],
  ["1:6", "Modülasyon oranı; ihtiyaca göre anlık kapasite"],
  ["85 °C", "Tam kapasitede maksimum gidiş suyu sıcaklığı"],
  ["NOx sınıf 6", "25 mg/kWh'e kadar düşük emisyon"],
];

const TEKNOLOJI = [
  ["Üstten erişim", "Tüm elektrik bağlantılarına kazanın üst kısmından ulaşılır."],
  ["Logamatic BC30 kumanda", "Renkli ekran ve aydınlatmalı dokunmatik tuşlarla tüm bilgiler bir bakışta."],
  ["ALU plus eşanjör", "Uzun ömürlü, yüzey kaplamalı alüminyum-magnezyum-silisyum (AlMgSi) ısı eşanjörü."],
  ["Gaz ön karışımlı brülör", "Doğal gaz ve propan ile kullanıma uygun."],
  ["Verimli fan", "Sessiz ve konforlu çalışma; bekleme konumunda yalnızca 2 W tüketim."],
  ["Kaskad baca klapesi", "125 ve 150 kW modellerde baca gazı klapesi entegre gelir."],
];

const KULLANIM = ["Çok daireli konutlar", "Kamu binaları", "Ticari binalar", "Oteller & tesisler"];

function KatalogButonu({ koyu = false }: { koyu?: boolean }) {
  return (
    <a
      href={KATALOG}
      target="_blank"
      rel="noopener noreferrer"
      download="Buderus-Logamax-plus-GB272-Katalog.pdf"
      className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-sm transition-all text-center ${
        koyu
          ? "bg-white/10 border border-white/20 text-white hover:bg-white/20"
          : "bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
      </svg>
      Kataloğu İndir (PDF)
    </a>
  );
}

export default function BuderusPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      <Header />
      <JsonLd
        veri={{
          "@context": "https://schema.org",
          "@graph": MODELLER.map((m, i) => ({
            "@type": "Product",
            "@id": `${SITE}/buderus#gb272-${m}`,
            name: `Buderus Logamax plus GB272-${m}`,
            brand: { "@type": "Brand", name: "Buderus" },
            category: "Duvar tipi gaz yoğuşmalı kazan",
            description: `${m} kW Buderus Logamax plus GB272 duvar tipi yoğuşmalı kazan. 16 kazana kadar kaskad, 85 °C gidiş suyu, NOx sınıf 6.`,
            image: `${SITE}/buderus/gb272-kapak.jpg`,
            url: `${SITE}/buderus`,
            additionalProperty: TEKNIK.flatMap((g) =>
              g.satirlar.map(([ad, birim, degerler]) => ({
                "@type": "PropertyValue",
                name: ad,
                value: degerler[i],
                ...(birim !== "–" ? { unitText: birim } : {}),
              }))
            ),
          })),
        }}
      />

      <main>
        {/* 1. HERO */}
        <section className="bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                BUDERUS · YOĞUŞMALI KAZAN
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
                Buderus Logamax plus GB272
              </h1>
              <p className="text-lg font-semibold text-teal-700">Kompakt ısı merkezi: 49–150 kW, kaskad ile 2.400 kW.</p>
              <p className="text-base text-slate-600 leading-relaxed">
                Konutlar, kamu ve ticari binalar için duvar tipi gaz yoğuşmalı kazan. Duvara ya da yer montaj kiti ile doğrudan
                zemine kurulabilir; dar veya alçak tavanlı kazan dairelerinde bile 2 m²&apos;den az alanda 900 kW kurulu güç sağlar.
                Isı kaybı hesabından kaskad tasarımına, montajdan devreye almaya kadar projenizi tek elden yürütüyoruz.
              </p>
              <div className="grid grid-cols-5 gap-2 text-xs">
                {MODELLER.map((m) => (
                  <a
                    key={m}
                    href="#teknik"
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center font-bold text-slate-700 hover:border-teal-500/50 hover:text-teal-800 transition-colors"
                  >
                    {m} kW
                  </a>
                ))}
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/iletisim"
                  className="px-8 py-4 rounded-lg bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 shadow-sm transition-all text-center"
                >
                  Fiyat Teklifi İsteyin →
                </Link>
                <KatalogButonu />
              </div>
            </div>

            <div className="relative w-full max-w-xs sm:max-w-md mx-auto lg:max-w-none aspect-[4/5] rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900">
              <Image
                src="/buderus/gb272-kapak.jpg"
                alt="Duvara monte Buderus Logamax plus GB272 yoğuşmalı kazan"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
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

        {/* 3. TEKNOLOJİ */}
        <section className="py-14 md:py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-5 gap-10 items-center">
            <div className="lg:col-span-2 flex justify-center">
              <div className="relative w-full max-w-[18rem] aspect-[361/767]">
                <Image
                  src="/buderus/gb272-kesit.jpg"
                  alt="Buderus Logamax plus GB272 iç yapısı: eşanjör, brülör, fan ve kumanda paneli"
                  fill
                  sizes="18rem"
                  className="object-contain"
                />
              </div>
            </div>
            <div className="lg:col-span-3 space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">TEKNOLOJİ</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Her şeyin temelinde verimlilik</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Buderus&apos;un 40 yılı aşkın duvar tipi kazan deneyimiyle geliştirilen GB272; yüksek verim, düşük emisyon ve
                  kolay servis için tasarlandı. Kazan; sıcaklık, basınç ve baca gazı sensörleri takılı ve kablolanmış olarak
                  fabrikadan çıkar. Ön kapak tek hareketle açılır, tüm bileşenlere servis için erişilir.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {TEKNOLOJI.map(([baslik, metin]) => (
                  <div key={baslik} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                      ✓
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{baslik}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{metin}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. KASKAD VE KONTROL */}
        <section className="py-14 md:py-16">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row gap-6 items-center">
              <div className="relative w-40 shrink-0 aspect-[205/268]">
                <Image src="/buderus/gb272-kaskad.jpg" alt="İkili kaskad Buderus GB272 kazan grubu" fill sizes="10rem" className="object-contain" />
              </div>
              <div className="space-y-3">
                <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">KASKAD</p>
                <h2 className="text-xl font-bold text-slate-900">Büyük binalar için kaskad sistemler</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  16 kazana kadar kaskad bağlantıyla toplam 2.400 kW. Kazanlar yan yana bitişik dizilebilir; ihtiyaca göre
                  devreye girip çıkarak her yükte verimli çalışır. Güneş enerjisi veya ısı pompası gibi yenilenebilir
                  kaynaklarla birlikte daha da verimli çalışır.
                </p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-3">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">KONTROL</p>
              <h2 className="text-xl font-bold text-slate-900">Akıllı kontrol, bina otomasyonuna uyum</h2>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Ek kumanda paneline gerek kalmadan bir ısıtma ve bir boyler devresi kontrolü</li>
                <li>• Logamatic EMS plus / RC310 ile 4 ısıtma + 2 boyler devresine kadar kumanda</li>
                <li>• Logamatic 5000 / 5313: 7 inç dokunmatik ekran, entegre Modbus TCP/IP ve Ethernet</li>
                <li>• 0–10 V BMS sinyali, toplu arıza bilgisi ve internet üzerinden uzaktan erişim</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. TEKNİK VERİLER */}
        <section id="teknik" className="scroll-mt-28 py-14 md:py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">TEKNİK VERİLER</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Model karşılaştırması</h2>
              </div>
              <KatalogButonu />
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full min-w-[46rem] text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th scope="col" className="text-left font-semibold px-4 py-3">Logamax plus GB272</th>
                    <th scope="col" className="text-left font-semibold px-2 py-3">Birim</th>
                    {MODELLER.map((m) => (
                      <th key={m} scope="col" className="text-right font-bold px-4 py-3 whitespace-nowrap">
                        {m} kW
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TEKNIK.map((g) => [
                    <tr key={g.baslik} className="bg-teal-50/60">
                      <th colSpan={7} scope="colgroup" className="text-left font-bold text-teal-800 px-4 py-2">
                        {g.baslik}
                      </th>
                    </tr>,
                    ...g.satirlar.map(([ad, birim, degerler]) => (
                      <tr key={ad} className="border-t border-slate-100">
                        <th scope="row" className="text-left font-medium text-slate-700 px-4 py-2 min-w-[14rem]">
                          {ad}
                        </th>
                        <td className="px-2 py-2 text-slate-500 whitespace-nowrap">{birim}</td>
                        {degerler.map((d, i) => (
                          <td key={i} className="px-4 py-2 text-right text-slate-800 whitespace-nowrap">
                            {d}
                          </td>
                        ))}
                      </tr>
                    )),
                  ])}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500">Kaynak: Buderus Logamax plus GB272 ürün kataloğu. Tüm teknik veriler ve tesisat şemaları için kataloğu indirin.</p>
          </div>
        </section>

        {/* 6. KULLANIM ALANLARI + CTA */}
        <section className="py-16 md:py-20 bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">KULLANIM ALANLARI</p>
              <h2 className="text-2xl sm:text-3xl font-bold">Konuttan ticari binaya merkezi ısıtma</h2>
              <div className="grid grid-cols-2 gap-3">
                {KULLANIM.map((k) => (
                  <div key={k} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm font-bold text-center">
                    {k}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Kazan seçimini binanın ısı kaybı hesabına göre yapıyoruz. Isı kaybınızı kabaca görmek için{" "}
                <Link href="/hesaplama" className="text-teal-300 underline underline-offset-2">
                  kapasite hesaplama
                </Link>{" "}
                aracımızı kullanabilirsiniz.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-10 space-y-5">
              <h3 className="text-xl sm:text-2xl font-bold">Binanız için doğru kapasiteyi birlikte belirleyelim.</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Bina tipini, ısıtılacak alanı, mevcut sistemi ve sıcak su ihtiyacınızı paylaşın; tek kazan ya da kaskad çözümü ve
                fiyat teklifini hazırlayalım.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/iletisim"
                  className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-500 text-white text-center font-bold text-sm rounded-lg transition-colors shadow-md"
                >
                  Teklif İsteyin →
                </Link>
                <KatalogButonu koyu />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
