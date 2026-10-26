// -----------------------------------------------------------------------------
// FİYAT LİSTESİ — ortak tipler ve hesaplar (sunucu + tarayıcı)
// -----------------------------------------------------------------------------

export type FLKalem = {
  bolum: string;
  urunId: string | null;
  ad: string;
  kod: string | null;
  marka: string | null;
  aciklama: string | null;
  birim: string;
  fiyat: number; // liste para biriminde, iskontosuz (0 = fiyat sorunuz)
  fiyat2: number | null; // iki fiyatlı listede ikinci fiyat (ör. kart); 0 / boş = fiyat sorunuz
  fiyat3?: number | null; // 3. fiyat sütunu (ör. kredi kartı 9 taksit); 0 / boş = fiyat sorunuz
  gorselId: string | null;
};

export const DUZENLER = [
  { kod: "KART", ad: "Kartlar (sayfada 3 sütun, fotoğraf üstte)" },
  { kod: "LISTE", ad: "Liste (satır satır, uzun açıklamalara uygun)" },
  { kod: "TABLO", ad: "Tablo (kompakt, her bölümde bir fotoğraf; uzun fiyat listelerine uygun)" },
] as const;

export const duzenGecerli = (v: unknown) => (v === "LISTE" || v === "TABLO" ? v : "KART");

// Fiyat sütunu kalıpları (yeni liste oluştururken ve liste ayarlarında seçilir)
export const FIYAT_SUTUN_KALIPLARI = [
  { kod: "TEK", ad: "Tek fiyat", b1: "", b2: "" },
  { kod: "LISTE_SATIS", ad: "Liste Fiyatı + Satış Fiyatı", b1: "Liste Fiyatı", b2: "Satış Fiyatı" },
  { kod: "NAKIT_KART", ad: "Nakit + Kart", b1: "Nakit", b2: "Kart" },
] as const;

// İskontolu fiyatların yuvarlanması (liste ayarı). 0 = yuvarlama yok (varsayılan davranış).
export const YUVARLAMALAR = [
  { adim: 0, ad: "Yok" },
  { adim: 1, ad: "Tam sayıya" },
  { adim: 5, ad: "5'in katına" },
  { adim: 10, ad: "10'un katına" },
  { adim: 50, ad: "50'nin katına" },
  { adim: 100, ad: "100'ün katına" },
] as const;
export const yuvarlamaGecerli = (v: unknown): number => {
  const n = Number(v);
  return YUVARLAMALAR.some((y) => y.adim === n) ? n : 0;
};
// En yakın adım katına yuvarlar (0'a düşmez); adım 0 ise null döner (çağıran kendi varsayılanını uygular)
function adimaYuvarla(n: number, adim: number | null | undefined) {
  const a = yuvarlamaGecerli(adim);
  return a > 0 ? Math.max(a, Math.round(n / a) * a) : null;
}

// Satış fiyatı = liste fiyatı − iskonto. Yuvarlama seçilmemişse TL'de tam sayıya,
// döviz listelerinde kuruşa yuvarlanır.
export function iskontoUygula(fiyat: number, yuzde: number, paraBirimi: string, yuvarlama: number | null = 0) {
  const i = Math.min(100, Math.max(0, yuzde || 0));
  const n = fiyat * (1 - i / 100);
  return adimaYuvarla(n, yuvarlama) ?? (paraBirimi === "TRY" ? Math.round(n) : Math.round(n * 100) / 100);
}
// "25", "%25", "12,5" → 0–100 arası sayı; boş ya da geçersizse null
export function yuzdeOku(v: unknown): number | null {
  const t = String(v ?? "").trim().replace("%", "").replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null;
}

// İskonto hangi fiyata uygulanır (yalnız iki fiyatlı listede anlamlı; tek fiyatlı listede hep fiyata uygulanır)
export type IskontoKapsam = "HEPSI" | "FIYAT1" | "FIYAT2";
export const iskontoKapsamGecerli = (v: unknown): IskontoKapsam => (v === "FIYAT1" || v === "FIYAT2" ? v : "HEPSI");
// [1. fiyata uygulanan %, 2. fiyata uygulanan %]
export function sutunIskontolari(l: { iskontoYuzde: number; iskontoKapsam?: string | null; fiyat2Baslik?: string | null }): [number, number] {
  const i = Math.min(100, Math.max(0, l.iskontoYuzde || 0));
  if (!ikiFiyatli(l)) return [i, i];
  const k = iskontoKapsamGecerli(l.iskontoKapsam);
  return [k === "FIYAT2" ? 0 : i, k === "FIYAT1" ? 0 : i];
}

// İki fiyatlı liste mi (ör. Nakit / Kart)?
export const ikiFiyatli = (l: { fiyat2Baslik?: string | null }) => Boolean(l.fiyat2Baslik?.trim());

export const FIYAT_SORUNUZ = "Fiyat sorunuz";

// -----------------------------------------------------------------------------
// LİSTE SONU NOTLARI — ürüne bağlı notlar
// Not satırı "[anahtar] metin" biçimindeyse o not yalnız PDF'e giren ürünlerden birinin
// bölüm / ad / kod / markası bu anahtarı içeriyorsa çıkar (büyük-küçük harf ve Türkçe
// karakter farkı önemsizdir). Birden çok anahtar ";" ile ayrılır (biri yeterli);
// "a+b" yazılırsa aynı üründe ikisi birden aranır. Etiketsiz notlar her zaman çıkar.
// Köşeli parantezdeki anahtar müşteriye gösterilmez.
// -----------------------------------------------------------------------------
const NOT_ETIKETI = /^\s*\[([^\]\n]*)\]\s*/;
const sadeMetin = (m: string) =>
  m
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/\s+/g, " ");

