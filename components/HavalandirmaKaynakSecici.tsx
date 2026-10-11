"use client";

import { useState } from "react";

// Yeni havalandırma hesabı: boş / örnek ofis / örnek daire / bir klima hesabının odalarıyla başlat
export default function HavalandirmaKaynakSecici({ klimaHesaplari }: { klimaHesaplari: { id: string; ad: string }[] }) {
  const [sablon, setSablon] = useState("ofis");
  const alan = "focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white";
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs font-medium text-metin/60 mb-1">Başlangıç</label>
        <select name="sablon" value={sablon} onChange={(e) => setSablon(e.target.value)} className={alan}>
          <option value="ofis">Örnek ofis katıyla</option>
          <option value="daire">Örnek daireyle (konut HRV)</option>
          <option value="bos">Boş</option>
          {klimaHesaplari.length > 0 && <option value="klima">Klima / VRF hesabındaki odalarla</option>}
        </select>
      </div>
      {sablon === "klima" && (
        <select name="kaynakKlimaHesapId" required defaultValue="" aria-label="Klima / VRF hesabı" className={alan}>
          <option value="">— Hesap seçin —</option>
          {klimaHesaplari.map((h) => (
            <option key={h.id} value={h.id}>
              {h.ad}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
