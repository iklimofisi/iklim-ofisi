// -----------------------------------------------------------------------------
// İLLERE GÖRE KIŞ DIŞ HAVA TASARIM SICAKLIKLARI
// Kaynak: TS 2164 (Kalorifer Tesisatı Projelendirme Kuralları) dış hava hesap
// sıcaklıkları; rakım bilgisiyle birlikte tesisat.org iklim verileri tablosundan
// alınmıştır. Düzce bu tabloda yoktur; komşu illere (Sakarya -3, Bolu -15) ve
// rakımına (146 m) göre -6 °C, yaz için 34/24 °C alınmıştır.
// Proje bazında farklı bir değer gerekiyorsa hesap ekranından elle değiştirilebilir
// (ör. yüksek rakımlı ilçeler için daha düşük sıcaklık).
// -----------------------------------------------------------------------------

// yazKT / yazYT: yaz dış hava tasarım kuru / yaş termometre sıcaklıkları (°C), aynı tablodan
export type IlVerisi = { ad: string; disSicaklik: number; rakim: number; yazKT: number; yazYT: number };

export const ILLER: IlVerisi[] = [
  { ad: "Adana", disSicaklik: 0, rakim: 21, yazKT: 38, yazYT: 26 },
  { ad: "Adıyaman", disSicaklik: -9, rakim: 678, yazKT: 38, yazYT: 22 },
  { ad: "Afyonkarahisar", disSicaklik: -12, rakim: 1019, yazKT: 34, yazYT: 21 },
  { ad: "Ağrı", disSicaklik: -24, rakim: 1585, yazKT: 34, yazYT: 25 },
  { ad: "Aksaray", disSicaklik: -15, rakim: 980, yazKT: 34, yazYT: 20 },
  { ad: "Amasya", disSicaklik: -12, rakim: 412, yazKT: 31, yazYT: 21 },
  { ad: "Ankara", disSicaklik: -12, rakim: 895, yazKT: 35, yazYT: 21 },
  { ad: "Antalya", disSicaklik: 3, rakim: 43, yazKT: 39, yazYT: 28 },
  { ad: "Ardahan", disSicaklik: -21, rakim: 1829, yazKT: 27, yazYT: 18 },
  { ad: "Artvin", disSicaklik: -9, rakim: 597, yazKT: 30, yazYT: 26 },
  { ad: "Aydın", disSicaklik: -3, rakim: 70, yazKT: 39, yazYT: 26 },
  { ad: "Balıkesir", disSicaklik: -3, rakim: 103, yazKT: 38, yazYT: 27 },
  { ad: "Bartın", disSicaklik: -3, rakim: 30, yazKT: 31, yazYT: 21 },
  { ad: "Batman", disSicaklik: -9, rakim: 540, yazKT: 40, yazYT: 23 },
  { ad: "Bayburt", disSicaklik: -15, rakim: 1550, yazKT: 33, yazYT: 23 },
  { ad: "Bilecik", disSicaklik: -9, rakim: 526, yazKT: 34, yazYT: 23 },
  { ad: "Bingöl", disSicaklik: -18, rakim: 1177, yazKT: 33, yazYT: 21 },
  { ad: "Bitlis", disSicaklik: -15, rakim: 1559, yazKT: 34, yazYT: 22 },
  { ad: "Bolu", disSicaklik: -15, rakim: 728, yazKT: 34, yazYT: 24 },
  { ad: "Burdur", disSicaklik: -9, rakim: 1025, yazKT: 36, yazYT: 21 },
  { ad: "Bursa", disSicaklik: -6, rakim: 99, yazKT: 37, yazYT: 25 },
  { ad: "Çanakkale", disSicaklik: -3, rakim: 3, yazKT: 34, yazYT: 25 },
  { ad: "Çankırı", disSicaklik: -15, rakim: 730, yazKT: 34, yazYT: 26 },
  { ad: "Çorum", disSicaklik: -15, rakim: 803, yazKT: 29, yazYT: 19 },
  { ad: "Denizli", disSicaklik: -6, rakim: 420, yazKT: 38, yazYT: 24 },
  { ad: "Diyarbakır", disSicaklik: -9, rakim: 652, yazKT: 42, yazYT: 23 },
  { ad: "Düzce", disSicaklik: -6, rakim: 146, yazKT: 34, yazYT: 24 },
  { ad: "Edirne", disSicaklik: -9, rakim: 47, yazKT: 36, yazYT: 25 },
  { ad: "Elazığ", disSicaklik: -12, rakim: 1090, yazKT: 38, yazYT: 21 },
  { ad: "Erzincan", disSicaklik: -18, rakim: 1157, yazKT: 36, yazYT: 22 },
  { ad: "Erzurum", disSicaklik: -21, rakim: 1893, yazKT: 31, yazYT: 23 },
  { ad: "Eskişehir", disSicaklik: -12, rakim: 790, yazKT: 34, yazYT: 24 },
  { ad: "Gaziantep", disSicaklik: -9, rakim: 849, yazKT: 39, yazYT: 23 },
  { ad: "Giresun", disSicaklik: -3, rakim: 40, yazKT: 29, yazYT: 25 },
  { ad: "Gümüşhane", disSicaklik: -12, rakim: 1219, yazKT: 33, yazYT: 23 },
  { ad: "Hakkari", disSicaklik: -24, rakim: 1720, yazKT: 34, yazYT: 20 },
  { ad: "Hatay", disSicaklik: 3, rakim: 3, yazKT: 37, yazYT: 29 },
  { ad: "Iğdır", disSicaklik: -18, rakim: 855, yazKT: 36, yazYT: 25 },
  { ad: "Isparta", disSicaklik: -9, rakim: 1050, yazKT: 34, yazYT: 21 },
  { ad: "İstanbul", disSicaklik: -3, rakim: 40, yazKT: 33, yazYT: 24 },
  { ad: "İzmir", disSicaklik: 0, rakim: 3, yazKT: 37, yazYT: 25 },
  { ad: "Kahramanmaraş", disSicaklik: -9, rakim: 549, yazKT: 36, yazYT: 22 },
  { ad: "Karabük", disSicaklik: -12, rakim: 354, yazKT: 32, yazYT: 25 },
  { ad: "Karaman", disSicaklik: -12, rakim: 1025, yazKT: 34, yazYT: 21 },
  { ad: "Kars", disSicaklik: -27, rakim: 1750, yazKT: 30, yazYT: 20 },
  { ad: "Kastamonu", disSicaklik: -12, rakim: 800, yazKT: 34, yazYT: 22 },
  { ad: "Kayseri", disSicaklik: -15, rakim: 1058, yazKT: 36, yazYT: 23 },
  { ad: "Kırıkkale", disSicaklik: -12, rakim: 725, yazKT: 35, yazYT: 21 },
  { ad: "Kırklareli", disSicaklik: -9, rakim: 232, yazKT: 35, yazYT: 25 },
  { ad: "Kırşehir", disSicaklik: -12, rakim: 980, yazKT: 35, yazYT: 21 },
  { ad: "Kilis", disSicaklik: -6, rakim: 638, yazKT: 39, yazYT: 23 },
  { ad: "Kocaeli", disSicaklik: -3, rakim: 77, yazKT: 36, yazYT: 25 },
  { ad: "Konya", disSicaklik: -12, rakim: 1024, yazKT: 34, yazYT: 22 },
  { ad: "Kütahya", disSicaklik: -12, rakim: 935, yazKT: 33, yazYT: 21 },
  { ad: "Malatya", disSicaklik: -12, rakim: 915, yazKT: 38, yazYT: 21 },
  { ad: "Manisa", disSicaklik: -3, rakim: 42, yazKT: 40, yazYT: 26 },
  { ad: "Mardin", disSicaklik: -6, rakim: 1150, yazKT: 38, yazYT: 23 },
  { ad: "Mersin", disSicaklik: 3, rakim: 6, yazKT: 35, yazYT: 29 },
  { ad: "Muğla", disSicaklik: -3, rakim: 648, yazKT: 37, yazYT: 22 },
  { ad: "Muş", disSicaklik: -18, rakim: 1283, yazKT: 32, yazYT: 20 },
  { ad: "Nevşehir", disSicaklik: -15, rakim: 1260, yazKT: 28, yazYT: 17 },
  { ad: "Niğde", disSicaklik: -15, rakim: 1239, yazKT: 34, yazYT: 20 },
  { ad: "Ordu", disSicaklik: -3, rakim: 4, yazKT: 30, yazYT: 22 },
  { ad: "Osmaniye", disSicaklik: -3, rakim: 121, yazKT: 38, yazYT: 26 },
  { ad: "Rize", disSicaklik: -3, rakim: 60, yazKT: 30, yazYT: 26 },
  { ad: "Sakarya", disSicaklik: -3, rakim: 30, yazKT: 35, yazYT: 25 },
  { ad: "Samsun", disSicaklik: -3, rakim: 40, yazKT: 32, yazYT: 25 },
  { ad: "Siirt", disSicaklik: -9, rakim: 875, yazKT: 40, yazYT: 23 },
  { ad: "Sinop", disSicaklik: -3, rakim: 25, yazKT: 30, yazYT: 25 },
  { ad: "Sivas", disSicaklik: -18, rakim: 1285, yazKT: 33, yazYT: 20 },
  { ad: "Şanlıurfa", disSicaklik: -6, rakim: 515, yazKT: 43, yazYT: 24 },
  { ad: "Şırnak", disSicaklik: -6, rakim: 1343, yazKT: 34, yazYT: 20 },
  { ad: "Tekirdağ", disSicaklik: -6, rakim: 55, yazKT: 33, yazYT: 25 },
  { ad: "Tokat", disSicaklik: -15, rakim: 608, yazKT: 29, yazYT: 20 },
  { ad: "Trabzon", disSicaklik: -3, rakim: 109, yazKT: 31, yazYT: 25 },
  { ad: "Tunceli", disSicaklik: -18, rakim: 979, yazKT: 37, yazYT: 22 },
  { ad: "Uşak", disSicaklik: -9, rakim: 911, yazKT: 35, yazYT: 22 },
  { ad: "Van", disSicaklik: -15, rakim: 1732, yazKT: 33, yazYT: 21 },
  { ad: "Yalova", disSicaklik: -3, rakim: 2, yazKT: 33, yazYT: 24 },
  { ad: "Yozgat", disSicaklik: -15, rakim: 1320, yazKT: 32, yazYT: 20 },
  { ad: "Zonguldak", disSicaklik: -3, rakim: 42, yazKT: 32, yazYT: 25 },
];

export const IL_KAYNAGI = "TS 2164 dış hava hesap sıcaklıkları";

export function ilBul(ad: string | null | undefined): IlVerisi {
  return ILLER.find((i) => i.ad === ad) ?? ILLER.find((i) => i.ad === "İstanbul")!;
}
