// -----------------------------------------------------------------------------
// ISI POMPASI HESABI — GİRDİ VERİ MODELİ
// Hesabın tüm girdileri tek bir JSON olarak saklanır (IsiHesap.veri).
// veriOku() her alanı doğrular; bozuk / eksik veri gelirse varsayılan değer koyar,
// böylece eski kayıtlar ileride alan eklense de açılmaya devam eder.
// -----------------------------------------------------------------------------
import {
  ODA_TIPLERI,
  ELEMAN_TURLERI,
  KESITLER,
  YALITIMLAR,
  PENCERELER,
  B_KATSAYILARI,
  YONLER,
  KAPLAMALAR,
  YERDEN_BORULARI,
  RADYATOR_TIPLERI,
  RADYATOR_YUKSEKLIKLERI,
  type OdaTipi,
  type ElemanTuru,
  type Yon,
  type RadyatorTipi,
  type RadyatorYukseklik,
} from "./katalog";
import { ILLER } from "./iklim";

export type Isitici = "RADYATOR" | "YERDEN" | "YERDEN_RADYATOR" | "YOK";
export const ISITICILAR: Record<Isitici, string> = {
  RADYATOR: "Radyatör",
  YERDEN: "Yerden ısıtma",
  YERDEN_RADYATOR: "Yerden ısıtma + takviye radyatör",
  YOK: "Isıtılmıyor",
};

export type Eleman = {
  id: string;
  tur: ElemanTuru;
  aciklama: string;
  yon: Yon | "";
  en: number; // m — duvar: uzunluk, pencere/kapı: genişlik
  boy: number; // m — pencere/kapı yüksekliği; duvar için 0 = oda yüksekliği
  adet: number;
  odaAlani: boolean; // döşeme / tavan: alan = oda alanı
  doseme: boolean; // bu eleman odanın DÖŞEMESİ mi (yerden ısıtmada alt kayıp ayrı hesaplanır)
  kesit: string; // KESITLER veya PENCERELER anahtarı
  yalitim: string; // YALITIMLAR anahtarı
  yalitimCm: number;
  uElle: number | null; // doluysa katalog yerine bu U değeri kullanılır
  bAnahtar: string; // ısıtılmayan hacim tipi
  komsuSicaklik: number; // KOMSU için °C
};

export type Oda = {
  id: string;
  ad: string;
  tip: OdaTipi;
  sicaklik: number;
  en: number;
  boy: number;
  yukseklik: number;
  havaDegisim: number;
  isitici: Isitici;
  elemanlar: Eleman[];
  radyatorTip: RadyatorTipi;
  radyatorYukseklik: RadyatorYukseklik;
  radyatorParca: number; // 0 = otomatik
  kaplama: string;
  kollektor: number; // 1, 2, …
  kollektorMesafe: number; // m (kollektörden odaya tek yön)
  haricAlan: number; // m² (sabit mobilya, dolap, küvet vb. boru döşenmeyen alan)
  aralik: number; // m (0 = otomatik)
  desen: "SALYANGOZ" | "SERPANTIN";
};

export type Isletme = "MONOVALENT" | "MONOENERJETIK";

export type HesapVerisi = {
  surum: 1;
  il: string;
  disSicaklikElle: number | null;
  adres: string;
  isiKoprusu: number;
  yonArtirimi: boolean;
  isinmaArtirimi: number; // %
  emniyetPayi: number; // % (ısı pompası seçiminde)
  radyatorGidis: number;
  radyatorDonus: number;
  yerdenHedefGidis: number;
  yerdenGidisModu: "OTOMATIK" | "SABIT"; // SABIT: hedefte kalır, eksik takviye ile karşılanır
  yerdenSigma: number;
  yerdenBoru: string;
  yerdenMinAralik: number;
  yerdenMaksAralik: number;
  sapUstu: number; // m — boru üstü şap kalınlığı
  sapLambda: number; // W/mK
  sicakSu: boolean;
  kisiSayisi: number;
  sicakSuSicaklik: number;
  isletme: Isletme;
  bivalentNokta: number;
  tampon: "OTOMATIK" | "YOK" | "ELLE";
  tamponElle: number;
  anaHatUzunluk: number; // m (mekanik odadan kollektöre / radyatör hattı ortalama, tek yön)
  statikYukseklik: number; // m
  modelId: string; // seçili ısı pompası modeli ("" = otomatik öneri)
  odalar: Oda[];
};

