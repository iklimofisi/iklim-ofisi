// -----------------------------------------------------------------------------
// KAYA İKLİMLENDİRME FİYAT LİSTESİ — OTOMATİK AKTARIM (saf fonksiyonlar)
//
// kayaiklimlendirme.com/fiyat-listesi sayfasındaki "Kaya İklimlendirme" PDF'i
// okunur; her ürünün nakit ve kart fiyatına %5 eklenir ve bizim Fiyat Listeleri
// bölümümüzde (kendi formatımızda) tutulur. Kaya listeyi güncelledikçe (dosya adı
// değişir) liste de güncellenir. "FİYAT İSTEYİNİZ" ürünlerde "Fiyat sorunuz" yazar.
//
// Bu dosya veritabanına / ağa erişmez (test edilebilir); sunucu tarafı
// lib/kaya-fiyat-sunucu.ts dosyasındadır.
// -----------------------------------------------------------------------------

export const KAYA_KAYNAK = "KAYA";
export const KAYA_SAYFA = "https://kayaiklimlendirme.com/fiyat-listesi/";
export const KAYA_ZAM_YUZDE = 5;
export const KAYA_VARSAYILAN_BASLIK = "Isıtma ve Klima Ürünleri Fiyat Listesi";

// Fiyata %5 eklenir ve tam liraya yuvarlanır (Kaya fiyatları tam liradır)
export const zamli = (n: number) => Math.round(n * (1 + KAYA_ZAM_YUZDE / 100));

export type KayaKalem = {
  bolum: string;
  ad: string;
  nakit: number | null; // Kaya'nın fiyatı (zamsız); null = fiyat sorunuz
  kart: number | null;
  not: string | null; // "Stoklarla sınırlıdır" gibi satır notu
};

export type KayaAyristirma = {
  kalemler: KayaKalem[];
  gecerlilik: string | null; // YYYY-MM-DD ("Liste 05.10.2026 tarihinden itibaren geçerlidir")
  notlar: string[]; // listenin genel notları (bilgi için; PDF'imize konmaz)
  atlanan: string[]; // anlamlandırılamayan satırlar (kontrol için)
};

// Otomatik güncelleme durumu (FiyatListesi.kaynakDurum içinde JSON olarak)
export type KaynakDurum = {
  pdfUrl: string | null;
  pdfAdi: string | null;
  listeTarihi: string | null; // Kaya listesinin geçerlilik tarihi (YYYY-MM-DD)
  sonKontrol: string | null; // ISO
  sonGuncelleme: string | null; // ISO — ürünlerin en son yenilendiği an
  urunSayisi: number;
  fiyatSorunuz: number;
  ozet: { yeni: number; cikan: number; degisen: number; ornekler: string[] } | null;
  hata: { mesaj: string; zaman: string } | null;
  atlanan: string[];
  // Fiyatı değişen / yeni / çıkan ürünlerin tam listesi (en son DEĞİŞİKLİK olan güncellemeden).
  // Bir sonraki değişikliğe kadar panelde tabloda işaretli kalır.
  degisiklikler: KayaDegisiklik[];
  degisiklikTarihi: string | null; // ISO — fiyatların en son değiştiği an
  // "Değişiklik yok" e-postası: her gün / haftada bir (pazartesi) / hiç
  bildirim: KayaBildirim;
  sonDegisiklikYokMail: string | null; // YYYY-MM-DD (aynı gün ikinci kez gitmesin)
};

export type KayaBildirim = "GUNLUK" | "HAFTALIK" | "KAPALI";
export const KAYA_BILDIRIMLER: { kod: KayaBildirim; ad: string }[] = [
  { kod: "GUNLUK", ad: "Her sabah (değişiklik olmasa da)" },
  { kod: "HAFTALIK", ad: "Haftada bir, pazartesi (değişiklik olmasa da)" },
  { kod: "KAPALI", ad: "Yalnız fiyat değişince ya da hata olunca" },
];
export const kayaBildirimGecerli = (v: unknown): KayaBildirim => (v === "HAFTALIK" || v === "KAPALI" ? v : "GUNLUK");

export type KayaDegisiklik = {
  tur: "DEGISEN" | "YENI" | "CIKAN";
  bolum: string;
  ad: string;
  eski: number | null; // eski 1. fiyat (nakit)
  eski2: number | null; // eski 2. fiyat (kart)
  yeni: number | null;
  yeni2: number | null;
};

