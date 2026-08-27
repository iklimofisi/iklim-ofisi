import nodemailer from "nodemailer";

export async function epostaGonder({
  konu,
  icerikHtml,
}: {
  konu: string;
  icerikHtml: string;
}): Promise<{ basarili: boolean; hata?: string }> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const hedefEmail = process.env.BILDIRIM_EMAIL || user || "info@iklimofisi.com";

  if (!host || !user || !pass) {
    const hataMesaji = "SMTP ayarları (SMTP_HOST, SMTP_USER, SMTP_PASS) Vercel üzerinde henüz tanımlanmamış!";
    console.error(hataMesaji);
    return { basarili: false, hata: hataMesaji };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 için SSL, 587 için TLS
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
      tls: {
        rejectUnauthorized: false, // Vercel için sertifika kilitlenmelerini engeller
      },
    });

    await transporter.sendMail({
      from: `"İklim Ofisi Bildirim" <${user}>`,
      to: hedefEmail,
      subject: konu,
      html: icerikHtml,
    });

    return { basarili: true };
  } catch (error: any) {
    console.error("E-posta gönderim hatası:", error);
    return { basarili: false, hata: error?.message || String(error) };
  }
}