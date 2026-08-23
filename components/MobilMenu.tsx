"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/hesaplama", label: "Kapasite Hesaplama" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

export default function MobilMenu() {
  const [acik, setAcik] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setAcik((v) => !v)}
        aria-label={acik ? "Menüyü kapat" : "Menüyü aç"}
        aria-expanded={acik}
        className="focus-ring w-9 h-9 flex items-center justify-center"
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
        <div className="absolute left-0 right-0 top-16 bg-yuzey border-b border-hat px-6 py-4 flex flex-col gap-4 text-metin/80">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setAcik(false)}
              className="focus-ring hover:text-soguk transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