// Yüzde değişim (fiyat sorunuz ↔ fiyat geçişlerinde null)
export const yuzdeFark = (eski: number | null, yeni: number | null) =>
  eski && yeni && eski > 0 ? ((yeni - eski) / eski) * 100 : null;

// Panelde ve liste sayfasında gösterilen tek cümlelik durum
export type KayaDurumOzeti = { renk: "yesil" | "turuncu" | "kirmizi" | "sari"; baslik: string; detay: string };
const trZaman = (iso: string) =>
  new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" }).format(
    new Date(iso)
  );
const trGun = (iso: string) =>
  new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" }).format(new Date(iso));
export function kayaDurumOzeti(d: KaynakDurum, simdi = new Date()): KayaDurumOzeti {
  const listeTarihi = d.listeTarihi ? d.listeTarihi.split("-").reverse().join(".") : "—";
  if (d.hata)
    return {
      renk: "kirmizi",
      baslik: "Son kontrol başarısız — mevcut fiyatlar korunuyor",
      detay: `${trZaman(d.hata.zaman)}: ${d.hata.mesaj}`,
    };
  const kontrolSaat = d.sonKontrol ? (simdi.getTime() - new Date(d.sonKontrol).getTime()) / 3600000 : Infinity;
  if (kontrolSaat > 36)
    return {
      renk: "sari",
      baslik: "Otomatik kontrol bir süredir çalışmadı",
      detay: d.sonKontrol
        ? `En son ${trZaman(d.sonKontrol)} kontrol edildi. "Şimdi güncelle" ile elle kontrol edebilirsiniz.`
        : `Henüz kontrol yapılmadı. "Şimdi güncelle" ile elle kontrol edebilirsiniz.`,
    };
  const sayilar = (["DEGISEN", "YENI", "CIKAN"] as const).map((t) => d.degisiklikler.filter((x) => x.tur === t).length);
  const degisiklikGun = d.degisiklikTarihi ? (simdi.getTime() - new Date(d.degisiklikTarihi).getTime()) / 86400000 : Infinity;
  if (d.degisiklikler.length && degisiklikGun <= 7)
    return {
      renk: "turuncu",
      baslik: `${trGun(d.degisiklikTarihi!)} tarihinde fiyatlar değişti`,
      detay: `Kaya'nın ${listeTarihi} tarihli yeni listesi: ${sayilar[0]} ürünün fiyatı değişti · ${sayilar[1]} yeni ürün · ${sayilar[2]} ürün listeden çıktı. Değişen ürünler aşağıdaki tabloda işaretli.`,
    };
  return {
    renk: "yesil",
    baslik: "Fiyatlar güncel — değişiklik yok",
    detay:
      `Kaya'nın listesi hâlâ ${listeTarihi} tarihli; en son ${d.sonKontrol ? trZaman(d.sonKontrol) : "—"} kontrol edildi. ` +
      (d.degisiklikTarihi
        ? `Son fiyat değişikliği ${trGun(d.degisiklikTarihi)} tarihindeydi.`
        : d.sonGuncelleme
          ? `Liste ${trGun(d.sonGuncelleme)} tarihinde oluşturulduğundan beri fiyat değişmedi.`
          : ""),
  };
}

export function kaynakDurumOku(json: string | null | undefined): KaynakDurum {
  const bos: KaynakDurum = {
    pdfUrl: null,
    pdfAdi: null,
    listeTarihi: null,
    sonKontrol: null,
    sonGuncelleme: null,
    urunSayisi: 0,
    fiyatSorunuz: 0,
    ozet: null,
    hata: null,
    atlanan: [],
    degisiklikler: [],
    degisiklikTarihi: null,
    bildirim: "GUNLUK",
    sonDegisiklikYokMail: null,
  };
  try {
    const v = JSON.parse(json || "{}");
    if (!v || typeof v !== "object") return bos;
    const d: KaynakDurum = { ...bos, ...v };
    d.degisiklikler = Array.isArray(d.degisiklikler) ? d.degisiklikler : [];
    d.atlanan = Array.isArray(d.atlanan) ? d.atlanan : [];
    d.bildirim = kayaBildirimGecerli(d.bildirim);
    return d;
  } catch {
    return bos;
  }
}

// -----------------------------------------------------------------------------
// 1) SAYFADAN PDF BAĞLANTISI
// Sayfada 15 kadar marka PDF'i var; "Kaya İklimlendirme" listesinin dosya adı
// "05.10.2026-Kaya-Iklimlendirme-2.pdf" gibidir (tarih ve sıra no değişir).
// -----------------------------------------------------------------------------
const sade = (m: string) =>
  m
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/İ/g, "i");

