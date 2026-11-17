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
// HAVA PERDESİ SAYFASI (/hava-perdesi) — Niva ve Olefini
// Niva seri bilgileri (boylar, takılabilir yükseklik) Niva bayi listesinden alınmıştır.
// Fiyat yazılmaz. Görseller: public/hava-perdesi/
// -----------------------------------------------------------------------------

export const dynamic = "force-dynamic";

type Seri = { ad: string; tip: string; gorsel: string; boy: string; yukseklik: string; not: string };

// Niva bayi listesindeki seriler (ısıtıcısız / ısıtıcılı takılabilir yükseklik).
// "anahtar" dilden bağımsızdır (etiket seçimi için); görünen ad ve yazılar dile göredir.
const NIVA_ANAHTAR = ["Linda", "Life", "Smart Kaset", "Lena", "Dikey", "Turbo"] as const;

// HAVA PERDESİ SAYFASI METİNLERİ (Türkçe / English / Deutsch)
const tr = {
  metaBaslik: "Hava Perdesi Modelleri: Niva ve Olefini | İklim Ofisi",
  metaAciklama:
    "Hava perdesi nedir, ne işe yarar? Niva ve Olefini hava perdeleri: ısıtıcılı ve ısıtıcısız modeller, 85–250 cm boy, 12 m'ye kadar montaj yüksekliği. Mağaza, restoran, otel, AVM ve endüstriyel kapılar için İstanbul'da satış, keşif ve montaj.",
  anahtar: [
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
  ogBaslik: "Niva ve Olefini Hava Perdeleri | İklim Ofisi",
  ogAciklama: "Isıtıcılı ve ısıtıcısız hava perdeleri; satış, keşif ve montaj.",
  ogAlt: "Niva ve Olefini hava perdeleri",
  niva: [
    { ad: "Linda", tip: "Genel tip", gorsel: "linda", boy: "85 – 200 cm", yukseklik: "3,0 m / 2,5 m", not: "Mağaza, ofis ve konut girişleri" },
    { ad: "Life", tip: "Ticari tip", gorsel: "life", boy: "100 – 250 cm", yukseklik: "4,0 m / 3,5 m", not: "Restoran, market ve ticari girişler" },
    { ad: "Smart Kaset", tip: "Tavana gömme", gorsel: "kaset", boy: "120 – 200 cm", yukseklik: "3,8 m / 3,5 m", not: "Asma tavana gömülü, görünmez montaj" },
    { ad: "Lena", tip: "Endüstriyel tip", gorsel: "lena", boy: "85 – 120 cm", yukseklik: "6,0 m / 6,0 m", not: "Depo, atölye ve yüksek kapılar" },
    { ad: "Dikey", tip: "Dikey montaj", gorsel: "dikey", boy: "200 – 300 cm yükseklik", yukseklik: "3,0 m genişlik", not: "Kapı üstünde yer olmayan girişler" },
    { ad: "Turbo", tip: "Endüstriyel tip", gorsel: "turbo", boy: "100 cm", yukseklik: "12 m", not: "Fabrika ve hangar gibi çok yüksek kapılar" },
  ] as Seri[],
  neden: [
    ["Enerji tasarrufu", "Kapı açıkken ısıtılan ya da soğutulan hava içeride kalır; klima ve kalorifer daha az çalışır."],
    ["Girişte konfor", "Kapı önündeki soğuk hava akımı ve cereyan hissedilmez; kasa ve karşılama alanı rahatlar."],
    ["Isıtıcılı modeller", "Kışın girişe sıcak hava bariyeri; ek ısıtıcıya gerek kalmadan kapı önü ısınır."],
    ["Kapı açık çalışma", "Müşteri trafiği yoğun mağaza ve restoranlarda kapı açık kalabilir, iklimlendirme bozulmaz."],
  ] as [string, string][],
  secim: [
    ["Kapı genişliği", "Hava perdesinin boyu kapı genişliğine eşit ya da biraz fazla olmalı; geniş kapılarda yan yana birden fazla cihaz kullanılır."],
    ["Montaj yüksekliği", "Cihazın takılacağı yükseklik seriyi belirler: 3 m'ye kadar Linda, 4 m'ye kadar Life, 6 m'ye kadar Lena, 12 m'ye kadar Turbo."],
    ["Isıtıcılı mı, ısıtıcısız mı", "Yalnız klimalı ortamlar için ısıtıcısız; kışın girişin ısınması isteniyorsa ısıtıcılı model seçilir."],
    ["Elektrik altyapısı", "Isıtıcılı modeller daha yüksek güç çeker; keşifte sigorta ve kablo kesitini birlikte kontrol ediyoruz."],
  ] as [string, string][],
  // Cevaplar yalnız bu sayfadaki Niva / Olefini bilgilerine dayanır
  sss: [
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
  ] as Sss[],
  ld: {
    anaSayfa: "Ana Sayfa",
    urunler: "Ürünler",
    sayfa: "Hava Perdesi",
    nivaGrup: "Niva Hava Perdeleri",
    kategori: "Hava perdesi",
    nivaAd: (ad: string) => `Niva ${ad} hava perdesi`,
    olefiniAd: "Olefini Hava Perdeleri",
  },
  sayfaYolu: "Sayfa yolu",
  rozet: "NİVA · OLEFİNİ",
  h1: "Hava Perdeleri",
  altBaslik: "Kapı açıkken bile ısıtılan ya da soğutulan hava içeride kalsın.",
  giris:
    "Mağaza, restoran, otel, AVM, depo ve fabrika girişleri için Niva ve Olefini hava perdeleri. Isıtıcılı ve ısıtıcısız modeller; 85 cm'den 250 cm'ye kadar boy, 12 m'ye kadar montaj yüksekliği. Kapınıza uygun modeli seçiyor, satışını ve montajını yapıyoruz.",
  hizli: ["Niva", "Olefini", "Nasıl seçilir?"],
  teklifDugme: "Fiyat Teklifi İsteyin →",
  olefiniGirisAlt: "Cam giriş kapısı üzerinde Olefini hava perdesi",
  olefiniKapiAlt: "Ahşap çift kanatlı kapı üzerinde Olefini hava perdesi",
  nhEtiket: "NEDEN HAVA PERDESİ",
  nhBaslik: "Hava perdesi ne işe yarar?",
  nhMetin:
    "Hava perdesi kapının üstünden aşağıya doğru güçlü bir hava akımı üfler. Bu görünmez bariyer iç ve dış ortam arasındaki hava geçişini azaltır.",
  nvEtiket: "NİVA",
  nvBaslik: "Niva hava perdeleri",
  nvMetin:
    "Genel, ticari, tavana gömme, endüstriyel ve dikey tipte 6 seri. Seriler ısıtıcılı ve ısıtıcısız olarak üretilir (Turbo yalnız ısıtıcısız).",
  cihaz: "Cihaz",
  boy: "Boy",
  takilabilir: "Takılabilir",
  takilabilirYukseklik: "Takılabilir yükseklik",
  dipnot: "* Isıtıcısız / ısıtıcılı model için en fazla montaj yüksekliği.",
  olEtiket: "OLEFİNİ",
  olBaslik: "Olefini hava perdeleri",
  olMetin:
    "Şık tasarımı ve dijital kontrol paneliyle Olefini hava perdeleri; mağaza, otel, restoran ve ofis girişlerinde dekorasyonla uyumlu bir çözüm sunar. Kapınızın ölçüsüne ve montaj yüksekliğine göre doğru modeli belirleyip teklif hazırlıyoruz.",
  olDugme: "Olefini için teklif isteyin →",
  scEtiket: "NASIL SEÇİLİR",
  scBaslik: "Doğru hava perdesi için 4 ölçü",
  scYazi: "Seçim ve montaj ipuçlarını daha ayrıntılı anlattığımız yazı:",
  yaziAdi: "Hava Perdesi Nedir, Ne İşe Yarar, Nasıl Seçilir?",
  sssBaslik: "Hava perdesi hakkında merak edilenler",
  ctaEtiket: "SATIŞ · KEŞİF · MONTAJ",
  ctaBaslik: "Kapınıza uygun hava perdesini birlikte seçelim",
  ctaMaddeler: [
    "• Kapı ölçüsü ve montaj yüksekliğine göre model seçimi",
    "• Isıtıcılı modellerde elektrik altyapısı kontrolü",
    "• Montaj, kumanda bağlantısı ve devreye alma",
  ],
  kutuBaslik: "Hava perdesi fiyat teklifi alın.",
  kutuMetin:
    "Kapı genişliğini, montaj yüksekliğini ve ısıtıcılı/ısıtıcısız tercihinizi paylaşın; Niva ve Olefini seçenekleriyle teklif hazırlayalım.",
  kutuDugme: "Teklif İsteyin →",
};

type Metin = typeof tr;

const en: Metin = {
  metaBaslik: "Air Curtain Models: Niva and Olefini | İklim Ofisi",
  metaAciklama:
    "What is an air curtain and what does it do? Niva and Olefini air curtains: models with and without heaters, 85–250 cm lengths, mounting heights up to 12 m. Supply, site survey and installation in Istanbul for shops, restaurants, hotels, shopping centres and industrial doors.",
  anahtar: [
    "air curtain",
    "what is an air curtain",
    "air curtain benefits",
    "heated air curtain",
    "Niva air curtain",
    "Olefini air curtain",
    "industrial air curtain",
    "door air curtain",
    "air curtain Istanbul",
  ],
  ogBaslik: "Niva and Olefini Air Curtains | İklim Ofisi",
  ogAciklama: "Air curtains with and without heaters; supply, site survey and installation.",
  ogAlt: "Niva and Olefini air curtains",
  niva: [
    { ad: "Linda", tip: "General type", gorsel: "linda", boy: "85 – 200 cm", yukseklik: "3.0 m / 2.5 m", not: "Shop, office and residential entrances" },
    { ad: "Life", tip: "Commercial type", gorsel: "life", boy: "100 – 250 cm", yukseklik: "4.0 m / 3.5 m", not: "Restaurant, supermarket and commercial entrances" },
    { ad: "Smart Kaset", tip: "Recessed ceiling", gorsel: "kaset", boy: "120 – 200 cm", yukseklik: "3.8 m / 3.5 m", not: "Recessed into a suspended ceiling, invisible installation" },
    { ad: "Lena", tip: "Industrial type", gorsel: "lena", boy: "85 – 120 cm", yukseklik: "6.0 m / 6.0 m", not: "Warehouses, workshops and high doors" },
    { ad: "Vertical", tip: "Vertical mounting", gorsel: "dikey", boy: "200 – 300 cm height", yukseklik: "3.0 m width", not: "Entrances with no space above the door" },
    { ad: "Turbo", tip: "Industrial type", gorsel: "turbo", boy: "100 cm", yukseklik: "12 m", not: "Very high doors such as in factories and hangars" },
  ],
  neden: [
    ["Energy savings", "Heated or cooled air stays inside while the door is open; air conditioning and heating run less."],
    ["Comfort at the entrance", "No cold air flow or draught at the door; the checkout and reception area stays comfortable."],
    ["Heated models", "A warm air barrier at the entrance in winter; the doorway is heated without an additional heater."],
    ["Open-door operation", "Shops and restaurants with heavy customer traffic can keep their doors open without disturbing the indoor climate."],
  ],
  secim: [
    ["Door width", "The air curtain length should equal or slightly exceed the door width; wide doors use several units side by side."],
    ["Mounting height", "The installation height determines the series: Linda up to 3 m, Life up to 4 m, Lena up to 6 m, Turbo up to 12 m."],
    ["With or without heater", "Without heater for air-conditioned spaces only; choose a heated model if the entrance should be heated in winter."],
    ["Electrical supply", "Heated models draw more power; during the site survey we check the fuse and cable cross-section together."],
  ],
  sss: [
    [
      "What does an air curtain do?",
      "An air curtain blows a strong stream of air downwards from above the door, creating an invisible barrier between indoors and outdoors while the door is open. This keeps heated air inside in winter and cooled air inside in summer, reduces draughts at the door and lets businesses keep their doors open.",
    ],
    [
      "Does an air curtain save energy?",
      "Yes. Because less conditioned air escapes through the door, air conditioning and heating run less. The savings are more noticeable in businesses whose doors open and close all day, such as shops, restaurants and supermarkets.",
    ],
    [
      "Should I choose an air curtain with or without a heater?",
      "If the space is already well heated by air conditioning or central heating, a model without a heater may be sufficient. If the entrance area should also be heated in winter, a heated model is chosen. Since heated models draw more electrical power, the fuse and cable cross-section are checked during the site survey.",
    ],
    [
      "How is the air curtain length chosen?",
      "The air curtain should be equal to or slightly longer than the door width; if the air stream does not cover the whole door, air escapes at the edges. Niva models are available in lengths from 85 cm to 250 cm depending on the series; on wider doors, several units are mounted side by side.",
    ],
    [
      "How high can an air curtain be mounted?",
      "The mounting height determines the series. For Niva models without heaters, Linda is suitable up to 3 m, Smart Kaset up to 3.8 m, Life up to 4 m, the industrial Lena up to 6 m and Turbo up to 12 m. For heated models these heights are slightly lower (e.g. Linda 2.5 m, Life 3.5 m).",
    ],
    [
      "What if there is no space above the door?",
      "In spaces with suspended ceilings, the recessed Smart Kaset model offers an invisible solution. If there is no space above the door at all, the Niva vertical model is mounted vertically beside the door.",
    ],
  ],
  ld: {
    anaSayfa: "Home",
    urunler: "Products",
    sayfa: "Air Curtains",
    nivaGrup: "Niva Air Curtains",
    kategori: "Air curtain",
    nivaAd: (ad: string) => `Niva ${ad} air curtain`,
    olefiniAd: "Olefini Air Curtains",
  },
  sayfaYolu: "Breadcrumb",
  rozet: "NIVA · OLEFINI",
  h1: "Air Curtains",
  altBaslik: "Keep heated or cooled air inside, even when the door is open.",
  giris:
    "Niva and Olefini air curtains for shop, restaurant, hotel, shopping centre, warehouse and factory entrances. Models with and without heaters; lengths from 85 cm to 250 cm and mounting heights up to 12 m. We select the right model for your door, then supply and install it.",
  hizli: ["Niva", "Olefini", "How to choose?"],
  teklifDugme: "Request a Price Quote →",
  olefiniGirisAlt: "Olefini air curtain above a glass entrance door",
  olefiniKapiAlt: "Olefini air curtain above a wooden double door",
  nhEtiket: "WHY AN AIR CURTAIN",
  nhBaslik: "What does an air curtain do?",
  nhMetin:
    "An air curtain blows a strong stream of air downwards from above the door. This invisible barrier reduces the exchange of air between indoors and outdoors.",
  nvEtiket: "NIVA",
  nvBaslik: "Niva air curtains",
  nvMetin:
    "6 series in general, commercial, recessed ceiling, industrial and vertical types. The series are available with and without heaters (Turbo without heater only).",
  cihaz: "Unit",
  boy: "Length",
  takilabilir: "Coverage",
  takilabilirYukseklik: "Mounting height",
  dipnot: "* Maximum mounting height for models without / with heater.",
  olEtiket: "OLEFINI",
  olBaslik: "Olefini air curtains",
  olMetin:
    "With their stylish design and digital control panel, Olefini air curtains are a solution that blends with the décor of shop, hotel, restaurant and office entrances. We determine the right model based on your door size and mounting height and prepare a quote.",
  olDugme: "Request a quote for Olefini →",
  scEtiket: "HOW TO CHOOSE",
  scBaslik: "4 criteria for the right air curtain",
  scYazi: "Our article with more detailed selection and installation tips:",
  yaziAdi: "What Is an Air Curtain, What Does It Do and How to Choose One?",
  sssBaslik: "Common questions about air curtains",
  ctaEtiket: "SUPPLY · SITE SURVEY · INSTALLATION",
  ctaBaslik: "Let's choose the right air curtain for your door together",
  ctaMaddeler: [
    "• Model selection based on door size and mounting height",
    "• Electrical supply check for heated models",
    "• Installation, control connection and commissioning",
  ],
  kutuBaslik: "Get an air curtain price quote.",
  kutuMetin:
    "Share the door width, mounting height and whether you need a heater; we will prepare a quote with Niva and Olefini options.",
  kutuDugme: "Request a Quote →",
};

const de: Metin = {
  metaBaslik: "Torluftschleier-Modelle: Niva und Olefini | İklim Ofisi",
  metaAciklama:
    "Was ist ein Torluftschleier und wozu dient er? Niva- und Olefini-Torluftschleier: Modelle mit und ohne Heizung, 85–250 cm Länge, Montagehöhe bis 12 m. Lieferung, Besichtigung und Montage in Istanbul für Geschäfte, Restaurants, Hotels, Einkaufszentren und Industrietore.",
  anahtar: [
    "Torluftschleier",
    "Luftschleier",
    "was ist ein Torluftschleier",
    "Torluftschleier mit Heizung",
    "Niva Torluftschleier",
    "Olefini Torluftschleier",
    "Industrie-Torluftschleier",
    "Türluftschleier",
    "Torluftschleier Istanbul",
  ],
  ogBaslik: "Niva und Olefini Torluftschleier | İklim Ofisi",
  ogAciklama: "Torluftschleier mit und ohne Heizung; Lieferung, Besichtigung und Montage.",
  ogAlt: "Niva und Olefini Torluftschleier",
  niva: [
    { ad: "Linda", tip: "Standardausführung", gorsel: "linda", boy: "85 – 200 cm", yukseklik: "3,0 m / 2,5 m", not: "Eingänge von Geschäften, Büros und Wohnungen" },
    { ad: "Life", tip: "Gewerbeausführung", gorsel: "life", boy: "100 – 250 cm", yukseklik: "4,0 m / 3,5 m", not: "Eingänge von Restaurants, Märkten und Gewerbe" },
    { ad: "Smart Kaset", tip: "Deckeneinbau", gorsel: "kaset", boy: "120 – 200 cm", yukseklik: "3,8 m / 3,5 m", not: "In die abgehängte Decke eingebaut, unsichtbar" },
    { ad: "Lena", tip: "Industrieausführung", gorsel: "lena", boy: "85 – 120 cm", yukseklik: "6,0 m / 6,0 m", not: "Lager, Werkstätten und hohe Tore" },
    { ad: "Vertikal", tip: "Vertikale Montage", gorsel: "dikey", boy: "200 – 300 cm Höhe", yukseklik: "3,0 m Breite", not: "Eingänge ohne Platz über der Tür" },
    { ad: "Turbo", tip: "Industrieausführung", gorsel: "turbo", boy: "100 cm", yukseklik: "12 m", not: "Sehr hohe Tore wie in Fabriken und Hangars" },
  ],
  neden: [
    ["Energieeinsparung", "Erwärmte oder gekühlte Luft bleibt bei geöffneter Tür im Raum; Klimaanlage und Heizung laufen weniger."],
    ["Komfort im Eingang", "Keine Kaltluftströmung und kein Zug an der Tür; Kassen- und Empfangsbereich bleiben behaglich."],
    ["Modelle mit Heizung", "Im Winter eine Warmluftbarriere am Eingang; der Türbereich wird ohne Zusatzheizung erwärmt."],
    ["Betrieb bei offener Tür", "Geschäfte und Restaurants mit viel Kundenverkehr können die Tür offen lassen, ohne das Raumklima zu stören."],
  ],
  secim: [
    ["Türbreite", "Die Länge des Torluftschleiers sollte der Türbreite entsprechen oder etwas größer sein; bei breiten Türen werden mehrere Geräte nebeneinander eingesetzt."],
    ["Montagehöhe", "Die Einbauhöhe bestimmt die Serie: Linda bis 3 m, Life bis 4 m, Lena bis 6 m, Turbo bis 12 m."],
    ["Mit oder ohne Heizung", "Ohne Heizung für rein klimatisierte Räume; soll der Eingang im Winter beheizt werden, wird ein Modell mit Heizung gewählt."],
    ["Elektrische Versorgung", "Modelle mit Heizung haben eine höhere Leistungsaufnahme; bei der Besichtigung prüfen wir Absicherung und Kabelquerschnitt."],
  ],
  sss: [
    [
      "Wozu dient ein Torluftschleier?",
      "Ein Torluftschleier bläst einen kräftigen Luftstrom von oberhalb der Tür nach unten und bildet so bei geöffneter Tür eine unsichtbare Barriere zwischen innen und außen. Dadurch bleibt im Winter die Wärme und im Sommer die gekühlte Luft im Raum, Zugluft an der Tür nimmt ab und Betriebe können ihre Türen offen lassen.",
    ],
    [
      "Spart ein Torluftschleier Energie?",
      "Ja. Weil weniger konditionierte Luft durch die Tür entweicht, laufen Klimaanlage und Heizung weniger. In Betrieben, deren Türen den ganzen Tag auf- und zugehen, wie Geschäfte, Restaurants und Supermärkte, ist die Einsparung deutlicher.",
    ],
    [
      "Soll ich einen Torluftschleier mit oder ohne Heizung wählen?",
      "Wird der Raum bereits durch Klimaanlage oder Zentralheizung gut beheizt, kann ein Modell ohne Heizung genügen. Soll auch der Eingangsbereich im Winter erwärmt werden, wählt man ein Modell mit Heizung. Da diese mehr elektrische Leistung aufnehmen, werden Absicherung und Kabelquerschnitt bei der Besichtigung geprüft.",
    ],
    [
      "Wie wird die Länge des Torluftschleiers gewählt?",
      "Der Torluftschleier sollte so lang wie die Türbreite oder etwas länger sein; deckt der Luftstrom nicht die ganze Tür ab, entweicht Luft an den Rändern. Niva-Modelle gibt es je nach Serie in Längen von 85 cm bis 250 cm; bei breiteren Türen werden mehrere Geräte nebeneinander montiert.",
    ],
    [
      "In welcher Höhe kann ein Torluftschleier montiert werden?",
      "Die Montagehöhe bestimmt die Serie. Bei Niva-Modellen ohne Heizung eignet sich Linda bis 3 m, Smart Kaset bis 3,8 m, Life bis 4 m, die Industrieausführung Lena bis 6 m und Turbo bis 12 m. Bei Modellen mit Heizung sind die Höhen etwas geringer (z. B. Linda 2,5 m, Life 3,5 m).",
    ],
    [
      "Was tun, wenn über der Tür kein Platz ist?",
      "In Räumen mit abgehängter Decke bietet das Deckeneinbaumodell Smart Kaset eine unsichtbare Lösung. Ist über der Tür gar kein Platz, wird das vertikale Niva-Modell senkrecht neben der Tür montiert.",
    ],
  ],
  ld: {
    anaSayfa: "Startseite",
    urunler: "Produkte",
    sayfa: "Torluftschleier",
    nivaGrup: "Niva Torluftschleier",
    kategori: "Torluftschleier",
    nivaAd: (ad: string) => `Niva ${ad} Torluftschleier`,
    olefiniAd: "Olefini Torluftschleier",
  },
  sayfaYolu: "Brotkrümelnavigation",
  rozet: "NIVA · OLEFINI",
  h1: "Torluftschleier",
  altBaslik: "Erwärmte oder gekühlte Luft bleibt im Raum – auch bei geöffneter Tür.",
  giris:
    "Niva- und Olefini-Torluftschleier für Eingänge von Geschäften, Restaurants, Hotels, Einkaufszentren, Lagern und Fabriken. Modelle mit und ohne Heizung; Längen von 85 cm bis 250 cm und Montagehöhen bis 12 m. Wir wählen das passende Modell für Ihre Tür aus, liefern und montieren es.",
  hizli: ["Niva", "Olefini", "Auswahl"],
  teklifDugme: "Preisangebot anfordern →",
  olefiniGirisAlt: "Olefini-Torluftschleier über einer Glaseingangstür",
  olefiniKapiAlt: "Olefini-Torluftschleier über einer zweiflügeligen Holztür",
  nhEtiket: "WARUM EIN TORLUFTSCHLEIER",
  nhBaslik: "Wozu dient ein Torluftschleier?",
  nhMetin:
    "Ein Torluftschleier bläst einen kräftigen Luftstrom von oberhalb der Tür nach unten. Diese unsichtbare Barriere verringert den Luftaustausch zwischen innen und außen.",
  nvEtiket: "NIVA",
  nvBaslik: "Niva-Torluftschleier",
  nvMetin:
    "6 Serien in Standard-, Gewerbe-, Deckeneinbau-, Industrie- und Vertikalausführung. Die Serien gibt es mit und ohne Heizung (Turbo nur ohne Heizung).",
  cihaz: "Gerät",
  boy: "Länge",
  takilabilir: "Abdeckung",
  takilabilirYukseklik: "Montagehöhe",
  dipnot: "* Maximale Montagehöhe für Modell ohne / mit Heizung.",
  olEtiket: "OLEFINI",
  olBaslik: "Olefini-Torluftschleier",
  olMetin:
    "Mit elegantem Design und digitalem Bedienfeld fügen sich Olefini-Torluftschleier harmonisch in die Einrichtung von Geschäfts-, Hotel-, Restaurant- und Büroeingängen ein. Wir bestimmen das passende Modell nach Türmaß und Montagehöhe und erstellen ein Angebot.",
  olDugme: "Angebot für Olefini anfordern →",
  scEtiket: "AUSWAHL",
  scBaslik: "4 Kriterien für den richtigen Torluftschleier",
  scYazi: "Unser Artikel mit ausführlicheren Tipps zu Auswahl und Montage:",
  yaziAdi: "Was ist ein Torluftschleier, wozu dient er und wie wählt man ihn aus?",
  sssBaslik: "Häufige Fragen zu Torluftschleiern",
  ctaEtiket: "LIEFERUNG · BESICHTIGUNG · MONTAGE",
  ctaBaslik: "Lassen Sie uns gemeinsam den passenden Torluftschleier für Ihre Tür wählen",
  ctaMaddeler: [
    "• Modellauswahl nach Türmaß und Montagehöhe",
    "• Prüfung der elektrischen Versorgung bei Modellen mit Heizung",
    "• Montage, Anschluss der Steuerung und Inbetriebnahme",
  ],
  kutuBaslik: "Preisangebot für Torluftschleier erhalten.",
  kutuMetin:
    "Teilen Sie uns Türbreite, Montagehöhe und Ihren Wunsch mit oder ohne Heizung mit – wir erstellen ein Angebot mit Niva- und Olefini-Optionen.",
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
    alternates: dilAlternatifleri(dil, "/hava-perdesi"),
    openGraph: {
      title: t.ogBaslik,
      description: t.ogAciklama,
      url: `${SITE}${yol(dil, "/hava-perdesi")}`,
      images: [{ url: "/og/hava-perdesi.jpg", width: 1200, height: 630, alt: t.ogAlt }],
    },
  };
}

