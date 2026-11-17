import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getSirketAyarlari } from "@/lib/sirket";
import { dilAlternatifleri, yol, type Dil } from "@/lib/dil";
import { dilAl } from "@/lib/dil-sunucu";

export const dynamic = "force-dynamic";

// Kartların görsel ayarları (dilden bağımsız; sıra METIN.kartlar ile aynı)
type KartGorunum = {
  id: string;
  gorsel: string;
  kutu: string; // görsel kutusunun sınıfları
  gorselSinif: string;
  rozetRenk: string;
  katman: boolean; // görselin üstünde karartma
  ekLink?: string;
};

const KOYU_KUTU = "h-44 w-full bg-slate-950 p-4 flex items-center justify-center relative overflow-hidden";

const KARTLAR: KartGorunum[] = [
  { id: "vrf", gorsel: "/hizmetler/hizmet-vrf.jpg", kutu: KOYU_KUTU, gorselSinif: "object-cover", rozetRenk: "text-teal-300", katman: true, ekLink: "/tcl-vrf" },
  { id: "klima", gorsel: "/hizmetler/hizmet-klima.jpg", kutu: KOYU_KUTU, gorselSinif: "object-cover", rozetRenk: "text-teal-300", katman: true },
  { id: "isi-pompasi", gorsel: "/hizmetler/hizmet-isi-pompasi.jpg", kutu: KOYU_KUTU, gorselSinif: "object-cover", rozetRenk: "text-amber-300", katman: true },
  { id: "yerden-isitma", gorsel: "/yerden-isitma/yerden-isitma-kart.jpg", kutu: "h-44 w-full bg-slate-100 relative overflow-hidden", gorselSinif: "object-cover", rozetRenk: "text-amber-300", katman: false },
  { id: "kazan-dairesi", gorsel: "/buderus/gb272-kaskad.jpg", kutu: "h-44 w-full bg-white border-b border-slate-100 relative overflow-hidden", gorselSinif: "object-contain p-3", rozetRenk: "text-teal-300", katman: false },
  { id: "havalandirma", gorsel: "/hizmetler/hizmet-havalandirma.jpg", kutu: KOYU_KUTU, gorselSinif: "object-cover", rozetRenk: "text-teal-300", katman: true },
  { id: "mekanik-tesisat", gorsel: "/hizmetler/hizmet-mekanik-tesisat.jpg", kutu: KOYU_KUTU, gorselSinif: "object-cover", rozetRenk: "text-teal-300", katman: true },
  { id: "projelendirme", gorsel: "/hizmetler/hizmet-projelendirme.jpg", kutu: KOYU_KUTU, gorselSinif: "object-cover", rozetRenk: "text-teal-300", katman: true },
];

type Kart = { rozet: string; alt: string; ust: string; baslik: string; metin: string; maddeler: [string, string, string]; ekLink?: string };

