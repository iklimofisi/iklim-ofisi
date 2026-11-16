// -----------------------------------------------------------------------------
// VIESSMANN TEKLİF PDF'İ AYIKLAMA (Viessmann Türkiye / Carrier satış teklifi)
// Biçim: kapak sayfasında yazı; sonraki sayfalarda her sayfa başında "Teklif <no>
// Başlangıç <tarih>", "Proje <ad>" ve "Poz. · Malzeme tanımı · Toplam fiyat" başlığı.
// Her kalem: "10  Vitoclima 335-S OVT5735T1 VRF ODU" (poz. no + ad), istenirse teknik
// açıklama satırları, "Sipariş no. 3203306" ve "1 Ad.  9.121,00 USD/Ad.  Net  9.121,00 USD"
// (yeni biçimde "Net" yazmaz: "1 Ad.  4.519,20 USD/Ad.  4.519,20 USD"; ikisi de okunur).
// "DX Batarya:" + "*****" gibi satırlar grup başlığıdır. Sonda "Pozisyonlar toplamı"
// (KDV hariç). Teklifteki fiyatlar firmamızın NET ALIŞ fiyatlarıdır.
// Sonuç TCL ayıklayıcısıyla aynı biçimdedir: satınalma teklifi ve müşteri teklifine
// aktarma TCL'deki gibi çalışır.
// Saf fonksiyon (PDF okuma ayrı): metin parçaları konumlarıyla verilir.
// -----------------------------------------------------------------------------
import type { PdfSayfa } from "@/lib/netsa-ayikla";
import type { TclKalem, TclSonuc } from "@/lib/tcl-teklif-ayikla";

const sade = (s: string) => s.normalize("NFKC").replace(/\s+/g, " ").trim();

