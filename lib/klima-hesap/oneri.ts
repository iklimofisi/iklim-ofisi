// -----------------------------------------------------------------------------
// İÇ ÜNİTE ÖNERİ MOTORU
// Mekân tipi, tavan yüksekliği ve tipi, alan / derinlik, gürültü hassasiyeti,
// hava debisi ve kanal dış statik basıncına göre iç ünite tipini, adedini ve
// kapasitesini önerir; her kararın gerekçesini yazar. Kullanıcı tipi elle
// seçerse aynı kurallarla kontrol edilir ve uygunsuzluk uyarı olarak döner.
// -----------------------------------------------------------------------------
import { IC_UNITE_TIPLERI, VRF_TIPLERI, type IcUniteTipi, type SistemTipi, type UniteTanimi } from "./katalog";
import { MEKANLAR } from "./mekanlar";
import type { KlimaOda } from "./tipler";
import { sy } from "@/lib/isi-hesap/hesap";

export type SistemTuru = SistemTipi | "SPLIT";

export type UniteOnerisi = {
  tip: IcUniteTipi; // hesapta kullanılan
  onerilen: IcUniteTipi; // sistemin önerisi
  elle: boolean;
  adet: number;
  kw: number; // tek ünite nominal soğutma
  havaDebisi: number; // m³/h — duyulur yükün gerektirdiği besleme havası
  uniteDebisi: number; // m³/h — seçilen ünitelerin toplam tipik hava debisi
  havaDegisimi: number; // 1/h
  esp: number | null; // Pa — kanallı ünitede gereken dış statik basınç
  menfez: number | null;
  kanal: number | null; // m
  gerekce: string[];
  uyarilar: string[];
  alternatifler: IcUniteTipi[];
  ekler: string[]; // ek ekipman önerileri (HRV, jet nozul, yedek ünite…)
};

const KANALLI: IcUniteTipi[] = ["KANALLI_INCE", "KANALLI", "KANALLI_YUKSEK", "DOSEME_GIZLI"];
const SUPPLY_DT = 11; // K — besleme / oda sıcaklık farkı (DX batarya, tipik)

export function kapasiteListesi(t: IcUniteTipi, s: SistemTuru): number[] {
  const u = IC_UNITE_TIPLERI[t];
  return [...((VRF_TIPLERI as readonly string[]).includes(s) ? u.vrf : u.split)];
}

// Tipin bu kapasitede kullanılabildiği tavan yüksekliği (büyük gövdeli kasetler daha yükseğe çıkar)
export function tavanSiniri(t: IcUniteTipi, kw: number): { maks: number; yuksek: number } {
  const u: UniteTanimi = IC_UNITE_TIPLERI[t];
  const b = u.buyukGovde;
  if (b && kw >= b.kwMin - 1e-9) return { maks: b.tavanMaks, yuksek: b.tavanYuksekMod };
  return { maks: u.tavanMaks, yuksek: u.tavanYuksekMod };
}

// Bu tavan yüksekliğinde (yüksek tavan ayarı dahil) kullanılabilen kapasite kademeleri
export function yukseklikteKapasiteler(t: IcUniteTipi, s: SistemTuru, h: number): number[] {
  return kapasiteListesi(t, s).filter((kw) => tavanSiniri(t, kw).yuksek + 1e-9 >= h);
}

// Kanallı ünitede kullanılacak kanal: OTO → asma tavan varsa gizli, yoksa görünür dekoratif kanal
export function etkinKanalTuru(o: KlimaOda): "GIZLI" | "ACIK" | "TEKSTIL" {
  return o.kanalTuru === "OTO" ? (o.tavanTipi === "ACIK" ? "ACIK" : "GIZLI") : o.kanalTuru;
}

