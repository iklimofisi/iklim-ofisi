import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { kesifiTeklifeDonustur } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function KesifDetay({ params }: { params: { id: string } }) {
  const [kesif, musteriler] = await Promise.all([
    prisma.kesifFormu.findUnique({
      where: { id: params.id },
      include: { olusturulanTeklif: true },
    }),
    prisma.musteri.findMany({ orderBy: { ad: "asc" } }),
  ]);

  if (!kesif) notFound();

  const eslesenMusteri = musteriler.find((m) => m.ad === kesif.musteriAdi);

  return (
    <div className="max-w-2xl">
      <Link href="/panel/kesif" className="focus-ring text-sm text-metin/60 hover:text-metin mb-6 inline-block">
        ← Keşiflere dön
      </Link>

      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Keşif</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-1">{kesif.musteriAdi}</h1>
      <p className="text-sm text-metin/60 mb-8">
        {kesif.tarih.toISOString().slice(0, 10)}
        {kesif.olusturanAdi && ` · ${kesif.olusturanAdi} tarafından dolduruldu`}
      </p>

      <div className="bg-yuzey border border-hat rounded-lg p-5 mb-8 space-y-3 text-sm">
        {kesif.telefon && (
          <div><span className="text-metin/50">Telefon: </span><span className="text-metin">{kesif.telefon}</span></div>
        )}
        {kesif.adres && (
          <div><span className="text-metin/50">Adres: </span><span className="text-metin">{kesif.adres}</span></div>
        )}
        {kesif.alanM2 && (
          <div><span className="text-metin/50">Alan: </span><span className="text-metin">{kesif.alanM2} m²</span></div>
        )}
        {kesif.mevcutSistem && (
          <div><span className="text-metin/50">Mevcut Sistem: </span><span className="text-metin">{kesif.mevcutSistem}</span></div>
        )}
        <div>
          <p className="text-metin/50 mb-1">Notlar</p>
          <p className="text-metin whitespace-pre-line">{kesif.notlar}</p>
        </div>
      </div>

      {kesif.olusturulanTeklif ? (
        <Link
          href={`/panel/teklifler/${kesif.olusturulanTeklif.id}`}
          className="focus-ring inline-block bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
        >
          Oluşturulan Teklifi Görüntüle →
        </Link>
      ) : (
        <div className="bg-yuzey border border-hat rounded-lg p-5">
          <h2 className="font-display font-medium text-metin mb-1">Teklife Dönüştür</h2>
          <p className="text-sm text-metin/60 mb-4">
            Keşif notların ilk kalem olarak eklenmiş bir teklif taslağı
            oluşturulacak, ardından teklifi düzenleyerek gerçek kalemleri
            girebilirsin.
          </p>
          {musteriler.length === 0 ? (
            <p className="text-sm text-metin/50">
              Bu müşteri sistemde kayıtlı değil. Önce Müşteriler sayfasından
              "{kesif.musteriAdi}" adıyla bir müşteri ekle, sonra buraya dön.
            </p>
          ) : (
            <form action={kesifiTeklifeDonustur} className="space-y-3">
              <input type="hidden" name="kesifId" value={kesif.id} />
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">Müşteri</label>
                <select name="musteriId" required defaultValue={eslesenMusteri?.id ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm">
                  <option value="" disabled>Müşteri seç</option>
                  {musteriler.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.ad}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-metin/40 mt-1">
                  Listede "{kesif.musteriAdi}" yoksa önce Müşteriler sayfasından ekleyip geri gel.
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">Teklif / Proje Adı</label>
                <input
                  name="baslik"
                  required
                  defaultValue={`${kesif.musteriAdi} - Keşif`}
                  className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors">
                  Teklife Dönüştür
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
