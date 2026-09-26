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

export function tarihYaz(d: Date) {
  return new Date(d).toISOString().slice(0, 10);
}
