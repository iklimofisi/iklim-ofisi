// -----------------------------------------------------------------------------
// KLİMA / VRF HESABI — HESAP MOTORU (saf fonksiyonlar; panelde ve sunucuda aynı kod)
//
//  1. Oda soğutma yükü: güneş (cam), iletim (eşdeğer sıcaklık farkı), kişi,
//     aydınlatma, cihaz, havalandırma — duyulur ve gizli (nem) ayrı
//  2. Oda ısı kaybı (EN 12831 — ısı pompası hesabıyla aynı kod)
//  3. İç ünite seçimi (tip, kapasite, adet)
//  4. Sistem: VRF / mini VRF / multi split dış ünite seçimi, bağlantı oranı,
//     dış sıcaklık ve boru uzunluğu düzeltmeleri, ısıtma kontrolü
//  5. Soğutucu boru ağı: hat çapları, branşman kitleri, mesafe ve kot kontrolleri,
//     ek gaz, EN 378 oda konsantrasyon kontrolü
//  6. Malzeme listesi ve uyarılar
// -----------------------------------------------------------------------------
import { ilBul } from "@/lib/isi-hesap/iklim";
import { ODA_TIPLERI, ELEMAN_TURLERI, B_KATSAYILARI, PENCERELER } from "@/lib/isi-hesap/katalog";
import { odaIsiKaybi, sy } from "@/lib/isi-hesap/hesap";
import { pencereMi } from "@/lib/isi-hesap/tipler";
import {
  GUNES_SHGF,
  GUNES_CLF,
  GOLGELER,
  CAM_GUNES,
  DUVAR_GUNES_EKI,
  CATI_GUNES_EKI,
  KULLANIMLAR,
  IC_UNITE_TIPLERI,
  ISITMA_ORANI,
  SISTEM_TIPLERI,
  MULTI_ODA_SAYISI,
  sogutmaDisDuzeltme,
  isitmaDisDuzeltme,
  boruDuzeltme,
  VRF_HAT_CAPLARI,
  IC_UNITE_CAPLARI,
  SPLIT_CAPLARI,
  capSec,
  BRANSMAN_KADEMELERI,
  EK_GAZ_R410A,
  AKISKANLAR,
  FABRIKA_SARJ_KG_KW,
  borAdi,
  btuAdi,
  type IcUniteTipi,
  type SistemTipi,
} from "./katalog";
import type { KlimaVerisi, KlimaOda, Sistem } from "./tipler";

export { sy };

// ---------------------------------------------------------------------------
// Psikrometri
// ---------------------------------------------------------------------------
export function atmBasinci(rakim: number) {
  return 101.325 * Math.pow(1 - 2.25577e-5 * rakim, 5.2559); // kPa
}
function doymaBasinci(t: number) {
  return 0.61094 * Math.exp((17.625 * t) / (t + 243.04)); // kPa
}
export function nemKT_YT(kt: number, yt: number, p: number) {
  const pws = doymaBasinci(yt);
  const xs = (0.622 * pws) / (p - pws);
  return ((2501 - 2.326 * yt) * xs - 1.006 * (kt - yt)) / (2501 + 1.86 * kt - 4.186 * yt); // kg/kg
}
export function nemBagil(t: number, rh: number, p: number) {
  const pv = (rh / 100) * doymaBasinci(t);
  return (0.622 * pv) / (p - pv);
}

// ---------------------------------------------------------------------------
// Sonuç tipleri
// ---------------------------------------------------------------------------
export type SogutmaKalemi = { ad: string; duyulur: number; gizli: number };

export type KlimaOdaSonucu = {
  id: string;
  ad: string;
  alan: number;
  hacim: number;
  klima: boolean;
  sistem: number;
  kalemler: SogutmaKalemi[];
  duyulur: number;
  gizli: number;
  sogutma: number; // W (emniyet payı hariç)
  gerekenSogutma: number; // W (emniyet payı dahil)
  isitma: number; // W (ısı kaybı)
  wm2: number;
  unite: { tip: IcUniteTipi; tipAdi: string; kw: number; adet: number; ad: string } | null;
  uyarilar: string[];
};

export type BoruParcasi = {
  ad: string; // "Ana hat", "B1 → B2", "Salon iç ünite hattı"
  tur: "ANA" | "HAT" | "BRANS";
  uzunluk: number;
  kw: number; // arkasındaki kapasite
  gaz: number;
  sivi: number;
};

export type UniteBaglantisi = {
  odaId: string;
  oda: string;
  tipAdi: string;
  kw: number;
  bransman: number | null; // bağlı olduğu branşman no
  uzaklik: number; // dış üniteden gerçek boru uzunluğu
  kot: number;
};