// Tipin bu odaya uygun olmama nedeni (yoksa null)
export function uygunsuzluk(t: IcUniteTipi, o: KlimaOda, s: SistemTuru): string | null {
  const u = IC_UNITE_TIPLERI[t];
  const h = o.yukseklik;
  if (t === "TAZE_HAVA") return "taze hava ünitesi oda yükünü almaz; yalnızca dış havayı şartlandırır";
  if (!kapasiteListesi(t, s).length) return (VRF_TIPLERI as readonly string[]).includes(s) ? "VRF sistemlerinde bu tip yok" : "split / multi split'te bu tip yok";
  if (!yukseklikteKapasiteler(t, s, h).length) {
    const enYuksek = Math.max(...kapasiteListesi(t, s).map((kw) => tavanSiniri(t, kw).yuksek));
    return `üretici tablolarına göre yüksek tavan ayarıyla en çok ${sy(enYuksek)} m tavana kadar kullanılabilir (tavan ${sy(h)} m); hava yaşam bölgesine inmez`;
  }
  if (h < u.tavanMin - 1e-9) return `en az ${sy(u.tavanMin)} m tavan yüksekliği gerekir`;
  return null;
}

// Açık tavanda (asma tavan yok) montaj şekli
export function montajNotu(t: IcUniteTipi, o: KlimaOda): string | null {
  const u: UniteTanimi = IC_UNITE_TIPLERI[t];
  if (u.montaj === "GOMME" && o.tavanTipi === "ACIK")
    return `${u.kisa} açık tavanda tij (askı çubuğu) ile tavana asılır, gövde görünür: açık montaj kasası / dekoratif çerçeve kullanılır; drenaj ve bakır borular görünür güzergâhta düzgün toplanmalı.`;
  if (u.montaj === "KANAL" && t !== "TAZE_HAVA") {
    const tur = etkinKanalTuru(o);
    if (tur === "ACIK")
      return `${u.kisa} ünite tij ile asılır, kanal görünür dekoratif (spiral galvaniz, boyalı) yapılır. Soğutmada yüzey yoğuşmasına karşı çift cidarlı yalıtımlı spiral kanal ya da dıştan yalıtım + kaplama gerekir.`;
    if (tur === "TEKSTIL") return "Tekstil (kumaş) kanal havayı boydan boya mikro delik / nozullarla eşit ve cereyansız dağıtır; kanal içinde ≈120 Pa basınç ister (tipik çalışma 40–400 Pa).";
    if (o.tavanTipi === "ACIK") return "Gizli kanal seçildi ama mekânda asma tavan yok: kanal görünür kalır; açık / dekoratif kanal seçin.";
  }
  return null;
}

