// -----------------------------------------------------------------------------
// ISI POMPASI HESABI — MALZEME İÇİN ÜRÜN ÖNERİSİ (marka + ürün kodu + fiyat)
// Hesabın çıkardığı her malzeme satırı (ör. "Tampon tank 150 L") için Ürün
// Kataloğu'ndaki ürünler ve fiyat listelerindeki satırlar taranır; ad / kod /
// marka yazısında aranan sözcükler ve ölçü (litre, kW, ağız, boru çapı,
// radyatör boyu…) okunur, ihtiyacı karşılayanlar uygunluk sırasıyla önerilir.
// Yalnızca sizin kayıtlı ürünleriniz önerilir; uygun ürün yoksa öneri çıkmaz.
// Saf fonksiyon: sunucuda (öneri ve teklife aktarma) aynı sonucu verir.
// -----------------------------------------------------------------------------
import type { MalzemeKalemi } from "@/lib/isi-hesap/hesap";

export type OneriAdayi = {
  kaynak: "URUN" | "LISTE";
  id: string; // Urun.id ya da FiyatListesiKalem.id
  ad: string;
  kod: string | null;
  marka: string | null;
  fiyat: number; // 0 = fiyat yok
  paraBirimi: string;
  kdvDahil: boolean;
  listeAdi: string | null; // fiyat listesinden geldiyse listenin adı
  urunId: string | null; // katalog ürünü (LISTE satırı katalogdan eklendiyse onun ürünü)
};

export type Oneri = OneriAdayi & {
  anahtar: string; // "URUN:id" | "LISTE:id" (seçim değeri)
  puan: number;
  olcu: number | null; // adayın yazısından okunan ölçü
  not: string; // ör. "150 L", "ölçü okunamadı — kontrol edin"
};

export type Ihtiyac = { tur: string; ad: string; olcu: number | null; birim: string };

// Türkçe harfleri sadeleştirir: "Kollektör Dolabı" → "kollektor dolabi"
export const sade = (m: string) =>
  m
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[âà]/g, "a")
    .replace(/[î]/g, "i")
    .replace(/[û]/g, "u")
    .replace(/×/g, "x")
    .replace(/\s+/g, " ")
    .trim();

const sayi = (s: string) => Number(s.replace(",", "."));

