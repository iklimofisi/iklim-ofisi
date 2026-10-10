// -----------------------------------------------------------------------------
// KLİMA / VRF HESABI — TABLO DEĞERLERİ
// Markadan bağımsız, sektörde yaygın kullanılan tipik değerlerdir. Üretici
// tablosu farklıysa proje ekranında değiştirilebilir (mesafe sınırları, oran
// aralığı) ya da sonuç üretici yazılımıyla kontrol edilmelidir.
// -----------------------------------------------------------------------------
import type { Yon } from "@/lib/isi-hesap/katalog";

// --- Güneş ışınımı --------------------------------------------------------------
// Camdan en yüksek güneş ısı kazancı (W/m², ~40° K enlem, Temmuz; ASHRAE SHGF)
export const GUNES_SHGF: Record<Yon, number> = {
  K: 126,
  KD: 470,
  D: 685,
  GD: 490,
  G: 344,
  GB: 490,
  B: 685,
  KB: 470,
};
// Isı depolama etkisi (soğutma yükü faktörü, orta ağırlıkta yapı)
export const GUNES_CLF = 0.82;

// Cam gölgeleme katsayısı SC (tek açık cam = 1)
export const GOLGELER: { anahtar: string; ad: string; sc: number }[] = [
  { anahtar: "YOK", ad: "Gölgeleme yok", sc: 1.0 },
  { anahtar: "TUL", ad: "İç tül / açık renk perde", sc: 0.75 },
  { anahtar: "STOR", ad: "İç stor / jaluzi (açık renk)", sc: 0.6 },
  { anahtar: "DIS_PANJUR", ad: "Dış panjur / güneş kırıcı", sc: 0.25 },
  { anahtar: "SACAK", ad: "Saçak / balkon altı (kısmi gölge)", sc: 0.55 },
];
// Cam tipine göre güneş geçirgenlik çarpanı (tek açık cama göre)
export const CAM_GUNES: Record<string, number> = {
  TEK_CAM: 1.0,
  CIFT_ESKI: 0.88,
  ALU_CIFT: 0.88,
  ALU_YALITIMLI: 0.6,
  LOWE: 0.6,
  LOWE_ARGON: 0.55,
  UCLU: 0.5,
  KAPI_AHSAP: 0,
  KAPI_YALITIMLI: 0,
};

// Opak elemanlarda güneşin etkisi: eşdeğer sıcaklık farkına eklenen değer (K)
export const DUVAR_GUNES_EKI: Record<Yon, number> = { K: 0, KD: 3, D: 6, GD: 5, G: 4, GB: 6, B: 7, KB: 3 };
export const CATI_GUNES_EKI = 14;

// --- İç kazançlar -------------------------------------------------------------
export const KULLANIMLAR = {
  KONUT: { ad: "Konut", kisiDuyulur: 70, kisiGizli: 45, aydinlatma: 8 },
  OFIS: { ad: "Ofis / ticari", kisiDuyulur: 75, kisiGizli: 55, aydinlatma: 12 },
  MAGAZA: { ad: "Mağaza / restoran", kisiDuyulur: 80, kisiGizli: 70, aydinlatma: 15 },
} as const;
export type Kullanim = keyof typeof KULLANIMLAR;

// --- İç ünite tipleri ve standart kapasiteleri (kW, soğutma, nominal) --------
// VRF iç ünite kademeleri (P15 … P140 karşılığı); split / multi BTU kademeleri
export const IC_UNITE_TIPLERI = {
  DUVAR: { ad: "Duvar tipi", h0: 1.8, vrf: [1.7, 2.2, 2.8, 3.6, 4.5, 5.6, 7.1], split: [2.6, 3.5, 5.3, 7.0] },
  KASET: { ad: "Kaset tipi (4 yön)", h0: 2.2, vrf: [2.8, 3.6, 4.5, 5.6, 7.1, 8.0, 9.0, 11.2, 14.0], split: [3.5, 5.3, 7.0, 10.0, 14.0] },
  KASET_KUCUK: { ad: "Kaset tipi (60×60)", h0: 2.2, vrf: [1.7, 2.2, 2.8, 3.6, 4.5, 5.6], split: [2.6, 3.5, 5.3] },
  KANALLI: { ad: "Gizli tavan kanallı", h0: 2.2, vrf: [1.7, 2.2, 2.8, 3.6, 4.5, 5.6, 7.1, 8.0, 9.0, 11.2, 14.0], split: [2.6, 3.5, 5.3, 7.0, 10.0, 14.0] },
  TAVAN: { ad: "Tavan askılı", h0: 2.2, vrf: [3.6, 4.5, 5.6, 7.1, 9.0, 11.2, 14.0], split: [5.3, 7.0, 10.0, 14.0] },
  KONSOL: { ad: "Döşeme / konsol tipi", h0: 0.6, vrf: [2.2, 2.8, 3.6, 4.5, 5.6, 7.1], split: [2.6, 3.5, 5.3] },
  SALON: { ad: "Salon tipi (dikili)", h0: 0.6, vrf: [], split: [7.0, 10.0, 14.0] },
} as const;
export type IcUniteTipi = keyof typeof IC_UNITE_TIPLERI;

