"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { islemZorunlu } from "@/lib/oturum";
import { islemKaydet } from "@/lib/islem-kaydi";
import { paraBirimiDogrula, type ParaBirimi } from "@/lib/para";
import { epostaGonder } from "@/lib/eposta";

// E-posta içine giden kullanıcı metinlerinde HTML kodu çalışmasın
function htmlKacir(m: string) {
  return m.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
import { getSirketAyarlari, SIRKET_ETIKETI } from "@/lib/sirket";
import { teklifPdfOlustur } from "@/lib/pdf-olustur";
import { musteriToplami } from "@/lib/teklif-hesap";
import { sablonGrubu, sablonlariGrupla, notlariUygula, ozelNotlariOku } from "@/lib/sablon";
import { tekliftenKalemler, maddeleriOku, STANDART_MADDELER, PARA_BIRIMLERI } from "@/lib/sozlesme";
import { tutarOku } from "@/lib/toplam-dagit";
import { donusumKalemleri } from "@/lib/satinalma-hesap";
import { randomUUID, randomBytes } from "crypto";
import { gecerliTur } from "@/lib/gorusme";
import { gecerliRedNedeni } from "@/lib/teklif-durum";
import { flKalemleriOku, metinAl, duzenGecerli, iskontoKapsamGecerli, FIYAT_SUTUN_KALIPLARI, iskontoUygula, yuzdeOku, yuvarlamaGecerli, kartFiyati, karOku } from "@/lib/fiyat-listesi";
import { birimNormal } from "@/lib/birimler";
import { listeNotlari } from "@/lib/toptan-fiyat";
import { MUSTERISIZ_ID, musterisizMi, musterisizGoster } from "@/lib/musterisiz";
import { musterisizKaydiHazirla } from "@/lib/musterisiz-sunucu";
import { siparisDondurmaVerisi } from "@/lib/siparis-tutari";
import { siparisKapaliMi, KAPALI_SIPARIS_DURUMLARI } from "@/lib/siparis-durum";
import { PAYLASIM_TABANI } from "@/lib/teklif-paylasim";
import { getTcmbKurlari, tcmbKuru, kurKaynagiOku } from "@/lib/kur";
import { kurOku } from "@/lib/kur-oku";
import { donemKilitliMi, KILIT_MESAJI } from "@/lib/finans";
import { finansYetkilisiMi, gecerliRol, islemBolumu } from "@/lib/roller";
import { odemeYontemiOku, odemeYontemiEtiket } from "@/lib/odeme-yontemi";

// Kayıt güvencesi işlemlerinin sonucu: düğme bu mesajı bildirim olarak gösterir
export type IslemSonucu = { hata?: string; tamam?: string };

// --- Yetki kontrolü + işlem kaydı ---
// Her sunucu işleminin ilk satırında çağrılır: giriş yapılmamışsa işlem yapılmaz
// (giriş sayfasına yönlendirir), yapılmışsa kim, ne zaman, hangi işlemi yaptı kaydedilir.
async function yetki(islem: string, girdi?: FormData | Record<string, unknown>) {
  // Rol yetkisi: işlemin bölümü lib/roller.ts → ISLEM_BOLUMU (listede yoksa yalnız satış müdürü)
  const kullanici = await islemZorunlu(islemBolumu(islem));
  await islemKaydet(kullanici, islem, girdi);
  return kullanici;
}

// --- Yardımcı Sayı Formatlayıcı (Türkçe Virgülü Düzeltir) ---
function parseSayi(val: unknown): number {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "number") return val;
  const clean = val.toString().replace(",", ".").trim();
  return parseFloat(clean) || 0;
}

// --- Müşteriler ---

// Firma sorumlusu: ciro raporları personeli bu alana göre hesaplar (siparişi kim açarsa açsın).
// Sorumluyu yalnız Satış müdürü seçer / değiştirir; diğer kullanıcıların eklediği müşteride sorumlu ekleyen kişidir.
// "" seçilirse sorumlu kaldırılır.
async function sorumluOku(formData: FormData, varsayilan: string | null, rol?: string | null): Promise<string | null> {
  if (rol !== "ADMIN" || !formData.has("sorumluKullaniciId")) return varsayilan;
  const id = String(formData.get("sorumluKullaniciId") ?? "").trim();
  if (!id) return null;
  const k = await prisma.kullanici.findUnique({ where: { id }, select: { id: true } });
  return k ? k.id : varsayilan;
}

