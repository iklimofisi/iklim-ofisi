"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const slaytlar = [
  {
    id: 1,
    rozet: "MERKEZİ İKLİMLENDİRME",
    baslik: "VRF / VRV Merkezi Sistem Ürünleri",
    aciklama: "Plaza, otel, hastane ve binalar için yüksek verimli Inverter dış üniteler, kaset tipi ve kanallı iç üniteler.",
    gorsel: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80",
    etiket: "VRF Dış & İç Ünite Grupları",
  },
  {
    id: 2,
    rozet: "TAZE HAVA & İGK",
    baslik: "Klima Santralleri (AHU) & Havalandırma",
    aciklama: "Fabrika, AVM ve kapalı alanlar için Isı Geri Kazanımlı (İGK) taze hava santralleri ve spiro hava kanalları.",
    gorsel: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80",
    etiket: "Endüstriyel Havalandırma Santrali",
  },
  {
    id: 3,
    rozet: "YENİLENEBİLİR ISITMA",
    baslik: "Yeni Nesil Isı Pompası Sistemleri",
    aciklama: "Villa ve konutlar için hava ve su kaynaklı yüksek sıcaklık ısı pompaları, sulu yerden ısıtma entegrasyonu.",
    gorsel: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=1200&q=80",
    etiket: "A+++ Isı Pompaları & Boyler",
  },
  {
    id: 4,
    rozet: "BİREYSEL & TİCARİ KLİMA",
    baslik: "Bireysel ve Ticari Klimalar",
    aciklama: "A+++ Inverter duvar tipi, kaset tipi, kanallı gizli tavan ve salon tipi iklimlendirme üniteleri.",
    gorsel: "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1200&q=80",
    etiket: "Inverter Split & Kaset Tipi",
  },
];

export default function HeroSlider() {
  const [aktifAktarma, setAktifAktarma] = useState(0);

  // Otomatik Kaydırma (4.5 saniyede bir)
  useEffect(() => {
    const interval = setInterval(() => {
      setAktifAktarma((prev) => (prev + 1) % slaytlar.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const oncekiSlayt = () => {
    setAktifAktarma((prev) => (prev === 0 ? slaytlar.length - 1 : prev - 1));
  };

  const sonrakiSlayt = () => {
    setAktifAktarma((prev) => (prev + 1) % slaytlar.length);
  };

  const mevcut = slaytlar[aktifAktarma];

  return (
    <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl min-h-[460px] sm:min-h-[500px] flex items-center">
      {/* Arka Plan Görseli & Karartma Overlay */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mevcut.gorsel}
          alt={mevcut.baslik}
          className="w-full h-full object-cover opacity-35 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/40" />
      </div>

      {/* İçerik Metinleri */}
      <div className="relative z-10 p-8 sm:p-12 md:p-14 max-w-2xl space-y-5 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          {mevcut.rozet}
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
          {mevcut.baslik}
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          {mevcut.aciklama}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4">
          <Link
            href="/iletisim"
            className="px-6 py-3.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs shadow-lg transition-all"
          >
            Ücretsiz Keşif & Teklif İsteyin →
          </Link>
          <Link
            href="/urunler"
            className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 backdrop-blur-md transition-all"
          >
            Ürün Kataloğunu İnceleyin
          </Link>
        </div>
      </div>

      {/* Sağ Üst Etiket */}
      <div className="absolute top-6 right-6 z-10 hidden sm:block">
        <span className="bg-slate-950/80 border border-slate-800 text-slate-300 text-[11px] font-bold px-3 py-1.5 rounded-lg backdrop-blur-md">
          🏷️ {mevcut.etiket}
        </span>
      </div>

      {/* Sağ Alt Ok Butonları ve Sayfa Göstergeleri */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
        <div className="flex gap-1.5">
          {slaytlar.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setAktifAktarma(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === aktifAktarma
                  ? "w-8 bg-teal-400"
                  : "w-2 bg-slate-600 hover:bg-slate-400"
              }`}
              aria-label={`Slayt ${idx + 1}`}
            />
          ))}
        </div>

        <div className="flex gap-1 ml-2">
          <button
            onClick={oncekiSlayt}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-teal-500 hover:text-slate-950 text-white border border-slate-700 flex items-center justify-center font-bold text-sm backdrop-blur-md transition-all"
            title="Önceki Ürün"
          >
            ←
          </button>
          <button
            onClick={sonrakiSlayt}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-teal-500 hover:text-slate-950 text-white border border-slate-700 flex items-center justify-center font-bold text-sm backdrop-blur-md transition-all"
            title="Sonraki Ürün"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}