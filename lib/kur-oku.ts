// -----------------------------------------------------------------------------
// KUR OKUMA (sunucu ve istemci): "50,7537", "50.7537", "50.753" hepsi 50,75… olarak okunur.
// tutarOku binlik ayracı varsayar ("50.753" → 50753); kurda binlik ayraç olmaz, tek nokta ondalıktır.
// Makul aralık dışındaki kur (0 ya da 1000 TL üstü) geçersiz sayılır.
// -----------------------------------------------------------------------------
export const KUR_UST_SINIR = 1000;

export function kurOku(ham: unknown): number | null {
  let s = String(ham ?? "").replace(/[\s₺]/g, "").replace(/TL$/i, "");
  if (!s) return null;
  if (s.includes(",") && s.includes(".")) {
    s = s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else s = s.replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) && n > 0 && n < KUR_UST_SINIR ? n : null;
}
