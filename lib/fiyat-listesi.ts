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

// Satış fiyatı = liste fiyatı − iskonto. TL'de tam sayıya, döviz listelerinde kuruşa yuvarlanır.
export function iskontoUygula(fiyat: number, yuzde: number, paraBirimi: string) {
  const i = Math.min(100, Math.max(0, yuzde || 0));
  const n = fiyat * (1 - i / 100);
  return paraBirimi === "TRY" ? Math.round(n) : Math.round(n * 100) / 100;
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

export function iskontoluFiyat(fiyat: number, iskontoYuzde: number) {
  const i = Math.min(100, Math.max(0, iskontoYuzde || 0));
  return Math.round(fiyat * (1 - i / 100) * 100) / 100;
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
  let c = `Fiyatlar ${pb} cinsindendir ve KDV ${l.kdvDahil ? "dahildir" : "hariçtir"}.`;
  if (l.iskontoYuzde > 0) {
    const yuzde = `%${l.iskontoYuzde.toLocaleString("tr-TR")}`;
    const k = ikiFiyatli(l) ? iskontoKapsamGecerli(l.iskontoKapsam) : "HEPSI";
    const sutun = k === "FIYAT1" ? l.fiyatBaslik?.trim() || "Fiyat" : k === "FIYAT2" ? l.fiyat2Baslik?.trim() || "Fiyat 2" : "";
    c += sutun ? ` ${sutun} sütunundaki fiyatlara ${yuzde} iskonto uygulanmıştır.` : ` Liste fiyatlarına ${yuzde} iskonto uygulanmıştır.`;
  }
  return c;
}
