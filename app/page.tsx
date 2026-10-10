import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import UrunSlider from "@/components/UrunSlider";
import { getSirketAyarlari } from "@/lib/sirket";

export const dynamic = "force-dynamic";

// www.iklimofisi.com ve iklimofisi.com aynı sayfayı gösterdiği için Google'a asıl adres bildirilir
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const sirket = await getSirketAyarlari();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      {/* 1. ÜST HEADER */}
      <Header />

      <main>
        {/* 2. MANŞET / HERO ALANI */}
        <section className="pt-8 pb-14 md:pt-12 md:pb-20 bg-white border-b border-slate-200/80 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              
              {/* Sol Taraf: Kayan Ürün Görselleri + Kısa Metin */}
              <div className="lg:col-span-7 space-y-6">
                <UrunSlider />

                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                    VRF · KLİMA · ISI POMPASI · YERDEN ISITMA
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-950 leading-tight">
                    VRF, klima ve ısı pompasında{" "}
                    <span className="text-teal-700">doğru sistemi</span> kuruyoruz.
                  </h1>

                  <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                    {sirket.unvan}; konut, ofis, otel ve ticari yapılarda Mitsubishi Electric ve TCL VRF ve klima sistemleri, multi klima, ısı pompası, Fraenkische yerden ısıtma ve kazan dairesi yenileme projelerini keşiften montaja anahtar teslim yürütür.
                  </p>

                  {/* Butonlar */}
                  <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Link
                      href="/iletisim"
                      className="px-7 py-3.5 rounded-lg bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 shadow-sm transition-all text-center"
                    >
                      Ücretsiz Keşif & Teklif İsteyin →
                    </Link>
                    <Link
                      href="/hizmetler"
                      className="px-7 py-3.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-all text-center"
                    >
                      Hizmetlerimizi İnceleyin
                    </Link>
                  </div>
                </div>
              </div>

              {/* Sağ Taraf: İnteraktif İklim Kontrol Kartı */}
              <div className="lg:col-span-5">
                <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl border border-slate-800 space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                      <p className="text-[11px] font-bold text-teal-400 uppercase tracking-widest">İklim Ofisi Çalışma Aralığı</p>
                      <h3 className="text-lg font-bold text-white mt-0.5">-20°C ile +55°C Arası Tam Kontrol</h3>
                    </div>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Dış hava koşulları ne olursa olsun, Inverter VRF ve Isı Pompası teknolojisiyle iç mekanlarda ideal nem ve sıcaklık dengesini sabit tutuyoruz.
                  </p>

                  {/* Sıcaklık Skalası */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
                    <div className="flex justify-between text-[11px] font-mono font-bold text-slate-400">
                      <span className="text-cyan-400">-20°C Soğuk</span>
                      <span className="text-teal-300">İdeal 22°C</span>
                      <span className="text-amber-400">+55°C Sıcak</span>
                    </div>
                    <div className="h-2 w-full bg-gradient-to-r from-cyan-500 via-teal-400 to-amber-500 rounded-full relative">
                      <div className="absolute left-1/2 -top-1 w-4 h-4 rounded-full bg-white border-2 border-slate-900 shadow-md transform -translate-x-1/2" />
                    </div>
                    <p className="text-[10px] text-center text-slate-400 font-mono">
                      Akıllı Termostat & Inverter Kompresör Hassasiyeti
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800">
                      <p className="font-bold text-slate-200">VRF Merkezi Sistem</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Mitsubishi Electric · TCL</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800">
                      <p className="font-bold text-slate-200">Klima & Multi Klima</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Duvar · Kaset · Kanallı</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800">
                      <p className="font-bold text-slate-200">Isı Pompası</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Buderus ve diğer markalar</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800">
                      <p className="font-bold text-slate-200">Yerden Isıtma</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Fraenkische</p>
                    </div>
                  </div>

                  <Link
                    href="/iletisim"
                    className="block w-full py-3 bg-teal-600 hover:bg-teal-500 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm"
                  >
                    Projeniz İçin Keşif İsteyin →
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. HAKKIMIZDA ÖZETİ (HİZMETLERDEN ÖNE ALINDI, MARKA VURGULARI EKLENDİ) */}
        <section className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-4">
                <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">20+ YILLIK MÜHENDİSLİK GÜCÜ</p>
                <h2 className="text-3xl font-bold text-slate-900">Mühendislik Kökenli Yönetim Anlayışı</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  20 yılı aşkın kıdemli Makine Mühendisi ve Proje Mühendisi kurucu ortaklarımızın öncülüğünde; Mitsubishi Electric ve TCL VRF ve klima sistemleri, ısı pompaları, Fraenkische yerden ısıtma ve Buderus kazan dairesi çözümleriyle yapının ısı kayıp/kazanç hesabına tam uygun iklimlendirme ve ısıtma sistemleri kuruyoruz.
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
                  <p>✓ Mitsubishi Electric ve TCL VRF & klima uzmanlığı</p>
                  <p>✓ Isı pompası, Fraenkische yerden ısıtma ve kazan dairesi yenileme</p>
                  <p>✓ AutoCAD tabanlı çizim, metraj ve şeffaf bütçelendirme</p>
                  <p>✓ Tesisatta azot basınç testi, vakumlama ve 2 yıl tam garanti</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. MÜHENDİSLİK HİZMETLERİMİZ (MARKA VURGULARI EKLENDİ) */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <p className="text-xs font-bold tracking-widest text-teal-700 uppercase mb-2">HİZMETLERİMİZ</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  VRF, Klima, Isı Pompası ve Isıtma Çözümlerimiz
                </h2>
              </div>
              <Link href="/hizmetler" className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1">
                <span>Tüm Hizmetleri Gör</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { no: "01", baslik: "VRF / VRV Sistemleri", metin: "Mitsubishi Electric City Multi ve TCL VRF ile otel, plaza, hastane ve konut projelerinde merkezi iklimlendirme.", href: "/hizmetler#vrf", one: true },
                { no: "02", baslik: "Klima & Multi Klima", metin: "Mitsubishi Electric ve TCL duvar tipi, multi split, kaset ve kanallı klimalarda keşif, kapasite hesabı ve montaj.", href: "/hizmetler#klima", one: true },
                { no: "03", baslik: "Isı Pompası", metin: "Konut ve villalar için hava kaynaklı ısı pompaları. Buderus ve projeye uygun diğer markalarla anahtar teslim.", href: "/hizmetler#isi-pompasi", one: true },
                { no: "04", baslik: "Yerden Isıtma Sistemleri", metin: "Fraenkische yerden ısıtma boru ve kolektör sistemleri; ısı pompası ve kazanla birlikte projelendirme.", href: "/hizmetler#yerden-isitma", one: true },
                { no: "05", baslik: "Kazan Dairesi Yenileme", metin: "Eski kazan dairelerinin Buderus yoğuşmalı kaskad kazanlarla yenilenmesi, pompa ve kollektör grupları.", href: "/hizmetler#kazan-dairesi", one: false },
                { no: "06", baslik: "Havalandırma & Mekanik Tesisat", metin: "Isı geri kazanımlı havalandırma, klima santrali (AHU), sıhhi tesisat ve borulama altyapısı.", href: "/hizmetler#havalandirma", one: false },
              ].map((h) => (
                <div key={h.no} className="bg-white border border-slate-200 p-6 rounded-xl hover:border-teal-500/40 hover:shadow-md transition-all space-y-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
                      h.one ? "bg-teal-50 border border-teal-100 text-teal-700" : "bg-slate-100 border border-slate-200 text-slate-700"
                    }`}
                  >
                    {h.no}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{h.baslik}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{h.metin}</p>
                  <Link href={h.href} className="inline-block text-xs font-semibold text-teal-700 hover:underline">Detaylı İncele →</Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5a. YERDEN ISITMA (FRAENKISCHE) & KAZAN DAİRESİ YENİLEME — öne çıkan */}
        <section className="py-20 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 bg-slate-900 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-8 sm:p-10 space-y-5">
                <p className="text-xs font-bold tracking-widest text-amber-400 uppercase">YERDEN ISITMA · FRAENKISCHE</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Yerden Isıtma ve Kazan Dairesi Yenileme
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Fraenkische yerden ısıtma sistemleriyle konut, villa ve ticari alanlarda zeminden eşit ve konforlu ısı. Isı pompası ya da yoğuşmalı
                  kazanla birlikte projelendirir; eski kazan dairelerini Buderus kaskad sistemlerle yeniliyoruz.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  {[
                    "Fraenkische boru ve kolektör sistemleri",
                    "Isı kaybı hesabına göre boru aralığı",
                    "Isı pompası ile düşük sıcaklıkta yüksek verim",
                    "Buderus yoğuşmalı kaskad kazan daireleri",
                  ].map((m) => (
                    <div key={m} className="p-3 rounded-lg bg-slate-800/60 border border-slate-800 text-slate-200 font-semibold">
                      {m}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <Link href="/hizmetler#yerden-isitma" className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs text-center transition-colors">
                    Yerden Isıtma Hizmetimiz →
                  </Link>
                  <Link href="/iletisim" className="px-6 py-3 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 font-bold text-xs text-center transition-colors">
                    Ücretsiz Keşif İsteyin
                  </Link>
                </div>
              </div>
              <div className="relative min-h-[16rem] bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 flex items-center justify-center p-8">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage: "linear-gradient(#fbbf24 1px, transparent 1px), linear-gradient(90deg, #fbbf24 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
                <svg className="relative w-full max-w-md h-auto" viewBox="0 0 200 110" fill="none" aria-hidden>
                  <rect x="8" y="30" width="34" height="50" rx="4" stroke="#fbbf24" strokeWidth="2" fill="#0f172a" />
                  <path d="M16 70c3-7 7-7 7-14s5-7 5-11" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" />
                  <path d="M42 40h14M42 70h14" stroke="#f59e0b" strokeWidth="2" />
                  <path
                    d="M56 18h132v12H66v12h122v12H66v12h122v12H66v12h122"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* 5. ENDÜSTRİYEL MUTFAK ÇÖZÜMLERİ (AIRNEX, VERTA) — ana işlerden sonra, daha sade */}
        <section className="py-16 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-8">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase mb-2">ENDÜSTRİYEL MUTFAK ÇÖZÜMLERİ</p>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Restoran ve Otel Mutfakları İçin</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Link href="/airnex" className="group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex hover:border-teal-500/40 hover:shadow-md transition-all">
                <div className="relative w-32 sm:w-40 shrink-0 bg-slate-900">
                  <Image src="/airnex/airnex-mutfak.jpg" alt="AIRNEX elektrostatik hücreli aspiratör" fill sizes="160px" className="object-cover" />
                </div>
                <div className="p-5 space-y-2">
                  <p className="text-[11px] font-bold tracking-wider text-teal-700 uppercase">AIRNEX · Mutfak Havalandırma</p>
                  <h3 className="font-bold text-slate-900">Elektrostatik Hücreli Aspiratör</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">Mutfak egzozunda yağ, duman ve kokunun elektrostatik filtrasyonla kontrolü.</p>
                  <span className="inline-block text-xs font-semibold text-teal-700 group-hover:underline">İncele →</span>
                </div>
              </Link>
              <Link href="/verta" className="group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex hover:border-teal-500/40 hover:shadow-md transition-all">
                <div className="relative w-32 sm:w-40 shrink-0 bg-slate-900">
                  <Image src="/slider/slider-verta-firin.jpg" alt="VERTA konveksiyonel fırın" fill sizes="160px" className="object-cover" />
                </div>
                <div className="p-5 space-y-2">
                  <p className="text-[11px] font-bold tracking-wider text-teal-700 uppercase">VERTA · Endüstriyel Mutfak</p>
                  <h3 className="font-bold text-slate-900">Konveksiyonel Fırınlar</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">Pastane, restoran ve oteller için 4, 6 ve 10 tepsili profesyonel fırınlar.</p>
                  <span className="inline-block text-xs font-semibold text-teal-700 group-hover:underline">İncele →</span>
                </div>
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