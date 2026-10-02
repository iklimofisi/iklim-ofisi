// -----------------------------------------------------------------------------
// SÖZLEŞME TASLAĞI — ortak hesaplar ve yardımcılar
// Onaylanan tekliften üretilir. Kalemler sözleşme oluşturulurken tekliften
// KOPYALANIR (teklif sonradan değişse de imzalanan sözleşme değişmez); fiyatlar
// teklifin para biriminde saklanır, sözleşme para birimine "kur" ile çevrilir.
// -----------------------------------------------------------------------------

export type SozlesmeKalemi = { bolum: string; aciklama: string; adet: number; birimFiyat: number }; // birimFiyat: iskonto sonrası, teklif para biriminde
export type SozlesmeMaddesi = { baslik: string; icerik: string };

export const PARA_BIRIMLERI = ["TRY", "EUR", "USD"] as const;

export function paraSembolu(pb: string) {
  return pb === "EUR" ? "€" : pb === "USD" ? "$" : "TL";
}

export function paraYaz(n: number, pb: string) {
  return `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${paraSembolu(pb)}`;
}

const yuvarla = (n: number) => Math.round(n * 100) / 100;

// Veritabanındaki JSON metnini güvenle okur (bozuksa boş liste)
export function kalemleriOku(json: string | null | undefined): SozlesmeKalemi[] {
  try {
    const v = JSON.parse(json || "[]");
    if (!Array.isArray(v)) return [];
    return v
      .filter((k) => k && typeof k.aciklama === "string")
      .map((k) => ({
        bolum: String(k.bolum || "Genel Kalemler"),
        aciklama: String(k.aciklama),
        adet: Number(k.adet) || 0,
        birimFiyat: Number(k.birimFiyat) || 0,
      }));
  } catch {
    return [];
  }
}

export function maddeleriOku(json: string | null | undefined): SozlesmeMaddesi[] {
  try {
    const v = JSON.parse(json || "[]");
    if (!Array.isArray(v)) return [];
    return v
      .filter((m) => m && (typeof m.baslik === "string" || typeof m.icerik === "string"))
      .map((m) => ({ baslik: String(m.baslik ?? "").slice(0, 200), icerik: String(m.icerik ?? "").slice(0, 10000) }));
  } catch {
    return [];
  }
}

// Teklif kalemlerinden sözleşme kalemi kopyası (iskonto birim fiyata katılır)
export function tekliftenKalemler(
  kalemler: { bolum: string | null; aciklama: string; adet: number; birimFiyat: number; iskontoYuzde: number }[]
): SozlesmeKalemi[] {
  return kalemler.map((k) => ({
    bolum: k.bolum || "Genel Kalemler",
    aciklama: k.aciklama,
    adet: k.adet,
    birimFiyat: k.birimFiyat * (1 - (k.iskontoYuzde || 0) / 100),
  }));
}

// Sözleşme tutarları (sözleşme para biriminde, kuruşa yuvarlanmış).
// Birim fiyat önce çevrilip yuvarlanır, satır tutarı ondan hesaplanır:
// sözleşmedeki "adet × birim fiyat = tutar" her satırda birebir tutar.
export function sozlesmeHesap(s: { kalemler: SozlesmeKalemi[]; kur: number; kdvOrani: number; kdvDahil: boolean }) {
  const kur = s.kur > 0 ? s.kur : 1;
  const satirlar = s.kalemler.map((k) => {
    const birim = yuvarla(k.birimFiyat * kur);
    return { ...k, birim, tutar: yuvarla(k.adet * birim) };
  });
  const girilen = yuvarla(satirlar.reduce((a, k) => a + k.tutar, 0));
  let araToplam: number, kdv: number, genelToplam: number;
  if (s.kdvDahil) {
    genelToplam = girilen;
    araToplam = yuvarla(girilen / (1 + s.kdvOrani / 100));
    kdv = yuvarla(genelToplam - araToplam);
  } else {
    araToplam = girilen;
    kdv = yuvarla(araToplam * (s.kdvOrani / 100));
    genelToplam = yuvarla(araToplam + kdv);
  }
  // Bölümler (ilk göründükleri sırayla) ve bölüm toplamları
  const bolumler = new Map<string, { satirlar: typeof satirlar; toplam: number }>();
  for (const k of satirlar) {
    if (!bolumler.has(k.bolum)) bolumler.set(k.bolum, { satirlar: [], toplam: 0 });
    const b = bolumler.get(k.bolum)!;
    b.satirlar.push(k);
    b.toplam = yuvarla(b.toplam + k.tutar);
  }
  return { satirlar, bolumler: Array.from(bolumler, ([ad, v]) => ({ ad, ...v })), araToplam, kdv, genelToplam };
}

