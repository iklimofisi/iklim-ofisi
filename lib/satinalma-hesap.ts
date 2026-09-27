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

// Tedarikçi teklifinden BİZİM teklifimize geçecek kalemler.
//   * Birim fiyatlı kalemler: fiyat × (1 + kâr marjı)
//   * Fiyatsız kalemler: tedarikçinin toplamından kalan tutar (+ marj), adetlerine
//     göre eşit birim fiyatla paylaştırılır; kuruş farkı kapatılır.
//   * Hiç kalem yoksa ama toplam varsa: teklif başlığıyla tek kalem.
// Toplam her durumda = tedarikçi toplamı × (1 + marj).
// fiyatsizVar: true ise müşteri belgesinde birim fiyatlar gizlenmeli (uydurma
// birim fiyatlar müşteriye gitmesin; müşteri kalemleri ve genel toplamı görür).
export function donusumKalemleri(
  st: { baslik: string; toplamTutar: number | null; kalemler: Kalem[] },
  marjYuzdesi: number
): { kalemler: Kalem[]; fiyatsizVar: boolean } {
  const carpan = 1 + marjYuzdesi / 100;
  const elleToplam = st.toplamTutar != null && st.toplamTutar > 0 ? st.toplamTutar : null;

  if (st.kalemler.length === 0) {
    return elleToplam
      ? { kalemler: [{ aciklama: st.baslik, adet: 1, birimFiyat: Math.round(elleToplam * carpan * 100) / 100 }], fiyatsizVar: false }
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
