import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getSirketAyarlari } from "@/lib/sirket";
import { ISTIRAK_METNI } from "@/lib/kurumsal";
import { dilAlternatifleri, yol, type Dil } from "@/lib/dil";
import { dilAl } from "@/lib/dil-sunucu";

export const dynamic = "force-dynamic";

// HAKKIMIZDA METİNLERİ (Türkçe / English / Deutsch)
const tr = {
  metaBaslik: "Hakkımızda — Mühendislik Kökenli Yönetim",
  metaAciklama:
    "20 yılı aşan saha deneyimi ve mühendislik disipliniyle iklimlendirme, VRF, havalandırma ve mekanik tesisat projeleri yürüten İklim Ofisi ekibini tanıyın.",
  rozet: "MÜHENDİSLİK KÖKENLİ YÖNETİM",
  h1a: "20 Yılı Aşan Saha Deneyimi ve ",
  h1b: "Mühendislik Disiplini.",
  giris:
    "; iklimlendirme, VRF merkezi sistemler, ısı pompaları, havalandırma ve mekanik tesisat alanında mühendislik kökenli yönetim anlayışıyla kurulmuştur. Teorik hesabı 20 yılı aşan şantiye tecrübesiyle birleştirerek projeniz için en doğru iklimi oluşturuyoruz.",
  yEtiket: "YÖNETİM & UZMANLIK",
  yBaslik: "Kurucu Ortaklarımızın Mühendislik Gücü",
  yAlt: "Sektörde 20 yılı devirmiş uzmanlık ve mühendislik yaklaşımıyla her projeye bizzat liderlik ediyoruz.",
  ortaklar: [
    {
      unvan: "Makine Mühendisi",
      rol: "Kurucu Ortak / Kıdemli Mühendis",
      rozet: "20+ Yıl Deneyim",
      metin:
        "İklimlendirme ve mekanik tesisat sektöründe 20 yılı aşkın profesyonel mühendislik ve şantiye yöneticiliği tecrübesine sahiptir. Merkezi VRF/VRV sistemleri, endüstriyel havalandırma tasarımları ve büyük ölçekli mekanik projelerin teknik süreçlerine doğrudan liderlik etmektedir.",
    },
    {
      unvan: "Proje & Uygulama Mühendisi",
      rol: "Kurucu Ortak / Mühendis",
      rozet: "Mühendislik Disiplini",
      metin:
        "AutoCAD ve mekanik projelendirme, hassas ısı kaybı & kazancı hesaplamaları, metraj hazırlığı ve müşteri süreçleri yönetiminden sorumludur. Müşteri ihtiyacına en uygun cihaz seçimi ve şeffaf tekliflerin hazırlanmasını yürütür.",
    },
  ],
  iEtiket: "İLKELERİMİZ",
  iBaslik: "Neden Mühendislik Odaklı Çalışıyoruz?",
  ilkeler: [
    ["01", "Hassas Hesaplama", "Ezbere değil; yapının yönüne, cam yüzeylerine ve kullanım amacına göre gerçek ısı kaybı hesabı yapıyoruz."],
    ["02", "Şeffaf Bütçelendirme", "Sonradan sürpriz maliyet çıkarmayan, kalem kalem detaylandırılmış teknik şartname ve metraj sunuyoruz."],
    ["03", "Kusursuz Tesisat", "Tesisatta izolasyon, boru çapları, azot basınç ve vakumlama testlerini standartlara uygun bizzat denetliyoruz."],
    ["04", "Satış Sonrası Destek", "Sistemi teslim edip gitmiyoruz; 2 yıl tam garanti ve periyodik servis anlaşmalarıyla sisteminizi koruyoruz."],
  ] as [string, string, string][],
  cBaslik: "Projenizde Mühendislik Kalitesini Hissedin.",
  cMetin: "Ücretsiz keşif için ekibimizle iletişime geçin, projenizin kapasite ve bütçe analizini yerinde yapalım.",
  cDugme: "Ücretsiz Keşif İsteyin →",
};

type Metin = typeof tr;