export type SistemSonucu = {
  no: number;
  ad: string;
  tip: SistemTipi;
  tipAdi: string;
  uniteler: UniteBaglantisi[];
  icToplamKw: number;
  sogutmaYuku: number; // kW (eşzamanlılık dahil)
  isitmaYuku: number; // kW
  disKw: number | null;
  disIsitmaKw: number | null;
  oran: number | null; // %
  sogutmaDuzeltilmis: number | null; // kW
  isitmaDuzeltilmis: number | null; // kW
  duzeltme: { dis: number; boruSog: number; boruIsit: number; disIsit: number; leq: number };
  parcalar: BoruParcasi[];
  bransmanlar: { no: number; kw: number; ad: string }[];
  toplamBoru: number;
  enUzak: number;
  ilkBransmandanSonra: number;
  kotDisFark: number; // + dış ünite üstte
  kotIcFark: number;
  ekGaz: number; // kg
  toplamSarj: number; // kg
  sarjTahmini: boolean;
  en378: { oda: string; hacim: number; sinir: number; asiyor: boolean }[];
  kontroller: { ad: string; deger: string; sinir: string; uygun: boolean }[];
  uyarilar: string[];
};

export type KlimaMalzeme = { bolum: string; aciklama: string; adet: number; birim: string };

export type KlimaSonucu = {
  il: string;
  disSicaklik: number;
  yazKT: number;
  yazYT: number;
  disNem: number; // g/kg
  icNem: number; // g/kg
  odalar: KlimaOdaSonucu[];
  toplamAlan: number;
  toplamSogutma: number; // W
  toplamIsitma: number; // W
  sistemler: SistemSonucu[];
  splitler: KlimaOdaSonucu[];
  malzemeler: KlimaMalzeme[];
  uyarilar: string[];
};

const r1 = (x: number) => Math.round(x * 10) / 10;

// ---------------------------------------------------------------------------
// 1. ODA SOĞUTMA YÜKÜ
// ---------------------------------------------------------------------------
function odaSogutma(o: KlimaOda, v: KlimaVerisi, kt: number, dxGkg: number, isiSonuc: ReturnType<typeof odaIsiKaybi>) {
  const ts = o.sogutmaSicaklik;
  const dT = kt - ts;
  const kalemler: SogutmaKalemi[] = [];
  const sc = GOLGELER.find((g) => g.anahtar === o.golge)?.sc ?? 1;
  let gunes = 0;
  let camIletim = 0;
  let opak = 0;
  for (const e of o.elemanlar) {
    const es = isiSonuc.sonuclar.find((x) => x.id === e.id);
    if (!es) continue;
    const tanim = ELEMAN_TURLERI[e.tur];
    if (pencereMi(e.tur)) {
      camIletim += es.alan * es.u * dT;
      if (e.tur === "PENCERE" && e.yon) gunes += es.alan * GUNES_SHGF[e.yon] * (CAM_GUNES[e.kesit] ?? 0.8) * sc * GUNES_CLF;
      continue;
    }
    let fark = 0;
    if (e.tur === "DIS_DUVAR") fark = dT + (e.yon ? DUVAR_GUNES_EKI[e.yon] : 0);
    else if (e.tur === "CATI") fark = dT + CATI_GUNES_EKI;
    else if (e.tur === "DOSEME_DIS") fark = dT;
    else if (tanim.sinif === "TOPRAK") fark = 0;
    else if (tanim.sinif === "ISITILMAYAN") {
      const b = B_KATSAYILARI.find((x) => x.anahtar === e.bAnahtar)?.b ?? 0.5;
      const catiArasi = e.bAnahtar.startsWith("CATI_ARASI") && !e.doseme;
      fark = b * dT + (catiArasi ? 8 : 0);
    } else fark = Math.max(0, e.komsuSicaklik - ts);
    opak += es.alan * es.uEtkin * Math.max(0, fark);
  }
  kalemler.push({ ad: "Camdan güneş ışınımı", duyulur: gunes, gizli: 0 });
  kalemler.push({ ad: "Cam iletimi", duyulur: Math.max(0, camIletim), gizli: 0 });
  kalemler.push({ ad: "Duvar / çatı / döşeme", duyulur: opak, gizli: 0 });
  const k = KULLANIMLAR[v.kullanim];
  kalemler.push({ ad: `Kişi (${o.kisi})`, duyulur: o.kisi * k.kisiDuyulur, gizli: o.kisi * k.kisiGizli });
  const alan = o.en * o.boy;
  kalemler.push({ ad: "Aydınlatma", duyulur: o.aydinlatma * alan, gizli: 0 });
  kalemler.push({ ad: "Cihazlar", duyulur: o.cihaz, gizli: 0 });
  const debi = alan * o.yukseklik * o.havaDegisim; // m³/h
  kalemler.push({ ad: "Havalandırma / sızıntı", duyulur: Math.max(0, 0.34 * debi * dT), gizli: Math.max(0, 0.833 * debi * dxGkg) });
  const duyulur = kalemler.reduce((t, x) => t + x.duyulur, 0);
  const gizli = kalemler.reduce((t, x) => t + x.gizli, 0);
  return { kalemler, duyulur, gizli };
}

