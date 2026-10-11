// -----------------------------------------------------------------------------
// HAVALANDIRMA HESABI — GİRDİ VERİ MODELİ
// Hesabın tüm girdileri tek bir JSON olarak saklanır (HavalandirmaHesap.veri).
// veriOku() her alanı doğrular; bozuk / eksik veri gelirse varsayılan değer koyar,
// böylece eski kayıtlar ileride alan eklense de açılmaya devam eder.
// -----------------------------------------------------------------------------
import { ILLER } from "@/lib/isi-hesap/iklim";
import { yeniId } from "@/lib/isi-hesap/tipler";
import {
  MAHAL_TIPLERI,
  SANTRAL_TIPLERI,
  DAVLUMBAZ_TIPLERI,
  PISIRME_YUKLERI,
  EN_KATEGORI,
  KIRLILIK,
  type MahalTipi,
  type SantralTipi,
  type DavlumbazTipi,
  type PisirmeYuku,
  type Kategori,
  type Kirlilik,
  type Akustik,
} from "./katalog";

export type KanalSekli = "DAIRESEL" | "DIKDORTGEN";
export type OtoparkSistemi = "JETFAN" | "KANALLI";

export type Santral = {
  no: number;
  ad: string;
  tip: SantralTipi;
  verimElle: number | null; // % (boş = tip varsayılanı)
  anaHat: number; // m — santralden ilk branşmana (besleme ve egzoz için)
  kanalSekli: KanalSekli;
  akustik: Akustik | "OTO";
  isitici: boolean;
  sogutucu: boolean;
  beslemeKis: number; // °C — kışın besleme havası (nötr havalandırma ≈ 20–22)
  beslemeYaz: number; // °C — yazın besleme havası (nötr ≈ 18–20, iklimlendirme ≈ 14–16)
  regulator: boolean; // mahal branşmanlarında CAV / VAV debi regülatörü
  yanginDamperi: number; // her hatta kritik yol üzerindeki yangın damperi adedi
  otoparkSistemi: OtoparkSistemi;
  kanalYukseklik: number | null; // mm — bu santralin dikdörtgen kanallarında en çok yükseklik (boş = proje)
};

export type Mahal = {
  id: string;
  ad: string;
  tip: MahalTipi;
  santral: number; // besleme santrali (0 = doğal / yok)
  egzozSantral: number | null; // null = besleme santraliyle aynı
  en: number;
  boy: number;
  yukseklik: number;
  kisi: number; // 0 = mahal tipinin yoğunluğundan
  armatur: number; // WC: klozet + pisuvar · duş: duş başlığı · otel banyosu: 1
  davlumbazTip: DavlumbazTipi;
  pisirmeYuku: PisirmeYuku;
  davlumbazM: number; // m
  isiKw: number; // teknik mahal ısı yükü (kW)
  tMaks: number; // teknik mahal en yüksek iç sıcaklık
  kazanKw: number; // kazan dairesi toplam brülör gücü
  ach: number | null; // HAVA_DEGISIMI (boş = tip varsayılanı)
  besElle: number | null; // m³/h — elle besleme (boş = hesap)
  egzElle: number | null; // m³/h — elle egzoz
  bolge: string; // otomatik sistemde aynı bölge = aynı cihaz (ör. "Daire 1", "Zemin kat"); boş = tek bölge
  hatMesafe: number; // m — bir önceki branşmandan bu mahalin branşmanına ana kanal
  bransMesafe: number; // m — branşmandan mahale
};

export type HavalandirmaVerisi = {
  surum: 1;
  il: string;
  disSicaklikElle: number | null;
  yazKTElle: number | null;
  yazYTElle: number | null;
  adres: string;
  yontem: "EN16798" | "ASHRAE";
  kategori: Kategori;
  kirlilik: Kirlilik;
  ez: number; // ASHRAE 62.1 hava dağıtım etkinliği (1,0 tavandan soğuk hava; 0,8 tavandan sıcak hava)
  icKis: number; // °C (egzoz havası kış)
  icYaz: number; // °C (egzoz havası yaz)
  icNem: number; // % (yaz)
  isitmaRejimi: [number, number]; // °C gidiş / dönüş
  sogutmaRejimi: [number, number];
  kanalYukseklikMaks: number; // mm — dikdörtgen kanalda en çok yükseklik (asma tavan boşluğu)
  otoSistem: boolean; // true: santral / fan seçimi ve mahal bağlantıları program tarafından yapılır
  santraller: Santral[];
  mahaller: Mahal[];
};

