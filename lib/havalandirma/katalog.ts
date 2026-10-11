// -----------------------------------------------------------------------------
// HAVALANDIRMA HESABI — KATALOG VE TABLO DEĞERLERİ
// Her değerin kaynağı yanında yazılıdır. Hepsi proje ekranında mahal / santral
// bazında elle değiştirilebilir; burası yalnızca başlangıç değerleridir.
//
// Kaynaklar
//  [EN]   TS EN 16798-1:2019 (iç ortam parametreleri) — kişi ve alan bazlı taze hava,
//         kategori I / II / III; konut toplam ve ıslak hacim egzoz debileri (EN 15251 Ek B).
//  [AS]   ASHRAE 62.1 (Tablo 6-1 Rp, Ra, varsayılan yoğunluk; egzoz tablosu).
//  [A154] ASHRAE 154 / IMC 507 — ticari mutfak davlumbazı en az egzoz debisi (m başına).
//  [BYK]  Binaların Yangından Korunması Hakkında Yönetmelik — 2000 m² üstü kapalı otoparkta
//         saatte en az 10 hava değişimli mekanik duman tahliyesi.
//  [ErP]  AB 1253/2014 (2018) — konut dışı çift akışlı ünitede ısı geri kazanım verimi ≥ %73
//         (ara akışkanlı ≥ %68), by-pass ve filtre uyarısı zorunlu.
//  [EN3]  TS EN 16798-3 — SFP sınıfları, kanal hızları ve filtre basınç kayıpları.
// -----------------------------------------------------------------------------

export type Yontem =
  | "KISI_ALAN" // kişi + alan bazlı taze hava (ofis, mağaza, okul…)
  | "KONUT_KURU" // konut yaşam / yatak odası (besleme)
  | "KONUT_ISLAK" // konut mutfak / banyo / WC (sabit egzoz)
  | "ARMATUR" // WC / duş: armatür başına egzoz
  | "EGZOZ_ALAN" // alan başına egzoz (soyunma, temizlik, fotokopi)
  | "MUTFAK" // ticari mutfak: davlumbaz uzunluğu ve yükü
  | "OTOPARK" // kapalı otopark: hava değişimi + alan, duman tahliyesi
  | "TEKNIK_ISI" // ısı atılması gereken teknik mahal (elektrik, trafo, jeneratör, UPS…)
  | "KAZAN" // kazan dairesi: yanma havası
  | "HAVA_DEGISIMI"; // sabit hava değişim sayısı (depo, arşiv, koridor…)

export type MahalTanimi = {
  ad: string;
  grup: string;
  yontem: Yontem;
  rp?: number; // L/s·kişi (ASHRAE 62.1 Tablo 6-1)
  ra?: number; // L/s·m²
  yogunluk?: number; // m² / kişi (varsayılan doluluk)
  egzozAlanMin?: number; // L/s·m² — en az egzoz (ASHRAE 62.1 Tablo 6-4; ör. kuaför, laboratuvar)
  egzozOrani?: number; // KISI_ALAN: mahal egzozu = besleme × oran (kalan hava ıslak hacimlere aktarılır)
  minAch?: number; // en az hava değişimi (1/h)
  egzozSabit?: number; // L/s (KONUT_ISLAK)
  egzozAlan?: number; // L/s·m² (EGZOZ_ALAN)
  armatur?: number; // L/s armatür başına (ARMATUR)
  ach?: number; // HAVA_DEGISIMI varsayılanı
  tMaks?: number; // TEKNIK_ISI: mahalde izin verilen en yüksek sıcaklık (°C)
  isiKw?: number; // TEKNIK_ISI varsayılan ısı yükü
  akustik: Akustik;
  not?: string;
};

export type Akustik = "SESSIZ" | "STANDART" | "ENDUSTRIYEL";

const m = (t: MahalTanimi) => t;

