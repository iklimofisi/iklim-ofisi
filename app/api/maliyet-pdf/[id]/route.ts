import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // 1. Önce Teklif tablosunda ara
    let kayit: { maliyetPdf: Buffer | null; maliyetPdfAdi: string | null; maliyetPdfTipi: string | null } | null =
      await prisma.teklif.findUnique({
        where: { id },
        select: { maliyetPdf: true, maliyetPdfAdi: true, maliyetPdfTipi: true },
      });

    // 2. Bulunamazsa SatinalmaTeklifi tablosunda ara
    if (!kayit || !kayit.maliyetPdf) {
      kayit = await prisma.satinalmaTeklifi.findUnique({
        where: { id },
        select: { maliyetPdf: true, maliyetPdfAdi: true, maliyetPdfTipi: true },
      });
    }

    if (!kayit || !kayit.maliyetPdf) {
      return new NextResponse("Maliyet PDF dosyası bulunamadı", { status: 404 });
    }

    const buffer = Buffer.from(kayit.maliyetPdf);
    const mimeType = kayit.maliyetPdfTipi || "application/pdf";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(kayit.maliyetPdfAdi || 'maliyet.pdf')}"`,
      },
    });
  } catch (error) {
    console.error("Maliyet PDF okuma hatası:", error);
    return new NextResponse("Sunucu hatası", { status: 500 });
  }
}