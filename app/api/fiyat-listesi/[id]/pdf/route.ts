import { NextRequest } from "next/server";
import { suankiKullanici } from "@/lib/oturum";
import { prisma } from "@/lib/prisma";
import { getSirketAyarlari } from "@/lib/sirket";
import { fiyatListesiPdfOlustur, type PdfGorsel } from "@/lib/fiyat-listesi-pdf";

// Fotoğraflı fiyat listesi PDF'i (panel). ?indir=1 → dosya olarak indirir.
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
    .slice(0, 80) || "Fiyat-Listesi") + ".pdf";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await suankiKullanici())) return new Response("Yetkisiz", { status: 401 });

  const liste = await prisma.fiyatListesi.findUnique({
    where: { id: params.id },
    include: { kalemler: { orderBy: { sira: "asc" }, include: { urun: { select: { gorselId: true } } } } },
  });
  if (!liste) return new Response("Fiyat listesi bulunamadı", { status: 404 });

  const kalemler = liste.kalemler.map((k) => ({
    bolum: k.bolum,
    ad: k.ad,
    kod: k.kod,
    marka: k.marka,
    aciklama: k.aciklama,
    birim: k.birim,
    fiyat: k.fiyat,
    gorselId: k.gorselId || k.urun?.gorselId || null,
  }));
  const idler = Array.from(new Set(kalemler.map((k) => k.gorselId).filter(Boolean))) as string[];
  const kayitlar = idler.length
    ? await prisma.gorsel.findMany({ where: { id: { in: idler } }, select: { id: true, veri: true, genislik: true, yukseklik: true } })
    : [];
  const gorseller = new Map<string, PdfGorsel>(
    kayitlar.map((g) => [g.id, { veri: new Uint8Array(g.veri), genislik: g.genislik, yukseklik: g.yukseklik }])
  );

  const sirket = await getSirketAyarlari();
  const pdf = fiyatListesiPdfOlustur(liste, kalemler, gorseller, sirket);
  const indir = req.nextUrl.searchParams.get("indir") === "1";

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${indir ? "attachment" : "inline"}; filename="${dosyaAdi(liste.baslik)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
