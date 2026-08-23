"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { suankiKullanici } from "@/lib/oturum";
import { paraBirimiDogrula, type ParaBirimi } from "@/lib/para";

// --- Yardımcı Sayı Formatlayıcı (Türkçe Virgülü Düzeltir) ---
function parseSayi(val: unknown): number {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "number") return val;
  const clean = val.toString().replace(",", ".").trim();
  return parseFloat(clean) || 0;
}

// --- Müşteriler ---

export async function musteriEkle(formData: FormData) {
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
    },
  });
  revalidatePath("/panel/musteriler");
  redirect(`/panel/musteriler/${musteri.id}`);
}

export async function musteriGuncelle(formData: FormData) {
  const musteriId = String(formData.get("musteriId") ?? "");
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
    },
  });
  revalidatePath(`/panel/musteriler/${musteriId}`);
  revalidatePath("/panel/musteriler");
}

// --- Teklifler ---

function kalemleriOku(formData: FormData) {
  const bolumler = formData.getAll("kalemBolum") as string[];
  const aciklamalar = formData.getAll("kalemAciklama") as string[];
  const adetler = formData.getAll("kalemAdet") as string[];
  const fiyatlar = formData.getAll("kalemFiyat") as string[];
  const iskontolar = formData.getAll("kalemIskonto") as string[];
  const markalar = formData.getAll("kalemMarka") as string[];

  return aciklamalar
    .map((aciklama, i) => ({
      bolum: bolumler[i] ? bolumler[i].trim() : "Genel Kalemler",
      aciklama: aciklama.trim(),
      adet: parseSayi(adetler[i]),
      birimFiyat: parseSayi(fiyatlar[i]),
      iskontoYuzde: parseSayi(iskontolar[i]),
      markaId: markalar[i] || null,
    }))
    .filter((k) => k.aciklama);
}

export async function teklifEkle(formData: FormData) {
  const kullanici = await suankiKullanici();
  const baslik = String(formData.get("baslik") ?? "").trim();
  const musteriId = String(formData.get("musteriId") ?? "");
  const projeId = String(formData.get("projeId") ?? "");
  const paraBirimi = String(formData.get("paraBirimi") ?? "TRY");
  const kdvOrani = parseSayi(formData.get("kdvOrani"));
  const kdvDahil = String(formData.get("kdvDurumu") ?? "haric") === "dahil";
  const gecerlilikGunu = parseSayi(formData.get("gecerlilikGunu")) || 15;
  const birimFiyatGoster = formData.get("birimFiyatGoster") !== "hayir";
  const sablonIds = formData.getAll("sablonIds") as string[];
  const kalemler = kalemleriOku(formData);

  if (!musteriId || !baslik || kalemler.length === 0) return;

  const teklif = await prisma.teklif.create({
    data: {
      baslik,
      musteriId,
      projeId: projeId || null,
      paraBirimi,
      kdvOrani,
      kdvDahil,
      gecerlilikGunu,
      birimFiyatGoster,
      olusturanKullaniciId: kullanici?.id || null,
      olusturanAdi: kullanici?.ad ?? "",
      kalemler: { create: kalemler },
      sablonlar: { connect: sablonIds.map((id) => ({ id })) },
    },
  });
  revalidatePath("/panel/teklifler");
  revalidatePath("/panel");
  redirect(`/panel/teklifler/${teklif.id}`);
}

