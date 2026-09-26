import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AIRNEX Elektrostatik Hücreli Aspiratör — Mutfak Havalandırma",
  description:
    "AIRNEX elektrostatik hücreli aspiratör: restoran, otel ve endüstriyel mutfak egzozlarında yağ aerosolleri, duman ve ince partiküllerin kontrolü için modüler filtrasyon sistemi. Projelendirme ve anahtar teslim kurulum.",
  alternates: { canonical: "/airnex" },
  openGraph: {
    title: "AIRNEX Elektrostatik Hücreli Aspiratör | İklim Ofisi",
    description:
      "Endüstriyel mutfaklar için elektrostatik filtrasyonlu egzoz çözümü. Daha temiz egzoz havası, verimli filtrasyon, kolay servis.",
    url: "https://iklimofisi.com/airnex",
    images: [{ url: "/airnex/airnex-mutfak.jpg", width: 1024, height: 640, alt: "AIRNEX elektrostatik hücreli aspiratör" }],
  },
};

const OZELLIKLER = [
  "Modüler ve servis erişimi düşünülmüş gövde yapısı",
  "Çıkarılabilir elektrostatik toplama hücreleri",
  "Mutfak egzozu ve uygun proses egzozları için projelendirilebilir yapı",
  "Fan ve otomasyon bileşenleriyle birlikte sistem çözümü",
  "Kullanım yoğunluğuna göre planlanabilen periyodik bakım",
];

const ADIMLAR = [
  { no: "01", baslik: "Ön Filtre", metin: "Büyük yağ damlacıkları ve kaba partiküller ilk kademede tutulur." },
  { no: "02", baslik: "İyonizasyon", metin: "İnce partiküller elektriksel olarak yüklenir." },
  { no: "03", baslik: "Toplama Hücresi", metin: "Yüklü partiküller kolektör plakalarına çekilerek tutulur." },
  { no: "04", baslik: "Fan / Çıkış", metin: "Filtrelenmiş hava, sistem fanı üzerinden egzoza gönderilir." },
];

const UYGULAMALAR = [
  { alan: "Restoran & endüstriyel mutfak", amac: "Pişirme kaynaklı yağ aerosolleri ve dumanın kontrolüne yardımcı filtrasyon" },
  { alan: "Izgara / mangal", amac: "Yoğun duman ve yağ yükü bulunan egzoz hatları" },
  { alan: "Fritöz / kızartma", amac: "Yağ buharı ve ince partikül kontrolü" },
  { alan: "Fırın / pişirme hatları", amac: "Uygun proses koşullarında partikül ve duman kontrolü" },
  { alan: "Proses egzozu", amac: "Partikül ağırlıklı, uygun sıcaklık ve kimyasal şartlardaki uygulamalar" },
];

const SISTEM = ["Davlumbaz", "Ön Filtre", "ESP Hücre", "Koku Kademesi (ops.)", "Fan"];

const BAKIM = [
  "Bakım öncesi enerji kesilir ve yüksek gerilim bölümünün güvenli olduğu doğrulanır.",
  "Ön filtre ve elektrostatik hücreler kirlilik durumuna göre kontrol edilir.",
  "Temizlenen hücrelerin tamamen kuruduğu doğrulanır.",
  "Elektrik bağlantıları, izolatörler ve güç ünitesi kontrolleri yetkili personel tarafından yapılır.",
];

const PROJE_BILGILERI = [
  { parametre: "Hava debisi", birim: "m³/h" },
  { parametre: "Toplam basınç", birim: "Pa" },
  { parametre: "Kanal ölçüsü", birim: "mm × mm" },
  { parametre: "Egzoz sıcaklığı", birim: "°C" },
  { parametre: "Pişirme / proses tipi", birim: "Izgara, fritöz, ocak, fırın" },
  { parametre: "Çalışma süresi", birim: "saat/gün" },
];

function Tik() {
  return (
    <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
      ✓
    </span>
  );
}

