"use client";

import { useState } from "react";

type Madde = { anahtar: number; baslik: string; icerik: string };
let sayac = 0;

// Sözleşme maddelerini düzenleme: başlık + metin, ekle / sil / yukarı-aşağı taşı.
// Kaydedilirken tamamı gizli "maddeler" alanına JSON olarak yazılır.
// Madde 1 (Taraflar), 2 (Konu) ve 3 (Bedel) sabittir; buradakiler Madde 4'ten başlar.
export default function SozlesmeMaddeleri({ baslangic }: { baslangic: { baslik: string; icerik: string }[] }) {
  const [maddeler, setMaddeler] = useState<Madde[]>(() => baslangic.map((m) => ({ ...m, anahtar: ++sayac })));

  const guncelle = (anahtar: number, alan: "baslik" | "icerik", deger: string) =>
    setMaddeler((p) => p.map((m) => (m.anahtar === anahtar ? { ...m, [alan]: deger } : m)));
  const tasi = (i: number, yon: -1 | 1) =>
    setMaddeler((p) => {
      const j = i + yon;
      if (j < 0 || j >= p.length) return p;
      const k = [...p];
      [k[i], k[j]] = [k[j], k[i]];
      return k;
    });

  return (
    <div className="space-y-3">
      <input type="hidden" name="maddeler" value={JSON.stringify(maddeler.map(({ baslik, icerik }) => ({ baslik, icerik })))} />
      {maddeler.map((m, i) => (
        <div key={m.anahtar} className="border border-hat rounded-md bg-white p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-soguk-dim whitespace-nowrap w-20">Madde {i + 4}</span>
            <input
              value={m.baslik}
              onChange={(e) => guncelle(m.anahtar, "baslik", e.target.value)}
              placeholder="Madde başlığı (ör. Ödeme Koşulları)"
              className="focus-ring flex-1 border border-hat rounded-md px-2.5 py-1.5 text-sm font-semibold"
            />
            <button type="button" onClick={() => tasi(i, -1)} disabled={i === 0} className="focus-ring px-2 py-1 text-xs border border-hat rounded disabled:opacity-30" aria-label="Yukarı taşı">
              ▲
            </button>
            <button
              type="button"
              onClick={() => tasi(i, 1)}
              disabled={i === maddeler.length - 1}
              className="focus-ring px-2 py-1 text-xs border border-hat rounded disabled:opacity-30"
              aria-label="Aşağı taşı"
            >
              ▼
            </button>
            <button
              type="button"
              onClick={() => {
                if (!m.icerik.trim() || confirm(`"${m.baslik || "Bu madde"}" sözleşmeden çıkarılsın mı?`))
                  setMaddeler((p) => p.filter((x) => x.anahtar !== m.anahtar));
              }}
              className="focus-ring px-2 py-1 text-xs text-sicak-dim border border-sicak-dim/30 rounded hover:bg-sicak-light"
            >
              Çıkar
            </button>
          </div>
          <textarea
            value={m.icerik}
            onChange={(e) => guncelle(m.anahtar, "icerik", e.target.value)}
            rows={Math.min(10, Math.max(3, Math.ceil(m.icerik.length / 110) + m.icerik.split("\n").length))}
            className="focus-ring w-full border border-hat rounded-md px-2.5 py-2 text-sm leading-relaxed"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => setMaddeler((p) => [...p, { anahtar: ++sayac, baslik: "", icerik: "" }])}
        className="focus-ring text-sm text-soguk-dim font-medium hover:underline"
      >
        + Madde ekle
      </button>
    </div>
  );
}
