import { prisma } from "@/lib/prisma";
import { satinalmaTeklifiEkle, satinalmaTeklifiSil } from "@/lib/actions";
import TeklifKalemleri from "@/components/TeklifKalemleri";
import PdfTeklifYukle from "@/components/PdfTeklifYukle";
import SilButon from "@/components/SilButon";
import Link from "next/link";

export const dynamic = "force-dynamic";

function paraFormat(n: number, paraBirimi: string = "TRY") {
  return n.toLocaleString("tr-TR", { style: "currency", currency: paraBirimi });
}

export default async function SatinalmaTeklifleriSayfasi() {
  const [tedarikciler, teklifler] = await Promise.all([
    prisma.tedarikci.findMany({ orderBy: { ad: "asc" } }),
    prisma.satinalmaTeklifi.findMany({
      include: { tedarikci: true, kalemler: true, tekliflar: true },
      orderBy: { tarih: "desc" },
    }),
  ]);

  return (
    <div>
      <Link href="/panel/satinalma" className="focus-ring text-sm text-metin/60 hover:text-metin mb-6 inline-block">
        ← Satınalmaya dön
      </Link>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-8">Gelen Teklifler</h1>

      {tedarikciler.length === 0 ? (
        <p className="text-sm text-metin/50 mb-10">Önce Satınalma sayfasından en az bir tedarikçi eklemelisin.</p>
      ) : (
        <>
          <PdfTeklifYukle tedarikciler={tedarikciler.map((t) => ({ id: t.id, ad: t.ad }))} />

          <details className="bg-yuzey border border-hat rounded-lg mb-10">
            <summary className="cursor-pointer select-none px-5 py-3 text-sm font-medium text-metin/70">
              Ya da elle gir
            </summary>
            <form action={satinalmaTeklifiEkle} className="p-5 pt-0">
              <label className="block text-xs font-medium text-metin/60 mb-1">Başlık</label>
              <input
                name="baslik"
                required
                placeholder="örn. VRF Dış Ünite Teklifi - XYZ Klima"
                className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm mb-5"
              />
              <div className="grid sm:grid-cols-2 gap-3 mb-5">
                <div>
                  <label className="block text-xs font-medium text-metin/60 mb-1">Tedarikçi</label>
                  <select name="tedarikciId" required className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm">
                    {tedarikciler.map((t) => (
                      <option key={t.id} value={t.id}>{t.ad}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-metin/60 mb-1">Para Birimi</label>
                  <select name="paraBirimi" defaultValue="TRY" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm">
                    <option value="TRY">₺ TRY</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                  </select>
                </div>
              </div>

              <TeklifKalemleri />

              <div className="flex justify-end border-t border-hat pt-4">
                <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors">
                  Kaydet
                </button>
              </div>
            </form>
          </details>
        </>
      )}

      <div className="space-y-3">
        {teklifler.map((t) => {
          const toplam = t.kalemler.reduce((a, k) => a + k.adet * k.birimFiyat, 0);
          return (
            <div key={t.id} className="bg-yuzey border border-hat rounded-lg p-4 flex items-center justify-between gap-3">
              <Link href={`/panel/satinalma/teklifler/${t.id}`} className="focus-ring min-w-0">
                <p className="font-medium text-metin text-sm hover:text-soguk-dim transition-colors truncate">{t.baslik}</p>
                <p className="text-xs text-metin/50">
                  {t.tedarikci.ad} · {t.tarih.toISOString().slice(0, 10)}
                  {t.tekliflar.length > 0 && ` · ${t.tekliflar.length} teklife dönüştürüldü`}
                </p>
              </Link>
              <div className="flex items-center gap-3 shrink-0">
                <p className="font-mono text-metin">{paraFormat(toplam, t.paraBirimi)}</p>
                <SilButon id={t.id} action={satinalmaTeklifiSil} onayMesaji="Bu satınalma teklifini silmek istediğine emin misin?" />
              </div>
            </div>
          );
        })}
        {teklifler.length === 0 && (
          <p className="text-sm text-metin/50">Henüz yüklenmiş bir tedarikçi teklifi yok.</p>
        )}
      </div>
    </div>
  );
}
