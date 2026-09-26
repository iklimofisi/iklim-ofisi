// Teklif tutarlarının TEK hesaplama noktası.
// Teklif detayı, PDF ve e-posta ile aynı formül: iskonto → KDV (dahil/hariç).

type KalemHesap = { adet: number; birimFiyat: number; iskontoYuzde: number | null };

export function teklifToplamlari(teklif: {
  kalemler: KalemHesap[];
  kdvDahil: boolean;
  kdvOrani: number;
}) {
  const girilenToplam = teklif.kalemler.reduce(
    (a, k) => a + k.adet * k.birimFiyat * (1 - (k.iskontoYuzde || 0) / 100),
    0
  );

  let araToplam: number;
  let kdvTutari: number;
  let genelToplam: number;

  if (teklif.kdvDahil) {
    genelToplam = girilenToplam;
    araToplam = girilenToplam / (1 + teklif.kdvOrani / 100);
    kdvTutari = genelToplam - araToplam;
  } else {
    araToplam = girilenToplam;
    kdvTutari = araToplam * (teklif.kdvOrani / 100);
    genelToplam = araToplam + kdvTutari;
  }

  return { araToplam, kdvTutari, genelToplam };
}

// MÜŞTERİYE giden belgelerde (yazdır/PDF, e-posta) gösterilen tek toplam satırı.
// Ara toplam ve KDV tutarı ayrıca yazılmaz:
//   KDV hariç teklif → "10.250,00 € + KDV"
//   KDV dahil teklif → "12.300,00 € (KDV dahil)"
export function musteriToplami(teklif: {
  kalemler: KalemHesap[];
  kdvDahil: boolean;
  kdvOrani: number;
}): { tutar: number; ek: string } {
  const t = teklifToplamlari(teklif);
  return teklif.kdvDahil ? { tutar: t.genelToplam, ek: "(KDV dahil)" } : { tutar: t.araToplam, ek: "+ KDV" };
}

// İlk hazırlanma tarihi: "ilkTarih" alanı sonradan eklendiği için eski tekliflerde
// eklendiği günün tarihini taşıyabilir. Bu yüzden bilinen en erken tarih kullanılır.
export function ilkHazirlanmaTarihi(teklif: {
  ilkTarih: Date;
  tarih: Date;
  revizyonlar?: { tarih: Date }[];
}): Date {
  const adaylar = [teklif.ilkTarih, teklif.tarih, ...(teklif.revizyonlar ?? []).map((r) => r.tarih)];
  return new Date(Math.min(...adaylar.map((d) => new Date(d).getTime())));
}

// MÜŞTERİYE giden belgede yazan teklif tarihi:
// revize edilmişse son revizyon tarihi, edilmemişse ilk hazırlanma tarihi.
export function musteriTeklifTarihi(teklif: {
  ilkTarih: Date;
  tarih: Date;
  revizyonNo: number;
  revizyonlar?: { tarih: Date }[];
}): Date {
  return teklif.revizyonNo > 1 ? new Date(teklif.tarih) : ilkHazirlanmaTarihi(teklif);
}

// Müşteri belgesindeki KDV + geçerlilik cümlesi (ekran, PDF aynı metin)
export function kosulCumlesi(teklif: { kdvDahil: boolean; gecerlilikGunu: number }): string {
  const kdv = teklif.kdvDahil ? "Birim fiyatlara KDV dahildir." : "Birim fiyatlara KDV dahil değildir.";
  return teklif.gecerlilikGunu > 0 ? `${kdv} Bu teklif ${teklif.gecerlilikGunu} gün süreyle geçerlidir.` : kdv;
}

export function tarihYaz(d: Date) {
  return new Date(d).toISOString().slice(0, 10);
}
