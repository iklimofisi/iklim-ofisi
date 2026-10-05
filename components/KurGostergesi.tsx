"use client";

import { useEffect, useRef, useState } from "react";
import type { TcmbKurlari } from "@/lib/kur";

// Panelin her sayfasında: TCMB efektif satış kurları.
// Bilgisayarda üzerine gelince açılır (tıklamaya gerek yok); telefonda dokununca açılır.
const sayi = (n: number, basamak = 4) => n.toLocaleString("tr-TR", { minimumFractionDigits: basamak, maximumFractionDigits: basamak });

export default function KurGostergesi({ yon = "sag" }: { yon?: "sag" | "alt" }) {
  const [kurlar, setKurlar] = useState<TcmbKurlari | null | undefined>(undefined); // undefined: yükleniyor
  const [acik, setAcik] = useState(false);
  const kutu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let iptal = false;
    fetch("/api/kurlar", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { kurlar: null }))
      .then((v) => !iptal && setKurlar(v?.kurlar ?? null))
      .catch(() => !iptal && setKurlar(null));
    return () => {
      iptal = true;
    };
  }, []);

  // Telefonda dışarı dokununca kapansın
  useEffect(() => {
    if (!acik) return;
    const dis = (e: PointerEvent) => {
      if (kutu.current && !kutu.current.contains(e.target as Node)) setAcik(false);
    };
    document.addEventListener("pointerdown", dis);
    return () => document.removeEventListener("pointerdown", dis);
  }, [acik]);

  const satirlar: [string, string, number | undefined][] = kurlar
    ? [
        ["🇺🇸", "USD", kurlar.USD],
        ["🇪🇺", "EUR", kurlar.EUR],
        ["🇬🇧", "GBP", kurlar.GBP],
      ]
    : [];

  return (
    <div
      ref={kutu}
      className="relative"
      // Fareyle üzerine gelince aç / ayrılınca kapat (dokunmatikte dokunarak açılır)
      onPointerEnter={(e) => e.pointerType === "mouse" && setAcik(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setAcik(false)}
    >
      <button
        type="button"
        onClick={() => setAcik((a) => !a)}
        onKeyDown={(e) => e.key === "Escape" && setAcik(false)}
        aria-expanded={acik}
        aria-label="TCMB döviz kurları"
        className="focus-ring w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-hat bg-zemin text-xs font-semibold text-metin/70 hover:border-soguk hover:text-soguk-dim transition-colors"
      >
        <span>{yon === "alt" ? "💱" : "💱 Döviz Kurları"}</span>
        {kurlar ? (
          <span className="font-mono text-[11px] text-soguk-dim">$ {sayi(kurlar.USD, 2)}</span>
        ) : (
          <span className="text-metin/30">{kurlar === undefined ? "…" : "—"}</span>
        )}
      </button>

      {acik && (
        <div
          role="tooltip"
          className={`absolute z-50 w-64 bg-yuzey border border-hat rounded-lg shadow-xl p-4 ${
            yon === "sag" ? "left-full ml-2 top-0" : "right-0 top-full mt-2"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-soguk-dim mb-0.5">TCMB Efektif Satış</p>
          {kurlar === undefined && <p className="text-sm text-metin/50 py-2">Kurlar yükleniyor…</p>}
          {kurlar === null && (
            <p className="text-sm text-metin/60 py-2">TCMB kurlarına şu an ulaşılamadı. Birazdan sayfayı yenileyip tekrar deneyin.</p>
          )}
          {kurlar && (
            <>
              <p className="text-[11px] text-metin/50 mb-3">{kurlar.tarih ? `${kurlar.tarih} tarihli bülten` : "Son bülten"}</p>
              <table className="w-full text-sm">
                <tbody>
                  {satirlar
                    .filter(([, , d]) => d)
                    .map(([bayrak, kod, deger]) => (
                      <tr key={kod} className="border-t border-hat first:border-0">
                        <td className="py-1.5">
                          {bayrak} <span className="font-semibold text-metin">{kod}</span>
                        </td>
                        <td className="py-1.5 text-right font-mono text-metin">{sayi(deger!)} ₺</td>
                      </tr>
                    ))}
                  <tr className="border-t border-hat">
                    <td className="py-1.5 text-metin/60 text-xs">EUR / USD</td>
                    <td className="py-1.5 text-right font-mono text-metin/70 text-xs">{sayi(kurlar.EUR / kurlar.USD)}</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-[10px] text-metin/40 mt-3 leading-snug">
                TCMB kurları iş günleri 15.30 civarında güncellenir; hafta sonu ve tatillerde son bülten geçerlidir.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
