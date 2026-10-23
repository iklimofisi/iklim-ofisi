import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { JsonLd, SITE } from "@/components/YapisalVeri";

// -----------------------------------------------------------------------------
// TCL VRF ÜRÜN SAYFASI (/tcl-vrf)
// "TCL VRF", "TCL VRF klima", "TCL TMV6+", "TCL Mini VRF" aramaları için hazırlandı.
// Tüm teknik değerler TCL TMV6+ Super Serisi Akıllı VRF kataloğundan (2026, Türkçe) alınmıştır.
// Görseller kataloğun ürün sayfalarından kesildi: public/tcl/
// -----------------------------------------------------------------------------

export const dynamic = "force-dynamic";

const KATALOG = "/kataloglar/tcl-vrf-tmv6-super-katalog-2026.pdf";
const SAYFA = `${SITE}/tcl-vrf`;

export const metadata: Metadata = {
  title: "TCL VRF Sistemleri — TMV6+ Super Serisi ve Mini VRF | İstanbul",
  description:
    "TCL VRF klima sistemleri: TMV6+ Super tam DC inverter VRF (8–32 HP modül, 128 HP'ye kadar, 80 iç ünite) ve TCL Mini VRF (8–28 kW). Teknik veriler, iç ünite gamı, PDF katalog. İstanbul'da keşif, projelendirme ve montaj.",
  keywords: ["TCL VRF", "TCL VRF klima", "TCL TMV6+", "TCL TMV6 Super", "TCL Mini VRF", "TCL klima", "TCL VRF fiyat", "TCL VRF katalog", "VRF klima İstanbul"],
  alternates: { canonical: "/tcl-vrf" },
  openGraph: {
    title: "TCL VRF Sistemleri — TMV6+ Super Serisi | İklim Ofisi",
    description: "Tam DC inverter TCL VRF: 128 HP'ye kadar kombinasyon, tek sistemde 80 iç ünite, SEER 7,35. Teknik veriler ve PDF katalog.",
    url: SAYFA,
    images: [{ url: "/slider/slider-tcl-vrf.jpg", alt: "TCL TMV6+ Super Serisi VRF dış ünitesi" }],
  },
};

// ---- Dış ünite (TMV-VED+(**)W/AS-D(E)) — katalog "Dış Ünite Parametreleri (8-32HP)" ----
// [HP, model kodu eki, soğutma kW, soğutmada çekilen güç kW, SEER, ısıtma kW, maks. ısıtma kW, SCOP]
const DIS_UNITELER: [number, string, string, string, string, string, string, string][] = [
  [8, "252", "25,2", "7,85", "7,35", "25,2", "28,0", "4,50"],
  [10, "280", "28,0", "8,89", "7,26", "28,0", "30,8", "4,45"],
  [12, "335", "33,5", "12,50", "7,05", "33,5", "36,8", "4,40"],
  [14, "400", "40,0", "14,55", "6,75", "40,0", "45,0", "4,42"],
  [16, "450", "45,0", "18,00", "6,25", "45,0", "50,0", "4,39"],
  [18, "504", "50,4", "19,53", "6,61", "50,4", "56,0", "4,40"],
  [20, "560", "56,0", "24,24", "6,41", "56,0", "61,0", "4,35"],
  [22, "615", "61,5", "30,00", "6,20", "61,5", "68,0", "4,30"],
  [24, "680", "68,0", "31,48", "6,50", "68,0", "75,0", "4,50"],
  [26, "730", "73,0", "39,46", "5,50", "73,0", "80,0", "4,16"],
  [28, "785", "78,5", "34,45", "6,26", "78,5", "86,0", "4,28"],
  [30, "850", "85,0", "39,95", "6,16", "85,0", "93,0", "4,20"],
  [32, "900", "90,0", "45,00", "5,97", "90,0", "100,0", "4,20"],
];

const DIS_GOVDELER = [
  { hp: "8 – 12 HP", gorsel: "/tcl/tcl-dis-8-12hp.jpg" },
  { hp: "14 – 22 HP", gorsel: "/tcl/tcl-dis-14-22hp.jpg" },
  { hp: "24 – 26 HP", gorsel: "/tcl/tcl-dis-24-26hp.jpg" },
  { hp: "28 – 32 HP", gorsel: "/tcl/tcl-dis-28-32hp.jpg" },
];

