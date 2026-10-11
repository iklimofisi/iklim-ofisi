// -----------------------------------------------------------------------------
// KLİMA / VRF — SOĞUTUCU AKIŞKAN BORU ŞEMALARI
//  boruSemasi: tek hat şeması — dış ünite, ana hat, branşman (Y) kitleri ve her iç
//              üniteye giden hatlar; her parçada çap ve uzunluk yazılır.
//  kotSemasi:  düşey (kat) şeması — dış ünite ve iç ünitelerin kat / kot seviyeleri,
//              dikey hat ve kot farkı kontrolleri.
// Ekran (SVG) ve PDF aynı listeyi çizer. "etiket" taşıyan yazılar panelde tıklanıp
// değiştirilebilir (oda / sistem girdisini değiştirir), "git" taşıyanlar odayı açar.
// -----------------------------------------------------------------------------
import { Kalem, RENK, type Cizim } from "@/lib/isi-hesap/cizim";
import { sy } from "@/lib/isi-hesap/hesap";
import type { SistemSonucu, BoruParcasi } from "./hesap";
import { SISTEM_TIPLERI } from "./katalog";

const BORU = "#0b7285";
const DUZEN = "#1864ab"; // düzenlenebilir ölçü rengi
const cap = (p: BoruParcasi) => (p.basma ? `Ø${sy(p.gaz, 2)} / Ø${sy(p.basma, 2)} / Ø${sy(p.sivi, 2)}` : `Ø${sy(p.gaz, 2)} / Ø${sy(p.sivi, 2)}`);
const isaretli = (x: number) => `${x > 0 ? "+" : ""}${sy(x)}`;
const yuv = (x: number) => Math.round(x * 100) / 100;

// Kot → kat adı (kat yüksekliğinin tam katıysa)
export function katAdi(kot: number, katYuksekligi: number): string | null {
  if (!(katYuksekligi > 0)) return null;
  const n = Math.round(kot / katYuksekligi);
  if (Math.abs(kot - n * katYuksekligi) > 0.35) return null;
  return n === 0 ? "Zemin kat" : n > 0 ? `${n}. kat` : `${-n}. bodrum`;
}