export const MAHAL_TIPLERI = {
  // --- Konut [EN] — Kat. II: kişi başı 7 l/s, toplam ≥ 0,42 l/s·m²; mutfak 20, banyo 15, WC 10 l/s
  KONUT_SALON: m({ ad: "Salon / oturma odası", grup: "Konut", yontem: "KONUT_KURU", yogunluk: 8, akustik: "SESSIZ" }),
  KONUT_YATAK: m({ ad: "Yatak odası", grup: "Konut", yontem: "KONUT_KURU", yogunluk: 7, akustik: "SESSIZ" }),
  KONUT_COCUK: m({ ad: "Çocuk / çalışma odası", grup: "Konut", yontem: "KONUT_KURU", yogunluk: 9, akustik: "SESSIZ" }),
  KONUT_MUTFAK: m({ ad: "Mutfak (konut)", grup: "Konut", yontem: "KONUT_ISLAK", egzozSabit: 20, akustik: "SESSIZ", not: "Ocak davlumbazı ayrı (sirkülasyonlu ya da bağımsız egzoz) düşünülmelidir." }),
  KONUT_BANYO: m({ ad: "Banyo", grup: "Konut", yontem: "KONUT_ISLAK", egzozSabit: 15, akustik: "SESSIZ" }),
  KONUT_WC: m({ ad: "WC (konut)", grup: "Konut", yontem: "KONUT_ISLAK", egzozSabit: 10, akustik: "SESSIZ" }),
  KONUT_HOL: m({ ad: "Hol / koridor (konut)", grup: "Konut", yontem: "HAVA_DEGISIMI", ach: 0, akustik: "SESSIZ", not: "Geçiş havası (transfer) hacmi; besleme / egzoz gerekmez." }),

  // --- Ofis [AS]
  OFIS_ACIK: m({ ad: "Açık ofis", grup: "Ofis", yontem: "KISI_ALAN", rp: 2.5, ra: 0.3, yogunluk: 10, egzozOrani: 0.8, akustik: "STANDART" }),
  OFIS_OZEL: m({ ad: "Yönetici / özel ofis", grup: "Ofis", yontem: "KISI_ALAN", rp: 2.5, ra: 0.3, yogunluk: 15, egzozOrani: 0.8, akustik: "SESSIZ" }),
  TOPLANTI: m({ ad: "Toplantı odası", grup: "Ofis", yontem: "KISI_ALAN", rp: 2.5, ra: 0.3, yogunluk: 2, egzozOrani: 0.9, akustik: "SESSIZ", not: "Değişken doluluk: CO₂ sensörlü debi kontrolü (VAV) önerilir." }),
  KONFERANS: m({ ad: "Konferans / seminer salonu", grup: "Ofis", yontem: "KISI_ALAN", rp: 2.5, ra: 0.3, yogunluk: 1.2, egzozOrani: 0.9, akustik: "SESSIZ", not: "CO₂ kontrollü değişken debi önerilir." }),
  RESEPSIYON: m({ ad: "Resepsiyon / bekleme", grup: "Ofis", yontem: "KISI_ALAN", rp: 2.5, ra: 0.3, yogunluk: 3.3, egzozOrani: 0.8, akustik: "STANDART" }),
  LOBI: m({ ad: "Giriş holü / lobi", grup: "Ofis", yontem: "KISI_ALAN", rp: 3.8, ra: 0.3, yogunluk: 3.3, egzozOrani: 0.7, akustik: "STANDART" }),
  KORIDOR: m({ ad: "Koridor / geçiş", grup: "Ofis", yontem: "KISI_ALAN", rp: 0, ra: 0.3, yogunluk: 0, egzozOrani: 0, akustik: "STANDART", not: "Islak hacimlere geçiş havası yolu olarak kullanılabilir." }),
  FOTOKOPI: m({ ad: "Fotokopi / baskı odası", grup: "Ofis", yontem: "EGZOZ_ALAN", egzozAlan: 2.5, akustik: "STANDART" }),
  ARSIV: m({ ad: "Arşiv / depo (ofis)", grup: "Ofis", yontem: "HAVA_DEGISIMI", ach: 1, akustik: "STANDART" }),

  // --- Ticari [AS]
  MAGAZA: m({ ad: "Mağaza / satış alanı", grup: "Ticari", yontem: "KISI_ALAN", rp: 3.8, ra: 0.6, yogunluk: 6.7, egzozOrani: 0.8, akustik: "STANDART" }),
  AVM_ORTAK: m({ ad: "AVM ortak alan / pasaj", grup: "Ticari", yontem: "KISI_ALAN", rp: 3.8, ra: 0.3, yogunluk: 2.5, egzozOrani: 0.8, akustik: "STANDART" }),
  SUPERMARKET: m({ ad: "Market / süpermarket", grup: "Ticari", yontem: "KISI_ALAN", rp: 3.8, ra: 0.3, yogunluk: 12.5, egzozOrani: 0.8, akustik: "STANDART" }),
  SHOWROOM: m({ ad: "Showroom / galeri", grup: "Ticari", yontem: "KISI_ALAN", rp: 3.8, ra: 0.6, yogunluk: 15, egzozOrani: 0.8, akustik: "STANDART" }),
  BANKA: m({ ad: "Banka şubesi / hizmet salonu", grup: "Ticari", yontem: "KISI_ALAN", rp: 3.8, ra: 0.3, yogunluk: 6.7, egzozOrani: 0.8, akustik: "STANDART" }),
  KUAFOR: m({ ad: "Kuaför / güzellik salonu", grup: "Ticari", yontem: "KISI_ALAN", rp: 10, ra: 0.6, yogunluk: 4, egzozOrani: 1.1, egzozAlanMin: 3, akustik: "STANDART" }),
  ECZANE: m({ ad: "Eczane", grup: "Ticari", yontem: "KISI_ALAN", rp: 2.5, ra: 0.9, yogunluk: 10, egzozOrani: 0.8, akustik: "STANDART" }),

  // --- Yeme-içme [AS], [A154]
  RESTORAN: m({ ad: "Restoran salonu", grup: "Yeme-içme", yontem: "KISI_ALAN", rp: 3.8, ra: 0.9, yogunluk: 1.4, egzozOrani: 0.6, akustik: "STANDART", not: "Salon havasının bir kısmı mutfağa geçiş havası olarak aktarılır (mutfak negatif basınç)." }),
  KAFE: m({ ad: "Kafe / fast-food salonu", grup: "Yeme-içme", yontem: "KISI_ALAN", rp: 3.8, ra: 0.9, yogunluk: 1, egzozOrani: 0.6, akustik: "STANDART" }),
  BAR: m({ ad: "Bar / lounge", grup: "Yeme-içme", yontem: "KISI_ALAN", rp: 3.8, ra: 0.9, yogunluk: 1, egzozOrani: 0.9, akustik: "STANDART" }),
  MUTFAK_TICARI: m({ ad: "Ticari mutfak (davlumbazlı)", grup: "Yeme-içme", yontem: "MUTFAK", akustik: "ENDUSTRIYEL" }),
  BULASIK: m({ ad: "Bulaşıkhane", grup: "Yeme-içme", yontem: "EGZOZ_ALAN", egzozAlan: 7, akustik: "ENDUSTRIYEL", not: "Bulaşık makinesi üstüne buhar davlumbazı ayrıca öngörülmelidir." }),

  // --- Konaklama / toplanma [AS]
  OTEL_ODA: m({ ad: "Otel odası", grup: "Konaklama", yontem: "KISI_ALAN", rp: 2.5, ra: 0.3, yogunluk: 12, egzozOrani: 0, akustik: "SESSIZ", not: "Oda egzozu banyodan alınır (otel banyosu mahali ayrıca eklenir)." }),
  OTEL_BANYO: m({ ad: "Otel / hasta odası banyosu", grup: "Konaklama", yontem: "ARMATUR", armatur: 12, akustik: "SESSIZ" }),
  DUGUN_SALONU: m({ ad: "Düğün / toplantı salonu", grup: "Konaklama", yontem: "KISI_ALAN", rp: 2.5, ra: 0.3, yogunluk: 1, egzozOrani: 0.9, akustik: "STANDART", not: "CO₂ kontrollü değişken debi önerilir." }),

  // --- Sağlık / eğitim [AS]
  SINIF: m({ ad: "Derslik", grup: "Sağlık / eğitim", yontem: "KISI_ALAN", rp: 5, ra: 0.6, yogunluk: 2.9, egzozOrani: 0.9, akustik: "SESSIZ" }),
  AMFI: m({ ad: "Amfi / konferans dersliği", grup: "Sağlık / eğitim", yontem: "KISI_ALAN", rp: 3.8, ra: 0.3, yogunluk: 1.5, egzozOrani: 0.9, akustik: "SESSIZ" }),
  KRES: m({ ad: "Kreş / anaokulu", grup: "Sağlık / eğitim", yontem: "KISI_ALAN", rp: 5, ra: 0.9, yogunluk: 4, egzozOrani: 0.9, akustik: "SESSIZ" }),
  KUTUPHANE: m({ ad: "Kütüphane / okuma salonu", grup: "Sağlık / eğitim", yontem: "KISI_ALAN", rp: 2.5, ra: 0.6, yogunluk: 10, egzozOrani: 0.9, akustik: "SESSIZ" }),
  LAB: m({ ad: "Laboratuvar (eğitim)", grup: "Sağlık / eğitim", yontem: "KISI_ALAN", rp: 5, ra: 0.9, yogunluk: 4, egzozOrani: 1.1, egzozAlanMin: 5, minAch: 6, akustik: "STANDART", not: "Çeker ocak egzozları ayrıca eklenmelidir; mahal negatif basınçta tutulur." }),
  MUAYENE: m({ ad: "Muayene / poliklinik", grup: "Sağlık / eğitim", yontem: "KISI_ALAN", rp: 2.5, ra: 0.3, yogunluk: 6, egzozOrani: 1, minAch: 6, akustik: "SESSIZ", not: "ASHRAE 170: muayene odası en az 6 toplam hava değişimi. Ameliyathane / yoğun bakım bu hesapla yapılmaz." }),
  HASTA_ODASI: m({ ad: "Hasta odası", grup: "Sağlık / eğitim", yontem: "KISI_ALAN", rp: 2.5, ra: 0.3, yogunluk: 10, egzozOrani: 0, minAch: 4, akustik: "SESSIZ", not: "ASHRAE 170: hasta odası en az 4 toplam hava değişimi; egzoz banyodan." }),

  // --- Spor / eğlence / ibadet [AS]
  FITNESS: m({ ad: "Fitness / ağırlık salonu", grup: "Spor / eğlence / ibadet", yontem: "KISI_ALAN", rp: 10, ra: 0.3, yogunluk: 10, egzozOrani: 0.9, akustik: "STANDART" }),
  AEROBIK: m({ ad: "Aerobik / grup egzersiz", grup: "Spor / eğlence / ibadet", yontem: "KISI_ALAN", rp: 10, ra: 0.3, yogunluk: 2.5, egzozOrani: 0.9, akustik: "STANDART" }),
  SPOR_KAPALI: m({ ad: "Kapalı spor salonu (oyun alanı)", grup: "Spor / eğlence / ibadet", yontem: "KISI_ALAN", rp: 10, ra: 0.9, yogunluk: 14, egzozOrani: 0.9, akustik: "ENDUSTRIYEL" }),
  SINEMA: m({ ad: "Sinema / tiyatro salonu", grup: "Spor / eğlence / ibadet", yontem: "KISI_ALAN", rp: 2.5, ra: 0.3, yogunluk: 0.67, egzozOrani: 0.9, akustik: "SESSIZ" }),
  IBADET: m({ ad: "Cami / ibadethane", grup: "Spor / eğlence / ibadet", yontem: "KISI_ALAN", rp: 2.5, ra: 0.3, yogunluk: 0.83, egzozOrani: 0.9, akustik: "SESSIZ" }),

  // --- Islak hacim / servis [AS]
  WC_GENEL: m({ ad: "WC (umumi / ofis)", grup: "Islak hacim / servis", yontem: "ARMATUR", armatur: 25, minAch: 10, akustik: "STANDART", not: "Armatür (klozet + pisuvar) başına 25 L/s sürekli egzoz; besleme koridordan geçiş havasıyla." }),
  WC_OZEL: m({ ad: "WC (tek kişilik)", grup: "Islak hacim / servis", yontem: "ARMATUR", armatur: 12, akustik: "STANDART" }),
  DUS_SOYUNMA: m({ ad: "Duş / soyunma", grup: "Islak hacim / servis", yontem: "EGZOZ_ALAN", egzozAlan: 2.5, armatur: 25, akustik: "STANDART", not: "Soyunma alanı 2,5 L/s·m² + duş başlığı başına 25 L/s." }),
  TEMIZLIK: m({ ad: "Temizlik / çöp odası", grup: "Islak hacim / servis", yontem: "EGZOZ_ALAN", egzozAlan: 5, akustik: "STANDART" }),
  DEPO: m({ ad: "Depo", grup: "Islak hacim / servis", yontem: "HAVA_DEGISIMI", ach: 1, akustik: "ENDUSTRIYEL" }),

  // --- Endüstri [AS]
  ATOLYE: m({ ad: "Atölye / imalathane", grup: "Endüstri", yontem: "KISI_ALAN", rp: 5, ra: 0.9, yogunluk: 20, egzozOrani: 1, akustik: "ENDUSTRIYEL", not: "Kaynak, boya, toz gibi kaynaktan emiş gereken işlemler ayrıca hesaplanmalıdır." }),
  URETIM: m({ ad: "Üretim alanı (hafif)", grup: "Endüstri", yontem: "HAVA_DEGISIMI", ach: 4, akustik: "ENDUSTRIYEL" }),

  // --- Otopark [AS], [BYK]
  OTOPARK: m({ ad: "Kapalı otopark", grup: "Otopark / teknik", yontem: "OTOPARK", akustik: "ENDUSTRIYEL" }),

  // --- Teknik mahaller: ısı atımı V = Q / (0,34 · ΔT)
  ELEKTRIK_ODASI: m({ ad: "Elektrik / pano odası", grup: "Otopark / teknik", yontem: "TEKNIK_ISI", tMaks: 35, isiKw: 2, akustik: "ENDUSTRIYEL" }),
  TRAFO: m({ ad: "Trafo odası", grup: "Otopark / teknik", yontem: "TEKNIK_ISI", tMaks: 40, isiKw: 12, akustik: "ENDUSTRIYEL", not: "Trafo kayıpları üretici etiketinden (boşta + yükte kayıp) alınmalıdır." }),
  JENERATOR: m({ ad: "Jeneratör odası", grup: "Otopark / teknik", yontem: "TEKNIK_ISI", tMaks: 40, isiKw: 25, akustik: "ENDUSTRIYEL", not: "Radyatör soğutma havası ve yanma havası jeneratör üreticisinin verdiği debilerle kontrol edilmelidir." }),
  UPS_AKU: m({ ad: "UPS / akü odası", grup: "Otopark / teknik", yontem: "TEKNIK_ISI", tMaks: 30, isiKw: 3, akustik: "ENDUSTRIYEL", not: "Açık tip akülerde hidrojen için tavan seviyesinden egzoz şarttır." }),
  ASANSOR_MAKINE: m({ ad: "Asansör makine dairesi", grup: "Otopark / teknik", yontem: "TEKNIK_ISI", tMaks: 40, isiKw: 3, akustik: "ENDUSTRIYEL" }),
  KAZAN_DAIRESI: m({ ad: "Kazan dairesi (gazlı)", grup: "Otopark / teknik", yontem: "KAZAN", akustik: "ENDUSTRIYEL", not: "Doğal gazlı kazan dairesinde alt / üst menfez ölçüleri gaz dağıtım şirketinin teknik şartnamesine göre de kontrol edilmelidir." }),

  DIGER: m({ ad: "Diğer (hava değişimiyle)", grup: "Diğer", yontem: "HAVA_DEGISIMI", ach: 2, akustik: "STANDART" }),
} as const satisfies Record<string, MahalTanimi>;
export type MahalTipi = keyof typeof MAHAL_TIPLERI;

