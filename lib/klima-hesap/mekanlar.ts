// -----------------------------------------------------------------------------
// MEKÂN TİPLERİ — soğutma yükü ve iç ünite seçimi için varsayılan değerler
//
//  yogunluk     : m² / kişi (tasarım doluluğu)
//  duyulur/gizli: kişi başı ısı (W) — ASHRAE Fundamentals, aktivite düzeyine göre
//  aydinlatma   : W/m²            ekipman: W/m² (cihaz, bilgisayar, vitrin, pişirme…)
//  tazeKisi / tazeAlan : taze hava (L/s·kişi + L/s·m²) — EN 16798-1 Kat. II / ASHRAE 62.1
//  yazIc / kisIc: iç tasarım sıcaklıkları (°C)
//  tazeHava     : varsayılan taze hava düzeni   tavan: tipik tavan yüksekliği (m)
//  tavanTipi    : tipik tavan (asma plaka / alçıpan / asma tavan yok)
// Tüm değerler oda ekranında değiştirilebilir.
// -----------------------------------------------------------------------------
import type { OdaTipi } from "@/lib/isi-hesap/katalog";

export type TazeHavaDuzeni = "SIZINTI" | "MEKANIK" | "HRV";
export type TavanTipi = "ASMA_PLAKA" | "ASMA_ALCIPAN" | "ACIK";
export type OzelDurum = "SUNUCU" | "MUTFAK_TICARI" | "HIJYEN" | "IBADET" | null;

export type Mekan = {
  ad: string;
  grup: string;
  odaTipi: OdaTipi; // ısı kaybı hesabındaki karşılığı (hava değişimi vb.)
  yogunluk: number;
  duyulur: number;
  gizli: number;
  aydinlatma: number;
  ekipman: number;
  tazeKisi: number;
  tazeAlan: number;
  yazIc: number;
  kisIc: number;
  sessiz: boolean;
  tazeHava: TazeHavaDuzeni;
  tavan: number;
  tavanTipi: TavanTipi;
  ozel: OzelDurum;
  not?: string;
};

const m = (x: Partial<Mekan> & Pick<Mekan, "ad" | "grup" | "odaTipi">): Mekan => ({
  yogunluk: 10,
  duyulur: 75,
  gizli: 55,
  aydinlatma: 10,
  ekipman: 10,
  tazeKisi: 7,
  tazeAlan: 0.7,
  yazIc: 26,
  kisIc: 20,
  sessiz: false,
  tazeHava: "MEKANIK",
  tavan: 2.8,
  tavanTipi: "ASMA_ALCIPAN",
  ozel: null,
  ...x,
});

