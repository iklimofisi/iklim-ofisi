"use client";

import { useMemo, useState } from "react";
import { tclTeklifPdfOku, tclSatinalmaKaydet } from "@/lib/tcl-teklif-actions";
import KaydetButonu from "@/components/KaydetButonu";
import type { TclSonuc } from "@/lib/tcl-teklif-ayikla";

// -----------------------------------------------------------------------------
// TCL TEKLİF PDF'İ YÜKLE → satınalma teklifi
// PDF seçilince okunur ve önizlenir (ürün grupları, adet, birim fiyat, Net Tutar
// kontrolü). PDF'teki fiyatlar liste fiyatıdır; firmanın verdiği alış iskontosu
// yazılınca net alış fiyatları görünür. "Kaydet" ile satınalma teklifi oluşur;
// ardından teklif sayfasında kâr eklenip müşteri teklif formuna aktarılır.
// -----------------------------------------------------------------------------

const para = (n: number, pb: string) =>
  `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${pb === "EUR" ? "€" : pb === "TRY" ? "₺" : "$"}`;

export default function TclTeklifYukle({
  tedarikciler,
  konular = [],
  sabitKonu,
}: {
  tedarikciler: { id: string; ad: string }[];
  konular?: string[];
  sabitKonu?: string; // proje kartındaki "bu projeye ekle" penceresinde konu sabittir
}) {
  const [okunuyor, setOkunuyor] = useState(false);
  const [sonuc, setSonuc] = useState<TclSonuc | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [baslik, setBaslik] = useState(sabitKonu ?? "");
  const [tedarikciId, setTedarikciId] = useState(() => tedarikciler.find((t) => /tcl/i.test(t.ad))?.id ?? "");
  const [iskontoMetin, setIskontoMetin] = useState("");
  const iskN = (() => {
    const n = Number(iskontoMetin.trim().replace("%", "").replace(",", "."));
    return iskontoMetin.trim() && Number.isFinite(n) && n > 0 && n < 100 ? n : 0;
  })();
  const iskontoHatali = iskontoMetin.trim() !== "" && iskN === 0;
  const net = (n: number) => Math.round(n * (1 - iskN / 100) * 100) / 100;

  async function oku(dosya: File | undefined) {
    setSonuc(null);
    setHata(null);
    if (!dosya) return;
    setOkunuyor(true);
    try {
      const fd = new FormData();
      fd.append("pdf", dosya);
      const r = await tclTeklifPdfOku(fd);
      if (r.basarili) {
        setSonuc(r.sonuc);
        if (!sabitKonu && !baslik.trim() && r.sonuc.projeAdi) setBaslik(r.sonuc.projeAdi);
      } else setHata(r.hata);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "PDF okunamadı.");
    } finally {
      setOkunuyor(false);
    }
  }

  const gruplar = useMemo(() => {
    const m = new Map<string, TclSonuc["kalemler"]>();
    for (const k of sonuc?.kalemler ?? []) {
      if (!m.has(k.bolum)) m.set(k.bolum, []);
      m.get(k.bolum)!.push(k);
    }
    return [...m.entries()];
  }, [sonuc]);

  const pb = sonuc?.paraBirimi ?? "USD";
  const tutuyor = sonuc && !sonuc.fiyatsiz && sonuc.netTutar != null ? Math.abs(sonuc.netTutar - sonuc.kalemToplami) <= 1 : null;
  const kutu = "focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white";

  return (
    <form action={tclSatinalmaKaydet} className="space-y-3">
      <div className="grid sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">TCL teklif PDF&apos;i *</label>
          <input
            name="pdf"
            type="file"
            accept="application/pdf,.pdf"
            required
            disabled={okunuyor}
            onChange={(e) => oku(e.target.files?.[0])}
            className="focus-ring w-full text-xs border border-hat rounded p-1.5 bg-white"
          />
        </div>
        {sabitKonu ? (
          <input type="hidden" name="baslik" value={sabitKonu} />
        ) : (
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Proje / satınalma konusu *</label>
            <input
              name="baslik"
              required
              value={baslik}
              onChange={(e) => setBaslik(e.target.value)}
              list="tcl-konular"
              placeholder="PDF'teki proje adı gelir; mevcut projeyi de seçebilirsiniz"
              className={kutu}
            />
            <datalist id="tcl-konular">
              {konular.map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Tedarikçi *</label>
          <select name="tedarikciId" required value={tedarikciId} onChange={(e) => setTedarikciId(e.target.value)} className={kutu}>
            <option value="">— Tedarikçi seçin —</option>
            {tedarikciler.map((t) => (
              <option key={t.id} value={t.id}>
                {t.ad}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Alış iskontosu (%)</label>
          <input
            name="alisIskontoYuzde"
            inputMode="decimal"
            value={iskontoMetin}
            onChange={(e) => setIskontoMetin(e.target.value)}
            placeholder="örn. 35"
            className={`${kutu} ${iskontoHatali ? "border-sicak/60" : ""}`}
          />
          <p className="text-[10px] text-metin/45 mt-0.5">PDF&apos;teki liste fiyatlarından düşülür; sonradan değiştirilebilir.</p>
        </div>
      </div>
      {iskontoHatali && <p className="text-xs text-sicak-dim">İskonto 0 ile 100 arasında bir yüzde olmalı (örn. 35 ya da 37,5).</p>}

      {okunuyor && <p className="text-sm text-soguk-dim">PDF okunuyor…</p>}
      {hata && <p className="text-sm bg-sicak-light border border-sicak/40 text-sicak-dim rounded-md px-3 py-2">⚠ {hata}</p>}

      {sonuc && (
        <div className="border border-hat rounded-md bg-white">
          <div className="px-3 py-2 border-b border-hat flex flex-wrap items-center justify-between gap-2 text-xs">
            <span>
              <strong className="text-metin">{sonuc.projeAdi || "Proje adı okunamadı"}</strong>
              <span className="text-metin/50"> · {sonuc.tarih || "tarih yok"} · {sonuc.kalemler.length} kalem · {pb}</span>
            </span>
            <span className="font-mono">
              {sonuc.fiyatsiz ? (
                <span className="text-amber-800">Birim fiyatsız teklif · Net Tutar {sonuc.netTutar != null ? para(sonuc.netTutar, pb) : "—"}</span>
              ) : (
                <>
                  Liste toplamı <strong>{para(sonuc.kalemToplami, pb)}</strong>
                  {sonuc.netTutar != null && (
                    <span className={tutuyor ? "text-emerald-700" : "text-sicak-dim"}>
                      {" "}
                      · PDF Net Tutar {para(sonuc.netTutar, pb)} {tutuyor ? "✓" : "⚠"}
                    </span>
                  )}
                </>
              )}
              {iskN > 0 && (
                <span className="block text-right text-soguk-dim">
                  %{iskN.toLocaleString("tr-TR")} iskontolu net alış:{" "}
                  <strong>{para(net(sonuc.fiyatsiz ? sonuc.netTutar ?? 0 : sonuc.kalemToplami), pb)}</strong>
                </span>
              )}
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-metin/50 bg-zemin sticky top-0">
                <tr>
                  <th className="text-left px-3 py-1.5">Ürün</th>
                  <th className="text-right px-2 py-1.5">Adet</th>
                  <th className="text-right px-2 py-1.5">Liste fiyatı</th>
                  {iskN > 0 && <th className="text-right px-2 py-1.5 text-soguk-dim">Net alış</th>}
                  <th className="text-right px-3 py-1.5">{iskN > 0 ? "Net tutar" : "Tutar"}</th>
                </tr>
              </thead>
              {gruplar.map(([bolum, kalemler]) => (
                <tbody key={bolum}>
                  <tr className="bg-soguk-light/50">
                    <td colSpan={iskN > 0 ? 5 : 4} className="px-3 py-1 font-semibold text-soguk-dim">
                      {bolum}
                    </td>
                  </tr>
                  {kalemler.map((k, i) => (
                    <tr key={i} className="border-t border-hat/60">
                      <td className="px-3 py-1">
                        <span className="font-mono text-metin">{k.kod}</span> <span className="text-metin/70">{k.aciklama}</span>
                      </td>
                      <td className="px-2 py-1 text-right font-mono">{k.adet}</td>
                      <td className="px-2 py-1 text-right font-mono">{k.birimFiyat > 0 ? para(k.birimFiyat, pb) : "—"}</td>
                      {iskN > 0 && (
                        <td className="px-2 py-1 text-right font-mono text-soguk-dim">{k.birimFiyat > 0 ? para(net(k.birimFiyat), pb) : "—"}</td>
                      )}
                      <td className="px-3 py-1 text-right font-mono">
                        {k.birimFiyat > 0 ? para(iskN > 0 ? net(k.birimFiyat) * k.adet : k.tutar, pb) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
          {(sonuc.notlar.length > 0 || sonuc.uyarilar.length > 0) && (
            <div className="px-3 py-2 border-t border-hat text-[11px] space-y-0.5">
              {sonuc.notlar.map((n, i) => (
                <p key={`n${i}`} className="text-metin/60">
                  Tedarikçi notu: {n}
                </p>
              ))}
              {sonuc.uyarilar.map((u, i) => (
                <p key={`u${i}`} className="text-amber-800">
                  ⚠ {u}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <KaydetButonu basari={null} bekleme="Kaydediliyor…">
          Satınalma teklifi olarak kaydet →
        </KaydetButonu>
        <p className="text-[11px] text-metin/50">
          Kaydedince teklif sayfası açılır; orada kâr oranını yazıp müşteri teklif formuna aktarırsınız. PDF maliyet dosyası olarak saklanır.
        </p>
      </div>
    </form>
  );
}
