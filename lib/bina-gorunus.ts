// -----------------------------------------------------------------------------
// BİNA ÖN GÖRÜNÜŞÜ (ısı pompası ve klima / VRF raporları)
// Evin önden görünüşü (katlar, pencereler, kapı, çatı, bahçe) ve içinde cihazlar:
// dış ünite(ler), iç üniteler, boyler, tampon tank, kollektörler; aralarında borular.
// Cihaz yerleri panelde sürüklenerek değiştirilir; konumlar hesap verisinde
// (gorunus.konumlar) saklanır, PDF'te de aynen basılır.
// Çizim, öteki şemalar gibi ortak şekil listesidir (Cizim): ekranda SVG, PDF'te jsPDF.
// Ölçekli değildir; temsilidir.
// -----------------------------------------------------------------------------
import { Kalem, RENK, type Cizim } from "@/lib/isi-hesap/cizim";
import type { HesapSonucu } from "@/lib/isi-hesap/hesap";
import type { KlimaSonucu } from "@/lib/klima-hesap/hesap";
import type { KlimaVerisi } from "@/lib/klima-hesap/tipler";

import { GW, GH, type CihazTuru, type GorunusCihaz, type GorunusAyari, type GorunusGirdisi } from "@/lib/bina-gorunus-veri";
export { GW, GH, VARSAYILAN_GORUNUS, gorunusOku } from "@/lib/bina-gorunus-veri";
export type { CihazTuru, GorunusCihaz, GorunusAyari, GorunusGirdisi } from "@/lib/bina-gorunus-veri";

// Cihaz sembol ölçüleri (genişlik, yükseklik)
const OLCU: Record<CihazTuru, [number, number]> = {
  DIS_POMPA: [24, 17],
  DIS_KLIMA: [20, 15],
  IC_DUVAR: [15, 4.5],
  IC_TAVAN: [13, 3],
  IC_KANAL: [16, 4],
  IC_DOSEME: [11, 7],
  BOYLER: [8, 16],
  TAMPON: [8, 13],
  KOLLEKTOR: [13, 5],
};
export const cihazOlcusu = (t: CihazTuru) => OLCU[t];

// --- Bina geometrisi ---------------------------------------------------------
export function geometri(ayar: GorunusAyari, g: Pick<GorunusGirdisi, "cihazlar" | "otoKatSayisi">) {
  const katSayisi = ayar.katSayisi > 0 ? ayar.katSayisi : Math.max(1, Math.min(8, g.otoKatSayisi));
  const bodrum = ayar.bodrum ?? g.cihazlar.some((c) => c.kat < 0);
  const BX = 72;
  const BW = 136;
  const ust = 34; // çatı tepesinin üst sınırı
  const alt = GH - 16;
  const catiOran = ayar.cati === "BESIK" ? 0.7 : 0.15;
  const bodrumOran = bodrum ? 0.85 : 0.2;
  const KH = Math.min(40, (alt - ust) / (katSayisi + catiOran + bodrumOran));
  const zeminY = alt - bodrumOran * KH;
  const ustKatY = zeminY - katSayisi * KH; // en üst katın tavanı (çatı tabanı)
  // Kat k'nın döşemesi (alt) ve tavanı (üst)
  // (bodrum yüksekliği 0,85 kat; bodrum döşemesi çizimin altına taşmasın)
  const katAlt = (k: number) => (k < 0 ? zeminY + bodrumOran * KH : zeminY - k * KH);
  const katUst = (k: number) => (k < 0 ? zeminY : zeminY - (k + 1) * KH);
  return { katSayisi, bodrum, BX, BW, KH, zeminY, ustKatY, katAlt, katUst, catiH: catiOran * KH, minKat: bodrum ? -1 : 0, maksKat: katSayisi - 1 };
}

export type Yer = { id: string; x: number; y: number; w: number; h: number };