export async function teklifGuncelle(formData: FormData) {
  const teklifId = String(formData.get("teklifId") ?? "");
  const baslik = String(formData.get("baslik") ?? "").trim();
  const musteriId = String(formData.get("musteriId") ?? "");
  const projeId = String(formData.get("projeId") ?? "");
  const paraBirimi = String(formData.get("paraBirimi") ?? "TRY");
  const kdvOrani = parseSayi(formData.get("kdvOrani"));
  const kdvDahil = String(formData.get("kdvDurumu") ?? "haric") === "dahil";
  const gecerlilikGunu = parseSayi(formData.get("gecerlilikGunu")) || 15;
  const birimFiyatGoster = formData.get("birimFiyatGoster") !== "hayir";
  const sablonIds = formData.getAll("sablonIds") as string[];
  const kalemler = kalemleriOku(formData);

  if (!teklifId || !musteriId || !baslik || kalemler.length === 0) return;

  const mevcut = await prisma.teklif.findUnique({
    where: { id: teklifId },
    include: { kalemler: true, sablonlar: true },
  });
  if (!mevcut) return;

  await prisma.teklifRevizyon.create({
    data: {
      teklifId,
      revizyonNo: mevcut.revizyonNo,
      veriJson: JSON.stringify({
        baslik: mevcut.baslik,
        paraBirimi: mevcut.paraBirimi,
        kdvOrani: mevcut.kdvOrani,
        kdvDahil: mevcut.kdvDahil,
        kalemler: mevcut.kalemler,
      }),
    },
  });

  await prisma.teslimKaydi.deleteMany({ where: { teklifKalem: { teklifId } } });
  await prisma.sevkiyatKaydi.deleteMany({ where: { teklifKalem: { teklifId } } });
  await prisma.teklifKalem.deleteMany({ where: { teklifId } });

  await prisma.teklif.update({
    where: { id: teklifId },
    data: {
      baslik,
      musteriId,
      projeId: projeId || null,
      paraBirimi,
      kdvOrani,
      kdvDahil,
      gecerlilikGunu,
      birimFiyatGoster,
      revizyonNo: mevcut.revizyonNo + 1,
      kalemler: { create: kalemler },
      sablonlar: { set: sablonIds.map((id) => ({ id })) },
    },
  });

  revalidatePath("/panel/teklifler");
  revalidatePath(`/panel/teklifler/${teklifId}`);
  revalidatePath("/panel");
  redirect(`/panel/teklifler/${teklifId}`);
}

export async function teklifDurumGuncelle(teklifId: string, durum: "BEKLEMEDE" | "ONAYLANDI" | "REDDEDILDI") {
  await prisma.teklif.update({ where: { id: teklifId }, data: { durum } });
  revalidatePath("/panel/teklifler");
  revalidatePath(`/panel/teklifler/${teklifId}`);
  revalidatePath("/panel");
}

export async function teklifSil(teklifId: string) {
  const siparis = await prisma.siparis.findUnique({
    where: { teklifId },
    select: { id: true },
  });

  if (siparis) {
    await prisma.teslimKaydi.deleteMany({ where: { siparisId: siparis.id } });
    await prisma.sevkiyatKaydi.deleteMany({ where: { siparisId: siparis.id } });
    await prisma.siparis.delete({ where: { id: siparis.id } });
  }

  await prisma.kesifFormu.updateMany({
    where: { olusturulanTeklifId: teklifId },
    data: { olusturulanTeklifId: null },
  });

  await prisma.teklif.delete({ where: { id: teklifId } });

  revalidatePath("/panel/teklifler");
  revalidatePath("/panel");
}

// --- Cari Hesap (Müşteri) ---

export async function cariHareketEkle(formData: FormData) {
  const musteriId = String(formData.get("musteriId") ?? "");
  const aciklama = String(formData.get("aciklama") ?? "").trim();
  const tur = String(formData.get("tur") ?? "BORC") as "BORC" | "ALACAK";
  const tutar = parseSayi(formData.get("tutar"));
  const odemeYontemi = String(formData.get("odemeYontemi") ?? "").trim();
  const odemeDetay = String(formData.get("odemeDetay") ?? "").trim();
  const vadeTarihiStr = String(formData.get("vadeTarihi") ?? "");
  const cekNo = String(formData.get("cekNo") ?? "").trim();
  const banka = String(formData.get("banka") ?? "").trim();
  const dosya = formData.get("evrak") as File | null;

  if (!musteriId || !aciklama || tutar <= 0) return;

  let evrakDosya: Buffer | undefined;
  let evrakDosyaAdi: string | undefined;
  let evrakDosyaTipi: string | undefined;

  if (dosya && dosya.size > 0) {
    evrakDosya = Buffer.from(await dosya.arrayBuffer());
    evrakDosyaAdi = dosya.name;
    evrakDosyaTipi = dosya.type || "application/pdf";
  }

  await prisma.cariHareket.create({
    data: {
      musteriId,
      aciklama,
      tur,
      tutar,
      odemeYontemi: odemeYontemi || null,
      odemeDetay: odemeDetay || null,
      vadeTarihi: vadeTarihiStr ? new Date(vadeTarihiStr) : null,
      cekNo: cekNo || null,
      banka: banka || null,
      evrakDosya,
      evrakDosyaAdi,
      evrakDosyaTipi,
    },
  });

  revalidatePath("/panel/cari");
  revalidatePath(`/panel/musteriler/${musteriId}`);
  revalidatePath("/panel");
}

