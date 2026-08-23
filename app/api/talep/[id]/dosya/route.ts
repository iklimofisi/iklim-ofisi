import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { suankiKullanici } from "@/lib/oturum";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const kullanici = await suankiKullanici();
  if (!kullanici) {
    return new NextResponse("Yetkisiz", { status: 401 });
  }

  const talep = await prisma.webTalebi.findUnique({ where: { id: params.id } });
  if (!talep || !talep.dosya) {
    return new NextResponse("Bulunamadı", { status: 404 });
  }

  return new NextResponse(talep.dosya, {
    headers: {
      "Content-Type": talep.dosyaTipi || "application/octet-stream",
      "Content-Disposition": `inline; filename="${talep.dosyaAdi || "dosya"}"`,
    },
  });
}
