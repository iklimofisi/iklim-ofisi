import { jsPDF } from "jspdf";
import { LIBERATION_SANS_NORMAL, LIBERATION_SANS_KALIN } from "@/lib/pdf-fontlari";
import { PDF_LOGO_JPEG_BASE64, PDF_LOGO_ORAN } from "@/lib/pdf-logo";
import { AY_ADI, ayEtiketi, type YonetimVerisi } from "@/lib/yonetim-verisi";

// -----------------------------------------------------------------------------
// YÖNETİM RAPORU PDF'İ (Özet → Yönetim Paneli → "PDF indir")
// Panelle aynı veri: göstergeler, 12 aylık ciro / maliyet / kâr grafiği ve tablosu, iş hattı,
// dikkat gerekenler, alacak yaşlandırma, sipariş kârlılığı, müşteri ve personel sıralaması.
// İç rapordur (maliyet ve kâr içerir); yalnız Admin ve Yönetici alabilir.
// -----------------------------------------------------------------------------

const YT = "LiberationSans";
type Renk = [number, number, number];
const METIN: Renk = [18, 33, 43];
const M60: Renk = [113, 122, 128];
const M45: Renk = [145, 152, 156];
const SOGUK: Renk = [14, 124, 134];
const SOGUK_DIM: Renk = [11, 100, 108];
const SICAK: Renk = [232, 115, 74];
const YESIL: Renk = [22, 163, 74];
const SARI: Renk = [245, 158, 11];
const KIRMIZI: Renk = [185, 28, 28];
const MOR: Renk = [124, 58, 237];
const MAVI: Renk = [37, 99, 235];
const HAT: Renk = [215, 224, 225];
const ZEMIN: Renk = [244, 248, 248];
const BEYAZ: Renk = [255, 255, 255];

const SOL = 14;
const SAG = 196;
const GEN = SAG - SOL;
const UST = 14;
const ALT = 282;

const tl = (n: number) => `${n.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} TL`;
const kisa = (n: number) => {
  const m = Math.abs(n);
  if (m >= 1e6) return `${(n / 1e6).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} Mn`;
  if (m >= 1e3) return `${(n / 1e3).toLocaleString("tr-TR", { maximumFractionDigits: 0 })} B`;
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
};
const yuzde = (n: number) => `${n < 0 ? "-" : ""}%${Math.abs(n).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`;
const temiz = (s: string | null | undefined) =>
  String(s ?? "")
    .replace(/₺/g, "TL")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "")
    .replace(/[▲▼→⚠✓•]/g, "")
    .trim();

