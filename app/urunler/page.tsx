import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getSirketAyarlari } from "@/lib/sirket";
import { dilAlternatifleri, yol, type Dil } from "@/lib/dil";
import { dilAl } from "@/lib/dil-sunucu";

export const dynamic = "force-dynamic";

// Kart görselleri ve bağlantıları (dilden bağımsız; sıra METIN.kartlar ile aynı)
// "gorsel" alanı olan kartların üstünde ürün fotoğrafı gösterilir (fotoğraflar marka kataloglarından)
const KART_TABAN: { id: string; gorsel?: string; detay?: { href: string; katalog?: string } }[] = [
  { id: "vrf-sistemleri", gorsel: "/urunler/urun-vrf.jpg", detay: { href: "/tcl-vrf", katalog: "/kataloglar/tcl-vrf-tmv6-super-katalog-2026.pdf" } },
  { id: "bireysel-klima", gorsel: "/urunler/urun-bireysel-klima.jpg" },
  { id: "ticari-klima", gorsel: "/urunler/urun-ticari-klima.jpg" },
  { id: "isi-pompasi", gorsel: "/hizmetler/hizmet-isi-pompasi.jpg" },
  { id: "yerden-isitma", gorsel: "/yerden-isitma/yerden-isitma-kart.jpg" },
  { id: "isi-pompasi-isitma", gorsel: "/buderus/gb272-kart.jpg", detay: { href: "/buderus", katalog: "/kataloglar/buderus-logamax-plus-gb272-katalog.pdf" } },
  { id: "aluminyum-radyator", gorsel: "/ayen/ayen-kart.jpg", detay: { href: "/ayen" } },
  { id: "hava-perdesi", gorsel: "/hava-perdesi/olefini-giris.jpg", detay: { href: "/hava-perdesi" } },
  { id: "radyant-isitma" },
  { id: "havalandirma", gorsel: "/urunler/urun-havalandirma.jpg" },
];

type KartMetni = {
  gorselAlt?: string;
  kategori: string;
  baslik: string;
  aciklama: string;
  urunler: string[];
  markalar: string;
  gorselBaslik?: string; // Fotoğraf yoksa kart başlığındaki büyük yazı (boşsa marka adı)
  detayEtiket?: string;
};

