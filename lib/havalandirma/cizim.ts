// -----------------------------------------------------------------------------
// HAVALANDIRMA — TEK HAT KANAL ŞEMASI (santral başına)
// Besleme (mavi) ve egzoz (turuncu) ana kanalları, branşmanlar ve mahaller;
// her parçada kanal ölçüsü, debi, hız ve uzunluk yazılır. Kritik (en çok basınç
// kaybı olan) hat ★ ile işaretlenir. "etiket" taşıyan yazılar panelde tıklanıp
// değiştirilebilir; "git" taşıyan mahal adları mahal ekranını açar.
// Ekran (SVG) ve PDF aynı listeyi çizer.
// -----------------------------------------------------------------------------
import { Kalem, RENK, type Cizim } from "@/lib/isi-hesap/cizim";
import { sy, olcuYaz, type SantralSonucu, type KanalParcasi, type MahalSonucu } from "./hesap";

const MAVI = "#1971c2";
const TURUNCU = "#d9480f";
const DUZEN = "#1864ab";

export const SANTRAL_KISA: Record<string, string> = {
  AHU_PLAKA: "Plakalı IGK santral",
  AHU_ROTOR: "Rotorlu IGK santral",
  AHU_ARA: "Ara akışkanlı IGK santral",
  TICARI_HRV: "Kompakt IGK cihazı",
  KONUT_HRV: "Konut HRV cihazı",
  TAZE_HAVA: "Taze hava santrali",
  EGZOZ: "Egzoz fanı",
  MUTFAK: "Mutfak egzoz + telafi",
  OTOPARK: "Otopark fanları",
};

const etiketYaz = (p: KanalParcasi, uzunluk = p.uzunluk) => `${olcuYaz(p)} · ${sy(p.debi, 0)} m³/h · ${sy(p.hiz, 1)} m/s · ${sy(uzunluk)} m`;

