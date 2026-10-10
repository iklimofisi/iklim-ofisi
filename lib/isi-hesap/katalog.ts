// -----------------------------------------------------------------------------
// ISI POMPASI HESABI — SABİT KATALOG VE TABLO DEĞERLERİ
// Buradaki her değerin kaynağı yanında yazılıdır. Değerler proje ekranında
// oda/eleman bazında elle değiştirilebilir; burası yalnızca başlangıç değeridir.
// -----------------------------------------------------------------------------

// ODA TİPLERİ — iç tasarım sıcaklığı (TS 2164 / EN 12831 ulusal ek) ve
// en az hava değişimi n_min (1/h, EN 12831 Tablo: yaşam mahalli 0,5; mutfak/banyo 1,5)
export const ODA_TIPLERI = {
  OTURMA: { ad: "Salon / Oturma", sicaklik: 20, havaDegisim: 0.5, banyo: false },
  YATAK: { ad: "Yatak odası", sicaklik: 20, havaDegisim: 0.5, banyo: false },
  COCUK: { ad: "Çocuk odası", sicaklik: 20, havaDegisim: 0.5, banyo: false },
  MUTFAK: { ad: "Mutfak", sicaklik: 20, havaDegisim: 1.5, banyo: false },
  BANYO: { ad: "Banyo", sicaklik: 24, havaDegisim: 1.5, banyo: true },
  WC: { ad: "WC", sicaklik: 20, havaDegisim: 1.5, banyo: false },
  HOL: { ad: "Hol / Koridor", sicaklik: 18, havaDegisim: 0.5, banyo: false },
  OFIS: { ad: "Ofis / Çalışma", sicaklik: 20, havaDegisim: 0.5, banyo: false },
  DIGER: { ad: "Diğer", sicaklik: 20, havaDegisim: 0.5, banyo: false },
} as const;
export type OdaTipi = keyof typeof ODA_TIPLERI;

// YAPI ELEMANI TÜRLERİ
//  DIS: dış havaya komşu (b = 1)        TOPRAK: toprağa temaslı (TS 825: sıcaklık farkı × 0,5)
//  ISITILMAYAN: ısıtılmayan hacme komşu (b katsayısı)   KOMSU: sıcaklığı bilinen komşu hacim
export const ELEMAN_TURLERI = {
  DIS_DUVAR: { ad: "Dış duvar", sinif: "DIS", opak: true, duvar: true },
  PENCERE: { ad: "Pencere", sinif: "DIS", opak: false, duvar: false },
  DIS_KAPI: { ad: "Dış kapı / balkon kapısı", sinif: "DIS", opak: false, duvar: false },
  CATI: { ad: "Çatı / dışa açık tavan", sinif: "DIS", opak: true, duvar: false },
  DOSEME_DIS: { ad: "Dışa açık döşeme (pilotis, konsol)", sinif: "DIS", opak: true, duvar: false },
  DOSEME_TOPRAK: { ad: "Toprağa oturan döşeme", sinif: "TOPRAK", opak: true, duvar: false },
  DUVAR_TOPRAK: { ad: "Toprağa temaslı duvar (bodrum)", sinif: "TOPRAK", opak: true, duvar: false },
  ISITILMAYAN: { ad: "Isıtılmayan hacme komşu (çatı arası, bodrum, merdiven)", sinif: "ISITILMAYAN", opak: true, duvar: false },
  KOMSU: { ad: "Farklı sıcaklıkta komşu hacim", sinif: "KOMSU", opak: true, duvar: false },
} as const;
export type ElemanTuru = keyof typeof ELEMAN_TURLERI;

