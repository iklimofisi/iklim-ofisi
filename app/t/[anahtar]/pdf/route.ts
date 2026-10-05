import { NextRequest } from "next/server";
import { paylasilanTeklif } from "@/lib/teklif-paylasim";
import { teklifPdfOlustur } from "@/lib/pdf-olustur";
import { getSirketAyarlari } from "@/lib/sirket";

// Müşteri linkinden açılan teklif PDF'i (e-postaya eklenen PDF ile birebir aynı)
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(_req: NextRequest, { params }: { params: { anahtar: string } }) {
  const sonuc = await paylasilanTeklif(params.anahtar);
  if (!sonuc) return new Response("Bu teklif linki geçersiz veya iptal edilmiş.", { status: 404 });

  const sirket = await getSirketAyarlari();
  const pdf = await teklifPdfOlustur(sonuc.teklif, sirket);
  const ad = `Teklif-TKL-${String(sonuc.teklif.teklifNo).padStart(4, "0")}.pdf`;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${ad}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
