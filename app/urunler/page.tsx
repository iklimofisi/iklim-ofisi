import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getSirketAyarlari } from "@/lib/sirket";

export const dynamic = "force-dynamic";

const urunKategorileri = [
  {
    id: "bireysel-klima",
    kategori: "BİREYSEL İKLİMLENDİRME",
    baslik: "Bireysel Klimalar & Multi-Split",
    aciklama: "Konut ve küçük ofisler için R32 gazlı, A+++ yüksek verimli duvar tipi, kaset tipi ve multi-split klima çözümleri.",
    urunler: ["Inverter Duvar Tipi Klimalar", "Multi-Split Çoklu İç Ünite Sistemleri"],
  },
  {
    id: "ticari-klima",
    kategori: "TİCARİ İKLİMLENDİRME",
    baslik: "Ticari Tip Klimalar",
    aciklama: "Mağaza, restoran, cafe ve açık ofis alanları için 4 yöne üflemeli kaset, kanallı gizli tavan ve salon tipi cihazlar.",
    urunler: ["4 Yöne Üflemeli Kaset Tipi Klimalar", "Gizli Tavan Tipi Kanallı Klimalar", "Salon Tipi Yüksek Kapasiteli Klimalar"],
    markalar: "Daikin, Toshiba, Alarko Carrier",
  },
  {
    id: "vrf-sistemleri",
    kategori: "MERKEZİ İKLİMLENDİRME",
    baslik: "VRF / VRV Merkezi Sistem Cihazları",
    aciklama: "Otel, plaza, hastane ve büyük projelerde aynı anda ısıtma ve soğutma yapabilen (Heat Recovery) dış ve iç ünite grupları.",
    urunler: ["Heat Pump & Heat Recovery Dış Üniteler", "Kaset, Kanal ve Duvar Tipi İç Üniteler", "Y-Branch & Bakır Joint Bağlantı Kitleri", "Merkezi Dokunmatik Kumanda Panelleri"],
    markalar: "Bosch VRF, Daikin VRV, Mitsubishi Electric VRF",
  },
  {
    id: "isi-pompasi",
    kategori: "YENİLENEBİLİR ISITMA",
    baslik: "Isı Pompası Sistemleri",
    aciklama: "Dış havadaki enerjiyi kullanarak binalarda hem yerden ısıtma hem de kullanım sıcak suyu sağlayan yüksek COP değerli sistemler.",
    urunler: ["Hava Kaynaklı Monoblok Isı Pompaları", "Split Tipi Entegre Boylerli Isı Pompaları", "Yüksek Sıcaklık Isı Pompaları (65°C)"],
    markalar: "Bosch, Daikin Altherma, Mitsubishi Ecodan",
  },
  {
    id: "havalandirma",
    kategori: "TAZE HAVA & İGK",
    baslik: "Havalandırma & Isı Geri Kazanım Cihazları",
    aciklama: "Kapalı ortamlara filtrelenmiş taze hava sağlarken egzoz havasındaki ısıyı geri kazanan yüksek verimli iklimlendirme santralleri.",
    maddeler: ["Isı Geri Kazanım (İGK) Santralleri", "Spiro Yuvarlak & Dikdörtgen Hava Kanalları", "Sığınak & Otopark Duman Egzoz Fanları"],
    markalar: "Systemair, Ventas, Rosenberg",
  },
  {
  id: "daygas-radyant",
  kategori: "ENDÜSTRİYEL ISITMA",
  baslik: "Daygas Radyant & Sıcak Hava Sistemleri",
  aciklama: "Fabrika, depo, cafe ve açık alanlar için yüksek tasarruflu Daygas borulu ve seramik radyant ısıtıcılar ile sıcak hava üreteçleri.",
  urunler: ["Seramik Radyant Isıtıcılar", "Borulu Radyant Isıtma Sistemleri", "Sıcak Hava Üreteçleri"],
  },
  {
    id: "tesisat-otomasyon",
    kategori: "MEKANİK TESİSAT",
    baslik: "Tesisat & Otomasyon Ekipmanları",
    aciklama: "Mekanik tesisat projelerinizde kullanılan frekans kontrollü sirkülasyon pompaları, balans vanaları ve akıllı bina otomasyon kartları.",
    maddeler: ["Frekans Kontrollü Sirkülasyon Pompaları", "Dinamik Balans Vanaları & Kolektörler", "VRF Akıllı Bina Otomasyon Arayüzleri (BACnet/Modbus)"],
    markalar: "Wilo, Grundfos, Honeywell",
  },
];

export default async function UrunlerPage() {
  const sirket = await getSirketAyarlari();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      <Header />

      <main className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          
          {/* SAYFA BAŞLIĞI */}
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              MEKANİK TESİSAT & İKLİMLENDİRME ÜRÜNLERİ
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              Dünya Standartlarında <br />
              <span className="text-teal-700 underline decoration-teal-300/80 decoration-4 underline-offset-8">
                İklimlendirme Teknolojileri.
              </span>
            </h1>
            <p className="text-base text-slate-600 leading-relaxed pt-2">
              {sirket.unvan}; Bireysel klimalardan dev ölçekli VRF dış ünite gruplarına, ısı pompalarından havalandırma santrallerine kadar projenizin tüm mekanik ürün ihtiyacını yetkili distribütör güvencesiyle sağlar.
            </p>
          </div>

          {/* KATEGORİLER GRİDİ */}
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

                  {/* Ürün Tipleri */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ürün Grupları:</p>
                    {(kat.urunler || kat.maddeler)?.map((u, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                        <span>{u}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <p className="text-[10px] font-semibold text-slate-400">Markalar: {kat.markalar}</p>
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

          {/* ÇAĞRI BANNERI */}
          <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold">Projeniz İçin Toplu Cihaz ve Tesisat Fiyatı Alın</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Cihaz seçim cetvelinizi veya metraj listenizi gönderin, mühendislerimiz distribütör avantajlı fiyatlarla teklif hazırlasın.
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