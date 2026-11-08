// -----------------------------------------------------------------------------
// MONTAJ KALEMLERİ (teklif formundaki "Montaj dahil / hariç" seçimi için)
// Önce Ürün Kataloğu'ndaki MNT- kodlu ürünler kullanılır (fiyatlar oradan
// güncellenebilir). Katalogda yoksa hazır "İklim Ofisi Montaj Birim Fiyatları"
// listesindeki değerler kullanılır.
// -----------------------------------------------------------------------------
import { hazirListeBul } from "@/lib/hazir-listeler";

export type MontajKalemi = { kod: string; ad: string; birim: string; fiyat: number; paraBirimi: string };

export const MONTAJ_KOD_ONEKI = "MNT-";

export function montajKalemleri(
  urunler: { kod: string | null; ad: string; birim: string; listeFiyati: number; paraBirimi: string }[]
): MontajKalemi[] {
  const katalog = urunler
    .filter((u) => (u.kod ?? "").toUpperCase().startsWith(MONTAJ_KOD_ONEKI))
    .map((u) => ({ kod: u.kod as string, ad: u.ad, birim: u.birim, fiyat: u.listeFiyati, paraBirimi: u.paraBirimi }))
    .sort((a, b) => a.kod.localeCompare(b.kod, "tr"));
  if (katalog.length) return katalog;
  const h = hazirListeBul("iklim-ofisi-montaj");
  if (!h) return [];
  return h.bolumler.flatMap((b) => b.kalemler.map((k) => ({ kod: k.kod, ad: k.ad, birim: k.birim || "Adet", fiyat: k.liste, paraBirimi: h.paraBirimi })));
}