// ---------------------------------------------------------------------------
// 3. İÇ ÜNİTE SEÇİMİ
// ---------------------------------------------------------------------------
function uniteListesi(tip: IcUniteTipi, sistemTipi: SistemTipi | "SPLIT"): number[] {
  const t = IC_UNITE_TIPLERI[tip];
  if (sistemTipi === "VRF" || sistemTipi === "MINI_VRF") return [...(t.vrf.length ? t.vrf : t.split)];
  return [...t.split];
}

// ---------------------------------------------------------------------------
// ANA HESAP
// ---------------------------------------------------------------------------
export function klimaHesapla(v: KlimaVerisi): KlimaSonucu {
  const il = ilBul(v.il);
  const disT = v.disSicaklikElle ?? il.disSicaklik;
  const kt = v.yazKTElle ?? il.yazKT;
  const yt = Math.min(kt, v.yazYTElle ?? il.yazYT);
  const p = atmBasinci(il.rakim);
  const xDis = nemKT_YT(kt, yt, p);
  const uyarilar: string[] = [];
  const sistemTanim = new Map(v.sistemler.map((s) => [s.no, s]));

  // --- Odalar ---
  const odalar: KlimaOdaSonucu[] = v.odalar.map((o) => {
    const uy: string[] = [];
    const isi = odaIsiKaybi({ ...o, isitici: "RADYATOR" }, v, disT);
    const xIc = nemBagil(o.sogutmaSicaklik, v.icNem, p);
    const dx = Math.max(0, (xDis - xIc) * 1000);
    const sog = odaSogutma(o, v, kt, dx, isi);
    const sogutma = sog.duyulur + sog.gizli;
    const gereken = sogutma * (1 + v.emniyetPayi / 100);
    const isitma = v.isitmaDa ? isi.toplam : 0;
    const alan = o.en * o.boy;

    let unite: KlimaOdaSonucu["unite"] = null;
    const sistem = o.sistem > 0 ? sistemTanim.get(o.sistem) : undefined;
    if (o.sistem > 0 && !sistem) uy.push(`Sistem ${o.sistem} tanımlı değil; oda bağımsız split klima olarak hesaplandı.`);
    const sTipi: SistemTipi | "SPLIT" = sistem ? sistem.tip : "SPLIT";
    if (o.klima) {
      const liste = uniteListesi(o.uniteTipi, sTipi);
      if (!liste.length) {
        uy.push(`${IC_UNITE_TIPLERI[o.uniteTipi].ad} bu sistem tipinde yok; duvar tipi alındı.`);
      }
      const kullanilan = liste.length ? liste : uniteListesi("DUVAR", sTipi);
      const tipAnahtar: IcUniteTipi = liste.length ? o.uniteTipi : "DUVAR";
      const adet = Math.max(1, o.uniteAdet);
      // Isıtmada iç ünite: VRF / multi'de dış ünite ayrıca kontrol edilir; bağımsız splitte dış sıcaklık düzeltmesi burada uygulanır
      const isitmaKatsayi = sTipi === "SPLIT" ? isitmaDisDuzeltme(disT) : 1;
      const gerekliNominal = Math.max(gereken / 1000 / adet, isitma > 0 ? isitma / 1000 / adet / (ISITMA_ORANI * isitmaKatsayi) : 0);
      let kw = o.uniteKw > 0 ? o.uniteKw : kullanilan.find((x) => x >= gerekliNominal - 1e-9) ?? kullanilan[kullanilan.length - 1];
      if (o.uniteKw > 0 && o.uniteKw + 1e-9 < gerekliNominal) uy.push(`Seçilen ${sy(o.uniteKw)} kW iç ünite yetersiz; en az ${sy(gerekliNominal)} kW gerekli.`);
      if (o.uniteKw <= 0 && kw + 1e-9 < gerekliNominal) uy.push(`En büyük ${IC_UNITE_TIPLERI[tipAnahtar].ad} (${sy(kw)} kW) yetmiyor; iç ünite adedini artırın ya da başka tip seçin.`);
      kw = r1(kw);
      const tipAdi = IC_UNITE_TIPLERI[tipAnahtar].ad;
      unite = { tip: tipAnahtar, tipAdi, kw, adet, ad: sTipi === "SPLIT" || sTipi === "MULTI" ? `${tipAdi} ${btuAdi(kw)}` : `${tipAdi} ${sy(kw)} kW` };
      if (sTipi === "SPLIT" && isitma > 0) {
        const kap = kw * adet * ISITMA_ORANI * isitmaKatsayi * 1000;
        if (kap + 1 < isitma) uy.push(`Isıtmada yetersiz: ${sy(disT)} °C'de ~${sy(kap, 0)} W verir, ${sy(isitma, 0)} W gerekli.`);
        if (disT < -15) uy.push(`Dış tasarım ${sy(disT)} °C; standart split klimalar bu sıcaklıkta ısıtmada zorlanır, düşük sıcaklık (hyper heating) modeli seçilmeli.`);
      }
    }
    if (o.klima && sog.gizli / Math.max(1, sogutma) > 0.35) uy.push("Gizli (nem) yükü yüksek; yeterli nem alma için iç ünite fan hızı düşük kademede çalıştırılmalı.");
    return {
      id: o.id,
      ad: o.ad,
      alan,
      hacim: alan * o.yukseklik,
      klima: o.klima,
      sistem: o.klima && sistem ? sistem.no : 0,
      kalemler: sog.kalemler,
      duyulur: o.klima ? sog.duyulur : 0,
      gizli: o.klima ? sog.gizli : 0,
      sogutma: o.klima ? sogutma : 0,
      gerekenSogutma: o.klima ? gereken : 0,
      isitma: o.klima ? isitma : 0,
      wm2: alan > 0 && o.klima ? sogutma / alan : 0,
      unite,
      uyarilar: uy,
    };
  });

  // --- Sistemler ---
  const sistemler: SistemSonucu[] = [];
  for (const s of [...v.sistemler].sort((a, b) => a.no - b.no)) {
    const odaListesi = v.odalar.filter((o) => {
      const r = odalar.find((x) => x.id === o.id)!;
      return r.klima && r.sistem === s.no && r.unite;
    });
    if (!odaListesi.length) continue;
    sistemler.push(sistemHesapla(s, odaListesi, odalar, v, kt, disT));
  }
  const splitler = odalar.filter((o) => o.klima && o.sistem === 0 && o.unite);

  const toplamAlan = odalar.reduce((t, o) => t + o.alan, 0);
  if (!v.odalar.length) uyarilar.push("Henüz oda girilmedi.");
  if (v.odalar.length && !odalar.some((o) => o.klima)) uyarilar.push("Klimalanan oda yok (oda ekranında 'Bu oda klimalanacak' işaretleyin).");

  const sonuc: KlimaSonucu = {
    il: il.ad,
    disSicaklik: disT,
    yazKT: kt,
    yazYT: yt,
    disNem: xDis * 1000,
    icNem: nemBagil(26, v.icNem, p) * 1000,
    odalar,
    toplamAlan,
    toplamSogutma: odalar.reduce((t, o) => t + o.sogutma, 0),
    toplamIsitma: odalar.reduce((t, o) => t + o.isitma, 0),
    sistemler,
    splitler,
    malzemeler: [],
    uyarilar,
  };
  sonuc.malzemeler = malzemeListesi(sonuc, v);
  return sonuc;
}

