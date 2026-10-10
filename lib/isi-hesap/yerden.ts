// -----------------------------------------------------------------------------
// YERDEN ISITMA — EN 1264-2 Ek A (Tip A sistem: boru şap içinde) ısıl güç hesabı
// ve EN 1264-3 tasarım adımları.
//
//   q = B · aB · aT^mT · aU^mU · aD^mD · ΔθH          [W/m²]
//   B = 6,7 W/m²K
//   aB = (1/α + su0/λu0) / (1/α + su0/λE + Rλ,B)    α = 10,8; su0 = 0,045 m; λu0 = 1 W/mK
//   mT = 1 − T/0,075 ;  mU = 100·(0,045 − su) ;  mD = 250·(D − 0,020)
//   ΔθH = (θV − θR) / ln((θV − θi)/(θR − θi))       (logaritmik ısıtma suyu üst sıcaklığı)
// Sınır ısı akısı (yüzey sıcaklığı sınırı) temel karakteristik eğriden:
//   q = 8,92 · (θF,m − θi)^1,1   →  θF,maks: yaşam alanı 29 °C, banyo θi + 9 K
// -----------------------------------------------------------------------------

export const ALFA = 10.8;
const B0 = 6.7;
const SU0 = 0.045;
const LAMBDA_U0 = 1;

// EN 1264-2 Tablo A.1 — aT (Rλ,B'ye göre)
const R_SUTUN = [0, 0.05, 0.1, 0.15];
const AT = [1.23, 1.188, 1.156, 1.134];

// EN 1264-2 Tablo A.2 / A.3 — aU ve aD (satır: boru aralığı T, sütun: Rλ,B)
const T_SATIR = [0.05, 0.075, 0.1, 0.15, 0.2, 0.225, 0.3, 0.375];
const AU = [
  [1.069, 1.056, 1.043, 1.037],
  [1.066, 1.053, 1.041, 1.035],
  [1.063, 1.05, 1.039, 1.0335],
  [1.057, 1.046, 1.035, 1.0305],
  [1.051, 1.041, 1.0315, 1.0275],
  [1.048, 1.038, 1.0295, 1.026],
  [1.0395, 1.031, 1.024, 1.021],
  [1.03, 1.022, 1.018, 1.015],
];
const AD = [
  [1.013, 1.013, 1.012, 1.011],
  [1.021, 1.019, 1.016, 1.014],
  [1.029, 1.025, 1.022, 1.018],
  [1.04, 1.034, 1.029, 1.024],
  [1.046, 1.04, 1.035, 1.03],
  [1.049, 1.043, 1.038, 1.033],
  [1.053, 1.049, 1.044, 1.039],
  [1.056, 1.051, 1.046, 1.042],
];

function aradeger(x: number, xs: number[], ys: number[]): number {
  if (x <= xs[0]) return ys[0];
  for (let i = 1; i < xs.length; i++) {
    if (x <= xs[i]) return ys[i - 1] + ((ys[i] - ys[i - 1]) * (x - xs[i - 1])) / (xs[i] - xs[i - 1]);
  }
  return ys[ys.length - 1];
}

function tablo2(t: number, r: number, tb: number[][]): number {
  const satirlar = tb.map((satir) => aradeger(r, R_SUTUN, satir));
  return aradeger(t, T_SATIR, satirlar);
}

export type DosemeYapisi = {
  aralik: number; // T, m
  rKaplama: number; // Rλ,B, m²K/W (0 … 0,15)
  sapUstu: number; // su, m (borunun üstündeki şap)
  sapLambda: number; // λE, W/mK
  boruCap: number; // D, m (dış çap)
};

// Isıl geçiş katsayısı K_H = q / ΔθH (W/m²K)
export function kH(y: DosemeYapisi): number {
  const r = Math.min(0.15, Math.max(0, y.rKaplama));
  const t = Math.min(0.375, Math.max(0.05, y.aralik));
  const aB = (1 / ALFA + SU0 / LAMBDA_U0) / (1 / ALFA + SU0 / y.sapLambda + r);
  const aT = aradeger(r, R_SUTUN, AT);
  const aU = tablo2(t, r, AU);
  const aD = tablo2(t, r, AD);
  const mT = 1 - t / 0.075;
  const mU = 100 * (0.045 - y.sapUstu);
  const mD = 250 * (y.boruCap - 0.02);
  return B0 * aB * Math.pow(aT, mT) * Math.pow(aU, mU) * Math.pow(aD, mD);
}