// ÜRÜNLER METİNLERİ (Türkçe / English / Deutsch)
const tr = {
  metaBaslik: "Ürünler — TCL, Mitsubishi Electric VRF & Klima, Isı Pompası, Yerden Isıtma",
  metaAciklama:
    "TCL ve Mitsubishi Electric VRF, klima ve multi klima sistemleri, Buderus ve diğer markalarda ısı pompaları, Fraenkische yerden ısıtma, Buderus yoğuşmalı kazanlar, havalandırma ve AIRNEX mutfak aspiratörleri.",
  rozet: "MEKANİK TESİSAT & İKLİMLENDİRME ÜRÜNLERİ",
  h1a: "TCL ve Mitsubishi Electric ",
  h1b: "VRF, Klima ve Isı Pompası.",
  giris:
    "; TCL ve Mitsubishi Electric VRF ve klima sistemlerinden ısı pompalarına, Fraenkische yerden ısıtmadan Buderus yoğuşmalı kazanlara, havalandırmadan AIRNEX mutfak aspiratörlerine kadar projenizin ürün ihtiyacını mühendislik güvencesiyle sağlar.",
  kartlar: [
    {
      gorselAlt: "TCL TMV6+ Super Serisi VRF dış ünitesi",
      kategori: "MERKEZİ İKLİMLENDİRME",
      baslik: "TCL & Mitsubishi Electric VRF Sistemleri",
      aciklama: "Otel, plaza, hastane ve binalarda her odayı bağımsız iklimlendiren TCL TMV serisi ve Mitsubishi Electric City Multi VRF dış/iç ünite grupları.",
      urunler: ["TCL TMV Serisi VRF Sistemleri", "Mitsubishi Electric City Multi VRF", "Heat Pump & Heat Recovery Dış Üniteler", "Y-Branch & Joint Bağlantı Kitleri"],
      markalar: "TCL, Mitsubishi Electric",
      detayEtiket: "TCL VRF Ürün Detayları →",
    },
    {
      gorselAlt: "Oturma odasında duvar tipi klima iç ünitesi",
      kategori: "BİREYSEL İKLİMLENDİRME",
      baslik: "TCL & Mitsubishi Electric Klima ve Multi Klima",
      aciklama: "Konut ve ofisler için TCL ve Mitsubishi Electric yüksek verimli Inverter duvar tipi klimalar ve tek dış üniteye birden çok iç ünite bağlanan multi klima sistemleri.",
      urunler: ["TCL Inverter Duvar Tipi Klimalar", "Mitsubishi Electric Inverter Duvar Tipi Klimalar", "Multi-Split Çoklu İç Ünite Sistemleri"],
      markalar: "TCL, Mitsubishi Electric",
    },
    {
      gorselAlt: "Tavana monte kaset tipi klima iç ünitesi",
      kategori: "TİCARİ İKLİMLENDİRME",
      baslik: "Ticari Tip Klimalar",
      aciklama: "Mağaza, cafe, restoran ve açık ofis alanları için 4 yöne üflemeli kaset, kanallı gizli tavan, konsol ve salon tipi cihazlar.",
      urunler: ["4 Yöne Üflemeli Kaset Tipi Klimalar", "Gizli Tavan Tipi Kanallı Klimalar", "Konsol Tipi Klimalar", "Salon Tipi Klimalar"],
      markalar: "TCL, Mitsubishi Electric",
    },
    {
      gorselAlt: "Hava kaynaklı ısı pompası dış üniteleri",
      kategori: "ISI POMPASI",
      baslik: "Hava Kaynaklı Isı Pompaları",
      aciklama: "Konut, villa ve ticari yapılar için hava kaynaklı ısı pompaları. Buderus başta olmak üzere projeye en uygun markayla; yerden ısıtma, radyatör ve sıcak su entegrasyonu.",
      urunler: ["Buderus Hava Kaynaklı Isı Pompaları", "Farklı Marka Isı Pompası Seçenekleri", "Yüksek Sıcaklık Isı Pompaları (85°C)", "Boyler ve Tampon Tank Entegrasyonu"],
      markalar: "Buderus ve projeye uygun diğer markalar",
    },
    {
      gorselAlt: "Spiral serimle döşenmiş yerden ısıtma boruları",
      kategori: "YERDEN ISITMA",
      baslik: "Fraenkische Yerden Isıtma Sistemleri",
      aciklama: "Zeminden eşit ve konforlu ısıtma için Fraenkische yerden ısıtma boru, kolektör ve bağlantı sistemleri. Isı pompası ve yoğuşmalı kazanla birlikte projelendirilir.",
      urunler: ["Yerden Isıtma Boruları", "Kolektör ve Dağıtım Grupları", "Oda Termostatları ve Kontrol", "Isı Pompası / Kazan Entegrasyonu"],
      markalar: "Fraenkische",
    },
    {
      gorselAlt: "Buderus Logamax plus GB272 duvar tipi yoğuşmalı kazan",
      detayEtiket: "GB272 Ürün Detayları →",
      kategori: "KAZAN DAİRESİ & KASKAD",
      baslik: "Buderus Yoğuşmalı Kazanlar & Kazan Dairesi Yenileme",
      aciklama: "Eski kazan dairelerinin yenilenmesi için Buderus duvar tipi yoğuşmalı kazanlar ve 16 kazana kadar kaskad merkezi ısıtma sistemleri.",
      urunler: ["Buderus Logamax plus GB272 (49–150 kW)", "Merkezi Kaskad Kazan Sistemleri", "Pompa, Kollektör ve Denge Kabı Grupları"],
      markalar: "Buderus",
    },
    {
      gorselAlt: "Ahşap desenli Ayen Class alüminyum radyatör",
      detayEtiket: "Ayen Ürün Detayları →",
      kategori: "RADYATÖR & HAVLUPAN",
      baslik: "Ayen Alüminyum Radyatör ve Havlupanlar",
      aciklama: "Hızlı ısınan, hafif ve uzun ömürlü alüminyum panel radyatörler ve havlupanlar. 300–1900 mm yükseklik, 30 renk seçeneği; ısı kaybı hesabıyla dilim seçimi ve montaj.",
      urunler: ["9 Alüminyum Panel Radyatör Serisi", "9 Alüminyum Havlupan Modeli", "Termostatik Vana ve Elektrik Kitleri"],
      markalar: "Ayen",
    },
    {
      gorselAlt: "Cam giriş kapısı üzerinde Olefini hava perdesi",
      detayEtiket: "Hava Perdesi Modelleri →",
      kategori: "HAVA PERDESİ",
      baslik: "Niva ve Olefini Hava Perdeleri",
      aciklama: "Mağaza, restoran, otel, AVM ve endüstriyel kapılar için ısıtıcılı ve ısıtıcısız hava perdeleri. Kapı açıkken bile ısıtılan ya da soğutulan hava içeride kalır.",
      urunler: ["Genel ve Ticari Tip Hava Perdeleri", "Tavana Gömme Kaset Tip", "Endüstriyel Tip (12 m'ye kadar)", "Dikey Hava Perdeleri"],
      markalar: "Niva, Olefini",
    },
    {
      kategori: "ENDÜSTRİYEL ISITMA",
      baslik: "Radyant & Sıcak Hava Isıtma Sistemleri",
      aciklama: "Fabrika, depo, cafe ve açık alanlar için yüksek tasarruflu borulu ve seramik radyant ısıtıcılar ile sıcak hava üreteçleri. Projenize en uygun markayı birlikte seçiyoruz.",
      urunler: ["Seramik Radyant Isıtıcılar", "Borulu Radyant Isıtma Sistemleri", "Sıcak Hava Üreteçleri"],
      markalar: "",
      gorselBaslik: "Radyant & Sıcak Hava",
    },
    {
      kategori: "TAZE HAVA & İGK",
      baslik: "Havalandırma & Isı Geri Kazanım Cihazları",
      aciklama: "Kapalı ortamlara filtrelenmiş taze hava sağlarken egzoz havasındaki ısıyı geri kazanan yüksek verimli iklimlendirme santralleri. Projenize en uygun markayı birlikte seçiyoruz.",
      urunler: ["Isı Geri Kazanım (İGK) Santralleri", "Spiro Yuvarlak & Dikdörtgen Hava Kanalları", "Sığınak & Otopark Duman Egzoz Fanları"],
      markalar: "",
      gorselAlt: "Isı geri kazanımlı havalandırma cihazının kesit görünümü",
    },
  ] as KartMetni[],
  urunGruplari: "Ürün Grupları:",
  marka: "Marka:",
  markaSecimi: "Projeye uygun marka seçimi",
  katalog: "Katalog ↓",
  teklifDugme: "Projeniz İçin Fiyat Teklifi İsteyin →",
  muEtiket: "ENDÜSTRİYEL MUTFAK ÇÖZÜMLERİ",
  muBaslik: "Restoran ve Otel Mutfakları İçin",
  axAlt: "AIRNEX elektrostatik hücreli aspiratör — endüstriyel mutfak uygulaması",
  axUst: "MUTFAK HAVALANDIRMA · MARKAMIZ",
  axBaslik: "AIRNEX Elektrostatik Hücreli Aspiratör",
  axMetin:
    "Restoran, otel ve endüstriyel mutfak egzozlarında yağ aerosolleri, duman ve ince partiküllerin kontrolü için elektrostatik filtrasyon hücreli, modüler ve servis dostu aspiratör sistemi.",
  axMaddeler: ["Ön filtre + elektrostatik hücre + fan", "Opsiyonel aktif karbon / UV koku kademesi", "Izgara, fritöz, fırın ve proses egzozları"],
  axDetay: "Ürün Detayları →",
  axKatalog: "Katalog (PDF) ↓",
  axTeklif: "Fiyat Teklifi İsteyin →",
  cBaslik: "Projeniz İçin Toplu Cihaz Fiyatı Alın",
  cMetin: "VRF, klima, ısı pompası ve yerden ısıtma cihaz listelerinizi gönderin, mühendislerimiz avantajlı fiyat teklifi hazırlasın.",
  cDugme: "Fiyat Teklifi İste →",
};

