// -----------------------------------------------------------------------------
// KULLANICI ROLLERİ
// ADMIN      Admin: her şey (onaylar, iptaller, kullanıcılar, dönem açma)
// SATIS      Satış: görüşme, proje, keşif, teklif, müşteri, sipariş, hesaplar; maliyet / alış görmez
// SATINALMA  Satınalma: tedarikçi teklifleri, satınalma siparişleri, mal kabul, stok, fiyat listeleri
// MUHASEBE   Muhasebe: cari, tahsilat / ödeme, faturalar, raporlar, ay kapanışı
// Ayrıntılı tablo: aşağıdaki ROL_BOLUMLERI.
// YATIRIMCI  Yönetici (izleme): her şeyi görür, hiçbir kaydı değiştiremez (veritabanındaki adı YATIRIMCI)
// -----------------------------------------------------------------------------
export const ROLLER = ["ADMIN", "SATIS", "SATINALMA", "MUHASEBE", "YATIRIMCI"] as const;
export type Rol = (typeof ROLLER)[number];

export const ROL_ETIKET: Record<string, string> = {
  ADMIN: "Admin",
  SATIS: "Satış",
  SATINALMA: "Satınalma",
  MUHASEBE: "Muhasebe",
  YATIRIMCI: "Yönetici (izleme)",
};

export const gecerliRol = (v: unknown): Rol => (ROLLER as readonly string[]).includes(String(v)) ? (String(v) as Rol) : "SATIS";

// Yalnız görüntüleyebilen rol
export const saltOkunurMu = (rol: string | null | undefined) => rol === "YATIRIMCI";

// Finansal kayıt iptali ve ay kapanışı: admin ya da muhasebe
export const finansYetkilisiMi = (rol: string | null | undefined) => rol === "ADMIN" || rol === "MUHASEBE";

// -----------------------------------------------------------------------------
// BÖLÜM YETKİLERİ — kim neyi görür (gor), kim neyi değiştirir (yaz)
// Sayfalar (sayfaYetkisi), sol menü, sunucu işlemleri (islemZorunlu) ve indirme
// adresleri bu tabloya bakar. Admin her şeyi yapar; "Yönetici (izleme)" yönetim
// sayfaları dışında her şeyi görür, hiçbir şeyi değiştiremez.
// -----------------------------------------------------------------------------
export type Bolum =
  | "ozet" // Özet sayfası
  | "genel" // notlar, profil
  | "crm" // web talepleri, görüşmeler, projeler, proje takip, keşif
  | "teklif" // satış teklifleri, sözleşmeler
  | "musteri" // müşteriler
  | "siparis" // satış siparişleri, sevkiyat, teslim
  | "satinalma" // tedarikçi teklifleri, satınalma siparişleri, mal kabul
  | "tedarikci" // tedarikçi kartları ve tedarikçi cari sayfası
  | "stok" // stok & maliyet
  | "urun" // ürün kataloğu, markalar (liste fiyatı; maliyet yok)
  | "fiyat" // fiyat listeleri
  | "hesap" // mühendislik hesapları
  | "finans" // cari, tahsilat, ödeme, faturalar, raporlar, ay kapanışı
  | "yonetim"; // kullanıcılar, işlem geçmişi, ayarlar

type Erisim = "gor" | "yaz";

// Kullanıcılar sayfasındaki yetki tablosu için
export const BOLUM_ETIKET: [Bolum, string][] = [
  ["crm", "Web talepleri, görüşmeler, projeler, keşif"],
  ["teklif", "Teklifler"],
  ["musteri", "Müşteriler"],
  ["siparis", "Siparişler, sevkiyat, teslim"],
  ["hesap", "Mühendislik hesapları"],
  ["fiyat", "Fiyat listeleri"],
  ["urun", "Ürün kataloğu"],
  ["satinalma", "Satınalma (tedarikçi teklifi, sipariş, mal kabul, maliyet)"],
  ["tedarikci", "Tedarikçi cari"],
  ["stok", "Stok & maliyet"],
  ["finans", "Cari, tahsilat / ödeme, fatura, rapor, ay kapanışı"],
  ["yonetim", "Kullanıcılar, işlem geçmişi, ayarlar"],
];

