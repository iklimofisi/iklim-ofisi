// -----------------------------------------------------------------------------
// BİNA ÖN GÖRÜNÜŞÜ — kaydedilen ayarlar (hesap verisinin "gorunus" alanı)
// Bağımlılığı yoktur: hesap tipleri (lib/isi-hesap/tipler.ts, lib/klima-hesap/tipler.ts)
// bunu döngüsel içe aktarma olmadan kullanır. Çizim: lib/bina-gorunus.ts
// -----------------------------------------------------------------------------
export type CihazTuru =
  | "DIS_POMPA" // ısı pompası dış ünitesi
  | "DIS_KLIMA" // VRF / multi / split dış ünitesi
  | "IC_DUVAR"
  | "IC_TAVAN" // kaset, tavan tipi
  | "IC_KANAL" // kanallı (asma tavan içinde)
  | "IC_DOSEME" // konsol, döşeme tipi
  | "BOYLER"
  | "TAMPON"
  | "KOLLEKTOR";

export type GorunusCihaz = {
  id: string; // konum anahtarı (hesap değişse de aynı cihaz için aynı kalır)
  tur: CihazTuru;
  ad: string;
  alt?: string;
  kat: number; // 0 zemin, 1.. üst katlar, -1 bodrum
  grup: string; // aynı gruptaki cihazlar birbirine boruyla bağlanır (dış ünite grubun başıdır)
  yer?: "CATI" | "DUVAR"; // dış ünite için öneri: çatı (düz çatıda) ya da dış duvar (split)
};

export type GorunusAyari = {
  katSayisi: number; // 0 = otomatik
  bodrum: boolean | null; // null = otomatik
  cati: "BESIK" | "DUZ";
  konumlar: Record<string, [number, number]>; // cihaz merkezi (çizim birimi)
};

export type GorunusGirdisi = {
  cihazlar: GorunusCihaz[];
  otoKatSayisi: number;
  baslik: string;
  bilgi: string[];
  boru: "SU" | "GAZ"; // su: gidiş / dönüş (kırmızı / mavi); gaz: soğutucu akışkan hattı
};

export const VARSAYILAN_GORUNUS: GorunusAyari = { katSayisi: 0, bodrum: null, cati: "BESIK", konumlar: {} };

export const GW = 280; // çizim genişliği
export const GH = 182; // çizim yüksekliği

// Hesap verisinden okuma (bozuk / eksik veri varsayılana döner)
export function gorunusOku(ham: unknown): GorunusAyari {
  if (!ham || typeof ham !== "object") return { ...VARSAYILAN_GORUNUS, konumlar: {} };
  const o = ham as Record<string, unknown>;
  const kat = Number(o.katSayisi);
  const konumlar: Record<string, [number, number]> = {};
  if (o.konumlar && typeof o.konumlar === "object") {
    for (const [k, v] of Object.entries(o.konumlar as Record<string, unknown>).slice(0, 300)) {
      if (typeof k !== "string" || k.length > 80 || !Array.isArray(v) || v.length !== 2) continue;
      const x = Number(v[0]);
      const y = Number(v[1]);
      if (Number.isFinite(x) && Number.isFinite(y)) konumlar[k] = [Math.min(GW, Math.max(0, x)), Math.min(GH, Math.max(0, y))];
    }
  }
  return {
    katSayisi: Number.isFinite(kat) && kat >= 0 && kat <= 8 ? Math.round(kat) : 0,
    bodrum: typeof o.bodrum === "boolean" ? o.bodrum : null,
    cati: o.cati === "DUZ" ? "DUZ" : "BESIK",
    konumlar,
  };
}

