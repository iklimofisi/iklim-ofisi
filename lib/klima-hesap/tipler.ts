// -----------------------------------------------------------------------------
// KLİMA / VRF HESABI — GİRDİ VERİ MODELİ
// Oda ve yapı elemanları ısı pompası hesabıyla aynı yapıdadır (aynı ekran
// parçaları ve ısı kaybı kodu kullanılır); üzerine soğutma ve cihaz alanları eklenir.
// -----------------------------------------------------------------------------
import { ILLER } from "@/lib/isi-hesap/iklim";
import { veriOku as isiVeriOku, yeniOda, yeniEleman, yeniId, type Oda } from "@/lib/isi-hesap/tipler";
import type { OdaTipi, Yon } from "@/lib/isi-hesap/katalog";
import { GOLGELER, IC_UNITE_TIPLERI, KULLANIMLAR, SISTEM_TIPLERI, AKISKANLAR, type IcUniteTipi, type SistemTipi, type Kullanim, type Akiskan } from "./katalog";
import { MEKANLAR, mekanOdaTipinden, TAVAN_TIPLERI, TAZE_HAVA_DUZENLERI, type MekanTipi, type TavanTipi, type TazeHavaDuzeni } from "./mekanlar";

export type UniteSecimi = IcUniteTipi | "OTOMATIK";
export type HrvTipi = "PLAKALI" | "ENTALPI";

export type KlimaOda = Oda & {
  mekan: MekanTipi;
  tavanTipi: TavanTipi;
  tazeHava: TazeHavaDuzeni;
  sessiz: boolean; // gürültüye duyarlı mekân (yatak, toplantı, sınıf…)
  kanalUzunluk: number; // m — kanallı ünitede en uzak menfeze kanal (0 = otomatik)
  filtre: "STANDART" | "F7";
  klima: boolean; // bu oda klimalanıyor mu
  kisi: number;
  aydinlatma: number; // W/m²
  cihaz: number; // W
  sogutmaSicaklik: number; // °C
  golge: string;
  uniteTipi: UniteSecimi; // OTOMATIK = sistem önerir
  uniteAdet: number;
  uniteKw: number; // 0 = otomatik
  sistem: number; // 0 = bağımsız split klima; 1.. = sistem no (VRF / mini VRF / multi)
  hatMesafe: number; // m — bir önceki branşmandan bu odanın branşmanına ana hat parçası
  bransMesafe: number; // m — branşmandan (multi'de dış üniteden) iç üniteye
  kot: number; // m — iç ünitenin bulunduğu kat kotu (zemin = 0)
};

export type Sistem = {
  no: number;
  tip: SistemTipi;
  ad: string;
  anaHat: number; // m — dış üniteden ilk branşmana
  disKot: number; // m — dış ünitenin kotu (çatı ise bina yüksekliği)
  disKwElle: number; // 0 = otomatik seçim
  fabrikaSarj: number | null; // kg — dış ünite fabrika şarjı (biliniyorsa)
  oranMaks: number | null; // % — üretici farklı izin veriyorsa
};

export type KlimaVerisi = {
  surum: 1;
  il: string;
  disSicaklikElle: number | null;
  yazKTElle: number | null;
  yazYTElle: number | null;
  adres: string;
  kullanim: Kullanim;
  isiKoprusu: number;
  yonArtirimi: boolean;
  isinmaArtirimi: number;
  isitmaDa: boolean; // klimalar ısıtmada da kullanılacak
  icNem: number; // % bağıl nem (yaz)
  emniyetPayi: number; // % (iç ünite seçiminde)
  eszamanlilik: number; // % (dış ünite seçiminde odaların toplam yüküne uygulanır)
  akiskan: Akiskan;
  hrvTipi: HrvTipi;
  katYuksekligi: number; // m — kat kotu ↔ kat numarası dönüşümü (döşemeden döşemeye)
  sistemler: Sistem[];
  odalar: KlimaOda[];
};

