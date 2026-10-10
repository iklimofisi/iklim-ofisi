// Veritabanındaki aktif ısı pompası modellerini hesap motorunun beklediği biçimde döner.
// (Sunucu tarafında sayfa ve PDF tarafından kullanılır; dışarıya açık bir işlem değildir.)
import { prisma } from "@/lib/prisma";
import type { PompaModeli } from "./tipler";

export async function aktifPompaModelleri(): Promise<PompaModeli[]> {
  const kayitlar = await prisma.isiPompasiModeli.findMany({ where: { aktif: true }, orderBy: [{ kapA7W35: "asc" }, { marka: "asc" }] });
  return kayitlar.map((m) => ({
    id: m.id,
    marka: m.marka,
    model: m.model,
    kapA7W35: m.kapA7W35,
    kapAm7W35: m.kapAm7W35,
    kapAm7W55: m.kapAm7W55,
    kapAm15W35: m.kapAm15W35,
    minDisSicaklik: m.minDisSicaklik,
    maksCikis: m.maksCikis,
    yedekIsiticiKw: m.yedekIsiticiKw,
    urunId: m.urunId,
  }));
}
