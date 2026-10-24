"use client";

import { useEffect, useMemo, useState } from "react";
import { fiyatListesiSecimdenKopyala } from "@/lib/actions";
import KaydetButonu from "@/components/KaydetButonu";
import { flParaYaz, FIYAT_SORUNUZ } from "@/lib/fiyat-listesi";

// -----------------------------------------------------------------------------
// ÜRÜN SEÇEREK PDF (elle düzenlenen listeler)
// Müşteriye gönderirken istenmeyen ürünlerin işareti kaldırılır, PDF yalnız
// işaretli ürünlerle çıkar. Kayıtlı liste değişmez. İşaretler bu tarayıcıda
// hatırlanır (bölüm + ürün adı + kod ile; liste kaydedilse de geçerli kalır).
// -----------------------------------------------------------------------------

export type SecimSatir = { id: string; bolum: string; ad: string; kod: string | null; fiyat: number; fiyat2: number | null; fiyat3?: number | null };

const sade = (m: string) =>
  m.toLocaleLowerCase("tr-TR").replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c");
const anahtar = (r: SecimSatir) => sade(`${r.bolum}|${r.ad}|${r.kod ?? ""}`).replace(/\s+/g, " ").trim();

export default function FiyatListesiSecim({
  listeId,
  satirlar,
  paraBirimi,
  fiyatBaslik,
  fiyat2Baslik,
  fiyat3Baslik = "",
}: {
  listeId: string;
  satirlar: SecimSatir[];
  paraBirimi: string;
  fiyatBaslik: string;
  fiyat2Baslik: string; // boşsa tek fiyatlı liste
  fiyat3Baslik?: string; // doluysa 3. fiyat sütunu (1. fiyatın yanında)
}) {
  const depo = `liste-haric:${listeId}`;
  const [haric, setHaric] = useState<Set<string>>(new Set());
  const [ara, setAra] = useState("");
  const [yuklendi, setYuklendi] = useState(false);
  const iki = fiyat2Baslik.trim().length > 0;
  const uc = iki && fiyat3Baslik.trim().length > 0;

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(depo) || "[]");
      if (Array.isArray(v)) setHaric(new Set(v.filter((x) => typeof x === "string")));
    } catch {
      /* tarayıcı deposu yoksa boş başlar */
    }
    setYuklendi(true);
  }, [depo]);
  useEffect(() => {
    if (!yuklendi) return;
    try {
      localStorage.setItem(depo, JSON.stringify([...haric]));
    } catch {
      /* yazılamazsa yalnız bu oturumda geçerli */
    }
  }, [haric, depo, yuklendi]);

  const gruplar = useMemo(() => {
    const m = new Map<string, SecimSatir[]>();
    for (const r of satirlar) {
      const b = r.bolum || "Diğer";
      if (!m.has(b)) m.set(b, []);
      m.get(b)!.push(r);
    }
    return [...m.entries()];
  }, [satirlar]);

  const kelimeler = sade(ara).split(/\s+/).filter(Boolean);
  const gorunur = (r: SecimSatir) => !kelimeler.length || kelimeler.every((k) => sade(`${r.bolum} ${r.ad} ${r.kod ?? ""}`).includes(k));
  const secili = (r: SecimSatir) => !haric.has(anahtar(r));
  const seciliSayi = satirlar.filter(secili).length;
  const haricIdler = satirlar.filter((r) => !secili(r)).map((r) => r.id);

  const degistir = (rows: SecimSatir[], sec: boolean) =>
    setHaric((h) => {
      const y = new Set(h);
      for (const r of rows) {
        if (sec) y.delete(anahtar(r));
        else y.add(anahtar(r));
      }
      return y;
    });

  const fiyat = (n: number | null) => (n && n > 0 ? flParaYaz(n, paraBirimi) : <span className="text-metin/45 font-sans text-xs">{FIYAT_SORUNUZ}</span>);
  const haricInputlari = haricIdler.map((id) => <input key={id} type="hidden" name="haric" value={id} />);

  return (
    <details className="group bg-yuzey border border-hat rounded-lg mb-6">
      <summary className="cursor-pointer list-none px-5 py-4 flex flex-wrap items-center justify-between gap-2">
        <span>
          <span className="font-display font-medium text-metin">☑ Ürün seçerek PDF al</span>
          <span className="block text-xs text-metin/55 mt-0.5">
            Müşteriye yalnız istediğiniz ürünleri gönderin. Şu an {seciliSayi} / {satirlar.length} ürün seçili.
          </span>
        </span>
        <span className="text-xs font-semibold text-soguk-dim group-open:hidden">Aç ▾</span>
        <span className="text-xs font-semibold text-soguk-dim hidden group-open:inline">Kapat ▴</span>
      </summary>

      <div className="px-5 pb-5 space-y-4 border-t border-hat pt-4">
        <p className="text-xs text-metin/55">
          Göndermek istemediğiniz ürünlerin işaretini kaldırın; PDF yalnız işaretli ürünlerle çıkar. Kayıtlı liste değişmez, işaretler bu tarayıcıda
          hatırlanır. Aşağıda listede kaydedilmemiş değişiklik varsa önce &quot;Listeyi Kaydet&quot;e basın.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <form action={`/api/fiyat-listesi/${listeId}/pdf`} method="post" target="_blank">
            {haricInputlari}
            <button type="submit" disabled={!seciliSayi} className="focus-ring text-sm font-medium border border-hat bg-white text-metin/70 px-4 py-2 rounded-md hover:border-soguk disabled:opacity-40">
              📄 Seçilenlerle PDF Görüntüle
            </button>
          </form>
          <form action={`/api/fiyat-listesi/${listeId}/pdf`} method="post">
            {haricInputlari}
            <input type="hidden" name="indir" value="1" />
            <button type="submit" disabled={!seciliSayi} className="focus-ring text-sm font-medium bg-soguk text-white px-4 py-2 rounded-md hover:bg-soguk-dim disabled:opacity-40">
              ⬇ PDF İndir ({seciliSayi} ürün)
            </button>
          </form>
          <form action={fiyatListesiSecimdenKopyala}>
            <input type="hidden" name="listeId" value={listeId} />
            {haricInputlari}
            <KaydetButonu basari={null} bekleme="Kopyalanıyor…" className="focus-ring text-sm font-medium border border-hat bg-white text-metin/70 px-4 py-2 rounded-md hover:border-soguk">
              ✎ Seçilenlerden yeni liste (kopya)
            </KaydetButonu>
          </form>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <input value={ara} onChange={(e) => setAra(e.target.value)} placeholder="Ürün, kod ya da bölüm ara…" className="focus-ring border border-hat rounded-md px-3 py-1.5 text-sm bg-white w-64" />
          <button type="button" onClick={() => degistir(satirlar, true)} className="focus-ring text-soguk-dim hover:underline">
            Tümünü işaretle
          </button>
          <button type="button" onClick={() => degistir(satirlar, false)} className="focus-ring text-metin/60 hover:underline">
            Tüm işaretleri kaldır
          </button>
          {kelimeler.length > 0 && (
            <>
              <button type="button" onClick={() => degistir(satirlar.filter(gorunur), true)} className="focus-ring text-soguk-dim hover:underline">
                Bulunanları işaretle
              </button>
              <button type="button" onClick={() => degistir(satirlar.filter(gorunur), false)} className="focus-ring text-metin/60 hover:underline">
                Bulunanların işaretini kaldır
              </button>
            </>
          )}
        </div>

        <div className="border border-hat rounded-md overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full text-sm min-w-[36rem]">
            <thead className="bg-zemin text-[11px] uppercase tracking-wider text-metin/55 sticky top-0">
              <tr>
                <th className="w-10 py-2" />
                <th className="text-left py-2 px-2 font-semibold">Ürün</th>
                <th className="text-right py-2 px-3 font-semibold whitespace-nowrap">{fiyatBaslik || "Fiyat"}</th>
                {uc && <th className="text-right py-2 px-3 font-semibold whitespace-nowrap">{fiyat3Baslik}</th>}
                {iki && <th className="text-right py-2 px-3 font-semibold whitespace-nowrap">{fiyat2Baslik}</th>}
              </tr>
            </thead>
            {gruplar.map(([bolum, rows]) => {
              const gor = rows.filter(gorunur);
              if (!gor.length) return null;
              const sec = gor.filter(secili).length;
              return (
                <tbody key={bolum}>
                  <tr className="bg-soguk-light/50 border-t border-hat">
                    <td className="py-1.5 text-center">
                      <input
                        type="checkbox"
                        aria-label={`${bolum} bölümünün tamamı`}
                        checked={sec === gor.length}
                        ref={(el) => {
                          if (el) el.indeterminate = sec > 0 && sec < gor.length;
                        }}
                        onChange={(e) => degistir(gor, e.target.checked)}
                        className="accent-soguk"
                      />
                    </td>
                    <td colSpan={(iki ? 3 : 2) + (uc ? 1 : 0)} className="py-1.5 px-2 text-xs font-semibold text-soguk-dim uppercase tracking-wide">
                      {bolum} <span className="font-normal normal-case text-metin/50">({sec}/{gor.length})</span>
                    </td>
                  </tr>
                  {gor.map((r) => {
                    const s = secili(r);
                    return (
                      <tr key={r.id} className={`border-t border-hat/60 ${s ? "" : "opacity-45"}`}>
                        <td className="py-1.5 text-center">
                          <input type="checkbox" aria-label={r.ad} checked={s} onChange={(e) => degistir([r], e.target.checked)} className="accent-soguk" />
                        </td>
                        <td className="py-1.5 px-2">
                          <span className={s ? "text-metin" : "line-through text-metin/60"}>{r.ad}</span>
                          {r.kod && <span className="ml-2 text-[11px] text-metin/50 font-mono">{r.kod}</span>}
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono whitespace-nowrap">{fiyat(r.fiyat)}</td>
                        {uc && <td className="py-1.5 px-3 text-right font-mono whitespace-nowrap">{fiyat(r.fiyat3 ?? null)}</td>}
                        {iki && <td className="py-1.5 px-3 text-right font-mono whitespace-nowrap">{fiyat(r.fiyat2)}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              );
            })}
          </table>
          {!satirlar.length && <p className="text-sm text-metin/50 p-4">Listede kayıtlı ürün yok.</p>}
        </div>
      </div>
    </details>
  );
}