// ---------------------------------------------------------------------------
// Doğrulama yardımcıları
// ---------------------------------------------------------------------------
function sayi(v: unknown, varsayilan: number, min: number, maks: number): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? parseFloat(v.replace(",", ".")) : NaN;
  if (!Number.isFinite(n)) return varsayilan;
  return Math.min(maks, Math.max(min, n));
}
function secim<T extends string>(v: unknown, izinli: readonly T[], varsayilan: T): T {
  return typeof v === "string" && (izinli as readonly string[]).includes(v) ? (v as T) : varsayilan;
}
function metin(v: unknown, maks = 200): string {
  return typeof v === "string" ? v.slice(0, maks) : "";
}
function bool(v: unknown, varsayilan: boolean): boolean {
  return typeof v === "boolean" ? v : varsayilan;
}

let sayac = 0;
export function yeniId(): string {
  sayac = (sayac + 1) % 1e6;
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8) + sayac.toString(36);
}

const ODA_TIPI_LISTESI = Object.keys(ODA_TIPLERI) as OdaTipi[];
const ELEMAN_TURU_LISTESI = Object.keys(ELEMAN_TURLERI) as ElemanTuru[];
const YON_LISTESI = ["", ...(Object.keys(YONLER) as Yon[])] as const;
const KESIT_LISTESI = KESITLER.map((k) => k.anahtar);
const PENCERE_LISTESI = PENCERELER.map((p) => p.anahtar);
const YALITIM_LISTESI = YALITIMLAR.map((y) => y.anahtar);
const B_LISTESI = B_KATSAYILARI.map((b) => b.anahtar);
const KAPLAMA_LISTESI = KAPLAMALAR.map((k) => k.anahtar);
const BORU_LISTESI = YERDEN_BORULARI.map((b) => b.anahtar);
const RAD_TIP_LISTESI = Object.keys(RADYATOR_TIPLERI) as RadyatorTipi[];
const ISITICI_LISTESI = Object.keys(ISITICILAR) as Isitici[];

export function pencereMi(tur: ElemanTuru) {
  return tur === "PENCERE" || tur === "DIS_KAPI";
}

// Eleman türüne uygun varsayılan kesit
export function varsayilanKesit(tur: ElemanTuru): string {
  if (tur === "PENCERE") return "LOWE";
  if (tur === "DIS_KAPI") return "KAPI_YALITIMLI";
  if (tur === "DIS_DUVAR" || tur === "KOMSU") return "TUGLA19";
  if (tur === "DUVAR_TOPRAK") return "BETONARME";
  if (tur === "ISITILMAYAN") return "TAVAN_CATI_ARASI";
  return "DOSEME";
}

export function yeniEleman(tur: ElemanTuru, ek: Partial<Eleman> = {}): Eleman {
  const yatay = tur === "CATI" || tur === "DOSEME_DIS" || tur === "DOSEME_TOPRAK";
  return {
    id: yeniId(),
    tur,
    aciklama: "",
    yon: tur === "DIS_DUVAR" || pencereMi(tur) ? "K" : "",
    en: pencereMi(tur) ? 1.2 : 4,
    boy: pencereMi(tur) ? (tur === "DIS_KAPI" ? 2.2 : 1.4) : 0,
    adet: 1,
    odaAlani: yatay,
    doseme: tur === "DOSEME_DIS" || tur === "DOSEME_TOPRAK",
    kesit: varsayilanKesit(tur),
    yalitim: tur === "DOSEME_TOPRAK" || tur === "DUVAR_TOPRAK" ? "XPS" : "EPS",
    yalitimCm: 0,
    uElle: null,
    bAnahtar: "CATI_ARASI",
    komsuSicaklik: 15,
    ...ek,
  };
}

