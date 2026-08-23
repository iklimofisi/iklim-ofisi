"use client";

import { useState, useMemo, useEffect } from "react";
import UrunArama from "@/components/UrunArama";

export type Satir = {
  key: number | string;
  bolum?: string;
  aciklama?: string;
  adet?: string | number;
  birimFiyat?: string | number;
  iskontoYuzde?: string | number;
  markaId?: string | null;
};

type Urun = {
  id: string;
  kod: string | null;
  ad: string;
  markaId: string | null;
  birimFiyat: number;
  paraBirimi: string;
};

// Türkçe virgülü ve noktayı güvenli sayıya çevirici
const parseSayi = (val: string | number | undefined): number => {
  if (val === undefined || val === null || val === "") return 0;
  if (typeof val === "number") return val;
  const clean = val.toString().replace(",", ".").trim();
  return parseFloat(clean) || 0;
};

// Fiyat Formatlayıcı
const formatPara = (val: number) => {
  return val.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function TeklifKalemleri({
  baslangic,
  markalar,
  urunler,
  paraBirimi = "TRY",
}: {
  baslangic?: Satir[];
  markalar?: { id: string; ad: string }[];
  urunler?: Urun[];
  paraBirimi?: string;
}) {
  // State: Tüm kalemler
  const [satirlar, setSatirlar] = useState<Satir[]>(() => {
    if (baslangic && baslangic.length > 0) {
      return baslangic.map((s, idx) => ({
        key: s.key ?? idx,
        bolum: s.bolum || "VRF Sistemleri",
        aciklama: s.aciklama ?? "",
        adet: String(s.adet ?? 1),
        birimFiyat: String(s.birimFiyat ?? 0),
        iskontoYuzde: String(s.iskontoYuzde ?? 0),
        markaId: s.markaId ?? "",
      }));
    }
    return [
      {
        key: Date.now(),
        bolum: "VRF Sistemleri",
        aciklama: "",
        adet: "1",
        birimFiyat: "0",
        iskontoYuzde: "0",
        markaId: "",
      },
    ];
  });

  const [topluIskontoOrani, setTopluIskontoOrani] = useState("");
  const [yeniBolumAdi, setYeniBolumAdi] = useState("");
  const [seciliParaBirimi, setSeciliParaBirimi] = useState<string>(paraBirimi || "TRY");

  // DİNANMİK PARA BİRİMİ SİMGESİ (EUR -> €, USD -> $, TRY -> ₺)
  useEffect(() => {
    const selectEl = document.querySelector<HTMLSelectElement>('select[name="paraBirimi"]');
    if (!selectEl) return;

    const handler = () => setSeciliParaBirimi(selectEl.value);
    selectEl.addEventListener("change", handler);
    setSeciliParaBirimi(selectEl.value); // Açılışta oku

    return () => selectEl.removeEventListener("change", handler);
  }, []);

  const sembol = useMemo(() => {
    if (seciliParaBirimi === "EUR") return "€";
    if (seciliParaBirimi === "USD") return "$";
    return "₺";
  }, [seciliParaBirimi]);

  const markaVar = markalar && markalar.length > 0;
  const urunVar = urunler && urunler.length > 0;

  // --- SIRALAMA & KONUM DEĞİŞTİRME MANTIKLARI ---
  const satirYukaritas = (orjinalIndex: number) => {
    if (orjinalIndex === 0) return;
    setSatirlar((prev) => {
      const clone = [...prev];
      const temp = clone[orjinalIndex];
      clone[orjinalIndex] = clone[orjinalIndex - 1];
      clone[orjinalIndex - 1] = temp;
      return clone;
    });
  };

  const satirAsagiTas = (orjinalIndex: number) => {
    if (orjinalIndex === satirlar.length - 1) return;
    setSatirlar((prev) => {
      const clone = [...prev];
      const temp = clone[orjinalIndex];
      clone[orjinalIndex] = clone[orjinalIndex + 1];
      clone[orjinalIndex + 1] = temp;
      return clone;
    });
  };

  const satirKonumDegistir = (currentIndex: number, hedefSira: number) => {
    const newIndex = hedefSira - 1; // 1-tabanlı sıradan 0-tabanlı indekse
    if (newIndex < 0 || newIndex >= satirlar.length || newIndex === currentIndex) return;
    setSatirlar((prev) => {
      const clone = [...prev];
      const [movedItem] = clone.splice(currentIndex, 1);
      clone.splice(newIndex, 0, movedItem);
      return clone;
    });
  };

  // Satır Güncelleme
  const satirGuncelle = (key: number | string, field: keyof Satir, value: string) => {
    setSatirlar((prev) =>
      prev.map((s) => (s.key === key ? { ...s, [field]: value } : s))
    );
  };

  // Yeni Satır Ekle
  const satirEkle = (bolumAdi: string = "Genel Kalemler") => {
    setSatirlar((prev) => [
      ...prev,
      {
        key: Date.now() + Math.random(),
        bolum: bolumAdi,
        aciklama: "",
        adet: "1",
        birimFiyat: "0",
        iskontoYuzde: topluIskontoOrani || "0",
        markaId: "",
      },
    ]);
  };

  // Satır Sil
  const satirSil = (key: number | string) => {
    setSatirlar((prev) => prev.filter((s) => s.key !== key));
  };

  // Katalogdan Ürün Seçildiğinde Fiyat ve Açıklamayı Doldur
  const urunSecildi = (key: number | string, urun: Urun) => {
    setSatirlar((prev) =>
      prev.map((s) => {
        if (s.key === key) {
          return {
            ...s,
            aciklama: urun.kod ? `${urun.ad} (${urun.kod})` : urun.ad,
            birimFiyat: String(urun.birimFiyat),
            markaId: urun.markaId ?? s.markaId,
          };
        }
        return s;
      })
    );
  };

  // TOPLU İSKONTO UYGULA
  const topluIskontoUygula = () => {
    if (!topluIskontoOrani) return;
    setSatirlar((prev) =>
      prev.map((s) => ({
        ...s,
        iskontoYuzde: topluIskontoOrani,
      }))
    );
  };

  // İSKONTOLARI SIFIRLA (%0)
  const iskontolariSifirla = () => {
    setTopluIskontoOrani("0");
    setSatirlar((prev) =>
      prev.map((s) => ({
        ...s,
        iskontoYuzde: "0",
      }))
    );
  };

  // Yeni Bölüm Ekle
  const bolumEkle = () => {
    if (!yeniBolumAdi.trim()) return;
    satirEkle(yeniBolumAdi.trim());
    setYeniBolumAdi("");
  };

  // Kalemleri Bölümlere Göre Grupla
  const gruplanmisSatirlar = useMemo(() => {
    const gruplar: { [key: string]: { item: Satir; orjinalIndex: number }[] } = {};
    satirlar.forEach((s, index) => {
      const b = s.bolum || "Genel Kalemler";
      if (!gruplar[b]) gruplar[b] = [];
      gruplar[b].push({ item: s, orjinalIndex: index });
    });
    return gruplar;
  }, [satirlar]);

  // CANLI DİP TOPLAM HESAPLAMA
  const canlıOzet = useMemo(() => {
    let brutToplam = 0;
    let netToplam = 0;

    satirlar.forEach((s) => {
      const adet = parseSayi(s.adet);
      const birimFiyat = parseSayi(s.birimFiyat);
      const iskontoYuzde = parseSayi(s.iskontoYuzde);

      const satirBrut = adet * birimFiyat;
      const satirNet = satirBrut * (1 - iskontoYuzde / 100);

      brutToplam += satirBrut;
      netToplam += satirNet;
    });

    const toplamIskontoTutari = brutToplam - netToplam;

    return {
      brutToplam,
      toplamIskontoTutari,
      netToplam,
    };
  }, [satirlar]);

  return (
    <div className="space-y-4 mb-6">
      {/* 1. ÜST PANEL: BÖLÜM EKLEME VE TOPLU İSKONTO / SIFIRLAMA */}
      <div className="bg-soguk-light rounded-md p-3 flex flex-wrap items-center justify-between gap-4 border border-hat">
        {/* Bölüm Ekle */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={yeniBolumAdi}
            onChange={(e) => setYeniBolumAdi(e.target.value)}
            placeholder="Örn: VRF, DX veya Split"
            className="focus-ring border border-hat rounded-md px-3 py-1.5 text-sm bg-white w-52"
          />
          <button
            type="button"
            onClick={bolumEkle}
            className="focus-ring text-sm bg-soguk text-white px-3 py-1.5 rounded-md font-medium hover:bg-soguk-dim transition-colors"
          >
            + Bölüm Ekle
          </button>
        </div>

        {/* Toplu İskonto Ve İptal Butonu */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-soguk-dim">
            Tüm Satırlara İskonto (%):
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={topluIskontoOrani}
            onChange={(e) => setTopluIskontoOrani(e.target.value)}
            placeholder="5"
            className="focus-ring w-16 border border-hat rounded-md px-2 py-1 text-sm bg-white text-center font-semibold text-amber-800"
          />
          <button
            type="button"
            onClick={topluIskontoUygula}
            className="focus-ring text-xs bg-soguk text-white px-3 py-1.5 rounded-md font-medium hover:bg-soguk-dim"
          >
            Uygula
          </button>
          <button
            type="button"
            onClick={iskontolariSifirla}
            className="focus-ring text-xs bg-sicak-dim/10 text-sicak-dim hover:bg-sicak-dim hover:text-white border border-sicak-dim/30 px-3 py-1.5 rounded-md font-medium transition-colors"
            title="Birim fiyatları bozmadan tüm iskontoları %0 yapar"
          >
            İskontoları Sıfırla (%0)
          </button>
        </div>
      </div>

      {/* 2. BÖLÜMLERE GÖRE GRUPLANMIŞ SATIRLAR */}
      {Object.entries(gruplanmisSatirlar).map(([bolumAdi, satirlarGrubu]) => (
        <div key={bolumAdi} className="border border-hat rounded-md p-3 bg-yuzey space-y-3">
          <div className="flex justify-between items-center border-b border-hat pb-2">
            <span className="font-semibold text-xs text-soguk-dim uppercase tracking-wider flex items-center gap-1.5">
              <span>📌</span> Bölüm: <strong className="text-metin">{bolumAdi}</strong>
            </span>
            <button
              type="button"
              onClick={() => satirEkle(bolumAdi)}
              className="text-xs text-soguk-dim font-medium hover:underline"
            >
              + Bu Bölüme Kalem Ekle
            </button>
          </div>

          {/* Kolon Başlıkları */}
          <div className="hidden sm:grid grid-cols-[65px_1fr_75px_110px_75px_110px_100px_28px] gap-2 text-xs text-metin/50 px-1 font-medium">
            <span className="text-center">Sıra / Taşı</span>
            <span>Açıklama</span>
            <span>Adet</span>
            <span>Birim Fiyat ({sembol})</span>
            <span>İskonto %</span>
            {markaVar ? <span>Marka</span> : <span></span>}
            <span className="text-right">Satır Toplamı</span>
            <span></span>
          </div>

          {/* Bölüm Satırları */}
          {satirlarGrubu.map(({ item: satir, orjinalIndex }) => {
            const adetSayi = parseSayi(satir.adet);
            const fiyatSayi = parseSayi(satir.birimFiyat);
            const iskontoSayi = parseSayi(satir.iskontoYuzde);
            const satirNetTutar = adetSayi * fiyatSayi * (1 - iskontoSayi / 100);

            return (
              <div key={satir.key} className="border border-hat rounded-md p-3 sm:border-0 sm:p-0 space-y-2 sm:space-y-0">
                <input type="hidden" name="kalemBolum" value={satir.bolum} />

                {urunVar && (
                  <div className="mb-1">
                    <UrunArama
                      urunler={urunler!}
                      onSec={(urun) => urunSecildi(satir.key, urun)}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-[65px_1fr_75px_110px_75px_110px_100px_28px] gap-2 items-center">
                  
                  {/* SIRALAMA KONTROLÜ (Sıra No Kutusu + Yön Okları) */}
                  <div className="flex items-center gap-1 justify-center bg-slate-50 border border-hat rounded p-1">
                    <input
                      type="number"
                      min={1}
                      max={satirlar.length}
                      value={orjinalIndex + 1}
                      onChange={(e) => {
                        const hedef = parseInt(e.target.value, 10);
                        if (!isNaN(hedef)) {
                          satirKonumDegistir(orjinalIndex, hedef);
                        }
                      }}
                      className="w-8 text-center font-bold text-xs bg-white border border-hat rounded py-0.5 text-metin focus:bg-amber-50"
                      title="Yeni Sıra No Yazın (Örn: 1)"
                    />
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => satirYukaritas(orjinalIndex)}
                        disabled={orjinalIndex === 0}
                        className="text-[9px] leading-none px-1 py-0.5 hover:bg-slate-200 rounded disabled:opacity-20 text-slate-700 font-bold"
                        title="Yukarı Taşı"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => satirAsagiTas(orjinalIndex)}
                        disabled={orjinalIndex === satirlar.length - 1}
                        className="text-[9px] leading-none px-1 py-0.5 hover:bg-slate-200 rounded disabled:opacity-20 text-slate-700 font-bold"
                        title="Aşağı Taşı"
                      >
                        ▼
                      </button>
                    </div>
                  </div>

                  {/* Açıklama */}
                  <input
                    name="kalemAciklama"
                    value={satir.aciklama}
                    onChange={(e) => satirGuncelle(satir.key, "aciklama", e.target.value)}
                    placeholder="Kalem açıklaması"
                    className="focus-ring col-span-2 sm:col-span-1 border border-hat rounded-md px-2.5 py-1.5 text-sm"
                  />

                  {/* Adet */}
                  <input
                    name="kalemAdet"
                    type="text"
                    inputMode="decimal"
                    value={satir.adet}
                    onChange={(e) => satirGuncelle(satir.key, "adet", e.target.value)}
                    placeholder="Adet"
                    className="focus-ring border border-hat rounded-md px-2 py-1.5 text-sm text-center"
                  />

                  {/* Birim Fiyat */}
                  <input
                    name="kalemFiyat"
                    type="text"
                    inputMode="decimal"
                    value={satir.birimFiyat}
                    onChange={(e) => satirGuncelle(satir.key, "birimFiyat", e.target.value)}
                    placeholder="0,00"
                    className="focus-ring border border-hat rounded-md px-2 py-1.5 text-sm text-right font-mono"
                  />

                  {/* İskonto % */}
                  <input
                    name="kalemIskonto"
                    type="text"
                    inputMode="decimal"
                    value={satir.iskontoYuzde}
                    onChange={(e) => satirGuncelle(satir.key, "iskontoYuzde", e.target.value)}
                    placeholder="0"
                    className="focus-ring border border-hat rounded-md px-2 py-1.5 text-sm text-center font-semibold text-amber-800"
                  />

                  {/* Marka */}
                  {markaVar ? (
                    <select
                      name="kalemMarka"
                      value={satir.markaId ?? ""}
                      onChange={(e) => satirGuncelle(satir.key, "markaId", e.target.value)}
                      className="focus-ring border border-hat rounded-md px-2 py-1.5 text-sm bg-white"
                    >
                      <option value="">— Marka yok —</option>
                      {markalar!.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.ad}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div />
                  )}

                  {/* Satır Toplamı */}
                  <div className="text-right font-mono text-xs font-semibold text-metin pr-1">
                    {formatPara(satirNetTutar)} {sembol}
                  </div>

                  {/* Sil Butonu */}
                  <button
                    type="button"
                    onClick={() => satirSil(satir.key)}
                    className="focus-ring text-metin/40 hover:text-sicak-dim text-sm text-center"
                    aria-label="Satırı kaldır"
                    title="Satırı kaldır"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* 3. CANLI DİP TOPLAM PANELİ */}
      <div className="bg-soguk-light/40 border border-hat rounded-md p-4 flex flex-wrap items-center justify-between gap-4 mt-4">
        <div className="text-xs text-soguk-dim">
          <p className="font-semibold text-sm text-metin mb-0.5">Teklif Canlı Özeti</p>
          <p>Kaydetmeden önce anlık hesaplanır. İskonto sonrasındaki net tutarı buradan takip edebilirsiniz.</p>
        </div>

        <div className="text-right space-y-1">
          <div className="text-xs text-metin/60">
            Liste Fiyatı Toplamı: <span className="font-mono">{formatPara(canlıOzet.brutToplam)} {sembol}</span>
          </div>
          {canlıOzet.toplamIskontoTutari > 0 && (
            <div className="text-xs text-amber-700 font-medium">
              Uygulanan İskonto: -<span className="font-mono">{formatPara(canlıOzet.toplamIskontoTutari)} {sembol}</span>
            </div>
          )}
          <div className="text-base font-bold text-soguk-dim">
            KDV Hariç Net Toplam: <span className="font-mono text-lg text-metin">{formatPara(canlıOzet.netToplam)} {sembol}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => satirEkle("Genel Kalemler")}
        className="focus-ring text-sm text-soguk-dim font-medium hover:underline block pt-1"
      >
        + Genel Kalem ekle
      </button>
    </div>
  );
}