// Cihazların konumları: kayıtlı konum varsa o, yoksa otomatik yerleşim
export function yerlesim(ayar: GorunusAyari, g: GorunusGirdisi): Yer[] {
  const G = geometri(ayar, g);
  const katSinirla = (k: number) => Math.max(G.minKat, Math.min(G.maksKat, Math.round(k)));
  const sonuc: Yer[] = [];
  const ekle = (c: GorunusCihaz, x: number, y: number) => {
    const [w, h] = OLCU[c.tur];
    const k = ayar.konumlar[c.id];
    const cx = k ? k[0] : x;
    const cy = k ? k[1] : y;
    sonuc.push({ id: c.id, w, h, x: Math.min(GW - w / 2 - 1, Math.max(w / 2 + 1, cx)), y: Math.min(GH - h / 2 - 1, Math.max(h / 2 + 1, cy)) });
  };

  // Dış üniteler
  const dislar = g.cihazlar.filter((c) => c.tur === "DIS_POMPA" || c.tur === "DIS_KLIMA");
  let catiX = G.BX + 18;
  let bahceX = G.BX + G.BW + 22;
  let solBahceX = G.BX - 24;
  const duvarSayac = new Map<number, number>();
  for (const c of dislar) {
    const [w, h] = OLCU[c.tur];
    if (c.yer === "CATI" && ayar.cati === "DUZ" && catiX + w / 2 < G.BX + G.BW - 4) {
      ekle(c, catiX, G.ustKatY - 2.5 - h / 2);
      catiX += w + 5;
    } else if (c.yer === "DUVAR") {
      const k = katSinirla(c.kat);
      const n = duvarSayac.get(k) ?? 0;
      duvarSayac.set(k, n + 1);
      ekle(c, G.BX - 4 - w / 2 - n * (w + 3), G.katAlt(k) - G.KH * 0.45);
    } else if (bahceX + w / 2 < GW - 4) {
      ekle(c, bahceX, G.zeminY - h / 2 - 0.4);
      bahceX += w + 6;
    } else {
      ekle(c, solBahceX, G.zeminY - h / 2 - 0.4);
      solBahceX -= w + 6;
    }
  }

  // İç cihazlar: kat kat, bina içinde eşit aralıklarla (mekanik cihazlar solda)
  const iceriler = g.cihazlar.filter((c) => c.tur !== "DIS_POMPA" && c.tur !== "DIS_KLIMA");
  const katlar = new Map<number, GorunusCihaz[]>();
  for (const c of iceriler) {
    // Bodrum varsa boyler ve tampon tank varsayılan olarak bodrumdaki mekanik odaya
    const k = katSinirla(G.bodrum && (c.tur === "BOYLER" || c.tur === "TAMPON") && c.kat === 0 ? -1 : c.kat);
    katlar.set(k, [...(katlar.get(k) ?? []), c]);
  }
  for (const [k, liste] of katlar) {
    const n = liste.length;
    const bosluk = (G.BW - 20) / n;
    liste.forEach((c, i) => {
      const [, h] = OLCU[c.tur];
      const x = G.BX + 10 + bosluk * (i + 0.5);
      const ust = G.katUst(k);
      const alt = G.katAlt(k);
      const y =
        c.tur === "IC_DUVAR"
          ? ust + 2 + h / 2 + 3
          : c.tur === "IC_TAVAN" || c.tur === "IC_KANAL"
            ? ust + 1.2 + h / 2
            : alt - 1 - h / 2 - (c.tur === "IC_DOSEME" ? 0 : 0.2);
      ekle(c, x, y);
    });
  }
  return sonuc;
}

const kisalt = (m: string, n: number) => (m.length > n ? m.slice(0, n - 1) + "…" : m);