// YAPI KESİTLERİ: yalıtımsız U0 değeri (W/m²K). Yalıtım eklenirse
// U = 1 / (1/U0 + d/λ) ile hesaplanır. U0 değerleri TS 825 Ek E malzeme
// ısı iletkenlikleri ile iç/dış yüzey dirençleri (Rsi+Rse) kullanılarak hesaplanmıştır.
export const KESITLER: { anahtar: string; ad: string; turler: ElemanTuru[]; u0: number }[] = [
  { anahtar: "TUGLA19", ad: "19 cm yatay delikli tuğla + sıva", turler: ["DIS_DUVAR", "ISITILMAYAN", "KOMSU"], u0: 1.56 },
  { anahtar: "TUGLA13", ad: "13,5 cm tuğla + sıva", turler: ["DIS_DUVAR", "ISITILMAYAN", "KOMSU"], u0: 1.9 },
  { anahtar: "GAZBETON20", ad: "20 cm gazbeton (G4) + sıva", turler: ["DIS_DUVAR", "ISITILMAYAN", "KOMSU"], u0: 0.68 },
  { anahtar: "GAZBETON25", ad: "25 cm gazbeton (G4) + sıva", turler: ["DIS_DUVAR", "ISITILMAYAN", "KOMSU"], u0: 0.56 },
  { anahtar: "BIMS20", ad: "20 cm bims blok + sıva", turler: ["DIS_DUVAR", "ISITILMAYAN", "KOMSU"], u0: 1.2 },
  { anahtar: "BETONARME", ad: "Betonarme perde/kolon (20 cm)", turler: ["DIS_DUVAR", "DUVAR_TOPRAK", "ISITILMAYAN", "KOMSU"], u0: 3.3 },
  { anahtar: "TAS50", ad: "50 cm taş duvar (eski yapı)", turler: ["DIS_DUVAR"], u0: 2.0 },
  { anahtar: "DOSEME", ad: "Betonarme döşeme + şap + kaplama", turler: ["CATI", "DOSEME_DIS", "DOSEME_TOPRAK", "ISITILMAYAN", "KOMSU"], u0: 2.9 },
  { anahtar: "TAVAN_CATI_ARASI", ad: "Betonarme tavan (üstü çatı arası)", turler: ["ISITILMAYAN", "CATI"], u0: 2.5 },
  { anahtar: "AHSAP_CATI", ad: "Ahşap çatı kaplaması (OSB + kiremit)", turler: ["CATI"], u0: 2.2 },
];

// YALITIM MALZEMELERİ (TS 825 Ek E tasarım ısı iletkenlik değerleri, W/mK)
export const YALITIMLAR: { anahtar: string; ad: string; lambda: number }[] = [
  { anahtar: "EPS", ad: "EPS (beyaz)", lambda: 0.04 },
  { anahtar: "GRI_EPS", ad: "Grafitli EPS (gri)", lambda: 0.032 },
  { anahtar: "XPS", ad: "XPS", lambda: 0.035 },
  { anahtar: "TASYUNU", ad: "Taşyünü", lambda: 0.04 },
  { anahtar: "CAMYUNU", ad: "Camyünü", lambda: 0.04 },
  { anahtar: "PUR", ad: "Poliüretan (PUR/PIR)", lambda: 0.028 },
];

// PENCERE / KAPI U DEĞERLERİ (W/m²K, çerçeve dahil ortalama; TS 825 Ek ve üretici verileri)
export const PENCERELER: { anahtar: string; ad: string; u: number }[] = [
  { anahtar: "TEK_CAM", ad: "Tek cam (ahşap/metal doğrama)", u: 5.0 },
  { anahtar: "CIFT_ESKI", ad: "Çift cam (eski tip ısıcam, PVC)", u: 2.8 },
  { anahtar: "ALU_CIFT", ad: "Alüminyum (ısı yalıtımsız), çift cam", u: 3.6 },
  { anahtar: "ALU_YALITIMLI", ad: "Isı yalıtımlı alüminyum, low-e çift cam", u: 2.0 },
  { anahtar: "LOWE", ad: "PVC, low-e çift cam (ısıcam sinerji)", u: 1.8 },
  { anahtar: "LOWE_ARGON", ad: "PVC, low-e + argon çift cam", u: 1.4 },
  { anahtar: "UCLU", ad: "PVC, üçlü cam", u: 1.0 },
  { anahtar: "KAPI_AHSAP", ad: "Dış kapı (ahşap / eski çelik)", u: 3.5 },
  { anahtar: "KAPI_YALITIMLI", ad: "Dış kapı (yalıtımlı çelik)", u: 2.0 },
];

// ISITILMAYAN HACİM SICAKLIK DÜZELTME KATSAYISI b (EN 12831 Tablo D.4 yaklaşık değerleri)
export const B_KATSAYILARI: { anahtar: string; ad: string; b: number }[] = [
  { anahtar: "CATI_ARASI", ad: "Havalandırmalı çatı arası", b: 0.9 },
  { anahtar: "CATI_ARASI_YALITIMLI", ad: "Kiremit altı yalıtımlı çatı arası", b: 0.7 },
  { anahtar: "BODRUM_PENCERELI", ad: "Isıtılmayan bodrum (pencereli)", b: 0.8 },
  { anahtar: "BODRUM", ad: "Isıtılmayan bodrum (penceresiz)", b: 0.5 },
  { anahtar: "MERDIVEN", ad: "Merdiven evi / ortak koridor", b: 0.5 },
  { anahtar: "GARAJ", ad: "Garaj / depo", b: 0.8 },
];