// ---------------------------------------------------------------------------
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
function metin(v: unknown, maks = 200): string {
  return typeof v === "string" ? v.slice(0, maks) : "";
}
function bool(v: unknown, varsayilan: boolean): boolean {
  return typeof v === "boolean" ? v : varsayilan;
}

const MAHAL_TIP_LISTESI = Object.keys(MAHAL_TIPLERI) as MahalTipi[];
const SANTRAL_TIP_LISTESI = Object.keys(SANTRAL_TIPLERI) as SantralTipi[];

export function yeniSantral(no: number, tip: SantralTipi = "AHU_PLAKA"): Santral {
  const konut = tip === "KONUT_HRV";
  const kompakt = konut || tip === "TICARI_HRV";
  return {
    no,
    ad: `Santral ${no}`,
    tip,
    verimElle: null,
    anaHat: konut ? 3 : kompakt ? 4 : 8,
    kanalSekli: kompakt || tip === "EGZOZ" ? "DAIRESEL" : "DIKDORTGEN",
    akustik: "OTO",
    isitici: tip !== "EGZOZ" && tip !== "OTOPARK",
    sogutucu: tip === "AHU_PLAKA" || tip === "AHU_ROTOR" || tip === "AHU_ARA",
    beslemeKis: konut ? 18 : tip === "MUTFAK" ? 16 : 20,
    beslemeYaz: 18,
    regulator: false,
    yanginDamperi: konut ? 0 : 1,
    otoparkSistemi: "JETFAN",
    kanalYukseklik: tip === "OTOPARK" ? 800 : null,
  };
}

export function yeniMahal(tip: MahalTipi = "OFIS_ACIK", ek: Partial<Mahal> = {}): Mahal {
  const t = MAHAL_TIPLERI[tip] as (typeof MAHAL_TIPLERI)[MahalTipi] & { isiKw?: number; tMaks?: number };
  const konut = t.grup === "Konut";
  const teknik = t.yontem === "TEKNIK_ISI" || t.yontem === "KAZAN" || t.yontem === "OTOPARK";
  return {
    id: yeniId(),
    ad: t.ad,
    tip,
    santral: 1,
    egzozSantral: null,
    en: tip === "OTOPARK" ? 40 : konut ? 4 : tip === "WC_OZEL" ? 1.5 : t.yontem === "ARMATUR" ? 3 : 6,
    boy: tip === "OTOPARK" ? 30 : konut ? 3.5 : tip === "WC_OZEL" ? 1.5 : t.yontem === "ARMATUR" ? 2.5 : 5,
    yukseklik: tip === "OTOPARK" ? 3 : konut ? 2.7 : teknik ? 3.5 : 2.8,
    kisi: 0,
    armatur: tip === "WC_GENEL" ? 3 : tip === "DUS_SOYUNMA" ? 2 : 1,
    davlumbazTip: "DUVAR",
    pisirmeYuku: "ORTA",
    davlumbazM: 3,
    isiKw: t.isiKw ?? 2,
    tMaks: t.tMaks ?? 35,
    kazanKw: 150,
    ach: null,
    besElle: null,
    egzElle: null,
    bolge: "",
    hatMesafe: 4,
    bransMesafe: 3,
    ...ek,
  };
}

export function varsayilanVeri(il = "İstanbul"): HavalandirmaVerisi {
  return {
    surum: 1,
    il,
    disSicaklikElle: null,
    yazKTElle: null,
    yazYTElle: null,
    adres: "",
    yontem: "EN16798",
    kategori: "II",
    kirlilik: "DUSUK",
    ez: 1,
    icKis: 22,
    icYaz: 26,
    icNem: 50,
    isitmaRejimi: [45, 40],
    sogutmaRejimi: [7, 12],
    kanalYukseklikMaks: 400,
    otoSistem: true,
    santraller: [],
    mahaller: [],
  };
}

