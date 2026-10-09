// -----------------------------------------------------------------------------
// MÜŞTERİYE GİDEN GİZLİ TEKLİF LİNKİ (iklimofisi.com/t/<anahtar>)
// Bu dosya "use server" DEĞİLDİR; yalnızca sunucu sayfaları kullanır.
// Link herkese açıktır ama anahtar 24 karakterlik rastgele bir metindir,
// tahmin edilemez. Maliyet dosyaları vb. iç bilgiler ASLA okunmaz.
// -----------------------------------------------------------------------------
import { prisma } from "@/lib/prisma";
import { epostaGonder } from "@/lib/eposta";

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
  ozelNotlar: true,
  musteriId: true,
  projeId: true,
  musteriOnayAdi: true,
  musteriOnayTarihi: true,
};

export const PANEL_ADRESI = "https://iklimofisi.com";

const htmlGuvenli = (m: string) => m.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const teklifKodu = (no: number) => `TKL-${String(no).padStart(4, "0")}`;

// Teklifi hazırlayan kişiye (yoksa şirketin bildirim adresine) kısa bilgi e-postası.
// Hata olursa sessizce geçer (müşterinin işlemi asla engellenmez); her deneme e-posta kaydına düşer.
export async function hazirlayanaBildir(
  teklif: { id: string; teklifNo: number; baslik: string; musteri: { ad: string }; olusturanKullanici?: { ad: string; email: string } | null },
  konu: string,
  satirlarHtml: string
) {
  try {
    const kod = teklifKodu(teklif.teklifNo);
    await epostaGonder({
      konu,
      aliciEmail: teklif.olusturanKullanici?.email || undefined,
      icerikHtml: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color:#334155">
          <p style="font-size:12px;color:#64748b;margin:0 0 4px">${kod} · ${htmlGuvenli(teklif.musteri.ad)}</p>
          <h2 style="color:#0f766e;margin:0 0 12px">${htmlGuvenli(teklif.baslik || kod)}</h2>
          ${satirlarHtml}
          <p style="margin-top:20px">
            <a href="${PANEL_ADRESI}/panel/teklifler/${teklif.id}" style="background:#0f766e;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:13px">Teklifi panelde aç</a>
          </p>
        </div>`,
    });
  } catch (hata) {
    console.warn("[paylasim] bildirim gönderilemedi:", hata instanceof Error ? hata.message : hata);
  }
}

export { htmlGuvenli };

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

// Görüntülenmeyi sayar. Müşteri linki ilk kez ya da 12 saatten uzun aradan sonra
// açtıysa { bildir: true } döner (hazırlayana "müşteri teklifi açtı" e-postası gider;
// aynı gün defalarca açınca e-posta yağmaz).
const BILDIRIM_ARASI = 12 * 60 * 60 * 1000;

export async function goruntulenmeKaydet(paylasimId: string): Promise<{ bildir: boolean; sayi: number }> {
  const simdi = new Date();
  const esik = new Date(simdi.getTime() - BILDIRIM_ARASI);
  // Koşullu güncelleme: aynı anda iki açılış olsa da yalnızca biri bildirim hakkı alır
  const ilk = await prisma.teklifPaylasim
    .updateMany({
      where: { id: paylasimId, OR: [{ sonGoruntulenme: null }, { sonGoruntulenme: { lt: esik } }] },
      data: { goruntulenme: { increment: 1 }, sonGoruntulenme: simdi },
    })
    .catch(() => null);
  if (!ilk?.count) {
    await prisma.teklifPaylasim
      .update({ where: { id: paylasimId }, data: { goruntulenme: { increment: 1 }, sonGoruntulenme: simdi } })
      .catch(() => null);
  }
  const son = await prisma.teklifPaylasim.findUnique({ where: { id: paylasimId }, select: { goruntulenme: true } }).catch(() => null);
  return { bildir: Boolean(ilk?.count), sayi: son?.goruntulenme ?? 0 };
}
