// -----------------------------------------------------------------------------
// BOSCH VRF (NETİSA MÜHENDİSLİK) TEKLİF PDF'İ AYIKLAMA
// Netisa CRM'den basılan teklif: kapakta "TOPLAM BEDEL € 207.559,42 + KDV",
// "PROJE ADI", teslim / ödeme koşulları; sonraki sayfalarda
// "SAP KODU · MALZEME AÇIKLAMASI · MİKTAR" tablosu. Her kalem:
//   "7733701713  BOSCH AF6300A 40 C-3 HR VRF Dış Ünite 14 hp  18 ADET"
// ardından "7733701713 Teknik Özellikler" (Soğutma / Isıtma Kapasitesi …) ve ürün
// fotoğrafı. Sonda "Toplam Fiyat: € 207.559,42 + KDV". Kalemlerde BİRİM FİYAT YOKTUR:
// teklif TCL'nin birim fiyatsız teklifi gibi kaydedilir (toplam, kâr eklenirken
// kalemlere paylaştırılır; müşteri belgesinde birim fiyat gizlenir).
// "Microsoft Print to PDF" ile basıldığında PDF'te yazı katmanı olmaz; o zaman sayfalar
// tarayıcıda görüntüden okunur (OCR, lib/tarayici-ocr.ts) ve metin buraya verilir.
// OCR hatalarına dayanıklı olsun diye Türkçe harfler esnek eşleştirilir.
// Saf fonksiyon: satır satır düz metin alır.
// -----------------------------------------------------------------------------
import type { TclKalem, TclSonuc } from "@/lib/tcl-teklif-ayikla";

const sade = (s: string) => s.normalize("NFKC").replace(/[ \t]+/g, " ").trim();

// "207.559,42" / "207,559.42" / "40,0" → sayı
function sayiOku(ham: string): number | null {
  let t = ham.replace(/\s/g, "");
  if (!/^\d[\d.,]*$/.test(t)) return null;
  const v = t.lastIndexOf(",");
  const n = t.lastIndexOf(".");
  if (v > n) t = t.replace(/\./g, "").replace(",", ".");
  else if (n > v && v >= 0) t = t.replace(/,/g, "");
  else if (n >= 0 && v < 0) t = /\.\d{3}$/.test(t) || (t.match(/\./g) ?? []).length > 1 ? t.replace(/\./g, "") : t;
  const x = Number(t);
  return Number.isFinite(x) ? x : null;
}

// PDF bir Netisa (Bosch VRF) teklifi mi? (OCR'da Türkçe harfler bozulabilir)
export function netisaTeklifiMi(metin: string): boolean {
  return /net[iİı1l]sa/i.test(metin) && /SAP\s*KODU/i.test(metin) && /M[İIı1l]KTAR/i.test(metin);
}

// Kalem satırı: "<SAP kodu> <açıklama> <adet> ADET" (JOINT satırında kod yerine "JOINT")
const KALEM_RE = /^(\d{8,12}|JO[İIı1l]NT)\s+(.+?)\s*[|]?\s+(\d{1,5})\s*(ADET|Adet|adet|AD\.?|Set|SET|set|Takım|TAKIM|Metre|METRE|Kg|KG)\.?$/;
// Teknik özellik başlığı: "7733701713 Teknik Özellikler"
const TEKNIK_RE = /^(\d{8,12})\s+Teknik\b/i;
const SOGUTMA_RE = /^S[oö0]\S{0,2}utma\s+Kapasitesi\s+(\d{1,4}(?:[.,]\d{1,2})?)\b/i;
const ISITMA_RE = /^[IİıiÍ]s\S{0,3}ma\s+Kapasitesi\s+(\d{1,4}(?:[.,]\d{1,2})?)\b/i;

// Ürün türüne göre bölüm (teklifte düzenli görünsün diye)
function otomatikBolum(metin: string): string {
  if (/joint|bran[şs]man/i.test(metin)) return "Bakır Bağlantı Elemanları (Joint)";
  if (/switch\s*box|\bAF-SB\b/i.test(metin)) return "HR Switch Box";
  if (/kumanda|kontrol|controller|gateway/i.test(metin)) return "Kontrol Sistemleri";
  if (/d[ıi1][şs]\s*[üu]nite|\bODU\b|AF6300/i.test(metin)) return "VRF Dış Üniteler";
  if (/gizl[iİı]\s*tavan|g[İIı]ZL[İIı]|kaset|duvar|kanal|konsol|asp[ıi]l|i[çc]\s*[üu]nite|\bAF2-/i.test(metin)) return "VRF İç Üniteler";
  return "Bosch Ürünleri";
}

// OCR'ın küçük bozulmaları: "2,8 kw" → "2,8 kW", "Dis Unite" → "Dış Ünite" (yalnız bilinen kalıplar)
function aciklamaDuzelt(s: string): string {
  return sade(
    s
      .replace(/[|]+/g, " ")
      .replace(/\bkw\b/g, "kW")
      .replace(/\bD[il1]s\s+[UÜ]n[il1]te\b/g, "Dış Ünite")
      .replace(/\bG[iİI1]ZL[iİI1]\s+TAVAN\b/g, "GİZLİ TAVAN")
  );
}

