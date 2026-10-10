import { jsPDF } from "jspdf";
import { LIBERATION_SANS_NORMAL, LIBERATION_SANS_KALIN } from "@/lib/pdf-fontlari";
import { PDF_LOGO_JPEG_BASE64, PDF_LOGO_ORAN } from "@/lib/pdf-logo";
import { sy } from "@/lib/isi-hesap/hesap";
import { IL_KAYNAGI } from "@/lib/isi-hesap/iklim";
import type { Cizim } from "@/lib/isi-hesap/cizim";
import type { KlimaSonucu } from "./hesap";
import type { KlimaVerisi } from "./tipler";
import { KULLANIMLAR, AKISKANLAR, borAdi } from "./katalog";
import { boruSemasi } from "./cizim";

// -----------------------------------------------------------------------------
// KLİMA / VRF SİSTEM HESABI — PDF RAPORU
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

export type KlimaPdfBilgi = { baslik: string; musteri: string | null; hazirlayan: string; tarih: Date };
const trTarih = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" });

export function klimaHesapPdfOlustur(
  bilgi: KlimaPdfBilgi,
  v: KlimaVerisi,
  s: KlimaSonucu,
  sirket: { unvan?: string | null; adres?: string | null; email?: string | null; telefon?: string | null; web?: string | null }
): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.addFileToVFS("LiberationSans-Regular.ttf", LIBERATION_SANS_NORMAL);
  doc.addFont("LiberationSans-Regular.ttf", YT, "normal");
  doc.addFileToVFS("LiberationSans-Bold.ttf", LIBERATION_SANS_KALIN);
  doc.addFont("LiberationSans-Bold.ttf", YT, "bold");
  doc.setProperties({ title: metin(bilgi.baslik), creator: metin(sirket.unvan || "İklim Ofisi") });
  const unvan = metin(sirket.unvan || "İklim Ofisi");

  const SOL = 15;
  const SAG = 195;
  const ALT = 280;
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
  const yeniSayfa = () => {
    doc.addPage("a4", "portrait");
    y = 15;
  };
  const yerAc = (h: number) => {
    if (y + h > ALT) yeniSayfa();
  };
  const bolumBasligi = (m: string, enAz = 34) => {
    yerAc(enAz);
    y += 3;
    yazi(10.5, true, SOGUK_DIM);
    doc.text(metin(m).toLocaleUpperCase("tr-TR"), SOL, y, { charSpace: 0.2 });
    y += 2;
    cizgi(SOL, y, SAG, y, SOGUK, 0.4);
    y += 5;
  };
  const altBaslik = (m: string) => {
    yerAc(14);
    yazi(8.6, true, METIN);
    doc.text(metin(m), SOL, y);
    y += 4.2;
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
    const boyut = ek.boyut ?? 7.2;
    const toplamW = sutunlar.reduce((t, c) => t + c.w, 0);
    const ws = sutunlar.map((c) => (c.w * (SAG - SOL)) / toplamW);
    const hizaX = (c: Sutun, x: number, w: number) => (c.hiza === "sag" ? x + w - 1.2 : c.hiza === "orta" ? x + w / 2 : x + 1.2);
    const al = (c: Sutun) => (c.hiza === "sag" ? "right" : c.hiza === "orta" ? "center" : "left") as "right" | "center" | "left";
    const baslikCiz = () => {
      doc.setFillColor(...SOGUK_ZEMIN);
      doc.rect(SOL, y - 3.6, SAG - SOL, 5.4, "F");
      yazi(boyut - 0.4, true, SOGUK_DIM);
      let x = SOL;
      sutunlar.forEach((c, i) => {
        doc.text(metin(c.ad), hizaX(c, x, ws[i]), y, { align: al(c) });
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
      const h = Math.max(1, ...parcalar.map((p) => p.length)) * boyut * 0.42 + 1.6;
      if (y + h > ALT) {
        yeniSayfa();
        baslikCiz();
        yazi(boyut, !!kalin, METIN);
      }
      let x = SOL;
      parcalar.forEach((p, i) => {
        doc.text(p, hizaX(sutunlar[i], x, ws[i]), y, { align: al(sutunlar[i]) });
        x += ws[i];
      });
      y += h;
      cizgi(SOL, y - 3.2, SAG, y - 3.2, HAT, 0.15);
    });
    y += 3;
  };
  const cizimBas = (c: Cizim, x0: number, y0: number, w: number) => {
    const k = w / c.w;
    for (const o of c.ogeler) {
      if (o.t === "yazi") {
        yazi((o.b * k) / 0.3528, !!o.kalin, hexRenk(o.renk));
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

  // ÜST BİLGİ
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
  doc.text("KLİMA / VRF SİSTEM HESABI", SAG, 18, { align: "right" });
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

  const klimaAlan = s.odalar.filter((o) => o.klima).reduce((t, o) => t + o.alan, 0);
  const uniteSayisi = s.sistemler.reduce((t, x) => t + x.uniteler.length, 0) + s.splitler.reduce((t, o) => t + (o.unite?.adet ?? 0), 0);
  const kutular: [string, string][] = [
    ["Yaz tasarım (KT / YT)", `${sy(s.yazKT)} / ${sy(s.yazYT)} °C`],
    ["Kış tasarım", `${sy(s.disSicaklik)} °C (${s.il})`],
    ["Klimalanan alan", `${sy(klimaAlan)} m²`],
    ["İç ünite sayısı", String(uniteSayisi)],
    ["Toplam soğutma yükü", `${sy(s.toplamSogutma / 1000, 2)} kW`],
    ["Toplam ısıtma yükü", v.isitmaDa ? `${sy(s.toplamIsitma / 1000, 2)} kW` : "—"],
    ["Ortalama soğutma", `${sy(klimaAlan > 0 ? s.toplamSogutma / klimaAlan : 0, 0)} W/m²`],
    ["Sistem", `${s.sistemler.length} sistem + ${s.splitler.length} split`],
  ];
  const kw = (SAG - SOL - 9) / 4;
  kutular.forEach(([a, b], i) => {
    const kx = SOL + (i % 4) * (kw + 3);
    const ky = y + Math.floor(i / 4) * 17;
    doc.setFillColor(...(i === 4 ? SARI_ZEMIN : SOGUK_ZEMIN));
    doc.roundedRect(kx, ky, kw, 14, 1.5, 1.5, "F");
    yazi(7, false, METIN_60);
    doc.text(metin(a), kx + 3, ky + 5);
    yazi(10.5, true, i === 4 ? TURUNCU : METIN);
    doc.text(metin(b), kx + 3, ky + 11);
  });
  y += 37;

  bolumBasligi("Tasarım değerleri");
  tablo(
    [
      { ad: "Değer", w: 60 },
      { ad: "Sonuç", w: 120 },
    ],
    [
      ["Dış hava (yaz)", `${sy(s.yazKT)} °C kuru / ${sy(s.yazYT)} °C yaş termometre · nem ${sy(s.disNem, 1)} g/kg`],
      ["Dış hava (kış)", `${sy(s.disSicaklik)} °C — ${IL_KAYNAGI}`],
      ["İç ortam (yaz)", `odaya göre (varsayılan 26 °C) · %${sy(v.icNem, 0)} bağıl nem`],
      ["Kullanım", KULLANIMLAR[v.kullanim].ad],
      ["Emniyet payı / eşzamanlılık", `%${sy(v.emniyetPayi, 0)} (iç ünite) / %${sy(v.eszamanlilik, 0)} (dış ünite)`],
      ["Soğutucu akışkan", AKISKANLAR[v.akiskan].ad],
      ["Isıtma", v.isitmaDa ? "Klimalar ısıtmada da kullanılıyor (dış ünite ısıtma kapasitesi kontrol edildi)" : "Yalnız soğutma"],
    ]
  );

  bolumBasligi("Oda soğutma ve ısıtma yükleri");
  const kalem = (o: KlimaSonucu["odalar"][number], ad: string) => o.kalemler.find((k) => k.ad.startsWith(ad));
  tablo(
    [
      { ad: "Oda", w: 26 },
      { ad: "m²", w: 10, hiza: "sag" },
      { ad: "Güneş", w: 13, hiza: "sag" },
      { ad: "İletim", w: 13, hiza: "sag" },
      { ad: "İç kaz.", w: 13, hiza: "sag" },
      { ad: "Havaland.", w: 15, hiza: "sag" },
      { ad: "Duyulur", w: 14, hiza: "sag" },
      { ad: "Gizli", w: 12, hiza: "sag" },
      { ad: "Toplam W", w: 15, hiza: "sag" },
      { ad: "W/m²", w: 11, hiza: "sag" },
      { ad: "Isıtma W", w: 14, hiza: "sag" },
      { ad: "İç ünite", w: 34 },
    ],
    [
      ...s.odalar
        .filter((o) => o.klima)
        .map((o) => {
          const ic = (kalem(o, "Kişi")?.duyulur ?? 0) + (kalem(o, "Kişi")?.gizli ?? 0) + (kalem(o, "Aydınlatma")?.duyulur ?? 0) + (kalem(o, "Cihazlar")?.duyulur ?? 0);
          const hv = (kalem(o, "Havalandırma")?.duyulur ?? 0) + (kalem(o, "Havalandırma")?.gizli ?? 0);
          return [
            o.ad,
            sy(o.alan),
            sy(kalem(o, "Camdan")?.duyulur ?? 0, 0),
            sy((kalem(o, "Cam iletimi")?.duyulur ?? 0) + (kalem(o, "Duvar")?.duyulur ?? 0), 0),
            sy(ic, 0),
            sy(hv, 0),
            sy(o.duyulur, 0),
            sy(o.gizli, 0),
            sy(o.sogutma, 0),
            sy(o.wm2, 0),
            v.isitmaDa ? sy(o.isitma, 0) : "-",
            o.unite ? `${o.unite.adet > 1 ? o.unite.adet + " × " : ""}${o.unite.ad}${o.sistem ? ` (S${o.sistem})` : " (split)"}` : "-",
          ];
        }),
      ["TOPLAM", sy(klimaAlan), "", "", "", "", "", "", sy(s.toplamSogutma, 0), "", v.isitmaDa ? sy(s.toplamIsitma, 0) : "-", ""],
    ],
    { kalinSon: true, boyut: 6.8 }
  );
  paragraf(`İç ünite seçiminde soğutma yüküne %${sy(v.emniyetPayi, 0)} emniyet payı eklenmiş; ısıtmada iç ünite nominal ısıtma kapasitesi soğutmanın 1,12 katı alınmıştır.`, 7);

  for (const x of s.sistemler) {
    bolumBasligi(`${x.ad} — ${x.tipAdi}`, 60);
    tablo(
      [
        { ad: "Değer", w: 60 },
        { ad: "Sonuç", w: 120 },
      ],
      [
        ["İç ünite toplamı", `${x.uniteler.length} adet · ${sy(x.icToplamKw)} kW (nominal soğutma)`],
        ["Sistem soğutma yükü", `${sy(x.sogutmaYuku, 2)} kW (eşzamanlılık %${sy(v.eszamanlilik, 0)} dahil)`],
        ...(v.isitmaDa ? [["Sistem ısıtma yükü", `${sy(x.isitmaYuku, 2)} kW`]] : []),
        ["Dış ünite", x.disKw ? `${sy(x.disKw)} kW soğutma / ${sy(x.disIsitmaKw ?? 0)} kW ısıtma (nominal)` : "Tek dış üniteyle karşılanamıyor — sistem bölünmeli"],
        ["Bağlantı oranı", x.oran !== null ? `%${sy(x.oran, 0)}` : "-"],
        [
          "Düzeltmeler",
          `dış sıcaklık (soğutma) ${sy(x.duzeltme.dis, 3)} · boru (eşdeğer ${sy(x.duzeltme.leq, 0)} m) soğutma ${sy(x.duzeltme.boruSog, 3)} / ısıtma ${sy(x.duzeltme.boruIsit, 3)} · kış dış sıcaklık (ısıtma) ${sy(x.duzeltme.disIsit, 3)}`,
        ],
        ["Gerçek kapasite", x.sogutmaDuzeltilmis !== null ? `soğutma ${sy(x.sogutmaDuzeltilmis, 2)} kW${v.isitmaDa ? ` · ısıtma ${sy(x.isitmaDuzeltilmis ?? 0, 2)} kW` : ""}` : "-"],
        ["Soğutucu akışkan", `ek gaz ${sy(x.ekGaz, 2)} kg · toplam şarj ${sy(x.toplamSarj, 2)} kg${x.sarjTahmini ? " (fabrika şarjı tahmini)" : ""}`],
      ]
    );
    altBaslik("Boru hatları");
    tablo(
      [
        { ad: "Hat", w: 60 },
        { ad: "Uzunluk m", w: 18, hiza: "sag" },
        { ad: "Kapasite kW", w: 20, hiza: "sag" },
        { ad: "Gaz", w: 40 },
        { ad: "Sıvı", w: 40 },
      ],
      x.parcalar.map((p) => [p.ad, sy(p.uzunluk), sy(p.kw), borAdi(p.gaz), borAdi(p.sivi)]),
      { boyut: 7 }
    );
    if (x.bransmanlar.length) {
      altBaslik("Branşman kitleri");
      tablo(
        [
          { ad: "No", w: 12 },
          { ad: "Arkasındaki kapasite", w: 40, hiza: "sag" },
          { ad: "Kit", w: 128 },
        ],
        x.bransmanlar.map((b) => [`B${b.no}`, `${sy(b.kw)} kW`, b.ad]),
        { boyut: 7 }
      );
    }
    altBaslik("Kontroller");
    tablo(
      [
        { ad: "Kontrol", w: 80 },
        { ad: "Değer", w: 35, hiza: "sag" },
        { ad: "Sınır", w: 35, hiza: "sag" },
        { ad: "Sonuç", w: 30, hiza: "orta" },
      ],
      [
        ...x.kontroller.map((k) => [k.ad, k.deger, k.sinir, k.uygun ? "Uygun" : "UYGUN DEĞİL"]),
        ...x.en378.map((e) => [`EN 378 — ${e.oda} (${sy(e.hacim, 0)} m³)`, `${sy(x.toplamSarj, 2)} kg`, `${sy(e.sinir, 2)} kg`, e.asiyor ? "ÖNLEM GEREKLİ" : "Uygun"]),
      ],
      { boyut: 7 }
    );
    for (const u of x.uyarilar) paragraf(`• ${u}`, 7.8, METIN);
  }

  if (s.splitler.length) {
    bolumBasligi("Bağımsız split klimalar");
    tablo(
      [
        { ad: "Oda", w: 40 },
        { ad: "Soğutma W", w: 20, hiza: "sag" },
        { ad: "Isıtma W", w: 20, hiza: "sag" },
        { ad: "Seçim", w: 60 },
        { ad: "Not", w: 40 },
      ],
      s.splitler.map((o) => [o.ad, sy(o.gerekenSogutma, 0), v.isitmaDa ? sy(o.isitma, 0) : "-", `${o.unite!.adet > 1 ? o.unite!.adet + " × " : ""}${o.unite!.ad}`, o.uyarilar.join(" ")])
    );
  }

  const genel = [...s.uyarilar, ...s.odalar.flatMap((o) => (o.sistem ? o.uyarilar.map((u) => `${o.ad}: ${u}`) : []))];
  if (genel.length) {
    bolumBasligi("Uyarılar ve öneriler");
    for (const u of genel) paragraf(`• ${u}`, 7.8, METIN);
  }

  bolumBasligi("Malzeme listesi");
  for (const b of [...new Set(s.malzemeler.map((m) => m.bolum))]) {
    altBaslik(b);
    tablo(
      [
        { ad: "Malzeme", w: 140 },
        { ad: "Miktar", w: 20, hiza: "sag" },
        { ad: "Birim", w: 20 },
      ],
      s.malzemeler.filter((m) => m.bolum === b).map((m) => [m.aciklama, sy(m.adet, 2), m.birim])
    );
  }

  bolumBasligi("Yöntem ve kabuller");
  paragraf(
    [
      "Soğutma yükü: camdan güneş kazancı Q = A · SHGF · cam katsayısı · gölgeleme katsayısı · 0,82 (ASHRAE, ~40° K, Temmuz en yüksek değerleri); opak elemanlarda Q = A · U · (dış − iç + güneş eki) eşdeğer sıcaklık farkı yaklaşımı.",
      "İç kazançlar: kişi başı duyulur / gizli ısı, aydınlatma W/m², cihaz W. Havalandırma: duyulur 0,34 · V · ΔT, gizli 0,833 · V · Δx (V: hava debisi m³/h, Δx: g/kg); dış hava nemi kuru / yaş termometreden, iç nem seçilen bağıl nemden hesaplanmıştır.",
      "Isıtma yükü: EN 12831 basitleştirilmiş yöntem (ısı pompası hesabıyla aynı).",
      "Dış ünite: soğutma kapasitesi dış sıcaklık ve boru eşdeğer uzunluğu, ısıtma kapasitesi kış tasarım sıcaklığı ve boru uzunluğu için tipik eğrilerle düzeltilmiştir.",
      "Boru çapları, branşman kademeleri, mesafe sınırları ve ek gaz katsayıları markadan bağımsız tipik değerlerdir; uygulama öncesi seçilen cihazın üretici tablosuyla kontrol edilmelidir.",
      "EN 378 / IEC 60335-2-40: R410A için pratik sınır 0,44 kg/m³; R32 için m = 2,5 · LFL^1,25 · h0 · √A (LFL 0,307 kg/m³).",
    ].join(" "),
    7.2
  );

  // BORU ŞEMALARI
  for (const x of s.sistemler) {
    yeniSayfa();
    const c = boruSemasi(x, bilgi.baslik);
    const w = Math.min(180, (262 * c.w) / c.h);
    cizimBas(c, SOL + (180 - w) / 2, 12, w);
  }

  // SAYFA ALTLIĞI
  const toplam = doc.getNumberOfPages();
  const altBilgi = [unvan, sirket.telefon, sirket.email, sirket.web].filter(Boolean).map((x) => metin(x as string)).join("  ·  ");
  for (let i = 1; i <= toplam; i++) {
    doc.setPage(i);
    cizgi(SOL, 286, SAG, 286);
    yazi(7, false, METIN_50);
    doc.text(altBilgi, SOL, 290);
    doc.text(`Sayfa ${i} / ${toplam}`, SAG, 290, { align: "right" });
  }
  return Buffer.from(doc.output("arraybuffer"));
}