export async function cariHareketSil(hareketId: string) {
  await prisma.cariHareket.delete({ where: { id: hareketId } });
  revalidatePath("/panel/cari");
  revalidatePath("/panel");
}

// --- Satınalma: Tedarikçi Cari ---

export async function tedarikciHareketEkle(formData: FormData) {
  const tedarikciId = String(formData.get("tedarikciId") ?? "");
  const aciklama = String(formData.get("aciklama") ?? "").trim();
  const tur = String(formData.get("tur") ?? "BORC") as "BORC" | "ODEME";
  const tutar = parseSayi(formData.get("tutar"));
  const vadeTarihiStr = String(formData.get("vadeTarihi") ?? "");
  const cekNo = String(formData.get("cekNo") ?? "").trim();
  const banka = String(formData.get("banka") ?? "").trim();
  const dosya = formData.get("evrak") as File | null;

  if (!tedarikciId || !aciklama || tutar <= 0) return;

  let evrakDosya: Buffer | undefined;
  let evrakDosyaAdi: string | undefined;
  let evrakDosyaTipi: string | undefined;

  if (dosya && dosya.size > 0) {
    evrakDosya = Buffer.from(await dosya.arrayBuffer());
    evrakDosyaAdi = dosya.name;
    evrakDosyaTipi = dosya.type || "application/pdf";
  }

  await prisma.tedarikciHareket.create({
    data: {
      tedarikciId,
      aciklama,
      tur,
      tutar,
      vadeTarihi: vadeTarihiStr ? new Date(vadeTarihiStr) : null,
      cekNo: cekNo || null,
      banka: banka || null,
      evrakDosya,
      evrakDosyaAdi,
      evrakDosyaTipi,
    },
  });

  revalidatePath("/panel/satinalma/cari");
  revalidatePath("/panel");
}

export async function tedarikciHareketSil(id: string) {
  await prisma.tedarikciHareket.delete({ where: { id } });
  revalidatePath("/panel/satinalma/cari");
}

// --- AKILLI STOK VEYA KATALOG GİRİŞİ (WAC - AĞIRLIKLI ORTALAMA MALİYET HESAPLI) ---

// AKILLI STOK GİRİŞİ VEYA KATALOG KAYDI
export async function stokGirisiEkle(formData: FormData) {
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
  const giren = await suankiKullanici();
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

  await prisma.sirketAyarlari.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      unvan,
      slogan: slogan || null,
      adres: adres || null,
      telefon: telefon || null,
      email: email || null,
      web: web || null,
      vergiDairesi: vergiDairesi || null,
      vergiNo: vergiNo || null,
    },
    update: {
      unvan,
      slogan: slogan || null,
      adres: adres || null,
      telefon: telefon || null,
      email: email || null,
      web: web || null,
      vergiDairesi: vergiDairesi || null,
      vergiNo: vergiNo || null,
    },
  });

  revalidatePath("/panel/ayarlar/sirket");
  revalidatePath("/panel/teklifler");
  revalidatePath("/panel");
}

// --- Ayarlar (Teklif Şablonları) ---

export async function sablonEkle(formData: FormData) {
  const baslik = String(formData.get("baslik") ?? "").trim();
  const icerik = String(formData.get("icerik") ?? "").trim();
  const sira = parseSayi(formData.get("sira"));
  if (!baslik) return;

  await prisma.teklifSablon.create({ data: { baslik, icerik, sira } });
  revalidatePath("/panel/ayarlar");
}

export async function sablonGuncelle(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const baslik = String(formData.get("baslik") ?? "").trim();
  const icerik = String(formData.get("icerik") ?? "").trim();
  const sira = parseSayi(formData.get("sira"));
  if (!id || !baslik) return;

  await prisma.teklifSablon.update({ where: { id }, data: { baslik, icerik, sira } });
  revalidatePath("/panel/ayarlar");
}

export async function sablonSil(id: string) {
  await prisma.teklifSablon.delete({ where: { id } });
  revalidatePath("/panel/ayarlar");
}

// --- Kullanıcılar ---

