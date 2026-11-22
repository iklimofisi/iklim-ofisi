import { jsPDF } from "jspdf";
import { LIBERATION_SANS_NORMAL, LIBERATION_SANS_KALIN } from "@/lib/pdf-fontlari";
import { PDF_LOGO_JPEG_BASE64, PDF_LOGO_ORAN } from "@/lib/pdf-logo";
import { miktarYaz } from "@/lib/birimler";
import { sasNo, kalemNet } from "@/lib/satinalma-siparis";

// -----------------------------------------------------------------------------
// TEDARİKÇİYE GİDEN SATINALMA SİPARİŞİ PDF'İ
// logo + şirket bilgileri | SATINALMA SİPARİŞİ + no
// tedarikçi bilgileri | sipariş tarihi, beklenen teslim
// kalem tablosu (kod, açıklama, miktar, birim fiyat, iskonto, tutar), KDV hariç toplam
// notlar (ödeme / teslim şartları), siparişi veren + tedarikçi onayı (imza / kaşe)
// İç bilgiler (müşteri, satış siparişi, satış fiyatı, proje) BELGEYE YAZILMAZ.
// -----------------------------------------------------------------------------

const YAZI_TIPI = "LiberationSans";
type Renk = [number, number, number];
const METIN: Renk = [18, 33, 43];
const METIN_60: Renk = [113, 122, 128];
const METIN_50: Renk = [137, 144, 149];
const SOGUK_DIM: Renk = [11, 100, 108];
const HAT: Renk = [215, 224, 225];
const ZEMIN: Renk = [246, 251, 251];

const SOL = 15;
const SAG = 195;
const GENISLIK = SAG - SOL;
const UST = 15;
const ALT_SINIR = 280;

const trTarih = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" });

function metin(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/₺/g, "TL")
    .replace(/\t/g, " ")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "")
    .trim();
}

export type SasPdfVerisi = {
  no: number;
  baslik: string;
  paraBirimi: string;
  olusturmaTarihi: Date;
  beklenenTeslimTarihi: Date | null;
  notlar: string | null;
  olusturanAdi: string;
  tedarikci: { ad: string; telefon: string | null; vergiNo: string | null; adres: string | null; email: string | null };
  kalemler: { kod: string | null; aciklama: string; adet: number; birim: string; birimFiyat: number; iskontoYuzde: number }[];
};
export type SasPdfSirket = { unvan?: string | null; slogan?: string | null; adres?: string | null; telefon?: string | null; email?: string | null; vergiDairesi?: string | null; vergiNo?: string | null };

