// -----------------------------------------------------------------------------
// İKLİMOFİSİ TOPTAN FİYAT LİSTESİ — ortak tipler ve hesaplar (sunucu + tarayıcı)
//
// Netsa'nın aylık Sakura, Bosch ve Carrier PDF listeleri panelden yüklenir; üç marka
// TEK listede tutulur. PDF'teki nakit ve kredi kartı fiyatları bizim ALIŞ fiyatımızdır:
// yalnız panelde görünür, müşteriye giden PDF'e girmez. Satış fiyatı = alış + marka
// başına kâr yüzdesi (seçilen adıma yuvarlanır).
//
// Alış fiyatları ve marka notları FiyatListesi.kaynakDurum içinde (JSON) saklanır;
// FiyatListesiKalem satırlarında yalnız satış fiyatları bulunur. Böylece veritabanında
// yeni sütun gerekmez ve alış fiyatı PDF'e hiçbir yoldan sızamaz.
// -----------------------------------------------------------------------------
import type { NetsaNot, NetsaUrun } from "@/lib/netsa-ayikla";
import { yuvarlamaGecerli } from "@/lib/fiyat-listesi";

export const TOPTAN_KAYNAK = "TOPTAN";
export const TOPTAN_BASLIK = "İklimOfisi Toptan Fiyat Listesi";
export const TOPTAN_MARKALAR = ["Sakura", "Bosch", "Carrier"] as const;
export const TOPTAN_VARSAYILAN_YUVARLAMA = 10;

export type ToptanMarka = {
  marka: string;
  tarih: string; // Netsa listesinin tarihi (gg.aa.yyyy)
  dosya: string; // yüklenen PDF'in adı
  yuklenme: string; // ISO
  urunler: NetsaUrun[];
  notlar: NetsaNot[];
};

export type ToptanDegisiklik = {
  tur: "DEGISEN" | "YENI" | "CIKAN";
  marka: string;
  bolum: string;
  kod: string;
  ad: string;
  eski: number | null; // eski alış (nakit)
  eski2: number | null; // eski alış (kredi kartı)
  yeni: number | null;
  yeni2: number | null;
};

export type ToptanDurum = {
  markalar: ToptanMarka[];
  kar: Record<string, number>; // marka → kâr %
  yuvarlama: number; // satış fiyatlarının yuvarlandığı adım (0 = tam liraya)
  sonGuncelleme: string | null; // ISO — PDF'lerden en son güncellendiği an
  degisiklikler: ToptanDegisiklik[]; // en son PDF yüklemesindeki değişiklikler (alış fiyatına göre)
  degisiklikTarihi: string | null;
};

export const bosToptanDurum = (): ToptanDurum => ({
  markalar: [],
  kar: {},
  yuvarlama: TOPTAN_VARSAYILAN_YUVARLAMA,
  sonGuncelleme: null,
  degisiklikler: [],
  degisiklikTarihi: null,
});

const sayi = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const metin = (v: unknown, sinir: number) => (typeof v === "string" ? v.slice(0, sinir) : "");

// Bilinen markanın yazımını düzeltir ("BOSCH" → "Bosch"); bilinmeyen marka kabul edilmez
export function toptanMarkaAdi(v: unknown): string | null {
  const t = typeof v === "string" ? v.trim().toLocaleLowerCase("tr-TR") : "";
  return TOPTAN_MARKALAR.find((m) => m.toLocaleLowerCase("tr-TR") === t) ?? null;
}

// Tarayıcıdan / veritabanından gelen ürün listesini güvenle okur
export function netsaUrunleriOku(v: unknown, marka: string): NetsaUrun[] {
  if (!Array.isArray(v)) return [];
  const sonuc: NetsaUrun[] = [];
  for (const u of v.slice(0, 1000)) {
    if (!u || typeof u !== "object") continue;
    const o = u as Record<string, unknown>;
    const alis = sayi(o.alis);
    const alis2 = sayi(o.alis2);
    const ad = metin(o.ad, 200).trim();
    if (!ad || alis === null || alis <= 0 || alis2 === null || alis2 <= 0) continue;
    sonuc.push({
      marka,
      bolum: metin(o.bolum, 160).trim(),
      kod: metin(o.kod, 120).trim(),
      ad,
      aciklama: metin(o.aciklama, 400).trim(),
      alis: Math.round(alis * 100) / 100,
      alis2: Math.round(alis2 * 100) / 100,
    });
  }
  return sonuc;
}

export function netsaNotlariOku(v: unknown): NetsaNot[] {
  if (!Array.isArray(v)) return [];
  return v
    .slice(0, 200)
    .filter((n) => n && typeof n === "object" && typeof (n as NetsaNot).metin === "string")
    .map((n) => ({
      metin: metin((n as NetsaNot).metin, 2000).replace(/[\r\n]+/g, " ").trim(),
      etiketler: Array.isArray((n as NetsaNot).etiketler)
        ? (n as NetsaNot).etiketler.filter((e) => typeof e === "string").map((e) => e.replace(/[[\];+\r\n]/g, " ").trim().slice(0, 200)).filter(Boolean)
        : [],
    }))
    .filter((n) => n.metin);
}