// --- Çizim -------------------------------------------------------------------
export function binaGorunusu(ayar: GorunusAyari, g: GorunusGirdisi): Cizim {
  const k = new Kalem();
  const G = geometri(ayar, g);
  const yerler = new Map(yerlesim(ayar, g).map((y) => [y.id, y]));
  const { BX, BW, zeminY, KH } = G;
  const DUVAR = "#5c5f66";
  const DIS_CEPHE = "#fbf8f2";

  // Başlık
  k.yazi(8, 9, `ÖN GÖRÜNÜŞ — CİHAZ YERLEŞİMİ`, 4, { kalin: true });
  k.yazi(8, 15, kisalt(g.baslik, 90), 2.7, { renk: RENK.soluk });
  g.bilgi.slice(0, 2).forEach((b, i) => k.yazi(8, 19.6 + i * 3.6, kisalt(b, 150), 2.3, { renk: RENK.soluk }));
  k.cizgi(8, 27, GW - 8, 27, RENK.soluk, 0.3);

  // Gökyüzü yok (beyaz); zemin ve toprak
  k.dortgen(6, zeminY, GW - 12, GH - 14 - zeminY, "#e9ecef", 0.01, { dolgu: "#f1ebe0" });
  for (let x = 10; x < GW - 10; x += 6) {
    if (G.bodrum && x > BX - 2 && x < BX + BW + 2) continue;
    k.cizgi(x, zeminY + 1.2, x - 2.5, zeminY + 3.8, "#c9b79c", 0.25);
  }
  // Çim
  k.cizgi(6, zeminY, GW - 6, zeminY, RENK.yesil, 0.9);

  // Bodrum
  if (G.bodrum) {
    k.dortgen(BX, zeminY, BW, G.KH * 0.85, DUVAR, 0.5, { dolgu: "#f3f0ea", kesik: true });
    k.yazi(BX + 2, zeminY + 3.6, "Bodrum", 2.1, { renk: RENK.soluk, kalin: true });
  }

  // Çatı
  const ustY = G.ustKatY;
  if (ayar.cati === "BESIK") {
    k.yol(
      [
        [BX - 7, ustY + 0.6],
        [BX + BW / 2, ustY - G.catiH],
        [BX + BW + 7, ustY + 0.6],
      ],
      "#7a3b2e",
      0.6,
      { kapali: true, dolgu: "#c8674f" }
    );
    // Kiremit çizgileri
    for (let i = 1; i < 4; i++) {
      const t = i / 4;
      const yy = ustY - G.catiH * (1 - t);
      const yarim = (BW / 2 + 7) * t;
      k.cizgi(BX + BW / 2 - yarim, yy, BX + BW / 2 + yarim, yy, "#a5503d", 0.25);
    }
  } else {
    k.dortgen(BX - 1.5, ustY - 3.2, BW + 3, 3.2, DUVAR, 0.5, { dolgu: "#dee2e6" });
  }

  // Cephe ve katlar
  k.dortgen(BX, ustY, BW, zeminY - ustY, DUVAR, 0.7, { dolgu: DIS_CEPHE });
  for (let kat = 0; kat < G.katSayisi; kat++) {
    const alt = G.katAlt(kat);
    const ust = G.katUst(kat);
    if (kat > 0) k.cizgi(BX, alt, BX + BW, alt, "#adb5bd", 0.6);
    k.yazi(BX + 2, ust + 3.4, kat === 0 ? "Zemin kat" : `${kat}. kat`, 2.1, { renk: RENK.soluk, kalin: true });
    // Pencereler (zemin katta ortada kapı)
    const pencereler = 4;
    const pw = Math.min(15, BW / 9);
    const ph = KH * 0.42;
    for (let i = 0; i < pencereler; i++) {
      const cx = BX + (BW / pencereler) * (i + 0.5);
      if (kat === 0 && i === 1) {
        // Kapı
        const kh = KH * 0.68;
        k.dortgen(cx - 5.5, alt - kh, 11, kh, "#5a3825", 0.5, { dolgu: "#a0704f", r: 0.6 });
        k.daire(cx + 3.4, alt - kh / 2, 0.6, "#3b2416", 0.2, "#f1c40f");
        continue;
      }
      const py = ust + KH * 0.3;
      k.dortgen(cx - pw / 2, py, pw, ph, "#495057", 0.45, { dolgu: "#d0ebff" });
      k.cizgi(cx, py, cx, py + ph, "#495057", 0.3);
      k.cizgi(cx - pw / 2 - 1, py + ph, cx + pw / 2 + 1, py + ph, "#495057", 0.5); // denizlik
    }
  }

  // Bahçede ağaç / çalı (süs)
  const agac = (x: number) => {
    k.dortgen(x - 0.8, zeminY - 9, 1.6, 9, "#6b4f3a", 0.2, { dolgu: "#8b6b4f" });
    k.daire(x, zeminY - 13, 6, "#2b8a3e", 0.3, "#8ce99a");
  };
  agac(22);
  k.daire(BX - 10, zeminY - 2, 3, "#2b8a3e", 0.25, "#b2f2bb");

  // Borular (cihazların altında kalsın diye önce)
  const gruplar = new Map<string, GorunusCihaz[]>();
  for (const c of g.cihazlar) gruplar.set(c.grup, [...(gruplar.get(c.grup) ?? []), c]);
  let gi = 0;
  for (const [, liste] of gruplar) {
    const bas = liste.find((c) => c.tur === "DIS_POMPA" || c.tur === "DIS_KLIMA");
    const iceri = liste.filter((c) => c !== bas);
    if (!bas || !iceri.length) continue;
    const d = yerler.get(bas.id);
    if (!d) continue;
    const sagda = d.x > BX + BW / 2;
    const kolonX = sagda ? BX + BW - 4 - gi * 2.6 : BX + 4 + gi * 2.6;
    gi++;
    const hatlar: [string, number][] = g.boru === "SU" ? [[RENK.gidis, -0.8], [RENK.donus, 0.8]] : [["#0b7285", 0]];
    for (const [renk, ofs] of hatlar) {
      const cikisX = sagda ? d.x - d.w / 2 : d.x + d.w / 2;
      const ys = iceri.map((c) => yerler.get(c.id)?.y).filter((y): y is number => y !== undefined);
      const ust = Math.min(d.y, ...ys) + ofs;
      const alt = Math.max(d.y, ...ys) + ofs;
      k.cizgi(cikisX, d.y + ofs, kolonX + ofs, d.y + ofs, renk, 0.55);
      k.cizgi(kolonX + ofs, ust, kolonX + ofs, alt, renk, 0.55);
      for (const c of iceri) {
        const y = yerler.get(c.id);
        if (!y) continue;
        const kenar = y.x < kolonX ? y.x + y.w / 2 : y.x - y.w / 2;
        k.cizgi(kolonX + ofs, y.y + ofs, kenar, y.y + ofs, renk, 0.45);
      }
    }
  }

  // Cihazlar
  for (const c of g.cihazlar) {
    const y = yerler.get(c.id);
    if (!y) continue;
    const x0 = y.x - y.w / 2;
    const y0 = y.y - y.h / 2;
    switch (c.tur) {
      case "DIS_POMPA":
      case "DIS_KLIMA": {
        k.dortgen(x0, y0, y.w, y.h, RENK.cizgi, 0.5, { dolgu: "#f8f9fa", r: 1 });
        const r = Math.min(y.h, y.w) * 0.33;
        k.daire(x0 + r + 2, y.y, r, RENK.cizgi, 0.35, RENK.beyaz);
        k.cizgi(x0 + r + 2 - r * 0.7, y.y, x0 + r + 2 + r * 0.7, y.y, RENK.soluk, 0.3);
        k.cizgi(x0 + r + 2, y.y - r * 0.7, x0 + r + 2, y.y + r * 0.7, RENK.soluk, 0.3);
        for (let i = 0; i < 4; i++) k.cizgi(x0 + 2 * r + 4, y0 + 3 + i * ((y.h - 6) / 3), x0 + y.w - 2, y0 + 3 + i * ((y.h - 6) / 3), RENK.soluk, 0.25);
        if (c.tur === "DIS_POMPA") {
          // Ayaklar
          k.dortgen(x0 + 1.5, y0 + y.h, 2, 1.2, RENK.cizgi, 0.3);
          k.dortgen(x0 + y.w - 3.5, y0 + y.h, 2, 1.2, RENK.cizgi, 0.3);
        }
        break;
      }
      case "IC_DUVAR":
        k.dortgen(x0, y0, y.w, y.h, RENK.cizgi, 0.45, { dolgu: "#ffffff", r: 1.4 });
        k.cizgi(x0 + 1.5, y0 + y.h - 1, x0 + y.w - 1.5, y0 + y.h - 1, RENK.soluk, 0.25);
        break;
      case "IC_TAVAN":
        k.dortgen(x0, y0, y.w, y.h, RENK.cizgi, 0.45, { dolgu: "#e7f5ff" });
        k.cizgi(x0 + 2, y0 + y.h, x0 + 3.5, y0 + y.h + 1.6, RENK.soluk, 0.25);
        k.cizgi(x0 + y.w - 2, y0 + y.h, x0 + y.w - 3.5, y0 + y.h + 1.6, RENK.soluk, 0.25);
        break;
      case "IC_KANAL":
        k.dortgen(x0, y0, y.w, y.h, RENK.cizgi, 0.4, { dolgu: "#f1f3f5", kesik: true });
        break;
      case "IC_DOSEME":
        k.dortgen(x0, y0, y.w, y.h, RENK.cizgi, 0.45, { dolgu: "#ffffff", r: 0.8 });
        for (let i = 0; i < 3; i++) k.cizgi(x0 + 1.5, y0 + 1.6 + i * 1.3, x0 + y.w - 1.5, y0 + 1.6 + i * 1.3, RENK.soluk, 0.2);
        break;
      case "BOYLER":
      case "TAMPON":
        k.dortgen(x0, y0, y.w, y.h, RENK.cizgi, 0.5, { dolgu: c.tur === "BOYLER" ? "#fff4e6" : "#e3fafc", r: y.w / 2.5 });
        k.yazi(y.x, y.y + 1, c.tur === "BOYLER" ? "B" : "T", 2.6, { hiza: "orta", kalin: true });
        break;
      case "KOLLEKTOR":
        k.dortgen(x0, y0, y.w, y.h, RENK.cizgi, 0.45, { dolgu: "#fff5f5" });
        for (let i = 0; i < 4; i++) k.daire(x0 + 2 + i * ((y.w - 4) / 3), y.y, 0.7, RENK.cizgi, 0.2, RENK.gidis);
        break;
    }
    // Etiket (dış ünitede üstte, içeride altta)
    const disMi = c.tur === "DIS_POMPA" || c.tur === "DIS_KLIMA";
    const ey = disMi ? y0 - (c.alt ? 4.4 : 1.4) : y0 + y.h + 2.8;
    k.yazi(y.x, ey, kisalt(c.ad, 22), 2, { hiza: "orta", kalin: true });
    if (c.alt) k.yazi(y.x, ey + 2.6, kisalt(c.alt, 26), 1.7, { hiza: "orta", renk: RENK.soluk });
  }

  // Alt not
  k.cizgi(8, GH - 10, GW - 8, GH - 10, RENK.soluk, 0.3);
  k.yazi(
    8,
    GH - 5,
    g.boru === "SU"
      ? "Temsili ön görünüştür, ölçekli değildir. Kırmızı: gidiş, mavi: dönüş hattı. Cihaz yerleri panelde sürüklenerek belirlenir."
      : "Temsili ön görünüştür, ölçekli değildir. Mavi-yeşil: soğutucu akışkan hattı. Cihaz yerleri panelde sürüklenerek belirlenir.",
    2.1,
    { renk: RENK.soluk }
  );
  return { w: GW, h: GH, ogeler: k.ogeler };
}

