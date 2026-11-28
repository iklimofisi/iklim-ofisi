"use client";

import { useState } from "react";
import type { TcmbKurlari } from "@/lib/kur";
import KurAlani from "@/components/KurAlani";

// -----------------------------------------------------------------------------
// ELLE CARİ / TEDARİKÇİ HAREKETİ TUTARI: TL ya da döviz (döviz tutarı × kur = TL).
// Form alanları: paraBirimi, tutar (TL) ya da dovizTutar + kur (+ kurKaynagi).
// -----------------------------------------------------------------------------
const oku = (v: string) => {
  const t = v.trim().replace(/\s/g, "");
  if (!t) return null;
  const n = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : /^\d{1,3}(\.\d{3})+$/.test(t) ? t.replace(/\./g, "") : t);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export default function HareketTutarAlani({ kurlar, kutu }: { kurlar: TcmbKurlari | null; kutu: string }) {
  const [pb, setPb] = useState("TRY");
  const [doviz, setDoviz] = useState("");
  return (
    <div className="sm:col-span-2 grid sm:grid-cols-[7rem_1fr] gap-3 items-start">
      <div>
        <label className="block text-xs font-medium text-metin/60 mb-1">Para birimi</label>
        <select name="paraBirimi" value={pb} onChange={(e) => setPb(e.target.value)} className={kutu}>
          <option value="TRY">TL</option>
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
          <option value="GBP">GBP</option>
        </select>
      </div>
      {pb === "TRY" ? (
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Tutar (TL) *</label>
          <input name="tutar" inputMode="decimal" required placeholder="örn. 12.500,00" className={`${kutu} font-mono`} />
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Tutar ({pb}) *</label>
            <input name="dovizTutar" inputMode="decimal" required value={doviz} onChange={(e) => setDoviz(e.target.value)} placeholder="örn. 12.500,00" className={`${kutu} font-mono`} />
          </div>
          <KurAlani key={pb} sabitPb={pb} kurlar={kurlar} tutar={oku(doviz)} baslik={`TL'ye çevirme kuru (1 ${pb} = ? TL)`} />
        </div>
      )}
    </div>
  );
}
