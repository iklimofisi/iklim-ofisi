import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { JsonLd, SITE } from "@/components/YapisalVeri";
import SikSorulanSorular, { sssYapisalVeri, type Sss } from "@/components/SikSorulanSorular";
import { dilAlternatifleri, yol, type Dil } from "@/lib/dil";
import { dilAl } from "@/lib/dil-sunucu";

// -----------------------------------------------------------------------------
// AYEN ALÜMİNYUM RADYATÖR SAYFASI (/ayen)
// Değerler Ayen ürün kataloğundan alınmıştır (dilim başına ısıl güç: Δt 60, 90/70/20 °C).
// Görseller kataloğun ürün sayfalarından kesildi: public/ayen/
// Sitede katalog PDF'i paylaşılmaz.
// -----------------------------------------------------------------------------

export const dynamic = "force-dynamic";


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


// AYEN SAYFASI METİNLERİ (Türkçe / English / Deutsch)
const tr = {
  metaBaslik: "Ayen Alüminyum Radyatör ve Havlupan Modelleri | İklim Ofisi",
  metaAciklama:
    "Ayen alüminyum radyatör ve havlupan: 9 panel radyatör, 9 havlupan modeli, 30 renk. EN 442 ve TSE belgeli. İstanbul'da keşif, satış ve montaj için teklif alın.",
  anahtar: [
    "Ayen radyatör",
    "Ayen alüminyum radyatör",
    "Ayen havlupan",
    "alüminyum radyatör",
    "alüminyum havlupan",
    "dekoratif radyatör",
    "renkli radyatör",
    "alüminyum radyatör İstanbul",
  ],
  ogBaslik: "Ayen Alüminyum Radyatör | İklim Ofisi",
  ogAciklama: "Panel radyatör ve havlupan modelleri, 30 renk seçeneği. Satış, keşif ve montaj.",
  ogAlt: "Ayen alüminyum radyatör ve havlupan",
  oneCikanlar: [
    ["%98 alüminyum", "AlMgSi0,5 alaşımı, ekstrüzyonla tek parça profil"],
    ["15 bar", "Her radyatör sızdırmazlık testinden geçer"],
    ["90 °C · 10 bar", "Maksimum işletme sıcaklığı ve basıncı"],
    ["EN 442 · TSE", "Avrupa radyatör normu ve TSE belgesi"],
    ["30 renk", "RAL renkleri, gold, krom ve ahşap desenleri"],
    ["Yerli üretim", "İstanbul'da üretilen Ayen markası"],
  ] as [string, string][],
  avantaj: [
    ["Hızlı ısınır, az su ister", "Alüminyumun yüksek ısı iletimi sayesinde oda kısa sürede ısınır; dilim başına su hacmi düşüktür."],
    ["Kaynaksız, contasız gövde", "Su kanalları özel burç ile sıkı geçme yöntemiyle birleştirilir; 2,10 mm et kalınlığı."],
    ["Tortu tutmayan kanallar", "Pürüzsüz su kanallarında tortu birikmez; verim zamanla düşmez, korozyona dayanıklıdır."],
    ["Termostatik vana ile tasarruf", "Termostat kontrollü tesisatta odaya göre ısı ayarı ile enerji tasarrufu."],
    ["Her bağlantıya uygun", "Yandan, alttan ve çapraz bağlantı; havlupanlarda üstten, ortadan ve alttan giriş."],
    ["Elektrostatik toz boya", "Dayanıklı yüzey; istenirse elektrikli ısıtıcı kiti ile kullanılabilen havlupanlar."],
  ] as [string, string][],
  renkAdi: {} as Record<string, string>,
  // Cevaplar yalnız bu sayfadaki Ayen katalog bilgilerine dayanır
  sss: [
    [
      "Ayen radyatör nasıl bir radyatördür?",
      "Ayen, İstanbul'da üretilen yerli bir alüminyum radyatör ve havlupan markasıdır. Radyatörler %98 alüminyum (AlMgSi0,5) alaşımdan ekstrüzyonla tek parça profil olarak üretilir; EN 442 normuna uygundur ve TSE belgelidir. Her radyatör 15 bar sızdırmazlık testinden geçer.",
    ],
    [
      "Ayen radyatör modelleri nelerdir?",
      "Panel radyatörde 9 seri vardır: Class, Orkide, Lale, Alya, Electra, Anka, Heka, Açelya ve Akasya. Havlupanda da 9 model bulunur: Stil, Rigel, Elit, Capella, Luna, Vega, Venüs, Spica ve Star.",
    ],
    [
      "Ayen radyatörün bir dilimi kaç watt ısı verir?",
      "600 mm yükseklikte, Δt 60 koşulunda (90/70 °C su, 20 °C oda) dilim başına ısıl güç modele göre 98 W ile 163 W arasındadır. Örneğin Class ve Açelya 151 W, Alya ve Electra 163 W, Lale, Anka ve Heka 98 W verir.",
    ],
    [
      "Bir oda için kaç dilim radyatör gerekir?",
      "Odanın ısı kaybı, seçilen modelin dilim gücüne bölünerek bulunur. Örneğin 1.500 W ısı kaybı olan bir oda için dilim başına 151 W veren bir model seçilirse yaklaşık 10 dilim gerekir. Kesin sayı için oda oda ısı kaybı hesabı yapıyoruz.",
    ],
    [
      "Ayen radyatör kombi ve yoğuşmalı kazanla kullanılır mı?",
      "Evet; kombi, yoğuşmalı kazan veya ısı pompası ile kullanılabilir. Yoğuşmalı kazan ve ısı pompası gibi düşük su sıcaklığında çalışan sistemlerde radyatörün verdiği ısı azaldığı için dilim sayısı bu sıcaklığa göre hesaplanmalıdır.",
    ],
    [
      "Hangi renk seçenekleri var?",
      "RAL renkleri, antrasit, siyah, gold, krom ve açık/koyu ahşap desenleri dahil 30 renk seçeneği vardır. Renkler elektrostatik toz boya ile uygulanır.",
    ],
    [
      "Ayen havlupan elektrikle çalışır mı?",
      "Havlupanlar kalorifer tesisatına bağlanır; istenirse elektrikli ısıtıcı kiti ile de kullanılabilir. Havlupanlarda üstten, ortadan ve alttan bağlantı seçenekleri vardır.",
    ],
  ] as Sss[],
  ld: {
    anaSayfa: "Ana Sayfa",
    urunler: "Ürünler",
    sayfa: "Ayen Alüminyum Radyatör",
    panelGrup: "Ayen Alüminyum Panel Radyatörler",
    panelKategori: "Alüminyum radyatör",
    panelAd: (ad: string) => `Ayen ${ad} alüminyum radyatör`,
    dilimGenisligi: "Dilim genişliği",
    kalinlik: "Radyatör kalınlığı",
    yukseklik: "Yükseklik",
    isilGuc: "Isıl güç (600 mm, dilim başına, Δt 60)",
    havlupanGrup: "Ayen Alüminyum Havlupanlar",
    havlupanKategori: "Alüminyum havlupan",
    havlupanAd: (ad: string) => `Ayen ${ad} alüminyum havlupan`,
  },
  sayfaYolu: "Sayfa yolu",
  rozet: "AYEN · ALÜMİNYUM RADYATÖR",
  h1: "Ayen Alüminyum Radyatör",
  altBaslik: "Panel radyatör ve havlupan modelleri, 30 renk seçeneği.",
  giris:
    "Hızlı ısınan, hafif ve uzun ömürlü alüminyum radyatörler. Konut, ofis, otel ve villalar için 9 panel radyatör ve 9 havlupan serisi; 300 mm'den 1900 mm'ye kadar yükseklik. Isı kaybı hesabına göre dilim sayısını belirliyor, radyatörü tesisatıyla birlikte satıyor ve monte ediyoruz.",
  hizli: ["Panel Radyatörler", "Havlupanlar", "Renkler"],
  teklifDugme: "Fiyat Teklifi İsteyin →",
  heroAlt: "Ahşap desenli Ayen Class alüminyum radyatör",
  prEtiket: "PANEL RADYATÖRLER",
  prBaslik: "9 dilimli alüminyum radyatör serisi",
  prMetin:
    "Radyatör boyu dilim sayısıyla belirlenir; yükseklik 100 mm adımlarla seçilir. Isıl güçler 600 mm yükseklikte, dilim başına verilmiştir (Δt 60, 90/70/20 °C).",
  dilimGenisligi: "Dilim genişliği",
  kalinlik: "Kalınlık",
  yukseklik: "Yükseklik",
  isilGuc: "Isıl güç (600'lük)",
  wDilim: "W / dilim",
  hvEtiket: "HAVLUPANLAR",
  hvBaslik: "Alüminyum havlupan modelleri",
  hvMetin:
    "Banyolar için 9 farklı tasarım. Tüm modeller üstten, ortadan veya alttan bağlanabilir; yaz aylarında elektrikli ısıtıcı kiti ile de kullanılabilir.",
  yukseklikMm: (y: string) => `Yükseklik ${y} mm`,
  naEtiket: "NEDEN ALÜMİNYUM RADYATÖR",
  naBaslik: "Hafif, hızlı ve uzun ömürlü",
  rkEtiket: "RENK SEÇENEKLERİ",
  rkBaslik: "Dekorasyonunuza uygun 30 renk",
  rkMetin: "Renkler ekranda yaklaşık görünür; kesin renk için numune kartelasını gösteriyoruz.",
  sssBaslik: "Ayen radyatör hakkında merak edilenler",
  ilgili: [
    { href: "/blog/aluminyum-radyator-mu-celik-panel-radyator-mu", ad: "Alüminyum Radyatör mü, Çelik Panel Radyatör mü?" },
    { href: "/blog/buderus-ile-merkezi-ve-bireysel-isitma", ad: "Kaskad Kazan Nedir?" },
  ],
  ctaEtiket: "SATIŞ · KEŞİF · MONTAJ",
  ctaBaslik: "Doğru dilim sayısını birlikte belirleyelim",
  ctaMaddeler: [
    "• Oda oda ısı kaybı hesabı ve radyatör boyu seçimi",
    "• Eski radyatörlerin sökülüp yenisiyle değiştirilmesi",
    "• Termostatik vana, boru muhafazası ve havlupan elektrik kiti",
    "• Kombi, yoğuşmalı kazan veya ısı pompası ile uyumlu tesisat",
  ],
  hesapA: "Isı kaybınızı kabaca görmek için",
  hesapLink: "kapasite hesaplama",
  hesapB: "aracımızı kullanabilirsiniz. Alüminyum ve çelik panel radyatör farklarını",
  yaziLink: "bu yazımızda",
  yaziB: "anlattık.",
  kutuBaslik: "Ayen radyatör fiyat teklifi alın.",
  kutuMetin: "Oda ölçülerini, istediğiniz model ve rengi paylaşın; radyatör ve montaj teklifini hazırlayalım.",
  kutuDugme: "Teklif İsteyin →",
};

