// Müşterisiz teklif sistem kaydını (yoksa) oluşturur. Yalnız sunucu tarafında kullanılır.
import { prisma } from "@/lib/prisma";
import { MUSTERISIZ_ID, MUSTERISIZ_AD } from "@/lib/musterisiz";

export async function musterisizKaydiHazirla() {
  await prisma.musteri.upsert({
    where: { id: MUSTERISIZ_ID },
    update: {},
    create: { id: MUSTERISIZ_ID, ad: MUSTERISIZ_AD },
  });
}
