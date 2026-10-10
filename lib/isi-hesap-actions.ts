"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { girisZorunlu } from "@/lib/oturum";
import { islemKaydet } from "@/lib/islem-kaydi";
import { veriOku, varsayilanVeri, ornekDaire } from "@/lib/isi-hesap/tipler";
import { aktifPompaModelleri } from "@/lib/isi-hesap/modeller-db";
import { sistemiHesapla } from "@/lib/isi-hesap/hesap";
import { ILLER } from "@/lib/isi-hesap/iklim";

// -----------------------------------------------------------------------------
// ISI POMPASI HESABI — sunucu işlemleri
// Her işlem giriş kontrolü yapar ve İşlem Geçmişi'ne yazılır.
// -----------------------------------------------------------------------------

async function yetki(islem: string, girdi?: FormData | Record<string, unknown>) {
  const kullanici = await girisZorunlu();
  await islemKaydet(kullanici, islem, girdi);
  return kullanici;
}

const metinAl = (v: unknown, maks = 200) => (typeof v === "string" ? v.trim().slice(0, maks) : "");

function sayiAl(v: unknown, varsayilan: number | null = null): number | null {
  if (v === null || v === undefined) return varsayilan;
  const t = String(v).replace(",", ".").trim();
  if (!t) return varsayilan;
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : varsayilan;
}

async function musteriDogrula(id: string): Promise<string | null> {
  if (!id) return null;
  const m = await prisma.musteri.findUnique({ where: { id }, select: { id: true } });
  return m ? m.id : null;
}

// --- Hesaplar ---------------------------------------------------------------

export async function isiHesapOlustur(formData: FormData) {
  const kullanici = await yetki("isiHesapOlustur", formData);
  const ad = metinAl(formData.get("ad"), 200);
  if (!ad) redirect("/panel/isi-hesabi?mesaj=isi-hesap-eksik");
  const il = ILLER.some((i) => i.ad === formData.get("il")) ? String(formData.get("il")) : "İstanbul";
  const musteriId = await musteriDogrula(metinAl(formData.get("musteriId"), 40));
  const veri = varsayilanVeri(il);
  if (formData.get("sablon") === "ornek") veri.odalar = ornekDaire();
  const hesap = await prisma.isiHesap.create({
    data: {
      ad,
      il,
      musteriId,
      veri: JSON.stringify(veri),
      toplamKw: sistemiHesapla(veri).tasarimYuku / 1000,
      olusturanKullaniciId: kullanici?.id ?? null,
      olusturanAdi: kullanici?.ad ?? "",
    },
    select: { id: true },
  });
  revalidatePath("/panel/isi-hesabi");
  redirect(`/panel/isi-hesabi/${hesap.id}`);
}

export type KayitSonucu = { ok: true; zaman: string } | { ok: false; hata: string };

// Düzenleme ekranından (sayfa yenilenmeden) çağrılır
export async function isiHesapKaydet(girdi: { id: string; ad: string; musteriId: string; veri: string }): Promise<KayitSonucu> {
  const id = metinAl(girdi?.id, 40);
  const ad = metinAl(girdi?.ad, 200);
  const hamVeri = typeof girdi?.veri === "string" ? girdi.veri : "";
  await yetki("isiHesapKaydet", { id, ad, musteriId: metinAl(girdi?.musteriId, 40), veriBoyutu: hamVeri.length });
  if (!id) return { ok: false, hata: "Hesap bulunamadı." };
  if (!ad) return { ok: false, hata: "Hesap adı boş olamaz." };
  if (hamVeri.length > 600_000) return { ok: false, hata: "Hesap çok büyük (oda / eleman sayısını azaltın)." };
  const mevcut = await prisma.isiHesap.findUnique({ where: { id }, select: { id: true } });
  if (!mevcut) return { ok: false, hata: "Hesap bulunamadı (silinmiş olabilir)." };
  const veri = veriOku(hamVeri);
  const musteriId = await musteriDogrula(metinAl(girdi?.musteriId, 40));
  try {
    await prisma.isiHesap.update({
      where: { id },
      data: { ad, musteriId, il: veri.il, veri: JSON.stringify(veri), toplamKw: sistemiHesapla(veri).tasarimYuku / 1000 },
    });
  } catch (hata) {
    console.error("[isiHesapKaydet]", hata);
    return { ok: false, hata: "Kayıt sırasında hata oluştu; tekrar deneyin." };
  }
  revalidatePath("/panel/isi-hesabi");
  return { ok: true, zaman: new Date().toISOString() };
}

export async function isiHesapKopyala(id: string) {
  const kullanici = await yetki("isiHesapKopyala", { id });
  const kaynak = await prisma.isiHesap.findUnique({ where: { id } });
  if (!kaynak) return;
  const yeni = await prisma.isiHesap.create({
    data: {
      ad: `${kaynak.ad} (kopya)`.slice(0, 200),
      il: kaynak.il,
      musteriId: kaynak.musteriId,
      veri: kaynak.veri,
      toplamKw: kaynak.toplamKw,
      olusturanKullaniciId: kullanici?.id ?? null,
      olusturanAdi: kullanici?.ad ?? "",
    },
    select: { id: true },
  });
  revalidatePath("/panel/isi-hesabi");
  redirect(`/panel/isi-hesabi/${yeni.id}?mesaj=isi-hesap-kopyalandi`);
}

export async function isiHesapSil(id: string) {
  await yetki("isiHesapSil", { id });
  await prisma.isiHesap.delete({ where: { id } });
  revalidatePath("/panel/isi-hesabi");
}

