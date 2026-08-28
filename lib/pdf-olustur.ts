import { jsPDF } from "jspdf";

// Türkçe Karakterleri PDF Standartına Dönüştürücü (0klim, ERS0N hatalarını engeller)
function turkceTemizle(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/İ/g, "I")
    .replace(/ı/g, "i")
    .replace(/Ş/g, "S")
    .replace(/ş/g, "s")
    .replace(/Ğ/g, "G")
    .replace(/ğ/g, "g")
    .replace(/Ü/g, "U")
    .replace(/ü/g, "u")
    .replace(/Ö/g, "O")
    .replace(/ö/g, "o")
    .replace(/Ç/g, "C")
    .replace(/ç/g, "c");
}

export async function teklifPdfOlustur(teklif: any, sirket: any): Promise<Buffer> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pb = teklif.paraBirimi === "EUR" ? "EUR" : teklif.paraBirimi === "USD" ? "USD" : "TL";

  // 1. Şirket Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 118, 110); // #0f766e
  doc.text(turkceTemizle(sirket.unvan || "IKLIM OFISI MUHENDISLIK A.S."), 15, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  if (sirket.slogan) doc.text(turkceTemizle(sirket.slogan), 15, 24);
  if (sirket.adres) doc.text(turkceTemizle(sirket.adres), 15, 29, { maxWidth: 110 });

  const iletisimMetin = `${turkceTemizle(sirket.email || "")} ${sirket.telefon ? " | " + turkceTemizle(sirket.telefon) : ""}`;
  doc.text(iletisimMetin, 15, 38);

  // Sağ Üst Teklif Kodu
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("TEKLIF", 195, 20, { align: "right" });

  doc.setFontSize(9);
  doc.setTextColor(15, 118, 110);
  const teklifKodu = `IKL-${new Date(teklif.tarih).getFullYear()}-${String(teklif.teklifNo).padStart(5, "0")}`;
  doc.text(teklifKodu, 195, 27, { align: "right" });

  // Çizgi
  doc.setDrawColor(203, 213, 225);
  doc.line(15, 42, 195, 42);

  // 2. Müşteri & Tarih Bilgileri
  let y = 50;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("MUSTERI / FIRMA", 15, y);

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(turkceTemizle(teklif.musteri.ad || ""), 15, y + 5);

  const hitapAd = teklif.yetkiliAdi || teklif.musteri.yetkiliAdi;
  if (hitapAd) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(15, 118, 110);
    doc.text(`Yetkili: ${turkceTemizle(hitapAd)}`, 15, y + 11);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("TEKLIF TARIHI", 195, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(new Date(teklif.tarih).toISOString().slice(0, 10), 195, y + 5, { align: "right" });

  y += 20;

  // 3. Tablo Başlığı
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y, 180, 7, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  doc.text("Aciklama", 18, y + 4.8);
  doc.text("Adet", 120, y + 4.8, { align: "center" });

  if (teklif.birimFiyatGoster) {
    doc.text("Birim Fiyat", 155, y + 4.8, { align: "right" });
    doc.text("Tutar", 192, y + 4.8, { align: "right" });
  }

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  // 4. Tablo Satırları (Çakışmaları Engellemek İçin Otomatik Satır Kaydırma)
  for (const k of teklif.kalemler) {
    const netBirim = k.birimFiyat * (1 - (k.iskontoYuzde || 0) / 100);
    const tutar = k.adet * netBirim;
    const aciklamaMetin = turkceTemizle(k.aciklama || "");

    // Uzun ürün açıklamasını 95mm genişliğe sığdırır, taşarsa alt satıra geçer
    const splitAciklama = doc.splitTextToSize(aciklamaMetin, 95);
    const lineCount = splitAciklama.length;

    doc.text(splitAciklama, 18, y);
    doc.text(String(k.adet || 1), 120, y, { align: "center" });

    if (teklif.birimFiyatGoster) {
      doc.text(`${netBirim.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${pb}`, 155, y, { align: "right" });
      doc.text(`${tutar.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${pb}`, 192, y, { align: "right" });
    }

    y += Math.max(6 * lineCount, 8);

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(15, y, 195, y);
  y += 6;

  // 5. Dip Toplamlar
  const girilenToplam = teklif.kalemler.reduce((a: number, k: any) => a + k.adet * k.birimFiyat * (1 - (k.iskontoYuzde || 0) / 100), 0);
  const araToplam = teklif.kdvDahil ? girilenToplam / (1 + teklif.kdvOrani / 100) : girilenToplam;
  const kdv = teklif.kdvDahil ? girilenToplam - araToplam : araToplam * (teklif.kdvOrani / 100);
  const genelToplam = teklif.kdvDahil ? girilenToplam : araToplam + kdv;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);

  doc.text(`Ara Toplam: ${araToplam.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${pb}`, 192, y, { align: "right" });
  y += 5;
  doc.text(`KDV (%${teklif.kdvOrani}): ${kdv.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${pb}`, 192, y, { align: "right" });
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 118, 110);
  doc.text(`GENEL TOPLAM: ${genelToplam.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${pb}`, 192, y, { align: "right" });

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}