// HİZMETLER METİNLERİ (Türkçe / English / Deutsch)
const tr = {
  metaBaslik: "Hizmetlerimiz — VRF, Klima, Isı Pompası & Yerden Isıtma",
  metaAciklama:
    "TCL ve Mitsubishi Electric VRF sistemleri, klima ve multi klima, ısı pompası (Buderus ve diğer markalar), Fraenkische yerden ısıtma, kazan dairesi yenileme, havalandırma ve mekanik tesisatta anahtar teslim hizmet.",
  rozet: "VRF · KLİMA · ISI POMPASI · YERDEN ISITMA",
  h1a: "Mekanik Tesisatın Tamamı ",
  h1b: "Tek Çatı Altında.",
  giris:
    "; TCL ve Mitsubishi Electric VRF ve klima sistemlerinden ısı pompalarına, Fraenkische yerden ısıtmadan kazan dairesi yenilemeye, havalandırmadan endüstriyel mutfak egzozuna kadar mühendislik standartlarında anahtar teslim çözümler sunar.",
  kesifDugme: "Projeniz İçin Keşif & Teklif İsteyin →",
  kartlar: [
    {
      rozet: "VRF Uzmanlığı",
      alt: "Bina çatısında VRF dış ünite uygulaması",
      ust: "MERKEZİ İKLİMLENDİRME",
      baslik: "VRF / VRV Merkezi Sistemler",
      metin:
        "Plaza, otel, hastane ve binalarda her odayı bağımsız iklimlendiren TCL TMV ve Mitsubishi Electric City Multi VRF sistemleri; Heat Pump ve Heat Recovery dış/iç ünite grupları ve azot testli borulama.",
      maddeler: ["TCL & Mitsubishi Electric VRF dış ve iç ünite montajı", "İzolasyonlu azot testli bakır borulama", "Merkezi dokunmatik otomasyon kumandaları"],
      ekLink: "TCL VRF ürünleri ve teknik veriler →",
    },
    {
      rozet: "Split & Kaset",
      alt: "Ofiste tavana monte kaset tipi klima",
      ust: "KLİMA & MULTİ KLİMA",
      baslik: "Klima & Multi Klima Sistemleri",
      metin:
        "TCL ve Mitsubishi Electric duvar tipi, multi-split, kaset tipi, kanallı gizli tavan, konsol ve salon tipi klimaların keşfi, kapasite hesabı ve montajı.",
      maddeler: ["Inverter duvar tipi & multi-split klimalar", "4 Yöne üflemeli kaset tipi iklimlendirme", "Gizli tavan kanallı, konsol & salon tipi"],
    },
    {
      rozet: "A+++ Tasarruf",
      alt: "Isı pompası dış üniteleri",
      ust: "ISI POMPASI · BUDERUS VE DİĞER MARKALAR",
      baslik: "Isı Pompası Sistemleri",
      metin:
        "Konut, villa ve ticari yapılar için hava kaynaklı ısı pompaları. Buderus başta olmak üzere projeye en uygun markayla; yerden ısıtma, radyatör ve boyler entegrasyonu.",
      maddeler: ["Buderus ve farklı marka ısı pompası seçenekleri", "Yüksek sıcaklık (85°C) modellerle radyatörlü sistemler", "Yerden ısıtma ve sıcak su (boyler) entegrasyonu"],
    },
    {
      rozet: "Fraenkische",
      alt: "Spiral serimle döşenmiş yerden ısıtma boruları",
      ust: "YERDEN ISITMA · FRAENKISCHE",
      baslik: "Yerden Isıtma Sistemleri",
      metin:
        "Fraenkische yerden ısıtma boru ve kolektör sistemleriyle konut, villa ve ticari alanlarda zeminden eşit ve konforlu ısıtma. Isı kaybı hesabına göre boru aralığı ve devre planı.",
      maddeler: ["Fraenkische boru, kolektör ve bağlantı sistemleri", "Isı kaybı hesabına göre devre ve boru aralığı", "Isı pompası veya kazan ile birlikte çalışma"],
    },
    {
      rozet: "Buderus Kaskad",
      alt: "Buderus Logamax plus GB272 kaskad kazan dairesi uygulaması",
      ust: "ISITMA · YENİLEME",
      baslik: "Kazan Dairesi Yenileme",
      metin:
        "Eski ve verimsiz kazan dairelerinin Buderus yoğuşmalı kaskad kazan sistemleriyle yenilenmesi; pompa, kollektör, denge kabı ve otomasyon dahil anahtar teslim.",
      maddeler: ["Buderus Logamax plus GB272 yoğuşmalı kaskad kazanlar", "Pompa, kollektör ve denge kabı grupları", "Mevcut tesisata uygun, kesintiyi en aza indiren geçiş"],
    },
    {
      rozet: "AHU & Taze Hava",
      alt: "Isı geri kazanımlı havalandırma cihazının kesit görünümü",
      ust: "KLİMA SANTRALLERİ & İGK",
      baslik: "Klima Santrali (AHU) & Havalandırma",
      metin:
        "Fabrika, AVM, otel ve hijyenik alanlar için Isı Geri Kazanımlı Klima Santralleri (AHU), taze hava besleme ve spiro kanal imalatı.",
      maddeler: ["Klima Santrali (AHU) montajı & otomasyonu", "Isı Geri Kazanım (İGK) üniteleri", "Spiro yuvarlak ve izoleli hava kanalları"],
    },
    {
      rozet: "Anahtar Teslim",
      alt: "Mekanik tesisat dairesinde borulama ve pompa grupları",
      ust: "ANAHTAR TESLİM MEKANİK TAAHHÜT",
      baslik: "Mekanik & Sıhhi Tesisat",
      metin:
        "Temiz su, pis su, yağmur hatları, yangın söndürme tesisatları, kazan daireleri ve borulama altyapılarının mühendislik standartlarında imali.",
      maddeler: ["Sıhhi tesisat (Temiz & pis su hatları)", "Isıtma ve soğutma borulama altyapısı", "Yangın tesisatı ve hidrofor sistemleri"],
    },
    {
      rozet: "AutoCAD Proje",
      alt: "Şantiyede tablet ile proje kontrolü yapan mühendis",
      ust: "MÜHENDİSLİK & DANIŞMANLIK",
      baslik: "Mekanik Projelendirme & Metraj",
      metin:
        "AutoCAD tabanlı mekanik tesisat projelendirmesi, ısı kaybı/kazancı hesapları, metraj cetvelleri ve şantiye süpervizörlüğü.",
      maddeler: ["AutoCAD tabanlı mekanik proje çizimi", "Isı kaybı ve iklimlendirme yük hesapları", "Malzeme metrajı ve ihale şartnamesi hazırlığı"],
    },
  ] as Kart[],
  airnex: {
    alt: "AIRNEX elektrostatik hücreli aspiratör kesit görünümü",
    rozet: "Markamız: AIRNEX",
    ust: "MUTFAK HAVALANDIRMA",
    baslik: "Endüstriyel Mutfak Havalandırma — AIRNEX Elektrostatik Hücreli Aspiratör",
    metin:
      "Restoran, otel ve endüstriyel mutfaklarda pişirme kaynaklı yağ aerosolleri, duman ve ince partiküllerin kontrolü için elektrostatik filtrasyon hücreli egzoz sistemleri. Davlumbazdan fana kadar tüm hattı projelendirip anahtar teslim kuruyoruz.",
    maddeler: ["Ön filtre + elektrostatik (ESP) hücre + fan", "Opsiyonel koku kontrol kademesi", "Davlumbaz ve egzoz kanalı projelendirme", "Periyodik bakım ve hücre temizliği"],
    urun: "AIRNEX Ürün Detayları →",
    teklif: "Mutfak Projeniz İçin Teklif İsteyin →",
  },
  cBaslik: "Mekanik Projenizi Birlikte Planlayalım",
  cMetin: "Mimari veya mekanik projenizi gönderin, uzman mühendislerimiz kapasite hesabı ve bütçe teklifini aynı gün hazırlasın.",
  cDugme: "Ücretsiz Keşif Talebi Oluşturun →",
};

