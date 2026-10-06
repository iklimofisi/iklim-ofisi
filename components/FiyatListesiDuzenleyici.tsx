"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fiyatListesiKaydet } from "@/lib/actions";
import KaydetButonu from "@/components/KaydetButonu";
import { fotografYukle } from "@/lib/gorsel-yukle";
import { DUZENLER, iskontoluFiyat, flParaYaz } from "@/lib/fiyat-listesi";
import { tutarOku } from "@/lib/toplam-dagit";

// -----------------------------------------------------------------------------
// FİYAT LİSTESİ DÜZENLEYİCİ
// Ürünler katalogdan seçilerek ya da elle eklenir. Fotoğraflar seçildiği anda
// küçültülüp yüklenir; liste "Kaydet" ile bir seferde kaydedilir.
// Katalogdan eklenen ürünün kendi fotoğrafı varsa o kullanılır; satıra ayrıca
// fotoğraf yüklenirse o geçerli olur.
// -----------------------------------------------------------------------------

export type KatalogUrunu = {
  id: string;
  ad: string;
  kod: string | null;
  marka: string | null;
  birim: string;
  aciklama: string | null;
  listeFiyati: number;
  paraBirimi: string;
  gorselId: string | null;
};

export type DuzenlenenKalem = {
  bolum: string;
  urunId: string | null;
  ad: string;
  kod: string | null;
  marka: string | null;
  aciklama: string | null;
  birim: string;
  fiyat: number;
  gorselId: string | null;
  urunGorselId: string | null; // katalogdaki ürünün fotoğrafı (satıra özel fotoğraf yoksa bu görünür)
};

type Satir = Omit<DuzenlenenKalem, "fiyat" | "kod" | "marka" | "aciklama"> & {
  key: number;
  kod: string;
  marka: string;
  aciklama: string;
  fiyat: string;
  uyari?: string;
  yukleniyor?: boolean;
};

type Ayarlar = {
  id: string;
  baslik: string;
  aciklama: string;
  paraBirimi: string;
  kdvDahil: boolean;
  iskontoYuzde: number;
  fiyatGoster: boolean;
  duzen: string;
  gecerlilikTarihi: string; // YYYY-MM-DD veya ""
  notlar: string;
};

const sadelestir = (m: string) =>
  m
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u");

// "1.234,56" / "1234,5" / "7,000.50" → sayı (okunamazsa 0)
const sayiOku = (v: string) => {
  const n = tutarOku(v);
  return n !== null && n >= 0 ? n : 0;
};

let sayac = 1;