function tercihSirasi(o: KlimaOda): IcUniteTipi[] {
  const mk = MEKANLAR[o.mekan];
  const h = o.yukseklik;
  const A = o.en * o.boy;
  const derinlik = Math.max(o.en, o.boy);
  const oran = Math.max(o.en, o.boy) / Math.max(0.1, Math.min(o.en, o.boy));
  const asma = o.tavanTipi !== "ACIK";
  const plaka = o.tavanTipi === "ASMA_PLAKA";
  let l: IcUniteTipi[];
  if (mk.ozel === "SUNUCU") l = ["DUVAR", "TAVAN", "KONSOL"];
  else if (mk.ozel === "MUTFAK_TICARI") l = ["TAVAN", "DUVAR"];
  else if (mk.ozel === "IBADET") l = h > 4.5 ? ["KANALLI_YUKSEK", "KONSOL", "SALON", "DOSEME_GIZLI"] : ["KONSOL", "KANALLI", "KASET", "DUVAR"];
  // 4,5 m üstü: kaset (yüksek tavan ayarı ≤ 4,5 m) ve tavan askılı (≤ 3,8–4,2 m) havayı yaşam bölgesine indiremez
  else if (h > 4.5) l = ["KANALLI_YUKSEK", "KONSOL", "SALON", "KANALLI"];
  // 3,2–4,5 m: yüksek tavan ayarlı kaset, girdaplı difüzörlü kanallı, tavan askılı (≤ 3,8 m)
  else if (h > 3.2) l = o.sessiz ? ["KANALLI", "KASET", "TAVAN", "KANALLI_YUKSEK"] : ["KASET", "KANALLI", "TAVAN", "KANALLI_YUKSEK"];
  else if (mk.grup === "Konut") {
    const kucuk = A <= 35 && derinlik <= 7;
    if (asma) l = kucuk ? ["KANALLI_INCE", "DUVAR", "KASET_KUCUK"] : ["KASET", "KANALLI", "KANALLI_INCE", "DUVAR"];
    else l = kucuk ? ["DUVAR", "KONSOL", "KANALLI_INCE"] : ["DUVAR", "KASET", "KANALLI", "TAVAN"];
  } else if (o.mekan === "OTEL_ODA" || o.mekan === "HASTA_ODASI") l = asma ? ["KANALLI_INCE", "DUVAR", "KASET_KUCUK"] : ["DUVAR", "KANALLI_INCE", "KONSOL"];
  else if (plaka) l = A <= 30 ? ["KASET_KUCUK", "KASET", "KANALLI_INCE"] : ["KASET", "KASET_KUCUK", "KANALLI"];
  else if (asma) l = o.sessiz ? ["KANALLI", "KANALLI_INCE", "KASET"] : ["KASET", "KANALLI", "KANALLI_INCE"];
  // Açık tavan: küçük odada duvar tipi; geniş alanda açık montaj kaset, görünür / tekstil kanallı ya da tavan askılı
  else if (A <= 40 && derinlik <= 8) l = o.sessiz ? ["DUVAR", "KANALLI_INCE", "KASET_KUCUK"] : ["DUVAR", "KASET_KUCUK", "KANALLI_INCE"];
  else l = o.sessiz ? ["KANALLI", "KASET", "TAVAN", "DUVAR"] : ["KASET", "KANALLI", "TAVAN", "DUVAR"];
  // Dar-uzun mekânda cephe boyunca tek / iki yön kaset
  if (oran > 2.5 && h <= 3.2 && !l.includes("KASET_TEK") && mk.grup !== "Konut") l.splice(1, 0, "KASET_TEK");
  // Kalanlar yedek sırada
  for (const t of Object.keys(IC_UNITE_TIPLERI) as IcUniteTipi[]) if (!l.includes(t) && t !== "TAZE_HAVA") l.push(t);
  return l;
}

// Kanallı ünitede gereken dış statik basınç (Pa) — mekâna göre:
//  kanal sürtünmesi : ≈1 Pa/m düz kanal × 1,5 (dirsek, redüksiyon, damper)
//  çıkış elemanı    : kare / lineer difüzör ≈20 Pa · girdaplı difüzör (3,2–4,5 m) ≈30 Pa ·
//                     uzun atışlı jet nozul (4,5 m üstü) atış mesafesine göre 30–150 Pa ·
//                     tekstil kanal iç basıncı ≈120 Pa (üretici: 40–400 Pa, çoğu sistem ~120 Pa)
//  dönüş / plenum   : ≈15 Pa · F7 ince filtre ≈100 Pa (ortalama kirlilik)
// Jet nozul basıncı: atış L ≈ 2,1·√Δp (DN 200–250 uzun atışlı nozul tablolarının ortalaması);
// gereken atış = 1,4 · (tavan − 1,8 m) + 4 m (yaşam bölgesine eğik üfleme + yatay erişim).
export function kanalBasinci(o: KlimaOda, debi: number) {
  const h = o.yukseklik;
  const derinlik = Math.max(o.en, o.boy);
  const tur = etkinKanalTuru(o);
  const kanal = o.kanalUzunluk > 0 ? o.kanalUzunluk : Math.round(derinlik * 0.5 + 2);
  const jet = h > 4.5 && tur !== "TEKSTIL";
  const girdapli = h > 3.2 && !jet && tur !== "TEKSTIL";
  let terminal: number;
  let menfez: number;
  let terminalAd: string;
  let atis: number | null = null;
  if (tur === "TEKSTIL") {
    terminal = 120;
    menfez = 0;
    terminalAd = "tekstil kanal iç basıncı ≈120 Pa";
  } else if (jet) {
    atis = Math.round((1.4 * (h - 1.8) + 4) * 10) / 10;
    terminal = Math.round(Math.min(150, Math.max(30, Math.pow(atis / 2.1, 2))));
    menfez = Math.max(1, Math.ceil(debi / 500));
    terminalAd = `uzun atışlı jet nozul (≈${sy(atis)} m atış için ≈${terminal} Pa)`;
  } else if (girdapli) {
    terminal = 30;
    menfez = Math.max(1, Math.ceil(debi / 450));
    terminalAd = "girdaplı difüzör ≈30 Pa";
  } else {
    terminal = 20;
    menfez = Math.max(1, Math.ceil(debi / 400));
    terminalAd = "kare / lineer difüzör ≈20 Pa";
  }
  const surtunme = Math.round(kanal * 1.5);
  const filtre = o.filtre === "F7" ? 100 : 0;
  const esp = surtunme + terminal + 15 + filtre;
  const detay = `kanal ${sy(kanal)} m × ≈1,5 Pa/m = ${surtunme} Pa + ${terminalAd} + dönüş / plenum 15 Pa${filtre ? " + F7 filtre ≈100 Pa" : ""}`;
  return { kanal, menfez, esp, jet, tur, atis, detay };
}

