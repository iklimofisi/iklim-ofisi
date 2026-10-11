// -----------------------------------------------------------------------------
// HAVALANDIRMA HESABI — ANA HESAP MOTORU
// Saf fonksiyonlardır (veritabanı / tarayıcı kullanmaz): panelde canlı hesap,
// sunucuda PDF ve teklif aktarımı aynı kodla yapılır.
//
// Adımlar
//  1. Mahal debileri: kişi + alan (TS EN 16798-1 ya da ASHRAE 62.1), konut toplam ve
//     ıslak hacim egzozu, armatür / alan bazlı egzoz, mutfak davlumbazı (ASHRAE 154),
//     otopark (hava değişimi + alan, yangında 10 1/h), teknik mahal ısı atımı, kazan yanma havası
//  2. Santral dengesi: egzoz > besleme ise kuru mahallere geçiş havası kadar ek besleme
//  3. Kanal ağı: ana kanal + branşmanlar; hız ve sürtünme sınırına göre çap / ölçü,
//     Darcy-Weisbach (Swamee-Jain) sürtünme + yerel kayıplar, kritik hat
//  4. Santral: iç kayıplar, fan basınçları ve gücü, SFP sınıfı, ısı geri kazanımı (kış / yaz),
//     ön ısıtıcı (donma), ısıtıcı ve soğutucu batarya kapasiteleri (psikrometrik)
//  5. Malzeme listesi ve uyarılar
// -----------------------------------------------------------------------------
import { ilBul, IL_KAYNAGI } from "@/lib/isi-hesap/iklim";
import { sy } from "@/lib/isi-hesap/hesap";
import {
  MAHAL_TIPLERI,
  SANTRAL_TIPLERI,
  DAVLUMBAZ_TIPLERI,
  EN_KATEGORI,
  HIZ_SINIRLARI,
  MUTFAK_KANAL_HIZI,
  DAIRESEL_CAPLAR,
  SANTRAL_IC_KAYIP,
  UC_KAYIP,
  SFP_SINIFLARI,
  SANTRAL_KADEMELERI,
  KONUT_HRV_KADEMELERI,
  FAN_KADEMELERI,
  standartUst,
  type MahalTanimi,
  type Akustik,
  type SantralTipi,
} from "./katalog";
import type { HavalandirmaVerisi, Mahal, Santral } from "./tipler";

export { sy };

// ---------------------------------------------------------------------------
// Sonuç tipleri
// ---------------------------------------------------------------------------
export type MahalSonucu = {
  id: string;
  ad: string;
  tipAdi: string;
  yontem: MahalTanimi["yontem"];
  alan: number;
  hacim: number;
  kisi: number;
  besleme: number; // m³/h (hesap + dengeleme)
  egzoz: number; // m³/h
  dengeEk: number; // m³/h — santral dengesi için eklenen besleme (egzozda: konut dengesi için eklenen egzoz)
  dengeEkE: number;
  yangin: number; // m³/h — otopark duman tahliyesi
  ach: number; // 1/h
  basinc: "POZITIF" | "NEGATIF" | "DENGELI";
  aciklama: string; // debinin nasıl bulunduğu
  santral: number;
  egzozSantral: number;
  menfezB: number; // besleme uç eleman adedi
  menfezE: number; // egzoz uç eleman adedi
  ucKayipB: number; // Pa
  ucKayipE: number; // Pa
  transferCm2: number; // geçiş havası menfezi (kapı) alanı, cm²
  jetFan: number;
  coSensoru: number;
  uyarilar: string[];
};

export type KanalParcasi = {
  ad: string;
  tur: "ANA" | "HAT" | "BRANS";
  mahalId: string;
  debi: number; // m³/h
  uzunluk: number; // m
  sekil: "DAIRESEL" | "DIKDORTGEN";
  cap: number; // mm (dairesel)
  en: number; // mm (dikdörtgen genişlik)
  boy: number; // mm (dikdörtgen yükseklik)
  hiz: number; // m/s
  r: number; // Pa/m
  surtunme: number; // Pa
  yerel: number; // Pa
  toplam: number; // Pa
  etiket?: string; // tıklanıp değiştirilebilen girdi
};

export type KanalAgi = {
  tur: "BESLEME" | "EGZOZ";
  parcalar: KanalParcasi[];
  kritikMahal: string | null;
  kritikKanal: number; // Pa (kanal sürtünme + yerel)
  kritikUc: number; // Pa (uç eleman + regülatör)
  ek: number; // Pa (susturucu + yangın damperi)
  dis: number; // Pa — fanın dış statik basıncı (kanal tarafı)
  toplamUzunluk: number;
  mahalSirasi: string[];
};

export type SantralSonucu = {
  no: number;
  ad: string;
  tip: SantralTipi;
  tipAdi: string;
  akustik: Akustik;
  besleme: number; // m³/h
  egzoz: number;
  yangin: number; // otopark duman tahliyesi
  nominal: number; // kademe m³/h
  secim: string; // cihaz tanımı
  verim: number; // % duyulur ısı geri kazanımı (tasarım)
  verimEtkin: number; // % debi dengesine göre
  kesitM2: number; // santral iç kesiti (≈ 2,5 m/s)
  kis: { dis: number; onIsitici: number; hrSonrasi: number; hedef: number; isitici: number; geriKazanim: number };
  yaz: { disKT: number; hrSonrasi: number; hedef: number; sogutucu: number; duyulur: number; gizli: number; geriKazanim: number; nemCikis: number };
  suIsitici: number; // L/h
  suSogutucu: number; // L/h
  icB: [string, number][]; // besleme tarafı iç kayıplar
  icE: [string, number][];
  agB: KanalAgi | null;
  agE: KanalAgi | null;
  fanB: { dis: number; toplam: number; kw: number; sfp: number; sinif: string } | null;
  fanE: { dis: number; toplam: number; kw: number; sfp: number; sinif: string } | null;
  sfp: number; // W/(m³/s) — ünite toplamı (SFPE): fanların toplam gücü / büyük debi
  sfpSinif: string; // en kötü fanın sınıfı
  jetFan: number;
  coSensoru: number;
  mahaller: string[];
  uyarilar: string[];
};

export type Malzeme = { bolum: string; aciklama: string; adet: number; birim: string };

export type HavalandirmaSonucu = {
  il: string;
  disSicaklik: number;
  yazKT: number;
  yazYT: number;
  basinc: number; // kPa (rakıma göre)
  mahaller: MahalSonucu[];
  santraller: SantralSonucu[];
  toplamBesleme: number;
  toplamEgzoz: number;
  toplamAlan: number;
  toplamIsitici: number; // kW
  toplamSogutucu: number;
  toplamFanKw: number;
  malzemeler: Malzeme[];
  uyarilar: string[];
};

// ---------------------------------------------------------------------------
// Yardımcılar
// ---------------------------------------------------------------------------
const RHO = 1.2;
const NU = 1.5e-5;
const PURUZ = 0.00015; // m — galvaniz sac
const r0 = (x: number) => Math.round(x);
const tavan = (x: number, adim: number) => Math.ceil(x / adim - 1e-9) * adim;

// Psikrometri (ASHRAE Fundamentals)
function pws(t: number) {
  // kPa, Magnus–Tetens (−40…+60 °C, ±%0,5)
  return 0.61094 * Math.exp((17.625 * t) / (t + 243.04));
}
const wNem = (pw: number, p: number) => (0.622 * pw) / Math.max(0.1, p - pw);
function wYasTer(t: number, twb: number, p: number) {
  const wsw = wNem(pws(twb), p);
  return Math.max(0, ((2501 - 2.326 * twb) * wsw - 1.006 * (t - twb)) / (2501 + 1.86 * t - 4.186 * twb));
}
const entalpi = (t: number, w: number) => 1.006 * t + w * (2501 + 1.86 * t); // kJ/kg

// Swamee-Jain sürtünme katsayısı ve Pa/m
function surtunmeR(hiz: number, dh: number) {
  if (hiz <= 0 || dh <= 0) return 0;
  const re = (hiz * dh) / NU;
  const f = 0.25 / Math.pow(Math.log10(PURUZ / (3.7 * dh) + 5.74 / Math.pow(re, 0.9)), 2);
  return (f / dh) * ((RHO * hiz * hiz) / 2);
}