export function kanalSemasi(s: SantralSonucu, mahaller: MahalSonucu[], baslik: string): Cizim {
  const k = new Kalem();
  const W = 210;
  const ADIM = 22;
  const Y0 = 62;
  // Satırlar: besleme ya da egzoz ağındaki mahaller (girdi sırasıyla)
  const idB = s.agB?.mahalSirasi ?? [];
  const idE = s.agE?.mahalSirasi ?? [];
  const satirlar = s.mahaller.filter((id) => idB.includes(id) || idE.includes(id));
  const n = satirlar.length;
  const H = Y0 + Math.max(0, n - 1) * ADIM + 34;
  const yS = (id: string) => Y0 + satirlar.indexOf(id) * ADIM;

  k.yazi(8, 9, `KANAL ŞEMASI — ${s.ad} (${s.tipAdi})`, 3.8, { kalin: true });
  k.yazi(8, 15, baslik, 2.6, { renk: RENK.soluk });
  k.yazi(
    8,
    20,
    `Besleme ${sy(s.besleme, 0)} m³/h · egzoz ${sy(s.egzoz, 0)} m³/h${s.yangin ? ` · duman tahliyesi ${sy(s.yangin, 0)} m³/h` : ""} · fan dış statik basıncı besleme ${s.fanB ? sy(s.fanB.dis, 0) : "—"} / egzoz ${s.fanE ? sy(s.fanE.dis, 0) : "—"} Pa`,
    2.4,
    { renk: RENK.soluk }
  );
  k.cizgi(8, 23, W - 8, 23, RENK.soluk, 0.3);

  // Santral kutusu
  const OX = 8;
  const OY = 28;
  k.dortgen(OX, OY, 46, 22, RENK.cizgi, 0.6, { dolgu: "#f8f9fa", r: 1.5 });
  k.yazi(OX + 23, OY + 5.5, SANTRAL_KISA[s.tip] ?? "Santral", 2.4, { hiza: "orta", kalin: true });
  k.yazi(OX + 23, OY + 10, `${sy(s.nominal, 0)} m³/h kademe`, 2.1, { hiza: "orta" });
  if (s.verim) k.yazi(OX + 23, OY + 14, `ısı geri kazanımı %${sy(s.verim, 0)}`, 1.9, { hiza: "orta", renk: RENK.soluk });
  k.yazi(OX + 23, OY + 18, `SFP ${sy(s.sfp, 0)} W/(m³/s)`, 1.9, { hiza: "orta", renk: RENK.soluk });

  const TB = 64; // besleme gövdesi x
  const TE = 70; // egzoz gövdesi x
  const IX = 130; // mahal kutusu x

  const ag = (tur: "B" | "E") => {
    const a = tur === "B" ? s.agB : s.agE;
    if (!a || !n) return;
    const renk = tur === "B" ? MAVI : TURUNCU;
    const X = tur === "B" ? TB : TE;
    const cikisY = OY + (tur === "B" ? 7 : 15);
    const govdeler = a.parcalar.filter((p) => p.tur !== "BRANS");
    const branslar = a.parcalar.filter((p) => p.tur === "BRANS");
    const ofs = tur === "B" ? -2 : 2;
    const ilkY = yS(a.mahalSirasi[0]) + ofs;
    const sonY = yS(a.mahalSirasi[a.mahalSirasi.length - 1]) + ofs;
    // ana kanal: santralden gövdeye ve aşağı
    k.yol([[OX + 46, cikisY], [X, cikisY], [X, ilkY]], renk, 1.1);
    if (sonY > ilkY) k.cizgi(X, ilkY, X, sonY, renk, 0.9);
    const ana = govdeler[0];
    k.yazi(TE + 3, cikisY - 0.6, `${tur === "B" ? "Besleme" : "Egzoz"} ana kanal ${etiketYaz(ana)}`, 2.1, { kalin: true, renk: DUZEN, etiket: ana.etiket });
    // gövde parçaları (iki satır arası)
    govdeler.slice(1).forEach((g, i) => {
      const y1 = yS(a.mahalSirasi[i]);
      const y2 = yS(a.mahalSirasi[i + 1]);
      const ym = (y1 + y2) / 2 + 1;
      if (tur === "B") k.yazi(TB - 2, ym + 2.2, etiketYaz(g), 1.8, { hiza: "sag", renk: DUZEN, etiket: g.etiket });
      else k.yazi(TE + 2, ym + 2.2, etiketYaz(g), 1.8, { renk: DUZEN, etiket: g.etiket });
    });
    // branşmanlar
    branslar.forEach((b) => {
      const y = yS(b.mahalId) + (tur === "B" ? -2 : 2);
      k.cizgi(X, y, IX, y, renk, 0.6);
      k.daire(X, y, 0.7, renk, 0.3, renk);
      k.yazi((TE + IX) / 2 + 4, y + (tur === "B" ? -1.2 : 3), etiketYaz(b), 1.9, { hiza: "orta", renk: DUZEN, etiket: b.etiket });
    });
  };
  ag("B");
  ag("E");

  // Mahal kutuları
  for (const id of satirlar) {
    const m = mahaller.find((x) => x.id === id);
    if (!m) continue;
    const y = yS(id);
    k.dortgen(IX, y - 6, 72, 12, RENK.cizgi, 0.5, { dolgu: "#e7f5ff", r: 1.2 });
    k.yazi(IX + 2.5, y - 1.6, kisalt(m.ad, 26), 2.5, { kalin: true, git: m.id });
    const kritik = [s.agB?.kritikMahal === id ? "B" : "", s.agE?.kritikMahal === id ? "E" : ""].filter(Boolean).join("/");
    if (kritik) k.yazi(IX + 70.5, y - 1.6, `★ kritik ${kritik}`, 1.8, { hiza: "sag", renk: TURUNCU, kalin: true });
    const parca: string[] = [];
    if (idB.includes(id)) parca.push(`B ${sy(m.besleme, 0)}`);
    if (idE.includes(id)) parca.push(`E ${sy(m.yangin && s.tip === "OTOPARK" ? Math.max(m.egzoz, m.yangin) : m.egzoz, 0)}`);
    const uc = [m.menfezB && idB.includes(id) ? `${m.menfezB} besleme ucu` : "", m.menfezE && idE.includes(id) ? `${m.menfezE} egzoz ucu` : ""].filter(Boolean).join(" · ");
    k.yazi(IX + 2.5, y + 2.6, `${parca.join(" · ")} m³/h · ${sy(m.ach, 1)} 1/h`, 1.9, { renk: RENK.soluk });
    if (uc) k.yazi(IX + 2.5, y + 5.2, uc, 1.7, { renk: RENK.soluk });
  }

  // Açıklama
  k.cizgi(8, H - 14, W - 8, H - 14, RENK.soluk, 0.3);
  k.cizgi(10, H - 9, 20, H - 9, MAVI, 0.9);
  k.yazi(22, H - 8.2, "Besleme", 2.2);
  k.cizgi(40, H - 9, 50, H - 9, TURUNCU, 0.9);
  k.yazi(52, H - 8.2, "Egzoz", 2.2);
  k.yazi(68, H - 8.2, "Etiket: kanal ölçüsü (Ø / en×yükseklik mm) · debi · hız · uzunluk   ★ en çok basınç kaybı olan (kritik) hat", 2.1);
  k.yazi(W - 8, H - 3, "Ölçekli değildir; uzunluklar ve sıralama mahal girdilerinden gelir.", 2, { hiza: "sag", renk: RENK.soluk });
  return { w: W, h: H, ogeler: k.ogeler };
}

function kisalt(m: string, n: number) {
  return m.length > n ? m.slice(0, n - 1) + "…" : m;
}
