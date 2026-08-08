"use client";

import { useState } from "react";
import {
  Teklif,
  TeklifKalem,
  ornekMusteriler,
  ornekTeklifler,
} from "@/lib/types";

function paraFormat(n: number) {
  return n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

export default function TekliflerSayfasi() {
  const [teklifler, setTeklifler] = useState<Teklif[]>(ornekTeklifler);
  const [musteriId, setMusteriId] = useState(ornekMusteriler[0]?.id ?? "");
  const [kalemler, setKalemler] = useState<TeklifKalem[]>([
    { id: crypto.randomUUID(), aciklama: "", adet: 1, birimFiyat: 0 },
  ]);

  function kalemGuncelle(id: string, alan: keyof TeklifKalem, deger: string) {
    setKalemler((prev) =>
      prev.map((k) =>
        k.id === id
          ? {
              ...k,
              [alan]: alan === "aciklama" ? deger : Number(deger) || 0,
            }
          : k
      )
    );
  }

  function kalemEkle() {
    setKalemler((prev) => [
      ...prev,
      { id: crypto.randomUUID(), aciklama: "", adet: 1, birimFiyat: 0 },
    ]);
  }

  function teklifOlustur(e: React.FormEvent) {
    e.preventDefault();
    const gecerliKalemler = kalemler.filter((k) => k.aciklama.trim());
    if (!musteriId || gecerliKalemler.length === 0) return;

    setTeklifler((prev) => [
      {
        id: crypto.randomUUID(),
        musteriId,
        tarih: new Date().toISOString().slice(0, 10),
        durum: "Beklemede",
        kalemler: gecerliKalemler,
      },
      ...prev,
    ]);
    setKalemler([{ id: crypto.randomUUID(), aciklama: "", adet: 1, birimFiyat: 0 }]);
  }

  const teklifToplami = kalemler.reduce((a, k) => a + k.adet * k.birimFiyat, 0);

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-8">Teklifler</h1>

      <form onSubmit={teklifOlustur} className="bg-yuzey border border-hat rounded-lg p-5 mb-10">
        <h2 className="font-display font-medium text-metin mb-4">Yeni Teklif</h2>

        <label className="block text-xs font-medium text-metin/60 mb-1">Müşteri</label>
        <select
          value={musteriId}
          onChange={(e) => setMusteriId(e.target.value)}
          className="focus-ring w-full sm:w-72 border border-hat rounded-md px-3 py-2 text-sm mb-5"
        >
          {ornekMusteriler.map((m) => (
            <option key={m.id} value={m.id}>
              {m.ad}
            </option>
          ))}
        </select>

        <div className="space-y-3 mb-4">
          {kalemler.map((k) => (
            <div key={k.id} className="flex flex-wrap gap-3">
              <input
                value={k.aciklama}
                onChange={(e) => kalemGuncelle(k.id, "aciklama", e.target.value)}
                placeholder="Kalem açıklaması"
                className="focus-ring flex-1 min-w-[200px] border border-hat rounded-md px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={k.adet}
                onChange={(e) => kalemGuncelle(k.id, "adet", e.target.value)}
                placeholder="Adet"
                className="focus-ring w-24 border border-hat rounded-md px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={k.birimFiyat}
                onChange={(e) => kalemGuncelle(k.id, "birimFiyat", e.target.value)}
                placeholder="Birim Fiyat"
                className="focus-ring w-32 border border-hat rounded-md px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={kalemEkle}
          className="focus-ring text-sm text-soguk-dim font-medium hover:underline mb-5"
        >
          + Kalem ekle
        </button>

        <div className="flex items-center justify-between border-t border-hat pt-4">
          <p className="font-mono text-lg text-metin">{paraFormat(teklifToplami)}</p>
          <button
            type="submit"
            className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
          >
            Teklifi Kaydet
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {teklifler.map((t) => {
          const musteri = ornekMusteriler.find((m) => m.id === t.musteriId);
          const toplam = t.kalemler.reduce((a, k) => a + k.adet * k.birimFiyat, 0);
          return (
            <div key={t.id} className="bg-yuzey border border-hat rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-metin text-sm">{musteri?.ad ?? "Bilinmeyen müşteri"}</p>
                <p className="text-xs text-metin/50">{t.tarih} · {t.kalemler.length} kalem</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-metin">{paraFormat(toplam)}</p>
                <span className="text-xs text-metin/50">{t.durum}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
