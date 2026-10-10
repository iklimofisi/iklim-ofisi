// -----------------------------------------------------------------------------
// ISI POMPASI SİSTEM HESABI — ANA HESAP MOTORU
// Saf fonksiyonlardır (veritabanı / tarayıcı kullanmaz): panelde canlı hesap,
// sunucuda PDF ve teklif aktarımı aynı kodla yapılır.
//
// Adımlar
//  1. Oda oda ısı kaybı (EN 12831 basitleştirilmiş yöntem + TS 825 toprak katsayısı)
//  2. Yerden ısıtma tasarımı (EN 1264-2/-3): gidiş sıcaklığı, boru aralığı, devreler
//  3. Radyatör boyutlandırma (TS EN 442): tip, yükseklik, boy
//  4. Isı pompası kapasitesi, denge noktası, model seçimi
//  5. Boyler, tampon tank, genleşme tankı, boru çapları, pompa basmaları
//  6. Malzeme listesi ve uyarılar
// -----------------------------------------------------------------------------
import {
  ODA_TIPLERI,
  ELEMAN_TURLERI,
  KESITLER,
  YALITIMLAR,
  PENCERELER,
  B_KATSAYILARI,
  TOPRAK_CARPANI,
  YONLER,
  KAPLAMALAR,
  ALT_KATLAR,
  YERDEN_BORULARI,
  BORU_ARALIKLARI,
  RADYATOR_TIPLERI,
  RADYATOR_BOYLARI,
  ANA_BORULAR,
  BOYLER_HACIMLERI,
  TAMPON_HACIMLERI,
  GENLESME_HACIMLERI,
  radyatorGucu,
  radyatorSuHacmi,
  genlesmeKatsayisi,
  standartUst,
  type AltKat,
  type RadyatorTipi,
  type RadyatorYukseklik,
} from "./katalog";
import { ilBul } from "./iklim";
import { kH, dThetaHSigma, gerekliDV, sigmaBul, sinirAkisi, yuzeySicakligi, debi, boruKaybi, ALFA } from "./yerden";
import { pencereMi, type HesapVerisi, type Oda, type Eleman, type PompaModeli } from "./tipler";

// ---------------------------------------------------------------------------
// Sonuç tipleri
// ---------------------------------------------------------------------------
export type ElemanSonucu = {
  id: string;
  ad: string;
  alan: number;
  u: number;
  uEtkin: number;
  sicaklikFarki: number;
  artirim: number;
  kayip: number; // W
  dosemeYerden: boolean; // yerden ısıtmalı odanın döşemesi (oda yüküne katılmadı)
};

export type RadyatorParcasi = { tip: RadyatorTipi; yukseklik: RadyatorYukseklik; boy: number; guc: number; suHacmi: number };

export type RadyatorSonucu = {
  gerekenGuc: number;
  w1000: number;
  n: number;
  dt: number;
  parcalar: RadyatorParcasi[];
  toplamGuc: number;
  fazlalik: number; // %
  takviye: boolean;
};

export type YerdenSonucu = {
  alan: number; // boru döşenen net alan
  gerekenAkis: number; // W/m²
  sinirAkis: number;
  aralik: number; // m
  akis: number; // W/m² (sağlanan)
  sigma: number; // K
  donus: number; // °C
  dH: number;
  yuzey: number; // °C ortalama yüzey sıcaklığı
  verilenGuc: number; // W
  eksikGuc: number; // W (takviye gerekir)
  altKat: AltKat;
  altKayip: number; // W (aşağıya kaçan)
  debi: number; // kg/h toplam
  devreSayisi: number;
  devreBoyu: number; // m (her devre)
  toplamBoru: number; // m
  devreDebisi: number; // kg/h
  basincKaybi: number; // mbar (en uzun devre)
  hiz: number; // m/s
  suHacmi: number; // L
  kollektor: number;
  desen: "SALYANGOZ" | "SERPANTIN";
  rKaplama: number;
  kaplamaAdi: string;
};

export type OdaSonucu = {
  id: string;
  ad: string;
  tipAdi: string;
  sicaklik: number;
  alan: number;
  hacim: number;
  elemanlar: ElemanSonucu[];
  iletim: number;
  havalandirma: number;
  isinma: number;
  toplam: number; // W — odanın ısı yükü
  wm2: number;
  isitici: Oda["isitici"];
  radyator: RadyatorSonucu | null;
  yerden: YerdenSonucu | null;
  banyo: boolean;
  uyarilar: string[];
};

export type ModelDegerlendirme = {
  id: string;
  ad: string;
  kapasiteTasarim: number; // kW, tasarım dış sıcaklığı ve gidiş sıcaklığında
  kapasiteNominal: number; // kW A7/W35
  dengeNoktasi: number | null; // °C
  yedekGerekli: number; // kW
  uygun: boolean;
  neden: string;
  urunId: string | null;
};

export type BoruSecimi = { ad: string; debi: number; hiz: number; rPaM: number } | null;

export type KollektorSonucu = {
  no: number;
  agiz: number;
  debi: number; // L/h
  boru: BoruSecimi;
  odalar: string[];
  enKotuKayip: number; // mbar
};

export type MalzemeKalemi = { bolum: string; aciklama: string; adet: number; birim: string; urunId?: string | null };

export type HesapSonucu = {
  il: string;
  disSicaklik: number;
  disSicaklikKaynak: string;
  odalar: OdaSonucu[];
  toplamAlan: number;
  isiKaybi: number; // W, odalar toplamı
  altKayip: number; // W, yerden ısıtma alt kayıpları
  isitmaYuku: number; // W
  sicakSuYuku: number; // W
  tasarimYuku: number; // W (ısı pompasının karşılaması gereken)
  wm2: number;
  radyatorVar: boolean;
  yerdenVar: boolean;
  karisimli: boolean; // radyatör + yerden birlikte (yerden devresi karışım vanalı)
  pompaGidis: number; // ısı pompası tasarım gidiş sıcaklığı
  yerdenGidis: number | null;
  yerdenDonusOrt: number | null;
  yerdenTasarimOdasi: string | null;
  radyatorRejimi: { gidis: number; donus: number };
  modeller: ModelDegerlendirme[];
  secilenModel: ModelDegerlendirme | null;
  yukEgrisi: { t: number; yuk: number; kap: number | null }[];
  boyler: { hacim: number; gerekli: number; serpantinM2: number; genlesme: number } | null;
  tampon: { hacim: number; gerekli: number; mod: HesapVerisi["tampon"] };
  sistemSuHacmi: number;
  genlesme: { hacim: number; gerekli: number; onBasinc: number; dolum: number; emniyet: number; e: number; maksSicaklik: number };
  hatlar: {
    pompa: BoruSecimi;
    radyator: BoruSecimi;
    yerden: BoruSecimi;
  };
  pompalar: {
    radyatorDebi: number; // L/h
    radyatorBasma: number; // mSS
    yerdenDebi: number;
    yerdenBasma: number;
    pompaDebi: number;
  };
  karisimVanasiKvs: number | null;
  kollektorler: KollektorSonucu[];
  malzemeler: MalzemeKalemi[];
  uyarilar: string[];
};

