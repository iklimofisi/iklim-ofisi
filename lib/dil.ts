// -----------------------------------------------------------------------------
// SİTE DİLLERİ (kurumsal site: Türkçe / English / Deutsch)
// Türkçe adresler aynı kalır (/hizmetler). İngilizce ve Almanca sayfalar aynı
// adresin önüne dil eklenerek açılır: /en/hizmetler, /de/hizmetler.
// middleware.ts /en/... ve /de/... isteklerini Türkçe sayfaya yönlendirir (rewrite)
// ve dili "x-site-dil" başlığıyla bildirir; sayfalar dili dilAl() ile okur
// (lib/dil-sunucu.ts). Yönetim paneli (/panel) ve müşteri teklif linki (/t/) yalnız Türkçedir.
// -----------------------------------------------------------------------------
export const DILLER = ["tr", "en", "de"] as const;
export type Dil = (typeof DILLER)[number];

export const DIL_BASLIGI = "x-site-dil";

export function dilMi(x: unknown): x is Dil {
  return typeof x === "string" && (DILLER as readonly string[]).includes(x);
}

export const DIL_ADI: Record<Dil, string> = { tr: "Türkçe", en: "English", de: "Deutsch" };
export const DIL_KISA: Record<Dil, string> = { tr: "TR", en: "EN", de: "DE" };
export const OG_DIL: Record<Dil, string> = { tr: "tr_TR", en: "en_US", de: "de_DE" };
export const HTML_DIL: Record<Dil, string> = { tr: "tr", en: "en", de: "de" };

// Dile çevrilmeyen (yalnız Türkçe) bölümler
const DILSIZ = /^\/(panel|api|t)(\/|$)/;

// Site içi bağlantıyı seçili dile çevirir: yol("en", "/hizmetler#vrf") → "/en/hizmetler#vrf"
export function yol(dil: Dil, href: string): string {
  if (dil === "tr" || !href.startsWith("/") || href.startsWith("//") || DILSIZ.test(href)) return href;
  if (href === "/") return `/${dil}`;
  if (href.startsWith("/#") || href.startsWith("/?")) return `/${dil}${href.slice(1)}`;
  return `/${dil}${href}`;
}

// "/en/hizmetler" → "/hizmetler" (dil öneki kaldırılır)
export function dilsizYol(yolAdi: string): string {
  const k = yolAdi.replace(/^\/(en|de)(?=\/|$)/, "");
  return k === "" ? "/" : k;
}

// Sayfa meta verisi: asıl adres (canonical) + diğer dillerdeki karşılıkları (hreflang)
export function dilAlternatifleri(dil: Dil, trYol: string) {
  return {
    canonical: yol(dil, trYol),
    languages: {
      "tr-TR": trYol,
      en: yol("en", trYol),
      de: yol("de", trYol),
      "x-default": trYol,
    },
  };
}