// ---------------------------------------------------------------------------
// 4–5. SİSTEM: DIŞ ÜNİTE, BORU AĞI, KONTROLLER
// ---------------------------------------------------------------------------
function sistemHesapla(s: Sistem, odalarHam: KlimaOda[], odalar: KlimaOdaSonucu[], v: KlimaVerisi, kt: number, disT: number): SistemSonucu {
  const tanim = SISTEM_TIPLERI[s.tip];
  const uy: string[] = [];
  // Her iç ünite ayrı bir bağlantıdır (oda sırası = ana hat üzerindeki sıra)
  type U = { odaId: string; oda: string; tipAdi: string; kw: number; hat: number; brans: number; kot: number; tip: IcUniteTipi };
  const uniteler: U[] = [];
  for (const o of odalarHam) {
    const r = odalar.find((x) => x.id === o.id)!;
    for (let i = 0; i < r.unite!.adet; i++)
      uniteler.push({
        odaId: o.id,
        oda: r.unite!.adet > 1 ? `${o.ad} (${i + 1})` : o.ad,
        tipAdi: r.unite!.tipAdi,
        kw: r.unite!.kw,
        hat: i === 0 ? o.hatMesafe : 1.5,
        brans: o.bransMesafe,
        kot: o.kot,
        tip: r.unite!.tip,
      });
  }
  const icToplam = uniteler.reduce((t, u) => t + u.kw, 0);
  const sogYuk = (odalarHam.reduce((t, o) => t + odalar.find((x) => x.id === o.id)!.gerekenSogutma, 0) * (v.eszamanlilik / 100)) / 1000;
  const isiYuk = odalarHam.reduce((t, o) => t + odalar.find((x) => x.id === o.id)!.isitma, 0) / 1000;

  // --- Boru ağı (uzunluklar dış ünite seçiminden bağımsız) ---
  const parcalar: BoruParcasi[] = [];
  const bransmanlar: { no: number; kw: number; ad: string }[] = [];
  const baglantilar: UniteBaglantisi[] = [];
  const n = uniteler.length;
  const multi = s.tip === "MULTI";
  if (multi) {
    for (const u of uniteler) {
      const c = capSec(SPLIT_CAPLARI, u.kw);
      const L = Math.max(0.5, u.brans);
      parcalar.push({ ad: `${u.oda} hattı`, tur: "BRANS", uzunluk: L, kw: u.kw, gaz: c.gaz, sivi: c.sivi });
      baglantilar.push({ odaId: u.odaId, oda: u.oda, tipAdi: u.tipAdi, kw: u.kw, bransman: null, uzaklik: L, kot: u.kot });
    }
  } else {
    // Zincir: Dış ünite —ana hat— B1 — B2 — … — B(n-1); her Bj'den u(j-1) ayrılır, son ünite B(n-1)'den
    parcalar.push({ ad: "Ana hat (dış ünite → " + (n > 1 ? "B1)" : "iç ünite)"), tur: "ANA", uzunluk: s.anaHat, kw: icToplam, gaz: 0, sivi: 0 });
    let yol = s.anaHat;
    for (let j = 1; j <= n - 1; j++) {
      const asagi = r1(uniteler.slice(j - 1).reduce((t, u) => t + u.kw, 0) * 100) / 100;
      bransmanlar.push({ no: j, kw: asagi, ad: (BRANSMAN_KADEMELERI.find((b) => asagi <= b.maksKw + 1e-9) ?? BRANSMAN_KADEMELERI[BRANSMAN_KADEMELERI.length - 1]).ad });
      const u = uniteler[j - 1];
      const c = capSec(IC_UNITE_CAPLARI, u.kw);
      parcalar.push({ ad: `B${j} → ${u.oda}`, tur: "BRANS", uzunluk: u.brans, kw: u.kw, gaz: c.gaz, sivi: c.sivi });
      baglantilar.push({ odaId: u.odaId, oda: u.oda, tipAdi: u.tipAdi, kw: u.kw, bransman: j, uzaklik: yol + u.brans, kot: u.kot });
      if (j < n - 1) {
        const sonraki = uniteler[j];
        const asagi2 = r1(uniteler.slice(j).reduce((t, x) => t + x.kw, 0) * 100) / 100;
        const ch = capSec(VRF_HAT_CAPLARI, asagi2);
        parcalar.push({ ad: `B${j} → B${j + 1}`, tur: "HAT", uzunluk: sonraki.hat, kw: asagi2, gaz: ch.gaz, sivi: ch.sivi });
        yol += sonraki.hat;
      }
    }
    const son = uniteler[n - 1];
    const cs = capSec(IC_UNITE_CAPLARI, son.kw);
    const sonUzunluk = n > 1 ? son.hat + son.brans : son.brans;
    parcalar.push({ ad: n > 1 ? `B${n - 1} → ${son.oda}` : `${son.oda} bağlantısı`, tur: "BRANS", uzunluk: sonUzunluk, kw: son.kw, gaz: cs.gaz, sivi: cs.sivi });
    baglantilar.push({ odaId: son.odaId, oda: son.oda, tipAdi: son.tipAdi, kw: son.kw, bransman: n > 1 ? n - 1 : null, uzaklik: yol + sonUzunluk, kot: son.kot });
  }
  const toplamBoru = parcalar.reduce((t, x) => t + x.uzunluk, 0);
  const enUzak = Math.max(0, ...baglantilar.map((b) => b.uzaklik));
  const ilkBransmandanSonra = multi ? 0 : Math.max(0, ...baglantilar.map((b) => b.uzaklik - s.anaHat));
  const leq = enUzak * 1.2;
  const bd = boruDuzeltme(leq);
  const fDis = sogutmaDisDuzeltme(kt);
  const fIsit = isitmaDisDuzeltme(disT);
  const oranMaks = s.oranMaks ?? tanim.oranMaks;

  // --- Dış ünite seçimi ---
  const degerlendir = (C: number, i: number) => {
    const sog = C * fDis * bd.sogutma;
    const isi = C * ISITMA_ORANI * fIsit * bd.isitma;
    const oran = (icToplam / C) * 100;
    const portUygun = !multi || n <= MULTI_ODA_SAYISI[Math.min(i, MULTI_ODA_SAYISI.length - 1)];
    return { C, sog, isi, oran, sogOk: sog + 1e-9 >= sogYuk, isiOk: !v.isitmaDa || isi + 1e-9 >= isiYuk, oranOk: oran <= oranMaks + 1e-9 && oran >= tanim.oranMin - 1e-9, portUygun };
  };
  const adaylar = tanim.dis.map((C, i) => degerlendir(C, i));
  let secim = s.disKwElle > 0 ? degerlendir(s.disKwElle, tanim.dis.findIndex((x) => x >= s.disKwElle) >= 0 ? tanim.dis.findIndex((x) => x >= s.disKwElle) : tanim.dis.length - 1) : null;
  if (!secim) {
    secim =
      adaylar.find((a) => a.sogOk && a.isiOk && a.oran <= oranMaks + 1e-9 && a.portUygun) ??
      adaylar.find((a) => a.sogOk && a.oran <= oranMaks + 1e-9 && a.portUygun) ??
      null;
    if (secim && !secim.isiOk)
      uy.push(
        `Soğutmaya göre seçilen dış ünite ${sy(disT)} °C'de ${sy(secim.isi)} kW ısıtma verir, ${sy(isiYuk)} kW gerekli. Isıtmayı tam karşılamak için daha büyük dış ünite (manuel seçin) ya da destek ısıtma gerekir.`
      );
    if (!secim) {
      const enBuyuk = adaylar[adaylar.length - 1];
      uy.push(
        `Bu sistem tek dış üniteyle karşılanamıyor (gerekli soğutma ${sy(sogYuk)} kW, iç ünite toplamı ${sy(icToplam)} kW, en büyük kademe ${sy(enBuyuk.C)} kW${multi ? `, en çok ${MULTI_ODA_SAYISI[MULTI_ODA_SAYISI.length - 1]} oda` : ""}). Odaları birden fazla sisteme bölün (sistem ekleyip odaların sistemini değiştirin).`
      );
    }
  }
  if (secim) {
    if (!secim.sogOk) uy.push(`Seçilen dış ünite düzeltilmiş soğutma kapasitesi (${sy(secim.sog)} kW) yükün (${sy(sogYuk)} kW) altında.`);
    if (s.disKwElle > 0 && v.isitmaDa && !secim.isiOk) uy.push(`Seçilen dış ünite ${sy(disT)} °C'de ${sy(secim.isi)} kW ısıtma verir, ${sy(isiYuk)} kW gerekli.`);
    if (secim.oran > oranMaks + 1e-9) uy.push(`Bağlantı oranı %${sy(secim.oran, 0)}; izin verilen en çok %${sy(oranMaks, 0)}.`);
    if (secim.oran < tanim.oranMin - 1e-9) uy.push(`Bağlantı oranı %${sy(secim.oran, 0)}; en az %${tanim.oranMin} olmalı (dış ünite gereğinden büyük).`);
    if (!secim.portUygun) uy.push(`Multi split dış ünitesi bu kadar odaya (${n}) bağlanamaz.`);
  }

  // Ana hat çapı dış üniteye göre
  if (!multi && parcalar.length) {
    const ana = parcalar[0];
    const c = capSec(VRF_HAT_CAPLARI, Math.max(icToplam, secim?.C ?? 0));
    ana.kw = secim?.C ?? icToplam;
    ana.gaz = c.gaz;
    ana.sivi = c.sivi;
  }

  // --- Kontroller ---
  const kontroller: SistemSonucu["kontroller"] = [];
  const kontrol = (ad: string, deger: number, sinir: number, birim = "m") =>
    kontroller.push({ ad, deger: `${sy(deger)} ${birim}`, sinir: `≤ ${sy(sinir)} ${birim}`, uygun: deger <= sinir + 1e-9 });
  kontrol("Toplam boru uzunluğu (tek hat)", toplamBoru, tanim.toplamBoru);
  kontrol(multi ? "En uzun oda hattı" : "En uzak iç üniteye gerçek uzunluk", enUzak, tanim.enUzak);
  if (!multi && n > 1) kontrol("İlk branşmandan en uzak iç üniteye", ilkBransmandanSonra, tanim.ilkBransmandanSonra);
  const kotlar = baglantilar.map((b) => b.kot);
  const kotDisFark = Math.max(...kotlar.map((k) => s.disKot - k));
  const kotDisAlt = Math.max(...kotlar.map((k) => k - s.disKot));
  if (kotDisFark > 0) kontrol("Kot farkı (dış ünite üstte)", kotDisFark, tanim.kotDisUstte);
  if (kotDisAlt > 0) kontrol("Kot farkı (dış ünite altta)", kotDisAlt, tanim.kotDisAltta);
  const kotIcFark = Math.max(...kotlar) - Math.min(...kotlar);
  if (n > 1) kontrol("İç üniteler arası kot farkı", kotIcFark, tanim.kotIcIc);
  kontroller.push({ ad: "İç ünite sayısı", deger: String(n), sinir: `≤ ${tanim.maksIcUnite}`, uygun: n <= tanim.maksIcUnite });
  if (secim) kontroller.push({ ad: "Bağlantı oranı", deger: `%${sy(secim.oran, 0)}`, sinir: `%${tanim.oranMin}–${sy(oranMaks, 0)}`, uygun: secim.oranOk });
  for (const k of kontroller) if (!k.uygun && k.ad !== "Bağlantı oranı") uy.push(`${k.ad}: ${k.deger} (sınır ${k.sinir}).`);
  if (s.tip === "VRF" && secim && secim.oran < tanim.oranMin && icToplam <= SISTEM_TIPLERI.MINI_VRF.dis[SISTEM_TIPLERI.MINI_VRF.dis.length - 1] * 1.3)
    uy.push("Bu büyüklükteki sistem için Mini VRF daha uygundur (sistem tipini Mini VRF yapın).");

  // --- Soğutucu akışkan ---
  const ak = AKISKANLAR[v.akiskan];
  let ekGaz = 0;
  for (const p of parcalar) {
    const f = EK_GAZ_R410A[String(p.sivi)] ?? 0.06;
    ekGaz += p.uzunluk * f * ak.gazOrani;
  }
  // Multi split dış ünitesi oda başına ~7,5 m boruya kadar fabrikada şarjlıdır; fazlası için ~20 g/m
  if (multi) ekGaz = Math.max(0, toplamBoru - 7.5 * n) * 0.02 * ak.gazOrani;
  const sarjTahmini = s.fabrikaSarj === null;
  const toplamSarj = (s.fabrikaSarj ?? (secim?.C ?? icToplam) * FABRIKA_SARJ_KG_KW) + ekGaz;
  const en378: SistemSonucu["en378"] = [];
  for (const o of odalarHam) {
    const r = odalar.find((x) => x.id === o.id)!;
    const hacim = o.en * o.boy * o.yukseklik;
    let sinir: number;
    if (ak.pl !== null) sinir = ak.pl * hacim;
    else {
      const h0 = IC_UNITE_TIPLERI[r.unite!.tip].h0;
      // EN 378-1 / IEC 60335-2-40: m1 = 4 m³ × LFL altında kısıt yok; üstünde m_maks = 2,5 · LFL^1,25 · h0 · √A
      const lfl = ak.lfl ?? 0.307;
      sinir = Math.max(4 * lfl, 2.5 * Math.pow(lfl, 1.25) * h0 * Math.sqrt(o.en * o.boy));
    }
    en378.push({ oda: o.ad, hacim, sinir, asiyor: toplamSarj > sinir });
  }
  const asan = en378.filter((e) => e.asiyor);
  if (asan.length)
    uy.push(
      `EN 378: ${asan.map((e) => e.oda).join(", ")} odalarında olası kaçakta izin verilen miktar (en az ${sy(Math.min(...asan.map((e) => e.sinir)), 2)} kg) sistem şarjından (${sy(toplamSarj, 2)} kg) küçük. Bu odalarda kaçak dedektörü + alarm ve otomatik kapama vanası, sürekli havalandırma ya da odayı ayrı / küçük sisteme bağlama gerekir.`
    );

  return {
    no: s.no,
    ad: s.ad,
    tip: s.tip,
    tipAdi: tanim.ad,
    uniteler: baglantilar,
    icToplamKw: r1(icToplam * 100) / 100,
    sogutmaYuku: sogYuk,
    isitmaYuku: isiYuk,
    disKw: secim?.C ?? null,
    disIsitmaKw: secim ? secim.C * ISITMA_ORANI : null,
    oran: secim?.oran ?? null,
    sogutmaDuzeltilmis: secim?.sog ?? null,
    isitmaDuzeltilmis: secim?.isi ?? null,
    duzeltme: { dis: fDis, boruSog: bd.sogutma, boruIsit: bd.isitma, disIsit: fIsit, leq },
    parcalar,
    bransmanlar,
    toplamBoru,
    enUzak,
    ilkBransmandanSonra,
    kotDisFark: kotDisFark > 0 ? kotDisFark : -kotDisAlt,
    kotIcFark,
    ekGaz,
    toplamSarj,
    sarjTahmini,
    en378,
    kontroller,
    uyarilar: uy,
  };
}