// --- Hesaplardan cihaz listesi -----------------------------------------------
const kw = (w: number) => `${(Math.round(w / 100) / 10).toLocaleString("tr-TR")} kW`;
const sy1 = (n: number) => (Math.round(n * 10) / 10).toLocaleString("tr-TR");

export function isiGorunusGirdisi(s: HesapSonucu, baslik: string): GorunusGirdisi {
  const c: GorunusCihaz[] = [];
  const m = s.secilenModel;
  c.push({ id: "pompa", tur: "DIS_POMPA", ad: "Isı pompası", alt: m ? `${m.ad} · ${sy1(m.kapasiteTasarim)} kW` : `${kw(s.tasarimYuku)} gerekli`, kat: 0, grup: "isi" });
  if (s.boyler) c.push({ id: "boyler", tur: "BOYLER", ad: "Boyler", alt: `${s.boyler.hacim} L`, kat: 0, grup: "isi" });
  if (s.tampon.hacim > 0) c.push({ id: "tampon", tur: "TAMPON", ad: "Tampon tank", alt: `${Math.round(s.tampon.hacim)} L`, kat: 0, grup: "isi" });
  for (const kol of s.kollektorler) c.push({ id: `kollektor-${kol.no}`, tur: "KOLLEKTOR", ad: `Kollektör ${kol.no}`, alt: `${kol.agiz} ağız`, kat: 0, grup: "isi" });
  return {
    cihazlar: c,
    otoKatSayisi: 2,
    baslik,
    bilgi: [
      `${s.il} · dış tasarım ${sy1(s.disSicaklik)} °C · tasarım yükü ${kw(s.tasarimYuku)} · ${sy1(s.toplamAlan)} m²`,
      [m ? `Seçilen cihaz: ${m.ad}` : null, s.radyatorVar ? "radyatör" : null, s.yerdenVar ? "yerden ısıtma" : null, s.boyler ? `boyler ${s.boyler.hacim} L` : null]
        .filter(Boolean)
        .join(" · "),
    ],
    boru: "SU",
  };
}

