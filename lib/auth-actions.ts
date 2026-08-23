"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function girisYap(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const sifre = String(formData.get("sifre") ?? "");

  const kullanici = email ? await prisma.kullanici.findUnique({ where: { email } }) : null;
  const dogruMu = kullanici ? await bcrypt.compare(sifre, kullanici.sifreHash) : false;

  if (!kullanici || !dogruMu) {
    redirect("/panel/giris?hata=1");
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 gün
  const oturum = await prisma.session.create({
    data: { kullaniciId: kullanici.id, expiresAt },
  });

  cookies().set("oturum", oturum.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  redirect("/panel");
}

export async function cikisYap() {
  const token = cookies().get("oturum")?.value;
  if (token) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
  }
  cookies().delete("oturum");
  redirect("/panel/giris");
}