export function yeniOda(tip: OdaTipi = "OTURMA", ek: Partial<Oda> = {}): Oda {
  const t = ODA_TIPLERI[tip];
  return {
    id: yeniId(),
    ad: t.ad,
    tip,
    sicaklik: t.sicaklik,
    en: 4,
    boy: 4,
    yukseklik: 2.8,
    havaDegisim: t.havaDegisim,
    isitici: "RADYATOR",
    elemanlar: [],
    radyatorTip: "22",
    radyatorYukseklik: 600,
    radyatorParca: 0,
    kaplama: tip === "BANYO" || tip === "MUTFAK" || tip === "WC" ? "SERAMIK" : "PARKE",
    kollektor: 1,
    kollektorMesafe: 5,
    haricAlan: 0,
    aralik: 0,
    desen: "SALYANGOZ",
    ...ek,
  };
}

export function varsayilanVeri(il = "İstanbul"): HesapVerisi {
  return {
    surum: 1,
    il,
    disSicaklikElle: null,
    adres: "",
    isiKoprusu: 0.1,
    yonArtirimi: true,
    isinmaArtirimi: 0,
    emniyetPayi: 0,
    radyatorGidis: 50,
    radyatorDonus: 40,
    yerdenHedefGidis: 35,
    yerdenGidisModu: "OTOMATIK",
    yerdenSigma: 5,
    yerdenBoru: "16x2",
    yerdenMinAralik: 0.1,
    yerdenMaksAralik: 0.25,
    sapUstu: 0.045,
    sapLambda: 1.2,
    sicakSu: true,
    kisiSayisi: 4,
    sicakSuSicaklik: 50,
    isletme: "MONOENERJETIK",
    bivalentNokta: -5,
    tampon: "OTOMATIK",
    tamponElle: 100,
    anaHatUzunluk: 10,
    statikYukseklik: 6,
    modelId: "",
    odalar: [],
  };
}

function elemanOku(h: unknown): Eleman | null {
  if (!h || typeof h !== "object") return null;
  const e = h as Record<string, unknown>;
  const tur = secim(e.tur, ELEMAN_TURU_LISTESI, "DIS_DUVAR");
  const kesitListesi = pencereMi(tur) ? PENCERE_LISTESI : KESIT_LISTESI;
  const uHam = e.uElle;
  return {
    id: metin(e.id, 40) || yeniId(),
    tur,
    aciklama: metin(e.aciklama, 120),
    yon: secim(e.yon, YON_LISTESI, ""),
    en: sayi(e.en, 1, 0, 200),
    boy: sayi(e.boy, 0, 0, 50),
    adet: Math.round(sayi(e.adet, 1, 0, 100)),
    odaAlani: bool(e.odaAlani, false),
    doseme: bool(e.doseme, tur === "DOSEME_DIS" || tur === "DOSEME_TOPRAK"),
    kesit: secim(e.kesit, kesitListesi, varsayilanKesit(tur)),
    yalitim: secim(e.yalitim, YALITIM_LISTESI, "EPS"),
    yalitimCm: sayi(e.yalitimCm, 0, 0, 50),
    uElle: uHam === null || uHam === undefined || uHam === "" ? null : sayi(uHam, 1, 0.05, 10),
    bAnahtar: secim(e.bAnahtar, B_LISTESI, "CATI_ARASI"),
    komsuSicaklik: sayi(e.komsuSicaklik, 15, -30, 40),
  };
}

