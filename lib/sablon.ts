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

// --- TEKLİFE ÖZEL NOT METİNLERİ ---
// Teklif ekranında bir not yalnızca o teklif için düzenlenebilir. Düzenlenen metinler
// teklifte {"<notId>": "metin"} olarak saklanır; hazır not (şablon) değişmez.
export function ozelNotlariOku(json: string | null | undefined): Record<string, string> {
  try {
    const v = JSON.parse(json || "{}");
    if (!v || typeof v !== "object" || Array.isArray(v)) return {};
    const sonuc: Record<string, string> = {};
    for (const [k, m] of Object.entries(v)) if (typeof m === "string" && k) sonuc[k] = m;
    return sonuc;
  } catch {
    return {};
  }
}

// Notların metnine teklife özel düzenlemeleri uygular (görüntüleme, PDF, sözleşme)
export function notlariUygula<T extends { id: string; icerik: string }>(notlar: T[], ozelJson: string | null | undefined): T[] {
  const ozel = ozelNotlariOku(ozelJson);
  return notlar.map((n) => (Object.prototype.hasOwnProperty.call(ozel, n.id) ? { ...n, icerik: ozel[n.id] } : n));
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
