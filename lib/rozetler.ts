import { prisma } from "@/lib/prisma";

export async function getRozetSayilari() {
  const [yeniKesifSayisi, takiptekiProjeSayisi] = await Promise.all([
    prisma.kesifFormu.count({ where: { olusturulanTeklifId: null } }), // Henüz teklife dönüşmemiş yeni keşifler
    prisma.proje.count({ where: { ihaleDurumu: "TAKIPTE" } }), // Takipteki aktif projeler
  ]);

  return { yeniKesifSayisi, takiptekiProjeSayisi };
}