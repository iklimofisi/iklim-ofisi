import { jsPDF } from "jspdf";
import { LIBERATION_SANS_NORMAL, LIBERATION_SANS_KALIN } from "@/lib/pdf-fontlari";
import { PDF_LOGO_JPEG_BASE64, PDF_LOGO_ORAN } from "@/lib/pdf-logo";
import type { HesapSonucu } from "./hesap";
import { sy } from "./hesap";
import type { HesapVerisi } from "./tipler";
import { ISITICILAR } from "./tipler";
import { RADYATOR_TIPLERI, RADYATOR_KATALOG_KAYNAGI } from "./katalog";
import { IL_KAYNAGI } from "./iklim";
import { tesisatSemasi, serimKrokisi, type Cizim } from "./cizim";

// -----------------------------------------------------------------------------
// ISI POMPASI SİSTEM HESABI — PDF RAPORU
// Özet, oda ısı kayıpları, radyatör ve yerden ısıtma seçimleri, ısı pompası
// seçimi (kapasite / yük grafiği), sistem bileşenleri, malzeme listesi,
// tesisat prensip şeması (yatay sayfa) ve oda serim krokileri.
// -----------------------------------------------------------------------------

const YT = "LiberationSans";
type Renk = [number, number, number];
const METIN: Renk = [18, 33, 43];
const METIN_60: Renk = [113, 122, 128];
const METIN_50: Renk = [137, 144, 149];
const SOGUK: Renk = [14, 124, 134];
const SOGUK_DIM: Renk = [11, 100, 108];
const SOGUK_ZEMIN: Renk = [228, 243, 242];
const HAT: Renk = [215, 224, 225];
const SARI_ZEMIN: Renk = [255, 244, 230];
const TURUNCU: Renk = [217, 72, 15];
const MAVI: Renk = [25, 113, 194];

// Yazı tipinde olmayan işaretlerin okunur karşılıkları
function metin(m: string | null | undefined): string {
  if (!m) return "";
  return String(m)
    .replace(/→/g, "->")
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/≈/g, "~")
    .replace(/Δ/g, "d")
    .replace(/σ/g, "s")
    .replace(/θ/g, "t")
    .replace(/λ/g, "l")
    .replace(/Φ/g, "Q")
    .replace(/₺/g, "TL")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "");
}

