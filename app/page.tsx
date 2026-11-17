import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import UrunSlider from "@/components/UrunSlider";
import { getSirketAyarlari } from "@/lib/sirket";
import { dilAlternatifleri, yol, type Dil } from "@/lib/dil";
import { dilAl } from "@/lib/dil-sunucu";

export const dynamic = "force-dynamic";

// www.iklimofisi.com ve iklimofisi.com aynı sayfayı gösterdiği için Google'a asıl adres bildirilir
export function generateMetadata(): Metadata {
  const dil = dilAl();
  return {
    alternates: dil === "tr" ? { canonical: "/", languages: dilAlternatifleri("tr", "/").languages } : dilAlternatifleri(dil, "/"),
  };
}

// ANA SAYFA METİNLERİ (Türkçe / English / Deutsch)
const tr = {
  rozet: "VRF · KLİMA · ISI POMPASI · YERDEN ISITMA",
  h1a: "VRF, klima ve ısı pompasında",
  h1b: "doğru sistemi",
  h1c: " kuruyoruz.",
  giris:
    "; konut, ofis, otel ve ticari yapılarda TCL ve Mitsubishi Electric VRF ve klima sistemleri, multi klima, ısı pompası, Fraenkische yerden ısıtma ve kazan dairesi yenileme projelerini keşiften montaja anahtar teslim yürütür.",
  kesifDugme: "Ücretsiz Keşif & Teklif İsteyin →",
  hizmetDugme: "Hizmetlerimizi İnceleyin",
  kartEtiket: "TCL VRF Çalışma Aralığı",
  kartBaslik: "-30°C ile +56°C Arası Tam Kontrol",
  kartMetin:
    "TCL TMV6+ Super VRF, ısıtmada -30°C'ye, soğutmada +56°C'ye kadar dış hava sıcaklığında çalışır. Dış hava koşulları ne olursa olsun iç mekânda ideal nem ve sıcaklık dengesini sabit tutuyoruz.",
  soguk: "-30°C Soğuk",
  ideal: "İdeal 22°C",
  sicak: "+56°C Sıcak",
  termostat: "Akıllı Termostat & Inverter Kompresör Hassasiyeti",
  kutular: [
    ["VRF Merkezi Sistem", "TCL · Mitsubishi Electric"],
    ["Klima & Multi Klima", "Duvar · Kaset · Kanallı"],
    ["Isı Pompası", "Buderus ve diğer markalar"],
    ["Yerden Isıtma", "Fraenkische"],
  ] as [string, string][],
  kartDugme: "Projeniz İçin Keşif İsteyin →",
  hkEtiket: "20+ YILLIK MÜHENDİSLİK GÜCÜ",
  hkBaslik: "Mühendislik Kökenli Yönetim Anlayışı",
  hkMetin:
    "20 yılı aşkın kıdemli Makine Mühendisi ve Proje Mühendisi kurucu ortaklarımızın öncülüğünde; TCL ve Mitsubishi Electric VRF ve klima sistemleri, ısı pompaları, Fraenkische yerden ısıtma ve Buderus kazan dairesi çözümleriyle yapının ısı kayıp/kazanç hesabına tam uygun iklimlendirme ve ısıtma sistemleri kuruyoruz.",
  hkLink: "Hakkımızda Detaylarını İnceleyin →",
  ilkeBaslik: "Disiplinli Mühendislik İlkelerimiz",
  ilkeler: [
    "✓ 20+ yıllık saha tecrübesiyle hatasız kapasite seçimi",
    "✓ TCL ve Mitsubishi Electric VRF & klima uzmanlığı",
    "✓ Isı pompası, Fraenkische yerden ısıtma ve kazan dairesi yenileme",
    "✓ AutoCAD tabanlı çizim, metraj ve şeffaf bütçelendirme",
    "✓ Tesisatta azot basınç testi, vakumlama ve 2 yıl tam garanti",
  ],
  hzEtiket: "HİZMETLERİMİZ",
  hzBaslik: "VRF, Klima, Isı Pompası ve Isıtma Çözümlerimiz",
  hzTumu: "Tüm Hizmetleri Gör",
  hizmetler: [
    { no: "01", baslik: "VRF / VRV Sistemleri", metin: "TCL VRF ve Mitsubishi Electric City Multi ile otel, plaza, hastane ve konut projelerinde merkezi iklimlendirme.", href: "/hizmetler#vrf", one: true },
    { no: "02", baslik: "Klima & Multi Klima", metin: "TCL ve Mitsubishi Electric duvar tipi, multi split, kaset ve kanallı klimalarda keşif, kapasite hesabı ve montaj.", href: "/hizmetler#klima", one: true },
    { no: "03", baslik: "Isı Pompası", metin: "Konut ve villalar için hava kaynaklı ısı pompaları. Buderus ve projeye uygun diğer markalarla anahtar teslim.", href: "/hizmetler#isi-pompasi", one: true },
    { no: "04", baslik: "Yerden Isıtma Sistemleri", metin: "Fraenkische yerden ısıtma boru ve kolektör sistemleri; ısı pompası ve kazanla birlikte projelendirme.", href: "/hizmetler#yerden-isitma", one: true },
    { no: "05", baslik: "Kazan Dairesi Yenileme", metin: "Eski kazan dairelerinin Buderus yoğuşmalı kaskad kazanlarla yenilenmesi, pompa ve kollektör grupları.", href: "/hizmetler#kazan-dairesi", one: false },
    { no: "06", baslik: "Havalandırma & Mekanik Tesisat", metin: "Isı geri kazanımlı havalandırma, klima santrali (AHU), sıhhi tesisat ve borulama altyapısı.", href: "/hizmetler#havalandirma", one: false },
  ],
  detayli: "Detaylı İncele →",
  yiEtiket: "YERDEN ISITMA · FRAENKISCHE",
  yiBaslik: "Yerden Isıtma ve Kazan Dairesi Yenileme",
  yiMetin1: "Fraenkische yerden ısıtma sistemleriyle konut, villa ve ticari alanlarda zeminden eşit ve konforlu ısı. Isı pompası ya da yoğuşmalı",
  yiMetin2: "kazanla birlikte projelendirir; eski kazan dairelerini Buderus kaskad sistemlerle yeniliyoruz.",
  yiMaddeler: [
    "Fraenkische boru ve kolektör sistemleri",
    "Isı kaybı hesabına göre boru aralığı",
    "Isı pompası ile düşük sıcaklıkta yüksek verim",
    "Buderus yoğuşmalı kaskad kazan daireleri",
  ],
  yiDugme: "Yerden Isıtma Hizmetimiz →",
  kesifKisa: "Ücretsiz Keşif İsteyin",
  yiGorselAlt: "Spiral serimle döşenmiş yerden ısıtma boruları",
  muEtiket: "ENDÜSTRİYEL MUTFAK ÇÖZÜMLERİ",
  muBaslik: "Restoran ve Otel Mutfakları İçin",
  muGorselAlt: "AIRNEX elektrostatik hücreli aspiratör",
  muUst: "AIRNEX · Mutfak Havalandırma",
  muKartBaslik: "Elektrostatik Hücreli Aspiratör",
  muKartMetin: "Mutfak egzozunda yağ, duman ve kokunun elektrostatik filtrasyonla kontrolü.",
  incele: "İncele →",
};

