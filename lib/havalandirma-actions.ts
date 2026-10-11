"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { girisZorunlu } from "@/lib/oturum";
import { islemKaydet } from "@/lib/islem-kaydi";
import { veriOku, varsayilanVeri, ornekOfis, ornekDaire, yeniMahal, yeniSantral, mekandanMahal } from "@/lib/havalandirma/tipler";
import { klimaVeriOku } from "@/lib/klima-hesap/tipler";
import { havalandirmaHesapla } from "@/lib/havalandirma/hesap";
import { ILLER } from "@/lib/isi-hesap/iklim";

// -----------------------------------------------------------------------------
// HAVALANDIRMA HESABI — sunucu işlemleri (giriş kontrolü + İşlem Geçmişi)
// -----------------------------------------------------------------------------

async function yetki(islem: string, girdi?: FormData | Record<string, unknown>) {
  const kullanici = await girisZorunlu();
  await islemKaydet(kullanici, islem, girdi);
  return kullanici;
}

const metinAl = (v: unknown, maks = 200) => (typeof v === "string" ? v.trim().slice(0, maks) : "");

async function musteriDogrula(id: string): Promise<string | null> {
  if (!id) return null;
  const m = await prisma.musteri.findUnique({ where: { id }, select: { id: true } });
  return m ? m.id : null;
}

export async function havalandirmaHesapOlustur(formData: FormData) {
  const kullanici = await yetki("havalandirmaHesapOlustur", formData);
  const ad = metinAl(formData.get("ad"), 200);
  if (!ad) redirect("/panel/havalandirma-hesabi?mesaj=havalandirma-hesap-eksik");
  let il = ILLER.some((i) => i.ad === formData.get("il")) ? String(formData.get("il")) : "İstanbul";
  let musteriId = await musteriDogrula(metinAl(formData.get("musteriId"), 40));
  const veri = varsayilanVeri(il);
  const sablon = String(formData.get("sablon") ?? "");
  if (sablon === "ofis") veri.mahaller = ornekOfis();
  if (sablon === "daire") {
    veri.santraller = [yeniSantral(1, "KONUT_HRV")];
    veri.mahaller = ornekDaire();
  }
  // Klima / VRF hesabındaki odalar mahal olarak aktarılabilir
  const kaynakId = metinAl(formData.get("kaynakKlimaHesapId"), 40);
  if (sablon === "klima" && kaynakId) {
    const kaynak = await prisma.klimaHesap.findUnique({ where: { id: kaynakId }, select: { veri: true, musteriId: true } });
    if (kaynak) {
      const kv = klimaVeriOku(kaynak.veri);
      il = kv.il;
      veri.il = kv.il;
      veri.disSicaklikElle = kv.disSicaklikElle;
      veri.yazKTElle = kv.yazKTElle;
      veri.yazYTElle = kv.yazYTElle;
      veri.adres = kv.adres;
      veri.mahaller = kv.odalar.map((o) =>
        yeniMahal(mekandanMahal(o.mekan), { ad: o.ad, en: o.en, boy: o.boy, yukseklik: Math.min(30, Math.max(1.8, o.yukseklik)), kisi: o.kisi > 0 ? o.kisi : 0 })
      );
      musteriId = musteriId ?? kaynak.musteriId;
    }
  }
  const hesap = await prisma.havalandirmaHesap.create({
    data: {
      ad,
      il,
      musteriId,
      veri: JSON.stringify(veri),
      toplamDebi: havalandirmaHesapla(veri).toplamBesleme,
      olusturanKullaniciId: kullanici?.id ?? null,
      olusturanAdi: kullanici?.ad ?? "",
    },
    select: { id: true },
  });
  revalidatePath("/panel/havalandirma-hesabi");
  redirect(`/panel/havalandirma-hesabi/${hesap.id}`);
}

export type HavalandirmaKayitSonucu = { ok: true; zaman: string } | { ok: false; hata: string };

