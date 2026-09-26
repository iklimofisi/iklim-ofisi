import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { teklifEkle } from "@/lib/actions";
import TeklifKalemleri from "@/components/TeklifKalemleri";
import MusteriYetkiliSecici from "@/components/MusteriYetkiliSecici";
import HizliMusteriEkleModal from "@/components/HizliMusteriEkleModal";
import Link from "next/link";

export const dynamic = "force-dynamic";

// TEKLİF KOPYALAMA: Kaynak teklifin bilgileri forma dolu gelir; başlık, müşteri, yetkili,
// proje ve kalemler değiştirilebilir. Kaydedilince YENİ bir teklif oluşur, kaynak teklif değişmez.
export default async function TeklifKopyala({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { seciliMusteriId?: string; basarili?: string };
}) {
  const [kaynak, musteriler, sablonlar, markalar, urunler, projeler] = await Promise.all([
    prisma.teklif.findUnique({
      where: { id: params.id },
      include: { kalemler: true, sablonlar: true },
    }),
    prisma.musteri.findMany({
      orderBy: { ad: "asc" },
      include: { yetkililer: { orderBy: { ad: "asc" }, select: { id: true, ad: true, unvan: true } } },
    }),
    prisma.teklifSablon.findMany({ orderBy: { sira: "asc" } }),
    prisma.marka.findMany({ orderBy: { ad: "asc" } }),
    prisma.urun.findMany({ orderBy: { ad: "asc" } }),
    prisma.proje.findMany({ orderBy: { ad: "asc" } }),
  ]);

  if (!kaynak) notFound();

  const kaynakNo = `TKL-${String(kaynak.teklifNo).padStart(4, "0")}`;
  const seciliSablonIdleri = new Set(kaynak.sablonlar.map((s) => s.id));
  // Hızlı müşteri eklenince yeni müşteri seçili gelir; yoksa kaynak teklifin müşterisi
  const varsayilanMusteriId = searchParams?.seciliMusteriId || kaynak.musteriId;
  const varsayilanYetkiliId = varsayilanMusteriId === kaynak.musteriId ? kaynak.yetkiliId ?? "" : "";

  return (
    <div>
      <Link href={`/panel/teklifler/${kaynak.id}`} className="focus-ring text-sm text-metin/60 hover:text-metin mb-6 inline-block">
        ← {kaynakNo} teklifine dön
      </Link>

      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Kopyalanıyor · Kaynak {kaynakNo}</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-4">Teklifi Kopyala</h1>

      <p className="text-sm mb-6 bg-soguk-light text-soguk-dim rounded-md px-4 py-3">
        Kaydettiğinizde <strong>yeni bir teklif</strong> oluşturulur ve yeni teklif numarası alır. {kaynakNo} teklifi
        değişmez. Yeni teklifte &quot;{kaynakNo} kopyası&quot; notu yalnızca panelde görünür; müşteriye giden PDF ve
        e-postada yer almaz.
      </p>

      {searchParams?.basarili === "musteri-eklendi" && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md p-3 text-xs font-semibold mb-4">
          ✓ Yeni müşteri eklendi ve aşağıda otomatik seçildi!
        </div>
      )}

      <form action={teklifEkle} className="bg-yuzey border border-hat rounded-lg p-5">
        <input type="hidden" name="kopyaKaynakTeklifId" value={kaynak.id} />

        <label className="block text-xs font-medium text-metin/60 mb-1">Teklif / Proje Adı *</label>
        <input
          name="baslik"
          required
          defaultValue={`${kaynak.baslik} (Kopya)`}
          className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm mb-5 bg-white font-medium"
        />

        <div className="grid sm:grid-cols-3 gap-3 mb-5">
          <MusteriYetkiliSecici
            key={varsayilanMusteriId}
            musteriler={musteriler.map((m) => ({ id: m.id, ad: m.ad, yetkiliAdi: m.yetkiliAdi, yetkililer: m.yetkililer }))}
            varsayilanMusteriId={varsayilanMusteriId}
            varsayilanYetkiliId={varsayilanYetkiliId}
            musteriEtiketSag={<HizliMusteriEkleModal yonlendirPath={`/panel/teklifler/${kaynak.id}/kopyala`} />}
          />
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Proje (opsiyonel)</label>
            <select name="projeId" defaultValue={kaynak.projeId ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
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
            <select name="paraBirimi" defaultValue={kaynak.paraBirimi} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
              <option value="TRY">₺ TRY</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">KDV Durumu</label>
            <select name="kdvDurumu" defaultValue={kaynak.kdvDahil ? "dahil" : "haric"} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
              <option value="haric">Fiyatlara KDV Hariç</option>
              <option value="dahil">Fiyatlara KDV Dahil</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">KDV Oranı (%)</label>
            <input name="kdvOrani" type="number" defaultValue={kaynak.kdvOrani} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Geçerlilik (gün)</label>
            <input name="gecerlilikGunu" type="number" defaultValue={kaynak.gecerlilikGunu} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white" />
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
          // Kalemler kopyalanır; kimlik (id) taşınmaz — yeni teklifte yeni kalemler oluşur
          baslangic={kaynak.kalemler.map((k, i) => ({
            key: i,
            bolum: k.bolum || "Genel Kalemler",
            aciklama: k.aciklama,
            adet: k.adet,
            birimFiyat: String(k.birimFiyat ?? 0),
            iskontoYuzde: String(k.iskontoYuzde ?? 0),
            markaId: k.markaId,
          }))}
        />

        <label className="flex items-center gap-2 text-sm text-metin/80 my-4 bg-soguk-light/30 p-3 rounded-md border border-hat">
          <input type="checkbox" name="birimFiyatGoster" value="hayir" defaultChecked={!kaynak.birimFiyatGoster} className="accent-soguk" />
          <span className="font-medium text-metin">PDF Çıktısında Tüm Kalem Fiyatlarını Gizle</span>
        </label>

        {sablonlar.length > 0 && (
          <div className="border-t border-hat pt-4 mt-4 mb-4">
            <p className="text-xs font-medium text-metin/60 mb-2">Bu teklifte hangi bölümler görünsün?</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {sablonlar.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm text-metin/80">
                  <input type="checkbox" name="sablonIds" value={s.id} defaultChecked={seciliSablonIdleri.has(s.id)} className="accent-soguk" />
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
            Yeni Teklif Olarak Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