type Metin = typeof tr;

const en: Metin = {
  metaBaslik: "Our Services — VRF, Air Conditioning, Heat Pumps & Underfloor Heating",
  metaAciklama:
    "Turnkey services for TCL and Mitsubishi Electric VRF systems, air conditioners and multi-split systems, heat pumps (Buderus and other brands), Fraenkische underfloor heating, boiler room renovation, ventilation and mechanical installation.",
  rozet: "VRF · AIR CONDITIONING · HEAT PUMPS · UNDERFLOOR HEATING",
  h1a: "All of Your Mechanical Installation ",
  h1b: "Under One Roof.",
  giris:
    " offers turnkey solutions to engineering standards — from TCL and Mitsubishi Electric VRF and air conditioning systems to heat pumps, from Fraenkische underfloor heating to boiler room renovation, and from ventilation to commercial kitchen exhaust.",
  kesifDugme: "Request a Site Survey & Quote for Your Project →",
  kartlar: [
    {
      rozet: "VRF Expertise",
      alt: "VRF outdoor unit installation on a building rooftop",
      ust: "CENTRAL AIR CONDITIONING",
      baslik: "VRF / VRV Central Systems",
      metin:
        "TCL TMV and Mitsubishi Electric City Multi VRF systems that condition every room independently in office towers, hotels, hospitals and other buildings; Heat Pump and Heat Recovery outdoor/indoor unit groups and nitrogen-tested piping.",
      maddeler: ["Installation of TCL & Mitsubishi Electric VRF outdoor and indoor units", "Insulated, nitrogen-tested copper piping", "Central touch-screen control systems"],
      ekLink: "TCL VRF products and technical data →",
    },
    {
      rozet: "Split & Cassette",
      alt: "Ceiling-mounted cassette air conditioner in an office",
      ust: "AIR CONDITIONING & MULTI-SPLIT",
      baslik: "Air Conditioning & Multi-Split Systems",
      metin:
        "Site survey, capacity calculation and installation of TCL and Mitsubishi Electric wall-mounted, multi-split, cassette, concealed ducted, console and floor-standing air conditioners.",
      maddeler: ["Inverter wall-mounted & multi-split air conditioners", "4-way cassette air conditioning", "Concealed ducted, console & floor-standing units"],
    },
    {
      rozet: "A+++ Savings",
      alt: "Heat pump outdoor units",
      ust: "HEAT PUMPS · BUDERUS AND OTHER BRANDS",
      baslik: "Heat Pump Systems",
      metin:
        "Air-source heat pumps for homes, villas and commercial buildings. With Buderus first and foremost, or the brand best suited to the project; integration with underfloor heating, radiators and hot water cylinders.",
      maddeler: ["Buderus and other heat pump brands", "Radiator systems with high-temperature (85°C) models", "Underfloor heating and domestic hot water (cylinder) integration"],
    },
    {
      rozet: "Fraenkische",
      alt: "Underfloor heating pipes laid in a spiral pattern",
      ust: "UNDERFLOOR HEATING · FRAENKISCHE",
      baslik: "Underfloor Heating Systems",
      metin:
        "Even, comfortable heating from the floor in homes, villas and commercial spaces with Fraenkische underfloor heating pipe and manifold systems. Pipe spacing and circuit layout based on heat loss calculation.",
      maddeler: ["Fraenkische pipe, manifold and connection systems", "Circuits and pipe spacing based on heat loss calculation", "Operation together with a heat pump or boiler"],
    },
    {
      rozet: "Buderus Cascade",
      alt: "Buderus Logamax plus GB272 cascade boiler room installation",
      ust: "HEATING · RENOVATION",
      baslik: "Boiler Room Renovation",
      metin:
        "Renovation of old, inefficient boiler rooms with Buderus condensing cascade boiler systems; turnkey, including pumps, manifolds, low-loss header and controls.",
      maddeler: ["Buderus Logamax plus GB272 condensing cascade boilers", "Pump, manifold and low-loss header groups", "Changeover adapted to the existing system with minimal downtime"],
    },
    {
      rozet: "AHU & Fresh Air",
      alt: "Cross-section of a heat recovery ventilation unit",
      ust: "AIR HANDLING UNITS & HRV",
      baslik: "Air Handling Units (AHU) & Ventilation",
      metin:
        "Heat recovery air handling units (AHU), fresh air supply and spiral duct fabrication for factories, shopping centres, hotels and hygienic areas.",
      maddeler: ["Air handling unit (AHU) installation & controls", "Heat recovery ventilation (HRV) units", "Spiral round and insulated air ducts"],
    },
    {
      rozet: "Turnkey",
      alt: "Piping and pump groups in a mechanical plant room",
      ust: "TURNKEY MECHANICAL CONTRACTING",
      baslik: "Mechanical & Plumbing Installation",
      metin:
        "Installation of fresh water, waste water and rainwater lines, fire suppression systems, boiler rooms and piping infrastructure to engineering standards.",
      maddeler: ["Plumbing (fresh & waste water lines)", "Heating and cooling piping infrastructure", "Fire protection installations and booster pump systems"],
    },
    {
      rozet: "AutoCAD Design",
      alt: "Engineer checking the project on a tablet at a construction site",
      ust: "ENGINEERING & CONSULTANCY",
      baslik: "Mechanical Design & Quantity Take-Off",
      metin:
        "AutoCAD-based mechanical installation design, heat loss/heat gain calculations, bills of quantities and site supervision.",
      maddeler: ["AutoCAD-based mechanical design drawings", "Heat loss and cooling load calculations", "Material take-offs and tender specifications"],
    },
  ],
  airnex: {
    alt: "Cross-section of the AIRNEX electrostatic cell exhaust unit",
    rozet: "Our Brand: AIRNEX",
    ust: "KITCHEN VENTILATION",
    baslik: "Commercial Kitchen Ventilation — AIRNEX Electrostatic Cell Exhaust Unit",
    metin:
      "Exhaust systems with electrostatic filtration cells to control grease aerosols, smoke and fine particles from cooking in restaurant, hotel and commercial kitchens. We design and install the entire line, from the hood to the fan, on a turnkey basis.",
    maddeler: ["Pre-filter + electrostatic (ESP) cell + fan", "Optional odour control stage", "Hood and exhaust duct design", "Periodic maintenance and cell cleaning"],
    urun: "AIRNEX Product Details →",
    teklif: "Request a Quote for Your Kitchen Project →",
  },
  cBaslik: "Let's Plan Your Mechanical Project Together",
  cMetin: "Send us your architectural or mechanical drawings and our expert engineers will prepare the capacity calculation and budget quote on the same day.",
  cDugme: "Request a Free Site Survey →",
};

