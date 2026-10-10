// -----------------------------------------------------------------------------
// İLLERE GÖRE KIŞ DIŞ HAVA TASARIM SICAKLIKLARI
// Kaynak: TS 2164 (Kalorifer Tesisatı Projelendirme Kuralları) dış hava hesap
// sıcaklıkları; rakım bilgisiyle birlikte tesisat.org iklim verileri tablosundan
// alınmıştır. Düzce bu tabloda yoktur; komşu illere (Sakarya -3, Bolu -15) ve
// rakımına (146 m) göre -6 °C alınmıştır.
// Proje bazında farklı bir değer gerekiyorsa hesap ekranından elle değiştirilebilir
// (ör. yüksek rakımlı ilçeler için daha düşük sıcaklık).
// -----------------------------------------------------------------------------

export type IlVerisi = { ad: string; disSicaklik: number; rakim: number };

export const ILLER: IlVerisi[] = [
  { ad: "Adana", disSicaklik: 0, rakim: 21 },
  { ad: "Adıyaman", disSicaklik: -9, rakim: 678 },
  { ad: "Afyonkarahisar", disSicaklik: -12, rakim: 1019 },
  { ad: "Ağrı", disSicaklik: -24, rakim: 1585 },
  { ad: "Aksaray", disSicaklik: -15, rakim: 980 },
  { ad: "Amasya", disSicaklik: -12, rakim: 412 },
  { ad: "Ankara", disSicaklik: -12, rakim: 895 },
  { ad: "Antalya", disSicaklik: 3, rakim: 43 },
  { ad: "Ardahan", disSicaklik: -21, rakim: 1829 },
  { ad: "Artvin", disSicaklik: -9, rakim: 597 },
  { ad: "Aydın", disSicaklik: -3, rakim: 70 },
  { ad: "Balıkesir", disSicaklik: -3, rakim: 103 },
  { ad: "Bartın", disSicaklik: -3, rakim: 30 },
  { ad: "Batman", disSicaklik: -9, rakim: 540 },
  { ad: "Bayburt", disSicaklik: -15, rakim: 1550 },
  { ad: "Bilecik", disSicaklik: -9, rakim: 526 },
  { ad: "Bingöl", disSicaklik: -18, rakim: 1177 },
  { ad: "Bitlis", disSicaklik: -15, rakim: 1559 },
  { ad: "Bolu", disSicaklik: -15, rakim: 728 },
  { ad: "Burdur", disSicaklik: -9, rakim: 1025 },
  { ad: "Bursa", disSicaklik: -6, rakim: 99 },
  { ad: "Çanakkale", disSicaklik: -3, rakim: 3 },
  { ad: "Çankırı", disSicaklik: -15, rakim: 730 },
  { ad: "Çorum", disSicaklik: -15, rakim: 803 },
  { ad: "Denizli", disSicaklik: -6, rakim: 420 },
  { ad: "Diyarbakır", disSicaklik: -9, rakim: 652 },
  { ad: "Düzce", disSicaklik: -6, rakim: 146 },
  { ad: "Edirne", disSicaklik: -9, rakim: 47 },
  { ad: "Elazığ", disSicaklik: -12, rakim: 1090 },
  { ad: "Erzincan", disSicaklik: -18, rakim: 1157 },
  { ad: "Erzurum", disSicaklik: -21, rakim: 1893 },
  { ad: "Eskişehir", disSicaklik: -12, rakim: 790 },
  { ad: "Gaziantep", disSicaklik: -9, rakim: 849 },
  { ad: "Giresun", disSicaklik: -3, rakim: 40 },
  { ad: "Gümüşhane", disSicaklik: -12, rakim: 1219 },
  { ad: "Hakkari", disSicaklik: -24, rakim: 1720 },
  { ad: "Hatay", disSicaklik: 3, rakim: 3 },
  { ad: "Iğdır", disSicaklik: -18, rakim: 855 },
  { ad: "Isparta", disSicaklik: -9, rakim: 1050 },
  { ad: "İstanbul", disSicaklik: -3, rakim: 40 },
  { ad: "İzmir", disSicaklik: 0, rakim: 3 },
  { ad: "Kahramanmaraş", disSicaklik: -9, rakim: 549 },
  { ad: "Karabük", disSicaklik: -12, rakim: 354 },
  { ad: "Karaman", disSicaklik: -12, rakim: 1025 },
  { ad: "Kars", disSicaklik: -27, rakim: 1750 },
  { ad: "Kastamonu", disSicaklik: -12, rakim: 800 },
  { ad: "Kayseri", disSicaklik: -15, rakim: 1058 },
  { ad: "Kırıkkale", disSicaklik: -12, rakim: 725 },
  { ad: "Kırklareli", disSicaklik: -9, rakim: 232 },
  { ad: "Kırşehir", disSicaklik: -12, rakim: 980 },
  { ad: "Kilis", disSicaklik: -6, rakim: 638 },
  { ad: "Kocaeli", disSicaklik: -3, rakim: 77 },
  { ad: "Konya", disSicaklik: -12, rakim: 1024 },
  { ad: "Kütahya", disSicaklik: -12, rakim: 935 },
  { ad: "Malatya", disSicaklik: -12, rakim: 915 },
  { ad: "Manisa", disSicaklik: -3, rakim: 42 },
  { ad: "Mardin", disSicaklik: -6, rakim: 1150 },
  { ad: "Mersin", disSicaklik: 3, rakim: 6 },
  { ad: "Muğla", disSicaklik: -3, rakim: 648 },
  { ad: "Muş", disSicaklik: -18, rakim: 1283 },
  { ad: "Nevşehir", disSicaklik: -15, rakim: 1260 },
  { ad: "Niğde", disSicaklik: -15, rakim: 1239 },
  { ad: "Ordu", disSicaklik: -3, rakim: 4 },
  { ad: "Osmaniye", disSicaklik: -3, rakim: 121 },
  { ad: "Rize", disSicaklik: -3, rakim: 60 },
  { ad: "Sakarya", disSicaklik: -3, rakim: 30 },
  { ad: "Samsun", disSicaklik: -3, rakim: 40 },
  { ad: "Siirt", disSicaklik: -9, rakim: 875 },
  { ad: "Sinop", disSicaklik: -3, rakim: 25 },
  { ad: "Sivas", disSicaklik: -18, rakim: 1285 },
  { ad: "Şanlıurfa", disSicaklik: -6, rakim: 515 },
  { ad: "Şırnak", disSicaklik: -6, rakim: 1343 },
  { ad: "Tekirdağ", disSicaklik: -6, rakim: 55 },
  { ad: "Tokat", disSicaklik: -15, rakim: 608 },
  { ad: "Trabzon", disSicaklik: -3, rakim: 109 },
  { ad: "Tunceli", disSicaklik: -18, rakim: 979 },
  { ad: "Uşak", disSicaklik: -9, rakim: 911 },
  { ad: "Van", disSicaklik: -15, rakim: 1732 },
  { ad: "Yalova", disSicaklik: -3, rakim: 2 },
  { ad: "Yozgat", disSicaklik: -15, rakim: 1320 },
  { ad: "Zonguldak", disSicaklik: -3, rakim: 42 },
];

export const IL_KAYNAGI = "TS 2164 dış hava hesap sıcaklıkları";

export function ilBul(ad: string | null | undefined): IlVerisi {
  return ILLER.find((i) => i.ad === ad) ?? ILLER.find((i) => i.ad === "İstanbul")!;
}
