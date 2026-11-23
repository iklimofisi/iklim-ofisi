import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saltOkunurMu, gorebilir, yazabilir, ROL_ETIKET, type Bolum } from "@/lib/roller";

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

// Kayıt değiştiren her sunucu işlemi için: giriş zorunlu; "Yönetici (izleme)" hesabı
// hiçbir kaydı değiştiremez. Bölüm verilirse kullanıcının o bölümde yazma yetkisi aranır.
export async function islemZorunlu(bolum?: Bolum) {
  const kullanici = await girisZorunlu();
  if (saltOkunurMu(kullanici.rol)) throw new Error("Bu hesap yalnız görüntüleme yetkisine sahip; kayıt değiştiremez.");
  if (bolum && !yazabilir(kullanici.rol, bolum))
    throw new Error(`Bu işlem için yetkiniz yok (${ROL_ETIKET[kullanici.rol] ?? kullanici.rol}).`);
  return kullanici;
}

// İndirme adresleri (api) için: giriş + verilen bölümlerden birini görme yetkisi; yoksa null
export async function apiYetkisi(...bolumler: Bolum[]) {
  const kullanici = await suankiKullanici();
  if (!kullanici) return null;
  if (bolumler.length && !bolumler.some((b) => gorebilir(kullanici.rol, b))) return null;
  return kullanici;
}

// Panel sayfaları için: kullanıcının bölümü görme yetkisi yoksa Özet'e döner.
export async function sayfaYetkisi(bolum: Bolum) {
  const kullanici = await girisZorunlu();
  if (!gorebilir(kullanici.rol, bolum)) redirect("/panel?yetki=yok");
  return kullanici;
}