// ---- Mini VRF (TMV-Vd(**)W/N1-D(EU)) — katalog "Mini VRF Parametreleri" ----
// [model eki, besleme, soğutma kW, SEER, ısıtma kW, SCOP]
const MINI_VRF: [string, string, string, string, string, string][] = [
  ["80", "1 faz", "8,0", "5,4", "8,0", "3,8"],
  ["100", "1 faz", "9,0", "5,4", "9,0", "3,8"],
  ["120", "1 faz", "12,1", "7,0", "12,1", "4,3"],
  ["140", "1 faz", "14,0", "6,9", "14,0", "4,2"],
  ["160", "1 faz", "15,5", "6,8", "16,0", "4,2"],
  ["180", "3 faz", "18,0", "7,0", "18,0", "4,4"],
  ["224", "3 faz", "22,4", "6,8", "22,4", "4,2"],
  ["252", "3 faz", "25,2", "6,6", "25,2", "4,3"],
  ["280", "3 faz", "28,0", "6,4", "28,0", "4,3"],
];

const ONE_CIKANLAR: [string, string][] = [
  ["128 HP", "8–32 HP modüllerin serbest kombinasyonu"],
  ["80 iç ünite", "Tek soğutucu akışkan sistemine bağlanabilen iç ünite"],
  ["SEER 7,35", "Soğutmada sezonsal verim; ısıtmada SCOP 4,50'ye kadar"],
  ["-30 °C ~ 56 °C", "Isıtmada -30 °C'ye, soğutmada 56 °C'ye kadar çalışma"],
  ["1.100 m", "Toplam boru uzunluğu; en uzak iç üniteye 220 m"],
  ["Eurovent · CE", "Sertifikalı tam DC inverter VRF serisi"],
];

const TEKNOLOJI: [string, string][] = [
  ["DC inverter scroll kompresör", "Asimetrik scroll profili ve buhar enjeksiyonu (EVI); 0–480 Hz kademesiz frekans kontrolü."],
  ["Çift entalpili ısıtma", "Düşük dış sıcaklıkta soğutucu akışkan debisi artırılır; -30 °C'de bile kararlı ısıtma."],
  ["Çift \"C\" tipi eşanjör", "Daha geniş ısı transfer yüzeyi, kompakt gövde."],
  ["3 aşamalı aşırı soğutma", "Eşanjör ve akış yolu tasarımıyla ısı değişim verimi artırılır."],
  ["6 aşamalı yağ dönüşü", "Yağ ayırma, geri dönüş ve dengeleme ile uzun boru hatlarında kompresör güvenliği."],
  ["Üçlü yedekleme", "Kompresör, modül ve sensör yedek çalışması; bir arıza tüm sistemi durdurmaz."],
  ["130 Pa dış statik basınç", "Katlı veya kapalı alanlara yerleşimde sıcak havanın uzaklaştırılması (standart 80 Pa)."],
  ["Polaritesiz CAN bus haberleşme", "İç–dış ünite haberleşmesinde artı/eksi ayrımı yok; tek dokunuşla devreye alma."],
];

