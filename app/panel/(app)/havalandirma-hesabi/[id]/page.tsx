import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { veriOku } from "@/lib/havalandirma/tipler";
import HavalandirmaHesapEditoru from "@/components/HavalandirmaHesapEditoru";

export const dynamic = "force-dynamic";

export default async function HavalandirmaHesapSayfasi({ params }: { params: { id: string } }) {
  const [hesap, musteriler] = await Promise.all([
    prisma.havalandirmaHesap.findUnique({ where: { id: params.id }, include: { teklif: { select: { id: true, teklifNo: true } } } }),
    prisma.musteri.findMany({ orderBy: { ad: "asc" }, select: { id: true, ad: true } }),
  ]);
  if (!hesap) notFound();
  return (
    <HavalandirmaHesapEditoru
      hesap={{
        id: hesap.id,
        ad: hesap.ad,
        musteriId: hesap.musteriId ?? "",
        veri: veriOku(hesap.veri),
        teklif: hesap.teklif ? { id: hesap.teklif.id, no: hesap.teklif.teklifNo } : null,
      }}
      musteriler={musteriler}
    />
  );
}
