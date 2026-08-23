"use client";

import { useState } from "react";
import { stokGirisiEkle } from "@/lib/actions";

export default function StokGirisFormu({
  urunler,
  markalar,
}: {
  urunler: any[];
  markalar: any[];
}) {
  const [seciliUrunId, setSeciliUrunId] = useState("");

  const isYeniUrun = seciliUrunId === "YENI_URUN";

  return (
    <form action={stokGirisiEkle} className="bg-yuzey border border-hat rounded-lg p-5 space-y-4 shadow-sm">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-soguk-dim border-b border-hat pb-2 flex justify-between items-center">
        <span>+ Depoya Mal Girişi & Maliyet Tanımla</span>
        <span className="text-[10px] text-metin/50 font-normal">Katalogdan seçin veya direkt yeni ürün oluşturun.</span>
      </h2>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-metin/60 mb-1">Ürün Seç veya Yeni Oluştur *</label>
          <select
            name="urunId"
            required
            value={seciliUrunId}
            onChange={(e) => setSeciliUrunId(e.target.value)}
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white font-medium"
          >
            <option value="">— Katalogdan Ürün Seçin —</option>

            {/* KATALOĞA YENİ ÜRÜN EKLEME SEÇENEĞİ */}
            <option value="YENI_URUN" className="font-bold text-soguk-dim bg-teal-50">
              ✨ + Yeni Ürün Tanımla (Kataloğa Ekle)
            </option>

            {urunler.map((u) => (
              <option key={u.id} value={u.id}>
                {u.kod ? `[${u.kod}] ` : ""}{u.ad} (Katalog Satış Fiyatı: {u.listeFiyati} {u.paraBirimi} | Stok: {u.stokMiktari} {u.birim})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Giren Miktar *</label>
          <input name="miktar" type="text" inputMode="decimal" required placeholder="10" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white font-bold" />
        </div>
      </div>

      {/* YENİ ÜRÜN SEÇİLDİĞİNDE AÇILAN KATALOG ALANLARI */}
      {isYeniUrun && (
        <div className="grid sm:grid-cols-3 gap-3 bg-teal-50/70 p-3 rounded-md border border-teal-200">
          <div>
            <label className="block text-xs font-bold text-teal-900 mb-1">Yeni Ürün Adı *</label>
            <input name="yeniUrunAdi" required placeholder="Örn: Daikin 18.000 BTU Inverter" className="focus-ring w-full border border-hat rounded-md px-2.5 py-1.5 text-xs bg-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-teal-900 mb-1">Ürün Kodu (Opsiyonel)</label>
            <input name="yeniUrunKodu" placeholder="Örn: DKN-18000" className="focus-ring w-full border border-hat rounded-md px-2.5 py-1.5 text-xs bg-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-teal-900 mb-1">Marka</label>
            <select name="markaId" className="focus-ring w-full border border-hat rounded-md px-2.5 py-1.5 text-xs bg-white">
              <option value="">— Marka Seçin —</option>
              {markalar.map((m) => (
                <option key={m.id} value={m.id}>{m.ad}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* MALİYET VE KATALOG SATIŞ FİYATI ALANLARI */}
      <div className="grid sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-md border border-hat">
        <div>
          <label className="block text-xs font-semibold text-metin/70 mb-1">Birim Alış Fiyatı *</label>
          <div className="flex gap-1">
            <input name="birimAlisFiyati" type="text" inputMode="decimal" required placeholder="100,00" className="focus-ring w-full border border-hat rounded-md px-2 py-1.5 text-sm bg-white font-mono text-right" />
            <select name="paraBirimi" className="border border-hat rounded text-xs bg-white">
              <option value="TRY">₺</option>
              <option value="USD">$</option>
              <option value="EUR">€</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-amber-800 mb-1">Birim Ek Gider (Nakliye/Gümrük)</label>
          <input name="birimEkGider" type="text" inputMode="decimal" placeholder="15,00" className="focus-ring w-full border border-hat rounded-md px-2 py-1.5 text-sm bg-white font-mono text-right" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-soguk-dim mb-1">Katalog Satış Fiyatı</label>
          <input name="listeFiyati" type="text" inputMode="decimal" placeholder="150,00" className="focus-ring w-full border border-hat rounded-md px-2 py-1.5 text-sm bg-white font-mono text-right" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-metin/70 mb-1">Depo Konumu / Raf</label>
          <input name="depoKonumu" placeholder="Örn: Raf B-12" className="focus-ring w-full border border-hat rounded-md px-2 py-1.5 text-sm bg-white" />
        </div>
      </div>

      <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors">
        Stok Girişini Kaydet
      </button>
    </form>
  );
}