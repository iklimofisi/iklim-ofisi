import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getSirketAyarlari } from "@/lib/sirket";

export const dynamic = "force-dynamic";

export default async function HakkimizdaPage() {
  const sirket = await getSirketAyarlari();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      {/* HEADER */}
      <Header />

      <main className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          
          {/* 1. HERO BÖLÜMÜ */}
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              MÜHENDİSLİK KÖKENLİ YÖNETİM
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              20 Yılı Aşan Saha Deneyimi ve <br />
              <span className="text-teal-700 underline decoration-teal-300/80 decoration-4 underline-offset-8">
                Mühendislik Disiplini.
              </span>
            </h1>
            <p className="text-base text-slate-600 leading-relaxed pt-2">
              {sirket.unvan}; iklimlendirme, VRF merkezi sistemler, ısı pompaları, havalandırma ve mekanik tesisat alanında mühendislik kökenli yönetim anlayışıyla kurulmuştur. Teorik hesabı 20 yılı aşan şantiye tecrübesiyle birleştirerek projeniz için en doğru iklimi oluşturuyoruz.
            </p>
          </div>

          {/* 2. KURUCU ORTAKLAR / YÖNETİM MİMARİSİ */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 shadow-sm space-y-8">
            <div className="border-b border-slate-100 pb-6">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase mb-1">YÖNETİM & UZMANLIK</p>
              <h2 className="text-2xl font-bold text-slate-900">Kurucu Ortaklarımızın Mühendislik Gücü</h2>
              <p className="text-xs text-slate-500 mt-1">Sektörde 20 yılı devirmiş uzmanlık ve mühendislik yaklaşımıyla her projeye bizzat liderlik ediyoruz.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              
              {/* ORTAK 1: 20 YILLIK MAKİNE MÜHENDİSİ */}
              <div className="bg-slate-50/80 border border-slate-200/80 p-6 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Makine Mühendisi</h3>
                    <p className="text-xs font-semibold text-teal-700">Kurucu Ortak / Kıdemli Mühendis</p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md font-mono">
                    20+ Yıl Deneyim
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  İklimlendirme ve mekanik tesisat sektöründe 20 yılı aşkın profesyonel mühendislik ve şantiye yöneticiliği tecrübesine sahiptir. Merkezi VRF/VRV sistemleri, endüstriyel havalandırma tasarımları ve büyük ölçekli mekanik projelerin teknik süreçlerine doğrudan liderlik etmektedir.
                </p>
              </div>

              {/* ORTAK 2: MÜHENDİS */}
              <div className="bg-slate-50/80 border border-slate-200/80 p-6 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Proje & Uygulama Mühendisi</h3>
                    <p className="text-xs font-semibold text-teal-700">Kurucu Ortak / Mühendis</p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md font-mono">
                    Mühendislik Disiplini
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  AutoCAD ve Revit tabanlı mekanik projelendirme, hassas ısı kaybı & kazancı hesaplamaları, metraj hazırlığı ve müşteri süreçleri yönetiminden sorumludur. Müşteri ihtiyacına en uygun cihaz seçimi ve şeffaf tekliflerin hazırlanmasını yürütür.
                </p>
              </div>

            </div>
          </div>

          {/* 3. FİLOZOFİ VE İLKELERİMİZ */}
          <div className="space-y-8">
            <div>
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase mb-1">İLKELERİMİZ</p>
              <h2 className="text-2xl font-bold text-slate-900">Neden Mühendislik Odaklı Çalışıyoruz?</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-3">
                <span className="text-xs font-bold text-teal-700 font-mono bg-teal-50 px-2.5 py-1 rounded">01</span>
                <h4 className="font-bold text-slate-900 text-sm">Hassas Hesaplama</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ezbere değil; yapının yönüne, cam yüzeylerine ve kullanım amacına göre gerçek ısı kaybı hesabı yapıyoruz.
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-3">
                <span className="text-xs font-bold text-teal-700 font-mono bg-teal-50 px-2.5 py-1 rounded">02</span>
                <h4 className="font-bold text-slate-900 text-sm">Şeffaf Bütçelendirme</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sonradan sürpriz maliyet çıkarmayan, kalem kalem detaylandırılmış teknik şartname ve metraj sunuyoruz.
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-3">
                <span className="text-xs font-bold text-teal-700 font-mono bg-teal-50 px-2.5 py-1 rounded">03</span>
                <h4 className="font-bold text-slate-900 text-sm">Kusursuz Tesisat</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tesisatta izolasyon, boru çapları, azot basınç ve vakumlama testlerini standartlara uygun bizzat denetliyoruz.
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-3">
                <span className="text-xs font-bold text-teal-700 font-mono bg-teal-50 px-2.5 py-1 rounded">04</span>
                <h4 className="font-bold text-slate-900 text-sm">Satış Sonrası Destek</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sistemi teslim edip gitmiyoruz; 2 yıl tam garanti ve periyodik servis anlaşmalarıyla sisteminizi koruyoruz.
                </p>
              </div>
            </div>
          </div>

          {/* 4. ÇAĞRI BANNERI */}
          <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold">Projenizde Mühendislik Kalitesini Hissedin.</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Ücretsiz keşif için ekibimizle iletişime geçin, projenizin kapasite ve bütçe analizini yerinde yapalım.
              </p>
            </div>
            <Link
              href="/iletisim"
              className="shrink-0 px-7 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm rounded-lg transition-colors shadow-md"
            >
              Ücretsiz Keşif İsteğin →
            </Link>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}