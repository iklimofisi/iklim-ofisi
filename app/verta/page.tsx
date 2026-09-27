import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const KATALOG = "/kataloglar/verta-firin-katalogu-iklim-ofisi.pdf";

export const metadata: Metadata = {
  title: "VERTA Konveksiyonel Fırınlar — 4, 6 ve 10 Tepsili",
  description:
    "Pastane, restoran, kafe ve oteller için VERTA 4, 6 ve 10 tepsili profesyonel konveksiyonel fırınlar. Teknik özellikler, ölçüler ve PDF katalog.",
  alternates: { canonical: "/verta" },
  openGraph: {
    title: "VERTA Konveksiyonel Fırınlar | İklim Ofisi",
    description: "Profesyonel mutfaklar için homojen pişirme ve yüksek verim: VERTA 4, 6 ve 10 tepsili konveksiyonel fırınlar.",
    url: "https://iklimofisi.com/verta",
    images: [{ url: "/verta/verta-kapak.jpg", width: 1200, height: 750, alt: "VERTA konveksiyonel fırın" }],
  },
};

type Model = {
  id: string;
  ad: string;
  kisa: string;
  gorsel: string;
  one: string[];
  ozellikler: [string, string][];
  opsiyonel?: string[];
};

// Değerler VERTA kataloğundaki teknik özellik tablolarından alınmıştır.
const MODELLER: Model[] = [
  {
    id: "4-tepsili",
    ad: "VERTA 4 Tepsili Konveksiyonel Fırın",
    kisa: "Kompakt, tek fazlı (220 V) kullanım için",
    gorsel: "/verta/verta-4-tepsili.jpg",
    one: ["Homojen pişirme için fan", "Manuel sıcaklık kontrolü: 30–250 °C", "Manuel zaman kontrolü: 0–120 dakika", "Paslanmaz çelik iç ve dış gövde, kolay temizlenen iç hazne"],
    ozellikler: [
      ["Model", "Manuel"],
      ["Tepsi kapasitesi", "4"],
      ["Tepsi ölçüsü", "42 × 34 cm"],
      ["Çalışma şekli", "Elektrikli"],
      ["Sıcaklık aralığı", "30–250 °C"],
      ["Zaman aralığı", "0–120 dakika"],
      ["Güç", "2,8 kW"],
      ["Voltaj", "AC 220 / 230 V"],
      ["Frekans", "50 / 60 Hz"],
      ["Boyutlar (G × D × Y)", "590 × 695 × 590 mm"],
      ["Ağırlık", "36 kg"],
    ],
  },
  {
    id: "6-tepsili",
    ad: "VERTA 6 Tepsili Konveksiyonel Fırın",
    kisa: "GN 2/1 tepsilerle geniş pişirme alanı",
    gorsel: "/verta/verta-6-tepsili.jpg",
    one: ["2 adet çift yöne dönen motor", "Manuel sıcaklık kontrolü: 100–260 °C", "Termostatlı, kararlı sıcaklık kontrolü", "Paslanmaz çelik, uzun ömürlü gövde"],
    ozellikler: [
      ["Model", "Manuel"],
      ["Tepsi kapasitesi", "6"],
      ["Tepsi ölçüsü", "GN 2/1"],
      ["Çalışma şekli", "Elektrikli"],
      ["Sıcaklık aralığı", "100–260 °C"],
      ["Zaman aralığı", "0–120 dakika"],
      ["Motor", "2 adet çift yöne dönen motor"],
      ["Güç", "18,3 kW"],
      ["Voltaj", "AC 380 / 400 V 3N"],
      ["Frekans", "50 / 60 Hz"],
      ["Boyutlar (G × D × Y)", "995 × 994 × 895 mm"],
      ["Ağırlık", "115,8 kg"],
    ],
  },
  {
    id: "10-tepsili",
    ad: "VERTA 10 Tepsili Konveksiyonel Fırın",
    kisa: "Elektronik kontrollü, programlanabilir, nemlendirmeli",
    gorsel: "/verta/verta-10-tepsili.jpg",
    one: [
      "3 adet çift yöne dönen motor, 3 kademeli fan hızı",
      "Elektronik sıcaklık, zaman ve nem kontrolü (Black Mask panel)",
      "100 program, program içi 10 pişirme kademesi",
      "Panel kontrollü 10 seviye direkt nemlendirme, ön ısıtma",
    ],
    ozellikler: [
      ["Tepsi kapasitesi", "10 adet 600 × 400 mm"],
      ["Motor", "3 adet çift yöne dönen motor"],
      ["Kontrol sistemi", "Elektronik sıcaklık, zaman ve nem kontrolü — Black Mask panel"],
      ["Fan hızı", "3 kademeli; yarı statik fan durdurma fonksiyonu"],
      ["Sıcaklık aralığı", "30–270 °C (dijital prob kontrollü)"],
      ["Program", "100 program, program içi 10 pişirme kademesi"],
      ["Nemlendirme", "Panel kontrollü 10 seviye direkt nemlendirme"],
      ["Ön ısıtma", "Var"],
      ["Güç", "15,5 kW (elektrik)"],
      ["Voltaj", "AC 380 / 400 V 3N"],
      ["Frekans", "50 / 60 Hz"],
      ["Boyutlar (G × D × Y)", "850 × 1035 × 1130 mm"],
      ["Ağırlık", "140,4 kg"],
    ],
    opsiyonel: ["Otomatik yıkama sistemi", "Sıcaklık probu"],
  },
];