export const MAHAL_GRUPLARI = ["Konut", "Ofis", "Ticari", "Yeme-içme", "Konaklama", "Sağlık / eğitim", "Spor / eğlence / ibadet", "Islak hacim / servis", "Endüstri", "Otopark / teknik", "Diğer"] as const;

// TS EN 16798-1 (konut dışı): kişi başı ve alan başı debiler (l/s), kategori × bina kirlilik sınıfı
export const EN_KATEGORI = {
  I: { ad: "Kategori I (yüksek beklenti)", kisi: 10, alan: { COK_DUSUK: 0.5, DUSUK: 1.0, YUKSEK: 2.0 }, konutKisi: 10, konutAlan: 0.49, islak: 1.4 },
  II: { ad: "Kategori II (normal, yeni bina)", kisi: 7, alan: { COK_DUSUK: 0.35, DUSUK: 0.7, YUKSEK: 1.4 }, konutKisi: 7, konutAlan: 0.42, islak: 1.0 },
  III: { ad: "Kategori III (orta, mevcut bina)", kisi: 4, alan: { COK_DUSUK: 0.2, DUSUK: 0.4, YUKSEK: 0.8 }, konutKisi: 4, konutAlan: 0.35, islak: 0.7 },
} as const;
export type Kategori = keyof typeof EN_KATEGORI;
export type Kirlilik = "COK_DUSUK" | "DUSUK" | "YUKSEK";
export const KIRLILIK: Record<Kirlilik, string> = {
  COK_DUSUK: "Çok düşük kirletici (doğal malzeme, sertifikalı düşük emisyon)",
  DUSUK: "Düşük kirletici (yeni yapı, standart malzeme)",
  YUKSEK: "Düşük kirletici değil (eski / kirletici malzeme)",
};

