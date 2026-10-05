// -----------------------------------------------------------------------------
// MÜŞTERİYE GİDEN GİZLİ TEKLİF LİNKİ (iklimofisi.com/t/<anahtar>)
// Bu dosya "use server" DEĞİLDİR; yalnızca sunucu sayfaları kullanır.
// Link herkese açıktır ama anahtar 24 karakterlik rastgele bir metindir,
// tahmin edilemez. Maliyet dosyaları vb. iç bilgiler ASLA okunmaz.
// -----------------------------------------------------------------------------
import { prisma } from "@/lib/prisma";

export const PAYLASIM_TABANI = "https://iklimofisi.com/t/";

const ANAHTAR_RE = /^[A-Za-z0-9_-]{20,40}$/;

// Teklif belgesi (sayfa + PDF) için gereken alanlar — e-postadaki PDF ile aynı
const BELGE_ALANLARI = {
  id: true,
  teklifNo: true,
  baslik: true,
  tarih: true,
  ilkTarih: true,
  durum: true,
  paraBirimi: true,
  kdvOrani: true,
  kdvDahil: true,
  gecerlilikGunu: true,
  birimFiyatGoster: true,
  revizyonNo: true,
  olusturanAdi: true,
  musteri: true,
  yetkili: true,
  proje: true,
  kalemler: { include: { marka: true }, orderBy: [{ sira: "asc" as const }, { id: "asc" as const }] },
  olusturanKullanici: { select: { ad: true, email: true, telefon: true } },
  revizyonlar: { select: { tarih: true } },
  sablonlar: { orderBy: { sira: "asc" as const } },
};

export async function paylasilanTeklif(anahtar: string) {
  if (!ANAHTAR_RE.test(anahtar)) return null;
  const paylasim = await prisma.teklifPaylasim
    .findUnique({ where: { anahtar }, select: { id: true, teklif: { select: BELGE_ALANLARI } } })
    .catch(() => null);
  return paylasim ? { paylasimId: paylasim.id, teklif: paylasim.teklif } : null;
}

// Panel içi önizleme / PDF için (giriş kontrolü çağıran yerde yapılır)
export async function belgeTeklifi(id: string) {
  return prisma.teklif.findUnique({ where: { id }, select: BELGE_ALANLARI });
}

// Link önizlemesi yapan botlar (WhatsApp, Telegram...) "görüntülendi" sayılmaz
export function onizlemeBotuMu(ua: string | null) {
  return /whatsapp|facebookexternalhit|facebot|telegrambot|slackbot|twitterbot|linkedinbot|discordbot|skypeuripreview|googlebot|bingbot|bot\b|crawler|spider|preview/i.test(
    ua ?? ""
  );
}

export async function goruntulenmeKaydet(paylasimId: string) {
  await prisma.teklifPaylasim
    .update({ where: { id: paylasimId }, data: { goruntulenme: { increment: 1 }, sonGoruntulenme: new Date() } })
    .catch(() => null);
}