// ---------------------------------------------------------------------------
const yuvarla = (x: number, b = 0) => {
  const k = Math.pow(10, b);
  return Math.round(x * k) / k;
};
// Türkçe sayı yazımı (ondalık virgül)
export const sy = (x: number, b = 1) => yuvarla(x, b).toLocaleString("tr-TR", { maximumFractionDigits: b });

export function elemanU(e: Eleman): number {
  if (e.uElle !== null && e.uElle > 0) return e.uElle;
  if (pencereMi(e.tur)) return PENCERELER.find((p) => p.anahtar === e.kesit)?.u ?? 2.8;
  const u0 = KESITLER.find((k) => k.anahtar === e.kesit)?.u0 ?? 1.5;
  const lam = YALITIMLAR.find((y) => y.anahtar === e.yalitim)?.lambda ?? 0.04;
  const r = 1 / u0 + (e.yalitimCm > 0 ? e.yalitimCm / 100 / lam : 0);
  return 1 / r;
}

export function elemanAdi(e: Eleman): string {
  const tur = ELEMAN_TURLERI[e.tur].ad;
  const yon = e.yon ? ` (${YONLER[e.yon].ad})` : "";
  return (e.aciklama ? `${e.aciklama} — ` : "") + tur + yon;
}

function brutAlan(e: Eleman, o: Oda): number {
  if (e.odaAlani) return o.en * o.boy;
  const boy = e.boy > 0 ? e.boy : o.yukseklik;
  return e.en * boy * Math.max(0, e.adet);
}

// ---------------------------------------------------------------------------
// 1. ODA ISI KAYBI
// ---------------------------------------------------------------------------
export function odaIsiKaybi(o: Oda, v: Pick<HesapVerisi, "isiKoprusu" | "yonArtirimi" | "isinmaArtirimi">, disT: number) {
  const ti = o.sicaklik;
  const yerdenli = o.isitici === "YERDEN" || o.isitici === "YERDEN_RADYATOR";
  // Aynı yöndeki pencere/kapı alanları o yöndeki dış duvardan düşülür
  const acikliklar = new Map<string, number>();
  for (const e of o.elemanlar) {
    if (pencereMi(e.tur)) acikliklar.set(e.yon, (acikliklar.get(e.yon) ?? 0) + brutAlan(e, o));
  }
  const duvarlar = new Map<string, number>();
  for (const e of o.elemanlar) if (e.tur === "DIS_DUVAR") duvarlar.set(e.yon, (duvarlar.get(e.yon) ?? 0) + brutAlan(e, o));

  const uyarilar: string[] = [];
  const sonuclar: ElemanSonucu[] = [];
  for (const e of o.elemanlar) {
    const tanim = ELEMAN_TURLERI[e.tur];
    let alan = brutAlan(e, o);
    if (e.tur === "DIS_DUVAR") {
      const brutYon = duvarlar.get(e.yon) ?? alan;
      const dusulecek = acikliklar.get(e.yon) ?? 0;
      // Aynı yönde birden çok duvar varsa pencere alanı oranlı düşülür
      alan = Math.max(0, alan - (brutYon > 0 ? (dusulecek * alan) / brutYon : 0));
    }
    const u = elemanU(e);
    let dT = 0;
    if (tanim.sinif === "DIS") dT = ti - disT;
    else if (tanim.sinif === "TOPRAK") dT = (ti - disT) * TOPRAK_CARPANI;
    else if (tanim.sinif === "ISITILMAYAN") dT = (B_KATSAYILARI.find((b) => b.anahtar === e.bAnahtar)?.b ?? 0.5) * (ti - disT);
    else dT = Math.max(0, ti - e.komsuSicaklik);
    const uEtkin = u + (tanim.opak && tanim.sinif !== "KOMSU" ? v.isiKoprusu : 0);
    const artirim = v.yonArtirimi && tanim.sinif === "DIS" && e.yon ? YONLER[e.yon].artirim : 0;
    const dosemeYerden = yerdenli && e.doseme;
    const kayip = dosemeYerden ? 0 : alan * uEtkin * dT * (1 + artirim);
    sonuclar.push({ id: e.id, ad: elemanAdi(e), alan, u, uEtkin, sicaklikFarki: dT, artirim, kayip, dosemeYerden });
  }
  for (const [yon, a] of acikliklar) {
    if (a > 0 && !duvarlar.has(yon)) uyarilar.push(`${YONLER[yon as keyof typeof YONLER]?.ad ?? "Yönsüz"} cephede pencere/kapı var ama dış duvar girilmemiş.`);
  }
  const alan = o.en * o.boy;
  const hacim = alan * o.yukseklik;
  const iletim = sonuclar.reduce((t, s) => t + s.kayip, 0);
  const havalandirma = 0.34 * hacim * o.havaDegisim * Math.max(0, ti - disT);
  const isinma = (iletim + havalandirma) * (v.isinmaArtirimi / 100);
  const toplam = Math.max(0, iletim + havalandirma + isinma);
  return { sonuclar, iletim, havalandirma, isinma, toplam, alan, hacim, uyarilar };
}

// Odanın döşemesinin altı (yerden ısıtma alt kaybı için)
function altKatBul(o: Oda): AltKat {
  const d = o.elemanlar.find((e) => e.doseme);
  if (!d) return "ISITILAN";
  if (d.tur === "DOSEME_TOPRAK") return "TOPRAK";
  if (d.tur === "DOSEME_DIS") return "DIS";
  if (d.tur === "ISITILMAYAN") return "ISITILMAYAN";
  return "ISITILAN";
}