// Ticari mutfak davlumbazı — en az egzoz debisi, L/s per m davlumbaz (ASHRAE 154 / IMC 507:
// duvar tipi 200/300/400/550, tek ada 400/500/600/700, çift ada 250/300/400/550 cfm/ft)
export const DAVLUMBAZ_TIPLERI = {
  DUVAR: { ad: "Duvar tipi (kanopi)", yuk: { HAFIF: 310, ORTA: 465, AGIR: 620, COK_AGIR: 850 } },
  ADA_TEK: { ad: "Ada tipi (tek sıra)", yuk: { HAFIF: 620, ORTA: 775, AGIR: 930, COK_AGIR: 1085 } },
  ADA_CIFT: { ad: "Ada tipi (çift sıra, sırt sırta)", yuk: { HAFIF: 387, ORTA: 465, AGIR: 620, COK_AGIR: 850 } },
} as const;
export type DavlumbazTipi = keyof typeof DAVLUMBAZ_TIPLERI;
export type PisirmeYuku = "HAFIF" | "ORTA" | "AGIR" | "COK_AGIR";
export const PISIRME_YUKLERI: Record<PisirmeYuku, string> = {
  HAFIF: "Hafif (fırın, buharlı pişirici, benmari)",
  ORTA: "Orta (ocak, fritöz, tava, makarna kazanı)",
  AGIR: "Ağır (gazlı ızgara, döner, wok)",
  COK_AGIR: "Çok ağır (odun / kömür ateşi, mangal)",
};

