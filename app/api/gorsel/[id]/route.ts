import { suankiKullanici } from "@/lib/oturum";
import { prisma } from "@/lib/prisma";

// Paneldeki fotoğraf önizlemeleri (yalnızca giriş yapmış kullanıcılar).
// Bir fotoğraf hiç değişmez (yeni fotoğraf = yeni kayıt), bu yüzden uzun süre önbellekte tutulabilir.
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!(await suankiKullanici())) return new Response("Yetkisiz", { status: 401 });
  const g = await prisma.gorsel.findUnique({ where: { id: params.id }, select: { veri: true, tip: true } }).catch(() => null);
  if (!g) return new Response("Bulunamadı", { status: 404 });
  return new Response(new Uint8Array(g.veri), {
    headers: { "Content-Type": g.tip || "image/jpeg", "Cache-Control": "private, max-age=31536000, immutable" },
  });
}