function sayi(v: unknown, varsayilan: number, min: number, maks: number): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? parseFloat(v.replace(",", ".")) : NaN;
  if (!Number.isFinite(n)) return varsayilan;
  return Math.min(maks, Math.max(min, n));
}
function bosSayi(v: unknown, min: number, maks: number): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = sayi(v, NaN, min, maks);
  return Number.isFinite(n) ? n : null;
}
function secim<T extends string>(v: unknown, izinli: readonly T[], varsayilan: T): T {
  return typeof v === "string" && (izinli as readonly string[]).includes(v) ? (v as T) : varsayilan;
}
const metin = (v: unknown, maks = 200) => (typeof v === "string" ? v.slice(0, maks) : "");

const KONUT_KISI: Partial<Record<MekanTipi, number>> = { KONUT_SALON: 4, KONUT_YATAK: 2, KONUT_COCUK: 1, KONUT_MUTFAK: 2, KONUT_ISLAK: 0, KONUT_HOL: 0 };
const KLIMASIZ: MekanTipi[] = ["KONUT_ISLAK", "KONUT_HOL"];

// Mekân seçildiğinde (ya da alan değiştiğinde) önerilen kişi / cihaz / sıcaklık değerleri
export function mekanVarsayilanlari(mekan: MekanTipi, alan: number) {
  const mk = MEKANLAR[mekan];
  const kisi = KONUT_KISI[mekan] ?? (mk.yogunluk >= 50 ? 0 : Math.max(1, Math.round(alan / mk.yogunluk)));
  return {
    kisi,
    aydinlatma: mk.aydinlatma,
    cihaz: Math.round(mk.ekipman * alan),
    sogutmaSicaklik: mk.yazIc,
    sicaklik: mk.kisIc,
    tazeHava: mk.tazeHava,
    sessiz: mk.sessiz,
    tavanTipi: mk.tavanTipi,
    yukseklik: mk.tavan,
  };
}

export function klimaOdasi(mekan: MekanTipi = "KONUT_SALON", ek: Partial<KlimaOda> = {}): KlimaOda {
  const mk = MEKANLAR[mekan];
  const o = yeniOda(mk.odaTipi);
  const en = ek.en ?? o.en;
  const boy = ek.boy ?? o.boy;
  const d = mekanVarsayilanlari(mekan, en * boy);
  return {
    ...o,
    ad: mk.ad,
    isitici: "RADYATOR",
    mekan,
    tavanTipi: d.tavanTipi,
    tazeHava: d.tazeHava,
    sessiz: d.sessiz,
    kanalUzunluk: 0,
    filtre: "STANDART",
    klima: !KLIMASIZ.includes(mekan),
    kisi: d.kisi,
    aydinlatma: d.aydinlatma,
    cihaz: d.cihaz,
    sogutmaSicaklik: d.sogutmaSicaklik,
    sicaklik: d.sicaklik,
    yukseklik: d.yukseklik,
    golge: "TUL",
    uniteTipi: "OTOMATIK",
    uniteAdet: 0,
    uniteKw: 0,
    sistem: 1,
    hatMesafe: 4,
    bransMesafe: 3,
    kot: 0,
    ...ek,
  };
}

export function yeniSistem(no: number, tip: SistemTipi = "VRF"): Sistem {
  return { no, tip, ad: `Sistem ${no}`, anaHat: 15, disKot: 3, disKwElle: 0, fabrikaSarj: null, oranMaks: null };
}

export function varsayilanKlimaVerisi(il = "İstanbul"): KlimaVerisi {
  return {
    surum: 1,
    il,
    disSicaklikElle: null,
    yazKTElle: null,
    yazYTElle: null,
    adres: "",
    kullanim: "KONUT",
    isiKoprusu: 0.1,
    yonArtirimi: true,
    isinmaArtirimi: 0,
    isitmaDa: true,
    icNem: 50,
    emniyetPayi: 10,
    eszamanlilik: 90,
    akiskan: "R410A",
    hrvTipi: "PLAKALI",
    katYuksekligi: 3,
    sistemler: [yeniSistem(1, "VRF")],
    odalar: [],
  };
}

