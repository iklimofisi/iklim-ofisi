// -----------------------------------------------------------------------------
// SİPARİŞİN DONDURULMUŞ TUTARI
// Sipariş açılınca ve onaylanınca teklifin o anki kalemleri, KDV hariç net tutarı
// ve revizyon numarası siparişe yazılır. Teklif sonradan değiştirilse bile
// siparişin tutarı, cari borcu ve ciro raporu değişmez.
// Eski siparişlerde (tutarNet boş) tutar teklifin bugünkü kalemlerinden hesaplanır.
// -----------------------------------------------------------------------------

type Kalem = { bolum: string | null; aciklama: string; adet: number; birim: string; birimFiyat: number; iskontoYuzde: number; sira?: number };

export const satirNet = (k: { adet: number; birimFiyat: number; iskontoYuzde: number }) => k.adet * k.birimFiyat * (1 - k.iskontoYuzde / 100);

// Siparişe yazılacak dondurma verisi (teklif kalemleri formdaki sırayla)
export function siparisDondurmaVerisi(teklif: { paraBirimi: string; revizyonNo: number; kalemler: Kalem[] }) {
  const kalemler = [...teklif.kalemler].sort((a, b) => (a.sira ?? 0) - (b.sira ?? 0));
  const tutarNet = Math.round(kalemler.reduce((a, k) => a + satirNet(k), 0) * 100) / 100;
  return {
    tutarNet,
    paraBirimi: teklif.paraBirimi,
    teklifRevizyonNo: teklif.revizyonNo,
    kalemlerJson: JSON.stringify(
      kalemler.map((k) => ({ bolum: k.bolum, aciklama: k.aciklama, adet: k.adet, birim: k.birim, birimFiyat: k.birimFiyat, iskontoYuzde: k.iskontoYuzde }))
    ),
  };
}

// Siparişin KDV hariç net tutarı: dondurulmuşsa o, değilse teklifin bugünkü kalemlerinden
export function siparisNetTutari(s: { tutarNet: number | null; teklif: { kalemler: { adet: number; birimFiyat: number; iskontoYuzde: number }[] } }) {
  return s.tutarNet ?? s.teklif.kalemler.reduce((a, k) => a + satirNet(k), 0);
}
