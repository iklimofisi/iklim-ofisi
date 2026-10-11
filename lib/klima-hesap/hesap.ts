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
  BS_KADEMELERI,
  basmaCapi,
  EK_GAZ_R410A,
  AKISKANLAR,
  FABRIKA_SARJ_KG_KW,
  borAdi,
  btuAdi,
  type IcUniteTipi,
  type SistemTipi,
} from "./katalog";
import type { KlimaVerisi, KlimaOda, Sistem } from "./tipler";
import { MEKANLAR, TAVAN_TIPLERI, TAZE_HAVA_DUZENLERI } from "./mekanlar";
import { uniteOner, etkinKanalTuru, type UniteOnerisi } from "./oneri";

// Isı geri kazanım verimleri (duyulur / gizli)
export const HRV_VERIM = { PLAKALI: { s: 0.75, l: 0 }, ENTALPI: { s: 0.7, l: 0.6 } } as const;

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
  mekanAd: string;
  yukseklik: number;
  tavanAd: string;
  tazeHavaAd: string;
  tazeDebi: number; // m³/h (mekânın gerektirdiği taze hava)
  yukseklikDuzeltmesi: number; // ısıtma yüküne uygulanan oran (0,05 = %5)
  oneri: UniteOnerisi | null;
  uyarilar: string[];
};

export type BoruParcasi = {
  ad: string; // "Ana hat", "B1 → B2", "Salon iç ünite hattı"
  tur: "ANA" | "HAT" | "BRANS";
  uzunluk: number;
  kw: number; // arkasındaki kapasite
  gaz: number;
  sivi: number;
  basma?: number; // 3 borulu sistemde basma gazı hattı
  etiket?: string; // panelde düzenlenebilen girdi ("anaHat|1", "hat|<odaId>", "brans|<odaId>")
  hatKismi?: number; // son ünitede: uzunluğun ana hat (gövde) kısmı
  hatEtiket?: string;
};

