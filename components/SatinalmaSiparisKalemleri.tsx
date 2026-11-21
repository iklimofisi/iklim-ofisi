"use client";

import { useMemo, useState } from "react";
import { tutarOku } from "@/lib/toplam-dagit";

// -----------------------------------------------------------------------------
// SATINALMA SİPARİŞİ KALEMLERİ (form içinde)
// Her kalemde açıklama, adet ve birim fiyat zorunludur (siparişte fiyatsız kalem olmaz).
// Ürün kodu stok kartındaki kodla aynıysa mal kabulde ürün stoğa girer.
// Para birimi, formdaki select[name="paraBirimi"] izlenerek gösterilir.
// -----------------------------------------------------------------------------
type Satir = { key: number; kod: string; aciklama: string; adet: string; birim: string; fiyat: string; iskonto: string; bolum: string };
export type BaslangicKalemi = { kod?: string | null; aciklama: string; adet: number; birim?: string | null; birimFiyat: number; iskontoYuzde?: number | null; bolum?: string | null };

const sayi = (v: string) => tutarOku(v) ?? 0;
const para = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const yaz = (n: number) => String(n).replace(".", ",");

let sayac = 0;
const yeniSatir = (s?: Partial<Satir>): Satir => ({ key: ++sayac, kod: "", aciklama: "", adet: "1", birim: "Adet", fiyat: "", iskonto: "", bolum: "", ...s });

export default function SatinalmaSiparisKalemleri({ baslangic }: { baslangic?: BaslangicKalemi[] }) {
  const [satirlar, setSatirlar] = useState<Satir[]>(() =>
    baslangic && baslangic.length
      ? baslangic.map((k) =>
          yeniSatir({
            kod: k.kod ?? "",
            aciklama: k.aciklama,
            adet: yaz(k.adet),
            birim: k.birim || "Adet",
            fiyat: k.birimFiyat > 0 ? yaz(k.birimFiyat) : "",
            iskonto: k.iskontoYuzde ? yaz(k.iskontoYuzde) : "",
            bolum: k.bolum ?? "",
          })
        )
      : [yeniSatir()]
  );
  const [pb, setPb] = useState("TRY");

  const izle = (el: HTMLDivElement | null) => {
    if (!el) return;
    const sec = el.closest("form")?.querySelector<HTMLSelectElement>('select[name="paraBirimi"]');
    if (!sec || sec.dataset.izleniyor) return;
    sec.dataset.izleniyor = "1";
    setPb(sec.value);
    sec.addEventListener("change", () => setPb(sec.value));
  };
  const sembol = pb === "EUR" ? "€" : pb === "USD" ? "$" : "₺";

  const guncelle = (key: number, alan: keyof Satir, deger: string) => setSatirlar((p) => p.map((s) => (s.key === key ? { ...s, [alan]: deger } : s)));

  const { toplam, fiyatsiz } = useMemo(() => {
    let t = 0;
    let f = 0;
    for (const s of satirlar) {
      if (!s.aciklama.trim()) continue;
      const fiyat = sayi(s.fiyat);
      if (fiyat <= 0) f++;
      t += sayi(s.adet) * fiyat * (1 - Math.min(Math.max(sayi(s.iskonto), 0), 99.99) / 100);
    }
    return { toplam: t, fiyatsiz: f };
  }, [satirlar]);

  const kutu = "focus-ring border border-hat rounded-md px-2 py-1.5 text-sm bg-white";

  return (
    <div ref={izle} className="space-y-2">
      <div className="hidden lg:grid grid-cols-[110px_1fr_70px_80px_110px_60px_110px_28px] gap-2 text-[11px] text-metin/50 px-1">
        <span>Ürün kodu</span>
        <span>Açıklama</span>
        <span className="text-center">Adet</span>
        <span>Birim</span>
        <span className="text-right">Birim fiyat ({sembol})</span>
        <span className="text-right">İsk. %</span>
        <span className="text-right">Tutar</span>
        <span />
      </div>
      {satirlar.map((s) => {
        const tutar = sayi(s.adet) * sayi(s.fiyat) * (1 - Math.min(Math.max(sayi(s.iskonto), 0), 99.99) / 100);
        return (
          <div key={s.key} className="grid grid-cols-2 lg:grid-cols-[110px_1fr_70px_80px_110px_60px_110px_28px] gap-2 items-center pb-2 border-b border-hat lg:pb-0 lg:border-0">
            <input type="hidden" name="kalemBolum" value={s.bolum} />
            <input name="kalemKod" value={s.kod} onChange={(e) => guncelle(s.key, "kod", e.target.value)} placeholder="Kod (ops.)" aria-label="Ürün kodu" className={`${kutu} font-mono`} />
            <input
              name="kalemAciklama"
              value={s.aciklama}
              onChange={(e) => guncelle(s.key, "aciklama", e.target.value)}
              placeholder="Ürün / malzeme"
              aria-label="Açıklama"
              title={s.bolum ? `Bölüm: ${s.bolum}` : undefined}
              className={`${kutu} col-span-2 lg:col-span-1 order-first lg:order-none`}
            />
            <input name="kalemAdet" inputMode="decimal" value={s.adet} onChange={(e) => guncelle(s.key, "adet", e.target.value)} aria-label="Adet" className={`${kutu} text-center`} />
            <input name="kalemBirim" value={s.birim} onChange={(e) => guncelle(s.key, "birim", e.target.value)} aria-label="Birim" className={kutu} />
            <input
              name="kalemFiyat"
              inputMode="decimal"
              value={s.fiyat}
              onChange={(e) => guncelle(s.key, "fiyat", e.target.value)}
              placeholder="Zorunlu"
              aria-label="Birim fiyat"
              className={`${kutu} text-right font-mono ${s.aciklama.trim() && sayi(s.fiyat) <= 0 ? "border-amber-400" : ""}`}
            />
            <input name="kalemIskonto" inputMode="decimal" value={s.iskonto} onChange={(e) => guncelle(s.key, "iskonto", e.target.value)} placeholder="0" aria-label="İskonto yüzdesi" className={`${kutu} text-right`} />
            <span className="text-right font-mono text-xs text-metin/70 pr-1">{tutar > 0 ? `${para(tutar)} ${sembol}` : "—"}</span>
            <button
              type="button"
              onClick={() => setSatirlar((p) => (p.length > 1 ? p.filter((x) => x.key !== s.key) : [yeniSatir()]))}
              aria-label="Satırı kaldır"
              className="focus-ring text-metin/40 hover:text-sicak-dim text-sm justify-self-end"
            >
              ✕
            </button>
          </div>
        );
      })}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button type="button" onClick={() => setSatirlar((p) => [...p, yeniSatir()])} className="focus-ring text-xs text-soguk-dim font-medium hover:underline">
          + Kalem ekle
        </button>
        <p className="text-sm font-bold text-metin">
          Toplam (KDV hariç): <span className="font-mono">{para(toplam)} {sembol}</span>
        </p>
      </div>
      {fiyatsiz > 0 && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          {fiyatsiz} kalemin birim fiyatı yok. Satınalma siparişinde her kalemin fiyatı olmalı.
        </p>
      )}
    </div>
  );
}
