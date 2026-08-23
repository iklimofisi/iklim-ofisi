import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function suankiKullanici() {
  const token = cookies().get("oturum")?.value;
  if (!token) return null;

  const oturum = await prisma.session.findUnique({
    where: { token },
    include: { kullanici: true },
  });

  if (!oturum || oturum.expiresAt < new Date()) return null;

  return oturum.kullanici;
}