// --- Tutarı yazıyla yazma: 12.345,67 → "on iki bin üç yüz kırk beş Türk Lirası altmış yedi Kuruş"
const BIRLER = ["", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"];
const ONLAR = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"];
const BUYUK = ["", "bin", "milyon", "milyar", "trilyon"];

function ucBasamak(n: number): string[] {
  const y = Math.floor(n / 100), o = Math.floor((n % 100) / 10), b = n % 10;
  const s: string[] = [];
  if (y) s.push(y === 1 ? "yüz" : `${BIRLER[y]} yüz`);
  if (o) s.push(ONLAR[o]);
  if (b) s.push(BIRLER[b]);
  return s;
}

export function sayiyiYaziyla(n: number): string {
  n = Math.floor(Math.abs(n));
  if (n === 0) return "sıfır";
  const gruplar: number[] = [];
  while (n > 0) {
    gruplar.push(n % 1000);
    n = Math.floor(n / 1000);
  }
  const parcalar: string[] = [];
  for (let i = gruplar.length - 1; i >= 0; i--) {
    const g = gruplar[i];
    if (!g) continue;
    // "bin" için "bir bin" denmez
    if (i === 1 && g === 1) parcalar.push("bin");
    else parcalar.push([...ucBasamak(g), BUYUK[i]].filter(Boolean).join(" "));
  }
  return parcalar.join(" ");
}

export function tutariYaziyla(tutar: number, pb: string): string {
  const kurus = Math.round(Math.abs(tutar) * 100);
  const tam = Math.floor(kurus / 100), kesir = kurus % 100;
  const [ana, alt] = pb === "EUR" ? ["Euro", "Sent"] : pb === "USD" ? ["ABD Doları", "Sent"] : ["Türk Lirası", "Kuruş"];
  return `${sayiyiYaziyla(tam)} ${ana}${kesir ? ` ${sayiyiYaziyla(kesir)} ${alt}` : ""}`;
}

// Sözleşme / teklif numarası
export function sozlesmeNo(teklifNo: number, tarih: Date) {
  return `SZL-${new Date(tarih).getFullYear()}-${String(teklifNo).padStart(5, "0")}`;
}

// Döviz / kur / geçerlilik ile ilgili teklif notları sözleşmede çoğu zaman
// gereksizdir (sözleşme bedeli zaten çevrilmiş olarak yazılır). Oluşturma
// ekranında bu notların kutusu varsayılan olarak işaretsiz gelir.
export function sozlesmedeGereksizMi(metin: string, pbFarkli: boolean) {
  const m = metin.toLocaleLowerCase("tr-TR");
  if (/geçerli(dir|lik)?\b|opsiyon/.test(m) && /gün|süre/.test(m)) return true;
  if (pbFarkli && /(çevril|döviz|kur(u|un|undan)?\b|efektif|olarak verilmiştir|usd|eur|euro|dolar)/.test(m)) return true;
  return false;
}

// Teklif notlarından sonra eklenen standart maddeler (taslak; düzenlenebilir)
export const STANDART_MADDELER: SozlesmeMaddesi[] = [
  {
    baslik: "Tarafların Yükümlülükleri",
    icerik:
      "Yüklenici, sözleşme konusu ürünleri teknik şartnamesine ve ilgili standartlara uygun olarak temin ve montaj etmekle yükümlüdür.\n" +
      "İşveren; montaj alanının çalışmaya hazır hâlde teslim edilmesini, gerekli elektrik ve su bağlantılarının sağlanmasını ve sözleşme bedelinin ödeme koşullarına uygun olarak ödenmesini taahhüt eder.",
  },
  {
    baslik: "Kabul ve Teslim",
    icerik:
      "Montaj ve devreye alma işlemlerinin tamamlanmasının ardından taraflarca teslim tutanağı düzenlenir. İşveren, teslimden itibaren 7 gün içinde yazılı olarak bildirmediği eksiklikler dışında işi kabul etmiş sayılır.",
  },
  {
    baslik: "İlave İşler",
    icerik:
      "Sözleşme kapsamı dışında kalan ve İşveren tarafından talep edilen ilave iş ve malzemeler, taraflarca yazılı olarak mutabık kalınacak bedel üzerinden ayrıca faturalandırılır.",
  },
  {
    baslik: "Mücbir Sebepler",
    icerik:
      "Doğal afet, salgın, savaş, resmî makamların kararları, üretici kaynaklı tedarik gecikmeleri gibi tarafların kontrolü dışında gelişen durumlarda süreler, mücbir sebebin etkisi süresince uzamış sayılır.",
  },
  {
    baslik: "Uyuşmazlıkların Çözümü",
    icerik: "İşbu sözleşmeden doğabilecek uyuşmazlıkların çözümünde İstanbul (Anadolu) Mahkemeleri ve İcra Daireleri yetkilidir.",
  },
  {
    baslik: "Yürürlük",
    icerik:
      "İşbu sözleşme iki (2) nüsha olarak düzenlenmiş olup her sayfası taraflarca paraflanır. Sözleşme, imza tarihinde yürürlüğe girer.",
  },
];