export function boruSemasi(s: SistemSonucu, baslik: string, katYuksekligi = 3): Cizim {
  const k = new Kalem();
  const n = s.uniteler.length;
  const W = 210;
  const ADIM = 20;
  const Y0 = 58;
  const H = Y0 + (Math.max(1, n) - 1) * ADIM + 30;
  const multi = s.tip === "MULTI";
  const hr = s.tip === "VRF_HR";
  const bsGorulen = new Set<string>();

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
  k.yazi(OX + 31, OY + 7, "DIŞ ÜNİTE", 2.4, { hiza: "orta", kalin: true });
  k.yazi(OX + 31, OY + 11.5, s.disKw ? `${sy(s.disKw)} kW` : "—", 2.6, { hiza: "orta" });
  k.yazi(OX + 31, OY + 15.5, `kot ${isaretli(s.disKot)} m`, 2.1, { hiza: "orta", renk: DUZEN, etiket: `disKot|${s.no}` });
  const kd = katAdi(s.disKot, katYuksekligi);
  if (kd) k.yazi(OX + 31, OY + 18.6, kd, 1.8, { hiza: "orta", renk: RENK.soluk });

  const TX = 64; // ana hat (gövde) x
  const IX = 128; // iç ünite kutusu x
  const yBirim = (i: number) => Y0 + i * ADIM;
  const kutu = (i: number) => {
    const u = s.uniteler[i];
    const y = yBirim(i);
    k.dortgen(IX, y - 6, 74, 12, RENK.cizgi, 0.5, { dolgu: "#e7f5ff", r: 1.2 });
    k.yazi(IX + 2.5, y - 1.5, kisalt(u.oda, 24), 2.6, { kalin: true, git: u.odaId });
    const ka = katAdi(u.kot, katYuksekligi);
    k.yazi(IX + 71.5, y - 1.5, `kot ${isaretli(u.kot)} m`, 2.1, { hiza: "sag", renk: DUZEN, etiket: `kot|${u.odaId}` });
    k.yazi(IX + 2.5, y + 3.2, `${u.tipAdi} · ${sy(u.kw)} kW · dış üniteden ${sy(u.uzaklik)} m${ka ? ` · ${ka}` : ""}`, 2.0, { renk: RENK.soluk });
  };

  if (multi) {
    // Her iç ünite dış üniteden ayrı hatla
    const bus = OX + 42;
    s.uniteler.forEach((u, i) => {
      const y = yBirim(i);
      const p = s.parcalar[i];
      const x = bus + 4 + i * 1.6;
      k.yol([[bus, OY + 6 + Math.min(i, 8) * 1.2], [x, OY + 6 + Math.min(i, 8) * 1.2], [x, y], [IX, y]], BORU, 0.6);
      if (p) k.yazi((x + IX) / 2 + 2, y - 1.5, `${cap(p)} · ${sy(p.uzunluk)} m`, 2.2, { hiza: "orta", renk: DUZEN, etiket: p.etiket });
      kutu(i);
    });
  } else if (n > 0) {
    const ana = s.parcalar[0];
    // Ana hat: dış üniteden gövdeye
    k.yol([[OX + 42, OY + 10], [TX, OY + 10], [TX, yBirim(0)]], BORU, 1.1);
    k.yazi(TX + 3, OY + 7, `Ana hat ${cap(ana)} · ${sy(ana.uzunluk)} m`, 2.4, { kalin: true, renk: DUZEN, etiket: ana.etiket });
    const bransParca = s.parcalar.filter((p) => p.tur === "BRANS");
    const hatParca = s.parcalar.filter((p) => p.tur === "HAT");
    for (let i = 0; i < n; i++) {
      const y = yBirim(i);
      const sonMu = i === n - 1;
      if (i < n - 1) {
        // Y branşmanı
        const b = s.bransmanlar[i];
        k.yol([[TX - 2, y], [TX, y - 2], [TX + 2, y], [TX, y + 2]], RENK.cizgi, 0.35, { kapali: true, dolgu: "#fff3bf" });
        k.yazi(TX - 3.5, y + 1, `B${i + 1}`, 2.4, { hiza: "sag", kalin: true });
        if (b) k.yazi(TX - 3.5, y + 4.5, `${sy(b.kw)} kW`, 1.9, { hiza: "sag", renk: RENK.soluk });
        // Gövde bir sonraki branşmana (ya da son üniteye)
        k.cizgi(TX, y + 2, TX, yBirim(i + 1) - (i + 1 < n - 1 ? 2 : 0), BORU, 0.9);
        if (i + 1 < n - 1) {
          const h = hatParca[i];
          if (h) k.yazi(TX + 2.5, y + ADIM / 2 + 1, `${cap(h)} · ${sy(h.uzunluk)} m`, 2.1, { renk: h.etiket ? DUZEN : RENK.soluk, etiket: h.etiket });
        } else {
          // Son üniteye giden gövde parçası (son parçanın ana hat kısmı)
          const p = bransParca[n - 1];
          if (p?.hatKismi !== undefined) k.yazi(TX + 2.5, y + ADIM / 2 + 1, `${sy(p.hatKismi)} m`, 2.1, { renk: p.hatEtiket ? DUZEN : RENK.soluk, etiket: p.hatEtiket });
        }
      }
      // İç ünite hattı
      const p = bransParca[i];
      const xBas = i < n - 1 ? TX + 2 : TX;
      k.cizgi(xBas, y, IX, y, BORU, 0.6);
      if (p) {
        const uzunluk = p.hatKismi !== undefined ? p.uzunluk - p.hatKismi : p.uzunluk;
        k.yazi((TX + IX) / 2 + 6, y - 1.5, `${cap(p)} · ${sy(uzunluk)} m`, 2.2, { hiza: "orta", renk: DUZEN, etiket: p.etiket });
      }
      if (sonMu && n > 1) k.yazi(TX + 2.5, y + 4.2, "(son ünite, B" + (n - 1) + "'den)", 1.9, { renk: RENK.soluk });
      if (hr && !bsGorulen.has(s.uniteler[i].oda)) {
        // Isı geri kazanımlı VRF: her oda (bölge) bir BS kutusundan beslenir
        bsGorulen.add(s.uniteler[i].oda);
        k.dortgen(TX + 6, y - 2.6, 9, 5.2, RENK.cizgi, 0.4, { dolgu: "#ffe8cc", r: 0.6 });
        k.yazi(TX + 10.5, y + 0.9, "BS", 2.2, { hiza: "orta", kalin: true });
      }
      kutu(i);
    }
  }

  // Açıklama
  k.cizgi(8, H - 12, W - 8, H - 12, RENK.soluk, 0.3);
  k.cizgi(10, H - 7, 20, H - 7, BORU, 0.9);
  k.yazi(22, H - 6.2, hr ? "BS öncesi 3 boru (Ø emme / Ø basma / Ø sıvı), BS sonrası 2 boru (mm)" : "Gaz + sıvı hat çifti (Ø gaz / Ø sıvı, mm)", 2.3);
  if (!multi) {
    const lx = hr ? 112 : 86;
    k.yol([[lx, H - 7], [lx + 2, H - 9], [lx + 4, H - 7], [lx + 2, H - 5]], RENK.cizgi, 0.35, { kapali: true, dolgu: "#fff3bf" });
    k.yazi(lx + 6, H - 6.2, "Y branşman kiti", 2.3);
    if (hr) {
      k.dortgen(150, H - 9.2, 7, 4.4, RENK.cizgi, 0.4, { dolgu: "#ffe8cc", r: 0.5 });
      k.yazi(159, H - 6.2, "BS (soğ./ısıt. seçici) kutusu", 2.3);
    }
  }
  k.yazi(W - 8, H - 2.5, "Tipik çap tablosuyla hazırlanmıştır; uygulamada üretici tablosuyla kontrol edilmelidir. Ölçekli değildir.", 2, {
    hiza: "sag",
    renk: RENK.soluk,
  });
  return { w: W, h: H, ogeler: k.ogeler };
}

