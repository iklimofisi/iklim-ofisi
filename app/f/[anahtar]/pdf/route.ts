import { NextRequest } from "next/server";
import { paylasilanFiyatListesi } from "@/lib/fiyat-paylasim";
import { fiyatListesiPdfHazirla, dosyaAdi } from "@/lib/fiyat-listesi-belge";

// Müşteri linkinden açılan fiyat listesi PDF'i: panelden alınan PDF ile birebir aynı,
// her açılışta listenin O ANKİ fiyatlarıyla yeniden üretilir. ?indir=1 → dosya olarak indirir.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest, { params }: { params: { anahtar: string } }) {
  const sonuc = await paylasilanFiyatListesi(params.anahtar);
  if (!sonuc) return new Response("Bu fiyat listesi linki geçersiz veya iptal edilmiş.", { status: 404 });

  // Bu linkte gizlenen ürünler PDF'e girmez
  const belge = await fiyatListesiPdfHazirla(sonuc.liste.id, new Set(), sonuc.haricAnahtarlar);
  if (!belge) return new Response("Fiyat listesi bulunamadı.", { status: 404 });
  const indir = req.nextUrl.searchParams.get("indir") === "1";

  return new Response(new Uint8Array(belge.pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${indir ? "attachment" : "inline"}; filename="${dosyaAdi(belge.baslik)}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