function odaOku(h: unknown): Oda | null {
  if (!h || typeof h !== "object") return null;
  const o = h as Record<string, unknown>;
  const tip = secim(o.tip, ODA_TIPI_LISTESI, "DIGER");
  const varsayilan = yeniOda(tip);
  const yuk = Number(o.radyatorYukseklik);
  return {
    id: metin(o.id, 40) || yeniId(),
    ad: metin(o.ad, 80) || varsayilan.ad,
    tip,
    sicaklik: sayi(o.sicaklik, varsayilan.sicaklik, 5, 30),
    en: sayi(o.en, 4, 0.3, 100),
    boy: sayi(o.boy, 4, 0.3, 100),
    yukseklik: sayi(o.yukseklik, 2.8, 1.8, 15),
    havaDegisim: sayi(o.havaDegisim, varsayilan.havaDegisim, 0, 10),
    isitici: secim(o.isitici, ISITICI_LISTESI, "RADYATOR"),
    elemanlar: Array.isArray(o.elemanlar) ? (o.elemanlar.map(elemanOku).filter(Boolean) as Eleman[]).slice(0, 60) : [],
    radyatorTip: secim(o.radyatorTip, RAD_TIP_LISTESI, "22"),
    radyatorYukseklik: (RADYATOR_YUKSEKLIKLERI as readonly number[]).includes(yuk) ? (yuk as RadyatorYukseklik) : 600,
    radyatorParca: Math.round(sayi(o.radyatorParca, 0, 0, 10)),
    kaplama: secim(o.kaplama, KAPLAMA_LISTESI, varsayilan.kaplama),
    kollektor: Math.round(sayi(o.kollektor, 1, 1, 9)),
    kollektorMesafe: sayi(o.kollektorMesafe, 5, 0, 60),
    haricAlan: sayi(o.haricAlan, 0, 0, 10000),
    aralik: [0, 0.1, 0.15, 0.2, 0.25, 0.3].includes(Number(o.aralik)) ? Number(o.aralik) : 0,
    desen: secim(o.desen, ["SALYANGOZ", "SERPANTIN"] as const, "SALYANGOZ"),
  };
}

export function veriOku(ham: unknown): HesapVerisi {
  let obj: Record<string, unknown> = {};
  if (typeof ham === "string") {
    try {
      const p = JSON.parse(ham);
      if (p && typeof p === "object") obj = p as Record<string, unknown>;
    } catch {
      obj = {};
    }
  } else if (ham && typeof ham === "object") obj = ham as Record<string, unknown>;

  const v = varsayilanVeri();
  const disElle = obj.disSicaklikElle;
  const minAralik = secim(String(obj.yerdenMinAralik ?? ""), ["0.1", "0.15", "0.2"] as const, "0.1");
  const maksAralik = secim(String(obj.yerdenMaksAralik ?? ""), ["0.15", "0.2", "0.25", "0.3"] as const, "0.25");
  return {
    surum: 1,
    il: secim(obj.il, ILLER.map((i) => i.ad), v.il),
    disSicaklikElle: disElle === null || disElle === undefined || disElle === "" ? null : sayi(disElle, -3, -40, 20),
    adres: metin(obj.adres, 300),
    isiKoprusu: sayi(obj.isiKoprusu, v.isiKoprusu, 0, 0.3),
    yonArtirimi: bool(obj.yonArtirimi, v.yonArtirimi),
    isinmaArtirimi: sayi(obj.isinmaArtirimi, 0, 0, 30),
    emniyetPayi: sayi(obj.emniyetPayi, 0, 0, 30),
    radyatorGidis: sayi(obj.radyatorGidis, v.radyatorGidis, 30, 80),
    radyatorDonus: sayi(obj.radyatorDonus, v.radyatorDonus, 25, 75),
    yerdenHedefGidis: sayi(obj.yerdenHedefGidis, v.yerdenHedefGidis, 27, 55),
    yerdenGidisModu: secim(obj.yerdenGidisModu, ["OTOMATIK", "SABIT"] as const, "OTOMATIK"),
    yerdenSigma: sayi(obj.yerdenSigma, v.yerdenSigma, 3, 10),
    yerdenBoru: secim(obj.yerdenBoru, BORU_LISTESI, v.yerdenBoru),
    yerdenMinAralik: Number(minAralik),
    yerdenMaksAralik: Math.max(Number(minAralik), Number(maksAralik)),
    sapUstu: sayi(obj.sapUstu, v.sapUstu, 0.03, 0.08),
    sapLambda: sayi(obj.sapLambda, v.sapLambda, 0.8, 2.0),
    sicakSu: bool(obj.sicakSu, v.sicakSu),
    kisiSayisi: Math.round(sayi(obj.kisiSayisi, v.kisiSayisi, 1, 50)),
    sicakSuSicaklik: sayi(obj.sicakSuSicaklik, v.sicakSuSicaklik, 40, 65),
    isletme: secim(obj.isletme, ["MONOVALENT", "MONOENERJETIK"] as const, v.isletme),
    bivalentNokta: sayi(obj.bivalentNokta, v.bivalentNokta, -25, 5),
    tampon: secim(obj.tampon, ["OTOMATIK", "YOK", "ELLE"] as const, "OTOMATIK"),
    tamponElle: sayi(obj.tamponElle, 100, 0, 5000),
    anaHatUzunluk: sayi(obj.anaHatUzunluk, v.anaHatUzunluk, 0, 300),
    statikYukseklik: sayi(obj.statikYukseklik, v.statikYukseklik, 0, 60),
    modelId: metin(obj.modelId, 40),
    odalar: Array.isArray(obj.odalar) ? (obj.odalar.map(odaOku).filter(Boolean) as Oda[]).slice(0, 80) : [],
  };
}

