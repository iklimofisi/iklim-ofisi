import { jsPDF } from "jspdf";
import { LIBERATION_SANS_NORMAL, LIBERATION_SANS_KALIN } from "@/lib/pdf-fontlari";
import { PDF_LOGO_JPEG_BASE64, PDF_LOGO_ORAN } from "@/lib/pdf-logo";
import { sy } from "@/lib/isi-hesap/hesap";
import { IL_KAYNAGI } from "@/lib/isi-hesap/iklim";
import type { Cizim } from "@/lib/isi-hesap/cizim";
import { olcuYaz, HAVALANDIRMA_KAYNAKLARI, type HavalandirmaSonucu } from "./hesap";
import type { HavalandirmaVerisi } from "./tipler";
import { EN_KATEGORI, KIRLILIK, SANTRAL_TIPLERI } from "./katalog";
import { kanalSemasi } from "./cizim";

// -----------------------------------------------------------------------------
// HAVALANDIRMA HESABI — PDF RAPORU
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

export type HavalandirmaPdfBilgi = { baslik: string; musteri: string | null; hazirlayan: string; tarih: Date };
const trTarih = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" });

export function havalandirmaPdfOlustur(
  bilgi: HavalandirmaPdfBilgi,
  v: HavalandirmaVerisi,
  s: HavalandirmaSonucu,
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
  doc.text("HAVALANDIRMA HESABI", SAG, 18, { align: "right" });
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


  const kutular: [string, string][] = [
    ["Kış / yaz tasarım", `${sy(s.disSicaklik)} / ${sy(s.yazKT)} °C (${s.il})`],
    ["Toplam besleme", `${sy(s.toplamBesleme, 0)} m³/h`],
    ["Toplam egzoz", `${sy(s.toplamEgzoz, 0)} m³/h`],
    ["Mahal / santral", `${s.mahaller.length} / ${s.santraller.length}`],
    ["Isıtıcı batarya", `${sy(s.toplamIsitici, 1)} kW`],
    ["Soğutucu batarya", `${sy(s.toplamSogutucu, 1)} kW`],
    ["Fan gücü", `${sy(s.toplamFanKw, 2)} kW`],
    ["Yöntem", v.yontem === "EN16798" ? `EN 16798-1 Kat. ${v.kategori}` : "ASHRAE 62.1"],
  ];
  const kw = (SAG - SOL - 9) / 4;
  kutular.forEach(([a, b], i) => {
    const kx = SOL + (i % 4) * (kw + 3);
    const ky = y + Math.floor(i / 4) * 17;
    doc.setFillColor(...(i === 1 ? SARI_ZEMIN : SOGUK_ZEMIN));
    doc.roundedRect(kx, ky, kw, 14, 1.5, 1.5, "F");
    yazi(7, false, METIN_60);
    doc.text(metin(a), kx + 3, ky + 5);
    yazi(10, true, i === 1 ? TURUNCU : METIN);
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
      ["Dış hava (kış)", `${sy(s.disSicaklik)} °C — ${IL_KAYNAGI}`],
      ["Dış hava (yaz)", `${sy(s.yazKT)} °C kuru / ${sy(s.yazYT)} °C yaş termometre · atmosfer basıncı ${sy(s.basinc, 1)} kPa`],
      ["İç ortam", `kış ${sy(v.icKis)} °C · yaz ${sy(v.icYaz)} °C, %${sy(v.icNem, 0)} bağıl nem`],
      [
        "Taze hava yöntemi",
        v.yontem === "EN16798"
          ? `TS EN 16798-1 ${EN_KATEGORI[v.kategori].ad}: kişi başı ${EN_KATEGORI[v.kategori].kisi} l/s + ${KIRLILIK[v.kirlilik].toLocaleLowerCase("tr-TR")} bina ${sy(EN_KATEGORI[v.kategori].alan[v.kirlilik], 2)} l/s·m²`
          : `ASHRAE 62.1 (Rp · kişi + Ra · alan) / Ez ${sy(v.ez, 2)}`,
      ],
      ["Su rejimleri", `ısıtma ${v.isitmaRejimi[0]}/${v.isitmaRejimi[1]} °C · soğutma ${v.sogutmaRejimi[0]}/${v.sogutmaRejimi[1]} °C`],
      ["Dikdörtgen kanal", `en çok ${v.kanalYukseklikMaks} mm yükseklik (asma tavan boşluğu)`],
      ["Santral / fan seçimi", s.otoSistem ? "program önerisi (mahal tiplerine göre otomatik; gerekçeler santral bölümlerinde)" : "tasarımcı tarafından elle"],
    ]
  );

  bolumBasligi("Mahal debileri");
  tablo(
    [
      { ad: "Mahal", w: 30 },
      { ad: "Tip", w: 28 },
      { ad: "m²", w: 10, hiza: "sag" },
      { ad: "Kişi", w: 9, hiza: "sag" },
      { ad: "Besleme m³/h", w: 16, hiza: "sag" },
      { ad: "Egzoz m³/h", w: 15, hiza: "sag" },
      { ad: "1/h", w: 9, hiza: "sag" },
      { ad: "Basınç", w: 13 },
      { ad: "Santral B / E", w: 14, hiza: "orta" },
    ],
    [
      ...s.mahaller.map((m) => [
        m.ad,
        m.tipAdi,
        sy(m.alan),
        m.kisi ? String(m.kisi) : "-",
        m.besleme ? sy(m.besleme, 0) + (m.dengeEk > 1 ? " *" : "") : "-",
        m.egzoz ? sy(m.egzoz, 0) + (m.dengeEkE > 1 ? " *" : "") : "-",
        sy(m.ach, 1),
        m.basinc === "POZITIF" ? "pozitif" : m.basinc === "NEGATIF" ? "negatif" : "dengeli",
        `${m.santral || "-"} / ${m.egzozSantral || "-"}`,
      ]),
      ["TOPLAM", "", sy(s.toplamAlan), "", sy(s.toplamBesleme, 0), sy(s.toplamEgzoz, 0), "", "", ""],
    ],
    { kalinSon: true, boyut: 6.8 }
  );
  paragraf("* Santral dengesi için eklenen geçiş havası payını içerir (egzozu karşılamak için kuru mahallere ek besleme; konut cihazında ıslak hacimlere ek egzoz).", 6.8);
  altBaslik("Mahallerin havalandırma şekli");
  {
    const gorulen = new Set<string>();
    for (const m of s.mahaller) {
      if (!m.sistemNotu || gorulen.has(m.tipAdi)) continue;
      gorulen.add(m.tipAdi);
      paragraf(`${m.tipAdi}: ${m.sistemNotu}`, 6.9, METIN_60);
    }
  }
  altBaslik("Debilerin hesabı");
  for (const m of s.mahaller) paragraf(`${m.ad}: ${m.aciklama}${m.transferCm2 ? ` · geçiş havası menfezi ≥ ${sy(m.transferCm2, 0)} cm²` : ""}`, 6.9, METIN_60);

  for (const x of s.santraller) {
    bolumBasligi(`${x.ad} — ${x.tipAdi}`, 70);
    paragraf(x.secim, 7.6, METIN);
    if (x.gerekce) paragraf(`Seçim gerekçesi: ${x.gerekce}`, 7.2, METIN_60);
    tablo(
      [
        { ad: "Değer", w: 55 },
        { ad: "Sonuç", w: 125 },
      ],
      [
        ["Debiler", `besleme ${sy(x.besleme, 0)} m³/h · egzoz ${sy(x.egzoz, 0)} m³/h${x.yangin ? ` · duman tahliyesi ${sy(x.yangin, 0)} m³/h` : ""} · kademe ${sy(x.nominal, 0)} m³/h · kesit ≈ ${sy(x.kesitM2, 2)} m² (2,5 m/s)`],
        ...(x.verim
          ? [["Isı geri kazanımı", `tasarım verimi %${sy(x.verim, 0)}, debi dengesine göre etkin %${sy(x.verimEtkin, 0)} · kış ${sy(x.kis.geriKazanim, 1)} kW / yaz ${sy(x.yaz.geriKazanim, 1)} kW geri kazanım`]]
          : []),
        ...(x.besleme > 0 && (x.kis.isitici > 0 || x.kis.onIsitici > 0 || x.verim > 0)
          ? [[
          "Kış",
          `dış ${sy(x.kis.dis)} °C${x.kis.onIsitici > 0 ? ` → ön ısıtıcı ${sy(x.kis.onIsitici, 1)} kW` : ""} → eşanjör sonrası ${sy(x.kis.hrSonrasi, 1)} °C → besleme ${sy(x.kis.hedef)} °C · ısıtıcı ${sy(x.kis.isitici, 1)} kW${x.suIsitici ? ` (${sy(x.suIsitici, 0)} L/h)` : ""}`,
        ]]
          : []),
        ...(x.besleme > 0 && (x.yaz.sogutucu > 0 || x.verim > 0)
          ? [[
          "Yaz",
          `dış ${sy(x.yaz.disKT)} °C → eşanjör sonrası ${sy(x.yaz.hrSonrasi, 1)} °C → besleme ${sy(x.yaz.hedef)} °C · soğutucu ${sy(x.yaz.sogutucu, 1)} kW (duyulur ${sy(x.yaz.duyulur, 1)} / gizli ${sy(x.yaz.gizli, 1)})${x.suSogutucu ? ` (${sy(x.suSogutucu, 0)} L/h)` : ""}`,
        ]]
          : []),
        ...(x.fanB ? [["Besleme fanı", `dış statik ${sy(x.fanB.dis, 0)} Pa + santral içi ${sy(x.fanB.toplam - x.fanB.dis, 0)} Pa = ${sy(x.fanB.toplam, 0)} Pa · ${sy(x.fanB.kw, 2)} kW · SFP ${sy(x.fanB.sfp, 0)} (${x.fanB.sinif})`]] : []),
        ...(x.fanE ? [["Egzoz fanı", `dış statik ${sy(x.fanE.dis, 0)} Pa + santral içi ${sy(x.fanE.toplam - x.fanE.dis, 0)} Pa = ${sy(x.fanE.toplam, 0)} Pa · ${sy(x.fanE.kw, 2)} kW · SFP ${sy(x.fanE.sfp, 0)} (${x.fanE.sinif})`]] : []),
        ["Ünite SFP", `${sy(x.sfp, 0)} W/(m³/s) (fanların toplam gücü / büyük debi)`],
        ...(x.jetFan ? [["Jet fan (ön tahmin)", `${x.jetFan} adet · CO sensörü ${x.coSensoru} adet`]] : []),
      ],
      { boyut: 7 }
    );
    const icTablo = (baslik: string, l: [string, number][]) => {
      if (!l.length) return;
      altBaslik(baslik);
      tablo(
        [
          { ad: "Bileşen", w: 140 },
          { ad: "Pa", w: 40, hiza: "sag" },
        ],
        [...l.map(([a, b]) => [a, sy(b, 0)]), ["Toplam", sy(l.reduce((t, z) => t + z[1], 0), 0)]],
        { boyut: 6.8, kalinSon: true }
      );
    };
    icTablo("Santral içi basınç kayıpları — besleme (tasarım: temiz / kirli filtre ortalaması)", x.icB);
    icTablo("Santral içi basınç kayıpları — egzoz", x.icE);
    for (const ag of [x.agB, x.agE]) {
      if (!ag) continue;
      altBaslik(`${ag.tur === "BESLEME" ? "Besleme" : "Egzoz"} kanalları — kritik hat: ${s.mahaller.find((m) => m.id === ag.kritikMahal)?.ad ?? "-"} (kanal ${sy(ag.kritikKanal, 0)} + uç ${sy(ag.kritikUc, 0)} + susturucu / damper ${sy(ag.ek, 0)} = ${sy(ag.dis, 0)} Pa)`);
      tablo(
        [
          { ad: "Parça", w: 46 },
          { ad: "Ölçü", w: 18 },
          { ad: "m³/h", w: 14, hiza: "sag" },
          { ad: "m/s", w: 10, hiza: "sag" },
          { ad: "Pa/m", w: 11, hiza: "sag" },
          { ad: "m", w: 9, hiza: "sag" },
          { ad: "Sürt. Pa", w: 13, hiza: "sag" },
          { ad: "Yerel Pa", w: 13, hiza: "sag" },
          { ad: "Toplam", w: 13, hiza: "sag" },
        ],
        ag.parcalar.map((p) => [p.ad, olcuYaz(p), sy(p.debi, 0), sy(p.hiz, 1), sy(p.r, 2), sy(p.uzunluk), sy(p.surtunme, 1), sy(p.yerel, 1), sy(p.toplam, 1)]),
        { boyut: 6.6 }
      );
    }
    for (const u of x.uyarilar) paragraf(`• ${u}`, 7.6, METIN);
  }

  const genel = [...s.uyarilar, ...s.mahaller.flatMap((m) => m.uyarilar.map((u) => `${m.ad}: ${u}`))];
  if (genel.length) {
    bolumBasligi("Notlar ve uyarılar");
    for (const u of genel) paragraf(`• ${u}`, 7.4, METIN);
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
      "Taze hava: TS EN 16798-1 (kişi + alan bileşeni, kategori ve bina kirlilik sınıfına göre) ya da ASHRAE 62.1 (Vbz = Rp · Pz + Ra · Az, Voz = Vbz / Ez). Konut: kişi başı ve alan başı debinin büyüğü; ıslak hacimler sabit egzoz (Kat. II: mutfak 20, banyo 15, WC 10 l/s).",
      "Egzoz: WC armatür başına 25 l/s sürekli (en az 10 hava değişimi); soyunma 2,5, temizlik 5 l/s·m²; ticari mutfak davlumbazı ASHRAE 154 / IMC 507 metre başı en az debi, telafi havası %85. Kapalı otopark: 6 hava değişimi ve 3,7 l/s·m²'nin büyüğü, duman tahliyesi 10 hava değişimi. Teknik mahal: V = Q / (0,34 · ΔT).",
      "Kanal: hız sınırı (sessiz 4 / 3, standart 6 / 4,5, endüstriyel 10 / 8 m/s ana / branşman) ve sürtünme sınırına göre en küçük standart ölçü; sürtünme Darcy-Weisbach (Swamee-Jain, galvaniz pürüzlülüğü 0,15 mm); yerel kayıplar ana kanalda ζ = 0,8, gövdede 0,3, branşmanda 1,5. Mutfak yağlı egzoz kanalında hız 7,5–10 m/s.",
      "Santral: iç kayıplar ortalama kirli filtreyle; fan gücü P = V · Δp / η (η ≈ 0,45–0,62 EC fan). Isı geri kazanımı duyulur verimle, egzoz / besleme oranıyla düzeltilmiş; yaz bataryası psikrometrik (rakıma göre basınç). Değerler markadan bağımsız tipik değerlerdir, seçilen cihazın teknik verisiyle kontrol edilmelidir.",
      "Kaynaklar: " + HAVALANDIRMA_KAYNAKLARI.join("; ") + ".",
    ].join(" "),
    7
  );

  // KANAL ŞEMALARI
  for (const x of s.santraller) {
    if (!x.agB && !x.agE) continue;
    yeniSayfa();
    const c = kanalSemasi(x, s.mahaller, bilgi.baslik);
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