// ---------------------------------------------------------------------------
// 3. RADYATÖR
// ---------------------------------------------------------------------------
export function radyatorSec(
  guc: number,
  tip: RadyatorTipi,
  yukseklik: RadyatorYukseklik,
  parca: number,
  gidis: number,
  donus: number,
  oda: number,
  takviye: boolean
): RadyatorSonucu {
  const { w1000, n, dt } = radyatorGucu(tip, yukseklik, gidis, donus, oda);
  const bos: RadyatorSonucu = { gerekenGuc: guc, w1000, n, dt, parcalar: [], toplamGuc: 0, fazlalik: 0, takviye };
  if (guc <= 0 || w1000 <= 0) return bos;
  const toplamMm = (guc / w1000) * 1000;
  let adet = parca > 0 ? parca : Math.max(1, Math.ceil(toplamMm / RADYATOR_BOYLARI.tekParcaOnerilen));
  let boy = Math.max(RADYATOR_BOYLARI.min, Math.ceil(toplamMm / adet / RADYATOR_BOYLARI.adim) * RADYATOR_BOYLARI.adim);
  while (boy > RADYATOR_BOYLARI.maks) {
    adet++;
    boy = Math.max(RADYATOR_BOYLARI.min, Math.ceil(toplamMm / adet / RADYATOR_BOYLARI.adim) * RADYATOR_BOYLARI.adim);
  }
  const tekGuc = (w1000 * boy) / 1000;
  const parcalar = Array.from({ length: adet }, () => ({
    tip,
    yukseklik,
    boy,
    guc: tekGuc,
    suHacmi: (radyatorSuHacmi(tip, yukseklik) * boy) / 1000,
  }));
  const toplamGuc = tekGuc * adet;
  return { ...bos, parcalar, toplamGuc, fazlalik: (toplamGuc / guc - 1) * 100 };
}

// ---------------------------------------------------------------------------
// 5. BORU SEÇİMİ (çok katmanlı boru, hız ≤ 0,7 m/s)
// ---------------------------------------------------------------------------
export function boruSec(debiLh: number, sicaklik: number, maksHiz = 0.7): BoruSecimi {
  if (debiLh <= 0) return null;
  for (const b of ANA_BORULAR) {
    const k = boruKaybi(debiLh, b.icCap, 1, sicaklik);
    if (k.hiz <= maksHiz) return { ad: b.ad, debi: debiLh, hiz: k.hiz, rPaM: k.pa / 1.1 };
  }
  const b = ANA_BORULAR[ANA_BORULAR.length - 1];
  const k = boruKaybi(debiLh, b.icCap, 1, sicaklik);
  return { ad: b.ad, debi: debiLh, hiz: k.hiz, rPaM: k.pa / 1.1 };
}

// ---------------------------------------------------------------------------
// 4. ISI POMPASI KAPASİTESİ (katalog noktalarından ara değer)
// ---------------------------------------------------------------------------
export function pompaKapasitesi(m: PompaModeli, dis: number, gidis: number): number {
  const a = m.kapA7W35;
  const b = m.kapAm7W35;
  let kap35: number;
  if (dis >= -7 || m.kapAm15W35 === null) kap35 = b + ((a - b) * (dis + 7)) / 14;
  else kap35 = b + ((b - m.kapAm15W35) * (dis + 7)) / 8;
  // +7 °C üstünde katalog değerinin %15 fazlasından büyük alınmaz
  kap35 = Math.min(kap35, a * 1.15);
  const oran55 = b > 0 && m.kapAm7W55 > 0 ? m.kapAm7W55 / b : 0.85;
  const f = Math.max(30, Math.min(65, gidis));
  const kap = kap35 * (1 + ((oran55 - 1) * (f - 35)) / 20);
  return Math.max(0, kap);
}

function modelDegerlendir(
  m: PompaModeli,
  yukFn: (t: number) => number,
  disT: number,
  gidis: number,
  v: HesapVerisi
): ModelDegerlendirme {
  const ad = `${m.marka} ${m.model}`.trim();
  const kapT = pompaKapasitesi(m, disT, gidis);
  const yukT = yukFn(disT);
  // Denge noktası: kapasitenin yüke eşit olduğu dış sıcaklık (20 °C'den aşağı taranır)
  let denge: number | null = null;
  for (let t = 20; t >= disT - 15; t -= 0.1) {
    if (pompaKapasitesi(m, t, gidis) < yukFn(t)) {
      denge = yuvarla(t + 0.1, 1);
      break;
    }
  }
  const calisirMi = m.minDisSicaklik <= disT;
  const gidisUygun = m.maksCikis >= gidis;
  const yedekGerekli = Math.max(0, yukT - (calisirMi ? kapT : 0));
  let uygun = true;
  let neden = "";
  if (!gidisUygun) {
    uygun = false;
    neden = `Gerekli gidiş sıcaklığı ${sy(gidis)} °C, cihaz en çok ${sy(m.maksCikis)} °C verir.`;
  } else if (!calisirMi) {
    uygun = false;
    neden = `Cihaz ${sy(m.minDisSicaklik)} °C altında çalışmıyor; tasarım sıcaklığı ${sy(disT)} °C.`;
  } else if (v.isletme === "MONOVALENT") {
    if (kapT < yukT) {
      uygun = false;
      neden = `Tasarım sıcaklığında ${sy(kapT)} kW veriyor, ${sy(yukT)} kW gerekli.`;
    } else neden = "Tasarım sıcaklığında yükün tamamını tek başına karşılar.";
  } else {
    const hedef = Math.max(v.bivalentNokta, disT);
    if (denge !== null && denge > hedef + 0.05) {
      uygun = false;
      neden = `Denge noktası ${sy(denge)} °C; hedef en çok ${sy(hedef)} °C.`;
    } else if (yedekGerekli > 0) {
      neden = `Tasarım sıcaklığında ${sy(yedekGerekli)} kW elektrikli yedek ısıtıcı devreye girer.`;
      if (m.yedekIsiticiKw > 0 && m.yedekIsiticiKw < yedekGerekli) neden += ` Dahili ısıtıcı (${sy(m.yedekIsiticiKw)} kW) yetmez; ek ısıtıcı gerekir.`;
    } else neden = "Tasarım sıcaklığında yükün tamamını karşılar.";
  }
  return {
    id: m.id,
    ad,
    kapasiteTasarim: kapT,
    kapasiteNominal: m.kapA7W35,
    dengeNoktasi: denge,
    yedekGerekli: v.isletme === "MONOVALENT" ? 0 : yedekGerekli,
    uygun,
    neden,
    urunId: m.urunId,
  };
}