function espSinifi(esp: number): IcUniteTipi | null {
  if (esp <= 50) return "KANALLI_INCE";
  if (esp <= 150) return "KANALLI";
  if (esp <= 250) return "KANALLI_YUKSEK";
  return null;
}

export function uniteOner(
  o: KlimaOda,
  s: SistemTuru,
  yuk: { gerekenW: number; duyulurW: number; isitmaW: number; isitmaKatsayi: number; tazeDebi: number }
): UniteOnerisi {
  const mk = MEKANLAR[o.mekan];
  const A = o.en * o.boy;
  const h = o.yukseklik;
  const hacim = A * h;
  const derinlik = Math.max(o.en, o.boy);
  const gerekce: string[] = [];
  const uyarilar: string[] = [];
  const ekler: string[] = [];

  // --- 1. Tip seçimi ---
  const sira = tercihSirasi(o);
  const uygunlar = sira.filter((t) => !uygunsuzluk(t, o, s) && !(o.sessiz && IC_UNITE_TIPLERI[t].ses[0] >= 33 && t !== "KANALLI_YUKSEK"));
  const uygunlarGevsek = sira.filter((t) => !uygunsuzluk(t, o, s));
  let onerilen: IcUniteTipi = uygunlar[0] ?? uygunlarGevsek[0] ?? "DUVAR";

  // Aşırı büyük seçimden kaçın: yükseklik sınırı (ör. 4 m'de yalnız ≥ 9 kW kaset) ya da kapsama alanı
  // nedeniyle toplam kapasite ihtiyacın çok üstüne çıkıyorsa sıradaki uygun tip seçilir
  const ihtiyacKw = Math.max(yuk.gerekenW / 1000, yuk.isitmaW > 0 ? yuk.isitmaW / 1000 / (1.12 * yuk.isitmaKatsayi) : 0);
  const boyutla = (t: IcUniteTipi) => {
    const l = yukseklikteKapasiteler(t, s, h).length ? yukseklikteKapasiteler(t, s, h) : kapasiteListesi(t, s);
    if (!l.length) return { adet: 99, kw: 0, toplam: 1e9 };
    const enB = l[l.length - 1];
    const adet = Math.max(1, Math.ceil(ihtiyacKw / enB - 1e-9), KANALLI.includes(t) ? 1 : Math.ceil(A / IC_UNITE_TIPLERI[t].kapsama - 1e-9));
    const kw = l.find((x) => x >= ihtiyacKw / adet - 1e-9) ?? enB;
    return { adet, kw, toplam: adet * kw };
  };
  const asiri = (t: IcUniteTipi) => boyutla(t).toplam > Math.max(ihtiyacKw * 1.6, ihtiyacKw + 2.5);
  if (o.uniteTipi === "OTOMATIK" && o.uniteAdet <= 0 && o.uniteKw <= 0 && ihtiyacKw > 0 && asiri(onerilen)) {
    const daha = uygunlar.find((t) => t !== onerilen && !asiri(t));
    if (daha) {
      const b = boyutla(onerilen);
      gerekce.push(
        `${IC_UNITE_TIPLERI[onerilen].kisa} bu tavan / alanda ${b.adet} × ${sy(b.kw)} kW = ${sy(b.toplam)} kW olurdu, ihtiyaç ${sy(ihtiyacKw)} kW (aşırı büyük, kısa çalışıp kapanır, nem alamaz) → ${IC_UNITE_TIPLERI[daha].kisa}.`
      );
      onerilen = daha;
    }
  }

  if (h > 4.5) {
    gerekce.push(
      `Tavan ${sy(h)} m: 4 yön kasetler yüksek tavan ayarında en çok ≈4,5 m (büyük gövde), tavan askılı ≈3,8–4,2 m tavana kadar havayı yaşam bölgesine indirebilir (üretici tabloları). Daha yüksekte hava tavanda kalır, ısıtmada tabakalaşma olur; yüksek statik basınçlı kanallı ünite + uzun atışlı jet nozul / tekstil kanal ya da yaşam bölgesinden üfleyen konsol / salon tipi gerekir.`
    );
  } else if (h > 3.2)
    gerekce.push(
      `Tavan ${sy(h)} m: standart montaj sınırının (kaset 2,7–3,2 m) üstünde. Kaset yalnız yüksek tavan ayarıyla (küçük gövde ≤ 3,5 m, ≥ 9 kW büyük gövde ≤ 4,5 m), tavan askılı ≤ 3,8 m; kanallıda girdaplı difüzör kullanılır.`
    );
  if (o.tavanTipi === "ACIK") gerekce.push("Açık tavan: kaset tij ve açık montaj kasasıyla, kanallı görünür dekoratif ya da tekstil kanalla kullanılabilir; tip seçimi tavan yapısıyla değil yükseklik, alan ve gürültüye göre yapıldı.");
  else if (o.tavanTipi === "ASMA_PLAKA") gerekce.push("60×60 plaka asma tavan: kaset üniteler plakaya oturur, servis kolay.");
  if (o.sessiz) gerekce.push("Gürültüye duyarlı mekân: ses düzeyi düşük tipler öne alındı.");
  if (mk.not) gerekce.push(mk.not);

  // --- 2. Kanal basıncı (gerekirse tip yükseltilir) ---
  const havaDebisi = Math.max(0, yuk.duyulurW / (0.34 * SUPPLY_DT));
  let kanalBilgi: ReturnType<typeof kanalBasinci> | null = null;
  const kanalKontrol = (t: IcUniteTipi) => (KANALLI.includes(t) ? kanalBasinci(o, Math.max(havaDebisi, 1)) : null);
  if (o.uniteTipi === "OTOMATIK" && KANALLI.includes(onerilen) && onerilen !== "DOSEME_GIZLI") {
    const k = kanalKontrol(onerilen)!;
    const gerekli = espSinifi(k.esp);
    const sirasi = ["KANALLI_INCE", "KANALLI", "KANALLI_YUKSEK"];
    if (gerekli && sirasi.indexOf(gerekli) > sirasi.indexOf(onerilen) && !uygunsuzluk(gerekli, o, s)) {
      gerekce.push(
        `Gerekli dış statik basınç ≈ ${k.esp} Pa (${k.detay}) — ${IC_UNITE_TIPLERI[onerilen].kisa} (${IC_UNITE_TIPLERI[onerilen].esp![1]} Pa'a kadar) yetmez → ${IC_UNITE_TIPLERI[gerekli].kisa}.`
      );
      onerilen = gerekli;
    }
  }

  // Elle seçim kontrolü
  // Otomatik modda: önerilen tip çok sayıda ünite gerektiriyorsa daha az ünite ile çözen uygun tip tercih edilir
  const gerekliKwOn = Math.max(yuk.gerekenW / 1000, yuk.isitmaW > 0 ? yuk.isitmaW / 1000 / (1.12 * yuk.isitmaKatsayi) : 0);
  const adetTahmini = (t: IcUniteTipi) => {
    const l = yukseklikteKapasiteler(t, s, h).length ? yukseklikteKapasiteler(t, s, h) : kapasiteListesi(t, s);
    if (!l.length) return 99;
    return Math.max(1, Math.ceil(gerekliKwOn / l[l.length - 1] - 1e-9), KANALLI.includes(t) ? 1 : Math.ceil(A / IC_UNITE_TIPLERI[t].kapsama - 1e-9));
  };
  if (o.uniteTipi === "OTOMATIK" && o.uniteAdet <= 0 && adetTahmini(onerilen) > 8) {
    const daha = uygunlar.filter((t) => t !== onerilen).sort((a, b) => adetTahmini(a) - adetTahmini(b))[0];
    if (daha && adetTahmini(daha) * 2 <= adetTahmini(onerilen)) {
      gerekce.push(
        `${IC_UNITE_TIPLERI[onerilen].kisa} ile ${adetTahmini(onerilen)} ünite gerekirdi; daha az ve büyük ünite için ${IC_UNITE_TIPLERI[daha].kisa} (${adetTahmini(daha)} ünite) seçildi.`
      );
      onerilen = daha;
    }
  }

  const elle = o.uniteTipi !== "OTOMATIK";
  let tip: IcUniteTipi = elle ? (o.uniteTipi as IcUniteTipi) : onerilen;
  if (elle) {
    const neden = uygunsuzluk(tip, o, s);
    if (neden && !kapasiteListesi(tip, s).length) {
      uyarilar.push(`${IC_UNITE_TIPLERI[tip].ad}: ${neden}. Önerilen tip (${IC_UNITE_TIPLERI[onerilen].ad}) kullanıldı.`);
      tip = onerilen;
    } else if (neden) uyarilar.push(`Seçilen ${IC_UNITE_TIPLERI[tip].ad} bu mekâna uygun değil: ${neden}. Önerilen: ${IC_UNITE_TIPLERI[onerilen].ad}.`);
    else if (tip !== onerilen) gerekce.push(`Tip elle seçildi (${IC_UNITE_TIPLERI[tip].ad}); sistemin önerisi: ${IC_UNITE_TIPLERI[onerilen].ad}.`);
    if (o.sessiz && IC_UNITE_TIPLERI[tip].ses[0] >= 33) uyarilar.push(`${IC_UNITE_TIPLERI[tip].ad} ${IC_UNITE_TIPLERI[tip].ses[0]}–${IC_UNITE_TIPLERI[tip].ses[1]} dB(A) ses üretir; gürültüye duyarlı mekân için yüksek.`);
  }
  const u = IC_UNITE_TIPLERI[tip];

  // --- 3. Adet ve kapasite ---
  const tamListe = kapasiteListesi(tip, s).length ? kapasiteListesi(tip, s) : kapasiteListesi("DUVAR", s);
  const yListe = yukseklikteKapasiteler(tip, s, h);
  const liste = yListe.length ? yListe : tamListe;
  if (yListe.length && yListe.length < tamListe.length)
    gerekce.push(`Tavan ${sy(h)} m: ${u.kisa} bu yükseklikte yalnız yüksek tavan ayarlı ${sy(yListe[0])} kW ve üstü gövdelerle kullanılabilir.`);
  const gerekliKw = Math.max(yuk.gerekenW / 1000, yuk.isitmaW > 0 ? yuk.isitmaW / 1000 / (1.12 * yuk.isitmaKatsayi) : 0);
  const enBuyuk = liste[liste.length - 1];
  let adet: number;
  if (o.uniteAdet > 0) adet = o.uniteAdet;
  else {
    const kapAdet = Math.ceil(gerekliKw / enBuyuk - 1e-9);
    const alanAdet = KANALLI.includes(tip) ? 1 : Math.ceil(A / u.kapsama - 1e-9);
    adet = Math.min(30, Math.max(1, kapAdet, alanAdet));
    if (alanAdet > kapAdet && alanAdet > 1)
      gerekce.push(`Alan ${sy(A)} m²: bir ${u.kisa.toLocaleLowerCase("tr-TR")} ünite ≈ ${u.kapsama} m² kapsar → hava dağılımı için ${adet} ünite.`);
    else if (kapAdet > 1) gerekce.push(`Yük ${sy(gerekliKw)} kW, en büyük ${u.kisa.toLocaleLowerCase("tr-TR")} ${sy(enBuyuk)} kW → ${adet} ünite.`);
  }
  let kw = o.uniteKw > 0 ? o.uniteKw : liste.find((x) => x >= gerekliKw / adet - 1e-9) ?? enBuyuk;
  if (o.uniteKw > 0 && o.uniteKw * adet + 1e-9 < gerekliKw) uyarilar.push(`Seçilen ${adet} × ${sy(o.uniteKw)} kW yetersiz; en az ${sy(gerekliKw)} kW gerekli.`);
  if (o.uniteKw <= 0 && kw * adet + 1e-9 < gerekliKw) uyarilar.push(`${adet} × ${u.kisa} ${sy(kw)} kW yetmiyor (gerekli ${sy(gerekliKw)} kW); adet artırın.`);
  kw = Math.round(kw * 10) / 10;
  const ts = tavanSiniri(tip, kw);
  if (ts.maks < h && h <= ts.yuksek) gerekce.push(`${u.kisa} "yüksek tavan" ayarıyla devreye alınmalı (standart ${sy(ts.maks)} m, yüksek ayar ${sy(ts.yuksek)} m; tavan ${sy(h)} m).`);
  const mn = montajNotu(tip, o);
  if (mn) (mn.startsWith("Gizli kanal seçildi") ? uyarilar : gerekce).push(mn);
  if (tip === "DUVAR" && derinlik > u.atis * 1.1) {
    if (adet < 2) uyarilar.push(`Duvar tipi atışı ≈ ${u.atis} m, mekân derinliği ${sy(derinlik)} m: uzak bölge serinlemez; karşılıklı 2 ünite ya da kaset / kanallı önerilir.`);
    else gerekce.push(`Derinlik ${sy(derinlik)} m > duvar tipi atışı ${u.atis} m: üniteler karşılıklı yerleştirilmeli.`);
  }

  // --- 4. Hava debisi ve kanal ---
  const uniteDebisi = kw * adet * u.debiKw;
  if (havaDebisi > uniteDebisi * 1.25)
    uyarilar.push(
      `Duyulur yük oranı çok yüksek: ${sy(havaDebisi, 0)} m³/h besleme havası gerekir, seçilen üniteler ~${sy(uniteDebisi, 0)} m³/h verir. Daha büyük / yüksek hava debili ünite seçin.`
    );
  let esp: number | null = null;
  let menfez: number | null = null;
  let kanal: number | null = null;
  if (KANALLI.includes(tip)) {
    kanalBilgi = kanalKontrol(tip)!;
    esp = kanalBilgi.esp;
    menfez = tip === "DOSEME_GIZLI" ? adet : kanalBilgi.tur === "TEKSTIL" ? 0 : Math.max(adet, kanalBilgi.menfez);
    kanal = kanalBilgi.kanal;
    const aralik = u.esp!;
    if (tip !== "DOSEME_GIZLI") {
      gerekce.push(
        `Gerekli dış statik basınç ≈ ${esp} Pa = ${kanalBilgi.detay}; ünite aralığı ${aralik[0]}–${aralik[1]} Pa${menfez ? ` · ${menfez} ${kanalBilgi.jet ? "jet nozul" : "difüzör"}` : ""}.`
      );
      if (tip === "KANALLI_YUKSEK" && esp < aralik[0] && kanalBilgi.jet)
        gerekce.push(
          `Yüksek tavanda yaşam bölgesine ulaşacak uzun atış (jet nozul) gerektiği için yüksek fan basınçlı ünite seçildi; gereken ${esp} Pa ünitenin alt sınırının altında, devreye almada fan kademesi buna göre ayarlanır.`
        );
      if (esp > aralik[1]) {
        const g = espSinifi(esp);
        uyarilar.push(
          g ? `Gerekli dış statik basınç (${esp} Pa) ${u.kisa} için fazla; ${IC_UNITE_TIPLERI[g].ad} seçilmeli.` : `Gerekli dış statik basınç ${esp} Pa: VRF iç ünitesi yerine DX bataryalı klima santrali önerilir.`
        );
      }
      if (kanal > u.kanalMaks) uyarilar.push(`Kanal ${sy(kanal)} m, ${u.kisa} için önerilen en çok ${u.kanalMaks} m.`);
      if (kanalBilgi.jet) ekler.push(`${menfez} adet jet nozul (uzun atışlı, ≈${sy(kanalBilgi.atis ?? 0)} m atış, ısıtmada aşağı yönlendirilebilir)`);
      if (kanalBilgi.tur === "TEKSTIL") ekler.push(`Tekstil (kumaş) kanal ≈ ${sy(kanal * adet)} m, mikro delikli / nozullu`);
      else if (kanalBilgi.tur === "ACIK") ekler.push(`Görünür dekoratif spiral kanal ≈ ${sy(kanal * adet)} m (çift cidarlı yalıtımlı, boyalı) + askı seti`);
    }
  }

  // --- 5. Taze hava ---
  const sizinti = hacim * o.havaDegisim;
  if (yuk.tazeDebi > 0) {
    if (o.tazeHava === "SIZINTI" && yuk.tazeDebi > sizinti * 1.5 && mk.grup !== "Konut")
      uyarilar.push(`Bu mekân için ≈ ${sy(yuk.tazeDebi, 0)} m³/h taze hava gerekir (pencereyle sağlanamaz); ısı geri kazanımlı havalandırma (HRV) önerilir.`);
    if (o.tazeHava === "HRV") ekler.push(`Isı geri kazanımlı havalandırma ≈ ${sy(yuk.tazeDebi, 0)} m³/h`);
    if (o.tazeHava === "MEKANIK" && yuk.tazeDebi > 800) ekler.push(`Taze hava ${sy(yuk.tazeDebi, 0)} m³/h: yükü azaltmak için ısı geri kazanımlı cihaz ya da VRF taze hava işleme ünitesi önerilir`);
  }
  if (havaDebisi > 0) gerekce.push(`Besleme havası ≈ ${sy(havaDebisi, 0)} m³/h (ΔT ${SUPPLY_DT} K), hava değişimi ≈ ${sy(havaDebisi / Math.max(1, hacim), 1)} 1/h.`);

  // --- 6. Özel durumlar ---
  if (mk.ozel === "SUNUCU") {
    if ((VRF_TIPLERI as readonly string[]).includes(s) || s === "MULTI")
      uyarilar.push(
        "Sunucu / UPS odası VRF ya da multi sisteme bağlanmamalı: defrost ve yağ dönüşünde soğutma durur, kışın ısıtma modundaki sistemle çakışır. 7/24 çalışan bağımsız split (N+1 yedekli) ya da hassas kontrollü klima (CRAC) kullanın."
      );
    ekler.push("N+1 yedek ünite ve dönüşümlü çalıştırma kontrolörü; düşük dış sıcaklık (kış soğutma) kiti");
  }
  if (mk.ozel === "HIJYEN") uyarilar.push("Hijyen sınıfı gerektiren alanlarda (ameliyathane, yoğun bakım, izolasyon) %100 taze havalı hijyenik klima santrali kullanılmalıdır.");
  if (mk.ozel === "MUTFAK_TICARI") ekler.push("Davlumbaz egzozu kadar telafi havası (taze hava) sistemi");
  if (h > 6 && yuk.isitmaW > 0) ekler.push("Isıtmada tabakalaşmayı önlemek için tavan tipi destratifikasyon fanı ya da yerden ısıtma");

  // Alternatifler: yalnız bu yüke ve mekâna makul olan tipler (en küçük kademesi ihtiyacın çok üstünde olan,
  // ya da normal tavanlı küçük mekânda yüksek statik kanallı gibi aşırı çözümler gösterilmez)
  const alternatifler = uygunlarGevsek
    .filter((t) => t !== tip)
    .filter((t) => {
      const l = kapasiteListesi(t, s);
      if (!l.length || l[0] > gerekliKw * 2 + 1) return false;
      if (t === "KANALLI_YUKSEK" && h <= 4.5 && A < 80) return false;
      if (t === "SALON" && A < 80) return false;
      return true;
    })
    .slice(0, 3);
  return {
    tip,
    onerilen,
    elle,
    adet,
    kw,
    havaDebisi,
    uniteDebisi,
    havaDegisimi: havaDebisi / Math.max(1, hacim),
    esp,
    menfez,
    kanal,
    gerekce,
    uyarilar,
    alternatifler,
    ekler,
  };
}
