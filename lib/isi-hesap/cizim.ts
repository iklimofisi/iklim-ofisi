// -----------------------------------------------------------------------------
// ISI POMPASI PROJESİ — ÇİZİMLER
// Çizimler ekrandan (SVG) ve PDF'ten (jsPDF) bağımsız basit bir şekil listesi
// olarak üretilir; iki çizici de aynı listeyi okur, böylece ekranda görülen ile
// PDF'e basılan şema birebir aynıdır.
//   1. tesisatSemasi(): ısı pompası, emniyet grubu, filtre, genleşme tankı,
//      3 yollu vana, boyler, tampon tank, pompalar, karışım vanası, kollektör ve
//      radyatör devrelerini tüm ara bağlantılarıyla gösteren prensip şeması
//   2. serimKrokisi(): oda bazında ölçekli yerden ısıtma boru serim krokisi
// -----------------------------------------------------------------------------
import type { HesapSonucu, OdaSonucu, YerdenSonucu } from "./hesap";
import { sy } from "./hesap";

export type Hiza = "sol" | "orta" | "sag";
export type Oge =
  | { t: "cizgi"; x1: number; y1: number; x2: number; y2: number; renk: string; k: number; kesik?: boolean }
  | { t: "yol"; n: [number, number][]; renk: string; k: number; kesik?: boolean; kapali?: boolean; dolgu?: string }
  | { t: "dortgen"; x: number; y: number; w: number; h: number; renk: string; k: number; dolgu?: string; r?: number; kesik?: boolean }
  | { t: "daire"; x: number; y: number; r: number; renk: string; k: number; dolgu?: string }
  | { t: "yazi"; x: number; y: number; m: string; b: number; renk: string; hiza?: Hiza; kalin?: boolean };

export type Cizim = { w: number; h: number; ogeler: Oge[] };

export const RENK = {
  gidis: "#d9480f",
  donus: "#1971c2",
  soguk: "#0c8599",
  sicak: "#e8590c",
  cizgi: "#12212b",
  soluk: "#868e96",
  zemin: "#f1f3f5",
  yesil: "#2b8a3e",
  beyaz: "#ffffff",
};

class Kalem {
  ogeler: Oge[] = [];
  cizgi(x1: number, y1: number, x2: number, y2: number, renk = RENK.cizgi, k = 0.5, kesik = false) {
    this.ogeler.push({ t: "cizgi", x1, y1, x2, y2, renk, k, kesik });
  }
  yol(n: [number, number][], renk = RENK.cizgi, k = 0.5, ek: { kesik?: boolean; kapali?: boolean; dolgu?: string } = {}) {
    this.ogeler.push({ t: "yol", n, renk, k, ...ek });
  }
  dortgen(x: number, y: number, w: number, h: number, renk = RENK.cizgi, k = 0.5, ek: { dolgu?: string; r?: number; kesik?: boolean } = {}) {
    this.ogeler.push({ t: "dortgen", x, y, w, h, renk, k, ...ek });
  }
  daire(x: number, y: number, r: number, renk = RENK.cizgi, k = 0.5, dolgu?: string) {
    this.ogeler.push({ t: "daire", x, y, r, renk, k, dolgu });
  }
  yazi(x: number, y: number, m: string, b = 3, ek: { renk?: string; hiza?: Hiza; kalin?: boolean } = {}) {
    this.ogeler.push({ t: "yazi", x, y, m, b, renk: ek.renk ?? RENK.cizgi, hiza: ek.hiza ?? "sol", kalin: ek.kalin });
  }
  nokta(x: number, y: number, renk: string) {
    this.daire(x, y, 0.9, renk, 0.3, renk);
  }

