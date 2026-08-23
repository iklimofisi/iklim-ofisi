import { prisma } from "@/lib/prisma";
import { tedarikciEkle } from "@/lib/actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SatinalmaSayfasi() {
  const tedarikciler = await prisma.tedarikci.findMany({
    orderBy: { createdAt: "desc" },
    include: { hareketler: true },
  });

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">Satınalma</h1>
      <p className="text-sm text-metin/60 mb-8">
        Tedarikçilerini buradan yönet.{" "}
        <Link href="/panel/satinalma/teklifler" className="text-soguk-dim hover:underline">Gelen Teklifler</Link>
        {" "}sayfasından tedarikçiden aldığın bir teklifi sisteme yükleyip kâr marjı ekleyerek
        kendi teklif formatına dönüştürebilirsin.{" "}
        <Link href="/panel/satinalma/cari" className="text-soguk-dim hover:underline">Tedarikçi Cari Hesabı</Link>
        {" "}sayfasından borç/ödeme takibi yapabilirsin.
      </p>

      <form action={tedarikciEkle} className="bg-yuzey border border-hat rounded-lg p-5 mb-8 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-metin/60 mb-1">Tedarikçi Adı</label>
          <input name="ad" required className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-metin/60 mb-1">Telefon</label>
          <input name="telefon" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-metin/60 mb-1">Vergi No</label>
          <input name="vergiNo" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-metin/60 mb-1">Adres</label>
          <input name="adres" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors">
          Ekle
        </button>
      </form>

      <div className="bg-yuzey border border-hat rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-metin/50 border-b border-hat">
              <th className="px-5 py-3 font-medium">Ad</th>
              <th className="px-5 py-3 font-medium">Telefon</th>
              <th className="px-5 py-3 font-medium">Vergi No</th>
              <th className="px-5 py-3 font-medium">Adres</th>
            </tr>
          </thead>
          <tbody>
            {tedarikciler.map((t) => (
              <tr key={t.id} className="border-b border-hat last:border-0">
                <td className="px-5 py-3 text-metin">{t.ad}</td>
                <td className="px-5 py-3 font-mono text-metin/70">{t.telefon ?? "—"}</td>
                <td className="px-5 py-3 font-mono text-metin/50">{t.vergiNo ?? "—"}</td>
                <td className="px-5 py-3 text-metin/60">{t.adres ?? "—"}</td>
              </tr>
            ))}
            {tedarikciler.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-metin/50">Henüz tedarikçi eklenmedi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