// ---------------------------------------------------------------------------
// Isı pompası modeli (veritabanındaki IsiPompasiModeli satırının hesapta kullanılan hâli)
// ---------------------------------------------------------------------------
export type PompaModeli = {
  id: string;
  marka: string;
  model: string;
  kapA7W35: number; // kW
  kapAm7W35: number; // kW
  kapAm7W55: number; // kW
  kapAm15W35: number | null; // kW (biliniyorsa)
  minDisSicaklik: number; // °C (çalışma alt sınırı)
  maksCikis: number; // °C
  yedekIsiticiKw: number; // dahili elektrikli ısıtıcı (yoksa 0)
  urunId: string | null;
};

// ---------------------------------------------------------------------------
// Hızlı başlangıç: tipik bir dairenin oda listesi (kullanıcı ölçüleri düzeltir)
// ---------------------------------------------------------------------------
export function ornekDaire(): Oda[] {
  const dd = (yon: Yon, en: number) => yeniEleman("DIS_DUVAR", { yon, en });
  const pn = (yon: Yon, en: number, boy = 1.5, adet = 1) => yeniEleman("PENCERE", { yon, en, boy, adet });
  return [
    yeniOda("OTURMA", { ad: "Salon", en: 6, boy: 4.5, elemanlar: [dd("G", 6), pn("G", 2.4, 2.2), dd("B", 4.5), pn("B", 1.5)] }),
    yeniOda("MUTFAK", { ad: "Mutfak", en: 3.5, boy: 3, elemanlar: [dd("D", 3.5), pn("D", 1.2)] }),
    yeniOda("YATAK", { ad: "Yatak odası", en: 4, boy: 3.5, elemanlar: [dd("K", 4), pn("K", 1.5)] }),
    yeniOda("COCUK", { ad: "Çocuk odası", en: 3.5, boy: 3, elemanlar: [dd("K", 3.5), pn("K", 1.2)] }),
    yeniOda("BANYO", { ad: "Banyo", en: 2.5, boy: 2, haricAlan: 1.2, elemanlar: [dd("K", 2.5), pn("K", 0.6, 0.6)] }),
    yeniOda("HOL", { ad: "Hol", en: 5, boy: 1.4, elemanlar: [] }),
  ];
}
