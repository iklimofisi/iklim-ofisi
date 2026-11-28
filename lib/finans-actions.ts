"use server";

// -----------------------------------------------------------------------------
// AY KAPANIŞI İŞLEMLERİ
// Kapatma: satış müdürü ya da muhasebe (yalnız geçmiş ya da içinde bulunulan ay).
// Yeniden açma: yalnız satış müdürü, neden zorunlu. Her ikisi de İşlem Geçmişi'ne yazılır.
// -----------------------------------------------------------------------------
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { islemZorunlu } from "@/lib/oturum";
import { islemKaydet } from "@/lib/islem-kaydi";
import { finansYetkilisiMi } from "@/lib/roller";
import { aylikOzet, gecerliDonem, donemAnahtari, donemAdi } from "@/lib/finans";

export type FinansSonuc = { hata?: string; tamam?: string };

export async function donemKapat(donemGirdi: string): Promise<FinansSonuc> {
  const giren = await islemZorunlu("finans");
  await islemKaydet(giren, "donemKapat", { donem: donemGirdi });
  if (!finansYetkilisiMi(giren.rol)) return { hata: "Ayı yalnız satış müdürü ya da muhasebe kapatabilir." };
  const donem = gecerliDonem(donemGirdi);
  if (!donem) return { hata: "Dönem anlaşılamadı." };
  if (donem > donemAnahtari(new Date())) return { hata: "Henüz başlamamış bir ay kapatılamaz." };
  const ozet = await aylikOzet(donem);
  const mevcut = await prisma.donemKapanis.findUnique({ where: { donem }, select: { acikMi: true } });
  if (mevcut && !mevcut.acikMi) return { tamam: `${donemAdi(donem)} zaten kapalı.` };
  const veri = { kapatanAdi: giren.ad, kapanisTarihi: new Date(), ozetJson: JSON.stringify(ozet), acikMi: false };
  if (mevcut) await prisma.donemKapanis.update({ where: { donem }, data: veri });
  else await prisma.donemKapanis.create({ data: { donem, ...veri } });
  revalidatePath("/panel/rapor");
  return { tamam: `${donemAdi(donem)} kapatıldı. Bu aya tarihli finansal kayıt artık eklenemez ve iptal edilemez.` };
}

export async function donemAc(donemGirdi: string, neden: string): Promise<FinansSonuc> {
  const giren = await islemZorunlu("finans");
  await islemKaydet(giren, "donemAc", { donem: donemGirdi, neden });
  if (giren.rol !== "ADMIN") return { hata: "Kapalı dönemi yalnız satış müdürü yeniden açabilir." };
  const donem = gecerliDonem(donemGirdi);
  const nedenTemiz = String(neden ?? "").trim().slice(0, 500);
  if (!donem) return { hata: "Dönem anlaşılamadı." };
  if (!nedenTemiz) return { hata: "Açma nedenini yazın." };
  const mevcut = await prisma.donemKapanis.findUnique({ where: { donem }, select: { acikMi: true } });
  if (!mevcut || mevcut.acikMi) return { tamam: `${donemAdi(donem)} zaten açık.` };
  await prisma.donemKapanis.update({ where: { donem }, data: { acikMi: true, acanAdi: giren.ad, acilisTarihi: new Date(), acilisNedeni: nedenTemiz } });
  revalidatePath("/panel/rapor");
  return { tamam: `${donemAdi(donem)} yeniden açıldı. İşiniz bitince yeniden kapatın.` };
}
