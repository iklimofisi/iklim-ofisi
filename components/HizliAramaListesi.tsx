"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Yazdıkça anında süzülen, sayfalı liste (sayfa yenilenmez).
// * Arama TÜM kayıtlarda yapılır (yalnızca görünen sayfada değil); sonuçlar da sayfalanır.
// * Türkçe karakter farkı gözetmez: "durumle" yazınca "DÜRÜMLE" de bulunur.
// * Birden fazla kelime yazılırsa hepsini içeren satırlar gösterilir.
// * Sayfa numarası ve arama adres çubuğunda tutulur (?s=2&ara=...): bir kayda girip
//   geri dönünce aynı sayfaya dönülür.
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

// 1 … 4 5 [6] 7 8 … 20
function sayfaNumaralari(aktif: number, toplam: number): (number | "…")[] {
  if (toplam <= 7) return Array.from({ length: toplam }, (_, i) => i + 1);
  const s = new Set([1, toplam, aktif - 1, aktif, aktif + 1]);
  if (aktif <= 3) [2, 3, 4].forEach((x) => s.add(x));
  if (aktif >= toplam - 2) [toplam - 3, toplam - 2, toplam - 1].forEach((x) => s.add(x));
  const liste = [...s].filter((x) => x >= 1 && x <= toplam).sort((a, b) => a - b);
  const sonuc: (number | "…")[] = [];
  liste.forEach((x, i) => {
    if (i > 0 && x - liste[i - 1] > 1) sonuc.push("…");
    sonuc.push(x);
  });
  return sonuc;
}

export default function HizliAramaListesi({
  satirlar,
  yerTutucu = "Ara…",
  bosMetin = "Kayıt yok.",
  birim = "kayıt",
  araAlan,
  baslik,
  bosluk = "space-y-3",
  sayfaBasina = 10,
}: {
  satirlar: { id: string; aramaMetni: string; icerik: React.ReactNode }[];
  yerTutucu?: string;
  bosMetin?: string;
  birim?: string;
  araAlan?: React.ReactNode; // arama kutusu ile liste arasına (ör. gelişmiş filtre)
  baslik?: React.ReactNode; // listenin üstünde sütun başlıkları
  bosluk?: string; // satırlar arası boşluk sınıfı
  sayfaBasina?: number; // bir sayfada gösterilecek kayıt sayısı
}) {
  const [sorgu, setSorgu] = useState("");
  const [sayfa, setSayfa] = useState(1);
  const ustRef = useRef<HTMLDivElement>(null);
  const yuklendi = useRef(false);

  // Açılışta adres çubuğundaki sayfa / aramayı oku
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const s = Number(p.get("s"));
    const a = p.get("ara");
    if (a) setSorgu(a);
    if (Number.isInteger(s) && s > 1) setSayfa(s);
    yuklendi.current = true;
  }, []);

  // Sayfa / arama değişince adres çubuğunu güncelle (sayfayı yeniden yüklemeden)
  useEffect(() => {
    if (!yuklendi.current) return;
    const url = new URL(window.location.href);
    if (sayfa > 1) url.searchParams.set("s", String(sayfa));
    else url.searchParams.delete("s");
    if (sorgu.trim()) url.searchParams.set("ara", sorgu);
    else url.searchParams.delete("ara");
    if (url.href !== window.location.href) window.history.replaceState(window.history.state, "", url.href);
  }, [sayfa, sorgu]);

  const dizin = useMemo(() => satirlar.map((s) => ({ id: s.id, metin: sadelestir(s.aramaMetni) })), [satirlar]);
  const kelimeler = sadelestir(sorgu).split(/\s+/).filter(Boolean);
  const eslesenler =
    kelimeler.length === 0 ? dizin.map((d) => d.id) : dizin.filter((d) => kelimeler.every((k) => d.metin.includes(k))).map((d) => d.id);

  const sayfaSayisi = Math.max(1, Math.ceil(eslesenler.length / sayfaBasina));
  const aktifSayfa = Math.min(sayfa, sayfaSayisi);
  const bas = (aktifSayfa - 1) * sayfaBasina;
  const gorunen = new Set(eslesenler.slice(bas, bas + sayfaBasina));

  const sayfayaGit = (n: number) => {
    setSayfa(n);
    // Listenin başına kaydır (arama kutusu görünsün)
    const el = ustRef.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sayac =
    kelimeler.length > 0
      ? `${eslesenler.length} / ${satirlar.length}`
      : `${satirlar.length} ${birim}`;

  const dugme =
    "focus-ring min-w-[2.25rem] h-9 px-2.5 rounded-md border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div ref={ustRef} className="scroll-mt-6">
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
          onChange={(e) => {
            setSorgu(e.target.value);
            setSayfa(1); // her aramada ilk sayfadan başla
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSorgu("");
              setSayfa(1);
            }
          }}
          placeholder={yerTutucu}
          aria-label="Hızlı arama"
          className="focus-ring w-full border border-hat rounded-lg pl-10 pr-24 py-3 text-sm bg-white shadow-sm"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-metin/45 font-mono">{sayac}</span>
      </div>

      {araAlan}
      {satirlar.length > 0 && eslesenler.length > 0 && baslik}

      <div className={bosluk}>
        {satirlar.map((s) => (
          <div key={s.id} hidden={!gorunen.has(s.id)}>
            {s.icerik}
          </div>
        ))}
        {satirlar.length === 0 && <p className="text-sm text-metin/50">{bosMetin}</p>}
        {satirlar.length > 0 && eslesenler.length === 0 && (
          <p className="text-sm text-metin/50 bg-yuzey border border-hat rounded-lg p-4">
            &quot;{sorgu}&quot; için sonuç yok.{" "}
            <button
              type="button"
              onClick={() => {
                setSorgu("");
                setSayfa(1);
              }}
              className="text-soguk-dim hover:underline"
            >
              Aramayı temizle
            </button>
          </p>
        )}
      </div>

      {/* SAYFALAR */}
      {sayfaSayisi > 1 && (
        <nav aria-label="Sayfalar" className="flex flex-wrap items-center justify-between gap-3 mt-5">
          <p className="text-xs text-metin/50">
            {bas + 1}–{Math.min(bas + sayfaBasina, eslesenler.length)} / {eslesenler.length} {kelimeler.length ? "sonuç" : birim}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => sayfayaGit(aktifSayfa - 1)}
              disabled={aktifSayfa === 1}
              className={`${dugme} border-hat bg-white text-metin/70 hover:border-soguk`}
            >
              ‹ Önceki
            </button>
            {sayfaNumaralari(aktifSayfa, sayfaSayisi).map((n, i) =>
              n === "…" ? (
                <span key={`b${i}`} className="px-1 text-metin/40">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  onClick={() => sayfayaGit(n)}
                  aria-current={n === aktifSayfa ? "page" : undefined}
                  className={`${dugme} ${
                    n === aktifSayfa ? "bg-soguk border-soguk text-white" : "border-hat bg-white text-metin/70 hover:border-soguk"
                  }`}
                >
                  {n}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => sayfayaGit(aktifSayfa + 1)}
              disabled={aktifSayfa === sayfaSayisi}
              className={`${dugme} border-hat bg-white text-metin/70 hover:border-soguk`}
            >
              Sonraki ›
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