export default function AirnexPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white">
      <Header />

      <main>
        {/* 1. HERO */}
        <section className="bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                MUTFAK HAVALANDIRMA · MARKAMIZ
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
                AIRNEX<sup className="text-base align-super">®</sup> Elektrostatik Hücreli Aspiratör
              </h1>
              <p className="text-lg font-semibold text-teal-700">
                Daha temiz egzoz havası için elektrostatik filtrasyon teknolojisi.
              </p>
              <p className="text-base text-slate-600 leading-relaxed">
                Restoran, otel ve endüstriyel mutfaklarda pişirme kaynaklı yağ aerosolleri, duman ve ince partiküllerin kontrolüne yardımcı olan; ön filtre, elektrostatik hücre, fan ve opsiyonel ek filtrasyon kademeleriyle projeye özel kurgulanan modüler aspiratör sistemi.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {["Temiz Hava", "Verimli Filtrasyon", "Güvenilir Performans", "Uzun Ömürlü Sistem"].map((d) => (
                  <div key={d} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center font-bold text-slate-700">
                    {d}
                  </div>
                ))}
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/iletisim"
                  className="px-8 py-4 rounded-lg bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 shadow-sm transition-all text-center"
                >
                  Mutfağınız İçin Teklif İsteyin →
                </Link>
                <a
                  href="#proje-bilgileri"
                  className="px-8 py-4 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-all text-center"
                >
                  Proje İçin Gerekli Bilgiler
                </a>
              </div>
            </div>

            <div className="relative w-full aspect-[8/5] rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900">
              <Image
                src="/airnex/airnex-mutfak.jpg"
                alt="Endüstriyel mutfakta AIRNEX elektrostatik hücreli aspiratör ünitesi"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* 2. NEDİR & ÖZELLİKLER */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">ÜRÜN</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Elektrostatik hücreli aspiratör nedir?</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                AIRNEX, aspirasyon sistemi içerisinde bulunan yağ aerosolleri, duman ve ince partiküllerin kontrolüne yardımcı olmak amacıyla elektrostatik filtrasyon hücreleri kullanan bir sistemdir. Sistem mimarisi, uygulamaya göre ön filtre, elektrostatik hücre, fan ve opsiyonel ek filtrasyon kademeleriyle oluşturulabilir.
              </p>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">Öne çıkan özellikler</h3>
                {OZELLIKLER.map((o) => (
                  <div key={o} className="flex items-start gap-2 text-xs text-slate-700">
                    <Tik />
                    <span>{o}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
              <Image
                src="/airnex/airnex-kesit.jpg"
                alt="AIRNEX modüler gövde ve çıkarılabilir hücre yapısı"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* 3. ÇALIŞMA PRENSİBİ */}
        <section className="py-16 md:py-20 bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-6 space-y-10">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">ÇALIŞMA PRENSİBİ</p>
              <h2 className="text-2xl sm:text-3xl font-bold">Dört kademede temiz egzoz havası</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {ADIMLAR.map((a) => (
                <div key={a.no} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
                  <span className="inline-flex w-10 h-10 rounded-lg bg-teal-600 text-white items-center justify-center font-mono font-bold text-sm">
                    {a.no}
                  </span>
                  <h3 className="font-bold text-white">{a.baslik}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{a.metin}</p>
                </div>
              ))}
            </div>

            <div className="relative w-full aspect-[2/1] max-w-4xl mx-auto rounded-2xl overflow-hidden bg-white">
              <Image
                src="/airnex/airnex-calisma-prensibi.jpg"
                alt="AIRNEX çalışma prensibi: ön filtre, iyonizasyon hücresi, toplama hücresi ve fan"
                fill
                sizes="(min-width: 1024px) 56rem, 100vw"
                className="object-contain"
              />
            </div>
          </div>
        </section>

        {/* 4. UYGULAMA ALANLARI */}
        <section className="py-16 md:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 space-y-8">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">UYGULAMA ALANLARI</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Nerelerde kullanılır?</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {UYGULAMALAR.map((u) => (
                <div key={u.alan} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2 hover:border-teal-500/40 transition-colors">
                  <h3 className="font-bold text-slate-900 text-sm">{u.alan}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{u.amac}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. SİSTEM ÇÖZÜMÜ & KOKU KONTROLÜ */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-6 space-y-10">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">SİSTEM ÇÖZÜMÜ</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Tipik çok kademeli egzoz mimarisi</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Davlumbazdan fana kadar tüm hattı tek elden projelendirip kuruyoruz.
              </p>
            </div>

            <ol className="flex flex-col md:flex-row md:items-stretch gap-3">
              {SISTEM.map((k, i) => (
                <li key={k} className="flex md:flex-1 items-center gap-3">
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 text-center">
                    <span className="block text-[10px] font-mono font-bold text-teal-700">{String(i + 1).padStart(2, "0")}</span>
                    <span className="block text-sm font-bold text-slate-900 mt-1">{k}</span>
                  </div>
                  {i < SISTEM.length - 1 && (
                    <span aria-hidden className="hidden md:inline-block text-teal-600 font-bold">→</span>
                  )}
                </li>
              ))}
            </ol>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <h3 className="font-bold text-slate-900">Koku kontrolü hakkında</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Elektrostatik filtrasyon esas olarak partikül fazındaki kirleticilerin kontrolüne yöneliktir. Gaz fazındaki koku bileşenleri için tek başına yeterli olmayabilir. Gerektiğinde aktif karbon, UV veya başka uygun bir gaz faz çözümü ayrıca projelendirilir.
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <h3 className="font-bold text-slate-900">Hücre yapısı & bakım</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  AIRNEX hücreli yapı, elektrostatik filtrasyon bölümünün bakım ve temizlik amacıyla erişilebilir olmasını hedefleyen modüler bir tasarıma sahiptir.
                </p>
                <div className="space-y-2">
                  {BAKIM.map((b) => (
                    <div key={b} className="flex items-start gap-2 text-xs text-slate-700">
                      <Tik />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                  Bakım aralıkları uygulamanın yağ/duman yüküne ve çalışma süresine göre değişir; üretici prosedürü esas alınır.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. PROJE İÇİN GEREKLİ BİLGİLER & CTA */}
        <section id="proje-bilgileri" className="py-16 md:py-20 bg-white border-t border-slate-200 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-4">
              <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">TEKNİK SEÇİM & BOYUTLANDIRMA</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Proje için gerekli bilgiler</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Elektrostatik filtre performansı; hava debisi, filtre yüzey hızı, partikül yoğunluğu, sıcaklık ve sistem koşulları gibi birden fazla parametreye bağlıdır. Aşağıdaki bilgileri paylaşmanız halinde mühendislerimiz uygun AIRNEX modelini seçip teklifinizi hazırlar.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      <th className="text-left font-bold px-4 py-3">Parametre</th>
                      <th className="text-left font-bold px-4 py-3">Birim / Örnek</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PROJE_BILGILERI.map((p) => (
                      <tr key={p.parametre} className="border-t border-slate-200">
                        <td className="px-4 py-3 font-semibold text-slate-800">{p.parametre}</td>
                        <td className="px-4 py-3 text-slate-600 font-mono">{p.birim}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 space-y-5 shadow-xl lg:sticky lg:top-28">
              <h3 className="text-xl sm:text-2xl font-bold">Mutfağınız için doğru AIRNEX çözümünü birlikte seçelim.</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Mutfak projenizi, davlumbaz ölçülerini veya mevcut egzoz hattı bilgilerini gönderin; keşif, boyutlandırma ve teklif sürecini mühendislerimiz yürütsün.
              </p>
              <Link
                href="/iletisim"
                className="block w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white text-center font-bold text-sm rounded-lg transition-colors shadow-md"
              >
                Ücretsiz Keşif & Teklif İsteyin →
              </Link>
              <p className="text-[11px] text-slate-400">
                İletişim formuna proje dosyası (PDF, DWG, görsel) ekleyebilirsiniz.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