type Olcu = { sekil: "DAIRESEL" | "DIKDORTGEN"; cap: number; en: number; boy: number; hiz: number; r: number; cevre: number };

function daireselOlcu(qm3h: number, cap: number): Olcu {
  const d = cap / 1000;
  const a = (Math.PI * d * d) / 4;
  const hiz = qm3h / 3600 / a;
  return { sekil: "DAIRESEL", cap, en: 0, boy: 0, hiz, r: surtunmeR(hiz, d), cevre: Math.PI * d };
}
function dikdortgenOlcu(qm3h: number, en: number, boy: number): Olcu {
  const a = (en / 1000) * (boy / 1000);
  const hiz = qm3h / 3600 / a;
  const dh = (2 * (en / 1000) * (boy / 1000)) / (en / 1000 + boy / 1000);
  return { sekil: "DIKDORTGEN", cap: 0, en, boy, hiz, r: surtunmeR(hiz, dh), cevre: (2 * (en + boy)) / 1000 };
}

// Hız ve sürtünme sınırını sağlayan en küçük kanal (dikdörtgende en az sac çevresi)
function kanalSec(q: number, vMaks: number, rMaks: number, sekil: "DAIRESEL" | "DIKDORTGEN", hMaks: number, vMin = 0): Olcu {
  if (sekil === "DAIRESEL") {
    let son: Olcu | null = null;
    for (const c of DAIRESEL_CAPLAR) {
      const o = daireselOlcu(q, c);
      son = o;
      if (o.hiz <= vMaks + 1e-9 && o.r <= rMaks + 1e-9) {
        // Mutfak yağlı egzozunda hız alt sınırın altına düşmesin
        if (vMin > 0 && o.hiz < vMin) {
          const i = DAIRESEL_CAPLAR.indexOf(c);
          if (i > 0) return daireselOlcu(q, DAIRESEL_CAPLAR[i - 1]);
        }
        return o;
      }
    }
    return son!;
  }
  let en: Olcu | null = null;
  for (let b = 100; b <= Math.max(100, hMaks); b += 50) {
    for (let w = b; w <= 3000; w += 50) {
      if (w / b > 4) break;
      const o = dikdortgenOlcu(q, w, b);
      if (o.hiz <= vMaks + 1e-9 && o.r <= rMaks + 1e-9) {
        if (!en || o.cevre < en.cevre - 1e-9 || (Math.abs(o.cevre - en.cevre) < 1e-9 && o.hiz > en.hiz)) en = o;
        break;
      }
    }
  }
  if (en) return en;
  // Yükseklik sınırıyla sağlanamıyorsa en yakın büyük kesit (oran sınırı esnetilir)
  const b = Math.max(100, hMaks);
  const w = tavan((q / 3600 / vMaks / (b / 1000)) * 1000, 50);
  return dikdortgenOlcu(q, Math.max(b, w), b);
}

export function olcuYaz(p: { sekil: "DAIRESEL" | "DIKDORTGEN"; cap: number; en: number; boy: number }) {
  return p.sekil === "DAIRESEL" ? `Ø${p.cap}` : `${p.en}×${p.boy}`;
}

// ---------------------------------------------------------------------------
// 1. MAHAL DEBİLERİ
// ---------------------------------------------------------------------------
function mahalDebisi(m: Mahal, v: HavalandirmaVerisi, yazKT: number) {
  const t: MahalTanimi = MAHAL_TIPLERI[m.tip];
  const A = m.en * m.boy;
  const V = A * m.yukseklik;
  const kat = EN_KATEGORI[v.kategori];
  const uy: string[] = [];
  let b = 0; // L/s
  let e = 0;
  let kisi = 0;
  let aciklama = "";
  let yangin = 0;
  let jetFan = 0;
  let coSensoru = 0;
  const lsm = (x: number) => sy(x, 1);
  switch (t.yontem) {
    case "KISI_ALAN": {
      kisi = m.kisi > 0 ? m.kisi : t.yogunluk ? Math.ceil(A / t.yogunluk - 1e-9) : 0;
      if (v.yontem === "EN16798") {
        const qa = kat.alan[v.kirlilik];
        b = kisi * kat.kisi + A * qa;
        aciklama = `TS EN 16798-1 Kat. ${v.kategori}: ${kisi} kişi × ${kat.kisi} l/s + ${sy(A)} m² × ${sy(qa, 2)} l/s·m² = ${lsm(b)} l/s`;
      } else {
        const rp = t.rp ?? 2.5;
        const ra = t.ra ?? 0.3;
        b = (rp * kisi + ra * A) / v.ez;
        aciklama = `ASHRAE 62.1: (${sy(rp, 1)} l/s × ${kisi} kişi + ${sy(ra, 2)} l/s·m² × ${sy(A)} m²) / Ez ${sy(v.ez, 2)} = ${lsm(b)} l/s`;
      }
      if (t.minAch && (t.minAch * V) / 3.6 > b) {
        b = (t.minAch * V) / 3.6;
        aciklama += ` → en az ${t.minAch} hava değişimi: ${lsm(b)} l/s`;
      }
      e = b * (t.egzozOrani ?? 0.8);
      break;
    }
    case "KONUT_KURU": {
      kisi = m.kisi > 0 ? m.kisi : Math.max(1, Math.ceil(A / (t.yogunluk ?? 8) - 1e-9));
      const qk = kisi * kat.konutKisi;
      const qa = A * kat.konutAlan;
      b = Math.max(qk, qa);
      aciklama = `TS EN 16798-1 konut Kat. ${v.kategori}: en büyüğü (${kisi} kişi × ${kat.konutKisi} l/s = ${lsm(qk)}; ${sy(A)} m² × ${sy(kat.konutAlan, 2)} = ${lsm(qa)}) = ${lsm(b)} l/s`;
      break;
    }
    case "KONUT_ISLAK": {
      e = (t.egzozSabit ?? 15) * kat.islak;
      aciklama = `TS EN 16798-1 / EN 15251 ıslak hacim egzozu Kat. ${v.kategori}: ${lsm(e)} l/s (besleme kuru odalardan geçiş havasıyla)`;
      break;
    }
    case "ARMATUR": {
      const q = (t.armatur ?? 25) * Math.max(1, m.armatur);
      const qach = t.minAch ? (t.minAch * V) / 3.6 : 0;
      e = Math.max(q, qach);
      aciklama = `${Math.max(1, m.armatur)} armatür × ${t.armatur} l/s = ${lsm(q)} l/s${qach > q ? ` → en az ${t.minAch} hava değişimi: ${lsm(qach)} l/s` : ""} (sürekli egzoz; besleme geçiş havasıyla)`;
      break;
    }
    case "EGZOZ_ALAN": {
      const qa = (t.egzozAlan ?? 2.5) * A;
      const qd = m.tip === "DUS_SOYUNMA" ? (t.armatur ?? 25) * m.armatur : 0;
      e = qa + qd;
      aciklama = `${sy(A)} m² × ${sy(t.egzozAlan ?? 2.5, 1)} l/s·m²${qd ? ` + ${m.armatur} duş × ${t.armatur} l/s` : ""} = ${lsm(e)} l/s`;
      break;
    }
    case "MUTFAK": {
      const d = DAVLUMBAZ_TIPLERI[m.davlumbazTip];
      const birim = d.yuk[m.pisirmeYuku];
      if (m.davlumbazM > 0) {
        e = birim * m.davlumbazM;
        aciklama = `ASHRAE 154 / IMC: ${d.ad.toLocaleLowerCase("tr-TR")} ${sy(m.davlumbazM)} m × ${birim} l/s·m = ${lsm(e)} l/s`;
      } else {
        e = 3.5 * A;
        aciklama = `Davlumbaz girilmedi: genel mutfak egzozu ${sy(A)} m² × 3,5 l/s·m² = ${lsm(e)} l/s`;
        uy.push("Pişirme cihazları için davlumbaz uzunluğunu girin; davlumbazsız ticari mutfak yönetmeliğe aykırıdır.");
      }
      b = e * 0.85;
      aciklama += `; telafi havası %85 = ${lsm(b)} l/s (mutfak hafif negatif basınçta)`;
      break;
    }
    case "OTOPARK": {
      const qAch = (6 * V) / 3.6;
      const qAlan = 3.7 * A;
      e = Math.max(qAch, qAlan);
      yangin = (10 * V) / 3.6;
      b = e * 0.8;
      jetFan = Math.max(1, Math.ceil(A / 550));
      coSensoru = Math.max(1, Math.ceil(A / 400));
      aciklama = `Normal: en büyüğü (6 hava değişimi = ${lsm(qAch)}; ASHRAE 62.1 3,7 l/s·m² × ${sy(A)} m² = ${lsm(qAlan)}) = ${lsm(e)} l/s · Duman tahliyesi: 10 hava değişimi = ${lsm(yangin)} l/s · Taze hava %80`;
      if (A > 2000) uy.push("2000 m² üstü kapalı otopark: saatte en az 10 hava değişimli mekanik duman tahliyesi zorunludur (Binaların Yangından Korunması Hakkında Yönetmelik).");
      break;
    }
    case "TEKNIK_ISI": {
      let dT = m.tMaks - yazKT;
      if (dT < 5) {
        uy.push(
          `Yazın dış hava ${sy(yazKT)} °C, izin verilen iç sıcaklık ${sy(m.tMaks)} °C: dış havayla ısı atımı için sıcaklık farkı yetersiz. Hesapta ΔT = 5 K alındı (en sıcak saatlerde iç sıcaklık ${sy(yazKT + 5)} °C'ye çıkar); daha düşük sıcaklık gerekiyorsa mekanik soğutma (split / hassas klima) eklenmelidir.`
        );
        dT = 5;
      }
      b = (m.isiKw * 1000) / (0.34 * dT) / 3.6;
      e = b;
      aciklama = `Isı atımı: ${sy(m.isiKw, 1)} kW / (0,34 × ΔT ${sy(dT, 1)} K) = ${sy(b * 3.6, 0)} m³/h (iç en çok ${sy(m.tMaks)} °C, dış ${sy(yazKT)} °C)`;
      break;
    }
    case "KAZAN": {
      b = (m.kazanKw * 1.6) / 3.6;
      e = 0;
      aciklama = `Yanma havası: ${sy(m.kazanKw, 0)} kW × 1,6 m³/h·kW = ${sy(b * 3.6, 0)} m³/h (hava fazlası ve emniyet dahil); kazan dairesi negatif basınca düşürülmez, üst menfezle doğal atış`;
      break;
    }
    case "HAVA_DEGISIMI": {
      const n = m.ach ?? t.ach ?? 1;
      b = (n * V) / 3.6;
      e = b;
      aciklama = n > 0 ? `${sy(n, 1)} hava değişimi × ${sy(V, 0)} m³ = ${sy(b * 3.6, 0)} m³/h` : "Geçiş hacmi (besleme / egzoz yok)";
      break;
    }
  }
  let bm3 = b * 3.6;
  let em3 = e * 3.6;
  if (m.besElle !== null) {
    bm3 = m.besElle;
    aciklama += ` · besleme elle ${sy(bm3, 0)} m³/h`;
  }
  if (m.egzElle !== null) {
    em3 = m.egzElle;
    aciklama += ` · egzoz elle ${sy(em3, 0)} m³/h`;
  }
  if (t.not) uy.push(t.not);
  return { b: bm3, e: em3, kisi, aciklama, yangin: yangin * 3.6, jetFan, coSensoru, uy, A, V, t };
}