export const MEKANLAR = {
  // --- Konut ---
  KONUT_SALON: m({ ad: "Salon / oturma odası", grup: "Konut", odaTipi: "OTURMA", yogunluk: 7, duyulur: 70, gizli: 45, aydinlatma: 6, ekipman: 10, tazeHava: "SIZINTI", tavanTipi: "ACIK" }),
  KONUT_YATAK: m({ ad: "Yatak odası", grup: "Konut", odaTipi: "YATAK", yogunluk: 7, duyulur: 65, gizli: 35, aydinlatma: 5, ekipman: 5, sessiz: true, tazeHava: "SIZINTI", tavanTipi: "ACIK" }),
  KONUT_COCUK: m({ ad: "Çocuk / çalışma odası", grup: "Konut", odaTipi: "COCUK", yogunluk: 9, duyulur: 70, gizli: 45, aydinlatma: 6, ekipman: 12, sessiz: true, tazeHava: "SIZINTI", tavanTipi: "ACIK" }),
  KONUT_MUTFAK: m({ ad: "Mutfak (konut)", grup: "Konut", odaTipi: "MUTFAK", yogunluk: 5, duyulur: 80, gizli: 80, aydinlatma: 8, ekipman: 80, tazeHava: "SIZINTI", tavanTipi: "ACIK" }),
  KONUT_ISLAK: m({ ad: "Banyo / WC", grup: "Konut", odaTipi: "BANYO", yogunluk: 50, aydinlatma: 6, ekipman: 0, tazeHava: "SIZINTI", tavanTipi: "ACIK", yazIc: 26, kisIc: 24 }),
  KONUT_HOL: m({ ad: "Hol / koridor", grup: "Konut", odaTipi: "HOL", yogunluk: 50, aydinlatma: 5, ekipman: 0, tazeHava: "SIZINTI", tavanTipi: "ACIK", kisIc: 18 }),

  // --- Ofis ---
  OFIS_ACIK: m({ ad: "Açık ofis", grup: "Ofis", odaTipi: "OFIS", yogunluk: 10, aydinlatma: 10, ekipman: 15, tavanTipi: "ASMA_PLAKA" }),
  OFIS_OZEL: m({ ad: "Yönetici / özel ofis", grup: "Ofis", odaTipi: "OFIS", yogunluk: 15, aydinlatma: 10, ekipman: 12, sessiz: true, tavanTipi: "ASMA_PLAKA" }),
  TOPLANTI: m({ ad: "Toplantı odası", grup: "Ofis", odaTipi: "OFIS", yogunluk: 2.5, aydinlatma: 12, ekipman: 6, sessiz: true, tavanTipi: "ASMA_PLAKA" }),
  KONFERANS: m({ ad: "Konferans / seminer salonu", grup: "Ofis", odaTipi: "OFIS", yogunluk: 1.5, duyulur: 70, gizli: 45, aydinlatma: 12, ekipman: 5, sessiz: true, tavan: 3.5, tavanTipi: "ASMA_ALCIPAN" }),
  RESEPSIYON: m({ ad: "Resepsiyon / bekleme", grup: "Ofis", odaTipi: "OFIS", yogunluk: 5, duyulur: 70, gizli: 45, aydinlatma: 12, ekipman: 5, tavanTipi: "ASMA_PLAKA" }),

  // --- Ticari ---
  MAGAZA: m({ ad: "Mağaza / butik", grup: "Ticari", odaTipi: "DIGER", yogunluk: 6, aydinlatma: 18, ekipman: 5, tavan: 3.5, tavanTipi: "ASMA_ALCIPAN" }),
  AVM_ORTAK: m({ ad: "AVM ortak alan / pasaj", grup: "Ticari", odaTipi: "DIGER", yogunluk: 5, aydinlatma: 12, ekipman: 3, tavan: 5, tavanTipi: "ACIK" }),
  SUPERMARKET: m({ ad: "Market / süpermarket", grup: "Ticari", odaTipi: "DIGER", yogunluk: 8, aydinlatma: 15, ekipman: 10, tavan: 4.5, tavanTipi: "ACIK", not: "Açık reyonlu soğutucular ortamı soğutur: yaz yükü azalır, kış ısıtma yükü artar. Reyon önlerine doğrudan üfleme yapılmamalı." }),
  SHOWROOM: m({ ad: "Showroom / galeri", grup: "Ticari", odaTipi: "DIGER", yogunluk: 15, aydinlatma: 25, ekipman: 5, tavan: 4.5, tavanTipi: "ACIK" }),
  BANKA: m({ ad: "Banka şubesi / hizmet salonu", grup: "Ticari", odaTipi: "OFIS", yogunluk: 6, aydinlatma: 12, ekipman: 15, tavanTipi: "ASMA_PLAKA" }),
  KUAFOR: m({ ad: "Kuaför / güzellik salonu", grup: "Ticari", odaTipi: "DIGER", yogunluk: 4, duyulur: 75, gizli: 70, aydinlatma: 15, ekipman: 40, tazeKisi: 10, not: "Kimyasal buhar ve koku nedeniyle taze hava ve egzoz artırılmalı." }),
  ECZANE: m({ ad: "Eczane", grup: "Ticari", odaTipi: "DIGER", yogunluk: 5, aydinlatma: 15, ekipman: 10, tavanTipi: "ASMA_PLAKA" }),

  // --- Yeme-içme ---
  RESTORAN: m({ ad: "Restoran salonu", grup: "Yeme-içme", odaTipi: "DIGER", yogunluk: 1.5, duyulur: 85, gizli: 90, aydinlatma: 12, ekipman: 10, tazeKisi: 8, tavan: 3.2 }),
  KAFE: m({ ad: "Kafe / bar", grup: "Yeme-içme", odaTipi: "DIGER", yogunluk: 2, duyulur: 80, gizli: 80, aydinlatma: 12, ekipman: 20, tazeKisi: 8 }),
  MUTFAK_TICARI: m({
    ad: "Endüstriyel mutfak",
    grup: "Yeme-içme",
    odaTipi: "MUTFAK",
    yogunluk: 8,
    duyulur: 110,
    gizli: 160,
    aydinlatma: 15,
    ekipman: 200,
    tazeKisi: 10,
    yazIc: 27,
    kisIc: 18,
    tavanTipi: "ACIK",
    ozel: "MUTFAK_TICARI",
    not: "Davlumbaz egzozu kadar telafi (taze) havası verilmeli; klima tek başına mutfağı serinletemez. Yağlı ortam için yağ filtreli tavan askılı / duvar tipi iç ünite ve kolay temizlenir yüzey seçilmeli.",
  }),

  // --- Konaklama ---
  OTEL_ODA: m({ ad: "Otel odası", grup: "Konaklama", odaTipi: "YATAK", yogunluk: 12, duyulur: 65, gizli: 35, aydinlatma: 8, ekipman: 8, sessiz: true, tavanTipi: "ASMA_ALCIPAN" }),
  OTEL_LOBI: m({ ad: "Otel lobisi", grup: "Konaklama", odaTipi: "DIGER", yogunluk: 5, duyulur: 70, gizli: 45, aydinlatma: 15, ekipman: 5, tavan: 5, tavanTipi: "ASMA_ALCIPAN" }),
  DUGUN_SALONU: m({ ad: "Düğün / balo salonu", grup: "Konaklama", odaTipi: "DIGER", yogunluk: 1.2, duyulur: 100, gizli: 150, aydinlatma: 15, ekipman: 10, tazeKisi: 8, tavan: 5, tavanTipi: "ASMA_ALCIPAN" }),

  // --- Sağlık / eğitim ---
  HASTA_ODASI: m({
    ad: "Hasta odası",
    grup: "Sağlık / eğitim",
    odaTipi: "YATAK",
    yogunluk: 10,
    duyulur: 65,
    gizli: 35,
    aydinlatma: 10,
    ekipman: 10,
    tazeKisi: 10,
    tazeAlan: 1,
    kisIc: 22,
    yazIc: 24,
    sessiz: true,
    ozel: "HIJYEN",
    not: "Ameliyathane, yoğun bakım, izolasyon gibi hijyenik alanlarda %100 taze havalı hijyenik klima santrali + HEPA gerekir; VRF bu alanlar için uygun değildir.",
  }),
  MUAYENE: m({ ad: "Muayene / poliklinik", grup: "Sağlık / eğitim", odaTipi: "OFIS", yogunluk: 6, aydinlatma: 15, ekipman: 20, tazeKisi: 10, ozel: "HIJYEN", tavanTipi: "ASMA_PLAKA" }),
  SINIF: m({ ad: "Derslik / sınıf", grup: "Sağlık / eğitim", odaTipi: "OFIS", yogunluk: 2, duyulur: 70, gizli: 45, aydinlatma: 12, ekipman: 5, sessiz: true, tavan: 3.2 }),
  KRES: m({ ad: "Kreş / anaokulu", grup: "Sağlık / eğitim", odaTipi: "OFIS", yogunluk: 3, duyulur: 65, gizli: 45, aydinlatma: 10, ekipman: 5, kisIc: 22, sessiz: true, tavanTipi: "ASMA_ALCIPAN" }),

  // --- Spor / eğlence / ibadet ---
  FITNESS: m({ ad: "Fitness / spor salonu", grup: "Spor / eğlence / ibadet", odaTipi: "DIGER", yogunluk: 5, duyulur: 210, gizli: 315, aydinlatma: 12, ekipman: 15, tazeKisi: 14, yazIc: 24, kisIc: 18, tavan: 3.5, tavanTipi: "ACIK" }),
  SPOR_KAPALI: m({ ad: "Kapalı spor salonu (basketbol vb.)", grup: "Spor / eğlence / ibadet", odaTipi: "DIGER", yogunluk: 20, duyulur: 210, gizli: 315, aydinlatma: 12, ekipman: 2, tazeKisi: 14, kisIc: 16, tavan: 9, tavanTipi: "ACIK" }),
  SINEMA: m({ ad: "Sinema / tiyatro salonu", grup: "Spor / eğlence / ibadet", odaTipi: "DIGER", yogunluk: 1, duyulur: 65, gizli: 30, aydinlatma: 5, ekipman: 3, sessiz: true, tavan: 7, tavanTipi: "ACIK" }),
  IBADET: m({
    ad: "Cami / ibadethane",
    grup: "Spor / eğlence / ibadet",
    odaTipi: "DIGER",
    yogunluk: 1,
    duyulur: 65,
    gizli: 30,
    aydinlatma: 8,
    ekipman: 0,
    tazeKisi: 5,
    sessiz: true,
    tavan: 10,
    tavanTipi: "ACIK",
    ozel: "IBADET",
    not: "Kubbe / yüksek tavanda sıcak hava yukarıda birikir. Üfleme yaşam bölgesine (yerden ≤ 3 m) yapılmalı; ısıtma için yerden ısıtma en verimli çözümdür. Cuma ve bayram namazında kısa süreli tam doluluk olur; ön soğutma yapılabilir.",
  }),

  // --- Endüstri / teknik ---
  ATOLYE: m({ ad: "Atölye / imalathane", grup: "Endüstri / teknik", odaTipi: "DIGER", yogunluk: 20, duyulur: 120, gizli: 180, aydinlatma: 12, ekipman: 30, kisIc: 16, tavan: 5, tavanTipi: "ACIK" }),
  URETIM: m({ ad: "Üretim alanı (hafif)", grup: "Endüstri / teknik", odaTipi: "DIGER", yogunluk: 15, duyulur: 120, gizli: 180, aydinlatma: 15, ekipman: 50, kisIc: 16, tavan: 7, tavanTipi: "ACIK" }),
  DEPO: m({ ad: "Depo (iklimlendirilen)", grup: "Endüstri / teknik", odaTipi: "DIGER", yogunluk: 50, duyulur: 120, gizli: 180, aydinlatma: 6, ekipman: 2, tazeKisi: 7, tazeAlan: 0.3, kisIc: 15, tavan: 8, tavanTipi: "ACIK" }),
  SUNUCU: m({
    ad: "Sunucu / sistem odası",
    grup: "Endüstri / teknik",
    odaTipi: "DIGER",
    yogunluk: 50,
    aydinlatma: 10,
    ekipman: 500,
    tazeKisi: 0,
    tazeAlan: 0,
    yazIc: 24,
    kisIc: 20,
    tazeHava: "SIZINTI",
    tavanTipi: "ACIK",
    ozel: "SUNUCU",
    not: "Yük neredeyse tamamen duyulur ısıdır ve yıl boyu 7/24 sürer; gerçek IT yükünü (kW) 'Cihazlar' alanına girin.",
  }),
  ELEKTRIK_ODASI: m({ ad: "Elektrik / UPS odası", grup: "Endüstri / teknik", odaTipi: "DIGER", yogunluk: 50, aydinlatma: 8, ekipman: 100, tazeKisi: 0, tazeAlan: 0, yazIc: 27, tazeHava: "SIZINTI", tavanTipi: "ACIK", ozel: "SUNUCU" }),

  DIGER: m({ ad: "Diğer", grup: "Diğer", odaTipi: "DIGER" }),
} as const satisfies Record<string, Mekan>;

