"use client";

import { useMemo, useState } from "react";
import { tutarOku } from "@/lib/toplam-dagit";

// Tedarikçi teklifi kalemleri + dip toplam.
// Birim fiyat zorunlu değil: tedarikçi sadece toplam verdiyse kalemleri
// fiyatsız yazıp "Tedarikçinin verdiği toplam" kutusunu doldurmanız yeterli.

type Satir = { key: number; aciklama: string; adet: string; birimFiyat: string };

const sayi = (v: string) => tutarOku(v) ?? 0;
const para = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

let sayac = 0;
const yeniSatir = (s?: Partial<Satir>): Satir => ({ key: ++sayac, aciklama: "", adet: "1", birimFiyat: "", ...s });

export default function SatinalmaKalemGirisi({
  baslangic,
  baslangicToplam,
  paraBirimiSecici = 'select[name="paraBirimi"]',
  sabitParaBirimi,
}: {
  baslangic?: { aciklama: string; adet: number; birimFiyat: number }[];
  baslangicToplam?: number | null;
  paraBirimiSecici?: string;
  sabitParaBirimi?: string;
}) {
  const [satirlar, setSatirlar] = useState<Satir[]>(() =>
    baslangic && baslangic.length
      ? baslangic.map((k) =>
          yeniSatir({
            aciklama: k.aciklama,
            adet: String(k.adet).replace(".", ","),
            birimFiyat: k.birimFiyat > 0 ? String(k.birimFiyat).replace(".", ",") : "",
          })
        )
      : [yeniSatir()]
  );
  const [toplamMetin, setToplamMetin] = useState(
    baslangicToplam != null && baslangicToplam > 0 ? String(baslangicToplam).replace(".", ",") : ""
  );
  const [pb, setPb] = useState(sabitParaBirimi ?? "TRY");

  // Formdaki para birimi seçimini izle (sembol için)
  const izle = (el: HTMLDivElement | null) => {
    if (!el || sabitParaBirimi) return;
    const sec = el.closest("form")?.querySelector<HTMLSelectElement>(paraBirimiSecici);
    if (!sec || sec.dataset.izleniyor) return;
    sec.dataset.izleniyor = "1";
    setPb(sec.value);
    sec.addEventListener("change", () => setPb(sec.value));
  };
  const sembol = pb === "EUR" ? "€" : pb === "USD" ? "$" : "₺";

  const guncelle = (key: number, alan: keyof Satir, deger: string) =>
    setSatirlar((p) => p.map((s) => (s.key === key ? { ...s, [alan]: deger } : s)));

  const ozet = useMemo(() => {
    let fiyatli = 0;
    let fiyatsizSayisi = 0;
    for (const s of satirlar) {
      if (!s.aciklama.trim()) continue;
      const f = sayi(s.birimFiyat);
      if (f > 0) fiyatli += sayi(s.adet) * f;
      else fiyatsizSayisi++;
    }
    return { fiyatli, fiyatsizSayisi };
  }, [satirlar]);

  const elleToplam = tutarOku(toplamMetin);
  const toplamHatali = toplamMetin.trim() !== "" && elleToplam === null;
  const gecerliToplam = elleToplam && elleToplam > 0 ? elleToplam : ozet.fiyatli;
  const eksikUyari = ozet.fiyatsizSayisi > 0 && !(elleToplam && elleToplam > 0);
  const tutarsiz = elleToplam && elleToplam > 0 && ozet.fiyatli > 0 && elleToplam + 0.005 < ozet.fiyatli;

  return (
    <div ref={izle} className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-metin/70">Kalemler</p>
        <p className="text-[11px] text-metin/50">Birim fiyat boş bırakılabilir</p>
      </div>

      <div className="hidden sm:grid grid-cols-[1fr_70px_120px_110px_28px] gap-2 text-[11px] text-metin/50 px-1">
        <span>Açıklama</span>
        <span className="text-center">Adet</span>
        <span className="text-right">Birim Fiyat ({sembol})</span>
        <span className="text-right">Tutar</span>
        <span />
      </div>

      {satirlar.map((s) => {
        const f = sayi(s.birimFiyat);
        return (
          <div
            key={s.key}
            className="grid grid-cols-[1fr_64px_28px] sm:grid-cols-[1fr_70px_120px_110px_28px] gap-2 items-center pb-2 border-b border-hat sm:pb-0 sm:border-0"
          >
            <input
              name="kalemAciklama"
              value={s.aciklama}
              onChange={(e) => guncelle(s.key, "aciklama", e.target.value)}
              placeholder="Ürün / iş kalemi"
              className="focus-ring border border-hat rounded-md px-2.5 py-1.5 text-sm bg-white"
            />
            <input
              name="kalemAdet"
              inputMode="decimal"
              value={s.adet}
              onChange={(e) => guncelle(s.key, "adet", e.target.value)}
              aria-label="Adet"
              className="focus-ring border border-hat rounded-md px-2 py-1.5 text-sm text-center bg-white"
            />
            <input
              name="kalemFiyat"
              inputMode="decimal"
              value={s.birimFiyat}
              onChange={(e) => guncelle(s.key, "birimFiyat", e.target.value)}
              placeholder="—"
              aria-label="Birim fiyat"
              className="order-4 sm:order-none focus-ring border border-hat rounded-md px-2 py-1.5 text-sm text-right font-mono bg-white"
            />
            <span className="order-5 sm:order-none col-span-2 sm:col-span-1 text-right font-mono text-xs text-metin/70 pr-1">
              {f > 0 ? `${para(sayi(s.adet) * f)} ${sembol}` : <span className="text-metin/35">fiyatsız</span>}
            </span>
            <button
              type="button"
              onClick={() => setSatirlar((p) => (p.length > 1 ? p.filter((x) => x.key !== s.key) : [yeniSatir()]))}
              aria-label="Satırı kaldır"
              className="order-3 sm:order-none focus-ring text-metin/40 hover:text-sicak-dim text-sm"
            >
              ✕
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => setSatirlar((p) => [...p, yeniSatir()])}
        className="focus-ring text-xs text-soguk-dim font-medium hover:underline"
      >
        + Kalem ekle
      </button>

      <div className="border-t border-hat pt-3 mt-1 flex flex-wrap items-end justify-between gap-3">
        <div>
          <label className="block text-xs font-semibold text-metin/70 mb-1">Tedarikçinin verdiği dip toplam</label>
          <div className="relative w-44">
            <input
              name="toplamTutar"
              inputMode="decimal"
              value={toplamMetin}
              onChange={(e) => setToplamMetin(e.target.value)}
              placeholder={ozet.fiyatli > 0 ? para(ozet.fiyatli) : "Örn: 12.500"}
              className={`focus-ring w-44 border rounded-md pl-3 pr-7 py-1.5 text-sm text-right font-mono font-semibold bg-white ${
                toplamHatali ? "border-red-400" : "border-hat"
              }`}
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-metin/50">{sembol}</span>
          </div>
          <p className="text-[11px] text-metin/50 mt-1">Birim fiyat verilmediyse burayı doldurun. Boş bırakırsanız kalemlerden hesaplanır.</p>
        </div>
        <div className="text-right">
          {ozet.fiyatli > 0 && elleToplam && elleToplam > 0 && (
            <p className="text-[11px] text-metin/50">Birim fiyatlı kalemler: {para(ozet.fiyatli)} {sembol}</p>
          )}
          <p className="text-sm font-bold text-metin">
            Toplam: <span className="font-mono">{para(gecerliToplam)} {sembol}</span>
          </p>
        </div>
      </div>

      {toplamHatali && <p className="text-xs text-red-700">Toplam anlaşılamadı. Örn: 12500 veya 12.500,50 yazın.</p>}
      {eksikUyari && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          {ozet.fiyatsizSayisi} kalemin birim fiyatı yok. Tedarikçinin verdiği dip toplamı yazmayı unutmayın.
        </p>
      )}
      {tutarsiz && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          Yazdığınız toplam, birim fiyatlı kalemlerin toplamından düşük. Doğru mu? (İskontolu toplam olabilir.)
        </p>
      )}
    </div>
  );
}