type Metin = typeof tr;

const en: Metin = {
  rozet: "VRF · AIR CONDITIONING · HEAT PUMPS · UNDERFLOOR HEATING",
  h1a: "We install the",
  h1b: "right system",
  h1c: " for VRF, air conditioning and heat pumps.",
  giris:
    " delivers TCL and Mitsubishi Electric VRF and air conditioning systems, multi-split systems, heat pumps, Fraenkische underfloor heating and boiler room renovation projects on a turnkey basis — from site survey to installation — in residential, office, hotel and commercial buildings.",
  kesifDugme: "Request a Free Site Survey & Quote →",
  hizmetDugme: "Explore Our Services",
  kartEtiket: "TCL VRF Operating Range",
  kartBaslik: "Full Control from -30°C to +56°C",
  kartMetin:
    "TCL TMV6+ Super VRF operates at outdoor temperatures down to -30°C in heating and up to +56°C in cooling. Whatever the outdoor conditions, we keep indoor humidity and temperature at the ideal balance.",
  soguk: "-30°C Cold",
  ideal: "Ideal 22°C",
  sicak: "+56°C Hot",
  termostat: "Smart Thermostat & Inverter Compressor Precision",
  kutular: [
    ["VRF Central System", "TCL · Mitsubishi Electric"],
    ["AC & Multi-Split", "Wall · Cassette · Ducted"],
    ["Heat Pumps", "Buderus and other brands"],
    ["Underfloor Heating", "Fraenkische"],
  ],
  kartDugme: "Request a Site Survey for Your Project →",
  hkEtiket: "20+ YEARS OF ENGINEERING STRENGTH",
  hkBaslik: "An Engineering-Driven Management Approach",
  hkMetin:
    "Led by our founding partners — senior mechanical and project engineers with more than 20 years of experience — we install air conditioning and heating systems precisely matched to each building's heat loss and heat gain calculation, using TCL and Mitsubishi Electric VRF and air conditioning systems, heat pumps, Fraenkische underfloor heating and Buderus boiler room solutions.",
  hkLink: "Learn More About Us →",
  ilkeBaslik: "Our Disciplined Engineering Principles",
  ilkeler: [
    "✓ Accurate capacity selection backed by 20+ years of field experience",
    "✓ Expertise in TCL and Mitsubishi Electric VRF & air conditioning",
    "✓ Heat pumps, Fraenkische underfloor heating and boiler room renovation",
    "✓ AutoCAD-based drawings, quantity take-offs and transparent budgeting",
    "✓ Nitrogen pressure testing, vacuuming and a full 2-year warranty",
  ],
  hzEtiket: "OUR SERVICES",
  hzBaslik: "Our VRF, Air Conditioning, Heat Pump and Heating Solutions",
  hzTumu: "View All Services",
  hizmetler: [
    { no: "01", baslik: "VRF / VRV Systems", metin: "Central air conditioning with TCL VRF and Mitsubishi Electric City Multi for hotels, office towers, hospitals and residential projects.", href: "/hizmetler#vrf", one: true },
    { no: "02", baslik: "Air Conditioning & Multi-Split", metin: "Site survey, capacity calculation and installation of TCL and Mitsubishi Electric wall-mounted, multi-split, cassette and ducted units.", href: "/hizmetler#klima", one: true },
    { no: "03", baslik: "Heat Pumps", metin: "Air-source heat pumps for homes and villas. Turnkey solutions with Buderus and other brands suited to the project.", href: "/hizmetler#isi-pompasi", one: true },
    { no: "04", baslik: "Underfloor Heating Systems", metin: "Fraenkische underfloor heating pipe and manifold systems, designed together with heat pumps and boilers.", href: "/hizmetler#yerden-isitma", one: true },
    { no: "05", baslik: "Boiler Room Renovation", metin: "Renovation of old boiler rooms with Buderus condensing cascade boilers, pump and manifold groups.", href: "/hizmetler#kazan-dairesi", one: false },
    { no: "06", baslik: "Ventilation & Mechanical Installation", metin: "Heat recovery ventilation, air handling units (AHU), plumbing and piping infrastructure.", href: "/hizmetler#havalandirma", one: false },
  ],
  detayli: "Learn More →",
  yiEtiket: "UNDERFLOOR HEATING · FRAENKISCHE",
  yiBaslik: "Underfloor Heating and Boiler Room Renovation",
  yiMetin1: "Even, comfortable heat from the floor in homes, villas and commercial spaces with Fraenkische underfloor heating systems. We design them together with a heat pump or a condensing",
  yiMetin2: "boiler, and renovate old boiler rooms with Buderus cascade systems.",
  yiMaddeler: [
    "Fraenkische pipe and manifold systems",
    "Pipe spacing based on heat loss calculation",
    "High efficiency at low temperatures with heat pumps",
    "Buderus condensing cascade boiler rooms",
  ],
  yiDugme: "Our Underfloor Heating Service →",
  kesifKisa: "Request a Free Site Survey",
  yiGorselAlt: "Underfloor heating pipes laid in a spiral pattern",
  muEtiket: "COMMERCIAL KITCHEN SOLUTIONS",
  muBaslik: "For Restaurant and Hotel Kitchens",
  muGorselAlt: "AIRNEX electrostatic cell exhaust unit",
  muUst: "AIRNEX · Kitchen Ventilation",
  muKartBaslik: "Electrostatic Cell Exhaust Unit",
  muKartMetin: "Control of grease, smoke and odour in kitchen exhaust through electrostatic filtration.",
  incele: "Learn More →",
};