// ---------------------------------------------------------------------------
// 3. KANAL AĞI (zincir: santral —ana— B1 —— B2 —— …; her branşmandan bir mahal)
// ---------------------------------------------------------------------------
type AgMahal = { m: Mahal; q: number; uc: number };
// Zincirde i. mahalin gövde uzunluğu: ilk mahal için santral ana hattı; sonrakiler için
// bir önceki ağ mahalinden bu mahale kadar listedeki bütün mahallerin "önceki branşmandan" mesafeleri
function govdeUzunluklari(ag: Mahal[], tum: Mahal[], anaHat: number): number[] {
  const sira = tum.map((m) => m.id);
  const sonuc: number[] = [];
  let onceki = -1;
  ag.forEach((m, i) => {
    const idx = sira.indexOf(m.id);
    if (i === 0) sonuc.push(anaHat);
    else {
      let L = 0;
      for (let k = onceki + 1; k <= idx; k++) L += tum[k].hatMesafe;
      sonuc.push(L);
    }
    onceki = idx;
  });
  return sonuc;
}

// ---------------------------------------------------------------------------
// ANA HESAP
// ---------------------------------------------------------------------------
export function havalandirmaHesapla(v: HavalandirmaVerisi): HavalandirmaSonucu {
  const il = ilBul(v.il);
  const disT = v.disSicaklikElle ?? il.disSicaklik;
  const yazKT = v.yazKTElle ?? il.yazKT;
  const yazYT = Math.min(yazKT, v.yazYTElle ?? il.yazYT);
  const p = 101.325 * Math.pow(1 - 2.25577e-5 * il.rakim, 5.2559);
  const rho = (RHO * p) / 101.325;
  const uyarilar: string[] = [];
  const santralNo = new Set(v.santraller.map((s) => s.no));

  // 1) Mahal debileri
  const ham = v.mahaller.map((m) => ({ m, d: mahalDebisi(m, v, yazKT) }));
  const mahaller: MahalSonucu[] = ham.map(({ m, d }) => {
    const sNo = santralNo.has(m.santral) ? m.santral : 0;
    const eNo = m.egzozSantral === null ? sNo : santralNo.has(m.egzozSantral) ? m.egzozSantral : 0;
    const uy = [...d.uy];
    if (m.santral > 0 && !santralNo.has(m.santral)) uy.push(`Santral ${m.santral} tanımlı değil; mahal santralsiz kabul edildi.`);
    return {
      id: m.id,
      ad: m.ad,
      tipAdi: d.t.ad,
      yontem: d.t.yontem,
      alan: d.A,
      hacim: d.V,
      kisi: d.kisi,
      besleme: d.b,
      egzoz: d.e,
      dengeEk: 0,
      dengeEkE: 0,
      yangin: d.yangin,
      ach: 0,
      basinc: "DENGELI",
      aciklama: d.aciklama,
      santral: sNo,
      egzozSantral: eNo,
      menfezB: 0,
      menfezE: 0,
      ucKayipB: 0,
      ucKayipE: 0,
      transferCm2: 0,
      jetFan: d.jetFan,
      coSensoru: d.coSensoru,
      uyarilar: uy,
    };
  });
  const mBul = (id: string) => mahaller.find((x) => x.id === id)!;

  // 2) Santral dengesi: egzoz > besleme ise kuru mahallere geçiş havası kadar ek besleme.
  // Bölgenin egzozu: bu santralin beslediği mahallerin egzozu (ayrı egzoz fanıyla atılsa da — ör. WC egzoz fanı;
  // kendi telafi havası olan mutfak / otopark hariç) + bu santralin emdiği, beslemesi olmayan mahallerin egzozu.
  const santralTipi = (no: number) => v.santraller.find((s) => s.no === no)?.tip;
  const beslemeVar = (no: number) => {
    const t = santralTipi(no);
    return !!t && SANTRAL_TIPLERI[t].besleme;
  };
  for (const s of v.santraller) {
    const st = SANTRAL_TIPLERI[s.tip];
    if (!st.besleme || s.tip === "MUTFAK" || s.tip === "OTOPARK") continue;
    const B = mahaller.filter((x) => x.santral === s.no).reduce((t, x) => t + x.besleme, 0);
    const E = mahaller
      .filter(
        (x) =>
          (x.santral === s.no && x.egzozSantral !== s.no ? x.egzozSantral > 0 && santralTipi(x.egzozSantral) !== "MUTFAK" && santralTipi(x.egzozSantral) !== "OTOPARK" : false) ||
          (x.egzozSantral === s.no && (x.santral === s.no || !beslemeVar(x.santral)))
      )
      .reduce((t, x) => t + x.egzoz, 0);
    if (!st.egzoz && E <= 1) continue;
    if (E > B + 1) {
      const kuru = mahaller.filter((x) => x.santral === s.no && x.besleme > 0 && (x.yontem === "KISI_ALAN" || x.yontem === "KONUT_KURU"));
      const kTop = kuru.reduce((t, x) => t + x.besleme, 0);
      if (kTop > 0) {
        const ek = E - B;
        for (const x of kuru) {
          x.dengeEk = (ek * x.besleme) / kTop;
          x.besleme += x.dengeEk;
        }
      }
    }
  }

  // Konut cihazı dengeli çalışır: besleme egzozdan büyükse fark ıslak hacimlerden ek egzozla alınır (EN 16798-1: toplam debi büyük olana göre)
  for (const s of v.santraller.filter((x) => x.tip === "KONUT_HRV")) {
    const B = mahaller.filter((x) => x.santral === s.no).reduce((t, x) => t + x.besleme, 0);
    const E = mahaller.filter((x) => x.egzozSantral === s.no).reduce((t, x) => t + x.egzoz, 0);
    const islak = mahaller.filter((x) => x.egzozSantral === s.no && x.egzoz > 0 && x.yontem !== "KISI_ALAN" && x.yontem !== "KONUT_KURU");
    const iTop = islak.reduce((t, x) => t + x.egzoz, 0);
    if (B > E + 1 && iTop > 0)
      for (const x of islak) {
        x.dengeEkE = ((B - E) * x.egzoz) / iTop;
        x.egzoz += x.dengeEkE;
      }
  }

  // Mahal uç elemanları, basınç durumu, geçiş menfezi
  for (const x of mahaller) {
    const m = v.mahaller.find((y) => y.id === x.id)!;
    const t = MAHAL_TIPLERI[m.tip];
    const sB = v.santraller.find((s) => s.no === x.santral);
    const sE = v.santraller.find((s) => s.no === x.egzozSantral);
    const akB = sB ? (sB.akustik === "OTO" ? t.akustik : sB.akustik) : t.akustik;
    const akE = sE ? (sE.akustik === "OTO" ? t.akustik : sE.akustik) : t.akustik;
    x.ach = x.hacim > 0 ? Math.max(x.besleme, x.egzoz) / x.hacim : 0;
    x.basinc = x.besleme > x.egzoz * 1.05 + 1 ? "POZITIF" : x.egzoz > x.besleme * 1.05 + 1 ? "NEGATIF" : "DENGELI";
    x.menfezB = x.besleme > 0.5 ? Math.max(1, Math.ceil(x.besleme / HIZ_SINIRLARI[akB].menfezDebi - 1e-9)) : 0;
    if (t.yontem === "OTOPARK") {
      // Jet fanlı sistemde hava şaft ağızlarından (≈ 20.000 m³/h), kanallı sistemde ızgaralardan (≈ 3.000 m³/h)
      const jet = (sE ?? sB)?.otoparkSistemi !== "KANALLI";
      const birim = jet ? 20000 : 3000;
      x.menfezB = x.besleme > 0.5 ? Math.max(1, Math.ceil(x.besleme / birim - 1e-9)) : 0;
      x.menfezE = Math.max(1, Math.ceil(Math.max(x.egzoz, x.yangin) / birim - 1e-9));
    } else if (t.yontem === "MUTFAK") x.menfezE = x.egzoz > 0.5 ? Math.max(1, Math.ceil(m.davlumbazM / 4 - 1e-9)) : 0;
    else if (t.yontem === "ARMATUR" || t.yontem === "KONUT_ISLAK") x.menfezE = x.egzoz > 0.5 ? Math.max(1, t.yontem === "ARMATUR" ? Math.max(1, m.armatur) : 1) : 0;
    else x.menfezE = x.egzoz > 0.5 ? Math.max(1, Math.ceil(x.egzoz / HIZ_SINIRLARI[akE].menfezDebi - 1e-9)) : 0;
    x.ucKayipB = x.besleme > 0.5 ? (akB === "ENDUSTRIYEL" ? UC_KAYIP.izgara : akB === "SESSIZ" ? UC_KAYIP.beslemeSessiz : UC_KAYIP.besleme) + (sB?.regulator ? UC_KAYIP.regulator : 0) : 0;
    x.ucKayipE =
      x.egzoz > 0.5
        ? (t.yontem === "MUTFAK" ? UC_KAYIP.davlumbaz : t.yontem === "ARMATUR" || t.yontem === "KONUT_ISLAK" ? UC_KAYIP.wcValf : akE === "ENDUSTRIYEL" ? UC_KAYIP.izgara : UC_KAYIP.egzoz) +
          (sE?.regulator ? UC_KAYIP.regulator : 0)
        : 0;
    // Geçiş havası: egzozun beslemeyi aştığı kısım kapı menfezi / kapı altı boşluğundan ≈ 1 m/s ile
    const fark = x.egzoz - x.besleme;
    if (fark > 5 && t.yontem !== "OTOPARK" && t.yontem !== "MUTFAK") x.transferCm2 = tavan(((fark / 3600) / 1.0) * 10000, 10);
    if (t.yontem === "MUTFAK" && x.santral !== x.egzozSantral) x.uyarilar.push("Mutfak telafi havası ve egzozu aynı santral grubunda (mutfak santrali) olmalıdır.");
    if (x.santral === 0 && x.besleme > 0.5 && t.yontem !== "KAZAN") x.uyarilar.push("Besleme santrali seçilmedi: bu debi doğal yolla (pencere / menfez) karşılanacak kabul edildi.");
    if (x.egzozSantral === 0 && x.egzoz > 0.5) x.uyarilar.push("Egzoz için santral / fan seçilmedi.");
  }

  // 3–4) Santraller
  const santraller: SantralSonucu[] = [];
  for (const s of v.santraller) {
    const st = SANTRAL_TIPLERI[s.tip];
    const uy: string[] = [];
    const bListe = mahaller.filter((x) => x.santral === s.no && x.besleme > 0.5);
    const eListe = mahaller.filter((x) => x.egzozSantral === s.no && x.egzoz > 0.5);
    const ilgili = mahaller.filter((x) => x.santral === s.no || x.egzozSantral === s.no);
    if (!ilgili.length) continue;
    const akustik: Akustik =
      s.akustik !== "OTO"
        ? s.akustik
        : (() => {
            const l = ilgili.map((x) => MAHAL_TIPLERI[v.mahaller.find((y) => y.id === x.id)!.tip].akustik);
            return l.includes("SESSIZ") ? "SESSIZ" : l.every((a) => a === "ENDUSTRIYEL") ? "ENDUSTRIYEL" : "STANDART";
          })();
    const otopark = s.tip === "OTOPARK";
    const mutfak = s.tip === "MUTFAK";
    const B = st.besleme ? bListe.reduce((t, x) => t + x.besleme, 0) : 0;
    const E = st.egzoz ? eListe.reduce((t, x) => t + x.egzoz, 0) : 0;
    const Y = otopark ? eListe.reduce((t, x) => t + x.yangin, 0) : 0;
    if (!st.besleme && bListe.length)
      uy.push(
        `${st.ad} besleme yapmaz; ${bListe
          .map((x) => `${x.ad} (${sy(x.besleme, 0)} m³/h → dış duvarda ≥ ${sy(tavan((x.besleme / 3600 / 2) * 10000, 10), 0)} cm² net hava giriş panjuru)`)
          .join(", ")} beslemesi doğal yolla panjurdan alınır (≈ 2 m/s). Mekanik besleme isteniyorsa mahale taze hava santrali seçin.`
      );
    if (!st.egzoz && eListe.length) uy.push(`${st.ad} egzoz yapmaz: ${eListe.map((x) => x.ad).join(", ")} egzozu için egzoz fanı / santral seçin.`);

    // Uygunluk uyarıları
    for (const x of eListe) {
      const y = MAHAL_TIPLERI[v.mahaller.find((z) => z.id === x.id)!.tip].yontem;
      if (y === "MUTFAK" && !mutfak) uy.push(`${x.ad}: yağlı davlumbaz egzozu ısı geri kazanımlı / genel santrale bağlanmaz; "Mutfak egzoz fanı + telafi" santrali seçin.`);
      if ((y === "ARMATUR" || y === "KONUT_ISLAK") && s.tip === "AHU_ROTOR") uy.push(`${x.ad}: rotorlu eşanjör koku taşıyabilir; WC / banyo egzozu ayrı egzoz fanına ya da plakalı eşanjörlü santrale bağlanmalı.`);
      if (y === "OTOPARK" && !otopark) uy.push(`${x.ad}: otopark egzozu otopark fan sistemine bağlanmalı.`);
    }

    // Kanal ağları
    const tumSira = v.mahaller.filter((m) => {
      const r = mBul(m.id);
      return r.santral === s.no || r.egzozSantral === s.no;
    });
    const hr = st.hr;
    const susturucu = s.tip === "KONUT_HRV" ? 20 : hr || s.tip === "TAZE_HAVA" ? SANTRAL_IC_KAYIP.susturucu : 0;
    const ekB = susturucu + s.yanginDamperi * UC_KAYIP.yanginDamperi;
    const ekE = susturucu + s.yanginDamperi * UC_KAYIP.yanginDamperi;
    const bAg: AgMahal[] = st.besleme ? bListe.map((x) => ({ m: v.mahaller.find((y) => y.id === x.id)!, q: x.besleme, uc: x.ucKayipB })) : [];
    const eAg: AgMahal[] = st.egzoz
      ? eListe.map((x) => ({
          m: v.mahaller.find((y) => y.id === x.id)!,
          q: otopark ? Math.max(x.egzoz, x.yangin) : x.egzoz,
          uc: otopark && s.otoparkSistemi === "JETFAN" ? UC_KAYIP.izgara : x.ucKayipE,
        }))
      : [];
    const sirala = (l: AgMahal[]) => l.sort((a, b) => tumSira.indexOf(a.m) - tumSira.indexOf(b.m));
    const hMaks = s.kanalYukseklik ?? v.kanalYukseklikMaks;
    const agB = kanalAgiUzunluklu("BESLEME", s, sirala(bAg), tumSira, akustik, hMaks, false, ekB);
    const agE = kanalAgiUzunluklu("EGZOZ", s, sirala(eAg), tumSira, akustik, hMaks, mutfak, mutfak ? 0 : ekE);

    // Santral iç kayıpları
    const ic = SANTRAL_IC_KAYIP;
    const icB: [string, number][] = [];
    const icE: [string, number][] = [];
    if (st.besleme) {
      if (s.tip === "KONUT_HRV") {
        icB.push(["Dış hava emiş menfezi + kanal", 20], ["Cihaz içi (eşanjör + G4 / F7 filtre)", ic.konutCihaz]);
      } else {
        icB.push(["Dış hava panjuru / emiş", ic.disHavaPanjur]);
        if (!otopark) icB.push(["Ön filtre ePM10 ≥ %50 (M5)", ic.filtreOn]);
        if (!otopark && !mutfak) icB.push(["İnce filtre ePM1 ≥ %50 (F7)", ic.filtreInce]);
        if (s.tip === "AHU_PLAKA") icB.push(["Plakalı eşanjör", ic.plaka]);
        if (s.tip === "AHU_ROTOR") icB.push(["Rotorlu eşanjör", ic.rotor]);
        if (s.tip === "AHU_ARA") icB.push(["Ara akışkanlı batarya", ic.ara]);
        if (s.isitici) icB.push(["Isıtıcı batarya", ic.isitici]);
        if (s.sogutucu) icB.push(["Soğutucu batarya + damla tutucu", ic.sogutucu]);
        icB.push(["Fan giriş / çıkış etkisi", ic.fanEtkisi]);
      }
    }
    if (st.egzoz) {
      if (s.tip === "KONUT_HRV") icE.push(["Cihaz içi (eşanjör + filtre)", ic.konutCihaz], ["Atış menfezi + kanal", 20]);
      else {
        if (hr) icE.push(["Egzoz filtresi ePM10 ≥ %50 (M5)", ic.filtreOn]);
        if (s.tip === "AHU_PLAKA") icE.push(["Plakalı eşanjör", ic.plaka]);
        if (s.tip === "AHU_ROTOR") icE.push(["Rotorlu eşanjör", ic.rotor]);
        if (s.tip === "AHU_ARA") icE.push(["Ara akışkanlı batarya", ic.ara]);
        icE.push(["Atış panjuru / çatı çıkışı", ic.disHavaPanjur], ["Fan giriş / çıkış etkisi", ic.fanEtkisi]);
      }
    }
    const icTop = (l: [string, number][]) => l.reduce((t, x) => t + x[1], 0);
    // Fan sistem verimi (fan + motor + sürücü, EC / plug fan): < 1000 m³/h ≈ 0,45 · < 5000 ≈ 0,55 · üstü ≈ 0,62; konut cihazı ≈ 0,35
    const eta = (q: number) => (s.tip === "KONUT_HRV" ? 0.35 : q < 1000 ? 0.45 : q < 5000 ? 0.55 : 0.62);
    const sinifBul = (x: number) => SFP_SINIFLARI.find(([, sinir]) => x <= sinir)?.[0] ?? "SFP 7";
    const fan = (q: number, ag: KanalAgi | null, icl: [string, number][]) => {
      if (q <= 0.5) return null;
      const dis = ag ? ag.dis : 50;
      const toplam = dis + icTop(icl);
      const kw = ((q / 3600) * toplam) / eta(q) / 1000;
      const sfpF = (kw * 1000) / (q / 3600);
      return { dis, toplam, kw, sfp: sfpF, sinif: sinifBul(sfpF) };
    };
    const fanB = st.besleme ? fan(B, agB, icB) : null;
    // Otopark fanı yangın debisine göre seçilir; enerji (SFP) normal işletme debisinde hesaplanır
    const fanE = st.egzoz ? fan(otopark ? Math.max(E, Y) : E, agE, icE) : null;
    const qMaks = Math.max(B, E);
    const fanKwNormal = (fanB?.kw ?? 0) + (otopark && fanE ? ((E / 3600) * fanE.toplam) / eta(E) / 1000 : fanE?.kw ?? 0);
    const sfp = qMaks > 0 ? (fanKwNormal * 1000) / (qMaks / 3600) : 0;
    const enKotu = Math.max(fanB?.sfp ?? 0, otopark ? 0 : fanE?.sfp ?? 0);
    const sfpSinif = sinifBul(enKotu);

    // Isı geri kazanımı ve bataryalar
    const verim = hr ? s.verimElle ?? st.verim : 0;
    const verimEtkin = hr && B > 0 ? verim * Math.min(1, E / B) : 0;
    const eta1 = verimEtkin / 100;
    const nemEta = hr ? (st.nemVerim / 100) * Math.min(1, E / Math.max(1, B)) : 0;
    // Kış
    const donma = s.tip === "AHU_PLAKA" ? -5 : s.tip === "KONUT_HRV" ? -3 : -100;
    const girisKis = hr && disT < donma ? donma : disT;
    const onIsitici = hr && disT < donma && B > 0 ? (0.34 * B * (donma - disT)) / 1000 : 0;
    const hrKis = girisKis + eta1 * (v.icKis - girisKis);
    const hedefKis = s.beslemeKis;
    const isitici = st.besleme && s.isitici && !otopark ? Math.max(0, (0.34 * B * (hedefKis - hrKis)) / 1000) : 0;
    const gkKis = (0.34 * B * (hrKis - girisKis)) / 1000;
    if (st.besleme && !otopark && !s.isitici && hrKis < hedefKis - 2 && B > 0)
      uy.push(`Isıtıcı batarya yok: kışın besleme havası ≈ ${sy(hrKis, 1)} °C ile odaya girer (soğuk hava hissi, cereyan). Isıtıcı batarya eklenmesi önerilir.`);
    if (onIsitici > 0) uy.push(`Dış hava ${sy(disT)} °C: eşanjörde donmayı önlemek için ≈ ${sy(onIsitici, 1)} kW ön ısıtıcı (ya da donma korumalı by-pass) gerekir.`);
    // Yaz
    const wDis = wYasTer(yazKT, yazYT, p);
    const wIc = wNem((pws(v.icYaz) * v.icNem) / 100, p);
    const hrYazT = yazKT - eta1 * (yazKT - v.icYaz);
    const hrYazW = wDis - nemEta * (wDis - wIc);
    const hedefYaz = s.beslemeYaz;
    let sogutucu = 0;
    let duyulur = 0;
    let gizli = 0;
    let nemCikis = hrYazW;
    if (st.besleme && s.sogutucu && !otopark && B > 0 && hrYazT > hedefYaz) {
      const wDoyma = wNem(pws(hedefYaz) * 0.95, p);
      nemCikis = Math.min(hrYazW, wDoyma);
      const m = (rho * B) / 3600; // kg/s
      sogutucu = m * (entalpi(hrYazT, hrYazW) - entalpi(hedefYaz, nemCikis));
      duyulur = m * (1.006 + 1.86 * hrYazW) * (hrYazT - hedefYaz);
      gizli = Math.max(0, sogutucu - duyulur);
    }
    const gkYaz = ((rho * B) / 3600) * (entalpi(yazKT, wDis) - entalpi(hrYazT, hrYazW));
    if (st.besleme && !s.sogutucu && !otopark && hrYazT > v.icYaz + 1 && B > 0 && !mutfak)
      uy.push(`Soğutucu batarya yok: yazın besleme havası ≈ ${sy(hrYazT, 1)} °C; oda klimaları bu taze hava yükünü (≈ ${sy((0.34 * B * (hrYazT - v.icYaz)) / 1000, 1)} kW duyulur) ayrıca karşılamalıdır.`);
    const [ig, id] = v.isitmaRejimi;
    const [sg, sd] = v.sogutmaRejimi;
    const suIsitici = isitici > 0 && ig > id ? (isitici * 860) / (ig - id) : 0;
    const suSogutucu = sogutucu > 0 && sd > sg ? (sogutucu * 860) / (sd - sg) : 0;

    // Seçim
    const kademe = s.tip === "KONUT_HRV" ? KONUT_HRV_KADEMELERI : hr || s.tip === "TAZE_HAVA" ? SANTRAL_KADEMELERI : FAN_KADEMELERI;
    const nominal = standartUst(kademe, otopark ? Math.max(qMaks, Y) : qMaks);
    const kesitM2 = qMaks / 3600 / 2.5;
    let secim = "";
    if (s.tip === "KONUT_HRV")
      secim = `Konut tipi ısı geri kazanımlı havalandırma cihazı ${nominal} m³/h (verim ≥ %${sy(verim, 0)}, by-pass, G4 / F7 filtre, EC fan), dış statik basınç ≈ ${r0(Math.max(fanB?.dis ?? 0, fanE?.dis ?? 0))} Pa`;
    else if (hr)
      secim = `Isı geri kazanımlı klima santrali ${nominal} m³/h kademesi — besleme ${r0(B)} / egzoz ${r0(E)} m³/h, ${st.ad.split("—")[1]?.trim() ?? ""} verim %${sy(verim, 0)}, ePM1 %50 + ePM10 %50 filtre, EC fan, dış statik basınç besleme ${r0(fanB?.dis ?? 0)} / egzoz ${r0(fanE?.dis ?? 0)} Pa`;
    else if (s.tip === "TAZE_HAVA") secim = `Taze hava santrali ${nominal} m³/h kademesi — ${r0(B)} m³/h, ${r0(fanB?.dis ?? 0)} Pa dış statik basınç`;
    else if (s.tip === "EGZOZ") secim = `Egzoz fanı ${r0(E)} m³/h, ${r0(fanE?.toplam ?? 0)} Pa (kanal tipi / çatı tipi, EC motor)`;
    else if (mutfak)
      secim = `Mutfak egzoz fanı ${r0(E)} m³/h, ${r0(fanE?.toplam ?? 0)} Pa (motor hava akımı dışında, yağ toplama tavalı) + telafi havası santrali ${r0(B)} m³/h, ${r0(fanB?.toplam ?? 0)} Pa`;
    else if (otopark)
      secim = `Otopark egzoz / duman tahliye fanı (iki hızlı, EN 12101-3 en az F300): normal ${r0(E)} / yangın ${r0(Y)} m³/h, ${r0(fanE?.toplam ?? 0)} Pa — 2 × %50 önerilir`;

    // Kontroller
    if (hr && (s.tip === "AHU_PLAKA" || s.tip === "AHU_ROTOR") && verim < 73) uy.push(`Isı geri kazanım verimi %${sy(verim, 0)}: AB 1253/2014 (2018) konut dışı çift akışlı ünitelerde en az %73 ister.`);
    if (s.tip === "AHU_ARA" && verim < 68) uy.push(`Ara akışkanlı ısı geri kazanımı %${sy(verim, 0)}: AB 1253/2014 en az %68 ister.`);
    if (hr && E < B * 0.6 && B > 0) uy.push(`Egzoz debisi beslemenin %${sy((E / B) * 100, 0)}'ı: ısı geri kazanım etkin verimi %${sy(verimEtkin, 0)}'a düşer. Islak hacim egzozlarını da bu santrale bağlamak verimi artırır.`);
    for (const [ad, f] of [["Besleme", fanB], ["Egzoz", fanE]] as const)
      if (f && f.sfp > 2000 && !otopark && !mutfak)
        uy.push(`${ad} fanı SFP ${sy(f.sfp, 0)} W/(m³/s) (${f.sinif}): fan enerjisi yüksek (EN 16798-3 yeni binalarda SFP 4 ve altı hedeflenir); kanal hızlarını düşürmek, filtre / eşanjör basınç kaybı düşük santral seçmek önerilir.`);
    const agUyari = (ag: KanalAgi | null, ad: string) => {
      if (!ag) return;
      if (ag.dis > (s.tip === "KONUT_HRV" ? 200 : 600)) uy.push(`${ad} kanal dış statik basıncı ${r0(ag.dis)} Pa; ${s.tip === "KONUT_HRV" ? "konut cihazları genelde 150–200 Pa'ya kadar çalışır" : "yüksek, kanal ölçülerini büyütün"}.`);
      for (const pc of ag.parcalar)
        if (mutfak && ag.tur === "EGZOZ" && pc.hiz < MUTFAK_KANAL_HIZI.min - 0.3) uy.push(`${pc.ad}: mutfak egzoz kanal hızı ${sy(pc.hiz, 1)} m/s; yağın çökmemesi için en az ≈ 7,5 m/s olmalı.`);
    };
    agUyari(agB, "Besleme");
    agUyari(agE, "Egzoz");
    if (otopark && s.otoparkSistemi === "JETFAN")
      uy.push("Jet fan sayısı ön tahmindir (her ≈ 550 m²'ye bir 50 N); yerleşim, itki ve duman kontrolü CFD analiziyle doğrulanmalıdır.");

    santraller.push({
      no: s.no,
      ad: s.ad,
      tip: s.tip,
      tipAdi: st.ad,
      akustik,
      besleme: B,
      egzoz: E,
      yangin: Y,
      nominal,
      secim,
      verim,
      verimEtkin,
      kesitM2,
      kis: { dis: disT, onIsitici, hrSonrasi: hr ? hrKis : disT, hedef: hedefKis, isitici, geriKazanim: hr ? gkKis : 0 },
      yaz: { disKT: yazKT, hrSonrasi: hr ? hrYazT : yazKT, hedef: hedefYaz, sogutucu, duyulur, gizli, geriKazanim: hr ? gkYaz : 0, nemCikis: nemCikis * 1000 },
      suIsitici,
      suSogutucu,
      icB,
      icE,
      agB,
      agE,
      fanB,
      fanE,
      sfp,
      sfpSinif,
      jetFan: otopark && s.otoparkSistemi === "JETFAN" ? eListe.reduce((t, x) => t + x.jetFan, 0) : 0,
      coSensoru: otopark ? eListe.reduce((t, x) => t + x.coSensoru, 0) : 0,
      mahaller: ilgili.map((x) => x.id),
      uyarilar: uy,
    });
  }

  if (!v.mahaller.length) uyarilar.push("Henüz mahal girilmedi.");
  if (v.mahaller.length && !v.santraller.length) uyarilar.push("Santral / fan tanımlanmadı; debiler hesaplandı ama kanal ve cihaz seçimi yapılamadı.");

  const malzemeler = malzemeListesi(v, mahaller, santraller);
  return {
    il: il.ad,
    disSicaklik: disT,
    yazKT,
    yazYT,
    basinc: p,
    mahaller,
    santraller,
    toplamBesleme: mahaller.reduce((t, x) => t + x.besleme, 0),
    toplamEgzoz: mahaller.reduce((t, x) => t + x.egzoz, 0),
    toplamAlan: mahaller.reduce((t, x) => t + x.alan, 0),
    toplamIsitici: santraller.reduce((t, x) => t + x.kis.isitici + x.kis.onIsitici, 0),
    toplamSogutucu: santraller.reduce((t, x) => t + x.yaz.sogutucu, 0),
    toplamFanKw: santraller.reduce((t, x) => t + (x.fanB?.kw ?? 0) + (x.fanE?.kw ?? 0), 0),
    malzemeler,
    uyarilar,
  };
}

