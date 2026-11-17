import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { JsonLd, SITE } from "@/components/YapisalVeri";
import SikSorulanSorular, { sssYapisalVeri, type Sss } from "@/components/SikSorulanSorular";
import { dilAlternatifleri, yol, type Dil } from "@/lib/dil";
import { dilAl } from "@/lib/dil-sunucu";

export const dynamic = "force-dynamic";

const KATALOG = "/kataloglar/buderus-logamax-plus-gb272-katalog.pdf";

// Değerler Buderus Logamax plus GB272 kataloğundaki "Teknik veriler" tablosundan alınmıştır.
const MODELLER = ["49", "69", "100", "125", "150"] as const;

// Teknik tablo: [birim, değerler] (satır adları dile göre METIN.teknik içinde, aynı sırada)
const TEKNIK_DEGER: [string, string[]][][] = [
  [
    ["kW", ["46,5", "62,6", "94,5", "118,1", "141,7"]],
    ["kW", ["49,9", "69,5", "99,5", "124,5", "146"]],
    ["kW", ["14,3", "14,3", "19", "26,2", "26,2"]],
    ["%", ["98,7 / 109,7", "99,4 / 110,4", "99,3 / 110,3", "99,4 / 110,4", "99,6 / 110,6"]],
    ["%", ["95,4 / 106,0", "96,2 / 106,9", "96,1 / 106,8", "96,5 / 107,2", "96,6 / 107,3"]],
    ["°C", ["85", "85", "85", "85", "85"]],
    ["bar", ["6", "6", "6", "6", "6"]],
  ],
  [
    ["mg/kWh", ["25", "34", "38", "40", "45"]],
    ["–", ["6", "6", "6", "6", "6"]],
    ["dB(A)", ["55", "61", "60,7", "59,5", "64,3"]],
    ["l/h", ["6", "7,6", "11", "13,5", "16"]],
  ],
  [
    ["inç", ["G1½", "G1½", "G1½", "G1½", "G1½"]],
    ["inç", ["R1", "R1", "R1", "R1", "R1"]],
    ["–", ["DN110/160", "DN110/160", "DN110/160", "DN110/160", "DN110/160"]],
    ["kg", ["74", "74", "74", "96", "96"]],
    ["l", ["5", "5", "5", "10,9", "10,9"]],
    ["W", ["31", "64", "133", "152", "243"]],
    ["V / Hz", ["230 / 50", "230 / 50", "230 / 50", "230 / 50", "230 / 50"]],
  ],
];

