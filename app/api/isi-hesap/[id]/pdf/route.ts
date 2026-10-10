import { NextRequest } from "next/server";
import { suankiKullanici } from "@/lib/oturum";
import { prisma } from "@/lib/prisma";
import { getSirketAyarlari } from "@/lib/sirket";
import { veriOku } from "@/lib/isi-hesap/tipler";
import { sistemiHesapla } from "@/lib/isi-hesap/hesap";
import { aktifPompaModelleri } from "@/lib/isi-hesap/modeller-db";
import { isiHesapPdfOlustur } from "@/lib/isi-hesap/pdf";

// Isı pompası hesabı PDF raporu (panel). ?indir=1 → dosya olarak indirir.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const dosyaAdi = (t: string) =>
  (t
    .replace(/[ğĞ]/g, "g")
    .replace(/[üÜ]/g, "u")
    .replace(/[şŞ]/g, "s")
    .replace(/[ıİ]/g, "i")
    .replace(/[öÖ]/g, "o")
    .replace(/[çÇ]/g, "c")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "Isi-Pompasi-Hesabi") + ".pdf";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await suankiKullanici())) return new Response("Yetkisiz", { status: 401 });

  const hesap = await prisma.isiHesap.findUnique({
    where: { id: params.id },
    include: { musteri: { select: { ad: true } } },
  });
  if (!hesap) return new Response("Hesap bulunamadı", { status: 404 });

  const veri = veriOku(hesap.veri);
  const sonuc = sistemiHesapla(veri, await aktifPompaModelleri());
  const sirket = await getSirketAyarlari();
  const pdf = isiHesapPdfOlustur(
    { baslik: hesap.ad, musteri: hesap.musteri?.ad ?? null, hazirlayan: hesap.olusturanAdi, tarih: hesap.updatedAt },
    veri,
    sonuc,
    sirket
  );
  const indir = req.nextUrl.searchParams.get("indir") === "1";
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${indir ? "attachment" : "inline"}; filename="${dosyaAdi(hesap.ad)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