type Metin = typeof tr;

const en: Metin = {
  metaBaslik: "Products — TCL, Mitsubishi Electric VRF & Air Conditioning, Heat Pumps, Underfloor Heating",
  metaAciklama:
    "TCL and Mitsubishi Electric VRF, air conditioning and multi-split systems, heat pumps from Buderus and other brands, Fraenkische underfloor heating, Buderus condensing boilers, ventilation and AIRNEX kitchen exhaust units.",
  rozet: "MECHANICAL INSTALLATION & HVAC PRODUCTS",
  h1a: "TCL and Mitsubishi Electric ",
  h1b: "VRF, Air Conditioning and Heat Pumps.",
  giris:
    " supplies the products your project needs with engineering assurance — from TCL and Mitsubishi Electric VRF and air conditioning systems to heat pumps, from Fraenkische underfloor heating to Buderus condensing boilers, and from ventilation to AIRNEX kitchen exhaust units.",
  kartlar: [
    {
      gorselAlt: "TCL TMV6+ Super Series VRF outdoor unit",
      kategori: "CENTRAL AIR CONDITIONING",
      baslik: "TCL & Mitsubishi Electric VRF Systems",
      aciklama: "TCL TMV series and Mitsubishi Electric City Multi VRF outdoor/indoor unit groups that condition every room independently in hotels, office towers, hospitals and other buildings.",
      urunler: ["TCL TMV Series VRF Systems", "Mitsubishi Electric City Multi VRF", "Heat Pump & Heat Recovery Outdoor Units", "Y-Branch & Joint Kits"],
      markalar: "TCL, Mitsubishi Electric",
      detayEtiket: "TCL VRF Product Details →",
    },
    {
      gorselAlt: "Wall-mounted air conditioner indoor unit in a living room",
      kategori: "RESIDENTIAL AIR CONDITIONING",
      baslik: "TCL & Mitsubishi Electric Air Conditioners and Multi-Split",
      aciklama: "High-efficiency TCL and Mitsubishi Electric inverter wall-mounted air conditioners for homes and offices, and multi-split systems connecting several indoor units to a single outdoor unit.",
      urunler: ["TCL Inverter Wall-Mounted Air Conditioners", "Mitsubishi Electric Inverter Wall-Mounted Air Conditioners", "Multi-Split Systems with Multiple Indoor Units"],
      markalar: "TCL, Mitsubishi Electric",
    },
    {
      gorselAlt: "Ceiling-mounted cassette air conditioner indoor unit",
      kategori: "COMMERCIAL AIR CONDITIONING",
      baslik: "Commercial Air Conditioners",
      aciklama: "4-way cassette, concealed ducted, console and floor-standing units for shops, cafés, restaurants and open-plan offices.",
      urunler: ["4-Way Cassette Air Conditioners", "Concealed Ducted Air Conditioners", "Console Air Conditioners", "Floor-Standing Air Conditioners"],
      markalar: "TCL, Mitsubishi Electric",
    },
    {
      gorselAlt: "Air-source heat pump outdoor units",
      kategori: "HEAT PUMPS",
      baslik: "Air-Source Heat Pumps",
      aciklama: "Air-source heat pumps for homes, villas and commercial buildings. With Buderus first and foremost, or the brand best suited to the project; integration with underfloor heating, radiators and domestic hot water.",
      urunler: ["Buderus Air-Source Heat Pumps", "Heat Pumps from Other Brands", "High-Temperature Heat Pumps (85°C)", "Hot Water Cylinder and Buffer Tank Integration"],
      markalar: "Buderus and other brands suited to the project",
    },
    {
      gorselAlt: "Underfloor heating pipes laid in a spiral pattern",
      kategori: "UNDERFLOOR HEATING",
      baslik: "Fraenkische Underfloor Heating Systems",
      aciklama: "Fraenkische underfloor heating pipe, manifold and connection systems for even, comfortable heating from the floor. Designed together with heat pumps and condensing boilers.",
      urunler: ["Underfloor Heating Pipes", "Manifolds and Distribution Groups", "Room Thermostats and Controls", "Heat Pump / Boiler Integration"],
      markalar: "Fraenkische",
    },
    {
      gorselAlt: "Buderus Logamax plus GB272 wall-mounted condensing boiler",
      detayEtiket: "GB272 Product Details →",
      kategori: "BOILER ROOM & CASCADE",
      baslik: "Buderus Condensing Boilers & Boiler Room Renovation",
      aciklama: "Buderus wall-mounted condensing boilers and cascade central heating systems with up to 16 boilers for the renovation of old boiler rooms.",
      urunler: ["Buderus Logamax plus GB272 (49–150 kW)", "Central Cascade Boiler Systems", "Pump, Manifold and Low-Loss Header Groups"],
      markalar: "Buderus",
    },
    {
      gorselAlt: "Wood-pattern Ayen Class aluminium radiator",
      detayEtiket: "Ayen Product Details →",
      kategori: "RADIATORS & TOWEL RADIATORS",
      baslik: "Ayen Aluminium Radiators and Towel Radiators",
      aciklama: "Fast-heating, lightweight and durable aluminium panel radiators and towel radiators. 300–1900 mm heights, 30 colour options; section selection based on heat loss calculation, and installation.",
      urunler: ["9 Aluminium Panel Radiator Series", "9 Aluminium Towel Radiator Models", "Thermostatic Valves and Electric Kits"],
      markalar: "Ayen",
    },
    {
      gorselAlt: "Olefini air curtain above a glass entrance door",
      detayEtiket: "Air Curtain Models →",
      kategori: "AIR CURTAINS",
      baslik: "Niva and Olefini Air Curtains",
      aciklama: "Air curtains with and without heaters for shops, restaurants, hotels, shopping centres and industrial doors. Heated or cooled air stays inside even when the door is open.",
      urunler: ["General and Commercial Air Curtains", "Recessed Ceiling Cassette Type", "Industrial Type (up to 12 m)", "Vertical Air Curtains"],
      markalar: "Niva, Olefini",
    },
    {
      kategori: "INDUSTRIAL HEATING",
      baslik: "Radiant & Warm Air Heating Systems",
      aciklama: "Highly efficient tube and ceramic radiant heaters and warm air heaters for factories, warehouses, cafés and outdoor areas. We choose the most suitable brand for your project together.",
      urunler: ["Ceramic Radiant Heaters", "Radiant Tube Heating Systems", "Warm Air Heaters"],
      markalar: "",
      gorselBaslik: "Radiant & Warm Air",
    },
    {
      kategori: "FRESH AIR & HRV",
      baslik: "Ventilation & Heat Recovery Units",
      aciklama: "High-efficiency air handling units that supply filtered fresh air to indoor spaces while recovering heat from the exhaust air. We choose the most suitable brand for your project together.",
      urunler: ["Heat Recovery (HRV) Air Handling Units", "Spiral Round & Rectangular Air Ducts", "Shelter & Car Park Smoke Exhaust Fans"],
      markalar: "",
      gorselAlt: "Cross-section of a heat recovery ventilation unit",
    },
  ],
  urunGruplari: "Product Groups:",
  marka: "Brand:",
  markaSecimi: "Brand selected to suit the project",
  katalog: "Catalogue ↓",
  teklifDugme: "Request a Price Quote for Your Project →",
  muEtiket: "COMMERCIAL KITCHEN SOLUTIONS",
  muBaslik: "For Restaurant and Hotel Kitchens",
  axAlt: "AIRNEX electrostatic cell exhaust unit — commercial kitchen installation",
  axUst: "KITCHEN VENTILATION · OUR BRAND",
  axBaslik: "AIRNEX Electrostatic Cell Exhaust Unit",
  axMetin:
    "A modular, service-friendly exhaust unit with electrostatic filtration cells to control grease aerosols, smoke and fine particles in restaurant, hotel and commercial kitchen exhaust.",
  axMaddeler: ["Pre-filter + electrostatic cell + fan", "Optional activated carbon / UV odour stage", "Grill, fryer, oven and process exhaust"],
  axDetay: "Product Details →",
  axKatalog: "Catalogue (PDF) ↓",
  axTeklif: "Request a Price Quote →",
  cBaslik: "Get Bulk Equipment Pricing for Your Project",
  cMetin: "Send us your VRF, air conditioning, heat pump and underfloor heating equipment lists and our engineers will prepare a competitive price quote.",
  cDugme: "Request a Price Quote →",
};

