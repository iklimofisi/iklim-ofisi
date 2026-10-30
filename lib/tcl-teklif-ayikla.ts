// -----------------------------------------------------------------------------
// TCL (distribütör) TEKLİF PDF'İ AYIKLAMA
// Excel'den PDF'e basılan sabit formatlı teklif: başlıkta "Tarih" ve "Proje Adı",
// tabloda "Poz. No · Ürün Adı · Mik./Birim · Fiyat (USD) · Tutar (USD)" sütunları,
// altta "Net Tutar". Ürünler gruplar hâlinde gelir ("Heat-Pump Dış Üniteler",
// "Aksesuarlar"…). Birim fiyatsız sürümde fiyat sütunları boştur; o zaman
// yalnız Net Tutar kullanılır.
// Saf fonksiyon (PDF okuma ayrı): metin parçaları konumlarıyla verilir.
// -----------------------------------------------------------------------------
import type { PdfSayfa } from "@/lib/netsa-ayikla";

export type TclKalem = { bolum: string; kod: string; aciklama: string; adet: number; birimFiyat: number; tutar: number };
export type TclSonuc = {
  projeAdi: string;
  tarih: string; // gg.aa.yyyy
  paraBirimi: "USD" | "EUR" | "TRY";
  kalemler: TclKalem[];
  netTutar: number | null;
  kalemToplami: number; // birim fiyatlı kalemlerin toplamı
  fiyatsiz: boolean; // hiçbir kalemde birim fiyat yoksa true
  notlar: string[]; // "Bakır borulama ve montaj bedeli dahil değildir." gibi (bilgi için)
  uyarilar: string[];
};

type Parca = { s: string; x: number; x2: number; y: number };

