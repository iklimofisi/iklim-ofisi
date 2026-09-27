import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { satinalmaTeklifiniDonustur, satinalmaTeklifiGuncelle } from "@/lib/actions";
import KaydetButonu from "@/components/KaydetButonu";
import SatinalmaKalemGirisi from "@/components/SatinalmaKalemGirisi";
import { satinalmaToplami, kalemToplami } from "@/lib/satinalma-hesap";

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

  const toplam = satinalmaToplami(satinalmaTeklifi);
  const goturu = satinalmaTeklifi.toplamTutar != null && satinalmaTeklifi.toplamTutar > 0;
  const fiyatliToplam = kalemToplami(satinalmaTeklifi.kalemler);
  const fiyatsizVar = satinalmaTeklifi.kalemler.some((k) => !(k.birimFiyat > 0));

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
                <td className="py-3 text-right font-mono text-metin/70">
                  {k.birimFiyat > 0 ? paraFormat(k.birimFiyat, satinalmaTeklifi.paraBirimi) : "—"}
                </td>
                <td className="py-3 text-right font-mono text-metin">
                  {k.birimFiyat > 0 ? paraFormat(k.adet * k.birimFiyat, satinalmaTeklifi.paraBirimi) : "—"}
                </td>
              </tr>
            ))}
            {satinalmaTeklifi.kalemler.length === 0 && (
              <tr>
                <td colSpan={4} className="py-3 text-sm text-metin/50">Kalem girilmemiş. Aşağıdan ekleyebilirsiniz.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex flex-col items-end mt-4 pt-4 border-t border-hat">
          {goturu && fiyatliToplam > 0 && (
            <p className="text-xs text-metin/50">Birim fiyatlı kalemler: {paraFormat(fiyatliToplam, satinalmaTeklifi.paraBirimi)}</p>
          )}
          <p className="font-mono text-lg text-metin">
            {goturu && <span className="font-sans text-xs text-metin/50 mr-2">Tedarikçinin verdiği toplam</span>}
            {paraFormat(toplam, satinalmaTeklifi.paraBirimi)}
          </p>
        </div>

        <details className="group mt-4 border-t border-hat pt-3" open={satinalmaTeklifi.kalemler.length === 0 && !goturu}>
          <summary className="cursor-pointer text-sm font-medium text-soguk-dim hover:underline list-none">
            <span className="group-open:hidden">✎ Kalemleri / toplamı düzenle</span>
            <span className="hidden group-open:inline">Kalemleri / toplamı düzenle</span>
          </summary>
          <form action={satinalmaTeklifiGuncelle} className="mt-3 space-y-3">
            <input type="hidden" name="satinalmaTeklifiId" value={satinalmaTeklifi.id} />
            <SatinalmaKalemGirisi
              sabitParaBirimi={satinalmaTeklifi.paraBirimi}
              baslangic={satinalmaTeklifi.kalemler.map((k) => ({ aciklama: k.aciklama, adet: k.adet, birimFiyat: k.birimFiyat }))}
              baslangicToplam={satinalmaTeklifi.toplamTutar}
            />
            <div className="flex justify-end">
              <KaydetButonu>Kaydet</KaydetButonu>
            </div>
          </form>
        </details>
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
        {goturu && fiyatsizVar && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-4">
            Bazı kalemlerin birim fiyatı yok. Tedarikçinin toplamı (+ kâr marjı) kalemlere paylaştırılır ve müşteri
            teklifinde <b>birim fiyatlar gizlenir</b>: müşteri kalemleri ve genel toplamı görür. İsterseniz sonra teklifi
            düzenleyip fiyatları elle değiştirebilirsiniz.
          </p>
        )}
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
              <KaydetButonu basari="Teklif oluşturuldu." className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors">
                Teklife Dönüştür
              </KaydetButonu>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
