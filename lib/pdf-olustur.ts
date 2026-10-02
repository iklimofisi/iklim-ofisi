import { jsPDF } from "jspdf";
import { LIBERATION_SANS_NORMAL, LIBERATION_SANS_KALIN } from "@/lib/pdf-fontlari";
import { PDF_LOGO_JPEG_BASE64, PDF_LOGO_ORAN } from "@/lib/pdf-logo";
import { musteriToplami, ilkHazirlanmaTarihi, musteriTeklifTarihi, kosulCumlesi, bolumToplamlari } from "@/lib/teklif-hesap";
import { sablonlariGrupla } from "@/lib/sablon";
import { ISTIRAK_METNI } from "@/lib/kurumsal";

// -----------------------------------------------------------------------------
// MÜŞTERİYE E-POSTAYLA GİDEN TEKLİF PDF'İ
// Paneldeki teklif sayfasının yazdırma görünümüyle AYNI düzen:
//   logo + şirket bilgileri | TEKLİF + kod
//   teklif başlığı, proje
//   müşteri bilgileri (yetkili, santral, VN, adres) | teklif tarihi
//   bölüm bölüm kalemler (marka logolarıyla)
//   Genel Toplam, KDV/geçerlilik cümlesi
//   teklif notları (iki sütun, grup başlığıyla)
//   teklifi hazırlayan + müşteri onayı imza/kaşe alanları
// Teklif sayfasında (app/panel/(app)/teklifler/[id]/page.tsx) bir değişiklik
// yapılırsa burası da aynı şekilde güncellenmelidir.
// -----------------------------------------------------------------------------

const YAZI_TIPI = "LiberationSans";

function yaziTipiniYukle(doc: jsPDF) {
  doc.addFileToVFS("LiberationSans-Regular.ttf", LIBERATION_SANS_NORMAL);
  doc.addFont("LiberationSans-Regular.ttf", YAZI_TIPI, "normal");
  doc.addFileToVFS("LiberationSans-Bold.ttf", LIBERATION_SANS_KALIN);
  doc.addFont("LiberationSans-Bold.ttf", YAZI_TIPI, "bold");
}

// Yazı tipinde olmayan nadir işaretler okunur karşılığına çevrilir
function metin(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/₺/g, "TL")
    .replace(/\t/g, " ")
    // Emoji vb. (yazı tipinde yok, PDF'te bozuk görünür)
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "")
    .trim();
}

const trTarih = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Istanbul",
});

// Panel temasıyla aynı renkler (tailwind.config)
type Renk = [number, number, number];
const METIN: Renk = [18, 33, 43]; // #12212B
const METIN_70: Renk = [89, 100, 107];
const METIN_60: Renk = [113, 122, 128];
const METIN_50: Renk = [137, 144, 149];
const METIN_40: Renk = [160, 166, 170];
const SOGUK_DIM: Renk = [11, 100, 108]; // #0B646C
const HAT: Renk = [215, 224, 225]; // #D7E0E1
const BOLUM_ZEMIN: Renk = [246, 251, 251]; // soguk-light %30

// A4 ölçüleri (mm)
const SOL = 15;
const SAG = 195;
const GENISLIK = SAG - SOL;
const UST = 15;
const ALT_SINIR = 282;

function paraYaz(n: number, sembol: string) {
  return `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${sembol}`;
}