export function ornekKlimaDairesi(): KlimaOda[] {
  const dd = (yon: Yon, en: number) => yeniEleman("DIS_DUVAR", { yon, en });
  const pn = (yon: Yon, en: number, boy = 1.5) => yeniEleman("PENCERE", { yon, en, boy });
  return [
    klimaOdasi("KONUT_SALON", { ad: "Salon", en: 6, boy: 4.5, hatMesafe: 3, elemanlar: [dd("G", 6), pn("G", 2.4, 2.2), dd("B", 4.5), pn("B", 1.5)] }),
    klimaOdasi("KONUT_MUTFAK", { ad: "Mutfak", en: 3.5, boy: 3, hatMesafe: 5, elemanlar: [dd("D", 3.5), pn("D", 1.2)] }),
    klimaOdasi("KONUT_YATAK", { ad: "Yatak odası", en: 4, boy: 3.5, hatMesafe: 6, elemanlar: [dd("K", 4), pn("K", 1.5)] }),
    klimaOdasi("KONUT_COCUK", { ad: "Çocuk odası", en: 3.5, boy: 3, hatMesafe: 4, elemanlar: [dd("K", 3.5), pn("K", 1.2)] }),
    klimaOdasi("KONUT_ISLAK", { ad: "Banyo", en: 2.5, boy: 2, elemanlar: [dd("K", 2.5), pn("K", 0.6, 0.6)] }),
  ];
}

function sistemOku(h: unknown, i: number): Sistem | null {
  if (!h || typeof h !== "object") return null;
  const s = h as Record<string, unknown>;
  return {
    no: Math.round(sayi(s.no, i + 1, 1, 20)),
    tip: secim(s.tip, Object.keys(SISTEM_TIPLERI) as SistemTipi[], "VRF"),
    ad: metin(s.ad, 60) || `Sistem ${i + 1}`,
    anaHat: sayi(s.anaHat, 15, 0, 500),
    disKot: sayi(s.disKot, 3, -50, 300),
    disKwElle: sayi(s.disKwElle, 0, 0, 500),
    fabrikaSarj: bosSayi(s.fabrikaSarj, 0, 200),
    oranMaks: bosSayi(s.oranMaks, 50, 200),
  };
}