type Metin = typeof tr;

const en: Metin = {
  metaBaslik: "Ayen Aluminium Radiator and Towel Radiator Models | İklim Ofisi",
  metaAciklama:
    "Ayen aluminium radiators and towel radiators: 9 panel radiator and 9 towel radiator models, 30 colours. EN 442 and TSE certified. Request a quote for site survey, supply and installation in Istanbul.",
  anahtar: [
    "Ayen radiator",
    "Ayen aluminium radiator",
    "Ayen towel radiator",
    "aluminium radiator",
    "aluminium towel radiator",
    "decorative radiator",
    "coloured radiator",
    "aluminium radiator Istanbul",
  ],
  ogBaslik: "Ayen Aluminium Radiators | İklim Ofisi",
  ogAciklama: "Panel radiator and towel radiator models, 30 colour options. Supply, site survey and installation.",
  ogAlt: "Ayen aluminium radiators and towel radiators",
  oneCikanlar: [
    ["98% aluminium", "AlMgSi0.5 alloy, single-piece extruded profile"],
    ["15 bar", "Every radiator undergoes a leak test"],
    ["90 °C · 10 bar", "Maximum operating temperature and pressure"],
    ["EN 442 · TSE", "European radiator standard and TSE certificate"],
    ["30 colours", "RAL colours, gold, chrome and wood finishes"],
    ["Made in Türkiye", "Ayen brand manufactured in Istanbul"],
  ],
  avantaj: [
    ["Heats up fast, needs little water", "Thanks to aluminium's high thermal conductivity, the room warms up quickly; water content per section is low."],
    ["Weld-free, gasket-free body", "Water channels are joined with special bushes by press-fitting; 2.10 mm wall thickness."],
    ["Deposit-free channels", "No deposits build up in the smooth water channels; efficiency does not drop over time and it is corrosion-resistant."],
    ["Savings with thermostatic valves", "Energy savings through room-by-room heat control in thermostatically controlled systems."],
    ["Suitable for every connection", "Side, bottom and diagonal connection; top, middle and bottom inlets on towel radiators."],
    ["Electrostatic powder coating", "Durable surface; towel radiators can also be used with an electric heater kit if desired."],
  ],
  renkAdi: { "Süt beyaz": "Milk white", "Kırık beyaz": "Off-white", Antrasit: "Anthracite", Siyah: "Black", Krom: "Chrome", Gold: "Gold", "Açık ahşap": "Light wood", "Koyu ahşap": "Dark wood" },
  sss: [
    [
      "What kind of radiator is Ayen?",
      "Ayen is a Turkish aluminium radiator and towel radiator brand manufactured in Istanbul. The radiators are produced as single-piece extruded profiles from 98% aluminium (AlMgSi0.5) alloy; they comply with the EN 442 standard and are TSE certified. Every radiator undergoes a 15 bar leak test.",
    ],
    [
      "Which Ayen radiator models are available?",
      "There are 9 panel radiator series: Class, Orkide, Lale, Alya, Electra, Anka, Heka, Açelya and Akasya. There are also 9 towel radiator models: Stil, Rigel, Elit, Capella, Luna, Vega, Venüs, Spica and Star.",
    ],
    [
      "How many watts does one section of an Ayen radiator deliver?",
      "At a height of 600 mm and Δt 60 (90/70 °C water, 20 °C room), the heat output per section ranges from 98 W to 163 W depending on the model. For example, Class and Açelya deliver 151 W, Alya and Electra 163 W, and Lale, Anka and Heka 98 W.",
    ],
    [
      "How many radiator sections does a room need?",
      "The number is found by dividing the room's heat loss by the output per section of the chosen model. For example, a room with 1,500 W heat loss needs about 10 sections of a model delivering 151 W per section. For the exact number, we carry out a room-by-room heat loss calculation.",
    ],
    [
      "Can Ayen radiators be used with combi and condensing boilers?",
      "Yes; they can be used with combi boilers, condensing boilers or heat pumps. In systems running at lower water temperatures, such as condensing boilers and heat pumps, the radiator's heat output decreases, so the number of sections must be calculated for that temperature.",
    ],
    [
      "Which colour options are available?",
      "There are 30 colour options, including RAL colours, anthracite, black, gold, chrome and light/dark wood finishes. Colours are applied with electrostatic powder coating.",
    ],
    [
      "Do Ayen towel radiators work electrically?",
      "The towel radiators are connected to the central heating system; if desired, they can also be used with an electric heater kit. Top, middle and bottom connection options are available.",
    ],
  ],
  ld: {
    anaSayfa: "Home",
    urunler: "Products",
    sayfa: "Ayen Aluminium Radiators",
    panelGrup: "Ayen Aluminium Panel Radiators",
    panelKategori: "Aluminium radiator",
    panelAd: (ad: string) => `Ayen ${ad} aluminium radiator`,
    dilimGenisligi: "Section width",
    kalinlik: "Radiator depth",
    yukseklik: "Height",
    isilGuc: "Heat output (600 mm, per section, Δt 60)",
    havlupanGrup: "Ayen Aluminium Towel Radiators",
    havlupanKategori: "Aluminium towel radiator",
    havlupanAd: (ad: string) => `Ayen ${ad} aluminium towel radiator`,
  },
  sayfaYolu: "Breadcrumb",
  rozet: "AYEN · ALUMINIUM RADIATORS",
  h1: "Ayen Aluminium Radiators",
  altBaslik: "Panel radiator and towel radiator models, 30 colour options.",
  giris:
    "Fast-heating, lightweight and durable aluminium radiators. 9 panel radiator and 9 towel radiator series for homes, offices, hotels and villas, in heights from 300 mm to 1900 mm. We determine the number of sections based on the heat loss calculation, and supply and install the radiators together with the piping.",
  hizli: ["Panel Radiators", "Towel Radiators", "Colours"],
  teklifDugme: "Request a Price Quote →",
  heroAlt: "Wood-pattern Ayen Class aluminium radiator",
  prEtiket: "PANEL RADIATORS",
  prBaslik: "9 sectional aluminium radiator series",
  prMetin:
    "The radiator length is determined by the number of sections; the height is selected in 100 mm steps. Heat outputs are given per section at a height of 600 mm (Δt 60, 90/70/20 °C).",
  dilimGenisligi: "Section width",
  kalinlik: "Depth",
  yukseklik: "Height",
  isilGuc: "Heat output (600 mm)",
  wDilim: "W / section",
  hvEtiket: "TOWEL RADIATORS",
  hvBaslik: "Aluminium towel radiator models",
  hvMetin:
    "9 different designs for bathrooms. All models can be connected at the top, middle or bottom, and can also be used with an electric heater kit in the summer months.",
  yukseklikMm: (y: string) => `Height ${y} mm`,
  naEtiket: "WHY ALUMINIUM RADIATORS",
  naBaslik: "Lightweight, fast and durable",
  rkEtiket: "COLOUR OPTIONS",
  rkBaslik: "30 colours to suit your interior",
  rkMetin: "Colours shown on screen are approximate; we show you the sample colour chart for the exact shade.",
  sssBaslik: "Common questions about Ayen radiators",
  ilgili: [
    { href: "/blog/aluminyum-radyator-mu-celik-panel-radyator-mu", ad: "Aluminium or Steel Panel Radiator?" },
    { href: "/blog/buderus-ile-merkezi-ve-bireysel-isitma", ad: "What Is a Cascade Boiler?" },
  ],
  ctaEtiket: "SUPPLY · SITE SURVEY · INSTALLATION",
  ctaBaslik: "Let's determine the right number of sections together",
  ctaMaddeler: [
    "• Room-by-room heat loss calculation and radiator length selection",
    "• Removal of old radiators and replacement with new ones",
    "• Thermostatic valves, pipe covers and electric kits for towel radiators",
    "• Piping compatible with combi boilers, condensing boilers or heat pumps",
  ],
  hesapA: "To get a rough idea of your heat loss, you can use our",
  hesapLink: "capacity calculator",
  hesapB: "tool. We explain the differences between aluminium and steel panel radiators",
  yaziLink: "in this article",
  yaziB: ".",
  kutuBaslik: "Get a price quote for Ayen radiators.",
  kutuMetin: "Share the room dimensions and your preferred model and colour; we will prepare the radiator and installation quote.",
  kutuDugme: "Request a Quote →",
};

