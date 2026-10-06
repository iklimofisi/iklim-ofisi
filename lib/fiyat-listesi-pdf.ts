import { jsPDF } from "jspdf";
import { LIBERATION_SANS_NORMAL, LIBERATION_SANS_KALIN } from "@/lib/pdf-fontlari";
import { PDF_LOGO_JPEG_BASE64, PDF_LOGO_ORAN } from "@/lib/pdf-logo";
import { ISTIRAK_METNI } from "@/lib/kurumsal";
import { iskontoluFiyat, fiyatBilgiCumlesi, paraSembolu } from "@/lib/fiyat-listesi";

// -----------------------------------------------------------------------------
// FOTOĞRAFLI FİYAT LİSTESİ PDF'İ (müşteriye gönderilir)
// İki görünüm: KART (sayfada 2 sütun, büyük fotoğraf) ve LISTE (satır satır).
// Renkler ve yazı tipi teklif PDF'iyle aynıdır.
// -----------------------------------------------------------------------------

const YAZI_TIPI = "LiberationSans";
type Renk = [number, number, number];
const METIN: Renk = [18, 33, 43];
const METIN_60: Renk = [113, 122, 128];
const METIN_50: Renk = [137, 144, 149];
const METIN_40: Renk = [160, 166, 170];
const SOGUK: Renk = [14, 124, 134];
const SOGUK_DIM: Renk = [11, 100, 108];
const SOGUK_ZEMIN: Renk = [228, 243, 242];
const HAT: Renk = [215, 224, 225];
const FOTO_ZEMIN: Renk = [246, 248, 248];

const SOL = 15;
const SAG = 195;
const GENISLIK = SAG - SOL;
const UST = 15;
const ALT_SINIR = 280; // altında sayfa altlığı var

export type PdfKalem = {
  bolum: string;
  ad: string;
  kod: string | null;
  marka: string | null;
  aciklama: string | null;
  birim: string;
  fiyat: number;
  gorselId: string | null; // satırın ya da ürünün fotoğrafı (hangisi geçerliyse)
};

export type PdfGorsel = { veri: Uint8Array; genislik: number; yukseklik: number };

export type PdfListe = {
  baslik: string;
  aciklama: string | null;
  paraBirimi: string;
  kdvDahil: boolean;
  iskontoYuzde: number;
  fiyatGoster: boolean;
  duzen: string;
  gecerlilikTarihi: Date | null;
  notlar: string | null;
  updatedAt: Date;
};

// Yazı tipinde olmayan işaretler okunur karşılığına çevrilir
function metin(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/₺/g, "TL")
    .replace(/\t/g, " ")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "")
    .trim();
}

const trTarih = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" });