const ROL_BOLUMLERI: Record<"SATIS" | "SATINALMA" | "MUHASEBE", Partial<Record<Bolum, Erisim>>> = {
  SATIS: { crm: "yaz", teklif: "yaz", musteri: "yaz", siparis: "yaz", hesap: "yaz", urun: "gor", fiyat: "gor" },
  // Satınalma, tedarikçi teklifinden satış teklifi de hazırlar (teklif: yaz)
  SATINALMA: { satinalma: "yaz", tedarikci: "yaz", stok: "yaz", urun: "yaz", fiyat: "yaz", teklif: "yaz", siparis: "gor" },
  MUHASEBE: { finans: "yaz", tedarikci: "yaz", musteri: "yaz", siparis: "gor", satinalma: "gor", teklif: "gor", stok: "gor", urun: "gor" },
};

function erisim(rol: string | null | undefined, bolum: Bolum): Erisim | null {
  if (bolum === "ozet" || bolum === "genel") return saltOkunurMu(rol) ? "gor" : "yaz";
  if (rol === "ADMIN") return "yaz";
  if (rol === "YATIRIMCI") return bolum === "yonetim" ? null : "gor";
  const tablo = ROL_BOLUMLERI[rol as keyof typeof ROL_BOLUMLERI];
  return tablo?.[bolum] ?? null;
}

export const gorebilir = (rol: string | null | undefined, bolum: Bolum) => erisim(rol, bolum) !== null;
export const yazabilir = (rol: string | null | undefined, bolum: Bolum) => erisim(rol, bolum) === "yaz";

// Satınalma maliyetleri, alış fiyatları, kâr: satış personeli görmez
export const maliyetGorur = (rol: string | null | undefined) => rol === "ADMIN" || rol === "SATINALMA" || rol === "MUHASEBE" || rol === "YATIRIMCI";

// Panel adresinin bölümü (uzun önekler önce). Tanınmayan adres: yalnız admin.
const YOL_BOLUMLERI: [string, Bolum][] = [
  ["/panel/siparisler/raporlar", "finans"],
  ["/panel/satinalma/cari", "tedarikci"],
  ["/panel/satinalma", "satinalma"],
  ["/panel/siparisler", "siparis"],
  ["/panel/talepler", "crm"],
  ["/panel/ziyaretler", "crm"],
  ["/panel/projeler", "crm"],
  ["/panel/proje-takip", "crm"],
  ["/panel/kesif", "crm"],
  ["/panel/teklifler", "teklif"],
  ["/panel/musteriler", "musteri"],
  ["/panel/fiyat-listeleri", "fiyat"],
  ["/panel/isi-hesabi", "hesap"],
  ["/panel/klima-hesabi", "hesap"],
  ["/panel/havalandirma-hesabi", "hesap"],
  ["/panel/stok", "stok"],
  ["/panel/ayarlar/urunler", "urun"],
  ["/panel/ayarlar/markalar", "urun"],
  ["/panel/genel-cari", "finans"],
  ["/panel/cari", "finans"],
  ["/panel/rapor", "finans"],
  ["/panel/notlar", "genel"],
  ["/panel/profil", "genel"],
];
export function yolBolumu(yol: string): Bolum {
  const y = yol.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  if (y === "/panel") return "ozet";
  for (const [onek, bolum] of YOL_BOLUMLERI) if (y === onek || y.startsWith(onek + "/")) return bolum;
  return "yonetim";
}

