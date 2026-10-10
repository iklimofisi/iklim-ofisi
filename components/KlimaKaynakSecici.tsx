"use client";

import { useState } from "react";

// Yeni klima hesabı: boş / örnek daire / bir ısı pompası hesabının odalarıyla başlat
export default function KlimaKaynakSecici({ isiHesaplari }: { isiHesaplari: { id: string; ad: string }[] }) {
  const [sablon, setSablon] = useState("ornek");
  const alan = "focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white";
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs font-medium text-metin/60 mb-1">Başlangıç</label>
        <select name="sablon" value={sablon} onChange={(e) => setSablon(e.target.value)} className={alan}>
          <option value="ornek">Örnek daire odalarıyla</option>
          <option value="bos">Boş</option>
          {isiHesaplari.length > 0 && <option value="isi">Isı pompası hesabındaki odalarla</option>}
        </select>
      </div>
      {sablon === "isi" && (
        <select name="kaynakIsiHesapId" required defaultValue="" aria-label="Isı pompası hesabı" className={alan}>
          <option value="">— Hesap seçin —</option>
          {isiHesaplari.map((h) => (
            <option key={h.id} value={h.id}>
              {h.ad}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