  // --- Semboller (yatay hat üzerinde, merkez x,y) ---
  vana(x: number, y: number, renk = RENK.cizgi) {
    this.yol([[x - 3, y - 2], [x + 3, y + 2], [x + 3, y - 2], [x - 3, y + 2]], renk, 0.4, { kapali: true, dolgu: RENK.beyaz });
  }
  cekValf(x: number, y: number, renk = RENK.cizgi) {
    this.yol([[x - 2.5, y - 2], [x + 2, y], [x - 2.5, y + 2]], renk, 0.4, { kapali: true, dolgu: RENK.beyaz });
    this.cizgi(x + 2.5, y - 2.2, x + 2.5, y + 2.2, renk, 0.5);
  }
  pompa(x: number, y: number, yonSag = true) {
    this.daire(x, y, 3.6, RENK.cizgi, 0.45, RENK.beyaz);
    const d = yonSag ? 1 : -1;
    this.yol([[x - 1.6 * d, y - 2.4], [x + 2.6 * d, y], [x - 1.6 * d, y + 2.4]], RENK.cizgi, 0.35, { kapali: true, dolgu: RENK.cizgi });
  }
  termometre(x: number, y: number, ust = true) {
    const yy = ust ? y - 6 : y + 6;
    this.cizgi(x, y, x, yy + (ust ? 1.8 : -1.8), RENK.soluk, 0.3);
    this.daire(x, yy, 1.8, RENK.cizgi, 0.3, RENK.beyaz);
    this.yazi(x, yy + 0.9, "T", 2, { hiza: "orta" });
  }
  manometre(x: number, y: number, ust = true) {
    const yy = ust ? y - 6 : y + 6;
    this.cizgi(x, y, x, yy + (ust ? 1.8 : -1.8), RENK.soluk, 0.3);
    this.daire(x, yy, 1.8, RENK.cizgi, 0.3, RENK.beyaz);
    this.yazi(x, yy + 0.9, "P", 2, { hiza: "orta" });
  }
  filtre(x: number, y: number, renk = RENK.cizgi) {
    this.dortgen(x - 3, y - 2.5, 6, 5, renk, 0.4, { dolgu: RENK.beyaz });
    this.cizgi(x - 3, y + 2.5, x + 3, y - 2.5, renk, 0.3);
    this.cizgi(x, y + 2.5, x, y + 5, renk, 0.4);
    this.dortgen(x - 1.2, y + 5, 2.4, 1.6, renk, 0.3, { dolgu: renk });
  }
  hortum(x: number, y: number, renk: string) {
    const n: [number, number][] = [];
    for (let i = 0; i <= 8; i++) n.push([x - 4 + i, y + (i % 2 ? -1 : 1)]);
    this.yol(n, renk, 0.5);
  }
  ucYollu(x: number, y: number, asagiKol = true, motor = true) {
    this.yol([[x - 3, y - 2], [x, y], [x - 3, y + 2]], RENK.cizgi, 0.4, { kapali: true, dolgu: RENK.beyaz });
    this.yol([[x + 3, y - 2], [x, y], [x + 3, y + 2]], RENK.cizgi, 0.4, { kapali: true, dolgu: RENK.beyaz });
    const d = asagiKol ? 1 : -1;
    this.yol([[x - 2, y + 3 * d], [x, y], [x + 2, y + 3 * d]], RENK.cizgi, 0.4, { kapali: true, dolgu: RENK.beyaz });
    if (motor) {
      this.cizgi(x, y, x, y - 4 * d, RENK.cizgi, 0.4);
      this.dortgen(x - 2.2, y - 4 * d - (d > 0 ? 4.4 : 0), 4.4, 4.4, RENK.cizgi, 0.4, { dolgu: RENK.beyaz });
      this.yazi(x, y - 4 * d - (d > 0 ? 1.2 : -3.2), "M", 2.4, { hiza: "orta", kalin: true });
    }
  }
  emniyetVentili(x: number, yTaban: number) {
    this.cizgi(x, yTaban, x, yTaban - 4, RENK.cizgi, 0.4);
    this.yol([[x - 2, yTaban - 4], [x + 2, yTaban - 4], [x, yTaban - 7]], RENK.cizgi, 0.4, { kapali: true, dolgu: RENK.beyaz });
    this.yol([[x, yTaban - 7], [x - 1.2, yTaban - 8], [x + 1.2, yTaban - 9], [x - 1.2, yTaban - 10], [x, yTaban - 11]], RENK.cizgi, 0.35);
    this.cizgi(x + 2, yTaban - 5.5, x + 5, yTaban - 5.5, RENK.soluk, 0.3);
    this.yol([[x + 5, yTaban - 5.5], [x + 5, yTaban - 2]], RENK.soluk, 0.3);
  }
  purjor(x: number, yTaban: number) {
    this.cizgi(x, yTaban, x, yTaban - 3, RENK.cizgi, 0.4);
    this.dortgen(x - 1.5, yTaban - 6, 3, 3, RENK.cizgi, 0.35, { dolgu: RENK.beyaz });
    this.cizgi(x, yTaban - 6, x, yTaban - 7.5, RENK.cizgi, 0.35);
  }
  genlesmeTanki(x: number, yUst: number, etiket: string) {
    this.dortgen(x - 5, yUst, 10, 15, RENK.cizgi, 0.45, { dolgu: "#e7f5ff", r: 4.5 });
    this.cizgi(x - 5, yUst + 7.5, x + 5, yUst + 7.5, RENK.soluk, 0.3, true);
    this.yazi(x + 7, yUst + 6, etiket, 2.6);
  }
  radyator(x: number, y: number, w: number, h: number) {
    this.dortgen(x, y, w, h, RENK.cizgi, 0.45, { dolgu: RENK.beyaz });
    for (let i = 1; i < 6; i++) this.cizgi(x + (w * i) / 6, y + 1, x + (w * i) / 6, y + h - 1, RENK.soluk, 0.25);
  }
}

