"use client";

import { useState } from "react";
import type { TcmbKurlari } from "@/lib/kur";
import KurAlani from "@/components/KurAlani";

// -----------------------------------------------------------------------------
// DÖVİZLİ ALIŞ FATURASI TUTARI: fatura döviz tutarıyla (× kur = TL) ya da doğrudan TL tutarıyla girilir.
// Döviz seçiliyken form alanları: dovizTutar, faturaKur (+ kurKaynagi); TL seçiliyken: tutar.
// Tedarikçi cari hesabına her durumda TL yazılır; dövizde döviz tutarı ve kur da saklanır.
// -----------------------------------------------------------------------------
export default function AlisFaturasiTutar({ pb, kurlar, kutu }: { pb: string; kurlar: TcmbKurlari | null; kutu: string }) {
  const [tur, setTur] = useState<"doviz" | "tl">("doviz");
  const [doviz, setDoviz] = useState("");
  const dovizSayi = (() => {
    const t = doviz.trim().replace(/\s/g, "");
    if (!t) return null;
    const n = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t);
    return Number.isFinite(n) && n > 0 ? n : null;
  })();
  const dugme = (aktif: boolean) =>
    `focus-ring text-xs border rounded-md px-3 py-1.5 ${aktif ? "border-soguk bg-soguk-light text-soguk-dim font-semibold" : "border-hat bg-white text-metin/70"}`;

  return (
    <div className="col-span-2 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-metin/60">Fatura tutarı:</span>
        <button type="button" className={dugme(tur === "doviz")} onClick={() => setTur("doviz")}>
          {pb} tutarı + kur
        </button>
        <button type="button" className={dugme(tur === "tl")} onClick={() => setTur("tl")}>
          TL tutarı
        </button>
      </div>
      {tur === "doviz" ? (
        <>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Döviz tutarı ({pb}, KDV dahil)</label>
            <input name="dovizTutar" required inputMode="decimal" onChange={(e) => setDoviz(e.target.value)} className={`${kutu} font-mono text-right`} />
          </div>
          <KurAlani sabitPb={pb} kurlar={kurlar} name="faturaKur" tutar={dovizSayi} baslik={`Faturadaki kur (1 ${pb} = ? TL)`} />
        </>
      ) : (
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Tutar (TL, KDV dahil)</label>
          <input name="tutar" required inputMode="decimal" className={`${kutu} font-mono text-right`} />
        </div>
      )}
    </div>
  );
}
