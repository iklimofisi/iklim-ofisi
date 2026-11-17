import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { JsonLd, SITE } from "@/components/YapisalVeri";
import { dilAlternatifleri, yol, type Dil } from "@/lib/dil";
import { dilAl } from "@/lib/dil-sunucu";

export const dynamic = "force-dynamic";

// AIRNEX SAYFASI METİNLERİ (Türkçe / English / Deutsch)
const tr = {
  metaBaslik: "AIRNEX Elektrostatik Hücreli Aspiratör — Mutfak Havalandırma",
  metaAciklama:
    "AIRNEX elektrostatik hücreli aspiratör: restoran, otel ve endüstriyel mutfak egzozlarında yağ aerosolleri, duman ve ince partiküllerin kontrolü için modüler filtrasyon sistemi. Projelendirme ve anahtar teslim kurulum.",
  ogBaslik: "AIRNEX Elektrostatik Hücreli Aspiratör | İklim Ofisi",
  ogAciklama:
    "Endüstriyel mutfaklar için elektrostatik filtrasyonlu egzoz çözümü. Daha temiz egzoz havası, verimli filtrasyon, kolay servis.",
  ogAlt: "AIRNEX elektrostatik hücreli aspiratör",
  ozellikler: [
    "Modüler ve servis erişimi düşünülmüş gövde yapısı",
    "Çıkarılabilir elektrostatik toplama hücreleri",
    "Mutfak egzozu ve uygun proses egzozları için projelendirilebilir yapı",
    "Fan ve otomasyon bileşenleriyle birlikte sistem çözümü",
    "Kullanım yoğunluğuna göre planlanabilen periyodik bakım",
  ],
  adimlar: [
    { no: "01", baslik: "Ön Filtre", metin: "Büyük yağ damlacıkları ve kaba partiküller ilk kademede tutulur." },
    { no: "02", baslik: "İyonizasyon", metin: "İnce partiküller elektriksel olarak yüklenir." },
    { no: "03", baslik: "Toplama Hücresi", metin: "Yüklü partiküller kolektör plakalarına çekilerek tutulur." },
    { no: "04", baslik: "Fan / Çıkış", metin: "Filtrelenmiş hava, sistem fanı üzerinden egzoza gönderilir." },
  ],
  uygulamalar: [
    { alan: "Restoran & endüstriyel mutfak", amac: "Pişirme kaynaklı yağ aerosolleri ve dumanın kontrolüne yardımcı filtrasyon" },
    { alan: "Izgara / mangal", amac: "Yoğun duman ve yağ yükü bulunan egzoz hatları" },
    { alan: "Fritöz / kızartma", amac: "Yağ buharı ve ince partikül kontrolü" },
    { alan: "Fırın / pişirme hatları", amac: "Uygun proses koşullarında partikül ve duman kontrolü" },
    { alan: "Proses egzozu", amac: "Partikül ağırlıklı, uygun sıcaklık ve kimyasal şartlardaki uygulamalar" },
  ],
  sistem: ["Davlumbaz", "Ön Filtre", "ESP Hücre", "Koku Kademesi (ops.)", "Fan"],
  bakim: [
    "Bakım öncesi enerji kesilir ve yüksek gerilim bölümünün güvenli olduğu doğrulanır.",
    "Ön filtre ve elektrostatik hücreler kirlilik durumuna göre kontrol edilir.",
    "Temizlenen hücrelerin tamamen kuruduğu doğrulanır.",
    "Elektrik bağlantıları, izolatörler ve güç ünitesi kontrolleri yetkili personel tarafından yapılır.",
  ],
  projeBilgileri: [
    { parametre: "Hava debisi", birim: "m³/h" },
    { parametre: "Toplam basınç", birim: "Pa" },
    { parametre: "Kanal ölçüsü", birim: "mm × mm" },
    { parametre: "Egzoz sıcaklığı", birim: "°C" },
    { parametre: "Pişirme / proses tipi", birim: "Izgara, fritöz, ocak, fırın" },
    { parametre: "Çalışma süresi", birim: "saat/gün" },
  ],
  ld: {
    ad: "AIRNEX Elektrostatik Hücreli Aspiratör",
    kategori: "Endüstriyel mutfak havalandırma / elektrostatik filtrasyon",
    aciklama:
      "Restoran, otel ve endüstriyel mutfak egzozlarında yağ aerosolleri, duman ve ince partiküllerin kontrolü için ön filtre, elektrostatik hücre ve fan kademeli modüler aspiratör sistemi.",
  },
  rozet: "MUTFAK HAVALANDIRMA · MARKAMIZ",
  h1: " Elektrostatik Hücreli Aspiratör",
  altBaslik: "Daha temiz egzoz havası için elektrostatik filtrasyon teknolojisi.",
  giris:
    "Restoran, otel ve endüstriyel mutfaklarda pişirme kaynaklı yağ aerosolleri, duman ve ince partiküllerin kontrolüne yardımcı olan; ön filtre, elektrostatik hücre, fan ve opsiyonel ek filtrasyon kademeleriyle projeye özel kurgulanan modüler aspiratör sistemi.",
  degerler: ["Temiz Hava", "Verimli Filtrasyon", "Güvenilir Performans", "Uzun Ömürlü Sistem"],
  teklifDugme: "Mutfağınız İçin Teklif İsteyin →",
  katalogDugme: "Kataloğu İndir (PDF)",
  projeLink: "Proje için gerekli bilgiler ↓",
  heroAlt: "Endüstriyel mutfakta AIRNEX elektrostatik hücreli aspiratör ünitesi",
  urEtiket: "ÜRÜN",
  urBaslik: "Elektrostatik hücreli aspiratör nedir?",
  urMetin:
    "AIRNEX, aspirasyon sistemi içerisinde bulunan yağ aerosolleri, duman ve ince partiküllerin kontrolüne yardımcı olmak amacıyla elektrostatik filtrasyon hücreleri kullanan bir sistemdir. Sistem mimarisi, uygulamaya göre ön filtre, elektrostatik hücre, fan ve opsiyonel ek filtrasyon kademeleriyle oluşturulabilir.",
  oneCikan: "Öne çıkan özellikler",
  kesitAlt: "AIRNEX modüler gövde ve çıkarılabilir hücre yapısı",
  cpEtiket: "ÇALIŞMA PRENSİBİ",
  cpBaslik: "Dört kademede temiz egzoz havası",
  prensipAlt: "AIRNEX çalışma prensibi: ön filtre, iyonizasyon hücresi, toplama hücresi ve fan",
  uaEtiket: "UYGULAMA ALANLARI",
  uaBaslik: "Nerelerde kullanılır?",
  scEtiket: "SİSTEM ÇÖZÜMÜ",
  scBaslik: "Tipik çok kademeli egzoz mimarisi",
  scMetin: "Davlumbazdan fana kadar tüm hattı tek elden projelendirip kuruyoruz.",
  kokuBaslik: "Koku kontrolü hakkında",
  kokuMetin:
    "Elektrostatik filtrasyon esas olarak partikül fazındaki kirleticilerin kontrolüne yöneliktir. Gaz fazındaki koku bileşenleri için tek başına yeterli olmayabilir. Gerektiğinde aktif karbon, UV veya başka uygun bir gaz faz çözümü ayrıca projelendirilir.",
  bakimBaslik: "Hücre yapısı & bakım",
  bakimMetin:
    "AIRNEX hücreli yapı, elektrostatik filtrasyon bölümünün bakım ve temizlik amacıyla erişilebilir olmasını hedefleyen modüler bir tasarıma sahiptir.",
  bakimNot: "Bakım aralıkları uygulamanın yağ/duman yüküne ve çalışma süresine göre değişir; üretici prosedürü esas alınır.",
  pbEtiket: "TEKNİK SEÇİM & BOYUTLANDIRMA",
  pbBaslik: "Proje için gerekli bilgiler",
  pbMetin:
    "Elektrostatik filtre performansı; hava debisi, filtre yüzey hızı, partikül yoğunluğu, sıcaklık ve sistem koşulları gibi birden fazla parametreye bağlıdır. Aşağıdaki bilgileri paylaşmanız halinde mühendislerimiz uygun AIRNEX modelini seçip teklifinizi hazırlar.",
  parametre: "Parametre",
  birimOrnek: "Birim / Örnek",
  kutuBaslik: "Mutfağınız için doğru AIRNEX çözümünü birlikte seçelim.",
  kutuMetin:
    "Mutfak projenizi, davlumbaz ölçülerini veya mevcut egzoz hattı bilgilerini gönderin; keşif, boyutlandırma ve teklif sürecini mühendislerimiz yürütsün.",
  kutuDugme: "Ücretsiz Keşif & Teklif İsteyin →",
  kutuKatalog: "AIRNEX Kataloğunu İndir (PDF) ↓",
  kutuNot: "İletişim formuna proje dosyası (PDF, DWG, görsel) ekleyebilirsiniz.",
};

