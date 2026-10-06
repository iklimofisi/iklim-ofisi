// Teklif red nedenleri (teklif "Reddedildi" yapılırken sorulur)
export const RED_NEDENLERI = [
  { kod: "FIYAT", ad: "Fiyat yüksek bulundu" },
  { kod: "RAKIP", ad: "Başka firmayla çalışıldı" },
  { kod: "TEKNIK", ad: "Marka / teknik tercih" },
  { kod: "ERTELENDI", ad: "Proje ertelendi" },
  { kod: "IPTAL", ad: "Proje iptal oldu" },
  { kod: "CEVAPSIZ", ad: "Müşteriden dönüş olmadı" },
  { kod: "DIGER", ad: "Diğer" },
] as const;

export function redNedeniAdi(kod: string | null | undefined) {
  return RED_NEDENLERI.find((n) => n.kod === kod)?.ad ?? null;
}

export function gecerliRedNedeni(kod: unknown): string | null {
  return RED_NEDENLERI.some((n) => n.kod === kod) ? String(kod) : null;
}