// Sunucu işlemlerinin (lib/actions.ts, lib/satinalma-siparis-actions.ts) bölümü.
// Listede olmayan işlem: yalnız admin yapabilir.
export const ISLEM_BOLUMU: Record<string, Bolum> = {
  // crm
  webTalebiDonustur: "crm", webTalebiOkunduIsaretle: "crm", webTalebiSil: "crm",
  ziyaretEkle: "crm", ziyaretHatirlatmaTamamlandi: "crm", ziyaretSil: "crm",
  projeEkle: "crm", projeGuncelle: "crm", projeSil: "crm", projeTakipNotuGuncelle: "crm",
  kesifEkle: "crm", kesifSil: "crm", kesifiTeklifeDonustur: "crm", tekliflerExcelImport: "crm",
  // teklif
  teklifEkle: "teklif", teklifGuncelle: "teklif", teklifSil: "teklif", teklifReddet: "teklif",
  teklifDurumGuncelle: "teklif", teklifArsivle: "teklif", teklifArsivdenCikar: "teklif",
  teklifMusteriyeBagla: "teklif", teklifMusteriyeEpostaGonder: "teklif", teklifPaylasimOlustur: "teklif",
  teklifPaylasimIptal: "teklif", teklifTakipNotuGuncelle: "teklif",
  sablonHizliEkle: "teklif", sablonIcerikGuncelle: "teklif",
  sozlesmeOlustur: "teklif", sozlesmeKaydet: "teklif", sozlesmeKalemleriYenile: "teklif", sozlesmeSil: "teklif",
  // müşteri
  musteriEkle: "musteri", musteriGuncelle: "musteri", musteriSil: "musteri", hizliMusteriEkle: "musteri",
  musteriYetkiliEkle: "musteri", musteriYetkiliGuncelle: "musteri", musteriYetkiliSil: "musteri",
  // sipariş
  siparisOlustur: "siparis", siparisTalebiOlustur: "siparis", siparisOnayla: "siparis", siparisReddet: "siparis",
  siparisIptal: "siparis", siparisSil: "siparis", siparisDurumGuncelle: "siparis",
  sevkiyatEkle: "siparis", sevkiyatSil: "siparis", teslimKaydiEkle: "siparis", teslimKaydiSil: "siparis",
  // satınalma
  satinalmaTeklifiEkle: "satinalma", satinalmaTeklifiGuncelle: "satinalma", satinalmaTeklifiSil: "satinalma",
  satinalmaTeklifiniDonustur: "satinalma", maliyetDosyaYukle: "satinalma",
  satinalmaSiparisiOlustur: "satinalma", satinalmaSiparisiOnayla: "satinalma", satinalmaSiparisiReddet: "satinalma",
  satinalmaSiparisiIptal: "satinalma", satinalmaSiparisiBagla: "satinalma", satinalmaSiparisiKurGuncelle: "satinalma", satinalmaSiparisiSevkAdresiKaydet: "satinalma", satinalmaOnayEsigiKaydet: "satinalma",
  satinalmaSiparisiEpostaGonder: "satinalma", satinalmaSiparisiWhatsappLinki: "satinalma", satinalmaSiparisiWhatsappKaydet: "satinalma",
  malKabulEkle: "satinalma", malKabulIptal: "satinalma",
  tedarikciEkle: "tedarikci", tedarikciGuncelle: "tedarikci",
  // stok, ürün kataloğu
  stokGirisiEkle: "stok", urunStokVeMaliyetGuncelle: "stok",
  urunEkle: "urun", urunSil: "urun", urunlerExcelIceAktar: "urun", urunlerTumunuSil: "urun", urunGorselAyarla: "urun",
  markaEkle: "urun", markaSil: "urun",
  // fiyat listeleri
  fiyatListesiOlustur: "fiyat", fiyatListesiKaydet: "fiyat", fiyatListesiKopyala: "fiyat", fiyatListesiSecimdenKopyala: "fiyat",
  fiyatListesiSil: "fiyat", fiyatListesiAyarKaydet: "fiyat", kayaFiyatListesiGuncelle: "fiyat",
  hazirListeEkle: "fiyat", hazirListeTamamla: "fiyat", hazirListeFiyatGeriYukle: "fiyat",
  // finans
  cariHareketEkle: "finans", cariHareketIptal: "finans", cariHareketSil: "finans",
  tedarikciHareketEkle: "finans", tedarikciHareketIptal: "finans", tedarikciHareketSil: "finans",
  siparisFaturaGuncelle: "finans", alisFaturasiEkle: "finans",
  // genel
  profilGuncelle: "genel",
  // yönetim (yalnız admin): kullaniciEkle, kullaniciSil, kullaniciRolGuncelle, kullaniciSifreSifirla,
  // sirketAyarlariGuncelle, epostaTestiGonder, sablonEkle, sablonGuncelle, sablonSil
};
export const islemBolumu = (islem: string): Bolum => ISLEM_BOLUMU[islem] ?? "yonetim";