// BUDERUS SAYFASI METİNLERİ (Türkçe / English / Deutsch)
const tr = {
  metaBaslik: "Buderus Kazan — Logamax plus GB272 Yoğuşmalı ve Kaskad Kazan (49–150 kW)",
  metaAciklama:
    "Buderus kazan: Logamax plus GB272 duvar tipi yoğuşmalı kazan, 49, 69, 100, 125 ve 150 kW. 16 kazana kadar kaskad kazan sistemi ile 2.400 kW. Teknik veriler, PDF katalog; İstanbul'da projelendirme, montaj ve devreye alma.",
  anahtar: [
    "Buderus kazan",
    "Buderus GB272",
    "Buderus Logamax plus GB272",
    "Buderus kaskad kazan",
    "kaskad kazan",
    "yoğuşmalı kazan",
    "duvar tipi yoğuşmalı kazan",
    "merkezi ısıtma kazanı",
    "Buderus kazan İstanbul",
  ],
  ogBaslik: "Buderus Kazan — Logamax plus GB272 | İklim Ofisi",
  ogAciklama: "49–150 kW duvar tipi yoğuşmalı kazan; kaskad ile 2.400 kW'a kadar merkezi ısıtma çözümleri.",
  ogAlt: "Buderus Logamax plus GB272 yoğuşmalı kazan",
  teknik: [
    {
      baslik: "Kapasite ve verim",
      satirlar: [
        "Kazan kapasitesi, tam yük (80/60 °C)",
        "Kazan kapasitesi, tam yük (50/30 °C)",
        "Kazan kapasitesi, min. yük (50/30 °C)",
        "Standart verim Hs/Hi (40/30 °C)",
        "Standart verim Hs/Hi (75/60 °C)",
        "Maks. gidiş suyu sıcaklığı",
        "Maks. çalışma basıncı",
      ],
    },
    {
      baslik: "Emisyon ve ses",
      satirlar: ["NOx emisyonu, tam yük (EN 15502)", "NOx sınıfı", "Ses gücü seviyesi, %100 kapasite", "Maks. yoğuşma suyu miktarı"],
    },
    {
      baslik: "Bağlantılar ve diğer",
      satirlar: [
        "Isıtma gidiş / dönüş bağlantısı",
        "Gaz bağlantısı",
        "Baca bağlantı çapı",
        "Ağırlık",
        "Su hacmi",
        "Elektrik tüketimi (pompa hariç)",
        "Elektrik beslemesi",
      ],
    },
  ],
  inc: "inç",
  oneCikanlar: [
    ["49 – 150 kW", "5 farklı kapasite: 49, 69, 100, 125 ve 150 kW"],
    ["2.400 kW", "16 kazana kadar kaskad, tek kumanda üzerinden"],
    ["%110+", "Norm kullanma verimi (alt ısıl değere göre)"],
    ["1:6", "Modülasyon oranı; ihtiyaca göre anlık kapasite"],
    ["85 °C", "Tam kapasitede maksimum gidiş suyu sıcaklığı"],
    ["NOx sınıf 6", "25 mg/kWh'e kadar düşük emisyon"],
  ] as [string, string][],
  teknoloji: [
    ["Üstten erişim", "Tüm elektrik bağlantılarına kazanın üst kısmından ulaşılır."],
    ["Logamatic BC30 kumanda", "Renkli ekran ve aydınlatmalı dokunmatik tuşlarla tüm bilgiler bir bakışta."],
    ["ALU plus eşanjör", "Uzun ömürlü, yüzey kaplamalı alüminyum-magnezyum-silisyum (AlMgSi) ısı eşanjörü."],
    ["Gaz ön karışımlı brülör", "Doğal gaz ve propan ile kullanıma uygun."],
    ["Verimli fan", "Sessiz ve konforlu çalışma; bekleme konumunda yalnızca 2 W tüketim."],
    ["Kaskad baca klapesi", "125 ve 150 kW modellerde baca gazı klapesi entegre gelir."],
  ] as [string, string][],
  kullanim: ["Çok daireli konutlar", "Kamu binaları", "Ticari binalar", "Oteller & tesisler"],
  // Cevaplar yalnız bu sayfadaki katalog bilgilerine dayanır
  sss: [
    [
      "Buderus Logamax plus GB272 kaç kW?",
      "GB272 beş kapasitede üretilir: 49, 69, 100, 125 ve 150 kW. 50/30 °C tam yükte kazan kapasitesi modele göre 49,9 kW ile 146 kW arasındadır. Daha büyük ihtiyaçlarda kazanlar kaskad bağlanır.",
    ],
    [
      "Kaskad kazan nedir?",
      "Kaskad, birden fazla kazanın tek bir kumanda altında birlikte çalıştırılmasıdır. Isı ihtiyacı azken az sayıda kazan, ihtiyaç arttıkça daha fazla kazan devreye girer; böylece sistem her yükte verimli çalışır. Buderus GB272 ile 16 kazana kadar kaskad yapılarak toplam 2.400 kW'a çıkılır.",
    ],
    [
      "Buderus kazan hangi binalar için uygundur?",
      "GB272; çok daireli konutlar, siteler, kamu binaları, ticari binalar, oteller ve tesisler gibi merkezi ısıtma yapılan yapılar için tasarlanmıştır. Kompakt yapısı sayesinde dar veya alçak tavanlı kazan dairelerinde 2 m²'den az alanda 900 kW kurulu güç sağlanabilir.",
    ],
    [
      "Yoğuşmalı kazan neden daha verimlidir?",
      "Yoğuşmalı kazan, baca gazındaki su buharını yoğuşturarak açığa çıkan ısıyı da tesisata kazandırır. Bu yüzden verimi alt ısıl değere göre %100'ün üzerine çıkar: GB272'de norm kullanma verimi (40/30 °C) %109,7 ile %110,6 arasındadır. Dönüş suyu sıcaklığı ne kadar düşükse yoğuşma o kadar artar.",
    ],
    ["Buderus GB272 hangi yakıtla çalışır?", "Gaz ön karışımlı brülörü doğal gaz ve propan ile kullanıma uygundur."],
    [
      "GB272 yere de kurulabilir mi?",
      "Evet. Kazan duvara monte edilebildiği gibi yer montaj kiti ile doğrudan zemine de kurulabilir. Kaskad sistemlerde kazanlar yan yana bitişik dizilebilir.",
    ],
    [
      "Binam için kaç kW kazan gerekir?",
      "Kazan kapasitesi binanın ısı kaybı hesabına ve sıcak su ihtiyacına göre belirlenir. Keşifte binayı inceleyip ısı kaybını hesaplıyor, tek kazan mı yoksa kaskad mı olacağına ve kazan sayısına birlikte karar veriyoruz. Kabaca bir fikir için kapasite hesaplama aracımızı kullanabilirsiniz.",
    ],
  ] as Sss[],
  katalogDugme: "Kataloğu İndir (PDF)",
  ld: {
    anaSayfa: "Ana Sayfa",
    urunler: "Ürünler",
    sayfa: "Buderus Kazan",
    kategori: "Duvar tipi gaz yoğuşmalı kazan",
    aciklama: (m: string) => `${m} kW Buderus Logamax plus GB272 duvar tipi yoğuşmalı kazan. 16 kazana kadar kaskad, 85 °C gidiş suyu, NOx sınıf 6.`,
  },
  rozet: "BUDERUS KAZAN · YOĞUŞMALI · KASKAD",
  h1: "Buderus Logamax plus GB272 Yoğuşmalı Kazan",
  altBaslik: "Kompakt ısı merkezi: 49–150 kW, kaskad ile 2.400 kW.",
  giris:
    "Konutlar, kamu ve ticari binalar için duvar tipi gaz yoğuşmalı kazan. Duvara ya da yer montaj kiti ile doğrudan zemine kurulabilir; dar veya alçak tavanlı kazan dairelerinde bile 2 m²'den az alanda 900 kW kurulu güç sağlar. Isı kaybı hesabından kaskad tasarımına, montajdan devreye almaya kadar projenizi tek elden yürütüyoruz.",
  teklifDugme: "Fiyat Teklifi İsteyin →",
  heroAlt: "Duvara monte Buderus Logamax plus GB272 yoğuşmalı kazan",
  kesitAlt: "Buderus Logamax plus GB272 iç yapısı: eşanjör, brülör, fan ve kumanda paneli",
  tkEtiket: "TEKNOLOJİ",
  tkBaslik: "Her şeyin temelinde verimlilik",
  tkMetin:
    "Buderus'un 40 yılı aşkın duvar tipi kazan deneyimiyle geliştirilen GB272; yüksek verim, düşük emisyon ve kolay servis için tasarlandı. Kazan; sıcaklık, basınç ve baca gazı sensörleri takılı ve kablolanmış olarak fabrikadan çıkar. Ön kapak tek hareketle açılır, tüm bileşenlere servis için erişilir.",
  kaskadAlt: "İkili kaskad Buderus GB272 kazan grubu",
  kEtiket: "KASKAD",
  kBaslik: "Buderus kaskad kazan sistemleri",
  kMetin:
    "Kaskad, birden fazla kazanın tek kumanda altında birlikte çalışmasıdır. GB272 ile 16 kazana kadar kaskad bağlantıyla toplam 2.400 kW. Kazanlar yan yana bitişik dizilebilir; ihtiyaca göre devreye girip çıkarak her yükte verimli çalışır. Güneş enerjisi veya ısı pompası gibi yenilenebilir kaynaklarla birlikte daha da verimli çalışır.",
  koEtiket: "KONTROL",
  koBaslik: "Akıllı kontrol, bina otomasyonuna uyum",
  koMaddeler: [
    "• Ek kumanda paneline gerek kalmadan bir ısıtma ve bir boyler devresi kontrolü",
    "• Logamatic EMS plus / RC310 ile 4 ısıtma + 2 boyler devresine kadar kumanda",
    "• Logamatic 5000 / 5313: 7 inç dokunmatik ekran, entegre Modbus TCP/IP ve Ethernet",
    "• 0–10 V BMS sinyali, toplu arıza bilgisi ve internet üzerinden uzaktan erişim",
  ],
  tvEtiket: "TEKNİK VERİLER",
  tvBaslik: "Model karşılaştırması",
  birim: "Birim",
  kaynak: "Kaynak: Buderus Logamax plus GB272 ürün kataloğu. Tüm teknik veriler ve tesisat şemaları için kataloğu indirin.",
  sssBaslik: "Buderus kazan hakkında merak edilenler",
  ilgili: [
    { href: "/blog/buderus-ile-merkezi-ve-bireysel-isitma", ad: "Kaskad Kazan Nedir?" },
    { href: "/blog/aluminyum-radyator-mu-celik-panel-radyator-mu", ad: "Alüminyum Radyatör mü, Çelik Panel mi?" },
  ],
  kaEtiket: "KULLANIM ALANLARI",
  kaBaslik: "Konuttan ticari binaya merkezi ısıtma",
  hesapA: "Kazan seçimini binanın ısı kaybı hesabına göre yapıyoruz. Isı kaybınızı kabaca görmek için",
  hesapLink: "kapasite hesaplama",
  hesapB: "aracımızı kullanabilirsiniz.",
  kutuBaslik: "Binanız için doğru kapasiteyi birlikte belirleyelim.",
  kutuMetin:
    "Bina tipini, ısıtılacak alanı, mevcut sistemi ve sıcak su ihtiyacınızı paylaşın; tek kazan ya da kaskad çözümü ve fiyat teklifini hazırlayalım.",
  kutuDugme: "Teklif İsteyin →",
};

