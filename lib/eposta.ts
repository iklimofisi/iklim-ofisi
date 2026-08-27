export async function epostaGonder({
  konu,
  icerikHtml,
}: {
  konu: string;
  icerikHtml: string;
}) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const hedefEmail = process.env.BILDIRIM_EMAIL || "info@iklimofisi.com";

  // Eğer SMTP ayarları Vercel / .env tarafında henüz yoksa sistemi kilitilemez, log basar
  if (!host || !user || !pass) {
    console.log("ℹ️ SMTP ayarları Vercel / .env dosyasında eksik. E-posta bildirimi atlandı.");
    return;
  }

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // Port 465 için SSL, 587 için TLS
      auth: { user, pass },
      connectionTimeout: 8000, // Vercel için 8 saniye zaman aşımı
      greetingTimeout: 5000,
      socketTimeout: 8000,
      tls: {
        rejectUnauthorized: false, // Sertifika kilitlenmelerini engeller
      },
    });

    await transporter.sendMail({
      from: `"İklim Ofisi Bildirim" <${user}>`,
      to: hedefEmail,
      subject: konu,
      html: icerikHtml,
    });

    console.log("✓ Bildirim e-postası başarıyla gönderildi:", hedefEmail);
  } catch (error) {
    console.error("✕ E-posta gönderim hatası:", error);
  }
}