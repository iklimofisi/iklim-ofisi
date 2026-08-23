import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { satinalmaTeklifiniDonustur } from "@/lib/actions";

export const dynamic = "force-dynamic";

function paraFormat(n: number, paraBirimi: string = "TRY") {
  return n.toLocaleString("tr-TR", { style: "currency", currency: paraBirimi });
}

export default async function SatinalmaTeklifiDetay({ params }: { params: { id: string } }) {
  const [satinalmaTeklifi, musteriler] = await Promise.all([
    prisma.satinalmaTeklifi.findUnique({
      where: { id: params.id },
      include: { tedarikci: true, kalemler: true, tekliflar: { include: { musteri: true } } },
    }),
    prisma.musteri.findMany({ orderBy: { ad: "asc" } }),
  ]);

  if (!satinalmaTeklifi) notFound();

  const toplam = satinalmaTeklifi.kalemler.reduce((a, k) => a + k.adet * k.birimFiyat, 0);

  return (
    <div className="max-w-3xl">
      <Link href="/panel/satinalma/teklifler" className="focus-ring text-sm text-metin/60 hover:text-metin mb-6 inline-block">
        ← Gelen Tekliflere dön
      </Link>

      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Satınalma Teklifi</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-1">{satinalmaTeklifi.baslik}</h1>
      <p className="text-sm text-metin/60 mb-8">{satinalmaTeklifi.tedarikci.ad} · {satinalmaTeklifi.tarih.toISOString().slice(0, 10)}</p>

      <div className="bg-yuzey border border-hat rounded-lg p-5 mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-metin/50 border-b border-hat">
              <th className="py-2 font-medium">Açıklama</th>
              <th className="py-2 font-medium text-right">Adet</th>
              <th className="py-2 font-medium text-right">Birim Fiyat</th>
              <th className="py-2 font-medium text-right">Tutar</th>
            </tr>
          </thead>
          <tbody>
            {satinalmaTeklifi.kalemler.map((k) => (
              <tr key={k.id} className="border-b border-hat last:border-0">
                <td className="py-3 text-metin">{k.aciklama}</td>
                <td className="py-3 text-right font-mono text-metin/70">{k.adet}</td>
                <td className="py-3 text-right font-mono text-metin/70">{paraFormat(k.birimFiyat, satinalmaTeklifi.paraBirimi)}</td>
                <td className="py-3 text-right font-mono text-metin">{paraFormat(k.adet * k.birimFiyat, satinalmaTeklifi.paraBirimi)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mt-4 pt-4 border-t border-hat">
          <p className="font-mono text-lg text-metin">{paraFormat(toplam, satinalmaTeklifi.paraBirimi)}</p>
        </div>
      </div>

      {satinalmaTeklifi.tekliflar.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-medium text-metin/50 mb-2">Bu teklifle oluşturulan teklifler</p>
          <div className="space-y-2">
            {satinalmaTeklifi.tekliflar.map((t) => (
              <Link key={t.id} href={`/panel/teklifler/${t.id}`} className="focus-ring block text-sm text-soguk-dim hover:underline">
                {t.baslik} — {t.musteri.ad}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-yuzey border border-hat rounded-lg p-5">
        <h2 className="font-display font-medium text-metin mb-1">Bizim Teklife Dönüştür</h2>
        <p className="text-sm text-metin/60 mb-4">
          Buradaki kalemler, girdiğin kâr marjı eklenerek yeni bir teklife
          kopyalanır. Bu teklif "satınalma teklifinden oluşturuldu" olarak
          işaretlenir.
        </p>
        {musteriler.length === 0 ? (
          <p className="text-sm text-metin/50">Önce Müşteriler sayfasından bir müşteri eklemelisin.</p>
        ) : (
          <form action={satinalmaTeklifiniDonustur} className="grid sm:grid-cols-2 gap-3">
            <input type="hidden" name="satinalmaTeklifiId" value={satinalmaTeklifi.id} />
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Müşteri</label>
              <select name="musteriId" required className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm">
                {musteriler.map((m) => (
                  <option key={m.id} value={m.id}>{m.ad}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Kâr Marjı (%)</label>
              <input name="marjYuzdesi" type="number" defaultValue={10} required className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-metin/60 mb-1">Teklif / Proje Adı</label>
              <input
                name="baslik"
                required
                defaultValue={satinalmaTeklifi.baslik}
                className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors">
                Teklife Dönüştür
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