const sade = (s: string) => s.normalize("NFKC").replace(/\s+/g, " ").replace(/\s+\)/g, ")").trim();
// "7.594,38" / "1,001.86" / "$34.759" → sayı
function sayiOku(ham: string): number | null {
  let t = ham.replace(/[$€₺\s]|USD|EUR|TL|TRY/gi, "");
  if (!/^\d[\d.,]*$/.test(t)) return null;
  const virgul = t.lastIndexOf(",");
  const nokta = t.lastIndexOf(".");
  if (virgul > nokta) t = t.replace(/\./g, "").replace(",", ".");
  else if (nokta > virgul && virgul >= 0) t = t.replace(/,/g, "");
  else if (nokta >= 0 && virgul < 0) {
    // Yalnız nokta: "34.759" binlik ayraç, "12.5" ondalık
    t = /\.\d{3}$/.test(t) || (t.match(/\./g) ?? []).length > 1 ? t.replace(/\./g, "") : t;
  }
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function satirlar(sayfa: PdfSayfa) {
  const og = sayfa.items.filter((i) => i.s && i.s.trim()).sort((a, b) => a.y - b.y || a.x - b.x);
  const gruplar: (typeof og)[] = [];
  for (const i of og) {
    const g = gruplar[gruplar.length - 1];
    if (g && Math.abs(i.y - g[0].y) <= 2.5) g.push(i);
    else gruplar.push([i]);
  }
  return gruplar.map((g) => {
    const parcalar: Parca[] = g.sort((a, b) => a.x - b.x).map((i) => ({ s: sade(i.s), x: i.x, x2: i.x + i.w, y: i.y }));
    return { y: Math.min(...g.map((i) => i.y)), parcalar: parcalar.filter((p) => p.s), metin: sade(parcalar.map((p) => p.s).join(" ")) };
  });
}

export function tclTeklifAyikla(sayfalar: PdfSayfa[]): TclSonuc {
  const uyarilar: string[] = [];
  const notlar: string[] = [];
  const kalemler: TclKalem[] = [];
  let projeAdi = "";
  let tarih = "";
  let paraBirimi: TclSonuc["paraBirimi"] = "USD";
  let netTutar: number | null = null;
  let bolum = "";
  let tabloVar = false;

  for (const sayfa of sayfalar) {
    const S = satirlar(sayfa);
    const tum = S.flatMap((s) => s.parcalar);
    // Başlık bilgileri
    for (const s of S) {
      if (!tarih) {
        const t = s.metin.match(/Tarih\s*:?\s*(\d{1,2})[./](\d{1,2})[./](20\d\d)/i);
        if (t) tarih = `${t[1].padStart(2, "0")}.${t[2].padStart(2, "0")}.${t[3]}`;
      }
      if (!projeAdi && /^Proje Adı/i.test(s.metin)) {
        projeAdi = sade(s.metin.replace(/^Proje Adı\s*:?/i, "").replace(/\s+için\s+.*$/i, ""));
      }
    }
    // Tablo sütunları (başlık satırı)
    const kodB = tum.find((p) => /^Poz\.?\s*No/i.test(p.s));
    const adB = tum.find((p) => /^Ürün Adı/i.test(p.s));
    const adetB = tum.find((p) => /^Mik/i.test(p.s));
    const fiyatB = tum.find((p) => /^(Birim\s*)?Fiyat/i.test(p.s));
    const tutarB = tum.find((p) => /^Tutar/i.test(p.s));
    if (!adB || !adetB) continue;
    tabloVar = true;
    const pbMetin = `${fiyatB?.s ?? ""} ${tutarB?.s ?? ""}`;
    paraBirimi = /EUR|€/i.test(pbMetin) ? "EUR" : /TL|TRY|₺/i.test(pbMetin) ? "TRY" : "USD";
    const baslikY = Math.max(adB.y, adetB.y);
    const adSol = adB.x - 20; // açıklama sütununun solu (ürün adları başlığın biraz solundan başlayabilir)
    const sayiSol = adetB.x - 15; // sayı sütunlarının başladığı yer
    const orta = (p: { x: number; x2: number }) => (p.x + p.x2) / 2;
    const sutunlar = [
      { ad: "adet" as const, x: orta(adetB) },
      ...(fiyatB ? [{ ad: "fiyat" as const, x: orta(fiyatB) }] : []),
      ...(tutarB ? [{ ad: "tutar" as const, x: orta(tutarB) }] : []),
    ];

    for (const s of S) {
      if (s.y <= baslikY + 2) continue;
      if (/Net Tutar|Genel Toplam|Toplam Tutar/i.test(s.metin)) {
        const deger = [...s.parcalar].reverse().map((p) => sayiOku(p.s)).find((n) => n !== null);
        if (deger != null) netTutar = deger;
        continue;
      }
      // Tablonun bittiği yer: koşullar bölümü
      if (/^Teklif Geçerliliği|^KDV\b|^Teslim|^Ödeme|^Açıklamalar|^Saygılarımızla/i.test(s.metin)) break;
      if (/^Not\s*:/i.test(s.metin)) {
        notlar.push(sade(s.metin.replace(/^Not\s*:\s*/i, "")));
        continue;
      }
      const sayilar: Record<"adet" | "fiyat" | "tutar", number | null> = { adet: null, fiyat: null, tutar: null };
      const metinler: Parca[] = [];
      for (const p of s.parcalar) {
        const n = p.x >= sayiSol ? sayiOku(p.s) : null;
        if (n === null) {
          metinler.push(p);
          continue;
        }
        const sutun = sutunlar.reduce((a, b) => (Math.abs(b.x - orta(p)) < Math.abs(a.x - orta(p)) ? b : a));
        sayilar[sutun.ad] = n;
      }
      const kod = sade(metinler.filter((p) => p.x < adSol && (!kodB || p.x2 > kodB.x - 10)).map((p) => p.s).join(" "));
      const ad = sade(metinler.filter((p) => p.x >= adSol && p.x < sayiSol).map((p) => p.s).join(" "));
      // Sıra numarası sütunu (yalnız sayı) koda karışmasın
      const kodTemiz = kod.replace(/^\d{1,3}\s+/, "");
      if (sayilar.adet !== null && sayilar.adet > 0) {
        const birimFiyat = sayilar.fiyat ?? 0;
        const tutar = sayilar.tutar ?? birimFiyat * sayilar.adet;
        if (birimFiyat > 0 && sayilar.tutar !== null && Math.abs(birimFiyat * sayilar.adet - sayilar.tutar) > Math.max(1, sayilar.tutar * 0.002))
          uyarilar.push(`${kodTemiz || ad}: adet × birim fiyat tutarı tutmuyor (${sayilar.adet} × ${birimFiyat} ≠ ${sayilar.tutar}).`);
        kalemler.push({ bolum: bolum || "TCL VRF Sistemi", kod: kodTemiz, aciklama: ad, adet: sayilar.adet, birimFiyat, tutar });
        continue;
      }
      if (!kod && !ad) continue;
      // Sayısız satır: grup başlığı (yalnız sol sütunda yazı) ya da önceki ürünün devam satırı
      if (kod && !ad) {
        bolum = kod;
        continue;
      }
      const son = kalemler[kalemler.length - 1];
      if (son && !kod && ad) {
        son.aciklama = sade(`${son.aciklama} ${ad}`);
        continue;
      }
      uyarilar.push(`Okunamayan satır atlandı: ${s.metin.slice(0, 80)}`);
    }
  }

  if (!tabloVar) uyarilar.push("Teklif tablosu bulunamadı (\"Ürün Adı\" ve \"Mik./Birim\" sütunları yok). Dosya biçimi farklı olabilir.");
  else if (!kalemler.length) uyarilar.push("Tabloda ürün satırı bulunamadı.");
  const fiyatsiz = kalemler.length > 0 && kalemler.every((k) => !(k.birimFiyat > 0));
  const kalemToplami = Math.round(kalemler.reduce((a, k) => a + (k.birimFiyat > 0 ? k.adet * k.birimFiyat : 0), 0) * 100) / 100;
  // Net tutar PDF'te tam sayıya yuvarlanmış olabilir (ör. "$34.759"): 1 birimden büyük fark uyarılır
  if (!fiyatsiz && netTutar != null && Math.abs(netTutar - kalemToplami) > 1)
    uyarilar.push(`Kalemlerin toplamı (${kalemToplami}) teklifteki Net Tutar ile (${netTutar}) tutmuyor; satırları kontrol edin.`);
  if (fiyatsiz && netTutar == null) uyarilar.push("Birim fiyat ve Net Tutar bulunamadı.");
  return { projeAdi, tarih, paraBirimi, kalemler, netTutar, kalemToplami, fiyatsiz, notlar, uyarilar };
}

// Bizim teklifteki kalem açıklaması: "TMV-VED+450W/AS-D(E) — Soğutma Kapasitesi: 16 HP (45.0 kW)"
export function tclKalemAciklamasi(k: { kod: string; aciklama: string }) {
  const ad = k.aciklama.replace(/\s+:\s*/g, ": ").trim();
  return [k.kod, ad].filter(Boolean).join(" — ").slice(0, 500);
}
