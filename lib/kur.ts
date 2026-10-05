// -----------------------------------------------------------------------------
// TCMB DÖVİZ KURLARI (efektif satış)
// Merkez Bankası'nın günlük "today.xml" bülteninden USD ve EUR efektif satış
// kurlarını okur. Sonuç 1 saat önbellekte tutulur. TCMB'ye ulaşılamazsa null
// döner; sayfalar bu durumda kuru elle yazmayı ister (hiçbir şey bozulmaz).
// Not: TCMB bülteni iş günleri ~15.30'da yayımlanır; öncesinde ve hafta
// sonları son yayımlanan bültenin kurları gelir (tarih ekranda gösterilir).
// -----------------------------------------------------------------------------

import { unstable_cache } from "next/cache";

export type TcmbKurlari = { tarih: string; USD: number; EUR: number; GBP?: number };

const KAYNAK = "https://www.tcmb.gov.tr/kurlar/today.xml";

function etiket(blok: string, ad: string): number | null {
  const m = blok.match(new RegExp(`<${ad}>\\s*([0-9.,]+)\\s*</${ad}>`));
  if (!m) return null;
  const n = Number(m[1].replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

// XML'den bir dövizin efektif satış kurunu (1 birim için TL) çıkarır
export function kurAyikla(xml: string, kod: string): number | null {
  const blok = xml.match(new RegExp(`<Currency[^>]*Kod="${kod}"[^>]*>([\\s\\S]*?)</Currency>`))?.[1];
  if (!blok) return null;
  const birim = etiket(blok, "Unit") ?? 1;
  // Efektif satış yoksa döviz satışa düş
  const satis = etiket(blok, "BanknoteSelling") ?? etiket(blok, "ForexSelling");
  return satis ? satis / birim : null;
}

export function tcmbXmlCoz(xml: string): TcmbKurlari | null {
  const usd = kurAyikla(xml, "USD");
  const eur = kurAyikla(xml, "EUR");
  const tarih = xml.match(/<Tarih_Date[^>]*Tarih="([^"]+)"/)?.[1] ?? "";
  if (!usd || !eur) return null;
  const gbp = kurAyikla(xml, "GBP");
  return { tarih, USD: usd, EUR: eur, ...(gbp ? { GBP: gbp } : {}) };
}

const onbellekli = unstable_cache(
  async (): Promise<TcmbKurlari | null> => {
    const yanit = await fetch(KAYNAK, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!yanit.ok) throw new Error(`TCMB ${yanit.status}`);
    const sonuc = tcmbXmlCoz(await yanit.text());
    if (!sonuc) throw new Error("TCMB bülteni okunamadı");
    return sonuc;
  },
  ["tcmb-kurlari"],
  { revalidate: 3600 }
);

// TCMB'ye ulaşılamadıysa 5 dakika boyunca yeniden denenmez (sayfalar beklemesin)
let sonHata = 0;

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