const de: Metin = {
  rozet: "VRF · KLIMA · WÄRMEPUMPE · FUSSBODENHEIZUNG",
  h1a: "Wir installieren das",
  h1b: "richtige System",
  h1c: " für VRF, Klimatechnik und Wärmepumpen.",
  giris:
    " realisiert TCL- und Mitsubishi-Electric-VRF- und Klimasysteme, Multisplit-Anlagen, Wärmepumpen, Fraenkische Fußbodenheizungen und Heizraumsanierungen in Wohn-, Büro-, Hotel- und Gewerbebauten schlüsselfertig – von der Besichtigung bis zur Montage.",
  kesifDugme: "Kostenlose Besichtigung & Angebot anfordern →",
  hizmetDugme: "Unsere Leistungen ansehen",
  kartEtiket: "TCL VRF Einsatzbereich",
  kartBaslik: "Volle Kontrolle von -30°C bis +56°C",
  kartMetin:
    "Das TCL TMV6+ Super VRF arbeitet im Heizbetrieb bis -30°C und im Kühlbetrieb bis +56°C Außentemperatur. Unabhängig von den Außenbedingungen halten wir Raumfeuchte und Temperatur im idealen Gleichgewicht.",
  soguk: "-30°C Kalt",
  ideal: "Ideal 22°C",
  sicak: "+56°C Heiß",
  termostat: "Intelligenter Thermostat & Inverter-Verdichter-Präzision",
  kutular: [
    ["VRF-Zentralsystem", "TCL · Mitsubishi Electric"],
    ["Klima & Multisplit", "Wand · Kassette · Kanal"],
    ["Wärmepumpe", "Buderus und weitere Marken"],
    ["Fußbodenheizung", "Fraenkische"],
  ],
  kartDugme: "Besichtigung für Ihr Projekt anfordern →",
  hkEtiket: "ÜBER 20 JAHRE INGENIEURSKOMPETENZ",
  hkBaslik: "Eine ingenieurgeprägte Unternehmensführung",
  hkMetin:
    "Unter der Leitung unserer Gründungspartner – erfahrene Maschinenbau- und Projektingenieure mit über 20 Jahren Berufserfahrung – installieren wir Klima- und Heizsysteme, die exakt auf die Wärmeverlust- und Wärmegewinnberechnung des Gebäudes abgestimmt sind: mit TCL- und Mitsubishi-Electric-VRF- und Klimasystemen, Wärmepumpen, Fraenkische Fußbodenheizung und Buderus-Heizraumlösungen.",
  hkLink: "Mehr über uns erfahren →",
  ilkeBaslik: "Unsere disziplinierten Ingenieursprinzipien",
  ilkeler: [
    "✓ Fehlerfreie Leistungsauslegung mit über 20 Jahren Praxiserfahrung",
    "✓ Expertise in TCL- und Mitsubishi-Electric-VRF & Klimatechnik",
    "✓ Wärmepumpen, Fraenkische Fußbodenheizung und Heizraumsanierung",
    "✓ AutoCAD-basierte Planung, Mengenermittlung und transparente Kalkulation",
    "✓ Stickstoff-Druckprüfung, Evakuierung und 2 Jahre volle Garantie",
  ],
  hzEtiket: "UNSERE LEISTUNGEN",
  hzBaslik: "Unsere Lösungen für VRF, Klima, Wärmepumpen und Heizung",
  hzTumu: "Alle Leistungen ansehen",
  hizmetler: [
    { no: "01", baslik: "VRF-/VRV-Systeme", metin: "Zentrale Klimatisierung mit TCL VRF und Mitsubishi Electric City Multi für Hotels, Bürogebäude, Krankenhäuser und Wohnprojekte.", href: "/hizmetler#vrf", one: true },
    { no: "02", baslik: "Klima & Multisplit", metin: "Besichtigung, Leistungsberechnung und Montage von TCL- und Mitsubishi-Electric-Wand-, Multisplit-, Kassetten- und Kanalgeräten.", href: "/hizmetler#klima", one: true },
    { no: "03", baslik: "Wärmepumpen", metin: "Luft-Wasser-Wärmepumpen für Wohnhäuser und Villen. Schlüsselfertig mit Buderus und weiteren zum Projekt passenden Marken.", href: "/hizmetler#isi-pompasi", one: true },
    { no: "04", baslik: "Fußbodenheizungssysteme", metin: "Fraenkische Rohr- und Verteilersysteme für Fußbodenheizung, geplant zusammen mit Wärmepumpe und Kessel.", href: "/hizmetler#yerden-isitma", one: true },
    { no: "05", baslik: "Heizraumsanierung", metin: "Sanierung alter Heizräume mit Buderus-Brennwert-Kaskadenkesseln, Pumpen- und Verteilergruppen.", href: "/hizmetler#kazan-dairesi", one: false },
    { no: "06", baslik: "Lüftung & Haustechnik", metin: "Lüftung mit Wärmerückgewinnung, Lüftungszentralen (RLT/AHU), Sanitärinstallation und Rohrleitungsbau.", href: "/hizmetler#havalandirma", one: false },
  ],
  detayli: "Mehr erfahren →",
  yiEtiket: "FUSSBODENHEIZUNG · FRAENKISCHE",
  yiBaslik: "Fußbodenheizung und Heizraumsanierung",
  yiMetin1: "Gleichmäßige, behagliche Wärme vom Boden in Wohnungen, Villen und Gewerbeflächen mit Fraenkische Fußbodenheizungssystemen. Wir planen sie zusammen mit einer Wärmepumpe oder einem Brennwert-",
  yiMetin2: "kessel und sanieren alte Heizräume mit Buderus-Kaskadensystemen.",
  yiMaddeler: [
    "Fraenkische Rohr- und Verteilersysteme",
    "Verlegeabstand nach Heizlastberechnung",
    "Hohe Effizienz bei niedriger Temperatur mit Wärmepumpe",
    "Buderus Brennwert-Kaskadenheizräume",
  ],
  yiDugme: "Unsere Leistung Fußbodenheizung →",
  kesifKisa: "Kostenlose Besichtigung anfordern",
  yiGorselAlt: "Spiralförmig verlegte Fußbodenheizungsrohre",
  muEtiket: "LÖSUNGEN FÜR GEWERBEKÜCHEN",
  muBaslik: "Für Restaurant- und Hotelküchen",
  muGorselAlt: "AIRNEX Abluftgerät mit Elektrofilterzelle",
  muUst: "AIRNEX · Küchenlüftung",
  muKartBaslik: "Abluftgerät mit Elektrofilterzelle",
  muKartMetin: "Kontrolle von Fett, Rauch und Gerüchen in der Küchenabluft durch elektrostatische Filtration.",
  incele: "Ansehen →",
};