// =============================================================================
// 1. TESİSAT PRENSİP ŞEMASI
// =============================================================================
export function tesisatSemasi(s: HesapSonucu, baslik: string): Cizim {
  const W = 420;
  const H = 272;
  const k = new Kalem();
  const sicakSu = !!s.boyler;
  const tampon = s.tampon.hacim > 0;
  const radyatorAdet = s.odalar.reduce((t, o) => t + (o.radyator?.parcalar.length ?? 0), 0);
  const devreSayisi = (s.radyatorVar ? 1 : 0) + (s.yerdenVar ? 1 : 0);
  const dengeKabi = !tampon && devreSayisi > 1;

  // Başlık
  k.yazi(8, 9, `TESİSAT PRENSİP ŞEMASI — ${baslik}`, 4.4, { kalin: true });
  k.yazi(8, 15, `${s.il} · dış tasarım ${sy(s.disSicaklik)} °C · ısıtma yükü ${sy(s.isitmaYuku / 1000)} kW · ısı pompası gidiş ${sy(s.pompaGidis)} °C`, 2.8, { renk: RENK.soluk });
  k.cizgi(8, 18, W - 8, 18, RENK.soluk, 0.3);

  // Dış ortam / bina duvarı
  k.dortgen(5, 40, 82, 150, RENK.soluk, 0.3, { kesik: true });
  k.yazi(9, 46, "DIŞ ORTAM", 2.6, { renk: RENK.soluk, kalin: true });
  k.dortgen(88, 26, 2.5, 230, RENK.soluk, 0.2, { dolgu: "#ced4da" });

  // Isı pompası dış ünitesi
  k.dortgen(12, 68, 58, 70, RENK.cizgi, 0.6, { dolgu: "#f8f9fa", r: 2 });
  k.daire(38, 100, 20, RENK.cizgi, 0.5, RENK.beyaz);
  k.daire(38, 100, 3, RENK.cizgi, 0.4, RENK.cizgi);
  for (const a of [0, 90, 180, 270]) {
    const r = (a * Math.PI) / 180;
    k.yol(
      [
        [38 + 3 * Math.cos(r), 100 + 3 * Math.sin(r)],
        [38 + 17 * Math.cos(r + 0.35), 100 + 17 * Math.sin(r + 0.35)],
        [38 + 17 * Math.cos(r - 0.15), 100 + 17 * Math.sin(r - 0.15)],
      ],
      RENK.cizgi,
      0.35,
      { kapali: true, dolgu: "#dee2e6" }
    );
  }
  const modelAdi = s.secilenModel ? s.secilenModel.ad : "Hava kaynaklı ısı pompası";
  k.yazi(41, 145, "ISI POMPASI (monoblok)", 2.9, { hiza: "orta", kalin: true });
  k.yazi(41, 150, kisalt(modelAdi, 34), 2.6, { hiza: "orta" });
  k.yazi(41, 155, `Gerekli ${sy(s.tasarimYuku / 1000)} kW @ ${sy(s.disSicaklik)} °C`, 2.6, { hiza: "orta", renk: RENK.soluk });
  // Dış hava sensörü
  k.dortgen(18, 56, 5, 5, RENK.cizgi, 0.4, { dolgu: RENK.beyaz });
  k.yazi(25, 60, "Dış hava sensörü", 2.4);

  const YS = 82; // ısı pompası gidiş hattı
  const YR = 128; // dönüş hattı
  const XT = tampon || dengeKabi ? 236 : 286; // tampon / denge kabı sol kenarı (yoksa doğrudan dağıtıcıya)

  // Ana hatlar
  k.cizgi(70, YS, XT, YS, RENK.gidis, 0.9);
  k.cizgi(70, YR, XT, YR, RENK.donus, 0.9);
  k.yazi(190, YS - 2.5, `Gidiş ${sy(s.pompaGidis)} °C`, 2.5, { renk: RENK.gidis, hiza: "orta" });
  k.yazi(186, YR + 4.5, `Dönüş ${sy(s.pompaGidis - 5)} °C`, 2.5, { renk: RENK.donus, hiza: "orta" });
  if (s.hatlar.pompa)
    k.yazi(218, YS - 2.5, `${s.hatlar.pompa.ad} · ${Math.round(s.pompalar.pompaDebi)} L/h`, 2.5, { hiza: "orta" });

  // Gidiş hattı bileşenleri
  k.hortum(78, YS, RENK.gidis);
  k.vana(96, YS);
  // Emniyet grubu
  k.cizgi(108, YS, 108, YS - 6, RENK.gidis, 0.5);
  k.cizgi(103, YS - 6, 115, YS - 6, RENK.gidis, 0.5);
  k.emniyetVentili(103, YS - 6);
  k.manometre(109, YS - 6);
  k.purjor(115, YS - 6);
  k.nokta(108, YS, RENK.gidis);
  k.yazi(100, YS - 22, "Emniyet grubu", 2.4, { kalin: true });
  k.yazi(100, YS - 18.5, `EV ${s.genlesme.emniyet} bar · manometre · pürjör`, 2.2, { renk: RENK.soluk });
  // Yedek ısıtıcı
  if (s.secilenModel && s.secilenModel.yedekGerekli > 0.05) {
    k.dortgen(121, YS - 4, 12, 8, RENK.cizgi, 0.45, { dolgu: "#fff4e6" });
    k.yol([[123, YS + 1.5], [125, YS - 1.5], [127, YS + 1.5], [129, YS - 1.5], [131, YS + 1.5]], RENK.sicak, 0.4);
    k.yazi(127, YS + 9, `Yedek ısıtıcı ${sy(s.secilenModel.yedekGerekli)} kW`, 2.3, { hiza: "orta" });
  }
  k.termometre(141, YS);

  // Dönüş hattı bileşenleri
  k.hortum(78, YR, RENK.donus);
  k.vana(96, YR, RENK.cizgi);
  k.filtre(108, YR);
  k.yazi(108, YR + 12, "Manyetik filtre", 2.3, { hiza: "orta" });
  k.yazi(108, YR + 15.5, "+ pislik tutucu", 2.3, { hiza: "orta", renk: RENK.soluk });
  // Dolum grubu
  k.cizgi(124, YR, 124, YR + 16, RENK.soguk, 0.5);
  k.nokta(124, YR, RENK.donus);
  k.cekValf(124, YR + 7, RENK.cizgi);
  k.vana(124, YR + 13);
  k.yazi(124, YR + 21, "Dolum grubu", 2.3, { hiza: "orta" });
  k.yazi(124, YR + 24.5, "(şebeke suyu)", 2.2, { hiza: "orta", renk: RENK.soluk });
  // Genleşme tankı
  k.cizgi(140, YR, 140, YR + 18, RENK.donus, 0.5);
  k.nokta(140, YR, RENK.donus);
  k.genlesmeTanki(140, YR + 18, "");
  k.yazi(140, YR + 38, `Genleşme tankı ${s.genlesme.hacim} L`, 2.4, { hiza: "orta", kalin: true });
  k.yazi(140, YR + 41.5, `ön basınç ${sy(s.genlesme.onBasinc)} bar · dolum ${sy(s.genlesme.dolum)} bar`, 2.2, { hiza: "orta", renk: RENK.soluk });

  // 3 yollu vana + boyler
  if (sicakSu && s.boyler) {
    const XV = 168;
    k.ucYollu(XV, YS, true, true);
    k.yazi(XV + 4, YS - 13, "3 yollu vana", 2.4);
    k.yazi(XV + 4, YS - 9.5, "ısıtma / sıcak su", 2.2, { renk: RENK.soluk });
    // Boyler
    const BX = 176;
    const BY = 168;
    k.dortgen(BX, BY, 38, 76, RENK.cizgi, 0.6, { dolgu: "#fff9db", r: 7 });
    // serpantin
    const sp: [number, number][] = [[BX, BY + 38]];
    for (let i = 0; i < 6; i++) {
      sp.push([BX + 7 + (i % 2 ? 20 : 0), BY + 40 + i * 5]);
    }
    sp.push([BX + 7, BY + 70]);
    sp.push([BX, BY + 70]);
    k.yol(sp, RENK.gidis, 0.45);
    // ısıtma suyu bağlantıları
    k.yol([[XV, YS + 3], [XV, BY + 38], [BX, BY + 38]], RENK.gidis, 0.8);
    k.yol([[BX, BY + 70], [158, BY + 70], [158, YR]], RENK.donus, 0.8);
    k.nokta(158, YR, RENK.donus);
    k.yazi(BX + 19, BY + 9, `BOYLER ${s.boyler.hacim} L`, 2.8, { hiza: "orta", kalin: true });
    k.yazi(BX + 19, BY + 13.5, `serpantin en az ${sy(s.boyler.serpantinM2)} m²`, 2.3, { hiza: "orta", renk: RENK.soluk });
    // kullanım suyu
    k.yol([[BX + 38, BY + 12], [262, BY + 12]], RENK.sicak, 0.7);
    k.yazi(264, BY + 13, "Kullanım sıcak suyu", 2.5, { renk: RENK.sicak });
    k.yazi(264, BY + 16.5, `${sy(s.boyler ? s.boyler.hacim : 0, 0)} L · ${sy(s.genlesme.maksSicaklik - 8, 0)} °C`, 2.2, { renk: RENK.soluk });
    k.termometre(BX + 38, BY + 30, false);
    k.yol([[262, BY + 66], [BX + 38, BY + 66]], RENK.soguk, 0.7);
    k.cekValf(240, BY + 66);
    k.vana(250, BY + 66);
    k.cizgi(230, BY + 66, 230, BY + 58, RENK.soguk, 0.45);
    k.emniyetVentili(230, BY + 58);
    k.yazi(226, BY + 44, "Emniyet grubu 6 bar", 2.2, { hiza: "orta" });
    k.cizgi(222, BY + 66, 222, BY + 72, RENK.soguk, 0.45);
    k.nokta(222, BY + 66, RENK.soguk);
    k.dortgen(218, BY + 72, 8, 11, RENK.cizgi, 0.4, { dolgu: "#e3fafc", r: 3.5 });
    k.yazi(228, BY + 80, `Sıhhi genleşme ${s.boyler.genlesme} L`, 2.2);
    k.yazi(264, BY + 67, "Soğuk su (şebeke)", 2.5, { renk: RENK.soguk });
  }

  // Tampon tank / denge kabı
  const XD = 280; // dağıtıcı gidiş kolektörü x
  const XDR = 288; // dağıtıcı dönüş kolektörü x
  if (tampon || dengeKabi) {
    const w = tampon ? 30 : 12;
    const ust = tampon ? 58 : 70;
    const alt = tampon ? 152 : 140;
    k.dortgen(XT, ust, w, alt - ust, RENK.cizgi, 0.6, { dolgu: tampon ? "#fff5f5" : RENK.beyaz, r: tampon ? 6 : 3 });
    if (tampon) {
      k.yazi(XT + w / 2, ust - 7, `TAMPON TANK`, 2.8, { hiza: "orta", kalin: true });
      k.yazi(XT + w / 2, ust - 3, `${Math.round(s.tampon.hacim)} L`, 2.6, { hiza: "orta" });
    } else {
      k.yazi(XT + w / 2, ust - 3, "Denge kabı", 2.6, { hiza: "orta", kalin: true });
    }
    // Isıtma tarafı çıkışları
    k.cizgi(XT + w, 76, XD, 76, RENK.gidis, 0.9);
    k.cizgi(XT + w, 134, XDR, 134, RENK.donus, 0.9);
  } else {
    // Doğrudan dağıtıcıya
    k.yol([[XT, YS], [XD, YS]], RENK.gidis, 0.9);
    k.yol([[XT, YR], [XDR, YR]], RENK.donus, 0.9);
  }
  const yGirisS = tampon || dengeKabi ? 76 : YS;
  const yGirisR = tampon || dengeKabi ? 134 : YR;

  // Devre satırları
  const R_S = 46;
  const R_R = 64;
  const Y_S = 168;
  const Y_R = 206;
  const satirlarS: number[] = [];
  const satirlarR: number[] = [];
  if (s.radyatorVar) {
    satirlarS.push(R_S);
    satirlarR.push(R_R);
  }
  if (s.yerdenVar) {
    satirlarS.push(Y_S);
    satirlarR.push(Y_R);
  }
  if (satirlarS.length) {
    const minS = Math.min(yGirisS, ...satirlarS);
    const maksS = Math.max(yGirisS, ...satirlarS);
    k.cizgi(XD, minS, XD, maksS, RENK.gidis, 0.9);
    const minR = Math.min(yGirisR, ...satirlarR);
    const maksR = Math.max(yGirisR, ...satirlarR);
    k.cizgi(XDR, minR, XDR, maksR, RENK.donus, 0.9);
    k.nokta(XD, yGirisS, RENK.gidis);
    k.nokta(XDR, yGirisR, RENK.donus);
  }

  // Radyatör devresi
  if (s.radyatorVar) {
    k.nokta(XD, R_S, RENK.gidis);
    k.nokta(XDR, R_R, RENK.donus);
    k.cizgi(XD, R_S, 410, R_S, RENK.gidis, 0.8);
    k.cizgi(XDR, R_R, 410, R_R, RENK.donus, 0.8);
    k.vana(297, R_S);
    const pompaVar = tampon || dengeKabi || devreSayisi > 1;
    if (pompaVar) k.pompa(310, R_S);
    k.cekValf(321, R_S);
    k.termometre(330, R_S);
    k.vana(297, R_R);
    k.yazi(296, R_S - 13, "RADYATÖR DEVRESİ", 2.8, { kalin: true });
    k.yazi(
      296,
      R_S - 9,
      `${radyatorAdet} radyatör · ${sy(s.radyatorRejimi.gidis, 0)}/${sy(s.radyatorRejimi.donus, 0)} °C · ${Math.round(s.pompalar.radyatorDebi)} L/h${pompaVar ? ` · ${sy(s.pompalar.radyatorBasma)} mSS` : ""}${s.hatlar.radyator ? ` · ${s.hatlar.radyator.ad}` : ""}`,
      2.4,
      { renk: RENK.soluk }
    );
    const goster = Math.min(3, radyatorAdet);
    for (let i = 0; i < goster; i++) {
      const x = 344 + i * 22;
      k.cizgi(x, R_S, x, R_S + 4, RENK.gidis, 0.5);
      k.nokta(x, R_S, RENK.gidis);
      k.vana(x, R_S + 2.5);
      k.radyator(x - 2, R_S + 5, 16, 8);
      k.cizgi(x + 12, R_S + 13, x + 12, R_R, RENK.donus, 0.5);
      k.nokta(x + 12, R_R, RENK.donus);
    }
    if (radyatorAdet > goster) k.yazi(410, R_R + 5, `… toplam ${radyatorAdet} adet`, 2.4, { hiza: "sag" });
    k.yazi(344, R_R + 5, "Termostatik vana + dönüş vanası", 2.2, { renk: RENK.soluk });
  }

  // Yerden ısıtma devresi
  if (s.yerdenVar) {
    k.nokta(XD, Y_S, RENK.gidis);
    k.nokta(XDR, Y_R, RENK.donus);
    const KX = 352;
    k.cizgi(XD, Y_S, KX - 4, Y_S, RENK.gidis, 0.8);
    k.cizgi(XDR, Y_R, KX - 6, Y_R, RENK.donus, 0.8);
    k.vana(296, Y_S);
    k.vana(296, Y_R);
    if (s.karisimli) {
      k.ucYollu(309, Y_S, true, true);
      k.cizgi(309, Y_S + 3, 309, Y_R, RENK.donus, 0.5);
      k.nokta(309, Y_R, RENK.donus);
      k.yazi(309, Y_S + 16, "Karışım vanası", 2.2, { hiza: "orta" });
      k.yazi(309, Y_S + 19.5, `Kvs ${sy(s.karisimVanasiKvs ?? 0)}`, 2.2, { hiza: "orta", renk: RENK.soluk });
    }
    const pompaVar = tampon || dengeKabi || devreSayisi > 1;
    if (pompaVar) k.pompa(323, Y_S);
    k.termometre(333, Y_S);
    // Emniyet termostatı
    k.dortgen(338, Y_S - 9, 6, 5, RENK.cizgi, 0.35, { dolgu: "#fff4e6" });
    k.cizgi(341, Y_S - 4, 341, Y_S, RENK.cizgi, 0.3);
    k.yazi(345, Y_S - 5.5, "ET 55 °C", 2.1);
    k.yazi(296, Y_S - 14, "YERDEN ISITMA DEVRESİ", 2.8, { kalin: true });
    k.yazi(
      296,
      Y_S - 10,
      `${sy(s.yerdenGidis ?? 0)}/${sy(s.yerdenDonusOrt ?? 0)} °C · ${Math.round(s.pompalar.yerdenDebi)} L/h${pompaVar ? ` · ${sy(s.pompalar.yerdenBasma)} mSS` : ""}${s.hatlar.yerden ? ` · ${s.hatlar.yerden.ad}` : ""}`,
      2.4,
      { renk: RENK.soluk }
    );
    // Kollektör
    const toplamAgiz = s.kollektorler.reduce((t, c) => t + c.agiz, 0);
    const goster = Math.min(8, toplamAgiz);
    const genislik = Math.max(30, goster * 7 + 6);
    const KS = Y_S + 6; // kollektör gidiş barı
    const KR = Y_S + 14; // dönüş barı
    k.yol([[KX - 4, Y_S], [KX - 4, KS], [KX, KS]], RENK.gidis, 0.8);
    k.yol([[KX - 6, Y_R], [KX - 6, KR], [KX, KR]], RENK.donus, 0.8);
    k.dortgen(KX, KS - 1.6, genislik, 3.2, RENK.gidis, 0.4, { dolgu: "#ffe3e3" });
    k.dortgen(KX, KR - 1.6, genislik, 3.2, RENK.donus, 0.4, { dolgu: "#d0ebff" });
    for (let i = 0; i < goster; i++) {
      const x = KX + 5 + i * 7;
      k.cizgi(x, KS + 1.6, x, KS + 4, RENK.gidis, 0.45);
      k.daire(x, KS + 5, 1, RENK.cizgi, 0.3, RENK.beyaz); // debimetre
      k.cizgi(x, KS + 6, x, Y_S + 36, RENK.gidis, 0.45);
      k.cizgi(x + 3, KR + 1.6, x + 3, Y_S + 36, RENK.donus, 0.45);
      k.dortgen(x + 1.8, KR + 2, 2.4, 2.4, RENK.cizgi, 0.3, { dolgu: "#e9ecef" }); // aktüatör
      k.yol([[x, Y_S + 36], [x, Y_S + 41], [x + 3, Y_S + 41], [x + 3, Y_S + 36]], RENK.soluk, 0.45);
    }
    const kolEtiket =
      s.kollektorler.length > 1
        ? `${s.kollektorler.length} kollektör · toplam ${toplamAgiz} ağız`
        : `Kollektör · ${toplamAgiz} ağız (debimetreli)`;
    k.yazi(KX, Y_S + 48, kolEtiket, 2.5, { kalin: true });
    k.yazi(KX, Y_S + 52, "Her devrede elektrotermik aktüatör + oda termostatı", 2.2, { renk: RENK.soluk });
    const odaListesi = s.odalar.filter((o) => o.yerden).map((o) => `${o.ad} (${o.yerden!.devreSayisi})`).join(", ");
    satirBol(odaListesi, 52).slice(0, 3).forEach((sat, i) => k.yazi(KX, Y_S + 56 + i * 3.6, sat, 2.2, { renk: RENK.soluk }));
    // pürjör kollektör üstünde
    k.purjor(KX + genislik + 2, KS);
    k.cizgi(KX + genislik, KS, KX + genislik + 2, KS, RENK.gidis, 0.45);
  }

  // Açıklama
  const LY = 262;
  k.cizgi(8, LY - 6, W - 8, LY - 6, RENK.soluk, 0.3);
  const lejant: [string, string][] = [
    ["Isıtma gidiş", RENK.gidis],
    ["Isıtma dönüş", RENK.donus],
    ["Soğuk su", RENK.soguk],
    ["Sıcak kullanım suyu", RENK.sicak],
  ];
  lejant.forEach(([ad, renk], i) => {
    const x = 10 + i * 46;
    k.cizgi(x, LY, x + 10, LY, renk, 0.9);
    k.yazi(x + 12, LY + 1, ad, 2.5);
  });
  k.yazi(W - 8, LY + 1, "Prensip şemasıdır; ölçekli değildir. Boru çapları çok katmanlı (PE-X/Al/PE) boru dış çapıdır.", 2.2, {
    hiza: "sag",
    renk: RENK.soluk,
  });

  return { w: W, h: H, ogeler: k.ogeler };
}