export async function teklifPdfOlustur(teklif: any, sirket: any): Promise<Buffer> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  yaziTipiniYukle(doc);
  const pb = teklif.paraBirimi === "EUR" ? "€" : teklif.paraBirimi === "USD" ? "$" : teklif.paraBirimi === "TRY" ? "TL" : metin(teklif.paraBirimi);

  const yazi = (boyut: number, kalin: boolean, renk: Renk) => {
    doc.setFont(YAZI_TIPI, kalin ? "bold" : "normal");
    doc.setFontSize(boyut);
    doc.setTextColor(...renk);
  };
  const cizgi = (x1: number, y1: number, x2: number, y2: number, renk: Renk = HAT, kalinlik = 0.25) => {
    doc.setDrawColor(...renk);
    doc.setLineWidth(kalinlik);
    doc.line(x1, y1, x2, y2);
  };
  // Küçük, harf aralıklı, büyük harfli etiket ("MÜŞTERİ / FİRMA")
  const etiket = (t: string, x: number, yy: number, hiza: "left" | "right" = "left") => {
    yazi(6.5, true, METIN_50);
    const buyuk = t.toLocaleUpperCase("tr-TR");
    const aralik = 0.35;
    // jsPDF sağa hizalarken harf aralığını hesaba katmıyor; genişlik elle bulunur
    const bx = hiza === "right" ? x - (doc.getTextWidth(buyuk) + aralik * (buyuk.length - 1)) : x;
    doc.text(buyuk, bx, yy, { charSpace: aralik });
  };

  let y = UST;
  const yerAc = (gereken: number) => {
    if (y + gereken > ALT_SINIR) {
      doc.addPage();
      y = UST + 3;
      return true;
    }
    return false;
  };

  // ---------------------------------------------------------------------------
  // 1. ÜST BİLGİ: logo + şirket | TEKLİF + kod
  // ---------------------------------------------------------------------------
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
  // Bağlı olunan şirket (teklif sayfasındaki gibi, unvanın hemen altında)
  yazi(7, false, METIN_60);
  const istirak: string[] = doc.splitTextToSize(ISTIRAK_METNI, 110);
  doc.text(istirak, bx, sy);
  sy += 3.4 * istirak.length + 0.4;
  if (sirket.slogan) {
    yazi(7.5, false, METIN_60);
    doc.text(metin(sirket.slogan), bx, sy);
    sy += 3.8;
  }
  yazi(7.5, false, METIN_50);
  if (sirket.adres) {
    const adresSatir: string[] = doc.splitTextToSize(metin(sirket.adres), 110);
    doc.text(adresSatir, bx, sy);
    sy += 3.4 * adresSatir.length;
  }
  const iletisim = [sirket.email, sirket.telefon].filter(Boolean).map((x: string) => metin(x)).join(" · ");
  if (iletisim) {
    doc.text(iletisim, bx, sy);
    sy += 3.4;
  }

  yazi(20, true, METIN);
  doc.text("TEKLİF", SAG, logoY + 6, { align: "right" });
  // Teklif kodu ilk hazırlanma yılına göre sabit kalır (revizyonda değişmez)
  const teklifKodu = `IKL-${ilkHazirlanmaTarihi(teklif).getFullYear()}-${String(teklif.teklifNo).padStart(5, "0")}`;
  yazi(9.5, true, SOGUK_DIM);
  doc.text(teklifKodu, SAG, logoY + 11.5, { align: "right" });

  y = Math.max(sy, logoY + logoH) + 4;
  cizgi(SOL, y, SAG, y);
  y += 10;

  // ---------------------------------------------------------------------------
  // 2. TEKLİF BAŞLIĞI VE PROJE
  // ---------------------------------------------------------------------------
  if (teklif.baslik) {
    yazi(13, true, METIN);
    const b: string[] = doc.splitTextToSize(metin(teklif.baslik), GENISLIK);
    doc.text(b, SOL, y);
    y += 5.5 * b.length;
  }
  if (teklif.proje?.ad) {
    yazi(7.5, false, METIN_50);
    doc.text(`Proje: ${metin(teklif.proje.ad)}${teklif.proje.konum ? ` · ${metin(teklif.proje.konum)}` : ""}`, SOL, y - 1);
    y += 4;
  }
  y += 5;

  // ---------------------------------------------------------------------------
  // 3. MÜŞTERİ BİLGİLERİ | TEKLİF TARİHİ
  // ---------------------------------------------------------------------------
  const musteri = teklif.musteri ?? {};
  const yetkiliAd = teklif.yetkili?.ad || musteri.yetkiliAdi;
  const yetkiliTelefon = teklif.yetkili ? teklif.yetkili.telefon : musteri.yetkiliTelefon;

  etiket("Müşteri / Firma", SOL, y);
  etiket("Teklif Tarihi", SAG, y, "right");
  yazi(9, false, METIN);
  // Revize edilmişse son revizyon tarihi, edilmemişse ilk hazırlanma tarihi
  doc.text(trTarih.format(musteriTeklifTarihi(teklif)), SAG, y + 5, { align: "right" });

  let my = y + 5.2;
  yazi(11, true, METIN);
  const mAd: string[] = doc.splitTextToSize(metin(musteri.ad), 110);
  doc.text(mAd, SOL, my);
  my += 4.8 * mAd.length;
  if (yetkiliAd) {
    yazi(7.5, true, SOGUK_DIM);
    const t = `Yetkili: ${metin(yetkiliAd)}${teklif.yetkili?.unvan ? ` · ${metin(teklif.yetkili.unvan)}` : ""}${
      yetkiliTelefon ? ` (${metin(yetkiliTelefon)})` : ""
    }`;
    const s: string[] = doc.splitTextToSize(t, 110);
    doc.text(s, SOL, my + 0.6);
    my += 3.8 * s.length + 0.6;
  }
  yazi(7.5, false, METIN_60);
  if (musteri.telefon) {
    doc.text(`Santral: ${metin(musteri.telefon)}`, SOL, my);
    my += 3.6;
  }
  if (musteri.vergiNo) {
    doc.text(`VN: ${metin(musteri.vergiNo)}`, SOL, my);
    my += 3.6;
  }
  if (musteri.faturaAdresi) {
    const s: string[] = doc.splitTextToSize(metin(musteri.faturaAdresi), 110);
    doc.text(s, SOL, my);
    my += 3.6 * s.length;
  }
  y = my + 8;

  // ---------------------------------------------------------------------------
  // 4. KALEMLER (bölüm bölüm)
  // ---------------------------------------------------------------------------
  const fiyatli = !!teklif.birimFiyatGoster;
  const X_ADET = fiyatli ? 128 : SAG;
  const X_BIRIM = 162;
  const X_TUTAR = SAG;
  const ACIKLAMA_GEN = fiyatli ? 98 : 150;

  const tabloBasligi = () => {
    yazi(7.5, false, METIN_50);
    doc.text("Açıklama", SOL, y);
    doc.text("Adet", X_ADET, y, { align: "right" });
    if (fiyatli) {
      doc.text("Birim Fiyat", X_BIRIM, y, { align: "right" });
      doc.text("Tutar", X_TUTAR, y, { align: "right" });
    }
    y += 2.5;
    cizgi(SOL, y, SAG, y);
  };
  tabloBasligi();

  // Marka logoları (PNG/JPEG); her marka belgeye bir kez eklenir
  const logoOnbellek = new Map<string, { veri: Uint8Array; tur: string; oran: number } | null>();
  const markaLogosu = (marka: any) => {
    if (!marka?.logo || !marka?.id) return null;
    if (logoOnbellek.has(marka.id)) return logoOnbellek.get(marka.id)!;
    let sonuc: { veri: Uint8Array; tur: string; oran: number } | null = null;
    try {
      const tip = String(marka.logoTipi || "").toLowerCase();
      const tur = tip.includes("png") ? "PNG" : tip.includes("jpeg") || tip.includes("jpg") ? "JPEG" : null;
      if (tur) {
        const veri = marka.logo instanceof Uint8Array ? marka.logo : new Uint8Array(marka.logo);
        const p = doc.getImageProperties(veri);
        if (p.width > 0 && p.height > 0) sonuc = { veri, tur, oran: p.width / p.height };
      }
    } catch {
      sonuc = null;
    }
    logoOnbellek.set(marka.id, sonuc);
    return sonuc;
  };

  // Sıra teklif sayfasındakiyle aynı: bölümler ilk görüldükleri sırayla
  const bolumler = new Map<string, any[]>();
  for (const k of teklif.kalemler ?? []) {
    const b = k.bolum || "Genel Kalemler";
    if (!bolumler.has(b)) bolumler.set(b, []);
    bolumler.get(b)!.push(k);
  }

  // Birden fazla bölüm varsa bölüm toplamları (teklif sayfasıyla aynı kural)
  const bolumOzet = bolumToplamlari(teklif.kalemler ?? []);
  const bolumToplamiGoster = fiyatli && bolumOzet.length > 1;
  const bolumTutari = new Map(bolumOzet.map((b) => [b.bolum, b.tutar]));

  for (const [bolumAdi, kalemler] of bolumler) {
    // Bölüm başlığı en az bir kalemle aynı sayfada olsun
    if (yerAc(16)) tabloBasligi();
    doc.setFillColor(...BOLUM_ZEMIN);
    doc.rect(SOL, y, GENISLIK, 7, "F");
    yazi(7.5, true, SOGUK_DIM);
    doc.text(metin(bolumAdi), SOL + 1.5, y + 4.7);
    y += 7;
    cizgi(SOL, y, SAG, y);

    kalemler.forEach((k: any, i: number) => {
      const netBirim = k.birimFiyat * (1 - (k.iskontoYuzde || 0) / 100);
      const tutar = k.adet * netBirim;
      const logo = markaLogosu(k.marka);
      const logoG = logo ? Math.min(15, 5 * logo.oran) : 0;
      const metinX = SOL + 2 + (logo ? logoG + 2 : 0);
      yazi(8.5, false, METIN);
      const satirlar: string[] = doc.splitTextToSize(metin(k.aciklama), ACIKLAMA_GEN - (metinX - SOL));
      const yukseklik = Math.max(satirlar.length * 3.8, logo ? 5 : 0) + 5.4;

      if (yerAc(yukseklik)) tabloBasligi();
      const ilkSatirY = y + 4.6;
      if (logo) {
        try {
          doc.addImage(logo.veri, logo.tur, SOL + 2, y + 1.6, logoG, logoG / logo.oran, `marka-${k.marka.id}`, "FAST");
        } catch {
          // logo basılamazsa atla
        }
      }
      yazi(8.5, false, METIN);
      doc.text(satirlar, metinX, ilkSatirY);
      yazi(8.5, false, METIN_70);
      doc.text(String(k.adet ?? 1).replace(".", ","), X_ADET, ilkSatirY, { align: "right" });
      if (fiyatli) {
        doc.text(paraYaz(netBirim, pb), X_BIRIM, ilkSatirY, { align: "right" });
        yazi(8.5, false, METIN);
        doc.text(paraYaz(tutar, pb), X_TUTAR, ilkSatirY, { align: "right" });
      }
      y += yukseklik;
      // Bölümün son satırında çizgi yok (sayfadaki last:border-0 gibi)
      if (i < kalemler.length - 1) cizgi(SOL, y, SAG, y);
    });

    // Tek kalemli bölümde bölüm toplamı satır tutarıyla aynı; tekrar yazılmaz
    if (bolumToplamiGoster && kalemler.length > 1) {
      if (yerAc(9)) tabloBasligi();
      cizgi(X_ADET - 20, y, SAG, y, METIN_40, 0.3);
      yazi(8, true, SOGUK_DIM);
      doc.text(`${metin(bolumAdi)} toplamı`, X_BIRIM, y + 4.8, { align: "right" });
      yazi(8.5, true, METIN);
      doc.text(paraYaz(bolumTutari.get(bolumAdi) ?? 0, pb), X_TUTAR, y + 4.8, { align: "right" });
      y += 9;
    }
  }
  y += 8;

  // ---------------------------------------------------------------------------
  // 5. GENEL TOPLAM — "Genel Toplam   10.250,00 € + KDV"
  // ---------------------------------------------------------------------------
  const toplam = musteriToplami(teklif);
  if (bolumToplamiGoster) {
    // Genel toplamın üstünde bölüm özeti
    yerAc(bolumOzet.length * 5 + 26);
    yazi(8.5, false, METIN_70);
    for (const b of bolumOzet) {
      doc.text(metin(b.bolum), SAG - 78, y);
      doc.text(paraYaz(b.tutar, pb), SAG, y, { align: "right" });
      y += 5;
    }
    y += 1;
  }
  yerAc(24);
  const tutarMetni = `${paraYaz(toplam.tutar, pb)} ${toplam.ek}`;
  yazi(12, true, METIN);
  const tutarGen = doc.getTextWidth(tutarMetni);
  const blokGen = Math.max(78, tutarGen + doc.getTextWidth("Genel Toplam") + 10);
  cizgi(SAG - blokGen, y, SAG, y, METIN, 0.6);
  doc.text("Genel Toplam", SAG - blokGen, y + 6);
  doc.text(tutarMetni, SAG, y + 6, { align: "right" });
  y += 18;

  // KDV + geçerlilik süresi
  yazi(7.5, false, METIN_60);
  const kosul: string[] = doc.splitTextToSize(kosulCumlesi(teklif), GENISLIK);
  doc.text(kosul, SOL, y);
  y += 3.6 * kosul.length + 9;

  // ---------------------------------------------------------------------------
  // 6. TEKLİF NOTLARI — iki sütun; müşteriye yalnızca grup başlığı gider
  // ---------------------------------------------------------------------------
  const gruplar = sablonlariGrupla((teklif.sablonlar ?? []) as { baslik: string; grupBaslik?: string | null; icerik: string }[]);
  const SUTUN_GEN = (GENISLIK - 10) / 2;
  const NOT_SATIR = 3.9;
  const notBlogu = (g: { grup: string; notlar: { icerik: string }[] }) => {
    yazi(8, false, METIN_60);
    const paragraflar = g.notlar.map((n) => doc.splitTextToSize(metin(n.icerik), SUTUN_GEN) as string[]);
    const yuk = 6 + paragraflar.reduce((a, p) => a + p.length * NOT_SATIR, 0) + (paragraflar.length - 1) * 2;
    return { grup: g.grup, paragraflar, yuk };
  };
  const blokYaz = (b: ReturnType<typeof notBlogu>, x: number, baslangic: number, sayfaKir: boolean) => {
    let yy = baslangic;
    yazi(9, false, METIN);
    doc.text(metin(b.grup), x, yy);
    yy += 6;
    yazi(8, false, METIN_60);
    b.paragraflar.forEach((p, i) => {
      for (const satir of p) {
        if (sayfaKir && yy > ALT_SINIR) {
          doc.addPage();
          yy = UST + 3;
          yazi(8, false, METIN_60);
        }
        doc.text(satir, x, yy);
        yy += NOT_SATIR;
      }
      if (i < b.paragraflar.length - 1) yy += 2;
    });
    return yy;
  };

  const bloklar = gruplar.map(notBlogu);
  const KULLANILABILIR = ALT_SINIR - UST - 3;
  for (let i = 0; i < bloklar.length; i += 2) {
    const sol = bloklar[i];
    const sag = bloklar[i + 1];
    const satirYuk = Math.max(sol.yuk, sag?.yuk ?? 0);
    if (satirYuk <= KULLANILABILIR) {
      yerAc(satirYuk);
      blokYaz(sol, SOL, y, false);
      if (sag) blokYaz(sag, SOL + SUTUN_GEN + 10, y, false);
      y += satirYuk + 7;
    } else {
      // Çok uzun notlar: alt alta, sayfaya bölünerek
      yerAc(20);
      y = blokYaz(sol, SOL, y, true) + 7;
      if (sag) {
        yerAc(20);
        y = blokYaz(sag, SOL, y, true) + 7;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 7. İMZA / KAŞE: TEKLİFİ HAZIRLAYAN | MÜŞTERİ ONAYI
  // ---------------------------------------------------------------------------
  const hazirlayanAd = teklif.olusturanKullanici?.ad || teklif.olusturanAdi || "Firma Yetkilisi";
  const hazirlayanEmail = teklif.olusturanKullanici?.email || sirket.email || "info@iklimofisi.com";
  const hazirlayanTelefon = teklif.olusturanKullanici?.telefon || sirket.telefon || "";

  y += 3;
  yerAc(48);
  cizgi(SOL, y, SAG, y);
  y += 9;
  const x2 = SOL + SUTUN_GEN + 10;

  etiket("Teklifi Hazırlayan / Firma Yetkilisi", SOL, y);
  etiket("Müşteri Onayı", x2, y);
  let hy = y + 6;
  yazi(11, true, METIN);
  doc.text(metin(hazirlayanAd), SOL, hy);
  hy += 4.5;
  yazi(7.5, false, METIN_70);
  doc.text(metin(hazirlayanEmail), SOL, hy);
  hy += 3.6;
  if (hazirlayanTelefon) {
    doc.text(metin(hazirlayanTelefon), SOL, hy);
    hy += 3.6;
  }

  let oy = y + 6;
  yazi(11, true, METIN);
  const onayAd: string[] = doc.splitTextToSize(metin(musteri.ad), SUTUN_GEN);
  doc.text(onayAd, x2, oy);
  oy += 4.5 * onayAd.length;
  if (yetkiliAd) {
    yazi(7.5, false, METIN_70);
    doc.text(`Yetkili: ${metin(yetkiliAd)}`, x2, oy);
    oy += 3.6;
  }

  const imzaY = Math.max(hy, oy) + 16;
  cizgi(SOL, imzaY, SOL + SUTUN_GEN, imzaY);
  cizgi(x2, imzaY, SAG, imzaY);
  yazi(7, false, METIN_40);
  doc.text("İmza / Kaşe", SOL, imzaY + 4);
  doc.text("İmza / Kaşe", x2, imzaY + 4);

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