const en: Metin = {
  metaBaslik: "About Us — Engineering-Driven Management",
  metaAciklama:
    "Meet the İklim Ofisi team, delivering air conditioning, VRF, ventilation and mechanical installation projects with more than 20 years of field experience and engineering discipline.",
  rozet: "ENGINEERING-DRIVEN MANAGEMENT",
  h1a: "Over 20 Years of Field Experience and ",
  h1b: "Engineering Discipline.",
  giris:
    " was founded on an engineering-driven management approach in air conditioning, VRF central systems, heat pumps, ventilation and mechanical installation. By combining theoretical calculation with more than 20 years of on-site experience, we create the right climate for your project.",
  yEtiket: "MANAGEMENT & EXPERTISE",
  yBaslik: "The Engineering Strength of Our Founding Partners",
  yAlt: "With more than 20 years of expertise in the sector and an engineering mindset, we personally lead every project.",
  ortaklar: [
    {
      unvan: "Mechanical Engineer",
      rol: "Founding Partner / Senior Engineer",
      rozet: "20+ Years of Experience",
      metin:
        "Has more than 20 years of professional engineering and site management experience in the air conditioning and mechanical installation sector. Directly leads the technical processes of central VRF/VRV systems, industrial ventilation designs and large-scale mechanical projects.",
    },
    {
      unvan: "Project & Site Engineer",
      rol: "Founding Partner / Engineer",
      rozet: "Engineering Discipline",
      metin:
        "Responsible for AutoCAD and mechanical design, precise heat loss & heat gain calculations, quantity take-offs and customer process management. Handles the selection of the most suitable equipment for each customer's needs and the preparation of transparent quotations.",
    },
  ],
  iEtiket: "OUR PRINCIPLES",
  iBaslik: "Why Do We Work With an Engineering Focus?",
  ilkeler: [
    ["01", "Precise Calculation", "No rules of thumb: we carry out a real heat loss calculation based on the building's orientation, glazed surfaces and intended use."],
    ["02", "Transparent Budgeting", "We provide an itemised technical specification and bill of quantities with no surprise costs later on."],
    ["03", "Flawless Installation", "We personally inspect insulation, pipe diameters, nitrogen pressure and vacuum tests in line with the standards."],
    ["04", "After-Sales Support", "We don't just hand over the system and leave; we protect it with a full 2-year warranty and periodic service agreements."],
  ],
  cBaslik: "Experience Engineering Quality in Your Project.",
  cMetin: "Contact our team for a free site survey — we will analyse your project's capacity and budget on site.",
  cDugme: "Request a Free Site Survey →",
};