// =============================================================================
// 2. YERDEN ISITMA SERİM KROKİSİ (oda bazında, ölçekli)
// =============================================================================
const KENAR = 0.15; // duvardan ilk boruya mesafe (m)

// Dikdörtgen içinde, verilen ofsetlerle içe doğru dikdörtgen sarmal
function sarmal(w: number, h: number, ofsetler: number[], adim: number): [number, number][] {
  const n: [number, number][] = [];
  ofsetler.forEach((a, i) => {
    if (i === 0) n.push([a, h]);
    n.push([a, a]);
    n.push([w - a, a]);
    n.push([w - a, h - a]);
    n.push([a + adim, h - a]);
  });
  return n;
}

function cozumSarmal(w: number, h: number, t: number) {
  const ofsetGidis: number[] = [];
  const ofsetDonus: number[] = [];
  for (let a = KENAR; w - 2 * a >= 2 * t + 1e-9 && h - 2 * a >= 2 * t + 1e-9; a += 2 * t) ofsetGidis.push(a);
  for (let b = KENAR + t; w - 2 * b >= 2 * t + 1e-9 && h - 2 * b >= 2 * t + 1e-9; b += 2 * t) ofsetDonus.push(b);
  // halka sayıları eşitlenir (dönüş en fazla gidiş kadar)
  while (ofsetDonus.length > ofsetGidis.length) ofsetDonus.pop();
  const gidis = sarmal(w, h, ofsetGidis, 2 * t);
  const donus = sarmal(w, h, ofsetDonus, 2 * t);
  return { gidis, donus };
}

