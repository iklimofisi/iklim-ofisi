"use client";

import { useState } from "react";

// Para birimi seçimine göre kur kutusu: TL'de gizlenir; döviz seçilince TCMB kuru önerilir
// (kullanıcı değiştirdiyse dokunulmaz). Formdaki select[name="paraBirimi"] izlenir.
export default function KurAlani({ baslangicPb = "TRY", kurlar }: { baslangicPb?: string; kurlar: { USD?: number; EUR?: number } | null }) {
  const oneri = (pb: string) => (pb === "USD" || pb === "EUR" ? kurlar?.[pb] : undefined);
  const yaz = (n?: number) => (n ? String(n).replace(".", ",") : "");
  const [pb, setPb] = useState(baslangicPb);
  const [deger, setDeger] = useState(yaz(oneri(baslangicPb)));
  const [elle, setElle] = useState(false);

  const izle = (el: HTMLDivElement | null) => {
    if (!el) return;
    const sec = el.closest("form")?.querySelector<HTMLSelectElement>('select[name="paraBirimi"]');
    if (!sec || sec.dataset.kurIzleniyor) return;
    sec.dataset.kurIzleniyor = "1";
    sec.addEventListener("change", () => {
      setPb(sec.value);
      setElle((e) => {
        if (!e) setDeger(yaz(oneri(sec.value)));
        return e;
      });
    });
  };

  return (
    <div ref={izle} className={pb === "TRY" ? "hidden" : ""}>
      <label className="block text-xs font-medium text-metin/60 mb-1">Kur (1 {pb} = ? TL)</label>
      <input
        name="kur"
        inputMode="decimal"
        value={pb === "TRY" ? "1" : deger}
        onChange={(e) => {
          setDeger(e.target.value);
          setElle(true);
        }}
        className="focus-ring w-32 border border-hat rounded-md px-3 py-2 text-sm font-mono"
      />
      {oneri(pb) ? <p className="text-[11px] text-metin/50 mt-1">TCMB döviz satış: {yaz(oneri(pb))}</p> : null}
    </div>
  );
}
