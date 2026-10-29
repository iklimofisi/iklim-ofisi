// -----------------------------------------------------------------------------
// NETSA (NETİSA) FİYAT LİSTESİ AYIKLAMA — Sakura, Bosch, Carrier
// Netsa'nın aylık PDF listeleri (Excel'den PDF; format sabit) metin konumlarıyla
// okunur: her ürün satırı, nakit ve kredi kartı bayi alış fiyatının bulunduğu
// satırdır; model kodları, açıklama ve kapasite bu satırın çevresinden toplanır.
// Saf fonksiyon (PDF okuma ayrı): sunucuda pdf-parse ile, testte dosyadan beslenir.
// -----------------------------------------------------------------------------

export type PdfOge = { s: string; x: number; y: number; w: number }; // y: sayfanın üstünden
export type PdfSayfa = { w: number; h: number; items: PdfOge[] };

export type NetsaUrun = {
  marka: string;
  bolum: string;
  kod: string;
  ad: string;
  aciklama: string;
  alis: number; // bayi alış, nakit, KDV dahil
  alis2: number; // bayi alış, kredi kartı, KDV dahil
};
export type NetsaNot = { metin: string; etiketler: string[] }; // etiket boşsa genel not
export type NetsaSonuc = { marka: string; tarih: string; urunler: NetsaUrun[]; notlar: NetsaNot[]; uyarilar: string[] };

const MARKALAR: [RegExp, string][] = [
  [/SAKURA/, "Sakura"],
  [/BOSCH/, "Bosch"],
  [/CARR[İI]ER/, "Carrier"],
];

// Sayfa başlığından kısa ürün grubu adı (boşluklar kırık gelebildiği için bitişik metinde aranır)
const SAYFA_ADLARI: [RegExp, string][] = [
  [/MULT[İI]SPL[İI]T/, "Multi Split Klima"],
  [/DUVART[İI]P[İI]/, "Duvar Tipi Split Klima"],
  [/T[İI]CAR[İI]T[İI]P/, "Ticari Tip Split Klima"],
  [/MOB[İI]L/, "Mobil Klima ve Kule Fan"],
  [/ISIPOMPA/, "Isı Pompası"],
];

const SISTEM = /^(İç|Iç|Dış|Dis|Panel|Pnl)$/;
const GURULTU = /^(YENİ|ÜRÜN|KAPAĞA DÖN|Wİ-Fİ)$/;
const PARA = /^₺?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?)\s*(?:TL)?$/;