type Metin = typeof tr;

const en: Metin = {
  metaBaslik: "AIRNEX Electrostatic Cell Exhaust Unit — Kitchen Ventilation",
  metaAciklama:
    "AIRNEX electrostatic cell exhaust unit: a modular filtration system to control grease aerosols, smoke and fine particles in restaurant, hotel and commercial kitchen exhaust. Design and turnkey installation.",
  ogBaslik: "AIRNEX Electrostatic Cell Exhaust Unit | İklim Ofisi",
  ogAciklama: "Exhaust solution with electrostatic filtration for commercial kitchens. Cleaner exhaust air, efficient filtration, easy servicing.",
  ogAlt: "AIRNEX electrostatic cell exhaust unit",
  ozellikler: [
    "Modular casing designed for service access",
    "Removable electrostatic collector cells",
    "Can be designed for kitchen exhaust and suitable process exhaust",
    "System solution together with fan and control components",
    "Periodic maintenance planned according to usage intensity",
  ],
  adimlar: [
    { no: "01", baslik: "Pre-Filter", metin: "Large grease droplets and coarse particles are captured in the first stage." },
    { no: "02", baslik: "Ionisation", metin: "Fine particles are electrically charged." },
    { no: "03", baslik: "Collector Cell", metin: "Charged particles are attracted to and held on the collector plates." },
    { no: "04", baslik: "Fan / Outlet", metin: "The filtered air is discharged to the exhaust via the system fan." },
  ],
  uygulamalar: [
    { alan: "Restaurants & commercial kitchens", amac: "Filtration that helps control grease aerosols and smoke from cooking" },
    { alan: "Grills / barbecues", amac: "Exhaust lines with heavy smoke and grease loads" },
    { alan: "Fryers / deep frying", amac: "Control of grease vapour and fine particles" },
    { alan: "Ovens / cooking lines", amac: "Particle and smoke control under suitable process conditions" },
    { alan: "Process exhaust", amac: "Particle-dominated applications with suitable temperature and chemical conditions" },
  ],
  sistem: ["Hood", "Pre-Filter", "ESP Cell", "Odour Stage (opt.)", "Fan"],
  bakim: [
    "Before maintenance, power is disconnected and the high-voltage section is verified to be safe.",
    "The pre-filter and electrostatic cells are checked according to their degree of contamination.",
    "Cleaned cells are verified to be completely dry.",
    "Electrical connections, insulators and the power unit are checked by authorised personnel.",
  ],
  projeBilgileri: [
    { parametre: "Airflow", birim: "m³/h" },
    { parametre: "Total pressure", birim: "Pa" },
    { parametre: "Duct size", birim: "mm × mm" },
    { parametre: "Exhaust temperature", birim: "°C" },
    { parametre: "Cooking / process type", birim: "Grill, fryer, hob, oven" },
    { parametre: "Operating time", birim: "hours/day" },
  ],
  ld: {
    ad: "AIRNEX Electrostatic Cell Exhaust Unit",
    kategori: "Commercial kitchen ventilation / electrostatic filtration",
    aciklama:
      "Modular exhaust unit with pre-filter, electrostatic cell and fan stages to control grease aerosols, smoke and fine particles in restaurant, hotel and commercial kitchen exhaust.",
  },
  rozet: "KITCHEN VENTILATION · OUR BRAND",
  h1: " Electrostatic Cell Exhaust Unit",
  altBaslik: "Electrostatic filtration technology for cleaner exhaust air.",
  giris:
    "A modular exhaust unit, configured specifically for each project with pre-filter, electrostatic cell, fan and optional additional filtration stages, that helps control grease aerosols, smoke and fine particles from cooking in restaurant, hotel and commercial kitchens.",
  degerler: ["Clean Air", "Efficient Filtration", "Reliable Performance", "Long-Life System"],
  teklifDugme: "Request a Quote for Your Kitchen →",
  katalogDugme: "Download Catalogue (PDF, Turkish)",
  projeLink: "Information required for your project ↓",
  heroAlt: "AIRNEX electrostatic cell exhaust unit in a commercial kitchen",
  urEtiket: "PRODUCT",
  urBaslik: "What is an electrostatic cell exhaust unit?",
  urMetin:
    "AIRNEX is a system that uses electrostatic filtration cells to help control grease aerosols, smoke and fine particles in the extraction system. Depending on the application, the system architecture can be built with pre-filter, electrostatic cell, fan and optional additional filtration stages.",
  oneCikan: "Key features",
  kesitAlt: "AIRNEX modular casing and removable cell structure",
  cpEtiket: "WORKING PRINCIPLE",
  cpBaslik: "Clean exhaust air in four stages",
  prensipAlt: "AIRNEX working principle: pre-filter, ionisation cell, collector cell and fan",
  uaEtiket: "APPLICATIONS",
  uaBaslik: "Where is it used?",
  scEtiket: "SYSTEM SOLUTION",
  scBaslik: "Typical multi-stage exhaust architecture",
  scMetin: "We design and install the entire line, from the hood to the fan, from a single source.",
  kokuBaslik: "About odour control",
  kokuMetin:
    "Electrostatic filtration is mainly intended to control particulate-phase pollutants. On its own it may not be sufficient for gas-phase odour compounds. Where necessary, activated carbon, UV or another suitable gas-phase solution is designed separately.",
  bakimBaslik: "Cell structure & maintenance",
  bakimMetin:
    "The AIRNEX cell structure has a modular design intended to keep the electrostatic filtration section accessible for maintenance and cleaning.",
  bakimNot: "Maintenance intervals vary according to the grease/smoke load and operating time of the application; the manufacturer's procedure applies.",
  pbEtiket: "TECHNICAL SELECTION & SIZING",
  pbBaslik: "Information required for your project",
  pbMetin:
    "Electrostatic filter performance depends on several parameters such as airflow, filter face velocity, particle concentration, temperature and system conditions. If you share the information below, our engineers will select the right AIRNEX model and prepare your quote.",
  parametre: "Parameter",
  birimOrnek: "Unit / Example",
  kutuBaslik: "Let's choose the right AIRNEX solution for your kitchen together.",
  kutuMetin:
    "Send us your kitchen drawings, hood dimensions or existing exhaust line details; our engineers will handle the site survey, sizing and quotation.",
  kutuDugme: "Request a Free Site Survey & Quote →",
  kutuKatalog: "Download the AIRNEX Catalogue (PDF, Turkish) ↓",
  kutuNot: "You can attach a project file (PDF, DWG, image) to the contact form.",
};

