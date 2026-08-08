"use client";

import { useMemo, useState } from "react";
import { ornekCariHareketler, ornekMusteriler } from "@/lib/types";

function paraFormat(n: number) {
  return n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

export default function CariSayfasi() {
  const [seciliMusteri, setSeciliMusteri] = useState<string>("hepsi");

  const hareketler = useMemo(
    () =>
      seciliMusteri === "hepsi"
        ? ornekCariHareketler
        : ornekCariHareketler.filter((c) => c.musteriId === seciliMusteri),
    [seciliMusteri]
  );

  const bakiye = hareketler.reduce(
    (a, c) => a + (c.tur === "Borç" ? c.tutar : -c.tutar),
    0
  );

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-8">Cari Hesap</h1>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <select
          value={seciliMusteri}
          onChange={(e) => setSeciliMusteri(e.target.value)}
          className="focus-ring border border-hat rounded-md px-3 py-2 text-sm"
        >
          <option value="hepsi">Tüm Müşteriler</option>
          {ornekMusteriler.map((m) => (
            <option key={m.id} value={m.id}>
              {m.ad}
            </option>
          ))}
        </select>
        <div className="bg-yuzey border border-hat rounded-lg px-5 py-3">
          <span className="text-xs text-metin/50 mr-3">Bakiye</span>
          <span className={`font-mono text-lg ${bakiye > 0 ? "text-sicak-dim" : "text-soguk-dim"}`}>
            {paraFormat(bakiye)}
          </span>
        </div>
      </div>

      <div className="bg-yuzey border border-hat rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-metin/50 border-b border-hat">
              <th className="px-5 py-3 font-medium">Tarih</th>
              <th className="px-5 py-3 font-medium">Müşteri</th>
              <th className="px-5 py-3 font-medium">Açıklama</th>
              <th className="px-5 py-3 font-medium text-right">Tutar</th>
            </tr>
          </thead>
          <tbody>
            {hareketler.map((c) => {
              const musteri = ornekMusteriler.find((m) => m.id === c.musteriId);
              return (
                <tr key={c.id} className="border-b border-hat last:border-0">
                  <td className="px-5 py-3 font-mono text-metin/60">{c.tarih}</td>
                  <td className="px-5 py-3 text-metin">{musteri?.ad}</td>
                  <td className="px-5 py-3 text-metin/70">{c.aciklama}</td>
                  <td
                    className={`px-5 py-3 text-right font-mono ${
                      c.tur === "Borç" ? "text-sicak-dim" : "text-soguk-dim"
                    }`}
                  >
                    {c.tur === "Borç" ? "+" : "-"}
                    {paraFormat(c.tutar)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
