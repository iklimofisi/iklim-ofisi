import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getSirketAyarlari } from "@/lib/sirket";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hizmetlerimiz — VRF, Klima, Havalandırma & Mutfak Egzozu",
  description:
    "Mitsubishi Electric ve TCL VRF sistemleri, bireysel ve ticari klimalar, klima santrali (AHU), AIRNEX mutfak havalandırma, ısı pompası ve mekanik tesisatta anahtar teslim hizmet.",
  alternates: { canonical: "/hizmetler" },
};

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
              {sirket.unvan}; konut, ofis, otel ve endüstriyel yapılarda sıhhi tesisattan klima santraline, VRF iklimlendirmeden ısı pompasına, havalandırmadan endüstriyel mutfak egzozuna kadar mühendislik standartlarında anahtar teslim mekanik çözümler sunar.
            </p>
          </div>

          {/* MÜHENDİSLİK TEKNİK ÇİZİM KARTLARI GRİDİ */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* 1. KART: MEKANİK & SIHHİ TESİSAT */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                {/* CAD Sıhhi Tesisat Şeması */}
                <div className="h-44 w-full bg-slate-950 p-4 flex items-center justify-center relative overflow-hidden">
                  <span className="absolute z-10 top-3 right-3 text-[10px] font-bold text-teal-300 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
                    Anahtar Teslim
                  </span>
                  <Image
                    src="/hizmetler/hizmet-mekanik-tesisat.jpg"
                    alt="Mekanik tesisat dairesinde borulama ve pompa grupları"
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-transparent" />
                </div>

                <div className="p-6 space-y-4">
                  <span className="text-[11px] font-bold tracking-wider text-teal-700 uppercase block">
                    ANAHTAR TESLİM MEKANİK TAAHHÜT
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    Mekanik & Sıhhi Tesisat
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Temiz su, pis su, yağmur hatları, yangın söndürme tesisatları, kazan daireleri ve borulama altyapılarının mühendislik standartlarında imali.
                  </p>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>Sıhhi tesisat (Temiz & pis su hatları)</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>Merkezi kazan dairesi ve kaskad ısıtma</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>Yangın tesisatı ve hidrofor sistemleri</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link href="/iletisim" className="block w-full py-2.5 bg-slate-900 hover:bg-teal-700 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm">
                  Projeniz İçin Keşif & Teklif İsteyin →
                </Link>
              </div>
            </div>

            {/* 2. KART: KLİMA SANTRALİ & HAVALANDIRMA */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                {/* CAD AHU Santral Şeması */}
                <div className="h-44 w-full bg-slate-950 p-4 flex items-center justify-center relative overflow-hidden">
                  <span className="absolute z-10 top-3 right-3 text-[10px] font-bold text-teal-300 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
                    AHU & Taze Hava
                  </span>
                  <Image
                    src="/hizmetler/hizmet-havalandirma.jpg"
                    alt="Isı geri kazanımlı havalandırma cihazının kesit görünümü"
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-transparent" />
                </div>

                <div className="p-6 space-y-4">
                  <span className="text-[11px] font-bold tracking-wider text-teal-700 uppercase block">
                    KLİMA SANTRALLERİ & İGK
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    Klima Santrali (AHU) & Havalandırma
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Fabrika, AVM, otel ve hijyenik alanlar için Isı Geri Kazanımlı Klima Santralleri (AHU), taze hava besleme ve spiro kanal imalatı.
                  </p>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>Klima Santrali (AHU) montajı & otomasyonu</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>Isı Geri Kazanım (İGK) üniteleri</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>Spiro yuvarlak ve izoleli hava kanalları</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link href="/iletisim" className="block w-full py-2.5 bg-slate-900 hover:bg-teal-700 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm">
                  Projeniz İçin Keşif & Teklif İsteyin →
                </Link>
              </div>
            </div>

            {/* 3. KART: VRF / VRV SİSTEMLERİ */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                {/* CAD VRF Devre Şeması */}
                <div className="h-44 w-full bg-slate-950 p-4 flex items-center justify-center relative overflow-hidden">
                  <span className="absolute z-10 top-3 right-3 text-[10px] font-bold text-teal-300 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
                    VRF Uzmanlığı
                  </span>
                  <Image
                    src="/hizmetler/hizmet-vrf.jpg"
                    alt="Bina çatısında VRF dış ünite uygulaması"
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-transparent" />
                </div>

                <div className="p-6 space-y-4">
                  <span className="text-[11px] font-bold tracking-wider text-teal-700 uppercase block">
                    MERKEZİ İKLİMLENDİRME
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    VRF / VRV Merkezi Sistemler
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Plaza, otel, hastane ve binalarda her odayı bağımsız iklimlendiren Mitsubishi Electric City Multi ve TCL TMV VRF sistemleri; Heat Pump ve Heat Recovery dış/iç ünite grupları ve azot testli borulama.
                  </p>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>Mitsubishi Electric & TCL VRF dış ve iç ünite montajı</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>İzolasyonlu azot testli bakır borulama</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>Merkezi dokunmatik otomasyon kumandaları</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link href="/iletisim" className="block w-full py-2.5 bg-slate-900 hover:bg-teal-700 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm">
                  Projeniz İçin Keşif & Teklif İsteyin →
                </Link>
              </div>
            </div>

            {/* 4. KART: ISI POMPASI & ISITMA */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                {/* CAD Isı Pompası Yerden Isıtma Şeması */}
                <div className="h-44 w-full bg-slate-950 p-4 flex items-center justify-center relative overflow-hidden">
                  <span className="absolute z-10 top-3 right-3 text-[10px] font-bold text-amber-300 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
                    A+++ Tasarruf
                  </span>
                  <Image
                    src="/hizmetler/hizmet-isi-pompasi.jpg"
                    alt="Isı pompası dış üniteleri"
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-transparent" />
                </div>

                <div className="p-6 space-y-4">
                  <span className="text-[11px] font-bold tracking-wider text-teal-700 uppercase block">
                    YENİLENEBİLİR ISITMA
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    Isı Pompası & Isıtma
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Konut ve villalar için hava/su kaynaklı ısı pompaları (85°C), sulu yerden ısıtma tesisatları ve boyler entegrasyonu.
                  </p>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>Hava & su kaynaklı ısı pompaları (85°C)</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>Sulu sistem yerden ısıtma projelendirme</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>Kolektör grubu ve sirkülasyon pompaları</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link href="/iletisim" className="block w-full py-2.5 bg-slate-900 hover:bg-teal-700 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm">
                  Projeniz İçin Keşif & Teklif İsteyin →
                </Link>
              </div>
            </div>

            {/* 5. KART: BİREYSEL & TİCARİ KLİMA */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                {/* CAD Split Klima Şeması */}
                <div className="h-44 w-full bg-slate-950 p-4 flex items-center justify-center relative overflow-hidden">
                  <span className="absolute z-10 top-3 right-3 text-[10px] font-bold text-teal-300 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
                    Split & Kaset
                  </span>
                  <Image
                    src="/hizmetler/hizmet-klima.jpg"
                    alt="Ofiste tavana monte kaset tipi klima"
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-transparent" />
                </div>

                <div className="p-6 space-y-4">
                  <span className="text-[11px] font-bold tracking-wider text-teal-700 uppercase block">
                    BİREYSEL & TİCARİ KLİMA
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    Bireysel & Ticari Klimalar
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Mitsubishi Electric ve TCL duvar tipi, multi-split, kaset tipi, kanallı gizli tavan, konsol ve salon tipi klimaların keşfi, kapasite hesabı ve montajı.
                  </p>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>Inverter duvar tipi & multi-split klimalar</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>4 Yöne üflemeli kaset tipi iklimlendirme</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>Gizli tavan kanallı, konsol & salon tipi</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link href="/iletisim" className="block w-full py-2.5 bg-slate-900 hover:bg-teal-700 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm">
                  Projeniz İçin Keşif & Teklif İsteyin →
                </Link>
              </div>
            </div>

            {/* 6. KART: MÜHENDİSLİK PROJELENDİRME */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                {/* CAD Plan Çizim Şeması */}
                <div className="h-44 w-full bg-slate-950 p-4 flex items-center justify-center relative overflow-hidden">
                  <span className="absolute z-10 top-3 right-3 text-[10px] font-bold text-teal-300 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
                    AutoCAD Proje
                  </span>
                  <Image
                    src="/hizmetler/hizmet-projelendirme.jpg"
                    alt="Şantiyede tablet ile proje kontrolü yapan mühendis"
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-transparent" />
                </div>

                <div className="p-6 space-y-4">
                  <span className="text-[11px] font-bold tracking-wider text-teal-700 uppercase block">
                    MÜHENDİSLİK & DANIŞMANLIK
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    Mekanik Projelendirme & Metraj
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    AutoCAD tabanlı mekanik tesisat projelendirmesi, ısı kaybı/kazancı hesapları, metraj cetvelleri ve şantiye süpervizörlüğü.
                  </p>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>AutoCAD tabanlı mekanik proje çizimi</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>Isı kaybı ve iklimlendirme yük hesapları</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>Malzeme metrajı ve ihale şartnamesi hazırlığı</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link href="/iletisim" className="block w-full py-2.5 bg-slate-900 hover:bg-teal-700 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm">
                  Projeniz İçin Keşif & Teklif İsteyin →
                </Link>
              </div>
            </div>

            {/* 7. KART (GENİŞ): MUTFAK HAVALANDIRMA — AIRNEX */}
            <div className="md:col-span-2 lg:col-span-3 bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-teal-500/40 transition-all duration-300 grid lg:grid-cols-5 group">
              <div className="lg:col-span-2 relative h-56 lg:h-auto bg-slate-950">
                <Image
                  src="/airnex/airnex-kesit.jpg"
                  alt="AIRNEX elektrostatik hücreli aspiratör kesit görünümü"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
                <span className="absolute top-3 right-3 text-[10px] font-bold text-teal-300 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
                  Markamız: AIRNEX
                </span>
              </div>

              <div className="lg:col-span-3 p-6 sm:p-8 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-[11px] font-bold tracking-wider text-teal-700 uppercase block">
                    MUTFAK HAVALANDIRMA
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    Endüstriyel Mutfak Havalandırma — AIRNEX Elektrostatik Hücreli Aspiratör
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Restoran, otel ve endüstriyel mutfaklarda pişirme kaynaklı yağ aerosolleri, duman ve ince partiküllerin kontrolü için elektrostatik filtrasyon hücreli egzoz sistemleri. Davlumbazdan fana kadar tüm hattı projelendirip anahtar teslim kuruyoruz.
                  </p>

                  <div className="pt-3 border-t border-slate-100 grid sm:grid-cols-2 gap-2">
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>Ön filtre + elektrostatik (ESP) hücre + fan</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>Opsiyonel koku kontrol kademesi</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>Davlumbaz ve egzoz kanalı projelendirme</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</span>
                      <span>Periyodik bakım ve hücre temizliği</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href="/airnex" className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm">
                    AIRNEX Ürün Detayları →
                  </Link>
                  <Link href="/iletisim" className="flex-1 py-2.5 bg-slate-900 hover:bg-teal-700 text-white text-center font-bold text-xs rounded-lg transition-colors shadow-sm">
                    Mutfak Projeniz İçin Teklif İsteyin →
                  </Link>
                </div>
              </div>
            </div>

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