// Logaritmik ortalama su üst sıcaklığı
export function dThetaH(gidis: number, donus: number, oda: number): number {
  const a = gidis - oda;
  const b = donus - oda;
  if (a <= 0 || b <= 0) return 0;
  if (Math.abs(a - b) < 1e-9) return a;
  return (a - b) / Math.log(a / b);
}

// Verilen gidiş üst sıcaklığı (ΔθV) ve sıcaklık farkı (σ) için ΔθH — kesin formül
export function dThetaHSigma(dV: number, sigma: number): number {
  if (sigma <= 0) return dV;
  if (sigma >= dV) return 0;
  return sigma / Math.log(dV / (dV - sigma));
}

// Gereken ΔθH ve σ için gerekli gidiş üst sıcaklığı ΔθV = σ / (1 − e^(−σ/ΔθH))
export function gerekliDV(dH: number, sigma: number): number {
  if (dH <= 0) return 0;
  return sigma / (1 - Math.exp(-sigma / dH));
}

// ΔθV sabitken istenen ΔθH için σ (ikiye bölme yöntemi). Uygun değilse null.
export function sigmaBul(dV: number, dH: number): number | null {
  if (dH <= 0) return dV * 0.95;
  if (dH >= dV - 1e-6) return null;
  let a = 1e-6;
  let b = dV - 1e-6;
  for (let i = 0; i < 80; i++) {
    const m = (a + b) / 2;
    if (dThetaHSigma(dV, m) > dH) a = m;
    else b = m;
  }
  return (a + b) / 2;
}

// Sınır ısı akısı (yüzey sıcaklığı sınırından)
export function sinirAkisi(oda: number, banyo: boolean): number {
  const fark = banyo ? 9 : Math.max(0, 29 - oda);
  return 8.92 * Math.pow(fark, 1.1);
}

// Ortalama yüzey sıcaklığı
export function yuzeySicakligi(q: number, oda: number): number {
  if (q <= 0) return oda;
  return oda + Math.pow(q / 8.92, 1 / 1.1);
}

// Su debisi (kg/h) — EN 1264-3 eş. (alt kayıp dahil)
// mH = AF·q / (σ·cw) · (1 + Ro/Ru + (θi − θu)/(q·Ru))
export function debi(alan: number, q: number, sigma: number, ro: number, ru: number, oda: number, alt: number): number {
  if (alan <= 0 || q <= 0 || sigma <= 0) return 0;
  const carpan = 1 + ro / ru + (oda - alt) / (q * ru);
  return ((alan * q) / (sigma * 4190)) * 3600 * Math.max(1, carpan);
}

// Borudaki basınç kaybı (Pa) — Darcy-Weisbach, düz plastik boru, %10 tekil kayıp payı
export function boruKaybi(debiKgH: number, icCap: number, uzunluk: number, sicaklik = 35): { pa: number; hiz: number } {
  if (debiKgH <= 0 || icCap <= 0) return { pa: 0, hiz: 0 };
  const rho = 1000 - 0.0178 * Math.pow(Math.abs(sicaklik - 4), 1.7); // ≈ 994 kg/m³ @ 35 °C
  const nu = 1.79e-6 / (1 + 0.0337 * sicaklik + 0.000221 * sicaklik * sicaklik); // kinematik viskozite
  const hacimDebi = debiKgH / 3600 / rho;
  const hiz = hacimDebi / ((Math.PI * icCap * icCap) / 4);
  const re = (hiz * icCap) / nu;
  const lam = re < 2300 ? 64 / Math.max(re, 1) : 0.3164 / Math.pow(re, 0.25);
  const pa = ((lam * uzunluk) / icCap) * ((rho * hiz * hiz) / 2) * 1.1;
  return { pa, hiz };
}
