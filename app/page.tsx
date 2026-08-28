import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getSirketAyarlari } from "@/lib/sirket";

export const dynamic = "force-dynamic";

export default async function Home() {
  const sirket = await getSirketAyarlari();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      <Header />

      <main>
        {/* 1. HERO ALANI */}
        <section className="pt-12 pb-16 md:pt-20 md:pb-24 bg-white border-b border-slate-200/80 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                  MÜHENDİSLİK & İKLİMLENDİRME ÇÖZÜMLERİ
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 leading-[1.12]">
                  Her lokasyon için doğru <br />
                  <span className="text-teal-700 underline decoration-teal-300/80 decoration-4 underline-offset-8">
                    iklimlendirme sistemini
                  </span> sağlıyoruz.
                </h1>

                <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                  {sirket.unvan}; konut, ofis, otel ve endüstriyel tesislerde klima, VRF merkezi soğutma, ısı pompası ve havalandırma projelerini keşiften montaja anahtar teslim yürütür.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <Link
                    href="/iletisim"
                    className="px-8 py-4 rounded-lg bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 shadow-sm transition-all text-center"
                  >
                    Ücretsiz Keşif & Teklif İsteyin →
                  </Link>
                  <Link
                    href="/hizmetler"
                    className="px-8 py-4 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-all text-center"
                  >
                    Hizmetlerimizi İnceleyin
                  </Link>
                </div>

                <div className="pt-8 border-t border-slate-100 grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-2xl font-bold text-slate-900 font-mono">+500</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Tamamlanan Proje</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-teal-700 font-mono">A+++</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Enerji Verimliliği</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 font-mono">7/24</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Teknik Servis Desteği</p>
                  </div>
                </div>
              </div>

              {/* Sağ Taraf: İnteraktif Kart */}
              <div className="lg:col-span-5">
                <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl border border-slate-800 space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                      <p className="text-[11px] font-bold text-teal-400 uppercase tracking-widest">İklim Ofisi Çalışma Aralığı</p>
                      <h3 className="text-lg font-bold text-white mt-0.5">-5°C ile +35°C Arası Tam Kontrol</h3>
                    </div>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Dış hava koşulları ne olursa olsun, Inverter VRF ve Isı Pompası teknolojisiyle iç mekanlarda ideal nem ve sıcaklık dengesini sabit tutuyoruz.
                  </p>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
                    <div className="flex justify-between text-[11px] font-mono font-bold text-slate-400">
                      <span className="text-cyan-400">-5°C Soğuk</span>
                      <span className="text-teal-300">İdeal 22°C</span>
                      <span className="text-amber-400">+35°C Sıcak</span>
                    </div>
                    <div className="h-2 w-full bg-gradient-to-r from-cyan-500 via-teal-400 to-amber-500 rounded-full relative">
                      <div className="absolute left-1/2 -top-1 w-4 h-4 rounded-full bg-white border-2 border-slate-900 shadow-md transform -translate-x-1/2" />
                    </div>
                    <p className="text-[10px] text-center text-slate-400 font-mono">
                      Akıllı Termostat & Inverter Kompresör Hassasiyeti
                    </p>
                  </div>

                  <Link
                    href="/iletisim"
                    className="block w-full py-3 bg-teal-600 hover:bg-teal-500 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm"
                  >
                    Projeniz İçin Keşif İsteğin →
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ☕ KAHVE DAVETİ BANNERI */}
        <section className="py-8 bg-slate-900 text-white border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 sm:p-8 rounded-2xl border border-teal-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-400 flex items-center justify-center text-2xl shrink-0 font-bold">
                  ☕
                </div>
                <div>
                  <p className="text-xs font-bold text-teal-400 uppercase tracking-widest">SİZİ MİSAFİR EDELİM</p>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                    Ofisimize kahve içmeye davetlisiniz :)
                  </h3>
                  {sirket.adres && (
                    <p className="text-xs text-slate-300 mt-1">
                      📍 <strong className="text-white">{sirket.adres}</strong> adresindeki ofisimizde projenizi yüz yüze değerlendirelim.
                    </p>
                  )}
                </div>
              </div>

              <Link
                href="/iletisim"
                className="shrink-0 px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md"
              >
                Konum & İletişim Bilgileri →
              </Link>
            </div>
          </div>
        </section>

        {/* 2. HAKKIMIZDA ÖZETİ (HİZMETLERDEN ÖNE ALINDI) */}
        <section className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-4">
                <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">20+ YILLIK MÜHENDİSLİK GÜCÜ</p>
                <h2 className="text-3xl font-bold text-slate-900">Mühendislik Kökenli Yönetim Anlayışı</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  20 yılı aşkın kıdemli Makine Mühendisi ve Proje Mühendisi kurucu ortaklarımızın öncülüğünde; ezbere değil, yapının ısı kayıp/kazanç hesabına tam uygun mekanik tesisat çözümleri üretiyoruz.
                </p>
                <div>
                  <Link href="/hakkimizda" className="inline-block text-xs font-bold text-teal-700 hover:underline">
                    Hakkımızda Detaylarını İnceleyin →
                  </Link>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">Disiplinli Mühendislik İlkelerimiz</h4>
                <div className="space-y-2 text-xs text-slate-600">
                  <p>✓ 20+ yıllık saha tecrübesiyle hatasız kapasite seçimi</p>
                  <p>✓ AutoCAD tabanlı çizim, metraj ve şeffaf bütçelendirme</p>
                  <p>✓ Tesisatta azot basınç testi, vakumlama ve 2 yıl tam garanti</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. MÜHENDİSLİK HİZMETLERİMİZ */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <p className="text-xs font-bold tracking-widest text-teal-700 uppercase mb-2">HİZMETLERİMİZ</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Mekanik Tesisat ve İklimlendirme Çözümlerimiz
                </h2>
              </div>
              <Link href="/hizmetler" className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1">
                <span>Tüm Hizmetleri Gör</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-slate-200 p-6 rounded-xl hover:border-teal-500/40 hover:shadow-md transition-all space-y-4">
                <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-mono font-bold text-sm">01</div>
                <h3 className="text-lg font-bold text-slate-900">Mekanik & Sıhhi Tesisat</h3>
                <p className="text-xs text-slate-600 leading-relaxed">Sıhhi tesisat, yangın hatları, kazan daireleri ve borulama altyapısı.</p>
                <Link href="/hizmetler" className="inline-block text-xs font-semibold text-teal-700 hover:underline">Detaylı İncele →</Link>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-xl hover:border-teal-500/40 hover:shadow-md transition-all space-y-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-mono font-bold text-sm">02</div>
                <h3 className="text-lg font-bold text-slate-900">VRF / VRV Sistemleri</h3>
                <p className="text-xs text-slate-600 leading-relaxed">Otel, plaza ve binalarda her odayı bağımsız iklimlendiren merkezi sistemler.</p>
                <Link href="/hizmetler" className="inline-block text-xs font-semibold text-teal-700 hover:underline">Detaylı İncele →</Link>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-xl hover:border-teal-500/40 hover:shadow-md transition-all space-y-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-mono font-bold text-sm">03</div>
                <h3 className="text-lg font-bold text-slate-900">Havalandırma & AHU</h3>
                <p className="text-xs text-slate-600 leading-relaxed">Klima santralleri (AHU), ısı geri kazanım üniteleri ve spiro kanal imali.</p>
                <Link href="/hizmetler" className="inline-block text-xs font-semibold text-teal-700 hover:underline">Detaylı İncele →</Link>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-xl hover:border-teal-500/40 hover:shadow-md transition-all space-y-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-mono font-bold text-sm">04</div>
                <h3 className="text-lg font-bold text-slate-900">Isı Pompası & Isıtma</h3>
                <p className="text-xs text-slate-600 leading-relaxed">Hava/su kaynaklı ısı pompaları, sulu yerden ısıtma ve kaskad sistemler.</p>
                <Link href="/hizmetler" className="inline-block text-xs font-semibold text-teal-700 hover:underline">Detaylı İncele →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4. REFERANSLAR ÖZETİ */}
        <section className="py-20 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <div>
                <p className="text-xs font-bold tracking-widest text-teal-700 uppercase mb-2">SAHA TECRÜBEMİZ</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Tamamlanan Referans Projelerimiz</h2>
              </div>
              <Link href="/referanslar" className="text-xs font-bold text-teal-700 hover:underline">Tüm Projeleri Gör →</Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-teal-700">VRF MERKEZİ SİSTEM</span>
                <h4 className="font-bold text-slate-900">Nurol Tower Plaza İklimlendirme</h4>
                <p className="text-xs text-slate-500">29 Katlı plaza projesi Heat Recovery VRF iklimlendirme altyapısı.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-teal-700">HAVALANDIRMA & İGK</span>
                <h4 className="font-bold text-slate-900">Vadistanbul Ticaret Merkezi</h4>
                <p className="text-xs text-slate-500">Isı geri kazanımlı taze hava santralleri ve spiro kanal imalatı.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-teal-700">ISI POMPASI & ISITMA</span>
                <h4 className="font-bold text-slate-900">Bodrum Yalıkavak Villa Kompleksi</h4>
                <p className="text-xs text-slate-500">Hava kaynaklı ısı pompası ve sulu yerden ısıtma entegrasyonu.</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}