const de: Metin = {
  metaBaslik: "AIRNEX Abluftgerät mit Elektrofilterzelle — Küchenlüftung",
  metaAciklama:
    "AIRNEX Abluftgerät mit Elektrofilterzelle: modulares Filtersystem zur Kontrolle von Fettaerosolen, Rauch und Feinstaub in der Abluft von Restaurant-, Hotel- und Gewerbeküchen. Planung und schlüsselfertige Installation.",
  ogBaslik: "AIRNEX Abluftgerät mit Elektrofilterzelle | İklim Ofisi",
  ogAciklama: "Abluftlösung mit elektrostatischer Filtration für Gewerbeküchen. Sauberere Abluft, effiziente Filtration, einfache Wartung.",
  ogAlt: "AIRNEX Abluftgerät mit Elektrofilterzelle",
  ozellikler: [
    "Modulares, wartungsfreundlich zugängliches Gehäuse",
    "Herausnehmbare elektrostatische Abscheidezellen",
    "Planbar für Küchenabluft und geeignete Prozessabluft",
    "Systemlösung zusammen mit Ventilator- und Regelungskomponenten",
    "Regelmäßige Wartung nach Nutzungsintensität planbar",
  ],
  adimlar: [
    { no: "01", baslik: "Vorfilter", metin: "Große Fetttröpfchen und grobe Partikel werden in der ersten Stufe zurückgehalten." },
    { no: "02", baslik: "Ionisierung", metin: "Feine Partikel werden elektrisch aufgeladen." },
    { no: "03", baslik: "Abscheidezelle", metin: "Die geladenen Partikel werden von den Kollektorplatten angezogen und festgehalten." },
    { no: "04", baslik: "Ventilator / Austritt", metin: "Die gefilterte Luft wird über den Systemventilator in die Abluft geführt." },
  ],
  uygulamalar: [
    { alan: "Restaurants & Gewerbeküchen", amac: "Filtration zur Kontrolle von Fettaerosolen und Rauch aus dem Kochbetrieb" },
    { alan: "Grill / Holzkohlegrill", amac: "Abluftstrecken mit hoher Rauch- und Fettbelastung" },
    { alan: "Fritteuse / Frittieren", amac: "Kontrolle von Fettdampf und Feinstaub" },
    { alan: "Öfen / Garlinien", amac: "Partikel- und Rauchkontrolle unter geeigneten Prozessbedingungen" },
    { alan: "Prozessabluft", amac: "Partikeldominierte Anwendungen bei geeigneten Temperatur- und Chemiebedingungen" },
  ],
  sistem: ["Haube", "Vorfilter", "ESP-Zelle", "Geruchsstufe (opt.)", "Ventilator"],
  bakim: [
    "Vor der Wartung wird die Stromversorgung getrennt und die Spannungsfreiheit des Hochspannungsteils geprüft.",
    "Vorfilter und Elektrofilterzellen werden je nach Verschmutzungsgrad geprüft.",
    "Es wird geprüft, dass die gereinigten Zellen vollständig trocken sind.",
    "Elektrische Anschlüsse, Isolatoren und das Netzteil werden von autorisiertem Personal geprüft.",
  ],
  projeBilgileri: [
    { parametre: "Luftmenge", birim: "m³/h" },
    { parametre: "Gesamtdruck", birim: "Pa" },
    { parametre: "Kanalmaß", birim: "mm × mm" },
    { parametre: "Ablufttemperatur", birim: "°C" },
    { parametre: "Koch- / Prozessart", birim: "Grill, Fritteuse, Herd, Ofen" },
    { parametre: "Betriebszeit", birim: "Stunden/Tag" },
  ],
  ld: {
    ad: "AIRNEX Abluftgerät mit Elektrofilterzelle",
    kategori: "Gewerbeküchenlüftung / elektrostatische Filtration",
    aciklama:
      "Modulares Abluftgerät mit Vorfilter-, Elektrofilterzellen- und Ventilatorstufe zur Kontrolle von Fettaerosolen, Rauch und Feinstaub in der Abluft von Restaurant-, Hotel- und Gewerbeküchen.",
  },
  rozet: "KÜCHENLÜFTUNG · UNSERE MARKE",
  h1: " Abluftgerät mit Elektrofilterzelle",
  altBaslik: "Elektrostatische Filtertechnik für sauberere Abluft.",
  giris:
    "Ein modulares Abluftgerät, projektspezifisch mit Vorfilter, Elektrofilterzelle, Ventilator und optionalen zusätzlichen Filterstufen konfiguriert, das bei der Kontrolle von Fettaerosolen, Rauch und Feinstaub aus dem Kochbetrieb in Restaurant-, Hotel- und Gewerbeküchen hilft.",
  degerler: ["Saubere Luft", "Effiziente Filtration", "Zuverlässige Leistung", "Langlebiges System"],
  teklifDugme: "Angebot für Ihre Küche anfordern →",
  katalogDugme: "Katalog herunterladen (PDF, Türkisch)",
  projeLink: "Für Ihr Projekt benötigte Angaben ↓",
  heroAlt: "AIRNEX Abluftgerät mit Elektrofilterzelle in einer Gewerbeküche",
  urEtiket: "PRODUKT",
  urBaslik: "Was ist ein Abluftgerät mit Elektrofilterzelle?",
  urMetin:
    "AIRNEX ist ein System, das elektrostatische Filterzellen einsetzt, um bei der Kontrolle von Fettaerosolen, Rauch und Feinstaub im Absaugsystem zu helfen. Je nach Anwendung kann die Systemarchitektur aus Vorfilter, Elektrofilterzelle, Ventilator und optionalen zusätzlichen Filterstufen aufgebaut werden.",
  oneCikan: "Wichtige Merkmale",
  kesitAlt: "AIRNEX modulares Gehäuse und herausnehmbare Zellen",
  cpEtiket: "FUNKTIONSPRINZIP",
  cpBaslik: "Saubere Abluft in vier Stufen",
  prensipAlt: "AIRNEX Funktionsprinzip: Vorfilter, Ionisierungszelle, Abscheidezelle und Ventilator",
  uaEtiket: "EINSATZBEREICHE",
  uaBaslik: "Wo wird es eingesetzt?",
  scEtiket: "SYSTEMLÖSUNG",
  scBaslik: "Typische mehrstufige Abluftarchitektur",
  scMetin: "Wir planen und installieren die gesamte Strecke von der Haube bis zum Ventilator aus einer Hand.",
  kokuBaslik: "Zur Geruchskontrolle",
  kokuMetin:
    "Die elektrostatische Filtration dient hauptsächlich der Kontrolle partikelförmiger Schadstoffe. Für gasförmige Geruchsstoffe reicht sie allein unter Umständen nicht aus. Bei Bedarf wird zusätzlich Aktivkohle, UV oder eine andere geeignete Gasphasenlösung geplant.",
  bakimBaslik: "Zellenaufbau & Wartung",
  bakimMetin:
    "Der Zellenaufbau von AIRNEX ist modular gestaltet, damit der elektrostatische Filterteil für Wartung und Reinigung zugänglich bleibt.",
  bakimNot: "Die Wartungsintervalle hängen von der Fett-/Rauchbelastung und der Betriebszeit ab; maßgeblich ist das Verfahren des Herstellers.",
  pbEtiket: "TECHNISCHE AUSWAHL & AUSLEGUNG",
  pbBaslik: "Für Ihr Projekt benötigte Angaben",
  pbMetin:
    "Die Leistung eines Elektrofilters hängt von mehreren Parametern ab, etwa Luftmenge, Anströmgeschwindigkeit, Partikelkonzentration, Temperatur und Systembedingungen. Wenn Sie uns die folgenden Angaben mitteilen, wählen unsere Ingenieure das passende AIRNEX-Modell aus und erstellen Ihr Angebot.",
  parametre: "Parameter",
  birimOrnek: "Einheit / Beispiel",
  kutuBaslik: "Lassen Sie uns gemeinsam die richtige AIRNEX-Lösung für Ihre Küche wählen.",
  kutuMetin:
    "Senden Sie uns Ihre Küchenpläne, Haubenmaße oder Angaben zur bestehenden Abluftstrecke – unsere Ingenieure übernehmen Besichtigung, Auslegung und Angebot.",
  kutuDugme: "Kostenlose Besichtigung & Angebot anfordern →",
  kutuKatalog: "AIRNEX-Katalog herunterladen (PDF, Türkisch) ↓",
  kutuNot: "Sie können dem Kontaktformular eine Projektdatei (PDF, DWG, Bild) anhängen.",
};