const de: Metin = {
  metaBaslik: "Produkte — TCL, Mitsubishi Electric VRF & Klima, Wärmepumpen, Fußbodenheizung",
  metaAciklama:
    "TCL- und Mitsubishi-Electric-VRF-, Klima- und Multisplit-Systeme, Wärmepumpen von Buderus und weiteren Marken, Fraenkische Fußbodenheizung, Buderus Brennwertkessel, Lüftung und AIRNEX Küchenabluftgeräte.",
  rozet: "PRODUKTE FÜR HAUSTECHNIK & KLIMA",
  h1a: "TCL und Mitsubishi Electric ",
  h1b: "VRF, Klima und Wärmepumpen.",
  giris:
    " liefert die Produkte für Ihr Projekt mit Ingenieursgarantie – von TCL- und Mitsubishi-Electric-VRF- und Klimasystemen über Wärmepumpen, von Fraenkische Fußbodenheizung bis zu Buderus Brennwertkesseln und von Lüftung bis zu AIRNEX Küchenabluftgeräten.",
  kartlar: [
    {
      gorselAlt: "TCL TMV6+ Super Serie VRF-Außengerät",
      kategori: "ZENTRALE KLIMATISIERUNG",
      baslik: "TCL & Mitsubishi Electric VRF-Systeme",
      aciklama: "Außen-/Innengerätegruppen der TCL TMV-Serie und Mitsubishi Electric City Multi VRF, die in Hotels, Bürogebäuden, Krankenhäusern und weiteren Gebäuden jeden Raum unabhängig klimatisieren.",
      urunler: ["TCL TMV-Serie VRF-Systeme", "Mitsubishi Electric City Multi VRF", "Außengeräte mit Wärmepumpe & Wärmerückgewinnung", "Y-Abzweiger & Verbindungssets"],
      markalar: "TCL, Mitsubishi Electric",
      detayEtiket: "TCL VRF Produktdetails →",
    },
    {
      gorselAlt: "Wandgerät einer Klimaanlage im Wohnzimmer",
      kategori: "KLIMATISIERUNG FÜR WOHNRÄUME",
      baslik: "TCL & Mitsubishi Electric Klima- und Multisplit-Geräte",
      aciklama: "Hocheffiziente TCL- und Mitsubishi-Electric-Inverter-Wandgeräte für Wohnungen und Büros sowie Multisplit-Systeme, bei denen mehrere Innengeräte an ein Außengerät angeschlossen werden.",
      urunler: ["TCL Inverter-Wandgeräte", "Mitsubishi Electric Inverter-Wandgeräte", "Multisplit-Systeme mit mehreren Innengeräten"],
      markalar: "TCL, Mitsubishi Electric",
    },
    {
      gorselAlt: "Deckenmontiertes Kassetten-Innengerät",
      kategori: "GEWERBLICHE KLIMATISIERUNG",
      baslik: "Gewerbliche Klimageräte",
      aciklama: "4-Wege-Kassetten-, Kanal-, Truhen- und Standgeräte für Geschäfte, Cafés, Restaurants und Großraumbüros.",
      urunler: ["4-Wege-Kassettengeräte", "Kanalgeräte für abgehängte Decken", "Truhengeräte", "Standgeräte"],
      markalar: "TCL, Mitsubishi Electric",
    },
    {
      gorselAlt: "Außengeräte von Luft-Wasser-Wärmepumpen",
      kategori: "WÄRMEPUMPEN",
      baslik: "Luft-Wasser-Wärmepumpen",
      aciklama: "Luft-Wasser-Wärmepumpen für Wohnhäuser, Villen und Gewerbebauten. Allen voran mit Buderus oder der für das Projekt am besten geeigneten Marke; Einbindung von Fußbodenheizung, Heizkörpern und Warmwasser.",
      urunler: ["Buderus Luft-Wasser-Wärmepumpen", "Wärmepumpen weiterer Marken", "Hochtemperatur-Wärmepumpen (85°C)", "Einbindung von Warmwasser- und Pufferspeicher"],
      markalar: "Buderus und weitere zum Projekt passende Marken",
    },
    {
      gorselAlt: "Spiralförmig verlegte Fußbodenheizungsrohre",
      kategori: "FUSSBODENHEIZUNG",
      baslik: "Fraenkische Fußbodenheizungssysteme",
      aciklama: "Fraenkische Rohr-, Verteiler- und Anschlusssysteme für gleichmäßige, behagliche Wärme vom Boden. Geplant zusammen mit Wärmepumpe und Brennwertkessel.",
      urunler: ["Fußbodenheizungsrohre", "Verteiler- und Verteilergruppen", "Raumthermostate und Regelung", "Einbindung von Wärmepumpe / Kessel"],
      markalar: "Fraenkische",
    },
    {
      gorselAlt: "Wandhängender Buderus Logamax plus GB272 Brennwertkessel",
      detayEtiket: "GB272 Produktdetails →",
      kategori: "HEIZRAUM & KASKADE",
      baslik: "Buderus Brennwertkessel & Heizraumsanierung",
      aciklama: "Wandhängende Buderus Brennwertkessel und Kaskaden-Zentralheizungen mit bis zu 16 Kesseln für die Sanierung alter Heizräume.",
      urunler: ["Buderus Logamax plus GB272 (49–150 kW)", "Zentrale Kaskadenkesselanlagen", "Pumpen-, Verteiler- und Weichengruppen"],
      markalar: "Buderus",
    },
    {
      gorselAlt: "Ayen Class Aluminiumheizkörper in Holzoptik",
      detayEtiket: "Ayen Produktdetails →",
      kategori: "HEIZKÖRPER & BADHEIZKÖRPER",
      baslik: "Ayen Aluminiumheizkörper und Badheizkörper",
      aciklama: "Schnell aufheizende, leichte und langlebige Aluminium-Paneelheizkörper und Badheizkörper. 300–1900 mm Bauhöhe, 30 Farben; Gliederauswahl nach Heizlastberechnung und Montage.",
      urunler: ["9 Aluminium-Paneelheizkörper-Serien", "9 Aluminium-Badheizkörper-Modelle", "Thermostatventile und Elektro-Sets"],
      markalar: "Ayen",
    },
    {
      gorselAlt: "Olefini-Torluftschleier über einer Glaseingangstür",
      detayEtiket: "Torluftschleier-Modelle →",
      kategori: "TORLUFTSCHLEIER",
      baslik: "Niva und Olefini Torluftschleier",
      aciklama: "Torluftschleier mit und ohne Heizung für Geschäfte, Restaurants, Hotels, Einkaufszentren und Industrietore. Erwärmte oder gekühlte Luft bleibt auch bei geöffneter Tür im Raum.",
      urunler: ["Torluftschleier für allgemeinen und gewerblichen Einsatz", "Deckeneinbau-Kassettenausführung", "Industrieausführung (bis 12 m)", "Vertikale Torluftschleier"],
      markalar: "Niva, Olefini",
    },
    {
      kategori: "INDUSTRIEHEIZUNG",
      baslik: "Strahlungs- & Warmluftheizsysteme",
      aciklama: "Hocheffiziente Dunkel- und Keramikstrahler sowie Warmlufterzeuger für Fabriken, Lager, Cafés und Außenbereiche. Wir wählen gemeinsam die am besten geeignete Marke für Ihr Projekt.",
      urunler: ["Keramik-Infrarotstrahler", "Dunkelstrahler-Heizsysteme", "Warmlufterzeuger"],
      markalar: "",
      gorselBaslik: "Strahlung & Warmluft",
    },
    {
      kategori: "FRISCHLUFT & WRG",
      baslik: "Lüftungs- & Wärmerückgewinnungsgeräte",
      aciklama: "Hocheffiziente Lüftungsgeräte, die Innenräume mit gefilterter Frischluft versorgen und dabei die Wärme der Abluft zurückgewinnen. Wir wählen gemeinsam die am besten geeignete Marke für Ihr Projekt.",
      urunler: ["Lüftungsgeräte mit Wärmerückgewinnung (WRG)", "Wickelfalzrohre & Rechteckkanäle", "Entrauchungsventilatoren für Schutzräume & Tiefgaragen"],
      markalar: "",
      gorselAlt: "Schnittansicht eines Lüftungsgeräts mit Wärmerückgewinnung",
    },
  ],
  urunGruplari: "Produktgruppen:",
  marka: "Marke:",
  markaSecimi: "Markenauswahl passend zum Projekt",
  katalog: "Katalog ↓",
  teklifDugme: "Preisangebot für Ihr Projekt anfordern →",
  muEtiket: "LÖSUNGEN FÜR GEWERBEKÜCHEN",
  muBaslik: "Für Restaurant- und Hotelküchen",
  axAlt: "AIRNEX Abluftgerät mit Elektrofilterzelle — Einsatz in einer Gewerbeküche",
  axUst: "KÜCHENLÜFTUNG · UNSERE MARKE",
  axBaslik: "AIRNEX Abluftgerät mit Elektrofilterzelle",
  axMetin:
    "Modulares, wartungsfreundliches Abluftgerät mit elektrostatischen Filterzellen zur Kontrolle von Fettaerosolen, Rauch und Feinstaub in der Abluft von Restaurant-, Hotel- und Gewerbeküchen.",
  axMaddeler: ["Vorfilter + Elektrofilterzelle + Ventilator", "Optionale Aktivkohle-/UV-Geruchsstufe", "Abluft von Grill, Fritteuse, Ofen und Prozessen"],
  axDetay: "Produktdetails →",
  axKatalog: "Katalog (PDF) ↓",
  axTeklif: "Preisangebot anfordern →",
  cBaslik: "Erhalten Sie Projektpreise für Ihre Geräte",
  cMetin: "Senden Sie uns Ihre Gerätelisten für VRF, Klima, Wärmepumpen und Fußbodenheizung – unsere Ingenieure erstellen Ihnen ein günstiges Preisangebot.",
  cDugme: "Preisangebot anfordern →",
};