// Toprağa temaslı elemanlarda sıcaklık farkı çarpanı (TS 825: 0,5)
export const TOPRAK_CARPANI = 0.5;

// Isı köprüsü ek U değeri ΔU_TB (W/m²K, EN 12831 basitleştirilmiş yöntem)
export const ISI_KOPRUSU: { deger: number; ad: string }[] = [
  { deger: 0.05, ad: "İyi detaylandırılmış mantolama (0,05)" },
  { deger: 0.1, ad: "Standart (0,10)" },
  { deger: 0.15, ad: "Eski / yalıtımsız yapı (0,15)" },
];

// YÖN ARTIRIMLARI (TS 2164 / DIN 4701 yaklaşımı, iletim kaybına uygulanır)
export const YONLER = {
  K: { ad: "Kuzey", artirim: 0.05 },
  KD: { ad: "Kuzeydoğu", artirim: 0.05 },
  D: { ad: "Doğu", artirim: 0 },
  GD: { ad: "Güneydoğu", artirim: -0.05 },
  G: { ad: "Güney", artirim: -0.05 },
  GB: { ad: "Güneybatı", artirim: -0.05 },
  B: { ad: "Batı", artirim: 0 },
  KB: { ad: "Kuzeybatı", artirim: 0.05 },
} as const;
export type Yon = keyof typeof YONLER;

// ZEMİN KAPLAMASI ISIL DİRENCİ Rλ,B (m²K/W) — EN 1264-2 / üretici tabloları
export const KAPLAMALAR: { anahtar: string; ad: string; r: number }[] = [
  { anahtar: "SERAMIK", ad: "Seramik / granit / mermer", r: 0.02 },
  { anahtar: "LAMINAT", ad: "Laminat parke (8 mm + şilte)", r: 0.08 },
  { anahtar: "PARKE", ad: "Lamine / masif parke (10–14 mm)", r: 0.1 },
  { anahtar: "VINIL", ad: "Vinil / PVC kaplama", r: 0.03 },
  { anahtar: "HALI", ad: "Halı / kalın parke", r: 0.15 },
];

// Yerden ısıtma altındaki en az yalıtım direnci (EN 1264-4, m²K/W)
export const ALT_KATLAR = {
  ISITILAN: { ad: "Altı ısıtılan hacim", rYalitim: 0.75, altSicaklik: 20 },
  ISITILMAYAN: { ad: "Altı ısıtılmayan hacim", rYalitim: 1.25, altSicaklik: 10 },
  TOPRAK: { ad: "Toprağa oturan döşeme", rYalitim: 1.25, altSicaklik: 10 },
  DIS: { ad: "Altı dış hava (pilotis)", rYalitim: 2.0, altSicaklik: null as number | null },
} as const;
export type AltKat = keyof typeof ALT_KATLAR;

// YERDEN ISITMA BORULARI (Fraenkische): dış çap × et kalınlığı
export const YERDEN_BORULARI: { anahtar: string; ad: string; disCap: number; icCap: number; maksDevre: number }[] = [
  { anahtar: "16x2", ad: "16×2 mm", disCap: 0.016, icCap: 0.012, maksDevre: 100 },
  { anahtar: "17x2", ad: "17×2 mm", disCap: 0.017, icCap: 0.013, maksDevre: 110 },
  { anahtar: "20x2", ad: "20×2 mm", disCap: 0.02, icCap: 0.016, maksDevre: 120 },
];

export const BORU_ARALIKLARI = [0.1, 0.15, 0.2, 0.25, 0.3];

// -----------------------------------------------------------------------------
// PANEL RADYATÖR ISIL GÜÇLERİ (TS EN 442) — 1000 mm boy için W
// Kaynak: Baymak Star panel radyatör kataloğu, 75/65/20 ve 90/70/20 tabloları.
// Isıl güç üssü n, aynı radyatörün iki rejimdeki gücünden hesaplanır
// (logaritmik sıcaklık farkı ile); panel radyatörlerde ≈1,30–1,34 çıkar.
// -----------------------------------------------------------------------------
export const RADYATOR_YUKSEKLIKLERI = [300, 400, 500, 600, 900] as const;
export type RadyatorYukseklik = (typeof RADYATOR_YUKSEKLIKLERI)[number];