const KULLANIM = ["Pastaneler", "Restoranlar", "Kafeler", "Oteller"];

function KatalogButonu({ koyu = false }: { koyu?: boolean }) {
  return (
    <a
      href={KATALOG}
      target="_blank"
      rel="noopener noreferrer"
      download="VERTA-Konveksiyonel-Firin-Katalogu.pdf"
      className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-sm transition-all text-center ${
        koyu
          ? "bg-white/10 border border-white/20 text-white hover:bg-white/20"
          : "bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
      </svg>
      Kataloğu İndir (PDF)
    </a>
  );
}

export default function VertaPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      <Header />

      <main>
        {/* 1. HERO */}
        <section className="bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                ENDÜSTRİYEL MUTFAK · FIRINLAR
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
                VERTA Konveksiyonel Fırınlar
              </h1>
              <p className="text-lg font-semibold text-teal-700">Her pişirmede homojen sonuç, yüksek verim.</p>
              <p className="text-base text-slate-600 leading-relaxed">
                Pastane, restoran, kafe ve otel mutfakları için 4, 6 ve 10 tepsili profesyonel konveksiyonel fırınlar. Paslanmaz çelik gövde, çift yöne dönen fanlarla eşit ısı dağılımı ve kolay temizlenen iç hazne. Mutfak havalandırmanızla birlikte tek elden projelendiriyoruz.
              </p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                {MODELLER.map((m) => (
                  <a
                    key={m.id}
                    href={`#${m.id}`}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center font-bold text-slate-700 hover:border-teal-500/50 hover:text-teal-800 transition-colors"
                  >
                    {m.ad.match(/\d+ Tepsili/)?.[0]}
                  </a>
                ))}
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/iletisim"
                  className="px-8 py-4 rounded-lg bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 shadow-sm transition-all text-center"
                >
                  Fiyat Teklifi İsteyin →
                </Link>
                <KatalogButonu />
              </div>
            </div>

            <div className="relative w-full aspect-[8/5] rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900">
              <Image
                src="/verta/verta-kapak.jpg"
                alt="Profesyonel mutfak tezgâhında VERTA konveksiyonel fırın"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* 2. MODELLER */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-6 space-y-10">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">MODELLER</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">İhtiyacınıza uygun kapasiteyi seçin</h2>
            </div>

            <div className="space-y-8">
              {MODELLER.map((m, i) => (
                <article
                  key={m.id}
                  id={m.id}
                  className="scroll-mt-28 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm grid lg:grid-cols-5"
                >
                  <div className={`relative aspect-square lg:aspect-auto lg:min-h-[26rem] lg:col-span-2 bg-slate-900 ${i % 2 ? "lg:order-2" : ""}`}>
                    <Image src={m.gorsel} alt={m.ad} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                  </div>
                  <div className="lg:col-span-3 p-6 sm:p-8 space-y-5">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{m.ad}</h3>
                      <p className="text-sm text-teal-700 font-semibold mt-1">{m.kisa}</p>
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {m.one.map((o) => (
                        <li key={o} className="flex items-start gap-2 text-xs text-slate-700">
                          <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                            ✓
                          </span>
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <tbody>
                          {m.ozellikler.map(([a, d]) => (
                            <tr key={a} className="border-t border-slate-100 first:border-t-0">
                              <th scope="row" className="text-left font-semibold text-slate-700 bg-slate-50 px-4 py-2 w-2/5 align-top">
                                {a}
                              </th>
                              <td className="px-4 py-2 text-slate-600">{d}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {m.opsiyonel && (
                      <p className="text-xs text-slate-600">
                        <span className="font-bold text-slate-800">Opsiyonel: </span>
                        {m.opsiyonel.join(" · ")}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 3. KULLANIM ALANLARI + CTA */}
        <section className="py-16 md:py-20 bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">KULLANIM ALANLARI</p>
              <h2 className="text-2xl sm:text-3xl font-bold">Profesyonel mutfaklar için tasarlandı</h2>
              <div className="grid grid-cols-2 gap-3">
                {KULLANIM.map((k) => (
                  <div key={k} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm font-bold text-center">
                    {k}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Fırın seçimini mutfak havalandırmasıyla birlikte düşünüyoruz: pişirme hattınızın egzozu için{" "}
                <Link href="/airnex" className="text-teal-300 underline underline-offset-2">
                  AIRNEX elektrostatik hücreli aspiratör
                </Link>{" "}
                çözümümüzü de inceleyebilirsiniz.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-10 space-y-5">
              <h3 className="text-xl sm:text-2xl font-bold">Mutfağınız için doğru fırını birlikte seçelim.</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Günlük üretim miktarınızı, tepsi ölçünüzü ve mevcut elektrik altyapınızı (220 V / 380 V) paylaşın; uygun modeli ve fiyat teklifini hazırlayalım.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/iletisim"
                  className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-500 text-white text-center font-bold text-sm rounded-lg transition-colors shadow-md"
                >
                  Teklif İsteyin →
                </Link>
                <KatalogButonu koyu />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
