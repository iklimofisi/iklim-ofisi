"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/urunler", label: "Ürünler" },
  { href: "/airnex", label: "AIRNEX Mutfak Havalandırma" },
  { href: "/referanslar", label: "Referanslar" },
  { href: "/hesaplama", label: "Kapasite Hesaplama" },
  { href: "/blog", label: "Blog" },
  { href: "/iletisim", label: "İletişim" },
];

export default function MobilMenu() {
  const [acik, setAcik] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setAcik((v) => !v)}
        aria-label={acik ? "Menüyü kapat" : "Menüyü aç"}
        aria-expanded={acik}
        className="focus-ring w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-800 hover:bg-slate-50"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {acik ? (
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          ) : (
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {acik && (
        <nav className="absolute left-0 right-0 top-full bg-white border-b border-slate-200 shadow-lg px-6 py-4 flex flex-col text-sm font-semibold text-slate-700">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setAcik(false)}
              className="focus-ring py-3 border-b border-slate-100 last:border-b-0 hover:text-teal-700 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
