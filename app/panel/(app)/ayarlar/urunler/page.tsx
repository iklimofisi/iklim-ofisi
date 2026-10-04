import { prisma } from "@/lib/prisma";
import { urunEkle, urunSil } from "@/lib/actions";
import { paraFormat } from "@/lib/para";
import SilButon from "@/components/SilButon";
import HizliAramaListesi from "@/components/HizliAramaListesi";
import UrunExcelYukle from "@/components/UrunExcelYukle";
import Link from "next/link";
import KaydetButonu from "@/components/KaydetButonu";

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
          <KaydetButonu basari="Eklendi." className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors">
            Ekle
          </KaydetButonu>
        </form>
      </details>

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-metin/60">{urunler.length} ürün</p>
      </div>

      {/* Ürün kataloğu: sayfa başına 20 ürün; arama tüm katalogda yapılır */}
      <div className="overflow-x-auto">
        <div className="min-w-[44rem]">
          <HizliAramaListesi
            yerTutucu="Hızlı ara: ürün kodu, adı, marka…"
            bosMetin="Henüz ürün eklenmedi."
            birim="ürün"
            sayfaBasina={20}
            bosluk="bg-yuzey border border-hat rounded-b-lg divide-y divide-hat"
            baslik={
              <div className="grid grid-cols-[6rem_1fr_7rem_4rem_8rem_2.5rem] gap-3 items-center px-5 py-3 text-xs text-metin/50 font-medium bg-yuzey border border-b-0 border-hat rounded-t-lg">
                <span>Kod</span>
                <span>Ürün Adı</span>
                <span>Marka</span>
                <span>Birim</span>
                <span className="text-right">Liste Fiyatı</span>
                <span className="text-right">İşlem</span>
              </div>
            }
            satirlar={urunler.map((u) => ({
              id: u.id,
              aramaMetni: [u.kod, u.ad, u.marka?.ad, u.birim, u.paraBirimi].filter(Boolean).join(" "),
              icerik: (
                <div className="grid grid-cols-[6rem_1fr_7rem_4rem_8rem_2.5rem] gap-3 items-center px-5 py-3 text-sm">
                  <span className="font-mono text-metin/50 truncate">{u.kod ?? "—"}</span>
                  <span className="text-metin break-words">{u.ad}</span>
                  <span className="text-metin/60 truncate">{u.marka?.ad ?? "—"}</span>
                  <span className="text-metin/60">{u.birim}</span>
                  <span className="text-right font-mono text-metin whitespace-nowrap">{paraFormat(u.listeFiyati, u.paraBirimi)}</span>
                  <span className="text-right">
                    <SilButon id={u.id} action={urunSil} onayMesaji={`${u.ad} ürününü silmek istediğine emin misin?`} />
                  </span>
                </div>
              ),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