export type MekanTipi = keyof typeof MEKANLAR;

export const MEKAN_GRUPLARI: string[] = Array.from(new Set(Object.values(MEKANLAR).map((x) => x.grup)));

// Eski kayıtlar (yalnız oda tipi olan) için mekân karşılığı
export function mekanOdaTipinden(t: OdaTipi): MekanTipi {
  switch (t) {
    case "OTURMA":
      return "KONUT_SALON";
    case "YATAK":
      return "KONUT_YATAK";
    case "COCUK":
      return "KONUT_COCUK";
    case "MUTFAK":
      return "KONUT_MUTFAK";
    case "BANYO":
    case "WC":
      return "KONUT_ISLAK";
    case "HOL":
      return "KONUT_HOL";
    case "OFIS":
      return "OFIS_ACIK";
    default:
      return "DIGER";
  }
}

export const TAVAN_TIPLERI: Record<TavanTipi, string> = {
  ASMA_PLAKA: "Asma tavan (60×60 plaka)",
  ASMA_ALCIPAN: "Asma tavan (alçıpan / gizli)",
  ACIK: "Asma tavan yok (beton / çelik / ahşap)",
};

export const TAZE_HAVA_DUZENLERI: Record<TazeHavaDuzeni, string> = {
  SIZINTI: "Doğal (pencere / sızıntı)",
  MEKANIK: "Mekanik taze hava (ısı geri kazanımsız)",
  HRV: "Isı geri kazanımlı havalandırma (HRV)",
};