export function pdfBaglantisiBul(html: string, taban = KAYA_SAYFA): string | null {
  const adaylar: { url: string; puan: number }[] = [];
  const re = /href\s*=\s*["']([^"'#]+?\.pdf)(?:\?[^"']*)?["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    let url: string;
    try {
      url = new URL(m[1].replace(/&amp;/g, "&"), taban).toString();
    } catch {
      continue;
    }
    const ad = sade(decodeURIComponent(url.split("/").pop() || ""));
    // Kaya'nın kendi listesi: dosya adında "kaya" ve "iklim" geçer
    if (!/kaya/.test(ad) || !/iklim/.test(ad)) continue;
    if (/firma|bilgi|katalog|sozlesme/.test(ad)) continue; // fiyat listesi olmayan Kaya belgeleri
    // En yeni tarihli dosya öne alınır (dosya adındaki gg.aa.yyyy)
    const t = ad.match(/(\d{2})[.\-_](\d{2})[.\-_](\d{4})/);
    const puan = t ? Number(t[3]) * 10000 + Number(t[2]) * 100 + Number(t[1]) : 0;
    adaylar.push({ url, puan });
  }
  if (!adaylar.length) return null;
  adaylar.sort((a, b) => b.puan - a.puan);
  return adaylar[0].url;
}

// Dosya adındaki tarih (gg.aa.yyyy → yyyy-aa-gg)
export function dosyaTarihi(url: string | null): string | null {
  const t = (url ?? "").split("/").pop()?.match(/(\d{2})[.\-_](\d{2})[.\-_](\d{4})/);
  return t ? `${t[3]}-${t[2]}-${t[1]}` : null;
}

// -----------------------------------------------------------------------------
// 2) PDF METNİNİ SATIRLARA DİZME
// pdf.js metin parçalarını (x, y konumlu) aynı satırdakiler yan yana gelecek
// şekilde birleştirir. Aynı satırda sütunlar arasında büyük boşluk varsa
// (iki sütunlu sayfa) satır ayrı parçalara bölünür.
// -----------------------------------------------------------------------------
export type MetinParcasi = { str: string; transform: number[]; width?: number; height?: number };

export function satirlariKur(items: MetinParcasi[]): string[] {
  const parcalar = items
    .filter((i) => i && typeof i.str === "string" && i.str.trim() !== "")
    .map((i) => ({ s: i.str, x: i.transform[4], y: i.transform[5], w: i.width ?? i.str.length * 4, h: Math.abs(i.transform[3]) || 8 }));
  if (!parcalar.length) return [];
  // y'si birbirine yakın (yazı yüksekliğinin %45'i) parçalar aynı satır
  parcalar.sort((a, b) => b.y - a.y || a.x - b.x);
  const satirlar: (typeof parcalar)[] = [];
  for (const p of parcalar) {
    const son = satirlar[satirlar.length - 1];
    if (son && Math.abs(son[0].y - p.y) <= Math.max(2, son[0].h * 0.45)) son.push(p);
    else satirlar.push([p]);
  }
  const sonuc: string[] = [];
  for (const s of satirlar) {
    s.sort((a, b) => a.x - b.x);
    let metin = "";
    let sagX = -Infinity;
    for (const p of s) {
      const bosluk = p.x - sagX;
      if (metin && bosluk > p.h * 0.15 && !metin.endsWith(" ") && !p.s.startsWith(" ")) metin += " ";
      metin += p.s;
      sagX = p.x + p.w;
    }
    sonuc.push(metin.replace(/\s+/g, " ").trim());
  }
  return sonuc.filter(Boolean);
}

// -----------------------------------------------------------------------------
// 3) AYRIŞTIRMA
// Ürün satırı: "ECA CITIUS PREMİX 20 kw 35.750 ₺ 39.990 ₺" (nakit, kart)
// Fiyatsız ürün: "BOSCH VRF ... FİYAT İSTEYİNİZ"
// Bölüm başlığı: fiyatsız, büyük harfli kısa satır ("KOMBİLER NAKİT KART")
// Uzun ürün adı iki satıra bölünmüşse (ilk satır fiyatsız, ikinci yalnız fiyat) birleştirilir.
// -----------------------------------------------------------------------------
const FIYAT_RE = /(\d{1,3}(?:\.\d{3})+|\d{2,7})(?:,(\d{1,2}))?\s*(?:₺|TL\b|TL$|₺)/g;
const ISTEYINIZ_RE = /f[iİı]yat\s+[iİı]stey[iİı]n[iİı]z|f[iİı]yat\s+sorunuz|f[iİı]yat\s+[iİı]ç[iİı]n\s+arayınız/i;
const NOT_RE = /kdv|geçerli|gecerli|stoklarla|stok sor|tarihinden|fiyat değişikliği|haber verilmeksizin|değişiklik hakkı|iskonto|kampanya/i;
const SUTUN_RE = /\b(NAK[İI]T|KART|KRED[İI] KARTI|PE[ŞS][İI]N|L[İI]STE F[İI]YATI|F[İI]YAT)\b/gi;

