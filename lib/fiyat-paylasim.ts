// -----------------------------------------------------------------------------
// MÜŞTERİYE GİDEN FİYAT LİSTESİ LİNKİ (iklimofisi.com/f/<anahtar>)
// Bu dosya "use server" DEĞİLDİR; yalnız sunucu sayfaları kullanır.
// Link herkese açıktır ama anahtar 24 karakterlik rastgele bir metindir, tahmin edilemez.
// Link listenin kendisine değil O ANKİ hâline bakar: panelde kaydedilen fiyat anında görünür.
// Alış fiyatı, kâr, tedarikçi gibi iç bilgiler ASLA okunmaz (PDF ile aynı bilgiler).
// -----------------------------------------------------------------------------
import { prisma } from "@/lib/prisma";

export const FIYAT_LINK_TABANI = "https://iklimofisi.com/f/";

const ANAHTAR_RE = /^[A-Za-z0-9_-]{20,40}$/;

// Geçerli (iptal edilmemiş) link ve listesi; yoksa null. Tablo henüz yoksa (SQL çalışmadıysa) null.
export async function paylasilanFiyatListesi(anahtar: string) {
  if (!ANAHTAR_RE.test(anahtar ?? "")) return null;
  const p = await prisma.fiyatListesiPaylasim
    .findUnique({
      where: { anahtar },
      select: {
        id: true,
        iptalTarihi: true,
        liste: {
          select: {
            id: true,
            baslik: true,
            aciklama: true,
            paraBirimi: true,
            kdvDahil: true,
            gecerlilikTarihi: true,
            updatedAt: true,
            _count: { select: { kalemler: true } },
          },
        },
      },
    })
    .catch(() => null);
  if (!p || p.iptalTarihi) return null;
  return { paylasimId: p.id, liste: p.liste };
}

// Açılış sayısı (panel kullanıcıları ve link önizleme botları sayılmaz; çağıran ayıklar)
export async function fiyatLinkiGoruntulendi(paylasimId: string) {
  await prisma.fiyatListesiPaylasim
    .update({ where: { id: paylasimId }, data: { goruntulenme: { increment: 1 }, sonGoruntulenme: new Date() } })
    .catch(() => null);
}