export function yonetimRaporuPdf(v: YonetimVerisi, sirket: { unvan?: string | null }): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.addFileToVFS("LiberationSans-Regular.ttf", LIBERATION_SANS_NORMAL);
  doc.addFont("LiberationSans-Regular.ttf", YT, "normal");
  doc.addFileToVFS("LiberationSans-Bold.ttf", LIBERATION_SANS_KALIN);
  doc.addFont("LiberationSans-Bold.ttf", YT, "bold");

  const yazi = (b: number, kalin: boolean, r: Renk) => {
    doc.setFont(YT, kalin ? "bold" : "normal");
    doc.setFontSize(b);
    doc.setTextColor(...r);
  };
  const dolgu = (r: Renk) => doc.setFillColor(...r);
  const cizgiRenk = (r: Renk, k = 0.25) => {
    doc.setDrawColor(...r);
    doc.setLineWidth(k);
  };
  let y = UST;
  const yerAc = (h: number) => {
    if (y + h > ALT) {
      doc.addPage();
      y = UST + 2;
    }
  };
  // Başlık, altındaki ilk içerikle aynı sayfada kalsın (ek: başlıktan sonra gereken yükseklik)
  const bolumBasligi = (t: string, ek = 20) => {
    yerAc(8 + ek);
    dolgu(SOGUK);
    doc.rect(SOL, y, 1.4, 5, "F");
    yazi(10.5, true, METIN);
    doc.text(t, SOL + 3.5, y + 4);
    y += 8;
  };
  const tarihYazi = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" }).format(v.olusturma);

  // 1. ÜST BAŞLIK (renkli bant)
  dolgu(SOGUK_DIM);
  doc.rect(0, 0, 210, 30, "F");
  dolgu(SOGUK);
  doc.rect(120, 0, 90, 30, "F");
  dolgu(BEYAZ);
  doc.roundedRect(SOL, 6.5, 17, 17, 2, 2, "F");
  try {
    const lh = 12;
    doc.addImage(PDF_LOGO_JPEG_BASE64, "JPEG", SOL + (17 - lh * PDF_LOGO_ORAN) / 2, 9, lh * PDF_LOGO_ORAN, lh, "ikl-logo", "FAST");
  } catch {
    /* logo eklenemezse belge yine oluşur */
  }
  yazi(15, true, BEYAZ);
  doc.text("YÖNETİM RAPORU", SOL + 21, 14);
  yazi(8.5, false, [214, 236, 238]);
  doc.text(temiz(sirket.unvan || "İklim Ofisi"), SOL + 21, 19.5);
  doc.text(`Oluşturma: ${tarihYazi}`, SOL + 21, 24);
  yazi(8, false, [214, 236, 238]);
  doc.text("Tutarlar KDV hariç, TL", SAG, 14, { align: "right" });
  doc.text("Döviz kayıtları kendi kuruyla çevrilir", SAG, 18.5, { align: "right" });
  if (v.kurTarihi) doc.text(`TCMB bülteni: ${v.kurTarihi}`, SAG, 23, { align: "right" });
  y = 37;

  // 2. GÖSTERGELER (4 x 2 kutu)
  const kpiler: { b: string; d: string; a: string; r: Renk; dr?: Renk }[] = [
    {
      b: "Bu ay ciro",
      d: tl(v.ciroBuAy),
      a: v.ciroDegisim == null ? `Geçen ay: ${tl(v.ciroGecenAy)}` : `Geçen aya göre ${v.ciroDegisim >= 0 ? "+" : "-"}${yuzde(Math.abs(v.ciroDegisim))}`,
      r: SOGUK,
    },
    { b: `${v.buYil} ciro`, d: tl(v.ciroYil), a: `${v.yilSiparisSayisi} onaylı sipariş`, r: MAVI },
    {
      b: `${v.buYil} brüt kâr`,
      d: v.maliyetliSayi ? tl(v.karYil) : "-",
      a: v.maliyetliSayi ? `Marj ${v.marjYil == null ? "-" : yuzde(v.marjYil)} · ${v.maliyetliSayi}/${v.yilSiparisSayisi} sipariş` : "Maliyet girilmedi",
      r: v.karYil < 0 ? KIRMIZI : YESIL,
      dr: v.karYil < 0 ? KIRMIZI : YESIL,
    },
    { b: "Açık teklif hacmi", d: `≈ ${tl(v.acikTeklifTl)}`, a: `${v.acikTeklifSayi} teklif bekliyor`, r: MOR },
    { b: "Teklif kazanma (90 gün)", d: v.kazanmaOrani == null ? "-" : yuzde(v.kazanmaOrani), a: `${v.kazanilanSayi} onay · ${v.kaybedilenSayi} red`, r: SARI },
    { b: "Bekleyen tahsilat", d: tl(v.bekleyenTahsilat), a: v.gecikmis > 0.5 ? `30 gün üstü: ${tl(v.gecikmis)}` : "Gecikmiş alacak yok", r: SICAK },
    { b: "Tedarikçilere borç", d: tl(v.tedarikciBorcu), a: "Alış faturaları - ödemeler", r: KIRMIZI },
    {
      b: "Net: alacak - borç",
      d: tl(v.bekleyenTahsilat - v.tedarikciBorcu),
      a: "Müşteri alacağı - tedarikçi borcu",
      r: v.bekleyenTahsilat - v.tedarikciBorcu < 0 ? KIRMIZI : YESIL,
      dr: v.bekleyenTahsilat - v.tedarikciBorcu < 0 ? KIRMIZI : YESIL,
    },
  ];
  const kw = (GEN - 3 * 3) / 4;
  const kh = 20;
  kpiler.forEach((k, i) => {
    const x = SOL + (i % 4) * (kw + 3);
    const yy = y + Math.floor(i / 4) * (kh + 3);
    dolgu(ZEMIN);
    cizgiRenk(HAT);
    doc.roundedRect(x, yy, kw, kh, 1.5, 1.5, "FD");
    dolgu(k.r);
    doc.rect(x, yy, kw, 1.3, "F");
    yazi(7, false, M60);
    doc.text(k.b, x + 3, yy + 6);
    yazi(11.5, true, k.dr ?? METIN);
    doc.text(k.d, x + 3, yy + 12.5);
    yazi(6.5, false, M45);
    doc.text(doc.splitTextToSize(temiz(k.a), kw - 5)[0] ?? "", x + 3, yy + 17);
  });
  y += 2 * kh + 3 + 8;

  // 3. 12 AY GRAFİĞİ
  bolumBasligi("Son 12 ay: ciro, maliyet ve brüt kâr", 70);
  const gh = 52;
  const gx = SOL + 14;
  const gw = GEN - 16;
  const max = Math.max(1, ...v.aylik.map((a) => Math.max(a.ciro, a.maliyet, a.kar)));
  const yO = (n: number) => y + gh - (Math.max(0, n) / max) * gh;
  for (const o of [0, 0.25, 0.5, 0.75, 1]) {
    const yy = yO(max * o);
    cizgiRenk(HAT, o === 0 ? 0.3 : 0.15);
    doc.line(gx, yy, gx + gw, yy);
    yazi(6, false, M45);
    doc.text(kisa(max * o), gx - 2, yy + 1, { align: "right" });
  }
  const grup = gw / 12;
  const bw = Math.min(4.2, grup / 3);
  const karNoktalari: [number, number, boolean][] = [];
  v.aylik.forEach((a, i) => {
    const xm = gx + i * grup + grup / 2;
    if (a.ay === v.buAy) {
      dolgu([228, 243, 242]);
      doc.rect(xm - grup / 2 + 0.5, y, grup - 1, gh, "F");
    }
    if (a.ciro > 0) {
      dolgu(SOGUK);
      doc.rect(xm - bw - 0.3, yO(a.ciro), bw, y + gh - yO(a.ciro), "F");
    }
    if (a.maliyet > 0) {
      dolgu(SICAK);
      doc.rect(xm + 0.3, yO(a.maliyet), bw, y + gh - yO(a.maliyet), "F");
    }
    karNoktalari.push([xm, yO(a.kar), a.kar < 0]);
    yazi(6.3, a.ay === v.buAy, a.ay === v.buAy ? SOGUK_DIM : M60);
    doc.text(AY_ADI[Number(a.ay.slice(5, 7)) - 1], xm, y + gh + 4, { align: "center" });
    if (i === 0 || a.ay.endsWith("-01")) {
      yazi(5.5, false, M45);
      doc.text(a.ay.slice(0, 4), xm, y + gh + 7, { align: "center" });
    }
  });
  cizgiRenk(YESIL, 0.6);
  for (let i = 1; i < karNoktalari.length; i++) doc.line(karNoktalari[i - 1][0], karNoktalari[i - 1][1], karNoktalari[i][0], karNoktalari[i][1]);
  for (const [px, py, eksi] of karNoktalari) {
    dolgu(eksi ? KIRMIZI : YESIL);
    doc.circle(px, py, 0.8, "F");
  }
  // Açıklama
  const ly = y + gh + 11;
  const lejant: [Renk, string][] = [
    [SOGUK, "Ciro"],
    [SICAK, "Maliyet (satınalma)"],
    [YESIL, "Brüt kâr"],
  ];
  let lx = gx;
  for (const [r, ad] of lejant) {
    dolgu(r);
    doc.rect(lx, ly - 2.2, 3, 2.4, "F");
    yazi(6.8, false, M60);
    doc.text(ad, lx + 4, ly);
    lx += 32;
  }
  y = ly + 6;

  // Aylık tablo
  const tablo = (basliklar: { t: string; w: number; sag?: boolean }[], satirlar: { h: string[]; renk?: (Renk | null)[]; kalin?: boolean; zemin?: Renk }[]) => {
    const satirH = 5.4;
    const bas = () => {
      dolgu(SOGUK_DIM);
      doc.rect(SOL, y, GEN, 6, "F");
      yazi(6.8, true, BEYAZ);
      let x = SOL;
      for (const b of basliklar) {
        doc.text(b.t, b.sag ? x + b.w - 2 : x + 2, y + 4.1, { align: b.sag ? "right" : "left" });
        x += b.w;
      }
      y += 6;
    };
    yerAc(12);
    bas();
    satirlar.forEach((s, si) => {
      if (y + satirH > ALT) {
        doc.addPage();
        y = UST + 2;
        bas();
      }
      if (s.zemin || si % 2 === 1) {
        dolgu(s.zemin ?? [249, 251, 251]);
        doc.rect(SOL, y, GEN, satirH, "F");
      }
      let x = SOL;
      s.h.forEach((h, i) => {
        const b = basliklar[i];
        yazi(7, !!s.kalin, s.renk?.[i] ?? METIN);
        const metin = doc.splitTextToSize(temiz(h), b.w - 3)[0] ?? "";
        doc.text(metin, b.sag ? x + b.w - 2 : x + 2, y + 3.8, { align: b.sag ? "right" : "left" });
        x += b.w;
      });
      cizgiRenk(HAT, 0.15);
      doc.line(SOL, y + satirH, SAG, y + satirH);
      y += satirH;
    });
    y += 6;
  };

  const topCiro = v.aylik.reduce((a, x) => a + x.ciro, 0);
  const topMal = v.aylik.reduce((a, x) => a + x.maliyet, 0);
  const topKar = v.aylik.reduce((a, x) => a + (x.karVar ? x.kar : 0), 0);
  tablo(
    [
      { t: "Ay", w: 30 },
      { t: "Sipariş", w: 22, sag: true },
      { t: "Ciro", w: 40, sag: true },
      { t: "Maliyet", w: 40, sag: true },
      { t: "Brüt kâr", w: 50, sag: true },
    ],
    [
      ...v.aylik.map((a) => ({
        h: [ayEtiketi(a.ay), String(a.adet), tl(a.ciro), tl(a.maliyet), a.karVar ? tl(a.kar) : "-"],
        renk: [null, null, null, null, a.karVar ? (a.kar < 0 ? KIRMIZI : YESIL) : M45] as (Renk | null)[],
      })),
      { h: ["Toplam (12 ay)", String(v.aylik.reduce((a, x) => a + x.adet, 0)), tl(topCiro), tl(topMal), tl(topKar)], kalin: true, zemin: [228, 243, 242] as Renk },
    ]
  );

  // 4. İŞ HATTI + DİKKAT GEREKENLER
  bolumBasligi("İş hattı", v.hat.length * 6 + 12);
  const hatRenk: Renk[] = [[203, 213, 225], MOR, SARI, MAVI, SOGUK, SICAK];
  const hatMax = Math.max(1, ...v.hat.map((h) => h.sayi));
  yerAc(v.hat.length * 6 + 14);
  v.hat.forEach((h, i) => {
    yazi(7.5, false, METIN);
    doc.text(h.ad, SOL, y + 3.3);
    dolgu([238, 242, 243]);
    doc.roundedRect(SOL + 52, y + 0.8, 110, 3.2, 1.2, 1.2, "F");
    if (h.sayi > 0) {
      dolgu(hatRenk[i]);
      doc.roundedRect(SOL + 52, y + 0.8, Math.max(3, (h.sayi / hatMax) * 110), 3.2, 1.2, 1.2, "F");
    }
    yazi(8, true, METIN);
    doc.text(String(h.sayi), SAG, y + 3.4, { align: "right" });
    y += 6;
  });
  yazi(7, false, M60);
  doc.text(
    `Satınalma: ${v.satinalma.onay} onay bekliyor · ${v.satinalma.teslim} teslim bekleniyor · ${v.satinalma.fatura} alış faturası bekleniyor`,
    SOL,
    y + 3
  );
  y += 10;

  bolumBasligi("Dikkat gerekenler");
  if (v.dikkat.length === 0) {
    yazi(8.5, false, YESIL);
    doc.text("Bekleyen onay, gecikmiş alacak ya da sorunlu sipariş yok.", SOL, y + 3);
    y += 9;
  } else {
    for (const d of v.dikkat) {
      const satir: string[] = doc.splitTextToSize(temiz(d.metin), GEN - 10);
      const h = satir.length * 3.8 + 2.6;
      yerAc(h + 1.5);
      dolgu(d.ciddi ? [254, 242, 242] : [255, 251, 235]);
      cizgiRenk(d.ciddi ? [254, 202, 202] : [253, 230, 138], 0.2);
      doc.roundedRect(SOL, y, GEN, h, 1.2, 1.2, "FD");
      dolgu(d.ciddi ? KIRMIZI : SARI);
      doc.circle(SOL + 3.5, y + h / 2, 1, "F");
      yazi(7.8, false, d.ciddi ? [127, 29, 29] : [120, 53, 15]);
      doc.text(satir, SOL + 7, y + 3.9);
      y += h + 1.5;
    }
    y += 5;
  }

  // 5. ALACAK YAŞLANDIRMA
  bolumBasligi("Alacak yaşlandırma", 30);
  const yasRenk: Renk[] = [SOGUK, SARI, SICAK, KIRMIZI];
  const yasAd = ["0-30 gün", "31-60 gün", "61-90 gün", "90+ gün"];
  if (v.yaslandirma.yasToplam <= 0.5) {
    yazi(8.5, false, M60);
    doc.text("Açık alacak yok.", SOL, y + 3);
    y += 9;
  } else {
    yerAc(26);
    let bx = SOL;
    v.yaslandirma.toplam.forEach((x, i) => {
      const w = (x / v.yaslandirma.yasToplam) * GEN;
      if (w > 0) {
        dolgu(yasRenk[i]);
        doc.rect(bx, y, w, 5, "F");
        bx += w;
      }
    });
    y += 9;
    v.yaslandirma.toplam.forEach((x, i) => {
      const cx = SOL + i * (GEN / 4);
      dolgu(yasRenk[i]);
      doc.rect(cx, y - 2.3, 2.6, 2.6, "F");
      yazi(7, false, M60);
      doc.text(yasAd[i], cx + 4, y);
      yazi(8.5, true, METIN);
      doc.text(tl(x), cx + 4, y + 4.5);
    });
    y += 10;
    if (v.yaslandirma.enBuyuk.length) {
      tablo(
        [
          { t: "En büyük alacaklar", w: 82 },
          { t: "0-30", w: 25, sag: true },
          { t: "31-90", w: 25, sag: true },
          { t: "90+", w: 25, sag: true },
          { t: "Bakiye", w: 25, sag: true },
        ],
        v.yaslandirma.enBuyuk.map((s) => ({
          h: [s.ad, kisa(s.dilimler[0]), kisa(s.dilimler[1] + s.dilimler[2]), kisa(s.dilimler[3]), tl(s.bakiye)],
          renk: [null, null, null, s.dilimler[3] > 0.5 ? KIRMIZI : null, null] as (Renk | null)[],
        }))
      );
    }
  }

  // 6. SİPARİŞ KÂRLILIĞI
  bolumBasligi("Son siparişlerin kârlılığı", 24);
  if (v.sonSiparisler.length === 0) {
    yazi(8.5, false, M60);
    doc.text("Onaylanmış sipariş yok.", SOL, y + 3);
    y += 9;
  } else {
    tablo(
      [
        { t: "Sipariş", w: 52 },
        { t: "Müşteri", w: 38 },
        { t: "Satış", w: 26, sag: true },
        { t: "Maliyet", w: 24, sag: true },
        { t: "Brüt kâr", w: 26, sag: true },
        { t: "Marj", w: 16, sag: true },
      ],
      v.sonSiparisler.map((s) => {
        const marj = s.satis > 0 && s.maliyetVar ? (s.kar / s.satis) * 100 : null;
        const kr: Renk | null = !s.maliyetVar ? M45 : s.kar < 0 ? KIRMIZI : YESIL;
        return {
          h: [
            `TKL-${String(s.teklifNo).padStart(4, "0")} ${s.baslik}${s.fazlaAlim ? " (çift alım?)" : ""}`,
            s.musteriAd,
            `${s.yaklasik ? "≈ " : ""}${tl(s.satis)}`,
            s.maliyetVar ? tl(s.maliyet) : "girilmedi",
            s.maliyetVar ? tl(s.kar) : "-",
            marj == null ? "-" : yuzde(marj),
          ],
          renk: [s.fazlaAlim ? KIRMIZI : null, M60, null, s.maliyetVar ? null : M45, kr, kr],
        };
      })
    );
  }

  // 7. MÜŞTERİ VE PERSONEL
  const siralama = (baslik: string, liste: YonetimVerisi["enIyiMusteriler"], renk: Renk) => {
    bolumBasligi(baslik, Math.max(10, liste.length * 6.5 + 4));
    if (!liste.length) {
      yazi(8.5, false, M60);
      doc.text("Bu yıl onaylı sipariş yok.", SOL, y + 3);
      y += 9;
      return;
    }
    const enCok = Math.max(1, ...liste.map((x) => x.ciro));
    yerAc(liste.length * 6.5 + 4);
    liste.forEach((x, i) => {
      dolgu(renk);
      doc.circle(SOL + 2, y + 2.3, 2, "F");
      yazi(6.5, true, BEYAZ);
      doc.text(String(i + 1), SOL + 2, y + 3.3, { align: "center" });
      yazi(7.5, false, METIN);
      doc.text(doc.splitTextToSize(temiz(`${x.ad} · ${x.adet} sipariş`), 68)[0] ?? "", SOL + 6, y + 3.3);
      dolgu([238, 242, 243]);
      doc.roundedRect(SOL + 76, y + 1, 76, 3, 1, 1, "F");
      dolgu(renk);
      doc.roundedRect(SOL + 76, y + 1, Math.max(2, (x.ciro / enCok) * 76), 3, 1, 1, "F");
      yazi(7.5, true, METIN);
      doc.text(tl(x.ciro), SAG, y + 3.3, { align: "right" });
      y += 6.5;
    });
    y += 5;
  };
  siralama(`${v.buYil} en çok ciro yapan müşteriler`, v.enIyiMusteriler, SOGUK);
  siralama(`${v.buYil} personel (teklifi hazırlayan)`, v.personel, SICAK);

  // Not
  yerAc(14);
  yazi(6.5, false, M45);
  doc.text(
    doc.splitTextToSize(
      "Ciro: admin onayı almış (iptal / red olmayan) siparişler, onay tarihine göre. Brüt kâr: satış - siparişe bağlı satınalmalar (montaj / işçilik dahil değil). Açık teklif hacmi bugünkü TCMB döviz satış kuruyla yaklaşıktır. Bu rapor maliyet ve kâr bilgisi içerir; şirket içi kullanım içindir.",
      GEN
    ),
    SOL,
    y + 2
  );

  // Sayfa altı
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    cizgiRenk(HAT, 0.2);
    doc.line(SOL, 288, SAG, 288);
    yazi(6.5, false, M45);
    doc.text(`${temiz(sirket.unvan || "İklim Ofisi")} · Yönetim raporu · ${tarihYazi}`, SOL, 292);
    doc.text(`Sayfa ${i} / ${n}`, SAG, 292, { align: "right" });
  }

  return Buffer.from(doc.output("arraybuffer"));
}
