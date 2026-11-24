"use server";

// -----------------------------------------------------------------------------
// FİYAT LİSTESİ MÜŞTERİ LİNKİ: oluşturma ve iptal (panel)
// Fiyat listelerini görebilen herkes (admin, satış, satınalma) link oluşturabilir;
// "Yönetici (izleme)" oluşturamaz. İptal edilen link silinmez, yalnız kapanır.
// -----------------------------------------------------------------------------
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { islemZorunlu } from "@/lib/oturum";
import { gorebilir } from "@/lib/roller";
import { islemKaydet } from "@/lib/islem-kaydi";

async function yetki(islem: string, girdi: FormData) {
  const kullanici = await islemZorunlu();
  if (!gorebilir(kullanici.rol, "fiyat")) throw new Error("Bu işlem için yetkiniz yok.");
  await islemKaydet(kullanici, islem, girdi);
  return kullanici;
}

export async function fiyatListesiLinkOlustur(formData: FormData) {
  const giren = await yetki("fiyatListesiLinkOlustur", formData);
  const listeId = String(formData.get("listeId") ?? "");
  const alici = String(formData.get("alici") ?? "").trim().slice(0, 120);
  if (!listeId) return;
  const liste = await prisma.fiyatListesi.findUnique({ where: { id: listeId }, select: { id: true } });
  if (!liste) return;
  await prisma.fiyatListesiPaylasim.create({
    data: { listeId, anahtar: randomBytes(18).toString("base64url"), alici, olusturanAdi: giren.ad ?? "" },
  });
  revalidatePath(`/panel/fiyat-listeleri/${listeId}`);
  redirect(`/panel/fiyat-listeleri/${listeId}?mesaj=fiyat-link-olusturuldu#musteri-linkleri`);
}

export async function fiyatListesiLinkIptal(formData: FormData) {
  const giren = await yetki("fiyatListesiLinkIptal", formData);
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const p = await prisma.fiyatListesiPaylasim.findUnique({ where: { id }, select: { listeId: true, iptalTarihi: true } });
  if (!p) return;
  if (!p.iptalTarihi) {
    await prisma.fiyatListesiPaylasim.update({ where: { id }, data: { iptalTarihi: new Date(), iptalEdenAdi: giren.ad ?? "" } });
  }
  revalidatePath(`/panel/fiyat-listeleri/${p.listeId}`);
  redirect(`/panel/fiyat-listeleri/${p.listeId}?mesaj=fiyat-link-iptal#musteri-linkleri`);
}
