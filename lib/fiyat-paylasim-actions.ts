"use server";

// -----------------------------------------------------------------------------
// FİYAT LİSTESİ MÜŞTERİ LİNKİ: oluşturma ve iptal (panel)
// Fiyat listelerini görebilen herkes (admin, satış, satınalma) link oluşturabilir;
// "Yönetici (izleme)" oluşturamaz. İptal edilen link silinmez, yalnız kapanır.
// -----------------------------------------------------------------------------
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { islemZorunlu } from "@/lib/oturum";
import { gorebilir } from "@/lib/roller";
import { islemKaydet } from "@/lib/islem-kaydi";
import { linkAnahtari } from "@/lib/fiyat-paylasim";
import { secimAnahtari } from "@/lib/fiyat-listesi";

async function yetki(islem: string, girdi: FormData) {
  const kullanici = await islemZorunlu();
  if (!gorebilir(kullanici.rol, "fiyat")) throw new Error("Bu işlem için yetkiniz yok.");
  await islemKaydet(kullanici, islem, girdi);
  return kullanici;
}

// Formdan gizlenecek ürün anahtarları; listede gerçekten olan anahtarlar kalır.
// Boşsa null (tüm ürünler). Tüm ürünler gizlenmişse "hepsi" döner (link oluşturulmaz).
async function haricVerisi(formData: FormData, listeId: string): Promise<string | null | "hepsi"> {
  const istenen = new Set((formData.getAll("haric") as unknown[]).filter((x): x is string => typeof x === "string" && x.length > 0 && x.length <= 400).slice(0, 10000));
  if (!istenen.size) return null;
  const kalemler = await prisma.fiyatListesiKalem.findMany({ where: { listeId }, select: { bolum: true, ad: true, kod: true } });
  const anahtarlar = new Set(kalemler.map((k) => secimAnahtari(k)));
  const haric = [...istenen].filter((a) => anahtarlar.has(a));
  if (!haric.length) return null;
  if (anahtarlar.size > 0 && [...anahtarlar].every((a) => istenen.has(a))) return "hepsi";
  return JSON.stringify(haric);
}

export async function fiyatListesiLinkOlustur(formData: FormData) {
  const giren = await yetki("fiyatListesiLinkOlustur", formData);
  const listeId = String(formData.get("listeId") ?? "");
  const alici = String(formData.get("alici") ?? "").trim().slice(0, 120);
  if (!listeId) return;
  const liste = await prisma.fiyatListesi.findUnique({ where: { id: listeId }, select: { id: true, baslik: true } });
  if (!liste) return;
  const haric = await haricVerisi(formData, listeId);
  if (haric === "hepsi") redirect(`/panel/fiyat-listeleri/${listeId}?mesaj=fiyat-link-urun-yok#musteri-linkleri`);
  // Okunabilir link: liste adı + rastgele kod. Kod çok küçük ihtimalle çakışırsa yeniden denenir.
  for (let deneme = 0; deneme < 5; deneme++) {
    try {
      await prisma.fiyatListesiPaylasim.create({
        data: { listeId, anahtar: linkAnahtari(liste.baslik), alici, olusturanAdi: giren.ad ?? "", haric },
      });
      break;
    } catch (hata) {
      const cakisma = typeof hata === "object" && hata !== null && (hata as { code?: string }).code === "P2002";
      if (!cakisma || deneme === 4) throw hata;
    }
  }
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

// Var olan linkte gösterilecek ürünleri değiştirir (link adresi aynı kalır)
export async function fiyatListesiLinkUrunleri(formData: FormData) {
  await yetki("fiyatListesiLinkUrunleri", formData);
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const p = await prisma.fiyatListesiPaylasim.findUnique({ where: { id }, select: { listeId: true, iptalTarihi: true } });
  if (!p || p.iptalTarihi) return;
  const haric = await haricVerisi(formData, p.listeId);
  if (haric === "hepsi") redirect(`/panel/fiyat-listeleri/${p.listeId}?mesaj=fiyat-link-urun-yok#musteri-linkleri`);
  await prisma.fiyatListesiPaylasim.update({ where: { id }, data: { haric } });
  revalidatePath(`/panel/fiyat-listeleri/${p.listeId}`);
  redirect(`/panel/fiyat-listeleri/${p.listeId}?mesaj=fiyat-link-urunler#musteri-linkleri`);
}
