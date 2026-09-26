"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// ---------------------------------------------------------------------------
// SLAYTLAR
// Fotoğraf eklemek için: görseli public/slider/ klasörüne koyun ve ilgili
// slayttaki `gorsel` alanına yolunu yazın (örn. "/slider/vrf.jpg").
// `gorsel` boşsa slayt, sitenin teknik çizim tarzındaki görseliyle gösterilir.
// ---------------------------------------------------------------------------
type Cizim = "vrf" | "klima" | "isitma";

type Slayt = {
  etiket: string;
  baslik: string;
  alt: string;
  href: string;
  gorsel?: string;
  cizim?: Cizim;
};

const SLAYTLAR: Slayt[] = [
  {
    etiket: "Markamız · Mutfak Havalandırma",
    baslik: "AIRNEX Elektrostatik Hücreli Aspiratör",
    alt: "Endüstriyel mutfakta AIRNEX elektrostatik hücreli aspiratör",
    href: "/airnex",
    gorsel: "/airnex/airnex-mutfak.jpg",
  },
  {
    etiket: "Mitsubishi Electric · TCL",
    baslik: "VRF Merkezi İklimlendirme Sistemleri",
    alt: "VRF merkezi iklimlendirme sistemi",
    href: "/hizmetler",
    cizim: "vrf",
  },
  {
    etiket: "Mitsubishi Electric · TCL",
    baslik: "Bireysel & Ticari Klimalar",
    alt: "Inverter duvar tipi ve kaset tipi klimalar",
    href: "/urunler",
    cizim: "klima",
  },
  {
    etiket: "AIRNEX",
    baslik: "4 Kademeli Elektrostatik Filtrasyon",
    alt: "AIRNEX çalışma prensibi: ön filtre, iyonizasyon, toplama hücresi ve fan",
    href: "/airnex",
    gorsel: "/airnex/airnex-calisma-prensibi.jpg",
  },
  {
    etiket: "Buderus",
    baslik: "Isı Pompası & Kaskad Isıtma",
    alt: "Isı pompası ve yerden ısıtma sistemi",
    href: "/urunler",
    cizim: "isitma",
  },
];

const SURE_MS = 5000;