const METIN: Record<Dil, Metin> = { tr, en, de };

export default async function Home() {
  const sirket = await getSirketAyarlari();
  const dil = dilAl();
  const t = METIN[dil];
  const y = (h: string) => yol(dil, h);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      {/* 1. ÜST HEADER */}
      <Header />

      <main>
        {/* 2. MANŞET / HERO ALANI */}
        <section className="pt-8 pb-14 md:pt-12 md:pb-20 bg-white border-b border-slate-200/80 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">

              {/* Sol Taraf: Kayan Ürün Görselleri + Kısa Metin */}
              <div className="lg:col-span-7 space-y-6">
                <UrunSlider dil={dil} />

                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                    {t.rozet}
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-950 leading-tight">
                    {t.h1a}{" "}
                    <span className="text-teal-700">{t.h1b}</span>{t.h1c}
                  </h1>

                  <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                    {sirket.unvan}{t.giris}
                  </p>

                  {/* Butonlar */}
                  <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Link
                      href={y("/iletisim")}
                      className="px-7 py-3.5 rounded-lg bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 shadow-sm transition-all text-center"
                    >
                      {t.kesifDugme}
                    </Link>
                    <Link
                      href={y("/hizmetler")}
                      className="px-7 py-3.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-all text-center"
                    >
                      {t.hizmetDugme}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Sağ Taraf: İnteraktif İklim Kontrol Kartı */}
              <div className="lg:col-span-5">
                <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl border border-slate-800 space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                      <p className="text-[11px] font-bold text-teal-400 uppercase tracking-widest">{t.kartEtiket}</p>
                      <h3 className="text-lg font-bold text-white mt-0.5">{t.kartBaslik}</h3>
                    </div>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {t.kartMetin}
                  </p>

                  {/* Sıcaklık Skalası */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
                    <div className="flex justify-between text-[11px] font-mono font-bold text-slate-400">
                      <span className="text-cyan-400">{t.soguk}</span>
                      <span className="text-teal-300">{t.ideal}</span>
                      <span className="text-amber-400">{t.sicak}</span>
                    </div>
                    <div className="h-2 w-full bg-gradient-to-r from-cyan-500 via-teal-400 to-amber-500 rounded-full relative">
                      {/* 22°C, -30…+56°C skalasında %60 noktası */}
                      <div style={{ left: "60%" }} className="absolute -top-1 w-4 h-4 rounded-full bg-white border-2 border-slate-900 shadow-md transform -translate-x-1/2" />
                    </div>
                    <p className="text-[10px] text-center text-slate-400 font-mono">
                      {t.termostat}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    {t.kutular.map(([baslik, alt]) => (
                      <div key={baslik} className="p-3 rounded-lg bg-slate-800/60 border border-slate-800">
                        <p className="font-bold text-slate-200">{baslik}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{alt}</p>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={y("/iletisim")}
                    className="block w-full py-3 bg-teal-600 hover:bg-teal-500 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm"
                  >
                    {t.kartDugme}
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. HAKKIMIZDA ÖZETİ (HİZMETLERDEN ÖNE ALINDI, MARKA VURGULARI EKLENDİ) */}
        <section className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-4">
                <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.hkEtiket}</p>
                <h2 className="text-3xl font-bold text-slate-900">{t.hkBaslik}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t.hkMetin}
                </p>
                <div>
                  <Link href={y("/hakkimizda")} className="inline-block text-xs font-bold text-teal-700 hover:underline">
                    {t.hkLink}
                  </Link>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">{t.ilkeBaslik}</h4>
                <div className="space-y-2 text-xs text-slate-600">
                  {t.ilkeler.map((i) => (
                    <p key={i}>{i}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. MÜHENDİSLİK HİZMETLERİMİZ (MARKA VURGULARI EKLENDİ) */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <p className="text-xs font-bold tracking-widest text-teal-700 uppercase mb-2">{t.hzEtiket}</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {t.hzBaslik}
                </h2>
              </div>
              <Link href={y("/hizmetler")} className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1">
                <span>{t.hzTumu}</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {t.hizmetler.map((h) => (
                <div key={h.no} className="bg-white border border-slate-200 p-6 rounded-xl hover:border-teal-500/40 hover:shadow-md transition-all space-y-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
                      h.one ? "bg-teal-50 border border-teal-100 text-teal-700" : "bg-slate-100 border border-slate-200 text-slate-700"
                    }`}
                  >
                    {h.no}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{h.baslik}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{h.metin}</p>
                  <Link href={y(h.href)} className="inline-block text-xs font-semibold text-teal-700 hover:underline">{t.detayli}</Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5a. YERDEN ISITMA (FRAENKISCHE) & KAZAN DAİRESİ YENİLEME — öne çıkan */}
        <section className="py-20 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 bg-slate-900 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-8 sm:p-10 space-y-5">
                <p className="text-xs font-bold tracking-widest text-amber-400 uppercase">{t.yiEtiket}</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {t.yiBaslik}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {t.yiMetin1}
                  {dil === "de" ? "" : " "}{t.yiMetin2}
                </p>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  {t.yiMaddeler.map((m) => (
                    <div key={m} className="p-3 rounded-lg bg-slate-800/60 border border-slate-800 text-slate-200 font-semibold">
                      {m}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <Link href={y("/hizmetler#yerden-isitma")} className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs text-center transition-colors">
                    {t.yiDugme}
                  </Link>
                  <Link href={y("/iletisim")} className="px-6 py-3 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 font-bold text-xs text-center transition-colors">
                    {t.kesifKisa}
                  </Link>
                </div>
              </div>
              <div className="relative min-h-[16rem] bg-slate-900">
                <Image
                  src="/yerden-isitma/yerden-isitma-genis.jpg"
                  alt={t.yiGorselAlt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 5. ENDÜSTRİYEL MUTFAK ÇÖZÜMLERİ (AIRNEX) — ana işlerden sonra, daha sade */}
        <section className="py-16 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-8">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase mb-2">{t.muEtiket}</p>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t.muBaslik}</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Link href={y("/airnex")} className="group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex hover:border-teal-500/40 hover:shadow-md transition-all">
                <div className="relative w-32 sm:w-40 shrink-0 bg-slate-900">
                  <Image src="/airnex/airnex-mutfak.jpg" alt={t.muGorselAlt} fill sizes="160px" className="object-cover" />
                </div>
                <div className="p-5 space-y-2">
                  <p className="text-[11px] font-bold tracking-wider text-teal-700 uppercase">{t.muUst}</p>
                  <h3 className="font-bold text-slate-900">{t.muKartBaslik}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{t.muKartMetin}</p>
                  <span className="inline-block text-xs font-semibold text-teal-700 group-hover:underline">{t.incele}</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
