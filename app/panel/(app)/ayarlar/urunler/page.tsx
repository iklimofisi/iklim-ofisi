import { prisma } from "@/lib/prisma";
import { urunEkle, urunSil } from "@/lib/actions";
import { paraFormat } from "@/lib/para";
import SilButon from "@/components/SilButon";
import UrunExcelYukle from "@/components/UrunExcelYukle";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function UrunlerSayfasi() {
  const [urunler, markalar] = await Promise.all([
    prisma.urun.findMany({ include: { marka: true }, orderBy: { ad: "asc" } }),
    prisma.marka.findMany({ orderBy: { ad: "asc" } }),
  ]);

  return (
    <div>
      <Link href="/panel/ayarlar" className="focus-ring text-sm text-metin/60 hover:text-metin mb-6 inline-block">
        ← Ayarlara dön
      </Link>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">Ürün Kataloğu</h1>
      <p className="text-sm text-metin/60 mb-8">
        Buraya eklediğin ürünler (örn. VRF liste fiyatların), teklif
        hazırlarken bir kalem için arama kutusuna yazıp seçebiliyorsun —
        açıklama, birim fiyat ve marka otomatik dolar, sonra istersen
        düzenlersin.
      </p>

      <UrunExcelYukle />

      <details className="bg-yuzey border border-hat rounded-lg mb-8">
        <summary className="cursor-pointer select-none px-5 py-3 text-sm font-medium text-metin/70">
          Ya da tek tek ekle
        </summary>
        <form action={urunEkle} className="p-5 pt-0">
          <div className="grid sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Ürün Kodu (opsiyonel)</label>
              <input name="kod" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" placeholder="örn. RXYQ8T" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-metin/60 mb-1">Ürün Adı</label>
              <input name="ad" required className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" placeholder="örn. VRF Dış Ünite 8HP" />
            </div>
          </div>
          <div className="grid sm:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Marka</label>
              <select name="markaId" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
                <option value="">— Marka yok —</option>
                {markalar.map((m) => (
                  <option key={m.id} value={m.id}>{m.ad}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Birim</label>
              <input name="birim" defaultValue="Adet" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Liste Fiyatı</label>
              <input name="listeFiyati" type="number" required className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Para Birimi</label>
              <select name="paraBirimi" defaultValue="TRY" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
                <option value="TRY">₺ TRY</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div>
          </div>
          <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors">
            Ekle
          </button>
        </form>
      </details>

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-metin/60">{urunler.length} ürün</p>
      </div>

      <div className="bg-yuzey border border-hat rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-metin/50 border-b border-hat">
              <th className="px-5 py-3 font-medium">Kod</th>
              <th className="px-5 py-3 font-medium">Ürün Adı</th>
              <th className="px-5 py-3 font-medium">Marka</th>
              <th className="px-5 py-3 font-medium">Birim</th>
              <th className="px-5 py-3 font-medium text-right">Liste Fiyatı</th>
              <th className="px-5 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {urunler.map((u) => (
              <tr key={u.id} className="border-b border-hat last:border-0">
                <td className="px-5 py-3 font-mono text-metin/50 whitespace-nowrap">{u.kod ?? "—"}</td>
                <td className="px-5 py-3 text-metin whitespace-nowrap">{u.ad}</td>
                <td className="px-5 py-3 text-metin/60 whitespace-nowrap">{u.marka?.ad ?? "—"}</td>
                <td className="px-5 py-3 text-metin/60 whitespace-nowrap">{u.birim}</td>
                <td className="px-5 py-3 text-right font-mono text-metin whitespace-nowrap">{paraFormat(u.listeFiyati, u.paraBirimi)}</td>
                <td className="px-5 py-3 text-right">
                  <SilButon id={u.id} action={urunSil} onayMesaji={`${u.ad} ürününü silmek istediğine emin misin?`} />
                </td>
              </tr>
            ))}
            {urunler.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-metin/50">Henüz ürün eklenmedi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
