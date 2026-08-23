import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { suankiKullanici } from "@/lib/oturum";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const kullanici = await suankiKullanici();
  if (!kullanici) {
    return new NextResponse("Yetkisiz", { status: 401 });
  }

  const teslim = await prisma.teslimKaydi.findUnique({ where: { id: params.id } });
  if (!teslim || !teslim.evrak) {
    return new NextResponse("Bulunamadı", { status: 404 });
  }

  return new NextResponse(teslim.evrak, {
    headers: {
      "Content-Type": teslim.evrakTipi || "application/pdf",
      "Content-Disposition": `inline; filename="${teslim.evrakAdi || "teslim-evraki.pdf"}"`,
    },
  });
}
