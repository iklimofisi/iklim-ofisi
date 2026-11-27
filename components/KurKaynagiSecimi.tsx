"use client";

import { useState } from "react";

// -----------------------------------------------------------------------------
// KUR KAYNAĞI SEÇİMİ (dövizli satış siparişi): teklif dövizse cari hesaba TL hangi kurla yazılacak?
// TCMB döviz satış · TCMB efektif satış (kesin kur onay günü alınır) · elle kur (sabit).
// Form alanları: kurKaynagi, kur (yalnız elle kurda).
// -----------------------------------------------------------------------------
const yaz = (n?: number | null) => (n ? n.toLocaleString("tr-TR", { maximumFractionDigits: 4 }) : "—");

export default function KurKaynagiSecimi({
  pb,
  doviz,
  efektif,
  tarih,
  varsayilan = "TCMB_DOVIZ",
  elleKur,
}: {
  pb: string;
  doviz?: number | null;
  efektif?: number | null;
  tarih?: string | null;
  varsayilan?: string;
  elleKur?: number | null;
}) {
  const [kaynak, setKaynak] = useState(varsayilan);
  const secenekler: [string, string, string][] = [
    ["TCMB_DOVIZ", "TCMB döviz satış", `bugün ${yaz(doviz)} TL`],
    ["TCMB_EFEKTIF", "TCMB efektif satış", `bugün ${yaz(efektif)} TL`],
    ["ELLE", "Benim belirlediğim kur", "sabit kur"],
  ];
  return (
    <div>
      <p className="block text-xs font-medium text-metin/60 mb-2">
        Teklif {pb} cinsinden. Cari hesaba TL hangi kurla yazılsın?
      </p>
      <div className="grid sm:grid-cols-3 gap-2">
        {secenekler.map(([k, ad, alt]) => (
          <label
            key={k}
            className={`cursor-pointer border rounded-md px-3 py-2 text-sm ${kaynak === k ? "border-soguk bg-soguk-light text-soguk-dim" : "border-hat bg-white text-metin/80"}`}
          >
            <input type="radio" name="kurKaynagi" value={k} checked={kaynak === k} onChange={() => setKaynak(k)} className="sr-only" />
            <span className="font-medium block">{ad}</span>
            <span className="text-[11px] text-metin/50">{alt}</span>
          </label>
        ))}
      </div>
      {kaynak === "ELLE" ? (
        <div className="mt-3">
          <label className="block text-xs font-medium text-metin/60 mb-1">Kur (1 {pb} = kaç TL?)</label>
          <input
            name="kur"
            inputMode="decimal"
            required
            defaultValue={elleKur ? String(elleKur).replace(".", ",") : ""}
            placeholder="örn. 50,75"
            className="focus-ring w-40 border border-hat rounded-md px-3 py-2 text-sm font-mono"
          />
        </div>
      ) : (
        <p className="text-[11px] text-metin/50 mt-2">
          Kesin kur, sipariş onaylandığı gün TCMB bülteninden alınır (onaylayan isterse değiştirebilir).{tarih ? ` Son bülten: ${tarih}.` : ""}
        </p>
      )}
      <p className="text-[11px] text-metin/40 mt-1">Faturada farklı kur kullanılırsa aradaki fark cari hesaba &quot;kur farkı&quot; olarak işlenir.</p>
    </div>
  );
}