export async function havalandirmaHesapKaydet(girdi: { id: string; ad: string; musteriId: string; veri: string }): Promise<HavalandirmaKayitSonucu> {
  const id = metinAl(girdi?.id, 40);
  const ad = metinAl(girdi?.ad, 200);
  const hamVeri = typeof girdi?.veri === "string" ? girdi.veri : "";
  await yetki("havalandirmaHesapKaydet", { id, ad, musteriId: metinAl(girdi?.musteriId, 40), veriBoyutu: hamVeri.length });
  if (!id) return { ok: false, hata: "Hesap bulunamadı." };
  if (!ad) return { ok: false, hata: "Hesap adı boş olamaz." };
  if (hamVeri.length > 800_000) return { ok: false, hata: "Hesap çok büyük (mahal sayısını azaltın)." };
  const mevcut = await prisma.havalandirmaHesap.findUnique({ where: { id }, select: { id: true } });
  if (!mevcut) return { ok: false, hata: "Hesap bulunamadı (silinmiş olabilir)." };
  const veri = veriOku(hamVeri);
  const musteriId = await musteriDogrula(metinAl(girdi?.musteriId, 40));
  try {
    await prisma.havalandirmaHesap.update({
      where: { id },
      data: { ad, musteriId, il: veri.il, veri: JSON.stringify(veri), toplamDebi: havalandirmaHesapla(veri).toplamBesleme },
    });
  } catch (hata) {
    console.error("[havalandirmaHesapKaydet]", hata);
    return { ok: false, hata: "Kayıt sırasında hata oluştu; tekrar deneyin." };
  }
  revalidatePath("/panel/havalandirma-hesabi");
  return { ok: true, zaman: new Date().toISOString() };
}

export async function havalandirmaHesapKopyala(id: string) {
  const kullanici = await yetki("havalandirmaHesapKopyala", { id });
  const kaynak = await prisma.havalandirmaHesap.findUnique({ where: { id } });
  if (!kaynak) return;
  const yeni = await prisma.havalandirmaHesap.create({
    data: {
      ad: `${kaynak.ad} (kopya)`.slice(0, 200),
      il: kaynak.il,
      musteriId: kaynak.musteriId,
      veri: kaynak.veri,
      toplamDebi: kaynak.toplamDebi,
      olusturanKullaniciId: kullanici?.id ?? null,
      olusturanAdi: kullanici?.ad ?? "",
    },
    select: { id: true },
  });
  revalidatePath("/panel/havalandirma-hesabi");
  redirect(`/panel/havalandirma-hesabi/${yeni.id}?mesaj=havalandirma-hesap-kopyalandi`);
}

export async function havalandirmaHesapSil(id: string) {
  await yetki("havalandirmaHesapSil", { id });
  await prisma.havalandirmaHesap.delete({ where: { id } });
  revalidatePath("/panel/havalandirma-hesabi");
}

export async function havalandirmaHesapTeklifeAktar(formData: FormData) {
  const kullanici = await yetki("havalandirmaHesapTeklifeAktar", formData);
  const hesapId = metinAl(formData.get("hesapId"), 40);
  const musteriId = await musteriDogrula(metinAl(formData.get("musteriId"), 40));
  const baslik = metinAl(formData.get("baslik"), 200);
  if (!hesapId) return;
  if (!musteriId || !baslik) redirect(`/panel/havalandirma-hesabi/${hesapId}?mesaj=havalandirma-hesap-teklif-eksik`);
  const hesap = await prisma.havalandirmaHesap.findUnique({ where: { id: hesapId } });
  if (!hesap) redirect("/panel/havalandirma-hesabi");
  const sonuc = havalandirmaHesapla(veriOku(hesap.veri));
  if (!sonuc.malzemeler.length || !sonuc.santraller.length) redirect(`/panel/havalandirma-hesabi/${hesapId}?mesaj=havalandirma-hesap-teklif-eksik`);
  const simdi = new Date();
  const teklif = await prisma.teklif.create({
    data: {
      baslik,
      musteriId,
      olusturanKullaniciId: kullanici?.id || null,
      olusturanAdi: kullanici?.ad ?? "",
      tarih: simdi,
      ilkTarih: simdi,
      kalemler: {
        create: sonuc.malzemeler.map((m, sira) => ({
          bolum: m.bolum.slice(0, 200),
          // Teklif kaleminde birim sütunu yok; ölçü birimli kalemlerde açıklamaya eklenir
          aciklama: (m.aciklama + (["m", "m²", "kg"].includes(m.birim) ? ` (${m.birim})` : "")).slice(0, 500),
          adet: m.adet,
          birimFiyat: 0,
          sira,
        })),
      },
    },
    select: { id: true },
  });
  await prisma.havalandirmaHesap.update({ where: { id: hesapId }, data: { teklifId: teklif.id, musteriId } });
  revalidatePath("/panel/teklifler");
  revalidatePath("/panel/havalandirma-hesabi");
  redirect(`/panel/teklifler/${teklif.id}/duzenle?mesaj=havalandirma-hesap-teklif`);
}
