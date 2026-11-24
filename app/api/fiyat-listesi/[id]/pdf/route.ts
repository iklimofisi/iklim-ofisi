import { NextRequest } from "next/server";
import { apiYetkisi } from "@/lib/oturum";
import { fiyatListesiPdfHazirla, dosyaAdi } from "@/lib/fiyat-listesi-belge";

// Fotoğraflı fiyat listesi PDF'i (panel). ?indir=1 → dosya olarak indirir.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// GET: listenin tamamı. POST (form): "haric" alanlarındaki ürünler çıkarılarak (müşteriye
// gönderirken bazı ürünleri listeden çıkarmak için; kayıtlı liste DEĞİŞMEZ).
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return pdfYanit(params.id, new Set(), req.nextUrl.searchParams.get("indir") === "1");
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let haric = new Set<string>();
  let indir = false;
  try {
    const fd = await req.formData();
    haric = new Set((fd.getAll("haric") as string[]).filter((x) => typeof x === "string" && x).slice(0, 5000));
    indir = fd.get("indir") === "1";
  } catch {
    /* form okunamazsa liste tam basılır */
  }
  return pdfYanit(params.id, haric, indir);
}

async function pdfYanit(id: string, haric: Set<string>, indir: boolean) {
  if (!(await apiYetkisi("fiyat"))) return new Response("Yetkisiz", { status: 401 });

  const sonuc = await fiyatListesiPdfHazirla(id, haric);
  if (!sonuc) return new Response("Fiyat listesi bulunamadı", { status: 404 });

  return new Response(new Uint8Array(sonuc.pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${indir ? "attachment" : "inline"}; filename="${dosyaAdi(sonuc.baslik)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
