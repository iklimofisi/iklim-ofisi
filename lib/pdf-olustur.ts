import { jsPDF } from "jspdf";
import { LIBERATION_SANS_NORMAL, LIBERATION_SANS_KALIN } from "@/lib/pdf-fontlari";
import { teklifToplamlari } from "@/lib/teklif-hesap";

// Türkçe karakterler (ş, ğ, ı, İ, ö, ü, ç) için PDF'e gömülen yazı tipi.
// Önceden bu harfler s, g, i... olarak değiştiriliyordu; artık olduğu gibi basılıyor.
const YAZI_TIPI = "LiberationSans";

function yaziTipiniYukle(doc: jsPDF) {
  doc.addFileToVFS("LiberationSans-Regular.ttf", LIBERATION_SANS_NORMAL);
  doc.addFont("LiberationSans-Regular.ttf", YAZI_TIPI, "normal");
  doc.addFileToVFS("LiberationSans-Bold.ttf", LIBERATION_SANS_KALIN);
  doc.addFont("LiberationSans-Bold.ttf", YAZI_TIPI, "bold");
}

// Metni PDF'e hazırlar. Yazı tipinde olmayan nadir işaretler (ör. ₺) okunur karşılığına çevrilir.
function metin(str: string | null | undefined): string {
  if (!str) return "";
  return String(str).replace(/₺/g, "TL").replace(/\t/g, " ");
}

const trTarih = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Istanbul",
});

export async function teklifPdfOlustur(teklif: any, sirket: any): Promise<Buffer> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  yaziTipiniYukle(doc);
  const pb = teklif.paraBirimi === "EUR" ? "EUR" : teklif.paraBirimi === "USD" ? "USD" : "TL";

  // 1. Şirket Header
  doc.setFont(YAZI_TIPI, "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 118, 110); // #0f766e
  doc.text(metin(sirket.unvan || "İklim Ofisi Mühendislik A.Ş."), 15, 18);

  doc.setFont(YAZI_TIPI, "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  if (sirket.slogan) doc.text(metin(sirket.slogan), 15, 24);
  if (sirket.adres) doc.text(metin(sirket.adres), 15, 29, { maxWidth: 110 });

  const iletisimMetin = [sirket.email, sirket.telefon].filter(Boolean).map((x: string) => metin(x)).join("  |  ");
  doc.text(iletisimMetin, 15, 38);

  // Sağ Üst Teklif Kodu
  doc.setFont(YAZI_TIPI, "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("TEKLİF", 195, 20, { align: "right" });

  doc.setFontSize(9);
  doc.setTextColor(15, 118, 110);
  // Teklif kodu ilk hazırlanma yılına göre sabit kalır (revizyonda değişmez)
  const teklifKodu = `IKL-${new Date(teklif.ilkTarih ?? teklif.tarih).getFullYear()}-${String(teklif.teklifNo).padStart(5, "0")}`;
  doc.text(teklifKodu, 195, 27, { align: "right" });

  // Çizgi
  doc.setDrawColor(203, 213, 225);
  doc.line(15, 42, 195, 42);

  // 2. Müşteri & Tarih Bilgileri
  let y = 50;
  doc.setFont(YAZI_TIPI, "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("MÜŞTERİ / FİRMA", 15, y);

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(metin(teklif.musteri.ad || ""), 15, y + 5);

  const hitapAd = teklif.yetkili?.ad || teklif.yetkiliAdi || teklif.musteri.yetkiliAdi;
  if (hitapAd) {
    doc.setFont(YAZI_TIPI, "normal");
    doc.setFontSize(8);
    doc.setTextColor(15, 118, 110);
    doc.text(`Yetkili: ${metin(hitapAd)}`, 15, y + 11);
  }

  doc.setFont(YAZI_TIPI, "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("TEKLİF TARİHİ", 195, y, { align: "right" });
  doc.setFont(YAZI_TIPI, "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(trTarih.format(new Date(teklif.tarih)), 195, y + 5, { align: "right" });

  y += 20;

  // 3. Tablo Başlığı
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y, 180, 7, "F");

  doc.setFont(YAZI_TIPI, "bold");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  doc.text("Açıklama", 18, y + 4.8);
  doc.text("Adet", 120, y + 4.8, { align: "center" });

  if (teklif.birimFiyatGoster) {
    doc.text("Birim Fiyat", 155, y + 4.8, { align: "right" });
    doc.text("Tutar", 192, y + 4.8, { align: "right" });
  }

  y += 10;
  doc.setFont(YAZI_TIPI, "normal");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  // 4. Tablo Satırları (Çakışmaları Engellemek İçin Otomatik Satır Kaydırma)
  for (const k of teklif.kalemler) {
    const netBirim = k.birimFiyat * (1 - (k.iskontoYuzde || 0) / 100);
    const tutar = k.adet * netBirim;
    const aciklamaMetin = metin(k.aciklama || "");

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
  // Tutarlar panel ve e-posta ile aynı formülle hesaplanır
  const { araToplam, kdvTutari: kdv, genelToplam } = teklifToplamlari(teklif);

  doc.setFont(YAZI_TIPI, "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);

  doc.text(`Ara Toplam: ${araToplam.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${pb}`, 192, y, { align: "right" });
  y += 5;
  doc.text(`KDV (%${teklif.kdvOrani}): ${kdv.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${pb}`, 192, y, { align: "right" });
  y += 7;

  doc.setFont(YAZI_TIPI, "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 118, 110);
  doc.text(`GENEL TOPLAM: ${genelToplam.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${pb}`, 192, y, { align: "right" });

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}