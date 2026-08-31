import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { tip: string; id: string } }
) {
  try {
    const { tip, id } = params;

    // 1. Önce Teklif tablosunda maliyet dosyasını ara
    let teklif = await prisma.teklif.findUnique({
      where: { id },
      select: {
        maliyetPdf: true,
        maliyetPdfAdi: true,
        maliyetPdfTipi: true,
        maliyetExcel: true,
        maliyetExcelAdi: true,
        maliyetExcelTipi: true,
      },
    });

    let fileBuffer: Buffer | null = null;
    let fileName: string | null = null;
    let mimeType: string | null = null;

    if (teklif) {
      if (tip === "pdf" && teklif.maliyetPdf) {
        fileBuffer = Buffer.from(teklif.maliyetPdf);
        fileName = teklif.maliyetPdfAdi || "maliyet.pdf";
        mimeType = teklif.maliyetPdfTipi || "application/pdf";
      } else if (tip === "excel" && teklif.maliyetExcel) {
        fileBuffer = Buffer.from(teklif.maliyetExcel);
        fileName = teklif.maliyetExcelAdi || "maliyet.xlsx";
        mimeType = teklif.maliyetExcelTipi || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      }
    }

    // 2. Bulunamazsa SatinalmaTeklifi tablosunda ara
    if (!fileBuffer) {
      const satinalma = await prisma.satinalmaTeklifi.findUnique({
        where: { id },
        select: {
          maliyetPdf: true,
          maliyetPdfAdi: true,
          maliyetPdfTipi: true,
          maliyetExcel: true,
          maliyetExcelAdi: true,
          maliyetExcelTipi: true,
        },
      });

      if (satinalma) {
        if (tip === "pdf" && satinalma.maliyetPdf) {
          fileBuffer = Buffer.from(satinalma.maliyetPdf);
          fileName = satinalma.maliyetPdfAdi || "maliyet.pdf";
          mimeType = satinalma.maliyetPdfTipi || "application/pdf";
        } else if (tip === "excel" && satinalma.maliyetExcel) {
          fileBuffer = Buffer.from(satinalma.maliyetExcel);
          fileName = satinalma.maliyetExcelAdi || "maliyet.xlsx";
          mimeType = satinalma.maliyetExcelTipi || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        }
      }
    }

    if (!fileBuffer) {
      return new NextResponse("Maliyet dosyası bulunamadı", { status: 404 });
    }

    const disposition = tip === "pdf" ? "inline" : "attachment";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType || "application/octet-stream",
        "Content-Disposition": `${disposition}; filename="${encodeURIComponent(fileName || 'maliyet-dosya')}"`,
      },
    });
  } catch (error) {
    console.error("Maliyet dosyası okuma hatası:", error);
    return new NextResponse("Maliyet dosyası okunurken hata oluştu", { status: 500 });
  }
}