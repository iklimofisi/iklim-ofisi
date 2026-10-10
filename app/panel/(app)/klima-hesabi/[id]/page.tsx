import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { klimaVeriOku } from "@/lib/klima-hesap/tipler";
import KlimaHesapEditoru from "@/components/KlimaHesapEditoru";

export const dynamic = "force-dynamic";

export default async function KlimaHesapSayfasi({ params }: { params: { id: string } }) {
  const [hesap, musteriler] = await Promise.all([
    prisma.klimaHesap.findUnique({ where: { id: params.id }, include: { teklif: { select: { id: true, teklifNo: true } } } }),
    prisma.musteri.findMany({ orderBy: { ad: "asc" }, select: { id: true, ad: true } }),
  ]);
  if (!hesap) notFound();
  return (
    <KlimaHesapEditoru
      hesap={{
        id: hesap.id,
        ad: hesap.ad,
        musteriId: hesap.musteriId ?? "",
        veri: klimaVeriOku(hesap.veri),
        teklif: hesap.teklif ? { id: hesap.teklif.id, no: hesap.teklif.teklifNo } : null,
      }}
      musteriler={musteriler}
    />
  );
}
