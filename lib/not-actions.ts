"use server";

// -----------------------------------------------------------------------------
// NOTLAR & HATIRLATMALAR — kaydet / tamamla / sabitle / sil
// Notu yalnız yazan kişi değiştirebilir ve silebilir. Gizli notların içeriği
// İşlem Geçmişi'ne yazılmaz (yönetici de göremesin diye).
// -----------------------------------------------------------------------------
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { girisZorunlu } from "@/lib/oturum";
import { islemKaydet } from "@/lib/islem-kaydi";
import { gunGecerli, saatGecerli, hatirlatmaVakti, alicilariOku } from "@/lib/notlar";

const SAYFA = "/panel/notlar";
const yaziAl = (v: FormDataEntryValue | null, max: number) => String(v ?? "").replace(/\r\n/g, "\n").trim().slice(0, max);

async function benimNotum(id: string, kullaniciId: string) {
  const n = await prisma.panelNotu.findUnique({ where: { id } });
  return n && n.olusturanId === kullaniciId ? n : null;
}

export async function notKaydet(formData: FormData) {
  const ben = await girisZorunlu();
  const id = String(formData.get("id") ?? "");
  const baslik = yaziAl(formData.get("baslik"), 200) || null;
  const icerik = yaziAl(formData.get("icerik"), 20000);
  const gizli = formData.get("gorunurluk") === "GIZLI";
  const sabit = formData.get("sabit") === "1";
  if (!icerik && !baslik) redirect(`${SAYFA}?mesaj=not-bos`);

  // Hatırlatma
  const hatirlatmaVar = formData.get("hatirlatma") === "1";
  const gun = hatirlatmaVar ? gunGecerli(formData.get("hatirlatmaGunu")) : null;
  if (hatirlatmaVar && !gun) redirect(`${SAYFA}?mesaj=not-tarih-yok`);
  const saat = gun ? saatGecerli(formData.get("hatirlatmaSaati")) : null;
  let alicilar: string[] = [];
  if (gun) {
    if (gizli || formData.get("alicilar") !== "SECILI") alicilar = [ben.id];
    else {
      const istenen = (formData.getAll("alici") as string[]).filter((x) => typeof x === "string" && x).slice(0, 200);
      const gecerli = await prisma.kullanici.findMany({ where: { id: { in: istenen } }, select: { id: true } });
      alicilar = gecerli.map((k) => k.id);
      if (!alicilar.length) alicilar = [ben.id];
    }
  }
  const alicilarJson = gun ? JSON.stringify(alicilar) : null;

  let notId: string;
  if (id) {
    const eski = await benimNotum(id, ben.id);
    if (!eski) redirect(`${SAYFA}?mesaj=not-yetki`);
    // Gün, saat ya da alıcılar değiştiyse hatırlatma yeniden gönderilecek hâle gelir
    const degisti =
      eski.hatirlatmaGunu !== gun ||
      (eski.hatirlatmaSaati ?? null) !== saat ||
      JSON.stringify(alicilariOku(eski.hatirlatmaAlicilar)) !== JSON.stringify(alicilar) ||
      eski.gizli !== gizli;
    await prisma.panelNotu.update({
      where: { id },
      data: {
        baslik,
        icerik,
        gizli,
        sabit,
        hatirlatmaGunu: gun,
        hatirlatmaSaati: saat,
        hatirlatmaAlicilar: alicilarJson,
        ...(degisti ? { hatirlatmaGonderildi: null, ...(gun ? { tamamlandi: false } : {}) } : {}),
      },
    });
    notId = id;
  } else {
    const n = await prisma.panelNotu.create({
      data: {
        baslik,
        icerik,
        gizli,
        sabit,
        olusturanId: ben.id,
        olusturanAdi: ben.ad,
        hatirlatmaGunu: gun,
        hatirlatmaSaati: saat,
        hatirlatmaAlicilar: alicilarJson,
      },
      select: { id: true },
    });
    notId = n.id;
  }
  // İçerik kayda geçmez; yalnız ne yapıldığı
  await islemKaydet(ben, id ? "notDuzenle" : "notEkle", { id: notId, gizli, hatirlatma: gun ?? "yok", aliciSayisi: alicilar.length });

  // Günü bugünse ve sabah 08:00 geçtiyse (ya da geçmiş bir gün seçildiyse) mail hemen gider
  let mesaj = "not-kaydedildi";
  if (gun && hatirlatmaVakti(gun)) {
    const { notHatirlatmalariniGonder } = await import("@/lib/not-hatirlatma");
    const r = await notHatirlatmalariniGonder({ id: notId }).catch(() => null);
    if (r && r.mail > 0) mesaj = "not-kaydedildi-gonderildi";
    else if (r && r.hatirlatma === 0) mesaj = "not-kaydedildi";
    else mesaj = "not-mail-gitmedi";
  }
  revalidatePath(SAYFA);
  revalidatePath("/panel", "layout");
  redirect(`${SAYFA}?mesaj=${mesaj}`);
}

// Tamamlandı / geri al / sabitle / sabitten çıkar
export async function notDurum(formData: FormData) {
  const ben = await girisZorunlu();
  const id = String(formData.get("id") ?? "");
  const islem = String(formData.get("islem") ?? "");
  const n = await benimNotum(id, ben.id);
  if (!n) redirect(`${SAYFA}?mesaj=not-yetki`);
  const data =
    islem === "tamamla" ? { tamamlandi: true } : islem === "geriAl" ? { tamamlandi: false } : islem === "sabitle" ? { sabit: true } : islem === "coz" ? { sabit: false } : null;
  if (!data) return;
  await prisma.panelNotu.update({ where: { id }, data });
  await islemKaydet(ben, "notDurum", { id, islem });
  revalidatePath(SAYFA);
  revalidatePath("/panel", "layout");
}

export async function notSil(id: string) {
  const ben = await girisZorunlu();
  const n = await benimNotum(id, ben.id);
  if (!n) return;
  // Herkese açık notun silinen hâli İşlem Geçmişi'nde saklanır; gizli notun içeriği saklanmaz
  await islemKaydet(ben, "notSil", n.gizli ? { id, gizli: true } : { id, silinenKayit: n });
  await prisma.panelNotu.delete({ where: { id } });
  revalidatePath(SAYFA);
  revalidatePath("/panel", "layout");
}
