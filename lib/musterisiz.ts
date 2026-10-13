// -----------------------------------------------------------------------------
// MÜŞTERİSİZ TEKLİF
// Teklif tablosunda müşteri alanı zorunludur (sipariş, cari, rapor… hepsi buna
// dayanır). Müşterisi henüz belli olmayan teklifler sabit kimlikli bir sistem
// kaydına ("Müşterisiz teklif") bağlanır. Bu kayıt müşteri listelerinde, cari
// hesapta ve seçim kutularında GÖRÜNMEZ. Teklifte yazılan "muhatap" (isteğe
// bağlı serbest metin) PDF'te ve müşteri linkinde müşteri adı yerine çıkar.
// Teklif daha sonra "Müşteriye bağla" ile gerçek müşteriye aktarılır; sipariş ve
// sözleşme ancak bundan sonra oluşturulabilir.
// Bu dosya hem sunucu hem tarayıcı tarafında kullanılabilir (veritabanı erişimi yok).
// -----------------------------------------------------------------------------
export const MUSTERISIZ_ID = "musterisiz";
export const MUSTERISIZ_AD = "Müşterisiz teklif";
export const MUSTERISIZ_HITAP = "Sayın Yetkili";

export const musterisizMi = (id: string | null | undefined) => id === MUSTERISIZ_ID;

// prisma.musteri.findMany({ where: GERCEK_MUSTERI }) → sistem kaydı listelenmez
export const GERCEK_MUSTERI = { id: { not: MUSTERISIZ_ID } };

// Belgede (PDF, müşteri linki, e-posta) görünecek müşteri bilgisi: müşterisiz
// teklifte yalnız muhatap (yoksa "Sayın Yetkili") yazılır, diğer alanlar boş kalır.
export function musterisizGoster<T extends { musteriId: string; muhatap?: string | null; musteri: Record<string, unknown> }>(t: T): T {
  if (!musterisizMi(t.musteriId)) return t;
  return {
    ...t,
    musteri: {
      ...t.musteri,
      ad: t.muhatap?.trim() || MUSTERISIZ_HITAP,
      yetkiliAdi: null,
      yetkiliTelefon: null,
      yetkiliEmail: null,
      telefon: null,
      email: null,
      muhasebeEmail: null,
      vergiNo: null,
      faturaAdresi: null,
      sevkAdresi: null,
    },
  };
}

// Panelde listelerde gösterilecek ad: "Müşterisiz teklif · <muhatap>"
export function musteriEtiketi(musteriId: string, musteriAd: string, muhatap?: string | null) {
  if (!musterisizMi(musteriId)) return musteriAd;
  return muhatap?.trim() ? `${MUSTERISIZ_AD} · ${muhatap.trim()}` : MUSTERISIZ_AD;
}
