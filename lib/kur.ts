// -----------------------------------------------------------------------------
// TCMB DÖVİZ KURLARI (efektif satış)
// Merkez Bankası'nın günlük "today.xml" bülteninden USD ve EUR efektif satış
// kurlarını okur. Sonuç 1 saat önbellekte tutulur. TCMB'ye ulaşılamazsa null
// döner; sayfalar bu durumda kuru elle yazmayı ister (hiçbir şey bozulmaz).
// Not: TCMB bülteni iş günleri ~15.30'da yayımlanır; öncesinde ve hafta
// sonları son yayımlanan bültenin kurları gelir (tarih ekranda gösterilir).
// -----------------------------------------------------------------------------

import { unstable_cache } from "next/cache";

export type TcmbKurlari = {
  tarih: string;
  // Efektif satış (nakit döviz; panelde gösterilen)
  USD: number;
  EUR: number;
  GBP?: number;
  // Döviz satış (ForexSelling): faturada ve cari kur dönüşümünde genellikle bu kullanılır
  doviz?: { USD?: number; EUR?: number; GBP?: number };
};

const KAYNAK = "https://www.tcmb.gov.tr/kurlar/today.xml";

function etiket(blok: string, ad: string): number | null {
  const m = blok.match(new RegExp(`<${ad}>\\s*([0-9.,]+)\\s*</${ad}>`));
  if (!m) return null;
  const n = Number(m[1].replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

// XML'den bir dövizin efektif satış kurunu (1 birim için TL) çıkarır.
// tur "doviz": döviz satış (ForexSelling) kuru.
export function kurAyikla(xml: string, kod: string, tur: "efektif" | "doviz" = "efektif"): number | null {
  const blok = xml.match(new RegExp(`<Currency[^>]*Kod="${kod}"[^>]*>([\\s\\S]*?)</Currency>`))?.[1];
  if (!blok) return null;
  const birim = etiket(blok, "Unit") ?? 1;
  // Efektif satış yoksa döviz satışa düş
  const satis = tur === "doviz" ? etiket(blok, "ForexSelling") : etiket(blok, "BanknoteSelling") ?? etiket(blok, "ForexSelling");
  return satis ? satis / birim : null;
}

export function tcmbXmlCoz(xml: string): TcmbKurlari | null {
  const usd = kurAyikla(xml, "USD");
  const eur = kurAyikla(xml, "EUR");
  const tarih = xml.match(/<Tarih_Date[^>]*Tarih="([^"]+)"/)?.[1] ?? "";
  if (!usd || !eur) return null;
  const gbp = kurAyikla(xml, "GBP");
  const doviz: NonNullable<TcmbKurlari["doviz"]> = {};
  for (const kod of ["USD", "EUR", "GBP"] as const) {
    const d = kurAyikla(xml, kod, "doviz");
    if (d) doviz[kod] = d;
  }
  return { tarih, USD: usd, EUR: eur, ...(gbp ? { GBP: gbp } : {}), doviz };
}

// TCMB sitesi zaman zaman yavaş cevap verir: 10 sn beklenir, olmazsa bir kez daha denenir.
// (Önbellek yenilenirken hata olursa sayfalar bir önceki kuru göstermeye devam eder.)
async function tcmbdenOku(): Promise<TcmbKurlari> {
  const yanit = await fetch(KAYNAK, { cache: "no-store", signal: AbortSignal.timeout(10000) });
  if (!yanit.ok) throw new Error(`TCMB ${yanit.status}`);
  const sonuc = tcmbXmlCoz(await yanit.text());
  if (!sonuc) throw new Error("TCMB bülteni okunamadı");
  return sonuc;
}

const onbellekli = unstable_cache(
  async (): Promise<TcmbKurlari | null> => {
    try {
      return await tcmbdenOku();
    } catch {
      return await tcmbdenOku();
    }
  },
  ["tcmb-kurlari-v2"], // v2: döviz satış kurları da var
  { revalidate: 3600 }
);

// TCMB'ye ulaşılamadıysa 5 dakika boyunca yeniden denenmez (sayfalar beklemesin)
let sonHata = 0;

// Cari / fatura kur dönüşümü için kur kaynağı
export const KUR_KAYNAKLARI = ["TCMB_DOVIZ", "TCMB_EFEKTIF", "ELLE"] as const;
export type KurKaynagi = (typeof KUR_KAYNAKLARI)[number];
export const KUR_KAYNAGI_ETIKET: Record<string, string> = {
  TCMB_DOVIZ: "TCMB döviz satış",
  TCMB_EFEKTIF: "TCMB efektif satış",
  ELLE: "Elle girilen kur",
};
export const kurKaynagiOku = (v: unknown): KurKaynagi =>
  (KUR_KAYNAKLARI as readonly string[]).includes(String(v)) ? (String(v) as KurKaynagi) : "TCMB_DOVIZ";

// Kaynağa göre TCMB kuru (1 birim = ? TL). Bulunamazsa null.
export function tcmbKuru(k: TcmbKurlari | null, pb: string, kaynak: KurKaynagi): number | null {
  if (!k || kaynak === "ELLE") return null;
  if (kaynak === "TCMB_DOVIZ") {
    const d = k.doviz?.[pb as "USD" | "EUR" | "GBP"];
    if (d) return d;
  }
  const e = pb === "USD" ? k.USD : pb === "EUR" ? k.EUR : pb === "GBP" ? k.GBP : undefined;
  return e ?? null;
}

export async function getTcmbKurlari(): Promise<TcmbKurlari | null> {
  if (Date.now() - sonHata < 5 * 60 * 1000) return null;
  try {
    return await onbellekli();
  } catch (hata) {
    sonHata = Date.now();
    console.warn("[kur] TCMB kurları alınamadı:", hata instanceof Error ? hata.message : hata);
    return null;
  }
}
