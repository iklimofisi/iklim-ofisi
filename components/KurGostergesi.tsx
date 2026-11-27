"use client";

import { useEffect, useRef, useState } from "react";
import type { TcmbKurlari } from "@/lib/kur";

// Panelin her sayfasında: TCMB döviz satış ve efektif satış kurları (sipariş / fatura kur seçimindeki iki TCMB kuru).
// Bilgisayarda üzerine gelince açılır (tıklamaya gerek yok); telefonda dokununca açılır.
// sabit: geniş ekranda sağ boşlukta hep açık duran kart (panel düzeni, app/panel/(app)/layout.tsx).
const sayi = (n: number, basamak = 4) => n.toLocaleString("tr-TR", { minimumFractionDigits: basamak, maximumFractionDigits: basamak });

// Aynı sayfada iki gösterge (sol menü + sağ kart) olsa da kurlar tek istekle alınır
let ortakIstek: Promise<TcmbKurlari | null> | null = null;
function kurlariAl(): Promise<TcmbKurlari | null> {
  if (!ortakIstek) {
    ortakIstek = fetch("/api/kurlar", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { kurlar: null }))
      .then((v) => v?.kurlar ?? null)
      .catch(() => null);
    // Sayfa uzun süre açık kalırsa sonraki gösterimde yeniden alınsın
    ortakIstek.finally(() => setTimeout(() => (ortakIstek = null), 60_000));
  }
  return ortakIstek;
}

export default function KurGostergesi({ yon = "sag", sabit = false }: { yon?: "sag" | "alt"; sabit?: boolean }) {
  const [kurlar, setKurlar] = useState<TcmbKurlari | null | undefined>(undefined); // undefined: yükleniyor
  const [acik, setAcik] = useState(false);
  const kutu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let iptal = false;
    kurlariAl().then((k) => !iptal && setKurlar(k));
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

  const satirlar: [string, string, number | undefined, number | undefined][] = kurlar
    ? [
        ["🇺🇸", "USD", kurlar.doviz?.USD, kurlar.USD],
        ["🇪🇺", "EUR", kurlar.doviz?.EUR, kurlar.EUR],
        ["🇬🇧", "GBP", kurlar.doviz?.GBP, kurlar.GBP],
      ]
    : [];

  const icerik = (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-soguk-dim mb-0.5">TCMB Satış Kurları</p>
      {kurlar === undefined && <p className="text-sm text-metin/50 py-2">Kurlar yükleniyor…</p>}
      {kurlar === null && (
        <p className="text-sm text-metin/60 py-2">TCMB kurlarına şu an ulaşılamadı. Birazdan sayfayı yenileyip tekrar deneyin.</p>
      )}
      {kurlar && (
        <>
          <p className="text-[11px] text-metin/50 mb-3">{kurlar.tarih ? `${kurlar.tarih} tarihli bülten` : "Son bülten"}</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-metin/50">
                <th className="pb-1 text-left font-medium"></th>
                <th className="pb-1 text-right font-medium">Döviz</th>
                <th className="pb-1 text-right font-medium">Efektif</th>
              </tr>
            </thead>
            <tbody>
              {satirlar
                .filter(([, , d, e]) => d || e)
                .map(([bayrak, kod, doviz, efektif]) => (
                  <tr key={kod} className="border-t border-hat">
                    <td className="py-1.5 whitespace-nowrap">
                      {bayrak} <span className="font-semibold text-metin">{kod}</span>
                    </td>
                    <td className="py-1.5 text-right font-mono text-metin">{doviz ? sayi(doviz) : "—"}</td>
                    <td className="py-1.5 text-right font-mono text-metin/70">{efektif ? sayi(efektif) : "—"}</td>
                  </tr>
                ))}
              <tr className="border-t border-hat">
                <td className="py-1.5 text-metin/60 text-xs">EUR / USD</td>
                <td colSpan={2} className="py-1.5 text-right font-mono text-metin/70 text-xs">
                  {sayi((kurlar.doviz?.EUR ?? kurlar.EUR) / (kurlar.doviz?.USD ?? kurlar.USD))}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="text-[10px] text-metin/50 mt-2 leading-snug">
            Döviz satış: fatura ve cari kur çevriminde varsayılan. Efektif satış: nakit döviz.
          </p>
          <p className="text-[10px] text-metin/40 mt-3 leading-snug">
            TCMB kurları iş günleri 15.30 civarında güncellenir; hafta sonu ve tatillerde son bülten geçerlidir.
          </p>
        </>
      )}
    </>
  );

  // Hep açık kart (geniş ekranda sağ boşluk)
  if (sabit) {
    return (
      <section aria-label="TCMB döviz kurları" className="bg-yuzey border border-hat rounded-lg shadow-sm p-4">
        {icerik}
      </section>
    );
  }

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
          <span className="font-mono text-[11px] text-soguk-dim">$ {sayi(kurlar.doviz?.USD ?? kurlar.USD, 2)}</span>
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
          {icerik}
        </div>
      )}
    </div>
  );
}
