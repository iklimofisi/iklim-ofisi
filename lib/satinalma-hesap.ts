// -----------------------------------------------------------------------------
// TEDARİKÇİ (SATINALMA) TEKLİFİ HESAPLARI
// Bazı tedarikçiler birim fiyat vermez, sadece toplam verir. O durumda kalemler
// fiyatsız girilir ve "toplamTutar" alanına tedarikçinin toplamı yazılır.
// -----------------------------------------------------------------------------

import { toplamaGoreDagit } from "@/lib/toplam-dagit";

type Kalem = { aciklama: string; adet: number; birimFiyat: number };

// Birim fiyatlı kalemlerin toplamı
export function kalemToplami(kalemler: { adet: number; birimFiyat: number }[]) {
  return kalemler.reduce((a, k) => a + k.adet * k.birimFiyat, 0);
}

// Geçerli toplam: elle yazılan toplam varsa o, yoksa kalemlerden hesaplanan
export function satinalmaToplami(st: { toplamTutar: number | null; kalemler: { adet: number; birimFiyat: number }[] }) {
  return st.toplamTutar != null && st.toplamTutar > 0 ? st.toplamTutar : kalemToplami(st.kalemler);
}

// ALIŞ İSKONTOSU: tedarikçi (ör. TCL) liste fiyatı verir, bize özel iskonto oranını ayrıca
// söyler. Kalemlerde liste fiyatı saklanır; net alış = liste × (1 − iskonto %).
export const iskontoGecerli = (v: number | null | undefined) => (typeof v === "number" && Number.isFinite(v) && v > 0 && v < 100 ? v : 0);
export const netAlis = (listeFiyati: number, iskontoYuzde: number | null | undefined) =>
  Math.round(listeFiyati * (1 - iskontoGecerli(iskontoYuzde) / 100) * 100) / 100;
export function satinalmaNetToplami(st: { toplamTutar: number | null; alisIskontoYuzde?: number | null; kalemler: { adet: number; birimFiyat: number }[] }) {
  return Math.round(satinalmaToplami(st) * (1 - iskontoGecerli(st.alisIskontoYuzde) / 100) * 100) / 100;
}

// Tedarikçi teklifinden BİZİM teklifimize geçecek kalemler.
//   * Birim fiyatlı kalemler: fiyat × (1 + kâr marjı)
//   * Fiyatsız kalemler: tedarikçinin toplamından kalan tutar (+ marj), adetlerine
//     göre eşit birim fiyatla paylaştırılır; kuruş farkı kapatılır.
//   * Hiç kalem yoksa ama toplam varsa: teklif başlığıyla tek kalem.
// Toplam her durumda = tedarikçi toplamı × (1 + marj).
// fiyatsizVar: true ise müşteri belgesinde birim fiyatlar gizlenmeli (uydurma
// birim fiyatlar müşteriye gitmesin; müşteri kalemleri ve genel toplamı görür).
// Kalemdeki diğer alanlar (ör. bolum) olduğu gibi korunur.
type DonusumKalemi<K extends Kalem> = Kalem & Partial<Omit<K, keyof Kalem>>;
// alisIskontoYuzde: liste fiyatlarından düşülecek alış iskontosu (önce iskonto, sonra kâr)
export function donusumKalemleri<K extends Kalem>(
  st: { baslik: string; toplamTutar: number | null; kalemler: K[]; alisIskontoYuzde?: number | null },
  marjYuzdesi: number
): { kalemler: DonusumKalemi<K>[]; fiyatsizVar: boolean } {
  const carpan = (1 - iskontoGecerli(st.alisIskontoYuzde) / 100) * (1 + marjYuzdesi / 100);
  const elleToplam = st.toplamTutar != null && st.toplamTutar > 0 ? st.toplamTutar : null;

  if (st.kalemler.length === 0) {
    return elleToplam
      ? { kalemler: [{ aciklama: st.baslik, adet: 1, birimFiyat: Math.round(elleToplam * carpan * 100) / 100 } as DonusumKalemi<K>], fiyatsizVar: false }
      : { kalemler: [], fiyatsizVar: false };
  }

  const fiyatli = st.kalemler.map((k) => k.birimFiyat > 0);
  const fiyatsizVar = fiyatli.some((f) => !f);

  // Elle toplam yoksa eski davranış: sadece marj eklenir
  if (!elleToplam) {
    return {
      kalemler: st.kalemler.map((k) => ({ ...k, birimFiyat: k.birimFiyat * carpan })),
      fiyatsizVar: false,
    };
  }

  const fiyatliToplam = st.kalemler.reduce((a, k, i) => (fiyatli[i] ? a + k.adet * k.birimFiyat : a), 0);
  const kalan = elleToplam - fiyatliToplam;
  const fiyatsizAdet = st.kalemler.reduce((a, k, i) => (fiyatli[i] ? a : a + (k.adet > 0 ? k.adet : 1)), 0);

  // Başlangıç fiyatları: fiyatlılar marjlı; fiyatsızlar kalan tutarı adet başına eşit paylaşır
  const birimKalan = kalan > 0 && fiyatsizAdet > 0 ? (kalan * carpan) / fiyatsizAdet : 0;
  const tohum = st.kalemler.map((k, i) => ({
    ...k,
    aciklama: k.aciklama,
    adet: k.adet > 0 ? k.adet : 1,
    birimFiyat: fiyatli[i] ? k.birimFiyat * carpan : birimKalan,
  }));

  const hedef = Math.round(elleToplam * carpan * 100) / 100;
  const sonuc = toplamaGoreDagit(
    tohum.map((k) => ({ adet: k.adet, birimFiyat: k.birimFiyat, iskontoYuzde: 0 })),
    hedef
  );
  if (!sonuc.ok) return { kalemler: tohum, fiyatsizVar };

  // Kuruşa yuvarlayınca tam tutmadıysa (ör. bütün kalemler 3 adetlik) ve birim
  // fiyatlar müşteriye zaten gizliyse: yuvarlamadan oranla, toplam tam tutsun.
  if (sonuc.kalanFark !== 0 && fiyatsizVar) {
    const mevcut = tohum.reduce((a, k) => a + k.adet * k.birimFiyat, 0);
    if (mevcut > 0) {
      const k = hedef / mevcut;
      return { kalemler: tohum.map((t) => ({ ...t, birimFiyat: t.birimFiyat * k })), fiyatsizVar };
    }
  }

  return {
    kalemler: tohum.map((k, i) => ({ ...k, birimFiyat: sonuc.satirlar[i].birimFiyat })),
    fiyatsizVar,
  };
}