type Metin = typeof tr;

const en: Metin = {
  metaBaslik: "Buderus Boilers — Logamax plus GB272 Condensing and Cascade Boilers (49–150 kW)",
  metaAciklama:
    "Buderus boilers: Logamax plus GB272 wall-mounted condensing boiler, 49, 69, 100, 125 and 150 kW. Up to 2,400 kW with cascade systems of up to 16 boilers. Technical data, PDF catalogue; design, installation and commissioning in Istanbul.",
  anahtar: [
    "Buderus boiler",
    "Buderus GB272",
    "Buderus Logamax plus GB272",
    "Buderus cascade boiler",
    "cascade boiler",
    "condensing boiler",
    "wall-mounted condensing boiler",
    "central heating boiler",
    "Buderus boiler Istanbul",
  ],
  ogBaslik: "Buderus Boilers — Logamax plus GB272 | İklim Ofisi",
  ogAciklama: "49–150 kW wall-mounted condensing boiler; central heating solutions up to 2,400 kW in cascade.",
  ogAlt: "Buderus Logamax plus GB272 condensing boiler",
  teknik: [
    {
      baslik: "Capacity and efficiency",
      satirlar: [
        "Boiler output, full load (80/60 °C)",
        "Boiler output, full load (50/30 °C)",
        "Boiler output, min. load (50/30 °C)",
        "Standard efficiency Hs/Hi (40/30 °C)",
        "Standard efficiency Hs/Hi (75/60 °C)",
        "Max. flow temperature",
        "Max. operating pressure",
      ],
    },
    {
      baslik: "Emissions and sound",
      satirlar: ["NOx emissions, full load (EN 15502)", "NOx class", "Sound power level, 100% output", "Max. condensate quantity"],
    },
    {
      baslik: "Connections and other",
      satirlar: [
        "Heating flow / return connection",
        "Gas connection",
        "Flue connection diameter",
        "Weight",
        "Water content",
        "Power consumption (excl. pump)",
        "Power supply",
      ],
    },
  ],
  inc: "inch",
  oneCikanlar: [
    ["49 – 150 kW", "5 outputs: 49, 69, 100, 125 and 150 kW"],
    ["2,400 kW", "Cascade of up to 16 boilers from a single controller"],
    ["110%+", "Standard seasonal efficiency (based on net calorific value)"],
    ["1:6", "Modulation ratio; output adapted to demand"],
    ["85 °C", "Maximum flow temperature at full output"],
    ["NOx class 6", "Low emissions down to 25 mg/kWh"],
  ],
  teknoloji: [
    ["Top access", "All electrical connections are accessible from the top of the boiler."],
    ["Logamatic BC30 controller", "Colour display and illuminated touch keys show all information at a glance."],
    ["ALU plus heat exchanger", "Durable, surface-coated aluminium-magnesium-silicon (AlMgSi) heat exchanger."],
    ["Gas premix burner", "Suitable for natural gas and propane."],
    ["Efficient fan", "Quiet, comfortable operation; only 2 W consumption in standby."],
    ["Cascade flue gas damper", "Integrated flue gas damper on the 125 and 150 kW models."],
  ],
  kullanim: ["Multi-family buildings", "Public buildings", "Commercial buildings", "Hotels & facilities"],
  sss: [
    [
      "What outputs does the Buderus Logamax plus GB272 have?",
      "The GB272 is available in five outputs: 49, 69, 100, 125 and 150 kW. At full load (50/30 °C), the boiler output ranges from 49.9 kW to 146 kW depending on the model. For larger demands, boilers are connected in cascade.",
    ],
    [
      "What is a cascade boiler system?",
      "A cascade is the joint operation of several boilers under a single controller. When heat demand is low, fewer boilers run; as demand rises, more boilers switch on, so the system works efficiently at every load. With the Buderus GB272, a cascade of up to 16 boilers reaches a total of 2,400 kW.",
    ],
    [
      "Which buildings are Buderus boilers suitable for?",
      "The GB272 is designed for centrally heated buildings such as multi-family buildings, residential complexes, public buildings, commercial buildings, hotels and facilities. Thanks to its compact design, 900 kW of installed output can be achieved in less than 2 m² even in narrow or low-ceilinged boiler rooms.",
    ],
    [
      "Why is a condensing boiler more efficient?",
      "A condensing boiler condenses the water vapour in the flue gas and also feeds the released heat into the system. This is why its efficiency exceeds 100% based on the net calorific value: the GB272's standard seasonal efficiency (40/30 °C) is between 109.7% and 110.6%. The lower the return temperature, the more condensation occurs.",
    ],
    ["What fuel does the Buderus GB272 use?", "Its gas premix burner is suitable for natural gas and propane."],
    [
      "Can the GB272 be floor-mounted?",
      "Yes. The boiler can be wall-mounted or installed directly on the floor with a floor mounting kit. In cascade systems, the boilers can be placed side by side.",
    ],
    [
      "What boiler output does my building need?",
      "The boiler output is determined by the building's heat loss calculation and domestic hot water demand. During the site survey we inspect the building and calculate the heat loss, then decide together whether a single boiler or a cascade is needed, and how many boilers. For a rough idea, you can use our capacity calculator.",
    ],
  ],
  katalogDugme: "Download Catalogue (PDF, Turkish)",
  ld: {
    anaSayfa: "Home",
    urunler: "Products",
    sayfa: "Buderus Boilers",
    kategori: "Wall-mounted gas condensing boiler",
    aciklama: (m: string) => `${m} kW Buderus Logamax plus GB272 wall-mounted condensing boiler. Cascade of up to 16 boilers, 85 °C flow temperature, NOx class 6.`,
  },
  rozet: "BUDERUS BOILER · CONDENSING · CASCADE",
  h1: "Buderus Logamax plus GB272 Condensing Boiler",
  altBaslik: "Compact heating centre: 49–150 kW, up to 2,400 kW in cascade.",
  giris:
    "Wall-mounted gas condensing boiler for residential, public and commercial buildings. It can be wall-mounted or installed directly on the floor with a floor mounting kit, and provides 900 kW of installed output in less than 2 m² even in narrow or low-ceilinged boiler rooms. From heat loss calculation to cascade design and from installation to commissioning, we handle your project from a single source.",
  teklifDugme: "Request a Price Quote →",
  heroAlt: "Wall-mounted Buderus Logamax plus GB272 condensing boiler",
  kesitAlt: "Inside the Buderus Logamax plus GB272: heat exchanger, burner, fan and control panel",
  tkEtiket: "TECHNOLOGY",
  tkBaslik: "Efficiency at the heart of everything",
  tkMetin:
    "Developed with Buderus' more than 40 years of experience in wall-mounted boilers, the GB272 is designed for high efficiency, low emissions and easy servicing. The boiler leaves the factory with temperature, pressure and flue gas sensors fitted and wired. The front cover opens in one movement, giving service access to all components.",
  kaskadAlt: "Buderus GB272 boiler group in a double cascade",
  kEtiket: "CASCADE",
  kBaslik: "Buderus cascade boiler systems",
  kMetin:
    "A cascade is the joint operation of several boilers under a single controller. With the GB272, up to 16 boilers can be connected in cascade for a total of 2,400 kW. The boilers can be placed side by side and switch on and off as needed, working efficiently at every load. Combined with renewable sources such as solar energy or heat pumps, it works even more efficiently.",
  koEtiket: "CONTROL",
  koBaslik: "Smart control, compatible with building automation",
  koMaddeler: [
    "• Control of one heating circuit and one hot water circuit without an additional control panel",
    "• Control of up to 4 heating + 2 hot water circuits with Logamatic EMS plus / RC310",
    "• Logamatic 5000 / 5313: 7-inch touch screen, integrated Modbus TCP/IP and Ethernet",
    "• 0–10 V BMS signal, common fault signal and remote access via the internet",
  ],
  tvEtiket: "TECHNICAL DATA",
  tvBaslik: "Model comparison",
  birim: "Unit",
  kaynak: "Source: Buderus Logamax plus GB272 product catalogue. Download the catalogue for all technical data and installation diagrams.",
  sssBaslik: "Common questions about Buderus boilers",
  ilgili: [
    { href: "/blog/buderus-ile-merkezi-ve-bireysel-isitma", ad: "What Is a Cascade Boiler?" },
    { href: "/blog/aluminyum-radyator-mu-celik-panel-radyator-mu", ad: "Aluminium or Steel Panel Radiator?" },
  ],
  kaEtiket: "APPLICATIONS",
  kaBaslik: "Central heating from homes to commercial buildings",
  hesapA: "We select the boiler based on the building's heat loss calculation. To get a rough idea of your heat loss, you can use our",
  hesapLink: "capacity calculator",
  hesapB: "tool.",
  kutuBaslik: "Let's determine the right output for your building together.",
  kutuMetin:
    "Share the building type, the area to be heated, the existing system and your hot water demand; we will prepare a single-boiler or cascade solution and a price quote.",
  kutuDugme: "Request a Quote →",
};

