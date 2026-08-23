import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { teklifGuncelle } from "@/lib/actions";
import TeklifKalemleri from "@/components/TeklifKalemleri";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TeklifDuzenle({ params }: { params: { id: string } }) {
  const [teklif, musteriler, sablonlar, markalar, urunler, projeler] = await Promise.all([
    prisma.teklif.findUnique({
      where: { id: params.id },
      include: { kalemler: true, sablonlar: true },
    }),
    prisma.musteri.findMany({ orderBy: { ad: "asc" } }),
    prisma.teklifSablon.findMany({ orderBy: { sira: "asc" } }),
    prisma.marka.findMany({ orderBy: { ad: "asc" } }),
    prisma.urun.findMany({ orderBy: { ad: "asc" } }),
    prisma.proje.findMany({ orderBy: { ad: "asc" } }),
  ]);

  if (!teklif) notFound();

  const seciliSablonIdleri = new Set(teklif.sablonlar.map((s) => s.id));

  return (
    <div>
      <Link href={`/panel/teklifler/${teklif.id}`} className="focus-ring text-sm text-metin/60 hover:text-metin mb-6 inline-block">
        ← Teklife dön
      </Link>

      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">
        Düzenleniyor · Şu an Rev. {teklif.revizyonNo}
      </p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-8">Teklifi Düzenle</h1>

      <p className="text-sm text-metin/60 mb-6 bg-soguk-light text-soguk-dim rounded-md px-4 py-3">
        Kaydettiğinde bu teklif Rev. {teklif.revizyonNo + 1} olacak, önceki hali
        otomatik olarak teklif detayındaki revizyon geçmişine kaydedilecek.
      </p>

      <form action={teklifGuncelle} className="bg-yuzey border border-hat rounded-lg p-5">
        <input type="hidden" name="teklifId" value={teklif.id} />

        <label className="block text-xs font-medium text-metin/60 mb-1">Teklif / Proje Adı</label>
        <input
          name="baslik"
          required
          defaultValue={teklif.baslik}
          className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm mb-5"
        />

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Müşteri</label>
            <select
              name="musteriId"
              required
              defaultValue={teklif.musteriId}
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
            >
              {musteriler.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.ad}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Proje (opsiyonel)</label>
            <select name="projeId" defaultValue={teklif.projeId ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm">
              <option value="">— Proje bağlantısı yok —</option>
              {projeler.map((p) => (
                <option key={p.id} value={p.id}>{p.ad}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-4 gap-3 mb-5">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Para Birimi</label>
            <select name="paraBirimi" defaultValue={teklif.paraBirimi} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm">
              <option value="TRY">₺ TRY</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">KDV Durumu</label>
            <select name="kdvDurumu" defaultValue={teklif.kdvDahil ? "dahil" : "haric"} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm">
              <option value="haric">Fiyatlara KDV Hariç</option>
              <option value="dahil">Fiyatlara KDV Dahil</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">KDV Oranı (%)</label>
            <input
              name="kdvOrani"
              type="number"
              defaultValue={teklif.kdvOrani}
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Geçerlilik (gün)</label>
            <input
              name="gecerlilikGunu"
              type="number"
              defaultValue={teklif.gecerlilikGunu}
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        <TeklifKalemleri
          markalar={markalar.map((m) => ({ id: m.id, ad: m.ad }))}
          urunler={urunler.map((u) => ({
            id: u.id,
            kod: u.kod,
            ad: u.ad,
            markaId: u.markaId,
            birimFiyat: u.listeFiyati,
            paraBirimi: u.paraBirimi,
          }))}
          baslangic={teklif.kalemler.map((k, i) => ({
            key: i,
            bolum: (k as any).bolum || "Genel Kalemler", // Bölüm Desteği
            aciklama: k.aciklama,
            adet: k.adet,
            birimFiyat: String(k.birimFiyat ?? 0), // Ondalıklı fiyat için String tutuluyor
            iskontoYuzde: String(k.iskontoYuzde ?? 0),
            markaId: k.markaId,
          }))}
        />

        {/* BİRİM FİYAT VE KALEM TOPLAMI GİZLEME DÜZELTMESİ */}
        <label className="flex items-center gap-2 text-sm text-metin/80 my-4 bg-soguk-light/30 p-3 rounded-md border border-hat">
          <input 
            type="checkbox" 
            name="birimFiyatGoster" 
            value="hayir" 
            defaultChecked={!teklif.birimFiyatGoster} 
            className="accent-soguk" 
          />
          <span className="font-medium text-metin">
            PDF Çıktısında Tüm Kalem Fiyatlarını Gizle
          </span>
          <span className="text-xs text-metin/60">
            (Aktif edilirse müşteri hiçbir kalemin birim veya toplam fiyatını göremez, sadece en altta Dip Toplam gösterilir.)
          </span>
        </label>

        {sablonlar.length > 0 && (
          <div className="border-t border-hat pt-4 mt-4 mb-4">
            <p className="text-xs font-medium text-metin/60 mb-2">Bu teklifte hangi bölümler görünsün?</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {sablonlar.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm text-metin/80">
                  <input
                    type="checkbox"
                    name="sablonIds"
                    value={s.id}
                    defaultChecked={seciliSablonIdleri.has(s.id)}
                    className="accent-soguk"
                  />
                  {s.baslik}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end border-t border-hat pt-4">
          <button
            type="submit"
            className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
          >
            Değişiklikleri Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
