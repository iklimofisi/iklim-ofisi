import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/HeroSlider";
import Link from "next/link";
import { getSirketAyarlari } from "@/lib/sirket";

export const dynamic = "force-dynamic";

export default async function Home() {
  const sirket = await getSirketAyarlari();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      {/* HEADER */}
      <Header />

      <main>
        {/* 1. GERÇEK ÜRÜN FOTOĞRAFLI SLIDER */}
        <section className="pt-8 pb-16 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6">
            <HeroSlider />
          </div>
        </section>

        {/* 2. HAKKIMIZDA ÖZETİ */}
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
                <h4 className="font-bold text-slate-900">Plaza İş Merkezi İklimlendirme</h4>
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

        {/* 5. ÇAĞRI BANNERI */}
        <section className="py-16 bg-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
            <h3 className="text-2xl sm:text-3xl font-bold">
              Projeniz İçin Doğru İklimlendirme Çözümünü Birlikte Planlayalım.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              İster yeni bir bina projesi ister mevcut sistem yenilemesi olsun; uzman ekibimiz ücretsiz keşif ve teklif hazırlığı için hazır.
            </p>
            <div>
              <Link
                href="/iletisim"
                className="inline-block px-8 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm rounded-lg transition-colors shadow-md"
              >
                Ücretsiz Keşif Formu Doldurun →
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}