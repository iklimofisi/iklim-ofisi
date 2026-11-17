import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { Fragment } from "react";
import type { Metadata } from "next";
import { JsonLd, SITE } from "@/components/YapisalVeri";
import { dilAlternatifleri, yol, type Dil } from "@/lib/dil";
import { dilAl } from "@/lib/dil-sunucu";

// -----------------------------------------------------------------------------
// TCL VRF ÜRÜN SAYFASI (/tcl-vrf, /en/tcl-vrf, /de/tcl-vrf)
// "TCL VRF", "TCL VRF klima", "TCL TMV6+", "TCL Mini VRF" aramaları için hazırlandı.
// Tüm teknik değerler TCL TMV6+ Super Serisi Akıllı VRF kataloğundan (2026, Türkçe) alınmıştır.
// Görseller kataloğun ürün sayfalarından kesildi: public/tcl/
// -----------------------------------------------------------------------------

export const dynamic = "force-dynamic";

const KATALOG = "/kataloglar/tcl-vrf-tmv6-super-katalog-2026.pdf";

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

type IcUnite = { ad: string; yer: string; ozellik: string };

// TCL VRF SAYFASI METİNLERİ (Türkçe / English / Deutsch)
const tr = {
  metaBaslik: "TCL VRF Klima Sistemleri — TMV6+ Super Serisi ve Mini VRF | İstanbul",
  metaAciklama:
    "TCL VRF klima sistemleri: TMV6+ Super tam DC inverter VRF (tek ünite 8–32 HP, kombinasyonla 128 HP'ye kadar, 80 iç ünite) ve TCL Mini VRF (8–28 kW). Teknik veriler, iç ünite gamı, PDF katalog. İstanbul'da keşif, projelendirme ve montaj.",
  anahtar: ["TCL VRF", "TCL VRF klima", "TCL TMV6+", "TCL TMV6 Super", "TCL Mini VRF", "TCL klima", "TCL VRF fiyat", "TCL VRF katalog", "VRF klima İstanbul"],
  ogBaslik: "TCL VRF Sistemleri — TMV6+ Super Serisi | İklim Ofisi",
  ogAciklama: "Tam DC inverter TCL VRF: 128 HP'ye kadar kombinasyon, tek sistemde 80 iç ünite, SEER 7,35. Teknik veriler ve PDF katalog.",
  ogAlt: "TCL VRF Sistemleri — TMV6+ Super Serisi",
  katalogDugme: "TCL VRF Kataloğu (PDF)",
  oneCikanlar: [
    ["128 HP", "Kombinasyonla; tek ünite 8–32 HP"],
    ["80 iç ünite", "Tek soğutucu akışkan sistemine bağlanabilen iç ünite"],
    ["SEER 7,35", "Soğutmada sezonsal verim; ısıtmada SCOP 4,50'ye kadar"],
    ["-30 °C ~ 56 °C", "Isıtmada -30 °C'ye, soğutmada 56 °C'ye kadar çalışma"],
    ["1.100 m", "Toplam boru uzunluğu; en uzak iç üniteye 220 m"],
    ["Eurovent · CE", "Sertifikalı tam DC inverter VRF serisi"],
  ] as [string, string][],
  teknoloji: [
    ["DC inverter scroll kompresör", "Asimetrik scroll profili ve buhar enjeksiyonu (EVI); 0–480 Hz kademesiz frekans kontrolü."],
    ["Çift entalpili ısıtma", "Düşük dış sıcaklıkta soğutucu akışkan debisi artırılır; -30 °C'de bile kararlı ısıtma."],
    ["Çift \"C\" tipi eşanjör", "Daha geniş ısı transfer yüzeyi, kompakt gövde."],
    ["3 aşamalı aşırı soğutma", "Eşanjör ve akış yolu tasarımıyla ısı değişim verimi artırılır."],
    ["6 aşamalı yağ dönüşü", "Yağ ayırma, geri dönüş ve dengeleme ile uzun boru hatlarında kompresör güvenliği."],
    ["Üçlü yedekleme", "Kompresör, modül ve sensör yedek çalışması; bir arıza tüm sistemi durdurmaz."],
    ["130 Pa dış statik basınç", "Katlı veya kapalı alanlara yerleşimde sıcak havanın uzaklaştırılması (standart 80 Pa)."],
    ["Polaritesiz CAN bus haberleşme", "İç–dış ünite haberleşmesinde artı/eksi ayrımı yok; tek dokunuşla devreye alma."],
  ] as [string, string][],
  icUniteler: [
    { ad: "360° Kaset Tipi", yer: "Ofis, restoran, süpermarket, AVM, lobi", ozellik: "360° hava dağılımı, 2.100 m³/h'e kadar hava debisi" },
    { ad: "Kompakt Kaset Tipi", yer: "Ofis, restoran, mağaza, lobi", ozellik: "Ultra düşük ses, 7 kademeli fan hızı" },
    { ad: "İnce Kanallı Tip", yer: "Ofis, otel odası, toplantı salonu, konut", ozellik: "Gizli tavan montajı, sabit hava debisi" },
    { ad: "Orta / Yüksek Statik Basınçlı Kanallı", yer: "Ofis, konferans salonu, restoran, salon", ozellik: "245 mm ince gövde, sabit hava debisi" },
    { ad: "Ultra Yüksek Statik Basınçlı Kanallı", yer: "Atölye, otel, AVM, balo salonu, geniş alanlar", ozellik: "Uzun kanal hatları ve büyük hacimler için" },
    { ad: "Duvar Tipi", yer: "Oturma odası, çalışma odası, görüşme odası", ozellik: "Dahili elektronik genleşme vanası, sessiz çalışma" },
    { ad: "Taze Havalı Tip", yer: "Sinema, otel, lobi, salonlar", ozellik: "Dış havayı şartlandırarak içeri verir" },
    { ad: "Yer / Tavan Tipi", yer: "Oturma odası, çalışma odası, görüşme odası", ozellik: "Ultra ince gövde; yere veya tavana montaj" },
    { ad: "Tek Yönlü Kaset Tipi", yer: "Oturma odası, yemek odası, ofis, lobi", ozellik: "İnce gövde, yüksek basınçlı drenaj pompası" },
    { ad: "İki Yönlü Kaset Tipi", yer: "Çalışma odası, yemek odası, küçük toplantı odası", ozellik: "İki yöne üfleme, drenaj pompası standart" },
  ] as IcUnite[],
  kontrol: [
    ["Kablosuz ve kablolu kumandalar", "Mod, sıcaklık, fan hızı, uyku ve zamanlayıcı; kablolu kumandada LCD ekranla durum izleme."],
    ["Merkezi dokunmatik kumanda", "7 inç modelde 16 sistem ve 1.280 iç ünite; 10,1 inç modelde zamanlama ve arıza geçmişi."],
    ["WiFi ve Tsmart uygulaması", "WiFi modülüyle tek ünite, grup veya tüm sistemi telefondan yönetme."],
    ["AHU bağlantı kiti", "TCL VRF dış ünitesini üçüncü parti klima santrallerine bağlama çözümü."],
  ] as [string, string][],
  sss: [
    [
      "TCL VRF nedir?",
      "TCL VRF, tek bir dış ünite grubuna çok sayıda iç ünitenin bağlandığı, soğutucu akışkan debisini her odanın ihtiyacına göre ayarlayan merkezi klima sistemidir. TCL TMV6+ Super Serisi tam DC inverter kompresör ve fan motorlarıyla çalışır; her mahal bağımsız olarak ısıtılıp soğutulur.",
    ],
    [
      "Bir TCL VRF sistemine kaç iç ünite bağlanabilir?",
      "TMV6+ Super Serisinde 8–32 HP arası 13 dış ünite modülü bulunur; tek ünite en fazla 32 HP'dir, üniteler birleştirilerek (kombinasyon) 128 HP'ye kadar çıkılır ve tek sisteme 80 adede kadar iç ünite bağlanabilir. 9 kategoride 100'den fazla iç ünite modeli arasından seçim yapılır.",
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
      "TCL VRF hangi binalar için uygundur?",
      "Çok odalı ve odaların farklı saatlerde kullanıldığı yapılar için uygundur: ofis katları, plazalar, oteller, klinikler, okullar, mağazalar ve villalar. Cephede çok sayıda split dış ünite istenmeyen binalarda tek dış ünite grubu ile temiz bir görünüm sağlanır. Villa, dubleks ve küçük ofisler için 8–28 kW TCL Mini VRF serisi vardır.",
    ],
    [
      "İstanbul'da TCL VRF keşif ve montajını kim yapıyor?",
      "İklim Ofisi olarak İstanbul'da TCL VRF sistemlerinin keşif, mahal bazlı kapasite hesabı, projelendirme, bakır borulama, devreye alma ve periyodik bakımını tek elden yapıyoruz. Keşif için iletişim sayfamızdan bize ulaşabilirsiniz.",
    ],
    [
      "TCL VRF fiyatı nasıl belirlenir?",
      "Fiyat; binanın ısı kazancı/kaybı hesabıyla belirlenen dış ünite kapasitesine (HP), iç ünite tipleri ve adedine, boru hattı uzunluğuna ve kontrol sistemine göre değişir. Keşif ve kapasite hesabından sonra projeye özel teklif hazırlıyoruz.",
    ],
  ] as [string, string][],
  ld: {
    anaSayfa: "Ana Sayfa",
    urunler: "Ürünler",
    sayfa: "TCL VRF Sistemleri",
    grupAd: "TCL TMV6+ Super Serisi Akıllı VRF",
    kategori: "VRF klima sistemi",
    grupAciklama: "Tam DC inverter TCL VRF dış üniteleri: 8–32 HP modüller, 128 HP'ye kadar kombinasyon, tek sistemde 80 iç ünite, SEER 7,35'e ve SCOP 4,50'ye kadar.",
    disUnite: "VRF Dış Ünite",
    sogutmaKap: "Soğutma kapasitesi",
    miniAd: "TCL Mini VRF (Tam DC Inverter)",
    miniKategori: "Mini VRF klima sistemi",
    miniAciklama: "8–28 kW tam DC inverter TCL Mini VRF dış üniteleri; ikiz rotary kompresör, tek ve üç fazlı modeller.",
  },
  sayfaYolu: "Sayfa yolu",
  rozet: "TCL · TMV6+ SUPER SERİSİ",
  h1: "TCL VRF Klima Sistemleri",
  altBaslik: "Tam DC inverter akıllı VRF: tek ünite 8–32 HP, kombinasyonla 128 HP'ye kadar.",
  giris:
    "Otel, plaza, hastane, okul, AVM ve konut projelerinde her mahali bağımsız iklimlendiren TCL VRF ve TCL Mini VRF sistemlerinin keşfini, ısı kazancı/kaybı hesabını, projelendirmesini, montajını ve devreye alınmasını İstanbul'da tek elden yürütüyoruz.",
  hizli: ["VRF Dış Üniteler", "Mini VRF", "İç Üniteler"],
  teklifDugme: "TCL VRF Teklifi İsteyin →",
  heroAlt: "TCL TMV6+ Super Serisi VRF dış ünitesi",
  tkEtiket: "TEKNOLOJİ",
  tkBaslik: "TCL TMV6+ Super: güçlü, verimli ve güvenilir",
  tkMetin:
    "TMV6+ Super Serisi; DC inverter kompresör, DC fan motoru ve yüksek hassasiyetli elektronik genleşme vanalarıyla kısmi yükte de yüksek verimle çalışır. Isıtmada -30 °C'ye, soğutmada 56 °C'ye kadar dış hava sıcaklığında kararlı performans verir; sensörler sistemi sürekli izleyip kompresör frekansını, fan hızını ve genleşme vanasını ayarlar.",
  duEtiket: "DIŞ ÜNİTE GAMI",
  duBaslik: "TCL VRF dış üniteleri: 8 – 32 HP",
  duMetin:
    "13 temel modül, aynı yükseklikte yalnız 4 gövde boyutunda üretilir. Tek ünite en fazla 32 HP'dir; üniteler serbestçe birleştirilerek kombinasyonla 128 HP'ye kadar çıkılır; kompresör ve modüller dönüşümlü çalışarak ömrü dengeler.",
  govdeAlt: (hp: string) => `TCL TMV6+ Super ${hp} VRF dış ünitesi`,
  duTabloBaslik: "TCL TMV6+ Super Serisi VRF dış ünite teknik verileri",
  sutunlar: ["Kapasite", "Model", "Soğutma (kW)", "Çekilen güç (kW)", "SEER", "Isıtma (kW)", "Maks. ısıtma (kW)", "SCOP"],
  duNot:
    "Besleme 380–415 V, 3N, 50 Hz. Soğutma: iç 27 °C KT / 19 °C YT, dış 35 °C KT; ısıtma: iç 20 °C KT, dış 7 °C KT / 6 °C YT koşullarında. Kaynak: TCL TMV6+ Super Serisi Akıllı VRF kataloğu.",
  mvEtiket: "MINI VRF",
  mvBaslik: "TCL Mini VRF: 8 – 28 kW",
  mvMetin:
    "Villa, dubleks, küçük ofis, mağaza ve klinikler için tam DC inverter ikiz rotary kompresörlü TCL Mini VRF. 8–16 kW modeller tek fazlı (220–240 V), 18–28 kW modeller üç fazlı beslemeyle çalışır. Soğutmada -15 °C ~ 55 °C, ısıtmada -20 °C ~ 24 °C dış sıcaklık aralığında çalışır; RoHS uyumludur.",
  mvAlt: "TCL Mini VRF tam DC inverter dış ünitesi",
  mvTabloBaslik: "TCL Mini VRF teknik verileri",
  mvSutunlar: ["Model", "Besleme", "Soğutma (kW)", "SEER", "Isıtma (kW)", "SCOP"],
  faz: { "1 faz": "1 faz", "3 faz": "3 faz" } as Record<string, string>,
  iuEtiket: "İÇ ÜNİTE GAMI",
  iuBaslik: "Her mahale uygun TCL VRF iç ünitesi",
  iuMetin:
    "100'den fazla iç ünite modeli; dış ünitelerle serbestçe eşleştirilir. Kaset, kanallı, duvar, yer/tavan ve taze havalı tipler aynı sistemde birlikte kullanılabilir.",
  iuAlt: (ad: string) => `TCL VRF ${ad} iç ünite`,
  uygunYerler: "Uygun yerler:",
  kEtiket: "AKILLI KONTROL",
  kBaslik: "Odadan binaya, telefondan merkezi kontrole",
  kapakAlt: "TCL TMV6+ Super Serisi Akıllı VRF kataloğu kapağı",
  kapakBaslik: "TCL VRF Kataloğu 2026",
  kapakAlti: "76 sayfa · Türkçe · PDF",
  sssEtiket: "SIK SORULAN SORULAR",
  sssBaslik: "TCL VRF hakkında merak edilenler",
  ilgili: "İlgili yazılar:",
  ilgiliLinkler: [
    ["/blog/tcl-vrf-nedir-tmv6-super-serisi", "TCL VRF Nedir?"],
    ["/blog/tcl-mini-vrf-nedir-villa-ve-kucuk-ofis", "TCL Mini VRF Nedir?"],
    ["/blog/vrf-mi-split-klima-mi", "VRF mi, Split Klima mı?"],
    ["/blog/vrf-klima-maliyetini-belirleyen-etkenler", "VRF Klima Maliyetini Neler Belirler?"],
    ["/blog/vrf-rehberi-mitsubishi-electric-ve-tcl", "VRF İklimlendirme Rehberi"],
  ] as [string, string][],
  ctaEtiket: "TCL VRF PROJELENDİRME VE MONTAJ",
  ctaBaslik: "Keşiften devreye almaya tek elden",
  ctaMaddeler: [
    "• Mahal bazlı ısı kazancı / kaybı hesabı ve dış ünite kombinasyon seçimi",
    "• Boru çapı, joint ve kablo projelendirmesi",
    "• İzolasyonlu bakır borulama, azot basınç testi ve vakum",
    "• Devreye alma, kumanda kurulumu ve periyodik bakım",
  ],
  hesapA: "Kapasiteyi kabaca görmek için",
  hesapLink: "kapasite hesaplama",
  hesapB: "aracımızı kullanabilirsiniz.",
  kutuBaslik: "Projeniz için TCL VRF teklifi alın.",
  kutuMetin:
    "Bina tipini, iklimlendirilecek alanları ve mimari projenizi paylaşın; doğru TCL VRF kombinasyonunu ve fiyat teklifini hazırlayalım.",
  kutuDugme: "Teklif İsteyin →",
};

