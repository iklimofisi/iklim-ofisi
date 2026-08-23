import { prisma } from "@/lib/prisma";

export async function getSirketAyarlari() {
  const ayarlar = await prisma.sirketAyarlari.findUnique({
    where: { id: "default" },
  });

  if (ayarlar) return ayarlar;

  // Veritabanı henüz boşsa varsayılan dön
  return {
    unvan: "İklim Ofisi Mühendislik A.Ş.",
    slogan: "İklimlendirme & VRF Sistem Çözümleri",
    adres: "Atatürk Mah. Sanayi Cad. No:142/A, Ümraniye / İstanbul",
    telefon: "+90 (216) 450 00 00",
    email: "info@iklimofisi.com",
    web: "www.iklimofisi.com",
    vergiDairesi: null,
    vergiNo: null,
  };
}