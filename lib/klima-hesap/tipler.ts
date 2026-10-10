// -----------------------------------------------------------------------------
// KLİMA / VRF HESABI — GİRDİ VERİ MODELİ
// Oda ve yapı elemanları ısı pompası hesabıyla aynı yapıdadır (aynı ekran
// parçaları ve ısı kaybı kodu kullanılır); üzerine soğutma ve cihaz alanları eklenir.
// -----------------------------------------------------------------------------
import { ILLER } from "@/lib/isi-hesap/iklim";
import { veriOku as isiVeriOku, yeniOda, yeniEleman, yeniId, type Oda } from "@/lib/isi-hesap/tipler";
import type { OdaTipi, Yon } from "@/lib/isi-hesap/katalog";
import { GOLGELER, IC_UNITE_TIPLERI, KULLANIMLAR, SISTEM_TIPLERI, AKISKANLAR, type IcUniteTipi, type SistemTipi, type Kullanim, type Akiskan } from "./katalog";

export type KlimaOda = Oda & {
  klima: boolean; // bu oda klimalanıyor mu
  kisi: number;
  aydinlatma: number; // W/m²
  cihaz: number; // W
  sogutmaSicaklik: number; // °C
  golge: string;
  uniteTipi: IcUniteTipi;
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

const VARSAYILAN_KISI: Record<OdaTipi, number> = { OTURMA: 4, YATAK: 2, COCUK: 1, MUTFAK: 2, BANYO: 0, WC: 0, HOL: 0, OFIS: 2, DIGER: 1 };
const VARSAYILAN_CIHAZ: Record<OdaTipi, number> = { OTURMA: 300, YATAK: 100, COCUK: 150, MUTFAK: 800, BANYO: 0, WC: 0, HOL: 0, OFIS: 300, DIGER: 100 };
const KLIMASIZ: OdaTipi[] = ["BANYO", "WC", "HOL"];

export function klimaOdasi(tip: OdaTipi = "OTURMA", ek: Partial<KlimaOda> = {}): KlimaOda {
  const o = yeniOda(tip);
  return {
    ...o,
    isitici: "RADYATOR",
    klima: !KLIMASIZ.includes(tip),
    kisi: VARSAYILAN_KISI[tip],
    aydinlatma: 8,
    cihaz: VARSAYILAN_CIHAZ[tip],
    sogutmaSicaklik: 26,
    golge: "TUL",
    uniteTipi: "DUVAR",
    uniteAdet: 1,
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
    sistemler: [yeniSistem(1, "VRF")],
    odalar: [],
  };
}

export function ornekKlimaDairesi(): KlimaOda[] {
  const dd = (yon: Yon, en: number) => yeniEleman("DIS_DUVAR", { yon, en });
  const pn = (yon: Yon, en: number, boy = 1.5) => yeniEleman("PENCERE", { yon, en, boy });
  return [
    klimaOdasi("OTURMA", { ad: "Salon", en: 6, boy: 4.5, uniteTipi: "KASET", hatMesafe: 3, elemanlar: [dd("G", 6), pn("G", 2.4, 2.2), dd("B", 4.5), pn("B", 1.5)] }),
    klimaOdasi("MUTFAK", { ad: "Mutfak", en: 3.5, boy: 3, hatMesafe: 5, elemanlar: [dd("D", 3.5), pn("D", 1.2)] }),
    klimaOdasi("YATAK", { ad: "Yatak odası", en: 4, boy: 3.5, hatMesafe: 6, elemanlar: [dd("K", 4), pn("K", 1.5)] }),
    klimaOdasi("COCUK", { ad: "Çocuk odası", en: 3.5, boy: 3, hatMesafe: 4, elemanlar: [dd("K", 3.5), pn("K", 1.2)] }),
    klimaOdasi("BANYO", { ad: "Banyo", en: 2.5, boy: 2, elemanlar: [dd("K", 2.5), pn("K", 0.6, 0.6)] }),
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
    const d = klimaOdasi(o.tip);
    return {
      ...o,
      klima: typeof h.klima === "boolean" ? h.klima : d.klima,
      kisi: Math.round(sayi(h.kisi, d.kisi, 0, 500)),
      aydinlatma: sayi(h.aydinlatma, d.aydinlatma, 0, 60),
      cihaz: sayi(h.cihaz, d.cihaz, 0, 100000),
      sogutmaSicaklik: sayi(h.sogutmaSicaklik, 26, 18, 30),
      golge: secim(h.golge, GOLGELER.map((g) => g.anahtar), d.golge),
      uniteTipi: secim(h.uniteTipi, Object.keys(IC_UNITE_TIPLERI) as IcUniteTipi[], "DUVAR"),
      uniteAdet: Math.round(sayi(h.uniteAdet, 1, 1, 20)),
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
    sistemler: tekil.length ? tekil : [yeniSistem(1)],
    odalar,
  };
}

export { yeniId };
