// -----------------------------------------------------------------------------
// HAVALANDIRMA — MAHAL DEBİSİ (taze hava / egzoz) — hesap motoru ve sistem önerisi ortak kullanır
// -----------------------------------------------------------------------------
import { sy } from "@/lib/isi-hesap/hesap";
import { MAHAL_TIPLERI, EN_KATEGORI, DAVLUMBAZ_TIPLERI, type MahalTanimi } from "./katalog";
import type { HavalandirmaVerisi, Mahal } from "./tipler";

export function mahalDebisi(m: Mahal, v: HavalandirmaVerisi, yazKT: number) {
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
      if (t.egzozAlanMin && t.egzozAlanMin * A > e) {
        e = t.egzozAlanMin * A;
        aciklama += ` · egzoz en az ${sy(t.egzozAlanMin, 1)} l/s·m² (ASHRAE 62.1 Tablo 6-4) = ${lsm(e)} l/s`;
      }
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
