// -----------------------------------------------------------------------------
// KLİMA / VRF — SOĞUTUCU AKIŞKAN BORU ŞEMASI (tek hat)
// Dış ünite, ana hat, branşman (Y) kitleri ve her iç üniteye giden hatlar;
// her parçada gaz / sıvı çapı ve uzunluk yazılır. Ekran (SVG) ve PDF aynı listeyi çizer.
// -----------------------------------------------------------------------------
import { Kalem, RENK, type Cizim } from "@/lib/isi-hesap/cizim";
import { sy } from "@/lib/isi-hesap/hesap";
import type { SistemSonucu, BoruParcasi } from "./hesap";

const BORU = "#0b7285";
const cap = (p: BoruParcasi) => `Ø${sy(p.gaz, 2)} / Ø${sy(p.sivi, 2)}`;

export function boruSemasi(s: SistemSonucu, baslik: string): Cizim {
  const k = new Kalem();
  const n = s.uniteler.length;
  const W = 210;
  const ADIM = 20;
  const Y0 = 58;
  const H = Y0 + (Math.max(1, n) - 1) * ADIM + 30;
  const multi = s.tip === "MULTI";

  k.yazi(8, 9, `SOĞUTUCU BORU ŞEMASI — ${s.ad} (${s.tipAdi})`, 4, { kalin: true });
  k.yazi(8, 15, baslik, 2.7, { renk: RENK.soluk });
  k.yazi(
    8,
    20,
    `Dış ünite ${s.disKw ? sy(s.disKw) + " kW" : "seçilemedi"} · iç ünite toplamı ${sy(s.icToplamKw)} kW${s.oran !== null ? ` · bağlantı oranı %${sy(s.oran, 0)}` : ""} · toplam boru ${sy(s.toplamBoru)} m · en uzak ${sy(s.enUzak)} m · ek gaz ${sy(s.ekGaz, 2)} kg`,
    2.5,
    { renk: RENK.soluk }
  );
  k.cizgi(8, 23, W - 8, 23, RENK.soluk, 0.3);

  // Dış ünite
  const OX = 10;
  const OY = 28;
  k.dortgen(OX, OY, 42, 20, RENK.cizgi, 0.6, { dolgu: "#f8f9fa", r: 1.5 });
  k.daire(OX + 11, OY + 10, 7, RENK.cizgi, 0.4, RENK.beyaz);
  k.daire(OX + 11, OY + 10, 1.2, RENK.cizgi, 0.3, RENK.cizgi);
  k.yazi(OX + 31, OY + 8, "DIŞ ÜNİTE", 2.4, { hiza: "orta", kalin: true });
  k.yazi(OX + 31, OY + 12.5, s.disKw ? `${sy(s.disKw)} kW` : "—", 2.6, { hiza: "orta" });
  k.yazi(OX + 31, OY + 16.5, `kot ${s.kotDisFark >= 0 ? "+" : ""}${sy(s.kotDisFark)} m`, 2, { hiza: "orta", renk: RENK.soluk });

  const TX = 64; // ana hat (gövde) x
  const IX = 128; // iç ünite kutusu x
  const yBirim = (i: number) => Y0 + i * ADIM;
  const kutu = (i: number) => {
    const u = s.uniteler[i];
    const y = yBirim(i);
    k.dortgen(IX, y - 6, 74, 12, RENK.cizgi, 0.5, { dolgu: "#e7f5ff", r: 1.2 });
    k.yazi(IX + 2.5, y - 1.5, kisalt(u.oda, 30), 2.6, { kalin: true });
    k.yazi(IX + 2.5, y + 3.2, `${u.tipAdi} · ${sy(u.kw)} kW · ${sy(u.uzaklik)} m`, 2.2, { renk: RENK.soluk });
  };

  if (multi) {
    // Her iç ünite dış üniteden ayrı hatla
    const bus = OX + 42;
    s.uniteler.forEach((u, i) => {
      const y = yBirim(i);
      const p = s.parcalar[i];
      const x = bus + 4 + i * 1.6;
      k.yol([[bus, OY + 6 + Math.min(i, 8) * 1.2], [x, OY + 6 + Math.min(i, 8) * 1.2], [x, y], [IX, y]], BORU, 0.6);
      if (p) k.yazi((x + IX) / 2 + 2, y - 1.5, `${cap(p)} · ${sy(p.uzunluk)} m`, 2.2, { hiza: "orta" });
      kutu(i);
    });
  } else if (n > 0) {
    const ana = s.parcalar[0];
    // Ana hat: dış üniteden gövdeye
    k.yol([[OX + 42, OY + 10], [TX, OY + 10], [TX, yBirim(0)]], BORU, 1.1);
    k.yazi(TX + 3, OY + 7, `Ana hat ${cap(ana)} · ${sy(ana.uzunluk)} m`, 2.4, { kalin: true });
    const bransParca = s.parcalar.filter((p) => p.tur === "BRANS");
    const hatParca = s.parcalar.filter((p) => p.tur === "HAT");
    for (let i = 0; i < n; i++) {
      const y = yBirim(i);
      const sonMu = i === n - 1;
      if (i < n - 1) {
        // Bi branşmanı
        const b = s.bransmanlar[i];
        k.yol([[TX - 2, y], [TX, y - 2], [TX + 2, y], [TX, y + 2]], RENK.cizgi, 0.35, { kapali: true, dolgu: "#fff3bf" });
        k.yazi(TX - 3.5, y + 1, `B${i + 1}`, 2.4, { hiza: "sag", kalin: true });
        if (b) k.yazi(TX - 3.5, y + 4.5, `${sy(b.kw)} kW`, 1.9, { hiza: "sag", renk: RENK.soluk });
      }
      // Gövde bir sonraki branşmana (ya da son üniteye)
      if (i < n - 1) {
        k.cizgi(TX, y + 2, TX, yBirim(i + 1) - (i + 1 < n - 1 ? 2 : 0), BORU, 0.9);
        const h = hatParca[i];
        if (h && i + 1 < n - 1) k.yazi(TX + 2.5, y + ADIM / 2 + 1, `${cap(h)} · ${sy(h.uzunluk)} m`, 2.1, { renk: RENK.soluk });
      }
      // İç ünite hattı
      const p = bransParca[i];
      const xBas = i < n - 1 ? TX + 2 : TX;
      k.cizgi(xBas, y, IX, y, BORU, 0.6);
      if (p) k.yazi((TX + IX) / 2 + 2, y - 1.5, `${cap(p)} · ${sy(p.uzunluk)} m`, 2.2, { hiza: "orta" });
      if (sonMu && n > 1) k.yazi(TX + 2.5, y + 4.2, "(son ünite, B" + (n - 1) + "'den)", 1.9, { renk: RENK.soluk });
      kutu(i);
    }
  }

  // Açıklama
  k.cizgi(8, H - 12, W - 8, H - 12, RENK.soluk, 0.3);
  k.cizgi(10, H - 7, 20, H - 7, BORU, 0.9);
  k.yazi(22, H - 6.2, "Gaz + sıvı hat çifti (Ø gaz / Ø sıvı, mm)", 2.3);
  if (!multi) {
    k.yol([[86, H - 7], [88, H - 9], [90, H - 7], [88, H - 5]], RENK.cizgi, 0.35, { kapali: true, dolgu: "#fff3bf" });
    k.yazi(92, H - 6.2, "Y branşman kiti", 2.3);
  }
  k.yazi(W - 8, H - 2.5, "Tipik çap tablosuyla hazırlanmıştır; uygulamada üretici tablosuyla kontrol edilmelidir. Ölçekli değildir.", 2, {
    hiza: "sag",
    renk: RENK.soluk,
  });
  return { w: W, h: H, ogeler: k.ogeler };
}

function kisalt(m: string, n: number) {
  return m.length > n ? m.slice(0, n - 1) + "…" : m;
}
