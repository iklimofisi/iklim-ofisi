// -----------------------------------------------------------------------------
// MÜŞTERİYE GİDEN FİYAT LİSTESİ LİNKİ (iklimofisi.com/f/<anahtar>)
// Bu dosya "use server" DEĞİLDİR; yalnız sunucu sayfaları kullanır.
// Link okunabilir: listenin adı + 6 karakterlik rastgele kod (ör. /f/niva-hava-perdeleri-fiyat-listesi-k7m3qa).
// Kod sayesinde link tahmin edilemez ve her kişiye ayrıdır. Eski uzun linkler de çalışmaya devam eder.
// Link listenin kendisine değil O ANKİ hâline bakar: panelde kaydedilen fiyat anında görünür.
// Alış fiyatı, kâr, tedarikçi gibi iç bilgiler ASLA okunmaz (PDF ile aynı bilgiler).
// -----------------------------------------------------------------------------
import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { secimAnahtari } from "@/lib/fiyat-listesi";

export const FIYAT_LINK_TABANI = "https://iklimofisi.com/f/";

// Hem yeni okunabilir linkler hem eski 24 karakterlik linkler
const ANAHTAR_RE = /^[A-Za-z0-9_-]{6,120}$/;

// Liste adından adres parçası: "Niva Hava Perdeleri Fiyat Listesi" → "niva-hava-perdeleri-fiyat-listesi"
export function adresParcasi(baslik: string): string {
  const s = baslik
    .replace(/[ğĞ]/g, "g")
    .replace(/[üÜ]/g, "u")
    .replace(/[şŞ]/g, "s")
    .replace(/[ıİ]/g, "i")
    .replace(/[öÖ]/g, "o")
    .replace(/[çÇ]/g, "c")
    .replace(/[âÂ]/g, "a")
    .replace(/[îÎ]/g, "i")
    .replace(/[ûÛ]/g, "u")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!s) return "fiyat-listesi";
  if (s.length <= 60) return s;
  // Uzun adlar kelime sınırından kısaltılır
  const kisa = s.slice(0, 60);
  const son = kisa.lastIndexOf("-");
  return (son > 20 ? kisa.slice(0, son) : kisa).replace(/-+$/g, "");
}

// Karışmayan harf / rakamlarla (0-o, 1-l-i yok) 6 karakterlik kod
const KOD_HARFLERI = "abcdefghjkmnpqrstuvwxyz23456789";
export function linkAnahtari(baslik: string): string {
  let kod = "";
  for (let i = 0; i < 6; i++) kod += KOD_HARFLERI[randomInt(KOD_HARFLERI.length)];
  return `${adresParcasi(baslik)}-${kod}`;
}

// Geçerli (iptal edilmemiş) link ve listesi; yoksa null. Tablo henüz yoksa (SQL çalışmadıysa) null.
export async function paylasilanFiyatListesi(anahtar: string) {
  if (!ANAHTAR_RE.test(anahtar ?? "")) return null;
  const p = await prisma.fiyatListesiPaylasim
    .findUnique({
      where: { anahtar },
      select: {
        id: true,
        iptalTarihi: true,
        haric: true,
        liste: {
          select: {
            id: true,
            baslik: true,
            aciklama: true,
            paraBirimi: true,
            kdvDahil: true,
            gecerlilikTarihi: true,
            updatedAt: true,
            kalemler: { select: { bolum: true, ad: true, kod: true } },
          },
        },
      },
    })
    .catch(() => null);
  if (!p || p.iptalTarihi) return null;
  const haricAnahtarlar = haricOku(p.haric);
  const { kalemler, ...liste } = p.liste;
  const urunSayisi = kalemler.filter((k) => !haricAnahtarlar.has(secimAnahtari(k))).length;
  return { paylasimId: p.id, liste, haricAnahtarlar, urunSayisi };
}

// Linkte gösterilmeyen ürünlerin anahtarları (JSON dizi); bozuksa / boşsa hiçbiri
export function haricOku(v: string | null | undefined): Set<string> {
  if (!v) return new Set();
  try {
    const d = JSON.parse(v);
    return new Set(Array.isArray(d) ? d.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

// Açılış sayısı (panel kullanıcıları ve link önizleme botları sayılmaz; çağıran ayıklar)
export async function fiyatLinkiGoruntulendi(paylasimId: string) {
  await prisma.fiyatListesiPaylasim
    .update({ where: { id: paylasimId }, data: { goruntulenme: { increment: 1 }, sonGoruntulenme: new Date() } })
    .catch(() => null);
}
