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

// Teklif listesi / Excel filtresi: "Teklif Durumu"
export const DURUM_FILTRELERI = [
  { kod: "BEKLEMEDE", ad: "Beklemede" },
  { kod: "ONAYLANDI", ad: "Onaylandı" },
  { kod: "LINK_ONAY", ad: "Onaylandı (müşteri linkten)" },
  { kod: "REDDEDILDI", ad: "Reddedildi" },
] as const;

export function durumFiltresi(kod: string | null | undefined) {
  if (kod === "BEKLEMEDE" || kod === "ONAYLANDI" || kod === "REDDEDILDI") return { durum: kod } as const;
  if (kod === "LINK_ONAY") return { durum: "ONAYLANDI", musteriOnayTarihi: { not: null } } as const;
  return {};
}

export function gecerliRedNedeni(kod: unknown): string | null {
  return RED_NEDENLERI.some((n) => n.kod === kod) ? String(kod) : null;
}