function hexRenk(h: string): Renk {
  const m = /^#?([0-9a-f]{6})$/i.exec(h);
  if (!m) return [0, 0, 0];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export type PdfBilgi = {
  baslik: string;
  musteri: string | null;
  hazirlayan: string;
  tarih: Date;
};

const trTarih = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" });

export function isiHesapPdfOlustur(
  bilgi: PdfBilgi,
  v: HesapVerisi,
  s: HesapSonucu,
  sirket: { unvan?: string | null; adres?: string | null; email?: string | null; telefon?: string | null; web?: string | null }
): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.addFileToVFS("LiberationSans-Regular.ttf", LIBERATION_SANS_NORMAL);
  doc.addFont("LiberationSans-Regular.ttf", YT, "normal");
  doc.addFileToVFS("LiberationSans-Bold.ttf", LIBERATION_SANS_KALIN);
  doc.addFont("LiberationSans-Bold.ttf", YT, "bold");
  doc.setProperties({ title: metin(bilgi.baslik), creator: metin(sirket.unvan || "İklim Ofisi") });
  const unvan = metin(sirket.unvan || "İklim Ofisi");

  let SOL = 15;
  let SAG = 195;
  let ALT = 280;
  let y = 15;

  const yazi = (boyut: number, kalin: boolean, renk: Renk) => {
    doc.setFont(YT, kalin ? "bold" : "normal");
    doc.setFontSize(boyut);
    doc.setTextColor(...renk);
  };
  const cizgi = (x1: number, y1: number, x2: number, y2: number, renk: Renk = HAT, k = 0.25) => {
    doc.setDrawColor(...renk);
    doc.setLineWidth(k);
    doc.line(x1, y1, x2, y2);
  };
  const yeniSayfa = (yatay = false) => {
    doc.addPage("a4", yatay ? "landscape" : "portrait");
    SOL = 15;
    SAG = yatay ? 282 : 195;
    ALT = yatay ? 193 : 280;
    y = 15;
  };
  const yerAc = (h: number) => {
    if (y + h > ALT) yeniSayfa();
  };
  // Başlık sayfa sonunda yalnız kalmasın: altındaki içerik için de yer aranır
  const bolumBasligi = (m: string, enAz = 34) => {
    yerAc(enAz);
    y += 3;
    yazi(10.5, true, SOGUK_DIM);
    doc.text(metin(m).toLocaleUpperCase("tr-TR"), SOL, y, { charSpace: 0.2 });
    y += 2;
    cizgi(SOL, y, SAG, y, SOGUK, 0.4);
    y += 5;
  };
  const paragraf = (m: string, boyut = 8, renk: Renk = METIN_60) => {
    yazi(boyut, false, renk);
    const sat: string[] = doc.splitTextToSize(metin(m), SAG - SOL);
    for (const st of sat) {
      yerAc(4);
      doc.text(st, SOL, y);
      y += boyut * 0.45;
    }
    y += 1;
  };

  type Sutun = { ad: string; w: number; hiza?: "sol" | "sag" | "orta" };
  const tablo = (sutunlar: Sutun[], satirlar: string[][], ek: { kalinSon?: boolean; boyut?: number } = {}) => {
    const boyut = ek.boyut ?? 7.4;
    const toplamW = sutunlar.reduce((t, c) => t + c.w, 0);
    const olcek = (SAG - SOL) / toplamW;
    const ws = sutunlar.map((c) => c.w * olcek);
    const baslikCiz = () => {
      doc.setFillColor(...SOGUK_ZEMIN);
      doc.rect(SOL, y - 3.6, SAG - SOL, 5.4, "F");
      yazi(boyut - 0.4, true, SOGUK_DIM);
      let x = SOL;
      sutunlar.forEach((c, i) => {
        const tx = c.hiza === "sag" ? x + ws[i] - 1.2 : c.hiza === "orta" ? x + ws[i] / 2 : x + 1.2;
        doc.text(metin(c.ad), tx, y, { align: c.hiza === "sag" ? "right" : c.hiza === "orta" ? "center" : "left" });
        x += ws[i];
      });
      y += 4.6;
    };
    yerAc(12);
    baslikCiz();
    satirlar.forEach((sat, si) => {
      const kalin = ek.kalinSon && si === satirlar.length - 1;
      yazi(boyut, !!kalin, METIN);
      const parcalar = sat.map((h, i) => doc.splitTextToSize(metin(h), ws[i] - 2.4) as string[]);
      const satirSay = Math.max(1, ...parcalar.map((p) => p.length));
      const h = satirSay * boyut * 0.42 + 1.6;
      if (y + h > ALT) {
        yeniSayfa();
        baslikCiz();
        yazi(boyut, !!kalin, METIN);
      }
      let x = SOL;
      parcalar.forEach((p, i) => {
        const c = sutunlar[i];
        const tx = c.hiza === "sag" ? x + ws[i] - 1.2 : c.hiza === "orta" ? x + ws[i] / 2 : x + 1.2;
        doc.text(p, tx, y, { align: c.hiza === "sag" ? "right" : c.hiza === "orta" ? "center" : "left" });
        x += ws[i];
      });
      y += h;
      cizgi(SOL, y - 3.2, SAG, y - 3.2, HAT, 0.15);
    });
    y += 3;
  };

  // Ortak çizim listesini PDF'e basar (x, y sol üst; w genişlik mm)
  const cizimBas = (c: Cizim, x0: number, y0: number, w: number, yaziOlcek = 1) => {
    const k = w / c.w;
    for (const o of c.ogeler) {
      if (o.t === "yazi") {
        yazi((o.b * k * yaziOlcek) / 0.3528, !!o.kalin, hexRenk(o.renk));
        doc.text(metin(o.m), x0 + o.x * k, y0 + o.y * k, { align: o.hiza === "orta" ? "center" : o.hiza === "sag" ? "right" : "left" });
        continue;
      }
      doc.setDrawColor(...hexRenk(o.renk));
      doc.setLineWidth(Math.max(0.08, o.k * k));
      const kesik = "kesik" in o && o.kesik;
      if (kesik) doc.setLineDashPattern([2 * k, 1.5 * k], 0);
      const dolgu = "dolgu" in o && o.dolgu ? hexRenk(o.dolgu) : null;
      if (dolgu) doc.setFillColor(...dolgu);
      const stil = dolgu ? "FD" : "S";
      if (o.t === "cizgi") doc.line(x0 + o.x1 * k, y0 + o.y1 * k, x0 + o.x2 * k, y0 + o.y2 * k);
      else if (o.t === "dortgen") {
        if (o.r && o.r > 0) doc.roundedRect(x0 + o.x * k, y0 + o.y * k, o.w * k, o.h * k, o.r * k, o.r * k, stil);
        else doc.rect(x0 + o.x * k, y0 + o.y * k, o.w * k, o.h * k, stil);
      } else if (o.t === "daire") doc.circle(x0 + o.x * k, y0 + o.y * k, o.r * k, stil);
      else if (o.t === "yol" && o.n.length > 1) {
        const [bx, by] = o.n[0];
        const rel: [number, number][] = [];
        for (let i = 1; i < o.n.length; i++) rel.push([(o.n[i][0] - o.n[i - 1][0]) * k, (o.n[i][1] - o.n[i - 1][1]) * k]);
        doc.lines(rel, x0 + bx * k, y0 + by * k, [1, 1], o.kapali ? stil : "S", !!o.kapali);
      }
      if (kesik) doc.setLineDashPattern([], 0);
    }
  };

  // ===========================================================================
  // SAYFA 1 — ÜST BİLGİ VE ÖZET
  // ===========================================================================
  const logoH = 13;
  try {
    doc.addImage(PDF_LOGO_JPEG_BASE64, "JPEG", SOL, 12, logoH * PDF_LOGO_ORAN, logoH, "ikl-logo", "FAST");
  } catch {
    /* logo olmadan devam */
  }
  const bx = SOL + logoH * PDF_LOGO_ORAN + 4;
  yazi(12, true, METIN);
  doc.text(unvan, bx, 16.5);
  yazi(7.5, false, METIN_50);
  let uy = 20.5;
  if (sirket.adres) {
    const a: string[] = doc.splitTextToSize(metin(sirket.adres), 100);
    doc.text(a, bx, uy);
    uy += 3.4 * a.length;
  }
  const iletisim = [sirket.telefon, sirket.email].filter(Boolean).map((x) => metin(x as string)).join(" · ");
  if (iletisim) doc.text(iletisim, bx, uy);
  yazi(15, true, METIN);
  doc.text("ISI POMPASI SİSTEM HESABI", SAG, 18, { align: "right" });
  yazi(8, false, METIN_60);
  doc.text(`Tarih: ${trTarih.format(bilgi.tarih)}`, SAG, 23.5, { align: "right" });
  y = 33;
  cizgi(SOL, y, SAG, y);
  y += 8;
  yazi(14, true, METIN);
  const bas: string[] = doc.splitTextToSize(metin(bilgi.baslik), SAG - SOL);
  doc.text(bas, SOL, y);
  y += 6 * bas.length;
  yazi(8.5, false, METIN_60);
  const alt = [bilgi.musteri ? `Müşteri: ${bilgi.musteri}` : null, v.adres ? `Adres: ${v.adres}` : null, bilgi.hazirlayan ? `Hazırlayan: ${bilgi.hazirlayan}` : null]
    .filter(Boolean)
    .join("   ·   ");
  if (alt) {
    const a: string[] = doc.splitTextToSize(metin(alt), SAG - SOL);
    doc.text(a, SOL, y);
    y += 4 * a.length;
  }
  y += 3;

  // Özet kutuları
  const kutular: [string, string][] = [
    ["Dış tasarım sıcaklığı", `${sy(s.disSicaklik)} °C (${s.il})`],
    ["Isıtılan alan", `${sy(s.toplamAlan)} m²`],
    ["Odaların ısı kaybı", `${sy(s.isiKaybi / 1000, 2)} kW`],
    ["Yerden ısıtma alt kaybı", `${sy(s.altKayip / 1000, 2)} kW`],
    ["Kullanım suyu payı", `${sy(s.sicakSuYuku / 1000, 2)} kW`],
    ["Isı pompası tasarım yükü", `${sy(s.tasarimYuku / 1000, 2)} kW`],
    ["Özgül ısı yükü", `${sy(s.wm2, 0)} W/m²`],
    ["Isı pompası gidiş", `${sy(s.pompaGidis)} °C`],
  ];
  const kw = (SAG - SOL - 9) / 4;
  kutular.forEach(([a, b], i) => {
    const kx = SOL + (i % 4) * (kw + 3);
    const ky = y + Math.floor(i / 4) * 17;
    doc.setFillColor(...(i === 5 ? SARI_ZEMIN : SOGUK_ZEMIN));
    doc.roundedRect(kx, ky, kw, 14, 1.5, 1.5, "F");
    yazi(7, false, METIN_60);
    doc.text(metin(a), kx + 3, ky + 5);
    yazi(10.5, true, i === 5 ? TURUNCU : METIN);
    doc.text(metin(b), kx + 3, ky + 11);
  });
  y += 37;

  // Seçilen ısı pompası
  if (s.secilenModel) {
    const m = s.secilenModel;
    doc.setFillColor(...(m.uygun ? SOGUK_ZEMIN : SARI_ZEMIN));
    const sat = doc.splitTextToSize(metin(m.neden), SAG - SOL - 8) as string[];
    const h = 13 + sat.length * 3.6;
    doc.roundedRect(SOL, y, SAG - SOL, h, 1.5, 1.5, "F");
    yazi(9.5, true, METIN);
    doc.text(metin(`Önerilen ısı pompası: ${m.ad}`), SOL + 4, y + 6);
    yazi(8, false, METIN_60);
    doc.text(
      metin(
        `${sy(s.disSicaklik)} °C / ${sy(s.pompaGidis)} °C'de ${sy(m.kapasiteTasarim)} kW · A7/W35 ${sy(m.kapasiteNominal)} kW · denge noktası ${m.dengeNoktasi === null ? "-" : sy(m.dengeNoktasi) + " °C"}`
      ),
      SOL + 4,
      y + 10.5
    );
    doc.text(sat, SOL + 4, y + 14.5);
    y += h + 4;
  } else {
    paragraf(
      `Isı pompası en az ${sy(s.tasarimYuku / 1000, 2)} kW (${sy(s.disSicaklik)} °C dış hava, ${sy(s.pompaGidis)} °C gidiş suyunda) kapasiteli seçilmelidir. Model önerisi için panelde ısı pompası modelleri tanımlanmalıdır.`,
      8.5,
      METIN
    );
  }

  // Sistem özeti
  bolumBasligi("Sistem tasarım değerleri");
  tablo(
    [
      { ad: "Değer", w: 60 },
      { ad: "Sonuç", w: 120 },
    ],
    [
      ["Dış hava tasarım sıcaklığı", `${sy(s.disSicaklik)} °C — ${s.disSicaklikKaynak === "TS 2164" ? IL_KAYNAGI : "elle girildi"}`],
      ["Isı köprüsü ek U değeri", `${sy(v.isiKoprusu, 2)} W/m²K`],
      ["Yön artırımı / ısınma artırımı", `${v.yonArtirimi ? "uygulandı" : "uygulanmadı"} / %${sy(v.isinmaArtirimi, 0)}`],
      ...(s.radyatorVar ? [["Radyatör rejimi", `${sy(s.radyatorRejimi.gidis)}/${sy(s.radyatorRejimi.donus)} °C (TS EN 442)`]] : []),
      ...(s.yerdenVar
        ? [
            [
              "Yerden ısıtma",
              `gidiş ${sy(s.yerdenGidis ?? 0)} °C, ortalama dönüş ${sy(s.yerdenDonusOrt ?? 0)} °C, tasarım odası: ${s.yerdenTasarimOdasi ?? "-"}, boru ${v.yerdenBoru.replace("x", "×")} mm, şap üstü ${sy(v.sapUstu * 100, 1)} cm`,
            ],
          ]
        : []),
      ["İşletme şekli", v.isletme === "MONOVALENT" ? "Monovalent (ısı pompası tek başına)" : `Monoenerjetik (ısı pompası + elektrikli ısıtıcı), hedef denge noktası ${sy(v.bivalentNokta)} °C`],
      ["Kullanım suyu", v.sicakSu ? `${v.kisiSayisi} kişi, ${sy(v.sicakSuSicaklik)} °C` : "Yok"],
      ["Emniyet payı", `%${sy(v.emniyetPayi, 0)}`],
    ]
  );

  // ===========================================================================
  // ODA ISI KAYIPLARI
  // ===========================================================================
  bolumBasligi("Oda ısı kayıpları (EN 12831 basitleştirilmiş yöntem)");
  tablo(
    [
      { ad: "Oda", w: 34 },
      { ad: "Alan m²", w: 14, hiza: "sag" },
      { ad: "İç °C", w: 12, hiza: "sag" },
      { ad: "İletim W", w: 17, hiza: "sag" },
      { ad: "Havaland. W", w: 19, hiza: "sag" },
      { ad: "Toplam W", w: 17, hiza: "sag" },
      { ad: "W/m²", w: 13, hiza: "sag" },
      { ad: "Isıtıcı", w: 36 },
    ],
    [
      ...s.odalar.map((o) => [
        o.ad,
        sy(o.alan),
        sy(o.sicaklik, 0),
        sy(o.iletim + o.isinma * (o.iletim / Math.max(1, o.iletim + o.havalandirma)), 0),
        sy(o.havalandirma + o.isinma * (o.havalandirma / Math.max(1, o.iletim + o.havalandirma)), 0),
        sy(o.toplam, 0),
        sy(o.wm2, 0),
        ISITICILAR[o.isitici],
      ]),
      ["TOPLAM", sy(s.toplamAlan), "", "", "", sy(s.isiKaybi, 0), sy(s.toplamAlan > 0 ? s.isiKaybi / s.toplamAlan : 0, 0), ""],
    ],
    { kalinSon: true }
  );

  // RADYATÖRLER
  const radOdalar = s.odalar.filter((o) => o.radyator && o.radyator.parcalar.length);
  if (radOdalar.length) {
    bolumBasligi(`Radyatör seçimi — ${sy(s.radyatorRejimi.gidis, 0)}/${sy(s.radyatorRejimi.donus, 0)} °C`);
    tablo(
      [
        { ad: "Oda", w: 34 },
        { ad: "Gereken W", w: 18, hiza: "sag" },
        { ad: "Seçim (tip · yükseklik × boy)", w: 62 },
        { ad: "Verilen W", w: 18, hiza: "sag" },
        { ad: "Fazla %", w: 14, hiza: "sag" },
        { ad: "W/m (1 m)", w: 16, hiza: "sag" },
      ],
      radOdalar.map((o) => {
        const r = o.radyator!;
        const gruplar = new Map<string, number>();
        for (const p of r.parcalar) {
          const ad = `${RADYATOR_TIPLERI[p.tip].kisa} ${p.yukseklik}×${p.boy}`;
          gruplar.set(ad, (gruplar.get(ad) ?? 0) + 1);
        }
        const secim = [...gruplar.entries()].map(([a, n]) => (n > 1 ? `${n} × ${a}` : a)).join(" + ");
        return [o.ad + (r.takviye ? " (takviye)" : ""), sy(r.gerekenGuc, 0), secim, sy(r.toplamGuc, 0), sy(r.fazlalik, 0), sy(r.w1000, 0)];
      })
    );
    paragraf(`Radyatör güçleri ${RADYATOR_KATALOG_KAYNAGI}; düşük sıcaklık düzeltmesi logaritmik sıcaklık farkı ve tip/yüksekliğe özgü n üssüyle yapılmıştır.`, 7);
  }

  // YERDEN ISITMA
  const yerOdalar = s.odalar.filter((o) => o.yerden);
  if (yerOdalar.length) {
    bolumBasligi(`Yerden ısıtma tasarımı (EN 1264) — gidiş ${sy(s.yerdenGidis ?? 0)} °C`);
    tablo(
      [
        { ad: "Oda", w: 26 },
        { ad: "Net m²", w: 12, hiza: "sag" },
        { ad: "q ist./sağ. W/m²", w: 22, hiza: "sag" },
        { ad: "Aralık", w: 12, hiza: "sag" },
        { ad: "Devre × m", w: 18, hiza: "sag" },
        { ad: "Dönüş °C", w: 14, hiza: "sag" },
        { ad: "Debi L/h", w: 14, hiza: "sag" },
        { ad: "dP mbar", w: 13, hiza: "sag" },
        { ad: "Yüzey °C", w: 13, hiza: "sag" },
        { ad: "Eksik W", w: 13, hiza: "sag" },
        { ad: "Kol.", w: 9, hiza: "orta" },
      ],
      yerOdalar.map((o) => {
        const y2 = o.yerden!;
        return [
          o.ad,
          sy(y2.alan),
          `${sy(y2.gerekenAkis, 0)} / ${sy(y2.akis, 0)}`,
          `${Math.round(y2.aralik * 100)} cm`,
          `${y2.devreSayisi} × ${sy(y2.devreBoyu, 0)}`,
          sy(y2.donus),
          sy(y2.debi / 0.994, 0),
          sy(y2.basincKaybi, 0),
          sy(y2.yuzey),
          y2.eksikGuc > 1 ? sy(y2.eksikGuc, 0) : "-",
          String(y2.kollektor),
        ];
      })
    );
    if (s.kollektorler.length) {
      tablo(
        [
          { ad: "Kollektör", w: 20 },
          { ad: "Ağız", w: 12, hiza: "sag" },
          { ad: "Debi L/h", w: 16, hiza: "sag" },
          { ad: "Besleme borusu", w: 30 },
          { ad: "En kötü devre dP", w: 26, hiza: "sag" },
          { ad: "Odalar", w: 76 },
        ],
        s.kollektorler.map((k) => [
          `Kollektör ${k.no}`,
          String(k.agiz),
          sy(k.debi, 0),
          k.boru ? `${k.boru.ad} (${sy(k.boru.hiz, 2)} m/s)` : "-",
          `${sy(k.enKotuKayip, 0)} mbar`,
          k.odalar.join(", "),
        ])
      );
    }
    paragraf(
      "Isıl güç EN 1264-2 Ek A (Tip A, boru şap içinde) formülüyle; yüzey sıcaklığı sınırı yaşam alanında 29 °C, banyoda iç sıcaklık + 9 K alınmıştır. Devre basınç kayıpları Darcy-Weisbach ile %10 tekil kayıp payıyla hesaplanmıştır. Devre debileri kollektör debimetrelerinde bu değerlere ayarlanmalıdır.",
      7
    );
  }

  // ISI POMPASI
  bolumBasligi("Isı pompası seçimi");
  if (s.modeller.length) {
    tablo(
      [
        { ad: "Model", w: 40 },
        { ad: "A7/W35 kW", w: 16, hiza: "sag" },
        { ad: "Tasarımda kW", w: 18, hiza: "sag" },
        { ad: "Denge °C", w: 14, hiza: "sag" },
        { ad: "Yedek kW", w: 14, hiza: "sag" },
        { ad: "Değerlendirme", w: 78 },
      ],
      s.modeller.map((m) => [
        (s.secilenModel?.id === m.id ? "» " : "") + m.ad,
        sy(m.kapasiteNominal),
        sy(m.kapasiteTasarim),
        m.dengeNoktasi === null ? "-" : sy(m.dengeNoktasi),
        m.yedekGerekli > 0.05 ? sy(m.yedekGerekli) : "-",
        (m.uygun ? "Uygun. " : "Uygun değil. ") + m.neden,
      ])
    );
  }
  // Yük / kapasite grafiği
  {
    yerAc(78);
    const gx = SOL + 12;
    const gy = y + 2;
    const gw = SAG - SOL - 20;
    const gh = 52;
    const noktalar = s.yukEgrisi;
    const tMin = noktalar[0]?.t ?? -10;
    const tMaks = noktalar[noktalar.length - 1]?.t ?? 16;
    const yMaks = Math.max(1, ...noktalar.map((n) => Math.max(n.yuk, n.kap ?? 0))) * 1.1;
    const px = (t: number) => gx + ((t - tMin) / (tMaks - tMin)) * gw;
    const py = (k: number) => gy + gh - (k / yMaks) * gh;
    cizgi(gx, gy + gh, gx + gw, gy + gh, METIN_50, 0.3);
    cizgi(gx, gy, gx, gy + gh, METIN_50, 0.3);
    yazi(6.5, false, METIN_50);
    for (let t = Math.ceil(tMin / 2) * 2; t <= tMaks; t += 2) {
      cizgi(px(t), gy + gh, px(t), gy + gh + 1, METIN_50, 0.2);
      doc.text(String(t), px(t), gy + gh + 4, { align: "center" });
    }
    const adim = yMaks > 20 ? 5 : yMaks > 8 ? 2 : 1;
    for (let k = 0; k <= yMaks; k += adim) {
      cizgi(gx, py(k), gx + gw, py(k), HAT, 0.1);
      doc.text(String(k), gx - 2, py(k) + 1, { align: "right" });
    }
    doc.text("Dış hava sıcaklığı °C", gx + gw / 2, gy + gh + 8, { align: "center" });
    doc.text("kW", gx - 8, gy + 2);
    const ciz = (deg: (n: (typeof noktalar)[number]) => number | null, renk: Renk) => {
      doc.setDrawColor(...renk);
      doc.setLineWidth(0.6);
      for (let i = 1; i < noktalar.length; i++) {
        const a = deg(noktalar[i - 1]);
        const b = deg(noktalar[i]);
        if (a === null || b === null) continue;
        doc.line(px(noktalar[i - 1].t), py(a), px(noktalar[i].t), py(b));
      }
    };
    ciz((n) => n.yuk, TURUNCU);
    ciz((n) => n.kap, MAVI);
    // tasarım sıcaklığı
    doc.setLineDashPattern([1, 1], 0);
    cizgi(px(s.disSicaklik), gy, px(s.disSicaklik), gy + gh, METIN_50, 0.2);
    doc.setLineDashPattern([], 0);
    yazi(6.5, false, METIN_50);
    doc.text(`tasarım ${sy(s.disSicaklik)} °C`, px(s.disSicaklik) + 1, gy + 3);
    // lejant (grafiğin altında)
    const ly = gy + gh + 12;
    cizgi(gx, ly - 1, gx + 6, ly - 1, TURUNCU, 0.8);
    doc.text("Bina ısı yükü + sıcak su", gx + 8, ly);
    if (s.secilenModel) {
      cizgi(gx + 60, ly - 1, gx + 66, ly - 1, MAVI, 0.8);
      doc.text(metin(`${s.secilenModel.ad} kapasitesi (${sy(s.pompaGidis)} °C gidiş)`), gx + 68, ly);
    }
    y = ly + 6;
  }

  // SİSTEM BİLEŞENLERİ
  bolumBasligi("Sistem bileşenleri");
  const bilesen: string[][] = [];
  if (s.boyler)
    bilesen.push(["Boyler", `${s.boyler.hacim} L (gerekli ~${sy(s.boyler.gerekli, 0)} L), ısı pompası uyumlu, serpantin en az ${sy(s.boyler.serpantinM2)} m²; sıhhi genleşme tankı ${s.boyler.genlesme} L`]);
  bilesen.push([
    "Tampon tank",
    s.tampon.hacim > 0 ? `${Math.round(s.tampon.hacim)} L${s.tampon.mod === "OTOMATIK" ? ` (en az ${sy(s.tampon.gerekli, 0)} L: 20 L/kW)` : ""}` : "Yok",
  ]);
  bilesen.push(["Sistem su hacmi", `~${sy(s.sistemSuHacmi, 0)} L`]);
  bilesen.push([
    "Kapalı genleşme tankı (EN 12828)",
    `${s.genlesme.hacim} L (gerekli ${sy(s.genlesme.gerekli)} L) · ön basınç ${sy(s.genlesme.onBasinc)} bar · dolum basıncı ${sy(s.genlesme.dolum)} bar · emniyet ventili ${s.genlesme.emniyet} bar · maks. ${sy(s.genlesme.maksSicaklik, 0)} °C (e = ${sy(s.genlesme.e, 4)})`,
  ]);
  if (s.hatlar.pompa) bilesen.push(["Isı pompası bağlantı hattı", `${s.hatlar.pompa.ad} · ${sy(s.pompalar.pompaDebi, 0)} L/h · ${sy(s.hatlar.pompa.hiz, 2)} m/s (dT 5 K)`]);
  if (s.hatlar.radyator)
    bilesen.push(["Radyatör ana hattı", `${s.hatlar.radyator.ad} · ${sy(s.pompalar.radyatorDebi, 0)} L/h · ${sy(s.hatlar.radyator.hiz, 2)} m/s · pompa ~${sy(s.pompalar.radyatorBasma)} mSS`]);
  if (s.hatlar.yerden)
    bilesen.push(["Yerden ısıtma ana hattı", `${s.hatlar.yerden.ad} · ${sy(s.pompalar.yerdenDebi, 0)} L/h · ${sy(s.hatlar.yerden.hiz, 2)} m/s · pompa ~${sy(s.pompalar.yerdenBasma)} mSS`]);
  if (s.karisimVanasiKvs) bilesen.push(["Karışım vanası", `3 yollu, motorlu, Kvs ${sy(s.karisimVanasiKvs)}`]);
  tablo(
    [
      { ad: "Bileşen", w: 50 },
      { ad: "Seçim", w: 130 },
    ],
    bilesen
  );
  paragraf("Pompa basma yükseklikleri tahminidir; nihai pompa seçiminde güzergâh ve armatür kayıpları ile üretici eğrileri kontrol edilmelidir.", 7);

  // UYARILAR
  const tumUyarilar = [...s.uyarilar, ...s.odalar.flatMap((o) => o.uyarilar.map((u) => `${o.ad}: ${u}`))];
  if (tumUyarilar.length) {
    bolumBasligi("Uyarılar ve öneriler");
    for (const u of tumUyarilar) paragraf(`• ${u}`, 7.8, METIN);
  }

  // MALZEME LİSTESİ
  bolumBasligi("Malzeme listesi");
  const bolumler = [...new Set(s.malzemeler.map((m) => m.bolum))];
  for (const b of bolumler) {
    yerAc(12);
    yazi(8.2, true, METIN);
    doc.text(metin(b), SOL, y);
    y += 4;
    tablo(
      [
        { ad: "Malzeme", w: 140 },
        { ad: "Miktar", w: 20, hiza: "sag" },
        { ad: "Birim", w: 20 },
      ],
      s.malzemeler.filter((m) => m.bolum === b).map((m) => [m.aciklama, sy(m.adet, 2), m.birim])
    );
  }

  // ODA ELEMAN DETAYLARI (ek)
  bolumBasligi("Ek — yapı elemanı ısı kayıpları");
  for (const o of s.odalar) {
    if (!o.elemanlar.length) continue;
    yerAc(14);
    yazi(8, true, METIN);
    doc.text(metin(`${o.ad} — ${sy(o.alan)} m², ${sy(o.sicaklik, 0)} °C, havalandırma ${sy(o.havalandirma, 0)} W`), SOL, y);
    y += 4;
    tablo(
      [
        { ad: "Eleman", w: 70 },
        { ad: "Alan m²", w: 16, hiza: "sag" },
        { ad: "U W/m²K", w: 16, hiza: "sag" },
        { ad: "U+köprü", w: 16, hiza: "sag" },
        { ad: "dT K", w: 14, hiza: "sag" },
        { ad: "Yön %", w: 12, hiza: "sag" },
        { ad: "Kayıp W", w: 16, hiza: "sag" },
      ],
      o.elemanlar.map((e) => [
        e.ad + (e.dosemeYerden ? " (yerden ısıtma alt kaybında)" : ""),
        sy(e.alan, 2),
        sy(e.u, 3),
        sy(e.uEtkin, 3),
        sy(e.sicaklikFarki, 1),
        e.artirim ? sy(e.artirim * 100, 0) : "-",
        e.dosemeYerden ? "-" : sy(e.kayip, 0),
      ]),
      { boyut: 7 }
    );
  }
  bolumBasligi("Yöntem ve kabuller");
  paragraf(
    [
      `Dış hava tasarım sıcaklıkları: ${IL_KAYNAGI}.`,
      "İletim kaybı: Φ = A · (U + ΔU_TB) · ΔT · (1 + yön artırımı); toprağa temaslı elemanlarda ΔT × 0,5 (TS 825), ısıtılmayan hacimlerde ΔT × b (EN 12831).",
      "Havalandırma kaybı: Φ = 0,34 · V · n · ΔT; n en az hava değişim sayısıdır (yaşam mahalli 0,5, mutfak/banyo 1,5 1/h).",
      "Yerden ısıtmalı odalarda döşeme kaybı oda yüküne katılmaz; boru altından kaçan ısı (EN 1264-3) ısı pompası yüküne eklenir.",
      "Isı pompası kapasitesi katalog noktaları (A7/W35, A-7/W35, A-7/W55, varsa A-15/W35) arasında doğrusal ara değerle hesaplanır.",
      "Kullanım suyu için kişi başı 0,25 kW eklenmiştir; boyler hacmi kişi başı 50 L (50 °C) esas alınmıştır.",
      "Bu hesap ön proje niteliğindedir; uygulama projesinde mimari ölçüler ve üretici teknik verileriyle kontrol edilmelidir.",
    ].join(" "),
    7.2
  );

  // ===========================================================================
  // PRENSİP ŞEMASI (yatay sayfa)
  // ===========================================================================
  yeniSayfa(true);
  const sema = tesisatSemasi(s, bilgi.baslik);
  const semaW = SAG - SOL;
  cizimBas(sema, SOL, 12, Math.min(semaW, (185 * sema.w) / sema.h), 1.12);

  // ===========================================================================
  // SERİM KROKİLERİ (sayfada iki tane)
  // ===========================================================================
  const krokiler = s.odalar
    .map((o) => {
      const ham = v.odalar.find((x) => x.id === o.id);
      return ham ? serimKrokisi(o, ham.en, ham.boy, ham.haricAlan, ham.kollektorMesafe) : null;
    })
    .filter(Boolean) as Cizim[];
  krokiler.forEach((c, i) => {
    if (i % 2 === 0) yeniSayfa(false);
    const w = 172;
    const h = (w * c.h) / c.w;
    cizimBas(c, 19, 14 + (i % 2) * (h + 6), w);
  });

  // ===========================================================================
  // SAYFA ALTLIĞI
  // ===========================================================================
  const toplam = doc.getNumberOfPages();
  const altBilgi = [unvan, sirket.telefon, sirket.email, sirket.web].filter(Boolean).map((x) => metin(x as string)).join("  ·  ");
  for (let i = 1; i <= toplam; i++) {
    doc.setPage(i);
    const yatay = doc.internal.pageSize.getWidth() > doc.internal.pageSize.getHeight();
    const sag = yatay ? 282 : 195;
    const altY = yatay ? 203 : 290;
    cizgi(15, altY - 4, sag, altY - 4);
    yazi(7, false, METIN_50);
    doc.text(altBilgi, 15, altY);
    doc.text(`Sayfa ${i} / ${toplam}`, sag, altY, { align: "right" });
  }
  return Buffer.from(doc.output("arraybuffer"));
}