const METIN: Record<Dil, Metin> = { tr, en, de };

export function generateMetadata(): Metadata {
  const dil = dilAl();
  const t = METIN[dil];
  return {
    title: t.metaBaslik,
    description: t.metaAciklama,
    alternates: dilAlternatifleri(dil, "/airnex"),
    openGraph: {
      title: t.ogBaslik,
      description: t.ogAciklama,
      url: `https://iklimofisi.com${yol(dil, "/airnex")}`,
      images: [{ url: "/airnex/airnex-mutfak.jpg", width: 1024, height: 640, alt: t.ogAlt }],
    },
  };
}

function Tik() {
  return (
    <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
      ✓
    </span>
  );
}

export default function AirnexPage() {
  const dil = dilAl();
  const t = METIN[dil];
  const y = (h: string) => yol(dil, h);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      <Header />
      <JsonLd
        veri={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: t.ld.ad,
          brand: { "@type": "Brand", name: "AIRNEX" },
          category: t.ld.kategori,
          description: t.ld.aciklama,
          image: [`${SITE}/airnex/airnex-mutfak.jpg`, `${SITE}/airnex/airnex-kesit.jpg`],
          url: `${SITE}${y("/airnex")}`,
          seller: { "@id": `${SITE}/#isletme` },
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
                AIRNEX<sup className="text-base align-super">®</sup>{t.h1}
              </h1>
              <p className="text-lg font-semibold text-teal-700">
                {t.altBaslik}
              </p>
              <p className="text-base text-slate-600 leading-relaxed">
                {t.giris}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {t.degerler.map((d) => (
                  <div key={d} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center font-bold text-slate-700">
                    {d}
                  </div>
                ))}
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <Link
                  href={y("/iletisim")}
                  className="px-8 py-4 rounded-lg bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 shadow-sm transition-all text-center"
                >
                  {t.teklifDugme}
                </Link>
                <a
                  href="/kataloglar/airnex-elektrostatik-hucreli-aspirator-katalog.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  download="AIRNEX-Elektrostatik-Hucreli-Aspirator-Katalogu.pdf"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-all text-center"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                  </svg>
                  {t.katalogDugme}
                </a>
              </div>
              <div>
                <a href="#proje-bilgileri" className="text-sm font-semibold text-teal-700 hover:underline">
                  {t.projeLink}
                </a>
              </div>
            </div>

            <div className="relative w-full aspect-[8/5] rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900">
              <Image
                src="/airnex/airnex-mutfak.jpg"
                alt={t.heroAlt}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* 2. NEDİR & ÖZELLİKLER */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.urEtiket}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.urBaslik}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.urMetin}
              </p>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">{t.oneCikan}</h3>
                {t.ozellikler.map((o) => (
                  <div key={o} className="flex items-start gap-2 text-xs text-slate-700">
                    <Tik />
                    <span>{o}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
              <Image
                src="/airnex/airnex-kesit.jpg"
                alt={t.kesitAlt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* 3. ÇALIŞMA PRENSİBİ */}
        <section className="py-16 md:py-20 bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-6 space-y-10">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">{t.cpEtiket}</p>
              <h2 className="text-2xl sm:text-3xl font-bold">{t.cpBaslik}</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {t.adimlar.map((a) => (
                <div key={a.no} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
                  <span className="inline-flex w-10 h-10 rounded-lg bg-teal-600 text-white items-center justify-center font-mono font-bold text-sm">
                    {a.no}
                  </span>
                  <h3 className="font-bold text-white">{a.baslik}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{a.metin}</p>
                </div>
              ))}
            </div>

            <div className="relative w-full aspect-[2/1] max-w-4xl mx-auto rounded-2xl overflow-hidden bg-white">
              <Image
                src="/airnex/airnex-calisma-prensibi.jpg"
                alt={t.prensipAlt}
                fill
                sizes="(min-width: 1024px) 56rem, 100vw"
                className="object-contain"
              />
            </div>
          </div>
        </section>

        {/* 4. UYGULAMA ALANLARI */}
        <section className="py-16 md:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 space-y-8">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.uaEtiket}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.uaBaslik}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {t.uygulamalar.map((u) => (
                <div key={u.alan} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2 hover:border-teal-500/40 transition-colors">
                  <h3 className="font-bold text-slate-900 text-sm">{u.alan}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{u.amac}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. SİSTEM ÇÖZÜMÜ & KOKU KONTROLÜ */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-6 space-y-10">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.scEtiket}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.scBaslik}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.scMetin}
              </p>
            </div>

            <ol className="flex flex-col md:flex-row md:items-stretch gap-3">
              {t.sistem.map((k, i) => (
                <li key={k} className="flex md:flex-1 items-center gap-3">
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 text-center">
                    <span className="block text-[10px] font-mono font-bold text-teal-700">{String(i + 1).padStart(2, "0")}</span>
                    <span className="block text-sm font-bold text-slate-900 mt-1">{k}</span>
                  </div>
                  {i < t.sistem.length - 1 && (
                    <span aria-hidden className="hidden md:inline-block text-teal-600 font-bold">→</span>
                  )}
                </li>
              ))}
            </ol>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <h3 className="font-bold text-slate-900">{t.kokuBaslik}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t.kokuMetin}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <h3 className="font-bold text-slate-900">{t.bakimBaslik}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t.bakimMetin}
                </p>
                <div className="space-y-2">
                  {t.bakim.map((b) => (
                    <div key={b} className="flex items-start gap-2 text-xs text-slate-700">
                      <Tik />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                  {t.bakimNot}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. PROJE İÇİN GEREKLİ BİLGİLER & CTA */}
        <section id="proje-bilgileri" className="py-16 md:py-20 bg-white border-t border-slate-200 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-4">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">{t.pbEtiket}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.pbBaslik}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.pbMetin}
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      <th className="text-left font-bold px-4 py-3">{t.parametre}</th>
                      <th className="text-left font-bold px-4 py-3">{t.birimOrnek}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {t.projeBilgileri.map((p) => (
                      <tr key={p.parametre} className="border-t border-slate-200">
                        <td className="px-4 py-3 font-semibold text-slate-800">{p.parametre}</td>
                        <td className="px-4 py-3 text-slate-600 font-mono">{p.birim}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 space-y-5 shadow-xl lg:sticky lg:top-28">
              <h3 className="text-xl sm:text-2xl font-bold">{t.kutuBaslik}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t.kutuMetin}
              </p>
              <Link
                href={y("/iletisim")}
                className="block w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white text-center font-bold text-sm rounded-lg transition-colors shadow-md"
              >
                {t.kutuDugme}
              </Link>
              <a
                href="/kataloglar/airnex-elektrostatik-hucreli-aspirator-katalog.pdf"
                target="_blank"
                rel="noopener noreferrer"
                download="AIRNEX-Elektrostatik-Hucreli-Aspirator-Katalogu.pdf"
                className="block w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-center font-bold text-sm rounded-lg transition-colors"
              >
                {t.kutuKatalog}
              </a>
              <p className="text-[11px] text-slate-400">
                {t.kutuNot}
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
