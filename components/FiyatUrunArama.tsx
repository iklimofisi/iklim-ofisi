"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { fiyatListelerindeAra, type FiyatAramaSonucu } from "@/lib/fiyat-arama-actions";
import { flParaYaz, FIYAT_SORUNUZ } from "@/lib/fiyat-listesi";

// Fiyat Listeleri sayfasının üstündeki arama: bütün listelerdeki ürünlerde arar, fiyatı
// (ve panelde görünen alış fiyatını) listeye girmeden gösterir. Yalnız okur.
export default function FiyatUrunArama() {
  const [sorgu, setSorgu] = useState("");
  const [sonuc, setSonuc] = useState<{ sorgu: string; sonuclar: FiyatAramaSonucu[]; toplam: number } | null>(null);
  const [bekliyor, setBekliyor] = useState(false);
  const [hata, setHata] = useState(false);
  const istekNo = useRef(0);
  const kutu = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = sorgu.trim();
    if (q.replace(/[\s\-_./]+/g, "").length < 2) {
      istekNo.current++;
      setSonuc(null);
      setBekliyor(false);
      setHata(false);
      return;
    }
    const no = ++istekNo.current;
    setBekliyor(true);
    const zamanlayici = setTimeout(async () => {
      try {
        const r = await fiyatListelerindeAra(q);
        if (no !== istekNo.current) return; // daha yeni bir arama başladı
        setSonuc({ sorgu: q, ...r });
        setHata(false);
      } catch {
        if (no === istekNo.current) setHata(true);
      } finally {
        if (no === istekNo.current) setBekliyor(false);
      }
    }, 300);
    return () => clearTimeout(zamanlayici);
  }, [sorgu]);

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

  const para = (n: number | null, pb: string) =>
    n !== null ? flParaYaz(n, pb) : <span className="text-metin/45 font-sans text-xs font-normal">{FIYAT_SORUNUZ}</span>;

  return (
    <div className="bg-yuzey border border-soguk/40 rounded-lg p-5 mb-8 shadow-sm">
      <label htmlFor="fiyat-urun-ara" className="block font-display font-medium text-metin mb-1">
        🔍 Fiyat listelerinde ürün ara
      </label>
      <p className="text-xs text-metin/55 mb-3">
        Bütün listelerde arar; listeyi açmadan fiyatı görürsünüz. Ürün adı, model kodu, marka ya da bölüm yazın. Kısayol: sayfada <kbd className="font-mono border border-hat rounded px-1">/</kbd> tuşu.
      </p>
      <div className="relative">
        <input
          id="fiyat-urun-ara"
          ref={kutu}
          type="search"
          value={sorgu}
          onChange={(e) => setSorgu(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSorgu("");
          }}
          placeholder="örn. GB272-50, vitodens 100, sakura 12000, kaset…"
          autoComplete="off"
          spellCheck={false}
          className="focus-ring w-full border border-hat rounded-md pl-3 pr-24 py-2.5 text-sm bg-white"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-metin/45" aria-live="polite">
          {bekliyor ? "Aranıyor…" : sonuc ? `${sonuc.toplam} sonuç` : ""}
        </span>
      </div>

      {hata && <p className="text-xs text-sicak-dim mt-3">Arama yapılamadı. Sayfayı yenileyip tekrar deneyin.</p>}

      {sonuc && !hata && (
        <div className="mt-4">
          {sonuc.sonuclar.length === 0 ? (
            <p className="text-sm text-metin/60">&quot;{sonuc.sorgu}&quot; hiçbir listede bulunamadı. Daha kısa yazmayı ya da yalnız model kodunu denemeyi deneyin.</p>
          ) : (
            <>
              {sonuc.toplam > sonuc.sonuclar.length && (
                <p className="text-xs text-metin/55 mb-2">
                  {sonuc.toplam} sonucun ilk {sonuc.sonuclar.length} tanesi gösteriliyor; daraltmak için bir kelime daha ekleyin.
                </p>
              )}
              <div className="overflow-x-auto border border-hat rounded-md max-h-[32rem] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zemin sticky top-0 z-10">
                    <tr className="text-left text-[11px] uppercase tracking-wide text-metin/50">
                      <th className="px-3 py-2 font-semibold">Ürün</th>
                      <th className="px-3 py-2 font-semibold">Liste</th>
                      <th className="px-3 py-2 font-semibold text-right">Fiyat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sonuc.sonuclar.map((r) => (
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
                        <td className="px-3 py-2.5 min-w-[11rem]">
                          <Link
                            href={`/panel/fiyat-listeleri/${r.listeId}?urun=${encodeURIComponent(r.kod || r.ad)}#urun-ara`}
                            className="focus-ring text-soguk-dim hover:underline text-xs font-medium"
                          >
                            {r.listeBaslik} →
                          </Link>
                          {r.listeEtiket && <p className="text-[10px] text-metin/45 mt-0.5 uppercase tracking-wide">{r.listeEtiket}</p>}
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          {r.fiyatlar.map((f) => (
                            <p key={f.ad} className="leading-snug">
                              {r.fiyatlar.length > 1 && <span className="text-[11px] text-metin/50 mr-1.5">{f.ad}</span>}
                              <span className="font-mono font-semibold text-metin">{para(f.deger, r.paraBirimi)}</span>
                            </p>
                          ))}
                          {r.alislar.map((f) => (
                            <p key={f.ad} className="leading-snug text-[11px] text-metin/55">
                              <span className="mr-1.5">{f.ad}</span>
                              <span className="font-mono">{para(f.deger, r.paraBirimi)}</span>
                            </p>
                          ))}
                          {r.not && <p className="text-[10px] text-amber-700 mt-0.5">{r.not}</p>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-metin/45 mt-2">
                Fiyatlar listede kayıtlı fiyatlardır (KDV durumu listenin ayarına göredir). Alış fiyatları yalnız panelde görünür.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
