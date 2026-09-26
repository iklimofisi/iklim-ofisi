import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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

// Panel işlemleri için: giriş yapılmamışsa (veya oturum süresi dolmuşsa)
// hiçbir işlem yapılmaz, kullanıcı giriş sayfasına yönlendirilir.
export async function girisZorunlu() {
  const kullanici = await suankiKullanici();
  if (!kullanici) redirect("/panel/giris");
  return kullanici;
}