type Metin = typeof tr;

const en: Metin = {
  metaBaslik: "TCL VRF Air Conditioning Systems — TMV6+ Super Series and Mini VRF | Istanbul",
  metaAciklama:
    "TCL VRF air conditioning systems: TMV6+ Super full DC inverter VRF (8–32 HP single units, up to 128 HP in combination, 80 indoor units) and TCL Mini VRF (8–28 kW). Technical data, indoor unit range, PDF catalogue. Site survey, design and installation in Istanbul.",
  anahtar: ["TCL VRF", "TCL VRF air conditioning", "TCL TMV6+", "TCL TMV6 Super", "TCL Mini VRF", "TCL air conditioner", "TCL VRF price", "TCL VRF catalogue", "VRF Istanbul"],
  ogBaslik: "TCL VRF Systems — TMV6+ Super Series | İklim Ofisi",
  ogAciklama: "Full DC inverter TCL VRF: combinations up to 128 HP, 80 indoor units per system, SEER 7.35. Technical data and PDF catalogue.",
  ogAlt: "TCL VRF Systems — TMV6+ Super Series",
  katalogDugme: "TCL VRF Catalogue (PDF, Turkish)",
  oneCikanlar: [
    ["128 HP", "In combination; single units 8–32 HP"],
    ["80 indoor units", "Indoor units connectable to one refrigerant system"],
    ["SEER 7.35", "Seasonal cooling efficiency; SCOP up to 4.50 in heating"],
    ["-30 °C ~ 56 °C", "Operation down to -30 °C in heating and up to 56 °C in cooling"],
    ["1,100 m", "Total piping length; 220 m to the farthest indoor unit"],
    ["Eurovent · CE", "Certified full DC inverter VRF series"],
  ],
  teknoloji: [
    ["DC inverter scroll compressor", "Asymmetric scroll profile and vapour injection (EVI); stepless frequency control from 0 to 480 Hz."],
    ["Dual-enthalpy heating", "Refrigerant flow is increased at low outdoor temperatures; stable heating even at -30 °C."],
    ["Double \"C\" type heat exchanger", "Larger heat transfer surface in a compact casing."],
    ["3-stage subcooling", "Heat exchanger and flow path design increase heat exchange efficiency."],
    ["6-stage oil return", "Oil separation, return and balancing protect the compressor on long piping runs."],
    ["Triple backup", "Compressor, module and sensor backup operation; a single fault does not stop the whole system."],
    ["130 Pa external static pressure", "Removes hot air when installed on intermediate floors or in enclosed spaces (standard 80 Pa)."],
    ["Non-polar CAN bus communication", "No polarity between indoor and outdoor unit wiring; one-touch commissioning."],
  ],
  icUniteler: [
    { ad: "360° Cassette", yer: "Offices, restaurants, supermarkets, shopping centres, lobbies", ozellik: "360° air distribution, airflow up to 2,100 m³/h" },
    { ad: "Compact Cassette", yer: "Offices, restaurants, shops, lobbies", ozellik: "Ultra-low noise, 7 fan speeds" },
    { ad: "Slim Ducted", yer: "Offices, hotel rooms, meeting rooms, homes", ozellik: "Concealed ceiling installation, constant airflow" },
    { ad: "Medium / High Static Pressure Ducted", yer: "Offices, conference halls, restaurants, halls", ozellik: "245 mm slim casing, constant airflow" },
    { ad: "Ultra-High Static Pressure Ducted", yer: "Workshops, hotels, shopping centres, ballrooms, large spaces", ozellik: "For long duct runs and large volumes" },
    { ad: "Wall-Mounted", yer: "Living rooms, studies, meeting rooms", ozellik: "Built-in electronic expansion valve, quiet operation" },
    { ad: "Fresh Air Unit", yer: "Cinemas, hotels, lobbies, halls", ozellik: "Conditions outdoor air before supplying it indoors" },
    { ad: "Floor / Ceiling", yer: "Living rooms, studies, meeting rooms", ozellik: "Ultra-slim casing; floor or ceiling installation" },
    { ad: "One-Way Cassette", yer: "Living rooms, dining rooms, offices, lobbies", ozellik: "Slim casing, high-head drain pump" },
    { ad: "Two-Way Cassette", yer: "Studies, dining rooms, small meeting rooms", ozellik: "Two-way air discharge, drain pump as standard" },
  ],
  kontrol: [
    ["Wireless and wired controllers", "Mode, temperature, fan speed, sleep and timer; status monitoring on the LCD screen of the wired controller."],
    ["Central touch-screen controller", "16 systems and 1,280 indoor units on the 7-inch model; scheduling and fault history on the 10.1-inch model."],
    ["WiFi and Tsmart app", "Control a single unit, a group or the whole system from your phone with the WiFi module."],
    ["AHU connection kit", "Solution for connecting a TCL VRF outdoor unit to third-party air handling units."],
  ],
  sss: [
    [
      "What is TCL VRF?",
      "TCL VRF is a central air conditioning system in which many indoor units are connected to a single outdoor unit group and the refrigerant flow is adjusted to the needs of each room. The TCL TMV6+ Super Series works with full DC inverter compressors and fan motors; each space is heated and cooled independently.",
    ],
    [
      "How many indoor units can be connected to one TCL VRF system?",
      "The TMV6+ Super Series has 13 outdoor unit modules from 8 to 32 HP; a single unit is at most 32 HP, units can be combined up to 128 HP, and up to 80 indoor units can be connected to one system. You can choose from more than 100 indoor unit models in 9 categories.",
    ],
    [
      "At what outdoor temperatures does TCL VRF operate?",
      "According to the catalogue, it operates at outdoor temperatures from -15 °C to 56 °C in cooling and from -30 °C to 28 °C in heating. For the Mini VRF series, the range is -15 °C ~ 55 °C in cooling and -20 °C ~ 24 °C in heating.",
    ],
    [
      "What are the piping length limits of TCL VRF?",
      "The total piping length can reach 1,100 m. The actual piping length to the farthest indoor unit is 220 m (240 m equivalent); the height difference is 100 m with the outdoor unit above and 110 m with it below, and the height difference between indoor units is 40 m.",
    ],
    [
      "When is TCL Mini VRF the right choice?",
      "With capacities of 8–28 kW, TCL Mini VRF is suitable for mid-sized projects such as villas, duplexes, small offices, shops and clinics. The 8–16 kW models run on single-phase (220–240 V) and the 18–28 kW models on three-phase power.",
    ],
    [
      "Can TCL VRF be controlled remotely?",
      "Yes. The system can be managed from a phone with the WiFi module and the Tsmart mobile app; building-wide central control is also possible with the 7- and 10.1-inch central touch-screen controllers.",
    ],
    [
      "Which buildings is TCL VRF suitable for?",
      "It suits buildings with many rooms used at different times: office floors, office towers, hotels, clinics, schools, shops and villas. In buildings where many split outdoor units on the façade are not wanted, a single outdoor unit group gives a clean appearance. For villas, duplexes and small offices there is the 8–28 kW TCL Mini VRF series.",
    ],
    [
      "Who carries out TCL VRF site surveys and installation in Istanbul?",
      "At İklim Ofisi we handle the site survey, room-by-room capacity calculation, design, copper piping, commissioning and periodic maintenance of TCL VRF systems in Istanbul from a single source. You can contact us via our contact page for a site survey.",
    ],
    [
      "How is the price of a TCL VRF system determined?",
      "The price depends on the outdoor unit capacity (HP) determined by the building's heat gain/loss calculation, the types and number of indoor units, the piping length and the control system. After the site survey and capacity calculation, we prepare a project-specific quote.",
    ],
  ],
  ld: {
    anaSayfa: "Home",
    urunler: "Products",
    sayfa: "TCL VRF Systems",
    grupAd: "TCL TMV6+ Super Series Smart VRF",
    kategori: "VRF air conditioning system",
    grupAciklama: "Full DC inverter TCL VRF outdoor units: 8–32 HP modules, combinations up to 128 HP, 80 indoor units per system, SEER up to 7.35 and SCOP up to 4.50.",
    disUnite: "VRF Outdoor Unit",
    sogutmaKap: "Cooling capacity",
    miniAd: "TCL Mini VRF (Full DC Inverter)",
    miniKategori: "Mini VRF air conditioning system",
    miniAciklama: "8–28 kW full DC inverter TCL Mini VRF outdoor units; twin rotary compressor, single- and three-phase models.",
  },
  sayfaYolu: "Breadcrumb",
  rozet: "TCL · TMV6+ SUPER SERIES",
  h1: "TCL VRF Air Conditioning Systems",
  altBaslik: "Full DC inverter smart VRF: single units 8–32 HP, up to 128 HP in combination.",
  giris:
    "In Istanbul we handle the site survey, heat gain/loss calculation, design, installation and commissioning of TCL VRF and TCL Mini VRF systems — which condition every space independently in hotel, office tower, hospital, school, shopping centre and residential projects — from a single source.",
  hizli: ["VRF Outdoor Units", "Mini VRF", "Indoor Units"],
  teklifDugme: "Request a TCL VRF Quote →",
  heroAlt: "TCL TMV6+ Super Series VRF outdoor unit",
  tkEtiket: "TECHNOLOGY",
  tkBaslik: "TCL TMV6+ Super: powerful, efficient and reliable",
  tkMetin:
    "With a DC inverter compressor, DC fan motor and high-precision electronic expansion valves, the TMV6+ Super Series operates highly efficiently even at part load. It delivers stable performance at outdoor temperatures down to -30 °C in heating and up to 56 °C in cooling; sensors continuously monitor the system and adjust the compressor frequency, fan speed and expansion valve.",
  duEtiket: "OUTDOOR UNIT RANGE",
  duBaslik: "TCL VRF outdoor units: 8 – 32 HP",
  duMetin:
    "13 basic modules are built in just 4 casing sizes of the same height. A single unit is at most 32 HP; units can be freely combined up to 128 HP, and the compressors and modules operate in rotation to balance their service life.",
  govdeAlt: (hp: string) => `TCL TMV6+ Super ${hp} VRF outdoor unit`,
  duTabloBaslik: "TCL TMV6+ Super Series VRF outdoor unit technical data",
  sutunlar: ["Capacity", "Model", "Cooling (kW)", "Power input (kW)", "SEER", "Heating (kW)", "Max. heating (kW)", "SCOP"],
  duNot:
    "Power supply 380–415 V, 3N, 50 Hz. Cooling: indoor 27 °C DB / 19 °C WB, outdoor 35 °C DB; heating: indoor 20 °C DB, outdoor 7 °C DB / 6 °C WB. Source: TCL TMV6+ Super Series Smart VRF catalogue.",
  mvEtiket: "MINI VRF",
  mvBaslik: "TCL Mini VRF: 8 – 28 kW",
  mvMetin:
    "TCL Mini VRF with full DC inverter twin rotary compressors for villas, duplexes, small offices, shops and clinics. The 8–16 kW models run on single-phase (220–240 V) and the 18–28 kW models on three-phase power. It operates at outdoor temperatures of -15 °C ~ 55 °C in cooling and -20 °C ~ 24 °C in heating, and is RoHS compliant.",
  mvAlt: "TCL Mini VRF full DC inverter outdoor unit",
  mvTabloBaslik: "TCL Mini VRF technical data",
  mvSutunlar: ["Model", "Power supply", "Cooling (kW)", "SEER", "Heating (kW)", "SCOP"],
  faz: { "1 faz": "1 phase", "3 faz": "3 phase" },
  iuEtiket: "INDOOR UNIT RANGE",
  iuBaslik: "A TCL VRF indoor unit for every space",
  iuMetin:
    "More than 100 indoor unit models, freely matched with the outdoor units. Cassette, ducted, wall-mounted, floor/ceiling and fresh air types can be used together in the same system.",
  iuAlt: (ad: string) => `TCL VRF ${ad} indoor unit`,
  uygunYerler: "Suitable for:",
  kEtiket: "SMART CONTROL",
  kBaslik: "From room to building, from your phone to central control",
  kapakAlt: "Cover of the TCL TMV6+ Super Series Smart VRF catalogue",
  kapakBaslik: "TCL VRF Catalogue 2026",
  kapakAlti: "76 pages · Turkish · PDF",
  sssEtiket: "FREQUENTLY ASKED QUESTIONS",
  sssBaslik: "Common questions about TCL VRF",
  ilgili: "Related articles:",
  ilgiliLinkler: [
    ["/blog/tcl-vrf-nedir-tmv6-super-serisi", "What Is TCL VRF?"],
    ["/blog/tcl-mini-vrf-nedir-villa-ve-kucuk-ofis", "What Is TCL Mini VRF?"],
    ["/blog/vrf-mi-split-klima-mi", "VRF or Split Air Conditioning?"],
    ["/blog/vrf-klima-maliyetini-belirleyen-etkenler", "What Determines the Cost of VRF?"],
    ["/blog/vrf-rehberi-mitsubishi-electric-ve-tcl", "VRF Air Conditioning Guide"],
  ],
  ctaEtiket: "TCL VRF DESIGN AND INSTALLATION",
  ctaBaslik: "From site survey to commissioning, all from one source",
  ctaMaddeler: [
    "• Room-by-room heat gain / loss calculation and outdoor unit combination selection",
    "• Design of pipe diameters, joints and cabling",
    "• Insulated copper piping, nitrogen pressure test and vacuuming",
    "• Commissioning, controller setup and periodic maintenance",
  ],
  hesapA: "To get a rough idea of the capacity, you can use our",
  hesapLink: "capacity calculator",
  hesapB: "tool.",
  kutuBaslik: "Get a TCL VRF quote for your project.",
  kutuMetin:
    "Share the building type, the areas to be conditioned and your architectural drawings; we will prepare the right TCL VRF combination and a price quote.",
  kutuDugme: "Request a Quote →",
};

