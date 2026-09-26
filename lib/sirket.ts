import { prisma } from "@/lib/prisma";

const VARSAYILAN = {
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

export async function getSirketAyarlari() {
  let ayarlar;
  try {
    ayarlar = await prisma.sirketAyarlari.findUnique({
      where: { id: "default" },
    });
  } catch (hata) {
    // Veritabanına "whatsapp" sütunu henüz eklenmediyse site çökmesin:
    // eski alanlarla devam et.
    console.warn("[sirket] ayarlar tam okunamadı, eski alanlarla devam:", hata instanceof Error ? hata.message : hata);
    const eski = await prisma.sirketAyarlari.findUnique({
      where: { id: "default" },
      select: {
        unvan: true,
        slogan: true,
        adres: true,
        telefon: true,
        email: true,
        web: true,
        vergiDairesi: true,
        vergiNo: true,
      },
    });
    ayarlar = eski ? { ...eski, whatsapp: null } : null;
  }

  if (ayarlar) return ayarlar;

  // Veritabanı henüz boşsa varsayılan dön
  return VARSAYILAN;
}
