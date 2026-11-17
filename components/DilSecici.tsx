"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { DILLER, DIL_ADI, DIL_KISA, dilsizYol, yol, type Dil } from "@/lib/dil";

// Üst menüde dil seçimi (TR / EN / DE). Aynı sayfanın diğer dildeki karşılığına gider.
export default function DilSecici({ dil, etiket }: { dil: Dil; etiket: string }) {
  const [acik, setAcik] = useState(false);
  const kok = useRef<HTMLDivElement>(null);
  // Sunucuda yol dil öneksiz, tarayıcıda önekli gelebilir; ikisinde de aynı sonuç çıksın
  const taban = dilsizYol(usePathname() || "/");

  useEffect(() => {
    if (!acik) return;
    const kapat = (e: MouseEvent) => {
      if (kok.current && !kok.current.contains(e.target as Node)) setAcik(false);
    };
    const tus = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAcik(false);
    };
    document.addEventListener("mousedown", kapat);
    document.addEventListener("keydown", tus);
    return () => {
      document.removeEventListener("mousedown", kapat);
      document.removeEventListener("keydown", tus);
    };
  }, [acik]);

  return (
    <div ref={kok} className="relative">
      <button
        type="button"
        onClick={() => setAcik((v) => !v)}
        aria-haspopup="true"
        aria-expanded={acik}
        aria-label={`${etiket}: ${DIL_ADI[dil]}`}
        title={etiket}
        className="focus-ring h-10 px-2.5 flex items-center gap-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" strokeLinecap="round" />
        </svg>
        {DIL_KISA[dil]}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden className={acik ? "rotate-180 transition-transform" : "transition-transform"}>
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {acik && (
        <ul className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
          {DILLER.map((d) => (
            <li key={d}>
              <a
                href={yol(d, taban)}
                hrefLang={d}
                lang={d}
                aria-current={d === dil ? "true" : undefined}
                onClick={() => setAcik(false)}
                className={`flex items-center justify-between px-3.5 py-2 text-sm hover:bg-slate-50 ${
                  d === dil ? "font-bold text-teal-700" : "font-medium text-slate-700"
                }`}
              >
                <span>{DIL_ADI[d]}</span>
                <span className="text-[10px] font-mono text-slate-400">{DIL_KISA[d]}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
