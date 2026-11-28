// -----------------------------------------------------------------------------
// ÖDEME ŞEKLİ (müşteri tahsilatı ve tedarikçi ödemesi için ortak).
// Veritabanında kod saklanır (HAVALE, NAKIT, KART, CEK, SENET); eski serbest yazımlar da okunur.
// Yalnız çek ve senet vadelidir: çek / senet takibine ve vade uyarılarına yalnız bunlar girer.
// -----------------------------------------------------------------------------
export const ODEME_YONTEMLERI = [
  { deger: "HAVALE", etiket: "Havale / EFT" },
  { deger: "NAKIT", etiket: "Nakit" },
  { deger: "KART", etiket: "Kredi kartı" },
  { deger: "CEK", etiket: "Çek" },
  { deger: "SENET", etiket: "Senet" },
] as const;

export type OdemeYontemi = (typeof ODEME_YONTEMLERI)[number]["deger"];

// Vadeli ödeme şekilleri (çek / senet takibine girenler)
export const VADELI_YONTEMLER: OdemeYontemi[] = ["CEK", "SENET"];

const ESKI_YAZIMLAR: Record<string, OdemeYontemi> = {
  "eft/havale": "HAVALE",
  "havale/eft": "HAVALE",
  havale: "HAVALE",
  eft: "HAVALE",
  "çek": "CEK",
  senet: "SENET",
  nakit: "NAKIT",
  "kredi kartı": "KART",
  kart: "KART",
};

export function odemeYontemiOku(v: unknown): OdemeYontemi | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const kod = ODEME_YONTEMLERI.find((y) => y.deger === s.toUpperCase());
  if (kod) return kod.deger;
  return ESKI_YAZIMLAR[s.toLocaleLowerCase("tr-TR")] ?? null;
}

export function odemeYontemiEtiket(v?: string | null): string {
  const k = odemeYontemiOku(v);
  return k ? ODEME_YONTEMLERI.find((y) => y.deger === k)!.etiket : v ?? "";
}

export function vadeliMi(v?: string | null): boolean {
  const k = odemeYontemiOku(v);
  return k === "CEK" || k === "SENET";
}
