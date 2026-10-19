// -----------------------------------------------------------------------------
// ÖLÇÜ BİRİMLERİ (teklif kalemleri)
// Açılır listede ilk ve varsayılan birim "Adet"tir. Kaydedilen değer, teklif
// PDF'inde ve ekranlarda miktarın yanında aynen görünen kısa yazımdır
// (ör. "m²", "m³", "kg"). Listede olmayan eski bir değer (ör. ürün kartında
// "Mt" yazılmışsa) bozulmaz; bilinen karşılığına çevrilir ya da olduğu gibi kalır.
// -----------------------------------------------------------------------------

export const VARSAYILAN_BIRIM = "Adet";

export type BirimGrubu = { grup: string; birimler: { kod: string; ad: string }[] };

export const BIRIM_GRUPLARI: BirimGrubu[] = [
  {
    grup: "Sayı",
    birimler: [
      { kod: "Adet", ad: "Adet" },
      { kod: "Takım", ad: "Takım" },
      { kod: "Set", ad: "Set" },
      { kod: "Çift", ad: "Çift" },
      { kod: "Paket", ad: "Paket" },
      { kod: "Kutu", ad: "Kutu" },
      { kod: "Koli", ad: "Koli" },
      { kod: "Rulo", ad: "Rulo" },
      { kod: "Top", ad: "Top" },
      { kod: "Boy", ad: "Boy (çubuk boru vb.)" },
      { kod: "Tüp", ad: "Tüp" },
      { kod: "Kartuş", ad: "Kartuş" },
      { kod: "Varil", ad: "Varil" },
      { kod: "Palet", ad: "Palet" },
    ],
  },
  {
    grup: "Uzunluk · Alan · Hacim",
    birimler: [
      { kod: "mm", ad: "Milimetre (mm)" },
      { kod: "cm", ad: "Santimetre (cm)" },
      { kod: "m", ad: "Metre (m)" },
      { kod: "mtül", ad: "Metretül (mtül)" },
      { kod: "km", ad: "Kilometre (km)" },
      { kod: "m²", ad: "Metrekare (m²)" },
      { kod: "m³", ad: "Metreküp (m³)" },
    ],
  },
  {
    grup: "Ağırlık · Sıvı",
    birimler: [
      { kod: "gr", ad: "Gram (gr)" },
      { kod: "kg", ad: "Kilogram (kg)" },
      { kod: "ton", ad: "Ton" },
      { kod: "lt", ad: "Litre (lt)" },
    ],
  },
  {
    grup: "Kapasite · Enerji",
    birimler: [
      { kod: "kW", ad: "Kilovat (kW)" },
      { kod: "kWh", ad: "Kilovatsaat (kWh)" },
      { kod: "BTU", ad: "BTU" },
      { kod: "HP", ad: "Beygir (HP)" },
      { kod: "m³/h", ad: "Debi (m³/h)" },
    ],
  },
  {
    grup: "Süre · İşçilik",
    birimler: [
      { kod: "Saat", ad: "Saat" },
      { kod: "Gün", ad: "Gün" },
      { kod: "Hafta", ad: "Hafta" },
      { kod: "Ay", ad: "Ay" },
      { kod: "Yıl", ad: "Yıl" },
      { kod: "Adam/Saat", ad: "Adam/Saat" },
      { kod: "Adam/Gün", ad: "Adam/Gün" },
      { kod: "Sefer", ad: "Sefer" },
      { kod: "Ziyaret", ad: "Ziyaret (bakım vb.)" },
    ],
  },
  {
    grup: "Proje · Hizmet",
    birimler: [
      { kod: "Götürü", ad: "Götürü (toplu iş)" },
      { kod: "Hizmet", ad: "Hizmet" },
      { kod: "Sistem", ad: "Sistem" },
      { kod: "Proje", ad: "Proje" },
      { kod: "Mahal", ad: "Mahal" },
      { kod: "Nokta", ad: "Nokta" },
      { kod: "Kat", ad: "Kat" },
      { kod: "Daire", ad: "Daire" },
      { kod: "Parti", ad: "Parti" },
    ],
  },
];

export const BIRIMLER = BIRIM_GRUPLARI.flatMap((g) => g.birimler);
const KODLAR = new Set(BIRIMLER.map((b) => b.kod));

const sade = (s: string) =>
  s
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[.\s]/g, "");

// Sık yazılan farklı biçimler → listedeki kod
const ESANLAMLAR: Record<string, string> = {
  ad: "Adet", adt: "Adet", adet: "Adet", pcs: "Adet", pc: "Adet", ea: "Adet",
  tk: "Takım", tkm: "Takım", takim: "Takım",
  mt: "m", m: "m", metre: "m", mtr: "m",
  mtul: "mtül", metretul: "mtül", mt1: "mtül",
  m2: "m²", "m²": "m²", metrekare: "m²", mkare: "m²",
  m3: "m³", "m³": "m³", metrekup: "m³", mkup: "m³",
  kg: "kg", kilo: "kg", kilogram: "kg",
  gr: "gr", g: "gr", gram: "gr",
  ton: "ton", lt: "lt", l: "lt", litre: "lt",
  kw: "kW", kwh: "kWh", btu: "BTU", hp: "HP",
  "m3/h": "m³/h", "m³/h": "m³/h", "m3/saat": "m³/h",
  saat: "Saat", sa: "Saat", gun: "Gün", hafta: "Hafta", ay: "Ay", yil: "Yıl",
  goturu: "Götürü", "g/t": "Götürü",
};

// Formdan / Excel'den / ürün kartından gelen birimi listedeki koda çevirir.
// Boşsa "Adet"; tanınmayan bir değer ise (en fazla 20 karakter) olduğu gibi korunur.
export function birimNormal(v: unknown): string {
  const s = String(v ?? "").trim().slice(0, 20);
  if (!s) return VARSAYILAN_BIRIM;
  if (KODLAR.has(s)) return s;
  const e = ESANLAMLAR[sade(s)];
  if (e) return e;
  const buyukKucuk = BIRIMLER.find((b) => sade(b.kod) === sade(s));
  return buyukKucuk ? buyukKucuk.kod : s;
}

// "5" + "m²" → "5 m²" (ekranda ve belgelerde miktar gösterimi)
export function miktarYaz(adet: number, birim: string | null | undefined) {
  const sayi = adet.toLocaleString("tr-TR", { maximumFractionDigits: 3 });
  return `${sayi} ${birim || VARSAYILAN_BIRIM}`;
}
