import { NextRequest } from "next/server";
import { suankiKullanici } from "@/lib/oturum";
import { belgeTeklifi } from "@/lib/teklif-paylasim";
import { teklifPdfOlustur } from "@/lib/pdf-olustur";
import { getSirketAyarlari } from "@/lib/sirket";

// Panel: teklifin PDF'i (müşteriye e-postayla giden PDF ile aynı).
// Teklif listesindeki "Önizle" penceresi ve "PDF indir" bunu kullanır.
// Yalnızca giriş yapmış kullanıcılar açabilir. ?indir=1 → dosya olarak indirir.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await suankiKullanici())) return new Response("Yetkisiz", { status: 401 });

  const teklif = await belgeTeklifi(params.id);
  if (!teklif) return new Response("Teklif bulunamadı", { status: 404 });

  const sirket = await getSirketAyarlari();
  const pdf = await teklifPdfOlustur(teklif, sirket);
  const ad = `Teklif-TKL-${String(teklif.teklifNo).padStart(4, "0")}.pdf`;
  const indir = req.nextUrl.searchParams.get("indir") === "1";

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${indir ? "attachment" : "inline"}; filename="${ad}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