function cozumSerpantin(w: number, h: number, t: number) {
  // Tek serpantin: besleme sol kenardan uzak duvara çıkar, satırlar T aralıkla
  // kıvrılarak kollektör tarafına döner. İlk yarı gidiş (sıcak), ikinci yarı dönüş rengindedir.
  const xSol = KENAR + t;
  const xSag = w - KENAR;
  const satirlar: number[] = [];
  for (let y = KENAR; y <= h - KENAR - t + 1e-9; y += t) satirlar.push(y);
  if (satirlar.length % 2 === 1) satirlar.pop(); // son satır sol tarafta bitsin
  const yol: [number, number][] = [
    [KENAR, h],
    [KENAR, KENAR],
    [xSol, KENAR],
  ];
  satirlar.forEach((y, i) => {
    const soldan = i % 2 === 0;
    if (i > 0) yol.push([soldan ? xSol : xSag, y]);
    yol.push([soldan ? xSag : xSol, y]);
  });
  yol.push([xSol, h]);
  const yari = Math.max(2, Math.floor(yol.length / 2));
  return { gidis: yol.slice(0, yari + 1), donus: yol.slice(yari).reverse() };
}

export function serimKrokisi(o: OdaSonucu, en: number, boy: number, haricAlan: number, kollektorMesafe: number): Cizim | null {
  const y: YerdenSonucu | null = o.yerden;
  if (!y) return null;
  const W = 200;
  const H = 158;
  const k = new Kalem();
  // Uzun kenar yatay
  const genis = Math.max(en, boy);
  const dar = Math.min(en, boy);
  const olcek = Math.min(150 / genis, 92 / dar);
  const X0 = 25;
  const Y0 = 36;
  const rw = genis * olcek;
  const rh = dar * olcek;

  k.yazi(8, 9, `${o.ad} — yerden ısıtma serim krokisi`, 4, { kalin: true });
  k.yazi(
    8,
    15,
    `${sy(en, 2)} × ${sy(boy, 2)} m · boru aralığı ${Math.round(y.aralik * 100)} cm · ${y.devreSayisi} devre × ${sy(y.devreBoyu, 0)} m · ${y.desen === "SALYANGOZ" ? "salyangoz (spiral)" : "serpantin"} serim`,
    2.7,
    { renk: RENK.soluk }
  );
  k.yazi(
    8,
    20,
    `İstenen ${sy(y.gerekenAkis, 0)} W/m² · sağlanan ${sy(y.akis, 0)} W/m² · yüzey ort. ${sy(y.yuzey)} °C · ${sy(y.donus + y.sigma)}/${sy(y.donus)} °C · kaplama: ${y.kaplamaAdi}`,
    2.7,
    { renk: RENK.soluk }
  );

  // Oda duvarları ve kenar yalıtım bandı
  k.dortgen(X0 - 1.5, Y0 - 1.5, rw + 3, rh + 3, RENK.cizgi, 1.6);
  k.dortgen(X0, Y0, rw, rh, RENK.soluk, 0.25, { dolgu: "#fbfbfb" });

  // Hariç alan (sabit mobilya / küvet) sağ şerit olarak taranır
  const toplamAlan = genis * dar;
  const haricOran = toplamAlan > 0 ? Math.min(0.6, Math.max(0, haricAlan) / toplamAlan) : 0;
  const boruGenis = genis * (1 - haricOran);
  if (haricOran > 0.001) {
    const hx = X0 + boruGenis * olcek;
    const hw = rw - boruGenis * olcek;
    k.dortgen(hx, Y0, hw, rh, RENK.soluk, 0.3, { dolgu: "#f1f3f5" });
    for (let d = -rh; d < hw; d += 4) {
      const xa = Math.max(0, d);
      const ya = Math.max(0, -d);
      const uz = Math.min(hw - xa, rh - ya);
      if (uz > 0) k.cizgi(hx + xa, Y0 + ya, hx + xa + uz, Y0 + ya + uz, "#ced4da", 0.25);
    }
    k.yazi(hx + hw / 2, Y0 + rh / 2, "boru yok", 2.4, { hiza: "orta", renk: RENK.soluk });
    k.yazi(hx + hw / 2, Y0 + rh / 2 + 3.5, `${sy(haricAlan)} m²`, 2.2, { hiza: "orta", renk: RENK.soluk });
  }

  // Devreler: boru döşenen alan uzun kenar boyunca eşit şeritlere bölünür
  const n = Math.max(1, y.devreSayisi);
  const seritW = boruGenis / n;
  for (let d = 0; d < n; d++) {
    const ox = X0 + d * seritW * olcek;
    const { gidis, donus } = y.desen === "SERPANTIN" ? cozumSerpantin(seritW, dar, y.aralik) : cozumSarmal(seritW, dar, y.aralik);
    const donustur = (p: [number, number]): [number, number] => [ox + p[0] * olcek, Y0 + p[1] * olcek];
    const g = gidis.map(donustur);
    const r = donus.map(donustur);
    if (g.length > 1) k.yol(g, RENK.gidis, 0.5);
    if (r.length > 1) k.yol(r, RENK.donus, 0.5);
    // merkez / uç bağlantısı (salyangozda gidiş ile dönüş ortada birleşir)
    if (y.desen !== "SERPANTIN" && g.length && r.length) {
      const gs = g[g.length - 1];
      const rs = r[r.length - 1];
      k.yol([gs, [rs[0], gs[1]], rs], RENK.soluk, 0.5);
    }
    // kollektöre giden besleme
    if (g.length && r.length) {
      const g0 = g[0];
      const r0 = r[0];
      k.cizgi(g0[0], g0[1], g0[0], Y0 + rh + 10, RENK.gidis, 0.6);
      k.cizgi(r0[0], r0[1], r0[0], Y0 + rh + 10, RENK.donus, 0.6);
      k.yazi((g0[0] + r0[0]) / 2, Y0 + rh + 14, `D${d + 1}`, 2.4, { hiza: "orta", kalin: true });
    }
    if (n > 1 && d > 0) k.cizgi(ox, Y0, ox, Y0 + rh, RENK.soluk, 0.25, true);
  }
  k.yazi(X0, Y0 + rh + 19, `Kollektör ${y.kollektor} yönüne (yaklaşık ${sy(kollektorMesafe)} m)`, 2.6, { kalin: true });

  // Ölçü çizgileri
  k.cizgi(X0, Y0 - 6, X0 + rw, Y0 - 6, RENK.soluk, 0.25);
  k.cizgi(X0, Y0 - 8, X0, Y0 - 4, RENK.soluk, 0.25);
  k.cizgi(X0 + rw, Y0 - 8, X0 + rw, Y0 - 4, RENK.soluk, 0.25);
  k.yazi(X0 + rw / 2, Y0 - 7.5, `${sy(genis, 2)} m`, 2.6, { hiza: "orta" });
  k.cizgi(X0 - 6, Y0, X0 - 6, Y0 + rh, RENK.soluk, 0.25);
  k.cizgi(X0 - 8, Y0, X0 - 4, Y0, RENK.soluk, 0.25);
  k.cizgi(X0 - 8, Y0 + rh, X0 - 4, Y0 + rh, RENK.soluk, 0.25);
  k.yazi(X0 - 8, Y0 + rh / 2, `${sy(dar, 2)} m`, 2.6, { hiza: "sag" });

  // Açıklama kutusu
  const AX = X0 + rw + 8;
  if (AX < W - 30) {
    const satirlar = [
      `Net alan: ${sy(y.alan)} m²`,
      `Toplam boru: ${sy(y.toplamBoru, 0)} m`,
      `Devre debisi: ${sy(y.devreDebisi / 0.994, 0)} L/h`,
      `Basınç kaybı: ${sy(y.basincKaybi, 0)} mbar`,
      `Gidiş/dönüş: ${sy(y.donus + y.sigma)}/${sy(y.donus)} °C`,
      `Alt kat: ${altKatAdi(y.altKat)}`,
    ];
    satirlar.forEach((s, i) => k.yazi(AX, Y0 + 4 + i * 4.5, s, 2.5));
  }
  // Lejant
  k.cizgi(8, H - 6, 18, H - 6, RENK.gidis, 0.9);
  k.yazi(20, H - 5, "Gidiş", 2.4);
  k.cizgi(36, H - 6, 46, H - 6, RENK.donus, 0.9);
  k.yazi(48, H - 5, "Dönüş", 2.4);
  k.yazi(W - 8, H - 5, `Kenar mesafesi ${KENAR * 100} cm · ölçekli şematik serim`, 2.2, { hiza: "sag", renk: RENK.soluk });
  return { w: W, h: H, ogeler: k.ogeler };
}

function altKatAdi(a: YerdenSonucu["altKat"]) {
  return a === "TOPRAK" ? "toprak" : a === "DIS" ? "dış hava" : a === "ISITILMAYAN" ? "ısıtılmayan" : "ısıtılan";
}

function kisalt(m: string, n: number) {
  return m.length > n ? m.slice(0, n - 1) + "…" : m;
}

function satirBol(m: string, n: number): string[] {
  const kelimeler = m.split(" ");
  const satirlar: string[] = [];
  let s = "";
  for (const k of kelimeler) {
    if ((s + " " + k).trim().length > n) {
      if (s) satirlar.push(s);
      s = k;
    } else s = (s + " " + k).trim();
  }
  if (s) satirlar.push(s);
  return satirlar;
}