function CizimGorsel({ tur }: { tur: Cizim }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950 flex items-center justify-center">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#5eead4 1px, transparent 1px), linear-gradient(90deg, #5eead4 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <svg className="relative w-3/4 max-w-md h-auto" viewBox="0 0 200 100" fill="none" stroke="currentColor" aria-hidden>
        {tur === "vrf" && (
          <>
            <rect x="12" y="22" width="46" height="56" rx="4" strokeWidth="2" className="text-teal-400" fill="#0f172a" />
            <circle cx="35" cy="42" r="11" strokeWidth="1.5" className="text-teal-300" />
            <path d="M35 31v22M24 42h22" strokeWidth="1.5" className="text-teal-300" />
            <path d="M58 36h58v-16h38M58 64h58v16h38M116 36v28" strokeWidth="2" className="text-cyan-400" />
            <circle cx="116" cy="36" r="3.5" fill="currentColor" className="text-teal-300" />
            <circle cx="116" cy="64" r="3.5" fill="currentColor" className="text-teal-300" />
            <rect x="154" y="11" width="34" height="18" rx="2" strokeWidth="2" className="text-slate-300" fill="#1e293b" />
            <rect x="154" y="71" width="34" height="18" rx="2" strokeWidth="2" className="text-slate-300" fill="#1e293b" />
            <rect x="128" y="41" width="34" height="18" rx="2" strokeWidth="2" className="text-slate-300" fill="#1e293b" />
            <path d="M116 50h12" strokeWidth="2" className="text-cyan-400" />
          </>
        )}
        {tur === "klima" && (
          <>
            <rect x="30" y="18" width="140" height="34" rx="6" strokeWidth="2" className="text-slate-200" fill="#0f172a" />
            <path d="M42 44h116" strokeWidth="1.5" className="text-slate-500" />
            <circle cx="156" cy="28" r="2.5" fill="currentColor" className="text-teal-300" />
            <path d="M50 62c10 12 20 12 30 0M85 62c10 12 20 12 30 0M120 62c10 12 20 12 30 0" strokeWidth="2" className="text-cyan-400" strokeDasharray="3 3" />
          </>
        )}
        {tur === "isitma" && (
          <>
            <rect x="12" y="22" width="42" height="56" rx="4" strokeWidth="2" className="text-amber-400" fill="#0f172a" />
            <path d="M24 60c4-8 8-8 8-16s6-8 6-12" strokeWidth="2" className="text-amber-300" strokeLinecap="round" />
            <path d="M64 32h112v10H74v10h102v10H74v10h102" strokeWidth="2.5" className="text-amber-500" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </svg>
    </div>
  );
}

export default function UrunSlider() {
  const [aktif, setAktif] = useState(0);
  const [durdu, setDurdu] = useState(false);
  const adet = SLAYTLAR.length;
  const dokunmaX = useRef<number | null>(null);

  const git = useCallback((i: number) => setAktif(((i % adet) + adet) % adet), [adet]);

  useEffect(() => {
    if (durdu) return;
    const azHareket =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (azHareket) return;
    const t = setTimeout(() => git(aktif + 1), SURE_MS);
    return () => clearTimeout(t);
  }, [aktif, durdu, git]);

  return (
    <div
      className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900"
      onMouseEnter={() => setDurdu(true)}
      onMouseLeave={() => setDurdu(false)}
      onFocus={() => setDurdu(true)}
      onBlur={() => setDurdu(false)}
      onTouchStart={(e) => {
        dokunmaX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (dokunmaX.current === null) return;
        const fark = e.changedTouches[0].clientX - dokunmaX.current;
        if (Math.abs(fark) > 40) git(fark < 0 ? aktif + 1 : aktif - 1);
        dokunmaX.current = null;
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Ürün ve çözümlerimiz"
    >
      {SLAYTLAR.map((s, i) => (
        <div
          key={s.baslik}
          className={`absolute inset-0 transition-opacity duration-700 ${i === aktif ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          aria-hidden={i !== aktif}
        >
          {s.gorsel ? (
            <Image
              src={s.gorsel}
              alt={s.alt}
              fill
              priority={i === 0}
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover"
            />
          ) : (
            <CizimGorsel tur={s.cizim ?? "vrf"} />
          )}

          {/* Alt yazı şeridi */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent pt-16 pb-5 px-5 sm:px-7">
            <p className="text-[10px] sm:text-[11px] font-bold tracking-widest text-teal-300 uppercase">{s.etiket}</p>
            <div className="flex items-end justify-between gap-4 mt-1">
              <h2 className="text-lg sm:text-2xl font-bold text-white leading-tight">{s.baslik}</h2>
              <Link
                href={s.href}
                tabIndex={i === aktif ? 0 : -1}
                className="shrink-0 hidden sm:inline-block px-4 py-2 rounded-lg bg-white/95 text-slate-900 font-bold text-xs hover:bg-teal-500 hover:text-white transition-colors"
              >
                İncele →
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Oklar */}
      <button
        type="button"
        onClick={() => git(aktif - 1)}
        aria-label="Önceki görsel"
        className="focus-ring absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-slate-900 hidden sm:flex items-center justify-center shadow"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => git(aktif + 1)}
        aria-label="Sonraki görsel"
        className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-slate-900 hidden sm:flex items-center justify-center shadow"
      >
        ›
      </button>

      {/* Noktalar */}
      <div className="absolute top-3 right-3 flex gap-1.5">
        {SLAYTLAR.map((s, i) => (
          <button
            key={s.baslik}
            type="button"
            onClick={() => git(i)}
            aria-label={`${i + 1}. görsel: ${s.baslik}`}
            aria-current={i === aktif}
            className={`h-2 rounded-full transition-all ${i === aktif ? "w-6 bg-teal-400" : "w-2 bg-white/60 hover:bg-white"}`}
          />
        ))}
      </div>
    </div>
  );
}
