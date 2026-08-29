import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getSirketAyarlari } from "@/lib/sirket";

export const dynamic = "force-dynamic";

const referansProjeler = [
  {
    id: 1,
    projeAdi: "Plaza İş Merkezi VRF İklimlendirme",
    kategori: "VRF MERKEZİ SİSTEM",
    lokasyon: "Şişli / İstanbul",
    detay: "Plaza projesinde Heat Recovery VRF dış üniteler, kaset tipi iç üniteler ve otomasyon kumanda altyapısı.",
    kapasite: "1.200 kW Soğutma Gücü",
  },
  {
    id: 2,
    projeAdi: "Vadistanbul Ticaret Merkezi",
    kategori: "HAVALANDIRMA & KLİMA SANTRALİ",
    lokasyon: "Ayazağa / İstanbul",
    detay: "Isı geri kazanımlı taze hava santralleri (AHU), spiro kanal imali ve kapalı otopark jet-fan egzoz tesisatı.",
    kapasite: "45.000 m³/h Taze Hava Debisi",
  },
  {
    id: 3,
    projeAdi: "Bodrum Yalıkavak Lüks Villa Kompleksi",
    kategori: "ISI POMPASI & YERDEN ISITMA",
    lokasyon: "Yalıkavak / Muğla",
    detay: "12 adet müstakil villada hava kaynaklı yüksek sıcaklık ısı pompası, sulu yerden ısıtma ve boyler entegrasyonu.",
    kapasite: "A+++ Enerji Sınıfı",
  },
  {
    id: 4,
    projeAdi: "Ataşehir Finans Merkezi İş Blokları",
    kategori: "MEKANİK TESİSAT & YANGIN",
    lokasyon: "Ataşehir / İstanbul",
    detay: "Komple sıhhi tesisat, kullanma suyu deposu, hidrofor grupları ve yangın söndürme sprink hatları imali.",
    kapasite: "18.000 m² Kapalı Alan",
  },
];

export default async function ReferanslarPage() {
  const sirket = await getSirketAyarlari();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      <Header />

      <main className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              TAMAMLANAN MÜHENDİSLİK PROJELERİ
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              Referanslarımız ve <br />
              <span className="text-teal-700 underline decoration-teal-300/80 decoration-4 underline-offset-8">
                Saha Tecrübemiz.
              </span>
            </h1>
            <p className="text-base text-slate-600 leading-relaxed pt-2">
              {sirket.unvan}; otel, plaza, konut ve endüstriyel yapılarda başarıyla teslim ettiği iklimlendirme ve mekanik tesisat projeleriyle güven üretir.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {referansProjeler.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-8 hover:shadow-lg hover:border-teal-500/40 transition-all duration-300 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold tracking-wider text-teal-700 uppercase">
                      {p.kategori}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                      📍 {p.lokasyon}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900">{p.projeAdi}</h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {p.detay}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-teal-800 font-mono">
                    ⚡ {p.kapasite}
                  </span>
                  <Link
                    href="/iletisim"
                    className="text-xs font-bold text-slate-900 hover:text-teal-700 transition-colors"
                  >
                    Benzer Proje İçin Teklif Al →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold">Projenizi Referanslarımız Arasına Katın</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Mimari veya mekanik çizimlerinizi gönderin, mühendislerimiz bütçenize uygun ideal iklimlendirme projesini hazırlasın.
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

      <Footer />
    </div>
  );
}