export async function kullaniciEkle(formData: FormData) {
  const giren = await suankiKullanici();
  if (!giren || giren.rol !== "ADMIN") return;

  const ad = String(formData.get("ad") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const sifre = String(formData.get("sifre") ?? "");
  const rol = String(formData.get("rol") ?? "SATIS") as "ADMIN" | "SATIS";
  if (!ad || !email || sifre.length < 6) return;

  const sifreHash = await bcrypt.hash(sifre, 10);
  await prisma.kullanici.create({
    data: { ad, email, telefon: telefon || null, sifreHash, rol },
  });
  revalidatePath("/panel/kullanicilar");
}

export async function kullaniciSil(id: string) {
  const giren = await suankiKullanici();
  if (!giren || giren.rol !== "ADMIN") return;
  if (giren.id === id) return;

  await prisma.kullanici.delete({ where: { id } });
  revalidatePath("/panel/kullanicilar");
}

export async function kullaniciSifreSifirla(formData: FormData) {
  const giren = await suankiKullanici();
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

export async function siparisTalebiOlustur(formData: FormData) {
  const teklifId = String(formData.get("teklifId") ?? "");
  const kur = parseSayi(formData.get("kur")) || 1;
  const ekNot = String(formData.get("ekNot") ?? "").trim();
  const sevkAdresi = String(formData.get("sevkAdresi") ?? "").trim();
  const dosya = formData.get("sozlesmeDosyasi") as File | null;
  const kullanici = await suankiKullanici();
  if (!teklifId) return;

  const teklif = await prisma.teklif.findUnique({ where: { id: teklifId } });
  if (!teklif) return;

  let sozlesmeDosya: Buffer | undefined;
  let sozlesmeDosyaAdi: string | undefined;
  let sozlesmeDosyaTipi: string | undefined;
  if (dosya && dosya.size > 0) {
    sozlesmeDosya = Buffer.from(await dosya.arrayBuffer());
    sozlesmeDosyaAdi = dosya.name;
    sozlesmeDosyaTipi = dosya.type || "application/pdf";
  }

  const siparis = await prisma.siparis.create({
    data: {
      teklifId,
      musteriId: teklif.musteriId,
      kur: teklif.paraBirimi === "TRY" ? 1 : kur,
      ekNot,
      sevkAdresi: sevkAdresi || null,
      sozlesmeDosya,
      sozlesmeDosyaAdi,
      sozlesmeDosyaTipi,
      olusturanKullaniciId: kullanici?.id || null,
      olusturanAdi: kullanici?.ad ?? "",
    },
  });
  revalidatePath("/panel/siparisler");
  revalidatePath(`/panel/teklifler/${teklifId}`);
  redirect(`/panel/siparisler/${siparis.id}`);
}

export async function siparisOnayla(siparisId: string) {
  const giren = await suankiKullanici();
  if (!giren || giren.rol !== "ADMIN") return;

  const siparis = await prisma.siparis.findUnique({
    where: { id: siparisId },
    include: { teklif: { include: { kalemler: true } } },
  });
  if (!siparis || siparis.durum !== "ONAY_BEKLIYOR") return;

  const toplam = siparis.teklif.kalemler.reduce((a, k) => {
    const satir = k.adet * k.birimFiyat * (1 - k.iskontoYuzde / 100);
    return a + satir;
  }, 0);
  const kdvli = siparis.teklif.kdvDahil ? toplam : toplam * (1 + siparis.teklif.kdvOrani / 100);
  const tlTutar = siparis.teklif.paraBirimi === "TRY" ? kdvli : kdvli * siparis.kur;

  await prisma.$transaction([
    prisma.siparis.update({
      where: { id: siparisId },
      data: { durum: "HAZIRLANIYOR", onaylayanAdi: giren.ad, onayTarihi: new Date() },
    }),
    prisma.cariHareket.create({
      data: {
        musteriId: siparis.musteriId,
        aciklama: `Sipariş Onayı: ${siparis.teklif.baslik || siparis.teklifId}`,
        tur: "BORC",
        tutar: tlTutar,
      },
    }),
  ]);

  revalidatePath("/panel/siparisler");
  revalidatePath("/panel/cari");
}

export async function siparisReddet(formData: FormData) {
  const giren = await suankiKullanici();
  if (!giren || giren.rol !== "ADMIN") return;

  const siparisId = String(formData.get("siparisId") ?? "");
  const redSebebi = String(formData.get("redSebebi") ?? "").trim();
  if (!siparisId) return;

  await prisma.siparis.update({
    where: { id: siparisId },
    data: { durum: "REDDEDILDI", redSebebi },
  });
  revalidatePath("/panel/siparisler");
  revalidatePath(`/panel/siparisler/${siparisId}`);
}

export async function siparisDurumGuncelle(
  siparisId: string,
  durum: "HAZIRLANIYOR" | "IPTAL"
) {
  await prisma.siparis.update({ where: { id: siparisId }, data: { durum } });
  revalidatePath("/panel/siparisler");
  revalidatePath(`/panel/siparisler/${siparisId}`);
}

export async function siparisSil(siparisId: string) {
  await prisma.siparis.delete({ where: { id: siparisId } });
  revalidatePath("/panel/siparisler");
  revalidatePath("/panel");
}

export async function siparisFaturaGuncelle(formData: FormData) {
  const siparisId = String(formData.get("siparisId") ?? "");
  const faturaNo = String(formData.get("faturaNo") ?? "").trim();
  const faturaTarihiStr = String(formData.get("faturaTarihi") ?? "");
  if (!siparisId || !faturaNo) return;

  await prisma.siparis.update({
    where: { id: siparisId },
    data: {
      faturaNo,
      faturaTarihi: faturaTarihiStr ? new Date(faturaTarihiStr) : new Date(),
      durum: "FATURALANDI",
    },
  });
  revalidatePath(`/panel/siparisler/${siparisId}`);
  revalidatePath("/panel/siparisler");
}

export async function sevkiyatEkle(formData: FormData) {
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
  const kayit = await prisma.sevkiyatKaydi.delete({ where: { id } });
  revalidatePath(`/panel/siparisler/${kayit.siparisId}`);
  revalidatePath("/panel/siparisler");
}

export async function teslimKaydiEkle(formData: FormData) {
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
  const kayit = await prisma.teslimKaydi.delete({ where: { id } });
  revalidatePath(`/panel/siparisler/${kayit.siparisId}`);
  revalidatePath("/panel/siparisler");
}

// --- Satınalma: Tedarikçiler ---

export async function tedarikciEkle(formData: FormData) {
  const ad = String(formData.get("ad") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const vergiNo = String(formData.get("vergiNo") ?? "").trim();
  const adres = String(formData.get("adres") ?? "").trim();
  if (!ad) return;

  await prisma.tedarikci.create({
    data: { ad, telefon: telefon || null, vergiNo: vergiNo || null, adres: adres || null },
  });
  revalidatePath("/panel/satinalma");
}

// --- Satınalma: Gelen Teklifler ---

export async function satinalmaTeklifiEkle(formData: FormData) {
  const tedarikciId = String(formData.get("tedarikciId") ?? "");
  const baslik = String(formData.get("baslik") ?? "").trim();
  const paraBirimi = String(formData.get("paraBirimi") ?? "TRY");
  const aciklamalar = formData.getAll("kalemAciklama") as string[];
  const adetler = formData.getAll("kalemAdet") as string[];
  const fiyatlar = formData.getAll("kalemFiyat") as string[];

  const kalemler = aciklamalar
    .map((aciklama, i) => ({
      aciklama: aciklama.trim(),
      adet: parseSayi(adetler[i]),
      birimFiyat: parseSayi(fiyatlar[i]),
    }))
    .filter((k) => k.aciklama);

  if (!tedarikciId || !baslik || kalemler.length === 0) return;

  const satinalmaTeklifi = await prisma.satinalmaTeklifi.create({
    data: { tedarikciId, baslik, paraBirimi, kalemler: { create: kalemler } },
  });
  revalidatePath("/panel/satinalma/teklifler");
  redirect(`/panel/satinalma/teklifler/${satinalmaTeklifi.id}`);
}

export async function satinalmaTeklifiSil(id: string) {
  await prisma.satinalmaTeklifi.delete({ where: { id } });
  revalidatePath("/panel/satinalma/teklifler");
}

export async function satinalmaTeklifiniDonustur(formData: FormData) {
  const kullanici = await suankiKullanici();
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

  const teklif = await prisma.teklif.create({
    data: {
      baslik,
      musteriId,
      paraBirimi: kaynak.paraBirimi,
      olusturanKullaniciId: kullanici?.id || null,
      olusturanAdi: kullanici?.ad ?? "",
      kaynakSatinalmaTeklifiId: satinalmaTeklifiId,
      kalemler: {
        create: kaynak.kalemler.map((k) => ({
          aciklama: k.aciklama,
          adet: k.adet,
          birimFiyat: k.birimFiyat * (1 + marjYuzdesi / 100),
        })),
      },
    },
  });

  revalidatePath("/panel/teklifler");
  redirect(`/panel/teklifler/${teklif.id}`);
}

// --- Keşif ---

export async function kesifEkle(formData: FormData) {
  const kullanici = await suankiKullanici();
  const musteriAdi = String(formData.get("musteriAdi") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const adres = String(formData.get("adres") ?? "").trim();
  const alanM2Str = String(formData.get("alanM2") ?? "");
  const mevcutSistem = String(formData.get("mevcutSistem") ?? "").trim();
  const notlar = String(formData.get("notlar") ?? "").trim();

  if (!musteriAdi || !notlar) return;

  await prisma.kesifFormu.create({
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
  revalidatePath("/panel/kesif");
}

export async function kesifSil(id: string) {
  await prisma.kesifFormu.delete({ where: { id } });
  revalidatePath("/panel/kesif");
}

export async function kesifiTeklifeDonustur(formData: FormData) {
  const kullanici = await suankiKullanici();
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
  await prisma.webTalebi.update({ where: { id }, data: { okundu: true } });
  revalidatePath("/panel/talepler");
}

export async function webTalebiSil(id: string) {
  await prisma.webTalebi.delete({ where: { id } });
  revalidatePath("/panel/talepler");
}

// --- Markalar ---

export async function markaEkle(formData: FormData) {
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
  await prisma.marka.delete({ where: { id } });
  revalidatePath("/panel/ayarlar/markalar");
}

// --- Ürün Kataloğu ---

export async function urunEkle(formData: FormData) {
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

export async function urunSil(id: string) {
  await prisma.urun.delete({ where: { id } });
  revalidatePath("/panel/ayarlar/urunler");
}

export async function urunlerTumunuSil() {
  await prisma.urun.deleteMany({});
  revalidatePath("/panel/ayarlar/urunler");
}

type UrunSatiriSonuc =
  | { basarili: true; eklenen: number; guncellenen: number; atlanan: number }
  | { basarili: false; hata: string };

export async function urunlerExcelIceAktar(formData: FormData): Promise<UrunSatiriSonuc> {
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

export async function projeEkle(formData: FormData) {
  const kullanici = await suankiKullanici();
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
  revalidatePath("/panel/projeler");
  redirect(`/panel/projeler/${proje.id}`);
}

export async function projeGuncelle(formData: FormData) {
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
  revalidatePath(`/panel/projeler/${projeId}`);
  revalidatePath("/panel/projeler");
}

export async function projeSil(id: string) {
  await prisma.proje.delete({ where: { id } });
  revalidatePath("/panel/projeler");
}

// --- Ziyaret Modülü ---

export async function ziyaretEkle(formData: FormData) {
  const kullanici = await suankiKullanici();
  const musteriId = String(formData.get("musteriId") ?? "");
  const projeId = String(formData.get("projeId") ?? "");
  const tarihStr = String(formData.get("tarih") ?? "");
  const not = String(formData.get("not") ?? "").trim();
  const hatirlatmaTarihiStr = String(formData.get("hatirlatmaTarihi") ?? "");
  const hatirlatmaNotu = String(formData.get("hatirlatmaNotu") ?? "").trim();
  if (!not || (!musteriId && !projeId)) return;

  await prisma.ziyaret.create({
    data: {
      musteriId: musteriId || null,
      projeId: projeId || null,
      tarih: tarihStr ? new Date(tarihStr) : new Date(),
      not,
      hatirlatmaTarihi: hatirlatmaTarihiStr ? new Date(hatirlatmaTarihiStr) : null,
      hatirlatmaNotu: hatirlatmaNotu || null,
      olusturanAdi: kullanici?.ad ?? "",
    },
  });

  if (musteriId) revalidatePath(`/panel/musteriler/${musteriId}`);
  if (projeId) revalidatePath(`/panel/projeler/${projeId}`);
  revalidatePath("/panel/ziyaretler");
  revalidatePath("/panel");
}

export async function ziyaretHatirlatmaTamamlandi(id: string) {
  await prisma.ziyaret.update({ where: { id }, data: { hatirlatmaTamam: true } });
  revalidatePath("/panel/ziyaretler");
  revalidatePath("/panel");
}

export async function ziyaretSil(id: string) {
  const ziyaret = await prisma.ziyaret.delete({ where: { id } });
  if (ziyaret.musteriId) revalidatePath(`/panel/musteriler/${ziyaret.musteriId}`);
  if (ziyaret.projeId) revalidatePath(`/panel/projeler/${ziyaret.projeId}`);
  revalidatePath("/panel/ziyaretler");
  revalidatePath("/panel");
}

// --- PROFİL VE ŞİFRE GÜNCELLEME ---
export async function profilGuncelle(formData: FormData) {
  const giren = await suankiKullanici();
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