// Split klima BTU karşılıkları (gösterim)
export const BTU: [number, string][] = [
  [2.6, "9.000 BTU"],
  [3.5, "12.000 BTU"],
  [5.3, "18.000 BTU"],
  [7.0, "24.000 BTU"],
  [10.0, "36.000 BTU"],
  [14.0, "48.000 BTU"],
];
export function btuAdi(kw: number) {
  return BTU.find(([k]) => Math.abs(k - kw) < 0.05)?.[1] ?? `${kw.toLocaleString("tr-TR")} kW`;
}

// Nominal ısıtma / soğutma oranı (iç ünite)
export const ISITMA_ORANI = 1.12;

// --- Dış ünite kademeleri (kW soğutma) --------------------------------------
export const SISTEM_TIPLERI = {
  VRF: {
    ad: "VRF (modüler)",
    dis: [22.4, 28, 33.5, 40, 45, 50, 56, 61.5, 68, 73, 78.5, 85, 90, 96, 101, 106.5, 112, 118, 124, 130, 135, 140, 145, 150, 156, 162, 168],
    oranMin: 50,
    oranMaks: 130,
    maksIcUnite: 64,
    toplamBoru: 300,
    enUzak: 165,
    ilkBransmandanSonra: 40,
    kotDisUstte: 50,
    kotDisAltta: 40,
    kotIcIc: 15,
  },
  MINI_VRF: {
    ad: "Mini VRF",
    dis: [8, 10, 12, 14, 16, 18],
    oranMin: 50,
    oranMaks: 130,
    maksIcUnite: 12,
    toplamBoru: 150,
    enUzak: 70,
    ilkBransmandanSonra: 30,
    kotDisUstte: 30,
    kotDisAltta: 20,
    kotIcIc: 12,
  },
  MULTI: {
    ad: "Multi split",
    dis: [4.1, 5.3, 6.8, 8.0, 10.2],
    oranMin: 60,
    oranMaks: 150,
    maksIcUnite: 5,
    toplamBoru: 70,
    enUzak: 25,
    ilkBransmandanSonra: 25,
    kotDisUstte: 15,
    kotDisAltta: 15,
    kotIcIc: 10,
  },
} as const;
export type SistemTipi = keyof typeof SISTEM_TIPLERI;
// Multi split dış ünitelerinin en çok bağlanabilen oda sayısı (kademe sırasıyla)
export const MULTI_ODA_SAYISI = [2, 3, 4, 4, 5];

// --- Kapasite düzeltmeleri (tipik eğriler) -----------------------------------
// Soğutma: 35 °C dış sıcaklığın üstünde her 1 K için ~%1,1 düşüş
export function sogutmaDisDuzeltme(kt: number) {
  return kt <= 35 ? 1 : Math.max(0.75, 1 - 0.011 * (kt - 35));
}
// Isıtma: dış sıcaklığa göre (defrost dahil tipik inverter eğrisi)
const ISITMA_EGRISI: [number, number][] = [
  [-25, 0.5],
  [-20, 0.58],
  [-15, 0.67],
  [-10, 0.75],
  [-7, 0.8],
  [-5, 0.84],
  [0, 0.88],
  [2, 0.9],
  [7, 1.0],
];
export function isitmaDisDuzeltme(t: number) {
  const e = ISITMA_EGRISI;
  if (t <= e[0][0]) return e[0][1];
  for (let i = 1; i < e.length; i++) if (t <= e[i][0]) return e[i - 1][1] + ((e[i][1] - e[i - 1][1]) * (t - e[i - 1][0])) / (e[i][0] - e[i - 1][0]);
  return 1;
}
// Boru uzunluğu düzeltmesi (eşdeğer uzunluk Leq, m)
export function boruDuzeltme(leq: number) {
  return {
    sogutma: Math.max(0.7, 1 - 0.0021 * Math.max(0, leq - 7.5)),
    isitma: Math.max(0.85, 1 - 0.0008 * Math.max(0, leq - 7.5)),
  };
}