const de: Metin = {
  metaBaslik: "TCL VRF-Klimasysteme — TMV6+ Super Serie und Mini VRF | Istanbul",
  metaAciklama:
    "TCL VRF-Klimasysteme: TMV6+ Super Full-DC-Inverter-VRF (Einzelgeräte 8–32 HP, in Kombination bis 128 HP, 80 Innengeräte) und TCL Mini VRF (8–28 kW). Technische Daten, Innengeräteprogramm, PDF-Katalog. Besichtigung, Planung und Montage in Istanbul.",
  anahtar: ["TCL VRF", "TCL VRF Klimaanlage", "TCL TMV6+", "TCL TMV6 Super", "TCL Mini VRF", "TCL Klimagerät", "TCL VRF Preis", "TCL VRF Katalog", "VRF Istanbul"],
  ogBaslik: "TCL VRF-Systeme — TMV6+ Super Serie | İklim Ofisi",
  ogAciklama: "Full-DC-Inverter TCL VRF: Kombinationen bis 128 HP, 80 Innengeräte pro System, SEER 7,35. Technische Daten und PDF-Katalog.",
  ogAlt: "TCL VRF-Systeme — TMV6+ Super Serie",
  katalogDugme: "TCL VRF-Katalog (PDF, Türkisch)",
  oneCikanlar: [
    ["128 HP", "In Kombination; Einzelgeräte 8–32 HP"],
    ["80 Innengeräte", "An ein Kältemittelsystem anschließbare Innengeräte"],
    ["SEER 7,35", "Saisonale Effizienz im Kühlbetrieb; SCOP bis 4,50 im Heizbetrieb"],
    ["-30 °C ~ 56 °C", "Betrieb bis -30 °C im Heizen und bis 56 °C im Kühlen"],
    ["1.100 m", "Gesamtrohrlänge; 220 m bis zum entferntesten Innengerät"],
    ["Eurovent · CE", "Zertifizierte Full-DC-Inverter-VRF-Serie"],
  ],
  teknoloji: [
    ["DC-Inverter-Scrollverdichter", "Asymmetrisches Scrollprofil und Dampfeinspritzung (EVI); stufenlose Frequenzregelung von 0 bis 480 Hz."],
    ["Heizen mit doppelter Enthalpie", "Bei niedriger Außentemperatur wird der Kältemittelmassenstrom erhöht; stabiles Heizen sogar bei -30 °C."],
    ["Doppel-\"C\"-Wärmetauscher", "Größere Wärmeübertragungsfläche bei kompaktem Gehäuse."],
    ["3-stufige Unterkühlung", "Wärmetauscher- und Strömungsführung steigern die Effizienz des Wärmeaustauschs."],
    ["6-stufige Ölrückführung", "Ölabscheidung, Rückführung und Ausgleich schützen den Verdichter bei langen Rohrleitungen."],
    ["Dreifache Redundanz", "Notlauf von Verdichter, Modul und Sensoren; eine Störung legt nicht das ganze System still."],
    ["130 Pa externe statische Pressung", "Abführung der Warmluft bei Aufstellung in Zwischengeschossen oder geschlossenen Räumen (Standard 80 Pa)."],
    ["Polaritätsfreier CAN-Bus", "Keine Polarität bei der Verbindung von Innen- und Außengerät; Inbetriebnahme per Knopfdruck."],
  ],
  icUniteler: [
    { ad: "360°-Kassette", yer: "Büros, Restaurants, Supermärkte, Einkaufszentren, Lobbys", ozellik: "360°-Luftverteilung, Luftmenge bis 2.100 m³/h" },
    { ad: "Kompaktkassette", yer: "Büros, Restaurants, Geschäfte, Lobbys", ozellik: "Extrem leise, 7 Ventilatorstufen" },
    { ad: "Flaches Kanalgerät", yer: "Büros, Hotelzimmer, Besprechungsräume, Wohnungen", ozellik: "Einbau in abgehängte Decken, konstante Luftmenge" },
    { ad: "Kanalgerät mit mittlerer / hoher Pressung", yer: "Büros, Konferenzsäle, Restaurants, Säle", ozellik: "Flaches 245-mm-Gehäuse, konstante Luftmenge" },
    { ad: "Kanalgerät mit sehr hoher Pressung", yer: "Werkstätten, Hotels, Einkaufszentren, Ballsäle, große Flächen", ozellik: "Für lange Kanalstrecken und große Volumen" },
    { ad: "Wandgerät", yer: "Wohnzimmer, Arbeitszimmer, Besprechungsräume", ozellik: "Integriertes elektronisches Expansionsventil, leiser Betrieb" },
    { ad: "Frischluftgerät", yer: "Kinos, Hotels, Lobbys, Säle", ozellik: "Konditioniert die Außenluft vor der Zufuhr in den Raum" },
    { ad: "Boden-/Deckengerät", yer: "Wohnzimmer, Arbeitszimmer, Besprechungsräume", ozellik: "Extrem flaches Gehäuse; Boden- oder Deckenmontage" },
    { ad: "1-Wege-Kassette", yer: "Wohnzimmer, Esszimmer, Büros, Lobbys", ozellik: "Flaches Gehäuse, Kondensatpumpe mit hoher Förderhöhe" },
    { ad: "2-Wege-Kassette", yer: "Arbeitszimmer, Esszimmer, kleine Besprechungsräume", ozellik: "Ausblas in zwei Richtungen, Kondensatpumpe serienmäßig" },
  ],
  kontrol: [
    ["Funk- und Kabelfernbedienungen", "Betriebsart, Temperatur, Lüfterstufe, Schlaf- und Timerfunktion; Statusanzeige auf dem LCD der Kabelfernbedienung."],
    ["Zentrale Touch-Steuerung", "16 Systeme und 1.280 Innengeräte beim 7-Zoll-Modell; Zeitprogramme und Störungshistorie beim 10,1-Zoll-Modell."],
    ["WLAN und Tsmart-App", "Steuerung eines Geräts, einer Gruppe oder des ganzen Systems per Smartphone mit dem WLAN-Modul."],
    ["AHU-Anschlussset", "Lösung zum Anschluss eines TCL VRF-Außengeräts an Lüftungsgeräte anderer Hersteller."],
  ],
  sss: [
    [
      "Was ist TCL VRF?",
      "TCL VRF ist ein zentrales Klimasystem, bei dem viele Innengeräte an eine Außengerätegruppe angeschlossen werden und der Kältemittelmassenstrom dem Bedarf jedes Raumes angepasst wird. Die TCL TMV6+ Super Serie arbeitet mit Full-DC-Inverter-Verdichtern und -Ventilatormotoren; jeder Raum wird unabhängig beheizt und gekühlt.",
    ],
    [
      "Wie viele Innengeräte lassen sich an ein TCL VRF-System anschließen?",
      "Die TMV6+ Super Serie umfasst 13 Außengerätemodule von 8 bis 32 HP; ein Einzelgerät hat maximal 32 HP, durch Kombination sind bis zu 128 HP möglich, und an ein System lassen sich bis zu 80 Innengeräte anschließen. Zur Auswahl stehen über 100 Innengerätemodelle in 9 Kategorien.",
    ],
    [
      "Bei welchen Außentemperaturen arbeitet TCL VRF?",
      "Laut Katalog arbeitet es im Kühlbetrieb bei Außentemperaturen von -15 °C bis 56 °C und im Heizbetrieb von -30 °C bis 28 °C. Bei der Mini VRF-Serie liegt der Bereich bei -15 °C ~ 55 °C im Kühlen und -20 °C ~ 24 °C im Heizen.",
    ],
    [
      "Welche Rohrlängen sind bei TCL VRF möglich?",
      "Die Gesamtrohrlänge kann bis zu 1.100 m betragen. Die tatsächliche Rohrlänge bis zum entferntesten Innengerät beträgt 220 m (äquivalent 240 m); der Höhenunterschied liegt bei 100 m mit Außengerät oben und 110 m mit Außengerät unten, zwischen Innengeräten bei 40 m.",
    ],
    [
      "Wann ist TCL Mini VRF die richtige Wahl?",
      "TCL Mini VRF mit 8–28 kW eignet sich für mittelgroße Projekte wie Villen, Maisonetten, kleine Büros, Geschäfte und Praxen. Die Modelle mit 8–16 kW arbeiten einphasig (220–240 V), die Modelle mit 18–28 kW dreiphasig.",
    ],
    [
      "Lässt sich TCL VRF aus der Ferne steuern?",
      "Ja. Mit dem WLAN-Modul und der Tsmart-App wird das System per Smartphone gesteuert; zusätzlich ist mit den zentralen Touch-Steuerungen (7 und 10,1 Zoll) eine gebäudeweite Zentralsteuerung möglich.",
    ],
    [
      "Für welche Gebäude eignet sich TCL VRF?",
      "Es eignet sich für Gebäude mit vielen Räumen, die zu unterschiedlichen Zeiten genutzt werden: Büroetagen, Bürotürme, Hotels, Praxen, Schulen, Geschäfte und Villen. Wo viele Split-Außengeräte an der Fassade unerwünscht sind, sorgt eine einzige Außengerätegruppe für ein sauberes Erscheinungsbild. Für Villen, Maisonetten und kleine Büros gibt es die TCL Mini VRF-Serie mit 8–28 kW.",
    ],
    [
      "Wer übernimmt Besichtigung und Montage von TCL VRF in Istanbul?",
      "Wir bei İklim Ofisi übernehmen in Istanbul Besichtigung, raumweise Leistungsberechnung, Planung, Kupferrohrverlegung, Inbetriebnahme und regelmäßige Wartung von TCL VRF-Systemen aus einer Hand. Für eine Besichtigung erreichen Sie uns über unsere Kontaktseite.",
    ],
    [
      "Wie wird der Preis einer TCL VRF-Anlage ermittelt?",
      "Der Preis hängt von der durch die Heiz-/Kühllastberechnung ermittelten Außengeräteleistung (HP), Art und Anzahl der Innengeräte, der Rohrleitungslänge und dem Steuerungssystem ab. Nach Besichtigung und Leistungsberechnung erstellen wir ein projektbezogenes Angebot.",
    ],
  ],
  ld: {
    anaSayfa: "Startseite",
    urunler: "Produkte",
    sayfa: "TCL VRF-Systeme",
    grupAd: "TCL TMV6+ Super Serie Smart VRF",
    kategori: "VRF-Klimasystem",
    grupAciklama: "Full-DC-Inverter TCL VRF-Außengeräte: Module mit 8–32 HP, Kombinationen bis 128 HP, 80 Innengeräte pro System, SEER bis 7,35 und SCOP bis 4,50.",
    disUnite: "VRF-Außengerät",
    sogutmaKap: "Kälteleistung",
    miniAd: "TCL Mini VRF (Full DC Inverter)",
    miniKategori: "Mini-VRF-Klimasystem",
    miniAciklama: "Full-DC-Inverter TCL Mini VRF-Außengeräte mit 8–28 kW; Twin-Rotary-Verdichter, ein- und dreiphasige Modelle.",
  },
  sayfaYolu: "Brotkrümelnavigation",
  rozet: "TCL · TMV6+ SUPER SERIE",
  h1: "TCL VRF-Klimasysteme",
  altBaslik: "Full-DC-Inverter Smart VRF: Einzelgeräte 8–32 HP, in Kombination bis 128 HP.",
  giris:
    "In Istanbul übernehmen wir aus einer Hand Besichtigung, Heiz-/Kühllastberechnung, Planung, Montage und Inbetriebnahme von TCL VRF- und TCL Mini VRF-Systemen, die in Hotels, Bürotürmen, Krankenhäusern, Schulen, Einkaufszentren und Wohnprojekten jeden Raum unabhängig klimatisieren.",
  hizli: ["VRF-Außengeräte", "Mini VRF", "Innengeräte"],
  teklifDugme: "TCL VRF-Angebot anfordern →",
  heroAlt: "TCL TMV6+ Super Serie VRF-Außengerät",
  tkEtiket: "TECHNOLOGIE",
  tkBaslik: "TCL TMV6+ Super: leistungsstark, effizient und zuverlässig",
  tkMetin:
    "Mit DC-Inverter-Verdichter, DC-Ventilatormotor und hochpräzisen elektronischen Expansionsventilen arbeitet die TMV6+ Super Serie auch im Teillastbetrieb hocheffizient. Sie liefert stabile Leistung bei Außentemperaturen bis -30 °C im Heizen und bis 56 °C im Kühlen; Sensoren überwachen das System laufend und regeln Verdichterfrequenz, Lüfterdrehzahl und Expansionsventil.",
  duEtiket: "AUSSENGERÄTEPROGRAMM",
  duBaslik: "TCL VRF-Außengeräte: 8 – 32 HP",
  duMetin:
    "13 Grundmodule werden in nur 4 Gehäusegrößen gleicher Höhe gefertigt. Ein Einzelgerät hat maximal 32 HP; die Geräte lassen sich frei bis 128 HP kombinieren, Verdichter und Module arbeiten im Wechsel und gleichen so die Lebensdauer aus.",
  govdeAlt: (hp: string) => `TCL TMV6+ Super ${hp} VRF-Außengerät`,
  duTabloBaslik: "Technische Daten der TCL TMV6+ Super Serie VRF-Außengeräte",
  sutunlar: ["Leistung", "Modell", "Kühlen (kW)", "Leistungsaufnahme (kW)", "SEER", "Heizen (kW)", "Max. Heizen (kW)", "SCOP"],
  duNot:
    "Stromversorgung 380–415 V, 3N, 50 Hz. Kühlen: innen 27 °C TK / 19 °C FK, außen 35 °C TK; Heizen: innen 20 °C TK, außen 7 °C TK / 6 °C FK. Quelle: Katalog TCL TMV6+ Super Serie Smart VRF.",
  mvEtiket: "MINI VRF",
  mvBaslik: "TCL Mini VRF: 8 – 28 kW",
  mvMetin:
    "TCL Mini VRF mit Full-DC-Inverter-Twin-Rotary-Verdichter für Villen, Maisonetten, kleine Büros, Geschäfte und Praxen. Die Modelle mit 8–16 kW arbeiten einphasig (220–240 V), die Modelle mit 18–28 kW dreiphasig. Betrieb bei Außentemperaturen von -15 °C ~ 55 °C im Kühlen und -20 °C ~ 24 °C im Heizen; RoHS-konform.",
  mvAlt: "TCL Mini VRF Full-DC-Inverter-Außengerät",
  mvTabloBaslik: "Technische Daten TCL Mini VRF",
  mvSutunlar: ["Modell", "Stromversorgung", "Kühlen (kW)", "SEER", "Heizen (kW)", "SCOP"],
  faz: { "1 faz": "1-phasig", "3 faz": "3-phasig" },
  iuEtiket: "INNENGERÄTEPROGRAMM",
  iuBaslik: "Das passende TCL VRF-Innengerät für jeden Raum",
  iuMetin:
    "Über 100 Innengerätemodelle, frei mit den Außengeräten kombinierbar. Kassetten-, Kanal-, Wand-, Boden-/Decken- und Frischluftgeräte können im selben System gemeinsam eingesetzt werden.",
  iuAlt: (ad: string) => `TCL VRF ${ad} Innengerät`,
  uygunYerler: "Geeignet für:",
  kEtiket: "INTELLIGENTE STEUERUNG",
  kBaslik: "Vom Raum bis zum Gebäude, vom Smartphone bis zur Zentralsteuerung",
  kapakAlt: "Titelseite des Katalogs TCL TMV6+ Super Serie Smart VRF",
  kapakBaslik: "TCL VRF-Katalog 2026",
  kapakAlti: "76 Seiten · Türkisch · PDF",
  sssEtiket: "HÄUFIG GESTELLTE FRAGEN",
  sssBaslik: "Häufige Fragen zu TCL VRF",
  ilgili: "Verwandte Artikel:",
  ilgiliLinkler: [
    ["/blog/tcl-vrf-nedir-tmv6-super-serisi", "Was ist TCL VRF?"],
    ["/blog/tcl-mini-vrf-nedir-villa-ve-kucuk-ofis", "Was ist TCL Mini VRF?"],
    ["/blog/vrf-mi-split-klima-mi", "VRF oder Split-Klimaanlage?"],
    ["/blog/vrf-klima-maliyetini-belirleyen-etkenler", "Was bestimmt die Kosten einer VRF-Anlage?"],
    ["/blog/vrf-rehberi-mitsubishi-electric-ve-tcl", "VRF-Klimatisierungsratgeber"],
  ],
  ctaEtiket: "TCL VRF PLANUNG UND MONTAGE",
  ctaBaslik: "Von der Besichtigung bis zur Inbetriebnahme aus einer Hand",
  ctaMaddeler: [
    "• Raumweise Heiz-/Kühllastberechnung und Auswahl der Außengerätekombination",
    "• Planung von Rohrdurchmessern, Abzweigern und Verkabelung",
    "• Gedämmte Kupferrohrverlegung, Stickstoff-Druckprüfung und Evakuierung",
    "• Inbetriebnahme, Einrichtung der Steuerung und regelmäßige Wartung",
  ],
  hesapA: "Für eine grobe Leistungsabschätzung können Sie unseren",
  hesapLink: "Leistungsrechner",
  hesapB: "nutzen.",
  kutuBaslik: "Holen Sie sich ein TCL VRF-Angebot für Ihr Projekt.",
  kutuMetin:
    "Teilen Sie uns Gebäudetyp, zu klimatisierende Flächen und Ihre Architekturpläne mit – wir erstellen die passende TCL VRF-Kombination und ein Preisangebot.",
  kutuDugme: "Angebot anfordern →",
};

