export type Musteri = {
  id: string;
  ad: string;
  telefon: string;
  vergiNo?: string;
  adres?: string;
};

export type TeklifDurum = "Beklemede" | "Onaylandı" | "Reddedildi";

export type TeklifKalem = {
  id: string;
  aciklama: string;
  adet: number;
  birimFiyat: number;
};

export type Teklif = {
  id: string;
  musteriId: string;
  tarih: string;
  durum: TeklifDurum;
  kalemler: TeklifKalem[];
};

export type CariHareket = {
  id: string;
  musteriId: string;
  tarih: string;
  aciklama: string;
  tur: "Borç" | "Alacak";
  tutar: number;
};

export const ornekMusteriler: Musteri[] = [
  { id: "m1", ad: "Deniz İnşaat A.Ş.", telefon: "0532 000 00 01", vergiNo: "1234567890" },
  { id: "m2", ad: "Aksoy Rezidans Yönetimi", telefon: "0533 000 00 02" },
  { id: "m3", ad: "Ege Soğuk Hava Deposu Ltd.", telefon: "0534 000 00 03", vergiNo: "9876543210" },
];

export const ornekTeklifler: Teklif[] = [
  {
    id: "t1",
    musteriId: "m1",
    tarih: "2026-07-12",
    durum: "Onaylandı",
    kalemler: [
      { id: "k1", aciklama: "12.000 BTU Split Klima Montajı", adet: 6, birimFiyat: 18500 },
      { id: "k2", aciklama: "Bakır Boru Tesisatı (metre)", adet: 40, birimFiyat: 620 },
    ],
  },
  {
    id: "t2",
    musteriId: "m2",
    tarih: "2026-07-28",
    durum: "Beklemede",
    kalemler: [
      { id: "k3", aciklama: "Yıllık Bakım Anlaşması", adet: 1, birimFiyat: 42000 },
    ],
  },
];

export const ornekCariHareketler: CariHareket[] = [
  { id: "c1", musteriId: "m1", tarih: "2026-07-12", aciklama: "Teklif #t1 - Fatura", tur: "Borç", tutar: 115000 },
  { id: "c2", musteriId: "m1", tarih: "2026-07-20", aciklama: "Kısmi Ödeme", tur: "Alacak", tutar: 60000 },
  { id: "c3", musteriId: "m3", tarih: "2026-07-15", aciklama: "Soğutma Ünitesi Bakımı", tur: "Borç", tutar: 28500 },
];
