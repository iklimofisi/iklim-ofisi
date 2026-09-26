"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { epostaGonder } from "@/lib/eposta"; // BİLDİRİM MAİL SERVİSİ

const EN_FAZLA_DOSYA_MB = 4; // Vercel'de bir istek en fazla ~4,5 MB olabilir
const IZINLI_UZANTILAR = [".pdf", ".dwg", ".dxf", ".jpg", ".jpeg", ".png"];
const EN_KISA_SURE_MS = 2000; // Form bundan daha hızlı doldurulduysa büyük ihtimalle bottur

// E-postaya giden metinlerde HTML kodu çalışmasın
function htmlKacir(metin: string) {
  return metin
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function webTalebiOlustur(formData: FormData) {
  // --- Spam koruması ---
  // 1) Görünmez alan: gerçek ziyaretçiler bu alanı görmez ve doldurmaz, botlar doldurur.
  const tuzak = String(formData.get("firma_web_adresi") ?? "").trim();
  // 2) Süre kontrolü: form sayfası açıldıktan saniyeler içinde gönderildiyse bot kabul edilir.
  const acilis = Number(formData.get("form_acilis") ?? 0);
  const cokHizli = Number.isFinite(acilis) && acilis > 0 && Date.now() - acilis < EN_KISA_SURE_MS;
  if (tuzak || cokHizli) {
    // Bota hata gösterilmez; hiçbir şey kaydedilmeden "başarılı" sayfasına gider.
    redirect("/iletisim?basarili=true");
  }

  const ad = String(formData.get("ad") ?? "").trim().slice(0, 200);
  const telefon = String(formData.get("telefon") ?? "").trim().slice(0, 50);
  const email = String(formData.get("email") ?? "").trim().slice(0, 200);
  const mesaj = String(formData.get("mesaj") ?? "").trim().slice(0, 5000);
  const kvkk = formData.get("kvkk");
  const dosya = formData.get("dosya") as File | null;

  if (!ad || !mesaj) {
    redirect("/iletisim?hata=eksik-bilgi");
  }
  if (!telefon && !email) {
    redirect("/iletisim?hata=iletisim-yok");
  }
  if (!kvkk) {
    redirect("/iletisim?hata=kvkk");
  }

  let dosyaBuffer: Buffer | undefined;
  let dosyaAdi: string | undefined;
  let dosyaTipi: string | undefined;

  if (dosya && dosya.size > 0) {
    const uzanti = dosya.name.toLowerCase().slice(dosya.name.lastIndexOf("."));
    if (!IZINLI_UZANTILAR.includes(uzanti)) {
      redirect("/iletisim?hata=dosya-turu");
    }
    if (dosya.size > EN_FAZLA_DOSYA_MB * 1024 * 1024) {
      redirect("/iletisim?hata=dosya-boyutu");
    }
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
    konu: `🚨 YENİ MÜŞTERİ TALEBİ: ${ad.replace(/[\r\n]+/g, " ")}`,
    icerikHtml: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; color: #334155;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 25px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f766e; margin-top: 0;">🔔 Web Sitenizden Yeni İletişim / Keşif Talebi Geldi</h2>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
          
          <p style="margin: 8px 0;"><strong>Müşteri Ad Soyad:</strong> ${htmlKacir(ad)}</p>
          <p style="margin: 8px 0;"><strong>Telefon:</strong> ${telefon ? htmlKacir(telefon) : "Belirtilmedi"}</p>
          <p style="margin: 8px 0;"><strong>E-posta:</strong> ${email ? htmlKacir(email) : "Belirtilmedi"}</p>
          
          <p style="margin: 15px 0 5px 0;"><strong>Müşteri Mesajı / Proje Detayı:</strong></p>
          <div style="background: #f1f5f9; padding: 12px; border-left: 4px solid #0f766e; font-style: italic; border-radius: 4px;">
            ${htmlKacir(mesaj).replace(/\n/g, "<br />")}
          </div>

          ${dosyaAdi ? `<p style="margin-top: 15px; color: #2563eb;"><strong>📎 Eklenen Proje Dosyası:</strong> ${htmlKacir(dosyaAdi)}</p>` : ""}

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