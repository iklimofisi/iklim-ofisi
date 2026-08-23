import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getSirketAyarlari } from "@/lib/sirket";

export const dynamic = "force-dynamic";

const hizmetler = [
  {
    id: "iklimlendirme",
    kategori: "MERKEZİ & BİREYSEL İKLİMLENDİRME",
    baslik: "İklimlendirme ve VRF Sistemleri",
    aciklama:
      "Konut, ofis, otel ve ticari alanlarda split, multi-split ve VRF/VRV klima sistemlerinin keşfi, projelendirmesi, montajı ve periyodik bakımı. Marka bağımsız servis desteğiyle sisteminizin ömrünü uzatıyoruz.",
    maddeler: [
      "Ücretsiz keşif ve ısı yükü / kapasite hesabı",
      "VRF/VRV merkezi dış ve iç ünite montajı",
      "İzolasyonlu bakır borulama ve drenaj hattı tesisi",
      "Yıllık periyodik bakım ve filtre temizlik anlaşmaları",
    ],
    rozet: "VRF Uzmanlığı",
  },
  {
    id: "isitma",
    kategori: "VERİMLİ ISITMA TEKNOLOJİLERİ",
    baslik: "Isıtma & Isı Pompası Sistemleri",
    aciklama:
      "Yüksek verimli kombi, kazan dairesi ve yeni nesil hava/su kaynaklı ısı pompası kurulumları ile konut ve işyerlerinde verimli ısıtma çözümleri. Enerji tüketimini düşüren doğru sistem seçimi.",
    maddeler: [
      "Kombi ve merkezi kazan dairesi kurulumu",
      "Hava ve su kaynaklı ısı pompası sistemleri",
      "Sulu sistem yerden ısıtma projelendirmesi",
      "Yakıt ve enerji verimliliği danışmanlığı",
    ],
    rozet: "A+++ Tasarruf",
  },
  {
    id: "havalandirma",
    kategori: "TAZE HAVA & DUMAN EGZOZ",
    baslik: "Endüstriyel Havalandırma",
    aciklama:
      "Fabrika, restoran, AVM ve otoparklar için ısı geri kazanımlı havalandırma tasarımları, kanal imalatı ve iklimlendirilmiş taze hava çözümleri. Kapalı alanlarda hava kalitesini artırıyoruz.",
    maddeler: [
      "Isı Geri Kazanım (İGK) cihaz tasarımları",
      "Galvaniz ve spiro kanal montaj işleri",
      "Otopark duman egzoz ve sığınak havalandırması",
      "Hava debisi optimizasyonu ve anemometre ölçümü",
    ],
    rozet: "İGK Teknolojisi",
  },
  {
    id: "radyator-yerden-isitma",
    kategori: "TESİSAT & ISITICI BİRİMLER",
    baslik: "Radyatör & Tesisat Revizyonu",
    aciklama: "Panel radyatör seçimi, montajı ve mevcut tesisatın revizyonu. Oda bazlı ısı kaybı hesabıyla doğru boyutlandırma, dengesiz ısınma problemlerinin giderilmesi.",
    maddeler: [
      "Oda bazlı ısı kaybı hesabı ile radyatör boyutlandırma",
      "Panel ve dekoratif radyatör montaj işleri",
      "Kolektör grubu ve frekans kontrollü pompa entegrasyonu",
      "Tesisat yıkama ve kimyasal temizlik hizmeti",
    ],
    rozet: "Dengeli Isı",
  },
  {
    id: "mekanik-tesisat",
    kategori: "MÜHENDİSLİK & DANIŞMANLIK",
    baslik: "Mekanik Tesisat Projelendirme",
    aciklama: "Mimari projelerinize tam uyumlu AutoCAD ve Revit tabanlı mekanik tesisat çizimleri, malzeme metrajı ve teklif şartnamelerinin profesyonel hazırlanması.",
    maddeler: [
      "AutoCAD / Revit mekanik proje çizimi",
      "Detaylı malzeme metrajı ve ihale şartnamesi hazırlama",
      "Yangın ve sıhhi tesisat projelendirmesi",
      "Şantiye süreci teknik süpervizörlük desteği",
    ],
    rozet: "AutoCAD / Revit",
  },
];

export default async function HizmetlerPage() {
  const sirket = await getSirketAyarlari();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      {/* 1. HEADER */}
      <Header />

      <main className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* SAYFA BAŞLIĞI VE TANITIM METNİ */}
          <div className="max-w-3xl mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              MÜHENDİSLİK HİZMETLERİMİZ
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              Isıtmadan havalandırmaya, tesisatın <br />
              <span className="text-teal-700 underline decoration-teal-300/80 decoration-4 underline-offset-8">
                her aşaması tek çatı altında.
              </span>
            </h1>
            <p className="text-base text-slate-600 leading-relaxed pt-2">
              {sirket.unvan}; konut, ofis ve endüstriyel tesislerde beş ana başlıkta uçtan uca mühendislik hizmeti sunar — keşiften devreye almaya, bakımdan 7/24 servis desteğine kadar.
            </p>
          </div>

          {/* HİZMET KARTLARI GRİDİ */}
          <div className="grid md:grid-cols-2 gap-8">
            {hizmetler.map((hizmet) => (
              <div
                key={hizmet.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-8 hover:shadow-lg hover:border-teal-500/40 transition-all duration-300 space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Üst Kategori ve Rozet */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-teal-700 uppercase">
                      {hizmet.kategori}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                      {hizmet.rozet}
                    </span>
                  </div>

                  {/* Başlık ve Açıklama */}
                  <h2 className="text-xl font-bold text-slate-900">{hizmet.baslik}</h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {hizmet.aciklama}
                  </p>

                  {/* Onay İkonlu Madde Listesi */}
                  <div className="pt-2 border-t border-slate-100 space-y-2.5">
                    {hizmet.maddeler.map((madde, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <span className="w-4 h-4 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                          ✓
                        </span>
                        <span>{madde}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Teklif İste Butonu */}
                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href="/iletisim"
                    className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors group"
                  >
                    <span>Bu Hizmet İçin Keşif & Teklif İsteyin</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* ALT ÇAĞRI BANNERI */}
          <div className="mt-16 bg-slate-900 text-white rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold">Hangi Hizmete İhtiyacınız Var?</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Mühendislerimiz projenizin mimari çizimlerini inceleyerek en verimli sistemi ve kapasiteyi ücretsiz keşifle belirler.
              </p>
            </div>
            <Link
              href="/iletisim"
              className="shrink-0 px-7 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm rounded-lg transition-colors shadow-md"
            >
              Ücretsiz Keşif Talebi Oluşturun →
            </Link>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}