const bitisik = (s: string) => s.replace(/\s+/g, "").toLocaleUpperCase("tr-TR");
const sade = (s: string) => s.replace(/\s+/g, " ").trim();
const paraOku = (s: string) => {
  const m = s.replace(/\s+/g, "").match(PARA);
  if (!m) return null;
  const n = Number(m[1].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
};
const cumle = (s: string) => {
  const k = sade(s).toLocaleLowerCase("tr-TR");
  return k.charAt(0).toLocaleUpperCase("tr-TR") + k.slice(1);
};
const basHarf = (s: string) =>
  s
    .toLocaleLowerCase("tr-TR")
    .split(" ")
    .map((k) => k.charAt(0).toLocaleUpperCase("tr-TR") + k.slice(1))
    .join(" ");

type Parca = { s: string; x: number; x2: number; y: number };
type Satir = { y: number; parcalar: Parca[]; metin: string };

// Aynı yükseklikteki öğeleri satır yapar; aralarında boşluk olmayan kırık parçaları birleştirir
function satirlar(sayfa: PdfSayfa): Satir[] {
  const og = sayfa.items.filter((i) => i.s && i.s.trim()).sort((a, b) => a.y - b.y || a.x - b.x);
  const gruplar: PdfOge[][] = [];
  for (const i of og) {
    const g = gruplar[gruplar.length - 1];
    if (g && Math.abs(i.y - g[0].y) <= 2) g.push(i);
    else gruplar.push([i]);
  }
  return gruplar.map((g) => {
    g.sort((a, b) => a.x - b.x);
    const parcalar: Parca[] = [];
    for (const i of g) {
      const son = parcalar[parcalar.length - 1];
      const bosluk = son ? i.x - son.x2 : 99;
      // Sağdaki boşluklar genişliğe dahil; birleştirme metnin bittiği yere göre yapılır
      if (son && bosluk < 3) {
        son.s += (bosluk > 1.2 && !/\s$/.test(son.s) ? " " : "") + i.s;
        son.x2 = Math.max(son.x2, i.x + i.w);
      } else parcalar.push({ s: i.s, x: i.x, x2: i.x + i.w, y: i.y });
    }
    for (const p of parcalar) p.s = sade(p.s);
    return { y: Math.min(...g.map((i) => i.y)), parcalar: parcalar.filter((p) => p.s), metin: sade(parcalar.map((p) => p.s).join(" ")) };
  });
}

export function netsaAyikla(sayfalar: PdfSayfa[]): NetsaSonuc {
  const uyarilar: string[] = [];
  const tumMetin = bitisik(sayfalar.map((s) => s.items.map((i) => i.s).join(" ")).join(" "));
  const kapak = bitisik((sayfalar[0]?.items ?? []).map((i) => i.s).join(" "));
  const marka = MARKALAR.find(([r]) => r.test(kapak))?.[1] ?? MARKALAR.find(([r]) => r.test(tumMetin))?.[1] ?? "";
  if (!marka) uyarilar.push("Marka bulunamadı (Sakura, Bosch veya Carrier listesi bekleniyor).");
  const tarih = (kapak.match(/(\d{1,2})\.(\d{1,2})\.(20\d\d)/) ?? tumMetin.match(/(\d{1,2})\.(\d{1,2})\.(20\d\d)/))?.slice(1).map((p, i) => (i < 2 ? p.padStart(2, "0") : p)).join(".") ?? "";

  const urunler: NetsaUrun[] = [];
  const sayfaNotlari: { etiket: string; notlar: string[] }[] = [];

  sayfalar.forEach((sayfa, si) => {
    const S = satirlar(sayfa);
    // Fiyat sütunları: "NAKİT" ve "K.KART" başlıkları
    const tum = S.flatMap((s) => s.parcalar);
    const nakitB = tum.find((p) => /NAK[İI]T/.test(p.s));
    const kartB = tum.find((p) => /K\.\s*KART/.test(p.s));
    if (!nakitB || !kartB) return; // kapak / içindekiler sayfası
    const nakitX = (nakitB.x + nakitB.x2) / 2;
    const kartX = (kartB.x + kartB.x2) / 2;
    const fiyatSiniri = Math.min(nakitB.x, kartB.x) - 22;
    const basY = Math.max(nakitB.y, kartB.y);

    // Sayfa başlığı ve montaj bilgisi
    const baslikSatiri = S.find((s) => /F[İI]YATL[İI]STES[İI]/.test(bitisik(s.metin)));
    const baslik = baslikSatiri ? bitisik(baslikSatiri.metin) : "";
    const sayfaAdi = SAYFA_ADLARI.find(([r]) => r.test(baslik))?.[1] ?? `Sayfa ${si + 1}`;
    const etiket = `${marka} ${sayfaAdi}`;
    const montajSatiri = S.find((s) => s.y < basY && /^\(.*MONTAJ/i.test(s.metin));
    const notlar: string[] = [];
    if (montajSatiri) {
      const m = sade(montajSatiri.parcalar.filter((p) => !GURULTU.test(p.s)).map((p) => p.s).join(" "));
      notlar.push(cumle(m.replace(/^\(/, "").replace(/\)?\.?\)?$/, "")) + ".");
    }

    // Tablo sonu: notlar / dipnotlar
    const sonSatir = S.find((s) => s.y > basY && /^(NOTLAR|1\s*-|Kapasiteye|Enerji Besleme|Sipariş)/i.test(s.metin));
    const tabloSonu = sonSatir ? sonSatir.y : sayfa.h;

    // Kapasite sütun başlıkları (alt tablolar için birden çok başlık satırı olabilir)
    const nominalB = tum.filter((p) => /^(NOM[İI]NAL|GÜÇ)$/.test(p.s));
    const kapasiteSol = nominalB.length ? Math.min(...nominalB.map((p) => p.x)) - 14 : fiyatSiniri - 160;
    const etiketSatirlari = S.filter((s) => s.parcalar.some((p) => /^(NOM[İI]NAL|GÜÇ)$/.test(p.s)));
    const birimler = S.filter((s) => /KAPAS[İI]TE\s*\[/i.test(s.metin));
    const sistemB = tum.find((p) => /^S[İI]STEM$/.test(p.s));
    const kodSag = sistemB ? sistemB.x - 2 : 75;

    // Satır türleri
    type Urun = { y: number; nakit: number; kart: number; parcalar: Parca[] };
    const anlar: Urun[] = [];
    const gruplar: { y: number; ad: string }[] = [];
    const digerleri: Parca[] = [];
    for (const s of S) {
      if (s.y <= basY + 1 || s.y >= tabloSonu) continue;
      const fiyatlar = s.parcalar.filter((p) => p.x >= fiyatSiniri && paraOku(p.s) !== null);
      const n = fiyatlar.find((p) => Math.abs((p.x + p.x2) / 2 - nakitX) < Math.abs((p.x + p.x2) / 2 - kartX));
      const k = fiyatlar.find((p) => Math.abs((p.x + p.x2) / 2 - kartX) <= Math.abs((p.x + p.x2) / 2 - nakitX));
      const kalan = s.parcalar.filter((p) => !fiyatlar.includes(p) && !GURULTU.test(p.s));
      if (n && k) {
        anlar.push({ y: s.y, nakit: paraOku(n.s)!, kart: paraOku(k.s)!, parcalar: [] });
        digerleri.push(...kalan);
        continue;
      }
      if (fiyatlar.length) uyarilar.push(`${marka} s.${si + 1}: tek fiyatlı satır atlandı: ${s.metin.slice(0, 60)}`);
      // Alt tablonun sütun başlık satırı (ör. kule fan tablosu): atla
      if (/\b(MODEL|MODELLER|S[İI]STEM|AÇIKLAMA|BAY[İI] ALIŞ|KDV DAH[İI]L|TEKN[İI]K VER[İI]LER|NOM[İI]NAL)\b/.test(s.metin) && !kalan.some((p) => SISTEM.test(p.s))) continue;
      // Grup başlığı: fiyatsız, kod/sistem/kapasite yok; büyük harfli ya da "KLİMALAR / Üniteler" gibi
      const parca = kalan.reduce<Parca[][]>((acc, p) => {
        const a = acc[acc.length - 1];
        if (a && p.x - a[a.length - 1].x2 < 40) a.push(p);
        else acc.push([p]);
        return acc;
      }, []);
      const ilk = parca.length ? sade(parca[0].map((p) => p.s).join(" ")) : "";
      const harfler = ilk.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü]/g, "");
      const buyukOran = harfler ? harfler.replace(/[^A-ZÇĞİÖŞÜ]/g, "").length / harfler.length : 0;
      const sistemVar = kalan.some((p) => SISTEM.test(p.s));
      const kapasiteVar = kalan.some((p) => p.x >= kapasiteSol && p.x < fiyatSiniri);
      const anahtar = /(KL[İI]MALAR|ÜN[İI]TELER|Üniteler|POMPALARI|AKSESUAR|VANT[İI]LATÖR|KULE FAN)/.test(ilk);
      if (ilk && !sistemVar && !kapasiteVar && !/\d{6,}/.test(ilk) && (anahtar || (buyukOran > 0.8 && ilk.length >= 12))) {
        // Başlığın yanındaki açıklama ("İç ünitelerin içerisinden ... çıkmaktadır.") grup notu olur
        const ad = ilk.replace(/\s*-\s*$/, "");
        gruplar.push({ y: s.y, ad });
        for (const ek of parca.slice(1)) notlar.push(`@${ad}@` + sade(ek.map((p) => p.s).join(" ")).replace(/^\((.*)\)$/, "$1"));
        continue;
      }
      digerleri.push(...kalan);
    }
    if (!anlar.length) {
      uyarilar.push(`${marka} s.${si + 1}: fiyatlı ürün satırı bulunamadı.`);
      return;
    }
    // Diğer parçaları en yakın ürün satırına bağla (araya grup başlığı girmeden)
    for (const p of digerleri) {
      let en: Urun | null = null;
      for (const a of anlar) {
        const arada = gruplar.some((g) => (g.y - p.y) * (g.y - a.y) < 0);
        if (arada || Math.abs(a.y - p.y) > 22) continue;
        if (!en || Math.abs(a.y - p.y) < Math.abs(en.y - p.y)) en = a;
      }
      if (en) en.parcalar.push(p);
    }

    for (const a of anlar) {
      const grup = [...gruplar].reverse().find((g) => g.y < a.y)?.ad ?? "";
      const ps = a.parcalar.sort((p, q) => p.y - q.y || p.x - q.x);
      const kodlar: string[] = [];
      const aciklama: string[] = [];
      const kapasite: Parca[] = [];
      for (const p of ps) {
        if (SISTEM.test(p.s)) continue;
        if (/^\d{1,3}(\.\d{3})?\s*btu\/h$/i.test(p.s) && p.x > 200) continue; // görsel yanındaki kapasite etiketleri
        if (p.x >= kapasiteSol && p.x < fiyatSiniri) kapasite.push(p);
        else if (p.x < kodSag && !/[a-zçğıöşü]{4,}/.test(p.s)) kodlar.push(p.s);
        else aciklama.push(p.s.replace(/^\d{10,12}\s*/, "")); // Carrier SAP numarası
      }
      const kod = [...new Set(kodlar.map(sade).filter(Boolean))].join(" / ");
      let ad = sade(aciklama.filter((t) => !/^\d{6,12}$/.test(t)).join(" ")).replace(/\s*-\s*$/, "").replace(/\s+-\s+/g, " - ");
      // Kapasite: en yakın başlık satırındaki etiketlerle
      const es = [...etiketSatirlari].reverse().find((s) => s.y < a.y);
      const etiketler = es ? es.parcalar.filter((p) => p.x >= kapasiteSol - 6 && p.x < fiyatSiniri) : [];
      const birim = es ? birimler.find((s) => Math.abs(s.y - es.y) <= 20)?.metin.match(/\[(.+?)\]/)?.[1] ?? "" : "";
      const degerler = kapasite
        .filter((p) => Math.abs(p.y - a.y) <= 6)
        .sort((p, q) => p.x - q.x)
        .map((p) => {
          const e = etiketler.length ? etiketler.reduce((b, x) => (Math.abs((x.x + x.x2) / 2 - (p.x + p.x2) / 2) < Math.abs((b.x + b.x2) / 2 - (p.x + p.x2) / 2) ? x : b)) : null;
          return { etiket: e ? basHarf(e.s) : "", deger: p.s };
        });
      const nominal = degerler.find((d) => /Nominal/i.test(d.etiket))?.deger ?? "";
      if (!ad) ad = grup;
      if (nominal && !/\d/.test(ad)) ad += ` ${nominal}${birim && /btu/i.test(birim) ? " Btu/h" : ""}`;
      const birimli = (d: { etiket: string; deger: string }) =>
        `${d.etiket ? d.etiket + ": " : ""}${d.deger}${birim && /btu/i.test(birim) && /^[\d.\s~-]+$/.test(d.deger) ? " Btu/h" : ""}`;
      urunler.push({
        marka,
        bolum: `${etiket}${grup ? " · " + grup : ""}`.slice(0, 160),
        kod: kod.slice(0, 120),
        ad: ad.slice(0, 200),
        aciklama: degerler.map(birimli).join(" · ").slice(0, 400),
        alis: a.nakit,
        alis2: a.kart,
      });
    }

    // Notlar (tablodan sonra; numaralı maddeler, satır kaymaları birleştirilir)
    const notSatirlari = S.filter((s) => s.y >= tabloSonu && !/^(NOTLAR:?|Sipariş.*)$/i.test(s.metin));
    let metin = "";
    for (const s of notSatirlari) {
      if (/SATIŞ YÖNETİC|NETİSA MÜHENDİSLİK|Kızılırmak|Tel\+90|Sipariş, sevkiyat/i.test(s.metin)) break;
      metin += " " + s.metin;
    }
    const maddeler = sade(metin)
      .split(/\s(?=\d{1,2}\s?-\s?\S)/)
      .map((m) => sade(m.replace(/^\d{1,2}\s?-\s?/, "")))
      .filter(Boolean);
    // Netsa'ya özel cümleler (firma adı, bayi alış koşulları, sevkiyat, kampanya, nakliye) çıkarılır
    const OZEL = /NET[İI]SA|bayi alış|\b20 set|sevkiyat|kampanya|haber vermeksizin|tarafımıza aittir|Kapasiteye göre maksimum|Enerji Besleme|KAPAĞA DÖN/i;
    for (const m of maddeler) {
      const temiz = sade(
        m
          .replace(/\.\s+/g, ".\u0000")
          .split("\u0000")
          .filter((c) => !OZEL.test(c))
          .join(" ")
      );
      if (temiz.length > 8) notlar.push(temiz);
    }
    sayfaNotlari.push({ etiket, notlar });
  });

  // Aynı not birden çok sayfada geçiyorsa tek not, o sayfaların etiketleriyle
  const tumEtiketler = [...new Set(sayfaNotlari.map((s) => s.etiket))];
  const harita = new Map<string, Set<string>>();
  for (const s of sayfaNotlari)
    for (const n of s.notlar) {
      const grupNotu = n.match(/^@(.+?)@(.*)$/);
      const metin = grupNotu ? grupNotu[2] : n;
      const etk = grupNotu ? `${s.etiket} · ${grupNotu[1]}` : s.etiket;
      if (!harita.has(metin)) harita.set(metin, new Set());
      harita.get(metin)!.add(etk);
    }
  const notlar: NetsaNot[] = [...harita.entries()].map(([metin, e]) => {
    const etk = [...e];
    const hepsi = tumEtiketler.length > 0 && tumEtiketler.every((t) => etk.includes(t));
    return { metin, etiketler: hepsi ? [] : etk };
  });

  if (!urunler.length) uyarilar.push("Listede ürün bulunamadı; dosya biçimi değişmiş olabilir.");
  return { marka, tarih, urunler, notlar, uyarilar };
}
