import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getSirketAyarlari } from "@/lib/sirket";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ürünler — Mitsubishi Electric, TCL, Buderus & AIRNEX",
  description:
    "Mitsubishi Electric ve TCL VRF ve klima sistemleri, Buderus ısıtma ve ısı pompaları, AIRNEX elektrostatik hücreli mutfak aspiratörleri ve havalandırma ürünleri.",
  alternates: { canonical: "/urunler" },
};

// "gorsel" alanı olan kartların üstünde ürün fotoğrafı gösterilir (fotoğraflar marka kataloglarından)
const urunKategorileri: {
  id: string;
  kategori: string;
  baslik: string;
  aciklama: string;
  urunler: string[];
  markalar: string;
  gorsel?: string;
  gorselAlt?: string;
  gorselBaslik?: string; // Fotoğraf yoksa kart başlığındaki büyük yazı (boşsa marka adı)
}[] = [
  {
    id: "bireysel-klima",
    gorsel: "/urunler/urun-bireysel-klima.jpg",
    gorselAlt: "Oturma odasında duvar tipi klima iç ünitesi",
    kategori: "BİREYSEL İKLİMLENDİRME",
    baslik: "Mitsubishi Electric & TCL Bireysel Klimalar",
    aciklama: "Konut ve küçük ofisler için Mitsubishi Electric ve TCL yüksek verimli Inverter duvar tipi ve multi-split klima cihazları.",
    urunler: ["Mitsubishi Electric Inverter Duvar Tipi Klimalar", "TCL Inverter Duvar Tipi Klimalar", "Multi-Split Çoklu İç Ünite Sistemleri"],
    markalar: "Mitsubishi Electric, TCL",
  },
  {
    id: "ticari-klima",
    gorsel: "/urunler/urun-ticari-klima.jpg",
    gorselAlt: "Tavana monte kaset tipi klima iç ünitesi",
    kategori: "TİCARİ İKLİMLENDİRME",
    baslik: "Ticari Tip Klimalar",
    aciklama: "Mağaza, cafe, restoran ve açık ofis alanları için 4 yöne üflemeli kaset, kanallı gizli tavan, konsol ve salon tipi cihazlar.",
    urunler: ["4 Yöne Üflemeli Kaset Tipi Klimalar", "Gizli Tavan Tipi Kanallı Klimalar", "Konsol Tipi Klimalar", "Salon Tipi Klimalar"],
    markalar: "Mitsubishi Electric, TCL",
  },
  {
    id: "vrf-sistemleri",
    gorsel: "/urunler/urun-vrf.jpg",
    gorselAlt: "TCL TMV6+ Super Serisi VRF dış ünitesi",
    kategori: "MERKEZİ İKLİMLENDİRME",
    baslik: "Mitsubishi Electric & TCL VRF Sistemleri",
    aciklama: "Otel, plaza, hastane ve binalarda her odayı bağımsız iklimlendiren Mitsubishi Electric City Multi ve TCL TMV serisi VRF dış/iç ünite grupları.",
    urunler: ["Mitsubishi Electric City Multi VRF", "TCL TMV Serisi VRF Sistemleri", "Heat Pump & Heat Recovery Dış Üniteler", "Y-Branch & Joint Bağlantı Kitleri"],
    markalar: "Mitsubishi Electric, TCL",
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
    id: "radyant-isitma",
    kategori: "ENDÜSTRİYEL ISITMA",
    baslik: "Radyant & Sıcak Hava Isıtma Sistemleri",
    aciklama: "Fabrika, depo, cafe ve açık alanlar için yüksek tasarruflu borulu ve seramik radyant ısıtıcılar ile sıcak hava üreteçleri. Projenize en uygun markayı birlikte seçiyoruz.",
    urunler: ["Seramik Radyant Isıtıcılar", "Borulu Radyant Isıtma Sistemleri", "Sıcak Hava Üreteçleri"],
    markalar: "",
    gorselBaslik: "Radyant & Sıcak Hava",
  },
  {
    id: "havalandirma",
    kategori: "TAZE HAVA & İGK",
    baslik: "Havalandırma & Isı Geri Kazanım Cihazları",
    aciklama: "Kapalı ortamlara filtrelenmiş taze hava sağlarken egzoz havasındaki ısıyı geri kazanan yüksek verimli iklimlendirme santralleri. Projenize en uygun markayı birlikte seçiyoruz.",
    urunler: ["Isı Geri Kazanım (İGK) Santralleri", "Spiro Yuvarlak & Dikdörtgen Hava Kanalları", "Sığınak & Otopark Duman Egzoz Fanları"],
    markalar: "",
    gorsel: "/urunler/urun-havalandirma.jpg",
    gorselAlt: "Isı geri kazanımlı havalandırma cihazının kesit görünümü",
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
              Mitsubishi Electric, TCL, Buderus ve AIRNEX <br />
              <span className="text-teal-700 underline decoration-teal-300/80 decoration-4 underline-offset-8">
                İklimlendirme Teknolojileri.
              </span>
            </h1>
            <p className="text-base text-slate-600 leading-relaxed pt-2">
              {sirket.unvan}; Mitsubishi Electric ve TCL VRF sistemlerinden Buderus ısıtma teknolojilerine, AIRNEX mutfak havalandırma çözümlerine kadar projenizin tüm mekanik ürün ihtiyacını mühendislik güvencesiyle sağlar.
            </p>
          </div>

          {/* ÖNE ÇIKAN: AIRNEX MUTFAK HAVALANDIRMA */}
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm grid lg:grid-cols-2">
            <div className="relative h-56 sm:h-72 lg:h-auto bg-slate-950">
              <Image
                src="/airnex/airnex-mutfak.jpg"
                alt="AIRNEX elektrostatik hücreli aspiratör — endüstriyel mutfak uygulaması"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-8 space-y-4 flex flex-col justify-center">
              <span className="text-[11px] font-bold tracking-wider text-teal-700 uppercase">
                MUTFAK HAVALANDIRMA · MARKAMIZ
              </span>
              <h2 className="text-2xl font-bold text-slate-900">AIRNEX Elektrostatik Hücreli Aspiratör</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Restoran, otel ve endüstriyel mutfak egzozlarında yağ aerosolleri, duman ve ince partiküllerin kontrolü için elektrostatik filtrasyon hücreli, modüler ve servis dostu aspiratör sistemi.
              </p>
              <div className="space-y-2">
                {["Ön filtre + elektrostatik hücre + fan", "Opsiyonel aktif karbon / UV koku kademesi", "Izgara, fritöz, fırın ve proses egzozları"].map((u) => (
                  <div key={u} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                    <span>{u}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/airnex"
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm"
                >
                  Ürün Detayları →
                </Link>
                <Link
                  href="/iletisim"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-teal-700 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm"
                >
                  Fiyat Teklifi İsteyin →
                </Link>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {urunKategorileri.map((kat) => (
              <div
                key={kat.id}
                className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:shadow-lg hover:border-teal-500/40 transition-all duration-300 flex flex-col"
              >
                {kat.gorsel ? (
                  <div className="relative w-full aspect-[3/2] bg-slate-100">
                    <Image
                      src={kat.gorsel}
                      alt={kat.gorselAlt ?? kat.baslik}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[3/2] bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 flex flex-col items-center justify-center text-center px-6">
                    <span className="text-[11px] font-bold tracking-widest text-teal-300 uppercase">{kat.kategori}</span>
                    <span className="text-2xl font-bold text-white mt-2">{kat.gorselBaslik || kat.markalar}</span>
                  </div>
                )}
                <div className="p-8 space-y-6 flex flex-col justify-between flex-1">
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
                  {kat.markalar ? (
                    <p className="text-[10px] font-bold text-slate-400 font-mono">Marka: {kat.markalar}</p>
                  ) : (
                    <p className="text-[10px] font-bold text-slate-400 font-mono">Marka: Projeye uygun marka seçimi</p>
                  )}
                  <Link
                    href="/iletisim"
                    className="block w-full py-2.5 bg-slate-900 hover:bg-teal-700 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm"
                  >
                    Projeniz İçin Fiyat Teklifi İsteyin →
                  </Link>
                </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold">Projeniz İçin Toplu Cihaz Fiyatı Alın</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Mitsubishi Electric, TCL, Buderus ve AIRNEX cihaz listelerinizi gönderin, mühendislerimiz avantajlı fiyat teklifi hazırlasın.
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