const de: Metin = {
  metaBaslik: "Unsere Leistungen — VRF, Klima, Wärmepumpen & Fußbodenheizung",
  metaAciklama:
    "Schlüsselfertige Leistungen für TCL- und Mitsubishi-Electric-VRF-Systeme, Klima- und Multisplit-Anlagen, Wärmepumpen (Buderus und weitere Marken), Fraenkische Fußbodenheizung, Heizraumsanierung, Lüftung und Haustechnik.",
  rozet: "VRF · KLIMA · WÄRMEPUMPE · FUSSBODENHEIZUNG",
  h1a: "Die gesamte Haustechnik ",
  h1b: "aus einer Hand.",
  giris:
    " bietet schlüsselfertige Lösungen nach Ingenieurstandards – von TCL- und Mitsubishi-Electric-VRF- und Klimasystemen über Wärmepumpen, von Fraenkische Fußbodenheizung bis zur Heizraumsanierung und von Lüftung bis zur Abluft von Gewerbeküchen.",
  kesifDugme: "Besichtigung & Angebot für Ihr Projekt anfordern →",
  kartlar: [
    {
      rozet: "VRF-Expertise",
      alt: "Installation eines VRF-Außengeräts auf einem Gebäudedach",
      ust: "ZENTRALE KLIMATISIERUNG",
      baslik: "VRF-/VRV-Zentralsysteme",
      metin:
        "TCL TMV und Mitsubishi Electric City Multi VRF-Systeme, die in Bürogebäuden, Hotels, Krankenhäusern und weiteren Gebäuden jeden Raum unabhängig klimatisieren; Außen-/Innengerätegruppen mit Wärmepumpe und Wärmerückgewinnung sowie stickstoffgeprüfte Rohrleitungen.",
      maddeler: ["Montage von TCL- & Mitsubishi-Electric-VRF-Außen- und Innengeräten", "Gedämmte, stickstoffgeprüfte Kupferrohrleitungen", "Zentrale Touch-Steuerungen"],
      ekLink: "TCL VRF-Produkte und technische Daten →",
    },
    {
      rozet: "Split & Kassette",
      alt: "Deckenmontiertes Kassetten-Klimagerät in einem Büro",
      ust: "KLIMA & MULTISPLIT",
      baslik: "Klima- & Multisplit-Systeme",
      metin:
        "Besichtigung, Leistungsberechnung und Montage von TCL- und Mitsubishi-Electric-Wand-, Multisplit-, Kassetten-, Kanal-, Truhen- und Standgeräten.",
      maddeler: ["Inverter-Wandgeräte & Multisplit-Anlagen", "4-Wege-Kassetten-Klimatisierung", "Kanal-, Truhen- & Standgeräte"],
    },
    {
      rozet: "A+++ Ersparnis",
      alt: "Außengeräte von Wärmepumpen",
      ust: "WÄRMEPUMPE · BUDERUS UND WEITERE MARKEN",
      baslik: "Wärmepumpensysteme",
      metin:
        "Luft-Wasser-Wärmepumpen für Wohnhäuser, Villen und Gewerbebauten. Allen voran mit Buderus oder der für das Projekt am besten geeigneten Marke; Einbindung von Fußbodenheizung, Heizkörpern und Warmwasserspeicher.",
      maddeler: ["Wärmepumpen von Buderus und weiteren Marken", "Heizkörpersysteme mit Hochtemperatur-Modellen (85°C)", "Einbindung von Fußbodenheizung und Warmwasser (Speicher)"],
    },
    {
      rozet: "Fraenkische",
      alt: "Spiralförmig verlegte Fußbodenheizungsrohre",
      ust: "FUSSBODENHEIZUNG · FRAENKISCHE",
      baslik: "Fußbodenheizungssysteme",
      metin:
        "Gleichmäßige, behagliche Wärme vom Boden in Wohnungen, Villen und Gewerbeflächen mit Fraenkische Rohr- und Verteilersystemen. Verlegeabstand und Heizkreisplanung nach Heizlastberechnung.",
      maddeler: ["Fraenkische Rohr-, Verteiler- und Anschlusssysteme", "Heizkreise und Verlegeabstand nach Heizlastberechnung", "Betrieb zusammen mit Wärmepumpe oder Kessel"],
    },
    {
      rozet: "Buderus Kaskade",
      alt: "Buderus Logamax plus GB272 Kaskaden-Heizraum",
      ust: "HEIZUNG · SANIERUNG",
      baslik: "Heizraumsanierung",
      metin:
        "Sanierung alter, ineffizienter Heizräume mit Buderus-Brennwert-Kaskadenanlagen; schlüsselfertig inklusive Pumpen, Verteiler, hydraulischer Weiche und Regelung.",
      maddeler: ["Buderus Logamax plus GB272 Brennwert-Kaskadenkessel", "Pumpen-, Verteiler- und Weichengruppen", "Umstellung passend zur Bestandsanlage mit minimaler Ausfallzeit"],
    },
    {
      rozet: "RLT & Frischluft",
      alt: "Schnittansicht eines Lüftungsgeräts mit Wärmerückgewinnung",
      ust: "LÜFTUNGSZENTRALEN & WRG",
      baslik: "Lüftungszentralen (RLT) & Lüftung",
      metin:
        "Lüftungszentralen (RLT) mit Wärmerückgewinnung, Frischluftversorgung und Herstellung von Wickelfalzrohrkanälen für Fabriken, Einkaufszentren, Hotels und Hygienebereiche.",
      maddeler: ["Montage & Regelung von Lüftungszentralen (RLT)", "Geräte mit Wärmerückgewinnung (WRG)", "Wickelfalzrohre und gedämmte Luftkanäle"],
    },
    {
      rozet: "Schlüsselfertig",
      alt: "Rohrleitungen und Pumpengruppen in einer Technikzentrale",
      ust: "SCHLÜSSELFERTIGE HAUSTECHNIK",
      baslik: "Haustechnik & Sanitärinstallation",
      metin:
        "Ausführung von Trinkwasser-, Abwasser- und Regenwasserleitungen, Feuerlöschanlagen, Heizräumen und Rohrleitungsinfrastruktur nach Ingenieurstandards.",
      maddeler: ["Sanitärinstallation (Trink- & Abwasserleitungen)", "Rohrleitungsnetze für Heizung und Kühlung", "Feuerlöschanlagen und Druckerhöhungsanlagen"],
    },
    {
      rozet: "AutoCAD-Planung",
      alt: "Ingenieur prüft das Projekt mit einem Tablet auf der Baustelle",
      ust: "ENGINEERING & BERATUNG",
      baslik: "TGA-Planung & Mengenermittlung",
      metin:
        "AutoCAD-basierte Planung der Haustechnik, Wärmeverlust-/Wärmegewinnberechnungen, Leistungsverzeichnisse und Bauüberwachung.",
      maddeler: ["AutoCAD-basierte TGA-Planzeichnungen", "Heizlast- und Kühllastberechnungen", "Mengenermittlung und Ausschreibungsunterlagen"],
    },
  ],
  airnex: {
    alt: "Schnittansicht des AIRNEX Abluftgeräts mit Elektrofilterzelle",
    rozet: "Unsere Marke: AIRNEX",
    ust: "KÜCHENLÜFTUNG",
    baslik: "Gewerbeküchenlüftung — AIRNEX Abluftgerät mit Elektrofilterzelle",
    metin:
      "Abluftsysteme mit elektrostatischen Filterzellen zur Kontrolle von Fettaerosolen, Rauch und Feinstaub aus dem Kochbetrieb in Restaurant-, Hotel- und Gewerbeküchen. Wir planen und installieren die gesamte Strecke von der Haube bis zum Ventilator schlüsselfertig.",
    maddeler: ["Vorfilter + Elektrofilterzelle (ESP) + Ventilator", "Optionale Geruchsbeseitigungsstufe", "Planung von Haube und Abluftkanal", "Regelmäßige Wartung und Zellenreinigung"],
    urun: "AIRNEX Produktdetails →",
    teklif: "Angebot für Ihr Küchenprojekt anfordern →",
  },
  cBaslik: "Lassen Sie uns Ihr Haustechnikprojekt gemeinsam planen",
  cMetin: "Senden Sie uns Ihre Architektur- oder TGA-Pläne – unsere Fachingenieure erstellen Leistungsberechnung und Kostenangebot noch am selben Tag.",
  cDugme: "Kostenlose Besichtigung anfordern →",
};