// Hesabın malzeme listesinden yeni teklif taslağı oluşturur (fiyatlar teklifte girilir)
export async function isiHesapTeklifeAktar(formData: FormData) {
  const kullanici = await yetki("isiHesapTeklifeAktar", formData);
  const hesapId = metinAl(formData.get("hesapId"), 40);
  const musteriId = await musteriDogrula(metinAl(formData.get("musteriId"), 40));
  const baslik = metinAl(formData.get("baslik"), 200);
  if (!hesapId) return;
  if (!musteriId || !baslik) redirect(`/panel/isi-hesabi/${hesapId}?mesaj=isi-hesap-teklif-eksik`);
  const hesap = await prisma.isiHesap.findUnique({ where: { id: hesapId } });
  if (!hesap) redirect("/panel/isi-hesabi");

  const veri = veriOku(hesap.veri);
  const sonuc = sistemiHesapla(veri, await aktifPompaModelleri());
  if (!sonuc.malzemeler.length) redirect(`/panel/isi-hesabi/${hesapId}?mesaj=isi-hesap-teklif-eksik`);

  // Isı pompası ürün kataloğuna bağlıysa fiyatı ve markası teklife gelir
  const urunIdleri = Array.from(new Set(sonuc.malzemeler.map((m) => m.urunId).filter(Boolean))) as string[];
  const urunler = urunIdleri.length
    ? await prisma.urun.findMany({ where: { id: { in: urunIdleri } }, select: { id: true, listeFiyati: true, paraBirimi: true, markaId: true } })
    : [];
  const urunMap = new Map(urunler.map((u) => [u.id, u]));
  const paraBirimi = urunler[0]?.paraBirimi ?? "TRY";

  const kalemler = sonuc.malzemeler.map((m, sira) => {
    const u = m.urunId ? urunMap.get(m.urunId) : undefined;
    // Teklif kaleminde birim sütunu yok; ölçü birimli kalemlerde açıklamaya eklenir
    const birimEk = ["m", "m²", "kg", "L"].includes(m.birim) ? ` (${m.birim})` : "";
    return {
      bolum: m.bolum,
      aciklama: (m.aciklama + birimEk).slice(0, 500),
      adet: m.adet,
      birimFiyat: u && u.paraBirimi === paraBirimi ? u.listeFiyati : 0,
      markaId: u?.markaId ?? null,
      sira,
    };
  });

  const simdi = new Date();
  const teklif = await prisma.teklif.create({
    data: {
      baslik,
      musteriId,
      paraBirimi,
      olusturanKullaniciId: kullanici?.id || null,
      olusturanAdi: kullanici?.ad ?? "",
      tarih: simdi,
      ilkTarih: simdi,
      kalemler: { create: kalemler },
    },
    select: { id: true },
  });
  await prisma.isiHesap.update({ where: { id: hesapId }, data: { teklifId: teklif.id, musteriId } });
  revalidatePath("/panel/teklifler");
  revalidatePath("/panel/isi-hesabi");
  redirect(`/panel/teklifler/${teklif.id}/duzenle?mesaj=isi-hesap-teklif`);
}

// --- Isı pompası model kataloğu --------------------------------------------

export async function isiPompasiModeliKaydet(formData: FormData) {
  await yetki("isiPompasiModeliKaydet", formData);
  const id = metinAl(formData.get("id"), 40);
  const marka = metinAl(formData.get("marka"), 80);
  const model = metinAl(formData.get("model"), 120);
  const a7 = sayiAl(formData.get("kapA7W35"));
  const m7 = sayiAl(formData.get("kapAm7W35"));
  const m755 = sayiAl(formData.get("kapAm7W55"));
  const m15 = sayiAl(formData.get("kapAm15W35"));
  const gecerli = (x: number | null, min: number, maks: number) => x !== null && x >= min && x <= maks;
  if (!marka || !model || !gecerli(a7, 0.5, 500) || !gecerli(m7, 0.3, 500) || !gecerli(m755, 0.3, 500) || (m15 !== null && !gecerli(m15, 0.1, 500))) {
    redirect("/panel/isi-hesabi/modeller?mesaj=isi-modeli-eksik");
  }
  const urunHam = metinAl(formData.get("urunId"), 40);
  const urunId = urunHam ? (await prisma.urun.findUnique({ where: { id: urunHam }, select: { id: true } }))?.id ?? null : null;
  const veri = {
    marka,
    model,
    kapA7W35: a7!,
    kapAm7W35: m7!,
    kapAm7W55: m755!,
    kapAm15W35: m15,
    minDisSicaklik: Math.min(15, Math.max(-40, sayiAl(formData.get("minDisSicaklik"), -20)!)),
    maksCikis: Math.min(90, Math.max(30, sayiAl(formData.get("maksCikis"), 60)!)),
    yedekIsiticiKw: Math.min(100, Math.max(0, sayiAl(formData.get("yedekIsiticiKw"), 0)!)),
    urunId,
    aciklama: metinAl(formData.get("aciklama"), 500) || null,
    aktif: formData.get("aktif") !== "hayir",
  };
  if (id) await prisma.isiPompasiModeli.update({ where: { id }, data: veri });
  else await prisma.isiPompasiModeli.create({ data: veri });
  revalidatePath("/panel/isi-hesabi/modeller");
  redirect("/panel/isi-hesabi/modeller?mesaj=kaydedildi");
}

export async function isiPompasiModeliSil(id: string) {
  await yetki("isiPompasiModeliSil", { id });
  await prisma.isiPompasiModeli.delete({ where: { id } });
  revalidatePath("/panel/isi-hesabi/modeller");
}
