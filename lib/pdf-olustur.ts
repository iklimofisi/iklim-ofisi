import { jsPDF } from "jspdf";

export async function teklifPdfOlustur(teklif: any, sirket: any): Promise<Buffer> {
  // A4 Boyutunda Saf JavaScript PDF Dökümanı
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pb = teklif.paraBirimi === "EUR" ? "EUR" : teklif.paraBirimi === "USD" ? "USD" : "TL";

  // 1. Şirket Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(15, 118, 110); // #0f766e
  doc.text(sirket.unvan || "Iklim Ofisi Muhendislik A.S.", 15, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  if (sirket.slogan) doc.text(sirket.slogan, 15, 26);
  if (sirket.adres) doc.text(sirket.adres, 15, 32);
  doc.text(`${sirket.email || ""} ${sirket.telefon ? " | " + sirket.telefon : ""}`, 15, 38);

  // Sağ Üst Teklif Kodu
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("TEKLIF", 195, 20, { align: "right" });

  doc.setFontSize(10);
  doc.setTextColor(15, 118, 110);
  const teklifKodu = `IKL-${new Date(teklif.tarih).getFullYear()}-${String(teklif.teklifNo).padStart(5, "0")}`;
  doc.text(teklifKodu, 195, 27, { align: "right" });

  // Çizgi
  doc.setDrawColor(203, 213, 225);
  doc.line(15, 43, 195, 43);

  // 2. Müşteri Bilgileri
  let y = 52;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("MUSTERI / FIRMA", 15, y);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(String(teklif.musteri.ad || ""), 15, y + 6);

  const hitapAd = teklif.yetkiliAdi || teklif.musteri.yetkiliAdi;
  if (hitapAd) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 118, 110);
    doc.text(`Yetkili: ${hitapAd}`, 15, y + 12);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("TEKLIF TARIHI", 195, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(new Date(teklif.tarih).toISOString().slice(0, 10), 195, y + 6, { align: "right" });

  y += 24;

  // 3. Tablo Başlığı
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y, 180, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text("Aciklama", 18, y + 5.5);
  doc.text("Adet", 125, y + 5.5, { align: "center" });

  if (teklif.birimFiyatGoster) {
    doc.text("Birim Fiyat", 155, y + 5.5, { align: "right" });
    doc.text("Tutar", 192, y + 5.5, { align: "right" });
  }

  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  // 4. Kalem Satırları
  for (const k of teklif.kalemler) {
    const netBirim = k.birimFiyat * (1 - (k.iskontoYuzde || 0) / 100);
    const tutar = k.adet * netBirim;

    doc.text(String(k.aciklama || ""), 18, y, { maxWidth: 100 });
    doc.text(String(k.adet || 1), 125, y, { align: "center" });

    if (teklif.birimFiyatGoster) {
      doc.text(`${netBirim.toFixed(2)} ${pb}`, 155, y, { align: "right" });
      doc.text(`${tutar.toFixed(2)} ${pb}`, 192, y, { align: "right" });
    }

    y += 8;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(15, y + 2, 195, y + 2);
  y += 8;

  // 5. Dip Toplamlar
  const girilenToplam = teklif.kalemler.reduce((a: number, k: any) => a + k.adet * k.birimFiyat * (1 - (k.iskontoYuzde || 0) / 100), 0);
  const araToplam = teklif.kdvDahil ? girilenToplam / (1 + teklif.kdvOrani / 100) : girilenToplam;
  const kdv = teklif.kdvDahil ? girilenToplam - araToplam : araToplam * (teklif.kdvOrani / 100);
  const genelToplam = teklif.kdvDahil ? girilenToplam : araToplam + kdv;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);

  doc.text(`Ara Toplam: ${araToplam.toFixed(2)} ${pb}`, 192, y, { align: "right" });
  y += 6;
  doc.text(`KDV (%${teklif.kdvOrani}): ${kdv.toFixed(2)} ${pb}`, 192, y, { align: "right" });
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 118, 110);
  doc.text(`GENEL TOPLAM: ${genelToplam.toFixed(2)} ${pb}`, 192, y, { align: "right" });

  // Node.js Buffer Olarak Dönen Sonuç
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}