export async function musteriEkle(formData: FormData) {
  const ekleyen = await yetki("musteriEkle", formData);
  const sorumluKullaniciId = await sorumluOku(formData, ekleyen?.id ?? null, ekleyen?.rol);
  const ad = String(formData.get("ad") ?? "").trim();
  const yetkiliAdi = String(formData.get("yetkiliAdi") ?? "").trim();
  const yetkiliTelefon = String(formData.get("yetkiliTelefon") ?? "").trim();
  const yetkiliEmail = String(formData.get("yetkiliEmail") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const muhasebeEmail = String(formData.get("muhasebeEmail") ?? "").trim();
  const vergiNo = String(formData.get("vergiNo") ?? "").trim();
  const faturaAdresi = String(formData.get("faturaAdresi") ?? "").trim();
  const sevkAdresi = String(formData.get("sevkAdresi") ?? "").trim();
  if (!ad) return;

  const musteri = await prisma.musteri.create({
    data: {
      ad,
      yetkiliAdi: yetkiliAdi || null,
      yetkiliTelefon: yetkiliTelefon || null,
      yetkiliEmail: yetkiliEmail || null,
      telefon: telefon || null,
      email: email || null,
      muhasebeEmail: muhasebeEmail || null,
      vergiNo: vergiNo || null,
      faturaAdresi: faturaAdresi || null,
      sevkAdresi: sevkAdresi || null,
      sorumluKullaniciId,
    },
  });
  revalidatePath("/panel/musteriler");
  redirect(`/panel/musteriler/${musteri.id}`);
}

export async function musteriGuncelle(formData: FormData) {
  const guncelleyen = await yetki("musteriGuncelle", formData);
  const musteriId = String(formData.get("musteriId") ?? "");
  const mevcutSorumlu = musteriId ? (await prisma.musteri.findUnique({ where: { id: musteriId }, select: { sorumluKullaniciId: true } }))?.sorumluKullaniciId ?? null : null;
  const sorumluKullaniciId = await sorumluOku(formData, mevcutSorumlu, guncelleyen?.rol);
  const ad = String(formData.get("ad") ?? "").trim();
  const yetkiliAdi = String(formData.get("yetkiliAdi") ?? "").trim();
  const yetkiliTelefon = String(formData.get("yetkiliTelefon") ?? "").trim();
  const yetkiliEmail = String(formData.get("yetkiliEmail") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const muhasebeEmail = String(formData.get("muhasebeEmail") ?? "").trim();
  const vergiNo = String(formData.get("vergiNo") ?? "").trim();
  const faturaAdresi = String(formData.get("faturaAdresi") ?? "").trim();
  const sevkAdresi = String(formData.get("sevkAdresi") ?? "").trim();
  if (!musteriId || !ad) return;

  await prisma.musteri.update({
    where: { id: musteriId },
    data: {
      ad,
      yetkiliAdi: yetkiliAdi || null,
      yetkiliTelefon: yetkiliTelefon || null,
      yetkiliEmail: yetkiliEmail || null,
      telefon: telefon || null,
      email: email || null,
      muhasebeEmail: muhasebeEmail || null,
      vergiNo: vergiNo || null,
      faturaAdresi: faturaAdresi || null,
      sevkAdresi: sevkAdresi || null,
      sorumluKullaniciId,
    },
  });
  revalidatePath(`/panel/musteriler/${musteriId}`);
  revalidatePath("/panel/musteriler");
  revalidatePath("/panel");
}

// --- Müşteri Yetkilileri (birden fazla) ---

export async function musteriYetkiliEkle(formData: FormData) {
  await yetki("musteriYetkiliEkle", formData);
  const musteriId = String(formData.get("musteriId") ?? "");
  const ad = String(formData.get("ad") ?? "").trim();
  const unvan = String(formData.get("unvan") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!musteriId || !ad) return;

  await prisma.musteriYetkili.create({
    data: { musteriId, ad, unvan: unvan || null, telefon: telefon || null, email: email || null },
  });
  revalidatePath(`/panel/musteriler/${musteriId}`);
  revalidatePath("/panel/teklifler");
}

export async function musteriYetkiliGuncelle(formData: FormData) {
  await yetki("musteriYetkiliGuncelle", formData);
  const id = String(formData.get("yetkiliId") ?? "");
  const ad = String(formData.get("ad") ?? "").trim();
  const unvan = String(formData.get("unvan") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!id || !ad) return;

  const y = await prisma.musteriYetkili.update({
    where: { id },
    data: { ad, unvan: unvan || null, telefon: telefon || null, email: email || null },
  });
  revalidatePath(`/panel/musteriler/${y.musteriId}`);
  revalidatePath("/panel/teklifler");
}

// Yetkili silinirse ona bağlı tekliflerde yetkili alanı boşalır (teklif silinmez),
// teklif otomatik olarak müşterinin ana yetkilisine döner.
export async function musteriYetkiliSil(id: string) {
  await yetki("musteriYetkiliSil", { id });
  if (!id) return;
  const y = await prisma.musteriYetkili.delete({ where: { id } });
  revalidatePath(`/panel/musteriler/${y.musteriId}`);
  revalidatePath("/panel/teklifler");
}

// --- Teklifler ---

function kalemleriOku(formData: FormData) {
  const bolumler = formData.getAll("kalemBolum") as string[];
  const aciklamalar = formData.getAll("kalemAciklama") as string[];
  const adetler = formData.getAll("kalemAdet") as string[];
  const birimler = formData.getAll("kalemBirim") as string[]; // ölçü birimi (yoksa "Adet")
  const fiyatlar = formData.getAll("kalemFiyat") as string[];
  const iskontolar = formData.getAll("kalemIskonto") as string[];
  const markalar = formData.getAll("kalemMarka") as string[];
  const eskiIdler = formData.getAll("kalemId") as string[]; // Düzenlemede mevcut kalemin ID'si (yeni satırda boş)

  return aciklamalar
    .map((aciklama, i) => ({
      eskiId: eskiIdler[i] || "",
      bolum: bolumler[i] ? bolumler[i].trim() : "Genel Kalemler",
      aciklama: aciklama.trim(),
      adet: parseSayi(adetler[i]),
      birim: birimNormal(birimler[i]),
      birimFiyat: parseSayi(fiyatlar[i]),
      iskontoYuzde: parseSayi(iskontolar[i]),
      markaId: markalar[i] || null,
    }))
    .filter((k) => k.aciklama);
}

// Seçilen yetkili gerçekten bu müşteriye mi ait? Değilse boş (ana yetkili) kabul edilir.
async function yetkiliDogrula(yetkiliId: string, musteriId: string): Promise<string | null> {
  if (!yetkiliId || !musteriId) return null;
  const y = await prisma.musteriYetkili.findUnique({ where: { id: yetkiliId }, select: { musteriId: true } });
  return y && y.musteriId === musteriId ? yetkiliId : null;
}

// Formdan gelen "teklife özel not metinleri"ni okur; yalnızca seçili notlar için saklanır
function ozelNotlarVerisi(formData: FormData, sablonIds: string[]): string | null {
  const ham = ozelNotlariOku(String(formData.get("ozelNotlar") ?? ""));
  const secili = new Set(sablonIds);
  const sonuc: Record<string, string> = {};
  for (const [id, metin] of Object.entries(ham)) {
    if (secili.has(id)) sonuc[id] = metin.slice(0, 10000);
  }
  return Object.keys(sonuc).length ? JSON.stringify(sonuc) : null;
}

// Birim fiyatı gizlenecek bölümler (formdaki "fiyatGizliBolum" işaretleri); yalnız teklifte
// gerçekten bulunan bölümler saklanır. Hiçbiri yoksa null.
function fiyatGizliBolumVerisi(formData: FormData, kalemler: ReturnType<typeof kalemleriOku>): string | null {
  const mevcut = new Set(kalemler.map((k) => k.bolum || "Genel Kalemler"));
  const secili = [...new Set((formData.getAll("fiyatGizliBolum") as string[]).map((x) => String(x).trim()))].filter((b) => b && mevcut.has(b));
  return secili.length ? JSON.stringify(secili.slice(0, 200)) : null;
}

// Kalemi veritabanına yazılacak alanlara indirger (formdaki eskiId alanı yazılmaz)
// "sira": formdaki sırası — kalemler her yerde bu sırayla listelenir
function kalemVerisi(k: ReturnType<typeof kalemleriOku>[number], sira: number) {
  return {
    sira,
    bolum: k.bolum,
    aciklama: k.aciklama,
    adet: k.adet,
    birim: k.birim,
    birimFiyat: k.birimFiyat,
    iskontoYuzde: k.iskontoYuzde,
    markaId: k.markaId,
  };
}

// PROJE DURUMU teklifle birlikte ilerler (yalnız ileri; elle verilen Kaybedildi / İptal'e dokunulmaz):
// projeye teklif bağlanınca Takipte → Teklif Verildi; teklif onaylanınca / sipariş onaylanınca → Kazanıldı.
async function projeDurumunuIlerlet(projeId: string | null | undefined, hedef: "TEKLIF_VERILDI" | "KAZANILDI") {
  if (!projeId) return;
  const once = hedef === "TEKLIF_VERILDI" ? (["TAKIPTE"] as const) : (["TAKIPTE", "TEKLIF_VERILDI"] as const);
  const r = await prisma.proje
    .updateMany({ where: { id: projeId, ihaleDurumu: { in: [...once] } }, data: { ihaleDurumu: hedef } })
    .catch(() => ({ count: 0 }));
  if (r.count) {
    revalidatePath(`/panel/projeler/${projeId}`);
    revalidatePath("/panel/projeler");
    revalidatePath("/panel/proje-takip");
  }
}

// TEKLİF EKLEME (İLK TARİH KAYDEDİLİR) — Kopyalama ekranı da bu fonksiyonu kullanır
export async function teklifEkle(formData: FormData) {
  const kullanici = await yetki("teklifEkle", formData);
  const baslik = String(formData.get("baslik") ?? "").trim();
  const musteriId = String(formData.get("musteriId") ?? "");
  const projeId = String(formData.get("projeId") ?? "");
  const yetkiliIdHam = String(formData.get("yetkiliId") ?? "");
  const kopyaKaynakTeklifId = String(formData.get("kopyaKaynakTeklifId") ?? "");
  // Tedarikçi (satınalma) teklifinden aktarıldıysa bağlantısı saklanır (yalnız panelde görünür)
  const kaynakSatinalmaHam = String(formData.get("kaynakSatinalmaTeklifiId") ?? "").trim();
  // Müşterisiz teklif: müşteri yerine PDF'e yazılacak serbest metin (isteğe bağlı)
  const muhatap = musterisizMi(musteriId) ? String(formData.get("muhatap") ?? "").trim().slice(0, 200) || null : null;
  const paraBirimi = String(formData.get("paraBirimi") ?? "TRY");
  const kdvOrani = parseSayi(formData.get("kdvOrani"));
  const kdvDahil = String(formData.get("kdvDurumu") ?? "haric") === "dahil";
  const gecerlilikGunu = parseSayi(formData.get("gecerlilikGunu")) || 15;
  const birimFiyatGoster = formData.get("birimFiyatGoster") !== "hayir";
  // Not grubunda "— Bu teklifte olmasın —" seçilirse boş değer gelir; atılır
  const sablonIds = [...new Set((formData.getAll("sablonIds") as string[]).filter((x) => typeof x === "string" && x))];
  const kalemler = kalemleriOku(formData);
  // Hata olursa kullanıcı formun bulunduğu sayfaya geri gönderilir (sessizce kaybolmaz)
  const formSayfasi = kopyaKaynakTeklifId ? `/panel/teklifler/${kopyaKaynakTeklifId}/kopyala` : "/panel/teklifler/yeni";

  if (!musteriId || !baslik || kalemler.length === 0) {
    await islemKaydet(kullanici, "teklifKayitHatasi", { hata: "Müşteri, başlık veya kalem eksik", baslik, musteriId, kalemSayisi: kalemler.length });
    redirect(`${formSayfasi}?mesaj=teklif-eksik`);
  }

  const simdi = new Date();
  if (musterisizMi(musteriId)) await musterisizKaydiHazirla();
  const yetkiliId = await yetkiliDogrula(yetkiliIdHam, musteriId);

  // Kopyalanarak oluşturuluyorsa kaynak teklif bilgisi (yalnızca panelde görünür)
  let kopyaKaynak: { id: string; teklifNo: number } | null = null;
  if (kopyaKaynakTeklifId) {
    kopyaKaynak = await prisma.teklif.findUnique({
      where: { id: kopyaKaynakTeklifId },
      select: { id: true, teklifNo: true },
    });
  }

  const kaynakSatinalma = kaynakSatinalmaHam
    ? await prisma.satinalmaTeklifi.findUnique({ where: { id: kaynakSatinalmaHam }, select: { id: true } })
    : null;

  let teklif: { id: string };
  try {
  teklif = await prisma.teklif.create({
    select: { id: true },
    data: {
      baslik,
      musteriId,
      muhatap,
      projeId: projeId || null,
      yetkiliId,
      kopyaKaynakTeklifId: kopyaKaynak?.id ?? null,
      kopyaKaynakTeklifNo: kopyaKaynak?.teklifNo ?? null,
      ...(kaynakSatinalma ? { kaynakSatinalmaTeklifiId: kaynakSatinalma.id } : {}),
      paraBirimi,
      kdvOrani,
      kdvDahil,
      gecerlilikGunu,
      birimFiyatGoster,
      fiyatGizliBolumler: fiyatGizliBolumVerisi(formData, kalemler),
      olusturanKullaniciId: kullanici?.id || null,
      olusturanAdi: kullanici?.ad ?? "",
      tarih: simdi,
      ilkTarih: simdi, // İlk Oluşturulma Tarihi Saklanır
      kalemler: { create: kalemler.map((k, i) => kalemVerisi(k, i)) },
      sablonlar: { connect: sablonIds.map((id) => ({ id })) },
      ozelNotlar: ozelNotlarVerisi(formData, sablonIds),
    },
  });
  } catch (hata) {
    // Kayıt başarısızsa nedeni İşlem Geçmişi'ne yazılır ve kullanıcı uyarılır
    console.error("[teklifEkle] kayıt hatası:", hata);
    await islemKaydet(kullanici, "teklifKayitHatasi", {
      hata: hata instanceof Error ? hata.message.slice(0, 1000) : String(hata),
      baslik,
      musteriId,
      ...(kopyaKaynakTeklifId ? { kopyaKaynakTeklifId } : {}),
    });
    redirect(`${formSayfasi}?mesaj=teklif-kayit-hatasi`);
  }
  await projeDurumunuIlerlet(projeId, "TEKLIF_VERILDI");
  revalidatePath("/panel/teklifler");
  revalidatePath("/panel");
  if (kopyaKaynak) revalidatePath(`/panel/teklifler/${kopyaKaynak.id}`);
  redirect(`/panel/teklifler/${teklif.id}?mesaj=teklif-olusturuldu`);
}

// TEKLİF GÜNCELLEME (SON REVİZYON TARİHİ GÜNCELLENİR, İLK TARİH KORUNUR)
// ÖNEMLİ: Eskiden her güncellemede teklifin TÜM sevkiyat ve teslim kayıtları siliniyordu.
// Artık bu kayıtlar silinmez; güncellenen kaleme taşınır. Sevkiyat/teslim kaydı olan bir
// kalem formdan kaldırılmışsa güncelleme yapılmaz ve kullanıcı uyarılır.
export async function teklifGuncelle(formData: FormData) {
  const kullanici = await yetki("teklifGuncelle", formData);
  const teklifId = String(formData.get("teklifId") ?? "");
  const baslik = String(formData.get("baslik") ?? "").trim();
  const musteriId = String(formData.get("musteriId") ?? "");
  const projeId = String(formData.get("projeId") ?? "");
  const yetkiliIdHam = String(formData.get("yetkiliId") ?? "");
  const muhatap = musterisizMi(musteriId) ? String(formData.get("muhatap") ?? "").trim().slice(0, 200) || null : null;
  const paraBirimi = String(formData.get("paraBirimi") ?? "TRY");
  const kdvOrani = parseSayi(formData.get("kdvOrani"));
  const kdvDahil = String(formData.get("kdvDurumu") ?? "haric") === "dahil";
  const gecerlilikGunu = parseSayi(formData.get("gecerlilikGunu")) || 15;
  const birimFiyatGoster = formData.get("birimFiyatGoster") !== "hayir";
  // Not grubunda "— Bu teklifte olmasın —" seçilirse boş değer gelir; atılır
  const sablonIds = [...new Set((formData.getAll("sablonIds") as string[]).filter((x) => typeof x === "string" && x))];
  const kalemler = kalemleriOku(formData);

  if (!teklifId) return;
  if (!musteriId || !baslik || kalemler.length === 0) {
    await islemKaydet(kullanici, "teklifKayitHatasi", { teklifId, hata: "Müşteri, başlık veya kalem eksik", kalemSayisi: kalemler.length });
    redirect(`/panel/teklifler/${teklifId}/duzenle?mesaj=teklif-eksik`);
  }

  const mevcut = await prisma.teklif.findUnique({
    where: { id: teklifId },
    include: {
      kalemler: { include: { _count: { select: { sevkiyatlar: true, teslimler: true } } }, orderBy: [{ sira: "asc" }, { id: "asc" }] },
      sablonlar: true,
    },
  });
  if (!mevcut) return;

  // Sevkiyat / teslim kaydı bulunan mevcut kalemler
  const mevcutKalemIdleri = new Set(mevcut.kalemler.map((k) => k.id));
  const kayitliKalemIdleri = new Set(
    mevcut.kalemler.filter((k) => k._count.sevkiyatlar + k._count.teslimler > 0).map((k) => k.id)
  );

  // Formdan gelen satırlara yeni ID ver; eski kalemden gelenleri eşleştir
  const kullanilanEskiIdler = new Set<string>();
  const yeniSatirlar = kalemler.map((k, sira) => {
    const eskiId =
      k.eskiId && mevcutKalemIdleri.has(k.eskiId) && !kullanilanEskiIdler.has(k.eskiId) ? k.eskiId : null;
    if (eskiId) kullanilanEskiIdler.add(eskiId);
    return { yeniId: randomUUID(), eskiId, veri: kalemVerisi(k, sira) };
  });

  // Kaydı olan bir kalem formdan kaldırıldıysa dur: veriyi silmeyiz
  const kaldirilanKayitli = [...kayitliKalemIdleri].filter((id) => !kullanilanEskiIdler.has(id));
  if (kaldirilanKayitli.length > 0) {
    redirect(`/panel/teklifler/${teklifId}/duzenle?hata=sevkiyatli-kalem&adet=${kaldirilanKayitli.length}`);
  }

  if (musterisizMi(musteriId)) await musterisizKaydiHazirla();
  const yetkiliId = await yetkiliDogrula(yetkiliIdHam, musteriId);

  const tasinacaklar = yeniSatirlar.filter((s) => s.eskiId && kayitliKalemIdleri.has(s.eskiId));

  try {
  await prisma.$transaction([
    // 1) Önceki hali revizyon geçmişine kaydet
    prisma.teklifRevizyon.create({
      data: {
        teklifId,
        revizyonNo: mevcut.revizyonNo,
        veriJson: JSON.stringify({
          baslik: mevcut.baslik,
          paraBirimi: mevcut.paraBirimi,
          kdvOrani: mevcut.kdvOrani,
          kdvDahil: mevcut.kdvDahil,
          kalemler: mevcut.kalemler.map(({ _count, ...k }) => k),
          notlar: mevcut.sablonlar.map((n) => n.id),
          ozelNotlar: mevcut.ozelNotlar,
        }),
      },
    }),
    // 2) Yeni kalemleri formdaki sırayla oluştur
    prisma.teklifKalem.createMany({
      data: yeniSatirlar.map((s) => ({ id: s.yeniId, teklifId, ...s.veri })),
    }),
    // 3) Sevkiyat ve teslim kayıtlarını eski kalemden yeni kaleme taşı (silinmez)
    ...tasinacaklar.flatMap((s) => [
      prisma.sevkiyatKaydi.updateMany({ where: { teklifKalemId: s.eskiId! }, data: { teklifKalemId: s.yeniId } }),
      prisma.teslimKaydi.updateMany({ where: { teklifKalemId: s.eskiId! }, data: { teklifKalemId: s.yeniId } }),
    ]),
    // 4) Eski kalemleri kaldır (bu noktada hiçbirine bağlı kayıt kalmadı)
    prisma.teklifKalem.deleteMany({ where: { id: { in: [...mevcutKalemIdleri] } } }),
    // 5) Teklif başlık bilgilerini güncelle — ilkTarih'e DOKUNULMAZ
    prisma.teklif.update({
      where: { id: teklifId },
      data: {
        baslik,
        musteriId,
        muhatap,
        projeId: projeId || null,
        yetkiliId,
        paraBirimi,
        kdvOrani,
        kdvDahil,
        gecerlilikGunu,
        birimFiyatGoster,
        fiyatGizliBolumler: fiyatGizliBolumVerisi(formData, kalemler),
        tarih: new Date(), // Son Güncelleme / Revizyon Tarihi Olur
        revizyonNo: mevcut.revizyonNo + 1,
        sablonlar: { set: sablonIds.map((id) => ({ id })) },
        ozelNotlar: ozelNotlarVerisi(formData, sablonIds),
      },
    }),
  ]);
  } catch (hata) {
    // İşlem bütün olarak geri alınır (teklif eski hâliyle kalır); nedeni kaydedilir
    console.error("[teklifGuncelle] kayıt hatası:", hata);
    await islemKaydet(kullanici, "teklifKayitHatasi", {
      teklifId,
      hata: hata instanceof Error ? hata.message.slice(0, 1000) : String(hata),
    });
    redirect(`/panel/teklifler/${teklifId}/duzenle?mesaj=teklif-kayit-hatasi`);
  }

  revalidatePath("/panel/teklifler");
  revalidatePath(`/panel/teklifler/${teklifId}`);
  revalidatePath("/panel");
  revalidatePath("/panel/proje-takip");
  revalidatePath(`/panel/musteriler/${musteriId}`);
  if (mevcut.musteriId !== musteriId) revalidatePath(`/panel/musteriler/${mevcut.musteriId}`);
  if (projeId && projeId !== mevcut.projeId) await projeDurumunuIlerlet(projeId, mevcut.durum === "ONAYLANDI" ? "KAZANILDI" : "TEKLIF_VERILDI");
  redirect(`/panel/teklifler/${teklifId}?mesaj=teklif-guncellendi`);
}

// MÜŞTERİSİZ TEKLİFİ MÜŞTERİYE BAĞLA (müşteri belli olunca; teklif no, kalemler ve revizyonlar aynen kalır)
export async function teklifMusteriyeBagla(formData: FormData) {
  await yetki("teklifMusteriyeBagla", formData);
  const teklifId = String(formData.get("teklifId") ?? "");
  const musteriId = String(formData.get("musteriId") ?? "");
  const yetkiliIdHam = String(formData.get("yetkiliId") ?? "");
  if (!teklifId) return;
  if (!musteriId || musterisizMi(musteriId)) redirect(`/panel/teklifler/${teklifId}?mesaj=musteri-secilmedi`);
  const [teklif, musteri] = await Promise.all([
    prisma.teklif.findUnique({ where: { id: teklifId }, select: { id: true, musteriId: true } }),
    prisma.musteri.findUnique({ where: { id: musteriId }, select: { id: true } }),
  ]);
  if (!teklif) return;
  if (!musteri) redirect(`/panel/teklifler/${teklifId}?mesaj=musteri-secilmedi`);
  const yetkiliId = await yetkiliDogrula(yetkiliIdHam, musteriId);
  // Teklife bağlı görüşme notları da müşteriye taşınır (müşteri kartında görünsün)
  await prisma.$transaction([
    prisma.teklif.update({ where: { id: teklifId }, data: { musteriId, yetkiliId, muhatap: null } }),
    prisma.ziyaret.updateMany({ where: { teklifId, musteriId: teklif.musteriId }, data: { musteriId } }),
  ]);
  revalidatePath("/panel/teklifler");
  revalidatePath(`/panel/teklifler/${teklifId}`);
  revalidatePath(`/panel/musteriler/${musteriId}`);
  revalidatePath("/panel");
  redirect(`/panel/teklifler/${teklifId}?mesaj=teklif-musteriye-baglandi`);
}

// Siparişi süren (iptal / red olmayan) teklifin durumu "Onaylandı"dan başka bir şeye çekilmez
async function teklifSiparisteMi(teklifId: string) {
  const s = await prisma.siparis.findUnique({ where: { teklifId }, select: { durum: true } });
  return !!s && !siparisKapaliMi(s.durum);
}

export async function teklifDurumGuncelle(teklifId: string, durum: "BEKLEMEDE" | "ONAYLANDI" | "REDDEDILDI") {
  await yetki("teklifDurumGuncelle", { teklifId, durum });
  if (durum !== "ONAYLANDI" && (await teklifSiparisteMi(teklifId))) return;
  const t = await prisma.teklif.update({ where: { id: teklifId }, data: { durum }, select: { projeId: true } });
  if (durum === "ONAYLANDI") await projeDurumunuIlerlet(t.projeId, "KAZANILDI");
  revalidatePath("/panel/teklifler");
  revalidatePath(`/panel/teklifler/${teklifId}`);
  revalidatePath("/panel");
}

// Teklifi "Reddedildi" yapar ve nedenini kaydeder (durum seçicide açılan pencereden)
export async function teklifReddet(teklifId: string, bilgi: { neden: string; rakip?: string; aciklama?: string }) {
  await yetki("teklifReddet", { teklifId, ...bilgi });
  const neden = gecerliRedNedeni(bilgi?.neden);
  if (!teklifId || !neden) return;
  if (await teklifSiparisteMi(teklifId)) return;
  await prisma.teklif.update({
    where: { id: teklifId },
    data: {
      durum: "REDDEDILDI",
      redNedeni: neden,
      redRakip: String(bilgi.rakip ?? "").trim().slice(0, 200) || null,
      redAciklama: String(bilgi.aciklama ?? "").trim().slice(0, 2000) || null,
      redTarihi: new Date(),
    },
  });
  revalidatePath("/panel/teklifler");
  revalidatePath(`/panel/teklifler/${teklifId}`);
  revalidatePath("/panel");
}

// TEKLİF ARŞİVİ: teklif silinmez; arşivlenen teklif listelerden düşer, kendi sayfasında ve
// "Arşiv" görünümünde durur, istenince arşivden çıkarılır. Siparişi süren teklif arşivlenmez.
export async function teklifArsivle(teklifId: string): Promise<IslemSonucu> {
  const giren = await yetki("teklifArsivle", { teklifId });
  const teklif = teklifId
    ? await prisma.teklif.findUnique({ where: { id: teklifId }, select: { id: true, arsivTarihi: true, siparis: { select: { durum: true } } } })
    : null;
  if (!teklif) return { hata: "Teklif bulunamadı." };
  if (teklif.arsivTarihi) return { tamam: "Teklif zaten arşivde." };
  if (teklif.siparis && teklif.siparis.durum !== "IPTAL" && teklif.siparis.durum !== "REDDEDILDI")
    return { hata: "Bu teklifin süren bir siparişi var; önce siparişi iptal edin." };
  await prisma.teklif.update({ where: { id: teklifId }, data: { arsivTarihi: new Date(), arsivleyenAdi: giren.ad } });
  revalidatePath("/panel/teklifler");
  revalidatePath(`/panel/teklifler/${teklifId}`);
  revalidatePath("/panel");
  return { tamam: "Teklif arşive kaldırıldı." };
}

export async function teklifArsivdenCikar(teklifId: string): Promise<IslemSonucu> {
  await yetki("teklifArsivdenCikar", { teklifId });
  if (!teklifId) return { hata: "Teklif bulunamadı." };
  await prisma.teklif.update({ where: { id: teklifId }, data: { arsivTarihi: null, arsivleyenAdi: null } });
  revalidatePath("/panel/teklifler");
  revalidatePath(`/panel/teklifler/${teklifId}`);
  revalidatePath("/panel");
  return { tamam: "Teklif arşivden çıkarıldı." };
}

// TEKLİF SİLME (satış personeli ve satış müdürü): yanlış / boş / deneme teklifleri için.
// Siparişi süren teklif silinmez (önce sipariş iptal edilir). İptal / red edilmiş siparişi olan teklifte o kapalı
// sipariş de kaldırılır (sevkiyat / teslim, iptal edilmemiş cari ya da süren satınalması varsa silinmez).
// Silinen teklifin (kalemler ve revizyonlar dahil) ve varsa sözleşme / kapalı siparişin tam kopyası İşlem Geçmişi'nde kalır.
export async function teklifSil(teklifId: string): Promise<IslemSonucu> {
  const silen = await islemZorunlu(islemBolumu("teklifSil"));
  if (silen.rol !== "ADMIN" && silen.rol !== "SATIS") return { hata: "Teklifi yalnız satış personeli ve satış müdürü silebilir." };
  const teklif = teklifId
    ? await prisma.teklif.findUnique({ where: { id: teklifId }, select: { id: true, teklifNo: true, musteriId: true, projeId: true, siparis: { select: { id: true, durum: true } } } })
    : null;
  if (!teklif) return { hata: "Teklif bulunamadı." };
  if (teklif.siparis && !siparisKapaliMi(teklif.siparis.durum))
    return { hata: "Bu teklifin süren bir siparişi var; teklif silinmez. Önce siparişin iptal edilmesi gerekir." };
  const kapaliSiparis = teklif.siparis?.id ?? null;
  if (kapaliSiparis) {
    const engel = await kapaliSiparisEngeli(prisma, kapaliSiparis);
    if (engel) return { hata: `Teklifin iptal / red edilmiş siparişi kaldırılamıyor: ${engel}` };
  }

  // Önce kopyalar İşlem Geçmişi'ne (silinen kaydın tam hâli)
  await islemKaydet(silen, "teklifSil", { teklifId });
  if (kapaliSiparis) await islemKaydet(silen, "siparisSil", { siparisId: kapaliSiparis, neden: `TKL-${String(teklif.teklifNo).padStart(4, "0")} teklifi silindi` });
  const sozlesme = await prisma.sozlesme.findUnique({ where: { teklifId }, select: { id: true } }).catch(() => null);
  if (sozlesme) await islemKaydet(silen, "sozlesmeSil", { id: sozlesme.id, teklifId });

  try {
    await prisma.$transaction(async (tx) => {
      if (kapaliSiparis) await kapaliSiparisiSil(tx, kapaliSiparis);
      await tx.kesifFormu.updateMany({ where: { olusturulanTeklifId: teklifId }, data: { olusturulanTeklifId: null } });
      await tx.teklif.updateMany({ where: { kopyaKaynakTeklifId: teklifId }, data: { kopyaKaynakTeklifId: null } });
      await tx.teklif.delete({ where: { id: teklifId } });
    });
  } catch (e) {
    if (e instanceof SiparisEngeli) return { hata: e.message };
    throw e;
  }

  revalidatePath("/panel/teklifler");
  revalidatePath("/panel");
  revalidatePath(`/panel/musteriler/${teklif.musteriId}`);
  if (teklif.projeId) revalidatePath(`/panel/projeler/${teklif.projeId}`);
  revalidatePath("/panel/proje-takip");
  return { tamam: `TKL-${String(teklif.teklifNo).padStart(4, "0")} silindi; kopyası İşlem Geçmişi'nde.` };
}

// --- Cari Hesap (Müşteri) ---

// ELLE CARİ HAREKET (müşteri): tahsilat, çek, sipariş dışı borç vb. Siparişin onay borcu ve kur farkı
// otomatik yazılır; burada yalnız bunların dışındaki hareketler girilir (Logo vb. bağlanana kadar elle).
// Tutar TL ya da döviz (döviz tutarı × kur = TL; döviz tutarı ve kur da saklanır). Tarih seçilebilir (kapalı ay hariç).
export async function cariHareketEkle(formData: FormData): Promise<IslemSonucu> {
  await yetki("cariHareketEkle", formData);
  const musteriId = String(formData.get("musteriId") ?? "");
  let aciklama = String(formData.get("aciklama") ?? "").trim().slice(0, 300);
  const tur = String(formData.get("tur") ?? "BORC") === "ALACAK" ? "ALACAK" : "BORC";
  const tutarVeri = await hareketTutariOku(formData);
  if ("hata" in tutarVeri) return { hata: tutarVeri.hata };
  const tarih = hareketTarihiOku(formData);
  if (!tarih) return { hata: "İşlem tarihi anlaşılamadı." };
  const odemeDetay = String(formData.get("odemeDetay") ?? "").trim().slice(0, 300);
  const odeme = odemeBilgisiOku(formData, tur === "ALACAK");
  if ("hata" in odeme) return { hata: odeme.hata };
  const dosya = formData.get("evrak") as File | null;

  if (!musteriId) return { hata: "Müşteri seçin." };
  if (!aciklama) aciklama = tur === "ALACAK" ? `${odemeYontemiEtiket(odeme.odemeYontemi)} ile tahsilat` : "";
  if (!aciklama) return { hata: "Borcun ne için olduğunu açıklamaya yazın." };
  if (await donemKilitliMi(tarih)) return { hata: KILIT_MESAJI(tarih) };
  if (dosya && dosya.size > 8 * 1024 * 1024) return { hata: "Evrak 8 MB'tan büyük olamaz." };
  const musteri = await prisma.musteri.findUnique({ where: { id: musteriId }, select: { id: true } });
  if (!musteri) return { hata: "Müşteri bulunamadı." };

  const evrak =
    dosya && dosya.size > 0
      ? { evrakDosya: Buffer.from(await dosya.arrayBuffer()), evrakDosyaAdi: dosya.name, evrakDosyaTipi: dosya.type || "application/pdf" }
      : {};

  await prisma.cariHareket.create({
    data: {
      musteriId,
      aciklama,
      tur,
      tarih,
      tutar: tutarVeri.tutar,
      paraBirimi: tutarVeri.paraBirimi,
      dovizTutar: tutarVeri.dovizTutar,
      kur: tutarVeri.kur,
      odemeYontemi: odeme.odemeYontemi,
      odemeDetay: odemeDetay || null,
      vadeTarihi: odeme.vadeTarihi,
      cekNo: odeme.cekNo,
      banka: odeme.banka,
      ...evrak,
    },
  });

  revalidatePath("/panel/cari");
  revalidatePath("/panel/genel-cari");
  revalidatePath(`/panel/musteriler/${musteriId}`);
  revalidatePath("/panel");
  return { tamam: tur === "ALACAK" ? `Tahsilat kaydedildi (${odemeYontemiEtiket(odeme.odemeYontemi)}).` : "Borç kaydedildi." };
}

// Ödeme şekli ve vade: ödemede (tahsilat / tedarikçi ödemesi) şekil zorunludur. Vade ve çek / senet no
// yalnız çek ve senette saklanır (öteki ödemeler çek takibine girmez); banka nakitte saklanmaz.
// Borç kaydında ödeme şekli yoktur; vade (son ödeme günü) isteğe bağlıdır.
function odemeBilgisiOku(
  fd: FormData,
  odemeMi: boolean
): { odemeYontemi: string | null; vadeTarihi: Date | null; cekNo: string | null; banka: string | null } | { hata: string } {
  const vadeYazi = String(fd.get("vadeTarihi") ?? "").trim();
  let vade: Date | null = null;
  if (vadeYazi) {
    vade = /^\d{4}-\d{2}-\d{2}$/.test(vadeYazi) ? new Date(`${vadeYazi}T12:00:00+03:00`) : null;
    if (!vade || Number.isNaN(vade.getTime())) return { hata: "Vade tarihi anlaşılamadı." };
  }
  const cekNo = String(fd.get("cekNo") ?? "").trim().slice(0, 100) || null;
  const banka = String(fd.get("banka") ?? "").trim().slice(0, 100) || null;
  if (!odemeMi) return { odemeYontemi: null, vadeTarihi: vade, cekNo: null, banka: null };
  const yontem = odemeYontemiOku(fd.get("odemeYontemi"));
  if (!yontem) return { hata: "Ödeme şeklini seçin: havale/EFT, nakit, kredi kartı, çek ya da senet." };
  const vadeli = yontem === "CEK" || yontem === "SENET";
  if (vadeli && !vade) return { hata: `${odemeYontemiEtiket(yontem)} için vade tarihini girin.` };
  return {
    odemeYontemi: yontem,
    vadeTarihi: vadeli ? vade : null,
    cekNo: vadeli ? cekNo : null,
    banka: yontem === "NAKIT" || yontem === "SENET" ? null : banka,
  };
}

// Elle hareketin tutarı: TL ya da döviz (paraBirimi + dovizTutar + kur → TL). Binlik ayraçlı yazımlar doğru okunur.
async function hareketTutariOku(fd: FormData): Promise<
  { tutar: number; paraBirimi: string | null; dovizTutar: number | null; kur: number | null } | { hata: string }
> {
  const pb = String(fd.get("paraBirimi") ?? "TRY");
  if (pb === "EUR" || pb === "USD" || pb === "GBP") {
    const dovizYazi = String(fd.get("dovizTutar") ?? "").trim();
    const doviz = tutarOku(dovizYazi);
    const kurYazi = String(fd.get("kur") ?? "").trim();
    const kur = kurOku(kurYazi);
    if (!doviz || doviz <= 0) return { hata: `${pb} tutarını yazın (örn. 12.500,00).` };
    if (!kur) return { hata: kurYazi ? `Kur anlaşılamadı: "${kurYazi}" (örn. 50,75).` : `1 ${pb} kaç TL? Kuru yazın.` };
    return { tutar: yuvarla2(doviz * kur), paraBirimi: pb, dovizTutar: yuvarla2(doviz), kur };
  }
  const yazi = String(fd.get("tutar") ?? "").trim();
  const tutar = tutarOku(yazi);
  if (!tutar || tutar <= 0) return { hata: yazi ? `Tutar anlaşılamadı: "${yazi}" (örn. 12.500,00).` : "Tutarı yazın." };
  return { tutar: yuvarla2(tutar), paraBirimi: null, dovizTutar: null, kur: null };
}

// İşlem tarihi (boşsa bugün); ileri tarih kabul edilmez (vade için vade alanı kullanılır)
function hareketTarihiOku(fd: FormData): Date | null {
  const t = String(fd.get("tarih") ?? "").trim();
  if (!t) return new Date();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const bugun = new Date().toISOString().slice(0, 10);
  if (t === bugun) return new Date();
  const d = new Date(`${t}T12:00:00+03:00`);
  if (Number.isNaN(d.getTime()) || d.getTime() > Date.now() + 24 * 3600 * 1000) return null;
  return d;
}

// FİNANSAL HAREKET İPTALİ: tahsilat / borç kaydı silinmez. İptal edilen hareket bakiyeye ve
// çek listelerine girmez, listede üstü çizili ve iptal nedeniyle görünür. Yalnız satış müdürü.
export async function cariHareketIptal(hareketId: string, neden: string): Promise<IslemSonucu> {
  const giren = await yetki("cariHareketIptal", { hareketId, neden });
  if (!finansYetkilisiMi(giren.rol)) return { hata: "Finansal kaydı yalnız satış müdürü ya da muhasebe iptal edebilir." };
  const nedenTemiz = String(neden ?? "").trim().slice(0, 500);
  if (!nedenTemiz) return { hata: "İptal nedenini yazın." };
  const h = hareketId ? await prisma.cariHareket.findUnique({ where: { id: hareketId }, select: { musteriId: true, iptalTarihi: true, tarih: true } }) : null;
  if (!h) return { hata: "Hareket bulunamadı." };
  if (h.iptalTarihi) return { tamam: "Hareket zaten iptal edilmiş." };
  if (await donemKilitliMi(h.tarih)) return { hata: KILIT_MESAJI(h.tarih) };
  await prisma.cariHareket.update({ where: { id: hareketId }, data: { iptalTarihi: new Date(), iptalEdenAdi: giren.ad, iptalNedeni: nedenTemiz } });
  revalidatePath("/panel/cari");
  revalidatePath(`/panel/musteriler/${h.musteriId}`);
  revalidatePath("/panel/genel-cari");
  revalidatePath("/panel");
  return { tamam: "Hareket iptal edildi; bakiyeden düşüldü." };
}

// Eski kalıcı silme: artık hiçbir ekranda düğmesi yok; finansal kayıt silinmez (iptal edilir)
export async function cariHareketSil(hareketId: string) {
  await yetki("cariHareketSil", { hareketId });
}

// --- Satınalma: Tedarikçi Cari ---

// ELLE TEDARİKÇİ HAREKETİ: ödeme, çek, satınalma siparişi dışı alış faturası vb. Satınalma siparişinden girilen
// alış faturaları otomatik yazılır; burada yalnız bunların dışındakiler girilir. TL ya da döviz; tarih seçilebilir.
export async function tedarikciHareketEkle(formData: FormData): Promise<IslemSonucu> {
  await yetki("tedarikciHareketEkle", formData);
  const tedarikciId = String(formData.get("tedarikciId") ?? "");
  let aciklama = String(formData.get("aciklama") ?? "").trim().slice(0, 300);
  const tur = String(formData.get("tur") ?? "BORC") === "ODEME" ? "ODEME" : "BORC";
  const tutarVeri = await hareketTutariOku(formData);
  if ("hata" in tutarVeri) return { hata: tutarVeri.hata };
  const tarih = hareketTarihiOku(formData);
  if (!tarih) return { hata: "İşlem tarihi anlaşılamadı." };
  const odeme = odemeBilgisiOku(formData, tur === "ODEME");
  if ("hata" in odeme) return { hata: odeme.hata };
  const faturaNo = String(formData.get("faturaNo") ?? "").trim().slice(0, 100);
  const dosya = formData.get("evrak") as File | null;

  if (!tedarikciId) return { hata: "Tedarikçi seçin." };
  if (!aciklama)
    aciklama =
      tur === "ODEME"
        ? `${odemeYontemiEtiket(odeme.odemeYontemi)} ile ödeme${faturaNo ? ` · fatura ${faturaNo}` : ""}`
        : faturaNo
          ? `Fatura ${faturaNo}`
          : "";
  if (!aciklama) return { hata: "Fatura no ya da açıklama yazın." };
  if (await donemKilitliMi(tarih)) return { hata: KILIT_MESAJI(tarih) };
  if (dosya && dosya.size > 8 * 1024 * 1024) return { hata: "Evrak 8 MB'tan büyük olamaz." };
  const ted = await prisma.tedarikci.findUnique({ where: { id: tedarikciId }, select: { id: true } });
  if (!ted) return { hata: "Tedarikçi bulunamadı." };
  if (faturaNo && tur === "BORC") {
    const ayni = await prisma.tedarikciHareket.findFirst({
      where: { tedarikciId, faturaNo: { equals: faturaNo, mode: "insensitive" }, iptalTarihi: null },
      select: { id: true },
    });
    if (ayni) return { hata: `${faturaNo} numaralı fatura bu tedarikçiye zaten işlenmiş (satınalma siparişinden ya da elle).` };
  }

  const evrak =
    dosya && dosya.size > 0
      ? { evrakDosya: Buffer.from(await dosya.arrayBuffer()), evrakDosyaAdi: dosya.name, evrakDosyaTipi: dosya.type || "application/pdf" }
      : {};

  await prisma.tedarikciHareket.create({
    data: {
      tedarikciId,
      aciklama,
      tur,
      tarih,
      tutar: tutarVeri.tutar,
      paraBirimi: tutarVeri.paraBirimi,
      dovizTutar: tutarVeri.dovizTutar,
      kur: tutarVeri.kur,
      faturaNo: faturaNo || null,
      odemeYontemi: odeme.odemeYontemi,
      vadeTarihi: odeme.vadeTarihi,
      cekNo: odeme.cekNo,
      banka: odeme.banka,
      ...evrak,
    },
  });

  revalidatePath("/panel/satinalma/cari");
  revalidatePath("/panel/cari");
  revalidatePath("/panel/genel-cari");
  revalidatePath("/panel");
  return { tamam: tur === "ODEME" ? `Ödeme kaydedildi (${odemeYontemiEtiket(odeme.odemeYontemi)}).` : "Borç (fatura) kaydedildi." };
}

// FİNANSAL HAREKET İPTALİ (tedarikçi): silinmez, iptal edilir (bakiyeden düşer). Yalnız satış müdürü.
export async function tedarikciHareketIptal(id: string, neden: string): Promise<IslemSonucu> {
  const giren = await yetki("tedarikciHareketIptal", { id, neden });
  if (!finansYetkilisiMi(giren.rol)) return { hata: "Finansal kaydı yalnız satış müdürü ya da muhasebe iptal edebilir." };
  const nedenTemiz = String(neden ?? "").trim().slice(0, 500);
  if (!nedenTemiz) return { hata: "İptal nedenini yazın." };
  const h = id ? await prisma.tedarikciHareket.findUnique({ where: { id }, select: { iptalTarihi: true, tarih: true } }) : null;
  if (!h) return { hata: "Hareket bulunamadı." };
  if (!h.iptalTarihi && (await donemKilitliMi(h.tarih))) return { hata: KILIT_MESAJI(h.tarih) };
  if (h.iptalTarihi) return { tamam: "Hareket zaten iptal edilmiş." };
  await prisma.tedarikciHareket.update({ where: { id }, data: { iptalTarihi: new Date(), iptalEdenAdi: giren.ad, iptalNedeni: nedenTemiz } });
  revalidatePath("/panel/satinalma/cari");
  revalidatePath("/panel/cari");
  revalidatePath("/panel/satinalma");
  revalidatePath("/panel/genel-cari");
  revalidatePath("/panel");
  return { tamam: "Hareket iptal edildi; bakiyeden düşüldü." };
}

// Eski kalıcı silme: artık hiçbir ekranda düğmesi yok; finansal kayıt silinmez (iptal edilir)
export async function tedarikciHareketSil(id: string) {
  await yetki("tedarikciHareketSil", { id });
}

// --- AKILLI STOK VEYA KATALOG GİRİŞİ (WAC - AĞIRLIKLI ORTALAMA MALİYET HESAPLI) ---

// AKILLI STOK GİRİŞİ VEYA KATALOG KAYDI
export async function stokGirisiEkle(formData: FormData) {
  await yetki("stokGirisiEkle", formData);
  const urunId = String(formData.get("urunId") ?? "").trim();
  const yeniUrunKodu = String(formData.get("yeniUrunKodu") ?? "").trim();
  const yeniUrunAdi = String(formData.get("yeniUrunAdi") ?? "").trim();
  const markaId = String(formData.get("markaId") ?? "").trim();

  const miktar = parseSayi(formData.get("miktar"));
  const birimAlisFiyati = parseSayi(formData.get("birimAlisFiyati"));
  const birimEkGider = parseSayi(formData.get("birimEkGider")); // Nakliye / Gümrük
  const listeFiyati = parseSayi(formData.get("listeFiyati"));   // Katalog Satış Fiyatı
  const paraBirimi = String(formData.get("paraBirimi") ?? "TRY");
  const hedefKarMarjiYuzde = parseSayi(formData.get("hedefKarMarjiYuzde")) || 20;
  const depoKonumu = String(formData.get("depoKonumu") ?? "").trim();

  const girenBirimToplamMaliyet = birimAlisFiyati + birimEkGider;

  if (urunId === "YENI_URUN") {
    if (!yeniUrunAdi) return;

    await prisma.urun.create({
      data: {
        kod: yeniUrunKodu || null,
        ad: yeniUrunAdi,
        markaId: markaId || null,
        stokMiktari: miktar,
        maliyetFiyati: girenBirimToplamMaliyet,
        ekGiderler: birimEkGider,
        maliyetParaBirimi: paraBirimi,
        listeFiyati: listeFiyati > 0 ? listeFiyati : girenBirimToplamMaliyet * (1 + hedefKarMarjiYuzde / 100),
        paraBirimi: paraBirimi,
        hedefKarMarjiYuzde: hedefKarMarjiYuzde,
        depoKonumu: depoKonumu || null,
      },
    });
  } else {
    const urun = await prisma.urun.findUnique({ where: { id: urunId } });
    if (!urun) return;

    const eskiStok = urun.stokMiktari;
    const eskiMaliyet = urun.maliyetFiyati;

    // Ağırlıklı Ortalama Maliyet (WAC)
    const toplamMevcutMaliyet = eskiStok * eskiMaliyet;
    const toplamGelenMaliyet = miktar * girenBirimToplamMaliyet;
    const yeniToplamStok = eskiStok + miktar;

    const yeniAgirlikliMaliyet =
      yeniToplamStok > 0
        ? (toplamMevcutMaliyet + toplamGelenMaliyet) / yeniToplamStok
        : girenBirimToplamMaliyet;

    await prisma.urun.update({
      where: { id: urunId },
      data: {
        stokMiktari: yeniToplamStok,
        maliyetFiyati: yeniAgirlikliMaliyet,
        ekGiderler: birimEkGider,
        maliyetParaBirimi: paraBirimi,
        depoKonumu: depoKonumu || urun.depoKonumu,
        listeFiyati: listeFiyati > 0 ? listeFiyati : urun.listeFiyati,
      },
    });
  }

  revalidatePath("/panel/stok");
  revalidatePath("/panel/ayarlar/urunler");
}

// TABLO İÇİ HIZLI STOK VE MALİYET GÜNCELLEME
export async function urunStokVeMaliyetGuncelle(formData: FormData) {
  await yetki("urunStokVeMaliyetGuncelle", formData);
  const urunId = String(formData.get("urunId") ?? "");
  const stokMiktari = parseSayi(formData.get("stokMiktari"));
  const maliyetFiyati = parseSayi(formData.get("maliyetFiyati"));
  const ekGiderler = parseSayi(formData.get("ekGiderler"));
  const depoKonumu = String(formData.get("depoKonumu") ?? "").trim();

  if (!urunId) return;

  await prisma.urun.update({
    where: { id: urunId },
    data: {
      stokMiktari: Math.max(0, stokMiktari),
      maliyetFiyati: Math.max(0, maliyetFiyati),
      ekGiderler: Math.max(0, ekGiderler),
      depoKonumu: depoKonumu || null,
    },
  });

  revalidatePath("/panel/stok");
  revalidatePath("/panel/ayarlar/urunler");
}

// --- Şirket Ayarları Güncelleme ---

export async function sirketAyarlariGuncelle(formData: FormData) {
  const giren = await yetki("sirketAyarlariGuncelle", formData);
  if (!giren || giren.rol !== "ADMIN") return;

  const unvan = String(formData.get("unvan") ?? "").trim();
  const slogan = String(formData.get("slogan") ?? "").trim();
  const adres = String(formData.get("adres") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const web = String(formData.get("web") ?? "").trim();
  const vergiDairesi = String(formData.get("vergiDairesi") ?? "").trim();
  const vergiNo = String(formData.get("vergiNo") ?? "").trim();

  if (!unvan) return;

  const veri: {
    unvan: string;
    slogan: string | null;
    adres: string | null;
    telefon: string | null;
    email: string | null;
    web: string | null;
    vergiDairesi: string | null;
    vergiNo: string | null;
    whatsapp?: string | null;
  } = {
    unvan,
    slogan: slogan || null,
    adres: adres || null,
    telefon: telefon || null,
    email: email || null,
    web: web || null,
    vergiDairesi: vergiDairesi || null,
    vergiNo: vergiNo || null,
  };
  // WhatsApp alanı yalnızca formda varsa güncellenir (alan olmayan formlar numarayı silmez)
  if (formData.has("whatsapp")) {
    veri.whatsapp = String(formData.get("whatsapp") ?? "").trim() || null;
  }

  try {
    await prisma.sirketAyarlari.upsert({
      where: { id: "default" },
      create: { id: "default", ...veri },
      update: veri,
      select: { id: true },
    });
  } catch (hata) {
    // "whatsapp" sütunu veritabanına henüz eklenmediyse (P2022) diğer bilgileri yine de kaydet
    const kod = (hata as { code?: string } | null)?.code;
    if (!("whatsapp" in veri) || kod !== "P2022") throw hata;
    const eskiVeri = { ...veri };
    delete eskiVeri.whatsapp;
    await prisma.sirketAyarlari.upsert({
      where: { id: "default" },
      create: { id: "default", ...eskiVeri },
      update: eskiVeri,
      select: { id: true },
    });
  }

  // Önbellekteki şirket bilgilerini hemen yenile (sitede ve panelde anında görünsün)
  revalidateTag(SIRKET_ETIKETI);
  revalidatePath("/panel/ayarlar/sirket");
  revalidatePath("/panel/ayarlar");
  revalidatePath("/panel/teklifler");
  revalidatePath("/panel");
  revalidatePath("/", "layout");

  // Formun bulunduğu sayfaya "kaydedildi" bildirimiyle geri dön
  const donus = String(formData.get("donus") ?? "");
  redirect(`${donus === "/panel/ayarlar/sirket" ? donus : "/panel/ayarlar"}?mesaj=sirket-kaydedildi`);
}

// --- Ayarlar (Teklif Şablonları / Teklif Notları) ---
// baslik     → yalnızca panelde görünen ad/kod (örn. "Ödeme Koşulları (Ç-9)")
// grupBaslik → müşteriye giden başlık (örn. "Ödeme Koşulları"); boş bırakılırsa
//              adın sonundaki parantezli kod atılarak otomatik bulunur.

export async function sablonEkle(formData: FormData) {
  await yetki("sablonEkle", formData);
  const baslik = String(formData.get("baslik") ?? "").trim();
  const grupGirdi = String(formData.get("grupBaslik") ?? "").trim();
  const icerik = String(formData.get("icerik") ?? "").trim();
  const sira = parseSayi(formData.get("sira"));
  if (!baslik) return;

  const grupBaslik = sablonGrubu({ baslik, grupBaslik: grupGirdi });
  await prisma.teklifSablon.create({ data: { baslik, grupBaslik, icerik, sira } });
  revalidatePath("/panel/ayarlar");
  revalidatePath("/panel/teklifler");
  redirect("/panel/ayarlar?mesaj=sablon-eklendi#teklif-notlari");
}

export async function sablonGuncelle(formData: FormData) {
  await yetki("sablonGuncelle", formData);
  const id = String(formData.get("id") ?? "");
  const baslik = String(formData.get("baslik") ?? "").trim();
  const grupGirdi = String(formData.get("grupBaslik") ?? "").trim();
  const icerik = String(formData.get("icerik") ?? "").trim();
  const sira = parseSayi(formData.get("sira"));
  if (!id || !baslik) return;

  const grupBaslik = sablonGrubu({ baslik, grupBaslik: grupGirdi });
  await prisma.teklifSablon.update({ where: { id }, data: { baslik, grupBaslik, icerik, sira } });
  revalidatePath("/panel/ayarlar");
  revalidatePath("/panel/teklifler");
  redirect(`/panel/ayarlar?mesaj=sablon-guncellendi#sablon-${id}`);
}

// --- TEKLİF EKRANINDAN HAZIR NOT İŞLEMLERİ (sayfa yenilenmeden) ---
// Yeni hazır not ekler ve eklenen notu döndürür (teklif formunda hemen seçilir)
export async function sablonHizliEkle(veri: { baslik: string; grupBaslik: string; icerik: string }) {
  await yetki("sablonHizliEkle", veri);
  const baslik = String(veri?.baslik ?? "").trim().slice(0, 200);
  const grupGirdi = String(veri?.grupBaslik ?? "").trim().slice(0, 200);
  const icerik = String(veri?.icerik ?? "").trim().slice(0, 10000);
  if (!baslik || !icerik) return null;
  const grupBaslik = sablonGrubu({ baslik, grupBaslik: grupGirdi });
  const son = await prisma.teklifSablon.findFirst({ orderBy: { sira: "desc" }, select: { sira: true } });
  const yeni = await prisma.teklifSablon.create({
    data: { baslik, grupBaslik, icerik, sira: (son?.sira ?? 0) + 1 },
    select: { id: true, baslik: true, grupBaslik: true, icerik: true },
  });
  revalidatePath("/panel/ayarlar");
  return yeni;
}

// Hazır notun metnini kalıcı olarak günceller (o notu kullanan tüm tekliflerde değişir)
export async function sablonIcerikGuncelle(id: string, icerik: string) {
  await yetki("sablonIcerikGuncelle", { id, icerik });
  const metin = String(icerik ?? "").trim().slice(0, 10000);
  if (!id || !metin) return null;
  const s = await prisma.teklifSablon.update({
    where: { id },
    data: { icerik: metin },
    select: { id: true, baslik: true, grupBaslik: true, icerik: true },
  });
  revalidatePath("/panel/ayarlar");
  revalidatePath("/panel/teklifler");
  return s;
}

export async function sablonSil(id: string) {
  await yetki("sablonSil", { id });
  await prisma.teklifSablon.delete({ where: { id } });
  revalidatePath("/panel/ayarlar");
  revalidatePath("/panel/teklifler");
  redirect("/panel/ayarlar?mesaj=sablon-silindi#teklif-notlari");
}

// --- Kullanıcılar ---

export async function kullaniciEkle(formData: FormData) {
  const giren = await yetki("kullaniciEkle", formData);
  if (!giren || giren.rol !== "ADMIN") return;

  const ad = String(formData.get("ad") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const sifre = String(formData.get("sifre") ?? "");
  const rol = gecerliRol(formData.get("rol"));
  if (!ad || !email || sifre.length < 6) return;

  const sifreHash = await bcrypt.hash(sifre, 10);
  await prisma.kullanici.create({
    data: { ad, email, telefon: telefon || null, sifreHash, rol },
  });
  revalidatePath("/panel/kullanicilar");
}

// Kullanıcının rolünü değiştirme (yalnız satış müdürü; kendi rolünü değiştiremez). Yeni rol hemen geçerli olur.
export async function kullaniciRolGuncelle(formData: FormData) {
  const giren = await yetki("kullaniciRolGuncelle", formData);
  if (!giren || giren.rol !== "ADMIN") return;
  const kullaniciId = String(formData.get("kullaniciId") ?? "");
  if (!kullaniciId || kullaniciId === giren.id) return;
  const rol = gecerliRol(formData.get("rol"));
  await prisma.kullanici.update({ where: { id: kullaniciId }, data: { rol } });
  revalidatePath("/panel/kullanicilar");
}

export async function kullaniciSil(id: string) {
  const giren = await yetki("kullaniciSil", { id });
  if (!giren || giren.rol !== "ADMIN") return;
  if (giren.id === id) return;

  await prisma.kullanici.delete({ where: { id } });
  revalidatePath("/panel/kullanicilar");
}

export async function kullaniciSifreSifirla(formData: FormData) {
  const giren = await yetki("kullaniciSifreSifirla", formData);
  if (!giren || giren.rol !== "ADMIN") return;

  const kullaniciId = String(formData.get("kullaniciId") ?? "");
  const yeniSifre = String(formData.get("yeniSifre") ?? "");
  if (!kullaniciId || yeniSifre.length < 6) return;

  const sifreHash = await bcrypt.hash(yeniSifre, 10);
  await prisma.kullanici.update({ where: { id: kullaniciId }, data: { sifreHash } });
  await prisma.session.deleteMany({ where: { kullaniciId } });

  revalidatePath("/panel/kullanicilar");
}

// --- Siparişler ---
// AKIŞ: teklif → sipariş talebi (Onay Bekliyor) → satış müdürü onayı (cari borç) → sevkiyat / teslim → fatura.
// Dövizli teklifte TL'ye çevirme: talepte kur kaynağı seçilir (TCMB döviz satış · TCMB efektif satış · elle kur);
// onayda satış müdürü kuru görür / değiştirir ve cari borç o kurla TL yazılır (döviz tutarı ve kur da saklanır).
// Faturada farklı kur kullanılırsa aradaki fark cari hesaba "kur farkı" olarak işlenir.
// Siparişten doğan cari kayıtlar siparisId taşır; sipariş iptal edilince onlar da iptal edilir.

const yuvarla2 = (n: number) => Math.round(n * 100) / 100;
const kurYaz = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 6 });

// KAPALI SİPARİŞ (iptal / red): teklifi bağlamaz. Satış müdürü kalıcı silebilir; teklif yeniden siparişe
// dönüştürülünce de eski kapalı sipariş kaldırılır. Her iki durumda silinen kaydın tam kopyası İşlem Geçmişi'ne yazılır.
// Silinmez: sevkiyat / teslim kaydı olan, iptal edilmemiş cari kaydı olan ya da süren satınalma siparişi bağlı olan.
// İptal edilmiş cari kayıtlar silinmez (cari geçmişinde iptal olarak kalır).
class SiparisEngeli extends Error {}
type SiparisDb = Pick<typeof prisma, "siparis" | "cariHareket" | "satinalmaSiparisi">;

async function kapaliSiparisEngeli(db: SiparisDb, siparisId: string): Promise<string | null> {
  const s = await db.siparis.findUnique({
    where: { id: siparisId },
    select: { durum: true, _count: { select: { sevkiyatlar: true, teslimler: true } } },
  });
  if (!s) return "Sipariş bulunamadı.";
  if (!siparisKapaliMi(s.durum)) return "Yalnız iptal edilmiş ya da reddedilmiş sipariş silinebilir.";
  const kayit = s._count.sevkiyatlar + s._count.teslimler;
  if (kayit > 0)
    return `Siparişte ${kayit} sevkiyat / teslim kaydı var; bu kayıtlar silinmesin diye sipariş silinmez. Teklifi yeniden kullanmak için teklif sayfasından "Kopyala" ile yeni teklif açın.`;
  const [cari, sas] = await Promise.all([
    db.cariHareket.count({ where: { siparisId, iptalTarihi: null } }),
    db.satinalmaSiparisi.count({ where: { siparisId, durum: { notIn: [...KAPALI_SIPARIS_DURUMLARI] } } }),
  ]);
  if (cari > 0) return `Siparişin iptal edilmemiş ${cari} cari kaydı var; önce müşterinin cari hesabından iptal edin.`;
  if (sas > 0) return `Siparişe bağlı süren ${sas} satınalma siparişi var; önce onları iptal edin ya da bu siparişten ayırın.`;
  return null;
}

// Kontrol ve silme aynı işlem (transaction) içinde: arada başka bir kayıt bağlanırsa silinmez.
// İptal / red edilmiş satınalma siparişlerinin yalnız bağı kaldırılır, kendileri silinmez.
async function kapaliSiparisiSil(tx: SiparisDb, siparisId: string) {
  const engel = await kapaliSiparisEngeli(tx, siparisId);
  if (engel) throw new SiparisEngeli(engel);
  await tx.satinalmaSiparisi.updateMany({ where: { siparisId }, data: { siparisId: null } });
  const r = await tx.siparis.deleteMany({ where: { id: siparisId, durum: { in: [...KAPALI_SIPARIS_DURUMLARI] } } });
  if (r.count !== 1) throw new SiparisEngeli("Sipariş silinemedi; sayfayı yenileyip tekrar deneyin.");
}

// Müşterinin linkten verdiği onay, teklifin şu anki revizyonu için mi? (Onaydan sonra teklif değiştiyse geçersiz)
function musteriOnayiGecerli(t: { musteriOnayTarihi: Date | null; musteriOnayAdi: string | null; musteriOnayRevizyon: number | null; revizyonNo: number }) {
  return !!t.musteriOnayTarihi && !!t.musteriOnayAdi && (t.musteriOnayRevizyon == null || t.musteriOnayRevizyon === t.revizyonNo);
}

export async function siparisTalebiOlustur(formData: FormData): Promise<IslemSonucu & { git?: string }> {
  const kullanici = await yetki("siparisTalebiOlustur", formData);
  const teklifId = String(formData.get("teklifId") ?? "");
  const kurKaynagi = kurKaynagiOku(formData.get("kurKaynagi"));
  const elleKur = kurOku(formData.get("kur"));
  const ekNot = String(formData.get("ekNot") ?? "").trim().slice(0, 5000);
  const sevkAdresi = String(formData.get("sevkAdresi") ?? "").trim().slice(0, 1000);
  const dosya = formData.get("sozlesmeDosyasi") as File | null;
  if (!teklifId) return { hata: "Teklif bulunamadı." };

  const teklif = await prisma.teklif.findUnique({
    where: { id: teklifId },
    include: {
      // PDF (müşteri onaylı teklif belgesi) için teklif sayfasıyla aynı veriler
      kalemler: { include: { marka: true }, orderBy: [{ sira: "asc" }, { id: "asc" }] },
      musteri: true,
      yetkili: true,
      proje: true,
      olusturanKullanici: true,
      revizyonlar: { select: { tarih: true } },
      sablonlar: { orderBy: { sira: "asc" } },
      siparis: { select: { id: true, durum: true } },
    },
  });
  if (!teklif) return { hata: "Teklif bulunamadı." };
  // Aynı tekliften ikinci sipariş açılmaz (çift tıklama dahil). İptal / red edilmiş eski sipariş ise yenisiyle değiştirilir.
  const eskiKapali = teklif.siparis && siparisKapaliMi(teklif.siparis.durum) ? teklif.siparis.id : null;
  if (teklif.siparis && !eskiKapali) return { tamam: "Bu teklifin siparişi zaten var.", git: `/panel/siparisler/${teklif.siparis.id}` };
  // Müşterisiz teklif siparişe çevrilemez (sipariş ve cari hareket müşteriye yazılır)
  if (musterisizMi(teklif.musteriId)) return { hata: "Müşterisiz teklif siparişe çevrilemez; önce teklifi bir müşteriye bağlayın." };

  const dovizli = teklif.paraBirimi !== "TRY";
  let kur = 1;
  let kurTarihi: string | null = null;
  if (dovizli) {
    if (kurKaynagi === "ELLE") {
      if (!elleKur) return { hata: `1 ${teklif.paraBirimi} kaç TL? Elle kur seçildi; kuru yazın (örn. 50,75).` };
      kur = elleKur;
    } else {
      // TCMB: kesin kur onay günü alınır; burada bugünkü kur ön bilgi olarak yazılır
      const k = await getTcmbKurlari();
      const t = tcmbKuru(k, teklif.paraBirimi, kurKaynagi);
      if (t) {
        kur = t;
        kurTarihi = k?.tarih ?? null;
      }
    }
  }
  if (dosya && dosya.size > 9 * 1024 * 1024) return { hata: "Sözleşme dosyası 9 MB'tan büyük olamaz." };

  // Sözleşme yerine müşteri onayı: müşteri teklifin bu revizyonunu linkten onayladıysa dosya gerekmez;
  // onay kaydı eklenmiş teklif PDF'i sipariş belgesi olarak saklanır.
  const dosyaVar = !!dosya && dosya.size > 0;
  const linktenOnay = musteriOnayiGecerli(teklif);
  // Teklif sayfasında sistemde hazırlanmış sözleşme varsa o da yeterlidir (sipariş sayfasında bağlantısı görünür)
  const sistemSozlesmesi = !dosyaVar && !linktenOnay ? !!(await prisma.sozlesme.findUnique({ where: { teklifId }, select: { id: true } }).catch(() => null)) : false;
  if (!dosyaVar && !linktenOnay && !sistemSozlesmesi) {
    return {
      hata: teklif.musteriOnayTarihi
        ? `Müşteri Rev. ${teklif.musteriOnayRevizyon ?? "?"} sürümünü onaylamıştı; teklif sonra değişti (şu an Rev. ${teklif.revizyonNo}). Sözleşme PDF'i ekleyin, teklif sayfasından sözleşme hazırlayın ya da teklifi "Beklemede"ye alıp müşteriye linkten yeniden onaylatın.`
        : "Sözleşme / anlaşma PDF'ini ekleyin, teklif sayfasından sözleşme hazırlayın ya da teklifi müşteriye link (WhatsApp / e-posta) ile gönderip onaylatın.",
    };
  }
  let evrak: { sozlesmeDosya?: Buffer; sozlesmeDosyaAdi?: string; sozlesmeDosyaTipi?: string } = {};
  if (dosyaVar) {
    evrak = { sozlesmeDosya: Buffer.from(await dosya!.arrayBuffer()), sozlesmeDosyaAdi: dosya!.name, sozlesmeDosyaTipi: dosya!.type || "application/pdf" };
  } else if (linktenOnay && teklif.musteriOnayTarihi) {
    const pdf = await teklifPdfOlustur(musterisizGoster(teklif), await getSirketAyarlari(), {
      ad: teklif.musteriOnayAdi ?? "",
      tarih: teklif.musteriOnayTarihi,
      not: teklif.musteriOnayNotu,
      revizyon: teklif.musteriOnayRevizyon,
      tutar: teklif.musteriOnayTutar,
      ip: teklif.musteriOnayIp,
    });
    evrak = { sozlesmeDosya: pdf, sozlesmeDosyaAdi: `Teklif-TKL-${String(teklif.teklifNo).padStart(4, "0")}-musteri-onayli.pdf`, sozlesmeDosyaTipi: "application/pdf" };
  }

  if (eskiKapali) {
    const engel = await kapaliSiparisEngeli(prisma, eskiKapali);
    if (engel) return { hata: `Teklifin iptal / red edilmiş eski siparişi kaldırılamadı: ${engel}` };
    // Eski siparişin tam kopyası İşlem Geçmişi'ne ("Sipariş sildi")
    await islemKaydet(kullanici, "siparisSil", { siparisId: eskiKapali, neden: "Teklif yeniden siparişe dönüştürüldü" });
  }

  try {
    const siparis = await prisma.$transaction(async (tx) => {
      if (eskiKapali) await kapaliSiparisiSil(tx, eskiKapali);
      return tx.siparis.create({
      data: {
        teklifId,
        musteriId: teklif.musteriId,
        kur,
        kurKaynagi: dovizli ? kurKaynagi : null,
        kurTarihi,
        ekNot,
        sevkAdresi: sevkAdresi || null,
        ...evrak,
        olusturanKullaniciId: kullanici?.id || null,
        olusturanAdi: kullanici?.ad ?? "",
        ...siparisDondurmaVerisi(teklif),
      },
      select: { id: true },
      });
    });
    revalidatePath("/panel/siparisler");
    revalidatePath(`/panel/teklifler/${teklifId}`);
    revalidatePath("/panel/teklifler");
    if (eskiKapali) revalidatePath(`/panel/siparisler/${eskiKapali}`);
    return { tamam: "Sipariş talebi onaya gönderildi.", git: `/panel/siparisler/${siparis.id}` };
  } catch (e) {
    if (e instanceof SiparisEngeli) return { hata: `Teklifin iptal / red edilmiş eski siparişi kaldırılamadı: ${e.message}` };
    // teklifId tekil: aynı anda iki talep gönderildiyse ikincisi var olana yönlenir
    const var_ = await prisma.siparis.findUnique({ where: { teklifId }, select: { id: true, durum: true } });
    if (var_ && !siparisKapaliMi(var_.durum)) return { tamam: "Bu teklifin siparişi zaten var.", git: `/panel/siparisler/${var_.id}` };
    throw e;
  }
}

// ONAY: cari borç bu anda yazılır. Dövizli siparişte kur formdan gelir (satış müdürü görür / değiştirir);
// boşsa kur kaynağına göre bugünkü TCMB kuru, o da yoksa talepteki elle kur kullanılır.
export async function siparisOnayla(formData: FormData): Promise<IslemSonucu> {
  const siparisId = String(formData.get("siparisId") ?? "");
  const giren = await yetki("siparisOnayla", formData);
  if (!giren || giren.rol !== "ADMIN") return { hata: "Siparişi yalnız satış müdürü onaylayabilir." };

  const siparis = siparisId
    ? await prisma.siparis.findUnique({ where: { id: siparisId }, include: { teklif: { include: { kalemler: true } } } })
    : null;
  if (!siparis) return { hata: "Sipariş bulunamadı." };
  if (siparis.durum !== "ONAY_BEKLIYOR") return { hata: "Bu sipariş onay beklemiyor." };
  const bugun = new Date();
  if (await donemKilitliMi(bugun)) return { hata: KILIT_MESAJI(bugun) };

  const pb = siparis.teklif.paraBirimi;
  const dovizli = pb !== "TRY";
  const kaynak = kurKaynagiOku(siparis.kurKaynagi);
  let kur = 1;
  let kurTarihi: string | null = siparis.kurTarihi;
  let kurKaynagi: string | null = dovizli ? kaynak : null;
  if (dovizli) {
    const formKurHam = String(formData.get("kur") ?? "").trim();
    const formKur = kurOku(formKurHam);
    if (formKurHam && !formKur) return { hata: `Kur anlaşılamadı: "${formKurHam.slice(0, 20)}". 1 ${pb} kaç TL olduğunu yazın (örn. 50,75).` };
    if (formKur) {
      kur = formKur;
      // TCMB kuru elle değiştirildiyse kaynak "elle" olur
      const k = kaynak === "ELLE" ? null : await getTcmbKurlari();
      const t = tcmbKuru(k, pb, kaynak);
      if (kaynak !== "ELLE" && t && Math.abs(t - formKur) < 1e-9) kurTarihi = k?.tarih ?? null;
      else if (kaynak !== "ELLE") {
        kurKaynagi = "ELLE";
        kurTarihi = null;
      }
    } else if (kaynak === "ELLE" && siparis.kur > 0 && siparis.kur !== 1) {
      kur = siparis.kur;
    } else {
      const k = await getTcmbKurlari();
      const t = tcmbKuru(k, pb, kaynak);
      if (!t) return { hata: `TCMB kuruna şu an ulaşılamadı. 1 ${pb} kaç TL olacağını kur kutusuna yazıp tekrar onaylayın.` };
      kur = t;
      kurTarihi = k?.tarih ?? null;
    }
  }

  // Onay anında teklifin kalemleri ve tutarı siparişe dondurulur; cari borç da bu tutardan yazılır
  const dondurma = siparisDondurmaVerisi(siparis.teklif);
  const kdvli = yuvarla2(siparis.teklif.kdvDahil ? dondurma.tutarNet : dondurma.tutarNet * (1 + siparis.teklif.kdvOrani / 100));
  const tlTutar = yuvarla2(dovizli ? kdvli * kur : kdvli);

  try {
    await prisma.$transaction(async (tx) => {
      // Aynı anda iki onay gelirse yalnız biri geçer (cari borç iki kez yazılmaz)
      const r = await tx.siparis.updateMany({
        where: { id: siparisId, durum: "ONAY_BEKLIYOR" },
        data: { durum: "HAZIRLANIYOR", onaylayanAdi: giren.ad, onayTarihi: bugun, kur, kurKaynagi, kurTarihi, ...dondurma },
      });
      if (r.count !== 1) throw new Error("ONAY_YARISI");
      await tx.cariHareket.create({
        data: {
          musteriId: siparis.musteriId,
          siparisId,
          tarih: bugun,
          aciklama: `Sipariş Onayı: ${siparis.teklif.baslik || siparis.teklifId}`.slice(0, 300),
          tur: "BORC",
          tutar: tlTutar,
          // Dövizli siparişte orijinal tutar ve kur saklanır (tutar TL'dir)
          ...(dovizli ? { paraBirimi: pb, dovizTutar: kdvli, kur } : {}),
        },
      });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "ONAY_YARISI") return { hata: "Bu sipariş az önce başka biri tarafından işlendi; sayfayı yenileyin." };
    throw e;
  }

  await projeDurumunuIlerlet(siparis.teklif.projeId, "KAZANILDI");
  revalidatePath("/panel/siparisler");
  revalidatePath(`/panel/siparisler/${siparisId}`);
  revalidatePath("/panel/cari");
  revalidatePath(`/panel/musteriler/${siparis.musteriId}`);
  revalidatePath("/panel");
  return {
    tamam: dovizli
      ? `Sipariş onaylandı. Cari borç: ${kdvli.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ${pb} × ${kurYaz(kur)} = ${tlTutar.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL`
      : "Sipariş onaylandı; tutar cari hesaba borç yazıldı.",
  };
}

export async function siparisReddet(formData: FormData): Promise<IslemSonucu> {
  const giren = await yetki("siparisReddet", formData);
  if (!giren || giren.rol !== "ADMIN") return { hata: "Siparişi yalnız satış müdürü reddedebilir." };

  const siparisId = String(formData.get("siparisId") ?? "");
  const redSebebi = String(formData.get("redSebebi") ?? "").trim().slice(0, 500);
  if (!siparisId) return { hata: "Sipariş bulunamadı." };
  if (!redSebebi) return { hata: "Red sebebini yazın." };

  // Yalnız onay bekleyen talep reddedilir (onaylı siparişin cari borcu varken "reddedildi" olmasın)
  const r = await prisma.siparis.updateMany({ where: { id: siparisId, durum: "ONAY_BEKLIYOR" }, data: { durum: "REDDEDILDI", redSebebi } });
  if (r.count !== 1) return { hata: "Bu sipariş onay beklemiyor; onaylı sipariş reddedilmez, gerekirse iptal edilir." };
  revalidatePath("/panel/siparisler");
  revalidatePath(`/panel/siparisler/${siparisId}`);
  return { tamam: "Sipariş talebi reddedildi." };
}

// Sevk / teslim sürecindeki siparişi "Hazırlanıyor"a geri alır. İptal bu yoldan yapılmaz (siparisIptal).
const GERI_ALINABILIR = ["KISMEN_SEVK_EDILDI", "SEVK_EDILDI", "KISMEN_TESLIM_EDILDI", "TESLIM_EDILDI"] as const;
export async function siparisDurumGuncelle(siparisId: string, durum: "HAZIRLANIYOR" | "IPTAL") {
  await yetki("siparisDurumGuncelle", { siparisId, durum });
  if (durum !== "HAZIRLANIYOR") return;
  await prisma.siparis.updateMany({
    where: { id: siparisId, durum: { in: [...GERI_ALINABILIR] } },
    data: { durum: "HAZIRLANIYOR" },
  });
  revalidatePath("/panel/siparisler");
  revalidatePath(`/panel/siparisler/${siparisId}`);
}

// SİPARİŞ İPTALİ: sipariş silinmez; durumu "İptal" olur, kim / ne zaman / neden kaydedilir.
// Siparişten doğan cari kayıtlar (onay borcu, kur farkı) da iptal edilir; sevkiyat / teslim kayıtlarına dokunulmaz.
export async function siparisIptal(siparisId: string, neden: string): Promise<IslemSonucu> {
  const giren = await yetki("siparisIptal", { siparisId, neden });
  if (giren.rol !== "ADMIN") return { hata: "Siparişi yalnız satış müdürü iptal edebilir." };
  const nedenTemiz = String(neden ?? "").trim().slice(0, 500);
  if (!nedenTemiz) return { hata: "İptal nedenini yazın." };
  const s = siparisId ? await prisma.siparis.findUnique({ where: { id: siparisId }, select: { durum: true, onayTarihi: true, musteriId: true } }) : null;
  if (!s) return { hata: "Sipariş bulunamadı." };
  if (s.durum === "IPTAL") return { tamam: "Sipariş zaten iptal edilmiş." };

  const cariKayitlar = await prisma.cariHareket.findMany({ where: { siparisId, iptalTarihi: null }, select: { id: true, tarih: true } });
  for (const c of cariKayitlar) {
    if (await donemKilitliMi(c.tarih)) return { hata: `Siparişin cari kaydı kapalı bir aya ait (${c.tarih.toLocaleDateString("tr-TR")}); iptal için önce dönem kilidini açın.` };
  }
  const simdi = new Date();
  await prisma.$transaction([
    prisma.siparis.update({ where: { id: siparisId }, data: { durum: "IPTAL", iptalTarihi: simdi, iptalEdenAdi: giren.ad, iptalNedeni: nedenTemiz } }),
    prisma.cariHareket.updateMany({
      where: { siparisId, iptalTarihi: null },
      data: { iptalTarihi: simdi, iptalEdenAdi: giren.ad, iptalNedeni: `Sipariş iptali: ${nedenTemiz}`.slice(0, 500) },
    }),
  ]);
  revalidatePath("/panel/siparisler");
  revalidatePath(`/panel/siparisler/${siparisId}`);
  revalidatePath("/panel/cari");
  revalidatePath(`/panel/musteriler/${s.musteriId}`);
  revalidatePath("/panel");
  revalidatePath("/panel/teklifler");
  // Bağlı süren satınalma siparişleri kendiliğinden iptal edilmez (tedarikçiye gitmiş olabilir): hatırlatılır
  const sasSayisi = await prisma.satinalmaSiparisi.count({ where: { siparisId, durum: { notIn: [...KAPALI_SIPARIS_DURUMLARI] } } });
  const sasNotu = sasSayisi > 0 ? ` Siparişe bağlı ${sasSayisi} satınalma siparişi sürüyor; tedarikçiyle görüşüp Satınalma sayfasından iptal edin.` : "";
  if (cariKayitlar.length) return { tamam: `Sipariş iptal edildi; siparişin ${cariKayitlar.length} cari kaydı da iptal edilip bakiyeden düşüldü.${sasNotu}` };
  return {
    tamam:
      (s.onayTarihi
        ? "Sipariş iptal edildi. Bu eski siparişin cari borcu otomatik bağlı değil: müşterinin cari hesabından ayrıca iptal edin."
        : "Sipariş iptal edildi.") + sasNotu,
  };
}

// KALICI SİLME (yalnız satış müdürü): yalnız iptal / red edilmiş sipariş (deneme kayıtları). Tam kopyası İşlem Geçmişi'nde
// "Sipariş sildi" olarak saklanır; iptal edilmiş cari kayıtları silinmez. Sonra teklif yeniden siparişe dönüştürülebilir.
export async function siparisSil(siparisId: string): Promise<IslemSonucu> {
  const giren = await yetki("siparisSil", { siparisId });
  if (giren.rol !== "ADMIN") return { hata: "Siparişi yalnız satış müdürü silebilir." };
  const s = siparisId ? await prisma.siparis.findUnique({ where: { id: siparisId }, select: { teklifId: true } }) : null;
  if (!s) return { hata: "Sipariş bulunamadı." };
  try {
    await prisma.$transaction(async (tx) => kapaliSiparisiSil(tx, siparisId));
  } catch (e) {
    if (e instanceof SiparisEngeli) return { hata: e.message };
    throw e;
  }
  revalidatePath("/panel/siparisler");
  revalidatePath(`/panel/siparisler/${siparisId}`);
  revalidatePath("/panel/teklifler");
  revalidatePath(`/panel/teklifler/${s.teklifId}`);
  revalidatePath("/panel/satinalma/siparisler");
  revalidatePath("/panel");
  return { tamam: "Sipariş silindi (kopyası İşlem Geçmişi'nde). Teklif yeniden siparişe dönüştürülebilir." };
}

// FATURA: fatura no / tarihi yazılır. Dövizli siparişte faturadaki kur onay kurundan farklıysa
// aradaki fark (KDV dahil döviz tutarı × kur farkı) cari hesaba "kur farkı" olarak bir kez işlenir.
export async function siparisFaturaGuncelle(formData: FormData): Promise<IslemSonucu> {
  const giren = await yetki("siparisFaturaGuncelle", formData);
  const siparisId = String(formData.get("siparisId") ?? "");
  const faturaNo = String(formData.get("faturaNo") ?? "").trim().slice(0, 100);
  const faturaTarihiStr = String(formData.get("faturaTarihi") ?? "");
  const faturaKurYazi = String(formData.get("faturaKur") ?? "").trim();
  const faturaKurHam = kurOku(faturaKurYazi);
  if (faturaKurYazi && !faturaKurHam) return { hata: `Fatura kuru anlaşılamadı: "${faturaKurYazi.slice(0, 20)}" (örn. 50,75).` };
  if (!siparisId) return { hata: "Sipariş bulunamadı." };
  if (!faturaNo) return { hata: "Fatura numarasını yazın." };
  const faturaTarihi = /^\d{4}-\d{2}-\d{2}$/.test(faturaTarihiStr) ? new Date(`${faturaTarihiStr}T12:00:00`) : new Date();

  const s = await prisma.siparis.findUnique({
    where: { id: siparisId },
    select: { durum: true, kur: true, faturaKur: true, paraBirimi: true, musteriId: true, teklif: { select: { paraBirimi: true, baslik: true } } },
  });
  if (!s) return { hata: "Sipariş bulunamadı." };
  if (s.durum === "ONAY_BEKLIYOR" || s.durum === "REDDEDILDI" || s.durum === "IPTAL") return { hata: "Fatura yalnız onaylı (iptal edilmemiş) siparişe yazılır." };

  const pb = s.paraBirimi ?? s.teklif.paraBirimi;
  let kurFarki: { tutar: number; tur: "BORC" | "ALACAK"; aciklama: string; dovizTutar: number } | null = null;
  let faturaKur: number | null = s.faturaKur;
  if (pb !== "TRY" && faturaKurHam && faturaKurHam > 0 && s.faturaKur == null) {
    faturaKur = faturaKurHam;
    if (Math.abs(faturaKurHam - s.kur) > 1e-9) {
      // Onay borcunun döviz tutarı (KDV dahil): siparişin onay cari kaydından
      const onay = await prisma.cariHareket.findFirst({
        where: { siparisId, iptalTarihi: null, aciklama: { startsWith: "Sipariş Onayı" } },
        select: { dovizTutar: true },
      });
      if (!onay?.dovizTutar) return { hata: "Siparişin onay cari kaydı bulunamadı; kur farkı hesaplanamıyor. Faturayı kur yazmadan kaydedin, farkı cari hesaptan elle işleyin." };
      const fark = yuvarla2(onay.dovizTutar * (faturaKurHam - s.kur));
      if (Math.abs(fark) >= 0.01) {
        kurFarki = {
          tutar: Math.abs(fark),
          tur: fark > 0 ? "BORC" : "ALACAK",
          dovizTutar: onay.dovizTutar,
          aciklama: `Kur farkı · Fatura ${faturaNo} (1 ${pb}: onay ${kurYaz(s.kur)} → fatura ${kurYaz(faturaKurHam)} TL)`.slice(0, 300),
        };
      }
    }
  }
  if (kurFarki && (await donemKilitliMi(faturaTarihi))) return { hata: KILIT_MESAJI(faturaTarihi) };

  // Müşteri borcu muhasebede fatura tarihinde doğar: onayda yazılan borç kaydı fatura tarihine taşınır ve
  // açıklamasına fatura no eklenir (iki ay da açıksa; kapalı ayda kayıt yerinde kalır).
  const onayKaydi = await prisma.cariHareket.findFirst({
    where: { siparisId, iptalTarihi: null, aciklama: { startsWith: "Sipariş Onayı" } },
    select: { id: true, tarih: true, aciklama: true },
  });
  const onayTasinir = !!onayKaydi && !(await donemKilitliMi(onayKaydi.tarih)) && !(await donemKilitliMi(faturaTarihi));

  await prisma.$transaction(async (tx) => {
    await tx.siparis.update({ where: { id: siparisId }, data: { faturaNo, faturaTarihi, durum: "FATURALANDI", faturaKur } });
    if (onayKaydi && onayTasinir) {
      const ek = ` · Fatura ${faturaNo}`;
      await tx.cariHareket.update({
        where: { id: onayKaydi.id },
        data: { tarih: faturaTarihi, aciklama: (onayKaydi.aciklama.includes(ek) ? onayKaydi.aciklama : onayKaydi.aciklama.replace(/ · Fatura .*$/, "") + ek).slice(0, 300) },
      });
    }
    if (kurFarki) {
      await tx.cariHareket.create({
        data: {
          musteriId: s.musteriId,
          siparisId,
          tarih: faturaTarihi,
          aciklama: kurFarki.aciklama,
          tur: kurFarki.tur,
          tutar: kurFarki.tutar,
          paraBirimi: pb,
          dovizTutar: kurFarki.dovizTutar,
          kur: faturaKur ?? undefined,
        },
      });
    }
  });
  void giren;
  revalidatePath(`/panel/siparisler/${siparisId}`);
  revalidatePath("/panel/siparisler");
  revalidatePath("/panel/cari");
  revalidatePath(`/panel/musteriler/${s.musteriId}`);
  return {
    tamam: kurFarki
      ? `Fatura kaydedildi; kur farkı ${kurFarki.tutar.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL ${kurFarki.tur === "BORC" ? "borç" : "alacak"} olarak cari hesaba işlendi.`
      : onayKaydi && !onayTasinir
        ? "Fatura kaydedildi. Onay borcu kapalı bir aya ait olduğu için cari kaydın tarihi değiştirilmedi."
        : "Fatura kaydedildi; müşterinin cari borcu fatura tarihine alındı.",
  };
}

export async function sevkiyatEkle(formData: FormData) {
  await yetki("sevkiyatEkle", formData);
  const siparisId = String(formData.get("siparisId") ?? "");
  const teklifKalemId = String(formData.get("teklifKalemId") ?? "");
  const adet = parseSayi(formData.get("adet"));
  const not = String(formData.get("not") ?? "").trim();
  if (!siparisId || !teklifKalemId || adet <= 0) return;

  const siparis = await prisma.siparis.findUnique({
    where: { id: siparisId },
    include: { teklif: { include: { kalemler: true } }, sevkiyatlar: true },
  });
  if (!siparis) return;
  // Onaylanmamış, iptal ya da red edilmiş siparişe sevkiyat girilmez; kalem bu siparişin teklifinden olmalı
  if (siparis.durum === "ONAY_BEKLIYOR" || siparisKapaliMi(siparis.durum)) return;
  if (!siparis.teklif.kalemler.some((k) => k.id === teklifKalemId)) return;

  const guncellenebilirDurumlar = ["HAZIRLANIYOR", "FATURALANDI", "KISMEN_SEVK_EDILDI", "SEVK_EDILDI"];
  const toplamAdet = siparis.teklif.kalemler.reduce((a, k) => a + k.adet, 0);
  const simdiyeKadarSevkEdilen = siparis.sevkiyatlar.reduce((a, s) => a + s.adet, 0) + adet;
  const hedefDurum = simdiyeKadarSevkEdilen >= toplamAdet ? "SEVK_EDILDI" : "KISMEN_SEVK_EDILDI";

  await prisma.$transaction([
    prisma.sevkiyatKaydi.create({
      data: { siparisId, teklifKalemId, adet, not: not || null },
    }),
    ...(guncellenebilirDurumlar.includes(siparis.durum)
      ? [prisma.siparis.update({ where: { id: siparisId }, data: { durum: hedefDurum } })]
      : []),
  ]);
  revalidatePath(`/panel/siparisler/${siparisId}`);
  revalidatePath("/panel/siparisler");
}

export async function sevkiyatSil(id: string) {
  const giren = await yetki("sevkiyatSil", { id });
  // Yanlış girilen sevkiyat kaydını yalnız satış müdürü siler (kopyası işlem geçmişinde kalır)
  if (giren.rol !== "ADMIN") return;
  const kayit = await prisma.sevkiyatKaydi.delete({ where: { id } });
  revalidatePath(`/panel/siparisler/${kayit.siparisId}`);
  revalidatePath("/panel/siparisler");
}

export async function teslimKaydiEkle(formData: FormData) {
  await yetki("teslimKaydiEkle", formData);
  const siparisId = String(formData.get("siparisId") ?? "");
  const teklifKalemId = String(formData.get("teklifKalemId") ?? "");
  const adet = parseSayi(formData.get("adet"));
  const not = String(formData.get("not") ?? "").trim();
  const dosya = formData.get("evrak") as File | null;
  if (!siparisId || !teklifKalemId || adet <= 0) return;

  const siparis = await prisma.siparis.findUnique({
    where: { id: siparisId },
    include: { teklif: { include: { kalemler: true } }, teslimler: true },
  });
  if (!siparis) return;
  // Onaylanmamış, iptal ya da red edilmiş siparişe teslim girilmez (iptal sipariş "teslim edildi"ye dönmesin)
  if (siparis.durum === "ONAY_BEKLIYOR" || siparisKapaliMi(siparis.durum)) return;
  if (!siparis.teklif.kalemler.some((k) => k.id === teklifKalemId)) return;

  let evrak: Buffer | undefined;
  let evrakAdi: string | undefined;
  let evrakTipi: string | undefined;
  if (dosya && dosya.size > 0) {
    evrak = Buffer.from(await dosya.arrayBuffer());
    evrakAdi = dosya.name;
    evrakTipi = dosya.type || "application/pdf";
  }

  const toplamAdet = siparis.teklif.kalemler.reduce((a, k) => a + k.adet, 0);
  const simdiyeKadarTeslim = siparis.teslimler.reduce((a, t) => a + t.adet, 0) + adet;
  const hedefDurum = simdiyeKadarTeslim >= toplamAdet ? "TESLIM_EDILDI" : "KISMEN_TESLIM_EDILDI";

  await prisma.$transaction([
    prisma.teslimKaydi.create({
      data: { siparisId, teklifKalemId, adet, not: not || null, evrak, evrakAdi, evrakTipi },
    }),
    prisma.siparis.update({ where: { id: siparisId }, data: { durum: hedefDurum } }),
  ]);
  revalidatePath(`/panel/siparisler/${siparisId}`);
  revalidatePath("/panel/siparisler");
}

export async function teslimKaydiSil(id: string) {
  const giren = await yetki("teslimKaydiSil", { id });
  // Yanlış girilen teslim kaydını yalnız satış müdürü siler (kopyası işlem geçmişinde kalır)
  if (giren.rol !== "ADMIN") return;
  const kayit = await prisma.teslimKaydi.delete({ where: { id } });
  revalidatePath(`/panel/siparisler/${kayit.siparisId}`);
  revalidatePath("/panel/siparisler");
}

// --- Satınalma: Tedarikçiler ---

export async function tedarikciEkle(formData: FormData) {
  await yetki("tedarikciEkle", formData);
  const ad = String(formData.get("ad") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const vergiNo = String(formData.get("vergiNo") ?? "").trim();
  const adres = String(formData.get("adres") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  if (!ad) return;

  await prisma.tedarikci.create({
    data: { ad, telefon: telefon || null, vergiNo: vergiNo || null, adres: adres || null, email: email || null },
  });
  revalidatePath("/panel/satinalma");
}

// Tedarikçi bilgilerini düzenleme (ad, telefon, e-posta, vergi no, adres). Hareketlere dokunulmaz.
export async function tedarikciGuncelle(formData: FormData) {
  await yetki("tedarikciGuncelle", formData);
  const tedarikciId = String(formData.get("tedarikciId") ?? "");
  const ad = String(formData.get("ad") ?? "").trim().slice(0, 200);
  const alan = (a: string, sinir = 300) => String(formData.get(a) ?? "").trim().slice(0, sinir) || null;
  if (!tedarikciId || !ad) return;
  await prisma.tedarikci.update({
    where: { id: tedarikciId },
    data: { ad, telefon: alan("telefon", 40), email: alan("email", 200)?.toLowerCase() ?? null, vergiNo: alan("vergiNo", 40), adres: alan("adres") },
  });
  revalidatePath("/panel/satinalma");
  revalidatePath("/panel/satinalma/cari");
}

// --- Satınalma: Gelen Teklifler ---

// Tedarikçi teklifi kalemleri + elle yazılan dip toplam.
// Birim fiyat boş olabilir (0 kaydedilir). "12.500" / "12.500,50" doğru okunur.
function satinalmaKalemleriOku(formData: FormData) {
  const aciklamalar = formData.getAll("kalemAciklama") as string[];
  const adetler = formData.getAll("kalemAdet") as string[];
  const fiyatlar = formData.getAll("kalemFiyat") as string[];
  // Bölüm (PDF'ten okunan tekliflerde ürün grubu). Eski formlarda alan yoksa boş kalır.
  const bolumler = formData.getAll("kalemBolum") as string[];
  const bolumHizali = bolumler.length === aciklamalar.length;
  const kalemler = aciklamalar
    .map((aciklama, i) => ({
      aciklama: String(aciklama ?? "").trim(),
      adet: parseSayi(adetler[i]) || 1,
      birimFiyat: tutarOku(String(fiyatlar[i] ?? "")) ?? 0,
      bolum: (bolumHizali ? String(bolumler[i] ?? "").trim().slice(0, 200) : "") || null,
    }))
    .filter((k) => k.aciklama);
  const toplam = tutarOku(String(formData.get("toplamTutar") ?? ""));
  return { kalemler, toplamTutar: toplam && toplam > 0 ? toplam : null };
}

// TEDARİKÇİ TEKLİFİ EKLEME (TEMİZ HATASIZ VERSİYON)
export async function satinalmaTeklifiEkle(formData: FormData) {
  await yetki("satinalmaTeklifiEkle", formData);
  const tedarikciId = String(formData.get("tedarikciId") ?? "");
  const baslik = String(formData.get("baslik") ?? "").trim();
  const paraBirimi = String(formData.get("paraBirimi") ?? "TRY");

  const pdfDosya = formData.get("maliyetPdf") as File | null;
  const excelDosya = formData.get("maliyetExcel") as File | null;

  const { kalemler, toplamTutar } = satinalmaKalemleriOku(formData);

  if (!tedarikciId || !baslik) return;

  let pdfBuffer: Buffer | undefined;
  let pdfAdi: string | undefined;
  let pdfTipi: string | undefined;
  if (pdfDosya && pdfDosya.size > 0) {
    pdfBuffer = Buffer.from(await pdfDosya.arrayBuffer());
    pdfAdi = pdfDosya.name;
    pdfTipi = pdfDosya.type || "application/pdf";
  }

  let excelBuffer: Buffer | undefined;
  let excelAdi: string | undefined;
  let excelTipi: string | undefined;
  if (excelDosya && excelDosya.size > 0) {
    excelBuffer = Buffer.from(await excelDosya.arrayBuffer());
    excelAdi = excelDosya.name;
    excelTipi = excelDosya.type || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  await prisma.satinalmaTeklifi.create({
    data: {
      tedarikciId,
      baslik, // projeId satırı tamamen kaldırıldı
      paraBirimi,
      maliyetPdf: pdfBuffer,
      maliyetPdfAdi: pdfAdi,
      maliyetPdfTipi: pdfTipi,
      maliyetExcel: excelBuffer,
      maliyetExcelAdi: excelAdi,
      maliyetExcelTipi: excelTipi,
      toplamTutar,
      kalemler: { create: kalemler },
    },
  });

  revalidatePath("/panel/satinalma/teklifler");
  redirect(`/panel/satinalma/teklifler`);
}

// TEDARİKÇİ TEKLİFİNİN KALEMLERİNİ / DİP TOPLAMINI DÜZENLEME
// (Satınalma kalemlerine bağlı başka kayıt yoktur; kalemler yeniden yazılır.)
export async function satinalmaTeklifiGuncelle(formData: FormData) {
  await yetki("satinalmaTeklifiGuncelle", formData);
  const id = String(formData.get("satinalmaTeklifiId") ?? "");
  if (!id) return;
  const { kalemler, toplamTutar } = satinalmaKalemleriOku(formData);

  await prisma.$transaction([
    prisma.satinalmaTeklifKalemi.deleteMany({ where: { satinalmaTeklifiId: id } }),
    prisma.satinalmaTeklifi.update({
      where: { id },
      data: { toplamTutar, kalemler: { create: kalemler } },
    }),
  ]);

  revalidatePath("/panel/satinalma/teklifler");
  revalidatePath(`/panel/satinalma/teklifler/${id}`);
}

// Tedarikçi teklifi: müşteri teklifine aktarıldıysa silinmez (maliyetin kaynağıdır). Yalnız satış müdürü.
export async function satinalmaTeklifiSil(id: string): Promise<IslemSonucu> {
  const giren = await yetki("satinalmaTeklifiSil", { id });
  if (giren.rol !== "ADMIN") return { hata: "Tedarikçi teklifini yalnız satış müdürü silebilir." };
  const bagli = id ? await prisma.teklif.count({ where: { kaynakSatinalmaTeklifiId: id } }) : 0;
  if (bagli > 0) return { hata: `Bu tedarikçi teklifinden ${bagli} müşteri teklifi hazırlanmış; maliyet kaynağı olduğu için silinmez.` };
  const sas = id ? await prisma.satinalmaSiparisi.count({ where: { satinalmaTeklifiId: id } }).catch(() => 0) : 0;
  if (sas > 0) return { hata: `Bu tedarikçi teklifinden ${sas} satınalma siparişi verilmiş; silinmez.` };
  await prisma.satinalmaTeklifi.delete({ where: { id } });
  revalidatePath("/panel/satinalma/teklifler");
  return { tamam: "Tedarikçi teklifi silindi." };
}

export async function satinalmaTeklifiniDonustur(formData: FormData) {
  const kullanici = await yetki("satinalmaTeklifiniDonustur", formData);
  const satinalmaTeklifiId = String(formData.get("satinalmaTeklifiId") ?? "");
  const musteriId = String(formData.get("musteriId") ?? "");
  const baslik = String(formData.get("baslik") ?? "").trim();
  const marjYuzdesi = parseSayi(formData.get("marjYuzdesi"));

  if (!satinalmaTeklifiId || !musteriId || !baslik) return;

  const kaynak = await prisma.satinalmaTeklifi.findUnique({
    where: { id: satinalmaTeklifiId },
    include: { kalemler: true },
  });
  if (!kaynak) return;

  // Fiyatsız kalem + elle toplam varsa toplam kalemlere paylaştırılır ve
  // müşteri belgesinde birim fiyatlar gizlenir (müşteri kalemleri + toplamı görür).
  const { kalemler, fiyatsizVar } = donusumKalemleri(kaynak, marjYuzdesi);

  const teklif = await prisma.teklif.create({
    data: {
      baslik,
      musteriId,
      paraBirimi: kaynak.paraBirimi,
      olusturanKullaniciId: kullanici?.id || null,
      olusturanAdi: kullanici?.ad ?? "",
      kaynakSatinalmaTeklifiId: satinalmaTeklifiId,
      ...(fiyatsizVar ? { birimFiyatGoster: false } : {}),
      kalemler: {
        create: kalemler.map((k, sira) => ({
          sira,
          // PDF'ten okunan tedarikçi teklifinde ürün grubu bölüm olarak geçer
          ...(k.bolum ? { bolum: k.bolum } : {}),
          aciklama: k.aciklama,
          adet: k.adet,
          birimFiyat: k.birimFiyat,
        })),
      },
    },
  });

  revalidatePath("/panel/teklifler");
  redirect(`/panel/teklifler/${teklif.id}`);
}

// --- Keşif ---

export async function kesifEkle(formData: FormData) {
  const kullanici = await yetki("kesifEkle", formData);
  const musteriAdi = String(formData.get("musteriAdi") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const adres = String(formData.get("adres") ?? "").trim();
  const alanM2Str = String(formData.get("alanM2") ?? "");
  const mevcutSistem = String(formData.get("mevcutSistem") ?? "").trim();
  const notlar = String(formData.get("notlar") ?? "").trim();

  if (!musteriAdi || !notlar) return;

  const kesif = await prisma.kesifFormu.create({
    data: {
      musteriAdi,
      telefon: telefon || null,
      adres: adres || null,
      alanM2: alanM2Str ? parseSayi(alanM2Str) : null,
      mevcutSistem: mevcutSistem || null,
      notlar,
      olusturanAdi: kullanici?.ad ?? "",
    },
  });

  // 📧 ANINDA YÖNETİCİYE VE ŞİRKET E-POSTASINA BİLDİRİM GÖNDERİLİR
  await epostaGonder({
    konu: `🚨 YENİ KEŞİF TALEBİ: ${musteriAdi.replace(/[\r\n]+/g, " ")}`,
    icerikHtml: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; color: #334155;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 25px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f766e; margin-top: 0;">📍 Yeni Keşif Talebi Kaydedildi</h2>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
          
          <p style="margin: 8px 0;"><strong>Müşteri / Firma:</strong> ${htmlKacir(musteriAdi)}</p>
          <p style="margin: 8px 0;"><strong>Telefon:</strong> ${telefon ? htmlKacir(telefon) : "Belirtilmedi"}</p>
          <p style="margin: 8px 0;"><strong>Adres:</strong> ${adres ? htmlKacir(adres) : "Belirtilmedi"}</p>
          <p style="margin: 8px 0;"><strong>Alan (m²):</strong> ${alanM2Str ? htmlKacir(alanM2Str) : "Belirtilmedi"}</p>
          <p style="margin: 8px 0;"><strong>Mevcut Sistem:</strong> ${mevcutSistem ? htmlKacir(mevcutSistem) : "Belirtilmedi"}</p>

          <p style="margin: 15px 0 5px 0;"><strong>Keşif Notları / Detay:</strong></p>
          <div style="background: #f1f5f9; padding: 12px; border-left: 4px solid #0f766e; font-style: italic; border-radius: 4px;">
            ${htmlKacir(notlar).replace(/\n/g, "<br />")}
          </div>

          <div style="margin-top: 25px; text-align: center;">
            <a href="https://iklimofisi.com/panel/kesif" style="background-color: #0f766e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
              Keşif Talebini Panelde Gör →
            </a>
          </div>
        </div>
      </div>
    `,
  });

  revalidatePath("/panel/kesif");
}

export async function kesifSil(id: string) {
  await yetki("kesifSil", { id });
  await prisma.kesifFormu.delete({ where: { id } });
  revalidatePath("/panel/kesif");
}

export async function kesifiTeklifeDonustur(formData: FormData) {
  const kullanici = await yetki("kesifiTeklifeDonustur", formData);
  const kesifId = String(formData.get("kesifId") ?? "");
  const musteriId = String(formData.get("musteriId") ?? "");
  const baslik = String(formData.get("baslik") ?? "").trim();

  if (!kesifId || !musteriId || !baslik) return;

  const kesif = await prisma.kesifFormu.findUnique({ where: { id: kesifId } });
  if (!kesif) return;

  const teklif = await prisma.teklif.create({
    data: {
      baslik,
      musteriId,
      olusturanKullaniciId: kullanici?.id || null,
      olusturanAdi: kullanici?.ad ?? "",
      kalemler: {
        create: [{ aciklama: `Keşif notu: ${kesif.notlar}`.slice(0, 500), adet: 1, birimFiyat: 0 }],
      },
    },
  });

  await prisma.kesifFormu.update({ where: { id: kesifId }, data: { olusturulanTeklifId: teklif.id } });

  revalidatePath("/panel/kesif");
  redirect(`/panel/teklifler/${teklif.id}/duzenle`);
}

// --- Web Talepleri ---

export async function webTalebiOkunduIsaretle(id: string) {
  await yetki("webTalebiOkunduIsaretle", { id });
  await prisma.webTalebi.update({ where: { id }, data: { okundu: true } });
  revalidatePath("/panel/talepler");
}

export async function webTalebiSil(id: string) {
  await yetki("webTalebiSil", { id });
  await prisma.webTalebi.delete({ where: { id } });
  revalidatePath("/panel/talepler");
}

// Web talebini tek adımda müşteriye (+ istenirse projeye) dönüştürür.
// Hiçbir şey silinmez: talep yerinde kalır, yalnızca "okundu" işaretlenir.
export async function webTalebiDonustur(formData: FormData) {
  const kullanici = await yetki("webTalebiDonustur", formData);
  const talepId = String(formData.get("talepId") ?? "");
  const talep = talepId
    ? await prisma.webTalebi.findUnique({
        where: { id: talepId },
        select: { id: true, ad: true, telefon: true, email: true, mesaj: true, dosyaAdi: true, tarih: true },
      })
    : null;
  if (!talep) redirect("/panel/talepler");

  // Aynı talep ikinci kez dönüştürülmesin (çift tıklama / iki kişi aynı anda)
  const onceki = await prisma.islemKaydi
    .findFirst({
      where: { islem: "webTalebiDonusturuldu", hedefId: talep.id },
      select: { id: true },
    })
    .catch(() => null);
  if (onceki) redirect("/panel/talepler?zaten=1");

  let secilenMusteriId = String(formData.get("musteriId") ?? "").trim();
  const firmaAdi = String(formData.get("firmaAdi") ?? "").trim() || talep.ad;
  const yetkiliAdi = String(formData.get("yetkiliAdi") ?? "").trim();
  const yetkiliTelefon = String(formData.get("yetkiliTelefon") ?? "").trim();
  const yetkiliEmail = String(formData.get("yetkiliEmail") ?? "").trim();
  const projeOlustur = formData.get("projeOlustur") === "on";
  const projeAdi = String(formData.get("projeAdi") ?? "").trim() || `Web talebi – ${talep.ad}`;
  const konum = String(formData.get("konum") ?? "").trim();

  // Seçilen müşteri gerçekten var mı?
  const mevcutMusteri = secilenMusteriId
    ? await prisma.musteri.findUnique({
        where: { id: secilenMusteriId },
        select: { id: true, yetkiliAdi: true, yetkililer: { select: { ad: true } } },
      })
    : null;
  if (!mevcutMusteri) secilenMusteriId = "";

  const talepTarihi = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul" }).format(talep.tarih);
  const projeNotu = [
    `Web sitesi talebi (${talepTarihi}):`,
    talep.mesaj,
    talep.dosyaAdi ? `Talep dosyası: ${talep.dosyaAdi} (Web Talepleri sayfasından indirilebilir)` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const { musteriId, projeId } = await prisma.$transaction(async (tx) => {
    let mId = secilenMusteriId;

    if (!mevcutMusteri) {
      const m = await tx.musteri.create({
        data: {
          ad: firmaAdi,
          yetkiliAdi: yetkiliAdi || null,
          yetkiliTelefon: yetkiliTelefon || null,
          yetkiliEmail: yetkiliEmail || null,
          sorumluKullaniciId: kullanici?.id ?? null, // talebi dönüştüren firma sorumlusu olur
        },
      });
      mId = m.id;
    } else if (yetkiliAdi) {
      // Mevcut müşteri: talep sahibi yetkililer arasında yoksa ek yetkili olarak ekle
      const ad = yetkiliAdi.toLocaleLowerCase("tr-TR");
      const zatenVar =
        (mevcutMusteri.yetkiliAdi ?? "").toLocaleLowerCase("tr-TR") === ad ||
        mevcutMusteri.yetkililer.some((y) => y.ad.toLocaleLowerCase("tr-TR") === ad);
      if (!zatenVar) {
        await tx.musteriYetkili.create({
          data: {
            musteriId: mId,
            ad: yetkiliAdi,
            telefon: yetkiliTelefon || null,
            email: yetkiliEmail || null,
          },
        });
      }
    }

    let pId: string | null = null;
    if (projeOlustur) {
      const p = await tx.proje.create({
        data: {
          ad: projeAdi,
          konum: konum || null,
          musteriId: mId,
          kaynak: "Web sitesi",
          ihaleDurumu: "TAKIPTE",
          notlar: projeNotu,
          olusturanAdi: kullanici.ad,
        },
      });
      pId = p.id;
    }

    await tx.webTalebi.update({ where: { id: talep.id }, data: { okundu: true } });
    return { musteriId: mId, projeId: pId };
  });

  // Talepler sayfasında "dönüştürüldü" bilgisini göstermek için
  await islemKaydet(kullanici, "webTalebiDonusturuldu", { talepId: talep.id, musteriId, projeId });

  revalidatePath("/panel/talepler");
  revalidatePath("/panel/musteriler");
  revalidatePath("/panel/projeler");
  revalidatePath("/panel/proje-takip");
  revalidatePath("/panel");
  redirect(projeId ? `/panel/projeler/${projeId}` : `/panel/musteriler/${musteriId}`);
}

// --- Markalar ---

export async function markaEkle(formData: FormData) {
  await yetki("markaEkle", formData);
  const ad = String(formData.get("ad") ?? "").trim();
  const dosya = formData.get("logo") as File | null;
  if (!ad) return;

  let logo: Buffer | undefined;
  let logoAdi: string | undefined;
  let logoTipi: string | undefined;
  if (dosya && dosya.size > 0) {
    logo = Buffer.from(await dosya.arrayBuffer());
    logoAdi = dosya.name;
    logoTipi = dosya.type || "image/png";
  }

  await prisma.marka.create({ data: { ad, logo, logoAdi, logoTipi } });
  revalidatePath("/panel/ayarlar/markalar");
}

export async function markaSil(id: string) {
  await yetki("markaSil", { id });
  await prisma.marka.delete({ where: { id } });
  revalidatePath("/panel/ayarlar/markalar");
}

// --- Ürün Kataloğu ---

export async function urunEkle(formData: FormData) {
  await yetki("urunEkle", formData);
  const kod = String(formData.get("kod") ?? "").trim();
  const ad = String(formData.get("ad") ?? "").trim();
  const markaId = String(formData.get("markaId") ?? "");
  const birim = String(formData.get("birim") ?? "Adet").trim() || "Adet";
  const listeFiyati = parseSayi(formData.get("listeFiyati"));
  const paraBirimi = paraBirimiDogrula(formData.get("paraBirimi"));
  const aciklama = String(formData.get("aciklama") ?? "").trim();
  if (!ad || listeFiyati <= 0) return;

  await prisma.urun.create({
    data: {
      kod: kod || null,
      ad,
      markaId: markaId || null,
      birim,
      listeFiyati,
      paraBirimi,
      aciklama: aciklama || null,
    },
  });
  revalidatePath("/panel/ayarlar/urunler");
}

// Stok hareketi, seri numarası ya da satınalma siparişi kalemi olan ürün silinmez
// (silinirse stok geçmişi de silinirdi). Yalnız satış müdürü.
const SILINEBILIR_URUN = { stokHareketleri: { none: {} }, seriNolar: { none: {} }, satinalmaSiparisKalemleri: { none: {} } } as const;
export async function urunSil(id: string): Promise<IslemSonucu> {
  const giren = await yetki("urunSil", { id });
  if (giren.rol !== "ADMIN") return { hata: "Ürünü yalnız satış müdürü silebilir." };
  if (!id) return { hata: "Ürün bulunamadı." };
  const r = await prisma.urun.deleteMany({ where: { id, ...SILINEBILIR_URUN } });
  revalidatePath("/panel/ayarlar/urunler");
  if (r.count === 0) return { hata: "Bu ürünün stok hareketi, seri numarası ya da satınalma kaydı var; geçmişi korunmak için silinmez." };
  return { tamam: "Ürün silindi." };
}

export async function urunlerTumunuSil() {
  const giren = await yetki("urunlerTumunuSil");
  // Tüm ürün kataloğunu silen toplu işlem: yalnızca satış müdürü yapabilir
  if (giren.rol !== "ADMIN") return;
  // Stok geçmişi / satınalma kaydı olan ürünler korunur
  await prisma.urun.deleteMany({ where: SILINEBILIR_URUN });
  revalidatePath("/panel/ayarlar/urunler");
}

// Ürün kataloğunda ürün fotoğrafı ekleme / değiştirme / kaldırma
export async function urunGorselAyarla(urunId: string, gorselId: string | null) {
  await yetki("urunGorselAyarla", { urunId, gorselId });
  if (!urunId) return;
  if (gorselId) {
    const var_ = await prisma.gorsel.findUnique({ where: { id: gorselId }, select: { id: true } });
    if (!var_) return;
  }
  await prisma.urun.update({ where: { id: urunId }, data: { gorselId: gorselId || null } });
  revalidatePath("/panel/ayarlar/urunler");
}

// --- FİYAT LİSTELERİ ---
export async function fiyatListesiOlustur(formData: FormData) {
  const giren = await yetki("fiyatListesiOlustur", formData);
  const baslik = metinAl(formData.get("baslik"), 200);
  if (!baslik) return;
  // Fiyat sütunları: tek fiyat, "Liste Fiyatı + Satış Fiyatı" ya da "Nakit + Kart"
  const kalip = FIYAT_SUTUN_KALIPLARI.find((k) => k.kod === formData.get("fiyatSutunlari"));
  const liste = await prisma.fiyatListesi.create({
    data: {
      baslik,
      paraBirimi: paraBirimiDogrula(formData.get("paraBirimi")),
      olusturanAdi: giren?.ad ?? "",
      ...(kalip && kalip.b2 ? { fiyatBaslik: kalip.b1, fiyat2Baslik: kalip.b2 } : {}),
    },
    select: { id: true },
  });
  revalidatePath("/panel/fiyat-listeleri");
  redirect(`/panel/fiyat-listeleri/${liste.id}`);
}

// Hazır listedeki ürünün açıklaması: hazır metin (Olefini) ya da takılabilir genişlik / yükseklik (Niva)
function hazirAciklama(k: { aciklama?: string; genislik?: string; yukseklik?: string }) {
  if (k.aciklama !== undefined) return k.aciklama;
  return [k.genislik && `Takılabilir Genişlik ${k.genislik}`, k.yukseklik && `Takılabilir Yükseklik ${k.yukseklik}`].filter(Boolean).join("\n");
}

// Daha önce eklenmiş hazır listenin eksik bilgilerini tamamlar (ürün koduna göre eşleştirir).
// Hiçbir satır silinmez, fiyatlara ve sıraya dokunulmaz; elle yazılmış bilgi korunur:
// yalnız boş alanlar ile ilk eklemede otomatik yazılmış eski metinler (ör. "KLC-L85 · 85 cm") güncellenir.
export async function hazirListeTamamla(formData: FormData) {
  await yetki("hazirListeTamamla", { kod: formData.get("kod") });
  const { hazirListeBul } = await import("@/lib/hazir-listeler");
  const h = hazirListeBul(String(formData.get("kod") ?? ""));
  if (!h) return;
  const liste = await prisma.fiyatListesi.findFirst({
    where: { baslik: h.baslik },
    select: { id: true, kalemler: { select: { id: true, bolum: true, ad: true, kod: true, marka: true, aciklama: true } } },
  });
  if (!liste) redirect("/panel/fiyat-listeleri");

  const bilgi = new Map<string, { b: (typeof h.bolumler)[number]; k: (typeof h.bolumler)[number]["kalemler"][number] }>();
  for (const b of h.bolumler) for (const k of b.kalemler) bilgi.set(k.kod.toUpperCase(), { b, k });
  const islemler: ReturnType<typeof prisma.fiyatListesiKalem.update>[] = [];
  for (const s of liste.kalemler) {
    const kod = ((s.kod ?? "").trim() || s.ad.split("·")[0].trim()).toUpperCase();
    const e = bilgi.get(kod);
    if (!e) continue; // listeye elle eklenmiş başka ürün: dokunulmaz
    const { b, k } = e;
    const veri: Record<string, string> = {};
    const bolum = s.bolum.trim();
    if (!bolum || bolum === `${b.ad} · ${b.bilgi}`.slice(0, 120)) veri.bolum = b.ad.slice(0, 120);
    const ad = s.ad.trim();
    if (!ad || ad === `${k.kod} · ${k.olcu}`) veri.ad = k.ad;
    if (!(s.marka ?? "").trim()) veri.marka = k.marka ?? h.marka;
    if (!(s.kod ?? "").trim()) veri.kod = k.kod;
    if (!(s.aciklama ?? "").trim()) veri.aciklama = hazirAciklama(k);
    if (Object.keys(veri).length) islemler.push(prisma.fiyatListesiKalem.update({ where: { id: s.id }, data: veri }));
  }
  // Liste de güncellenmiş sayılır (listelerde güncelleme tarihi doğru görünsün)
  if (islemler.length) await prisma.$transaction([...islemler, prisma.fiyatListesi.update({ where: { id: liste.id }, data: { updatedAt: new Date() } })]);
  revalidatePath("/panel/fiyat-listeleri");
  revalidatePath(`/panel/fiyat-listeleri/${liste.id}`);
  // yenile: açık düzenleyici sunucudaki yeni bilgilerle yeniden açılsın
  redirect(`/panel/fiyat-listeleri/${liste.id}?mesaj=hazir-liste-tamamlandi&yenile=${Date.now()}`);
}

// Hazır listenin fiyatlarını ilk hâline döndürür (ör. toplu zam/indirim yanlışlıkla kaydedildiyse).
// Ürün koduna göre eşleşen satırların 1. ve 2. fiyatı hazır listedeki değerlere döner
// (Niva: Liste Fiyatı ve alış + %15 Satış Fiyatı). Başka hiçbir alana ve elle eklenmiş ürünlere dokunulmaz.
export async function hazirListeFiyatGeriYukle(formData: FormData) {
  await yetki("hazirListeFiyatGeriYukle", { kod: formData.get("kod") });
  const { hazirListeBul } = await import("@/lib/hazir-listeler");
  const h = hazirListeBul(String(formData.get("kod") ?? ""));
  if (!h) return;
  const liste = await prisma.fiyatListesi.findFirst({
    where: { baslik: h.baslik },
    select: {
      id: true,
      paraBirimi: true,
      satisIskontoYuzde: true,
      alisIskontoYuzde: true,
      kartKarYuzde: true,
      fiyat3Baslik: true,
      kalemler: { select: { id: true, ad: true, kod: true, fiyat: true, fiyat2: true, fiyat3: true } },
    },
  });
  if (!liste) redirect("/panel/fiyat-listeleri");
  // Satış iskontosu tanımlı listede satış fiyatı güncel iskontoyla yeniden hesaplanır
  const satisYuzde = liste.satisIskontoYuzde;
  const fiyatlar = new Map<string, { liste: number; satis: number; kart: number | null }>();
  for (const b of h.bolumler)
    for (const k of b.kalemler)
      fiyatlar.set(k.kod.toUpperCase(), {
        liste: k.liste,
        satis: satisYuzde !== null ? iskontoUygula(k.liste, satisYuzde, liste.paraBirimi) : k.satis,
        // Kredi kartı kâr modunda kart fiyatı liste fiyatından (alış + kâr) yeniden hesaplanır
        kart:
          liste.fiyat3Baslik && liste.kartKarYuzde !== null && liste.alisIskontoYuzde !== null
            ? kartFiyati(k.liste, liste.alisIskontoYuzde, liste.kartKarYuzde, liste.paraBirimi)
            : k.kart ?? null,
      });
  const islemler: ReturnType<typeof prisma.fiyatListesiKalem.update>[] = [];
  for (const s of liste.kalemler) {
    const f = fiyatlar.get(((s.kod ?? "").trim() || s.ad.split("·")[0].trim()).toUpperCase());
    if (!f || (s.fiyat === f.liste && s.fiyat2 === f.satis && (f.kart === null || s.fiyat3 === f.kart))) continue;
    islemler.push(
      prisma.fiyatListesiKalem.update({ where: { id: s.id }, data: { fiyat: f.liste, fiyat2: f.satis, ...(f.kart !== null ? { fiyat3: f.kart } : {}) } })
    );
  }
  if (islemler.length) await prisma.$transaction([...islemler, prisma.fiyatListesi.update({ where: { id: liste.id }, data: { updatedAt: new Date() } })]);
  revalidatePath("/panel/fiyat-listeleri");
  revalidatePath(`/panel/fiyat-listeleri/${liste.id}`);
  redirect(`/panel/fiyat-listeleri/${liste.id}?mesaj=hazir-liste-fiyat-geri&yenile=${Date.now()}`);
}

// Hazır listeyi (ör. Niva hava perdeleri) fotoğraflarıyla birlikte panele ekler.
// Eklenen liste normal bir listedir: düzenlenir, kopyalanır, PDF alınır.
export async function hazirListeEkle(formData: FormData) {
  const giren = await yetki("hazirListeEkle", { kod: formData.get("kod") });
  const { hazirListeBul } = await import("@/lib/hazir-listeler");
  const h = hazirListeBul(String(formData.get("kod") ?? ""));
  if (!h) return;
  // Aynı liste daha önce eklendiyse ikinci kez eklenmez; mevcut olan açılır
  const mevcut = await prisma.fiyatListesi.findFirst({ where: { baslik: h.baslik }, select: { id: true } });
  if (mevcut) redirect(`/panel/fiyat-listeleri/${mevcut.id}?mesaj=hazir-liste-zaten-var`);

  // Bölüm fotoğrafları (her biri bir kez kaydedilir, o bölümdeki ürünlere bağlanır)
  const gorselIdleri: Record<string, string> = {};
  for (const [anahtar, g] of Object.entries(h.gorseller)) {
    const veri = Buffer.from(g.b64, "base64");
    const kayit = await prisma.gorsel.create({
      data: { veri, tip: "image/jpeg", genislik: g.genislik, yukseklik: g.yukseklik, boyut: veri.length },
      select: { id: true },
    });
    gorselIdleri[anahtar] = kayit.id;
  }
  let sira = 0;
  const kalemler = h.bolumler.flatMap((b) =>
    b.kalemler.map((k) => ({
      sira: sira++,
      bolum: b.ad.slice(0, 120),
      ad: k.ad,
      marka: k.marka ?? h.marka,
      kod: k.kod,
      aciklama: hazirAciklama(k) || null,
      birim: k.birim || "Adet",
      fiyat: k.liste,
      fiyat2: k.satis,
      fiyat3: k.kart ?? null,
      gorselId: (b.gorsel && gorselIdleri[b.gorsel]) || null,
    }))
  );
  const liste = await prisma.fiyatListesi.create({
    data: {
      baslik: h.baslik,
      aciklama: h.aciklama,
      notlar: h.notlar,
      paraBirimi: h.paraBirimi,
      kdvDahil: h.kdvDahil,
      fiyatGoster: true,
      duzen: "TABLO",
      fiyatBaslik: h.fiyatBaslik,
      fiyat2Baslik: h.fiyat2Baslik,
      fiyat3Baslik: h.fiyat3Baslik ?? null,
      alisIskontoYuzde: h.alisIskontoYuzde ?? null,
      satisIskontoYuzde: h.satisIskontoYuzde ?? null,
      olusturanAdi: giren?.ad ?? "",
      kalemler: { create: kalemler },
    },
    select: { id: true },
  });
  revalidatePath("/panel/fiyat-listeleri");
  redirect(`/panel/fiyat-listeleri/${liste.id}?mesaj=hazir-liste-eklendi`);
}

export async function fiyatListesiKaydet(formData: FormData) {
  await yetki("fiyatListesiKaydet", formData);
  const id = String(formData.get("listeId") ?? "");
  const baslik = metinAl(formData.get("baslik"), 200);
  if (!id) return;
  if (!baslik) redirect(`/panel/fiyat-listeleri/${id}?mesaj=fiyat-listesi-eksik`);

  // Otomatik güncellenen liste (ör. Kaya) elle düzenlenmez: bir sonraki güncellemede üzerine yazılırdı
  const mevcutListe = await prisma.fiyatListesi.findUnique({ where: { id }, select: { kaynak: true } });
  if (!mevcutListe) return;
  if (mevcutListe.kaynak) redirect(`/panel/fiyat-listeleri/${id}?mesaj=fiyat-listesi-otomatik`);

  const kalemler = flKalemleriOku(String(formData.get("kalemler") ?? ""));
  // Silinmiş ürün / fotoğraf bağlantıları kayda geçmesin
  const urunIdleri = Array.from(new Set(kalemler.map((k) => k.urunId).filter(Boolean))) as string[];
  const mevcutUrunler = new Set(
    urunIdleri.length ? (await prisma.urun.findMany({ where: { id: { in: urunIdleri } }, select: { id: true } })).map((u) => u.id) : []
  );
  const iskonto = parseSayi(formData.get("iskontoYuzde"));
  const gecerlilik = String(formData.get("gecerlilikTarihi") ?? "");
  const duzen = duzenGecerli(String(formData.get("duzen") ?? ""));
  const fiyat2Baslik = metinAl(formData.get("fiyat2Baslik"), 40) || null;
  // 3. fiyat sütunu yalnız iki fiyatlı listede olur
  const fiyat3Baslik = fiyat2Baslik ? metinAl(formData.get("fiyat3Baslik"), 40) || null : null;
  // Alış iskontosu yalnız panelde kullanılır; satış iskontosu doluysa 2. fiyat liste fiyatından hesaplanır
  const alisIskontoYuzde = yuzdeOku(formData.get("alisIskontoYuzde"));
  const satisIskontoYuzde = fiyat2Baslik ? yuzdeOku(formData.get("satisIskontoYuzde")) : null;
  // Kredi kartı kârı: yalnız 3. sütun ve alış iskontosu varken; kart fiyatı = alış + bu kâr (fiyat3'e satış fiyatı yazılır)
  const kartKarYuzde = fiyat3Baslik && alisIskontoYuzde !== null ? karOku(formData.get("kartKarYuzde")) : null;
  // Liste iskontosu uygulanan fiyatların yuvarlanması (yalnız PDF; 0 = yok → boş kaydedilir)
  const yuvarlamaAdim = yuvarlamaGecerli(formData.get("yuvarlamaAdim")) || null;
  const paraBirimi = paraBirimiDogrula(formData.get("paraBirimi"));

  await prisma.$transaction([
    prisma.fiyatListesi.update({
      where: { id },
      data: {
        baslik,
        aciklama: metinAl(formData.get("aciklama"), 3000) || null,
        paraBirimi,
        kdvDahil: formData.get("kdvDahil") === "evet",
        alisIskontoYuzde,
        satisIskontoYuzde,
        kartKarYuzde,
        yuvarlamaAdim,
        iskontoYuzde: Math.min(100, Math.max(0, iskonto)),
        iskontoKapsam: iskontoKapsamGecerli(formData.get("iskontoKapsam")),
        fiyatGoster: formData.get("fiyatGoster") === "evet",
        duzen,
        fiyatBaslik: fiyat2Baslik ? metinAl(formData.get("fiyatBaslik"), 40) || "Fiyat" : null,
        fiyat2Baslik,
        fiyat3Baslik,
        gecerlilikTarihi: /^\d{4}-\d{2}-\d{2}$/.test(gecerlilik) ? new Date(`${gecerlilik}T12:00:00Z`) : null,
        notlar: metinAl(formData.get("notlar"), 20000) || null,
      },
    }),
    prisma.fiyatListesiKalem.deleteMany({ where: { listeId: id } }),
    prisma.fiyatListesiKalem.createMany({
      data: kalemler.map((k, sira) => ({
        listeId: id,
        sira,
        bolum: k.bolum,
        urunId: k.urunId && mevcutUrunler.has(k.urunId) ? k.urunId : null,
        ad: k.ad,
        kod: k.kod,
        marka: k.marka,
        aciklama: k.aciklama,
        birim: k.birim,
        fiyat: k.fiyat,
        fiyat2: !fiyat2Baslik ? null : satisIskontoYuzde !== null ? (k.fiyat > 0 ? iskontoUygula(k.fiyat, satisIskontoYuzde, paraBirimi) : null) : k.fiyat2,
        fiyat3: !fiyat3Baslik
          ? null
          : kartKarYuzde !== null && alisIskontoYuzde !== null
            ? k.fiyat > 0
              ? kartFiyati(k.fiyat, alisIskontoYuzde, kartKarYuzde, paraBirimi)
              : null
            : k.fiyat3 ?? null,
        gorselId: k.gorselId,
      })),
    }),
  ]);

  revalidatePath("/panel/fiyat-listeleri");
  revalidatePath(`/panel/fiyat-listeleri/${id}`);
  redirect(`/panel/fiyat-listeleri/${id}?mesaj=fiyat-listesi-kaydedildi`);
}

export async function fiyatListesiKopyala(id: string) {
  const giren = await yetki("fiyatListesiKopyala", { id });
  const kaynak = await prisma.fiyatListesi.findUnique({ where: { id }, include: { kalemler: { orderBy: { sira: "asc" } } } });
  if (!kaynak) return;
  const yeni = await prisma.fiyatListesi.create({
    data: {
      baslik: `${kaynak.baslik} (kopya)`.slice(0, 200),
      aciklama: kaynak.aciklama,
      paraBirimi: kaynak.paraBirimi,
      kdvDahil: kaynak.kdvDahil,
      iskontoYuzde: kaynak.iskontoYuzde,
      iskontoKapsam: kaynak.iskontoKapsam,
      alisIskontoYuzde: kaynak.alisIskontoYuzde,
      satisIskontoYuzde: kaynak.satisIskontoYuzde,
      kartKarYuzde: kaynak.kartKarYuzde,
      yuvarlamaAdim: kaynak.yuvarlamaAdim,
      fiyatGoster: kaynak.fiyatGoster,
      duzen: kaynak.duzen,
      fiyatBaslik: kaynak.fiyatBaslik,
      fiyat2Baslik: kaynak.fiyat2Baslik,
      fiyat3Baslik: kaynak.fiyat3Baslik,
      gecerlilikTarihi: kaynak.gecerlilikTarihi,
      notlar: listeNotlari(kaynak), // toptan listede PDF'lerden alınan marka notları da kopyaya geçer
      olusturanAdi: giren?.ad ?? "",
      // Kopya elle düzenlenebilir bir listedir; otomatik güncellenmez (kaynak bilgisi kopyalanmaz)
      kalemler: {
        create: kaynak.kalemler.map((k) => ({
          sira: k.sira,
          bolum: k.bolum,
          urunId: k.urunId,
          ad: k.ad,
          kod: k.kod,
          marka: k.marka,
          aciklama: k.aciklama,
          birim: k.birim,
          fiyat: k.fiyat,
          fiyat2: k.fiyat2,
          fiyat3: k.fiyat3,
          gorselId: k.gorselId,
        })),
      },
    },
    select: { id: true },
  });
  revalidatePath("/panel/fiyat-listeleri");
  redirect(`/panel/fiyat-listeleri/${yeni.id}?mesaj=fiyat-listesi-kopyalandi`);
}

// KAYA İKLİMLENDİRME LİSTESİ — panelden "Şimdi güncelle" (Kaya yeni liste koymamış olsa da PDF'i yeniden okur)
export async function kayaFiyatListesiGuncelle() {
  const giren = await yetki("kayaFiyatListesiGuncelle", {});
  const { kayaListesiniGuncelle } = await import("@/lib/kaya-fiyat-sunucu");
  const sonuc = await kayaListesiniGuncelle({ zorla: true, tetikleyen: giren?.ad ? `${giren.ad} (panel)` : "Panel" });
  revalidatePath("/panel/fiyat-listeleri");
  if (sonuc.listeId) revalidatePath(`/panel/fiyat-listeleri/${sonuc.listeId}`);
  const hedef = sonuc.listeId ? `/panel/fiyat-listeleri/${sonuc.listeId}` : "/panel/fiyat-listeleri";
  const mesaj = sonuc.durum === "HATA" ? "kaya-guncelleme-hatasi" : sonuc.durum === "AYNI" ? "kaya-degisiklik-yok" : "kaya-guncellendi";
  redirect(`${hedef}?mesaj=${mesaj}`);
}

// Otomatik güncellenen listenin yalnız görünüm ayarları (ürünler ve fiyatlar Kaya'dan gelir)
export async function fiyatListesiAyarKaydet(formData: FormData) {
  await yetki("fiyatListesiAyarKaydet", formData);
  const id = String(formData.get("listeId") ?? "");
  const baslik = metinAl(formData.get("baslik"), 200);
  if (!id) return;
  if (!baslik) redirect(`/panel/fiyat-listeleri/${id}?mesaj=fiyat-listesi-eksik`);
  // "Değişiklik yok" e-postasının sıklığı kaynak durumunun içinde saklanır (ayrı sütun gerekmez)
  const { kaynakDurumOku, kayaBildirimGecerli } = await import("@/lib/kaya-fiyat");
  const mevcut = await prisma.fiyatListesi.findUnique({ where: { id }, select: { kaynakDurum: true } });
  const durum = kaynakDurumOku(mevcut?.kaynakDurum);
  if (formData.has("bildirim")) durum.bildirim = kayaBildirimGecerli(formData.get("bildirim"));
  await prisma.fiyatListesi.update({
    where: { id },
    data: {
      baslik,
      aciklama: metinAl(formData.get("aciklama"), 3000) || null,
      notlar: metinAl(formData.get("notlar"), 20000) || null,
      duzen: duzenGecerli(String(formData.get("duzen") ?? "")),
      ...(mevcut?.kaynakDurum != null && formData.has("bildirim") ? { kaynakDurum: JSON.stringify(durum) } : {}),
    },
  });
  revalidatePath("/panel/fiyat-listeleri");
  revalidatePath(`/panel/fiyat-listeleri/${id}`);
  redirect(`/panel/fiyat-listeleri/${id}?mesaj=fiyat-listesi-kaydedildi`);
}

// Seçilen ürünler çıkarılarak düzenlenebilir kopya (müşteriye özel liste hazırlamak için)
export async function fiyatListesiSecimdenKopyala(formData: FormData) {
  const giren = await yetki("fiyatListesiSecimdenKopyala", { listeId: formData.get("listeId"), haricSayisi: formData.getAll("haric").length });
  const id = String(formData.get("listeId") ?? "");
  const haric = new Set((formData.getAll("haric") as string[]).filter((x) => typeof x === "string"));
  const kaynak = await prisma.fiyatListesi.findUnique({ where: { id }, include: { kalemler: { orderBy: { sira: "asc" } } } });
  if (!kaynak) return;
  const kalan = kaynak.kalemler.filter((k) => !haric.has(k.id));
  const yeni = await prisma.fiyatListesi.create({
    data: {
      baslik: `${kaynak.baslik} (kopya)`.slice(0, 200),
      aciklama: kaynak.aciklama,
      paraBirimi: kaynak.paraBirimi,
      kdvDahil: kaynak.kdvDahil,
      iskontoYuzde: kaynak.iskontoYuzde,
      iskontoKapsam: kaynak.iskontoKapsam,
      alisIskontoYuzde: kaynak.alisIskontoYuzde,
      satisIskontoYuzde: kaynak.satisIskontoYuzde,
      kartKarYuzde: kaynak.kartKarYuzde,
      yuvarlamaAdim: kaynak.yuvarlamaAdim,
      fiyatGoster: kaynak.fiyatGoster,
      duzen: kaynak.duzen,
      fiyatBaslik: kaynak.fiyatBaslik,
      fiyat2Baslik: kaynak.fiyat2Baslik,
      fiyat3Baslik: kaynak.fiyat3Baslik,
      gecerlilikTarihi: kaynak.gecerlilikTarihi,
      notlar: listeNotlari(kaynak), // toptan listede PDF'lerden alınan marka notları da kopyaya geçer
      olusturanAdi: giren?.ad ?? "",
      kalemler: {
        create: kalan.map((k, sira) => ({
          sira,
          bolum: k.bolum,
          urunId: k.urunId,
          ad: k.ad,
          kod: k.kod,
          marka: k.marka,
          aciklama: k.aciklama,
          birim: k.birim,
          fiyat: k.fiyat,
          fiyat2: k.fiyat2,
          fiyat3: k.fiyat3,
          gorselId: k.gorselId,
        })),
      },
    },
    select: { id: true },
  });
  revalidatePath("/panel/fiyat-listeleri");
  redirect(`/panel/fiyat-listeleri/${yeni.id}?mesaj=fiyat-listesi-kopyalandi`);
}

export async function fiyatListesiSil(id: string) {
  await yetki("fiyatListesiSil", { id });
  await prisma.fiyatListesi.delete({ where: { id } });
  revalidatePath("/panel/fiyat-listeleri");
}

type UrunSatiriSonuc =
  | { basarili: true; eklenen: number; guncellenen: number; atlanan: number }
  | { basarili: false; hata: string };

export async function urunlerExcelIceAktar(formData: FormData): Promise<UrunSatiriSonuc> {
  await yetki("urunlerExcelIceAktar", formData);
  const dosya = formData.get("dosya") as File | null;
  if (!dosya || dosya.size === 0) {
    return { basarili: false, hata: "Önce bir Excel/CSV dosyası seç." };
  }

  let satirlar: Record<string, unknown>[];
  try {
    const XLSX = await import("xlsx");
    const buffer = Buffer.from(await dosya.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const ilkSayfa = workbook.Sheets[workbook.SheetNames[0]];
    satirlar = XLSX.utils.sheet_to_json(ilkSayfa, { defval: "" });
  } catch (e) {
    return {
      basarili: false,
      hata: "Dosya okunamadı — .xlsx, .xls veya .csv formatında olduğundan emin ol. (" +
        (e instanceof Error ? e.message : "bilinmeyen hata") + ")",
    };
  }

  if (satirlar.length === 0) {
    return { basarili: false, hata: "Dosyada okunacak satır bulunamadı." };
  }

  const markalar = await prisma.marka.findMany();
  const markaHaritasi = new Map(markalar.map((m) => [m.ad.toLowerCase(), m.id]));

  const mevcutUrunler = await prisma.urun.findMany({ where: { kod: { not: null } }, select: { kod: true } });
  const mevcutKodlar = new Set(mevcutUrunler.map((u) => u.kod));

  function sutun(satir: Record<string, unknown>, ...adaylar: string[]): string {
    const anahtarlar = Object.keys(satir);
    for (const aday of adaylar) {
      const bulunan = anahtarlar.find((k) => k.trim().toLowerCase() === aday);
      if (bulunan) return String(satir[bulunan] ?? "").trim();
    }
    return "";
  }

  type UrunKaydi = { kod: string | null; ad: string; markaId: string | null; birim: string; listeFiyati: number; paraBirimi: ParaBirimi };
  const satirHaritasi = new Map<string, UrunKaydi>();
  const kodsuzSatirlar: UrunKaydi[] = [];
  let atlanan = 0;

  for (const satir of satirlar) {
    const kod = sutun(satir, "kod", "ürün kodu", "urun kodu", "sku");
    const ad = sutun(satir, "ürün adı", "urun adi", "ad", "isim", "ürün", "urun");
    const marka = sutun(satir, "marka");
    const birim = sutun(satir, "birim") || "Adet";
    const fiyatMetni = sutun(satir, "fiyat", "liste fiyatı", "liste fiyati", "birim fiyat", "birim fiyatı");
    const paraBirimiMetni = sutun(satir, "para birimi", "parabirimi", "döviz", "doviz");

    const fiyat = parseSayi(fiyatMetni);
    if (!ad || !fiyat || fiyat <= 0) {
      atlanan++;
      continue;
    }

    const kayit = {
      kod: kod || null,
      ad,
      markaId: marka ? markaHaritasi.get(marka.toLowerCase()) ?? null : null,
      birim,
      listeFiyati: fiyat,
      paraBirimi: paraBirimiDogrula(paraBirimiMetni),
    };

    if (kod) {
      satirHaritasi.set(kod, kayit);
    } else {
      kodsuzSatirlar.push(kayit);
    }
  }

  if (satirHaritasi.size === 0 && kodsuzSatirlar.length === 0) {
    return {
      basarili: false,
      hata: "Hiçbir satır içe aktarılamadı — sütun başlıklarının 'Ürün Adı' ve 'Fiyat' olduğundan emin ol.",
    };
  }

  let eklenen = 0;
  let guncellenen = 0;

  for (const [kod, kayit] of satirHaritasi) {
    await prisma.urun.upsert({
      where: { kod },
      create: kayit,
      update: {
        ad: kayit.ad,
        markaId: kayit.markaId,
        birim: kayit.birim,
        listeFiyati: kayit.listeFiyati,
        paraBirimi: kayit.paraBirimi,
      },
    });
    if (mevcutKodlar.has(kod)) guncellenen++;
    else eklenen++;
  }

  if (kodsuzSatirlar.length > 0) {
    await prisma.urun.createMany({ data: kodsuzSatirlar });
    eklenen += kodsuzSatirlar.length;
  }

  revalidatePath("/panel/ayarlar/urunler");
  return { basarili: true, eklenen, guncellenen, atlanan };
}

// --- Proje Takibi ---

// PROJE EKLEME (ÖNBELLEK TEMİZLEMELİ)
export async function projeEkle(formData: FormData) {
  const kullanici = await yetki("projeEkle", formData);
  const ad = String(formData.get("ad") ?? "").trim();
  const konum = String(formData.get("konum") ?? "").trim();
  const musteriId = String(formData.get("musteriId") ?? "");
  const kaynak = String(formData.get("kaynak") ?? "").trim();
  const ihaleDurumu = String(formData.get("ihaleDurumu") ?? "TAKIPTE") as
    | "TAKIPTE" | "TEKLIF_VERILDI" | "KAZANILDI" | "KAYBEDILDI" | "IPTAL";
  const ihaleyiAlan = String(formData.get("ihaleyiAlan") ?? "").trim();
  const tahminiDegerStr = String(formData.get("tahminiDeger") ?? "");
  const paraBirimi = paraBirimiDogrula(formData.get("paraBirimi"));
  const notlar = String(formData.get("notlar") ?? "").trim();
  if (!ad) return;

  const proje = await prisma.proje.create({
    data: {
      ad,
      konum: konum || null,
      musteriId: musteriId || null,
      kaynak: kaynak || null,
      ihaleDurumu,
      ihaleyiAlan: ihaleyiAlan || null,
      tahminiDeger: tahminiDegerStr ? parseSayi(tahminiDegerStr) : null,
      paraBirimi,
      notlar: notlar || null,
      olusturanAdi: kullanici?.ad ?? "",
    },
  });

  revalidatePath("/panel/proje-takip"); // PROJE TAKİP EKRANI CANLI GÜNCELLENİR
  revalidatePath("/panel/projeler");
  redirect(`/panel/projeler/${proje.id}`);
}

// PROJE GÜNCELLEME
export async function projeGuncelle(formData: FormData) {
  await yetki("projeGuncelle", formData);
  const projeId = String(formData.get("projeId") ?? "");
  const ad = String(formData.get("ad") ?? "").trim();
  const konum = String(formData.get("konum") ?? "").trim();
  const musteriId = String(formData.get("musteriId") ?? "");
  const kaynak = String(formData.get("kaynak") ?? "").trim();
  const ihaleDurumu = String(formData.get("ihaleDurumu") ?? "TAKIPTE") as
    | "TAKIPTE" | "TEKLIF_VERILDI" | "KAZANILDI" | "KAYBEDILDI" | "IPTAL";
  const ihaleyiAlan = String(formData.get("ihaleyiAlan") ?? "").trim();
  const tahminiDegerStr = String(formData.get("tahminiDeger") ?? "");
  const paraBirimi = paraBirimiDogrula(formData.get("paraBirimi"));
  const notlar = String(formData.get("notlar") ?? "").trim();
  if (!projeId || !ad) return;

  await prisma.proje.update({
    where: { id: projeId },
    data: {
      ad,
      konum: konum || null,
      musteriId: musteriId || null,
      kaynak: kaynak || null,
      ihaleDurumu,
      ihaleyiAlan: ihaleyiAlan || null,
      tahminiDeger: tahminiDegerStr ? parseSayi(tahminiDegerStr) : null,
      paraBirimi,
      notlar: notlar || null,
    },
  });

  revalidatePath("/panel/proje-takip"); // PROJE TAKİP EKRANI CANLI GÜNCELLENİR
  revalidatePath(`/panel/projeler/${projeId}`);
  revalidatePath("/panel/projeler");
}

// PROJE SİLME
export async function projeSil(id: string): Promise<IslemSonucu> {
  const giren = await yetki("projeSil", { id });
  // Teklifi olan proje silinmez (teklifler projeden kopmasın). Boş projeyi yalnız satış müdürü siler.
  if (giren.rol !== "ADMIN") return { hata: "Projeyi yalnız satış müdürü silebilir." };
  const teklifSayisi = id ? await prisma.teklif.count({ where: { projeId: id } }) : 0;
  if (teklifSayisi > 0) return { hata: `Bu projeye bağlı ${teklifSayisi} teklif var (arşivdekiler dahil); proje silinmez.` };
  const sas = id ? await prisma.satinalmaSiparisi.count({ where: { projeId: id } }).catch(() => 0) : 0;
  if (sas > 0) return { hata: `Bu projeye bağlı ${sas} satınalma siparişi var; proje silinmez.` };
  await prisma.proje.delete({ where: { id } });
  revalidatePath("/panel/proje-takip"); // PROJE TAKİP EKRANI CANLI GÜNCELLENİR
  revalidatePath("/panel/projeler");
  return { tamam: "Proje silindi." };
}

// --- Ziyaret Modülü ---

export async function ziyaretEkle(formData: FormData) {
  const kullanici = await yetki("ziyaretEkle", formData);
  let musteriId = String(formData.get("musteriId") ?? "");
  const projeId = String(formData.get("projeId") ?? "");
  const tarihStr = String(formData.get("tarih") ?? "");
  const not = String(formData.get("not") ?? "").trim();
  const hatirlatmaTarihiStr = String(formData.get("hatirlatmaTarihi") ?? "");
  const hatirlatmaNotu = String(formData.get("hatirlatmaNotu") ?? "").trim();
  const ziyaretiYapan = String(formData.get("ziyaretiYapan") ?? "").trim();
  const donus = String(formData.get("donus") ?? "");
  const tur = gecerliTur(formData.get("tur"));
  let teklifId = String(formData.get("teklifId") ?? "");
  let projeIdSon = projeId;
  // Teklife bağlı görüşme: müşteri / proje tekliften alınır (teklif yoksa bağlantı kurulmaz)
  if (teklifId) {
    const teklif = await prisma.teklif.findUnique({ where: { id: teklifId }, select: { musteriId: true, projeId: true } });
    if (!teklif) teklifId = "";
    else {
      musteriId = musteriId || teklif.musteriId;
      projeIdSon = projeIdSon || teklif.projeId || "";
    }
  }
  if (!not || (!musteriId && !projeIdSon)) return;

  // Proje seçilip müşteri seçilmediyse müşteri projeden otomatik bağlanır
  if (projeIdSon && !musteriId) {
    const proje = await prisma.proje.findUnique({ where: { id: projeIdSon }, select: { musteriId: true } });
    if (proje?.musteriId) musteriId = proje.musteriId;
  }

  const tarih = tarihStr ? new Date(tarihStr) : new Date();

  await prisma.ziyaret.create({
    data: {
      musteriId: musteriId || null,
      projeId: projeIdSon || null,
      teklifId: teklifId || null,
      tur,
      tarih,
      not,
      hatirlatmaTarihi: hatirlatmaTarihiStr ? new Date(hatirlatmaTarihiStr) : null,
      hatirlatmaNotu: hatirlatmaNotu || null,
      olusturanAdi: ziyaretiYapan || kullanici?.ad || "",
      // Hatırlatma e-postası, kaydı giren (giriş yapmış) kullanıcının adresine gider
      olusturanKullaniciId: kullanici?.id ?? null,
    },
  });

  if (musteriId) revalidatePath(`/panel/musteriler/${musteriId}`);
  if (projeIdSon) revalidatePath(`/panel/projeler/${projeIdSon}`);
  if (teklifId) revalidatePath(`/panel/teklifler/${teklifId}`);
  revalidatePath("/panel/ziyaretler");
  revalidatePath("/panel");

  if (donus === "ziyaretler") {
    const gun = tarih.toISOString().slice(0, 10);
    redirect(`/panel/ziyaretler?ay=${gun.slice(0, 7)}&gun=${gun}&eklendi=1`);
  }
}

export async function ziyaretHatirlatmaTamamlandi(id: string) {
  await yetki("ziyaretHatirlatmaTamamlandi", { id });
  const ziyaret = await prisma.ziyaret.update({ where: { id }, data: { hatirlatmaTamam: true } });
  if (ziyaret.musteriId) revalidatePath(`/panel/musteriler/${ziyaret.musteriId}`);
  if (ziyaret.projeId) revalidatePath(`/panel/projeler/${ziyaret.projeId}`);
  if (ziyaret.teklifId) revalidatePath(`/panel/teklifler/${ziyaret.teklifId}`);
  revalidatePath("/panel/notlar");
  revalidatePath("/panel/ziyaretler");
  revalidatePath("/panel");
}

export async function ziyaretSil(id: string) {
  await yetki("ziyaretSil", { id });
  const ziyaret = await prisma.ziyaret.delete({ where: { id } });
  if (ziyaret.musteriId) revalidatePath(`/panel/musteriler/${ziyaret.musteriId}`);
  if (ziyaret.projeId) revalidatePath(`/panel/projeler/${ziyaret.projeId}`);
  if (ziyaret.teklifId) revalidatePath(`/panel/teklifler/${ziyaret.teklifId}`);
  revalidatePath("/panel/ziyaretler");
  revalidatePath("/panel");
}

// --- PROFİL VE ŞİFRE GÜNCELLEME ---
export async function profilGuncelle(formData: FormData) {
  const giren = await yetki("profilGuncelle", formData);
  if (!giren) return;

  const ad = String(formData.get("ad") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const mevcutSifre = String(formData.get("mevcutSifre") ?? "");
  const yeniSifre = String(formData.get("yeniSifre") ?? "");

  if (!ad) return;

  const kullanici = await prisma.kullanici.findUnique({ where: { id: giren.id } });
  if (!kullanici) return;

  // Şifre değiştirilmek isteniyorsa mevcut şifreyi doğrula
  let yeniSifreHash = kullanici.sifreHash;
  if (yeniSifre && yeniSifre.length >= 6) {
    const sifreDogruMu = await bcrypt.compare(mevcutSifre, kullanici.sifreHash);
    if (!sifreDogruMu) {
      redirect("/panel/profil?hata=sifre-yanlis");
    }
    yeniSifreHash = await bcrypt.hash(yeniSifre, 10);
  }

  await prisma.kullanici.update({
    where: { id: giren.id },
    data: {
      ad,
      telefon: telefon || null,
      sifreHash: yeniSifreHash,
    },
  });

  revalidatePath("/panel/profil");
  redirect("/panel/profil?basarili=true");
}

// Eski "siparişe dönüştür" kısayolu: kur sormadan sipariş açıyordu (dövizli teklifte kur 1 kalıyordu).
// Artık her sipariş, kur ve sözleşme soran sipariş talebi sayfasından açılır.
export async function siparisOlustur(teklifId: string) {
  await yetki("siparisOlustur", { teklifId });
  if (!teklifId) return;
  const mevcutSiparis = await prisma.siparis.findUnique({ where: { teklifId }, select: { id: true } });
  if (mevcutSiparis) redirect(`/panel/siparisler/${mevcutSiparis.id}`);
  redirect(`/panel/teklifler/${teklifId}/siparis-talebi`);
}

// MÜŞTERİ SİLME FONKSİYONU
export async function musteriSil(musteriId: string): Promise<IslemSonucu> {
  const giren = await yetki("musteriSil", { musteriId });
  if (!giren || giren.rol !== "ADMIN") return { hata: "Müşteriyi yalnız satış müdürü silebilir." };

  // Müşterisiz teklif sistem kaydı silinmez (müşterisiz teklifler ona bağlı)
  if (!musteriId || musteriId === MUSTERISIZ_ID) return { hata: "Bu kayıt silinemez." };

  // Teklifi, siparişi ya da cari hareketi olan müşteri silinmez (finansal geçmişi kaybolmasın).
  // Yalnız hiç işlem görmemiş (ör. yanlışlıkla iki kez açılmış) müşteri silinebilir.
  const [teklifSayisi, siparisSayisi, cariSayisi, gorusmeSayisi] = await Promise.all([
    prisma.teklif.count({ where: { musteriId } }),
    prisma.siparis.count({ where: { musteriId } }),
    prisma.cariHareket.count({ where: { musteriId } }),
    prisma.ziyaret.count({ where: { musteriId } }),
  ]);
  if (teklifSayisi + siparisSayisi + cariSayisi + gorusmeSayisi > 0)
    return {
      hata: `Bu müşterinin ${teklifSayisi} teklifi, ${siparisSayisi} siparişi, ${cariSayisi} cari hareketi ve ${gorusmeSayisi} görüşme kaydı var; müşteri silinmez.`,
    };

  await prisma.proje.updateMany({ where: { musteriId }, data: { musteriId: null } });

  await prisma.musteri.delete({ where: { id: musteriId } });

  revalidatePath("/panel/musteriler");
  return { tamam: "Müşteri silindi." };
}

// --- TEKLİF PAYLAŞIM LİNKİ (WhatsApp ile müşteriye gönderilen gizli link) ---
// Link: iklimofisi.com/t/<anahtar>. Anahtar 24 karakterlik rastgele bir metindir,
// tahmin edilemez. İptal edilince kayıt silinir ve link artık açılmaz.
export async function teklifPaylasimOlustur(formData: FormData) {
  const giren = await yetki("teklifPaylasimOlustur", formData);
  const teklifId = String(formData.get("teklifId") ?? "");
  if (!teklifId) return;
  const teklif = await prisma.teklif.findUnique({ where: { id: teklifId }, select: { id: true } });
  if (!teklif) return;
  const mevcut = await prisma.teklifPaylasim.findUnique({ where: { teklifId } });
  if (!mevcut) {
    await prisma.teklifPaylasim.create({
      data: { teklifId, anahtar: randomBytes(18).toString("base64url"), olusturanAdi: giren?.ad ?? "" },
    });
  }
  revalidatePath(`/panel/teklifler/${teklifId}`);
  redirect(`/panel/teklifler/${teklifId}?mesaj=paylasim-olusturuldu#whatsapp`);
}

export async function teklifPaylasimIptal(formData: FormData) {
  await yetki("teklifPaylasimIptal", formData);
  const teklifId = String(formData.get("teklifId") ?? "");
  if (!teklifId) return;
  await prisma.teklifPaylasim.deleteMany({ where: { teklifId } });
  revalidatePath(`/panel/teklifler/${teklifId}`);
  redirect(`/panel/teklifler/${teklifId}?mesaj=paylasim-iptal#whatsapp`);
}

// MÜŞTERİYE TEKLİF E-POSTASI GÖNDERME
export async function teklifMusteriyeEpostaGonder(formData: FormData) {
  const giren = await yetki("teklifMusteriyeEpostaGonder", formData);
  if (!giren) return;

  const teklifId = String(formData.get("teklifId") ?? "");
  const aliciEmail = String(formData.get("aliciEmail") ?? "").trim();
  const epostaKonu = String(formData.get("epostaKonu") ?? "").trim();
  const ekNot = String(formData.get("ekNot") ?? "").trim();
  const onayLinkiEkle = formData.get("onayLinki") === "1";

  if (!teklifId || !aliciEmail) return;

  const [teklifHam, sirket] = await Promise.all([
    prisma.teklif.findUnique({
      where: { id: teklifId },
      include: {
        musteri: true,
        yetkili: true,
        proje: true, // PDF'te "Proje: ..." satırı (teklif sayfasıyla aynı)
        kalemler: { include: { marka: true }, orderBy: [{ sira: "asc" }, { id: "asc" }] },
        olusturanKullanici: true,
        // İlk hazırlanma tarihinin doğru bulunması için (PDF'te bu tarih gösterilir)
        revizyonlar: { select: { tarih: true } },
        // Teklif notları PDF'in sonuna grup başlıklarıyla eklenir
        sablonlar: { orderBy: { sira: "asc" } },
      },
    }),
    getSirketAyarlari(),
  ]);

  if (!teklifHam) return;
  // Müşterisiz teklifte PDF'e ve e-postaya müşteri yerine muhatap yazılır
  const teklif = musterisizGoster(teklifHam);

  const pb = teklif.paraBirimi;
  const sembol = pb === "EUR" ? "€" : pb === "USD" ? "$" : "TL";
  // Müşteriye tek satır toplam: "10.250,00 € + KDV" (KDV dahil tekliflerde "(KDV dahil)")
  const toplam = musteriToplami(teklif);
  const htmlGuvenli = (m: string) =>
    m.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const formatPara = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + sembol;
  const hitapAd = teklif.yetkili?.ad || teklif.musteri.yetkiliAdi || teklif.musteri.ad;

  // 1. OTOMATİK PDF DOSYASI OLUŞTURULUR
  const pdfBuffer = await teklifPdfOlustur(teklif, sirket);

  // ONAY LİNKİ: WhatsApp'takiyle aynı gizli link (yoksa oluşturulur). Müşteri linkte teklifi görür,
  // "Beklemede" olan teklifi adını yazıp onaylar; onay teklife, görüşmelere ve hazırlayana e-postayla düşer.
  let onayLinki: string | null = null;
  if (onayLinkiEkle) {
    const mevcutPaylasim = await prisma.teklifPaylasim.findUnique({ where: { teklifId }, select: { anahtar: true } });
    const anahtar =
      mevcutPaylasim?.anahtar ??
      (await prisma.teklifPaylasim
        .create({ data: { teklifId, anahtar: randomBytes(18).toString("base64url"), olusturanAdi: giren.ad ?? "" }, select: { anahtar: true } })
        .catch(async () => prisma.teklifPaylasim.findUnique({ where: { teklifId }, select: { anahtar: true } })))?.anahtar;
    if (anahtar) onayLinki = PAYLASIM_TABANI + anahtar;
  }
  const onayBekliyor = teklif.durum === "BEKLEMEDE";
  const onayHtml = onayLinki
    ? `
      <div style="text-align:center; margin: 24px 0;">
        <a href="${onayLinki}" style="display:inline-block; background:#0f766e; color:#ffffff; text-decoration:none; font-weight:bold; padding:12px 28px; border-radius:6px;">${onayBekliyor ? "Teklifi İncele ve Onayla" : "Teklifi Görüntüle"}</a>
        <p style="font-size:12px; color:#64748b; margin:10px 0 0;">${
          onayBekliyor ? "Teklifi uygun bulursanız bu bağlantıdaki sayfadan adınızı yazarak tek adımda onaylayabilirsiniz." : "Teklifin güncel hâlini bu bağlantıdan görüntüleyebilirsiniz."
        }</p>
        <p style="font-size:11px; color:#94a3b8; margin:6px 0 0; word-break:break-all;">${onayLinki}</p>
      </div>`
    : "";

  const icerikHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f766e;">${htmlGuvenli(sirket.unvan)}</h2>
      <p>Sayın ${htmlGuvenli(hitapAd)},</p>
      <p>TKL-${String(teklif.teklifNo).padStart(4, "0")} numaralı fiyat teklifimiz ve teknik detayları ekteki PDF dosyasında bilgilerinize sunulmuştur.</p>
      ${ekNot ? `<p style="background:#f1f5f9; padding:10px; border-left:3px solid #0f766e;"><b>Hazırlayan Notu:</b> ${htmlGuvenli(ekNot).replace(/\n/g, "<br />")}</p>` : ''}
      <h3 style="color: #0f766e;">Genel Toplam: ${formatPara(toplam.tutar)} ${toplam.ek}</h3>
      ${onayHtml}
      <p style="color: #64748b; font-size: 12px;">📎 Detaylı teklif dokümanı bu e-postaya <b>PDF dosyası</b> olarak eklenmiştir.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
      <p style="font-size: 12px; color: #64748b;"><b>Teklifi Hazırlayan:</b> ${htmlGuvenli(giren.ad)} (${htmlGuvenli(giren.email)})</p>
    </div>
  `;

  // 2. MAİL VE PDF EKİ BİRLİKTE GÖNDERİLİR
  const gonderim = await epostaGonder({
    konu: epostaKonu || `İklim Ofisi Teklif: TKL-${String(teklif.teklifNo).padStart(4, "0")}`,
    icerikHtml,
    aliciEmail,
    gonderenAd: giren.ad,
    replyTo: giren.email,
    ekler: [
      {
        filename: `Teklif-TKL-${String(teklif.teklifNo).padStart(4, "0")}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  revalidatePath(`/panel/teklifler/${teklifId}`);
  // Gönderilemediyse kullanıcıya açıkça söylenir (eskiden her durumda "gönderildi" deniyordu)
  redirect(`/panel/teklifler/${teklifId}?mesaj=${gonderim.basarili ? "eposta-gonderildi" : "eposta-hatasi"}`);
}

// --- PROJE TAKİP VE EXCEL ENTEGRASYONU ACTIONS ---

// 1. TEK TEKLİF İÇİN ANLIK TAKİP NOTU GÜNCELLEME
export async function teklifTakipNotuGuncelle(formData: FormData) {
  await yetki("teklifTakipNotuGuncelle", formData);
  const teklifId = String(formData.get("teklifId") ?? "");
  const takipNotu = String(formData.get("takipNotu") ?? "").trim();

  if (!teklifId) return;

  await prisma.teklif.update({
    where: { id: teklifId },
    data: { takipNotu: takipNotu || null },
  });

  revalidatePath("/panel/proje-takip");
  revalidatePath("/panel/teklifler");
}

// 2. EXCEL DOSYASINI OKUYUP TOPLU PROJE NOTU VE DURUMU GÜNCELLEME
export async function tekliflerExcelImport(formData: FormData) {
  await yetki("tekliflerExcelImport", formData);
  const dosya = formData.get("dosya") as File | null;
  if (!dosya || dosya.size === 0) return { basarili: false, hata: "Önce bir Excel dosyası seçin." };

  try {
    const XLSX = await import("xlsx");
    const buffer = Buffer.from(await dosya.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const satirlar: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let guncellenen = 0;

    for (const satir of satirlar) {
      const teklifId = String(satir["Teklif ID"] || satir["id"] || "").trim();
      const teklifNoStr = String(satir["Teklif No"] || "").replace(/[^0-9]/g, "");
      const teklifNo = Number(teklifNoStr || 0);

      const takipNotu = String(satir["Takip Notları / Görüşme Geçmişi"] || satir["Takip Notu"] || "").trim();
      const ihaleyiAlan = String(satir["İhaleyi alan firma"] || satir["ihaleyiAlan"] || "").trim();
      const ekapNo = String(satir["Varsa Ekap No"] || satir["ekapNo"] || "").trim();
      const ipkbNo = String(satir["Varsa İpkb no"] || satir["ipkbNo"] || "").trim();
      const durumStr = String(satir["Durum"] || "").trim().toUpperCase();

      let nerede: any = null;
      if (teklifId) nerede = { id: teklifId };
      else if (teklifNo > 0) nerede = { teklifNo };

      if (nerede) {
        const updateData: any = {};
        if (takipNotu !== undefined) updateData.takipNotu = takipNotu || null;
        if (ihaleyiAlan !== undefined) updateData.ihaleyiAlan = ihaleyiAlan || null;
        if (ekapNo !== undefined) updateData.ekapNo = ekapNo || null;
        if (ipkbNo !== undefined) updateData.ipkbNo = ipkbNo || null;
        if (["BEKLEMEDE", "ONAYLANDI", "REDDEDILDI"].includes(durumStr)) {
          updateData.durum = durumStr;
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.teklif.update({
            where: nerede,
            data: updateData,
          });
          guncellenen++;
        }
      }
    }

    revalidatePath("/panel/proje-takip");
    revalidatePath("/panel/teklifler");
    return { basarili: true, guncellenen };
  } catch (e: any) {
    return { basarili: false, hata: "Excel dosyası okunurken hata oluştu: " + e.message };
  }
}

// PROJE VEYA TEKLİF TAKİP NOTU GÜNCELLEME (CRM PIPELINE)
export async function projeTakipNotuGuncelle(formData: FormData) {
  await yetki("projeTakipNotuGuncelle", formData);
  const id = String(formData.get("id") ?? "");
  const tip = String(formData.get("tip") ?? "TEKLIF"); // 'PROJE' veya 'TEKLIF'
  const takipNotu = String(formData.get("takipNotu") ?? "").trim();

  if (!id) return;

  if (tip === "PROJE") {
    await prisma.proje.update({
      where: { id },
      data: { notlar: takipNotu || null },
    });
  } else {
    await prisma.teklif.update({
      where: { id },
      data: { takipNotu: takipNotu || null },
    });
  }

  revalidatePath("/panel/proje-takip");
  revalidatePath("/panel/projeler");
  revalidatePath("/panel/teklifler");
}

// TEKLİF EKRANINDAN HIZLI MÜŞTERİ EKLEME
// TEKLİF VEYA PROJE EKRANINDAN ESNEK HIZLI MÜŞTERİ EKLEME
export async function hizliMusteriEkle(formData: FormData) {
  const ekleyen = await yetki("hizliMusteriEkle", formData);
  const sorumluKullaniciId = await sorumluOku(formData, ekleyen?.id ?? null, ekleyen?.rol);
  // Yalnızca panel içi adreslere geri dönülür
  const yonlendirGirdi = String(formData.get("yonlendirPath") ?? "").trim();
  const yonlendirPath = /^\/panel\/[\w\-/]*$/.test(yonlendirGirdi) ? yonlendirGirdi : "/panel/teklifler/yeni";
  const ad = String(formData.get("ad") ?? "").trim();
  const yetkiliAdi = String(formData.get("yetkiliAdi") ?? "").trim();
  const yetkiliTelefon = String(formData.get("yetkiliTelefon") ?? "").trim();
  const yetkiliEmail = String(formData.get("yetkiliEmail") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const muhasebeEmail = String(formData.get("muhasebeEmail") ?? "").trim();
  const vergiNo = String(formData.get("vergiNo") ?? "").trim();
  const faturaAdresi = String(formData.get("faturaAdresi") ?? "").trim();
  const sevkAdresi = String(formData.get("sevkAdresi") ?? "").trim();

  if (!ad) return;

  const musteri = await prisma.musteri.create({
    data: {
      ad,
      yetkiliAdi: yetkiliAdi || null,
      yetkiliTelefon: yetkiliTelefon || null,
      yetkiliEmail: yetkiliEmail || null,
      telefon: telefon || null,
      email: email || null,
      muhasebeEmail: muhasebeEmail || null,
      vergiNo: vergiNo || null,
      faturaAdresi: faturaAdresi || null,
      sevkAdresi: sevkAdresi || null,
      sorumluKullaniciId,
    },
  });

  revalidatePath("/panel/teklifler");
  revalidatePath("/panel/projeler");
  revalidatePath("/panel/proje-takip");
  revalidatePath("/panel/musteriler");

  // Çağrıldığı sayfaya yeni müşteriyi seçili olarak geri döndürür
  redirect(`${yonlendirPath}?seciliMusteriId=${musteri.id}&basarili=musteri-eklendi`);
}

// MALİYET PDF VE EXCEL DOSYASI YÜKLEME
export async function maliyetDosyaYukle(formData: FormData) {
  await yetki("maliyetDosyaYukle", formData);
  const teklifId = String(formData.get("teklifId") ?? "").trim();
  const satinalmaTeklifiId = String(formData.get("satinalmaTeklifiId") ?? "").trim();
  const pdfDosya = formData.get("maliyetPdf") as File | null;
  const excelDosya = formData.get("maliyetExcel") as File | null;

  if (!teklifId && !satinalmaTeklifiId) return;

  let pdfBuffer: Buffer | undefined;
  let pdfAdi: string | undefined;
  let pdfTipi: string | undefined;

  if (pdfDosya && pdfDosya.size > 0) {
    pdfBuffer = Buffer.from(await pdfDosya.arrayBuffer());
    pdfAdi = pdfDosya.name;
    pdfTipi = pdfDosya.type || "application/pdf";
  }

  let excelBuffer: Buffer | undefined;
  let excelAdi: string | undefined;
  let excelTipi: string | undefined;

  if (excelDosya && excelDosya.size > 0) {
    excelBuffer = Buffer.from(await excelDosya.arrayBuffer());
    excelAdi = excelDosya.name;
    excelTipi = excelDosya.type || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  if (teklifId) {
    await prisma.teklif.update({
      where: { id: teklifId },
      data: {
        ...(pdfBuffer ? { maliyetPdf: pdfBuffer, maliyetPdfAdi: pdfAdi, maliyetPdfTipi: pdfTipi } : {}),
        ...(excelBuffer ? { maliyetExcel: excelBuffer, maliyetExcelAdi: excelAdi, maliyetExcelTipi: excelTipi } : {}),
      },
    });
  } else if (satinalmaTeklifiId) {
    await prisma.satinalmaTeklifi.update({
      where: { id: satinalmaTeklifiId },
      data: {
        ...(pdfBuffer ? { maliyetPdf: pdfBuffer, maliyetPdfAdi: pdfAdi, maliyetPdfTipi: pdfTipi } : {}),
        ...(excelBuffer ? { maliyetExcel: excelBuffer, maliyetExcelAdi: excelAdi, maliyetExcelTipi: excelTipi } : {}),
      },
    });
  }

  revalidatePath("/panel/satinalma/teklifler");
  revalidatePath("/panel/teklifler");
}

// --- E-POSTA TESTİ (Ayarlar → E-posta Durumu) ---
// Bildirim adresine bir deneme e-postası gönderir. Sadece satış müdürü.
export async function epostaTestiGonder(formData: FormData) {
  const kullanici = await yetki("epostaTestiGonder", formData);
  if (!kullanici || kullanici.rol !== "ADMIN") redirect("/panel?hata=yetkisiz-erisim");
  const s = await epostaGonder({
    konu: "🧪 İklim Ofisi – deneme e-postası",
    icerikHtml: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #0f766e;">✅ E-posta bildirimleri çalışıyor</h2>
        <p>Bu deneme e-postası panelden (Ayarlar → E-posta Durumu) ${htmlKacir(kullanici.ad)} tarafından gönderildi.</p>
        <p>Web sitesi talepleri ve keşif bildirimleri bu adrese gelir.</p>
      </div>`,
  });
  revalidatePath("/panel/ayarlar");
  redirect(`/panel/ayarlar?mesaj=${s.basarili ? "eposta-test-ok" : "eposta-test-hata"}#eposta`);
}

// --- SÖZLEŞME TASLAĞI ---
// Onaylanan tekliften sözleşme taslağı oluşturur. Kalemler ve seçilen teklif
// notları KOPYALANIR; sonrasında sözleşme ekranından serbestçe düzenlenir.
export async function sozlesmeOlustur(formData: FormData) {
  const kullanici = await yetki("sozlesmeOlustur", formData);
  const teklifId = String(formData.get("teklifId") ?? "");
  if (!teklifId) return;

  const mevcut = await prisma.sozlesme.findUnique({ where: { teklifId }, select: { id: true } });
  if (mevcut) redirect(`/panel/teklifler/${teklifId}/sozlesme`);

  const teklif = await prisma.teklif.findUnique({
    where: { id: teklifId },
    include: {
      musteri: true,
      yetkili: true,
      proje: true,
      kalemler: { orderBy: [{ sira: "asc" }, { id: "asc" }] },
      sablonlar: { orderBy: { sira: "asc" } },
    },
  });
  if (!teklif) return;
  // Sözleşme müşteri adına hazırlanır; müşterisiz teklifte önce müşteriye bağlanmalı
  if (musterisizMi(teklif.musteriId)) redirect(`/panel/teklifler/${teklifId}?mesaj=musterisiz-sozlesme`);

  const pbHam = String(formData.get("paraBirimi") ?? teklif.paraBirimi);
  const paraBirimi = (PARA_BIRIMLERI as readonly string[]).includes(pbHam) ? pbHam : teklif.paraBirimi;
  const kurOkunan = tutarOku(String(formData.get("kur") ?? ""));
  const kur = paraBirimi === teklif.paraBirimi ? 1 : kurOkunan && kurOkunan > 0 ? kurOkunan : 1;

  // Seçilen teklif notu grupları sözleşme maddesi olur, ardından standart maddeler
  const secilenler = new Set(formData.getAll("not").map(String));
  const notMaddeleri = sablonlariGrupla(notlariUygula(teklif.sablonlar, teklif.ozelNotlar))
    .filter((g) => secilenler.has(g.grup))
    .map((g) => ({ baslik: g.grup, icerik: g.notlar.map((n) => n.icerik).join("\n\n") }));

  const m = teklif.musteri;
  const konu = [teklif.baslik, teklif.proje?.ad && teklif.proje.ad !== teklif.baslik ? teklif.proje.ad : null]
    .filter(Boolean)
    .join(" – ");

  await prisma.sozlesme.create({
    data: {
      teklifId,
      paraBirimi,
      kur,
      kdvOrani: teklif.kdvOrani,
      kdvDahil: teklif.kdvDahil,
      birimFiyatGoster: teklif.birimFiyatGoster,
      isverenUnvan: m.ad,
      isverenAdres: m.faturaAdresi || null,
      isverenVergi: m.vergiNo ? `VN: ${m.vergiNo}` : null,
      isverenTelefon: m.telefon || teklif.yetkili?.telefon || m.yetkiliTelefon || null,
      isverenYetkili: teklif.yetkili?.ad || m.yetkiliAdi || null,
      isinKonusu:
        `İşveren'e ait ${konu || "proje"} kapsamında, aşağıda Madde 3'te belirtilen ürünlerin Yüklenici tarafından ` +
        `temini, montajı ve devreye alınması işidir.`,
      isYeri: teklif.proje?.konum || m.sevkAdresi || null,
      kalemler: JSON.stringify(tekliftenKalemler(teklif.kalemler)),
      maddeler: JSON.stringify([...notMaddeleri, ...STANDART_MADDELER]),
      olusturanAdi: kullanici?.ad ?? "",
    },
  });

  revalidatePath(`/panel/teklifler/${teklifId}`);
  redirect(`/panel/teklifler/${teklifId}/sozlesme?mesaj=sozlesme-olusturuldu`);
}

// Sözleşme taslağını kaydeder (başlık, taraflar, para birimi/kur, maddeler...)
export async function sozlesmeKaydet(formData: FormData) {
  await yetki("sozlesmeKaydet", formData);
  const id = String(formData.get("sozlesmeId") ?? "");
  const teklifId = String(formData.get("teklifId") ?? "");
  if (!id || !teklifId) return;

  const metin = (ad: string, uzunluk = 2000) => String(formData.get(ad) ?? "").trim().slice(0, uzunluk);
  const bosIseNull = (v: string) => (v ? v : null);

  const pbHam = metin("paraBirimi", 10);
  const paraBirimi = (PARA_BIRIMLERI as readonly string[]).includes(pbHam) ? pbHam : "TRY";
  const kurOkunan = tutarOku(metin("kur", 30));
  const kdvOrani = tutarOku(metin("kdvOrani", 10));
  const tarihHam = metin("sozlesmeTarihi", 10);
  const tarih = /^\d{4}-\d{2}-\d{2}$/.test(tarihHam) ? new Date(`${tarihHam}T12:00:00Z`) : undefined;
  const maddeler = maddeleriOku(metin("maddeler", 200000)).filter((x) => x.baslik.trim() || x.icerik.trim());

  await prisma.sozlesme.update({
    where: { id },
    data: {
      baslik: metin("baslik", 200) || "SATIŞ VE MONTAJ SÖZLEŞMESİ",
      ...(tarih ? { sozlesmeTarihi: tarih } : {}),
      paraBirimi,
      kur: kurOkunan && kurOkunan > 0 ? kurOkunan : 1,
      kdvOrani: kdvOrani !== null && kdvOrani >= 0 && kdvOrani <= 100 ? kdvOrani : 20,
      kdvDahil: formData.get("kdvDahil") === "evet",
      birimFiyatGoster: formData.get("birimFiyatGoster") === "evet",
      isverenUnvan: metin("isverenUnvan", 300) || "—",
      isverenAdres: bosIseNull(metin("isverenAdres", 500)),
      isverenVergi: bosIseNull(metin("isverenVergi", 200)),
      isverenTelefon: bosIseNull(metin("isverenTelefon", 100)),
      isverenYetkili: bosIseNull(metin("isverenYetkili", 200)),
      isinKonusu: metin("isinKonusu", 3000) || "—",
      isYeri: bosIseNull(metin("isYeri", 500)),
      maddeler: JSON.stringify(maddeler),
    },
  });

  revalidatePath(`/panel/teklifler/${teklifId}/sozlesme`);
  // "Kaydet ve Teklife Dön" düğmesiyle kaydedildiyse doğrudan teklif sayfasına
  if (formData.get("sonra") === "teklif") redirect(`/panel/teklifler/${teklifId}?mesaj=sozlesme-kaydedildi`);
  redirect(`/panel/teklifler/${teklifId}/sozlesme?mesaj=sozlesme-kaydedildi`);
}

// Teklif sonradan düzenlendiyse kalemleri tekliften yeniden kopyalar
export async function sozlesmeKalemleriYenile(formData: FormData) {
  await yetki("sozlesmeKalemleriYenile", formData);
  const teklifId = String(formData.get("teklifId") ?? "");
  if (!teklifId) return;
  const teklif = await prisma.teklif.findUnique({
    where: { id: teklifId },
    select: { kalemler: { orderBy: [{ sira: "asc" }, { id: "asc" }] } },
  });
  if (!teklif) return;
  await prisma.sozlesme.update({
    where: { teklifId },
    data: { kalemler: JSON.stringify(tekliftenKalemler(teklif.kalemler)) },
  });
  revalidatePath(`/panel/teklifler/${teklifId}/sozlesme`);
  redirect(`/panel/teklifler/${teklifId}/sozlesme?mesaj=sozlesme-kalemler`);
}

// Sözleşme taslağını siler (kopyası işlem geçmişine yazılır). Yalnızca satış müdürü.
export async function sozlesmeSil(id: string) {
  const kullanici = await yetki("sozlesmeSil", { id });
  if (!kullanici || kullanici.rol !== "ADMIN" || !id) return;
  const s = await prisma.sozlesme.delete({ where: { id }, select: { teklifId: true } });
  revalidatePath(`/panel/teklifler/${s.teklifId}`);
  redirect(`/panel/teklifler/${s.teklifId}?mesaj=sozlesme-silindi`);
}
