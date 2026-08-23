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

  if (!host || !user || !pass) {
    console.log("ℹ️ SMTP e-posta ayarları .env dosyasında henüz tanımlanmamış. Bildirim e-postası gönderilmedi.");
    return;
  }

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"İklim Ofisi Web Bildirim" <${user}>`,
      to: hedefEmail,
      subject: konu,
      html: icerikHtml,
    });

    console.log("✓ Bildirim e-postası başarıyla gönderildi:", hedefEmail);
  } catch (error) {
    console.error("✕ E-posta gönderim hatası:", error);
  }
}