export function satinalmaSiparisPdf(s: SasPdfVerisi, sirket: SasPdfSirket): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.addFileToVFS("LiberationSans-Regular.ttf", LIBERATION_SANS_NORMAL);
  doc.addFont("LiberationSans-Regular.ttf", YAZI_TIPI, "normal");
  doc.addFileToVFS("LiberationSans-Bold.ttf", LIBERATION_SANS_KALIN);
  doc.addFont("LiberationSans-Bold.ttf", YAZI_TIPI, "bold");

  const pb = s.paraBirimi === "EUR" ? "€" : s.paraBirimi === "USD" ? "$" : "TL";
  const para = (n: number) => `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${pb}`;
  const yazi = (boyut: number, kalin: boolean, renk: Renk) => {
    doc.setFont(YAZI_TIPI, kalin ? "bold" : "normal");
    doc.setFontSize(boyut);
    doc.setTextColor(...renk);
  };
  const cizgi = (x1: number, y1: number, x2: number, y2: number, renk: Renk = HAT, k = 0.25) => {
    doc.setDrawColor(...renk);
    doc.setLineWidth(k);
    doc.line(x1, y1, x2, y2);
  };
  const etiket = (t: string, x: number, yy: number) => {
    yazi(6.5, true, METIN_50);
    doc.text(t.toLocaleUpperCase("tr-TR"), x, yy, { charSpace: 0.35 });
  };

  // 1. ÜST BİLGİ
  const logoY = 12;
  const logoH = 13;
  try {
    doc.addImage(PDF_LOGO_JPEG_BASE64, "JPEG", SOL, logoY, logoH * PDF_LOGO_ORAN, logoH, "ikl-logo", "FAST");
  } catch {
    // logo eklenemezse belge yine oluşur
  }
  const bx = SOL + logoH * PDF_LOGO_ORAN + 4;
  let sy = logoY + 4.5;
  yazi(12.5, true, METIN);
  doc.text(metin(sirket.unvan || "İklim Ofisi"), bx, sy);
  sy += 4.3;
  yazi(7.5, false, METIN_50);
  if (sirket.adres) {
    const a: string[] = doc.splitTextToSize(metin(sirket.adres), 100);
    doc.text(a, bx, sy);
    sy += 3.4 * a.length;
  }
  const iletisim = [sirket.email, sirket.telefon].filter(Boolean).map((x) => metin(x)).join(" · ");
  if (iletisim) {
    doc.text(iletisim, bx, sy);
    sy += 3.4;
  }
  const vergi = [sirket.vergiDairesi && `V.D.: ${metin(sirket.vergiDairesi)}`, sirket.vergiNo && `V.N.: ${metin(sirket.vergiNo)}`].filter(Boolean).join(" · ");
  if (vergi) {
    doc.text(vergi, bx, sy);
    sy += 3.4;
  }

  yazi(16, true, METIN);
  doc.text("SATINALMA SİPARİŞİ", SAG, logoY + 6, { align: "right" });
  yazi(9.5, true, SOGUK_DIM);
  doc.text(sasNo(s.no), SAG, logoY + 11.5, { align: "right" });

  let y = Math.max(sy, logoY + logoH) + 4;
  cizgi(SOL, y, SAG, y);
  y += 9;

  // 2. TEDARİKÇİ | SİPARİŞ BİLGİLERİ
  const ortaX = SOL + GENISLIK * 0.58;
  etiket("Tedarikçi", SOL, y);
  etiket("Sipariş bilgileri", ortaX, y);
  let ty = y + 5;
  yazi(10.5, true, METIN);
  const tAd: string[] = doc.splitTextToSize(metin(s.tedarikci.ad), ortaX - SOL - 6);
  doc.text(tAd, SOL, ty);
  ty += 4.6 * tAd.length;
  yazi(8, false, METIN_60);
  for (const satir of [
    s.tedarikci.adres,
    [s.tedarikci.telefon, s.tedarikci.email].filter(Boolean).join(" · "),
    s.tedarikci.vergiNo ? `V.N.: ${s.tedarikci.vergiNo}` : "",
  ]) {
    if (!satir) continue;
    const p: string[] = doc.splitTextToSize(metin(satir), ortaX - SOL - 6);
    doc.text(p, SOL, ty);
    ty += 3.8 * p.length;
  }
  let oy = y + 5;
  const bilgi = (ad: string, deger: string) => {
    yazi(8, false, METIN_60);
    doc.text(ad, ortaX, oy);
    yazi(8.5, true, METIN);
    doc.text(deger, SAG, oy, { align: "right" });
    oy += 4.6;
  };
  bilgi("Sipariş tarihi", trTarih.format(s.olusturmaTarihi));
  if (s.beklenenTeslimTarihi) bilgi("İstenen teslim tarihi", trTarih.format(s.beklenenTeslimTarihi));
  bilgi("Para birimi", s.paraBirimi);
  y = Math.max(ty, oy) + 5;

  // Konu
  if (s.baslik) {
    yazi(8, false, METIN_60);
    doc.text("Konu:", SOL, y);
    yazi(9, true, METIN);
    const k: string[] = doc.splitTextToSize(metin(s.baslik), GENISLIK - 12);
    doc.text(k, SOL + 11, y);
    y += 4.4 * k.length + 3;
  }

  // 3. KALEM TABLOSU
  const sut = { sira: SOL + 1.5, kod: SOL + 9, aciklama: SOL + 36, miktar: SOL + 112, fiyat: SOL + 137, isk: SOL + 150, tutar: SAG - 1.5 };
  const baslikSatiri = () => {
    doc.setFillColor(...ZEMIN);
    doc.rect(SOL, y - 4, GENISLIK, 6.5, "F");
    yazi(7, true, METIN_50);
    doc.text("#", sut.sira, y);
    doc.text("KOD", sut.kod, y);
    doc.text("AÇIKLAMA", sut.aciklama, y);
    doc.text("MİKTAR", sut.miktar, y, { align: "right" });
    doc.text("BİRİM FİYAT", sut.fiyat, y, { align: "right" });
    doc.text("İSK.", sut.isk, y, { align: "right" });
    doc.text("TUTAR", sut.tutar, y, { align: "right" });
    y += 5;
  };
  baslikSatiri();
  let toplam = 0;
  s.kalemler.forEach((k, i) => {
    const net = kalemNet(k);
    toplam += net;
    yazi(8, false, METIN);
    const acik: string[] = doc.splitTextToSize(metin(k.aciklama), sut.miktar - 16 - sut.aciklama);
    const kod: string[] = doc.splitTextToSize(metin(k.kod) || "—", sut.aciklama - sut.kod - 2);
    const h = Math.max(acik.length, kod.length) * 3.6 + 2.4;
    if (y + h > ALT_SINIR) {
      doc.addPage();
      y = UST + 4;
      baslikSatiri();
    }
    yazi(8, false, METIN_50);
    doc.text(String(i + 1), sut.sira, y);
    yazi(7.5, false, METIN_60);
    doc.text(kod, sut.kod, y);
    yazi(8, false, METIN);
    doc.text(acik, sut.aciklama, y);
    doc.text(metin(miktarYaz(k.adet, k.birim)), sut.miktar, y, { align: "right" });
    doc.text(para(k.birimFiyat), sut.fiyat, y, { align: "right" });
    yazi(7.5, false, METIN_60);
    doc.text(k.iskontoYuzde ? `%${String(k.iskontoYuzde).replace(".", ",")}` : "—", sut.isk, y, { align: "right" });
    yazi(8, true, METIN);
    doc.text(para(net), sut.tutar, y, { align: "right" });
    y += h;
    cizgi(SOL, y - 3, SAG, y - 3);
  });

  // Toplam
  if (y + 12 > ALT_SINIR) {
    doc.addPage();
    y = UST + 4;
  }
  y += 2;
  yazi(9, false, METIN_60);
  doc.text("Toplam (KDV hariç)", SAG - 45, y, { align: "right" });
  yazi(11, true, METIN);
  doc.text(para(Math.round(toplam * 100) / 100), SAG - 1.5, y, { align: "right" });
  y += 5;
  yazi(7.5, false, METIN_50);
  doc.text("Fiyatlara KDV dahil değildir. Faturada bu sipariş numarasının belirtilmesini rica ederiz.", SAG - 1.5, y, { align: "right" });
  y += 9;

  // 4. NOTLAR
  if (s.notlar) {
    const n: string[] = doc.splitTextToSize(metin(s.notlar), GENISLIK);
    if (y + 6 + n.length * 3.8 > ALT_SINIR) {
      doc.addPage();
      y = UST + 4;
    }
    etiket("Notlar / şartlar", SOL, y);
    y += 4.5;
    yazi(8, false, METIN);
    doc.text(n, SOL, y);
    y += n.length * 3.8 + 5;
  }

  // 5. İMZA ALANLARI
  if (y + 30 > ALT_SINIR) {
    doc.addPage();
    y = UST + 4;
  }
  y += 4;
  const yarim = SOL + GENISLIK / 2 + 5;
  etiket("Siparişi veren", SOL, y);
  etiket("Tedarikçi onayı (imza / kaşe)", yarim, y);
  yazi(9, true, METIN);
  doc.text(metin(s.olusturanAdi) || metin(sirket.unvan), SOL, y + 5);
  yazi(7.5, false, METIN_60);
  doc.text(metin(sirket.unvan || ""), SOL, y + 9);
  cizgi(yarim, y + 20, SAG, y + 20, METIN_50, 0.2);

  // Sayfa numaraları
  const sayfa = doc.getNumberOfPages();
  for (let i = 1; i <= sayfa; i++) {
    doc.setPage(i);
    yazi(7, false, METIN_50);
    doc.text(`${sasNo(s.no)} · Sayfa ${i} / ${sayfa}`, SAG, 290, { align: "right" });
  }

  return Buffer.from(doc.output("arraybuffer"));
}