const IC_TUR: Record<string, CihazTuru> = {
  DUVAR: "IC_DUVAR",
  KASET: "IC_TAVAN",
  KASET_KUCUK: "IC_TAVAN",
  KASET_TEK: "IC_TAVAN",
  TAVAN: "IC_TAVAN",
  KANALLI_INCE: "IC_KANAL",
  KANALLI: "IC_KANAL",
  KANALLI_YUKSEK: "IC_KANAL",
  TAZE_HAVA: "IC_KANAL",
  KONSOL: "IC_DOSEME",
  DOSEME_GIZLI: "IC_DOSEME",
  SALON: "IC_DOSEME",
};

export function klimaGorunusGirdisi(s: KlimaSonucu, v: KlimaVerisi, baslik: string): GorunusGirdisi {
  const katY = v.katYuksekligi > 0 ? v.katYuksekligi : 3;
  const kat = (kot: number) => Math.round(kot / katY);
  const c: GorunusCihaz[] = [];
  const tipBul = (odaId: string) => s.odalar.find((o) => o.id === odaId)?.unite?.tip ?? "DUVAR";
  let enUstKat = 0;
  for (const x of s.sistemler) {
    const icler = x.uniteler.map((u) => kat(u.kot));
    const ustKat = icler.length ? Math.max(...icler) : 0;
    enUstKat = Math.max(enUstKat, ustKat, kat(x.disKot) - 1);
    c.push({
      id: `dis-${x.no}`,
      tur: "DIS_KLIMA",
      ad: x.ad,
      alt: `${x.tipAdi}${x.disKw ? ` · ${sy1(x.disKw)} kW` : ""}`,
      kat: kat(x.disKot),
      grup: `s${x.no}`,
      yer: x.disKot > (x.uniteler.length ? Math.max(...x.uniteler.map((u) => u.kot)) : 0) ? "CATI" : undefined,
    });
    for (const u of x.uniteler)
      c.push({ id: `ic-${u.odaId}-${u.sira}`, tur: IC_TUR[tipBul(u.odaId)] ?? "IC_DUVAR", ad: u.oda, alt: `${sy1(u.kw)} kW`, kat: kat(u.kot), grup: `s${x.no}` });
  }
  for (const o of s.splitler) {
    if (!o.unite) continue;
    const ham = v.odalar.find((x) => x.id === o.id);
    const k = kat(ham?.kot ?? 0);
    enUstKat = Math.max(enUstKat, k);
    c.push({ id: `split-dis-${o.id}`, tur: "DIS_KLIMA", ad: `${o.ad} split`, alt: `${sy1(o.unite.kw)} kW`, kat: k, grup: `p${o.id}`, yer: "DUVAR" });
    c.push({ id: `split-ic-${o.id}`, tur: IC_TUR[o.unite.tip] ?? "IC_DUVAR", ad: o.ad, alt: o.unite.tipAdi, kat: k, grup: `p${o.id}` });
  }
  return {
    cihazlar: c,
    otoKatSayisi: enUstKat + 1,
    baslik,
    bilgi: [
      `${s.il} · soğutma ${kw(s.toplamSogutma)} · ısıtma ${kw(s.toplamIsitma)} · ${sy1(s.toplamAlan)} m²`,
      [s.sistemler.length ? `${s.sistemler.length} sistem (${s.sistemler.map((x) => x.ad).join(", ")})` : null, s.splitler.length ? `${s.splitler.length} bağımsız split` : null]
        .filter(Boolean)
        .join(" · "),
    ],
    boru: "GAZ",
  };
}
