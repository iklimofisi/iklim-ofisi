"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { epostaGonder } from "@/lib/eposta"; // BİLDİRİM MAİL SERVİSİ

export async function webTalebiOlustur(formData: FormData) {
  const ad = String(formData.get("ad") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const mesaj = String(formData.get("mesaj") ?? "").trim();
  const dosya = formData.get("dosya") as File | null;

  if (!ad || !mesaj) {
    redirect("/iletisim?hata=eksik-bilgi");
  }

  let dosyaBuffer: Buffer | undefined;
  let dosyaAdi: string | undefined;
  let dosyaTipi: string | undefined;

  if (dosya && dosya.size > 0) {
    dosyaBuffer = Buffer.from(await dosya.arrayBuffer());
    dosyaAdi = dosya.name;
    dosyaTipi = dosya.type || "application/octet-stream";
  }

  const talep = await prisma.webTalebi.create({
    data: {
      ad,
      telefon: telefon || null,
      email: email || null,
      mesaj,
      dosya: dosyaBuffer,
      dosyaAdi: dosyaAdi || null,
      dosyaTipi: dosyaTipi || null,
    },
  });

  // 📧 ANINDA YÖNETİCİYE VE ŞİRKET E-POSTASINA BİLDİRİM DÜŞER
  await epostaGonder({
    konu: `🚨 YENİ MÜŞTERİ TALEBİ: ${ad}`,
    icerikHtml: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; color: #334155;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 25px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f766e; margin-top: 0;">🔔 Web Sitenizden Yeni İletişim / Keşif Talebi Geldi</h2>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
          
          <p style="margin: 8px 0;"><strong>Müşteri Ad Soyad:</strong> ${ad}</p>
          <p style="margin: 8px 0;"><strong>Telefon:</strong> ${telefon || "Belirtilmedi"}</p>
          <p style="margin: 8px 0;"><strong>E-posta:</strong> ${email || "Belirtilmedi"}</p>
          
          <p style="margin: 15px 0 5px 0;"><strong>Müşteri Mesajı / Proje Detayı:</strong></p>
          <div style="background: #f1f5f9; padding: 12px; border-left: 4px solid #0f766e; font-style: italic; border-radius: 4px;">
            ${mesaj}
          </div>

          ${dosyaAdi ? `<p style="margin-top: 15px; color: #2563eb;"><strong>📎 Eklenen Proje Dosyası:</strong> ${dosyaAdi}</p>` : ""}

          <div style="margin-top: 25px; text-align: center;">
            <a href="https://iklimofisi.com/panel/talepler" style="background-color: #0f766e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
              Talebi ERP Panelinde Görüntüle →
            </a>
          </div>
        </div>
      </div>
    `,
  });

  revalidatePath("/panel/talepler");
  redirect("/iletisim?basarili=true");
}