export function toptanDurumOku(json: string | null | undefined): ToptanDurum {
  const d = bosToptanDurum();
  let v: Record<string, unknown>;
  try {
    const p = JSON.parse(json || "{}");
    if (!p || typeof p !== "object") return d;
    v = p as Record<string, unknown>;
  } catch {
    return d;
  }
  if (Array.isArray(v.markalar))
    for (const m of v.markalar as Record<string, unknown>[]) {
      const marka = toptanMarkaAdi(m?.marka);
      if (!marka || d.markalar.some((x) => x.marka === marka)) continue;
      d.markalar.push({
        marka,
        tarih: metin(m.tarih, 20),
        dosya: metin(m.dosya, 200),
        yuklenme: metin(m.yuklenme, 40),
        urunler: netsaUrunleriOku(m.urunler, marka),
        notlar: netsaNotlariOku(m.notlar),
      });
    }
  d.markalar = markaSirala(d.markalar);
  if (v.kar && typeof v.kar === "object")
    for (const [m, k] of Object.entries(v.kar as Record<string, unknown>)) {
      const marka = toptanMarkaAdi(m);
      const n = karOku(k);
      if (marka && n !== null) d.kar[marka] = n;
    }
  if (v.yuvarlama !== undefined) d.yuvarlama = yuvarlamaGecerli(v.yuvarlama);
  d.sonGuncelleme = metin(v.sonGuncelleme, 40) || null;
  d.degisiklikTarihi = metin(v.degisiklikTarihi, 40) || null;
  d.degisiklikler = Array.isArray(v.degisiklikler) ? (v.degisiklikler as ToptanDegisiklik[]).filter((x) => x && typeof x.ad === "string").slice(0, 2000) : [];
  return d;
}

// Kâr yüzdesi: "15", "%15", "12,5" → 0–500 arası; boş / geçersiz → null
export function karOku(v: unknown): number | null {
  const t = String(v ?? "").trim().replace("%", "").replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 && n <= 500 ? Math.round(n * 100) / 100 : null;
}

export const markaSirala = <T extends { marka: string }>(l: T[]) =>
  [...l].sort((a, b) => TOPTAN_MARKALAR.indexOf(a.marka as never) - TOPTAN_MARKALAR.indexOf(b.marka as never));

// Satış fiyatı = alış + kâr %; seçilen adımın en yakın katına (yoksa tam liraya) yuvarlanır
export function toptanSatis(alis: number, kar: number, yuvarlama: number) {
  const n = alis * (1 + (kar || 0) / 100);
  const a = yuvarlamaGecerli(yuvarlama);
  return a > 0 ? Math.max(a, Math.round(n / a) * a) : Math.round(n);
}

// Ürünün kimliği: marka + model kodu (kodu olmayan aksesuarlarda ürün adı).
// Aynı kimlik iki kez geçerse sıra numarası eklenir (her iki tarafta aynı sırayla sayılır).
const sade = (m: string) =>
  m
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/\s+/g, " ")
    .trim();
export const toptanAnahtar = (u: { marka: string | null; kod: string | null; ad: string }) => sade(`${u.marka ?? ""}|${u.kod || ""}|${u.kod ? "" : u.ad}`);
export function anahtarla<T extends { marka: string | null; kod: string | null; ad: string }>(liste: T[]) {
  const say = new Map<string, number>();
  return liste.map((x) => {
    const a = toptanAnahtar(x);
    const n = (say.get(a) ?? 0) + 1;
    say.set(a, n);
    return { anahtar: n > 1 ? `${a}#${n}` : a, deger: x };
  });
}

// Eski ve yeni ürünler arasındaki alış fiyatı değişiklikleri
export function toptanDegisiklikler(eski: NetsaUrun[], yeni: NetsaUrun[]): ToptanDegisiklik[] {
  const e = new Map(anahtarla(eski).map((x) => [x.anahtar, x.deger]));
  const y = new Map(anahtarla(yeni).map((x) => [x.anahtar, x.deger]));
  const d: ToptanDegisiklik[] = [];
  const kayit = (tur: ToptanDegisiklik["tur"], u: NetsaUrun, o: NetsaUrun | null, n: NetsaUrun | null): ToptanDegisiklik => ({
    tur,
    marka: u.marka,
    bolum: u.bolum,
    kod: u.kod,
    ad: u.ad,
    eski: o?.alis ?? null,
    eski2: o?.alis2 ?? null,
    yeni: n?.alis ?? null,
    yeni2: n?.alis2 ?? null,
  });
  for (const [a, n] of y) {
    const o = e.get(a);
    if (!o) d.push(kayit("YENI", n, null, n));
    else if (o.alis !== n.alis || o.alis2 !== n.alis2) d.push(kayit("DEGISEN", n, o, n));
  }
  for (const [a, o] of e) if (!y.has(a)) d.push(kayit("CIKAN", o, o, null));
  return d;
}

