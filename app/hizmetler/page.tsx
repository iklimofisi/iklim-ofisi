import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getSirketAyarlari } from "@/lib/sirket";

export const dynamic = "force-dynamic";

// YÜKSEK ÇÖZÜNÜRLÜKLÜ MEKANİK & İKLİMLENDİRME STOK FOTOĞRAFLARI
const mekanikHizmetler = [
  {
    id: "mekanik-tesisat",
    kategori: "ANAHTAR TESLİM MEKANİK TAAHHÜT",
    baslik: "Mekanik & Sıhhi Tesisat Çözümleri",
    gorsel: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    aciklama:
      "Binaların temiz su, pis su, yağmur gideri sıhhi tesisatları, yangın söndürme hatları, kazan daireleri ve borulama altyapılarının mühendislik standartlarında imali ve montajı.",
    maddeler: [
      "Sıhhi tesisat (Temiz & pis su hatları)",
      "Merkezi kazan dairesi ve kaskad ısıtma",
      "Yangın tesisatı ve hidrofor sistemleri",
      "Endüstriyel borulama ve vana grupları",
    ],
    rozet: "Anahtar Teslim",
  },
  {
    id: "klima-santral-havalandirma",
    kategori: "KLİMA SANTRALLERİ & İGK",
    baslik: "Klima Santrali (AHU) & Havalandırma",
    aciklama:
      "Fabrika, AVM, otel ve hijyenik alanlar için Isı Geri Kazanımlı Klima Santralleri (AHU), taze hava besleme, duman egzoz fanları ve spiro havalandırma kanalı montajı.",
    gorsel: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80",
    maddeler: [
      "Klima Santrali (AHU) montajı & otomasyonu",
      "Isı Geri Kazanım (İGK) üniteleri",
      "Spiro yuvarlak ve izoleli hava kanalları",
      "Sığınak ve otopark duman egzoz sistemleri",
    ],
    rozet: "AHU & Taze Hava",
  },
  {
    id: "vrf-sistemleri",
    kategori: "MERKEZİ İKLİMLENDİRME",
    baslik: "VRF / VRV Merkezi Sistemler",
    aciklama:
      "Plaza, otel, hastane ve geniş yapılarda her odayı bağımsız iklimlendiren Heat Pump ve Heat Recovery VRF dış ünite grupları, bakır borulama ve otomasyon altyapısı.",
    gorsel: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    maddeler: [
      "VRF / VRV dış ve iç ünite montajı",
      "İzolasyonlu azot testli bakır borulama",
      "Y-Branch ve Joint bağlantı grupları",
      "Merkezi dokunmatik otomasyon kumandaları",
    ],
    rozet: "VRF Uzmanlığı",
  },
  {
    id: "isi-pompasi",
    kategori: "YENİLENEBİLİR ISITMA",
    baslik: "Isı Pompası & Isıtma Sistemleri",
    aciklama:
      "Konut ve villalar için hava/su kaynaklı ısı pompaları, sulu yerden ısıtma tesisatları ve boylerli kullanım sıcak suyu entegrasyonu ile A+++ enerji verimliliği.",
    gorsel: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80",
    maddeler: [
      "Hava & su kaynaklı ısı pompaları (85°C)",
      "Sulu sistem yerden ısıtma projelendirme",
      "Kolektör grubu ve sirkülasyon pompaları",
      "Boyler ve güneş enerjisi entegrasyonu",
    ],
    rozet: "A+++ Tasarruf",
  },
  {
    id: "bireysel-ticari-klima",
    kategori: "BİREYSEL & TİCARİ KLİMA",
    baslik: "Bireysel & Ticari Klimalar",
    aciklama:
      "Duvar tipi, multi-split, kaset tipi, kanallı gizli tavan, konsol ve salon tipi klimaların keşfi, kapasite hesabı, montajı ve periyodik servis anlaşmaları.",
    gorsel: "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80",
    maddeler: [
      "Inverter duvar tipi & multi-split klimalar",
      "4 Yöne üflemeli kaset tipi iklimlendirme",
      "Gizli tavan kanallı & salon tipi klimalar",
      "Periyodik bakım ve gaz şarjı hizmeti",
    ],
    rozet: "Split & Kaset",
  },
  {
    id: "projelendirme",
    kategori: "MÜHENDİSLİK & DANIŞMANLIK",
    baslik: "Mekanik Projelendirme & Metraj",
    aciklama:
      "Mimari projelerinize tam uyumlu AutoCAD tabanlı mekanik tesisat projelendirmesi, ısı kaybı/kazancı hesapları, metraj cetvelleri ve şantiye süpervizörlüğü.",
    gorsel: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    maddeler: [
      "AutoCAD tabanlı mekanik proje çizimi",
      "Isı kaybı ve klima kapasite hesaplamaları",
      "Malzeme metrajı ve ihale şartnamesi hazırlığı",
      "Şantiye teknik danışmanlık ve denetim",
    ],
    rozet: "AutoCAD Proje",
  },
];

export default async function HizmetlerPage() {
  const sirket = await getSirketAyarlari();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      {/* HEADER */}
      <Header />

      <main className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          
          {/* SAYFA BAŞLIĞI VE TANITIM */}
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              KOMPLE MEKANİK TESİSAT & İKLİMLENDİRME
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              Mekanik Tesisatın Tamamı <br />
              <span className="text-teal-700 underline decoration-teal-300/80 decoration-4 underline-offset-8">
                Tek Çatı Altında.
              </span>
            </h1>
            <p className="text-base text-slate-600 leading-relaxed pt-2">
              {sirket.unvan}; konut, ofis, otel ve endüstriyel yapılarda sıhhi tesisattan klima santraline, VRF iklimlendirmeden ısı pompası ve havalandırmaya kadar mühendislik standartlarında anahtar teslim mekanik çözümler sunar.
            </p>
          </div>

          {/* FOTOĞRAFLI MÜHENDİSLİK HİZMET KARTLARI GRİDİ */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mekanikHizmetler.map((hizmet) => (
              <div
                key={hizmet.id}
                className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* STOK FOTOĞRAF ALANI */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={hizmet.gorsel}
                      alt={hizmet.baslik}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                    
                    <span className="absolute top-3 right-3 text-[10px] font-bold text-slate-900 bg-white/95 backdrop-blur-md border border-slate-200 px-2.5 py-1 rounded-md shadow-sm">
                      {hizmet.rozet}
                    </span>
                  </div>

                  {/* KART İÇERİĞİ */}
                  <div className="p-6 space-y-4">
                    <span className="text-[11px] font-bold tracking-wider text-teal-700 uppercase block">
                      {hizmet.kategori}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {hizmet.baslik}
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {hizmet.aciklama}
                    </p>

                    {/* MADDELER */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      {hizmet.maddeler.map((madde, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                          <span className="w-4 h-4 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                            ✓
                          </span>
                          <span>{madde}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* TEKLİF BUTONU */}
                <div className="p-6 pt-0">
                  <Link
                    href="/iletisim"
                    className="block w-full py-2.5 bg-slate-900 hover:bg-teal-700 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm"
                  >
                    Projeniz İçin Keşif & Teklif İsteyin →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* ÇAĞRI BANNERI */}
          <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold">Mekanik Projenizi Birlikte Planlayalım</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Mimari veya mekanik projenizi gönderin, uzman mühendislerimiz kapasite hesabı ve bütçe teklifini aynı gün hazırlasın.
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