import { prisma } from "@/lib/prisma";
import { teklifEkle } from "@/lib/actions";
import TeklifKalemleri from "@/components/TeklifKalemleri";
import HizliMusteriEkleModal from "@/components/HizliMusteriEkleModal"; // HIZLI MÜŞTERİ MODALI
import MusteriYetkiliSecici from "@/components/MusteriYetkiliSecici";
import SablonSecici from "@/components/SablonSecici";
import KaydetButonu from "@/components/KaydetButonu";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Yeni teklif formu ayrı sayfada: Teklifler listesi artık doğrudan listeyle açılır.
export default async function YeniTeklifSayfasi({
  searchParams,
}: {
  searchParams: {
    proje?: string;
    musteri?: string;
    seciliProjeId?: string;
    seciliMusteriId?: string; // Hızlı eklenen / projeden gelen müşteri
    basarili?: string;
  };
}) {
  const [musteriler, sablonlar, markalar, urunler, projeler] = await Promise.all([
    prisma.musteri.findMany({
      orderBy: { ad: "asc" },
      include: { yetkililer: { orderBy: { ad: "asc" }, select: { id: true, ad: true, unvan: true } } },
    }),
    prisma.teklifSablon.findMany({ orderBy: { sira: "asc" } }),
    prisma.marka.findMany({ select: { id: true, ad: true }, orderBy: { ad: "asc" } }),
    prisma.urun.findMany({ orderBy: { ad: "asc" } }),
    prisma.proje.findMany({ orderBy: { ad: "asc" } }),
  ]);

  const varsayilanBaslik = searchParams.proje || "";
  const varsayilanMusteriId = searchParams.seciliMusteriId || searchParams.musteri || "";
  const varsayilanProjeId = searchParams.seciliProjeId || "";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/panel/teklifler" className="focus-ring text-sm text-metin/60 hover:text-metin">
            ← Tekliflere dön
          </Link>
          <h1 className="font-display text-2xl font-semibold text-metin mt-2">Yeni Teklif</h1>
        </div>
      </div>

      {/* YENİ EKLENEN MÜŞTERİ BİLİDİRİMİ */}
      {searchParams?.basarili === "musteri-eklendi" && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md p-3 text-xs font-semibold mb-4">
          ✓ Yeni müşteri başarıyla eklendi ve formda otomatik seçildi!
        </div>
      )}

      {/* YENİ TEKLİF FORMU */}
      <form action={teklifEkle} className="bg-yuzey border border-hat rounded-lg p-5">
        <label className="block text-xs font-medium text-metin/60 mb-1">Teklif / Proje Adı *</label>
        <input
          name="baslik"
          required
          defaultValue={varsayilanBaslik}
          placeholder="örn. Merkez Ofis VRF Klima Sistemi"
          className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm mb-5 bg-white font-medium"
        />

        <div className="grid sm:grid-cols-3 gap-3 mb-5">
          {/* MÜŞTERİ + MÜŞTERİ YETKİLİSİ SEÇİMİ VE HIZLI MÜŞTERİ EKLEME BUTONU */}
          <MusteriYetkiliSecici
            key={varsayilanMusteriId /* hızlı müşteri eklenince yeni müşteri seçili gelsin */}
            musteriler={musteriler.map((m) => ({ id: m.id, ad: m.ad, yetkiliAdi: m.yetkiliAdi, yetkililer: m.yetkililer }))}
            varsayilanMusteriId={varsayilanMusteriId}
            musteriEtiketSag={<HizliMusteriEkleModal yonlendirPath="/panel/teklifler/yeni" />}
          />

          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Proje (opsiyonel)</label>
            <select
              name="projeId"
              defaultValue={varsayilanProjeId}
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            >
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
            <select name="paraBirimi" defaultValue="TRY" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
              <option value="TRY">₺ TRY</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">KDV Durumu</label>
            <select name="kdvDurumu" defaultValue="haric" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
              <option value="haric">Fiyatlara KDV Hariç</option>
              <option value="dahil">Fiyatlara KDV Dahil</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">KDV Oranı (%)</label>
            <input
              name="kdvOrani"
              type="number"
              defaultValue={20}
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Geçerlilik (gün)</label>
            <input
              name="gecerlilikGunu"
              type="number"
              defaultValue={15}
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
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
        />

        <label className="flex items-center gap-2 text-sm text-metin/80 mb-4 bg-soguk-light/20 p-2.5 rounded border border-hat">
          <input type="checkbox" name="birimFiyatGoster" value="hayir" className="accent-soguk" />
          <span className="font-semibold text-metin">PDF çıktısında tüm kalem fiyatlarını gizle</span>
          <span className="text-xs text-metin/60">(Müşteri kalem fiyatlarını göremez, sadece dip toplam görünür)</span>
        </label>

        <SablonSecici sablonlar={sablonlar} seciliIdler={[]} varsayilanIlk />

        <div className="flex items-center justify-end border-t border-hat pt-4">
          <KaydetButonu>Teklifi Kaydet</KaydetButonu>
        </div>
      </form>

    </div>
  );
}
