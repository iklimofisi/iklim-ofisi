"use client";

import { useState } from "react";
import type { TcmbKurlari } from "@/lib/kur";

// -----------------------------------------------------------------------------
// KUR SEÇİMİ (TL'ye çevirme): TCMB döviz satış · TCMB efektif satış · elle kur.
// Kutuya basınca o kur yazılır; kur elle değiştirilirse "elle" seçilir. Form alanları: <name> (kur), kurKaynagi.
// sabitPb verilmezse formdaki select[name="paraBirimi"] izlenir (TL seçilince gizlenir, kur 1 gider).
// tutar verilirse altta TL karşılığı canlı gösterilir.
// -----------------------------------------------------------------------------
type Kaynak = "TCMB_DOVIZ" | "TCMB_EFEKTIF" | "ELLE";
const yaz = (n?: number | null) => (n ? String(Math.round(n * 1e6) / 1e6).replace(".", ",") : "");
const goster = (n?: number | null) => (n ? n.toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : "—");
const oku = (v: string) => {
  const t = v.trim().replace(/\s/g, "");
  if (!t) return null;
  const n = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t);
  return Number.isFinite(n) && n > 0 && n < 1000 ? n : null;
};

export default function KurAlani({
  baslangicPb = "TRY",
  sabitPb,
  kurlar,
  name = "kur",
  baslangicKur,
  tutar,
  baslik,
}: {
  baslangicPb?: string;
  sabitPb?: string;
  kurlar: TcmbKurlari | null;
  name?: string;
  baslangicKur?: number | null; // doluysa "elle" seçili başlar (ör. kayıtlı kur)
  tutar?: number | null; // döviz tutarı: TL karşılığı önizlemesi için
  baslik?: string;
}) {
  const tcmb = (p: string, k: Kaynak): number | null => {
    if (!kurlar || k === "ELLE") return null;
    const kod = p as "USD" | "EUR" | "GBP";
    if (k === "TCMB_DOVIZ") return kurlar.doviz?.[kod] ?? null;
    return (kod === "USD" ? kurlar.USD : kod === "EUR" ? kurlar.EUR : kod === "GBP" ? kurlar.GBP : null) ?? null;
  };
  const ilkPb = sabitPb ?? baslangicPb;
  const ilkKaynak: Kaynak = baslangicKur ? "ELLE" : tcmb(ilkPb, "TCMB_DOVIZ") ? "TCMB_DOVIZ" : tcmb(ilkPb, "TCMB_EFEKTIF") ? "TCMB_EFEKTIF" : "ELLE";
  const [pb, setPb] = useState(ilkPb);
  const [kaynak, setKaynak] = useState<Kaynak>(ilkKaynak);
  const [deger, setDeger] = useState(baslangicKur ? yaz(baslangicKur) : yaz(tcmb(ilkPb, ilkKaynak)));

  // Para birimi değişince seçili TCMB kaynağının kuru yeniden yazılır (elle kura dokunulmaz)
  const izle = (el: HTMLDivElement | null) => {
    if (!el || sabitPb) return;
    const sec = el.closest("form")?.querySelector<HTMLSelectElement>('select[name="paraBirimi"]');
    if (!sec || sec.dataset.kurIzleniyor) return;
    sec.dataset.kurIzleniyor = "1";
    sec.addEventListener("change", () => {
      const yeni = sec.value;
      setPb(yeni);
      setKaynak((k) => {
        if (k !== "ELLE") {
          const t = tcmb(yeni, k) ?? tcmb(yeni, k === "TCMB_DOVIZ" ? "TCMB_EFEKTIF" : "TCMB_DOVIZ");
          setDeger(yaz(t));
          if (!t) return "ELLE";
        }
        return k;
      });
    });
  };

  const sec = (k: Kaynak) => {
    setKaynak(k);
    if (k !== "ELLE") setDeger(yaz(tcmb(pb, k)));
  };

  const kur = oku(deger);
  const secenekler: [Kaynak, string, number | null][] = [
    ["TCMB_DOVIZ", "TCMB döviz satış", tcmb(pb, "TCMB_DOVIZ")],
    ["TCMB_EFEKTIF", "TCMB efektif satış", tcmb(pb, "TCMB_EFEKTIF")],
    ["ELLE", "Benim kurum", null],
  ];

  return (
    <div ref={izle} className={pb === "TRY" ? "hidden" : ""}>
      <p className="block text-xs font-medium text-metin/60 mb-1">{baslik ?? `TL'ye çevirme kuru (1 ${pb} = ? TL)`}</p>
      <div className="flex flex-wrap items-stretch gap-2">
        {secenekler.map(([k, ad, deg]) => (
          <button
            key={k}
            type="button"
            disabled={k !== "ELLE" && !deg}
            onClick={() => sec(k)}
            className={`focus-ring text-left border rounded-md px-3 py-1.5 text-xs disabled:opacity-40 ${
              kaynak === k ? "border-soguk bg-soguk-light text-soguk-dim" : "border-hat bg-white text-metin/70 hover:border-soguk"
            }`}
          >
            <span className="block font-semibold">{ad}</span>
            <span className="font-mono text-[11px]">{k === "ELLE" ? "elle yaz" : goster(deg)}</span>
          </button>
        ))}
        <input
          name={name}
          inputMode="decimal"
          value={pb === "TRY" ? "1" : deger}
          onChange={(e) => {
            setDeger(e.target.value);
            setKaynak("ELLE");
          }}
          placeholder="örn. 50,75"
          aria-label={`Kur (1 ${pb} = ? TL)`}
          className="focus-ring w-32 border border-hat rounded-md px-3 py-2 text-sm font-mono"
        />
        <input type="hidden" name="kurKaynagi" value={pb === "TRY" ? "" : kaynak} />
      </div>
      <p className="text-[11px] text-metin/50 mt-1">
        {kurlar?.tarih ? `TCMB ${kurlar.tarih} bülteni. ` : !kurlar ? "TCMB kuruna şu an ulaşılamadı; kuru elle yazın. " : ""}
        {deger && !kur ? <span className="text-sicak-dim">Kur anlaşılamadı (örn. 50,75).</span> : null}
        {kur && tutar ? (
          <span className="font-medium text-metin/70">
            {tutar.toLocaleString("tr-TR", { style: "currency", currency: pb })} × {goster(kur)} ≈{" "}
            {(tutar * kur).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
          </span>
        ) : null}
      </p>
    </div>
  );
}
