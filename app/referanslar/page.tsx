import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getSirketAyarlari } from "@/lib/sirket";
import { dilAlternatifleri, yol, type Dil } from "@/lib/dil";
import { dilAl } from "@/lib/dil-sunucu";

export const dynamic = "force-dynamic";

// REFERANSLAR METİNLERİ (Türkçe / English / Deutsch)
const tr = {
  metaBaslik: "Referans Projeler",
  metaAciklama: "İklim Ofisi tarafından tamamlanan otel, plaza, konut ve endüstriyel iklimlendirme referans projeleri.",
  rozet: "SAHA TECRÜBEMİZ",
  h1: "Referans Projelerimiz",
  giris: " tarafından tamamlanan otel, plaza, konut ve endüstriyel iklimlendirme referans projelerimiz güncellenmektedir.",
  kutuBaslik: "Referans Listesi Güncellenmektedir",
  kutuMetin:
    "Daha önce tamamladığımız VRF iklimlendirme, Buderus kaskad ısıtma ve mekanik tesisat referanslarımızın detaylı görsel kataloğu hazırlanmaktadır.",
  dugme: "Projeniz İçin Bize Ulaşın →",
};

type Metin = typeof tr;

const en: Metin = {
  metaBaslik: "Reference Projects",
  metaAciklama: "Hotel, office tower, residential and industrial HVAC reference projects completed by İklim Ofisi.",
  rozet: "OUR FIELD EXPERIENCE",
  h1: "Our Reference Projects",
  giris: "'s completed hotel, office tower, residential and industrial HVAC reference projects are being updated.",
  kutuBaslik: "Reference List Being Updated",
  kutuMetin:
    "A detailed visual catalogue of our completed VRF air conditioning, Buderus cascade heating and mechanical installation references is in preparation.",
  dugme: "Contact Us About Your Project →",
};

const de: Metin = {
  metaBaslik: "Referenzprojekte",
  metaAciklama: "Von İklim Ofisi abgeschlossene Referenzprojekte für Hotels, Bürogebäude, Wohnbauten und industrielle Klimatechnik.",
  rozet: "UNSERE PRAXISERFAHRUNG",
  h1: "Unsere Referenzprojekte",
  giris: ": Unsere abgeschlossenen Referenzprojekte in Hotels, Bürogebäuden, Wohnbauten und industrieller Klimatechnik werden derzeit aktualisiert.",
  kutuBaslik: "Referenzliste wird aktualisiert",
  kutuMetin:
    "Ein ausführlicher Bildkatalog unserer abgeschlossenen Referenzen in VRF-Klimatisierung, Buderus-Kaskadenheizung und Haustechnik ist in Vorbereitung.",
  dugme: "Kontaktieren Sie uns zu Ihrem Projekt →",
};

const METIN: Record<Dil, Metin> = { tr, en, de };

export function generateMetadata(): Metadata {
  const dil = dilAl();
  const t = METIN[dil];
  return {
    title: t.metaBaslik,
    description: t.metaAciklama,
    alternates: dilAlternatifleri(dil, "/referanslar"),
    // Referans listesi dolana kadar Google'da listelenmesin (boş sayfa sıralamaya zarar verir).
    // Referanslar eklenince bu satır kaldırılır ve sayfa site haritasına geri eklenir.
    robots: { index: false, follow: true },
  };
}

export default async function ReferanslarPage() {
  const sirket = await getSirketAyarlari();
  const dil = dilAl();
  const t = METIN[dil];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      <Header />

      <main className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              {t.rozet}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              {t.h1}
            </h1>
            <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              {sirket.unvan}{t.giris}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <p className="text-4xl">📐</p>
            <h3 className="font-bold text-slate-900 text-lg">{t.kutuBaslik}</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {t.kutuMetin}
            </p>
            <div className="pt-2">
              <Link
                href={yol(dil, "/iletisim")}
                className="inline-block px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl transition-colors"
              >
                {t.dugme}
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}