const sayi = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function fiyatListesiPdfOlustur(
  liste: PdfListe,
  kalemler: PdfKalem[],
  gorseller: Map<string, PdfGorsel>,
  sirket: { unvan?: string | null; slogan?: string | null; adres?: string | null; email?: string | null; telefon?: string | null; web?: string | null }
): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.addFileToVFS("LiberationSans-Regular.ttf", LIBERATION_SANS_NORMAL);
  doc.addFont("LiberationSans-Regular.ttf", YAZI_TIPI, "normal");
  doc.addFileToVFS("LiberationSans-Bold.ttf", LIBERATION_SANS_KALIN);
  doc.addFont("LiberationSans-Bold.ttf", YAZI_TIPI, "bold");
  doc.setProperties({ title: metin(liste.baslik), creator: metin(sirket.unvan || "İklim Ofisi") });

  const sembol = paraSembolu(liste.paraBirimi);
  const unvan = metin(sirket.unvan || "İklim Ofisi");

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
  // En fazla "enFazla" satır; sığmazsa son satır "…" ile biter
  const satirlar = (t: string, genislik: number, enFazla = 99): string[] => {
    const s: string[] = doc.splitTextToSize(metin(t), genislik);
    if (s.length <= enFazla) return s;
    const kes = s.slice(0, enFazla);
    let son = kes[enFazla - 1];
    while (son.length > 1 && doc.getTextWidth(son + "…") > genislik) son = son.slice(0, -1);
    kes[enFazla - 1] = son.replace(/\s+$/, "") + "…";
    return kes;
  };

  // Fotoğrafı kutuya oranını bozmadan ortalar
  const foto = (id: string | null, x: number, y: number, w: number, h: number) => {
    doc.setFillColor(...FOTO_ZEMIN);
    doc.roundedRect(x, y, w, h, 1.5, 1.5, "F");
    const g = id ? gorseller.get(id) : undefined;
    if (!g || !g.genislik || !g.yukseklik) return;
    const pay = 1.5;
    const olcek = Math.min((w - pay * 2) / g.genislik, (h - pay * 2) / g.yukseklik);
    const gw = g.genislik * olcek;
    const gh = g.yukseklik * olcek;
    try {
      doc.addImage(g.veri, "JPEG", x + (w - gw) / 2, y + (h - gh) / 2, gw, gh, `g-${id}`);
    } catch {
      /* bozuk fotoğraf: kutu boş kalır */
    }
  };

  // Fiyat: iskonto varsa üstü çizili liste fiyatı + iskontolu fiyat. Sağa hizalı; kullandığı yüksekliği döner.
  const fiyatYaz = (k: PdfKalem, sagX: number, y: number, buyuk: number) => {
    if (!liste.fiyatGoster) return 0;
    if (!(k.fiyat > 0)) {
      yazi(8, false, METIN_50);
      doc.text("Fiyat için sorunuz", sagX, y, { align: "right" });
      return 4;
    }
    let yy = y;
    if (liste.iskontoYuzde > 0) {
      yazi(7.5, false, METIN_40);
      const eski = `${sayi(k.fiyat)} ${sembol}`;
      doc.text(eski, sagX, yy, { align: "right" });
      const w = doc.getTextWidth(eski);
      cizgi(sagX - w, yy - 1.1, sagX, yy - 1.1, METIN_40, 0.25);
      yy += buyuk * 0.42 + 0.6;
    }
    yazi(buyuk, true, SOGUK_DIM);
    doc.text(`${sayi(iskontoluFiyat(k.fiyat, liste.iskontoYuzde))} ${sembol}`, sagX, yy, { align: "right" });
    yy += 3.6;
    yazi(6.8, false, METIN_50);
    doc.text(`/ ${metin(k.birim) || "Adet"}${liste.kdvDahil ? " · KDV dahil" : " + KDV"}`, sagX, yy, { align: "right" });
    return yy - y + 1;
  };

  // ---------------------------------------------------------------------------
  // ÜST BİLGİ
  // ---------------------------------------------------------------------------
  const logoY = 12;
  const logoH = 13;
  try {
    doc.addImage(PDF_LOGO_JPEG_BASE64, "JPEG", SOL, logoY, logoH * PDF_LOGO_ORAN, logoH, "ikl-logo", "FAST");
  } catch {
    /* logo olmadan devam */
  }
  const bx = SOL + logoH * PDF_LOGO_ORAN + 4;
  let sy = logoY + 4.5;
  yazi(12.5, true, METIN);
  doc.text(unvan, bx, sy);
  sy += 4.3;
  yazi(7, false, METIN_60);
  const ist: string[] = doc.splitTextToSize(ISTIRAK_METNI, 105);
  doc.text(ist, bx, sy);
  sy += 3.4 * ist.length + 0.4;
  yazi(7.5, false, METIN_50);
  if (sirket.adres) {
    const a: string[] = doc.splitTextToSize(metin(sirket.adres), 105);
    doc.text(a, bx, sy);
    sy += 3.4 * a.length;
  }
  const iletisim = [sirket.telefon, sirket.email].filter(Boolean).map((x) => metin(x as string)).join(" · ");
  if (iletisim) {
    doc.text(iletisim, bx, sy);
    sy += 3.4;
  }

  yazi(18, true, METIN);
  doc.text(liste.fiyatGoster ? "FİYAT LİSTESİ" : "ÜRÜN KATALOĞU", SAG, logoY + 6, { align: "right" });
  yazi(8, false, METIN_60);
  doc.text(`Tarih: ${trTarih.format(liste.updatedAt)}`, SAG, logoY + 11.5, { align: "right" });
  if (liste.gecerlilikTarihi) {
    yazi(8, true, SOGUK_DIM);
    doc.text(`Geçerlilik: ${trTarih.format(liste.gecerlilikTarihi)}`, SAG, logoY + 15.5, { align: "right" });
  }

  let y = Math.max(sy, logoY + logoH + (liste.gecerlilikTarihi ? 5 : 0)) + 4;
  cizgi(SOL, y, SAG, y);
  y += 9;

  yazi(15, true, METIN);
  const bas: string[] = doc.splitTextToSize(metin(liste.baslik), GENISLIK);
  doc.text(bas, SOL, y);
  y += 6.2 * bas.length;
  if (liste.aciklama) {
    yazi(9, false, METIN_60);
    const a = satirlar(liste.aciklama, GENISLIK);
    doc.text(a, SOL, y);
    y += 4.2 * a.length + 1;
  }
  const bilgi = fiyatBilgiCumlesi(liste);
  if (bilgi) {
    yazi(8, false, SOGUK_DIM);
    const b = satirlar(bilgi, GENISLIK - 8);
    const h = 3.8 * b.length + 3.6;
    doc.setFillColor(...SOGUK_ZEMIN);
    doc.roundedRect(SOL, y, GENISLIK, h, 1.5, 1.5, "F");
    doc.text(b, SOL + 4, y + 4.6);
    y += h + 4;
  } else {
    y += 2;
  }

  // Sonraki sayfaların küçük üst bilgisi
  const yeniSayfa = () => {
    doc.addPage();
    yazi(8, true, METIN_60);
    doc.text(unvan, SOL, UST);
    yazi(8, false, METIN_50);
    const b = satirlar(liste.baslik, 100, 1)[0] ?? "";
    doc.text(b, SAG, UST, { align: "right" });
    cizgi(SOL, UST + 2.5, SAG, UST + 2.5);
    y = UST + 9;
  };
  const yerAc = (gereken: number) => {
    if (y + gereken > ALT_SINIR) yeniSayfa();
  };

  // ---------------------------------------------------------------------------
  // BÖLÜMLER (ilk göründükleri sırayla)
  // ---------------------------------------------------------------------------
  const gruplar = new Map<string, PdfKalem[]>();
  for (const k of kalemler) {
    const b = (k.bolum || "").trim();
    if (!gruplar.has(b)) gruplar.set(b, []);
    gruplar.get(b)!.push(k);
  }
  const fotoVar = kalemler.some((k) => k.gorselId && gorseller.has(k.gorselId));

  const bolumBasligi = (ad: string) => {
    yazi(10, true, SOGUK_DIM);
    doc.setFillColor(...SOGUK_ZEMIN);
    doc.rect(SOL, y, GENISLIK, 7.5, "F");
    doc.setFillColor(...SOGUK);
    doc.rect(SOL, y, 1.2, 7.5, "F");
    doc.text(metin(ad).toLocaleUpperCase("tr-TR"), SOL + 4, y + 5.1);
    y += 11;
  };

  // --- KART görünümü: sayfada 3 sütun, fotoğraf üstte ---
  const KART_SUTUN = 3;
  const KART_ARA = 5;
  const KART_G = (GENISLIK - KART_ARA * (KART_SUTUN - 1)) / KART_SUTUN;
  const KART_FOTO = fotoVar ? 40 : 0;
  const KART_Y = fotoVar ? 82 : 46;
  const kart = (k: PdfKalem, x: number, ky: number) => {
    doc.setDrawColor(...HAT);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, ky, KART_G, KART_Y, 2, 2, "S");
    const p = 3;
    if (fotoVar) foto(k.gorselId, x + p, ky + p, KART_G - p * 2, KART_FOTO);
    const tw = KART_G - p * 2;
    let ty = ky + p + KART_FOTO + (fotoVar ? 5 : 3.5);
    yazi(8.8, true, METIN);
    const ad = satirlar(k.ad, tw, 3);
    doc.text(ad, x + p, ty);
    ty += 3.8 * ad.length;
    const alt = [k.marka, k.kod].filter(Boolean).map((v) => metin(v)).join(" · ");
    if (alt) {
      yazi(7, false, METIN_50);
      doc.text(satirlar(alt, tw, 1), x + p, ty + 0.3);
      ty += 3.4;
    }
    const fiyatPayi = liste.fiyatGoster ? (liste.iskontoYuzde > 0 ? 14 : 11) : 3;
    if (k.aciklama) {
      const kalan = ky + KART_Y - fiyatPayi - (ty + 0.8);
      const enFazla = Math.floor(kalan / 3);
      if (enFazla >= 1) {
        yazi(6.8, false, METIN_60);
        doc.text(satirlar(k.aciklama, tw, enFazla), x + p, ty + 0.8);
      }
    }
    if (liste.fiyatGoster) {
      const fy = ky + KART_Y - p - (liste.iskontoYuzde > 0 && k.fiyat > 0 ? 7.4 : 4.4);
      fiyatYaz(k, x + KART_G - p, fy, 10.5);
    }
  };

  // --- LİSTE görünümü: satır satır ---
  const LISTE_FOTO = 26; // yükseklik
  const LISTE_FOTO_G = 34; // genişlik
  const satirCiz = (k: PdfKalem) => {
    const p = 3;
    const fiyatG = liste.fiyatGoster ? 42 : 0;
    const tx = fotoVar ? SOL + LISTE_FOTO_G + 5 : SOL + 1;
    const tw = SAG - fiyatG - tx - 3;
    yazi(9.5, true, METIN);
    const ad = satirlar(k.ad, tw, 3);
    const alt = [k.marka, k.kod].filter(Boolean).map((v) => metin(v)).join(" · ");
    yazi(7.5, false, METIN_50);
    const altS = alt ? satirlar(alt, tw, 2) : [];
    yazi(7.5, false, METIN_60);
    const ac = k.aciklama ? satirlar(k.aciklama, tw, 12) : [];
    const metinY = 4.2 * ad.length + (altS.length ? 3.5 * altS.length + 0.6 : 0) + (ac.length ? 3.3 * ac.length + 1.2 : 0);
    const h = Math.max(fotoVar ? LISTE_FOTO : 10, metinY + 1) + p * 2;
    yerAc(h);
    const sy0 = y;
    if (fotoVar) foto(k.gorselId, SOL, sy0 + p, LISTE_FOTO_G, LISTE_FOTO);
    let ty = sy0 + p + 3.6;
    yazi(9.5, true, METIN);
    doc.text(ad, tx, ty);
    ty += 4.2 * ad.length;
    if (altS.length) {
      yazi(7.5, false, METIN_50);
      doc.text(altS, tx, ty + 0.4);
      ty += 3.5 * altS.length + 0.6;
    }
    if (ac.length) {
      yazi(7.5, false, METIN_60);
      doc.text(ac, tx, ty + 1);
    }
    if (liste.fiyatGoster) fiyatYaz(k, SAG - 1, sy0 + p + 4, 10.5);
    y = sy0 + h;
    cizgi(SOL, y, SAG, y);
  };

  for (const [ad, grup] of gruplar) {
    if (liste.duzen === "LISTE") {
      if (ad) {
        yerAc(11 + 30);
        bolumBasligi(ad);
      }
      for (const k of grup) satirCiz(k);
      y += 6;
    } else {
      if (ad) {
        yerAc(11 + KART_Y);
        bolumBasligi(ad);
      }
      for (let i = 0; i < grup.length; i += KART_SUTUN) {
        yerAc(KART_Y);
        for (let c = 0; c < KART_SUTUN && grup[i + c]; c++) kart(grup[i + c], SOL + c * (KART_G + KART_ARA), y);
        y += KART_Y + KART_ARA;
      }
      y += 2;
    }
  }

  if (kalemler.length === 0) {
    yazi(9, false, METIN_50);
    doc.text("Bu listede henüz ürün yok.", SOL, y + 4);
    y += 10;
  }

  // ---------------------------------------------------------------------------
  // NOTLAR
  // ---------------------------------------------------------------------------
  if (liste.notlar) {
    yazi(8.5, false, METIN_60);
    const n = satirlar(liste.notlar, GENISLIK);
    yerAc(10 + Math.min(n.length, 6) * 3.9);
    yazi(7, true, METIN_50);
    doc.text("NOTLAR", SOL, y, { charSpace: 0.35 });
    y += 5;
    yazi(8.5, false, METIN_60);
    for (const s of n) {
      yerAc(4);
      doc.text(s, SOL, y);
      y += 3.9;
    }
  }

  // ---------------------------------------------------------------------------
  // SAYFA ALTLIĞI
  // ---------------------------------------------------------------------------
  const toplam = doc.getNumberOfPages();
  const altBilgi = [unvan, sirket.telefon, sirket.email, sirket.web].filter(Boolean).map((x) => metin(x as string)).join("  ·  ");
  for (let i = 1; i <= toplam; i++) {
    doc.setPage(i);
    cizgi(SOL, 286, SAG, 286);
    yazi(7, false, METIN_50);
    doc.text(satirlar(altBilgi, 150, 1)[0] ?? "", SOL, 290);
    doc.text(`Sayfa ${i} / ${toplam}`, SAG, 290, { align: "right" });
  }

  return Buffer.from(doc.output("arraybuffer"));
}