const METIN: Record<Dil, Metin> = { tr, en, de };

// İngilizcede ondalık ayırıcı nokta ("25,2" → "25.2")
const ondalik = (dil: Dil, v: string) => (dil === "en" ? v.replace(",", ".") : v);

// İç ünite görselleri (sıra METIN.icUniteler ile aynı)
const IC_UNITE_GORSELLERI = [
  "/tcl/tcl-ic-360-kaset.jpg",
  "/tcl/tcl-ic-kompakt-kaset.jpg",
  "/tcl/tcl-ic-ince-kanalli.jpg",
  "/tcl/tcl-ic-orta-yuksek-statik-kanalli.jpg",
  "/tcl/tcl-ic-ultra-yuksek-statik-kanalli.jpg",
  "/tcl/tcl-ic-duvar.jpg",
  "/tcl/tcl-ic-taze-havali.jpg",
  "/tcl/tcl-ic-yer-tavan.jpg",
  "/tcl/tcl-ic-tek-yonlu-kaset.jpg",
  "/tcl/tcl-ic-iki-yonlu-kaset.jpg",
];

export function generateMetadata(): Metadata {
  const dil = dilAl();
  const t = METIN[dil];
  return {
    title: t.metaBaslik,
    description: t.metaAciklama,
    keywords: t.anahtar,
    alternates: dilAlternatifleri(dil, "/tcl-vrf"),
    openGraph: {
      title: t.ogBaslik,
      description: t.ogAciklama,
      url: `${SITE}${yol(dil, "/tcl-vrf")}`,
      images: [{ url: "/og/tcl-vrf.jpg", width: 1200, height: 630, alt: t.ogAlt }],
    },
  };
}