const de: Metin = {
  metaBaslik: "Ayen Aluminiumheizkörper und Badheizkörper | İklim Ofisi",
  metaAciklama:
    "Ayen Aluminiumheizkörper und Badheizkörper: 9 Paneelheizkörper- und 9 Badheizkörper-Modelle, 30 Farben. EN 442- und TSE-zertifiziert. Angebot für Besichtigung, Lieferung und Montage in Istanbul anfordern.",
  anahtar: [
    "Ayen Heizkörper",
    "Ayen Aluminiumheizkörper",
    "Ayen Badheizkörper",
    "Aluminiumheizkörper",
    "Aluminium-Badheizkörper",
    "Designheizkörper",
    "farbige Heizkörper",
    "Aluminiumheizkörper Istanbul",
  ],
  ogBaslik: "Ayen Aluminiumheizkörper | İklim Ofisi",
  ogAciklama: "Paneel- und Badheizkörper-Modelle, 30 Farben. Lieferung, Besichtigung und Montage.",
  ogAlt: "Ayen Aluminiumheizkörper und Badheizkörper",
  oneCikanlar: [
    ["98 % Aluminium", "AlMgSi0,5-Legierung, einteiliges Strangpressprofil"],
    ["15 bar", "Jeder Heizkörper wird auf Dichtheit geprüft"],
    ["90 °C · 10 bar", "Maximale Betriebstemperatur und -druck"],
    ["EN 442 · TSE", "Europäische Heizkörpernorm und TSE-Zertifikat"],
    ["30 Farben", "RAL-Farben, Gold, Chrom und Holzdekore"],
    ["Made in Türkiye", "Marke Ayen, in Istanbul gefertigt"],
  ],
  avantaj: [
    ["Schnell warm, wenig Wasser", "Dank der hohen Wärmeleitfähigkeit von Aluminium wird der Raum schnell warm; der Wasserinhalt pro Glied ist gering."],
    ["Schweißnaht- und dichtungsfrei", "Die Wasserkanäle werden mit speziellen Buchsen im Pressverfahren verbunden; 2,10 mm Wandstärke."],
    ["Ablagerungsfreie Kanäle", "In den glatten Wasserkanälen setzen sich keine Ablagerungen ab; die Leistung sinkt nicht und die Korrosionsbeständigkeit ist hoch."],
    ["Sparen mit Thermostatventil", "Energieeinsparung durch raumweise Temperaturregelung in thermostatgeregelten Anlagen."],
    ["Für jeden Anschluss geeignet", "Seitlicher, unterer und diagonaler Anschluss; bei Badheizkörpern Anschluss oben, mittig und unten."],
    ["Elektrostatische Pulverbeschichtung", "Robuste Oberfläche; Badheizkörper auf Wunsch auch mit Elektroheizstab nutzbar."],
  ],
  renkAdi: { "Süt beyaz": "Milchweiß", "Kırık beyaz": "Altweiß", Antrasit: "Anthrazit", Siyah: "Schwarz", Krom: "Chrom", Gold: "Gold", "Açık ahşap": "Helles Holz", "Koyu ahşap": "Dunkles Holz" },
  sss: [
    [
      "Was für ein Heizkörper ist Ayen?",
      "Ayen ist eine türkische Marke für Aluminiumheizkörper und Badheizkörper aus Istanbul. Die Heizkörper werden als einteilige Strangpressprofile aus 98 % Aluminium (AlMgSi0,5) gefertigt; sie entsprechen der Norm EN 442 und sind TSE-zertifiziert. Jeder Heizkörper wird einer Dichtheitsprüfung mit 15 bar unterzogen.",
    ],
    [
      "Welche Ayen-Modelle gibt es?",
      "Bei den Paneelheizkörpern gibt es 9 Serien: Class, Orkide, Lale, Alya, Electra, Anka, Heka, Açelya und Akasya. Bei den Badheizkörpern gibt es ebenfalls 9 Modelle: Stil, Rigel, Elit, Capella, Luna, Vega, Venüs, Spica und Star.",
    ],
    [
      "Wie viel Watt liefert ein Glied eines Ayen-Heizkörpers?",
      "Bei 600 mm Bauhöhe und Δt 60 (90/70 °C Wasser, 20 °C Raum) liegt die Wärmeleistung pro Glied je nach Modell zwischen 98 W und 163 W. Beispielsweise liefern Class und Açelya 151 W, Alya und Electra 163 W sowie Lale, Anka und Heka 98 W.",
    ],
    [
      "Wie viele Heizkörperglieder braucht ein Raum?",
      "Die Gliederzahl ergibt sich aus der Heizlast des Raumes geteilt durch die Leistung pro Glied des gewählten Modells. Ein Raum mit 1.500 W Heizlast benötigt bei einem Modell mit 151 W pro Glied rund 10 Glieder. Für die genaue Zahl führen wir eine raumweise Heizlastberechnung durch.",
    ],
    [
      "Lassen sich Ayen-Heizkörper mit Kombi- und Brennwertkesseln betreiben?",
      "Ja; sie können mit Kombithermen, Brennwertkesseln oder Wärmepumpen betrieben werden. Bei Systemen mit niedrigerer Wassertemperatur wie Brennwertkessel und Wärmepumpe sinkt die Wärmeabgabe des Heizkörpers, daher muss die Gliederzahl für diese Temperatur berechnet werden.",
    ],
    [
      "Welche Farben gibt es?",
      "Es gibt 30 Farben, darunter RAL-Farben, Anthrazit, Schwarz, Gold, Chrom sowie helle und dunkle Holzdekore. Die Farben werden als elektrostatische Pulverbeschichtung aufgetragen.",
    ],
    [
      "Funktionieren Ayen-Badheizkörper auch elektrisch?",
      "Die Badheizkörper werden an die Zentralheizung angeschlossen; auf Wunsch können sie auch mit einem Elektroheizstab betrieben werden. Es gibt Anschlussmöglichkeiten oben, mittig und unten.",
    ],
  ],
  ld: {
    anaSayfa: "Startseite",
    urunler: "Produkte",
    sayfa: "Ayen Aluminiumheizkörper",
    panelGrup: "Ayen Aluminium-Paneelheizkörper",
    panelKategori: "Aluminiumheizkörper",
    panelAd: (ad: string) => `Ayen ${ad} Aluminiumheizkörper`,
    dilimGenisligi: "Gliederbreite",
    kalinlik: "Bautiefe",
    yukseklik: "Bauhöhe",
    isilGuc: "Wärmeleistung (600 mm, pro Glied, Δt 60)",
    havlupanGrup: "Ayen Aluminium-Badheizkörper",
    havlupanKategori: "Aluminium-Badheizkörper",
    havlupanAd: (ad: string) => `Ayen ${ad} Aluminium-Badheizkörper`,
  },
  sayfaYolu: "Brotkrümelnavigation",
  rozet: "AYEN · ALUMINIUMHEIZKÖRPER",
  h1: "Ayen Aluminiumheizkörper",
  altBaslik: "Paneel- und Badheizkörper-Modelle, 30 Farben.",
  giris:
    "Schnell aufheizende, leichte und langlebige Aluminiumheizkörper. 9 Paneelheizkörper- und 9 Badheizkörper-Serien für Wohnungen, Büros, Hotels und Villen, mit Bauhöhen von 300 mm bis 1900 mm. Wir ermitteln die Gliederzahl anhand der Heizlastberechnung und liefern und montieren die Heizkörper zusammen mit der Installation.",
  hizli: ["Paneelheizkörper", "Badheizkörper", "Farben"],
  teklifDugme: "Preisangebot anfordern →",
  heroAlt: "Ayen Class Aluminiumheizkörper in Holzoptik",
  prEtiket: "PANEELHEIZKÖRPER",
  prBaslik: "9 Aluminium-Gliederheizkörper-Serien",
  prMetin:
    "Die Heizkörperlänge ergibt sich aus der Gliederzahl; die Bauhöhe wird in 100-mm-Schritten gewählt. Die Wärmeleistungen gelten pro Glied bei 600 mm Bauhöhe (Δt 60, 90/70/20 °C).",
  dilimGenisligi: "Gliederbreite",
  kalinlik: "Bautiefe",
  yukseklik: "Bauhöhe",
  isilGuc: "Wärmeleistung (600 mm)",
  wDilim: "W / Glied",
  hvEtiket: "BADHEIZKÖRPER",
  hvBaslik: "Aluminium-Badheizkörper-Modelle",
  hvMetin:
    "9 verschiedene Designs für Badezimmer. Alle Modelle lassen sich oben, mittig oder unten anschließen und in den Sommermonaten auch mit einem Elektroheizstab nutzen.",
  yukseklikMm: (y: string) => `Bauhöhe ${y} mm`,
  naEtiket: "WARUM ALUMINIUMHEIZKÖRPER",
  naBaslik: "Leicht, schnell und langlebig",
  rkEtiket: "FARBAUSWAHL",
  rkBaslik: "30 Farben passend zu Ihrer Einrichtung",
  rkMetin: "Die Farben werden am Bildschirm nur annähernd dargestellt; für den genauen Farbton zeigen wir Ihnen die Musterkarte.",
  sssBaslik: "Häufige Fragen zu Ayen-Heizkörpern",
  ilgili: [
    { href: "/blog/aluminyum-radyator-mu-celik-panel-radyator-mu", ad: "Aluminium- oder Stahl-Flachheizkörper?" },
    { href: "/blog/buderus-ile-merkezi-ve-bireysel-isitma", ad: "Was ist ein Kaskadenkessel?" },
  ],
  ctaEtiket: "LIEFERUNG · BESICHTIGUNG · MONTAGE",
  ctaBaslik: "Lassen Sie uns gemeinsam die richtige Gliederzahl bestimmen",
  ctaMaddeler: [
    "• Raumweise Heizlastberechnung und Wahl der Heizkörperlänge",
    "• Demontage alter Heizkörper und Austausch gegen neue",
    "• Thermostatventile, Rohrabdeckungen und Elektro-Sets für Badheizkörper",
    "• Installation passend zu Kombitherme, Brennwertkessel oder Wärmepumpe",
  ],
  hesapA: "Für eine grobe Einschätzung Ihrer Heizlast können Sie unseren",
  hesapLink: "Leistungsrechner",
  hesapB: "nutzen. Die Unterschiede zwischen Aluminium- und Stahl-Flachheizkörpern erklären wir",
  yaziLink: "in diesem Artikel",
  yaziB: ".",
  kutuBaslik: "Preisangebot für Ayen-Heizkörper erhalten.",
  kutuMetin: "Teilen Sie uns Raummaße, gewünschtes Modell und Farbe mit – wir erstellen das Angebot für Heizkörper und Montage.",
  kutuDugme: "Angebot anfordern →",
};

