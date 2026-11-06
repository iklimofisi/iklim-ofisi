"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

// Teklif listesinde "Önizle": teklife girmeden PDF'ini bir pencerede gösterir
// (müşteriye giden PDF ile aynı). Pencereden teklife gidilebilir, yazdırılabilir
// veya PDF indirilebilir. Esc veya dışarı tıklayınca kapanır.
// ikonSinifi doluysa düğme göz ikonu olarak çıkar (teklif listesi); yoksa "Önizle" yazısı
export default function TeklifOnizleButon({ teklifId, baslik, ikonSinifi }: { teklifId: string; baslik: string; ikonSinifi?: string }) {
  const [acik, setAcik] = useState(false);
  const pdf = `/api/teklif/${teklifId}/pdf`;

  useEffect(() => {
    if (!acik) return;
    const tus = (e: KeyboardEvent) => e.key === "Escape" && setAcik(false);
    window.addEventListener("keydown", tus);
    const eski = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", tus);
      document.body.style.overflow = eski;
    };
  }, [acik]);

  const dugme = "focus-ring text-xs font-medium px-3 py-1.5 rounded-md border transition-colors";

  return (
    <>
      {ikonSinifi ? (
        <button type="button" onClick={() => setAcik(true)} className={ikonSinifi} title="Önizle" aria-label="Önizle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      ) : (
        <button type="button" onClick={() => setAcik(true)} className="focus-ring text-xs text-metin/40 hover:text-soguk-dim font-medium">
          Önizle
        </button>
      )}
      {acik &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${baslik} önizleme`}
            className="fixed inset-0 z-50 bg-metin/60 flex items-center justify-center p-2 sm:p-6"
            onClick={() => setAcik(false)}
          >
            <div className="bg-yuzey rounded-lg shadow-2xl w-full max-w-4xl h-full flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-hat">
                <p className="font-medium text-sm text-metin truncate flex-1 min-w-[10rem]">{baslik}</p>
                <Link href={`/panel/teklifler/${teklifId}`} className={`${dugme} bg-soguk text-white border-soguk hover:bg-soguk-dim`}>
                  Teklife Git
                </Link>
                <a href={`/panel/teklifler/${teklifId}?yazdir=1`} target="_blank" rel="noopener" className={`${dugme} border-hat bg-white text-metin/70 hover:border-soguk`}>
                  🖨 Yazdır
                </a>
                <a href={`${pdf}?indir=1`} className={`${dugme} border-hat bg-white text-metin/70 hover:border-soguk`}>
                  ⬇ PDF İndir
                </a>
                <button type="button" onClick={() => setAcik(false)} aria-label="Kapat" className={`${dugme} border-hat bg-white text-metin/70 hover:border-soguk`}>
                  ✕
                </button>
              </div>
              <iframe src={pdf} title={`${baslik} PDF`} className="flex-1 w-full bg-zemin" />
              <p className="sm:hidden text-center text-xs py-2 border-t border-hat">
                Görünmüyorsa:{" "}
                <a href={pdf} target="_blank" rel="noopener" className="text-soguk-dim underline">
                  PDF&apos;i yeni sekmede aç
                </a>
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
