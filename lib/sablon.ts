// -----------------------------------------------------------------------------
// TEKLİF NOTLARI (ŞABLONLAR) — GRUPLAMA
//
// Her not iki isim taşır:
//   baslik     → yalnızca panelde görünen kod/ad  (örn. "Ödeme Koşulları (Ç-9)")
//   grupBaslik → müşteriye giden başlık           (örn. "Ödeme Koşulları")
// grupBaslik boşsa, adın sonundaki parantezli kod atılarak otomatik bulunur:
//   "Ödeme Koşulları (Ç-9)" → "Ödeme Koşulları"
// -----------------------------------------------------------------------------

export type SablonGrubuKaynak = { baslik: string; grupBaslik?: string | null };

export function sablonGrubu(s: SablonGrubuKaynak): string {
  const acik = (s.grupBaslik ?? "").trim();
  if (acik) return acik;
  const kodsuz = s.baslik.replace(/\s*[([][^)\]]*[)\]]\s*$/, "").trim();
  return kodsuz || s.baslik.trim();
}

// Sıralı listeyi gruplara ayırır; grupların sırası, grubun ilk notunun sırasıdır.
export function sablonlariGrupla<T extends SablonGrubuKaynak>(liste: T[]): { grup: string; notlar: T[] }[] {
  const gruplar = new Map<string, T[]>();
  for (const s of liste) {
    const g = sablonGrubu(s);
    const anahtar = g.toLocaleLowerCase("tr-TR");
    if (!gruplar.has(anahtar)) gruplar.set(anahtar, []);
    gruplar.get(anahtar)!.push(s);
  }
  return [...gruplar.values()].map((notlar) => ({ grup: sablonGrubu(notlar[0]), notlar }));
}