// Hızlı başlangıç: tipik bir ofis katı
export function ornekOfis(): Mahal[] {
  return [
    yeniMahal("OFIS_ACIK", { ad: "Açık ofis", en: 15, boy: 10, hatMesafe: 4 }),
    yeniMahal("OFIS_OZEL", { ad: "Yönetici odası 1", en: 5, boy: 4 }),
    yeniMahal("OFIS_OZEL", { ad: "Yönetici odası 2", en: 5, boy: 4 }),
    yeniMahal("TOPLANTI", { ad: "Toplantı odası", en: 6, boy: 5 }),
    yeniMahal("RESEPSIYON", { ad: "Resepsiyon", en: 6, boy: 4 }),
    yeniMahal("FOTOKOPI", { ad: "Fotokopi", en: 3, boy: 2.5 }),
    yeniMahal("WC_GENEL", { ad: "WC (bay)", en: 4, boy: 3, armatur: 4 }),
    yeniMahal("WC_GENEL", { ad: "WC (bayan)", en: 4, boy: 3, armatur: 3 }),
  ];
}

// Hızlı başlangıç: 3+1 daire (konut HRV)
export function ornekDaire(): Mahal[] {
  return [
    yeniMahal("KONUT_SALON", { ad: "Salon", en: 6, boy: 4.5, hatMesafe: 2 }),
    yeniMahal("KONUT_YATAK", { ad: "Yatak odası", en: 4, boy: 3.5 }),
    yeniMahal("KONUT_COCUK", { ad: "Çocuk odası 1", en: 3.5, boy: 3 }),
    yeniMahal("KONUT_COCUK", { ad: "Çocuk odası 2", en: 3.5, boy: 3 }),
    yeniMahal("KONUT_MUTFAK", { ad: "Mutfak", en: 3.5, boy: 3 }),
    yeniMahal("KONUT_BANYO", { ad: "Banyo", en: 2.5, boy: 2 }),
    yeniMahal("KONUT_WC", { ad: "WC", en: 1.5, boy: 1.2 }),
  ];
}

function santralOku(h: unknown): Santral | null {
  if (!h || typeof h !== "object") return null;
  const s = h as Record<string, unknown>;
  const tip = secim(s.tip, SANTRAL_TIP_LISTESI, "AHU_PLAKA");
  const d = yeniSantral(Math.round(sayi(s.no, 1, 1, 50)), tip);
  return {
    no: d.no,
    ad: metin(s.ad, 60) || d.ad,
    tip,
    verimElle: bosSayi(s.verimElle, 0, 95),
    anaHat: sayi(s.anaHat, d.anaHat, 0, 500),
    kanalSekli: secim(s.kanalSekli, ["DAIRESEL", "DIKDORTGEN"] as const, d.kanalSekli),
    akustik: secim(s.akustik, ["OTO", "SESSIZ", "STANDART", "ENDUSTRIYEL"] as const, "OTO"),
    isitici: bool(s.isitici, d.isitici),
    sogutucu: bool(s.sogutucu, d.sogutucu),
    beslemeKis: sayi(s.beslemeKis, d.beslemeKis, 10, 45),
    beslemeYaz: sayi(s.beslemeYaz, d.beslemeYaz, 12, 26),
    regulator: bool(s.regulator, false),
    yanginDamperi: Math.round(sayi(s.yanginDamperi, d.yanginDamperi, 0, 10)),
    otoparkSistemi: secim(s.otoparkSistemi, ["JETFAN", "KANALLI"] as const, "JETFAN"),
    kanalYukseklik: (() => {
      const x = bosSayi(s.kanalYukseklik, 150, 2000);
      return x === null ? (s.kanalYukseklik === undefined ? d.kanalYukseklik : null) : Math.round(x / 50) * 50;
    })(),
  };
}

