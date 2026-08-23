const GECERLI_PARA_BIRIMLERI = ["TRY", "USD", "EUR"] as const;
export type ParaBirimi = (typeof GECERLI_PARA_BIRIMLERI)[number];

/**
 * Excel/CSV'den veya kullanıcıdan gelen serbest metni geçerli bir ISO 4217
 * para birimi koduna çevirir. Tanınmayan/boş her şey TRY'ye düşer —
 * asla geçersiz bir kod veritabanına yazılmaz (örn. "EURO" → "EUR").
 */
export function paraBirimiDogrula(girdi: unknown): ParaBirimi {
  const s = String(girdi ?? "").trim().toUpperCase();
  if (["USD", "DOLAR", "DOLLAR", "$"].includes(s)) return "USD";
  if (["EUR", "EURO", "€"].includes(s)) return "EUR";
  if (["TRY", "TL", "TÜRK LİRASI", "₺"].includes(s)) return "TRY";
  return GECERLI_PARA_BIRIMLERI.includes(s as ParaBirimi) ? (s as ParaBirimi) : "TRY";
}

export function paraFormat(n: number, paraBirimiGirdi: string = "TRY"): string {
  const paraBirimi = paraBirimiDogrula(paraBirimiGirdi);
  try {
    return n.toLocaleString("tr-TR", { style: "currency", currency: paraBirimi });
  } catch {
    return `${n.toLocaleString("tr-TR")} ${paraBirimi}`;
  }
}
