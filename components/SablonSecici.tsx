"use client";

import { useState } from "react";
import { sablonlariGrupla } from "@/lib/sablon";

type Sablon = { id: string; baslik: string; grupBaslik: string | null; icerik: string };

// Teklif formunda notları GRUP GRUP seçtirir: her gruptan uygun olan bir not seçilir.
// Müşteriye yalnızca grup başlığı ("Ödeme Koşulları") ve notun metni gider;
// "(Ç-9)" gibi kodlar sadece burada, panelde görünür.
export default function SablonSecici({
  sablonlar,
  seciliIdler,
  varsayilanIlk = false,
}: {
  sablonlar: Sablon[];
  seciliIdler: string[];
  varsayilanIlk?: boolean; // yeni teklifte her grubun ilk notu seçili gelsin
}) {
  const gruplar = sablonlariGrupla(sablonlar);
  const secili = new Set(seciliIdler);

  if (gruplar.length === 0) return null;

  return (
    <div className="border-t border-hat pt-4 mt-4 mb-4">
      <p className="text-xs font-medium text-metin/60 mb-1">Teklif notları</p>
      <p className="text-[11px] text-metin/45 mb-3">
        Her gruptan uygun olanı seçin. Müşteri yalnızca grup başlığını ve metni görür; parantez içindeki kodlar görünmez.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {gruplar.map((g) => {
          const gruptakiSecililer = g.notlar.filter((n) => secili.has(n.id)).map((n) => n.id);
          return (
            <GrupSatiri
              key={g.grup}
              grup={g.grup}
              notlar={g.notlar}
              baslangic={
                gruptakiSecililer.length > 0 ? gruptakiSecililer : varsayilanIlk ? [g.notlar[0].id] : []
              }
            />
          );
        })}
      </div>
    </div>
  );
}

function GrupSatiri({ grup, notlar, baslangic }: { grup: string; notlar: Sablon[]; baslangic: string[] }) {
  // Eski tekliflerde aynı gruptan birden fazla not seçilmiş olabilir: o durumda hiçbirini
  // kaybetmemek için kutucuklarla gösterilir.
  const [coklu] = useState(baslangic.length > 1);
  const [secim, setSecim] = useState<string>(baslangic[0] ?? "");
  const [coklular, setCoklular] = useState<string[]>(baslangic);

  const onizleme = coklu
    ? notlar.filter((n) => coklular.includes(n.id)).map((n) => n.icerik).join("\n\n")
    : notlar.find((n) => n.id === secim)?.icerik ?? "";

  return (
    <div className="border border-hat rounded-md p-3 bg-white">
      <p className="text-sm font-semibold text-metin mb-2">{grup}</p>
      {coklu ? (
        <div className="space-y-1">
          {notlar.map((n) => (
            <label key={n.id} className="flex items-center gap-2 text-sm text-metin/80">
              <input
                type="checkbox"
                name="sablonIds"
                value={n.id}
                checked={coklular.includes(n.id)}
                onChange={(e) =>
                  setCoklular((l) => (e.target.checked ? [...l, n.id] : l.filter((x) => x !== n.id)))
                }
                className="accent-soguk"
              />
              {n.baslik}
            </label>
          ))}
        </div>
      ) : (
        <select
          name="sablonIds"
          value={secim}
          onChange={(e) => setSecim(e.target.value)}
          className="focus-ring w-full border border-hat rounded-md px-2 py-1.5 text-sm bg-white"
        >
          <option value="">— Bu teklifte olmasın —</option>
          {notlar.map((n) => (
            <option key={n.id} value={n.id}>
              {n.baslik}
            </option>
          ))}
        </select>
      )}
      {onizleme && (
        <p className="text-[11px] text-metin/55 mt-2 whitespace-pre-line line-clamp-4" title={onizleme}>
          {onizleme}
        </p>
      )}
    </div>
  );
}
