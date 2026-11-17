import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { makaleler, makaleTarihi } from "./data";
import { dilAlternatifleri, yol, type Dil } from "@/lib/dil";
import { dilAl } from "@/lib/dil-sunucu";

export const dynamic = "force-dynamic";

// BLOG LİSTESİ METİNLERİ (Türkçe / English / Deutsch)
const tr = {
  metaBaslik: "Blog & Teknik Makaleler",
  metaAciklama:
    "TCL VRF, split klima, hava perdesi, radyatör, ısıtma, havalandırma ve endüstriyel mutfak egzozu hakkında İklim Ofisi mühendislerinin hazırladığı teknik rehber yazılar.",
  rozet: "TEKNİK REHBER & MÜHENDİSLİK BLOGU",
  h1a: "İklimlendirme ve Tesisat ",
  h1b: "Teknik Makaleleri.",
  giris:
    "TCL ve Mitsubishi Electric VRF teknolojileri, Buderus ısıtma çözümleri, Niva ve Olefini hava perdeleri, Ayen alüminyum radyatörler, AIRNEX mutfak havalandırma ve mekanik tesisat hakkında uzman mühendislerimizin hazırladığı rehber yazılar.",
  devam: "Makalenin Tamamını Okuyun",
};

type Metin = typeof tr;

const en: Metin = {
  metaBaslik: "Blog & Technical Articles",
  metaAciklama:
    "Technical guides by İklim Ofisi engineers on TCL VRF, split air conditioning, air curtains, radiators, heating, ventilation and commercial kitchen exhaust.",
  rozet: "TECHNICAL GUIDES & ENGINEERING BLOG",
  h1a: "Technical Articles on HVAC ",
  h1b: "and Building Services.",
  giris:
    "Guides written by our expert engineers on TCL and Mitsubishi Electric VRF technologies, Buderus heating solutions, Niva and Olefini air curtains, Ayen aluminium radiators, AIRNEX kitchen ventilation and mechanical installation.",
  devam: "Read the Full Article",
};

const de: Metin = {
  metaBaslik: "Blog & Fachartikel",
  metaAciklama:
    "Fachratgeber der Ingenieure von İklim Ofisi zu TCL VRF, Split-Klimaanlagen, Torluftschleiern, Heizkörpern, Heizung, Lüftung und Gewerbeküchenabluft.",
  rozet: "FACHRATGEBER & INGENIEURBLOG",
  h1a: "Fachartikel zu Klima- ",
  h1b: "und Haustechnik.",
  giris:
    "Ratgeber unserer Fachingenieure zu TCL- und Mitsubishi-Electric-VRF-Technologien, Buderus-Heizlösungen, Niva- und Olefini-Torluftschleiern, Ayen Aluminiumheizkörpern, AIRNEX Küchenlüftung und Haustechnik.",
  devam: "Ganzen Artikel lesen",
};

const METIN: Record<Dil, Metin> = { tr, en, de };

export function generateMetadata(): Metadata {
  const dil = dilAl();
  const t = METIN[dil];
  return {
    title: t.metaBaslik,
    description: t.metaAciklama,
    alternates: dilAlternatifleri(dil, "/blog"),
  };
}

export default function BlogPage() {
  const dil = dilAl();
  const t = METIN[dil];
  const MAKALELER = makaleler(dil);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      <Header />

      <main className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
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
              {t.giris}
            </p>
          </div>

          {/* MAKALELER GRİDİ */}
          <div className="grid md:grid-cols-2 gap-8">
            {MAKALELER.map((m) => (
              <div
                key={m.slug}
                className="bg-white border border-slate-200/90 rounded-2xl p-8 hover:shadow-lg hover:border-teal-500/40 transition-all duration-300 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <Link href={yol(dil, `/blog/${m.slug}`)} className={`-mx-8 -mt-8 mb-2 block relative aspect-[16/9] overflow-hidden rounded-t-2xl ${m.gorselSigdir ? "bg-white" : "bg-slate-100"}`}>
                    <Image
                      src={m.gorsel}
                      alt={m.gorselAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 600px"
                      className={m.gorselSigdir ? "object-contain p-6" : "object-cover"}
                    />
                  </Link>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold tracking-wider text-teal-700 uppercase">
                      {m.kategori}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {makaleTarihi(dil, m.tarih)} · {m.okumaSuresi}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 hover:text-teal-700 transition-colors">
                    <Link href={yol(dil, `/blog/${m.slug}`)}>{m.baslik}</Link>
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {m.ozet}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href={yol(dil, `/blog/${m.slug}`)}
                    className="text-xs font-bold text-teal-700 hover:underline inline-flex items-center gap-1"
                  >
                    <span>{t.devam}</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}