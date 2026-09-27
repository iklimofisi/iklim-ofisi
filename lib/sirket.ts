import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type SirketAyarlari = {
  unvan: string;
  slogan: string | null;
  adres: string | null;
  telefon: string | null;
  email: string | null;
  web: string | null;
  vergiDairesi: string | null;
  vergiNo: string | null;
  whatsapp: string | null;
};

const VARSAYILAN: SirketAyarlari = {
  unvan: "İklim Ofisi Mühendislik A.Ş.",
  slogan: "İklimlendirme & VRF Sistem Çözümleri",
  adres: "Atatürk Mah. Sanayi Cad. No:142/A, Ümraniye / İstanbul",
  telefon: "+90 (216) 450 00 00",
  email: "info@iklimofisi.com",
  web: "www.iklimofisi.com",
  vergiDairesi: null,
  vergiNo: null,
  whatsapp: null,
};

const ALANLAR = {
  unvan: true,
  slogan: true,
  adres: true,
  telefon: true,
  email: true,
  web: true,
  vergiDairesi: true,
  vergiNo: true,
} as const;

async function veritabanindanOku(): Promise<SirketAyarlari> {
  let ayarlar: SirketAyarlari | null = null;
  try {
    ayarlar = await prisma.sirketAyarlari.findUnique({
      where: { id: "default" },
      select: { ...ALANLAR, whatsapp: true },
    });
  } catch (hata) {
    // Veritabanına "whatsapp" sütunu henüz eklenmediyse site çökmesin:
    // eski alanlarla devam et.
    console.warn("[sirket] ayarlar tam okunamadı, eski alanlarla devam:", hata instanceof Error ? hata.message : hata);
    const eski = await prisma.sirketAyarlari.findUnique({ where: { id: "default" }, select: ALANLAR });
    ayarlar = eski ? { ...eski, whatsapp: null } : null;
  }

  // Veritabanı henüz boşsa varsayılan dön
  return ayarlar ?? VARSAYILAN;
}

// Şirket bilgileri her sayfada (alt bilgi, iletişim, teklif) kullanılır. Her ziyarette
// veritabanına gitmemek için 1 saatliğine önbellekte tutulur; panelde şirket bilgileri
// kaydedilince önbellek hemen yenilenir (revalidateTag("sirket-ayarlari")).
export const SIRKET_ETIKETI = "sirket-ayarlari";

export const getSirketAyarlari = unstable_cache(veritabanindanOku, ["sirket-ayarlari-v1"], {
  tags: [SIRKET_ETIKETI],
  revalidate: 3600,
});
