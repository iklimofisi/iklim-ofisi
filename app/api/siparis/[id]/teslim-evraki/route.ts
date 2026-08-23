import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { suankiKullanici } from "@/lib/oturum";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const kullanici = await suankiKullanici();
  if (!kullanici) {
    return new NextResponse("Yetkisiz", { status: 401 });
  }

  const siparis = await prisma.siparis.findUnique({ where: { id: params.id } });
  if (!siparis || !siparis.teslimEvraki) {
    return new NextResponse("Bulunamadı", { status: 404 });
  }

  return new NextResponse(siparis.teslimEvraki, {
    headers: {
      "Content-Type": siparis.teslimEvrakiTipi || "application/pdf",
      "Content-Disposition": `inline; filename="${siparis.teslimEvrakiAdi || "teslim-evraki.pdf"}"`,
    },
  });
}