// Notlardaki [anahtar] etiketlerini kaldırır (tüm notlar, etiketsiz)
export function notEtiketsiz(notlar: string) {
  return notlar
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((s) => s.replace(NOT_ETIKETI, ""))
    .join("\n");
}

// Ürün seçerek alınan PDF'te başlık altındaki açıklama: seçilen ürünlerin bölüm adlarından
// ("FreeDoor Hava Perdeleri · Isıtıcısız Silver Serisi" → "FreeDoor Hava Perdeleri") kurulur.
export function secimAciklamasi(kalemler: { bolum: string }[]) {
  const adlar: string[] = [];
  for (const k of kalemler) {
    const ad = k.bolum.split(" · ")[0].trim();
    if (ad && !adlar.includes(ad)) adlar.push(ad);
  }
  if (!adlar.length) return "";
  return (adlar.length === 1 ? adlar[0] : `${adlar.slice(0, -1).join(", ")} ve ${adlar[adlar.length - 1]}`) + ".";
}

// PDF'e giren ürünlere göre notları süzer; etiketler kaldırılmış metni döner
export function notlariSuz(notlar: string, kalemler: { bolum: string; ad: string; kod: string | null; marka: string | null }[]) {
  const metinler = kalemler.map((k) => sadeMetin(`${k.bolum} ${k.ad} ${k.kod ?? ""} ${k.marka ?? ""}`));
  return notlar
    .replace(/\r\n/g, "\n")
    .split("\n")
    .flatMap((satir) => {
      const m = satir.match(NOT_ETIKETI);
      if (!m) return [satir];
      const metin = satir.slice(m[0].length);
      const anahtarlar = m[1]
        .split(";")
        .map((a) => a.split("+").map((p) => sadeMetin(p).trim()).filter(Boolean))
        .filter((a) => a.length);
      if (!anahtarlar.length) return [metin];
      return anahtarlar.some((parcalar) => metinler.some((t) => parcalar.every((p) => t.includes(p)))) ? [metin] : [];
    })
    .join("\n")
    .trim();
}

export const metinAl = (v: unknown, sinir: number) => String(v ?? "").trim().slice(0, sinir);

// Formdan gelen JSON'u güvenle okur
export function flKalemleriOku(json: string | null | undefined): FLKalem[] {
  let v: unknown;
  try {
    v = JSON.parse(json || "[]");
  } catch {
    return [];
  }
  if (!Array.isArray(v)) return [];
  return v
    .slice(0, 1500)
    .map((k: Record<string, unknown>) => {
      const fiyat = Number(k?.fiyat);
      const fiyat2 = k?.fiyat2 === null || k?.fiyat2 === undefined || k?.fiyat2 === "" ? NaN : Number(k?.fiyat2);
      const fiyat3 = k?.fiyat3 === null || k?.fiyat3 === undefined || k?.fiyat3 === "" ? NaN : Number(k?.fiyat3);
      return {
        bolum: metinAl(k?.bolum, 120),
        urunId: metinAl(k?.urunId, 40) || null,
        ad: metinAl(k?.ad, 300),
        kod: metinAl(k?.kod, 120) || null,
        marka: metinAl(k?.marka, 120) || null,
        aciklama: metinAl(k?.aciklama, 3000) || null,
        birim: metinAl(k?.birim, 30) || "Adet",
        fiyat: Number.isFinite(fiyat) && fiyat >= 0 ? Math.round(fiyat * 100) / 100 : 0,
        fiyat2: Number.isFinite(fiyat2) && fiyat2 >= 0 ? Math.round(fiyat2 * 100) / 100 : null,
        fiyat3: Number.isFinite(fiyat3) && fiyat3 > 0 ? Math.round(fiyat3 * 100) / 100 : null,
        gorselId: metinAl(k?.gorselId, 40) || null,
      };
    })
    .filter((k) => k.ad);
}

// Liste iskontosu (PDF). Yuvarlama yalnız iskonto uygulanan fiyatlara yapılır;
// iskontosuz fiyat olduğu gibi kalır.
export function iskontoluFiyat(fiyat: number, iskontoYuzde: number, yuvarlama: number | null = 0) {
  const i = Math.min(100, Math.max(0, iskontoYuzde || 0));
  const n = fiyat * (1 - i / 100);
  return (i > 0 ? adimaYuvarla(n, yuvarlama) : null) ?? Math.round(n * 100) / 100;
}

export function paraSembolu(pb: string) {
  return pb === "EUR" ? "€" : pb === "USD" ? "$" : "TL";
}

export function flParaYaz(n: number, pb: string) {
  return `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${paraSembolu(pb)}`;
}

// Fiyat listesi başındaki bilgi cümlesi: "Fiyatlar EUR cinsindendir ve KDV hariçtir. ..."
export function fiyatBilgiCumlesi(l: {
  paraBirimi: string;
  kdvDahil: boolean;
  iskontoYuzde: number;
  fiyatGoster: boolean;
  iskontoKapsam?: string | null;
  fiyatBaslik?: string | null;
  fiyat2Baslik?: string | null;
}) {
  if (!l.fiyatGoster) return "";
  const pb = l.paraBirimi === "EUR" ? "Euro" : l.paraBirimi === "USD" ? "ABD Doları" : "Türk Lirası";
  // Uygulanan iskonto oranı müşteriye yazılmaz; PDF'te yalnız iskontolu fiyatlar görünür.
  return `Fiyatlar ${pb} cinsindendir ve KDV ${l.kdvDahil ? "dahildir" : "hariçtir"}.`;
}