const sayiOku = (tam: string, kurus?: string) => {
  const n = Number(tam.replace(/[.\s]/g, "")) + (kurus ? Number(kurus.padEnd(2, "0")) / 100 : 0);
  return Number.isFinite(n) ? n : NaN;
};

function adTemizle(ad: string) {
  return ad
    .replace(/\s*\*{2,}\s*/g, " ")
    .replace(/\s\*$/, "") // ** işaretleri
    .replace(/\(\s*N\s*:\s*%?\s*\d+[^)]*\)/gi, " ") // (N:%45 - K:%41) gibi iç iskonto notları müşteriye gitmez
    .replace(/\s*[-–:|]\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

const harfOrani = (s: string) => {
  const harf = s.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü]/g, "");
  if (!harf.length) return { harf: 0, buyuk: 0 };
  return { harf: harf.length, buyuk: harf.replace(/[^A-ZÇĞİÖŞÜ]/g, "").length / harf.length };
};

export function kayaAyristir(satirlar: string[]): KayaAyristirma {
  const kalemler: KayaKalem[] = [];
  const notlar: string[] = [];
  const atlanan: string[] = [];
  let gecerlilik: string | null = null;
  let bolum = "";
  let bekleyen: string | null = null; // fiyatsız, henüz ne olduğu belli olmayan satır

  const bekleyeniKapat = () => {
    if (bekleyen === null) return;
    const b = bekleyen;
    bekleyen = null;
    const { harf, buyuk } = harfOrani(b);
    if (harf >= 3 && buyuk >= 0.7 && b.length <= 80) {
      const temiz = b.replace(SUTUN_RE, " ").replace(/\s+/g, " ").replace(/[-–:|]\s*$/, "").trim();
      if (temiz.length >= 3) {
        bolum = temiz;
        return;
      }
      if (!temiz) return; // yalnız "NAKİT KART" sütun başlığı
    }
    atlanan.push(b);
  };

  for (const ham of satirlar) {
    const s = ham.replace(/\s+/g, " ").trim();
    if (!s) continue;
    const g = s.match(/(\d{2})\.(\d{2})\.(\d{4})\s*tarihinden/i);
    if (g) gecerlilik = `${g[3]}-${g[2]}-${g[1]}`;
    if (/sayfa\s*\d+\s*(\/|of)\s*\d+/i.test(s)) continue;
    // Sayfa altındaki iletişim bilgileri (adres, telefon, web) listeye girmez
    if (/^www\.|https?:\/\/|\bMah\.|^[\d\s()+-]{10,}$/i.test(s)) continue;

    // Fiyatları bul
    const fiyatlar: { n: number; bas: number }[] = [];
    FIYAT_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = FIYAT_RE.exec(s))) {
      const n = sayiOku(m[1], m[2]);
      if (n > 0) fiyatlar.push({ n, bas: m.index });
    }
    const isteyiniz = ISTEYINIZ_RE.exec(s);

    if (fiyatlar.length === 0 && !isteyiniz) {
      // Sayfa başlığı
      if (/^F[İI]YAT L[İI]STES[İI]$/i.test(s)) continue;
      // Sütun başlığı satırı: "KOMBİ NAKİT KART", "KLİMA 'STOK SORUNUZ' NAKİT KART" → bölüm
      if (/\bNAK[İI]T\b/i.test(s) && /\bKART\b/i.test(s)) {
        bekleyeniKapat();
        const baslik = s
          .replace(/['"‘’“”]?\s*STOK\s+SORUNUZ\s*['"‘’“”]?/gi, " ")
          .replace(SUTUN_RE, " ")
          .replace(/\s+/g, " ")
          .replace(/[-–:|]\s*$/, "")
          .trim();
        if (harfOrani(baslik).harf >= 2) bolum = baslik;
        continue;
      }
      // Fiyatsız satır: genel not, bölüm başlığı ya da iki satıra bölünmüş ürün adının ilk satırı
      if (NOT_RE.test(s) && s.length > 12 && harfOrani(s).buyuk < 0.9) {
        bekleyeniKapat();
        notlar.push(s);
        continue;
      }
      // "STOK SORUNUZ" / "stoklarla sınırlıdır" tek başına: son ürüne not
      if (/stok/i.test(s) && s.length <= 40 && kalemler.length) {
        bekleyeniKapat();
        const son = kalemler[kalemler.length - 1];
        son.not = son.not ? `${son.not} · ${s}` : s;
        continue;
      }
      bekleyeniKapat();
      bekleyen = s;
      continue;
    }

    // Ürün satırı
    const ilkFiyat = isteyiniz && (!fiyatlar.length || isteyiniz.index < fiyatlar[0].bas) ? isteyiniz.index : fiyatlar[0].bas;
    let ad = s.slice(0, ilkFiyat);
    // Satırda yalnız fiyat varsa: bekleyen satır ürün adının başıdır
    if (!harfOrani(ad).harf && bekleyen !== null) {
      ad = bekleyen;
      bekleyen = null;
    } else bekleyeniKapat();
    // Fiyatlardan sonra kalan metin (ör. "stoklarla sınırlıdır") not olur
    const sonFiyatBitis = (() => {
      FIYAT_RE.lastIndex = 0;
      let son = 0;
      let x: RegExpExecArray | null;
      while ((x = FIYAT_RE.exec(s))) son = x.index + x[0].length;
      if (isteyiniz) son = Math.max(son, isteyiniz.index + isteyiniz[0].length);
      return son;
    })();
    const kuyruk = s
      .slice(sonFiyatBitis)
      .replace(new RegExp(ISTEYINIZ_RE.source, "gi"), " ")
      .replace(/^[\s\-–*.|]+/, "")
      .trim();
    // Adın içindeki "- stoklarla sınırlıdır" ibaresi nota taşınır
    let adNotu: string | null = null;
    const stokIbare = /\s*[-–]?\s*(st?oklarla\s+s[ıi]n[ıi]rl[ıi]d[ıi]r)\.?/i;
    const si = ad.match(stokIbare);
    if (si) {
      ad = ad.replace(stokIbare, " ");
      adNotu = "Stoklarla sınırlıdır";
    }
    const temizAd = adTemizle(ad);
    if (!temizAd || harfOrani(temizAd).harf < 2) {
      atlanan.push(s);
      continue;
    }
    // "KAZAN VE EKİPMANLARI İÇİN FİYAT İSTEYİNİZ." → kendi bölümünde "fiyat sorunuz" kalemi
    let kalemBolum = bolum;
    let kalemAd = temizAd;
    if (!fiyatlar.length && /\s+[İI]Ç[İI]N$/i.test(temizAd)) {
      kalemAd = temizAd.replace(/\s+[İI]Ç[İI]N$/i, "").trim();
      kalemBolum = kalemAd;
    }
    // Üç ya da daha fazla fiyat varsa (ör. "4300₺ (N:%45 - K:%41) 2.838 ₺ 3.044 ₺": önce liste
    // fiyatı, sonra iskontolu nakit ve kart) geçerli olanlar son ikisidir.
    const ff = fiyatlar.length >= 3 ? fiyatlar.slice(-2) : fiyatlar;
    const nakit = ff[0]?.n ?? null;
    // Tek fiyat varsa kart fiyatı bilinmez → kartta "fiyat sorunuz"
    const kart = ff.length >= 2 ? ff[1].n : null;
    kalemler.push({
      bolum: kalemBolum,
      ad: kalemAd,
      nakit: isteyiniz && !fiyatlar.length ? null : nakit,
      kart: isteyiniz && !fiyatlar.length ? null : kart,
      not: [adNotu, kuyruk && harfOrani(kuyruk).harf >= 3 ? kuyruk.slice(0, 200) : null].filter(Boolean).join(" · ") || null,
    });
  }
  bekleyeniKapat();
  return { kalemler, gecerlilik, notlar, atlanan };
}

// Ürünün kimliği (değişiklik özeti için): bölüm + ad, büyük/küçük harf ve boşluk duyarsız
export const urunAnahtari = (bolum: string, ad: string) => sade(`${bolum}|${ad}`).replace(/\s+/g, " ").trim();
