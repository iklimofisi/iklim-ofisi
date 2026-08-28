import nodemailer from "nodemailer";

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

    return { basarili: true };
  } catch (error: any) {
    console.error("E-posta gönderim hatası:", error);
    return { basarili: false, hata: error?.message || String(error) };
  }
}