const METIN: Record<Dil, Metin> = { tr, en, de };

export function generateMetadata(): Metadata {
  const dil = dilAl();
  const t = METIN[dil];
  return {
    title: t.metaBaslik,
    description: t.metaAciklama,
    alternates: dilAlternatifleri(dil, "/urunler"),
  };
}

export default async function UrunlerPage() {
  const sirket = await getSirketAyarlari();
  const dil = dilAl();
  const t = METIN[dil];
  const y = (h: string) => yol(dil, h);
  const urunKategorileri = KART_TABAN.map((k, i) => ({ ...k, ...t.kartlar[i] }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      <Header />

      <main className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {urunKategorileri.map((kat) => (
              <div
                key={kat.id}
                className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:shadow-lg hover:border-teal-500/40 transition-all duration-300 flex flex-col"
              >
                {kat.gorsel ? (
                  <div className="relative w-full aspect-[3/2] bg-slate-100">
                    <Image
                      src={kat.gorsel}
                      alt={kat.gorselAlt ?? kat.baslik}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[3/2] bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 flex flex-col items-center justify-center text-center px-6">
                    <span className="text-[11px] font-bold tracking-widest text-teal-300 uppercase">{kat.kategori}</span>
                    <span className="text-2xl font-bold text-white mt-2">{kat.gorselBaslik || kat.markalar}</span>
                  </div>
                )}
                <div className="p-8 space-y-6 flex flex-col justify-between flex-1">
                <div className="space-y-4">
                  <span className="text-[11px] font-bold tracking-wider text-teal-700 uppercase">
                    {kat.kategori}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">{kat.baslik}</h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {kat.aciklama}
                  </p>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.urunGruplari}</p>
                    {kat.urunler.map((u, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                        <span>{u}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  {kat.markalar ? (
                    <p className="text-[10px] font-bold text-slate-400 font-mono">{t.marka} {kat.markalar}</p>
                  ) : (
                    <p className="text-[10px] font-bold text-slate-400 font-mono">{t.marka} {t.markaSecimi}</p>
                  )}
                  {kat.detay && (
                    <div className="flex gap-2">
                      <Link
                        href={y(kat.detay.href)}
                        className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm"
                      >
                        {kat.detayEtiket}
                      </Link>
                      {kat.detay.katalog && (
                        <a
                          href={kat.detay.katalog}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="px-3 py-2.5 bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-800 text-center font-bold text-xs rounded-lg transition-colors"
                        >
                          {t.katalog}
                        </a>
                      )}
                    </div>
                  )}
                  <Link
                    href={y("/iletisim")}
                    className="block w-full py-2.5 bg-slate-900 hover:bg-teal-700 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm"
                  >
                    {t.teklifDugme}
                  </Link>
                </div>
                </div>
              </div>
            ))}
          </div>

          {/* ENDÜSTRİYEL MUTFAK ÇÖZÜMLERİ (ana ürün gruplarından sonra) */}
          <div className="pt-4">
            <p className="text-xs font-bold tracking-widest text-teal-700 uppercase mb-2">{t.muEtiket}</p>
            <h2 className="text-2xl font-bold text-slate-900">{t.muBaslik}</h2>
          </div>
          {/* AIRNEX MUTFAK HAVALANDIRMA */}
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm grid lg:grid-cols-2">
            <div className="relative h-56 sm:h-72 lg:h-auto bg-slate-950">
              <Image
                src="/airnex/airnex-mutfak.jpg"
                alt={t.axAlt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-8 space-y-4 flex flex-col justify-center">
              <span className="text-[11px] font-bold tracking-wider text-teal-700 uppercase">
                {t.axUst}
              </span>
              <h2 className="text-2xl font-bold text-slate-900">{t.axBaslik}</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.axMetin}
              </p>
              <div className="space-y-2">
                {t.axMaddeler.map((u) => (
                  <div key={u} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                    <span>{u}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href={y("/airnex")}
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm"
                >
                  {t.axDetay}
                </Link>
                <a
                  href="/kataloglar/airnex-elektrostatik-hucreli-aspirator-katalog.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  download="AIRNEX-Elektrostatik-Hucreli-Aspirator-Katalogu.pdf"
                  className="flex-1 py-2.5 bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-800 text-center font-bold text-xs rounded-lg transition-colors"
                >
                  {t.axKatalog}
                </a>
                <Link
                  href={y("/iletisim")}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-teal-700 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm"
                >
                  {t.axTeklif}
                </Link>
              </div>
            </div>
          </div>

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

      <Footer />
    </div>
  );
}