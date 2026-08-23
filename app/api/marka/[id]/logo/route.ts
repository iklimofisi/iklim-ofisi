import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const marka = await prisma.marka.findUnique({ where: { id: params.id } });
  if (!marka || !marka.logo) {
    return new NextResponse("Bulunamadı", { status: 404 });
  }

  return new NextResponse(marka.logo, {
    headers: {
      "Content-Type": marka.logoTipi || "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
