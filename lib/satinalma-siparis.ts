// -----------------------------------------------------------------------------
// SATINALMA SİPARİŞİ — ortak hesaplar ve etiketler (sunucu ve istemci kullanabilir)
// -----------------------------------------------------------------------------

export const SAS_DURUMLARI = ["ONAY_BEKLIYOR", "ONAYLANDI", "KISMEN_TESLIM", "TESLIM_ALINDI", "REDDEDILDI", "IPTAL"] as const;
export type SasDurum = (typeof SAS_DURUMLARI)[number];

export const SAS_DURUM_ETIKET: Record<string, string> = {
  ONAY_BEKLIYOR: "Onay bekliyor",
  ONAYLANDI: "Onaylandı · teslim bekleniyor",
  KISMEN_TESLIM: "Kısmen teslim alındı",
  TESLIM_ALINDI: "Teslim alındı",
  REDDEDILDI: "Reddedildi",
  IPTAL: "İptal",
};

export const SAS_DURUM_RENK: Record<string, string> = {
  ONAY_BEKLIYOR: "bg-amber-50 text-amber-800 border-amber-200",
  ONAYLANDI: "bg-sky-50 text-sky-800 border-sky-200",
  KISMEN_TESLIM: "bg-indigo-50 text-indigo-800 border-indigo-200",
  TESLIM_ALINDI: "bg-emerald-50 text-emerald-800 border-emerald-200",
  REDDEDILDI: "bg-hat text-metin/60 border-hat",
  IPTAL: "bg-hat text-metin/60 border-hat",
};

// Maliyete sayılan (iptal / red olmayan) siparişler
export const maliyeteSayilirMi = (durum: string) => durum !== "IPTAL" && durum !== "REDDEDILDI";
// Mal kabul yapılabilecek durumlar
export const malKabulAcikMi = (durum: string) => durum === "ONAYLANDI" || durum === "KISMEN_TESLIM";

export const sasNo = (no: number) => `SAS-${String(no).padStart(4, "0")}`;

export const kalemNet = (k: { adet: number; birimFiyat: number; iskontoYuzde: number }) => k.adet * k.birimFiyat * (1 - k.iskontoYuzde / 100);
export const yuvarla2 = (n: number) => Math.round(n * 100) / 100;

// Bir kalemin teslim alınan miktarı (iptal edilen mal kabuller sayılmaz)
export function teslimAlinan(k: { malKabulKalemleri: { miktar: number; malKabul: { iptalTarihi: Date | null } }[] }) {
  return k.malKabulKalemleri.filter((m) => !m.malKabul.iptalTarihi).reduce((a, m) => a + m.miktar, 0);
}

// Teslim durumuna göre sipariş durumu (onaylı siparişler için)
export function teslimDurumu(kalemler: { adet: number; alinan: number }[]): "ONAYLANDI" | "KISMEN_TESLIM" | "TESLIM_ALINDI" {
  const toplamAlinan = kalemler.reduce((a, k) => a + k.alinan, 0);
  if (toplamAlinan <= 1e-9) return "ONAYLANDI";
  return kalemler.every((k) => k.alinan + 1e-9 >= k.adet) ? "TESLIM_ALINDI" : "KISMEN_TESLIM";
}

// Siparişin TL karşılığı (KDV hariç)
export const sasTl = (s: { tutarNet: number; kur: number; paraBirimi: string }) => (s.paraBirimi === "TRY" ? s.tutarNet : s.tutarNet * s.kur);
