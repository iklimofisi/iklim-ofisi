import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // 1. Önce Teklif tablosunda ara
    let kayit: { maliyetExcel: Buffer | null; maliyetExcelAdi: string | null; maliyetExcelTipi: string | null } | null =
      await prisma.teklif.findUnique({
        where: { id },
        select: { maliyetExcel: true, maliyetExcelAdi: true, maliyetExcelTipi: true },
      });

    // 2. Bulunamazsa SatinalmaTeklifi tablosunda ara
    if (!kayit || !kayit.maliyetExcel) {
      kayit = await prisma.satinalmaTeklifi.findUnique({
        where: { id },
        select: { maliyetExcel: true, maliyetExcelAdi: true, maliyetExcelTipi: true },
      });
    }

    if (!kayit || !kayit.maliyetExcel) {
      return new NextResponse("Maliyet Excel dosyası bulunamadı", { status: 404 });
    }

    const buffer = Buffer.from(kayit.maliyetExcel);
    const mimeType = kayit.maliyetExcelTipi || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(kayit.maliyetExcelAdi || 'maliyet.xlsx')}"`,
      },
    });
  } catch (error) {
    console.error("Maliyet Excel okuma hatası:", error);
    return new NextResponse("Sunucu hatası", { status: 500 });
  }
}