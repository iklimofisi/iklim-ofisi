import { prisma } from "@/lib/prisma";
import { tedarikciEkle, tedarikciGuncelle } from "@/lib/actions";
import Link from "next/link";
import KaydetButonu from "@/components/KaydetButonu";
import { sayfaYetkisi } from "@/lib/oturum";

export const dynamic = "force-dynamic";

export default async function SatinalmaSayfasi() {
  await sayfaYetkisi("satinalma");
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
        {" "}sayfasından borç/ödeme takibi yapabilirsin.{" "}
        <Link href="/panel/satinalma/siparisler" className="text-soguk-dim hover:underline">Satınalma Siparişleri</Link>
        {" "}sayfasından tedarikçiye sipariş verip mal kabul ve alış faturasını takip edebilirsin.
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
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-metin/60 mb-1">E-posta (sipariş için)</label>
          <input name="email" type="email" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-metin/60 mb-1">Vergi No</label>
          <input name="vergiNo" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-metin/60 mb-1">Adres</label>
          <input name="adres" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
        </div>
        <KaydetButonu basari="Eklendi." className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors">
          Ekle
        </KaydetButonu>
      </form>

      <div className="bg-yuzey border border-hat rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-metin/50 border-b border-hat">
              <th className="px-5 py-3 font-medium">Ad</th>
              <th className="px-5 py-3 font-medium">Telefon · E-posta</th>
              <th className="px-5 py-3 font-medium">Vergi No</th>
              <th className="px-5 py-3 font-medium">Adres</th>
            </tr>
          </thead>
          <tbody>
            {tedarikciler.map((t) => (
              <tr key={t.id} className="border-b border-hat last:border-0">
                <td className="px-5 py-3 text-metin align-top">
                  {t.ad}
                  <details className="mt-1">
                    <summary className="cursor-pointer text-[11px] text-soguk-dim hover:underline">Düzenle</summary>
                    <form action={tedarikciGuncelle} className="mt-2 grid gap-2 w-64">
                      <input type="hidden" name="tedarikciId" value={t.id} />
                      <input name="ad" required defaultValue={t.ad} aria-label="Ad" className="focus-ring border border-hat rounded-md px-2 py-1.5 text-xs" />
                      <input name="telefon" defaultValue={t.telefon ?? ""} placeholder="Telefon" aria-label="Telefon" className="focus-ring border border-hat rounded-md px-2 py-1.5 text-xs" />
                      <input name="email" type="email" defaultValue={t.email ?? ""} placeholder="E-posta" aria-label="E-posta" className="focus-ring border border-hat rounded-md px-2 py-1.5 text-xs" />
                      <input name="vergiNo" defaultValue={t.vergiNo ?? ""} placeholder="Vergi no" aria-label="Vergi no" className="focus-ring border border-hat rounded-md px-2 py-1.5 text-xs" />
                      <input name="adres" defaultValue={t.adres ?? ""} placeholder="Adres" aria-label="Adres" className="focus-ring border border-hat rounded-md px-2 py-1.5 text-xs" />
                      <KaydetButonu className="focus-ring bg-soguk text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-soguk-dim">Kaydet</KaydetButonu>
                    </form>
                  </details>
                </td>
                <td className="px-5 py-3 align-top">
                  <span className="font-mono text-metin/70">{t.telefon ?? "—"}</span>
                  {t.email && <span className="block text-xs text-metin/60">{t.email}</span>}
                </td>
                <td className="px-5 py-3 font-mono text-metin/50 align-top">{t.vergiNo ?? "—"}</td>
                <td className="px-5 py-3 text-metin/60 align-top">{t.adres ?? "—"}</td>
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
