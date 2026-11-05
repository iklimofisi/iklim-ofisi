// -----------------------------------------------------------------------------
// BARAN ISI FİYAT LİSTESİ AYIKLAMA
// Baran Isı'nın gönderdiği "İnteraktif Fiyat Kataloğu" HTML dosyası (tek dosya; fiyatlar
// ve görseller dosyanın içinde). Her marka bir bölüm (<section class="brand-section">,
// başlığı <h2>), içinde kategoriler (<div class="category">, başlığı <h3>) ve ürünler
// (<div class="product">: ürün adı .pname, nakit .price.cash, kart .price.card).
// Dosya 7 MB'ı geçebildiği için tarayıcıda okunur; sunucuya yalnız okunan ürünler gider.
// Saf fonksiyon: tarayıcıda ve testte aynı çalışır.
// -----------------------------------------------------------------------------
import type { NetsaSonuc, NetsaUrun } from "@/lib/netsa-ayikla";

export type BaranSonuc = { tarih: string; markalar: NetsaSonuc[]; uyarilar: string[] };

const VARLIK: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const coz = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, a) => VARLIK[a.toLowerCase()] ?? m);
const yazi = (s: string) => coz(s.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

// "36.000 ₺" / "1.234,50 ₺" → sayı (Türkçe yazım: nokta binlik, virgül ondalık)
function fiyatOku(ham: string): number | null {
  const t = yazi(ham).replace(/[₺\s]|TL/gi, "");
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(t)) return null;
  const n = Number(t.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Fiyat kutusunun içindeki <b>…</b> (yoksa kutunun yazısı)
function kutuFiyati(urun: string, sinif: "cash" | "card"): number | null {
  const m = urun.match(new RegExp(`<div[^>]*class="[^"]*\\b${sinif}\\b[^"]*"[^>]*>([\\s\\S]*?)</div>`));
  if (!m) return null;
  const b = m[1].match(/<b[^>]*>([\s\S]*?)<\/b>/);
  return fiyatOku(b ? b[1] : m[1].replace(/<span[^>]*>[\s\S]*?<\/span>/g, ""));
}

// Bölüm adı: "Bosch Kombi"; kategori zaten markayla başlıyorsa ("Rush Tek Serp. Boyler") ya da
// marka adı kategoriyle bitiyorsa ("Toprak Havlupan" / "Havlupan") tekrar edilmez
function bolumAdi(marka: string, kategori: string) {
  const k = kategori.trim();
  const kucuk = (s: string) => s.toLocaleLowerCase("tr-TR");
  if (!k || /^ürünler$/i.test(k)) return marka;
  if (kucuk(k).startsWith(kucuk(marka))) return k;
  if (kucuk(marka).endsWith(kucuk(k))) return marka;
  return `${marka} ${k}`;
}

export function baranAyikla(html: string, dosyaAdi = ""): BaranSonuc {
  const uyarilar: string[] = [];
  // Gömülü görseller (data: adresleri) okumayı yavaşlatmasın
  const h = html.replace(/data:[^"')\s]{200,}/g, "");
  const t = dosyaAdi.match(/(\d{1,2})[.\-_](\d{1,2})[.\-_](20\d\d)/);
  const tarih = t ? `${t[1].padStart(2, "0")}.${t[2].padStart(2, "0")}.${t[3]}` : "";

  const markalar: NetsaSonuc[] = [];
  const bolumRe = /<section\b[^>]*class="[^"]*\bbrand-section\b[^"]*"[^>]*>([\s\S]*?)<\/section>/g;
  for (let m = bolumRe.exec(h); m; m = bolumRe.exec(h)) {
    const govde = m[1];
    const h2 = govde.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
    const marka = h2 ? yazi(h2[1]).slice(0, 60) : "";
    if (!marka) {
      uyarilar.push("Adı okunamayan bir marka bölümü atlandı.");
      continue;
    }
    const urunler: NetsaUrun[] = [];
    const markaUyarilari: string[] = [];
    const kategoriler = govde.split(/<div[^>]*class="[^"]*\bcategory\b[^"]*"[^>]*>/).slice(1);
    for (const kat of kategoriler) {
      const h3 = kat.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
      const bolum = bolumAdi(marka, h3 ? yazi(h3[1]) : "").slice(0, 160);
      const parcalar = kat.split(/<div[^>]*class="[^"]*\bproduct\b[^"]*"[^>]*>/).slice(1);
      for (const u of parcalar) {
        const ad = (() => {
          const p = u.match(/<div[^>]*class="[^"]*\bpname\b[^"]*"[^>]*>([\s\S]*?)<\/div>/);
          return p ? yazi(p[1]).slice(0, 200) : "";
        })();
        if (!ad) continue;
        const nakit = kutuFiyati(u, "cash");
        const kart = kutuFiyati(u, "card");
        if (nakit === null || kart === null) {
          markaUyarilari.push(`${ad}: fiyat okunamadı, atlandı.`);
          continue;
        }
        urunler.push({ marka, bolum, kod: "", ad, aciklama: "", alis: nakit, alis2: kart });
      }
    }
    if (!urunler.length) {
      uyarilar.push(`${marka}: ürün bulunamadı.`);
      continue;
    }
    const varOlan = markalar.find((x) => x.marka.toLocaleLowerCase("tr-TR") === marka.toLocaleLowerCase("tr-TR"));
    if (varOlan) {
      varOlan.urunler.push(...urunler);
      varOlan.uyarilar.push(...markaUyarilari);
    } else markalar.push({ marka, tarih, urunler, notlar: [], uyarilar: markaUyarilari });
  }
  if (!markalar.length) uyarilar.push("Dosyada Baran Isı fiyat listesi bulunamadı (marka bölümleri yok). Dosya biçimi değişmiş olabilir.");
  if (!tarih) uyarilar.push("Liste tarihi dosya adından okunamadı (ör. BARAN ISI FİYAT LİSTESİ 26.10.2026).");
  return { tarih, markalar, uyarilar };
}
