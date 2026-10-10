"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { girisZorunlu } from "@/lib/oturum";
import { islemKaydet } from "@/lib/islem-kaydi";
import { klimaVeriOku, varsayilanKlimaVerisi, ornekKlimaDairesi, klimaOdasi, type KlimaOda } from "@/lib/klima-hesap/tipler";
import { veriOku as isiVeriOku } from "@/lib/isi-hesap/tipler";
import { klimaHesapla } from "@/lib/klima-hesap/hesap";
import { ILLER } from "@/lib/isi-hesap/iklim";

// -----------------------------------------------------------------------------
// KLİMA / VRF HESABI — sunucu işlemleri (giriş kontrolü + İşlem Geçmişi)
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

export async function klimaHesapOlustur(formData: FormData) {
  const kullanici = await yetki("klimaHesapOlustur", formData);
  const ad = metinAl(formData.get("ad"), 200);
  if (!ad) redirect("/panel/klima-hesabi?mesaj=klima-hesap-eksik");
  let il = ILLER.some((i) => i.ad === formData.get("il")) ? String(formData.get("il")) : "İstanbul";
  let musteriId = await musteriDogrula(metinAl(formData.get("musteriId"), 40));
  const veri = varsayilanKlimaVerisi(il);
  const sablon = String(formData.get("sablon") ?? "");
  if (sablon === "ornek") veri.odalar = ornekKlimaDairesi();
  // Isı pompası hesabındaki odalar ve yapı elemanları aktarılabilir
  const kaynakId = metinAl(formData.get("kaynakIsiHesapId"), 40);
  if (sablon === "isi" && kaynakId) {
    const kaynak = await prisma.isiHesap.findUnique({ where: { id: kaynakId }, select: { veri: true, musteriId: true } });
    if (kaynak) {
      const iv = isiVeriOku(kaynak.veri);
      il = iv.il;
      veri.il = iv.il;
      veri.disSicaklikElle = iv.disSicaklikElle;
      veri.adres = iv.adres;
      veri.isiKoprusu = iv.isiKoprusu;
      veri.yonArtirimi = iv.yonArtirimi;
      veri.odalar = iv.odalar.map((o) => {
        const d = klimaOdasi(o.tip);
        const k: KlimaOda = { ...d, ...o, isitici: "RADYATOR" };
        return k;
      });
      musteriId = musteriId ?? kaynak.musteriId;
    }
  }
  const hesap = await prisma.klimaHesap.create({
    data: {
      ad,
      il,
      musteriId,
      veri: JSON.stringify(veri),
      toplamKw: klimaHesapla(veri).toplamSogutma / 1000,
      olusturanKullaniciId: kullanici?.id ?? null,
      olusturanAdi: kullanici?.ad ?? "",
    },
    select: { id: true },
  });
  revalidatePath("/panel/klima-hesabi");
  redirect(`/panel/klima-hesabi/${hesap.id}`);
}

export type KlimaKayitSonucu = { ok: true; zaman: string } | { ok: false; hata: string };

export async function klimaHesapKaydet(girdi: { id: string; ad: string; musteriId: string; veri: string }): Promise<KlimaKayitSonucu> {
  const id = metinAl(girdi?.id, 40);
  const ad = metinAl(girdi?.ad, 200);
  const hamVeri = typeof girdi?.veri === "string" ? girdi.veri : "";
  await yetki("klimaHesapKaydet", { id, ad, musteriId: metinAl(girdi?.musteriId, 40), veriBoyutu: hamVeri.length });
  if (!id) return { ok: false, hata: "Hesap bulunamadı." };
  if (!ad) return { ok: false, hata: "Hesap adı boş olamaz." };
  if (hamVeri.length > 800_000) return { ok: false, hata: "Hesap çok büyük (oda / eleman sayısını azaltın)." };
  const mevcut = await prisma.klimaHesap.findUnique({ where: { id }, select: { id: true } });
  if (!mevcut) return { ok: false, hata: "Hesap bulunamadı (silinmiş olabilir)." };
  const veri = klimaVeriOku(hamVeri);
  const musteriId = await musteriDogrula(metinAl(girdi?.musteriId, 40));
  try {
    await prisma.klimaHesap.update({
      where: { id },
      data: { ad, musteriId, il: veri.il, veri: JSON.stringify(veri), toplamKw: klimaHesapla(veri).toplamSogutma / 1000 },
    });
  } catch (hata) {
    console.error("[klimaHesapKaydet]", hata);
    return { ok: false, hata: "Kayıt sırasında hata oluştu; tekrar deneyin." };
  }
  revalidatePath("/panel/klima-hesabi");
  return { ok: true, zaman: new Date().toISOString() };
}

export async function klimaHesapKopyala(id: string) {
  const kullanici = await yetki("klimaHesapKopyala", { id });
  const kaynak = await prisma.klimaHesap.findUnique({ where: { id } });
  if (!kaynak) return;
  const yeni = await prisma.klimaHesap.create({
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
  revalidatePath("/panel/klima-hesabi");
  redirect(`/panel/klima-hesabi/${yeni.id}?mesaj=klima-hesap-kopyalandi`);
}

export async function klimaHesapSil(id: string) {
  await yetki("klimaHesapSil", { id });
  await prisma.klimaHesap.delete({ where: { id } });
  revalidatePath("/panel/klima-hesabi");
}

export async function klimaHesapTeklifeAktar(formData: FormData) {
  const kullanici = await yetki("klimaHesapTeklifeAktar", formData);
  const hesapId = metinAl(formData.get("hesapId"), 40);
  const musteriId = await musteriDogrula(metinAl(formData.get("musteriId"), 40));
  const baslik = metinAl(formData.get("baslik"), 200);
  if (!hesapId) return;
  if (!musteriId || !baslik) redirect(`/panel/klima-hesabi/${hesapId}?mesaj=klima-hesap-teklif-eksik`);
  const hesap = await prisma.klimaHesap.findUnique({ where: { id: hesapId } });
  if (!hesap) redirect("/panel/klima-hesabi");
  const sonuc = klimaHesapla(klimaVeriOku(hesap.veri));
  if (!sonuc.malzemeler.length) redirect(`/panel/klima-hesabi/${hesapId}?mesaj=klima-hesap-teklif-eksik`);
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
          aciklama: (m.aciklama + (["m", "kg"].includes(m.birim) ? ` (${m.birim})` : "")).slice(0, 500),
          adet: m.adet,
          birimFiyat: 0,
          sira,
        })),
      },
    },
    select: { id: true },
  });
  await prisma.klimaHesap.update({ where: { id: hesapId }, data: { teklifId: teklif.id, musteriId } });
  revalidatePath("/panel/teklifler");
  revalidatePath("/panel/klima-hesabi");
  redirect(`/panel/teklifler/${teklif.id}/duzenle?mesaj=klima-hesap-teklif`);
}