export type UniteBaglantisi = {
  odaId: string;
  oda: string;
  tipAdi: string;
  kw: number;
  bransman: number | null; // bağlı olduğu branşman no
  uzaklik: number; // dış üniteden gerçek boru uzunluğu
  kot: number;
  sira: number; // odadaki kaçıncı ünite (0 = ilk)
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
  disKot: number; // m
  oran: number | null; // %
  sogutmaDuzeltilmis: number | null; // kW
  isitmaDuzeltilmis: number | null; // kW
  duzeltme: { dis: number; boruSog: number; boruIsit: number; disIsit: number; leq: number };
  parcalar: BoruParcasi[];
  bransmanlar: { no: number; kw: number; ad: string }[];
  bsKutulari: { oda: string; kw: number; ad: string }[];
  tazeHavaToplam: number; // m³/h — mekanik taze hava alan odaların toplamı
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
// Güneş / dış hava yükü getiren yapı elemanları (bunlardan biri yoksa oda "iç oda" gibi hesaplanır)
const DISA_ACIK = new Set<string>(["DIS_DUVAR", "PENCERE", "DIS_KAPI", "CATI", "DOSEME_DIS", "ISITILMAYAN"]);

// ---------------------------------------------------------------------------
// 1. ODA SOĞUTMA YÜKÜ
// ---------------------------------------------------------------------------
function odaSogutma(o: KlimaOda, v: KlimaVerisi, kt: number, dxGkg: number, isiSonuc: ReturnType<typeof odaIsiKaybi>, tazeDebi: number) {
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
  const mk = MEKANLAR[o.mekan];
  kalemler.push({ ad: `Kişi (${o.kisi})`, duyulur: o.kisi * mk.duyulur, gizli: o.kisi * mk.gizli });
  const alan = o.en * o.boy;
  kalemler.push({ ad: "Aydınlatma", duyulur: o.aydinlatma * alan, gizli: 0 });
  kalemler.push({ ad: "Cihazlar", duyulur: o.cihaz, gizli: 0 });
  // Dış hava: sızıntı (n) ile mekanik taze havanın büyüğü; HRV'de taze hava kısmı geri kazanılır
  const sizinti = alan * o.yukseklik * o.havaDegisim; // m³/h
  const taze = o.tazeHava === "SIZINTI" ? 0 : tazeDebi;
  const V = Math.max(sizinti, taze);
  const verim = o.tazeHava === "HRV" ? HRV_VERIM[v.hrvTipi] : { s: 0, l: 0 };
  const vDuyulur = V - taze * verim.s;
  const vGizli = V - taze * verim.l;
  kalemler.push({
    ad: o.tazeHava === "SIZINTI" ? "Sızıntı / doğal havalandırma" : o.tazeHava === "HRV" ? `Taze hava ${Math.round(V)} m³/h (HRV ile)` : `Taze hava ${Math.round(V)} m³/h`,
    duyulur: Math.max(0, 0.34 * vDuyulur * dT),
    gizli: Math.max(0, 0.833 * vGizli * dxGkg),
  });
  const duyulur = kalemler.reduce((t, x) => t + x.duyulur, 0);
  const gizli = kalemler.reduce((t, x) => t + x.gizli, 0);
  return { kalemler, duyulur, gizli };
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
    const mk = MEKANLAR[o.mekan];
    const alan = o.en * o.boy;
    const tazeDebi = (o.kisi * mk.tazeKisi + alan * mk.tazeAlan) * 3.6; // m³/h
    const isi = odaIsiKaybi({ ...o, isitici: "RADYATOR" }, v, disT);
    const xIc = nemBagil(o.sogutmaSicaklik, v.icNem, p);
    const dx = Math.max(0, (xDis - xIc) * 1000);
    const sog = odaSogutma(o, v, kt, dx, isi, tazeDebi);
    const sogutma = sog.duyulur + sog.gizli;
    const gereken = sogutma * (1 + v.emniyetPayi / 100);
    // Isıtma: mekanik taze hava sızıntıdan fazlaysa fark eklenir; yüksek mekânda tabakalaşma düzeltmesi (EN 12831)
    let isitma = 0;
    let yukseklikDuzeltmesi = 0;
    if (v.isitmaDa) {
      const sizinti = alan * o.yukseklik * o.havaDegisim;
      const tazeEtkin = o.tazeHava === "SIZINTI" ? 0 : tazeDebi * (o.tazeHava === "HRV" ? 1 - HRV_VERIM[v.hrvTipi].s : 1);
      const tazeEk = 0.34 * Math.max(0, tazeEtkin - sizinti) * Math.max(0, o.sicaklik - disT);
      yukseklikDuzeltmesi = o.yukseklik > 4 ? Math.min(0.15, 0.025 * (o.yukseklik - 4)) : 0;
      isitma = (isi.toplam + tazeEk) * (1 + yukseklikDuzeltmesi);
    }

    let unite: KlimaOdaSonucu["unite"] = null;
    let oneri: UniteOnerisi | null = null;
    const sistem = o.sistem > 0 ? sistemTanim.get(o.sistem) : undefined;
    if (o.sistem > 0 && !sistem) uy.push(`Sistem ${o.sistem} tanımlı değil; oda bağımsız split klima olarak hesaplandı.`);
    const sTipi: SistemTipi | "SPLIT" = sistem ? sistem.tip : "SPLIT";
    if (o.klima) {
      // Bağımsız splitte ısıtma kapasitesi dış sıcaklıkla düşer (VRF / multi'de dış ünite ayrıca kontrol edilir)
      const isitmaKatsayi = sTipi === "SPLIT" ? isitmaDisDuzeltme(disT) : 1;
      oneri = uniteOner(o, sTipi, { gerekenW: gereken, duyulurW: sog.duyulur * (1 + v.emniyetPayi / 100), isitmaW: isitma, isitmaKatsayi, tazeDebi });
      const tipAdi = IC_UNITE_TIPLERI[oneri.tip].ad;
      unite = {
        tip: oneri.tip,
        tipAdi,
        kw: oneri.kw,
        adet: oneri.adet,
        ad: sTipi === "SPLIT" || sTipi === "MULTI" ? `${tipAdi} ${btuAdi(oneri.kw)}` : `${tipAdi} ${sy(oneri.kw)} kW`,
      };
      uy.push(...oneri.uyarilar);
      if (sTipi === "SPLIT" && isitma > 0) {
        const kap = oneri.kw * oneri.adet * ISITMA_ORANI * isitmaKatsayi * 1000;
        if (kap + 1 < isitma) uy.push(`Isıtmada yetersiz: ${sy(disT)} °C'de ~${sy(kap, 0)} W verir, ${sy(isitma, 0)} W gerekli.`);
        if (disT < -15) uy.push(`Dış tasarım ${sy(disT)} °C; standart split klimalar bu sıcaklıkta ısıtmada zorlanır, düşük sıcaklık (hyper heating) modeli seçilmeli.`);
      }
    }
    if (o.klima && !o.elemanlar.some((e) => DISA_ACIK.has(e.tur)))
      uy.push(
        `Dış duvar / pencere / çatı girilmedi: güneş ve iletim yükü hesapta yok, yük yalnız kişi + aydınlatma + cihaz + taze havadan oluşuyor (${sy(alan ? sogutma / alan : 0, 0)} W/m²). Oda bina içinde değilse "Yapı elemanları"ndan dış duvarı ve pencereyi yönüyle girin — güneye / batıya bakan camlı bir odada yük 2 katına çıkabilir.`
      );
    if (o.klima && mk.minKisi && o.kisi < mk.minKisi)
      uy.push(`${mk.ad} en az ${mk.minKisi} kişiyle hesaplanmalı (oda başına tasarım doluluğu); şu an ${o.kisi} kişi girili. "Mekâna göre doldur" ile güncelleyebilirsiniz.`);
    if (o.klima && sog.gizli / Math.max(1, sogutma) > 0.35) uy.push("Gizli (nem) yükü yüksek; nem alma için iç ünite düşük fan kademesinde çalışmalı ya da taze hava ön şartlandırılmalı.");
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
      mekanAd: mk.ad,
      yukseklik: o.yukseklik,
      tavanAd: TAVAN_TIPLERI[o.tavanTipi],
      tazeHavaAd: TAZE_HAVA_DUZENLERI[o.tazeHava],
      tazeDebi: o.klima ? tazeDebi : 0,
      yukseklikDuzeltmesi,
      oneri,
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
  const elemansiz = v.odalar.filter((o) => o.klima && !o.elemanlar.some((e) => DISA_ACIK.has(e.tur)));
  if (elemansiz.length)
    uyarilar.push(
      `${elemansiz.map((o) => o.ad).join(", ")}: dış duvar / pencere / çatı girilmemiş; güneş yükü ve ısı kaybı yalnız iç kazanç ve havalandırmadan hesaplandı. Oda gerçekten iç oda değilse Yapı elemanları bölümünden ekleyin.`
    );
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
  type U = { odaId: string; oda: string; tipAdi: string; kw: number; hat: number; brans: number; kot: number; tip: IcUniteTipi; sira: number };
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
        sira: i,
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
      parcalar.push({ ad: `${u.oda} hattı`, tur: "BRANS", uzunluk: L, kw: u.kw, gaz: c.gaz, sivi: c.sivi, etiket: `brans|${u.odaId}` });
      baglantilar.push({ odaId: u.odaId, oda: u.oda, tipAdi: u.tipAdi, kw: u.kw, bransman: null, uzaklik: L, kot: u.kot, sira: u.sira });
    }
  } else {
    // Zincir: Dış ünite —ana hat— B1 — B2 — … — B(n-1); her Bj'den u(j-1) ayrılır, son ünite B(n-1)'den
    parcalar.push({ ad: "Ana hat (dış ünite → " + (n > 1 ? "B1)" : "iç ünite)"), tur: "ANA", uzunluk: s.anaHat, kw: icToplam, gaz: 0, sivi: 0, etiket: `anaHat|${s.no}` });
    let yol = s.anaHat;
    for (let j = 1; j <= n - 1; j++) {
      const asagi = r1(uniteler.slice(j - 1).reduce((t, u) => t + u.kw, 0) * 100) / 100;
      bransmanlar.push({ no: j, kw: asagi, ad: (BRANSMAN_KADEMELERI.find((b) => asagi <= b.maksKw + 1e-9) ?? BRANSMAN_KADEMELERI[BRANSMAN_KADEMELERI.length - 1]).ad });
      const u = uniteler[j - 1];
      const c = capSec(IC_UNITE_CAPLARI, u.kw);
      parcalar.push({ ad: `B${j} → ${u.oda}`, tur: "BRANS", uzunluk: u.brans, kw: u.kw, gaz: c.gaz, sivi: c.sivi, etiket: `brans|${u.odaId}` });
      baglantilar.push({ odaId: u.odaId, oda: u.oda, tipAdi: u.tipAdi, kw: u.kw, bransman: j, uzaklik: yol + u.brans, kot: u.kot, sira: u.sira });
      if (j < n - 1) {
        const sonraki = uniteler[j];
        const asagi2 = r1(uniteler.slice(j).reduce((t, x) => t + x.kw, 0) * 100) / 100;
        const ch = capSec(VRF_HAT_CAPLARI, asagi2);
        parcalar.push({
          ad: `B${j} → B${j + 1}`,
          tur: "HAT",
          uzunluk: sonraki.hat,
          kw: asagi2,
          gaz: ch.gaz,
          sivi: ch.sivi,
          ...(sonraki.sira === 0 ? { etiket: `hat|${sonraki.odaId}` } : {}),
        });
        yol += sonraki.hat;
      }
    }
    const son = uniteler[n - 1];
    const cs = capSec(IC_UNITE_CAPLARI, son.kw);
    const sonUzunluk = n > 1 ? son.hat + son.brans : son.brans;
    parcalar.push({
      ad: n > 1 ? `B${n - 1} → ${son.oda}` : `${son.oda} bağlantısı`,
      tur: "BRANS",
      uzunluk: sonUzunluk,
      kw: son.kw,
      gaz: cs.gaz,
      sivi: cs.sivi,
      etiket: `brans|${son.odaId}`,
      ...(n > 1 ? { hatKismi: son.hat, ...(son.sira === 0 ? { hatEtiket: `hat|${son.odaId}` } : {}) } : {}),
    });
    baglantilar.push({ odaId: son.odaId, oda: son.oda, tipAdi: son.tipAdi, kw: son.kw, bransman: n > 1 ? n - 1 : null, uzaklik: yol + sonUzunluk, kot: son.kot, sira: son.sira });
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
  // 3 borulu (ısı geri kazanımlı) VRF: ana hat ve branşmanlar arası 3 boru, her odada BS kutusu
  const hr = s.tip === "VRF_HR";
  const bsKutulari: SistemSonucu["bsKutulari"] = [];
  if (hr) {
    for (const p of parcalar) if (p.tur !== "BRANS") p.basma = basmaCapi(p.gaz);
    for (const o of odalarHam) {
      const r = odalar.find((x) => x.id === o.id)!;
      const kw = r.unite!.kw * r.unite!.adet;
      // 28 kW üzeri bölgede BS kutusunun birden fazla portu birleştirilerek kullanılır
      const port = Math.ceil(kw / 28 - 1e-9);
      bsKutulari.push({
        oda: o.ad,
        kw,
        ad: port > 1 ? `BS kutusu (çok portlu, ${port} port birleştirmeli, port başına ≤ 28 kW)` : (BS_KADEMELERI.find((b) => kw <= b.maksKw + 1e-9) ?? BS_KADEMELERI[1]).ad,
      });
    }
  }
  // Eşzamanlı ısıtma-soğutma ihtiyacı → ısı geri kazanımlı VRF önerisi
  if (!hr && !multi && v.isitmaDa) {
    // Kış ısı dengesi: tasarım günü iç kazançları (kişi duyulur × 0,75 eşzamanlılık, aydınlatma ve cihaz × 0,8)
    // odanın ısı kaybını aşıyorsa oda kışın da soğutma ister. Yapı elemanı girilmemiş odalar için karar verilmez
    // (eksik veri iç zon sayılmaz); sunucu / elektrik odası ve ticari mutfak her zaman soğutma ister.
    const kisDengesi = odalarHam.map((o) => {
      const mk = MEKANLAR[o.mekan];
      const r = odalar.find((x) => x.id === o.id);
      const kazanc = o.kisi * mk.duyulur * 0.75 + o.aydinlatma * o.en * o.boy * 0.8 + o.cihaz * 0.8;
      const kayip = r?.isitma ?? 0;
      const veriVar = o.elemanlar.length > 0;
      const sogutmaIster = mk.ozel === "SUNUCU" || mk.ozel === "MUTFAK_TICARI" || (veriVar && kazanc > kayip * 1.1);
      return { o, kazanc, kayip, veriVar, sogutmaIster };
    });
    const icBolge = kisDengesi.filter((d) => d.sogutmaIster);
    const cevre = kisDengesi.filter((d) => !d.sogutmaIster && d.veriVar && d.kayip > d.kazanc);
    if (icBolge.length && cevre.length)
      uy.push(
        `Kış tasarım gününde ${icBolge
          .map((d) => (MEKANLAR[d.o.mekan].ozel ? `${d.o.ad} (${MEKANLAR[d.o.mekan].ad.toLocaleLowerCase("tr-TR")})` : `${d.o.ad} (iç kazanç ≈ ${sy(d.kazanc, 0)} W > ısı kaybı ≈ ${sy(d.kayip, 0)} W)`))
          .join(", ")} soğutma isterken ${cevre.map((d) => d.o.ad).join(", ")} ısıtma istiyor: eşzamanlı ısıtma-soğutma için ısı geri kazanımlı (3 borulu) VRF değerlendirilebilir; iç zondan alınan ısı ısıtılan odalara aktarılır.`
      );
    else if (odalarHam.filter((o) => o.mekan === "OTEL_ODA").length >= 6)
      uy.push("Otel odalarında misafirler aynı anda farklı mod isteyebilir; ısı geri kazanımlı (3 borulu) VRF değerlendirilmeli.");
  }
  const tazeHavaToplam = odalarHam.reduce((t, o) => (o.tazeHava === "SIZINTI" ? t : t + (odalar.find((x) => x.id === o.id)?.tazeDebi ?? 0)), 0);
  if (tazeHavaToplam > 1500 && odalarHam.some((o) => o.tazeHava === "MEKANIK"))
    uy.push(
      `Bu sistemdeki odaların taze hava ihtiyacı ≈ ${sy(tazeHavaToplam, 0)} m³/h: dış hava yükü iç ünitelere bindirilmemeli; merkezi ısı geri kazanımlı havalandırma ya da VRF taze hava işleme ünitesi önerilir.`
    );

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
    disKot: s.disKot,
    oran: secim?.oran ?? null,
    sogutmaDuzeltilmis: secim?.sog ?? null,
    isitmaDuzeltilmis: secim?.isi ?? null,
    duzeltme: { dis: fDis, boruSog: bd.sogutma, boruIsit: bd.isitma, disIsit: fIsit, leq },
    parcalar,
    bransmanlar,
    bsKutulari,
    tazeHavaToplam,
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
      if (sis.tip === "VRF" || sis.tip === "VRF_HR") ek(B, "Merkezi kumanda (dokunmatik)", 1);
      const bsGrup = new Map<string, number>();
      for (const b of sis.bsKutulari) bsGrup.set(b.ad, (bsGrup.get(b.ad) ?? 0) + 1);
      for (const [a, n] of bsGrup) ek(B, `Branşman seçici ${a}`, n);
      const kitler = new Map<string, number>();
      for (const b of sis.bransmanlar) kitler.set(b.ad, (kitler.get(b.ad) ?? 0) + 1);
      for (const [a, n] of kitler) ek(B, a, n);
    }
    const capMetre = new Map<number, number>();
    for (const p of sis.parcalar) {
      capMetre.set(p.gaz, (capMetre.get(p.gaz) ?? 0) + p.uzunluk);
      capMetre.set(p.sivi, (capMetre.get(p.sivi) ?? 0) + p.uzunluk);
      if (p.basma) capMetre.set(p.basma, (capMetre.get(p.basma) ?? 0) + p.uzunluk);
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
  // Hava dağıtımı, taze hava ve özel durum ekipmanları
  const H = "Hava Dağıtımı ve Havalandırma";
  const HRV_KADEMELERI = [150, 250, 350, 500, 650, 800, 1000, 1500, 2000];
  const hrvGrup = new Map<number, number>();
  let plenum = 0;
  let difuzor = 0;
  let jet = 0;
  let donus = 0;
  let kanalM2 = 0;
  let acikKanalM2 = 0;
  let tekstilM = 0;
  let kasetKasa = 0;
  let esnek = 0;
  for (const o of s.odalar) {
    const on = o.oneri;
    if (!o.klima || !on) continue;
    const ham = v.odalar.find((x) => x.id === o.id);
    if (on.esp !== null && on.tip !== "DOSEME_GIZLI" && ham) {
      const tur = etkinKanalTuru(ham);
      plenum += on.adet;
      donus += on.adet;
      if (tur === "TEKSTIL") tekstilM += (on.kanal ?? 0) * on.adet;
      else {
        if (o.yukseklik > 4.5) jet += on.menfez ?? 0;
        else difuzor += on.menfez ?? 0;
        if (tur === "ACIK") acikKanalM2 += (on.kanal ?? 0) * 1.6 * on.adet;
        else {
          kanalM2 += (on.kanal ?? 0) * 1.6 * on.adet;
          esnek += (on.menfez ?? 0) * 1.5;
        }
      }
    }
    if (ham?.tavanTipi === "ACIK" && IC_UNITE_TIPLERI[on.tip].montaj === "GOMME") kasetKasa += on.adet;
    if (ham?.tazeHava === "HRV" && o.tazeDebi > 0) {
      const n = Math.ceil(o.tazeDebi / 2000);
      const kademe = HRV_KADEMELERI.find((k) => k >= o.tazeDebi / n) ?? 2000;
      hrvGrup.set(kademe, (hrvGrup.get(kademe) ?? 0) + n);
    }
  }
  ek(H, "Besleme / dönüş plenum kutusu (izoleli) — kanallı iç üniteler", plenum, "Set");
  ek(H, "Girdaplı / lineer difüzör (damperli)", difuzor);
  ek(H, "Jet nozul (uzun atışlı, ayarlanabilir) — yüksek tavanlı mekanlar", jet);
  ek(H, "Dönüş menfezi (filtreli)", donus);
  ek(H, "Galvaniz hava kanalı + ısı / ses yalıtımı (asma tavan içi)", Math.ceil(kanalM2), "m²");
  ek(H, "Görünür dekoratif spiral kanal (çift cidarlı yalıtımlı, boyalı) + askı seti", Math.ceil(acikKanalM2), "m²");
  ek(H, "Tekstil (kumaş) hava kanalı, mikro delikli / nozullu + askı rayı", Math.ceil(tekstilM), "m");
  ek(H, "Kaset açık montaj kasası / dekoratif çerçeve + tij askı seti", kasetKasa, "Set");
  ek(H, "Esnek kanal (yalıtımlı) Ø200", Math.ceil(esnek), "m");
  for (const [k, n] of [...hrvGrup.entries()].sort((a, b) => a[0] - b[0])) ek(H, `Isı geri kazanımlı havalandırma cihazı ${k} m³/h (${v.hrvTipi === "ENTALPI" ? "entalpi" : "plakalı"} eşanjör)`, n);
  const sunucular = s.odalar.filter((o) => o.klima && o.unite && MEKANLAR[v.odalar.find((x) => x.id === o.id)?.mekan ?? "DIGER"].ozel === "SUNUCU");
  for (const o of sunucular) {
    ek(H, `Yedek (N+1) ünite — ${o.ad} (${o.unite!.ad})`, 1);
    ek(H, `Dönüşümlü çalıştırma / alarm kontrolörü — ${o.ad}`, 1);
  }
  return m;
}

// Raporlarda ve ekranda: iç ünite listesinin oda tipine göre kısa adı
export const odaTipiAdi = (t: keyof typeof ODA_TIPLERI) => ODA_TIPLERI[t].ad;
export const pencereUAdi = (k: string) => PENCERELER.find((p) => p.anahtar === k)?.ad ?? k;
