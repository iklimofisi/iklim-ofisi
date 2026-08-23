import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // 1. Önce Müşteri Cari Hareketinde ara
    let kayit: { evrakDosya: Buffer | null; evrakDosyaTipi: string | null; evrakDosyaAdi: string | null } | null =
      await prisma.cariHareket.findUnique({
        where: { id },
        select: { evrakDosya: true, evrakDosyaTipi: true, evrakDosyaAdi: true },
      });

    // 2. Bulunamazsa Tedarikçi Cari Hareketinde ara
    if (!kayit || !kayit.evrakDosya) {
      kayit = await prisma.tedarikciHareket.findUnique({
        where: { id },
        select: { evrakDosya: true, evrakDosyaTipi: true, evrakDosyaAdi: true },
      });
    }

    if (!kayit || !kayit.evrakDosya) {
      return new NextResponse("Bu kayda ait veritabanında evrak/çek görseli bulunamadı.", { status: 404 });
    }

    const buffer = Buffer.from(kayit.evrakDosya);
    const mimeType = kayit.evrakDosyaTipi || "application/pdf";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(kayit.evrakDosyaAdi || 'evrak')}"`,
      },
    });
  } catch (err) {
    console.error("Evrak okuma hatası:", err);
    return new NextResponse("Sunucu hatası", { status: 500 });
  }
}