const de: Metin = {
  metaBaslik: "Buderus Kessel — Logamax plus GB272 Brennwert- und Kaskadenkessel (49–150 kW)",
  metaAciklama:
    "Buderus Kessel: Logamax plus GB272 wandhängender Brennwertkessel mit 49, 69, 100, 125 und 150 kW. Bis 2.400 kW mit Kaskaden aus bis zu 16 Kesseln. Technische Daten, PDF-Katalog; Planung, Montage und Inbetriebnahme in Istanbul.",
  anahtar: [
    "Buderus Kessel",
    "Buderus GB272",
    "Buderus Logamax plus GB272",
    "Buderus Kaskade",
    "Kaskadenkessel",
    "Brennwertkessel",
    "wandhängender Brennwertkessel",
    "Zentralheizungskessel",
    "Buderus Kessel Istanbul",
  ],
  ogBaslik: "Buderus Kessel — Logamax plus GB272 | İklim Ofisi",
  ogAciklama: "Wandhängender Brennwertkessel mit 49–150 kW; Zentralheizungslösungen bis 2.400 kW in Kaskade.",
  ogAlt: "Buderus Logamax plus GB272 Brennwertkessel",
  teknik: [
    {
      baslik: "Leistung und Wirkungsgrad",
      satirlar: [
        "Kesselleistung, Volllast (80/60 °C)",
        "Kesselleistung, Volllast (50/30 °C)",
        "Kesselleistung, min. Last (50/30 °C)",
        "Normnutzungsgrad Hs/Hi (40/30 °C)",
        "Normnutzungsgrad Hs/Hi (75/60 °C)",
        "Max. Vorlauftemperatur",
        "Max. Betriebsdruck",
      ],
    },
    {
      baslik: "Emissionen und Schall",
      satirlar: ["NOx-Emission, Volllast (EN 15502)", "NOx-Klasse", "Schallleistungspegel, 100 % Leistung", "Max. Kondensatmenge"],
    },
    {
      baslik: "Anschlüsse und Sonstiges",
      satirlar: [
        "Anschluss Heizungsvorlauf / -rücklauf",
        "Gasanschluss",
        "Abgasanschluss-Durchmesser",
        "Gewicht",
        "Wasserinhalt",
        "Stromaufnahme (ohne Pumpe)",
        "Stromversorgung",
      ],
    },
  ],
  inc: "Zoll",
  oneCikanlar: [
    ["49 – 150 kW", "5 Leistungsgrößen: 49, 69, 100, 125 und 150 kW"],
    ["2.400 kW", "Kaskade mit bis zu 16 Kesseln über eine Regelung"],
    ["110 %+", "Normnutzungsgrad (bezogen auf den Heizwert)"],
    ["1:6", "Modulationsbereich; bedarfsgerechte Leistung"],
    ["85 °C", "Maximale Vorlauftemperatur bei voller Leistung"],
    ["NOx-Klasse 6", "Niedrige Emissionen bis 25 mg/kWh"],
  ],
  teknoloji: [
    ["Zugang von oben", "Alle elektrischen Anschlüsse sind von der Oberseite des Kessels erreichbar."],
    ["Regelgerät Logamatic BC30", "Farbdisplay und beleuchtete Touch-Tasten zeigen alle Informationen auf einen Blick."],
    ["Wärmetauscher ALU plus", "Langlebiger, oberflächenbeschichteter Wärmetauscher aus Aluminium-Magnesium-Silizium (AlMgSi)."],
    ["Gas-Vormischbrenner", "Geeignet für Erdgas und Propan."],
    ["Effizientes Gebläse", "Leiser, komfortabler Betrieb; nur 2 W Verbrauch im Standby."],
    ["Kaskaden-Abgasklappe", "Bei den Modellen mit 125 und 150 kW ist die Abgasklappe integriert."],
  ],
  kullanim: ["Mehrfamilienhäuser", "Öffentliche Gebäude", "Gewerbebauten", "Hotels & Anlagen"],
  sss: [
    [
      "Welche Leistungen hat der Buderus Logamax plus GB272?",
      "Der GB272 wird in fünf Leistungsgrößen gefertigt: 49, 69, 100, 125 und 150 kW. Bei Volllast (50/30 °C) liegt die Kesselleistung je nach Modell zwischen 49,9 kW und 146 kW. Bei größerem Bedarf werden die Kessel in Kaskade geschaltet.",
    ],
    [
      "Was ist eine Kaskadenanlage?",
      "Eine Kaskade ist der gemeinsame Betrieb mehrerer Kessel über eine Regelung. Bei geringem Wärmebedarf laufen wenige Kessel, steigt der Bedarf, schalten weitere zu; so arbeitet die Anlage bei jeder Last effizient. Mit dem Buderus GB272 sind Kaskaden aus bis zu 16 Kesseln mit insgesamt 2.400 kW möglich.",
    ],
    [
      "Für welche Gebäude eignen sich Buderus Kessel?",
      "Der GB272 ist für zentral beheizte Gebäude wie Mehrfamilienhäuser, Wohnanlagen, öffentliche Gebäude, Gewerbebauten, Hotels und Anlagen ausgelegt. Dank der kompakten Bauweise lassen sich selbst in engen oder niedrigen Heizräumen 900 kW installierte Leistung auf weniger als 2 m² realisieren.",
    ],
    [
      "Warum ist ein Brennwertkessel effizienter?",
      "Ein Brennwertkessel kondensiert den Wasserdampf im Abgas und führt die dabei frei werdende Wärme ebenfalls der Anlage zu. Deshalb liegt sein Wirkungsgrad bezogen auf den Heizwert über 100 %: Beim GB272 beträgt der Normnutzungsgrad (40/30 °C) 109,7 % bis 110,6 %. Je niedriger die Rücklauftemperatur, desto mehr Kondensation.",
    ],
    ["Mit welchem Brennstoff arbeitet der Buderus GB272?", "Sein Gas-Vormischbrenner ist für Erdgas und Propan geeignet."],
    [
      "Kann der GB272 auch am Boden aufgestellt werden?",
      "Ja. Der Kessel kann an der Wand montiert oder mit einem Bodenmontageset direkt auf dem Boden aufgestellt werden. In Kaskadenanlagen lassen sich die Kessel direkt nebeneinander anordnen.",
    ],
    [
      "Welche Kesselleistung braucht mein Gebäude?",
      "Die Kesselleistung richtet sich nach der Heizlastberechnung des Gebäudes und dem Warmwasserbedarf. Bei der Besichtigung prüfen wir das Gebäude, berechnen die Heizlast und entscheiden gemeinsam, ob ein Einzelkessel oder eine Kaskade sinnvoll ist und wie viele Kessel nötig sind. Für eine grobe Einschätzung können Sie unseren Leistungsrechner nutzen.",
    ],
  ],
  katalogDugme: "Katalog herunterladen (PDF, Türkisch)",
  ld: {
    anaSayfa: "Startseite",
    urunler: "Produkte",
    sayfa: "Buderus Kessel",
    kategori: "Wandhängender Gas-Brennwertkessel",
    aciklama: (m: string) => `Buderus Logamax plus GB272 wandhängender Brennwertkessel mit ${m} kW. Kaskade mit bis zu 16 Kesseln, 85 °C Vorlauf, NOx-Klasse 6.`,
  },
  rozet: "BUDERUS KESSEL · BRENNWERT · KASKADE",
  h1: "Buderus Logamax plus GB272 Brennwertkessel",
  altBaslik: "Kompakte Heizzentrale: 49–150 kW, in Kaskade bis 2.400 kW.",
  giris:
    "Wandhängender Gas-Brennwertkessel für Wohn-, öffentliche und Gewerbebauten. Er kann an der Wand oder mit einem Bodenmontageset direkt auf dem Boden installiert werden und liefert selbst in engen oder niedrigen Heizräumen 900 kW installierte Leistung auf weniger als 2 m². Von der Heizlastberechnung über die Kaskadenplanung bis zu Montage und Inbetriebnahme betreuen wir Ihr Projekt aus einer Hand.",
  teklifDugme: "Preisangebot anfordern →",
  heroAlt: "Wandhängender Buderus Logamax plus GB272 Brennwertkessel",
  kesitAlt: "Innenaufbau des Buderus Logamax plus GB272: Wärmetauscher, Brenner, Gebläse und Bedienfeld",
  tkEtiket: "TECHNOLOGIE",
  tkBaslik: "Effizienz als Grundlage von allem",
  tkMetin:
    "Der GB272 wurde mit über 40 Jahren Buderus-Erfahrung bei Wandkesseln entwickelt und ist auf hohe Effizienz, niedrige Emissionen und einfache Wartung ausgelegt. Der Kessel verlässt das Werk mit montierten und verdrahteten Temperatur-, Druck- und Abgassensoren. Die Frontverkleidung lässt sich mit einem Handgriff öffnen; alle Bauteile sind für den Service zugänglich.",
  kaskadAlt: "Buderus GB272 Kesselgruppe in Doppelkaskade",
  kEtiket: "KASKADE",
  kBaslik: "Buderus Kaskadenkesselanlagen",
  kMetin:
    "Eine Kaskade ist der gemeinsame Betrieb mehrerer Kessel über eine Regelung. Mit dem GB272 lassen sich bis zu 16 Kessel in Kaskade mit insgesamt 2.400 kW verbinden. Die Kessel können direkt nebeneinander stehen und schalten sich je nach Bedarf zu und ab, sodass sie bei jeder Last effizient arbeiten. Zusammen mit erneuerbaren Quellen wie Solarthermie oder Wärmepumpe arbeitet die Anlage noch effizienter.",
  koEtiket: "REGELUNG",
  koBaslik: "Intelligente Regelung, kompatibel mit der Gebäudeautomation",
  koMaddeler: [
    "• Regelung eines Heizkreises und eines Warmwasserkreises ohne zusätzliches Regelgerät",
    "• Mit Logamatic EMS plus / RC310 Regelung von bis zu 4 Heiz- + 2 Warmwasserkreisen",
    "• Logamatic 5000 / 5313: 7-Zoll-Touchscreen, integriertes Modbus TCP/IP und Ethernet",
    "• 0–10-V-GLT-Signal, Sammelstörmeldung und Fernzugriff über das Internet",
  ],
  tvEtiket: "TECHNISCHE DATEN",
  tvBaslik: "Modellvergleich",
  birim: "Einheit",
  kaynak: "Quelle: Produktkatalog Buderus Logamax plus GB272. Laden Sie den Katalog für alle technischen Daten und Anlagenschemata herunter.",
  sssBaslik: "Häufige Fragen zu Buderus Kesseln",
  ilgili: [
    { href: "/blog/buderus-ile-merkezi-ve-bireysel-isitma", ad: "Was ist ein Kaskadenkessel?" },
    { href: "/blog/aluminyum-radyator-mu-celik-panel-radyator-mu", ad: "Aluminium- oder Stahl-Flachheizkörper?" },
  ],
  kaEtiket: "EINSATZBEREICHE",
  kaBaslik: "Zentralheizung vom Wohnhaus bis zum Gewerbebau",
  hesapA: "Wir wählen den Kessel anhand der Heizlastberechnung des Gebäudes aus. Für eine grobe Einschätzung Ihrer Heizlast können Sie unseren",
  hesapLink: "Leistungsrechner",
  hesapB: "nutzen.",
  kutuBaslik: "Lassen Sie uns gemeinsam die richtige Leistung für Ihr Gebäude bestimmen.",
  kutuMetin:
    "Teilen Sie uns Gebäudetyp, beheizte Fläche, bestehende Anlage und Warmwasserbedarf mit – wir erstellen eine Lösung mit Einzelkessel oder Kaskade und ein Preisangebot.",
  kutuDugme: "Angebot anfordern →",
};