// --- Adayın yazısından ölçü okuma -----------------------------------------
const litreOku = (t: string): number | null => {
  const m = t.match(/(?<![\d.,/])(\d{1,4})\s*(?:lt|litre|litrelik|l)(?![a-z])/);
  return m ? Number(m[1]) : null;
};
const kwOku = (t: string): number | null => {
  const m = t.match(/(\d{1,3}(?:[.,]\d{1,2})?)\s*kw(?![a-z])/);
  return m ? sayi(m[1]) : null;
};
// Boru dış çapı: "32x3", "16 x 2", "20*2,0"
const capOku = (t: string): number | null => {
  const m = t.match(/(?<![\d.,])(\d{2,3})\s*[x*]\s*\d(?:[.,]\d{1,2})?(?![\d])/);
  return m ? Number(m[1]) : null;
};
// Kollektör ağız sayısı: "8 ağızlı", "8'li", "8 çıkışlı", "8 yollu"
const agizOku = (t: string): number | null => {
  const m = t.match(/(?<![\d.,])(\d{1,2})\s*(?:'|’)?\s*(?:agizli|agiz|cikisli|cikis|yollu|devreli|devre|li|lu)(?![a-z])/);
  return m ? Number(m[1]) : null;
};
// Sirkülasyon pompası en büyük basma yüksekliği (m): "25-60" → 6, "25/1-8" → 8, "basma 6 m"
const basmaOku = (t: string): number | null => {
  const a = t.match(/(?<![\d.,])\d{2}\s*\/\s*(?:0[.,]5|1)\s*-\s*(\d{1,2})(?![\d])/);
  if (a) return Number(a[1]);
  const b = t.match(/(?<![\d.,/])(?:15|20|25|30|32|40)\s*[-/]\s*(\d{2,3})(?![\d])/);
  if (b) return Number(b[1]) / 10;
  const c = t.match(/(\d{1,2}(?:[.,]\d)?)\s*(?:mss|mwc|m)\b/);
  return c ? sayi(c[1]) : null;
};
const kvsOku = (t: string): number | null => {
  const m = t.match(/kvs\s*:?\s*(\d{1,2}(?:[.,]\d{1,2})?)/);
  return m ? sayi(m[1]) : null;
};
const debiOku = (t: string): number | null => {
  const m = t.match(/(\d{2,5})\s*m(?:3|³)\s*\/?\s*(?:h|saat|sa)\b/);
  return m ? Number(m[1]) : null;
};
// Panel radyatör: yükseklik × boy ve tip (22 / PKKP …) → "22|600|1000"
const RAD_TIPI: Record<string, string> = { pkkpkp: "33", pkkp: "22", pkp: "21", pk: "11", p: "10" };
const radyatorOku = (t: string): { tip: string | null; h: number; l: number } | null => {
  const m = t.match(/(?<![\d])(300|400|500|600|900)\s*[x*/ -]\s*(\d{3,4})(?![\d])/);
  if (!m) return null;
  const k = t.match(/\b(pkkpkp|pkkp|pkp|pk|p)\b/);
  const s = t.match(/(?:\btip\s*|\bt)(10|11|21|22|33)\b|(?<![\d.,x*/-])(10|11|21|22|33)(?![\d.,x*/-])/);
  const tip = k ? RAD_TIPI[k[1]] : s ? (s[1] ?? s[2]) : null;
  return { tip, h: Number(m[1]), l: Number(m[2]) };
};

// --- Kurallar ---------------------------------------------------------------
type Kip = "ENAZ" | "ESIT" | "YOK";
type Kural = {
  tur: string;
  re: RegExp; // malzeme açıklaması (sadeleştirilmiş) ile eşleşir
  ad: string; // ekranda "aranan"
  olcu?: (m: RegExpMatchArray) => number | null;
  birim?: string;
  oku?: (t: string) => number | null; // adayın ölçüsü
  kip?: Kip;
  hepsi: string[][]; // her gruptan en az bir sözcük geçmeli
  haric?: string[]; // bunlardan biri geçerse aday değil
  arti?: string[]; // geçerse öne çıkar
  eksi?: string[]; // geçerse geriye düşer
  adGrubu?: number; // eşleşmenin bu grubu (ör. model adı) adayda geçerse çok öne çıkar
};

const POMPA_HARIC = ["isi pompasi", "dalgic", "hidrofor", "drenaj", "kondens", "foseptik", "pis su", "atik su", "yangin", "dozaj", "pompa grubu", "basinclandirma"];
const BORU = ["boru", "pe-rt", "pert", "pex", "alpex", "cok katmanli", "multilayer"];
const BORU_HARIC = ["klips", "kelepce", "izolasyon bandi", "makas", "kesici", "dirsek", "manson", "nipel", "rakor", " te ", "reduksiyon", "kollektor", "kolektor"];

const KURALLAR: Kural[] = [
  {
    tur: "ISI_POMPASI",
    re: /^hava kaynakli isi pompasi — en az ([\d,]+) kw/,
    ad: "Hava kaynaklı ısı pompası",
    olcu: (m) => sayi(m[1]),
    birim: "kW",
    oku: kwOku,
    kip: "ENAZ",
    hepsi: [["isi pompasi", "heat pump", "monoblok", "monoblock", "split isi pompasi"]],
    haric: ["boyler", "tank", "tampon", "genlesme", "vana", "sensor", "kumanda", "termostat", "filtre", "kit", "aksesuar", "boru", "ayak", "konsol", "kablo", "modul", "sirkulasyon", "kalorifer pompasi", "havuz"],
    arti: ["hava kaynakli", "monoblok", "r32", "r290"],
  },
  {
    // Hesapta seçilen model kataloğa bağlı değilse: model adıyla aranır
    tur: "ISI_POMPASI",
    re: /^(.+) hava kaynakli isi pompasi$/,
    ad: "Hava kaynaklı ısı pompası (seçilen model)",
    hepsi: [["isi pompasi", "heat pump", "monoblok", "monoblock"]],
    haric: ["boyler", "tank", "tampon", "genlesme", "vana", "sensor", "kumanda", "termostat", "filtre", "kit", "aksesuar", "boru", "ayak", "konsol", "kablo", "modul", "sirkulasyon", "havuz"],
    adGrubu: 1,
  },
  {
    tur: "YEDEK_ISITICI",
    re: /^elektrikli yedek isitici \(en az ([\d,]+) kw\)/,
    ad: "Elektrikli yedek ısıtıcı",
    olcu: (m) => sayi(m[1]),
    birim: "kW",
    oku: kwOku,
    kip: "ENAZ",
    hepsi: [["yedek isitici", "elektrikli isitici", "rezistans", "backup heater", "ek isitici", "elektrikli ek"]],
    haric: ["havlupan", "boyler", "su isiticisi", "anot"],
  },
  {
    tur: "BOYLER",
    re: /^isi pompasi uyumlu boyler (\d+) l/,
    ad: "Isı pompası boyleri",
    olcu: (m) => Number(m[1]),
    birim: "L",
    oku: litreOku,
    kip: "ENAZ",
    hepsi: [["boyler", "dhw tank", "sicak su deposu", "kullanim suyu tanki"]],
    haric: ["genlesme", "emniyet", "anot", "termometre", "rezistans", "flans", "elektrikli boyler", "termosifon"],
    arti: ["isi pompasi", "heat pump", "genis yuzey", "genis serpantin", "hp", "wp"],
    eksi: ["cift serpantin", "kombi", "gunes"],
  },
  {
    tur: "SIHHI_GENLESME",
    re: /^sihhi su genlesme tanki (\d+) l/,
    ad: "Sıhhi su genleşme tankı",
    olcu: (m) => Number(m[1]),
    birim: "L",
    oku: litreOku,
    kip: "ENAZ",
    hepsi: [["genlesme", "expansion", "membranli tank", "hidrofor tanki"]],
    arti: ["sihhi", "boyler", "icme", "kullanim", "hidrofor", "beyaz"],
    eksi: ["kalorifer", "isitma", "kapali genlesme", "kirmizi", "solar"],
  },
  {
    tur: "YON_VANASI",
    re: /^3 yollu yon degistirme vanasi/,
    ad: "3 yollu yön değiştirme vanası",
    hepsi: [["3 yollu", "uc yollu", "3-yollu", "3 yol", "3yollu", "diverting"], ["vana", "valf", "valve"]],
    haric: ["karisim", "karistirici", "termostatik radyator", "kuresel"],
    arti: ["yon", "motorlu", "motor", "diverting", "isi pompasi", "zone"],
  },
  {
    tur: "TAMPON",
    re: /^tampon tank (\d+) l/,
    ad: "Tampon (buffer) tank",
    olcu: (m) => Number(m[1]),
    birim: "L",
    oku: litreOku,
    kip: "ENAZ",
    hepsi: [["tampon", "buffer", "denge tanki", "akumulasyon", "akumulator tanki"]],
    haric: ["genlesme", "boyler"],
    arti: ["isi pompasi", "yalitimli", "4 baglanti"],
  },
  {
    tur: "KAPALI_GENLESME",
    re: /^kapali genlesme tanki (\d+) l/,
    ad: "Kapalı genleşme tankı",
    olcu: (m) => Number(m[1]),
    birim: "L",
    oku: litreOku,
    kip: "ENAZ",
    hepsi: [["genlesme", "expansion"]],
    arti: ["kalorifer", "isitma", "kapali", "kirmizi"],
    eksi: ["sihhi", "hidrofor", "icme", "beyaz", "solar", "kullanim suyu"],
  },
  {
    tur: "FILTRE",
    re: /^manyetik filtre/,
    ad: "Manyetik filtre",
    hepsi: [["manyetik filtre", "magnetik filtre", "manyetik tortu", "magnetic filter", "tortu ayirici", "pislik tutucu", "filtre"]],
    haric: ["hava filtresi", "havalandirma", "kartus", "aritma", "su aritma", "y filtre ic"],
    arti: ["manyetik", "magnet", "kalorifer", "isitma"],
  },
  {
    tur: "EMNIYET_GRUBU",
    re: /^emniyet ventili 3 bar/,
    ad: "Kazan emniyet grubu (3 bar)",
    hepsi: [["emniyet grubu", "emniyet ventili", "emniyet valfi", "kazan emniyet", "guvenlik grubu"]],
    haric: ["boyler emniyet", "6 bar", "8 bar", "10 bar"],
    arti: ["3 bar", "manometre", "purjor"],
  },
  {
    tur: "DOLUM",
    re: /^otomatik dolum grubu/,
    ad: "Otomatik dolum grubu",
    hepsi: [["dolum grubu", "dolum vanasi", "doldurma", "otomatik dolum", "basinc dusurucu"]],
    arti: ["otomatik", "dolum grubu", "geri akis"],
  },
  {
    tur: "ESNEK",
    re: /^esnek titresim baglanti hortumu/,
    ad: "Esnek bağlantı hortumu",
    hepsi: [["esnek", "titresim", "flex", "fleks", "kompansator"]],
    haric: ["gaz", "dus", "batarya", "kombi baglanti"],
    arti: ["hortum", "isi pompasi", "paslanmaz"],
  },
  {
    tur: "KURESEL_VANA",
    re: /^kuresel vana seti/,
    ad: "Küresel vana",
    hepsi: [["kuresel"]],
    haric: ["gaz"],
    arti: ["vana", "kelebek kollu", "set"],
  },
  {
    tur: "SIRKULASYON",
    re: /^frekans kontrollu sirkulasyon pompasi — (?:radyator|yerden)[^(]*\(\d+ l\/h, ([\d,]+) mss\)/,
    ad: "Frekans kontrollü sirkülasyon pompası",
    olcu: (m) => sayi(m[1]),
    birim: "mSS basma",
    oku: basmaOku,
    kip: "ENAZ",
    hepsi: [["sirkulasyon", "frekans kontrollu", "yonos", "alpha", "stratos", "circulator", "kalorifer pompasi", "upm", "para "]],
    haric: POMPA_HARIC,
    arti: ["frekans", "elektronik", "yuksek verim", "a sinifi"],
  },
  {
    tur: "KARISIM_VANASI",
    re: /^3 yollu karisim vanasi \+ motor \(kvs ([\d,]+)\)/,
    ad: "3 yollu karışım vanası + motor",
    olcu: (m) => sayi(m[1]),
    birim: "Kvs",
    oku: kvsOku,
    kip: "ENAZ",
    hepsi: [["karisim", "karistirici", "mixing", "3 yollu", "uc yollu", "3-yollu"], ["vana", "valf", "valve", "motor", "pompa grubu"]],
    haric: ["yon degistirme", "termostatik radyator", "diverting"],
    arti: ["karisim", "motor", "kvs", "pompa grubu"],
  },
  {
    tur: "EMNIYET_TERMOSTATI",
    re: /^yerden isitma emniyet termostati/,
    ad: "Emniyet (limit) termostatı",
    hepsi: [["emniyet termostati", "limit termostat", "dalis termostati", "kontakt termostat", "temas termostati", "yuzey termostati"]],
  },
  {
    tur: "DIS_SENSOR",
    re: /^dis hava sicaklik sensoru/,
    ad: "Dış hava sensörü + oda kumandası",
    hepsi: [["dis hava sensor", "dis sensor", "dis hava sicaklik", "dis ortam sensor", "oda kumandasi", "oda unitesi", "kablolu kumanda"]],
    arti: ["dis hava", "isi pompasi"],
  },
  {
    tur: "BORU",
    re: /^(?:isi pompasi baglanti borusu|radyator ana hat borusu|kollektor besleme borusu) (\d+)x/,
    ad: "Boru",
    olcu: (m) => Number(m[1]),
    birim: "mm dış çap",
    oku: capOku,
    kip: "ESIT",
    hepsi: [BORU],
    haric: BORU_HARIC,
    arti: ["yalitimli", "cok katmanli", "pe-rt", "pex"],
    eksi: ["yerden"],
  },
  {
    tur: "BRANSMAN",
    re: /^radyator bransman borusu (\d+)x/,
    ad: "Radyatör branşman borusu",
    olcu: (m) => Number(m[1]),
    birim: "mm dış çap",
    oku: capOku,
    kip: "ESIT",
    hepsi: [BORU],
    haric: BORU_HARIC,
    arti: ["cok katmanli", "pe-rt", "pex"],
    eksi: ["yerden"],
  },
  {
    tur: "RADYATOR",
    re: /^panel radyator tip (10|11|21|22|33) \([a-z]+\) (300|400|500|600|900)x(\d{3,4}) mm/,
    ad: "Panel radyatör",
    hepsi: [["radyator"]],
    haric: ["vana", "konsol", "tapa", "purjor", "boya", "kapak", "anahtar", "baglanti", "aski", "havlupan", "dekoratif", "elektrikli"],
    arti: ["panel"],
  },
  {
    tur: "RADYATOR_VANASI",
    re: /^termostatik radyator vanasi/,
    ad: "Termostatik radyatör vanası seti",
    hepsi: [["termostatik", "trv", "radyator vanasi"]],
    haric: ["kafa yedek", "emniyet"],
    arti: ["set", "donus", "termostatik"],
  },
  {
    tur: "RADYATOR_KONSOL",
    re: /^radyator konsol/,
    ad: "Radyatör konsol / montaj seti",
    hepsi: [["konsol", "montaj seti", "aski"]],
    arti: ["radyator"],
  },
  {
    tur: "YERDEN_BORU",
    re: /^fraenkische yerden isitma borusu (\d+)x/,
    ad: "Yerden ısıtma borusu",
    olcu: (m) => Number(m[1]),
    birim: "mm dış çap",
    oku: capOku,
    kip: "ESIT",
    hepsi: [BORU],
    haric: BORU_HARIC,
    arti: ["yerden", "fraenkische", "oksijen", "pe-rt", "evalpex"],
  },
  {
    tur: "KOLLEKTOR",
    re: /^fraenkische yerden isitma kollektoru (\d+) agizli/,
    ad: "Yerden ısıtma kollektörü",
    olcu: (m) => Number(m[1]),
    birim: "ağız",
    oku: agizOku,
    kip: "ESIT",
    hepsi: [["kollektor", "kolektor", "manifold"]],
    haric: ["dolap", "dolabi", "kutu", "konsol", "aktuator", "rakor", "adaptor", "tapa", "kombi", "radyator"],
    arti: ["yerden", "debimetre", "fraenkische"],
  },
  {
    tur: "KOLLEKTOR_DOLABI",
    re: /^kollektor dolabi \((\d+) agiz/,
    ad: "Kollektör dolabı",
    hepsi: [["kollektor dolab", "kolektor dolab", "kollektor kutusu", "kolektor kutusu", "dolap"]],
    arti: ["kollektor", "kolektor", "sivaalti", "sivaustu"],
  },
  {
    tur: "LEVHA",
    re: /^yerden isitma sistem levhasi/,
    ad: "Yerden ısıtma sistem / yalıtım levhası",
    hepsi: [["levha", "plaka", "tacker", "sistem plakasi"]],
    arti: ["yerden", "yalitim", "sistem"],
  },
  { tur: "KENAR_BANDI", re: /^kenar yalitim bandi/, ad: "Kenar yalıtım bandı", hepsi: [["kenar bandi", "kenar yalitim", "kenar bant", "kenar seridi"]] },
  { tur: "KLIPS", re: /^boru sabitleme klipsi/, ad: "Boru sabitleme klipsi", hepsi: [["klips", "tacker zimba", "sabitleme"]], arti: ["boru", "yerden"] },
  { tur: "SAP_KATKI", re: /^sap katki maddesi/, ad: "Şap katkı maddesi", hepsi: [["sap katki", "sap katkisi", "sap ilavesi"]] },
  {
    tur: "ODA_TERMOSTATI",
    re: /^oda termostati/,
    ad: "Oda termostatı",
    hepsi: [["oda termostat", "termostat"]],
    haric: ["emniyet", "radyator", "vana", "dalis", "kazan", "kafa", "limit"],
    arti: ["oda", "kablolu", "kablosuz", "yerden"],
  },
  { tur: "AKTUATOR", re: /^kollektor elektrotermik aktuator/, ad: "Elektrotermik aktüatör", hepsi: [["aktuator", "elektrotermik", "termoelektrik", "motor kafa", "termomotor"]] },
  {
    tur: "KABLOLAMA",
    re: /^kablolama merkezi/,
    ad: "Kablolama merkezi",
    hepsi: [["kablolama", "baglanti modulu", "kontrol modulu", "baglanti kutusu", "kontrol unitesi"]],
    arti: ["termostat", "aktuator", "yerden"],
  },
  {
    tur: "HRV",
    re: /^isi geri kazanimli havalandirma cihazi \(hrv\) (\d+) m/,
    ad: "Isı geri kazanımlı havalandırma cihazı",
    olcu: (m) => Number(m[1]),
    birim: "m³/h",
    oku: debiOku,
    kip: "ENAZ",
    hepsi: [["isi geri kazanim", "hrv", "erv", "havalandirma cihazi", "recuperator", "rekuperator"]],
  },
];

// Malzeme satırından ne arandığını çıkarır (öneri yapılmayan satırlarda null)
export function ihtiyacBul(m: Pick<MalzemeKalemi, "aciklama">): (Ihtiyac & { kural: Kural; esles: RegExpMatchArray }) | null {
  const t = sade(m.aciklama);
  for (const k of KURALLAR) {
    const esles = t.match(k.re);
    if (esles) return { tur: k.tur, ad: k.ad, olcu: k.olcu ? k.olcu(esles) : null, birim: k.birim ?? "", kural: k, esles };
  }
  return null;
}

type HazirAday = OneriAdayi & { metin: string };
export function adaylariHazirla(adaylar: OneriAdayi[]): HazirAday[] {
  return adaylar.map((a) => ({ ...a, metin: ` ${sade(`${a.marka ?? ""} ${a.ad} ${a.kod ?? ""}`)} ` }));
}

const gecer = (metin: string, s: string) => metin.includes(s);
const yaz = (n: number) => String(Math.round(n * 100) / 100).replace(".", ",");

function puanla(ih: Ihtiyac & { kural: Kural; esles: RegExpMatchArray }, a: HazirAday): { puan: number; olcu: number | null; not: string } | null {
  const k = ih.kural;
  const t = a.metin;
  if (!k.hepsi.every((g) => g.some((s) => gecer(t, s)))) return null;
  if (k.haric?.some((s) => gecer(t, s))) return null;
  let puan = 100;
  for (const s of k.arti ?? []) if (gecer(t, ` ${s}`) || gecer(t, s)) puan += 8;
  for (const s of k.eksi ?? []) if (gecer(t, s)) puan -= 25;
  let olcu: number | null = null;
  let not = "";
  if (k.adGrubu) {
    const ad = (ih.esles[k.adGrubu] ?? "").trim();
    if (ad.length >= 3 && gecer(t, ad)) {
      puan += 100;
      not = "seçilen model";
    }
  }

  if (k.tur === "RADYATOR") {
    const r = radyatorOku(t);
    const tip = ih.esles[1];
    const h = Number(ih.esles[2]);
    const l = Number(ih.esles[3]);
    if (!r) return null;
    if (r.h !== h || r.l !== l) return null;
    if (r.tip && r.tip !== tip) return null;
    if (!r.tip) {
      puan -= 40;
      not = `${h}×${l} mm · tip okunamadı — kontrol edin`;
    } else not = `Tip ${r.tip} · ${h}×${l} mm`;
  } else if (k.kip && k.kip !== "YOK" && k.oku && ih.olcu !== null) {
    olcu = k.oku(t);
    if (k.tur === "BRANSMAN" && olcu !== null && olcu !== 16 && olcu !== 20) return null;
    if (olcu === null) {
      puan -= 45;
      not = `${ih.birim} okunamadı — kontrol edin`;
    } else if (k.kip === "ESIT" && k.tur !== "BRANSMAN") {
      if (olcu !== ih.olcu) return null;
      not = `${yaz(olcu)} ${ih.birim}`;
    } else if (k.kip === "ENAZ") {
      // Küçük olan önerilmez (ör. 150 L tampon gereken yere 100 L); bir üst boy öne çıkar
      if (olcu < ih.olcu * 0.98) return null;
      const fazla = ih.olcu > 0 ? olcu / ih.olcu - 1 : 0;
      puan += 40 - Math.min(40, fazla * 60);
      not = `${yaz(olcu)} ${ih.birim}`;
    } else not = `${yaz(olcu)} ${ih.birim}`;
  }
  if (a.fiyat > 0) puan += 15;
  else not = not ? `${not} · fiyat yok` : "fiyat yok";
  if (a.kaynak === "URUN") puan += 3;
  if (a.kod) puan += 2;
  return { puan, olcu, not };
}

// Her malzeme satırı için en uygun (en fazla `enFazla`) öneri; sıra malzemelerle aynı
export function onerileriBul(
  malzemeler: Pick<MalzemeKalemi, "aciklama" | "urunId">[],
  adaylar: OneriAdayi[],
  enFazla = 5
): { ihtiyac: Ihtiyac | null; oneriler: Oneri[] }[] {
  const hazir = adaylariHazirla(adaylar);
  return malzemeler.map((m) => {
    // Hesapta seçili ve kataloğa bağlı ısı pompası modeli: tek öneri o ürün
    if (m.urunId) {
      const a = hazir.find((x) => x.kaynak === "URUN" && x.id === m.urunId);
      return {
        ihtiyac: { tur: "ISI_POMPASI", ad: "Seçilen ısı pompası modeli", olcu: null, birim: "" },
        oneriler: a ? [{ ...a, anahtar: `URUN:${a.id}`, puan: 999, olcu: null, not: "hesapta seçilen model" }] : [],
      };
    }
    const ih = ihtiyacBul(m);
    if (!ih) return { ihtiyac: null, oneriler: [] };
    const bulunan: Oneri[] = [];
    for (const a of hazir) {
      const p = puanla(ih, a);
      if (p) bulunan.push({ kaynak: a.kaynak, id: a.id, ad: a.ad, kod: a.kod, marka: a.marka, fiyat: a.fiyat, paraBirimi: a.paraBirimi, kdvDahil: a.kdvDahil, listeAdi: a.listeAdi, urunId: a.urunId, anahtar: `${a.kaynak}:${a.id}`, ...p });
    }
    bulunan.sort((x, y) => y.puan - x.puan || (x.olcu ?? 0) - (y.olcu ?? 0) || (x.fiyat || Infinity) - (y.fiyat || Infinity) || x.ad.localeCompare(y.ad, "tr"));
    // Aynı ürün birden çok listede aynı fiyatla varsa bir kez gösterilir
    const goruldu = new Set<string>();
    const oneriler: Oneri[] = [];
    for (const o of bulunan) {
      const anahtar = `${sade(`${o.marka ?? ""}|${o.kod || o.ad}`)}|${o.fiyat}|${o.paraBirimi}`;
      if (goruldu.has(anahtar)) continue;
      goruldu.add(anahtar);
      oneriler.push(o);
      if (oneriler.length >= enFazla) break;
    }
    const { kural: _k, esles: _e, ...ihtiyac } = ih;
    return { ihtiyac, oneriler };
  });
}