// --- Santral (hava işleme) tipleri ---------------------------------------------
// ic: santral iç basınç kayıpları (Pa, tasarım = ortalama kirli filtre), verim: duyulur ısı geri kazanımı
export type SantralTipi = "AHU_PLAKA" | "AHU_ROTOR" | "AHU_ARA" | "TICARI_HRV" | "KONUT_HRV" | "TAZE_HAVA" | "EGZOZ" | "MUTFAK" | "OTOPARK";
export const SANTRAL_TIPLERI: Record<
  SantralTipi,
  { ad: string; besleme: boolean; egzoz: boolean; hr: boolean; verim: number; nemVerim: number; akustik: Akustik; aciklama: string }
> = {
  AHU_PLAKA: {
    ad: "Isı geri kazanımlı santral — plakalı (karşı akışlı)",
    besleme: true,
    egzoz: true,
    hr: true,
    verim: 78,
    nemVerim: 0,
    akustik: "STANDART",
    aciklama: "Taze ve egzoz havası birbirine karışmaz; hastane, laboratuvar ve kokulu egzozda tercih edilir. -5 °C altında donma koruması (ön ısıtıcı / by-pass) gerekir.",
  },
  AHU_ROTOR: {
    ad: "Isı geri kazanımlı santral — rotorlu (döner tamburlu)",
    besleme: true,
    egzoz: true,
    hr: true,
    verim: 80,
    nemVerim: 70,
    akustik: "STANDART",
    aciklama: "Nemi de geri kazanır (higroskopik rotor), donmaya dayanıklıdır; az miktarda egzoz havası taşınabilir, mutfak / WC egzozunda kullanılmaz.",
  },
  AHU_ARA: {
    ad: "Isı geri kazanımlı santral — ara akışkanlı (run-around)",
    besleme: true,
    egzoz: true,
    hr: true,
    verim: 60,
    nemVerim: 0,
    akustik: "STANDART",
    aciklama: "Besleme ve egzoz santralleri birbirinden uzaksa; verimi düşüktür (ErP alt sınırı %68).",
  },
  TICARI_HRV: {
    ad: "Kompakt ısı geri kazanım cihazı (tavan tipi, ticari)",
    besleme: true,
    egzoz: true,
    hr: true,
    verim: 78,
    nemVerim: 0,
    akustik: "STANDART",
    aciklama: "250–2.500 m³/h; asma tavana ya da teknik hacme asılan kompakt cihaz (karşı akışlı plakalı eşanjör, ePM1 filtre, EC fan, by-pass). Dükkân, kuaför, küçük ofis, klinik, restoran salonu gibi tek bölümlü işletmeler için santral yerine kullanılır.",
  },
  KONUT_HRV: {
    ad: "Konut tipi ısı geri kazanımlı havalandırma cihazı (HRV / ERV)",
    besleme: true,
    egzoz: true,
    hr: true,
    verim: 85,
    nemVerim: 0,
    akustik: "SESSIZ",
    aciklama: "Daire / villa için kompakt cihaz; yaşam ve yatak odalarına besleme, mutfak / banyo / WC'den emiş.",
  },
  TAZE_HAVA: {
    ad: "Taze hava santrali (ısı geri kazanımsız)",
    besleme: true,
    egzoz: false,
    hr: false,
    verim: 0,
    nemVerim: 0,
    akustik: "STANDART",
    aciklama: "Yalnız besleme; egzoz ayrı fanla ya da doğal yoldan. Dış hava yükünün tamamı bataryaya biner.",
  },
  EGZOZ: {
    ad: "Egzoz fanı (kanal tipi / çatı tipi)",
    besleme: false,
    egzoz: true,
    hr: false,
    verim: 0,
    nemVerim: 0,
    akustik: "STANDART",
    aciklama: "WC, depo, teknik mahal egzozu; telafi havası komşu hacimlerden ya da menfezden gelir.",
  },
  MUTFAK: {
    ad: "Mutfak egzoz fanı + telafi havası santrali",
    besleme: true,
    egzoz: true,
    hr: false,
    verim: 0,
    nemVerim: 0,
    akustik: "ENDUSTRIYEL",
    aciklama: "Davlumbaz egzozu yağlı olduğu için ısı geri kazanımı yapılmaz; telafi havası egzozun ≈ %85'i kadar şartlandırılarak verilir (mutfak hafif negatif basınçta).",
  },
  OTOPARK: {
    ad: "Otopark egzoz / duman tahliye fanları (F300 / F400)",
    besleme: true,
    egzoz: true,
    hr: false,
    verim: 0,
    nemVerim: 0,
    akustik: "ENDUSTRIYEL",
    aciklama: "İki hızlı egzoz fanları (normal havalandırma / yangın), jet fanlar ve taze hava (mekanik ya da rampa üzerinden doğal).",
  },
};