export function klimaVeriOku(ham: unknown): KlimaVerisi {
  let obj: Record<string, unknown> = {};
  if (typeof ham === "string") {
    try {
      const p = JSON.parse(ham);
      if (p && typeof p === "object") obj = p as Record<string, unknown>;
    } catch {
      obj = {};
    }
  } else if (ham && typeof ham === "object") obj = ham as Record<string, unknown>;
  const v = varsayilanKlimaVerisi();

  // Oda ve eleman alanları ısı pompası doğrulamasıyla okunur, klima alanları ayrıca eklenir
  const hamOdalar = (Array.isArray(obj.odalar) ? (obj.odalar as unknown[]) : []).filter((x) => x && typeof x === "object").slice(0, 80);
  const temel = isiVeriOku({ odalar: hamOdalar }).odalar;
  const odalar: KlimaOda[] = temel.map((o, i) => {
    const h = (hamOdalar[i] ?? {}) as Record<string, unknown>;
    // Eski kayıtlarda mekân yoktur: oda tipinden türetilir
    const mekan = secim(h.mekan, Object.keys(MEKANLAR) as MekanTipi[], mekanOdaTipinden(o.tip));
    const d = klimaOdasi(mekan, { en: o.en, boy: o.boy });
    const eskiUnite = h.uniteTipi === "KANALLI" ? "KANALLI" : h.uniteTipi;
    return {
      ...o,
      mekan,
      tavanTipi: secim(h.tavanTipi, Object.keys(TAVAN_TIPLERI) as TavanTipi[], d.tavanTipi),
      tazeHava: secim(h.tazeHava, Object.keys(TAZE_HAVA_DUZENLERI) as TazeHavaDuzeni[], d.tazeHava),
      sessiz: typeof h.sessiz === "boolean" ? h.sessiz : d.sessiz,
      kanalUzunluk: sayi(h.kanalUzunluk, 0, 0, 200),
      filtre: secim(h.filtre, ["STANDART", "F7"] as const, "STANDART"),
      klima: typeof h.klima === "boolean" ? h.klima : d.klima,
      kisi: Math.round(sayi(h.kisi, d.kisi, 0, 500)),
      aydinlatma: sayi(h.aydinlatma, d.aydinlatma, 0, 60),
      cihaz: sayi(h.cihaz, d.cihaz, 0, 100000),
      sogutmaSicaklik: sayi(h.sogutmaSicaklik, 26, 18, 30),
      golge: secim(h.golge, GOLGELER.map((g) => g.anahtar), d.golge),
      // Eski kayıtlarda tip elle seçilmişti; mekân alanı olmayan kayıtta seçim korunur
      uniteTipi: secim(eskiUnite, ["OTOMATIK", ...(Object.keys(IC_UNITE_TIPLERI) as IcUniteTipi[])] as UniteSecimi[], "OTOMATIK"),
      uniteAdet: Math.round(sayi(h.uniteAdet, 0, 0, 30)),
      uniteKw: sayi(h.uniteKw, 0, 0, 30),
      sistem: Math.round(sayi(h.sistem, 1, 0, 20)),
      hatMesafe: sayi(h.hatMesafe, 4, 0, 300),
      bransMesafe: sayi(h.bransMesafe, 3, 0, 100),
      kot: sayi(h.kot, 0, -50, 300),
    };
  });
  const sistemler = Array.isArray(obj.sistemler) ? ((obj.sistemler as unknown[]).slice(0, 20).map(sistemOku).filter(Boolean) as Sistem[]) : v.sistemler;
  // Sistem numaraları tekil olsun
  const goruldu = new Set<number>();
  const tekil = sistemler.filter((s) => (goruldu.has(s.no) ? false : (goruldu.add(s.no), true)));
  return {
    surum: 1,
    il: secim(obj.il, ILLER.map((i) => i.ad), v.il),
    disSicaklikElle: bosSayi(obj.disSicaklikElle, -40, 20),
    yazKTElle: bosSayi(obj.yazKTElle, 20, 50),
    yazYTElle: bosSayi(obj.yazYTElle, 10, 35),
    adres: metin(obj.adres, 300),
    kullanim: secim(obj.kullanim, Object.keys(KULLANIMLAR) as Kullanim[], "KONUT"),
    isiKoprusu: sayi(obj.isiKoprusu, v.isiKoprusu, 0, 0.3),
    yonArtirimi: typeof obj.yonArtirimi === "boolean" ? obj.yonArtirimi : true,
    isinmaArtirimi: sayi(obj.isinmaArtirimi, 0, 0, 30),
    isitmaDa: typeof obj.isitmaDa === "boolean" ? obj.isitmaDa : true,
    icNem: sayi(obj.icNem, 50, 30, 70),
    emniyetPayi: sayi(obj.emniyetPayi, 10, 0, 40),
    eszamanlilik: sayi(obj.eszamanlilik, 90, 50, 100),
    akiskan: secim(obj.akiskan, Object.keys(AKISKANLAR) as Akiskan[], "R410A"),
    hrvTipi: secim(obj.hrvTipi, ["PLAKALI", "ENTALPI"] as const, "PLAKALI"),
    katYuksekligi: sayi(obj.katYuksekligi, 3, 2.4, 8),
    sistemler: tekil.length ? tekil : [yeniSistem(1)],
    odalar,
  };
}

export { yeniId };
