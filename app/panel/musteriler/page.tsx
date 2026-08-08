"use client";

import { useState } from "react";
import { Musteri, ornekMusteriler } from "@/lib/types";

export default function MusterilerSayfasi() {
  const [musteriler, setMusteriler] = useState<Musteri[]>(ornekMusteriler);
  const [ad, setAd] = useState("");
  const [telefon, setTelefon] = useState("");

  function musteriEkle(e: React.FormEvent) {
    e.preventDefault();
    if (!ad.trim()) return;
    setMusteriler((prev) => [
      ...prev,
      { id: crypto.randomUUID(), ad: ad.trim(), telefon: telefon.trim() },
    ]);
    setAd("");
    setTelefon("");
  }

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-8">Müşteriler</h1>

      <form onSubmit={musteriEkle} className="bg-yuzey border border-hat rounded-lg p-5 mb-8 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-metin/60 mb-1">Müşteri Adı</label>
          <input
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
            placeholder="Firma / kişi adı"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-metin/60 mb-1">Telefon</label>
          <input
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
            placeholder="05xx xxx xx xx"
          />
        </div>
        <button
          type="submit"
          className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
        >
          Ekle
        </button>
      </form>

      <div className="bg-yuzey border border-hat rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-metin/50 border-b border-hat">
              <th className="px-5 py-3 font-medium">Ad</th>
              <th className="px-5 py-3 font-medium">Telefon</th>
              <th className="px-5 py-3 font-medium">Vergi No</th>
            </tr>
          </thead>
          <tbody>
            {musteriler.map((m) => (
              <tr key={m.id} className="border-b border-hat last:border-0">
                <td className="px-5 py-3 text-metin">{m.ad}</td>
                <td className="px-5 py-3 font-mono text-metin/70">{m.telefon}</td>
                <td className="px-5 py-3 font-mono text-metin/50">{m.vergiNo ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-metin/45 mt-4">
        Not: Bu liste şu an tarayıcı hafızasında tutuluyor. Bir sonraki adımda
        veritabanına (Prisma) bağlayınca sayfa yenilense de veriler kalıcı olacak.
      </p>
    </div>
  );
}