export function netisaTeklifAyikla(metinHam: string, ocr = false): TclSonuc {
  const uyarilar: string[] = [];
  const notlar: string[] = [];
  const satirlar = metinHam
    .split(/\r?\n|\f/)
    .map(sade)
    .filter(Boolean);
  const tum = satirlar.join("\n");

  // Proje adı: "Proje Adı: KÜÇÜK KÖY STADI" ya da "PROJE ADI" başlığının altındaki satır
  let projeAdi = "";
  for (let i = 0; i < satirlar.length && !projeAdi; i++) {
    const m = satirlar[i].match(/^Proje\s*Ad[ıiİI1l]\s*[:;]\s*(.+)$/i);
    if (m) projeAdi = sade(m[1]);
    else if (/^PROJE\s*AD[IİıiL1]$/i.test(satirlar[i]) && satirlar[i + 1]) projeAdi = satirlar[i + 1];
  }

  // Tarih: sayfa başındaki "18/11/2026 (T)"
  const t = tum.match(/\b(\d{1,2})[/.](\d{1,2})[/.](20\d\d)\b/);
  const tarih = t ? `${t[1].padStart(2, "0")}.${t[2].padStart(2, "0")}.${t[3]}` : "";

  // Toplam ve para birimi: "Toplam Fiyat: € 207.559,42 + KDV" ya da kapaktaki "€ 207.559,42 + KDV"
  let netTutar: number | null = null;
  let sembol = "";
  const tp = tum.match(/Toplam\s+Fiyat\s*[:;]?\s*(€|\$|₺|EUR|USD|TL|TRY|E)?\s*([\d.,]{3,})/i) ?? tum.match(/(€|\$|₺)\s*([\d.,]{3,})\s*\+?\s*KDV/i);
  if (tp) {
    netTutar = sayiOku(tp[2]);
    sembol = (tp[1] ?? "").toUpperCase();
  }
  const paraBirimi: TclSonuc["paraBirimi"] =
    sembol === "€" || sembol === "EUR" || (!sembol && /\bEURO?\b|€/i.test(tum))
      ? "EUR"
      : sembol === "$" || sembol === "USD" || (!sembol && /\bUSD\b|\$/.test(tum))
        ? "USD"
        : sembol === "₺" || sembol === "TL" || sembol === "TRY"
          ? "TRY"
          : "EUR";

  const teklifNo = tum.match(/Teklif\s*No\s*[:;]\s*(TE\s*-?\s*\d+)/i)?.[1]?.replace(/\s/g, "");
  if (teklifNo) notlar.push(`Netisa teklif no: ${teklifNo}`);
  notlar.push("Teklifte birim fiyat yok; toplam bedel KDV hariçtir ve kâr eklenirken kalemlere paylaştırılır.");

  // Kalemler ve teknik özellikleri
  type Acik = TclKalem & { sogutma?: number; isitma?: number };
  const kalemler: Acik[] = [];
  const teknikKodlar = new Set<string>();
  let son: Acik | null = null;
  for (const s of satirlar) {
    const k = s.match(KALEM_RE);
    if (k) {
      const joint = /^JO/i.test(k[1]);
      const ad = aciklamaDuzelt(k[2]);
      son = {
        bolum: "",
        kod: joint ? "" : k[1],
        aciklama: joint ? "Joint (bakır bağlantı elemanı)" : ad,
        adet: Number(k[3]),
        birimFiyat: 0,
        tutar: 0,
      };
      kalemler.push(son);
      continue;
    }
    const tk = s.match(TEKNIK_RE);
    if (tk) {
      teknikKodlar.add(tk[1]);
      // Teknik blok son okunan kaleme aitse değerleri ona yazılır
      if (!son || son.kod !== tk[1]) son = null;
      continue;
    }
    if (son) {
      const so = s.match(SOGUTMA_RE);
      if (so && son.sogutma === undefined) son.sogutma = sayiOku(so[1]) ?? undefined;
      const is = s.match(ISITMA_RE);
      if (is && son.isitma === undefined) son.isitma = sayiOku(is[1]) ?? undefined;
    }
  }

  const kw = (n: number) => `${n.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} kW`;
  const sonKalemler: TclKalem[] = kalemler.map(({ sogutma, isitma, ...k }) => {
    const ek = [sogutma !== undefined && sogutma > 0 ? `Soğutma ${kw(sogutma)}` : "", isitma !== undefined && isitma > 0 ? `Isıtma ${kw(isitma)}` : ""].filter(Boolean);
    return {
      ...k,
      bolum: otomatikBolum(`${k.aciklama} ${k.kod}`),
      aciklama: [k.aciklama, ...ek].join(" · ").slice(0, 480),
    };
  });

  // Kontroller: teknik özellik bloğu olup satırı okunamayan ürün, adet, toplam
  const kodlar = new Set(sonKalemler.map((k) => k.kod));
  for (const kod of teknikKodlar) if (!kodlar.has(kod)) uyarilar.push(`${kod} kodlu ürünün satırı (açıklama / adet) okunamadı; PDF ile karşılaştırıp ekleyin.`);
  for (const k of sonKalemler) if (!(k.adet > 0)) uyarilar.push(`${k.kod || k.aciklama}: adet okunamadı.`);
  if (!sonKalemler.length) uyarilar.push("Teklifte ürün satırı bulunamadı (\"SAP KODU · MALZEME AÇIKLAMASI · MİKTAR\" tablosu okunamadı).");
  if (netTutar == null || !(netTutar > 0)) {
    netTutar = null;
    if (sonKalemler.length) uyarilar.push("Teklifin toplam bedeli okunamadı; kaydettikten sonra satınalma teklifine toplam tutarı elle yazın.");
  }
  if (ocr && sonKalemler.length)
    uyarilar.push("Bu PDF'te yazı katmanı yok; sayfalar görüntüden okundu (OCR). Kaydetmeden önce kalemleri ve adetleri PDF ile karşılaştırın.");

  return {
    projeAdi,
    tarih,
    paraBirimi,
    kalemler: sonKalemler,
    netTutar,
    kalemToplami: 0,
    fiyatsiz: true,
    notlar,
    uyarilar,
    firma: "BOSCH",
  };
}
