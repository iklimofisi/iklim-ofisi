// -----------------------------------------------------------------------------
// GÖRÜŞME NOTLARI ve WHATSAPP — ortak yardımcılar
// (Görüşmeler veritabanında "Ziyaret" tablosunda tutulur; tür alanı eklenmiştir.)
// -----------------------------------------------------------------------------

export const GORUSME_TURLERI = [
  { kod: "TELEFON", ad: "Telefon", simge: "📞" },
  { kod: "ZIYARET", ad: "Ziyaret", simge: "🤝" },
  { kod: "WHATSAPP", ad: "WhatsApp", simge: "💬" },
  { kod: "EPOSTA", ad: "E-posta", simge: "✉️" },
  { kod: "DIGER", ad: "Not", simge: "📝" },
] as const;

export function gorusmeTuru(kod: string | null | undefined) {
  return GORUSME_TURLERI.find((t) => t.kod === kod) ?? GORUSME_TURLERI[1];
}

export function gecerliTur(kod: unknown): string {
  return GORUSME_TURLERI.some((t) => t.kod === kod) ? String(kod) : "ZIYARET";
}

export const teklifNoYaz = (no: number) => `TKL-${String(no).padStart(4, "0")}`;

// Telefonu WhatsApp'ın istediği biçime çevirir (yalnızca rakam, ülke koduyla).
// "0532 123 45 67" / "532 123 4567" / "+90 532..." → "905321234567"
// Tanınmayan biçimde ya da boşsa null (WhatsApp kişi seçtirerek açılır).
export function whatsappNumarasi(tel: string | null | undefined): string | null {
  let d = String(tel ?? "").replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = "90" + d.slice(1);
  else if (d.length === 10 && d.startsWith("5")) d = "90" + d;
  return d.length >= 10 && d.length <= 15 ? d : null;
}

export function whatsappLinki(tel: string | null | undefined, metin: string) {
  const no = whatsappNumarasi(tel);
  return `https://wa.me/${no ?? ""}?text=${encodeURIComponent(metin)}`;
}