const METIN: Record<Dil, Metin> = { tr, en, de };

// İngilizcede ondalık ayırıcı nokta ("46,5" → "46.5")
const ondalik = (dil: Dil, v: string) => (dil === "en" ? v.replace(/(\d),(\d)/g, "$1.$2") : v);

export function generateMetadata(): Metadata {
  const dil = dilAl();
  const t = METIN[dil];
  return {
    title: t.metaBaslik,
    description: t.metaAciklama,
    keywords: t.anahtar,
    alternates: dilAlternatifleri(dil, "/buderus"),
    openGraph: {
      title: t.ogBaslik,
      description: t.ogAciklama,
      url: `https://iklimofisi.com${yol(dil, "/buderus")}`,
      images: [{ url: "/buderus/gb272-slider.jpg", width: 1200, height: 750, alt: t.ogAlt }],
    },
  };
}

function KatalogButonu({ koyu = false, etiket }: { koyu?: boolean; etiket: string }) {
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
      {etiket}
    </a>
  );
}

export default function BuderusPage() {
  const dil = dilAl();
  const t = METIN[dil];
  const y = (h: string) => yol(dil, h);
  const sayfa = `${SITE}${y("/buderus")}`;
  const n = (v: string) => ondalik(dil, v);
  const birimAdi = (b: string) => (b === "inç" ? t.inc : b);
  // Teknik tablo: satır adları dile göre, değerler ortak
  const TEKNIK = t.teknik.map((g, gi) => ({
    baslik: g.baslik,
    satirlar: g.satirlar.map((ad, si) => [ad, birimAdi(TEKNIK_DEGER[gi][si][0]), TEKNIK_DEGER[gi][si][1].map(n)] as [string, string, string[]]),
  }));

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
            ...MODELLER.map((m, i) => ({
              "@type": "Product",
              "@id": `${sayfa}#gb272-${m}`,
              name: `Buderus Logamax plus GB272-${m}`,
              brand: { "@type": "Brand", name: "Buderus" },
              category: t.ld.kategori,
              description: t.ld.aciklama(m),
              image: `${SITE}/buderus/gb272-kapak.jpg`,
              url: sayfa,
              additionalProperty: TEKNIK.flatMap((g) =>
                g.satirlar.map(([ad, birim, degerler]) => ({
                  "@type": "PropertyValue",
                  name: ad,
                  value: degerler[i],
                  ...(birim !== "–" ? { unitText: birim } : {}),
                }))
              ),
            })),
            sssYapisalVeri(t.sss),
          ],
        }}
      />

      <main>
        {/* 1. HERO */}
        <section className="bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                {t.rozet}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
                {t.h1}
              </h1>
              <p className="text-lg font-semibold text-teal-700">{t.altBaslik}</p>
              <p className="text-base text-slate-600 leading-relaxed">
                {t.giris}
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
                  href={y("/iletisim")}
                  className="px-8 py-4 rounded-lg bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 shadow-sm transition-all text-center"
                >
                  {t.teklifDugme}
                </Link>
                <KatalogButonu etiket={t.katalogDugme} />
              </div>
            </div>

            <div className="relative w-full max-w-xs sm:max-w-md mx-auto lg:max-w-none aspect-[4/5] rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900">
              <Image
                src="/buderus/gb272-kapak.jpg"
                alt={t.heroAlt}
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
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-5 gap-10 items-center">
            <div className="lg:col-span-2 flex justify-center">
              <div className="relative w-full max-w-[18rem] aspect-[361/767]">
                <Image
                  src="/buderus/gb272-kesit.jpg"
                  alt={t.kesitAlt}
                  fill
                  sizes="18rem"
                  className="object-contain"
                />
              </div>
            </div>
            <div className="lg:col-span-3 space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.tkEtiket}</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.tkBaslik}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t.tkMetin}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {t.teknoloji.map(([baslik, metin]) => (
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
                <Image src="/buderus/gb272-kaskad.jpg" alt={t.kaskadAlt} fill sizes="10rem" className="object-contain" />
              </div>
              <div className="space-y-3">
                <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.kEtiket}</p>
                <h2 className="text-xl font-bold text-slate-900">{t.kBaslik}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t.kMetin}
                </p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-3">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.koEtiket}</p>
              <h2 className="text-xl font-bold text-slate-900">{t.koBaslik}</h2>
              <ul className="space-y-2 text-sm text-slate-600">
                {t.koMaddeler.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 5. TEKNİK VERİLER */}
        <section id="teknik" className="scroll-mt-28 py-14 md:py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.tvEtiket}</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.tvBaslik}</h2>
              </div>
              <KatalogButonu etiket={t.katalogDugme} />
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full min-w-[46rem] text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th scope="col" className="text-left font-semibold px-4 py-3">Logamax plus GB272</th>
                    <th scope="col" className="text-left font-semibold px-2 py-3">{t.birim}</th>
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
            <p className="text-[11px] text-slate-500">{t.kaynak}</p>
          </div>
        </section>

        {/* 6. SIK SORULAN SORULAR */}
        <SikSorulanSorular
          baslik={t.sssBaslik}
          sss={t.sss}
          ilgili={t.ilgili}
          dil={dil}
        />

        {/* 7. KULLANIM ALANLARI + CTA */}
        <section className="py-16 md:py-20 bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">{t.kaEtiket}</p>
              <h2 className="text-2xl sm:text-3xl font-bold">{t.kaBaslik}</h2>
              <div className="grid grid-cols-2 gap-3">
                {t.kullanim.map((k) => (
                  <div key={k} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm font-bold text-center">
                    {k}
                  </div>
                ))}
              </div>
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
                <Link
                  href={y("/iletisim")}
                  className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-500 text-white text-center font-bold text-sm rounded-lg transition-colors shadow-md"
                >
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