const IC_UNITELER: { ad: string; gorsel: string; yer: string; ozellik: string }[] = [
  { ad: "360° Kaset Tipi", gorsel: "/tcl/tcl-ic-360-kaset.jpg", yer: "Ofis, restoran, süpermarket, AVM, lobi", ozellik: "360° hava dağılımı, 2.100 m³/h'e kadar hava debisi" },
  { ad: "Kompakt Kaset Tipi", gorsel: "/tcl/tcl-ic-kompakt-kaset.jpg", yer: "Ofis, restoran, mağaza, lobi", ozellik: "Ultra düşük ses, 7 kademeli fan hızı" },
  { ad: "İnce Kanallı Tip", gorsel: "/tcl/tcl-ic-ince-kanalli.jpg", yer: "Ofis, otel odası, toplantı salonu, konut", ozellik: "Gizli tavan montajı, sabit hava debisi" },
  { ad: "Orta / Yüksek Statik Basınçlı Kanallı", gorsel: "/tcl/tcl-ic-orta-yuksek-statik-kanalli.jpg", yer: "Ofis, konferans salonu, restoran, salon", ozellik: "245 mm ince gövde, sabit hava debisi" },
  { ad: "Ultra Yüksek Statik Basınçlı Kanallı", gorsel: "/tcl/tcl-ic-ultra-yuksek-statik-kanalli.jpg", yer: "Atölye, otel, AVM, balo salonu, geniş alanlar", ozellik: "Uzun kanal hatları ve büyük hacimler için" },
  { ad: "Duvar Tipi", gorsel: "/tcl/tcl-ic-duvar.jpg", yer: "Oturma odası, çalışma odası, görüşme odası", ozellik: "Dahili elektronik genleşme vanası, sessiz çalışma" },
  { ad: "Taze Havalı Tip", gorsel: "/tcl/tcl-ic-taze-havali.jpg", yer: "Sinema, otel, lobi, salonlar", ozellik: "Dış havayı şartlandırarak içeri verir" },
  { ad: "Yer / Tavan Tipi", gorsel: "/tcl/tcl-ic-yer-tavan.jpg", yer: "Oturma odası, çalışma odası, görüşme odası", ozellik: "Ultra ince gövde; yere veya tavana montaj" },
  { ad: "Tek Yönlü Kaset Tipi", gorsel: "/tcl/tcl-ic-tek-yonlu-kaset.jpg", yer: "Oturma odası, yemek odası, ofis, lobi", ozellik: "İnce gövde, yüksek basınçlı drenaj pompası" },
  { ad: "İki Yönlü Kaset Tipi", gorsel: "/tcl/tcl-ic-iki-yonlu-kaset.jpg", yer: "Çalışma odası, yemek odası, küçük toplantı odası", ozellik: "İki yöne üfleme, drenaj pompası standart" },
];

const KONTROL: [string, string][] = [
  ["Kablosuz ve kablolu kumandalar", "Mod, sıcaklık, fan hızı, uyku ve zamanlayıcı; kablolu kumandada LCD ekranla durum izleme."],
  ["Merkezi dokunmatik kumanda", "7 inç modelde 16 sistem ve 1.280 iç ünite; 10,1 inç modelde zamanlama ve arıza geçmişi."],
  ["WiFi ve Tsmart uygulaması", "WiFi modülüyle tek ünite, grup veya tüm sistemi telefondan yönetme."],
  ["AHU bağlantı kiti", "TCL VRF dış ünitesini üçüncü parti klima santrallerine bağlama çözümü."],
];

const SSS: [string, string][] = [
  [
    "TCL VRF nedir?",
    "TCL VRF, tek bir dış ünite grubuna çok sayıda iç ünitenin bağlandığı, soğutucu akışkan debisini her odanın ihtiyacına göre ayarlayan merkezi klima sistemidir. TCL TMV6+ Super Serisi tam DC inverter kompresör ve fan motorlarıyla çalışır; her mahal bağımsız olarak ısıtılıp soğutulur.",
  ],
  [
    "Bir TCL VRF sistemine kaç iç ünite bağlanabilir?",
    "TMV6+ Super Serisinde 8–32 HP arası 13 dış ünite modülü birleştirilerek 128 HP'ye kadar sistem kurulur ve tek sisteme 80 adede kadar iç ünite bağlanabilir. 9 kategoride 100'den fazla iç ünite modeli arasından seçim yapılır.",
  ],
  [
    "TCL VRF hangi dış hava sıcaklıklarında çalışır?",
    "Kataloğa göre soğutmada -15 °C ile 56 °C, ısıtmada -30 °C ile 28 °C dış hava sıcaklığı aralığında çalışır. Mini VRF serisinde soğutma -15 °C ~ 55 °C, ısıtma -20 °C ~ 24 °C aralığındadır.",
  ],
  [
    "TCL VRF'de boru uzunluğu sınırları nedir?",
    "Toplam boru uzunluğu 1.100 m'ye kadar çıkar. En uzak iç üniteye gerçek boru uzunluğu 220 m (eşdeğer 240 m), dış ünite üstteyken seviye farkı 100 m, alttayken 110 m, iç üniteler arası seviye farkı 40 m'dir.",
  ],
  [
    "TCL Mini VRF ne zaman tercih edilir?",
    "8–28 kW kapasiteli TCL Mini VRF; villa, dubleks, küçük ofis, mağaza ve klinik gibi orta ölçekli projeler için uygundur. 8–16 kW modeller tek fazlı (220–240 V), 18–28 kW modeller üç fazlı beslemeyle çalışır.",
  ],
  [
    "TCL VRF uzaktan kontrol edilebilir mi?",
    "Evet. WiFi modülü ve Tsmart mobil uygulamasıyla sistem telefondan yönetilir; ayrıca 7 ve 10,1 inç merkezi dokunmatik kumandalarla bina genelinde merkezi kontrol yapılır.",
  ],
  [
    "TCL VRF fiyatı nasıl belirlenir?",
    "Fiyat; binanın ısı kazancı/kaybı hesabıyla belirlenen dış ünite kapasitesine (HP), iç ünite tipleri ve adedine, boru hattı uzunluğuna ve kontrol sistemine göre değişir. Keşif ve kapasite hesabından sonra projeye özel teklif hazırlıyoruz.",
  ],
];

