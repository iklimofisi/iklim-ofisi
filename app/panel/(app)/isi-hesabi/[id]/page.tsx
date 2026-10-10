import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { veriOku } from "@/lib/isi-hesap/tipler";
import { aktifPompaModelleri } from "@/lib/isi-hesap/modeller-db";
import IsiHesapEditoru from "@/components/IsiHesapEditoru";

export const dynamic = "force-dynamic";

export default async function IsiHesapSayfasi({ params }: { params: { id: string } }) {
  const [hesap, musteriler, modeller] = await Promise.all([
    prisma.isiHesap.findUnique({
      where: { id: params.id },
      include: { teklif: { select: { id: true, teklifNo: true } } },
    }),
    prisma.musteri.findMany({ orderBy: { ad: "asc" }, select: { id: true, ad: true } }),
    aktifPompaModelleri(),
  ]);
  if (!hesap) notFound();

  return (
    <IsiHesapEditoru
      hesap={{
        id: hesap.id,
        ad: hesap.ad,
        musteriId: hesap.musteriId ?? "",
        veri: veriOku(hesap.veri),
        teklif: hesap.teklif ? { id: hesap.teklif.id, no: hesap.teklif.teklifNo } : null,
      }}
      musteriler={musteriler}
      modeller={modeller}
    />
  );
}