// --- Soğutucu akışkan boruları ---------------------------------------------
// Bakır boru dış çapları (mm) ve inç karşılıkları
export const BORULAR: { cap: number; inc: string }[] = [
  { cap: 6.35, inc: '1/4"' },
  { cap: 9.52, inc: '3/8"' },
  { cap: 12.7, inc: '1/2"' },
  { cap: 15.88, inc: '5/8"' },
  { cap: 19.05, inc: '3/4"' },
  { cap: 22.2, inc: '7/8"' },
  { cap: 25.4, inc: '1"' },
  { cap: 28.58, inc: '1 1/8"' },
  { cap: 34.92, inc: '1 3/8"' },
  { cap: 41.28, inc: '1 5/8"' },
  { cap: 44.45, inc: '1 3/4"' },
];
export const borAdi = (cap: number) => {
  const b = BORULAR.find((x) => Math.abs(x.cap - cap) < 0.01);
  return `Ø${cap.toLocaleString("tr-TR")}${b ? ` (${b.inc})` : ""}`;
};

// VRF ana hat / branşmanlar arası hat: arkasındaki toplam iç ünite kapasitesine göre (gaz / sıvı)
export const VRF_HAT_CAPLARI: { maksKw: number; gaz: number; sivi: number }[] = [
  { maksKw: 16, gaz: 15.88, sivi: 9.52 },
  { maksKw: 25, gaz: 19.05, sivi: 9.52 },
  { maksKw: 35, gaz: 22.2, sivi: 9.52 },
  { maksKw: 50, gaz: 28.58, sivi: 12.7 },
  { maksKw: 68, gaz: 28.58, sivi: 15.88 },
  { maksKw: 100, gaz: 34.92, sivi: 15.88 },
  { maksKw: 130, gaz: 41.28, sivi: 19.05 },
  { maksKw: 1e9, gaz: 41.28, sivi: 22.2 },
];
// İç ünite bağlantı boruları (iç ünite kapasitesine göre)
export const IC_UNITE_CAPLARI: { maksKw: number; gaz: number; sivi: number }[] = [
  { maksKw: 2.9, gaz: 9.52, sivi: 6.35 },
  { maksKw: 5.6, gaz: 12.7, sivi: 6.35 },
  { maksKw: 16, gaz: 15.88, sivi: 9.52 },
  { maksKw: 1e9, gaz: 19.05, sivi: 9.52 },
];
// Split / multi split bağlantıları
export const SPLIT_CAPLARI: { maksKw: number; gaz: number; sivi: number }[] = [
  { maksKw: 3.6, gaz: 9.52, sivi: 6.35 },
  { maksKw: 5.3, gaz: 12.7, sivi: 6.35 },
  { maksKw: 7.1, gaz: 15.88, sivi: 9.52 },
  { maksKw: 1e9, gaz: 15.88, sivi: 9.52 },
];
export function capSec(tablo: { maksKw: number; gaz: number; sivi: number }[], kw: number) {
  return tablo.find((t) => kw <= t.maksKw + 1e-9) ?? tablo[tablo.length - 1];
}

// Branşman (Y) kiti kademeleri — arkasındaki toplam kapasiteye göre
export const BRANSMAN_KADEMELERI: { maksKw: number; ad: string }[] = [
  { maksKw: 22.4, ad: "Y branşman kiti (≤ 22,4 kW)" },
  { maksKw: 33, ad: "Y branşman kiti (22,4–33 kW)" },
  { maksKw: 72, ad: "Y branşman kiti (33–72 kW)" },
  { maksKw: 1e9, ad: "Y branşman kiti (> 72 kW)" },
];

// Sıvı hattında boru metresi başına ek soğutucu akışkan (kg/m)
export const EK_GAZ_R410A: Record<string, number> = {
  "6.35": 0.024,
  "9.52": 0.06,
  "12.7": 0.12,
  "15.88": 0.2,
  "19.05": 0.29,
  "22.2": 0.38,
  "25.4": 0.52,
  "28.58": 0.68,
};
export const AKISKANLAR = {
  R410A: { ad: "R410A", gazOrani: 1, pl: 0.44, lfl: null as number | null },
  R32: { ad: "R32", gazOrani: 0.9, pl: null as number | null, lfl: 0.307 },
} as const;
export type Akiskan = keyof typeof AKISKANLAR;
// Fabrika şarjı bilinmiyorsa tahmini (kg / kW dış ünite)
export const FABRIKA_SARJ_KG_KW = 0.25;