export default function FiyatListesiDuzenleyici({
  ayarlar,
  kalemler,
  urunler,
  kurlar,
}: {
  ayarlar: Ayarlar;
  kalemler: DuzenlenenKalem[];
  urunler: KatalogUrunu[];
  kurlar: { tarih: string; USD: number; EUR: number } | null;
}) {
  const [paraBirimi, setParaBirimi] = useState(ayarlar.paraBirimi);
  const [iskonto, setIskonto] = useState(String(ayarlar.iskontoYuzde || ""));
  const [satirlar, setSatirlar] = useState<Satir[]>(() =>
    kalemler.map((k) => ({
      ...k,
      key: sayac++,
      kod: k.kod ?? "",
      marka: k.marka ?? "",
      aciklama: k.aciklama ?? "",
      fiyat: k.fiyat ? String(k.fiyat).replace(".", ",") : "",
    }))
  );
  const [ara, setAra] = useState("");
  const [yeniBolum, setYeniBolum] = useState(kalemler.length ? kalemler[kalemler.length - 1].bolum : "");
  const [degisti, setDegisti] = useState(false);
  const ilk = useRef(true);

  useEffect(() => {
    if (ilk.current) {
      ilk.current = false;
      return;
    }
    setDegisti(true);
  }, [satirlar, paraBirimi, iskonto]);

  // Kaydedilmemiş değişiklik varken sayfadan çıkmadan önce uyar
  useEffect(() => {
    if (!degisti) return;
    const uyar = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", uyar);
    return () => window.removeEventListener("beforeunload", uyar);
  }, [degisti]);

  const kurTL = (pb: string) => (pb === "TRY" ? 1 : kurlar ? (pb === "USD" ? kurlar.USD : pb === "EUR" ? kurlar.EUR : null) : null);

  const sonuclar = useMemo(() => {
    const kelimeler = sadelestir(ara).split(/\s+/).filter(Boolean);
    if (!kelimeler.length) return [];
    return urunler
      .filter((u) => {
        const m = sadelestir([u.ad, u.kod, u.marka].filter(Boolean).join(" "));
        return kelimeler.every((k) => m.includes(k));
      })
      .slice(0, 12);
  }, [ara, urunler]);

  const guncelle = (key: number, alan: Partial<Satir>) => setSatirlar((s) => s.map((r) => (r.key === key ? { ...r, ...alan } : r)));

  const katalogdanEkle = (u: KatalogUrunu) => {
    let fiyat = u.listeFiyati;
    let uyari: string | undefined;
    if (u.paraBirimi !== paraBirimi) {
      const kaynak = kurTL(u.paraBirimi);
      const hedef = kurTL(paraBirimi);
      if (kaynak && hedef) {
        fiyat = Math.round(((u.listeFiyati * kaynak) / hedef) * 100) / 100;
        uyari = `${flParaYaz(u.listeFiyati, u.paraBirimi)} TCMB efektif satış kuruyla (${kurlar?.tarih}) çevrildi`;
      } else {
        uyari = `Katalog fiyatı ${u.paraBirimi}; kur alınamadığı için çevrilmedi — fiyatı kontrol edin`;
      }
    }
    setSatirlar((s) => [
      ...s,
      {
        key: sayac++,
        bolum: yeniBolum.trim(),
        urunId: u.id,
        ad: u.ad,
        kod: u.kod ?? "",
        marka: u.marka ?? "",
        aciklama: u.aciklama ?? "",
        birim: u.birim || "Adet",
        fiyat: fiyat ? String(fiyat).replace(".", ",") : "",
        gorselId: null,
        urunGorselId: u.gorselId,
        uyari,
      },
    ]);
  };

  const elleEkle = () =>
    setSatirlar((s) => [
      ...s,
      { key: sayac++, bolum: yeniBolum.trim(), urunId: null, ad: "", kod: "", marka: "", aciklama: "", birim: "Adet", fiyat: "", gorselId: null, urunGorselId: null },
    ]);

  const tasi = (i: number, yon: -1 | 1) =>
    setSatirlar((s) => {
      const j = i + yon;
      if (j < 0 || j >= s.length) return s;
      const k = [...s];
      [k[i], k[j]] = [k[j], k[i]];
      return k;
    });

  const fotoSec = async (key: number, dosya: File | undefined) => {
    if (!dosya) return;
    guncelle(key, { yukleniyor: true, uyari: undefined });
    try {
      const g = await fotografYukle(dosya);
      guncelle(key, { gorselId: g.id, yukleniyor: false });
    } catch (e) {
      guncelle(key, { yukleniyor: false, uyari: e instanceof Error ? e.message : "Fotoğraf yüklenemedi" });
    }
  };

  const iskontoSayi = Math.min(100, Math.max(0, sayiOku(iskonto)));
  const json = JSON.stringify(
    satirlar.map((r) => ({
      bolum: r.bolum,
      urunId: r.urunId,
      ad: r.ad,
      kod: r.kod,
      marka: r.marka,
      aciklama: r.aciklama,
      birim: r.birim,
      fiyat: sayiOku(r.fiyat),
      gorselId: r.gorselId,
    }))
  );
  const bosAdli = satirlar.filter((r) => !r.ad.trim()).length;
  const yuklenen = satirlar.some((r) => r.yukleniyor);

  const kutu = "focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white";
  const etiket = "block text-xs font-medium text-metin/60 mb-1";

  return (
    <form
      action={fiyatListesiKaydet}
      onSubmit={(e) => {
        if (yuklenen) {
          e.preventDefault();
          window.alert("Fotoğraf yüklemesi bitmeden kaydedilemez. Birkaç saniye bekleyin.");
          return;
        }
        setDegisti(false);
      }}
      className="space-y-6"
    >
      <input type="hidden" name="listeId" value={ayarlar.id} />
      <input type="hidden" name="kalemler" value={json} />

      {/* AYARLAR */}
      <section className="bg-yuzey border border-hat rounded-lg p-5 space-y-4">
        <h2 className="font-display font-medium text-metin">Liste Bilgileri</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className={etiket}>Liste adı (PDF başlığı) *</label>
            <input name="baslik" required maxLength={200} defaultValue={ayarlar.baslik} onChange={() => setDegisti(true)} className={kutu} />
          </div>
          <div>
            <label className={etiket}>Geçerlilik tarihi (opsiyonel)</label>
            <input name="gecerlilikTarihi" type="date" defaultValue={ayarlar.gecerlilikTarihi} onChange={() => setDegisti(true)} className={kutu} />
          </div>
        </div>
        <div>
          <label className={etiket}>Açıklama (başlığın altında görünür, opsiyonel)</label>
          <textarea name="aciklama" rows={2} maxLength={3000} defaultValue={ayarlar.aciklama} onChange={() => setDegisti(true)} className={kutu} />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className={etiket}>Para birimi</label>
            <select name="paraBirimi" value={paraBirimi} onChange={(e) => setParaBirimi(e.target.value)} className={kutu}>
              <option value="TRY">TL</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div>
            <label className={etiket}>Fiyatlar</label>
            <select name="kdvDahil" defaultValue={ayarlar.kdvDahil ? "evet" : "hayir"} onChange={() => setDegisti(true)} className={kutu}>
              <option value="hayir">KDV hariç</option>
              <option value="evet">KDV dahil</option>
            </select>
          </div>
          <div>
            <label className={etiket}>Liste iskontosu %</label>
            <input name="iskontoYuzde" inputMode="decimal" value={iskonto} onChange={(e) => setIskonto(e.target.value)} placeholder="0" className={kutu} />
          </div>
          <div>
            <label className={etiket}>Görünüm</label>
            <select name="duzen" defaultValue={ayarlar.duzen} onChange={() => setDegisti(true)} className={kutu}>
              {DUZENLER.map((d) => (
                <option key={d.kod} value={d.kod}>
                  {d.ad}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-metin/80 pb-2">
            <input type="checkbox" name="fiyatGoster" value="evet" defaultChecked={ayarlar.fiyatGoster} onChange={() => setDegisti(true)} className="accent-soguk" />
            Fiyatları göster
          </label>
        </div>
        <p className="text-[11px] text-metin/50">
          &quot;Fiyatları göster&quot; kapatılırsa liste, fiyatsız fotoğraflı ürün kataloğu olarak çıkar. Para birimini değiştirmek mevcut
          fiyatları çevirmez; yalnızca bundan sonra katalogdan eklenen ürünler yeni para birimine çevrilir.
        </p>
      </section>

      {/* ÜRÜN EKLE */}
      <section className="bg-yuzey border border-hat rounded-lg p-5 space-y-3">
        <h2 className="font-display font-medium text-metin">Ürün Ekle</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className={etiket}>Eklenecek bölüm (opsiyonel)</label>
            <input value={yeniBolum} onChange={(e) => setYeniBolum(e.target.value)} placeholder="örn. Duvar Tipi Kombiler" className={kutu} />
          </div>
          <div className="sm:col-span-2">
            <label className={etiket}>Katalogda ara ({urunler.length} ürün)</label>
            <input value={ara} onChange={(e) => setAra(e.target.value)} placeholder="Ürün adı, kodu veya markası…" className={kutu} />
          </div>
        </div>
        {ara.trim() && (
          <div className="border border-hat rounded-md divide-y divide-hat max-h-80 overflow-y-auto">
            {sonuclar.length === 0 && <p className="text-sm text-metin/50 p-3">Katalogda eşleşen ürün yok. Elle ekleyebilirsiniz.</p>}
            {sonuclar.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => katalogdanEkle(u)}
                className="focus-ring w-full flex items-center gap-3 p-2 text-left hover:bg-soguk-light/60"
              >
                <span className="w-10 h-10 shrink-0 rounded bg-zemin border border-hat overflow-hidden flex items-center justify-center text-[10px] text-metin/30">
                  {u.gorselId ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/gorsel/${u.gorselId}`} alt="" className="w-full h-full object-contain" />
                  ) : (
                    "foto yok"
                  )}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm text-metin truncate">{u.ad}</span>
                  <span className="block text-xs text-metin/50 truncate">{[u.marka, u.kod].filter(Boolean).join(" · ") || "—"}</span>
                </span>
                <span className="text-xs font-mono text-metin/70 whitespace-nowrap">{flParaYaz(u.listeFiyati, u.paraBirimi)}</span>
                <span className="text-xs font-semibold text-soguk-dim">+ Ekle</span>
              </button>
            ))}
          </div>
        )}
        <button type="button" onClick={elleEkle} className="focus-ring text-sm text-soguk-dim border border-soguk/40 rounded-md px-3 py-1.5 hover:bg-soguk-light">
          + Katalogda olmayan ürünü elle ekle
        </button>
      </section>

      {/* SATIRLAR */}
      <section className="space-y-3">
        <h2 className="font-display font-medium text-metin">Listedeki Ürünler ({satirlar.length})</h2>
        {satirlar.length === 0 && <p className="text-sm text-metin/50">Henüz ürün eklenmedi.</p>}
        {satirlar.map((r, i) => {
          const foto = r.gorselId || r.urunGorselId;
          const fiyat = sayiOku(r.fiyat);
          return (
            <div key={r.key} className="bg-yuzey border border-hat rounded-lg p-4 flex flex-col sm:flex-row gap-4">
              <div className="sm:w-36 shrink-0 space-y-2">
                <div className="w-36 h-36 rounded-md bg-zemin border border-hat overflow-hidden flex items-center justify-center text-xs text-metin/30">
                  {r.yukleniyor ? (
                    "Yükleniyor…"
                  ) : foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/gorsel/${foto}`} alt={r.ad} className="w-full h-full object-contain" />
                  ) : (
                    "Fotoğraf yok"
                  )}
                </div>
                <label className="focus-ring block text-center text-xs border border-hat rounded-md py-1 cursor-pointer hover:border-soguk text-metin/70">
                  {foto ? "Fotoğrafı değiştir" : "Fotoğraf yükle"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      fotoSec(r.key, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                {r.gorselId && (
                  <button type="button" onClick={() => guncelle(r.key, { gorselId: null })} className="focus-ring block w-full text-[11px] text-metin/50 hover:text-sicak-dim">
                    {r.urunGorselId ? "Katalog fotoğrafına dön" : "Fotoğrafı kaldır"}
                  </button>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="grid sm:grid-cols-[1fr_2fr] gap-2">
                  <input value={r.bolum} onChange={(e) => guncelle(r.key, { bolum: e.target.value })} placeholder="Bölüm (opsiyonel)" aria-label="Bölüm" className={kutu} />
                  <input value={r.ad} onChange={(e) => guncelle(r.key, { ad: e.target.value })} placeholder="Ürün adı *" aria-label="Ürün adı" className={`${kutu} font-medium ${r.ad.trim() ? "" : "border-sicak"}`} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input value={r.marka} onChange={(e) => guncelle(r.key, { marka: e.target.value })} placeholder="Marka" aria-label="Marka" className={kutu} />
                  <input value={r.kod} onChange={(e) => guncelle(r.key, { kod: e.target.value })} placeholder="Ürün kodu" aria-label="Ürün kodu" className={kutu} />
                  <input value={r.birim} onChange={(e) => guncelle(r.key, { birim: e.target.value })} placeholder="Birim" aria-label="Birim" className={kutu} />
                  <input
                    value={r.fiyat}
                    onChange={(e) => guncelle(r.key, { fiyat: e.target.value, uyari: undefined })}
                    inputMode="decimal"
                    placeholder={`Fiyat (${paraBirimi})`}
                    aria-label="Fiyat"
                    className={`${kutu} text-right font-mono`}
                  />
                </div>
                <textarea
                  value={r.aciklama}
                  onChange={(e) => guncelle(r.key, { aciklama: e.target.value })}
                  rows={2}
                  placeholder="Açıklama / teknik özellikler (opsiyonel)"
                  aria-label="Açıklama"
                  className={kutu}
                />
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-metin/50">
                    {r.urunId ? "Katalogdan" : "Elle eklendi"}
                    {fiyat > 0 && iskontoSayi > 0 && ` · iskontolu: ${flParaYaz(iskontoluFiyat(fiyat, iskontoSayi), paraBirimi)}`}
                    {r.uyari && <span className="text-sicak-dim font-medium"> · {r.uyari}</span>}
                  </span>
                  <span className="flex items-center gap-1">
                    <button type="button" onClick={() => tasi(i, -1)} disabled={i === 0} aria-label="Yukarı taşı" className="focus-ring px-2 py-1 border border-hat rounded disabled:opacity-30">
                      ↑
                    </button>
                    <button type="button" onClick={() => tasi(i, 1)} disabled={i === satirlar.length - 1} aria-label="Aşağı taşı" className="focus-ring px-2 py-1 border border-hat rounded disabled:opacity-30">
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => setSatirlar((s) => s.filter((x) => x.key !== r.key))}
                      className="focus-ring px-2 py-1 border border-hat rounded text-metin/60 hover:text-sicak-dim hover:border-sicak"
                    >
                      Çıkar
                    </button>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* NOTLAR */}
      <section className="bg-yuzey border border-hat rounded-lg p-5">
        <label className={etiket}>Liste sonu notları (opsiyonel) — ödeme, teslim, garanti koşulları vb.</label>
        <textarea name="notlar" rows={4} maxLength={5000} defaultValue={ayarlar.notlar} onChange={() => setDegisti(true)} className={kutu} />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 sticky bottom-0 bg-zemin/95 py-3 border-t border-hat">
        <span className="text-xs text-metin/50">
          {degisti ? <span className="text-sicak-dim font-medium">Kaydedilmemiş değişiklik var.</span> : "Değişiklik yok."}
          {bosAdli > 0 && <span className="text-sicak-dim"> · Adı boş {bosAdli} satır kaydedilmez.</span>}
        </span>
        <KaydetButonu basari={null}>{yuklenen ? "Fotoğraf yükleniyor…" : "Listeyi Kaydet"}</KaydetButonu>
      </div>
    </form>
  );
}
