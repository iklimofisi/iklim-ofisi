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
  fiyat: number; // liste para biriminde, iskontosuz
  gorselId: string | null;
};

export const DUZENLER = [
  { kod: "KART", ad: "Kartlar (sayfada 3 sütun, fotoğraf üstte)" },
  { kod: "LISTE", ad: "Liste (satır satır, uzun açıklamalara uygun)" },
] as const;

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
    .slice(0, 500)
    .map((k: Record<string, unknown>) => {
      const fiyat = Number(k?.fiyat);
      return {
        bolum: metinAl(k?.bolum, 120),
        urunId: metinAl(k?.urunId, 40) || null,
        ad: metinAl(k?.ad, 300),
        kod: metinAl(k?.kod, 120) || null,
        marka: metinAl(k?.marka, 120) || null,
        aciklama: metinAl(k?.aciklama, 3000) || null,
        birim: metinAl(k?.birim, 30) || "Adet",
        fiyat: Number.isFinite(fiyat) && fiyat >= 0 ? Math.round(fiyat * 100) / 100 : 0,
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
export function fiyatBilgiCumlesi(l: { paraBirimi: string; kdvDahil: boolean; iskontoYuzde: number; fiyatGoster: boolean }) {
  if (!l.fiyatGoster) return "";
  const pb = l.paraBirimi === "EUR" ? "Euro" : l.paraBirimi === "USD" ? "ABD Doları" : "Türk Lirası";
  let c = `Fiyatlar ${pb} cinsindendir ve KDV ${l.kdvDahil ? "dahildir" : "hariçtir"}.`;
  if (l.iskontoYuzde > 0) c += ` Liste fiyatlarına %${l.iskontoYuzde.toLocaleString("tr-TR")} iskonto uygulanmıştır.`;
  return c;
}