export default function HavaPerdesiPage() {
  const dil = dilAl();
  const t = METIN[dil];
  const y = (h: string) => yol(dil, h);
  const SAYFA = `${SITE}${y("/hava-perdesi")}`;
  const NIVA = t.niva;

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
              "@id": `${SAYFA}#niva`,
              name: t.ld.nivaGrup,
              brand: { "@type": "Brand", name: "Niva" },
              category: t.ld.kategori,
              url: `${SAYFA}#niva`,
              hasVariant: NIVA.map((s) => ({
                "@type": "Product",
                name: t.ld.nivaAd(s.ad),
                brand: { "@type": "Brand", name: "Niva" },
                image: `${SITE}/hava-perdesi/niva-${s.gorsel}.jpg`,
                description: `${s.tip}. ${s.not}.`,
              })),
            },
            {
              "@type": "Product",
              "@id": `${SAYFA}#olefini`,
              name: t.ld.olefiniAd,
              brand: { "@type": "Brand", name: "Olefini" },
              category: t.ld.kategori,
              image: `${SITE}/hava-perdesi/olefini-giris.jpg`,
              url: `${SAYFA}#olefini`,
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
                {(["#niva", "#olefini", "#secim"] as const).map((h, i) => (
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
            <div className="relative w-full aspect-[768/633] rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100">
              <Image src="/hava-perdesi/olefini-giris.jpg" alt={t.olefiniGirisAlt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          </div>
        </section>

        {/* 2. NEDEN HAVA PERDESİ */}
        <section className="py-14 md:py-16">
          <div className="max-w-7xl mx-auto px-6 space-y-8">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.nhEtiket}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.nhBaslik}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.nhMetin}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.neden.map(([baslik, metin]) => (
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
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.nvEtiket}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.nvBaslik}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.nvMetin}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {NIVA.map((s, i) => (
                <article key={s.ad} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                  <div className="relative aspect-[720/396] bg-white">
                    <Image src={`/hava-perdesi/niva-${s.gorsel}.jpg`} alt={t.ld.nivaAd(s.ad)} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" className="object-contain" />
                  </div>
                  <div className="p-4 space-y-2 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-lg font-bold text-slate-900">Niva {s.ad}</h3>
                      <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wide">{s.tip}</span>
                    </div>
                    <p className="text-xs text-slate-600">{s.not}</p>
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs pt-1">
                      <dt className="text-slate-500">{NIVA_ANAHTAR[i] === "Dikey" ? t.cihaz : t.boy}</dt>
                      <dd className="text-right font-semibold text-slate-800">{s.boy}</dd>
                      <dt className="text-slate-500">{NIVA_ANAHTAR[i] === "Dikey" ? t.takilabilir : NIVA_ANAHTAR[i] === "Turbo" ? t.takilabilirYukseklik : `${t.takilabilirYukseklik}*`}</dt>
                      <dd className="text-right font-semibold text-slate-800">{s.yukseklik}</dd>
                    </dl>
                  </div>
                </article>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">{t.dipnot}</p>
          </div>
        </section>

        {/* 4. OLEFİNİ */}
        <section id="olefini" className="scroll-mt-28 py-14 md:py-16">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.olEtiket}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.olBaslik}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.olMetin}
              </p>
              <Link href={y("/iletisim")} className="inline-block px-6 py-3 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-teal-700 transition-colors">
                {t.olDugme}
              </Link>
            </div>
            <div className="lg:col-span-3 grid grid-cols-2 gap-4">
              <div className="relative aspect-[768/633] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <Image src="/hava-perdesi/olefini-giris.jpg" alt={t.olefiniGirisAlt} fill sizes="(min-width: 1024px) 28vw, 45vw" className="object-cover" />
              </div>
              <div className="relative aspect-[768/633] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <Image src="/hava-perdesi/olefini-kapi.jpg" alt={t.olefiniKapiAlt} fill sizes="(min-width: 1024px) 28vw, 45vw" className="object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* 5. SEÇİM */}
        <section id="secim" className="scroll-mt-28 py-14 md:py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 space-y-8">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.scEtiket}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.scBaslik}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.secim.map(([baslik, metin], i) => (
                <div key={baslik} className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <p className="text-2xl font-bold text-teal-700">{i + 1}</p>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{baslik}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{metin}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              {t.scYazi}{" "}
              <Link href={y("/blog/hava-perdesi-nedir-nasil-secilir")} className="text-teal-700 underline underline-offset-2">
                {t.yaziAdi}
              </Link>
            </p>
          </div>
        </section>

        {/* 6. SIK SORULAN SORULAR */}
        <SikSorulanSorular
          baslik={t.sssBaslik}
          sss={t.sss}
          ilgili={[{ href: "/blog/hava-perdesi-nedir-nasil-secilir", ad: t.yaziAdi }]}
          dil={dil}
        />

        {/* 7. CTA */}
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