// Kanal hız sınırları (m/s) — EN 16798-3 / tipik tasarım: ana kanal, branşman, mahal bağlantısı
export const HIZ_SINIRLARI: Record<Akustik, { ad: string; ana: number; brans: number; son: number; menfezDebi: number }> = {
  SESSIZ: { ad: "Sessiz (konut, otel, toplantı, derslik)", ana: 4, brans: 3, son: 2, menfezDebi: 200 },
  STANDART: { ad: "Standart (ofis, mağaza, restoran)", ana: 6, brans: 4.5, son: 3, menfezDebi: 400 },
  ENDUSTRIYEL: { ad: "Endüstriyel (otopark, atölye, teknik)", ana: 10, brans: 8, son: 6, menfezDebi: 1200 },
};
// Mutfak yağlı egzoz kanalında yağın çökmemesi için en az ≈ 7,5 m/s, en çok ≈ 10 m/s
export const MUTFAK_KANAL_HIZI = { min: 7.5, maks: 10 };

// Standart dairesel (spiral) kanal çapları (mm)
export const DAIRESEL_CAPLAR = [100, 125, 160, 200, 250, 315, 355, 400, 450, 500, 560, 630, 710, 800, 900, 1000, 1120, 1250, 1400, 1600];

// Santral iç basınç kayıpları (Pa, tasarım = temiz ve kirli filtre ortalaması) [EN3 / üretici tipik]
export const SANTRAL_IC_KAYIP = {
  disHavaPanjur: 30, // dış hava emiş / atış panjuru + kanal girişi
  filtreOn: 100, // ePM10 ≥ %50 (M5) ön filtre
  filtreInce: 140, // ePM1 ≥ %50 (F7) ince filtre
  plaka: 200, // karşı akışlı plakalı eşanjör (her iki taraf)
  rotor: 130,
  ara: 120,
  konutCihaz: 150, // kompakt HRV iç kayıplar (eşanjör + G4/F7 filtre)
  ticariCihaz: 220, // tavan tipi kompakt IGK cihazı iç kayıplar (eşanjör + ePM10 / ePM1 filtre, ortalama kirlilik)
  isitici: 40,
  sogutucu: 110, // ıslak serpantin + damla tutucu
  fanEtkisi: 30,
  susturucu: 40, // santral sonrası kanal susturucusu (her hat)
  yagFiltresi: 0, // mutfakta davlumbaz uç kaybında
};