function KatalogButonu({ koyu = false }: { koyu?: boolean }) {
  return (
    <a
      href={KATALOG}
      target="_blank"
      rel="noopener noreferrer"
      download="TCL-VRF-TMV6-Super-Katalog-2026.pdf"
      className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-sm transition-all text-center ${
        koyu ? "bg-white/10 border border-white/20 text-white hover:bg-white/20" : "bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
      </svg>
      TCL VRF Kataloğu (PDF)
    </a>
  );
}

const kw = (v: string) => Number(v.replace(",", "."));

export default function TclVrfPage() {
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
                { "@type": "ListItem", position: 3, name: "TCL VRF Sistemleri", item: SAYFA },
              ],
            },
            {
              "@type": "ProductGroup",
              "@id": `${SAYFA}#tmv6-super`,
              name: "TCL TMV6+ Super Serisi Akıllı VRF",
              brand: { "@type": "Brand", name: "TCL" },
              category: "VRF klima sistemi",
              description:
                "Tam DC inverter TCL VRF dış üniteleri: 8–32 HP modüller, 128 HP'ye kadar kombinasyon, tek sistemde 80 iç ünite, SEER 7,35'e ve SCOP 4,50'ye kadar.",
              image: `${SITE}/tcl/tcl-dis-28-32hp.jpg`,
              url: SAYFA,
              productGroupID: "TMV-VED+",
              variesBy: "https://schema.org/size",
              hasVariant: DIS_UNITELER.map(([hp, kod, sog, , seer, , , scop]) => ({
                "@type": "Product",
                "@id": `${SAYFA}#tmv-ved-${kod}`,
                name: `TCL TMV-VED+${kod}W/AS-D(E) ${hp} HP VRF Dış Ünite`,
                sku: `TMV-VED+${kod}W/AS-D(E)`,
                brand: { "@type": "Brand", name: "TCL" },
                size: `${hp} HP`,
                image: `${SITE}/tcl/tcl-dis-${hp <= 12 ? "8-12" : hp <= 22 ? "14-22" : hp <= 26 ? "24-26" : "28-32"}hp.jpg`,
                additionalProperty: [
                  { "@type": "PropertyValue", name: "Soğutma kapasitesi", value: kw(sog), unitText: "kW" },
                  { "@type": "PropertyValue", name: "SEER", value: kw(seer) },
                  { "@type": "PropertyValue", name: "SCOP", value: kw(scop) },
                ],
              })),
            },
            {
              "@type": "ProductGroup",
              "@id": `${SAYFA}#mini-vrf`,
              name: "TCL Mini VRF (Tam DC Inverter)",
              brand: { "@type": "Brand", name: "TCL" },
              category: "Mini VRF klima sistemi",
              description: "8–28 kW tam DC inverter TCL Mini VRF dış üniteleri; ikiz rotary kompresör, tek ve üç fazlı modeller.",
              image: `${SITE}/tcl/tcl-mini-vrf.jpg`,
              url: `${SAYFA}#mini-vrf`,
              productGroupID: "TMV-Vd",
            },
            {
              "@type": "FAQPage",
              mainEntity: SSS.map(([s, c]) => ({ "@type": "Question", name: s, acceptedAnswer: { "@type": "Answer", text: c } })),
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
                <span className="text-slate-700">TCL VRF</span>
              </nav>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-semibold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                TCL · TMV6+ SUPER SERİSİ
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">TCL VRF Sistemleri</h1>
              <p className="text-lg font-semibold text-teal-700">Tam DC inverter akıllı VRF: 8–32 HP modül, 128 HP&apos;ye kadar tek sistem.</p>
              <p className="text-base text-slate-600 leading-relaxed">
                Otel, plaza, hastane, okul, AVM ve konut projelerinde her mahali bağımsız iklimlendiren TCL VRF ve TCL Mini VRF
                sistemlerinin keşfini, ısı kazancı/kaybı hesabını, projelendirmesini, montajını ve devreye alınmasını İstanbul&apos;da tek
                elden yürütüyoruz.
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <a href="#dis-uniteler" className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center font-bold text-slate-700 hover:border-teal-500/50 hover:text-teal-800 transition-colors">
                  VRF Dış Üniteler
                </a>
                <a href="#mini-vrf" className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center font-bold text-slate-700 hover:border-teal-500/50 hover:text-teal-800 transition-colors">
                  Mini VRF
                </a>
                <a href="#ic-uniteler" className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center font-bold text-slate-700 hover:border-teal-500/50 hover:text-teal-800 transition-colors">
                  İç Üniteler
                </a>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <Link href="/iletisim" className="px-8 py-4 rounded-lg bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 shadow-sm transition-all text-center">
                  TCL VRF Teklifi İsteyin →
                </Link>
                <KatalogButonu />
              </div>
            </div>

            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100">
              <Image src="/slider/slider-tcl-vrf.jpg" alt="TCL TMV6+ Super Serisi VRF dış ünitesi" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
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
          <div className="max-w-7xl mx-auto px-6 space-y-8">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">TEKNOLOJİ</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">TCL TMV6+ Super: güçlü, verimli ve güvenilir</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                TMV6+ Super Serisi; DC inverter kompresör, DC fan motoru ve yüksek hassasiyetli elektronik genleşme vanalarıyla kısmi
                yükte de yüksek verimle çalışır. Isıtmada -30 °C&apos;ye, soğutmada 56 °C&apos;ye kadar dış hava sıcaklığında kararlı
                performans verir; sensörler sistemi sürekli izleyip kompresör frekansını, fan hızını ve genleşme vanasını ayarlar.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TEKNOLOJI.map(([baslik, metin]) => (
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

        {/* 4. DIŞ ÜNİTELER */}
        <section id="dis-uniteler" className="scroll-mt-28 py-14 md:py-16">
          <div className="max-w-7xl mx-auto px-6 space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">DIŞ ÜNİTE GAMI</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">TCL VRF dış üniteleri: 8 – 32 HP</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  13 temel modül, aynı yükseklikte yalnız 4 gövde boyutunda üretilir. Modüller serbestçe birleştirilerek 128 HP&apos;ye kadar
                  tek sistem kurulur; kompresör ve modüller dönüşümlü çalışarak ömrü dengeler.
                </p>
              </div>
              <KatalogButonu />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {DIS_GOVDELER.map((g) => (
                <figure key={g.hp} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="relative aspect-square">
                    <Image src={g.gorsel} alt={`TCL TMV6+ Super ${g.hp} VRF dış ünitesi`} fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-contain" />
                  </div>
                  <figcaption className="text-center text-sm font-bold text-slate-800 mt-2">{g.hp}</figcaption>
                </figure>
              ))}
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
              <table className="w-full min-w-[46rem] text-xs">
                <caption className="sr-only">TCL TMV6+ Super Serisi VRF dış ünite teknik verileri</caption>
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th scope="col" className="text-left font-semibold px-4 py-3">Kapasite</th>
                    <th scope="col" className="text-left font-semibold px-3 py-3">Model</th>
                    <th scope="col" className="text-right font-semibold px-3 py-3">Soğutma (kW)</th>
                    <th scope="col" className="text-right font-semibold px-3 py-3">Çekilen güç (kW)</th>
                    <th scope="col" className="text-right font-semibold px-3 py-3">SEER</th>
                    <th scope="col" className="text-right font-semibold px-3 py-3">Isıtma (kW)</th>
                    <th scope="col" className="text-right font-semibold px-3 py-3">Maks. ısıtma (kW)</th>
                    <th scope="col" className="text-right font-semibold px-4 py-3">SCOP</th>
                  </tr>
                </thead>
                <tbody>
                  {DIS_UNITELER.map(([hp, kod, sog, guc, seer, isi, maks, scop]) => (
                    <tr key={kod} className="border-t border-slate-100 odd:bg-slate-50/60">
                      <th scope="row" className="text-left font-bold text-slate-800 px-4 py-2 whitespace-nowrap">{hp} HP</th>
                      <td className="px-3 py-2 text-slate-600 whitespace-nowrap">TMV-VED+{kod}W/AS-D(E)</td>
                      <td className="px-3 py-2 text-right text-slate-800">{sog}</td>
                      <td className="px-3 py-2 text-right text-slate-800">{guc}</td>
                      <td className="px-3 py-2 text-right font-semibold text-teal-700">{seer}</td>
                      <td className="px-3 py-2 text-right text-slate-800">{isi}</td>
                      <td className="px-3 py-2 text-right text-slate-800">{maks}</td>
                      <td className="px-4 py-2 text-right font-semibold text-teal-700">{scop}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500">
              Besleme 380–415 V, 3N, 50 Hz. Soğutma: iç 27 °C KT / 19 °C YT, dış 35 °C KT; ısıtma: iç 20 °C KT, dış 7 °C KT / 6 °C YT
              koşullarında. Kaynak: TCL TMV6+ Super Serisi Akıllı VRF kataloğu.
            </p>
          </div>
        </section>

        {/* 5. MINI VRF */}
        <section id="mini-vrf" className="scroll-mt-28 py-14 md:py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-5 gap-10 items-start">
            <div className="lg:col-span-2 space-y-4">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">MINI VRF</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">TCL Mini VRF: 8 – 28 kW</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Villa, dubleks, küçük ofis, mağaza ve klinikler için tam DC inverter ikiz rotary kompresörlü TCL Mini VRF. 8–16 kW modeller
                tek fazlı (220–240 V), 18–28 kW modeller üç fazlı beslemeyle çalışır. Soğutmada -15 °C ~ 55 °C, ısıtmada -20 °C ~ 24 °C dış
                sıcaklık aralığında çalışır; RoHS uyumludur.
              </p>
              <div className="relative w-full max-w-xs aspect-square mx-auto lg:mx-0">
                <Image src="/tcl/tcl-mini-vrf.jpg" alt="TCL Mini VRF tam DC inverter dış ünitesi" fill sizes="20rem" className="object-contain" />
              </div>
            </div>
            <div className="lg:col-span-3 overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full min-w-[34rem] text-xs">
                <caption className="sr-only">TCL Mini VRF teknik verileri</caption>
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th scope="col" className="text-left font-semibold px-4 py-3">Model</th>
                    <th scope="col" className="text-left font-semibold px-3 py-3">Besleme</th>
                    <th scope="col" className="text-right font-semibold px-3 py-3">Soğutma (kW)</th>
                    <th scope="col" className="text-right font-semibold px-3 py-3">SEER</th>
                    <th scope="col" className="text-right font-semibold px-3 py-3">Isıtma (kW)</th>
                    <th scope="col" className="text-right font-semibold px-4 py-3">SCOP</th>
                  </tr>
                </thead>
                <tbody>
                  {MINI_VRF.map(([kod, faz, sog, seer, isi, scop]) => (
                    <tr key={kod} className="border-t border-slate-100 odd:bg-slate-50/60">
                      <th scope="row" className="text-left font-bold text-slate-800 px-4 py-2 whitespace-nowrap">TMV-Vd{kod}W/N1-D(EU)</th>
                      <td className="px-3 py-2 text-slate-600">{faz}</td>
                      <td className="px-3 py-2 text-right text-slate-800">{sog}</td>
                      <td className="px-3 py-2 text-right font-semibold text-teal-700">{seer}</td>
                      <td className="px-3 py-2 text-right text-slate-800">{isi}</td>
                      <td className="px-4 py-2 text-right font-semibold text-teal-700">{scop}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 6. İÇ ÜNİTELER */}
        <section id="ic-uniteler" className="scroll-mt-28 py-14 md:py-16">
          <div className="max-w-7xl mx-auto px-6 space-y-8">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">İÇ ÜNİTE GAMI</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Her mahale uygun TCL VRF iç ünitesi</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                100&apos;den fazla iç ünite modeli; dış ünitelerle serbestçe eşleştirilir. Kaset, kanallı, duvar, yer/tavan ve taze havalı
                tipler aynı sistemde birlikte kullanılabilir.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {IC_UNITELER.map((u) => (
                <article key={u.ad} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
                  <div className="relative aspect-[4/3]">
                    <Image src={u.gorsel} alt={`TCL VRF ${u.ad} iç ünite`} fill sizes="(min-width: 1024px) 18vw, (min-width: 640px) 45vw, 90vw" className="object-contain" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-3">{u.ad}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{u.ozellik}</p>
                  <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                    <span className="font-semibold text-slate-600">Uygun yerler:</span> {u.yer}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 7. KONTROL + KATALOG */}
        <section className="py-14 md:py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">AKILLI KONTROL</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Odadan binaya, telefondan merkezi kontrole</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {KONTROL.map(([baslik, metin]) => (
                  <div key={baslik} className="border border-slate-200 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-slate-900">{baslik}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">{metin}</p>
                  </div>
                ))}
              </div>
            </div>
            <a
              href={KATALOG}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center hover:border-teal-500/60 transition-colors"
            >
              <div className="relative w-40 mx-auto aspect-[910/1235] shadow-lg rounded overflow-hidden">
                <Image src="/tcl/tcl-vrf-katalog-kapak.jpg" alt="TCL TMV6+ Super Serisi Akıllı VRF kataloğu kapağı" fill sizes="10rem" className="object-cover" />
              </div>
              <p className="text-sm font-bold text-slate-900 mt-4 group-hover:text-teal-700">TCL VRF Kataloğu 2026</p>
              <p className="text-xs text-slate-500 mt-1">76 sayfa · Türkçe · PDF</p>
            </a>
          </div>
        </section>

        {/* 8. SIK SORULAN SORULAR */}
        <section className="py-14 md:py-16">
          <div className="max-w-4xl mx-auto px-6 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">SIK SORULAN SORULAR</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">TCL VRF hakkında merak edilenler</h2>
            </div>
            <div className="space-y-3">
              {SSS.map(([soru, cevap]) => (
                <details key={soru} className="group bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-4 font-bold text-slate-900 text-sm">
                    <h3>{soru}</h3>
                    <span className="text-teal-700 group-open:rotate-45 transition-transform text-lg leading-none" aria-hidden>
                      +
                    </span>
                  </summary>
                  <p className="text-sm text-slate-600 leading-relaxed mt-3">{cevap}</p>
                </details>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              VRF sistemlerini daha geniş anlattığımız yazı:{" "}
              <Link href="/blog/vrf-rehberi-mitsubishi-electric-ve-tcl" className="text-teal-700 underline underline-offset-2">
                VRF İklimlendirme Rehberi
              </Link>
              .
            </p>
          </div>
        </section>

        {/* 9. CTA */}
        <section className="py-16 md:py-20 bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">TCL VRF PROJELENDİRME VE MONTAJ</p>
              <h2 className="text-2xl sm:text-3xl font-bold">Keşiften devreye almaya tek elden</h2>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Mahal bazlı ısı kazancı / kaybı hesabı ve dış ünite kombinasyon seçimi</li>
                <li>• Boru çapı, joint ve kablo projelendirmesi</li>
                <li>• İzolasyonlu bakır borulama, azot basınç testi ve vakum</li>
                <li>• Devreye alma, kumanda kurulumu ve periyodik bakım</li>
              </ul>
              <p className="text-sm text-slate-300 leading-relaxed">
                Kapasiteyi kabaca görmek için{" "}
                <Link href="/hesaplama" className="text-teal-300 underline underline-offset-2">
                  kapasite hesaplama
                </Link>{" "}
                aracımızı kullanabilirsiniz.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-10 space-y-5">
              <h3 className="text-xl sm:text-2xl font-bold">Projeniz için TCL VRF teklifi alın.</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Bina tipini, iklimlendirilecek alanları ve mimari projenizi paylaşın; doğru TCL VRF kombinasyonunu ve fiyat teklifini
                hazırlayalım.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/iletisim" className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-500 text-white text-center font-bold text-sm rounded-lg transition-colors shadow-md">
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