// Gövde uzunlukları (atlanan mahallerin mesafeleri dahil) ile kanal ağı
function kanalAgiUzunluklu(
  tur: "BESLEME" | "EGZOZ",
  s: Santral,
  liste: AgMahal[],
  tum: Mahal[],
  akustik: Akustik,
  hMaks: number,
  mutfak: boolean,
  ek: number
): KanalAgi | null {
  const ag = liste.filter((x) => x.q > 0.5);
  if (!ag.length) return null;
  const L = govdeUzunluklari(
    ag.map((x) => x.m),
    tum,
    s.anaHat
  );
  // kanalAgi gövde uzunluğunu kendi hesaplar; burada doğru uzunlukları vermek için mahal kopyası kullanılır
  const kopya = ag.map((x, i) => ({ ...x, m: { ...x.m, hatMesafe: L[i] } }));
  return kanalAgiBasit(tur, s, kopya, akustik, hMaks, mutfak, ek);
}

function kanalAgiBasit(tur: "BESLEME" | "EGZOZ", s: Santral, ag: AgMahal[], akustik: Akustik, hMaks: number, mutfak: boolean, ek: number): KanalAgi | null {
  const hs = HIZ_SINIRLARI[akustik];
  const parcalar: KanalParcasi[] = [];
  const toplam = ag.reduce((t, x) => t + x.q, 0);
  let yol = 0;
  let kritik = { kayip: -1, mahal: "", kanal: 0, uc: 0 };
  const vMin = mutfak && tur === "EGZOZ" ? MUTFAK_KANAL_HIZI.min : 0;
  const yag = mutfak && tur === "EGZOZ";
  ag.forEach((x, i) => {
    const L = x.m.hatMesafe; // i = 0: santral ana hattı
    const qGovde = ag.slice(i).reduce((t, y) => t + y.q, 0);
    const anaMi = qGovde >= toplam * 0.3;
    const og = kanalSec(qGovde, yag ? MUTFAK_KANAL_HIZI.maks : anaMi ? hs.ana : hs.brans, yag ? 8 : anaMi ? 1.0 : 1.5, s.kanalSekli, hMaks, vMin);
    const yerelG = (i === 0 ? 0.8 : 0.3) * ((RHO * og.hiz * og.hiz) / 2);
    const govde: KanalParcasi = {
      ad: i === 0 ? `Ana kanal (santral → ${ag.length > 1 ? "B1" : x.m.ad})` : `B${i} → B${i + 1}`,
      tur: i === 0 ? "ANA" : "HAT",
      mahalId: x.m.id,
      debi: qGovde,
      uzunluk: L,
      sekil: og.sekil,
      cap: og.cap,
      en: og.en,
      boy: og.boy,
      hiz: og.hiz,
      r: og.r,
      surtunme: og.r * L,
      yerel: yerelG,
      toplam: og.r * L + yerelG,
      etiket: i === 0 ? `anaHat|${s.no}` : `hat|${x.m.id}`,
    };
    parcalar.push(govde);
    yol += govde.toplam;
    const bv = yag ? MUTFAK_KANAL_HIZI.maks : hs.brans;
    let ob = kanalSec(x.q, bv, yag ? 8 : 1.5, "DAIRESEL", hMaks, vMin);
    if (s.kanalSekli === "DIKDORTGEN" && ob.cap > 315) ob = kanalSec(x.q, bv, yag ? 8 : 1.5, "DIKDORTGEN", hMaks, vMin);
    const yerelB = 1.5 * ((RHO * ob.hiz * ob.hiz) / 2); // T ayrılma + dirsek + ayar damperi
    const brans: KanalParcasi = {
      ad: `B${i + 1} → ${x.m.ad}`,
      tur: "BRANS",
      mahalId: x.m.id,
      debi: x.q,
      uzunluk: x.m.bransMesafe,
      sekil: ob.sekil,
      cap: ob.cap,
      en: ob.en,
      boy: ob.boy,
      hiz: ob.hiz,
      r: ob.r,
      surtunme: ob.r * x.m.bransMesafe,
      yerel: yerelB,
      toplam: ob.r * x.m.bransMesafe + yerelB,
      etiket: `brans|${x.m.id}`,
    };
    parcalar.push(brans);
    const kanal = yol + brans.toplam;
    if (kanal + x.uc > kritik.kayip) kritik = { kayip: kanal + x.uc, mahal: x.m.id, kanal, uc: x.uc };
  });
  return {
    tur,
    parcalar,
    kritikMahal: kritik.mahal || null,
    kritikKanal: kritik.kanal,
    kritikUc: kritik.uc,
    ek,
    dis: kritik.kanal + kritik.uc + ek,
    toplamUzunluk: parcalar.reduce((t, pc) => t + pc.uzunluk, 0),
    mahalSirasi: ag.map((x) => x.m.id),
  };
}

