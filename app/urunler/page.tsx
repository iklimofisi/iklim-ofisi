import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getSirketAyarlari } from "@/lib/sirket";

export const dynamic = "force-dynamic";

const urunKategorileri = [
  {
    id: "bireysel-klima",
    kategori: "BİREYSEL İKLİMLENDİRME",
    baslik: "Mitsubishi Electric & Samsung Bireysel Klimalar",
    aciklama: "Konut ve küçük ofisler için Mitsubishi Electric ve Samsung A+++ yüksek verimli Inverter duvar tipi ve multi-split klima cihazları.",
    urunler: ["Mitsubishi Electric Inverter Duvar Tipi", "Samsung WindFree™ Rüzgarsız Klimalar", "Multi-Split Çoklu İç Ünite Sistemleri"],
    markalar: "Mitsubishi Electric, Samsung",
  },
  {
    id: "ticari-klima",
    kategori: "TİCARİ İKLİMLENDİRME",
    baslik: "Ticari Tip Klimalar",
    aciklama: "Mağaza, cafe, restoran ve açık ofis alanları için 4 yöne üflemeli kaset, kanallı gizli tavan, konsol ve salon tipi cihazlar.",
    urunler: ["4 Yöne Üflemeli Kaset Tipi Klimalar", "Gizli Tavan Tipi Kanallı Klimalar", "Konsol Tipi Klimalar", "Salon Tipi Klimalar"],
    markalar: "Mitsubishi Electric, Samsung",
  },
  {
    id: "vrf-sistemleri",
    kategori: "MERKEZİ İKLİMLENDİRME",
    baslik: "Mitsubishi Electric & Samsung VRF Sistemleri",
    aciklama: "Otel, plaza, hastane ve binalarda her odayı bağımsız iklimlendiren Mitsubishi Electric City Multi ve Samsung DVM S VRF dış/iç ünite grupları.",
    urunler: ["Mitsubishi Electric City Multi VRF", "Samsung DVM S2 AI VRF Sistemleri", "Heat Pump & Heat Recovery Dış Üniteler", "Y-Branch & Joint Bağlantı Kitleri"],
    markalar: "Mitsubishi Electric, Samsung",
  },
  {
    id: "isi-pompasi-isitma",
    kategori: "VERİMLİ ISITMA & KASKAD",
    baslik: "Buderus Isıtma & Isı Pompaları",
    aciklama: "Buderus yoğuşmalı kaskad kazan sistemleri, hava/su kaynaklı ısı pompaları (85°C) ve sulu yerden ısıtma entegrasyonu.",
    urunler: ["Buderus Duvar Tipi Yoğuşmalı Kazanlar", "Buderus Hava Kaynaklı Isı Pompaları", "Yüksek Sıcaklık Isı Pompaları (85°C)", "Merkezi Kaskad Kazan Sistemleri"],
    markalar: "Buderus",
  },
  {
    id: "daygas-radyant",
    kategori: "ENDÜSTRİYEL ISITMA",
    baslik: "Daygas Radyant & Sıcak Hava Sistemleri",
    aciklama: "Fabrika, depo, cafe ve açık alanlar için yüksek tasarruflu Daygas borulu ve seramik radyant ısıtıcılar ile sıcak hava üreteçleri.",
    urunler: ["Seramik Radyant Isıtıcılar", "Borulu Radyant Isıtma Sistemleri", "Sıcak Hava Üreteçleri"],
    markalar: "Daygas",
  },
  {
    id: "havalandirma",
    kategori: "TAZE HAVA & İGK",
    baslik: "Havalandırma & Isı Geri Kazanım Cihazları",
    aciklama: "Kapalı ortamlara filtrelenmiş taze hava sağlarken egzoz havasındaki ısıyı geri kazanan yüksek verimli iklimlendirme santralleri.",
    urunler: ["Isı Geri Kazanım (İGK) Santralleri", "Spiro Yuvarlak & Dikdörtgen Hava Kanalları", "Sığınak & Otopark Duman Egzoz Fanları"],
    markalar: "Systemair, Ventas",
  },
];

export default async function UrunlerPage() {
  const sirket = await getSirketAyarlari();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      <Header />

      <main className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              MEKANİK TESİSAT & İKLİMLENDİRME ÜRÜNLERİ
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              Mitsubishi Electric, Samsung ve Buderus <br />
              <span className="text-teal-700 underline decoration-teal-300/80 decoration-4 underline-offset-8">
                İklimlendirme Teknolojileri.
              </span>
            </h1>
            <p className="text-base text-slate-600 leading-relaxed pt-2">
              {sirket.unvan}; Mitsubishi Electric ve Samsung VRF sistemlerinden Buderus ısıtma teknolojilerine kadar projenizin tüm mekanik ürün ihtiyacını mühendislik güvencesiyle sağlar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {urunKategorileri.map((kat) => (
              <div
                key={kat.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-8 hover:shadow-lg hover:border-teal-500/40 transition-all duration-300 space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <span className="text-[11px] font-bold tracking-wider text-teal-700 uppercase">
                    {kat.kategori}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">{kat.baslik}</h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {kat.aciklama}
                  </p>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ürün Grupları:</p>
                    {kat.urunler.map((u, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                        <span>{u}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 font-mono">Marka: {kat.markalar}</p>
                  <Link
                    href="/iletisim"
                    className="block w-full py-2.5 bg-slate-900 hover:bg-teal-700 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm"
                  >
                    Projeniz İçin Fiyat Teklifi İsteyin →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold">Projeniz İçin Toplu Cihaz Fiyatı Alın</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Mitsubishi Electric, Samsung ve Buderus cihaz listelerinizi gönderin, mühendislerimiz avantajlı fiyat teklifi hazırlasın.
              </p>
            </div>
            <Link
              href="/iletisim"
              className="shrink-0 px-7 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm rounded-lg transition-colors shadow-md"
            >
              Fiyat Teklifi İste →
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}