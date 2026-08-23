import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ziyaretHatirlatmaTamamlandi, ziyaretSil } from "@/lib/actions";
import SilButon from "@/components/SilButon";

export const dynamic = "force-dynamic";

export default async function ZiyaretlerSayfasi() {
  const [ziyaretler, bugun] = await Promise.all([
    prisma.ziyaret.findMany({
      include: { musteri: true, proje: true },
      orderBy: { tarih: "desc" },
    }),
    Promise.resolve(new Date()),
  ]);

  bugun.setHours(23, 59, 59, 999);

  const hatirlatmalar = ziyaretler
    .filter((z) => z.hatirlatmaTarihi && !z.hatirlatmaTamam && z.hatirlatmaTarihi <= bugun)
    .sort((a, b) => (a.hatirlatmaTarihi!.getTime() - b.hatirlatmaTarihi!.getTime()));

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-8">Ziyaretler</h1>

      {hatirlatmalar.length > 0 && (
        <div className="mb-10">
          <h2 className="font-display font-medium text-sicak-dim mb-3">
            ⏰ Hatırlatmalar ({hatirlatmalar.length})
          </h2>
          <div className="space-y-2">
            {hatirlatmalar.map((z) => (
              <div key={z.id} className="bg-sicak-light border border-sicak/30 rounded-lg p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-metin">
                    {z.hatirlatmaNotu || z.not}
                  </p>
                  <p className="text-xs text-metin/50">
                    {z.hatirlatmaTarihi!.toISOString().slice(0, 10)}
                    {z.musteri && (
                      <> · <Link href={`/panel/musteriler/${z.musteri.id}`} className="text-soguk-dim hover:underline">{z.musteri.ad}</Link></>
                    )}
                    {z.proje && (
                      <> · <Link href={`/panel/projeler/${z.proje.id}`} className="text-soguk-dim hover:underline">{z.proje.ad}</Link></>
                    )}
                  </p>
                </div>
                <form action={ziyaretHatirlatmaTamamlandi.bind(null, z.id)}>
                  <button type="submit" className="focus-ring shrink-0 text-xs bg-soguk text-white px-3 py-1.5 rounded-md font-medium hover:bg-soguk-dim transition-colors">
                    Tamamlandı
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="font-display font-medium text-metin mb-3">Tüm Ziyaretler</h2>
      <div className="space-y-3">
        {ziyaretler.map((z) => (
          <div key={z.id} className="bg-yuzey border border-hat rounded-lg p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-xs text-metin/50">
                {z.tarih.toISOString().slice(0, 10)}
                {z.olusturanAdi && ` · ${z.olusturanAdi}`}
                {z.musteri && (
                  <> · <Link href={`/panel/musteriler/${z.musteri.id}`} className="text-soguk-dim hover:underline">{z.musteri.ad}</Link></>
                )}
                {z.proje && (
                  <> · <Link href={`/panel/projeler/${z.proje.id}`} className="text-soguk-dim hover:underline">{z.proje.ad}</Link></>
                )}
              </p>
              <SilButon id={z.id} action={ziyaretSil} onayMesaji="Bu ziyaret kaydını silmek istediğine emin misin?" />
            </div>
            <p className="text-sm text-metin/80 whitespace-pre-line">{z.not}</p>
            {z.hatirlatmaTarihi && (
              <p className={`text-xs mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${
                z.hatirlatmaTamam ? "bg-hat text-metin/40" : "bg-sicak-light text-sicak-dim"
              }`}>
                ⏰ {z.hatirlatmaTarihi.toISOString().slice(0, 10)}
                {z.hatirlatmaNotu && ` — ${z.hatirlatmaNotu}`}
                {z.hatirlatmaTamam && " (tamamlandı)"}
              </p>
            )}
          </div>
        ))}
        {ziyaretler.length === 0 && (
          <p className="text-sm text-metin/50">
            Henüz ziyaret kaydı yok. Bir müşteri veya proje sayfasından ekleyebilirsin.
          </p>
        )}
      </div>
    </div>
  );
}
