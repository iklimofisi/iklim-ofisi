"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { flParaYaz, FIYAT_SORUNUZ } from "@/lib/fiyat-listesi";

// -----------------------------------------------------------------------------
// LİSTE İÇİ ÜRÜN ARAMA (panel → Fiyat Listeleri → bir liste açılınca en üstte)
// Yazdıkça bu listedeki ürünleri süzer ve fiyatlarını (ve yalnız panelde görünen alış
// fiyatını) hemen gösterir. Yalnız okur; listede hiçbir şeyi değiştirmez.
// * Türkçe karakter ve büyük/küçük harf farkı gözetilmez ("isi" → "ISI", "Isı").
// * Birden fazla kelime yazılırsa hepsini içeren ürünler gelir.
// * Model kodunda boşluk / tire farkı gözetilmez ("gb27250" → "GB272-50").
// -----------------------------------------------------------------------------

export type AramaFiyat = { ad: string; deger: number | null };
export type AramaSatiri = {
  id: string;
  bolum: string;
  ad: string;
  kod: string | null;
  marka: string | null;
  aciklama: string | null;
  fiyatlar: AramaFiyat[];
  alislar: AramaFiyat[];
};

const EN_FAZLA = 100;

const sade = (m: string) =>
  m
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/û/g, "u");
const bitisik = (m: string) => m.replace(/[\s\-_./]+/g, "");

export default function FiyatUrunArama({ satirlar, paraBirimi, not = "" }: { satirlar: AramaSatiri[]; paraBirimi: string; not?: string }) {
  const [sorgu, setSorgu] = useState("");
  const kutu = useRef<HTMLInputElement>(null);

  // Arama metinleri bir kez hazırlanır (büyük listelerde her tuşta yeniden hesaplanmasın)
  const dizin = useMemo(
    () =>
      satirlar.map((r) => {
        const kod = r.kod ? sade(r.kod) : "";
        const metin = sade(`${r.ad} ${kod} ${r.marka ?? ""} ${r.bolum} ${r.aciklama ?? ""}`);
        return { r, metin, metinBitisik: bitisik(metin), kodBitisik: bitisik(kod), ad: sade(r.ad) };
      }),
    [satirlar]
  );

  const q = sade(sorgu).trim();
  const kelimeler = q.split(/\s+/).filter(Boolean);
  const qBitisik = bitisik(q);
  const sonuc = useMemo(() => {
    if (!qBitisik) return null;
    const bulunan = dizin
      .filter((d) => kelimeler.every((w) => d.metin.includes(w)) || (qBitisik.length >= 3 && d.metinBitisik.includes(qBitisik)))
      .map((d, i) => ({
        r: d.r,
        i,
        puan: d.kodBitisik && d.kodBitisik === qBitisik ? 0 : d.kodBitisik && d.kodBitisik.startsWith(qBitisik) ? 1 : d.ad.startsWith(kelimeler[0] ?? "") ? 2 : 3,
      }));
    bulunan.sort((a, b) => a.puan - b.puan || a.i - b.i);
    return { toplam: bulunan.length, satirlar: bulunan.slice(0, EN_FAZLA).map((b) => b.r) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dizin, q]);

  // Kısayol: sayfada herhangi bir yerde "/" tuşu arama kutusuna gider
  useEffect(() => {
    const tus = (e: KeyboardEvent) => {
      const hedef = e.target as HTMLElement | null;
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      if (hedef && (hedef.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(hedef.tagName))) return;
      e.preventDefault();
      kutu.current?.focus();
    };
    window.addEventListener("keydown", tus);
    return () => window.removeEventListener("keydown", tus);
  }, []);

  const para = (n: number | null) =>
    n !== null ? flParaYaz(n, paraBirimi) : <span className="text-metin/45 font-sans text-xs font-normal">{FIYAT_SORUNUZ}</span>;

  return (
    <div className="bg-yuzey border border-soguk/40 rounded-lg p-4 mb-6 shadow-sm">
      <label htmlFor="liste-urun-ara" className="block text-sm font-medium text-metin mb-2">
        🔍 Bu listede ürün ara <span className="text-xs font-normal text-metin/50">({satirlar.length} ürün)</span>
      </label>
      <div className="relative">
        <input
          id="liste-urun-ara"
          ref={kutu}
          type="search"
          value={sorgu}
          onChange={(e) => setSorgu(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSorgu("");
          }}
          placeholder="Ürün adı, model kodu, marka ya da bölüm yazın…"
          autoComplete="off"
          spellCheck={false}
          className="focus-ring w-full border border-hat rounded-md pl-3 pr-24 py-2.5 text-sm bg-white"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-metin/45" aria-live="polite">
          {sonuc ? `${sonuc.toplam} sonuç` : ""}
        </span>
      </div>
      {!sonuc && (
        <p className="text-[11px] text-metin/45 mt-2">
          Kısayol: sayfada <kbd className="font-mono border border-hat rounded px-1">/</kbd> tuşu arama kutusuna gider, <kbd className="font-mono border border-hat rounded px-1">Esc</kbd> temizler.
        </p>
      )}

      {sonuc && (
        <div className="mt-3">
          {sonuc.toplam === 0 ? (
            <p className="text-sm text-metin/60">Bu listede bulunamadı. Daha kısa yazmayı ya da yalnız model kodunu aramayı deneyin.</p>
          ) : (
            <>
              {sonuc.toplam > sonuc.satirlar.length && (
                <p className="text-xs text-metin/55 mb-2">
                  {sonuc.toplam} sonucun ilk {sonuc.satirlar.length} tanesi gösteriliyor; daraltmak için bir kelime daha ekleyin.
                </p>
              )}
              <div className="overflow-x-auto border border-hat rounded-md max-h-[30rem] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zemin sticky top-0 z-10">
                    <tr className="text-left text-[11px] uppercase tracking-wide text-metin/50">
                      <th className="px-3 py-2 font-semibold">Ürün</th>
                      <th className="px-3 py-2 font-semibold text-right">Fiyat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sonuc.satirlar.map((r) => (
                      <tr key={r.id} className="border-t border-hat align-top hover:bg-soguk-light/30">
                        <td className="px-3 py-2.5 min-w-[16rem]">
                          <p className="font-medium text-metin">{r.ad}</p>
                          <p className="text-[11px] text-metin/55 mt-0.5">
                            {[r.marka, r.kod && <span key="k" className="font-mono">{r.kod}</span>, r.bolum].filter(Boolean).map((x, i) => (
                              <span key={i}>
                                {i > 0 && " · "}
                                {x}
                              </span>
                            ))}
                          </p>
                          {r.aciklama && <p className="text-[11px] text-metin/45 mt-0.5 line-clamp-2">{r.aciklama}</p>}
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          {r.fiyatlar.map((f) => (
                            <p key={f.ad} className="leading-snug">
                              {r.fiyatlar.length > 1 && <span className="text-[11px] text-metin/50 mr-1.5">{f.ad}</span>}
                              <span className="font-mono font-semibold text-metin">{para(f.deger)}</span>
                            </p>
                          ))}
                          {r.alislar.map((f) => (
                            <p key={f.ad} className="leading-snug text-[11px] text-metin/55">
                              <span className="mr-1.5">{f.ad}</span>
                              <span className="font-mono">{para(f.deger)}</span>
                            </p>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-metin/45 mt-2">
                Listede kayıtlı (son kaydedilen) fiyatlardır. Alış fiyatları yalnız panelde görünür.{not && ` ${not}`}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
