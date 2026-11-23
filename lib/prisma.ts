import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Veritabanı bağlantı ayarları (Neon "pooler" adresi çok sayıda bağlantıyı kaldırır):
// - connection_limit: Vercel'de varsayılan havuz 5 bağlantıydı; yoğun panel sayfalarında bağlantı
//   beklerken zaman aşımı oluyordu (P2024). 10'a çıkarıldı.
// - pool_timeout: boş bağlantı beklerken 10 sn yerine 20 sn beklenir.
// - connect_timeout: uyuyan veritabanının uyanması zaman alabilir (P1001); 15 sn beklenir.
// Adreste bu ayarlar zaten yazılıysa onlara dokunulmaz.
function veritabaniAdresi(): string | undefined {
  const ham = process.env.DATABASE_URL;
  if (!ham) return undefined;
  try {
    const u = new URL(ham);
    if (!u.searchParams.has("connection_limit")) u.searchParams.set("connection_limit", "10");
    if (!u.searchParams.has("pool_timeout")) u.searchParams.set("pool_timeout", "20");
    if (!u.searchParams.has("connect_timeout")) u.searchParams.set("connect_timeout", "15");
    return u.toString();
  } catch {
    return ham;
  }
}

const adres = veritabaniAdresi();

export const prisma = globalForPrisma.prisma ?? new PrismaClient(adres ? { datasources: { db: { url: adres } } } : undefined);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