// -----------------------------------------------------------------------------
// DÜŞEY (KAT) ŞEMASI
// Her farklı kot bir seviye çizgisidir; dış ünite kendi kotunda, iç üniteler bulundukları
// katta gösterilir. Soldaki ölçü okları dış ünite – iç ünite ve iç üniteler arası
// kot farkını sınırlarıyla birlikte verir (yeşil uygun, kırmızı sınır aşılmış).
// -----------------------------------------------------------------------------
export function kotSemasi(s: SistemSonucu, baslik: string, katYuksekligi = 3): Cizim {
  const k = new Kalem();
  const W = 210;
  const tanim = SISTEM_TIPLERI[s.tip];
  const SUTUN = 3; // bir seviyede yan yana en çok kutu
  const KG = 33; // kutu genişliği
  const ARA = 2; // kutular arası
  const KX0 = 96; // ilk kutu x
  const RX = 84; // dikey hat (kolon) x
  const SAT = 15; // kutu satır yüksekliği

  // Seviyeler (yüksekten alçağa)
  const kotlar = [...new Set([s.disKot, ...s.uniteler.map((u) => u.kot)].map(yuv))].sort((a, b) => b - a);
  const seviyeUniteleri = (kot: number) => s.uniteler.filter((u) => Math.abs(yuv(u.kot) - kot) < 0.005);
  const satirSayisi = (kot: number) => Math.ceil(seviyeUniteleri(kot).length / SUTUN);
  const seviyeY = new Map<number, number>(); // seviye çizgisinin (döşeme) y'si
  let y = 30;
  for (const kt of kotlar) {
    y += Math.max(22, 6 + satirSayisi(kt) * SAT);
    seviyeY.set(kt, y);
  }
  const H = y + 22;

  const ust = s.kotDisFark > 0 ? s.kotDisFark : 0;
  const alt = s.kotDisFark < 0 ? -s.kotDisFark : 0;
  k.yazi(8, 9, `DÜŞEY ŞEMA (KAT / KOT) — ${s.ad} (${s.tipAdi})`, 4, { kalin: true });
  k.yazi(8, 15, baslik, 2.7, { renk: RENK.soluk });
  k.yazi(
    8,
    20,
    `Dış ünite kotu ${isaretli(s.disKot)} m · dış–iç en büyük kot farkı ${
      ust > 0 ? `${sy(ust)} m (dış ünite üstte, sınır ≤ ${tanim.kotDisUstte} m)` : alt > 0 ? `${sy(alt)} m (dış ünite altta, sınır ≤ ${tanim.kotDisAltta} m)` : "0 m"
    } · iç üniteler arası ${sy(s.kotIcFark)} m (sınır ≤ ${tanim.kotIcIc} m)`,
    2.4,
    { renk: RENK.soluk }
  );
  k.cizgi(8, 23, W - 8, 23, RENK.soluk, 0.3);

  // Seviye (döşeme) çizgileri ve adları
  for (const kt of kotlar) {
    const yy = seviyeY.get(kt)!;
    k.cizgi(32, yy, W - 8, yy, "#adb5bd", 0.4);
    const ka = katAdi(kt, katYuksekligi);
    k.yazi(32, yy - 1.4, `${ka ? ka + " · " : ""}kot ${isaretli(kt)} m`, 2.1, { renk: RENK.soluk, kalin: true });
  }

  // Dış ünite (kendi seviyesinde, solda)
  const disY = seviyeY.get(yuv(s.disKot))!;
  const DX = 36;
  const disMerkez = disY - 11; // kutu seviye çizgisinin üstünde, kat adına çakışmaz
  k.dortgen(DX, disY - 17, 32, 12, RENK.cizgi, 0.5, { dolgu: "#f8f9fa", r: 1.2 });
  k.daire(DX + 6.5, disMerkez, 4, RENK.cizgi, 0.35, RENK.beyaz);
  k.yazi(DX + 20.5, disY - 12, "DIŞ ÜNİTE", 2.1, { hiza: "orta", kalin: true });
  k.yazi(DX + 20.5, disY - 8, `kot ${isaretli(s.disKot)} m`, 2, { hiza: "orta", renk: DUZEN, etiket: `disKot|${s.no}` });

  // İç üniteler: önce hatlar, sonra kutular (kutular hattın üstünü örter)
  const kutular: { x: number; y: number; u: SistemSonucu["uniteler"][number] }[] = [];
  const merkezler: number[] = [disMerkez];
  for (const kt of kotlar) {
    const liste = seviyeUniteleri(kt);
    if (!liste.length) continue;
    const yy = seviyeY.get(kt)!;
    const satir = satirSayisi(kt);
    for (let sat = 0; sat < satir; sat++) {
      const by = yy - 3 - (satir - sat) * SAT + 1;
      const cy = by + 6;
      const bu = liste.slice(sat * SUTUN, sat * SUTUN + SUTUN);
      merkezler.push(cy);
      k.cizgi(RX, cy, KX0 + (bu.length - 1) * (KG + ARA) + 2, cy, BORU, 0.55);
      bu.forEach((u, j) => kutular.push({ x: KX0 + j * (KG + ARA), y: by, u }));
    }
  }
  // Dış üniteden kolona ve kolon boyunca
  k.cizgi(DX + 32, disMerkez, RX, disMerkez, BORU, 1);
  k.cizgi(RX, Math.min(...merkezler), RX, Math.max(...merkezler), BORU, 1);
  for (const { x, y: by, u } of kutular) {
    k.dortgen(x, by, KG, 12, RENK.cizgi, 0.45, { dolgu: "#e7f5ff", r: 1 });
    k.yazi(x + 1.5, by + 4, kisalt(u.oda, 18), 2.1, { kalin: true, git: u.odaId });
    k.yazi(x + 1.5, by + 7.4, `${sy(u.kw)} kW · ${kisalt(u.tipAdi, 16)}`, 1.7, { renk: RENK.soluk });
    k.yazi(x + 1.5, by + 10.6, `kot ${isaretli(u.kot)} m`, 1.8, { renk: DUZEN, etiket: `kot|${u.odaId}` });
  }

  // Kot farkı ölçü okları (solda): yeşil uygun, kırmızı sınır aşılmış
  const olcu = (x: number, y1: number, y2: number, m: string, uygun: boolean) => {
    if (Math.abs(y2 - y1) < 3) return;
    const renk = uygun ? RENK.yesil : "#c92a2a";
    k.cizgi(x, y1, x, y2, renk, 0.4);
    k.cizgi(x - 1.5, y1, x + 1.5, y1, renk, 0.4);
    k.cizgi(x - 1.5, y2, x + 1.5, y2, renk, 0.4);
    k.yazi(x + 2, (y1 + y2) / 2 + 1, m, 2, { renk, kalin: true });
  };
  if (s.uniteler.length) {
    const kotListesi = s.uniteler.map((u) => u.kot);
    if (ust > 0) olcu(12, disY, seviyeY.get(yuv(Math.min(...kotListesi)))!, `Δh ${sy(ust)} m`, ust <= tanim.kotDisUstte);
    else if (alt > 0) olcu(12, disY, seviyeY.get(yuv(Math.max(...kotListesi)))!, `Δh ${sy(alt)} m`, alt <= tanim.kotDisAltta);
    if (s.kotIcFark > 0)
      olcu(24, seviyeY.get(yuv(Math.max(...kotListesi)))!, seviyeY.get(yuv(Math.min(...kotListesi)))!, `iç ${sy(s.kotIcFark)} m`, s.kotIcFark <= tanim.kotIcIc);
  }

  k.cizgi(8, H - 12, W - 8, H - 12, RENK.soluk, 0.3);
  k.yazi(8, H - 6.5, "Seviyeler kat kotlarıdır (zemin = 0). Ölçü oklarında yeşil: sınır içinde, kırmızı: sınır aşılmış. Ölçekli değildir.", 2.1, {
    renk: RENK.soluk,
  });
  return { w: W, h: H, ogeler: k.ogeler };
}

function kisalt(m: string, n: number) {
  return m.length > n ? m.slice(0, n - 1) + "…" : m;
}
