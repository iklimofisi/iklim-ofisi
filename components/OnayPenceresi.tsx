"use client";

import { useEffect, useRef, useState } from "react";
import { ONAY_OLAYI, type OnayIstegi } from "@/lib/onay";

// Panelin onay / uyarı penceresi (lib/onay.ts → onayIste, uyariGoster).
// Esc ya da dışarı tıklama = Vazgeç. Silme gibi tehlikeli işlemlerde odak "Vazgeç"tedir;
// yanlışlıkla Enter'a basılırsa hiçbir şey silinmez.
export default function OnayPenceresi() {
  const [kuyruk, setKuyruk] = useState<OnayIstegi[]>([]);
  const aktif = kuyruk[0];
  const onayRef = useRef<HTMLButtonElement>(null);
  const iptalRef = useRef<HTMLButtonElement>(null);
  const oncekiOdak = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dinle = (e: Event) => {
      const d = (e as CustomEvent<OnayIstegi>).detail;
      if (!d || typeof d.coz !== "function") return;
      d.alindi = true;
      setKuyruk((k) => [...k, d]);
    };
    window.addEventListener(ONAY_OLAYI, dinle);
    return () => window.removeEventListener(ONAY_OLAYI, dinle);
  }, []);

  // Pencere açılınca odak düğmeye; kapanınca önceki yere döner
  useEffect(() => {
    if (!aktif) return;
    if (!oncekiOdak.current && document.activeElement instanceof HTMLElement) oncekiOdak.current = document.activeElement;
    const hedef = aktif.tehlikeli && aktif.iptalMetni !== null ? iptalRef.current : onayRef.current;
    hedef?.focus();
  }, [aktif]);

  if (!aktif) return null;

  const kapat = (sonuc: boolean) => {
    if (aktif.bitti) return;
    aktif.bitti = true;
    aktif.coz(sonuc);
    setKuyruk((k) => {
      const kalan = k.slice(1);
      if (kalan.length === 0) {
        const o = oncekiOdak.current;
        oncekiOdak.current = null;
        // Odak, onay sonrası işlem bittikten sonra geri verilir
        setTimeout(() => o?.isConnected && o.focus(), 0);
      }
      return kalan;
    });
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-metin/40 print:hidden"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) kapat(aktif.iptalMetni === null);
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="onay-baslik"
        aria-describedby="onay-mesaj"
        className="w-full max-w-md bg-yuzey rounded-xl shadow-2xl border border-hat p-6 space-y-4"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            kapat(aktif.iptalMetni === null);
          } else if (e.key === "Tab") {
            // Odak pencerenin içinde kalsın
            const dugmeler = [iptalRef.current, onayRef.current].filter((d): d is HTMLButtonElement => !!d);
            if (dugmeler.length < 2) {
              e.preventDefault();
              return;
            }
            const i = dugmeler.indexOf(document.activeElement as HTMLButtonElement);
            if (e.shiftKey && i <= 0) {
              e.preventDefault();
              dugmeler[dugmeler.length - 1].focus();
            } else if (!e.shiftKey && i === dugmeler.length - 1) {
              e.preventDefault();
              dugmeler[0].focus();
            }
          }
        }}
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-base font-bold ${
              aktif.tehlikeli ? "bg-sicak-light text-sicak-dim" : "bg-soguk-light text-soguk-dim"
            }`}
          >
            {aktif.tehlikeli ? "!" : aktif.iptalMetni === null ? "i" : "?"}
          </span>
          <div className="space-y-1.5 min-w-0">
            <h2 id="onay-baslik" className="text-base font-semibold text-metin">
              {aktif.baslik}
            </h2>
            <p id="onay-mesaj" className="text-sm text-metin/70 leading-relaxed whitespace-pre-line break-words">
              {aktif.mesaj}
            </p>
          </div>
        </div>
        {aktif.kutuMetni && (
          <input
            readOnly
            value={aktif.kutuMetni}
            onFocus={(e) => e.currentTarget.select()}
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-xs font-mono bg-zemin"
          />
        )}
        <div className="flex flex-wrap justify-end gap-2 pt-1">
          {aktif.iptalMetni !== null && (
            <button
              ref={iptalRef}
              type="button"
              onClick={() => kapat(false)}
              className="focus-ring px-4 py-2 rounded-md text-sm font-medium border border-hat text-metin/70 bg-white hover:bg-zemin transition-colors"
            >
              {aktif.iptalMetni}
            </button>
          )}
          <button
            ref={onayRef}
            type="button"
            onClick={() => kapat(true)}
            className={`focus-ring px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${
              aktif.tehlikeli ? "bg-sicak-dim hover:bg-sicak" : "bg-soguk hover:bg-soguk-dim"
            }`}
          >
            {aktif.onayMetni}
          </button>
        </div>
      </div>
    </div>
  );
}