export const RADYATOR_TIPLERI = {
  "10": { ad: "Tip 10 (P)", kisa: "P", w7565: [331, 432, 530, 625, 893], w9070: [418, 545, 668, 788, 1130], suLtM600: 2.9 },
  "11": { ad: "Tip 11 (PK)", kisa: "PK", w7565: [489, 648, 796, 933, 1273], w9070: [617, 817, 1004, 1176, 1606], suLtM600: 2.9 },
  "21": { ad: "Tip 21 (PKP)", kisa: "PKP", w7565: [736, 926, 1108, 1282, 1776], w9070: [929, 1170, 1401, 1624, 2255], suLtM600: 5.8 },
  "22": { ad: "Tip 22 (PKKP)", kisa: "PKKP", w7565: [933, 1185, 1425, 1653, 2285], w9070: [1179, 1499, 1802, 2091, 2897], suLtM600: 5.8 },
  "33": { ad: "Tip 33 (PKKPKP)", kisa: "PKKPKP", w7565: [1334, 1689, 2021, 2335, 3182], w9070: [1688, 2137, 2557, 2954, 4055], suLtM600: 8.7 },
} as const;
export type RadyatorTipi = keyof typeof RADYATOR_TIPLERI;

export const RADYATOR_KATALOG_KAYNAGI = "TS EN 442 değerleri (Baymak Star panel radyatör kataloğu)";
export const RADYATOR_BOYLARI = { min: 400, maks: 3000, adim: 100, tekParcaOnerilen: 2000 };

// Logaritmik ortalama sıcaklık farkı (EN 442)
export function lmtd(gidis: number, donus: number, oda: number): number {
  const a = gidis - oda;
  const b = donus - oda;
  if (a <= 0 || b <= 0) return 0;
  if (Math.abs(a - b) < 1e-6) return a;
  return (a - b) / Math.log(a / b);
}

const LMTD_7565 = lmtd(75, 65, 20);
const LMTD_9070 = lmtd(90, 70, 20);

// 1000 mm boyda, verilen rejimde W ve n üssü
export function radyatorGucu(tip: RadyatorTipi, yukseklik: RadyatorYukseklik, gidis: number, donus: number, oda: number) {
  const t = RADYATOR_TIPLERI[tip];
  const i = RADYATOR_YUKSEKLIKLERI.indexOf(yukseklik);
  const q75 = t.w7565[i];
  const q90 = t.w9070[i];
  const n = Math.log(q90 / q75) / Math.log(LMTD_9070 / LMTD_7565);
  const dt = lmtd(gidis, donus, oda);
  const w1000 = dt > 0 ? q75 * Math.pow(dt / LMTD_7565, n) : 0;
  return { w1000, n, dt };
}

// Radyatör su hacmi (L/m, yaklaşık; yüksekliğe oranlanır)
export function radyatorSuHacmi(tip: RadyatorTipi, yukseklik: RadyatorYukseklik) {
  return (RADYATOR_TIPLERI[tip].suLtM600 * yukseklik) / 600;
}

// -----------------------------------------------------------------------------
// ANA HAT BORULARI — çok katmanlı (PE-X/Al/PE) boru iç çapları (m)
// -----------------------------------------------------------------------------
export const ANA_BORULAR: { ad: string; icCap: number }[] = [
  { ad: "16×2", icCap: 0.012 },
  { ad: "20×2", icCap: 0.016 },
  { ad: "26×3", icCap: 0.02 },
  { ad: "32×3", icCap: 0.026 },
  { ad: "40×3,5", icCap: 0.033 },
  { ad: "50×4", icCap: 0.042 },
  { ad: "63×4,5", icCap: 0.054 },
];

// Standart hacimler (L)
export const BOYLER_HACIMLERI = [150, 200, 300, 400, 500, 750, 1000];
export const TAMPON_HACIMLERI = [50, 80, 100, 150, 200, 300, 500, 750, 1000];
export const GENLESME_HACIMLERI = [8, 12, 18, 24, 35, 50, 80, 100, 150, 200];

// Suyun genleşme katsayısı e (10 °C'den itibaren, EN 12828 tablosu)
export const GENLESME_KATSAYISI: [number, number][] = [
  [30, 0.0035],
  [40, 0.0075],
  [50, 0.0121],
  [60, 0.0171],
  [70, 0.0228],
  [80, 0.0290],
];

export function genlesmeKatsayisi(t: number): number {
  const tb = GENLESME_KATSAYISI;
  if (t <= tb[0][0]) return tb[0][1];
  for (let i = 1; i < tb.length; i++) {
    if (t <= tb[i][0]) {
      const [t0, e0] = tb[i - 1];
      const [t1, e1] = tb[i];
      return e0 + ((e1 - e0) * (t - t0)) / (t1 - t0);
    }
  }
  return tb[tb.length - 1][1];
}

export function standartUst(hacimler: number[], deger: number): number {
  return hacimler.find((h) => h >= deger - 1e-9) ?? hacimler[hacimler.length - 1];
}
