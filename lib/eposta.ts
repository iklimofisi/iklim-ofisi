import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

// Her gönderim denemesi İşlem Geçmişi'ne yazılır (başarılı: "eposta",
// başarısız: "epostaHatasi"). Böylece "mail gitti mi?" sorusu panelden
// görülebilir. Kayıt yazılamazsa e-posta akışı bozulmaz.
export async function epostaKaydet(konu: string, alici: string, basarili: boolean, hata?: string) {
  try {
    await prisma.islemKaydi.create({
      data: {
        kullaniciAd: "Sistem",
        islem: basarili ? "eposta" : "epostaHatasi",
        veri: JSON.stringify({ konu: konu.slice(0, 200), alici, ...(hata ? { hata: hata.slice(0, 500) } : {}) }),
      },
    });
  } catch {
    // sessizce geç
  }
}

// Panelde gösterilecek ayar özeti (şifre GÖSTERİLMEZ)
export function epostaAyarOzeti() {
  const user = process.env.SMTP_USER || null;
  return {
    host: process.env.SMTP_HOST || null,
    port: Number(process.env.SMTP_PORT || 465),
    user,
    sifreVar: !!process.env.SMTP_PASS,
    // Web talepleri, keşif ve test e-postaları bu adrese gider
    bildirimAdresi: process.env.BILDIRIM_EMAIL || user || "info@iklimofisi.com",
  };
}

export async function epostaGonder({
  konu,
  icerikHtml,
  aliciEmail,
  replyTo,
  gonderenAd,
  ekler, // PDF DOSYA EKLERİ
}: {
  konu: string;
  icerikHtml: string;
  aliciEmail?: string;
  replyTo?: string;
  gonderenAd?: string;
  ekler?: Array<{ filename: string; content: Buffer }>;
}): Promise<{ basarili: boolean; hata?: string }> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const hedefEmail = aliciEmail || process.env.BILDIRIM_EMAIL || user || "info@iklimofisi.com";

  if (!host || !user || !pass) {
    const hataMesaji = "SMTP ayarları Vercel üzerinde henüz tanımlanmamış!";
    console.error(hataMesaji);
    await epostaKaydet(konu, hedefEmail, false, hataMesaji);
    return { basarili: false, hata: hataMesaji };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
      tls: { rejectUnauthorized: false },
    });

    const fromName = gonderenAd ? `"${gonderenAd} - İklim Ofisi"` : `"İklim Ofisi Mühendislik"`;

    await transporter.sendMail({
      from: `${fromName} <${user}>`,
      to: hedefEmail,
      replyTo: replyTo || user,
      subject: konu,
      html: icerikHtml,
      attachments: ekler ? ekler.map((e) => ({ filename: e.filename, content: e.content })) : [],
    });

    await epostaKaydet(konu, hedefEmail, true);
    return { basarili: true };
  } catch (error: any) {
    console.error("E-posta gönderim hatası:", error);
    const hata = error?.message || String(error);
    await epostaKaydet(konu, hedefEmail, false, hata);
    return { basarili: false, hata };
  }
}