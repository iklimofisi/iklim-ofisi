import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { suankiKullanici } from "@/lib/oturum";
import { gorebilir } from "@/lib/roller";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Panel dosyası: yalnızca giriş yapmış kullanıcılar indirebilir
  const giren = await suankiKullanici();
  if (!giren) {
    return new NextResponse("Yetkisiz", { status: 401 });
  }

  try {
    const id = params.id;

    // 1. Önce Müşteri Cari Hareketinde ara
    let kayit: { evrakDosya: Buffer | null; evrakDosyaTipi: string | null; evrakDosyaAdi: string | null } | null =
      await prisma.cariHareket.findUnique({
        where: { id },
        select: { evrakDosya: true, evrakDosyaTipi: true, evrakDosyaAdi: true },
      });

    // Müşteri evrakı: finans ya da müşteri yetkisi olan görür
    if (kayit && kayit.evrakDosya && !gorebilir(giren.rol, "finans") && !gorebilir(giren.rol, "musteri")) {
      return new NextResponse("Yetkisiz", { status: 401 });
    }

    // 2. Bulunamazsa Tedarikçi Cari Hareketinde ara (tedarikçi evrakı: satış personeli göremez)
    if (!kayit || !kayit.evrakDosya) {
      if (!gorebilir(giren.rol, "tedarikci") && !gorebilir(giren.rol, "satinalma")) {
        return new NextResponse("Yetkisiz", { status: 401 });
      }
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