import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { suankiKullanici } from "@/lib/oturum";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Panel dosyası: yalnızca giriş yapmış kullanıcılar indirebilir
  if (!(await suankiKullanici())) {
    return new NextResponse("Yetkisiz", { status: 401 });
  }

  try {
    const siparis = await prisma.siparis.findUnique({ where: { id: params.id } });

    // DÜZELTİLDİ: teslimEvraki yerine sozlesmeDosya kullanılıyor
    if (!siparis || !siparis.sozlesmeDosya) {
      return new NextResponse("Sözleşme / Evrak bulunamadı", { status: 404 });
    }

    const contentType = siparis.sozlesmeDosyaTipi || "application/pdf";
    const fileName = siparis.sozlesmeDosyaAdi || "sozlesme-evraki.pdf";
    const buffer = Buffer.from(siparis.sozlesmeDosya);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
      },
    });
  } catch (error) {
    return new NextResponse("Evrak okuma hatası", { status: 500 });
  }
}