// ---------------------------------------------------------------------------
// ANA HESAP
// ---------------------------------------------------------------------------
export function sistemiHesapla(v: HesapVerisi, modeller: PompaModeli[] = []): HesapSonucu {
  const il = ilBul(v.il);
  const disT = v.disSicaklikElle ?? il.disSicaklik;
  const uyarilar: string[] = [];
  const boru = YERDEN_BORULARI.find((b) => b.anahtar === v.yerdenBoru) ?? YERDEN_BORULARI[0];

  // 1) Isı kayıpları
  const odaHam = v.odalar.map((o) => ({ o, k: odaIsiKaybi(o, v, disT) }));

  // 2) Yerden ısıtma
  const yerdenOdalar = odaHam.filter(({ o }) => (o.isitici === "YERDEN" || o.isitici === "YERDEN_RADYATOR") && o.en * o.boy - o.haricAlan > 0.5);
  const aralikListesi = BORU_ARALIKLARI.filter((t) => t >= v.yerdenMinAralik - 1e-9 && t <= v.yerdenMaksAralik + 1e-9);
  const tMin = Math.min(...aralikListesi);
  const sigmaT = v.yerdenSigma;

  type YerdenHazirlik = {
    id: string;
    alan: number;
    q: number;
    qG: number;
    banyo: boolean;
    rKaplama: number;
    kaplamaAdi: string;
  };
  const hazirlik = new Map<string, YerdenHazirlik>();
  for (const { o, k } of yerdenOdalar) {
    const alan = Math.max(0, o.en * o.boy - o.haricAlan);
    const kaplama = KAPLAMALAR.find((x) => x.anahtar === o.kaplama) ?? KAPLAMALAR[0];
    const banyo = ODA_TIPLERI[o.tip].banyo;
    hazirlik.set(o.id, {
      id: o.id,
      alan,
      q: k.toplam / alan,
      qG: sinirAkisi(o.sicaklik, banyo),
      banyo,
      rKaplama: kaplama.r,
      kaplamaAdi: kaplama.ad,
    });
  }
  const yapi = (t: number, r: number) => ({ aralik: t, rKaplama: r, sapUstu: v.sapUstu, sapLambda: v.sapLambda, boruCap: boru.disCap });

  // Tasarım gidiş sıcaklığı: banyo dışındaki en zorlu oda, en sık aralıkta σ ile
  let yerdenGidis: number | null = null;
  let tasarimOdasi: string | null = null;
  if (yerdenOdalar.length) {
    let gerekli = 0;
    for (const { o } of yerdenOdalar) {
      const h = hazirlik.get(o.id)!;
      if (h.banyo && yerdenOdalar.some((x) => !hazirlik.get(x.o.id)!.banyo)) continue;
      const tOda = o.aralik > 0 ? o.aralik : tMin;
      const qHedef = Math.min(h.q, h.qG);
      const dH = qHedef / kH(yapi(tOda, h.rKaplama));
      const gid = o.sicaklik + gerekliDV(dH, sigmaT);
      if (gid > gerekli) {
        gerekli = gid;
        tasarimOdasi = o.ad;
      }
    }
    yerdenGidis =
      v.yerdenGidisModu === "SABIT" ? v.yerdenHedefGidis : Math.min(55, Math.max(v.yerdenHedefGidis, Math.ceil(gerekli * 2) / 2));
    if (v.yerdenGidisModu === "SABIT" && gerekli > v.yerdenHedefGidis + 0.01)
      uyarilar.push(
        `Yerden ısıtma gidişi ${sy(v.yerdenHedefGidis)} °C'de sabit tutuldu; ${tasarimOdasi} gibi yükü yüksek odalarda eksik kalan güç takviye radyatörle karşılanır (otomatik modda ${sy(Math.min(55, Math.ceil(gerekli * 2) / 2))} °C gerekirdi).`
      );
    else if (gerekli > 55) uyarilar.push("Yerden ısıtma için 55 °C üzeri gidiş gerekiyor; bazı odalarda takviye ısıtıcı önerildi.");
    if (v.yerdenGidisModu !== "SABIT" && yerdenGidis > v.yerdenHedefGidis + 0.01)
      uyarilar.push(
        `Yerden ısıtma gidiş sıcaklığı hedef ${sy(v.yerdenHedefGidis)} °C yerine ${sy(yerdenGidis)} °C alındı (${tasarimOdasi} odası ${Math.round(tMin * 100)} cm aralıkla bunu gerektiriyor). Isı pompası verimi için yalıtımı artırmak ya da yerden ısıtma alanını büyütmek daha düşük sıcaklık sağlar.`
      );
  }

  const radyatorRejimi = { gidis: v.radyatorGidis, donus: Math.min(v.radyatorDonus, v.radyatorGidis - 1) };
  if (v.radyatorDonus >= v.radyatorGidis) uyarilar.push("Radyatör dönüş sıcaklığı gidişten küçük olmalı; dönüş gidiş − 1 °C alındı.");

  const odalar: OdaSonucu[] = odaHam.map(({ o, k }) => {
    const uy = [...k.uyarilar];
    const banyo = ODA_TIPLERI[o.tip].banyo;
    let yerden: YerdenSonucu | null = null;
    let radyatorGucu = o.isitici === "RADYATOR" ? k.toplam : 0;
    let takviye = false;

    const h = hazirlik.get(o.id);
    if (h && yerdenGidis !== null) {
      const dV = yerdenGidis - o.sicaklik;
      const adaylar = o.aralik > 0 ? [o.aralik] : [...aralikListesi].sort((a, b) => b - a);
      const qIstenen = Math.min(h.q, h.qG);
      let secim: { t: number; sigma: number; q: number } | null = null;
      if (qIstenen <= 0.5) {
        const t = adaylar[0];
        secim = { t, sigma: Math.min(sigmaT, dV * 0.8), q: 0 };
      } else {
        for (const t of adaylar) {
          const dH = qIstenen / kH(yapi(t, h.rKaplama));
          const s = sigmaBul(dV, dH);
          if (s !== null && s >= sigmaT - 1e-6) {
            secim = { t, sigma: s, q: qIstenen };
            break;
          }
        }
        if (!secim) {
          // Tasarım σ'sı tutturulamıyorsa en sık aralıkta daha küçük σ (≥ 2 K) denenir
          const t = adaylar[adaylar.length - 1];
          const dH = qIstenen / kH(yapi(t, h.rKaplama));
          const s = sigmaBul(dV, dH);
          if (s !== null && s >= 2) secim = { t, sigma: s, q: qIstenen };
          else {
            const sig = Math.min(2, dV * 0.5);
            const qMaks = Math.min(h.qG, kH(yapi(t, h.rKaplama)) * dThetaHSigma(dV, sig));
            secim = { t, sigma: sig, q: Math.max(0, qMaks) };
          }
        }
      }
      const q = secim.q;
      const verilen = q * h.alan;
      const eksik = Math.max(0, k.toplam - verilen);
      const alt = altKatBul(o);
      const altTanim = ALT_KATLAR[alt];
      const altSicaklik =
        alt === "DIS" ? disT : alt === "ISITILAN" ? o.sicaklik : o.sicaklik - TOPRAK_CARPANI * (o.sicaklik - disT);
      const ro = 1 / ALFA + h.rKaplama + v.sapUstu / v.sapLambda;
      const ru = altTanim.rYalitim + 0.15 / 2.5 + (alt === "ISITILAN" || alt === "ISITILMAYAN" ? 0.17 : alt === "DIS" ? 0.04 : 0);
      const qAlt = q > 0 ? Math.max(0, (ro * q + o.sicaklik - altSicaklik) / ru) : 0;
      const altKayip = alt === "ISITILAN" ? 0 : qAlt * h.alan;
      const debiKg = q > 0 ? debi(h.alan, q, secim.sigma, ro, ru, o.sicaklik, altSicaklik) : 0;
      const alanBoru = h.alan / secim.t;
      let devre = 1;
      while (alanBoru / devre + 2 * o.kollektorMesafe > boru.maksDevre && devre < 20) devre++;
      const devreBoyu = alanBoru / devre + 2 * o.kollektorMesafe;
      const devreDebi = debiKg / devre;
      const kayip = boruKaybi(devreDebi, boru.icCap, devreBoyu, yerdenGidis - secim.sigma / 2);
      const toplamBoru = devreBoyu * devre;
      yerden = {
        alan: h.alan,
        gerekenAkis: h.q,
        sinirAkis: h.qG,
        aralik: secim.t,
        akis: q,
        sigma: secim.sigma,
        donus: yerdenGidis - secim.sigma,
        dH: dThetaHSigma(dV, secim.sigma),
        yuzey: yuzeySicakligi(q, o.sicaklik),
        verilenGuc: verilen,
        eksikGuc: eksik,
        altKat: alt,
        altKayip,
        debi: debiKg,
        devreSayisi: devre,
        devreBoyu,
        toplamBoru,
        devreDebisi: devreDebi,
        basincKaybi: kayip.pa / 100,
        hiz: kayip.hiz,
        suHacmi: (toplamBoru * Math.PI * boru.icCap * boru.icCap * 1000) / 4,
        kollektor: o.kollektor,
        desen: o.desen,
        rKaplama: h.rKaplama,
        kaplamaAdi: h.kaplamaAdi,
      };
      if (h.q > h.qG)
        uy.push(`Gereken ${Math.round(h.q)} W/m² yüzey sıcaklığı sınırını (${Math.round(h.qG)} W/m²) aşıyor.`);
      if (eksik > 1) {
        takviye = true;
        radyatorGucu = eksik;
        uy.push(
          `Yerden ısıtma ${Math.round(verilen)} W veriyor, ${Math.round(eksik)} W eksik kalıyor → ${banyo ? "havlupan / " : ""}takviye radyatör eklendi.`
        );
      }
      if (kayip.pa / 100 > 250) uy.push(`Devre basınç kaybı ${Math.round(kayip.pa / 100)} mbar (250 mbar üstü); devre sayısını artırın ya da kollektörü yaklaştırın.`);
      if (o.kollektorMesafe > 15) uy.push("Kollektöre uzaklık 15 m'den fazla; besleme boruları ısı verip yolu geçtiği odaları da ısıtır.");
    } else if (o.isitici === "YERDEN" || o.isitici === "YERDEN_RADYATOR") {
      uy.push("Boru döşenecek net alan çok küçük; yerden ısıtma hesaplanamadı.");
    }

    let radyator: RadyatorSonucu | null = null;
    if (radyatorGucu > 1) {
      radyator = radyatorSec(radyatorGucu, o.radyatorTip, o.radyatorYukseklik, o.radyatorParca, radyatorRejimi.gidis, radyatorRejimi.donus, o.sicaklik, takviye);
      if (radyator.w1000 <= 0) uy.push("Radyatör rejimi oda sıcaklığına göre geçersiz (dönüş suyu oda sıcaklığından yüksek olmalı).");
      else if (radyator.parcalar.length > 2) uy.push(`${radyator.parcalar.length} parça radyatör gerekiyor; daha yüksek / daha çok panelli tip seçmeyi düşünün.`);
      else if (radyator.fazlalik > 50 && o.radyatorTip !== "10")
        uy.push(`Radyatör gerekenden %${Math.round(radyator.fazlalik)} büyük çıktı (en kısa boy 400 mm); daha az panelli tip (Tip 11 / 10) seçilebilir.`);
    }
    if (banyo && o.isitici === "RADYATOR") uy.push("Banyoda panel radyatör yerine aynı güçte havlupan kullanılabilir.");

    return {
      id: o.id,
      ad: o.ad,
      tipAdi: ODA_TIPLERI[o.tip].ad,
      sicaklik: o.sicaklik,
      alan: k.alan,
      hacim: k.hacim,
      elemanlar: k.sonuclar,
      iletim: k.iletim,
      havalandirma: k.havalandirma,
      isinma: k.isinma,
      toplam: o.isitici === "YOK" ? 0 : k.toplam,
      wm2: k.alan > 0 ? k.toplam / k.alan : 0,
      isitici: o.isitici,
      radyator: o.isitici === "YOK" ? null : radyator,
      yerden,
      banyo,
      uyarilar: uy,
    };
  });

  const radyatorVar = odalar.some((o) => o.radyator && o.radyator.parcalar.length > 0);
  const yerdenVar = odalar.some((o) => o.yerden);
  const karisimli = radyatorVar && yerdenVar;
  // Isı pompası gidişi: devrelerin istediği en yüksek sıcaklık
  const pompaGidis = Math.max(radyatorVar ? radyatorRejimi.gidis : 0, yerdenVar ? yerdenGidis ?? 35 : 0) || 35;
  if (karisimli && yerdenGidis !== null && yerdenGidis > radyatorRejimi.gidis)
    uyarilar.push(
      `Yerden ısıtma ${sy(yerdenGidis)} °C gidiş istiyor, radyatör rejimi ${sy(radyatorRejimi.gidis)} °C. Isı pompası ${sy(yerdenGidis)} °C'ye göre seçildi; yalıtımı artırmak, yerden ısıtmada boru aralığını sıklaştırmak ya da kaplama direncini düşürmek gidiş sıcaklığını düşürür.`
    );
  else if (karisimli && yerdenGidis !== null && radyatorRejimi.gidis < yerdenGidis + 3)
    uyarilar.push("Radyatör gidiş sıcaklığı yerden ısıtmaya çok yakın; karışım vanası için en az 3 K fark bırakın.");

  // 4) Yükler
  const isiKaybi = odalar.reduce((t, o) => t + o.toplam, 0);
  const altKayip = odalar.reduce((t, o) => t + (o.yerden?.altKayip ?? 0), 0);
  const isitmaYuku = isiKaybi + altKayip;
  const sicakSuYuku = v.sicakSu ? v.kisiSayisi * 250 : 0;
  const tasarimYuku = isitmaYuku * (1 + v.emniyetPayi / 100) + sicakSuYuku;
  const toplamAlan = odalar.reduce((t, o) => t + o.alan, 0);
  const icOrt = toplamAlan > 0 ? odalar.reduce((t, o) => t + o.sicaklik * o.alan, 0) / toplamAlan : 20;
  const yukFn = (t: number) => {
    const oran = icOrt - disT > 0 ? Math.max(0, (icOrt - t) / (icOrt - disT)) : 0;
    return (isitmaYuku * (1 + v.emniyetPayi / 100) * oran + sicakSuYuku) / 1000;
  };

  const degerlendirmeler = modeller
    .map((m) => modelDegerlendir(m, yukFn, disT, pompaGidis, v))
    .sort((a, b) => a.kapasiteNominal - b.kapasiteNominal);
  let secilen: ModelDegerlendirme | null = null;
  if (v.modelId) secilen = degerlendirmeler.find((m) => m.id === v.modelId) ?? null;
  if (!secilen) secilen = degerlendirmeler.find((m) => m.uygun) ?? null;
  if (modeller.length && !degerlendirmeler.some((m) => m.uygun)) uyarilar.push("Kayıtlı ısı pompası modellerinden hiçbiri bu yükü karşılamıyor.");
  if (secilen && !secilen.uygun) uyarilar.push(`Seçilen model (${secilen.ad}) uygun değil: ${secilen.neden}`);
  if (secilen && secilen.uygun && secilen.kapasiteTasarim > (tasarimYuku / 1000) * 1.6)
    uyarilar.push("Seçilen ısı pompası ihtiyacın %60'ından fazla büyük; sık dur-kalk verimi düşürür, bir küçük model değerlendirilebilir.");

  const seciliModel = secilen ? modeller.find((m) => m.id === secilen!.id) ?? null : null;
  const yukEgrisi: HesapSonucu["yukEgrisi"] = [];
  for (let t = Math.floor(disT) - 3; t <= 16; t += 1) {
    yukEgrisi.push({ t, yuk: yukFn(t), kap: seciliModel ? pompaKapasitesi(seciliModel, t, pompaGidis) : null });
  }

  // 5) Boyler
  let boyler: HesapSonucu["boyler"] = null;
  if (v.sicakSu) {
    const gerekli = v.kisiSayisi * 50 * (50 - 10) / Math.max(30, v.sicakSuSicaklik - 10);
    const hacim = standartUst(BOYLER_HACIMLERI, Math.max(150, gerekli));
    const kw = secilen ? secilen.kapasiteNominal : tasarimYuku / 1000;
    boyler = {
      hacim,
      gerekli,
      serpantinM2: Math.max(1, kw * 0.25),
      genlesme: hacim <= 200 ? 8 : hacim <= 300 ? 12 : hacim <= 500 ? 18 : 24,
    };
    if (v.sicakSuSicaklik > 55) uyarilar.push("Kullanım suyu 55 °C üzeri istenirse ısı pompası verimi düşer; lejyonella için haftalık ısıl dezenfeksiyon programı yeterlidir.");
  }

  // Tampon tank
  const kwTasarim = tasarimYuku / 1000;
  const tamponGerekli = Math.max(50, 20 * kwTasarim);
  const tamponHacim =
    v.tampon === "YOK" ? 0 : v.tampon === "ELLE" ? v.tamponElle : standartUst(TAMPON_HACIMLERI, tamponGerekli);

  // Sistem su hacmi
  const radSu = odalar.reduce((t, o) => t + (o.radyator?.parcalar.reduce((s, p) => s + p.suHacmi, 0) ?? 0), 0);
  const yerSu = odalar.reduce((t, o) => t + (o.yerden?.suHacmi ?? 0), 0);
  const pompaDebi = (tasarimYuku / (1.163 * 5)) | 0; // L/h, ısı pompası ΔT = 5 K
  const hatPompa = boruSec(pompaDebi, pompaGidis);
  const radyatorToplam = odalar.reduce((t, o) => t + (o.radyator?.toplamGuc ?? 0), 0);
  const radyatorDebi = radyatorVar ? radyatorToplam / (1.163 * (radyatorRejimi.gidis - radyatorRejimi.donus)) : 0;
  const yerdenDebi = odalar.reduce((t, o) => t + (o.yerden?.debi ?? 0), 0) / 0.994;
  const hatRad = boruSec(radyatorDebi, radyatorRejimi.gidis);
  const hatYer = boruSec(yerdenDebi, yerdenGidis ?? 35);
  const boruHacmi = (b: BoruSecimi) => {
    if (!b) return 0;
    const ic = ANA_BORULAR.find((x) => x.ad === b.ad)?.icCap ?? 0.02;
    return 2 * v.anaHatUzunluk * Math.PI * ic * ic * 250; // gidiş + dönüş, L
  };
  const kollektorAgizlari = odalar.reduce((t, o) => t + (o.yerden?.devreSayisi ?? 0), 0);
  const sistemSuHacmi =
    radSu + yerSu + tamponHacim + 5 + kwTasarim * 0.5 + boruHacmi(hatRad) + boruHacmi(hatYer) + 2 * Math.PI * 0.026 * 0.026 * 250 * 3 + kollektorAgizlari * 0.3 + (boyler ? boyler.hacim * 0.03 : 0);
  if (sistemSuHacmi < 20 * kwTasarim * 0.5 && v.tampon === "YOK")
    uyarilar.push("Sistem su hacmi defrost (buz çözme) için düşük olabilir; tampon tank kullanılması önerilir.");

  // Genleşme tankı (EN 12828)
  const maksSicaklik = Math.max(pompaGidis + 5, boyler ? v.sicakSuSicaklik + 8 : 0);
  const e = genlesmeKatsayisi(maksSicaklik);
  const ve = e * sistemSuHacmi;
  const vwr = Math.max(0.005 * sistemSuHacmi, 3);
  const onBasinc = Math.max(0.5, v.statikYukseklik / 10 + 0.2);
  const emniyet = 3;
  const pe = emniyet - 0.5;
  const gerekliGenlesme = ((ve + vwr) * (pe + 1)) / (pe - onBasinc);
  const genlesme = {
    hacim: standartUst(GENLESME_HACIMLERI, gerekliGenlesme),
    gerekli: gerekliGenlesme,
    onBasinc,
    dolum: onBasinc + 0.3,
    emniyet,
    e,
    maksSicaklik,
  };

  // Kollektörler
  const kollektorMap = new Map<number, KollektorSonucu>();
  for (const o of odalar) {
    if (!o.yerden) continue;
    const k = kollektorMap.get(o.yerden.kollektor) ?? { no: o.yerden.kollektor, agiz: 0, debi: 0, boru: null, odalar: [], enKotuKayip: 0 };
    k.agiz += o.yerden.devreSayisi;
    k.debi += o.yerden.debi / 0.994;
    k.odalar.push(o.ad);
    k.enKotuKayip = Math.max(k.enKotuKayip, o.yerden.basincKaybi);
    kollektorMap.set(o.yerden.kollektor, k);
  }
  const kollektorler = [...kollektorMap.values()].sort((a, b) => a.no - b.no);
  for (const k of kollektorler) {
    k.boru = boruSec(k.debi, yerdenGidis ?? 35);
    if (k.agiz > 12) uyarilar.push(`Kollektör ${k.no}: ${k.agiz} ağız; 12'den fazla ağız için kollektörü ikiye bölün.`);
  }

  // Pompa basmaları (tahmini)
  const enKotuYerden = Math.max(0, ...kollektorler.map((k) => k.enKotuKayip));
  const hatKaybi = (b: BoruSecimi) => (b ? (b.rPaM * 2 * v.anaHatUzunluk * 1.3) / 100 : 0); // mbar
  const yerdenBasmaMbar = yerdenVar ? enKotuYerden + 50 + (karisimli ? 60 : 0) + hatKaybi(hatYer) + 30 : 0;
  const radyatorBasmaMbar = radyatorVar ? 100 + 20 + hatKaybi(hatRad) * 1.5 + 30 : 0;
  const karisimVanasiKvs = karisimli ? [1.6, 2.5, 4, 6.3, 10, 16, 25].find((k) => k >= yerdenDebi / 1000 / Math.sqrt(0.1)) ?? 25 : null;

  // 6) Malzeme listesi
  const malzemeler: MalzemeKalemi[] = [];
  const M = "Isı Pompası ve Mekanik Oda";
  const R = "Radyatör Tesisatı";
  const Y = "Yerden Isıtma (Fraenkische)";
  const ek = (bolum: string, aciklama: string, adet: number, birim = "Adet", urunId: string | null = null) => {
    if (adet > 0) malzemeler.push({ bolum, aciklama, adet: yuvarla(adet, 2), birim, urunId });
  };
  const kwYaz = (x: number) => yuvarla(x, 1).toLocaleString("tr-TR");
  if (secilen && secilen.uygun) ek(M, `${secilen.ad} hava kaynaklı ısı pompası`, 1, "Adet", secilen.urunId);
  else ek(M, `Hava kaynaklı ısı pompası — en az ${kwYaz(tasarimYuku / 1000)} kW (${sy(disT)} °C dış / ${sy(pompaGidis)} °C gidiş)`, 1);
  const yedek = secilen?.yedekGerekli ?? 0;
  if (yedek > 0.05) ek(M, `Elektrikli yedek ısıtıcı (en az ${kwYaz(yedek)} kW)`, 1);
  if (boyler) {
    ek(M, `Isı pompası uyumlu boyler ${boyler.hacim} L (serpantin en az ${kwYaz(boyler.serpantinM2)} m²)`, 1);
    ek(M, `Sıhhi su genleşme tankı ${boyler.genlesme} L + boyler emniyet grubu`, 1, "Set");
    ek(M, "3 yollu yön değiştirme vanası (ısıtma / kullanım suyu)", 1);
  }
  if (tamponHacim > 0) ek(M, `Tampon tank ${Math.round(tamponHacim)} L (4 bağlantılı, yalıtımlı)`, 1);
  ek(M, `Kapalı genleşme tankı ${genlesme.hacim} L (ön basınç ${yuvarla(onBasinc, 1).toLocaleString("tr-TR")} bar)`, 1);
  ek(M, "Manyetik filtre + pislik tutucu", 1);
  ek(M, "Emniyet ventili 3 bar + manometre + otomatik pürjör (emniyet grubu)", 1, "Set");
  ek(M, "Otomatik dolum grubu (basınç düşürücülü) + geri akış önleyici", 1, "Set");
  ek(M, "Esnek titreşim bağlantı hortumu (ısı pompası çıkışları)", 2);
  ek(M, "Küresel vana seti (servis vanaları)", 1, "Set");
  if (radyatorVar && (tamponHacim > 0 || yerdenVar)) ek(M, `Frekans kontrollü sirkülasyon pompası — radyatör devresi (${Math.round(radyatorDebi)} L/h, ${yuvarla(radyatorBasmaMbar / 98, 1).toLocaleString("tr-TR")} mSS)`, 1);
  if (yerdenVar && (tamponHacim > 0 || radyatorVar)) ek(M, `Frekans kontrollü sirkülasyon pompası — yerden ısıtma devresi (${Math.round(yerdenDebi)} L/h, ${yuvarla(yerdenBasmaMbar / 98, 1).toLocaleString("tr-TR")} mSS)`, 1);
  if (karisimli) {
    ek(M, `3 yollu karışım vanası + motor (Kvs ${String(karisimVanasiKvs).replace(".", ",")}) — yerden ısıtma devresi`, 1, "Set");
    ek(M, "Yerden ısıtma emniyet termostatı (55 °C)", 1);
  }
  ek(M, "Dış hava sıcaklık sensörü + oda kumandası", 1, "Set");
  if (hatPompa) ek(M, `Isı pompası bağlantı borusu ${hatPompa.ad} (yalıtımlı, dış ortam UV dayanımlı)`, 2 * 5, "m");

  // Radyatörler
  const radGrup = new Map<string, number>();
  for (const o of odalar) for (const p of o.radyator?.parcalar ?? []) {
    const ad = `Panel radyatör ${RADYATOR_TIPLERI[p.tip].ad} ${p.yukseklik}×${p.boy} mm`;
    radGrup.set(ad, (radGrup.get(ad) ?? 0) + 1);
  }
  const radAdet = [...radGrup.values()].reduce((a, b) => a + b, 0);
  for (const [ad, adet] of [...radGrup.entries()].sort()) ek(R, ad, adet);
  if (radAdet > 0) {
    ek(R, "Termostatik radyatör vanası + dönüş (ayar) vanası seti", radAdet, "Set");
    ek(R, "Radyatör konsol ve montaj seti + hava tahliye", radAdet, "Set");
    if (hatRad) ek(R, `Radyatör ana hat borusu ${hatRad.ad} (gidiş + dönüş)`, Math.ceil(2 * v.anaHatUzunluk), "m");
    const bransman = radAdet * 2 * 6;
    ek(R, "Radyatör branşman borusu 16×2 / 20×2 (çok katmanlı)", bransman, "m");
  }

  // Yerden ısıtma
  if (yerdenVar) {
    const toplamBoru = odalar.reduce((t, o) => t + (o.yerden?.toplamBoru ?? 0), 0);
    const yerAlan = odalar.reduce((t, o) => t + (o.yerden?.alan ?? 0), 0);
    const cevre = odalar.filter((o) => o.yerden).reduce((t, o) => {
      const ham = v.odalar.find((x) => x.id === o.id);
      return t + (ham ? 2 * (ham.en + ham.boy) : 0);
    }, 0);
    ek(Y, `Fraenkische yerden ısıtma borusu ${boru.ad} (oksijen bariyerli)`, Math.ceil((toplamBoru * 1.05) / 10) * 10, "m");
    for (const k of kollektorler) {
      ek(Y, `Fraenkische yerden ısıtma kollektörü ${k.agiz} ağızlı (debimetreli, vanalı) — Kollektör ${k.no}`, 1);
      ek(Y, `Kollektör dolabı (${k.agiz} ağız için) — Kollektör ${k.no}`, 1);
      if (k.boru) ek(Y, `Kollektör besleme borusu ${k.boru.ad} (gidiş + dönüş) — Kollektör ${k.no}`, Math.ceil(2 * v.anaHatUzunluk), "m");
    }
    ek(Y, "Yerden ısıtma sistem levhası / yalıtım levhası (EN 1264-4'e göre)", Math.ceil(yerAlan * 1.05), "m²");
    ek(Y, "Kenar yalıtım bandı", Math.ceil(cevre * 1.05), "m");
    ek(Y, "Boru sabitleme klipsi", Math.ceil(toplamBoru * 2 / 100) * 100, "Adet");
    ek(Y, "Şap katkı maddesi (yerden ısıtma şapı için)", Math.ceil(yerAlan * 0.2), "kg");
    const odaSay = odalar.filter((o) => o.yerden).length;
    ek(Y, "Oda termostatı (yerden ısıtma)", odaSay);
    ek(Y, "Kollektör elektrotermik aktüatör", kollektorAgizlari);
    ek(Y, "Kablolama merkezi (termostat – aktüatör)", kollektorler.length);
  }
  ek("Montaj ve Devreye Alma", "Montaj, basınç testi, ilk dolum ve devreye alma", 1, "İş");

  // Genel uyarılar
  if (!v.odalar.length) uyarilar.push("Henüz oda girilmedi.");
  const disElemanYok = v.odalar.length > 0 && v.odalar.every((o) => !o.elemanlar.some((e) => ELEMAN_TURLERI[e.tur].sinif !== "KOMSU"));
  if (disElemanYok) uyarilar.push("Hiçbir odaya dış duvar / pencere / çatı girilmedi; ısı kaybı yalnızca havalandırmadan oluşuyor.");
  if (pompaGidis > 55) uyarilar.push(`Isı pompası gidiş sıcaklığı ${sy(pompaGidis)} °C; verim (SCOP) belirgin düşer. Radyatörleri 45–50 °C rejime göre büyütmek önerilir.`);

  return {
    il: il.ad,
    disSicaklik: disT,
    disSicaklikKaynak: v.disSicaklikElle !== null ? "elle girildi" : "TS 2164",
    odalar,
    toplamAlan,
    isiKaybi,
    altKayip,
    isitmaYuku,
    sicakSuYuku,
    tasarimYuku,
    wm2: toplamAlan > 0 ? isitmaYuku / toplamAlan : 0,
    radyatorVar,
    yerdenVar,
    karisimli,
    pompaGidis,
    yerdenGidis,
    yerdenDonusOrt: yerdenVar
      ? odalar.reduce((t, o) => t + (o.yerden ? o.yerden.donus * o.yerden.debi : 0), 0) / Math.max(1e-9, odalar.reduce((t, o) => t + (o.yerden?.debi ?? 0), 0))
      : null,
    yerdenTasarimOdasi: tasarimOdasi,
    radyatorRejimi,
    modeller: degerlendirmeler,
    secilenModel: secilen,
    yukEgrisi,
    boyler,
    tampon: { hacim: tamponHacim, gerekli: tamponGerekli, mod: v.tampon },
    sistemSuHacmi,
    genlesme,
    hatlar: { pompa: hatPompa, radyator: hatRad, yerden: hatYer },
    pompalar: {
      radyatorDebi,
      radyatorBasma: radyatorBasmaMbar / 98.1,
      yerdenDebi,
      yerdenBasma: yerdenBasmaMbar / 98.1,
      pompaDebi,
    },
    karisimVanasiKvs,
    kollektorler,
    malzemeler,
    uyarilar,
  };
}