// ---------------------------------------------------------------------------
// 5. MALZEME LİSTESİ
// ---------------------------------------------------------------------------
// Sac kalınlığı (dikdörtgen kanal, büyük kenara göre — yaygın uygulama)
function sacKalinligi(kenar: number) {
  return kenar <= 300 ? 0.5 : kenar <= 750 ? 0.6 : kenar <= 1200 ? 0.8 : kenar <= 2000 ? 1.0 : 1.2;
}
function flexCap(q: number) {
  return q <= 150 ? 125 : q <= 250 ? 160 : q <= 400 ? 200 : q <= 650 ? 250 : 315;
}

function malzemeListesi(v: HavalandirmaVerisi, mahaller: MahalSonucu[], santraller: SantralSonucu[]): Malzeme[] {
  const l: Malzeme[] = [];
  const ek = (bolum: string, aciklama: string, adet: number, birim = "Adet") => {
    if (adet > 0.01) l.push({ bolum, aciklama, adet: Math.round(adet * 100) / 100, birim });
  };
  const S = "Santral ve Fanlar";
  const K = "Hava Kanalları";
  const U = "Menfez, Damper ve Uç Elemanlar";
  const D = "Otopark / Mutfak Özel Ekipman";
  const sac = new Map<number, number>(); // kalınlık → m²
  const spiral = new Map<number, number>(); // çap → m
  let yalitim = 0;
  let susturucu = 0;
  let yanginDamperi = 0;
  let regulator = 0;
  for (const s of santraller) {
    ek(S, s.secim || s.tipAdi, 1);
    const sv = v.santraller.find((x) => x.no === s.no)!;
    if (s.kis.onIsitici > 0.05) ek(S, `Ön ısıtıcı (donma koruması) ≈ ${sy(s.kis.onIsitici, 1)} kW — ${s.ad}`, 1);
    if (s.kis.isitici > 0.05) ek(S, `Isıtıcı batarya ${sy(s.kis.isitici, 1)} kW (${v.isitmaRejimi[0]}/${v.isitmaRejimi[1]} °C, ${sy(s.suIsitici, 0)} L/h) + 3 yollu vana ve motor — ${s.ad}`, 1, "Set");
    if (s.yaz.sogutucu > 0.05) ek(S, `Soğutucu batarya ${sy(s.yaz.sogutucu, 1)} kW (${v.sogutmaRejimi[0]}/${v.sogutmaRejimi[1]} °C, ${sy(s.suSogutucu, 0)} L/h) ya da eş kapasitede DX batarya — ${s.ad}`, 1, "Set");
    if (s.tip !== "EGZOZ") ek(S, `Otomasyon / kontrol paneli (sıcaklık, filtre kirlilik alarmı, ${s.tip === "OTOPARK" ? "CO ve yangın senaryosu" : "zaman programı"}) — ${s.ad}`, 1, "Set");
    for (const ag of [s.agB, s.agE]) {
      if (!ag) continue;
      for (const pc of ag.parcalar) {
        const fittingPayi = 1.2; // dirsek, redüksiyon, te payı
        if (pc.sekil === "DAIRESEL") spiral.set(pc.cap, (spiral.get(pc.cap) ?? 0) + pc.uzunluk * fittingPayi);
        else {
          const m2 = ((2 * (pc.en + pc.boy)) / 1000) * pc.uzunluk * fittingPayi;
          const k = sacKalinligi(Math.max(pc.en, pc.boy));
          sac.set(k, (sac.get(k) ?? 0) + m2);
          if (ag.tur === "BESLEME" && (sv.isitici || sv.sogutucu)) yalitim += m2;
        }
        if (pc.sekil === "DAIRESEL" && ag.tur === "BESLEME" && (sv.isitici || sv.sogutucu)) yalitim += Math.PI * (pc.cap / 1000) * pc.uzunluk * fittingPayi;
      }
      if (s.tip !== "EGZOZ" && s.tip !== "MUTFAK" && s.tip !== "OTOPARK") susturucu += 1;
      yanginDamperi += sv.yanginDamperi;
      if (sv.regulator) regulator += ag.mahalSirasi.length;
    }
    // Dış hava emiş ve atış kanalları (yalıtımlı) ≈ 2 × 5 m
    if (s.tip !== "EGZOZ" && s.tip !== "OTOPARK") ek(K, `Dış hava emiş ve atış kanalı, ısı / yoğuşma yalıtımlı (${s.ad})`, 10, "m");
    if (s.tip === "OTOPARK") {
      if (s.jetFan > 0) ek(D, `Jet fan (50 N itki, iki yönlü, F300) — ${s.ad}`, s.jetFan);
      ek(D, `CO sensörü (otopark, 0–300 ppm) — ${s.ad}`, s.coSensoru);
      ek(D, `Duman tahliye fanı yedeklilik / kontrol: yangın senaryosu, elektrik ve otomasyon — ${s.ad}`, 1, "Set");
    }
  }
  for (const [k, m2] of [...sac.entries()].sort((a, b) => a[0] - b[0])) ek(K, `Galvaniz dikdörtgen hava kanalı ${String(k).replace(".", ",")} mm sac (fittings dahil)`, Math.ceil(m2), "m²");
  for (const [c, m] of [...spiral.entries()].sort((a, b) => a[0] - b[0])) ek(K, `Spiral dairesel kanal Ø${c} (dirsek, te, redüksiyon payı dahil)`, Math.ceil(m), "m");
  if (yalitim > 0) ek(K, "Besleme kanalı ısı / yoğuşma yalıtımı (19 mm elastomerik kauçuk köpük ya da 25 mm alüminyum folyolu cam yünü)", Math.ceil(yalitim), "m²");
  // Uç elemanlar
  let flexM = new Map<number, number>();
  let difuzor = 0;
  let difuzorSessiz = 0;
  let izgara = 0;
  let menfezE = 0;
  let wcValf = 0;
  let transfer = 0;
  let davlumbazM = 0;
  const davTip = new Map<string, number>();
  for (const x of mahaller) {
    const m = v.mahaller.find((y) => y.id === x.id)!;
    const t = MAHAL_TIPLERI[m.tip];
    if (x.menfezB > 0 && x.santral > 0) {
      const qb = x.besleme / x.menfezB;
      if (t.akustik === "ENDUSTRIYEL") izgara += x.menfezB;
      else if (t.akustik === "SESSIZ") difuzorSessiz += x.menfezB;
      else difuzor += x.menfezB;
      if (t.akustik !== "ENDUSTRIYEL") flexM.set(flexCap(qb), (flexM.get(flexCap(qb)) ?? 0) + 1.5 * x.menfezB);
    }
    if (x.menfezE > 0 && x.egzozSantral > 0) {
      if (t.yontem === "MUTFAK") {
        davlumbazM += m.davlumbazM;
        const ad = `${DAVLUMBAZ_TIPLERI[m.davlumbazTip].ad} davlumbaz, paslanmaz, labirent yağ filtreli`;
        davTip.set(ad, (davTip.get(ad) ?? 0) + m.davlumbazM);
      } else if (t.yontem === "ARMATUR" || t.yontem === "KONUT_ISLAK") wcValf += x.menfezE;
      else if (t.akustik === "ENDUSTRIYEL") izgara += x.menfezE;
      else menfezE += x.menfezE;
    }
    if (x.transferCm2 > 0) transfer += 1;
  }
  flexM = new Map([...flexM.entries()].sort((a, b) => a[0] - b[0]));
  ek(U, "Kare / girdaplı tavan difüzörü (plenum kutulu, ayar damperli)", difuzor);
  ek(U, "Lineer / slot difüzör (düşük ses, plenum kutulu) — sessiz mahaller", difuzorSessiz);
  ek(U, "Egzoz / emiş menfezi (plenum kutulu, ayar damperli)", menfezE);
  ek(U, "Ayarlı disk valf (WC / banyo / mutfak emişi)", wcValf);
  ek(U, "Kanal tipi menfez / ızgara (endüstriyel, otopark, teknik mahal)", izgara);
  for (const [c, m] of flexM) ek(U, `Yalıtımlı esnek kanal Ø${c}`, Math.ceil(m), "m");
  ek(U, "Kapı transfer menfezi / kapı altı boşluğu (geçiş havası, ıslak hacimler)", transfer);
  ek(U, "CAV / VAV debi regülatörü (mahal branşmanı)", regulator);
  ek(U, "Yangın damperi (EI 60/90, motorlu, yangın paneline bağlı)", yanginDamperi);
  ek(U, "Kanal tipi ses susturucu (santral sonrası, besleme / egzoz)", susturucu);
  ek(U, "Dış hava emiş ve atış panjuru (kuş teli dahil)", santraller.filter((s) => s.tip !== "EGZOZ").length * 2);
  for (const [ad, m] of davTip) ek(D, ad, m, "m");
  if (davlumbazM > 0) ek(D, "Mutfak egzoz kanalı (yağ sızdırmaz kaynaklı, 1,2 mm siyah sac / paslanmaz, temizleme kapaklı)", 1, "Set");
  ek("Test, Ayar ve Balans", "Kanal sızdırmazlık testi, debi ölçümü, ayar ve balans (TAB) raporu, devreye alma", 1, "İş");
  return l;
}

export const HAVALANDIRMA_KAYNAKLARI = [
  "TS EN 16798-1: kişi ve alan başı taze hava (kategori, bina kirlilik sınıfı), konut toplam debi ve ıslak hacim egzozları",
  "ASHRAE 62.1 Tablo 6-1 (Rp, Ra, varsayılan yoğunluk) ve egzoz debileri; ASHRAE 154 / IMC 507 mutfak davlumbazı",
  "Binaların Yangından Korunması Hakkında Yönetmelik: kapalı otoparkta 10 hava değişimli duman tahliyesi",
  "AB 1253/2014 (ErP 2018): ısı geri kazanım verimi; TS EN 16798-3: SFP sınıfları, kanal hızları",
  IL_KAYNAGI,
];