const METIN: Record<Dil, Metin> = { tr, en, de };

export function generateMetadata(): Metadata {
  const dil = dilAl();
  const t = METIN[dil];
  return {
    title: t.metaBaslik,
    description: t.metaAciklama,
    alternates: dilAlternatifleri(dil, "/hizmetler"),
  };
}

function Madde({ children }: { children: string }) {
  return (
    <div className="flex items-start gap-2 text-xs text-slate-700">
      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
      <span>{children}</span>
    </div>
  );
}

export default async function HizmetlerPage() {
  const sirket = await getSirketAyarlari();
  const dil = dilAl();
  const t = METIN[dil];
  const y = (h: string) => yol(dil, h);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      {/* HEADER */}
      <Header />

      <main className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-16">

          {/* SAYFA BAŞLIĞI VE TANITIM */}
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              {t.rozet}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              {t.h1a}<br />
              <span className="text-teal-700 underline decoration-teal-300/80 decoration-4 underline-offset-8">
                {t.h1b}
              </span>
            </h1>
            <p className="text-base text-slate-600 leading-relaxed pt-2">
              {sirket.unvan}{t.giris}
            </p>
          </div>

          {/* MÜHENDİSLİK TEKNİK ÇİZİM KARTLARI GRİDİ */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {KARTLAR.map((g, i) => {
              const k = t.kartlar[i];
              return (
                <div key={g.id} id={g.id} className="scroll-mt-24 bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <div className={g.kutu}>
                      <span className={`absolute z-10 top-3 right-3 text-[10px] font-bold ${g.rozetRenk} bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md`}>
                        {k.rozet}
                      </span>
                      <Image
                        src={g.gorsel}
                        alt={k.alt}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className={g.gorselSinif}
                      />
                      {g.katman && <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-transparent" />}
                    </div>

                    <div className="p-6 space-y-4">
                      <span className="text-[11px] font-bold tracking-wider text-teal-700 uppercase block">
                        {k.ust}
                      </span>
                      <h2 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {k.baslik}
                      </h2>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {k.metin}
                      </p>

                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        {k.maddeler.map((m) => (
                          <Madde key={m}>{m}</Madde>
                        ))}
                        {g.ekLink && k.ekLink && (
                          <Link href={y(g.ekLink)} className="inline-block pt-1 text-xs font-bold text-teal-700 hover:underline">
                            {k.ekLink}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <Link href={y("/iletisim")} className="block w-full py-2.5 bg-slate-900 hover:bg-teal-700 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm">
                      {t.kesifDugme}
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* 7. KART (GENİŞ): MUTFAK HAVALANDIRMA — AIRNEX */}
            <div id="mutfak-havalandirma" className="scroll-mt-24 md:col-span-2 lg:col-span-3 bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-teal-500/40 transition-all duration-300 grid lg:grid-cols-5 group">
              <div className="lg:col-span-2 relative h-56 lg:h-auto bg-slate-950">
                <Image
                  src="/airnex/airnex-kesit.jpg"
                  alt={t.airnex.alt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
                <span className="absolute top-3 right-3 text-[10px] font-bold text-teal-300 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
                  {t.airnex.rozet}
                </span>
              </div>

              <div className="lg:col-span-3 p-6 sm:p-8 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-[11px] font-bold tracking-wider text-teal-700 uppercase block">
                    {t.airnex.ust}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {t.airnex.baslik}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t.airnex.metin}
                  </p>

                  <div className="pt-3 border-t border-slate-100 grid sm:grid-cols-2 gap-2">
                    {t.airnex.maddeler.map((m) => (
                      <Madde key={m}>{m}</Madde>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href={y("/airnex")} className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm">
                    {t.airnex.urun}
                  </Link>
                  <Link href={y("/iletisim")} className="flex-1 py-2.5 bg-slate-900 hover:bg-teal-700 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm">
                    {t.airnex.teklif}
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* ÇAĞRI BANNERI */}
          <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold">{t.cBaslik}</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                {t.cMetin}
              </p>
            </div>
            <Link
              href={y("/iletisim")}
              className="shrink-0 px-7 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm rounded-lg transition-colors shadow-md"
            >
              {t.cDugme}
            </Link>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
