import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/HeroSlider"; // YENİ SLIDER EKLENDİ
import Link from "next/link";
import { getSirketAyarlari } from "@/lib/sirket";

export const dynamic = "force-dynamic";

export default async function Home() {
  const sirket = await getSirketAyarlari();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      {/* 1. ÜST HEADER */}
      <Header />

      <main>
        {/* 2. KAYDIRMALI GERÇEK ÜRÜN GÖRSELLERİ (HERO SLIDER) */}
        <section className="pt-8 pb-16 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6">
            <HeroSlider />
          </div>
        </section>

        {/* ☕ 3. KAHVE DAVETİ BANNERI (ADRES PANEL KONTROLÜNDE) */}
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

        {/* 4. HAKKIMIZDA ÖZETİ */}
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

        {/* 5. MÜHENDİSLİK HİZMETLERİMİZ */}
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

      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}