function mahalOku(h: unknown): Mahal | null {
  if (!h || typeof h !== "object") return null;
  const o = h as Record<string, unknown>;
  const tip = secim(o.tip, MAHAL_TIP_LISTESI, "DIGER");
  const d = yeniMahal(tip);
  const es = o.egzozSantral;
  return {
    id: metin(o.id, 40) || yeniId(),
    ad: metin(o.ad, 80) || d.ad,
    tip,
    santral: Math.round(sayi(o.santral, 1, 0, 50)),
    egzozSantral: es === null || es === undefined || es === "" ? null : Math.round(sayi(es, 0, 0, 50)),
    en: sayi(o.en, d.en, 0.3, 500),
    boy: sayi(o.boy, d.boy, 0.3, 500),
    yukseklik: sayi(o.yukseklik, d.yukseklik, 1.8, 30),
    kisi: Math.round(sayi(o.kisi, 0, 0, 10000)),
    armatur: Math.round(sayi(o.armatur, d.armatur, 0, 200)),
    davlumbazTip: secim(o.davlumbazTip, Object.keys(DAVLUMBAZ_TIPLERI) as DavlumbazTipi[], "DUVAR"),
    pisirmeYuku: secim(o.pisirmeYuku, Object.keys(PISIRME_YUKLERI) as PisirmeYuku[], "ORTA"),
    davlumbazM: sayi(o.davlumbazM, d.davlumbazM, 0, 100),
    isiKw: sayi(o.isiKw, d.isiKw, 0, 5000),
    tMaks: sayi(o.tMaks, d.tMaks, 20, 60),
    kazanKw: sayi(o.kazanKw, d.kazanKw, 0, 50000),
    ach: bosSayi(o.ach, 0, 60),
    besElle: bosSayi(o.besElle, 0, 1000000),
    egzElle: bosSayi(o.egzElle, 0, 1000000),
    bolge: metin(o.bolge, 40).trim(),
    hatMesafe: sayi(o.hatMesafe, 4, 0, 500),
    bransMesafe: sayi(o.bransMesafe, 3, 0, 200),
  };
}

export function veriOku(ham: unknown): HavalandirmaVerisi {
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
  const rejim = (x: unknown, d: [number, number], min: number, maks: number): [number, number] =>
    Array.isArray(x) && x.length === 2 ? [sayi(x[0], d[0], min, maks), sayi(x[1], d[1], min, maks)] : d;
  // Aynı numaralı ikinci santral alınmaz
  const gorulen = new Set<number>();
  const santraller = (Array.isArray(obj.santraller) ? (obj.santraller as unknown[]) : v.santraller)
    .slice(0, 30)
    .map(santralOku)
    .filter((s): s is Santral => !!s && !gorulen.has(s.no) && (gorulen.add(s.no), true));
  return {
    surum: 1,
    il: secim(obj.il, ILLER.map((i) => i.ad), v.il),
    disSicaklikElle: bosSayi(obj.disSicaklikElle, -40, 20),
    yazKTElle: bosSayi(obj.yazKTElle, 20, 50),
    yazYTElle: bosSayi(obj.yazYTElle, 10, 35),
    adres: metin(obj.adres, 300),
    yontem: secim(obj.yontem, ["EN16798", "ASHRAE"] as const, "EN16798"),
    kategori: secim(obj.kategori, Object.keys(EN_KATEGORI) as Kategori[], "II"),
    kirlilik: secim(obj.kirlilik, Object.keys(KIRLILIK) as Kirlilik[], "DUSUK"),
    ez: sayi(obj.ez, 1, 0.5, 1.2),
    icKis: sayi(obj.icKis, 22, 10, 30),
    icYaz: sayi(obj.icYaz, 26, 18, 32),
    icNem: sayi(obj.icNem, 50, 30, 70),
    isitmaRejimi: rejim(obj.isitmaRejimi, [45, 40], 20, 95),
    sogutmaRejimi: rejim(obj.sogutmaRejimi, [7, 12], 2, 25),
    kanalYukseklikMaks: Math.round(sayi(obj.kanalYukseklikMaks, 400, 150, 1500) / 50) * 50,
    // Eski kayıtlarda alan yok: elle kurulmuş santralleri korumak için (santral listesi varsa) otomatik kapalı açılır
    otoSistem: bool(obj.otoSistem, !Array.isArray(obj.santraller)),
    santraller,
    mahaller: Array.isArray(obj.mahaller) ? ((obj.mahaller as unknown[]).map(mahalOku).filter(Boolean) as Mahal[]).slice(0, 150) : [],
  };
}

// Klima hesabındaki mekân tiplerinin havalandırma mahal karşılığı
export function mekandanMahal(mekan: string): MahalTipi {
  const es: Record<string, MahalTipi> = {
    KONUT_ISLAK: "KONUT_BANYO",
    KONUT_HOL: "KONUT_HOL",
    MUTFAK_TICARI: "MUTFAK_TICARI",
    OTEL_LOBI: "LOBI",
    SUNUCU: "ELEKTRIK_ODASI",
  };
  if (es[mekan]) return es[mekan];
  return (MAHAL_TIP_LISTESI as string[]).includes(mekan) ? (mekan as MahalTipi) : "DIGER";
}
