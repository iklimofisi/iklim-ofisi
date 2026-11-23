import { NextRequest } from "next/server";
import { apiYetkisi } from "@/lib/oturum";
import { sasBelgesi } from "@/lib/satinalma-siparis-belge";

// Panel: satınalma siparişinin tedarikçiye giden PDF'i. Yalnız giriş yapmış kullanıcılar.
// ?indir=1 → dosya olarak indirir.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await apiYetkisi("satinalma"))) return new Response("Yetkisiz", { status: 401 });
  const b = await sasBelgesi({ id: params.id });
  if (!b) return new Response("Sipariş bulunamadı", { status: 404 });
  const indir = req.nextUrl.searchParams.get("indir") === "1";
  return new Response(new Uint8Array(b.pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${indir ? "attachment" : "inline"}; filename="${b.dosyaAdi}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
