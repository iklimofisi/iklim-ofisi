"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const urunSlaytlari = [
  {
    id: 1,
    kategori: "BİREYSEL İKLİMLENDİRME",
    baslik: "Inverter Duvar Tipi Split Klima Üniteleri",
    aciklama: "R32 çevre dostu gazlı, A+++ enerji tasarruflu, ultra sessiz (19 dB) duvar tipi split klima cihazı.",
    gorsel: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=1200&q=80", // GERÇEK BEYAZ DUVAR TİPİ KLİMA CİHAZI
    ozellikler: ["A+++ Sezonsal Verim", "19 dB Ses Seviyesi", "R32 Çevre Dostu Gaz", "9.000 - 24.000 BTU/h"],
  },
  {
    id: 2,
    kategori: "MERKEZİ VRF SİSTEMİ",
    baslik: "VRF / VRV Dış Ünite Cihaz Modülleri",
    aciklama: "Otel, plaza ve büyük projeler için yüksek kapasiteli VRF/VRV Inverter dış ünite cihaz grupları.",
    gorsel: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80", // GERÇEK VRF/HVAC DIŞ ÜNİTE CİHAZI
    ozellikler: ["Heat Pump / Heat Recovery", "DC Inverter Kompresör", "8 HP - 96 HP Kombinasyon", "Gece Sessiz Modu"],
  },
  {
    id: 3,
    kategori: "TİCARİ İKLİMLENDİRME",
    baslik: "4 Yöne Üflemeli Tavan Kaset Tipi Klimalar",
    aciklama: "Mağaza, cafe ve restoran alanlarında tavan içine gömülen 360° homojen hava dağıtımlı iklimlendirme cihazı.",
    gorsel: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80", // GERÇEK KASET TİPİ KLİMA CİHAZI
    ozellikler: ["360° Homojen Üfleme", "Gizli Tavan Tipi", "Dahili Drenaj Pompası", "18.000 - 60.000 BTU/h"],
  },
  {
    id: 4,
    kategori: "YENİLENEBİLİR ISITMA",
    baslik: "Hava Kaynaklı Isı Pompası Cihazları",
    aciklama: "Villa ve müstakil binalar için 85°C yüksek sıcaklık üreten monoblok/split ısı pompası ünitesi.",
    gorsel: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=1200&q=80", // GERÇEK ISI POMPASI CİHAZI
    ozellikler: ["85°C Yüksek Çıkış Suyu", "Dış Hava -25°C Isıtma", "A+++ Sezonsal Verim", "Entegre Boyler"],
  },
];

export default function HeroSlider() {
  const [aktifIdx, setAktifIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAktifIdx((prev) => (prev + 1) % urunSlaytlari.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const mevcut = urunSlaytlari[aktifIdx];

  return (
    <div className="bg-slate-950 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative min-h-[480px] sm:min-h-[520px] flex items-center">
      {/* Gerçek Ürün Fotoğrafı */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mevcut.gorsel}
          alt={mevcut.baslik}
          className="w-full h-full object-cover opacity-40 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
      </div>

      {/* Slayt İçi Ürün Bilgileri */}
      <div className="relative z-10 p-8 sm:p-12 md:p-14 max-w-2xl space-y-5 text-left">
        <span className="inline-block px-3 py-1 rounded bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
          {mevcut.kategori}
        </span>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
          {mevcut.baslik}
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          {mevcut.aciklama}
        </p>

        {/* Ürün Teknik Özellik Etiketleri */}
        <div className="flex flex-wrap gap-2 pt-1">
          {mevcut.ozellikler.map((ozellik, i) => (
            <span
              key={i}
              className="bg-slate-900/80 border border-slate-700 text-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded backdrop-blur-sm"
            >
              ✓ {ozellik}
            </span>
          ))}
        </div>

        <div className="pt-3 flex flex-wrap items-center gap-4">
          <Link
            href="/iletisim"
            className="px-6 py-3.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs shadow-lg transition-all"
          >
            Bu Cihaz İçin Keşif & Teklif İsteyin →
          </Link>
          <Link
            href="/urunler"
            className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 backdrop-blur-md transition-all"
          >
            Tüm Cihaz Kataloğunu Gör
          </Link>
        </div>
      </div>

      {/* Slayt Kontrol Butonları */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
        <div className="flex gap-1.5">
          {urunSlaytlari.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setAktifIdx(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === aktifIdx
                  ? "w-8 bg-teal-400"
                  : "w-2 bg-slate-600 hover:bg-slate-400"
              }`}
              aria-label={`Slayt ${idx + 1}`}
            />
          ))}
        </div>

        <div className="flex gap-1 ml-2">
          <button
            onClick={() =>
              setAktifIdx((prev) => (prev === 0 ? urunSlaytlari.length - 1 : prev - 1))
            }
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-teal-500 hover:text-slate-950 text-white border border-slate-700 flex items-center justify-center font-bold text-sm backdrop-blur-md transition-all"
          >
            ←
          </button>
          <button
            onClick={() => setAktifIdx((prev) => (prev + 1) % urunSlaytlari.length)}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-teal-500 hover:text-slate-950 text-white border border-slate-700 flex items-center justify-center font-bold text-sm backdrop-blur-md transition-all"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}