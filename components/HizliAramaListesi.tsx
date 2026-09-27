"use client";

import { useMemo, useState } from "react";

// Yazdıkça anında süzülen liste (sayfa yenilenmez).
// Türkçe karakter farkı gözetmez: "durumle" yazınca "DÜRÜMLE" de bulunur.
// Birden fazla kelime yazılırsa hepsini içeren satırlar gösterilir.
function sadelestir(m: string) {
  return m
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/û/g, "u");
}

export default function HizliAramaListesi({
  satirlar,
  yerTutucu = "Ara…",
  bosMetin = "Kayıt yok.",
  birim = "kayıt",
  araAlan,
}: {
  satirlar: { id: string; aramaMetni: string; icerik: React.ReactNode }[];
  yerTutucu?: string;
  bosMetin?: string;
  birim?: string;
  araAlan?: React.ReactNode; // arama kutusu ile liste arasına (ör. gelişmiş filtre)
}) {
  const [sorgu, setSorgu] = useState("");

  const dizin = useMemo(() => satirlar.map((s) => ({ id: s.id, metin: sadelestir(s.aramaMetni) })), [satirlar]);
  const kelimeler = sadelestir(sorgu).split(/\s+/).filter(Boolean);
  const gorunen = new Set(
    kelimeler.length === 0
      ? dizin.map((d) => d.id)
      : dizin.filter((d) => kelimeler.every((k) => d.metin.includes(k))).map((d) => d.id)
  );

  return (
    <div>
      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-metin/40" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
        </span>
        <input
          type="search"
          value={sorgu}
          onChange={(e) => setSorgu(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSorgu("");
          }}
          placeholder={yerTutucu}
          aria-label="Hızlı arama"
          className="focus-ring w-full border border-hat rounded-lg pl-10 pr-24 py-3 text-sm bg-white shadow-sm"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-metin/45 font-mono">
          {kelimeler.length ? `${gorunen.size} / ${satirlar.length}` : `${satirlar.length} ${birim}`}
        </span>
      </div>

      {araAlan}

      <div className="space-y-3">
        {satirlar.map((s) => (
          <div key={s.id} hidden={!gorunen.has(s.id)}>
            {s.icerik}
          </div>
        ))}
        {satirlar.length === 0 && <p className="text-sm text-metin/50">{bosMetin}</p>}
        {satirlar.length > 0 && gorunen.size === 0 && (
          <p className="text-sm text-metin/50 bg-yuzey border border-hat rounded-lg p-4">
            &quot;{sorgu}&quot; için sonuç yok.{" "}
            <button type="button" onClick={() => setSorgu("")} className="text-soguk-dim hover:underline">
              Aramayı temizle
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
