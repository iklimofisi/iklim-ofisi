import { prisma } from "@/lib/prisma";
import { kesifEkle, kesifSil } from "@/lib/actions";
import SilButon from "@/components/SilButon";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function KesifSayfasi() {
  const kesifler = await prisma.kesifFormu.findMany({
    include: { olusturulanTeklif: true },
    orderBy: { tarih: "desc" },
  });

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">Keşif Formu</h1>
      <p className="text-sm text-metin/60 mb-8">
        Sahada keşfe giden çalışan bu formu telefonundan doldurup kaydeder.
        Ofise dönünce keşif kaydının detayından "Teklife Dönüştür" ile
        doğrudan teklif taslağı oluşturabilirsin.
      </p>

      <form action={kesifEkle} className="bg-yuzey border border-hat rounded-lg p-5 mb-10 space-y-4">
        <h2 className="font-display font-medium text-metin mb-1">Yeni Keşif</h2>

        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Müşteri Adı</label>
          <input name="musteriAdi" required className="focus-ring w-full border border-hat rounded-md px-3 py-3 text-base" placeholder="Firma / kişi adı" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Telefon</label>
            <input name="telefon" className="focus-ring w-full border border-hat rounded-md px-3 py-3 text-base" placeholder="05xx xxx xx xx" />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Alan (m²)</label>
            <input name="alanM2" type="number" className="focus-ring w-full border border-hat rounded-md px-3 py-3 text-base" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Adres</label>
          <input name="adres" className="focus-ring w-full border border-hat rounded-md px-3 py-3 text-base" placeholder="Keşif yapılan adres" />
        </div>
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Mevcut Sistem</label>
          <input name="mevcutSistem" className="focus-ring w-full border border-hat rounded-md px-3 py-3 text-base" placeholder="örn. eski split klima var, tesisat yok" />
        </div>
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Keşif Notları</label>
          <textarea
            name="notlar"
            required
            rows={5}
            className="focus-ring w-full border border-hat rounded-md px-3 py-3 text-base"
            placeholder="Ölçüler, önerilen sistem, dikkat edilmesi gerekenler..."
          />
        </div>
        <button type="submit" className="focus-ring w-full sm:w-auto bg-soguk text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors">
          Keşfi Kaydet
        </button>
      </form>

      <div className="space-y-3">
        {kesifler.map((k) => (
          <div key={k.id} className="bg-yuzey border border-hat rounded-lg p-4 flex items-center justify-between gap-3">
            <Link href={`/panel/kesif/${k.id}`} className="focus-ring min-w-0">
              <p className="font-medium text-metin text-sm hover:text-soguk-dim transition-colors truncate">{k.musteriAdi}</p>
              <p className="text-xs text-metin/50">
                {k.tarih.toISOString().slice(0, 10)}
                {k.olusturanAdi && ` · ${k.olusturanAdi}`}
                {k.olusturulanTeklif && " · Teklife dönüştürüldü"}
              </p>
            </Link>
            <SilButon id={k.id} action={kesifSil} onayMesaji="Bu keşif kaydını silmek istediğine emin misin?" />
          </div>
        ))}
        {kesifler.length === 0 && (
          <p className="text-sm text-metin/50">Henüz keşif kaydı yok.</p>
        )}
      </div>
    </div>
  );
}
