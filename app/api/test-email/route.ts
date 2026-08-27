import { epostaGonder } from "@/lib/eposta";
import { NextResponse } from "next/server";

export async function GET() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS ? "****** (Dolu)" : "TANIMLANMAMIŞ (Boş)";
  const hedef = process.env.BILDIRIM_EMAIL;

  const sonuc = await epostaGonder({
    konu: "🧪 İklim Ofisi - Canlı SMTP Test E-postası",
    icerikHtml: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #0f766e;">✅ E-Posta Bildirim Sistemi Çalışıyor!</h2>
        <p>Bu e-posta iklimofisi.com canlı sisteminden başarıyla gönderildi.</p>
      </div>
    `,
  });

  if (sonuc.basarili) {
    return NextResponse.json({
      durum: "BAŞARILI 🎉",
      mesaj: `Test e-postası başarıyla ${hedef || user} adresine gönderildi! Gelen kutunuza (veya Spam klasörüne) bakın.`,
      mevcutVercelAyarlari: { host, port, user, pass, hedef },
    });
  } else {
    return NextResponse.json({
      durum: "HATA ❌",
      hataNedeni: sonuc.hata,
      mevcutVercelAyarlari: { host, port, user, pass, hedef },
    }, { status: 500 });
  }
}