const METIN: Record<Dil, Metin> = { tr, en, de };

export function generateMetadata(): Metadata {
  const dil = dilAl();
  const t = METIN[dil];
  return {
    // Google'da kısalmadan görünsün diye kısa başlık (site adı eklenmeden)
    title: { absolute: t.metaBaslik },
    description: t.metaAciklama,
    keywords: t.anahtar,
    alternates: dilAlternatifleri(dil, "/ayen"),
    openGraph: {
      title: t.ogBaslik,
      description: t.ogAciklama,
      url: `${SITE}${yol(dil, "/ayen")}`,
      images: [{ url: "/og/ayen.jpg", width: 1200, height: 630, alt: t.ogAlt }],
    },
  };
}

export default function AyenPage() {
  const dil = dilAl();
  const t = METIN[dil];
  const y = (h: string) => yol(dil, h);
  const SAYFA = `${SITE}${y("/ayen")}`;

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
                { "@type": "ListItem", position: 1, name: t.ld.anaSayfa, item: dil === "tr" ? SITE : `${SITE}${y("/")}` },
                { "@type": "ListItem", position: 2, name: t.ld.urunler, item: `${SITE}${y("/urunler")}` },
                { "@type": "ListItem", position: 3, name: t.ld.sayfa, item: SAYFA },
              ],
            },
            {
              "@type": "ProductGroup",
              "@id": `${SAYFA}#panel`,
              name: t.ld.panelGrup,
              brand: { "@type": "Brand", name: "Ayen" },
              category: t.ld.panelKategori,
              url: SAYFA,
              image: `${SITE}/ayen/ayen-class.jpg`,
              hasVariant: PANEL.map(([ad, g, dilim, kal, yuk, w]) => ({
                "@type": "Product",
                name: t.ld.panelAd(ad),
                brand: { "@type": "Brand", name: "Ayen" },
                image: `${SITE}/ayen/ayen-${g}.jpg`,
                additionalProperty: [
                  { "@type": "PropertyValue", name: t.ld.dilimGenisligi, value: dilim, unitText: "mm" },
                  { "@type": "PropertyValue", name: t.ld.kalinlik, value: kal, unitText: "mm" },
                  { "@type": "PropertyValue", name: t.ld.yukseklik, value: yuk, unitText: "mm" },
                  { "@type": "PropertyValue", name: t.ld.isilGuc, value: w, unitText: "W" },
                ],
              })),
            },
            {
              "@type": "ProductGroup",
              "@id": `${SAYFA}#havlupan`,
              name: t.ld.havlupanGrup,
              brand: { "@type": "Brand", name: "Ayen" },
              category: t.ld.havlupanKategori,
              url: `${SAYFA}#havlupan`,
              hasVariant: HAVLUPAN.map(([ad, g]) => ({
                "@type": "Product",
                name: t.ld.havlupanAd(ad),
                brand: { "@type": "Brand", name: "Ayen" },
                image: `${SITE}/ayen/ayen-havlupan-${g}.jpg`,
              })),
            },
            sssYapisalVeri(t.sss),
          ],
        }}
      />

      <main>
        {/* 1. HERO */}
        <section className="bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <nav aria-label={t.sayfaYolu} className="text-xs text-slate-500">
                <Link href={y("/")} className="hover:text-teal-700">{t.ld.anaSayfa}</Link> <span aria-hidden>/</span>{" "}
                <Link href={y("/urunler")} className="hover:text-teal-700">{t.ld.urunler}</Link> <span aria-hidden>/</span>{" "}
                <span className="text-slate-700">{t.ld.sayfa}</span>
              </nav>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                {t.rozet}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">{t.h1}</h1>
              <p className="text-lg font-semibold text-teal-700">{t.altBaslik}</p>
              <p className="text-base text-slate-600 leading-relaxed">
                {t.giris}
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(["#panel", "#havlupan", "#renkler"] as const).map((h, i) => (
                  <a key={h} href={h} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center font-bold text-slate-700 hover:border-teal-500/50 hover:text-teal-800 transition-colors">
                    {t.hizli[i]}
                  </a>
                ))}
              </div>
              <div className="pt-2">
                <Link href={y("/iletisim")} className="inline-block px-8 py-4 rounded-lg bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 shadow-sm transition-all text-center">
                  {t.teklifDugme}
                </Link>
              </div>
            </div>
            <div className="relative w-full aspect-[8/5] rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100">
              <Image src="/ayen/ayen-slider.jpg" alt={t.heroAlt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          </div>
        </section>

        {/* 2. ÖNE ÇIKANLAR */}
        <section className="py-14 md:py-16">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
            {t.oneCikanlar.map(([deger, aciklama]) => (
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
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.prEtiket}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.prBaslik}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.prMetin}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {PANEL.map(([ad, g, dilim, kal, yuk, w]) => (
                <article key={ad} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="relative aspect-[1241/780] bg-slate-200">
                    <Image src={`/ayen/ayen-${g}.jpg`} alt={t.ld.panelAd(ad)} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" className="object-cover" />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">Ayen {ad}</h3>
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                      <dt className="text-slate-500">{t.dilimGenisligi}</dt>
                      <dd className="text-right font-semibold text-slate-800">{dilim} mm</dd>
                      <dt className="text-slate-500">{t.kalinlik}</dt>
                      <dd className="text-right font-semibold text-slate-800">{kal} mm</dd>
                      <dt className="text-slate-500">{t.yukseklik}</dt>
                      <dd className="text-right font-semibold text-slate-800">{yuk} mm</dd>
                      <dt className="text-slate-500">{t.isilGuc}</dt>
                      <dd className="text-right font-semibold text-teal-700">{w} {t.wDilim}</dd>
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
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.hvEtiket}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.hvBaslik}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.hvMetin}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {HAVLUPAN.map(([ad, g, yuk]) => (
                <figure key={ad} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="relative aspect-[894/1008] bg-slate-200">
                    <Image src={`/ayen/ayen-havlupan-${g}.jpg`} alt={t.ld.havlupanAd(ad)} fill sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 45vw" className="object-cover" />
                  </div>
                  <figcaption className="p-3">
                    <p className="text-sm font-bold text-slate-900">Ayen {ad}</p>
                    <p className="text-[11px] text-slate-500">{t.yukseklikMm(yuk)}</p>
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
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.naEtiket}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.naBaslik}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {t.avantaj.map(([baslik, metin]) => (
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
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.rkEtiket}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.rkBaslik}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{t.rkMetin}</p>
            </div>
            <ul className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-3">
              {RENKLER.map(([ad, renk]) => (
                <li key={ad} className="text-center">
                  <span className="block aspect-square rounded-lg border border-slate-300 shadow-sm" style={{ background: renk }} />
                  <span className="block text-[11px] text-slate-600 mt-1.5">{t.renkAdi[ad] ?? ad}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 7. SIK SORULAN SORULAR */}
        <SikSorulanSorular
          baslik={t.sssBaslik}
          sss={t.sss}
          zemin="bg-white border-y border-slate-200/80"
          ilgili={t.ilgili}
          dil={dil}
        />

        {/* 8. CTA */}
        <section className="py-16 md:py-20 bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">{t.ctaEtiket}</p>
              <h2 className="text-2xl sm:text-3xl font-bold">{t.ctaBaslik}</h2>
              <ul className="space-y-2 text-sm text-slate-300">
                {t.ctaMaddeler.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t.hesapA}{" "}
                <Link href={y("/hesaplama")} className="text-teal-300 underline underline-offset-2">
                  {t.hesapLink}
                </Link>{" "}
                {t.hesapB}{" "}
                <Link href={y("/blog/aluminyum-radyator-mu-celik-panel-radyator-mu")} className="text-teal-300 underline underline-offset-2">
                  {t.yaziLink}
                </Link>
                {t.yaziB === "." ? "" : " "}
                {t.yaziB}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-10 space-y-5">
              <h3 className="text-xl sm:text-2xl font-bold">{t.kutuBaslik}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t.kutuMetin}
              </p>
              <Link href={y("/iletisim")} className="block py-3.5 bg-teal-600 hover:bg-teal-500 text-white text-center font-bold text-sm rounded-lg transition-colors shadow-md">
                {t.kutuDugme}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