const de: Metin = {
  metaBaslik: "Über uns — Ingenieurgeprägte Unternehmensführung",
  metaAciklama:
    "Lernen Sie das Team von İklim Ofisi kennen, das Klima-, VRF-, Lüftungs- und Haustechnikprojekte mit über 20 Jahren Praxiserfahrung und ingenieurmäßiger Disziplin umsetzt.",
  rozet: "INGENIEURGEPRÄGTE FÜHRUNG",
  h1a: "Über 20 Jahre Praxiserfahrung und ",
  h1b: "Ingenieursdisziplin.",
  giris:
    " wurde mit einer ingenieurgeprägten Unternehmensführung in den Bereichen Klimatechnik, VRF-Zentralsysteme, Wärmepumpen, Lüftung und Haustechnik gegründet. Indem wir die theoretische Berechnung mit über 20 Jahren Baustellenerfahrung verbinden, schaffen wir das richtige Klima für Ihr Projekt.",
  yEtiket: "FÜHRUNG & EXPERTISE",
  yBaslik: "Die Ingenieurskompetenz unserer Gründungspartner",
  yAlt: "Mit über 20 Jahren Branchenerfahrung und ingenieurmäßigem Denken leiten wir jedes Projekt persönlich.",
  ortaklar: [
    {
      unvan: "Maschinenbauingenieur",
      rol: "Gründungspartner / Senior-Ingenieur",
      rozet: "20+ Jahre Erfahrung",
      metin:
        "Verfügt über mehr als 20 Jahre Erfahrung als Ingenieur und Bauleiter in der Klima- und Haustechnikbranche. Leitet unmittelbar die technischen Abläufe von zentralen VRF-/VRV-Systemen, industriellen Lüftungsplanungen und großen haustechnischen Projekten.",
    },
    {
      unvan: "Projekt- & Ausführungsingenieur",
      rol: "Gründungspartner / Ingenieur",
      rozet: "Ingenieursdisziplin",
      metin:
        "Verantwortlich für AutoCAD- und TGA-Planung, präzise Wärmeverlust- und Wärmegewinnberechnungen, Mengenermittlung und das Management der Kundenprozesse. Betreut die Auswahl der für den Kundenbedarf am besten geeigneten Geräte und die Erstellung transparenter Angebote.",
    },
  ],
  iEtiket: "UNSERE PRINZIPIEN",
  iBaslik: "Warum arbeiten wir ingenieurorientiert?",
  ilkeler: [
    ["01", "Präzise Berechnung", "Keine Faustformeln: Wir berechnen den tatsächlichen Wärmeverlust anhand von Ausrichtung, Glasflächen und Nutzung des Gebäudes."],
    ["02", "Transparente Kalkulation", "Wir legen ein Position für Position detailliertes Leistungsverzeichnis mit Mengenermittlung vor – ohne spätere Kostenüberraschungen."],
    ["03", "Einwandfreie Installation", "Dämmung, Rohrdurchmesser, Stickstoff-Druckprüfung und Evakuierung prüfen wir persönlich nach den geltenden Normen."],
    ["04", "Kundendienst", "Wir übergeben die Anlage nicht einfach und gehen; mit 2 Jahren voller Garantie und regelmäßigen Wartungsverträgen schützen wir Ihr System."],
  ],
  cBaslik: "Erleben Sie Ingenieursqualität in Ihrem Projekt.",
  cMetin: "Kontaktieren Sie unser Team für eine kostenlose Besichtigung – wir analysieren Leistungsbedarf und Budget Ihres Projekts vor Ort.",
  cDugme: "Kostenlose Besichtigung anfordern →",
};

const METIN: Record<Dil, Metin> = { tr, en, de };

export function generateMetadata(): Metadata {
  const dil = dilAl();
  const t = METIN[dil];
  return {
    title: t.metaBaslik,
    description: t.metaAciklama,
    alternates: dilAlternatifleri(dil, "/hakkimizda"),
  };
}

export default async function HakkimizdaPage() {
  const sirket = await getSirketAyarlari();
  const dil = dilAl();
  const t = METIN[dil];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      {/* HEADER */}
      <Header />

      <main className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-16">

          {/* 1. HERO BÖLÜMÜ */}
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
            {ISTIRAK_METNI && dil === "tr" && (
              <p className="text-sm font-semibold text-slate-700 border-l-4 border-teal-600 pl-4 py-1">
                İklim Ofisi, {ISTIRAK_METNI}
              </p>
            )}
          </div>

          {/* 2. KURUCU ORTAKLAR / YÖNETİM MİMARİSİ */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 shadow-sm space-y-8">
            <div className="border-b border-slate-100 pb-6">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase mb-1">{t.yEtiket}</p>
              <h2 className="text-2xl font-bold text-slate-900">{t.yBaslik}</h2>
              <p className="text-xs text-slate-500 mt-1">{t.yAlt}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {t.ortaklar.map((o) => (
                <div key={o.unvan} className="bg-slate-50/80 border border-slate-200/80 p-6 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{o.unvan}</h3>
                      <p className="text-xs font-semibold text-teal-700">{o.rol}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md font-mono">
                      {o.rozet}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {o.metin}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. FİLOZOFİ VE İLKELERİMİZ */}
          <div className="space-y-8">
            <div>
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase mb-1">{t.iEtiket}</p>
              <h2 className="text-2xl font-bold text-slate-900">{t.iBaslik}</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.ilkeler.map(([no, baslik, metin]) => (
                <div key={no} className="bg-white border border-slate-200 p-6 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-teal-700 font-mono bg-teal-50 px-2.5 py-1 rounded">{no}</span>
                  <h4 className="font-bold text-slate-900 text-sm">{baslik}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {metin}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. ÇAĞRI BANNERI */}
          <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold">{t.cBaslik}</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                {t.cMetin}
              </p>
            </div>
            <Link
              href={yol(dil, "/iletisim")}
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