// Listenin satırları (satış fiyatlarıyla). Alış fiyatı satıra yazılmaz.
export type ToptanKalem = { bolum: string; ad: string; kod: string | null; marka: string; aciklama: string | null; fiyat: number; fiyat2: number };
export function toptanKalemleri(d: ToptanDurum): ToptanKalem[] {
  return markaSirala(d.markalar).flatMap((m) =>
    m.urunler.map((u) => ({
      bolum: u.bolum.slice(0, 120),
      ad: u.ad.slice(0, 300),
      kod: u.kod || null,
      marka: m.marka,
      aciklama: u.aciklama || null,
      fiyat: toptanSatis(u.alis, d.kar[m.marka] ?? 0, d.yuvarlama),
      fiyat2: toptanSatis(u.alis2, d.kar[m.marka] ?? 0, d.yuvarlama),
    }))
  );
}

// Ürün grubu notları: her ürün grubunun (ör. "Sakura Duvar Tipi Split Klima" — bölüm adının
// " · " öncesi) koşulları ayrı tutulur ve PDF'te o grubun ürünlerinin hemen altında çıkar.
// Grubun içindeki alt gruba ait not (ör. yalnız kaset tipi iç üniteler) etiketli kalır: yalnız o
// alt gruptan ürün PDF'e girerse çıkar (lib/fiyat-listesi.ts → notlariSuz). Markanın tüm
// sayfalarında geçen not her grubun altında tekrar eder (o grubun da koşuludur).
export const urunGrubu = (bolum: string) => bolum.split(" · ")[0].trim();
// Netsa PDF'indeki gibi: bir alt bölüme ait not (ör. "İç ünitelerin içerisinden kablosuz kumanda
// çıkmaktadır") o bölümün hemen altına (bolum: true, grup = bölüm adı), sayfanın notları ürün
// grubunun son bölümünün altına gelir.
export type ToptanGrupNotu = { grup: string; notlar: string; bolum?: boolean };
export function toptanGrupNotlari(d: ToptanDurum): ToptanGrupNotu[] {
  const sonuc: ToptanGrupNotu[] = [];
  for (const m of markaSirala(d.markalar)) {
    const gruplar: string[] = [];
    for (const u of m.urunler) {
      const g = urunGrubu(u.bolum);
      if (g && !gruplar.includes(g)) gruplar.push(g);
    }
    for (const g of gruplar) {
      const satirlar: string[] = [];
      for (const n of m.notlar) {
        if (!n.etiketler.length) {
          satirlar.push(n.metin);
          continue;
        }
        if (n.etiketler.includes(g)) satirlar.push(n.metin);
      }
      if (satirlar.length) sonuc.push({ grup: g, notlar: satirlar.join("\n") });
      // Bu ürün grubunun alt bölümlerine ait notlar (bölüm adı kalemlerdeki gibi 120 karakter)
      const bolumler: string[] = [];
      for (const u of m.urunler) {
        const b = u.bolum.slice(0, 120).trim();
        if (urunGrubu(b) === g && !bolumler.includes(b)) bolumler.push(b);
      }
      for (const b of bolumler) {
        const bn = m.notlar.filter((n) => !n.etiketler.includes(g) && n.etiketler.some((e) => e.slice(0, 120).trim() === b)).map((n) => n.metin);
        if (bn.length) sonuc.push({ grup: b, notlar: bn.join("\n"), bolum: true });
      }
    }
  }
  return sonuc;
}

// Tek not alanına yazılacak hâli (düzenlenebilir kopya için): her not markasıyla başlar ve
// yalnız o markanın (grubunun) ürünü listede kalırsa çıkar
export function toptanNotlari(d: ToptanDurum): string {
  return markaSirala(d.markalar)
    .flatMap((m) => m.notlar.map((n) => `[${(n.etiketler.length ? n.etiketler : [m.marka]).join("; ")}] ${m.marka}: ${n.metin}`))
    .join("\n");
}

// Düzenlenebilir kopyaya giden notlar: kendi notlarımız + (toptan listede) PDF'lerden alınan marka notları
export function listeNotlari(l: { kaynak: string | null; kaynakDurum: string | null; notlar: string | null }): string | null {
  if (l.kaynak !== TOPTAN_KAYNAK) return l.notlar;
  return [l.notlar?.trim(), toptanNotlari(toptanDurumOku(l.kaynakDurum))].filter(Boolean).join("\n") || null;
}
