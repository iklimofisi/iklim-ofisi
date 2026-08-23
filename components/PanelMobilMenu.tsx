"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type MenuOgesi = { href: string; label: string };

export default function PanelMobilMenu({
  menu,
  rozetler,
}: {
  menu: MenuOgesi[];
  rozetler: Record<string, number>;
}) {
  const [acik, setAcik] = useState(false);
  const toplamRozet = Object.values(rozetler).reduce((a, b) => a + b, 0);

  return (
    <div className="sm:hidden border-b border-hat bg-yuzey print:hidden">
      <div className="h-14 flex items-center justify-between px-4">
        <Link href="/panel" className="flex items-center gap-2 focus-ring" onClick={() => setAcik(false)}>
          <Image src="/logo-icon.png" alt="İklim Ofisi" width={22} height={22} />
          <span className="font-display font-semibold text-sm text-metin">
            İklim <span className="text-soguk">Ofisi</span>
          </span>
        </Link>
        <button
          onClick={() => setAcik((v) => !v)}
          aria-label={acik ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={acik}
          className="focus-ring w-9 h-9 flex items-center justify-center relative"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {acik ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            )}
          </svg>
          {!acik && toplamRozet > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sicak" />
          )}
        </button>
      </div>

      {acik && (
        <nav className="px-2 pb-3 flex flex-col gap-0.5">
          {menu.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              onClick={() => setAcik(false)}
              className="focus-ring flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium text-metin/80 hover:bg-soguk-light hover:text-soguk-dim transition-colors"
            >
              {m.label}
              {rozetler[m.href] > 0 && (
                <span className="text-xs bg-sicak text-white rounded-full w-5 h-5 flex items-center justify-center">
                  {rozetler[m.href]}
                </span>
              )}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
