import PDFDocument from "pdfkit";

export async function teklifPdfOlustur(teklif: any, sirket: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const pb = teklif.paraBirimi === "EUR" ? "EUR" : teklif.paraBirimi === "USD" ? "USD" : "TL";

      // 1. Şirket Header
      doc.fontSize(15).font("Helvetica-Bold").fillColor("#0f766e").text(sirket.unvan || "İklim Ofisi Mühendislik A.Ş.", 40, 40);
      doc.fontSize(8).font("Helvetica").fillColor("#475569").text(sirket.slogan || "İklimlendirme & VRF Sistem Çözümleri", 40, 58);
      if (sirket.adres) doc.text(sirket.adres, 40, 70, { width: 300 });
      doc.text(`${sirket.email || ""} ${sirket.telefon ? "· " + sirket.telefon : ""}`, 40, sirket.adres ? 92 : 70);

      // Sağ Üst Teklif Başlığı
      doc.fontSize(20).font("Helvetica-Bold").fillColor("#0f172a").text("TEKLIF", 400, 40, { align: "right" });
      doc.fontSize(10).font("Helvetica").fillColor("#0f766e").text(`IKL-${new Date(teklif.tarih).getFullYear()}-${String(teklif.teklifNo).padStart(5, "0")}`, 400, 65, { align: "right" });

      doc.moveTo(40, 110).lineTo(550, 110).strokeColor("#cbd5e1").stroke();

      // 2. Müşteri & Tarih Bilgileri
      let y = 125;
      doc.fontSize(8).font("Helvetica-Bold").fillColor("#64748b").text("MUSTERI / FIRMA", 40, y);
      doc.fontSize(11).font("Helvetica-Bold").fillColor("#0f172a").text(teklif.musteri.ad, 40, y + 12);

      const hitapAd = teklif.yetkiliAdi || teklif.musteri.yetkiliAdi;
      if (hitapAd) {
        doc.fontSize(8).font("Helvetica").fillColor("#0f766e").text(`Yetkili: ${hitapAd}`, 40, y + 26);
      }

      doc.fontSize(8).font("Helvetica-Bold").fillColor("#64748b").text("TEKLIF TARIHI", 400, y, { align: "right" });
      doc.fontSize(9).font("Helvetica").fillColor("#0f172a").text(new Date(teklif.tarih).toISOString().slice(0, 10), 400, y + 12, { align: "right" });

      y += 48;

      // 3. Kalemler Tablo Başlığı
      doc.fillColor("#f1f5f9").rect(40, y, 510, 20).fill();
      doc.fillColor("#334155").fontSize(8).font("Helvetica-Bold");
      doc.text("Aciklama", 48, y + 5);
      doc.text("Adet", 340, y + 5, { width: 40, align: "center" });

      if (teklif.birimFiyatGoster) {
        doc.text("Birim Fiyat", 390, y + 5, { width: 70, align: "right" });
        doc.text("Tutar", 470, y + 5, { width: 70, align: "right" });
      }

      y += 24;
      doc.font("Helvetica").fontSize(8).fillColor("#1e293b");

      // 4. Tablo Satırları
      for (const k of teklif.kalemler) {
        const netBirim = k.birimFiyat * (1 - k.iskontoYuzde / 100);
        const tutar = k.adet * netBirim;

        doc.text(k.aciklama, 48, y, { width: 280 });
        doc.text(String(k.adet), 340, y, { width: 40, align: "center" });

        if (teklif.birimFiyatGoster) {
          doc.text(`${netBirim.toFixed(2)} ${pb}`, 390, y, { width: 70, align: "right" });
          doc.text(`${tutar.toFixed(2)} ${pb}`, 470, y, { width: 70, align: "right" });
        }

        y += 18;

        if (y > 720) {
          doc.addPage();
          y = 40;
        }
      }

      doc.moveTo(40, y + 5).lineTo(550, y + 5).strokeColor("#cbd5e1").stroke();
      y += 16;

      // 5. Dip Toplamlar
      const girilenToplam = teklif.kalemler.reduce((a: number, k: any) => a + k.adet * k.birimFiyat * (1 - k.iskontoYuzde / 100), 0);
      const araToplam = teklif.kdvDahil ? girilenToplam / (1 + teklif.kdvOrani / 100) : girilenToplam;
      const kdv = teklif.kdvDahil ? girilenToplam - araToplam : araToplam * (teklif.kdvOrani / 100);
      const genelToplam = teklif.kdvDahil ? girilenToplam : araToplam + kdv;

      doc.font("Helvetica").fontSize(8).fillColor("#64748b");
      doc.text("Ara Toplam:", 340, y, { width: 110, align: "right" });
      doc.text(`${araToplam.toFixed(2)} ${pb}`, 460, y, { width: 80, align: "right" });
      y += 14;

      doc.text(`KDV (%${teklif.kdvOrani}):`, 340, y, { width: 110, align: "right" });
      doc.text(`${kdv.toFixed(2)} ${pb}`, 460, y, { width: 80, align: "right" });
      y += 16;

      doc.font("Helvetica-Bold").fontSize(11).fillColor("#0f766e");
      doc.text("GENEL TOPLAM:", 320, y, { width: 130, align: "right" });
      doc.text(`${genelToplam.toFixed(2)} ${pb}`, 460, y, { width: 80, align: "right" });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}