// -----------------------------------------------------------------------------
// HAZIR LİSTE: OLEFINI (OAC İklimlendirme tavsiye edilen perakende fiyat listesi)
// Olefini ve FreeDoor hava perdeleri, Olefini klima / ısı pompası / nem alma,
// Fral nem alma cihazları. 287 ürün. Liste fiyatı = listedeki NAKİT fiyat (KDV dahil),
// kart = KREDİ KARTI / SANAL POS 9 TAKSİT fiyatı (3. sütun).
// Satış fiyatı = liste fiyatı − %20 (panelde değiştirilebilir); alış iskontosu %25
// (yalnız panelde görünür). "Fiyat sorunuz" ürünlerde fiyat 0'dır.
// Bu dosya scratchpad/hazir.py ile değil, Olefini PDF'inden üretildi; elle düzenlenmez.
// -----------------------------------------------------------------------------

import type { HazirListe } from "@/lib/hazir-listeler";

export const OLEFINI: HazirListe = {
  kod: "olefini",
  marka: "Olefini",
  baslik: "Olefini Fiyat Listesi",
  aciklama: "Olefini ve FreeDoor hava perdeleri; Olefini split klima, multi split, ısı pompası ve nem alma cihazları; Fral nem alma cihazları.",
  notlar: "Fiyatlara %20 KDV ve nakliye dahildir.\n\"Kredi Kartı 9 Taksit\" sütunu, kredi kartı / sanal POS ile 9 taksitli ödeme fiyatıdır.\nMontaj ve elektrik tesisatı fiyata dahil değildir; duvar tipi split klimalarda montaj dahildir.\nDuvar tipi split klimalar: Montaja 4 m bakır boru dahildir, montaj kiti bulunmaz. İlave bakır boru (1 m): OLE-09 ve OLE-12 DCM / DICW 900 TL, OLE-18 DCM 1.000 TL, OLE-18 DICW 900 TL, OLE-24 DCM 1.200 TL, OLE-24 DICW 1.000 TL. Elektrik hattının cihaza kadar getirilmesi ve tadilat işlemleri montaja dahil değildir.\nHi-Tech seri duvar tipi ve multi split duvar tipi klimalarda Wi-Fi opsiyoneldir (3.086 TL + KDV); Irigoni seride standarttır.\nIsı pompalarında devreye alma dahildir; montaj, elektrik ve tesisat işçiliği dahil değildir. Cihaz modeline göre 220/230 V 1 faz veya 380/420 V 3 faz (±%10) elektrik altyapısı gerekir.\nOlefini hava perdelerinin genel, ticari, endüstriyel tip ve Eco serisi modelleri INOX gövde olarak üretilebilir; fiyat farkı %20'dir.\nMINI-700, MINI-800 S ve FreeDoor ısıtıcısız hava perdeleri monofaze; FreeDoor elektrikli ısıtıcılı hava perdeleri trifaze elektrik gerektirir.\nIntellect serisi hem elektrikli ısıtıcı hem hava perdesi olarak çalışır; tel rezistanslı, paslanmaz çelik gövdeli olup oda termostatı, otomatik kapı bağlantı çıkışı ve uzaktan kumanda standarttır.\nSu ve buhar serpantinli hava perdelerinin montajında selenoid vana (220 V motorlu, tam açılan, 1\") kullanılmalıdır; basıncı düşük tesisatlarda sirkülasyon pompası önerilir.\nDekoratif C serisinde dış yüzeye isteğe göre baskı standarttır (yüksek çözünürlüklü görsel gerekir). A1 ve A2 modellerine tek taraflı LED aydınlatma eklenebilir: 6.115 TL (KDV dahil); siparişte bildirilmelidir. Dekoratif AN serisinde değiştirilebilir dış tasarım ve baskı standarttır.\nBMS sistemi için otomasyon (RS-485) kablosu ile altyapının ve bağlanacak bilgisayarın hazır olması gerekir.\nDöner kapı RV serisi fiyatlarına emiş menfezi, emiş menfez filtresi ve üfleme ağzı dahildir. Ankastre modellerde gövde boyasız galvanizdir; kapı üstü modellerde INOX ya da boyalı gövde seçilebilir.\nNem alma kapasiteleri: Olefini cihazlarda 30 °C ve %80 bağıl nem, Fral cihazlarda 32 °C ve %90 bağıl nem koşullarına göredir.\nYurt içi montajların yetkili servis tarafından yapılması garanti şartıdır.",
  kaynakAciklama: "Olefini (OAC) listesi · alış: liste −%25 · satış: liste −%20 (ikisi de panelde değişir)",
  paraBirimi: "TRY",
  kdvDahil: true,
  fiyatBaslik: "Liste Fiyatı",
  fiyat2Baslik: "Satış Fiyatı",
  fiyat3Baslik: "Kredi Kartı 9 Taksit",
  alisIskontoYuzde: 25,
  satisIskontoYuzde: 20,
  bolumler: [
    {
      ad: "Olefini Isıtıcısız Hava Perdeleri · Monoblok Serisi",
      kalemler: [
      { kod: "K-43 UD", ad: "Isıtıcısız Hava Perdesi 100 cm", aciklama: "Fan çapı 110 mm · Takılabilir yükseklik 300 cm · Takılabilir genişlik 100 cm", marka: "Olefini", liste: 40379, satis: 32303, kart: 42398 },
      { kod: "K-44 UD", ad: "Isıtıcısız Hava Perdesi 120 cm", aciklama: "Fan çapı 110 mm · Takılabilir yükseklik 300 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 43891, satis: 35113, kart: 46086 },
      { kod: "K-46 UD", ad: "Isıtıcısız Hava Perdesi 160 cm", aciklama: "Fan çapı 110 mm · Takılabilir yükseklik 300 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 50035, satis: 40028, kart: 52537 },
      ],
    },
    {
      ad: "Olefini Isıtıcısız Hava Perdeleri · Genel Tip Serisi",
      kalemler: [
      { kod: "R-12/L-12", ad: "Isıtıcısız Hava Perdesi 80 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 80 cm", marka: "Olefini", liste: 32830, satis: 26264, kart: 34472 },
      { kod: "R-13/L-13", ad: "Isıtıcısız Hava Perdesi 100 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 100 cm", marka: "Olefini", liste: 42135, satis: 33708, kart: 44242 },
      { kod: "K-14", ad: "Isıtıcısız Hava Perdesi 120 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 45822, satis: 36658, kart: 48113 },
      { kod: "K-15", ad: "Isıtıcısız Hava Perdesi 140 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 140 cm", marka: "Olefini", liste: 52142, satis: 41714, kart: 54749 },
      { kod: "K-16", ad: "Isıtıcısız Hava Perdesi 160 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 55127, satis: 44102, kart: 57883 },
      { kod: "K-17", ad: "Isıtıcısız Hava Perdesi 180 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 180 cm", marka: "Olefini", liste: 57936, satis: 46349, kart: 60833 },
      { kod: "K-18", ad: "Isıtıcısız Hava Perdesi 200 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 200 cm", marka: "Olefini", liste: 60569, satis: 48455, kart: 63597 },
      ],
    },
    {
      ad: "Olefini Isıtıcısız Hava Perdeleri · Ticari Tip Serisi",
      kalemler: [
      { kod: "R-33/L-33", ad: "Isıtıcısız Hava Perdesi 100 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 100 cm", marka: "Olefini", liste: 49211, satis: 39369, kart: 51672 },
      { kod: "K-34", ad: "Isıtıcısız Hava Perdesi 120 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 56100, satis: 44880, kart: 58905 },
      { kod: "K-35", ad: "Isıtıcısız Hava Perdesi 140 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 140 cm", marka: "Olefini", liste: 61021, satis: 48817, kart: 64072 },
      { kod: "K-36", ad: "Isıtıcısız Hava Perdesi 160 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 64171, satis: 51337, kart: 67380 },
      { kod: "K-37", ad: "Isıtıcısız Hava Perdesi 180 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 180 cm", marka: "Olefini", liste: 68895, satis: 55116, kart: 72340 },
      { kod: "K-38", ad: "Isıtıcısız Hava Perdesi 200 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 200 cm", marka: "Olefini", liste: 70863, satis: 56690, kart: 74406 },
      ],
    },
    {
      ad: "Olefini Isıtıcısız Hava Perdeleri · Endüstriyel Tip Serisi",
      kalemler: [
      { kod: "R-22/L-22", ad: "Isıtıcısız Hava Perdesi 100 cm", aciklama: "Fan çapı 130 mm · Takılabilir yükseklik 600 cm · Takılabilir genişlik 100 cm", marka: "Olefini", liste: 71847, satis: 57478, kart: 75439 },
      { kod: "K-24", ad: "Isıtıcısız Hava Perdesi 120 cm", aciklama: "Fan çapı 130 mm · Takılabilir yükseklik 600 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 74800, satis: 59840, kart: 78540 },
      { kod: "K-26", ad: "Isıtıcısız Hava Perdesi 160 cm", aciklama: "Fan çapı 130 mm · Takılabilir yükseklik 600 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 78737, satis: 62990, kart: 82674 },
      { kod: "K-28", ad: "Isıtıcısız Hava Perdesi 200 cm", aciklama: "Fan çapı 130 mm · Takılabilir yükseklik 600 cm · Takılabilir genişlik 200 cm", marka: "Olefini", liste: 94484, satis: 75587, kart: 99208 },
      { kod: "K-83", ad: "Isıtıcısız Hava Perdesi 100 cm", aciklama: "Fan çapı 180 mm · Takılabilir yükseklik 800 cm · Takılabilir genişlik 100 cm", marka: "Olefini", liste: 216527, satis: 173222, kart: 227353 },
      ],
    },
    {
      ad: "Olefini Isıtıcısız Hava Perdeleri · Ankastre Serisi",
      kalemler: [
      { kod: "RS-34", ad: "Isıtıcısız Hava Perdesi 120 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 78737, satis: 62990, kart: 82674 },
      { kod: "RS-35", ad: "Isıtıcısız Hava Perdesi 140 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 140 cm", marka: "Olefini", liste: 84642, satis: 67714, kart: 88874 },
      { kod: "RS-36", ad: "Isıtıcısız Hava Perdesi 160 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 89563, satis: 71650, kart: 94041 },
      { kod: "RS-37", ad: "Isıtıcısız Hava Perdesi 180 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 180 cm", marka: "Olefini", liste: 95469, satis: 76375, kart: 100242 },
      { kod: "RS-38", ad: "Isıtıcısız Hava Perdesi 200 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 200 cm", marka: "Olefini", liste: 100390, satis: 80312, kart: 105410 },
      { kod: "RS-40", ad: "Isıtıcısız Hava Perdesi 240 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 240 cm", marka: "Olefini", liste: 124995, satis: 99996, kart: 131245 },
      { kod: "RSCF-120", ad: "Isıtıcısız Hava Perdesi 120 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 91138, satis: 72910, kart: 95695 },
      { kod: "RSCF-180", ad: "Isıtıcısız Hava Perdesi 180 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 180 cm", marka: "Olefini", liste: 106492, satis: 85194, kart: 111817 },
      { kod: "RSCF-200", ad: "Isıtıcısız Hava Perdesi 210 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 210 cm", marka: "Olefini", liste: 118893, satis: 95114, kart: 124838 },
      { kod: "RSCF-230", ad: "Isıtıcısız Hava Perdesi 240 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 240 cm", marka: "Olefini", liste: 125782, satis: 100626, kart: 132071 },
      ],
    },
    {
      ad: "Olefini Isıtıcısız Hava Perdeleri · Dekoratif Tip LED Serisi",
      kalemler: [
      { kod: "LD-10 LEDSİZ", ad: "Isıtıcısız Hava Perdesi 100 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 100 cm", marka: "Olefini", liste: 36868, satis: 29494, kart: 38711 },
      { kod: "LD-12 LEDSİZ", ad: "Isıtıcısız Hava Perdesi 120 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 39326, satis: 31461, kart: 41292 },
      { kod: "LD-14 LEDSİZ", ad: "Isıtıcısız Hava Perdesi 140 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 140 cm", marka: "Olefini", liste: 42135, satis: 33708, kart: 44242 },
      { kod: "LD-16 LEDSİZ", ad: "Isıtıcısız Hava Perdesi 160 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 45822, satis: 36658, kart: 48113 },
      { kod: "LD-18 LEDSİZ", ad: "Isıtıcısız Hava Perdesi 180 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 180 cm", marka: "Olefini", liste: 49509, satis: 39607, kart: 51984 },
      { kod: "LD-20 LEDSİZ", ad: "Isıtıcısız Hava Perdesi 200 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 200 cm", marka: "Olefini", liste: 53898, satis: 43118, kart: 56593 },
      ],
    },
    {
      ad: "Olefini Isıtıcısız Hava Perdeleri · Dekoratif Tip C Serisi",
      kalemler: [
      { kod: "CF-120 F2", ad: "Isıtıcısız Hava Perdesi 120 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 120 cm · İki taraflı", marka: "Olefini", liste: 94484, satis: 75587, kart: 99208 },
      { kod: "CF-120 F1", ad: "Isıtıcısız Hava Perdesi 120 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 120 cm · Tek taraflı", marka: "Olefini", liste: 90548, satis: 72438, kart: 95075 },
      { kod: "CF-120 A2", ad: "Isıtıcısız Hava Perdesi 120 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 120 cm · İki taraflı", marka: "Olefini", liste: 108263, satis: 86610, kart: 113676 },
      { kod: "CF-120 A1", ad: "Isıtıcısız Hava Perdesi 120 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 120 cm · Tek taraflı", marka: "Olefini", liste: 94484, satis: 75587, kart: 99208 },
      { kod: "CF-160 F2", ad: "Isıtıcısız Hava Perdesi 160 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 160 cm · İki taraflı", marka: "Olefini", liste: 120074, satis: 96059, kart: 126078 },
      { kod: "CF-160 F1", ad: "Isıtıcısız Hava Perdesi 160 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 160 cm · Tek taraflı", marka: "Olefini", liste: 112200, satis: 89760, kart: 117810 },
      { kod: "CF-160 A2", ad: "Isıtıcısız Hava Perdesi 160 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 160 cm · İki taraflı", marka: "Olefini", liste: 135821, satis: 108657, kart: 142612 },
      { kod: "CF-160 A1", ad: "Isıtıcısız Hava Perdesi 160 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 160 cm · Tek taraflı", marka: "Olefini", liste: 120074, satis: 96059, kart: 126078 },
      { kod: "CF-200 F2", ad: "Isıtıcısız Hava Perdesi 200 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 200 cm · İki taraflı", marka: "Olefini", liste: 132869, satis: 106295, kart: 139512 },
      { kod: "CF-200 F1", ad: "Isıtıcısız Hava Perdesi 200 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 200 cm · Tek taraflı", marka: "Olefini", liste: 127948, satis: 102358, kart: 134345 },
      { kod: "CF-200 A2", ad: "Isıtıcısız Hava Perdesi 200 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 200 cm · İki taraflı", marka: "Olefini", liste: 151569, satis: 121255, kart: 159147 },
      { kod: "CF-200 A1", ad: "Isıtıcısız Hava Perdesi 200 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 200 cm · Tek taraflı", marka: "Olefini", liste: 133853, satis: 107082, kart: 140546 },
      { kod: "CF-240 F2", ad: "Isıtıcısız Hava Perdesi 220 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 220 cm · İki taraflı", marka: "Olefini", liste: 153537, satis: 122830, kart: 161214 },
      { kod: "CF-240 F1", ad: "Isıtıcısız Hava Perdesi 220 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 220 cm · Tek taraflı", marka: "Olefini", liste: 143695, satis: 114956, kart: 150880 },
      { kod: "CF-240 A2", ad: "Isıtıcısız Hava Perdesi 220 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 220 cm · İki taraflı", marka: "Olefini", liste: 173221, satis: 138577, kart: 181882 },
      { kod: "CF-240 A1", ad: "Isıtıcısız Hava Perdesi 220 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 220 cm · Tek taraflı", marka: "Olefini", liste: 153537, satis: 122830, kart: 161214 },
      { kod: "CF-280 F2", ad: "Isıtıcısız Hava Perdesi 280 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 280 cm · İki taraflı", marka: "Olefini", liste: 166332, satis: 133066, kart: 174649 },
      { kod: "CF-280 F1", ad: "Isıtıcısız Hava Perdesi 280 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 280 cm · Tek taraflı", marka: "Olefini", liste: 159442, satis: 127554, kart: 167414 },
      { kod: "CF-280 A2", ad: "Isıtıcısız Hava Perdesi 280 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 280 cm · İki taraflı", marka: "Olefini", liste: 192906, satis: 154325, kart: 202551 },
      { kod: "CF-280 A1", ad: "Isıtıcısız Hava Perdesi 280 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 280 cm · Tek taraflı", marka: "Olefini", liste: 170269, satis: 136215, kart: 178782 },
      { kod: "CF-320 F2", ad: "Isıtıcısız Hava Perdesi 320 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 320 cm · İki taraflı", marka: "Olefini", liste: 219479, satis: 175583, kart: 230453 },
      { kod: "CF-320 F1", ad: "Isıtıcısız Hava Perdesi 320 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 320 cm · Tek taraflı", marka: "Olefini", liste: 210621, satis: 168497, kart: 221152 },
      { kod: "CF-320 A2", ad: "Isıtıcısız Hava Perdesi 320 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 320 cm · İki taraflı", marka: "Olefini", liste: 254911, satis: 203929, kart: 267657 },
      { kod: "CF-320 A1", ad: "Isıtıcısız Hava Perdesi 320 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 320 cm · Tek taraflı", marka: "Olefini", liste: 224400, satis: 179520, kart: 235620 },
      ],
    },
    {
      ad: "Olefini Isıtıcısız Hava Perdeleri · Dekoratif Tip AN Serisi",
      kalemler: [
      { kod: "AN-120", ad: "Isıtıcısız Hava Perdesi 120 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 106492, satis: 85194, kart: 111817 },
      { kod: "AN-160", ad: "Isıtıcısız Hava Perdesi 160 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 112791, satis: 90233, kart: 118431 },
      { kod: "AN-200", ad: "Isıtıcısız Hava Perdesi 230 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 230 cm", marka: "Olefini", liste: 120468, satis: 96374, kart: 126491 },
      ],
    },
    {
      ad: "Olefini Isıtıcısız Hava Perdeleri · Döner Kapı RV Serisi Ankastre",
      kalemler: [
      { kod: "RV-120 C", ad: "Isıtıcısız Hava Perdesi 160 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 184154, satis: 147323, kart: 193362 },
      { kod: "RV-160 C", ad: "Isıtıcısız Hava Perdesi 220 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 220 cm", marka: "Olefini", liste: 254842, satis: 203874, kart: 267584 },
      { kod: "RV-200 C", ad: "Isıtıcısız Hava Perdesi 280 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 280 cm", marka: "Olefini", liste: 330562, satis: 264450, kart: 347090 },
      { kod: "RV-230 C", ad: "Isıtıcısız Hava Perdesi 330 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 330 cm", marka: "Olefini", liste: 401021, satis: 320817, kart: 421072 },
      ],
    },
    {
      ad: "Olefini Isıtıcısız Hava Perdeleri · Döner Kapı RV Serisi Kapı Üstü",
      kalemler: [
      { kod: "RV-120", ad: "Isıtıcısız Hava Perdesi 160 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 184154, satis: 147323, kart: 193362 },
      { kod: "RV-160", ad: "Isıtıcısız Hava Perdesi 220 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 220 cm", marka: "Olefini", liste: 254842, satis: 203874, kart: 267584 },
      { kod: "RV-200", ad: "Isıtıcısız Hava Perdesi 280 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 280 cm", marka: "Olefini", liste: 330562, satis: 264450, kart: 347090 },
      { kod: "RV-230", ad: "Isıtıcısız Hava Perdesi 330 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 330 cm", marka: "Olefini", liste: 401021, satis: 320817, kart: 421072 },
      ],
    },
    {
      ad: "Olefini Isıtıcısız Hava Perdeleri · Döner Kapı RV Serisi Dik Tip",
      kalemler: [
      { kod: "RV-230 V", ad: "Isıtıcısız Hava Perdesi 300 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 240 cm · Takılabilir genişlik 300 cm", marka: "Olefini", liste: 259875, satis: 207900, kart: 272869 },
      { kod: "RV-280 V", ad: "Isıtıcısız Hava Perdesi 300 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 280 cm · Takılabilir genişlik 300 cm", marka: "Olefini", liste: 311575, satis: 249260, kart: 327154 },
      ],
    },
    {
      ad: "Olefini Isıtıcısız Hava Perdeleri · Frigofirik Araç Serisi",
      kalemler: [
      { kod: "DCT-12", ad: "Isıtıcısız Hava Perdesi 120 cm", aciklama: "Fan çapı 80 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 29494, satis: 23595, kart: 30969 },
      { kod: "DCT-15", ad: "Isıtıcısız Hava Perdesi 140 cm", aciklama: "Fan çapı 80 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 140 cm", marka: "Olefini", liste: 34410, satis: 27528, kart: 36131 },
      { kod: "DCT-18", ad: "Isıtıcısız Hava Perdesi 180 cm", aciklama: "Fan çapı 80 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 180 cm", marka: "Olefini", liste: 35990, satis: 28792, kart: 37790 },
      ],
    },
    {
      ad: "Olefini Elektrikli Isıtıcılı Hava Perdeleri · Mini Serisi",
      kalemler: [
      { kod: "MINI-700", ad: "Elektrikli Isıtıcılı Hava Perdesi 70 cm", aciklama: "Fan çapı 70 mm · Takılabilir yükseklik 200 cm · Takılabilir genişlik 70 cm", marka: "Olefini", liste: 20277, satis: 16222, kart: 21291 },
      { kod: "MINI-800 S", ad: "Elektrikli Isıtıcılı Hava Perdesi 80 cm", aciklama: "Fan çapı 80 mm · Takılabilir yükseklik 230 cm · Takılabilir genişlik 80 cm", marka: "Olefini", liste: 33409, satis: 26727, kart: 35079 },
      ],
    },
    {
      ad: "Olefini Elektrikli Isıtıcılı Hava Perdeleri · Monoblok Serisi",
      kalemler: [
      { kod: "KEH-43", ad: "Elektrikli Isıtıcılı Hava Perdesi 100 cm", aciklama: "Fan çapı 110 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 100 cm", marka: "Olefini", liste: 55177, satis: 44142, kart: 57936 },
      { kod: "KEH-44", ad: "Elektrikli Isıtıcılı Hava Perdesi 120 cm", aciklama: "Fan çapı 110 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 57016, satis: 45613, kart: 59867 },
      { kod: "KEH-46", ad: "Elektrikli Isıtıcılı Hava Perdesi 160 cm", aciklama: "Fan çapı 110 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 69890, satis: 55912, kart: 73385 },
      ],
    },
    {
      ad: "Olefini Elektrikli Isıtıcılı Hava Perdeleri · Intellect Serisi",
      kalemler: [
      { kod: "INTELLECT-08 R", ad: "Elektrikli Isıtıcılı Hava Perdesi 80 cm", aciklama: "Fan çapı 110 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 80 cm", marka: "Olefini", liste: 35148, satis: 28118, kart: 36905 },
      { kod: "INTELLECT-1.00 R/L", ad: "Elektrikli Isıtıcılı Hava Perdesi 100 cm", aciklama: "Fan çapı 110 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 100 cm", marka: "Olefini", liste: 45769, satis: 36615, kart: 48057 },
      { kod: "INTELLECT-12", ad: "Elektrikli Isıtıcılı Hava Perdesi 120 cm", aciklama: "Fan çapı 110 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 47700, satis: 38160, kart: 50085 },
      { kod: "INTELLECT-16", ad: "Elektrikli Isıtıcılı Hava Perdesi 160 cm", aciklama: "Fan çapı 110 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 54846, satis: 43877, kart: 57588 },
      { kod: "INTELLECT-20", ad: "Elektrikli Isıtıcılı Hava Perdesi 200 cm", aciklama: "Fan çapı 110 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 200 cm", marka: "Olefini", liste: 61798, satis: 49438, kart: 64888 },
      ],
    },
    {
      ad: "Olefini Elektrikli Isıtıcılı Hava Perdeleri · Genel Tip S Serisi",
      kalemler: [
      { kod: "REH-13S/LEH-13S", ad: "Elektrikli Isıtıcılı Hava Perdesi 100 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 100 cm", marka: "Olefini", liste: 44997, satis: 35998, kart: 47247 },
      ],
    },
    {
      ad: "Olefini Elektrikli Isıtıcılı Hava Perdeleri · Genel Tip APEH Serisi",
      kalemler: [
      { kod: "APEH-13", ad: "Elektrikli Isıtıcılı Hava Perdesi 110 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 110 cm", marka: "Olefini", liste: 73569, satis: 58855, kart: 77247 },
      { kod: "APEH-14", ad: "Elektrikli Isıtıcılı Hava Perdesi 120 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 76328, satis: 61062, kart: 80144 },
      { kod: "APEH-15", ad: "Elektrikli Isıtıcılı Hava Perdesi 140 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 140 cm", marka: "Olefini", liste: 79087, satis: 63270, kart: 83041 },
      { kod: "APEH-16", ad: "Elektrikli Isıtıcılı Hava Perdesi 160 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 82765, satis: 66212, kart: 86903 },
      { kod: "APEH-17", ad: "Elektrikli Isıtıcılı Hava Perdesi 180 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 180 cm", marka: "Olefini", liste: 86443, satis: 69154, kart: 90765 },
      { kod: "APEH-18", ad: "Elektrikli Isıtıcılı Hava Perdesi 200 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 200 cm", marka: "Olefini", liste: 91961, satis: 73569, kart: 96559 },
      ],
    },
    {
      ad: "Olefini Elektrikli Isıtıcılı Hava Perdeleri · Genel Tip Serisi",
      kalemler: [
      { kod: "REH-13/LEH-13", ad: "Elektrikli Isıtıcılı Hava Perdesi 100 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 100 cm", marka: "Olefini", liste: 73569, satis: 58855, kart: 77247 },
      { kod: "KEH-14", ad: "Elektrikli Isıtıcılı Hava Perdesi 120 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 76328, satis: 61062, kart: 80144 },
      { kod: "KEH-15", ad: "Elektrikli Isıtıcılı Hava Perdesi 140 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 140 cm", marka: "Olefini", liste: 79087, satis: 63270, kart: 83041 },
      { kod: "KEH-16", ad: "Elektrikli Isıtıcılı Hava Perdesi 160 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 82765, satis: 66212, kart: 86903 },
      { kod: "KEH-17", ad: "Elektrikli Isıtıcılı Hava Perdesi 180 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 180 cm", marka: "Olefini", liste: 86443, satis: 69154, kart: 90765 },
      { kod: "KEH-18", ad: "Elektrikli Isıtıcılı Hava Perdesi 200 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 200 cm", marka: "Olefini", liste: 91961, satis: 73569, kart: 96559 },
      ],
    },
    {
      ad: "Olefini Elektrikli Isıtıcılı Hava Perdeleri · Ticari Tip Serisi",
      kalemler: [
      { kod: "REH-33/LEH-33", ad: "Elektrikli Isıtıcılı Hava Perdesi 100 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 100 cm", marka: "Olefini", liste: 94653, satis: 75722, kart: 99386 },
      { kod: "KEH-34", ad: "Elektrikli Isıtıcılı Hava Perdesi 120 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 119090, satis: 95272, kart: 125045 },
      { kod: "KEH-35", ad: "Elektrikli Isıtıcılı Hava Perdesi 140 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 140 cm", marka: "Olefini", liste: 122771, satis: 98217, kart: 128910 },
      { kod: "KEH-36", ad: "Elektrikli Isıtıcılı Hava Perdesi 160 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 126019, satis: 100815, kart: 132320 },
      { kod: "KEH-37", ad: "Elektrikli Isıtıcılı Hava Perdesi 180 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 180 cm", marka: "Olefini", liste: 142289, satis: 113831, kart: 149403 },
      { kod: "KEH-38", ad: "Elektrikli Isıtıcılı Hava Perdesi 200 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 200 cm", marka: "Olefini", liste: 146413, satis: 117130, kart: 153734 },
      ],
    },
    {
      ad: "Olefini Elektrikli Isıtıcılı Hava Perdeleri · Endüstriyel Tip Serisi",
      kalemler: [
      { kod: "REH-22/LEH-22", ad: "Elektrikli Isıtıcılı Hava Perdesi 100 cm", aciklama: "Fan çapı 130 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 100 cm", marka: "Olefini", liste: 110738, satis: 88590, kart: 116275 },
      { kod: "KEH-24", ad: "Elektrikli Isıtıcılı Hava Perdesi 120 cm", aciklama: "Fan çapı 130 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 142908, satis: 114326, kart: 150053 },
      { kod: "KEH-26", ad: "Elektrikli Isıtıcılı Hava Perdesi 160 cm", aciklama: "Fan çapı 130 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 150125, satis: 120100, kart: 157631 },
      { kod: "KEH-28", ad: "Elektrikli Isıtıcılı Hava Perdesi 200 cm", aciklama: "Fan çapı 130 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 200 cm", marka: "Olefini", liste: 164973, satis: 131978, kart: 173222 },
      ],
    },
    {
      ad: "Olefini Elektrikli Isıtıcılı Hava Perdeleri · Ankastre Serisi",
      kalemler: [
      { kod: "RSEH-34", ad: "Elektrikli Isıtıcılı Hava Perdesi 120 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 114037, satis: 91230, kart: 119739 },
      { kod: "RSEH-35", ad: "Elektrikli Isıtıcılı Hava Perdesi 140 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 140 cm", marka: "Olefini", liste: 118162, satis: 94530, kart: 124070 },
      { kod: "RSEH-36", ad: "Elektrikli Isıtıcılı Hava Perdesi 160 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 121667, satis: 97334, kart: 127750 },
      { kod: "RSEH-37", ad: "Elektrikli Isıtıcılı Hava Perdesi 180 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 180 cm", marka: "Olefini", liste: 142289, satis: 113831, kart: 149403 },
      { kod: "RSEH-38", ad: "Elektrikli Isıtıcılı Hava Perdesi 200 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 200 cm", marka: "Olefini", liste: 148475, satis: 118780, kart: 155899 },
      { kod: "RSEH-40", ad: "Elektrikli Isıtıcılı Hava Perdesi 240 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 240 cm", marka: "Olefini", liste: 167035, satis: 133628, kart: 175387 },
      { kod: "RSEHCF-120", ad: "Elektrikli Isıtıcılı Hava Perdesi 120 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 120636, satis: 96509, kart: 126668 },
      { kod: "RSEHCF-180", ad: "Elektrikli Isıtıcılı Hava Perdesi 180 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 180 cm", marka: "Olefini", liste: 143320, satis: 114656, kart: 150486 },
      { kod: "RSEHCF-200", ad: "Elektrikli Isıtıcılı Hava Perdesi 210 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 210 cm", marka: "Olefini", liste: 159199, satis: 127359, kart: 167159 },
      { kod: "RSEHCF-230", ad: "Elektrikli Isıtıcılı Hava Perdesi 240 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 240 cm", marka: "Olefini", liste: 163735, satis: 130988, kart: 171922 },
      ],
    },
    {
      ad: "Olefini Elektrikli Isıtıcılı Hava Perdeleri · Dekoratif Tip LED Serisi",
      kalemler: [
      { kod: "LDEH-10 LEDLİ", ad: "Elektrikli Isıtıcılı Hava Perdesi 100 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 100 cm · LED aydınlatmalı", marka: "Olefini", liste: 67132, satis: 53706, kart: 70489 },
      { kod: "LDEH-10 LEDSİZ", ad: "Elektrikli Isıtıcılı Hava Perdesi 100 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 100 cm", marka: "Olefini", liste: 56832, satis: 45466, kart: 59674 },
      { kod: "LDEH-12 LEDLİ", ad: "Elektrikli Isıtıcılı Hava Perdesi 120 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 120 cm · LED aydınlatmalı", marka: "Olefini", liste: 70994, satis: 56795, kart: 74544 },
      { kod: "LDEH-12 LEDSİZ", ad: "Elektrikli Isıtıcılı Hava Perdesi 120 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 59959, satis: 47967, kart: 62957 },
      { kod: "LDEH-14 LEDLİ", ad: "Elektrikli Isıtıcılı Hava Perdesi 140 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 140 cm · LED aydınlatmalı", marka: "Olefini", liste: 73753, satis: 59002, kart: 77441 },
      { kod: "LDEH-14 LEDSİZ", ad: "Elektrikli Isıtıcılı Hava Perdesi 140 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 140 cm", marka: "Olefini", liste: 61798, satis: 49438, kart: 64888 },
      { kod: "LDEH-16 LEDLİ", ad: "Elektrikli Isıtıcılı Hava Perdesi 160 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 160 cm · LED aydınlatmalı", marka: "Olefini", liste: 77247, satis: 61798, kart: 81109 },
      { kod: "LDEH-16 LEDSİZ", ad: "Elektrikli Isıtıcılı Hava Perdesi 160 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 64557, satis: 51646, kart: 67785 },
      { kod: "LDEH-18 LEDLİ", ad: "Elektrikli Isıtıcılı Hava Perdesi 180 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 180 cm · LED aydınlatmalı", marka: "Olefini", liste: 80190, satis: 64152, kart: 84200 },
      { kod: "LDEH-18 LEDSİZ", ad: "Elektrikli Isıtıcılı Hava Perdesi 180 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 180 cm", marka: "Olefini", liste: 66948, satis: 53558, kart: 70295 },
      { kod: "LDEH-20 LEDLİ", ad: "Elektrikli Isıtıcılı Hava Perdesi 200 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 200 cm · LED aydınlatmalı", marka: "Olefini", liste: 83501, satis: 66801, kart: 87676 },
      { kod: "LDEH-20 LEDSİZ", ad: "Elektrikli Isıtıcılı Hava Perdesi 200 cm", aciklama: "Fan çapı 100 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 200 cm", marka: "Olefini", liste: 70994, satis: 56795, kart: 74544 },
      ],
    },
    {
      ad: "Olefini Elektrikli Isıtıcılı Hava Perdeleri · Dekoratif Tip C Serisi",
      kalemler: [
      { kod: "CEH-120 F2", ad: "Elektrikli Isıtıcılı Hava Perdesi 120 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 120 cm · İki taraflı", marka: "Olefini", liste: 125792, satis: 100634, kart: 132082 },
      { kod: "CEH-120 F1", ad: "Elektrikli Isıtıcılı Hava Perdesi 120 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 120 cm · Tek taraflı", marka: "Olefini", liste: 119605, satis: 95684, kart: 125585 },
      { kod: "CEH-120 A2", ad: "Elektrikli Isıtıcılı Hava Perdesi 120 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 120 cm · İki taraflı", marka: "Olefini", liste: 138165, satis: 110532, kart: 145073 },
      { kod: "CEH-120 A1", ad: "Elektrikli Isıtıcılı Hava Perdesi 120 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 120 cm · Tek taraflı", marka: "Olefini", liste: 127854, satis: 102283, kart: 134247 },
      { kod: "CEH-160 F2", ad: "Elektrikli Isıtıcılı Hava Perdesi 160 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 160 cm · İki taraflı", marka: "Olefini", liste: 160848, satis: 128678, kart: 168890 },
      { kod: "CEH-160 F1", ad: "Elektrikli Isıtıcılı Hava Perdesi 160 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 160 cm · Tek taraflı", marka: "Olefini", liste: 151569, satis: 121255, kart: 159147 },
      { kod: "CEH-160 A2", ad: "Elektrikli Isıtıcılı Hava Perdesi 160 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 160 cm · İki taraflı", marka: "Olefini", liste: 177346, satis: 141877, kart: 186213 },
      { kod: "CEH-160 A1", ad: "Elektrikli Isıtıcılı Hava Perdesi 160 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 160 cm · Tek taraflı", marka: "Olefini", liste: 162911, satis: 130329, kart: 171057 },
      { kod: "CEH-200 F2", ad: "Elektrikli Isıtıcılı Hava Perdesi 200 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 200 cm · İki taraflı", marka: "Olefini", liste: 184563, satis: 147650, kart: 193791 },
      { kod: "CEH-200 F1", ad: "Elektrikli Isıtıcılı Hava Perdesi 200 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 200 cm · Tek taraflı", marka: "Olefini", liste: 174252, satis: 139402, kart: 182965 },
      { kod: "CEH-200 A2", ad: "Elektrikli Isıtıcılı Hava Perdesi 200 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 200 cm · İki taraflı", marka: "Olefini", liste: 202092, satis: 161674, kart: 212197 },
      { kod: "CEH-200 A1", ad: "Elektrikli Isıtıcılı Hava Perdesi 200 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 200 cm · Tek taraflı", marka: "Olefini", liste: 185594, satis: 148475, kart: 194874 },
      { kod: "CEH-240 F2", ad: "Elektrikli Isıtıcılı Hava Perdesi 220 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 220 cm · İki taraflı", marka: "Olefini", liste: 201061, satis: 160849, kart: 211114 },
      { kod: "CEH-240 F1", ad: "Elektrikli Isıtıcılı Hava Perdesi 220 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 220 cm · Tek taraflı", marka: "Olefini", liste: 189719, satis: 151775, kart: 199205 },
      { kod: "CEH-240 A2", ad: "Elektrikli Isıtıcılı Hava Perdesi 220 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 220 cm · İki taraflı", marka: "Olefini", liste: 222713, satis: 178170, kart: 233849 },
      { kod: "CEH-240 A1", ad: "Elektrikli Isıtıcılı Hava Perdesi 220 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 220 cm · Tek taraflı", marka: "Olefini", liste: 203123, satis: 162498, kart: 213279 },
      { kod: "CEH-280 F2", ad: "Elektrikli Isıtıcılı Hava Perdesi 280 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 280 cm · İki taraflı", marka: "Olefini", liste: 230962, satis: 184770, kart: 242510 },
      { kod: "CEH-280 F1", ad: "Elektrikli Isıtıcılı Hava Perdesi 280 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 280 cm · Tek taraflı", marka: "Olefini", liste: 233024, satis: 186419, kart: 244675 },
      { kod: "CEH-280 A2", ad: "Elektrikli Isıtıcılı Hava Perdesi 280 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 280 cm · İki taraflı", marka: "Olefini", liste: 260863, satis: 208690, kart: 273906 },
      { kod: "CEH-280 A1", ad: "Elektrikli Isıtıcılı Hava Perdesi 280 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 280 cm · Tek taraflı", marka: "Olefini", liste: 243335, satis: 194668, kart: 255502 },
      { kod: "CEH-320 F2", ad: "Elektrikli Isıtıcılı Hava Perdesi 320 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 320 cm · İki taraflı", marka: "Olefini", liste: 284578, satis: 227662, kart: 298807 },
      { kod: "CEH-320 F1", ad: "Elektrikli Isıtıcılı Hava Perdesi 320 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 320 cm · Tek taraflı", marka: "Olefini", liste: 275298, satis: 220238, kart: 289063 },
      { kod: "CEH-320 A2", ad: "Elektrikli Isıtıcılı Hava Perdesi 320 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 320 cm · İki taraflı", marka: "Olefini", liste: 320666, satis: 256533, kart: 336699 },
      { kod: "CEH-320 A1", ad: "Elektrikli Isıtıcılı Hava Perdesi 320 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 320 cm · Tek taraflı", marka: "Olefini", liste: 288702, satis: 230962, kart: 303137 },
      ],
    },
    {
      ad: "Olefini Elektrikli Isıtıcılı Hava Perdeleri · Dekoratif Tip AN Serisi",
      kalemler: [
      { kod: "ANEH-120", ad: "Elektrikli Isıtıcılı Hava Perdesi 120 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 135278, satis: 108222, kart: 142042 },
      { kod: "ANEH-160", ad: "Elektrikli Isıtıcılı Hava Perdesi 160 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 145588, satis: 116470, kart: 152867 },
      { kod: "ANEH-200", ad: "Elektrikli Isıtıcılı Hava Perdesi 230 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 230 cm", marka: "Olefini", liste: 169303, satis: 135442, kart: 177768 },
      ],
    },
    {
      ad: "Olefini Elektrikli Isıtıcılı Hava Perdeleri · Döner Kapı RV Serisi Ankastre",
      kalemler: [
      { kod: "RVEH-120 C", ad: "Elektrikli Isıtıcılı Hava Perdesi 160 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 252244, satis: 201795, kart: 264856 },
      { kod: "RVEH-160 C", ad: "Elektrikli Isıtıcılı Hava Perdesi 220 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 220 cm", marka: "Olefini", liste: 338295, satis: 270636, kart: 355210 },
      { kod: "RVEH-200 C", ad: "Elektrikli Isıtıcılı Hava Perdesi 280 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 280 cm", marka: "Olefini", liste: 431546, satis: 345237, kart: 453123 },
      { kod: "RVEH-230 C", ad: "Elektrikli Isıtıcılı Hava Perdesi 330 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 330 cm", marka: "Olefini", liste: 516557, satis: 413246, kart: 542385 },
      ],
    },
    {
      ad: "Olefini Elektrikli Isıtıcılı Hava Perdeleri · Döner Kapı RV Serisi Kapı Üstü",
      kalemler: [
      { kod: "RVEH-120", ad: "Elektrikli Isıtıcılı Hava Perdesi 160 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 252244, satis: 201795, kart: 264856 },
      { kod: "RVEH-160", ad: "Elektrikli Isıtıcılı Hava Perdesi 220 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 220 cm", marka: "Olefini", liste: 338295, satis: 270636, kart: 355210 },
      { kod: "RVEH-200", ad: "Elektrikli Isıtıcılı Hava Perdesi 280 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 280 cm", marka: "Olefini", liste: 431546, satis: 345237, kart: 453123 },
      { kod: "RVEH-230", ad: "Elektrikli Isıtıcılı Hava Perdesi 330 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 400 cm · Takılabilir genişlik 330 cm", marka: "Olefini", liste: 516557, satis: 413246, kart: 542385 },
      ],
    },
    {
      ad: "Olefini Elektrikli Isıtıcılı Hava Perdeleri · Döner Kapı RV Serisi Dik Tip",
      kalemler: [
      { kod: "RVEH-230 V", ad: "Elektrikli Isıtıcılı Hava Perdesi 300 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 240 cm · Takılabilir genişlik 300 cm", marka: "Olefini", liste: 285431, satis: 228345, kart: 299703 },
      { kod: "RVEH-280 V", ad: "Elektrikli Isıtıcılı Hava Perdesi 300 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 280 cm · Takılabilir genişlik 300 cm", marka: "Olefini", liste: 339353, satis: 271482, kart: 356321 },
      ],
    },
    {
      ad: "Olefini Su ve Buhar Serpantinli Hava Perdeleri · Ticari Tip Serisi",
      kalemler: [
      { kod: "RWH-33/LWH-33", ad: "Su / Buhar Serpantinli Hava Perdesi 100 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 100 cm", marka: "Olefini", liste: 88461, satis: 70769, kart: 92884 },
      { kod: "KWH-34", ad: "Su / Buhar Serpantinli Hava Perdesi 120 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 106856, satis: 85485, kart: 112199 },
      { kod: "KWH-35", ad: "Su / Buhar Serpantinli Hava Perdesi 140 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 140 cm", marka: "Olefini", liste: 109129, satis: 87303, kart: 114585 },
      { kod: "KWH-36", ad: "Su / Buhar Serpantinli Hava Perdesi 160 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 115950, satis: 92760, kart: 121748 },
      { kod: "KWH-37", ad: "Su / Buhar Serpantinli Hava Perdesi 180 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 180 cm", marka: "Olefini", liste: 122771, satis: 98217, kart: 128910 },
      { kod: "KWH-38", ad: "Su / Buhar Serpantinli Hava Perdesi 200 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 200 cm", marka: "Olefini", liste: 129591, satis: 103673, kart: 136071 },
      ],
    },
    {
      ad: "Olefini Su ve Buhar Serpantinli Hava Perdeleri · Yoğuşma Tavalı Ticari Tip Serisi",
      kalemler: [
      { kod: "KWHC-34L", ad: "Su / Buhar Serpantinli Hava Perdesi 120 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 119464, satis: 95571, kart: 125437 },
      { kod: "KWHC-35L", ad: "Su / Buhar Serpantinli Hava Perdesi 140 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 140 cm", marka: "Olefini", liste: 125871, satis: 100697, kart: 132165 },
      { kod: "KWHC-36L", ad: "Su / Buhar Serpantinli Hava Perdesi 160 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 132485, satis: 105988, kart: 139109 },
      { kod: "KWHC-37L", ad: "Su / Buhar Serpantinli Hava Perdesi 180 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 180 cm", marka: "Olefini", liste: 138892, satis: 111114, kart: 145837 },
      { kod: "KWHC-38L", ad: "Su / Buhar Serpantinli Hava Perdesi 200 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 200 cm", marka: "Olefini", liste: 145506, satis: 116405, kart: 152781 },
      ],
    },
    {
      ad: "Olefini Su ve Buhar Serpantinli Hava Perdeleri · Endüstriyel Tip Serisi",
      kalemler: [
      { kod: "RWH-22/LWH-22", ad: "Su / Buhar Serpantinli Hava Perdesi 100 cm", aciklama: "Fan çapı 130 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 100 cm", marka: "Olefini", liste: 85567, satis: 68454, kart: 89845 },
      { kod: "KWH-24", ad: "Su / Buhar Serpantinli Hava Perdesi 120 cm", aciklama: "Fan çapı 130 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 115950, satis: 92760, kart: 121748 },
      { kod: "KWH-26", ad: "Su / Buhar Serpantinli Hava Perdesi 160 cm", aciklama: "Fan çapı 130 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 125044, satis: 100035, kart: 131296 },
      { kod: "KWH-28", ad: "Su / Buhar Serpantinli Hava Perdesi 200 cm", aciklama: "Fan çapı 130 mm · Takılabilir yükseklik 500 cm · Takılabilir genişlik 200 cm", marka: "Olefini", liste: 142612, satis: 114090, kart: 149743 },
      { kod: "KWH-83", ad: "Su / Buhar Serpantinli Hava Perdesi 100 cm", aciklama: "Fan çapı 180 mm · Takılabilir yükseklik 800 cm · Takılabilir genişlik 100 cm", marka: "Olefini", liste: 275579, satis: 220463, kart: 289358 },
      ],
    },
    {
      ad: "Olefini Su ve Buhar Serpantinli Hava Perdeleri · Ankastre Serisi",
      kalemler: [
      { kod: "RSWH-34", ad: "Su / Buhar Serpantinli Hava Perdesi 120 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 120 cm", marka: "Olefini", liste: 101374, satis: 81099, kart: 106443 },
      { kod: "RSWH-35", ad: "Su / Buhar Serpantinli Hava Perdesi 140 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 140 cm", marka: "Olefini", liste: 104917, satis: 83934, kart: 110163 },
      { kod: "RSWH-36", ad: "Su / Buhar Serpantinli Hava Perdesi 160 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 160 cm", marka: "Olefini", liste: 108854, satis: 87083, kart: 114297 },
      { kod: "RSWH-37", ad: "Su / Buhar Serpantinli Hava Perdesi 180 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 180 cm", marka: "Olefini", liste: 114365, satis: 91492, kart: 120083 },
      { kod: "RSWH-38", ad: "Su / Buhar Serpantinli Hava Perdesi 200 cm", aciklama: "Fan çapı 120 mm · Takılabilir yükseklik 350 cm · Takılabilir genişlik 200 cm", marka: "Olefini", liste: 121649, satis: 97319, kart: 127731 },
      ],
    },
    {
      ad: "Olefini Hava Perdeleri Bina Otomasyonu · BMS",
      kalemler: [
      { kod: "BMS KART", ad: "BMS Kart", aciklama: "Hava perdeleri için bina otomasyon kartı", marka: "Olefini", liste: 17630, satis: 14104 },
      { kod: "BMS KART KURU KONTAK", ad: "BMS Kart (Kuru Kontak)", aciklama: "Hava perdeleri için bina otomasyon kartı", marka: "Olefini", liste: 18743, satis: 14994 },
      ],
    },
    {
      ad: "FreeDoor Hava Perdeleri · Isıtıcısız",
      kalemler: [
      { kod: "FM-3009", ad: "Isıtıcısız Hava Perdesi 90 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 300 cm · Takılabilir genişlik 90 cm", marka: "FreeDoor", liste: 10894, satis: 8715, kart: 11439 },
      { kod: "FM-3010", ad: "Isıtıcısız Hava Perdesi 100 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 300 cm · Takılabilir genişlik 100 cm", marka: "FreeDoor", liste: 11559, satis: 9247, kart: 12137 },
      { kod: "FM-3012", ad: "Isıtıcısız Hava Perdesi 120 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 300 cm · Takılabilir genişlik 120 cm", marka: "FreeDoor", liste: 12403, satis: 9922, kart: 13023 },
      { kod: "FM-3015", ad: "Isıtıcısız Hava Perdesi 150 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 300 cm · Takılabilir genişlik 150 cm", marka: "FreeDoor", liste: 15109, satis: 12087, kart: 15864 },
      { kod: "FM-3018", ad: "Isıtıcısız Hava Perdesi 180 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 300 cm · Takılabilir genişlik 180 cm", marka: "FreeDoor", liste: 17483, satis: 13986, kart: 18357 },
      { kod: "FM-3020", ad: "Isıtıcısız Hava Perdesi 200 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 300 cm · Takılabilir genişlik 200 cm", marka: "FreeDoor", liste: 19591, satis: 15673, kart: 20571 },
      ],
    },
    {
      ad: "FreeDoor Hava Perdeleri · Elektrikli Isıtıcılı",
      kalemler: [
      { kod: "RM-1209", ad: "Elektrikli Isıtıcılı Hava Perdesi 90 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 90 cm", marka: "FreeDoor", liste: 26454, satis: 21163, kart: 27777 },
      { kod: "RM-1212", ad: "Elektrikli Isıtıcılı Hava Perdesi 120 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 120 cm", marka: "FreeDoor", liste: 29364, satis: 23491, kart: 30832 },
      { kod: "RM-1215", ad: "Elektrikli Isıtıcılı Hava Perdesi 150 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 150 cm", marka: "FreeDoor", liste: 37167, satis: 29734, kart: 39025 },
      { kod: "RM-1218", ad: "Elektrikli Isıtıcılı Hava Perdesi 180 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 180 cm", marka: "FreeDoor", liste: 43649, satis: 34919, kart: 45831 },
      { kod: "RM-1220", ad: "Elektrikli Isıtıcılı Hava Perdesi 200 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 250 cm · Takılabilir genişlik 200 cm", marka: "FreeDoor", liste: 48410, satis: 38728, kart: 50831 },
      ],
    },
    {
      ad: "FreeDoor Hava Perdeleri · Isıtıcısız Silver Serisi",
      kalemler: [
      { kod: "FM-1209 T/Y5GS", ad: "Isıtıcısız Hava Perdesi Silver 90 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 300 cm · Takılabilir genişlik 90 cm", marka: "FreeDoor", liste: 12979, satis: 10383, kart: 13628 },
      { kod: "FM-1212 T/Y5GS", ad: "Isıtıcısız Hava Perdesi Silver 120 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 300 cm · Takılabilir genişlik 120 cm", marka: "FreeDoor", liste: 14524, satis: 11619, kart: 15250 },
      { kod: "FM-1215 T/Y5GS", ad: "Isıtıcısız Hava Perdesi Silver 150 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 300 cm · Takılabilir genişlik 150 cm", marka: "FreeDoor", liste: 20321, satis: 16257, kart: 21337 },
      { kod: "FM-1218 T/Y5GS", ad: "Isıtıcısız Hava Perdesi Silver 180 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 300 cm · Takılabilir genişlik 180 cm", marka: "FreeDoor", liste: 25362, satis: 20290, kart: 26630 },
      { kod: "FM-1220 T/Y5GS", ad: "Isıtıcısız Hava Perdesi Silver 200 cm", aciklama: "Fan çapı 115 mm · Takılabilir yükseklik 300 cm · Takılabilir genişlik 200 cm", marka: "FreeDoor", liste: 27301, satis: 21841, kart: 28666 },
      ],
    },
    {
      ad: "Olefini Duvar Tipi Split Klimalar · Hi-Tech Seri (DC Inverter, R32)",
      kalemler: [
      { kod: "OLE-09 DCM", ad: "Duvar Tipi Split Klima 9.000 Btu/h", aciklama: "Soğutma 9.000 (3500~10900) Btu/h · Isıtma 10.000 (3000~12500) Btu/h · Montaj dahil", marka: "Olefini", liste: 46085, satis: 36868, kart: 48052 },
      { kod: "OLE-12 DCM", ad: "Duvar Tipi Split Klima 12.000 Btu/h", aciklama: "Soğutma 12.000 (2800~14200) Btu/h · Isıtma 13.000 (2900~16300) Btu/h · Montaj dahil", marka: "Olefini", liste: 49962, satis: 39970, kart: 52123 },
      { kod: "OLE-18 DCM", ad: "Duvar Tipi Split Klima 18.000 Btu/h", aciklama: "Soğutma 18.000 (6600~21400) Btu/h · Isıtma 19.000 (4400~23900) Btu/h · Montaj dahil", marka: "Olefini", liste: 71487, satis: 57190, kart: 74699 },
      { kod: "OLE-24 DCM", ad: "Duvar Tipi Split Klima 24.000 Btu/h", aciklama: "Soğutma 24.000 (10300~30000) Btu/h · Isıtma 25.000 (5200~32300) Btu/h · Montaj dahil", marka: "Olefini", liste: 92083, satis: 73666, kart: 96300 },
      ],
    },
    {
      ad: "Olefini Duvar Tipi Split Klimalar · Irigoni Seri (DC Inverter, R32)",
      kalemler: [
      { kod: "OLE-09 DICW", ad: "Duvar Tipi Split Klima 8.530 Btu/h", aciklama: "Soğutma 8.530 (1.023~10.918) Btu/h · Isıtma 8.871(1.023~11.259) Btu/h · Montaj dahil · Yeni model", marka: "Olefini", liste: 42683, satis: 34146, kart: 44480 },
      { kod: "OLE-12 DICW", ad: "Duvar Tipi Split Klima 11.942 Btu/h", aciklama: "Soğutma 11.942(1.023~12.965) Btu/h · Isıtma 11.942(1.023~13.306) Btu/h · Montaj dahil · Yeni model", marka: "Olefini", liste: 49235, satis: 39388, kart: 51359 },
      { kod: "OLE-18 DICW", ad: "Duvar Tipi Split Klima 17.401 Btu/h", aciklama: "Soğutma 17.401(1.706~18.424) Btu/h · Isıtma 17.401(1.706~19.107) Btu/h · Montaj dahil · Yeni model", marka: "Olefini", liste: 62757, satis: 50206, kart: 65545 },
      { kod: "OLE-24 DICW", ad: "Duvar Tipi Split Klima 22.178 Btu/h", aciklama: "Soğutma 22.178(2.047~22.519) Btu/h · Isıtma 22.178(2.047~23.202) Btu/h · Montaj dahil · Yeni model", marka: "Olefini", liste: 85328, satis: 68262, kart: 89219 },
      ],
    },
    {
      ad: "Olefini Ticari Split Klimalar · Salon Tipi (R32)",
      kalemler: [
      { kod: "OLE-24 FSDSM", ad: "Salon Tipi Split Klima 24.000 Btu/h", aciklama: "Soğutma 24.000 (7500~26500) Btu/h · Isıtma 26.000 (5200~29500) Btu/h · Dairesel · Montaj hariç", marka: "Olefini", liste: 89995, satis: 71996, kart: 94495 },
      { kod: "OLE-48 FSDCHM", ad: "Salon Tipi Split Klima 45.720 Btu/h", aciklama: "Soğutma 45.720 (11942~47768) Btu/h · Isıtma 51.180 (13648~52886) Btu/h · Monofaze-Tek fan · Montaj hariç", marka: "Olefini", liste: 135707, satis: 108566, kart: 142493 },
      { kod: "OLE-48 FSDCHT", ad: "Salon Tipi Split Klima 45.720 Btu/h", aciklama: "Soğutma 45.720 (11942~47768) Btu/h · Isıtma 51.180 (13648~52886) Btu/h · Trifaze-Tek fan · Montaj hariç", marka: "Olefini", liste: 140350, satis: 112280, kart: 147367 },
      { kod: "OLE-48 FSDCMS1", ad: "Salon Tipi Split Klima 48.000 Btu/h", aciklama: "Soğutma 48.000(12000~52000) Btu/h · Isıtma 53.000(14000~60000) Btu/h · Monofaze-Tek fan · Montaj hariç", marka: "Olefini", liste: 135707, satis: 108566, kart: 142493 },
      { kod: "OLE-48 FSDCMS3", ad: "Salon Tipi Split Klima 48.000 Btu/h", aciklama: "Soğutma 48.000(12000~52000) Btu/h · Isıtma 53.000(14000~60000) Btu/h · Trifaze-Tek fan · Montaj hariç", marka: "Olefini", liste: 140350, satis: 112280, kart: 147367 },
      { kod: "OLE-55 FSDCMS3", ad: "Salon Tipi Split Klima 52.000 Btu/h", aciklama: "Soğutma 52.000(14000~55000) Btu/h · Isıtma 62.000(15000~64000) Btu/h · Trifaze-Tek fan · Montaj hariç", marka: "Olefini", liste: 183026, satis: 146421, kart: 192178 },
      ],
    },
    {
      ad: "Olefini Ticari Split Klimalar · Kanallı Tip (R32)",
      kalemler: [
      { kod: "OLE-D-60 HDCM", ad: "Kanallı Tip Split Klima 52.000 Btu/h", aciklama: "Soğutma 52.000 (14000~59000) Btu/h · Isıtma 62.000 (15000~70000) Btu/h · Montaj hariç", marka: "Olefini", liste: 167848, satis: 134278, kart: 176241 },
      ],
    },
    {
      ad: "Olefini Ticari Split Klimalar · Kaset Tipi (R32)",
      kalemler: [
      { kod: "OLE-24 CSDCM", ad: "Kaset Tipi Split Klima 24.000 Btu/h", aciklama: "Soğutma 24.000 (11263~27000) Btu/h · Isıtma 26.000 (9577~30500) Btu/h · Montaj hariç", marka: "Olefini", liste: 88388, satis: 70710, kart: 92808 },
      { kod: "OLE-48 CSDCM", ad: "Kaset Tipi Split Klima 48.000 Btu/h", aciklama: "Soğutma 48.000 (12000~54000) Btu/h · Isıtma 55.000 (14000~59000 Btu/h · Montaj hariç", marka: "Olefini", liste: 158920, satis: 127136, kart: 166866 },
      { kod: "OLE-48 CSDCMS1", ad: "Kaset Tipi Split Klima 48.000 Btu/h", aciklama: "Soğutma 48.000 (12000~54000) Btu/h · Isıtma 55.000 (14000~59000 Btu/h · Monofaze-Tek fan · Montaj hariç", marka: "Olefini", liste: 152314, satis: 121851, kart: 159929 },
      { kod: "OLE-48 CSDCHM", ad: "Kaset Tipi Split Klima 41.967 Btu/h", aciklama: "Soğutma 41.967 (10263~44356) Btu/h · Isıtma 43.332 (11942~46062) Btu/h · Monofaze-Tek fan · Montaj hariç", marka: "Olefini", liste: 152314, satis: 121851, kart: 159929 },
      ],
    },
    {
      ad: "Olefini Multi Split Klimalar · Duvar Tipi İç Ünite · Black Pearl Seri",
      kalemler: [
      { kod: "OLE-24 MWG", ad: "Multi Split Duvar Tipi İç Ünite 22.000 Btu/h", aciklama: "Soğutma 22.000 Btu/h · Isıtma 24.000 Btu/h · Montaj hariç", marka: "Olefini", liste: 24654, satis: 19723, kart: 25887 },
      ],
    },
    {
      ad: "Olefini Multi Split Klimalar · Duvar Tipi İç Ünite · Irigoni Seri",
      kalemler: [
      { kod: "OLE-09 MIG / MICG", ad: "Multi Split Duvar Tipi İç Ünite 8.530 Btu/h", aciklama: "Soğutma 8.530 Btu/h · Isıtma 9.554 Btu/h · Montaj hariç", marka: "Olefini", liste: 17347, satis: 13878, kart: 18214 },
      { kod: "OLE-12 MIG / MICG", ad: "Multi Split Duvar Tipi İç Ünite 10.918 Btu/h", aciklama: "Soğutma 10.918 Btu/h · Isıtma 11.601 Btu/h · Montaj hariç", marka: "Olefini", liste: 18276, satis: 14621, kart: 19190 },
      { kod: "OLE-18 MIG / MICG", ad: "Multi Split Duvar Tipi İç Ünite 15.695 Btu/h", aciklama: "Soğutma 15.695 Btu/h · Isıtma 17.742 Btu/h · Montaj hariç", marka: "Olefini", liste: 19628, satis: 15702, kart: 20609 },
      { kod: "OLE-24 MIG / MICG", ad: "Multi Split Duvar Tipi İç Ünite 21.154 Btu/h", aciklama: "Soğutma 21.154 Btu/h · Isıtma 22.187 Btu/h · Montaj hariç", marka: "Olefini", liste: 24654, satis: 19723, kart: 25887 },
      ],
    },
    {
      ad: "Olefini Multi Split Klimalar · Kaset Tipi İç Ünite",
      kalemler: [
      { kod: "OLE-12 MCSG", ad: "Multi Split Kaset Tipi İç Ünite 11.942 Btu/h", aciklama: "Soğutma 11.942 Btu/h · Isıtma 13.648 Btu/h · Montaj hariç", marka: "Olefini", liste: 34595, satis: 27676, kart: 36325 },
      { kod: "OLE-18 MCSG", ad: "Multi Split Kaset Tipi İç Ünite 15.354 Btu/h", aciklama: "Soğutma 15.354 Btu/h · Isıtma 17.060 Btu/h · Montaj hariç", marka: "Olefini", liste: 30603, satis: 24482, kart: 32133 },
      { kod: "OLE-24 MCSG", ad: "Multi Split Kaset Tipi İç Ünite 24.225 Btu/h", aciklama: "Soğutma 24.225 Btu/h · Isıtma 27.296 Btu/h · Montaj hariç", marka: "Olefini", liste: 45050, satis: 36040, kart: 47303 },
      ],
    },
    {
      ad: "Olefini Multi Split Klimalar · Tek Yön Kaset Tipi İç Ünite",
      kalemler: [
      { kod: "OLE-12 MCS1G", ad: "Multi Split Tek Yön Kaset Tipi İç Ünite 11.942 Btu/h", aciklama: "Soğutma 11.942 Btu/h · Isıtma 12.283 Btu/h · Montaj hariç", marka: "Olefini", liste: 36306, satis: 29045, kart: 38121 },
      { kod: "OLE-18 MCS1G", ad: "Multi Split Tek Yön Kaset Tipi İç Ünite 17.060 Btu/h", aciklama: "Soğutma 17.060 Btu/h · Isıtma 18.084 Btu/h · Montaj hariç", marka: "Olefini", liste: 38777, satis: 31022, kart: 40716 },
      ],
    },
    {
      ad: "Olefini Multi Split Klimalar · Kanallı Tip İç Ünite",
      kalemler: [
      { kod: "OLE-09 MDG", ad: "Multi Split Kanallı Tip İç Ünite 9.000 Btu/h", aciklama: "Soğutma 9.000 Btu/h · Isıtma 9.600 Btu/h · Montaj hariç", marka: "Olefini", liste: 23380, satis: 18704, kart: 24549 },
      { kod: "OLE-12 MDG", ad: "Multi Split Kanallı Tip İç Ünite 12.000 Btu/h", aciklama: "Soğutma 12.000 Btu/h · Isıtma 13.600 Btu/h · Montaj hariç", marka: "Olefini", liste: 24331, satis: 19465, kart: 25548 },
      { kod: "OLE-18 MDG", ad: "Multi Split Kanallı Tip İç Ünite 17.100 Btu/h", aciklama: "Soğutma 17.100 Btu/h · Isıtma 18.800 Btu/h · Montaj hariç", marka: "Olefini", liste: 29463, satis: 23570, kart: 30936 },
      { kod: "OLE-24 MDG", ad: "Multi Split Kanallı Tip İç Ünite 23.900 Btu/h", aciklama: "Soğutma 23.900 Btu/h · Isıtma 23.300 Btu/h · Montaj hariç", marka: "Olefini", liste: 32884, satis: 26307, kart: 34528 },
      ],
    },
    {
      ad: "Olefini Multi Split Klimalar · Dış Ünite",
      kalemler: [
      { kod: "OLE-24 MOUT3G", ad: "Multi Split Dış Ünite 24.200 Btu/h", aciklama: "Soğutma 24.200 (7850~32400) Btu/h · Isıtma 29.300 (12500~30000) Btu/h · 3 Pipe · Montaj hariç", marka: "Olefini", liste: 67409, satis: 53927, kart: 70779 },
      { kod: "OLE-28 MOUT4G", ad: "Multi Split Dış Ünite 28.000 Btu/h", aciklama: "Soğutma 28.000 (7800~37500) Btu/h · Isıtma 32.400 (12500~35000) Btu/h · 4 Pipe · Montaj hariç", marka: "Olefini", liste: 71105, satis: 56884, kart: 74660 },
      { kod: "OLE-36 MOUT4G", ad: "Multi Split Dış Ünite 35.800 Btu/h", aciklama: "Soğutma 35.800 (8900~40900) Btu/h · Isıtma 40.900 (8900~46100) Btu/h · 4 Pipe · Montaj hariç", marka: "Olefini", liste: 102961, satis: 82369, kart: 108109 },
      { kod: "OLE-42 MOUT5G", ad: "Multi Split Dış Ünite 40.944 Btu/h", aciklama: "Soğutma 40.944 (8871~44356) Btu/h · Isıtma 44.356 (8871~49474) Btu/h · 5 Pipe · Montaj hariç", marka: "Olefini", liste: 118449, satis: 94759, kart: 124371 },
      ],
    },
    {
      ad: "Olefini Isı Pompaları",
      kalemler: [
      { kod: "OLE-08-HPM1-M", ad: "Isı Pompası 8 kW", aciklama: "max 75°C Sıcak su · Monoblok · Tek fan · 220 / 230 V 1 faz", marka: "Olefini", liste: 183114, satis: 146491, kart: 192020 },
      { kod: "OLE-12-HPM1-M", ad: "Isı Pompası 12 kW", aciklama: "max 75°C Sıcak su · Monoblok · Tek fan · 220 / 230 V 1 faz", marka: "Olefini", liste: 206347, satis: 165078, kart: 216414 },
      { kod: "OLE-15-HPM1-M", ad: "Isı Pompası 15 kW", aciklama: "max 75°C Sıcak su · Monoblok · Tek fan · 220 / 230 V 1 faz", marka: "Olefini", liste: 240421, satis: 192337, kart: 252192 },
      { kod: "OLE-18-HPM2-M", ad: "Isı Pompası 18 kW", aciklama: "max 75°C Sıcak su · Monoblok · Çift fan · 220 / 230 V 1 faz", marka: "Olefini", liste: 283787, satis: 227030, kart: 297726 },
      { kod: "OLE-22-HPM2-M", ad: "Isı Pompası 22 kW", aciklama: "max 75°C Sıcak su · Monoblok · Çift fan · 220 / 230 V 1 faz", marka: "Olefini", liste: 299276, satis: 239421, kart: 313990 },
      { kod: "OLE-22-HPM2-T", ad: "Isı Pompası 22 kW", aciklama: "max 75°C Sıcak su · Monoblok · Çift fan · 380 / 420 V 3 faz", marka: "Olefini", liste: 314764, satis: 251811, kart: 330252 },
      { kod: "OLE-24-HPM2-T", ad: "Isı Pompası 24 kW", aciklama: "max 75°C Sıcak su · Monoblok · Çift fan · 380 / 420 V 3 faz", marka: "Olefini", liste: 345740, satis: 276592, kart: 362777 },
      ],
    },
    {
      ad: "Olefini Havuz Isı Pompaları",
      kalemler: [
      { kod: "OLE-24-HPP-M", ad: "Havuz Isı Pompası 24 kW", aciklama: "Havuz Tipi Isı Pompası · R290 · Monoblok Tek Fan · 220 / 230 V 1 faz", marka: "Olefini", liste: 167316, satis: 133853, kart: 175432 },
      { kod: "OLE-32-HPP-M", ad: "Havuz Isı Pompası 32 kW", aciklama: "Havuz Tipi Isı Pompası · R290 · Monoblok Tek Fan · 220 / 230 V 1 faz", marka: "Olefini", liste: 235619, satis: 188495, kart: 247150 },
      ],
    },
    {
      ad: "Olefini Nem Alma Cihazları · Domestik Tip (R290)",
      kalemler: [
      { kod: "OL12-BD023B", ad: "Nem Alma Cihazı 12 lt/gün", aciklama: "Hava debisi 125 m³/h · Wi-Fi", marka: "Olefini", liste: 16000, satis: 12800, kart: 16800 },
      { kod: "OL20-BD030AMN", ad: "Nem Alma Cihazı 20 lt/gün", aciklama: "Hava debisi 180 m³/h · Wi-Fi", marka: "Olefini", liste: 22144, satis: 17715, kart: 23251 },
      { kod: "OL40-BD052A", ad: "Nem Alma Cihazı 40 lt/gün", aciklama: "Hava debisi 180 m³/h · Wi-Fi", marka: "Olefini", liste: 34560, satis: 27648, kart: 36288 },
      ],
    },
    {
      ad: "Olefini Nem Alma Cihazları · Portatif Ticari Tip (R290)",
      kalemler: [
      { kod: "OL55-B585EF", ad: "Nem Alma Cihazı 55 lt/gün", aciklama: "Hava debisi 450 m³/h · Wi-Fi", marka: "Olefini", liste: 41541, satis: 33233, kart: 43618 },
      { kod: "OL70-B585EF", ad: "Nem Alma Cihazı 70 lt/gün", aciklama: "Hava debisi 850 m³/h · Wi-Fi", marka: "Olefini", liste: 43531, satis: 34825, kart: 45708 },
      ],
    },
    {
      ad: "Olefini Nem Alma Cihazları · Portatif Tip (R32)",
      kalemler: [
      { kod: "OL90-B906E", ad: "Nem Alma Cihazı 90 lt/gün", aciklama: "Hava debisi 850 m³/h", marka: "Olefini", liste: 83331, satis: 66665, kart: 87498 },
      { kod: "REACT-FDH2400BC", ad: "Nem Alma Cihazı 240 lt/gün", aciklama: "Hava debisi 4200 m³/h · Yeni model", marka: "Olefini", liste: 202403, satis: 161922, kart: 212523 },
      ],
    },
    {
      ad: "Fral Nem Alma Cihazları · Portatif Tip",
      kalemler: [
      { kod: "FDNF-33", ad: "Nem Alma Cihazı 33 lt/gün", aciklama: "Hava debisi 380 m³/h", marka: "Fral", liste: 82441, satis: 65953, kart: 86563 },
      { kod: "FDNF-44", ad: "Nem Alma Cihazı 44 lt/gün", aciklama: "Hava debisi 450 m³/h", marka: "Fral", liste: 90450, satis: 72360, kart: 94972 },
      { kod: "FDNF-62", ad: "Nem Alma Cihazı 62 lt/gün", aciklama: "Hava debisi 550 m³/h", marka: "Fral", liste: 119523, satis: 95618, kart: 125499 },
      { kod: "FDNF-96", ad: "Nem Alma Cihazı 96 lt/gün", aciklama: "Hava debisi 1000 m³/h", marka: "Fral", liste: 157345, satis: 125876, kart: 165212 },
      ],
    },
    {
      ad: "Fral Nem Alma Cihazları · Portatif Ticari Tip",
      kalemler: [
      { kod: "FDNP-33", ad: "Nem Alma Cihazı 33 lt/gün", aciklama: "Hava debisi 380 m³/h", marka: "Fral", liste: 86210, satis: 68968, kart: 90520 },
      { kod: "FDNP-44", ad: "Nem Alma Cihazı 44 lt/gün", aciklama: "Hava debisi 450 m³/h", marka: "Fral", liste: 93276, satis: 74621, kart: 97940 },
      { kod: "FDSDP-62", ad: "Nem Alma Cihazı 62 lt/gün", aciklama: "Hava debisi 550 m³/h", marka: "Fral", liste: 125782, satis: 100626, kart: 132071 },
      { kod: "FDNP-96", ad: "Nem Alma Cihazı 96 lt/gün", aciklama: "Hava debisi 1000 m³/h", marka: "Fral", liste: 140520, satis: 112416, kart: 147546 },
      ],
    },
    {
      ad: "Fral Nem Alma Cihazları · Endüstriyel-Kanallı Tip",
      kalemler: [
      { kod: "FD-160", ad: "Nem Alma Cihazı 160 lt/gün", aciklama: "Hava debisi 1600 m³/h", marka: "Fral", liste: 309844, satis: 247875, kart: 325336 },
      { kod: "FD-240", ad: "Nem Alma Cihazı 240 lt/gün", aciklama: "Hava debisi 2000 m³/h", marka: "Fral", liste: 373980, satis: 299184, kart: 392679 },
      { kod: "FD-360", ad: "Nem Alma Cihazı 360 lt/gün", aciklama: "Hava debisi 3000 m³/h", marka: "Fral", liste: 566320, satis: 453056, kart: 594636 },
      { kod: "FD-520", ad: "Nem Alma Cihazı 520 lt/gün", aciklama: "Hava debisi 4000 m³/h", marka: "Fral", liste: 727837, satis: 582270, kart: 764229 },
      { kod: "FD-750", ad: "Nem Alma Cihazı 750 lt/gün", aciklama: "Hava debisi 6000 m³/h", marka: "Fral", liste: 1157607, satis: 926086, kart: 1215488 },
      { kod: "FD-980", ad: "Nem Alma Cihazı 980 lt/gün", aciklama: "Hava debisi 8000 m³/h", marka: "Fral", liste: 1578639, satis: 1262911, kart: 1657570 },
      { kod: "FD-1200", ad: "Nem Alma Cihazı 1200 lt/gün", aciklama: "Hava debisi 8100 m³/h", marka: "Fral", liste: 0, satis: 0 },
      { kod: "FD-2000", ad: "Nem Alma Cihazı 2000 lt/gün", aciklama: "Hava debisi 15000 m³/h", marka: "Fral", liste: 0, satis: 0 },
      { kod: "FD-3000", ad: "Nem Alma Cihazı 3000 lt/gün", aciklama: "Hava debisi 18500 m³/h", marka: "Fral", liste: 0, satis: 0 },
      ],
    },
    {
      ad: "Fral Nem Alma Cihazları · Dehu Clima",
      kalemler: [
      { kod: "FD-240 TCR", ad: "Nem Alma Cihazı 240 lt/gün", aciklama: "Soğutma kapasitesi 6,5 kW", marka: "Fral", liste: 678642, satis: 542914, kart: 712574 },
      { kod: "FD-360 TCR", ad: "Nem Alma Cihazı 360 lt/gün", aciklama: "Soğutma kapasitesi 14,0 kW", marka: "Fral", liste: 904587, satis: 723670, kart: 949816 },
      { kod: "FD-520 TCR", ad: "Nem Alma Cihazı 520 lt/gün", aciklama: "Soğutma kapasitesi 18,0 kW", marka: "Fral", liste: 1069580, satis: 855664, kart: 1123060 },
      { kod: "FD-750 TCR", ad: "Nem Alma Cihazı 750 lt/gün", aciklama: "Soğutma kapasitesi 28,0 kW", marka: "Fral", liste: 0, satis: 0 },
      { kod: "FD-980 TCR", ad: "Nem Alma Cihazı 980 lt/gün", aciklama: "Soğutma kapasitesi 35,0 kW", marka: "Fral", liste: 0, satis: 0 },
      ],
    },
    {
      ad: "Fral Nem Alma Cihazları · Havuz Tipi",
      kalemler: [
      { kod: "FSW-63", ad: "Nem Alma Cihazı 69 lt/gün", aciklama: "Hava debisi 600 m³/h", marka: "Fral", liste: 177669, satis: 142135, kart: 186552 },
      { kod: "FSW-100", ad: "Nem Alma Cihazı 116 lt/gün", aciklama: "Hava debisi 980 m³/h", marka: "Fral", liste: 272560, satis: 218048, kart: 286188 },
      ],
    },
    {
      ad: "Fral Nem Alma Cihazları · Profesyonel",
      kalemler: [
      { kod: "FDK-44", ad: "Nem Alma Cihazı 44 lt/gün", aciklama: "Hava debisi 450 m³/h", marka: "Fral", liste: 80759, satis: 64607, kart: 84797 },
      { kod: "FDK-100", ad: "Nem Alma Cihazı 96 lt/gün", aciklama: "Hava debisi 1100 m³/h", marka: "Fral", liste: 124984, satis: 99987, kart: 131233 },
      ],
    },
  ],
  gorseller: {},
};