function KatalogButonu({ koyu = false, etiket }: { koyu?: boolean; etiket: string }) {
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
      {etiket}
    </a>
  );
}

const kw = (v: string) => Number(v.replace(",", "."));

export default function TclVrfPage() {
  const dil = dilAl();
  const t = METIN[dil];
  const y = (h: string) => yol(dil, h);
  const sayfa = `${SITE}${y("/tcl-vrf")}`;
  const n = (v: string) => ondalik(dil, v);

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
                { "@type": "ListItem", position: 3, name: t.ld.sayfa, item: sayfa },
              ],
            },
            {
              "@type": "ProductGroup",
              "@id": `${sayfa}#tmv6-super`,
              name: t.ld.grupAd,
              brand: { "@type": "Brand", name: "TCL" },
              category: t.ld.kategori,
              description: t.ld.grupAciklama,
              image: `${SITE}/tcl/tcl-dis-28-32hp.jpg`,
              url: sayfa,
              productGroupID: "TMV-VED+",
              variesBy: "https://schema.org/size",
              hasVariant: DIS_UNITELER.map(([hp, kod, sog, , seer, , , scop]) => ({
                "@type": "Product",
                "@id": `${sayfa}#tmv-ved-${kod}`,
                name: `TCL TMV-VED+${kod}W/AS-D(E) ${hp} HP ${t.ld.disUnite}`,
                sku: `TMV-VED+${kod}W/AS-D(E)`,
                brand: { "@type": "Brand", name: "TCL" },
                size: `${hp} HP`,
                image: `${SITE}/tcl/tcl-dis-${hp <= 12 ? "8-12" : hp <= 22 ? "14-22" : hp <= 26 ? "24-26" : "28-32"}hp.jpg`,
                additionalProperty: [
                  { "@type": "PropertyValue", name: t.ld.sogutmaKap, value: kw(sog), unitText: "kW" },
                  { "@type": "PropertyValue", name: "SEER", value: kw(seer) },
                  { "@type": "PropertyValue", name: "SCOP", value: kw(scop) },
                ],
              })),
            },
            {
              "@type": "ProductGroup",
              "@id": `${sayfa}#mini-vrf`,
              name: t.ld.miniAd,
              brand: { "@type": "Brand", name: "TCL" },
              category: t.ld.miniKategori,
              description: t.ld.miniAciklama,
              image: `${SITE}/tcl/tcl-mini-vrf.jpg`,
              url: `${sayfa}#mini-vrf`,
              productGroupID: "TMV-Vd",
            },
            {
              "@type": "FAQPage",
              mainEntity: t.sss.map(([s, c]) => ({ "@type": "Question", name: s, acceptedAnswer: { "@type": "Answer", text: c } })),
            },
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
                <span className="text-slate-700">TCL VRF</span>
              </nav>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-semibold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                {t.rozet}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">{t.h1}</h1>
              <p className="text-lg font-semibold text-teal-700">{t.altBaslik}</p>
              <p className="text-base text-slate-600 leading-relaxed">
                {t.giris}
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(["#dis-uniteler", "#mini-vrf", "#ic-uniteler"] as const).map((h, i) => (
                  <a key={h} href={h} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center font-bold text-slate-700 hover:border-teal-500/50 hover:text-teal-800 transition-colors">
                    {t.hizli[i]}
                  </a>
                ))}
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <Link href={y("/iletisim")} className="px-8 py-4 rounded-lg bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 shadow-sm transition-all text-center">
                  {t.teklifDugme}
                </Link>
                <KatalogButonu etiket={t.katalogDugme} />
              </div>
            </div>

            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100">
              <Image src="/slider/slider-tcl-vrf.jpg" alt={t.heroAlt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
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

        {/* 3. TEKNOLOJİ */}
        <section className="py-14 md:py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 space-y-8">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.tkEtiket}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.tkBaslik}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.tkMetin}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.teknoloji.map(([baslik, metin]) => (
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
                <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.duEtiket}</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.duBaslik}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t.duMetin}
                </p>
              </div>
              <KatalogButonu etiket={t.katalogDugme} />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {DIS_GOVDELER.map((g) => (
                <figure key={g.hp} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="relative aspect-square">
                    <Image src={g.gorsel} alt={t.govdeAlt(g.hp)} fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-contain" />
                  </div>
                  <figcaption className="text-center text-sm font-bold text-slate-800 mt-2">{g.hp}</figcaption>
                </figure>
              ))}
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
              <table className="w-full min-w-[46rem] text-xs">
                <caption className="sr-only">{t.duTabloBaslik}</caption>
                <thead>
                  <tr className="bg-slate-900 text-white">
                    {t.sutunlar.map((s, i) => (
                      <th key={s} scope="col" className={`${i < 2 ? "text-left" : "text-right"} font-semibold ${i === 0 || i === 7 ? "px-4" : "px-3"} py-3`}>{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DIS_UNITELER.map(([hp, kod, sog, guc, seer, isi, maks, scop]) => (
                    <tr key={kod} className="border-t border-slate-100 odd:bg-slate-50/60">
                      <th scope="row" className="text-left font-bold text-slate-800 px-4 py-2 whitespace-nowrap">{hp} HP</th>
                      <td className="px-3 py-2 text-slate-600 whitespace-nowrap">TMV-VED+{kod}W/AS-D(E)</td>
                      <td className="px-3 py-2 text-right text-slate-800">{n(sog)}</td>
                      <td className="px-3 py-2 text-right text-slate-800">{n(guc)}</td>
                      <td className="px-3 py-2 text-right font-semibold text-teal-700">{n(seer)}</td>
                      <td className="px-3 py-2 text-right text-slate-800">{n(isi)}</td>
                      <td className="px-3 py-2 text-right text-slate-800">{n(maks)}</td>
                      <td className="px-4 py-2 text-right font-semibold text-teal-700">{n(scop)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500">
              {t.duNot}
            </p>
          </div>
        </section>

        {/* 5. MINI VRF */}
        <section id="mini-vrf" className="scroll-mt-28 py-14 md:py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-5 gap-10 items-start">
            <div className="lg:col-span-2 space-y-4">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.mvEtiket}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.mvBaslik}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.mvMetin}
              </p>
              <div className="relative w-full max-w-xs aspect-square mx-auto lg:mx-0">
                <Image src="/tcl/tcl-mini-vrf.jpg" alt={t.mvAlt} fill sizes="20rem" className="object-contain" />
              </div>
            </div>
            <div className="lg:col-span-3 overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full min-w-[34rem] text-xs">
                <caption className="sr-only">{t.mvTabloBaslik}</caption>
                <thead>
                  <tr className="bg-slate-900 text-white">
                    {t.mvSutunlar.map((s, i) => (
                      <th key={s} scope="col" className={`${i < 2 ? "text-left" : "text-right"} font-semibold ${i === 0 || i === 5 ? "px-4" : "px-3"} py-3`}>{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MINI_VRF.map(([kod, faz, sog, seer, isi, scop]) => (
                    <tr key={kod} className="border-t border-slate-100 odd:bg-slate-50/60">
                      <th scope="row" className="text-left font-bold text-slate-800 px-4 py-2 whitespace-nowrap">TMV-Vd{kod}W/N1-D(EU)</th>
                      <td className="px-3 py-2 text-slate-600">{t.faz[faz] ?? faz}</td>
                      <td className="px-3 py-2 text-right text-slate-800">{n(sog)}</td>
                      <td className="px-3 py-2 text-right font-semibold text-teal-700">{n(seer)}</td>
                      <td className="px-3 py-2 text-right text-slate-800">{n(isi)}</td>
                      <td className="px-4 py-2 text-right font-semibold text-teal-700">{n(scop)}</td>
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
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.iuEtiket}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.iuBaslik}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.iuMetin}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {t.icUniteler.map((u, i) => (
                <article key={u.ad} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
                  <div className="relative aspect-[4/3]">
                    <Image src={IC_UNITE_GORSELLERI[i]} alt={t.iuAlt(u.ad)} fill sizes="(min-width: 1024px) 18vw, (min-width: 640px) 45vw, 90vw" className="object-contain" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-3">{u.ad}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{u.ozellik}</p>
                  <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                    <span className="font-semibold text-slate-600">{t.uygunYerler}</span> {u.yer}
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
                <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.kEtiket}</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.kBaslik}</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {t.kontrol.map(([baslik, metin]) => (
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
                <Image src="/tcl/tcl-vrf-katalog-kapak.jpg" alt={t.kapakAlt} fill sizes="10rem" className="object-cover" />
              </div>
              <p className="text-sm font-bold text-slate-900 mt-4 group-hover:text-teal-700">{t.kapakBaslik}</p>
              <p className="text-xs text-slate-500 mt-1">{t.kapakAlti}</p>
            </a>
          </div>
        </section>

        {/* 8. SIK SORULAN SORULAR */}
        <section className="py-14 md:py-16">
          <div className="max-w-4xl mx-auto px-6 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.sssEtiket}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.sssBaslik}</h2>
            </div>
            <div className="space-y-3">
              {t.sss.map(([soru, cevap]) => (
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
            <p className="text-xs text-slate-500 leading-relaxed">
              {t.ilgili}{" "}
              {t.ilgiliLinkler.map(([href, ad], i) => (
                <Fragment key={href}>
                  {i > 0 && " · "}
                  <Link href={y(href)} className="text-teal-700 underline underline-offset-2">
                    {ad}
                  </Link>
                </Fragment>
              ))}
            </p>
          </div>
        </section>

        {/* 9. CTA */}
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
                {t.hesapB}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-10 space-y-5">
              <h3 className="text-xl sm:text-2xl font-bold">{t.kutuBaslik}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t.kutuMetin}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={y("/iletisim")} className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-500 text-white text-center font-bold text-sm rounded-lg transition-colors shadow-md">
                  {t.kutuDugme}
                </Link>
                <KatalogButonu koyu etiket={t.katalogDugme} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