// "9.121,00" / "86,10" → sayı (Türkçe yazım: nokta binlik, virgül ondalık)
function sayiOku(ham: string): number | null {
  const t = ham.replace(/\s/g, "");
  if (!/^\d{1,3}(\.\d{3})*(,\d+)?$|^\d+(,\d+)?$/.test(t)) return null;
  const n = Number(t.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

const AYLAR: Record<string, number> = {
  oca: 1, şub: 2, sub: 2, mar: 3, nis: 4, may: 5, haz: 6, tem: 7, ağu: 8, agu: 8, eyl: 9, eki: 10, kas: 11, ara: 12,
};

function satirlar(sayfa: PdfSayfa) {
  const og = sayfa.items.filter((i) => i.s && i.s.trim()).sort((a, b) => a.y - b.y || a.x - b.x);
  const gruplar: (typeof og)[] = [];
  for (const i of og) {
    const g = gruplar[gruplar.length - 1];
    if (g && Math.abs(i.y - g[0].y) <= 2.5) g.push(i);
    else gruplar.push([i]);
  }
  return gruplar.map((g) => {
    const parcalar = g.sort((a, b) => a.x - b.x).map((i) => ({ s: sade(i.s), x: i.x }));
    return { y: g[0].y, parcalar, metin: sade(parcalar.map((p) => p.s).join(" ")) };
  });
}

// PDF bir Viessmann teklifi mi? (kapakta firma adı ve kalem tablosu başlığı)
export function viessmannTeklifiMi(sayfalar: PdfSayfa[]): boolean {
  const metin = sayfalar.map((s) => s.items.map((i) => i.s).join(" ")).join(" ");
  return /Viessmann/i.test(metin) && /Malzeme\s+tanımı/i.test(metin) && /Pozisyonlar\s+toplamı|USD\/Ad\.|EUR\/Ad\.|TL\/Ad\./i.test(metin);
}

// Grup başlığı yoksa ürün türüne göre bölüm (teklifte düzenli görünsün diye)
function otomatikBolum(metin: string): string {
  // Büyük-küçük harf: Türkçe "IDU" → "ıdu" olmasın diye /i ile, özgün yazı üzerinde aranır
  if (/joint|bran[şs]man|refnet|da[ğg][ıi]t[ıi]c[ıi]/i.test(metin)) return "Bakır Bağlantı Elemanları (Joint)";
  if (/kontrol|kumanda|controller|gateway|a[ğg] ge[çc]idi/i.test(metin)) return "Kontrol Sistemleri";
  if (/\bAHU\b|DX batarya/i.test(metin)) return "DX Batarya / AHU Kit";
  if (/\bODU\b|d[ıi][şs] [üu]nite/i.test(metin)) return "VRF Dış Üniteler";
  if (/IDU\b|i[çc] [üu]nite|kaset|\by\.\s*kas\b|duvar tipi|kanal tipi|as[ıi]l[ıi]|konsol/i.test(metin)) return "VRF İç Üniteler";
  return "Viessmann Ürünleri";
}

export function viessmannTeklifAyikla(sayfalar: PdfSayfa[]): TclSonuc {
  const uyarilar: string[] = [];
  const kalemler: (TclKalem & { satirlar: string[] })[] = [];
  let projeAdi = "";
  let tarih = "";
  let paraBirimi: TclSonuc["paraBirimi"] = "USD";
  let netTutar: number | null = null;
  let grup = ""; // PDF'te yazan grup başlığı ("DX Batarya")
  let acik: (TclKalem & { satirlar: string[] }) | null = null; // adet satırı henüz gelmemiş kalem
  let bitti = false;

  for (const sayfa of sayfalar) {
    if (bitti) break;
    const S = satirlar(sayfa);
    // Kalem tablosu bu sayfada mı? ("Poz." + "Malzeme tanımı" başlığı)
    const baslik = S.find((s) => /^Poz\.?\s+Malzeme\s+tanımı/i.test(s.metin));
    for (const s of S) {
      if (!projeAdi) {
        const p = s.metin.match(/^Proje\s+(?!no\.)(.+)$/i);
        if (p && !/^no\.?$/i.test(p[1].trim())) projeAdi = sade(p[1]);
      }
      if (!tarih) {
        const t = s.metin.match(/Başlangıç\s+(\d{1,2})\s+([A-Za-zÇĞİÖŞÜçğıöşü]{3})\w*\s+(20\d\d)/);
        const ay = t ? AYLAR[t[2].toLocaleLowerCase("tr-TR").slice(0, 3)] : undefined;
        if (t && ay) tarih = `${t[1].padStart(2, "0")}.${String(ay).padStart(2, "0")}.${t[3]}`;
      }
    }
    if (!baslik) continue;

    for (const s of S) {
      if (s.y <= baslik.y + 2) continue;
      const m = s.metin;
      if (/^Sayfa\s+\d+\s*\/\s*\d+$/i.test(m)) continue;
      // Tablonun sonu
      const top = m.match(/^Pozisyonlar\s+toplamı\s+([\d.,]+)\s*(USD|EUR|TL|TRY)?/i);
      if (top) {
        netTutar = sayiOku(top[1]);
        bitti = true;
        break;
      }
      if (/^(\d+,\d+\s*%\s*KDV|Toplam\b|Bilgi\s*:)/i.test(m)) {
        bitti = true;
        break;
      }
      // Adet / fiyat satırı: "3 Ad. 647,50 USD/Ad. Net 1.942,50 USD" (eski) veya
      // "3 Ad. 647,50 USD/Ad. 1.942,50 USD" (yeni, "Net" yok)
      const f = m.match(/^([\d.,]+)\s*([A-Za-zÇĞİÖŞÜçğıöşü.]+)\s+([\d.,]+)\s*(USD|EUR|TL|TRY)\s*\/\s*\S+\s+(?:Net\s+)?([\d.,]+)\s*(USD|EUR|TL|TRY)\s*$/i);
      if (f) {
        const adet = sayiOku(f[1]);
        const birim = sayiOku(f[3]);
        const tutar = sayiOku(f[5]);
        const pb = f[4].toUpperCase();
        paraBirimi = pb === "EUR" ? "EUR" : pb === "TL" || pb === "TRY" ? "TRY" : "USD";
        if (!acik) {
          uyarilar.push(`Ürün adı bulunamayan fiyat satırı atlandı: ${m.slice(0, 80)}`);
          continue;
        }
        if (adet === null || birim === null || tutar === null) {
          uyarilar.push(`${acik.aciklama}: adet / fiyat okunamadı (${m.slice(0, 80)}).`);
          acik = null;
          continue;
        }
        acik.adet = adet;
        acik.birimFiyat = birim;
        acik.tutar = tutar;
        if (Math.abs(adet * birim - tutar) > Math.max(0.05, tutar * 0.002))
          uyarilar.push(`${acik.aciklama}: adet × birim fiyat tutarı tutmuyor (${adet} × ${birim} ≠ ${tutar}).`);
        kalemler.push(acik);
        acik = null;
        continue;
      }
      // Yeni kalem: "10 Vitoclima 335-S …" (poz. no sol sütunda)
      const poz = s.parcalar[0];
      if (poz && /^\d{1,4}$/.test(poz.s) && s.parcalar.length > 1 && poz.x < baslik.parcalar[0].x + 15) {
        if (acik) uyarilar.push(`${acik.aciklama}: adet / fiyat satırı bulunamadı, atlandı.`);
        const ad = sade(s.parcalar.slice(1).map((p) => p.s).join(" "));
        acik = { bolum: grup, kod: "", aciklama: ad, adet: 0, birimFiyat: 0, tutar: 0, satirlar: [] };
        continue;
      }
      if (/^Sipariş\s+no\.?/i.test(m)) continue; // Viessmann sipariş kodu (müşteri teklifine gerekmez)
      if (/^\*{3,}$/.test(m)) continue;
      // Grup başlığı: "DX Batarya:" (açık kalem yokken, iki nokta ile biten kısa satır)
      if (!acik && /:$/.test(m) && m.length <= 60) {
        grup = sade(m.replace(/:$/, ""));
        continue;
      }
      // Açık kalemin teknik açıklama satırları
      if (acik) {
        acik.satirlar.push(m);
        continue;
      }
    }
  }
  if (acik) uyarilar.push(`${acik.aciklama}: adet / fiyat satırı bulunamadı, atlandı.`);

  // Açıklama: ürün adı + teknik bilgiler ("Slim VRF dış ünite · Kapasite …")
  const sonKalemler: TclKalem[] = kalemler.map(({ satirlar: ek, ...k }) => ({
    ...k,
    // Grup başlığı yoksa ürün türünden (ad + teknik satırlar)
    bolum: k.bolum || otomatikBolum(`${k.aciklama} ${ek.join(" ")}`),
    aciklama: sade([k.aciklama, ...ek].join(" · ")).slice(0, 480),
  }));
  if (!sonKalemler.length) uyarilar.push("Teklifte ürün satırı bulunamadı (\"Poz. · Malzeme tanımı\" tablosu yok ya da biçim farklı).");
  const kalemToplami = Math.round(sonKalemler.reduce((a, k) => a + k.adet * k.birimFiyat, 0) * 100) / 100;
  if (netTutar != null && Math.abs(netTutar - kalemToplami) > 0.05)
    uyarilar.push(`Kalemlerin toplamı (${kalemToplami}) teklifteki Pozisyonlar toplamı ile (${netTutar}) tutmuyor; satırları kontrol edin.`);
  if (netTutar == null && sonKalemler.length) uyarilar.push("\"Pozisyonlar toplamı\" bulunamadı; kalemleri kontrol edin.");
  return {
    projeAdi,
    tarih,
    paraBirimi,
    kalemler: sonKalemler,
    netTutar,
    kalemToplami,
    fiyatsiz: false,
    notlar: ["Viessmann teklifindeki fiyatlar net alış fiyatlarıdır (KDV hariç)."],
    uyarilar,
  };
}
