import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { suankiKullanici } from "@/lib/oturum";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const kullanici = await suankiKullanici();
  if (!kullanici) {
    return new NextResponse("Yetkisiz", { status: 401 });
  }

  const siparis = await prisma.siparis.findUnique({ where: { id: params.id } });
  if (!siparis || !siparis.sozlesmeDosya) {
    return new NextResponse("Bulunamadı", { status: 404 });
  }

  return new NextResponse(siparis.sozlesmeDosya, {
    headers: {
      "Content-Type": siparis.sozlesmeDosyaTipi || "application/pdf",
      "Content-Disposition": `inline; filename="${siparis.sozlesmeDosyaAdi || "sozlesme.pdf"}"`,
    },
  });
}
