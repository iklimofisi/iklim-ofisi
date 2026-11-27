import { NextRequest } from "next/server";
import { suankiKullanici } from "@/lib/oturum";
import { yonetimVerisi, ayKodu } from "@/lib/yonetim-verisi";
import { yonetimRaporuPdf } from "@/lib/yonetim-pdf";
import { getSirketAyarlari } from "@/lib/sirket";

// Yönetim raporu PDF'i (Özet → Yönetim Paneli). Maliyet ve kâr içerir: yalnız Admin ve Yönetici (izleme).
// ?indir=1 → dosya olarak indirir; yoksa tarayıcıda açılır.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const k = await suankiKullanici();
  if (!k || (k.rol !== "ADMIN" && k.rol !== "YATIRIMCI")) return new Response("Yetkisiz", { status: 401 });
  const [veri, sirket] = await Promise.all([yonetimVerisi(), getSirketAyarlari()]);
  const pdf = yonetimRaporuPdf(veri, sirket);
  const dosyaAdi = `Yonetim-Raporu-${ayKodu(new Date())}.pdf`;
  const indir = req.nextUrl.searchParams.get("indir") === "1";
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${indir ? "attachment" : "inline"}; filename="${dosyaAdi}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
