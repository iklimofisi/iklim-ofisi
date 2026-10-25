"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { fiyatListesiKaydet } from "@/lib/actions";
import KaydetButonu from "@/components/KaydetButonu";
import { fotografYukle } from "@/lib/gorsel-yukle";
import { DUZENLER, FIYAT_SUTUN_KALIPLARI, iskontoluFiyat, flParaYaz, sutunIskontolari, iskontoKapsamGecerli, iskontoUygula, yuzdeOku, YUVARLAMALAR, yuvarlamaGecerli } from "@/lib/fiyat-listesi";
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
  fiyat2: number | null; // iki fiyatlı listede ikinci fiyat
  fiyat3: number | null; // 3. fiyat sütunu (ör. kredi kartı 9 taksit)
  gorselId: string | null;
  urunGorselId: string | null; // katalogdaki ürünün fotoğrafı (satıra özel fotoğraf yoksa bu görünür)
};

type Satir = Omit<DuzenlenenKalem, "fiyat" | "fiyat2" | "fiyat3" | "kod" | "marka" | "aciklama"> & {
  key: number;
  kod: string;
  marka: string;
  aciklama: string;
  fiyat: string;
  fiyat2: string;
  fiyat3: string;
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
  iskontoKapsam: string; // HEPSI | FIYAT1 | FIYAT2 (iki fiyatlı listede iskontonun uygulandığı sütun)
  alisIskontoYuzde: number | null; // liste fiyatından alış iskontosu (yalnız panelde)
  satisIskontoYuzde: number | null; // doluysa 2. fiyat = 1. fiyat − bu iskonto (otomatik)
  yuvarlamaAdim: number | null; // iskontolu fiyatların yuvarlanacağı adım (boş/0 = yok)
  fiyatGoster: boolean;
  duzen: string;
  fiyatBaslik: string;
  fiyat2Baslik: string; // doluysa liste iki fiyatlı (ör. Nakit / Kart)
  fiyat3Baslik: string; // doluysa (iki fiyatlı listede) 3. fiyat sütunu
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
      fiyat2: k.fiyat2 ? String(k.fiyat2).replace(".", ",") : "",
      fiyat3: k.fiyat3 ? String(k.fiyat3).replace(".", ",") : "",
    }))
  );
  const [fiyat2Baslik, setFiyat2Baslik] = useState(ayarlar.fiyat2Baslik);
  const [fiyatBaslik, setFiyatBaslik] = useState(ayarlar.fiyatBaslik || (ayarlar.fiyat2Baslik ? "Fiyat" : ""));
  const ikiFiyat = fiyat2Baslik.trim().length > 0;
  const fb1 = fiyatBaslik.trim() || "1. fiyat";
  const fb2 = fiyat2Baslik.trim() || "2. fiyat";
  // 3. fiyat sütunu (ör. "Kredi Kartı 9 Taksit"): yalnız iki fiyatlı listede; PDF'te 1. fiyatın yanında çıkar
  const [fiyat3Baslik, setFiyat3Baslik] = useState(ayarlar.fiyat3Baslik ?? "");
  const ucFiyat = ikiFiyat && fiyat3Baslik.trim().length > 0;
  const fb3 = fiyat3Baslik.trim() || "3. fiyat";
  const [iskontoKapsam, setIskontoKapsam] = useState(iskontoKapsamGecerli(ayarlar.iskontoKapsam));
  // Alış / satış iskontosu: alış fiyatı yalnız burada görünür; satış iskontosu doluysa 2. fiyat otomatik hesaplanır
  const yuzdeMetni = (n: number | null) => (n === null || n === undefined ? "" : String(n).replace(".", ","));
  const [alisIsk, setAlisIsk] = useState(yuzdeMetni(ayarlar.alisIskontoYuzde));
  const [satisIsk, setSatisIsk] = useState(yuzdeMetni(ayarlar.satisIskontoYuzde));
  const alisY = yuzdeOku(alisIsk);
  const satisY = ikiFiyat ? yuzdeOku(satisIsk) : null;
  const satisOto = satisY !== null;
  const alisHatali = alisIsk.trim() !== "" && alisY === null;
  const satisHatali = ikiFiyat && satisIsk.trim() !== "" && satisY === null;
  // İskontolu fiyatların yuvarlanması (satış iskontosu ve liste iskontosu için ortak)
  const [yuvarlamaAdim, setYuvarlamaAdim] = useState(yuvarlamaGecerli(ayarlar.yuvarlamaAdim));
  // 2. fiyatın değeri (satış iskontosu doluysa liste fiyatından hesaplanır)
  // 3. sütunun satış fiyatı (satış iskontosu modunda; ör. kredi kartı satış = kredi kartı liste − iskonto)
  const ucuncuSatis = (r: { fiyat3: string }) => {
    const f = sayiOku(r.fiyat3);
    return satisOto && f > 0 ? iskontoUygula(f, satisY as number, paraBirimi, yuvarlamaAdim) : 0;
  };
  const ikinciFiyat = (r: { fiyat: string; fiyat2: string }) => {
    if (!satisOto) return sayiOku(r.fiyat2);
    const f = sayiOku(r.fiyat);
    return f > 0 ? iskontoUygula(f, satisY as number, paraBirimi, yuvarlamaAdim) : 0;
  };
  // Fiyat sütunu kalıbı: adlar bir kalıba uyuyorsa o, değilse "özel"
  const kalip = !ikiFiyat
    ? "TEK"
    : FIYAT_SUTUN_KALIPLARI.find((k) => k.b1 === fiyatBaslik.trim() && k.b2 === fiyat2Baslik.trim())?.kod ?? "OZEL";
  const kalipSec = (kod: string) => {
    if (kod === "OZEL") {
      if (!ikiFiyat) {
        setFiyatBaslik("Fiyat");
        setFiyat2Baslik("Fiyat 2");
      }
      return;
    }
    const k = FIYAT_SUTUN_KALIPLARI.find((x) => x.kod === kod);
    if (!k) return;
    setFiyatBaslik(k.b1);
    setFiyat2Baslik(k.b2);
  };
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
  }, [satirlar, paraBirimi, iskonto, fiyat2Baslik, fiyatBaslik, fiyat3Baslik, iskontoKapsam, alisIsk, satisIsk, yuvarlamaAdim]);

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

  // Katalog fiyatını liste para birimine çevirir (TCMB efektif satış)
  const katalogFiyati = (u: KatalogUrunu): { fiyat: number; uyari?: string } => {
    if (u.paraBirimi === paraBirimi) return { fiyat: u.listeFiyati };
    const kaynak = kurTL(u.paraBirimi);
    const hedef = kurTL(paraBirimi);
    if (kaynak && hedef) {
      return {
        fiyat: Math.round(((u.listeFiyati * kaynak) / hedef) * 100) / 100,
        uyari: `${flParaYaz(u.listeFiyati, u.paraBirimi)} TCMB efektif satış kuruyla (${kurlar?.tarih}) çevrildi`,
      };
    }
    return { fiyat: u.listeFiyati, uyari: `Katalog fiyatı ${u.paraBirimi}; kur alınamadığı için çevrilmedi — fiyatı kontrol edin` };
  };

  // --- TOPLU FİYAT GÜNCELLEME (aylık zam vb.) ---
  const [zam, setZam] = useState("");
  const [zamKapsam, setZamKapsam] = useState("__hepsi");
  // İki fiyatlı listede zam/indirimin uygulanacağı fiyat
  const [zamHedef, setZamHedef] = useState<"HEPSI" | "FIYAT1" | "FIYAT2">("HEPSI");
  const zam1 = !ikiFiyat || satisOto || zamHedef !== "FIYAT2";
  // Satış iskontosu tanımlıysa satış fiyatı liste fiyatından hesaplanır; zam yalnız liste fiyatına yapılır
  const zam2 = ikiFiyat && !satisOto && zamHedef !== "FIYAT1";
  const [yuvarla, setYuvarla] = useState("0");
  const [yedek, setYedek] = useState<{ satirlar: Satir[]; aciklama: string } | null>(null);
  const bolumler = Array.from(new Set(satirlar.map((r) => r.bolum.trim()).filter(Boolean)));
  const kapsamda = (r: Satir) => zamKapsam === "__hepsi" || r.bolum.trim() === zamKapsam;
  // "5", "%5", "+2,5", "-5" → sayı (okunamazsa null)
  const zamOrani = (() => {
    let t = zam.trim().replace("%", "");
    const eksi = t.startsWith("-");
    t = t.replace(/^[+-]/, "");
    const n = tutarOku(t);
    return n === null ? null : eksi ? -n : n;
  })();
  const etkilenecek = satirlar.filter((r) => kapsamda(r) && ((zam1 && sayiOku(r.fiyat) > 0) || (zam2 && sayiOku(r.fiyat2) > 0))).length;
  const yuvarlaFiyat = (n: number) => {
    const adim = Number(yuvarla);
    return adim > 0 ? Math.max(adim, Math.round(n / adim) * adim) : Math.round(n * 100) / 100;
  };
  const fiyatMetni = (n: number) => String(n).replace(".", ",");

  const zamUygula = () => {
    if (zamOrani === null || zamOrani === 0 || zamOrani <= -100) return;
    const hedefAdi = !ikiFiyat || zamHedef === "HEPSI" ? "" : ` (yalnız ${zamHedef === "FIYAT1" ? fb1 : fb2})`;
    setYedek({ satirlar, aciklama: `%${zamOrani.toLocaleString("tr-TR")} ${zamOrani > 0 ? "zam" : "indirim"}${hedefAdi}` });
    setSatirlar((s) =>
      s.map((r) => {
        if (!kapsamda(r)) return r;
        const f = sayiOku(r.fiyat);
        const f2 = sayiOku(r.fiyat2);
        const f3 = sayiOku(r.fiyat3);
        return {
          ...r,
          fiyat: zam1 && f > 0 ? fiyatMetni(yuvarlaFiyat(f * (1 + zamOrani / 100))) : r.fiyat,
          // 3. fiyat (ör. kredi kartı) liste fiyatıyla birlikte güncellenir
          fiyat3: ucFiyat && zam1 && f3 > 0 ? fiyatMetni(yuvarlaFiyat(f3 * (1 + zamOrani / 100))) : r.fiyat3,
          fiyat2: zam2 && f2 > 0 ? fiyatMetni(yuvarlaFiyat(f2 * (1 + zamOrani / 100))) : r.fiyat2,
          uyari: undefined,
        };
      })
    );
    setZam("");
  };

  const katalogBagli = satirlar.filter((r) => kapsamda(r) && r.urunId && urunler.some((u) => u.id === r.urunId)).length;
  const katalogdanYenile = () => {
    setYedek({ satirlar, aciklama: "katalog fiyatlarının yeniden alınması" });
    setSatirlar((s) =>
      s.map((r) => {
        const u = r.urunId && kapsamda(r) ? urunler.find((x) => x.id === r.urunId) : undefined;
        if (!u) return r;
        const k = katalogFiyati(u);
        return { ...r, fiyat: k.fiyat ? fiyatMetni(k.fiyat) : "", uyari: k.uyari };
      })
    );
  };

  const katalogdanEkle = (u: KatalogUrunu) => {
    const { fiyat, uyari } = katalogFiyati(u);
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
        fiyat2: "",
        fiyat3: "",
        gorselId: null,
        urunGorselId: u.gorselId,
        uyari,
      },
    ]);
  };

  const elleEkle = () =>
    setSatirlar((s) => [
      ...s,
      { key: sayac++, bolum: yeniBolum.trim(), urunId: null, ad: "", kod: "", marka: "", aciklama: "", birim: "Adet", fiyat: "", fiyat2: "", fiyat3: "", gorselId: null, urunGorselId: null },
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
  const [isk1, isk2] = sutunIskontolari({ iskontoYuzde: iskontoSayi, iskontoKapsam, fiyat2Baslik });
  const ikinciFiyatVar = satirlar.some((r) => sayiOku(r.fiyat2) > 0);
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
      fiyat2: ikiFiyat && ikinciFiyat(r) > 0 ? ikinciFiyat(r) : null,
      fiyat3: ucFiyat && sayiOku(r.fiyat3) > 0 ? sayiOku(r.fiyat3) : null,
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
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
            <label className={etiket}>Görünüm</label>
            <select name="duzen" defaultValue={ayarlar.duzen} onChange={() => setDegisti(true)} className={kutu}>
              {DUZENLER.map((d) => (
                <option key={d.kod} value={d.kod}>
                  {d.ad}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={etiket}>Fiyat sütunları</label>
            <select value={kalip} onChange={(e) => kalipSec(e.target.value)} className={kutu}>
              {FIYAT_SUTUN_KALIPLARI.map((k) => (
                <option key={k.kod} value={k.kod}>
                  {k.ad}
                </option>
              ))}
              <option value="OZEL">İki fiyat · adları ben yazayım</option>
            </select>
          </div>
        </div>
        <input type="hidden" name="fiyatBaslik" value={ikiFiyat ? fiyatBaslik : ""} />
        <input type="hidden" name="fiyat2Baslik" value={fiyat2Baslik} />
        <input type="hidden" name="fiyat3Baslik" value={ikiFiyat ? fiyat3Baslik : ""} />
        {ikiFiyat && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div>
              <label className={etiket}>1. fiyat sütununun adı</label>
              <input value={fiyatBaslik} maxLength={40} onChange={(e) => setFiyatBaslik(e.target.value)} placeholder="örn. Liste Fiyatı" className={kutu} />
            </div>
            <div>
              <label className={etiket}>2. fiyat sütununun adı</label>
              <input
                value={fiyat2Baslik}
                maxLength={40}
                onChange={(e) => setFiyat2Baslik(e.target.value)}
                placeholder="örn. Satış Fiyatı"
                className={`${kutu} ${fiyat2Baslik.trim() ? "" : "border-sicak"}`}
              />
            </div>
            <div className="lg:col-span-2">
              <label className={etiket}>3. fiyat sütunu (opsiyonel; PDF&apos;te 1. fiyatın yanında)</label>
              <input
                value={fiyat3Baslik}
                maxLength={40}
                onChange={(e) => setFiyat3Baslik(e.target.value)}
                placeholder="örn. Kredi Kartı 9 Taksit — boş bırakılırsa yok"
                className={kutu}
              />
            </div>
          </div>
        )}
        {!ikiFiyat && ikinciFiyatVar && (
          <p className="text-[11px] text-sicak-dim font-medium">
            Bu listede ikinci fiyatı girilmiş ürünler var. Tek fiyata geçip kaydederseniz ikinci fiyatlar silinir; vazgeçmek için yukarıdan iki fiyatlı
            seçeneği geri seçin.
          </p>
        )}

        {/* ALIŞ / SATIŞ İSKONTOSU: alış fiyatı yalnız panelde görünür, PDF'e girmez */}
        <div className="border border-soguk/30 rounded-md p-3 space-y-2 bg-soguk-light/30">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-52">
              <label className={etiket}>Alış iskontom % (listeden)</label>
              <input
                name="alisIskontoYuzde"
                inputMode="decimal"
                value={alisIsk}
                onChange={(e) => setAlisIsk(e.target.value)}
                placeholder="örn. 25"
                className={`${kutu} ${alisHatali ? "border-sicak" : ""}`}
              />
            </div>
            {ikiFiyat ? (
              <div className="w-52">
                <label className={etiket}>Satış iskontosu % (listeden)</label>
                <input
                  name="satisIskontoYuzde"
                  inputMode="decimal"
                  value={satisIsk}
                  onChange={(e) => setSatisIsk(e.target.value)}
                  placeholder="boş: elle girilir"
                  className={`${kutu} ${satisHatali ? "border-sicak" : ""}`}
                />
              </div>
            ) : (
              <input type="hidden" name="satisIskontoYuzde" value="" />
            )}
            <div className="w-52">
              <label className={etiket}>İskontolu fiyat yuvarlama</label>
              <select name="yuvarlamaAdim" value={yuvarlamaAdim} onChange={(e) => setYuvarlamaAdim(yuvarlamaGecerli(e.target.value))} className={kutu}>
                {YUVARLAMALAR.map((y) => (
                  <option key={y.adim} value={y.adim}>
                    {y.ad}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-[11px] text-metin/60">
            {alisY !== null
              ? `Alış fiyatı = liste fiyatı − %${alisY.toLocaleString("tr-TR")}${ucFiyat ? ` (${fb1} ve ${fb3} için ayrı ayrı)` : ""}; her ürünün altında alış fiyatı ve kârı görünür. Alış fiyatı PDF'e ve müşteriye gitmez. `
              : "Alış iskontosu girerseniz her ürünün altında alış fiyatı ve kârınız görünür (yalnız panelde). "}
            {ikiFiyat &&
              (satisOto
                ? `${fb2} satış fiyatı ${fb1} üzerinden${ucFiyat ? `, ${fb3} satış fiyatı kendi liste fiyatı üzerinden` : ""} %${(satisY as number).toLocaleString("tr-TR")} iskontoyla otomatik hesaplanır. PDF'te liste fiyatları gösterilmez; müşteriye yalnız ${ucFiyat ? `${fb2} ve ${fb3}` : fb2} satış fiyatları gider.`
                : `${fb2} fiyatları elle girilir. Satış iskontosu yazarsanız hepsi ${fb1} üzerinden otomatik hesaplanır.`)}
            {yuvarlamaAdim > 0 &&
              ` İskontoyla hesaplanan fiyatlar (satış iskontosu ve PDF'teki liste iskontosu) ${(YUVARLAMALAR.find((y) => y.adim === yuvarlamaAdim)?.ad ?? "").toLocaleLowerCase("tr-TR")} yuvarlanır.`}
            {(alisHatali || satisHatali) && <span className="text-sicak-dim font-medium"> İskonto 0 ile 100 arasında bir sayı olmalı.</span>}
          </p>
        </div>

        {/* İSKONTO: PDF'te uygulanır; ürünlerdeki fiyatlar değişmez */}
        <div className="border border-hat rounded-md p-3 space-y-2 bg-zemin/40">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-32">
              <label className={etiket}>Liste iskontosu %</label>
              <input name="iskontoYuzde" inputMode="decimal" value={iskonto} onChange={(e) => setIskonto(e.target.value)} placeholder="0" className={kutu} />
            </div>
            {ikiFiyat && (
              <div className="min-w-[14rem]">
                <label className={etiket}>İskonto hangi fiyata uygulansın?</label>
                <select name="iskontoKapsam" value={iskontoKapsam} onChange={(e) => setIskontoKapsam(iskontoKapsamGecerli(e.target.value))} className={kutu}>
                  <option value="HEPSI">Tüm fiyatlara</option>
                  <option value="FIYAT1">Yalnız {fb1}</option>
                  <option value="FIYAT2">Yalnız {fb2}</option>
                </select>
              </div>
            )}
            {!ikiFiyat && <input type="hidden" name="iskontoKapsam" value={iskontoKapsam} />}
            {iskontoSayi > 0 && (
              <button
                type="button"
                onClick={() => setIskonto("")}
                className="focus-ring border border-sicak/50 text-sicak-dim rounded-md px-3 py-2 text-sm font-medium hover:bg-sicak-light"
              >
                ✕ İskontoyu sıfırla
              </button>
            )}
          </div>
          <p className="text-[11px] text-metin/55">
            {iskontoSayi > 0
              ? ikiFiyat
                ? iskontoKapsam === "HEPSI"
                  ? `PDF'te ${fb1} ve ${fb2} sütunlarının ikisi de %${iskontoSayi.toLocaleString("tr-TR")} iskontolu çıkar.`
                  : `PDF'te yalnız ${iskontoKapsam === "FIYAT1" ? fb1 : fb2} sütunu %${iskontoSayi.toLocaleString("tr-TR")} iskontolu çıkar; ${iskontoKapsam === "FIYAT1" ? fb2 : fb1} olduğu gibi kalır.`
                : `PDF'te fiyatlar %${iskontoSayi.toLocaleString("tr-TR")} iskontolu çıkar (üstü çizili eski fiyatla).`
              : "İskonto yok."}{" "}
            {iskontoSayi > 0 && yuvarlamaAdim > 0 && "İskontolu fiyatlar yukarıda seçilen yuvarlamayla yuvarlanır. "}
            İskonto yalnız PDF'te uygulanır; aşağıdaki ürün fiyatları değişmez. Sıfırlayıp kaydedince liste eski hâline döner.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-metin/80">
          <input type="checkbox" name="fiyatGoster" value="evet" defaultChecked={ayarlar.fiyatGoster} onChange={() => setDegisti(true)} className="accent-soguk" />
          Fiyatları göster
        </label>
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

      {/* TOPLU FİYAT GÜNCELLEME */}
      {satirlar.length > 0 && (
        <section className="bg-yuzey border border-hat rounded-lg p-5 space-y-3">
          <div>
            <h2 className="font-display font-medium text-metin">Toplu Fiyat Güncelleme</h2>
            <p className="text-xs text-metin/50 mt-0.5">
              Aylık zam için fiyatları tek tek düzeltmeyin: yüzdeyi yazıp uygulayın. Önce listeyi &quot;Kopyala&quot; ile çoğaltırsanız eski ay
              listesi de saklanır.
            </p>
          </div>
          <div className={`grid gap-3 items-end ${ikiFiyat ? "sm:grid-cols-5" : "sm:grid-cols-4"}`}>
            <div>
              <label className={etiket}>Zam % (indirim için eksi: -5)</label>
              <input value={zam} onChange={(e) => setZam(e.target.value)} inputMode="decimal" placeholder="örn. 5 veya 2,5" className={kutu} />
            </div>
            <div>
              <label className={etiket}>Hangi ürünlere</label>
              <select value={zamKapsam} onChange={(e) => setZamKapsam(e.target.value)} className={kutu}>
                <option value="__hepsi">Tüm liste</option>
                {bolumler.map((b) => (
                  <option key={b} value={b}>
                    Bölüm: {b}
                  </option>
                ))}
              </select>
            </div>
            {ikiFiyat && !satisOto && (
              <div>
                <label className={etiket}>Hangi fiyata</label>
                <select value={zamHedef} onChange={(e) => setZamHedef(e.target.value as "HEPSI" | "FIYAT1" | "FIYAT2")} className={kutu}>
                  <option value="HEPSI">Tüm fiyatlara</option>
                  <option value="FIYAT1">Yalnız {fb1}</option>
                  <option value="FIYAT2">Yalnız {fb2}</option>
                </select>
              </div>
            )}
            <div>
              <label className={etiket}>Yuvarlama</label>
              <select value={yuvarla} onChange={(e) => setYuvarla(e.target.value)} className={kutu}>
                <option value="0">Yok (kuruşlu)</option>
                <option value="1">Tam sayıya</option>
                <option value="5">5&apos;in katına</option>
                <option value="10">10&apos;un katına</option>
                <option value="50">50&apos;nin katına</option>
                <option value="100">100&apos;ün katına</option>
              </select>
            </div>
            <button
              type="button"
              onClick={zamUygula}
              disabled={zamOrani === null || zamOrani === 0 || zamOrani <= -100 || etkilenecek === 0}
              className="focus-ring bg-sicak-dim text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {zamOrani && zamOrani > -100 ? `${etkilenecek} ürüne %${zamOrani.toLocaleString("tr-TR")} uygula` : "Uygula"}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {katalogBagli > 0 && (
              <button
                type="button"
                onClick={katalogdanYenile}
                className="focus-ring border border-soguk/40 text-soguk-dim rounded-md px-3 py-1.5 hover:bg-soguk-light"
                title="Ürün kataloğundaki fiyatları güncellediyseniz (ör. Excel ile), listedeki fiyatları katalogdan yeniden alır"
              >
                ↻ Katalog fiyatlarını yeniden al ({katalogBagli} ürün)
              </button>
            )}
            {yedek && (
              <span className="flex items-center gap-2 bg-sicak-light text-sicak-dim rounded-md px-3 py-1.5">
                Son işlem: {yedek.aciklama}.
                <button
                  type="button"
                  onClick={() => {
                    setSatirlar(yedek.satirlar);
                    setYedek(null);
                  }}
                  className="focus-ring font-semibold underline"
                >
                  ↶ Geri al
                </button>
              </span>
            )}
            <span className="text-metin/40">
              Bu bölüm fiyatların kendisini değiştirir; &quot;Listeyi Kaydet&quot; ile kalıcı olur. Fiyatlara dokunmadan yalnız PDF&apos;te indirim
              göstermek için yukarıdaki &quot;Liste iskontosu&quot;nu kullanın.
            </span>
          </div>
        </section>
      )}

      {/* SATIRLAR */}
      <section className="space-y-3">
        <h2 className="font-display font-medium text-metin">Listedeki Ürünler ({satirlar.length})</h2>
        {satirlar.length === 0 && <p className="text-sm text-metin/50">Henüz ürün eklenmedi.</p>}
        {satirlar.map((r, i) => {
          const foto = r.gorselId || r.urunGorselId;
          const fiyat = sayiOku(r.fiyat);
          // Grup (bölüm) değiştiği yerde başlık: listedeki gruplar ayrı görünsün
          const grup = r.bolum.trim();
          const grupBasi = grup !== "" && (i === 0 || satirlar[i - 1].bolum.trim() !== grup);
          let grupAdet = 0;
          if (grupBasi) for (let j = i; j < satirlar.length && satirlar[j].bolum.trim() === grup; j++) grupAdet++;
          return (
            <Fragment key={r.key}>
            {grupBasi && (
              <h3 className={`flex items-center gap-2 bg-soguk-light/50 border-l-4 border-soguk rounded-r-md px-3 py-2 text-sm font-semibold text-soguk-dim ${i === 0 ? "" : "!mt-8"}`}>
                {grup}
                <span className="text-xs font-normal text-metin/50">· {grupAdet} ürün</span>
              </h3>
            )}
            <div className="bg-yuzey border border-hat rounded-lg p-4 flex flex-col sm:flex-row gap-4">
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
                  {/* İki fiyatlı listede kutunun solunda sütun adı yazar (ör. Liste / Satış) */}
                  <div className="relative">
                    {ikiFiyat && <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-metin/45 max-w-[45%] truncate">{fb1}</span>}
                    <input
                      value={r.fiyat}
                      onChange={(e) => guncelle(r.key, { fiyat: e.target.value, uyari: undefined })}
                      inputMode="decimal"
                      placeholder={ikiFiyat ? "" : `Fiyat (${paraBirimi})`}
                      aria-label={ikiFiyat ? fb1 : "Fiyat"}
                      className={`${kutu} text-right font-mono`}
                    />
                  </div>
                  {ucFiyat && (
                    <div className="relative sm:col-start-4">
                      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-metin/45 max-w-[45%] truncate">{satisOto ? `${fb3} (liste)` : fb3}</span>
                      <input
                        value={r.fiyat3}
                        onChange={(e) => guncelle(r.key, { fiyat3: e.target.value })}
                        inputMode="decimal"
                        aria-label={fb3}
                        className={`${kutu} text-right font-mono`}
                      />
                    </div>
                  )}
                  {ikiFiyat && (
                    <div className="relative sm:col-start-4">
                      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-metin/45 max-w-[45%] truncate">{fb2}</span>
                      <input
                        value={satisOto ? (ikinciFiyat(r) > 0 ? fiyatMetni(ikinciFiyat(r)) : "") : r.fiyat2}
                        onChange={(e) => guncelle(r.key, { fiyat2: e.target.value })}
                        readOnly={satisOto}
                        title={satisOto ? `${fb1} − %${(satisY as number).toLocaleString("tr-TR")} (otomatik)` : undefined}
                        inputMode="decimal"
                        aria-label={fb2}
                        className={`${kutu} text-right font-mono ${satisOto ? "bg-zemin text-metin/70" : ""}`}
                      />
                    </div>
                  )}
                  {ucFiyat && satisOto && (
                    <div className="relative sm:col-start-4">
                      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-metin/45 max-w-[45%] truncate">{fb3}</span>
                      <input
                        value={ucuncuSatis(r) > 0 ? fiyatMetni(ucuncuSatis(r)) : ""}
                        readOnly
                        title={`${fb3} (liste) − %${(satisY as number).toLocaleString("tr-TR")} (otomatik)`}
                        aria-label={`${fb3} satış`}
                        className={`${kutu} text-right font-mono bg-zemin text-metin/70`}
                      />
                    </div>
                  )}
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
                    {fiyat > 0 && isk1 > 0 && ` · ${ikiFiyat ? `${fb1} ` : ""}iskontolu: ${flParaYaz(iskontoluFiyat(fiyat, isk1, yuvarlamaAdim), paraBirimi)}`}
                    {ikiFiyat && ikinciFiyat(r) > 0 && isk2 > 0 && ` · ${fb2} iskontolu: ${flParaYaz(iskontoluFiyat(ikinciFiyat(r), isk2, yuvarlamaAdim), paraBirimi)}`}
                    {alisY !== null &&
                      // Alış ve kâr: liste fiyatı (nakit) ve varsa 3. sütun (ör. kredi kartı) için ayrı ayrı
                      (
                        [
                          [fiyat, ikiFiyat ? ikinciFiyat(r) : fiyat, ucFiyat ? `${fb2} ` : ""],
                          ...(ucFiyat && satisOto ? [[sayiOku(r.fiyat3), ucuncuSatis(r), `${fb3} `] as [number, number, string]] : []),
                        ] as [number, number, string][]
                      ).map(([liste, satis, etk]) => {
                        if (!(liste > 0)) return null;
                        const alis = liste * (1 - alisY / 100);
                        const kar = satis - alis;
                        return (
                          <span key={etk} className={kar >= 0 ? "text-emerald-700" : "text-sicak-dim font-medium"}>
                            {` · ${etk}alış: ${flParaYaz(alis, paraBirimi)}`}
                            {satis > 0 && ` · kâr: ${flParaYaz(kar, paraBirimi)} (%${((kar / alis) * 100).toLocaleString("tr-TR", { maximumFractionDigits: 1 })})`}
                          </span>
                        );
                      })}
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
            </Fragment>
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