// Uç eleman basınç kayıpları (Pa)
export const UC_KAYIP = {
  besleme: 25, // kare / lineer difüzör + plenum + kısa esnek kanal
  beslemeSessiz: 20,
  egzoz: 20, // emiş menfezi / disk valf
  wcValf: 40, // WC disk valfi (ayarlı)
  davlumbaz: 120, // davlumbaz + labirent yağ filtresi (ortalama)
  izgara: 30, // otopark / teknik kanal ızgarası
  regulator: 50, // CAV / VAV debi regülatörü (en az çalışma basıncı)
  yanginDamperi: 15,
};

// SFP sınıfları (EN 16798-3), W/(m³/s)
export const SFP_SINIFLARI: [string, number][] = [
  ["SFP 1", 500],
  ["SFP 2", 750],
  ["SFP 3", 1250],
  ["SFP 4", 2000],
  ["SFP 5", 3000],
  ["SFP 6", 4500],
  ["SFP 7", Infinity],
];

// Santral nominal kademeleri (m³/h) — markadan bağımsız tipik seri
export const SANTRAL_KADEMELERI = [1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7000, 8000, 10000, 12000, 14000, 16000, 18000, 20000, 25000, 30000, 35000, 40000, 50000, 60000];
export const KONUT_HRV_KADEMELERI = [150, 200, 250, 300, 350, 450, 550, 650, 800, 1000];
export const TICARI_HRV_KADEMELERI = [250, 350, 500, 650, 800, 1000, 1300, 1600, 2000, 2500];
// Fan (egzoz / telafi / otopark) kademeleri (m³/h)
export const FAN_KADEMELERI = [150, 250, 350, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000, 12000, 15000, 20000, 25000, 30000, 40000, 50000, 60000, 80000, 100000];

export function standartUst(liste: number[], deger: number) {
  return liste.find((x) => x >= deger - 1e-9) ?? liste[liste.length - 1];
}