// ---------------------------------------------------------------------------
// 6. MALZEME LİSTESİ
// ---------------------------------------------------------------------------
function malzemeListesi(s: KlimaSonucu, v: KlimaVerisi): KlimaMalzeme[] {
  const m: KlimaMalzeme[] = [];
  const ek = (bolum: string, aciklama: string, adet: number, birim = "Adet") => {
    if (adet > 0) m.push({ bolum, aciklama, adet: Math.round(adet * 100) / 100, birim });
  };
  const ak = AKISKANLAR[v.akiskan].ad;
  for (const sis of s.sistemler) {
    const B = `${sis.tipAdi} — ${sis.ad}`;
    if (sis.disKw) ek(B, `${sis.tipAdi} dış ünite ${sy(sis.disKw)} kW soğutma / ${sy(sis.disIsitmaKw ?? 0)} kW ısıtma (${ak})`, 1);
    else ek(B, `${sis.tipAdi} dış ünite — en az ${sy(sis.sogutmaYuku)} kW soğutma (sistem bölünmeli)`, 1);
    const gruplar = new Map<string, number>();
    for (const u of sis.uniteler) {
      const ad = sis.tip === "MULTI" ? `Multi split iç ünite — ${u.tipAdi} ${btuAdi(u.kw)}` : `${sis.tipAdi} iç ünite — ${u.tipAdi} ${sy(u.kw)} kW`;
      gruplar.set(ad, (gruplar.get(ad) ?? 0) + 1);
    }
    for (const [a, n] of gruplar) ek(B, a, n);
    if (sis.tip !== "MULTI") {
      ek(B, "Kablolu oda kumandası", sis.uniteler.length);
      if (sis.tip === "VRF") ek(B, "Merkezi kumanda (dokunmatik)", 1);
      const kitler = new Map<string, number>();
      for (const b of sis.bransmanlar) kitler.set(b.ad, (kitler.get(b.ad) ?? 0) + 1);
      for (const [a, n] of kitler) ek(B, a, n);
    }
    const capMetre = new Map<number, number>();
    for (const p of sis.parcalar) {
      capMetre.set(p.gaz, (capMetre.get(p.gaz) ?? 0) + p.uzunluk);
      capMetre.set(p.sivi, (capMetre.get(p.sivi) ?? 0) + p.uzunluk);
    }
    for (const [cap, L] of [...capMetre.entries()].sort((a, b) => a[0] - b[0]))
      ek(B, `Bakır boru ${borAdi(cap)} + kauçuk köpüğü yalıtım`, Math.ceil(L * 1.1), "m");
    ek(B, `Ek soğutucu akışkan ${ak} (boru hattı için)`, Math.ceil(sis.ekGaz * 10) / 10, "kg");
    ek(B, "Yoğuşma suyu drenaj borusu (PVC Ø32) + yalıtım", Math.ceil(sis.uniteler.length * 3 + sis.parcalar.filter((p) => p.tur === "BRANS").reduce((t, p) => t + p.uzunluk, 0)), "m");
    if (sis.tip !== "MULTI") ek(B, "Haberleşme kablosu (2×1,5 mm² ekranlı)", Math.ceil(sis.toplamBoru * 1.1), "m");
    ek(B, "Dış ünite montaj sehpası + titreşim takozu", 1, "Set");
    ek(B, "Azot basınç testi, vakum, gaz şarjı ve devreye alma", 1, "İş");
  }
  if (s.splitler.length) {
    const B = "Split Klimalar";
    const gruplar = new Map<string, number>();
    for (const o of s.splitler) {
      const a = `${o.unite!.tipAdi} split klima ${btuAdi(o.unite!.kw)} (inverter, ${ak})`;
      gruplar.set(a, (gruplar.get(a) ?? 0) + o.unite!.adet);
    }
    for (const [a, n] of gruplar) ek(B, a, n);
    const uzunluk = s.splitler.reduce((t, o) => {
      const h = v.odalar.find((x) => x.id === o.id);
      return t + (h ? Math.max(3, h.bransMesafe) : 3) * o.unite!.adet;
    }, 0);
    ek(B, "Bakır boru seti (gaz + sıvı) + yalıtım + enerji/haberleşme kablosu", Math.ceil(uzunluk * 1.1), "m");
    ek(B, "Drenaj borusu", Math.ceil(uzunluk + 2 * s.splitler.length), "m");
    ek(B, "Dış ünite konsolu + titreşim takozu", s.splitler.reduce((t, o) => t + o.unite!.adet, 0), "Set");
    ek(B, "Split klima montajı (vakum ve devreye alma dahil)", s.splitler.reduce((t, o) => t + o.unite!.adet, 0), "İş");
  }
  return m;
}

// Raporlarda ve ekranda: iç ünite listesinin oda tipine göre kısa adı
export const odaTipiAdi = (t: keyof typeof ODA_TIPLERI) => ODA_TIPLERI[t].ad;
export const pencereUAdi = (k: string) => PENCERELER.find((p) => p.anahtar === k)?.ad ?? k;
