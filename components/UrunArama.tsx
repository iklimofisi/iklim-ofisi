"use client";

import { useMemo, useRef, useState } from "react";

type Urun = {
  id: string;
  kod: string | null;
  ad: string;
  markaId: string | null;
  birimFiyat: number;
  paraBirimi: string;
};

export default function UrunArama({
  urunler,
  onSec,
}: {
  urunler: Urun[];
  onSec: (urun: Urun) => void;
}) {
  const [sorgu, setSorgu] = useState("");
  const [acik, setAcik] = useState(false);
  const kapatZamanlayici = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sonuclar = useMemo(() => {
    const s = sorgu.trim().toLowerCase();
    if (!s) return urunler.slice(0, 8);
    return urunler
      .filter((u) => u.ad.toLowerCase().includes(s) || (u.kod ?? "").toLowerCase().includes(s))
      .slice(0, 8);
  }, [sorgu, urunler]);

  return (
    <div className="relative mb-2">
      <input
        type="text"
        value={sorgu}
        onChange={(e) => {
          setSorgu(e.target.value);
          setAcik(true);
        }}
        onFocus={() => setAcik(true)}
        onBlur={() => {
          // liste öğesine tıklamayı yakalayabilmek için küçük bir gecikme
          kapatZamanlayici.current = setTimeout(() => setAcik(false), 150);
        }}
        placeholder={`Kataloğdan ürün ara… (${urunler.length} ürün)`}
        className="focus-ring w-full border border-hat rounded-md px-3 py-1.5 text-xs bg-soguk-light text-soguk-dim placeholder:text-soguk-dim/60"
      />
      {acik && sonuclar.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-hat rounded-md shadow-lg max-h-64 overflow-y-auto">
          {sonuclar.map((u) => (
            <button
              key={u.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // input'un blur olmasını engelle
                if (kapatZamanlayici.current) clearTimeout(kapatZamanlayici.current);
                onSec(u);
                setSorgu("");
                setAcik(false);
              }}
              className="focus-ring w-full text-left px-3 py-2 text-sm hover:bg-soguk-light transition-colors border-b border-hat last:border-0"
            >
              <span className="text-metin">{u.kod ? `${u.kod} — ` : ""}{u.ad}</span>
              <span className="text-metin/50 ml-2 font-mono text-xs">
                {u.birimFiyat.toLocaleString("tr-TR")} {u.paraBirimi}
              </span>
            </button>
          ))}
        </div>
      )}
      {acik && sorgu && sonuclar.length === 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-hat rounded-md shadow-lg px-3 py-2 text-sm text-metin/50">
          Eşleşen ürün bulunamadı.
        </div>
      )}
    </div>
  );
}
