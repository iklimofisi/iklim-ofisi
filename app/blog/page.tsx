import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const dynamic = "force-dynamic";

const makaleler = [
  {
    id: 1,
    baslik: "VRF Sistem Nedir? Nerelerde Tercih Edilmelidir?",
    tarih: "24 Ağustos 2026",
    kategori: "VRF & MERKEZİ İKLİMLENDİRME",
    ozet: "Değişken debili soğutucu akışkan (VRF) sistemlerin çalışma prensibi, konut ve otel projelerindeki enerji tasarrufu avantajları.",
  },
  {
    id: 2,
    baslik: "Isı Pompası İle Isınma: Doğalgaza Göre Ne Kadar Tasarruf Sağlar?",
    tarih: "18 Ağustos 2026",
    kategori: "YENİLENEBİLİR ENERJİ",
    ozet: "Hava ve su kaynaklı ısı pompalarının yerden ısıtma sistemleriyle uyumu, COP değerleri ve fatura tasarruf analizi.",
  },
  {
    id: 3,
    baslik: "Endüstriyel Tesislerde Isı Geri Kazanımlı Havalandırmanın Önemi",
    tarih: "10 Ağustos 2026",
    kategori: "HAVALANDIRMA",
    ozet: "Fabrika ve kapalı ortamlarda dışarı atılan egzoz havasındaki ısıyı taze havaya aktararak işletme maliyetini düşürme yöntemleri.",
  },
  {
    id: 4,
    baslik: "Klima Satın Alırken Yapılan 5 Kritik Hata ve Kapasite Hesabı",
    tarih: "02 Ağustos 2026",
    kategori: "REHBER",
    ozet: "Metrekareye göre rastgele cihaz seçmenin zararları, izolasyon ve cam yüzey alanına göre BTU kapasite belirleme rehberi.",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      <Header />

      <main className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              TEKNİK REHBER & BİLGİ BANKASI
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              Mühendislik Makaleleri ve <br />
              <span className="text-teal-700 underline decoration-teal-300/80 decoration-4 underline-offset-8">
                İklimlendirme Rehberi.
              </span>
            </h1>
            <p className="text-base text-slate-600 leading-relaxed pt-2">
              VRF iklimlendirmeden ısı pompalarına, havalandırmadan enerji verimliliğine kadar iklimlendirme teknolojileri hakkında teknik yazılarımız.
            </p>
          </div>

          {/* MAKALELER GRİDİ */}
          <div className="grid md:grid-cols-2 gap-8">
            {makaleler.map((m) => (
              <div
                key={m.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-8 hover:shadow-lg hover:border-teal-500/40 transition-all duration-300 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold tracking-wider text-teal-700 uppercase">
                      {m.kategori}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {m.tarih}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900">{m.baslik}</h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {m.ozet}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href="/iletisim"
                    className="text-xs font-bold text-teal-700 hover:underline"
                  >
                    Detaylı Okuyun & Soru Sorun →
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