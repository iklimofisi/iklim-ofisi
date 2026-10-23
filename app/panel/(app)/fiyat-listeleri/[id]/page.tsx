import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTcmbKurlari } from "@/lib/kur";
import FiyatListesiDuzenleyici from "@/components/FiyatListesiDuzenleyici";
import KayaFiyatListesi from "@/components/KayaFiyatListesi";
import { kaynakDurumOku } from "@/lib/kaya-fiyat";
import { HAZIR_LISTELER } from "@/lib/hazir-listeler";
import { hazirListeTamamla } from "@/lib/actions";
import KaydetButonu from "@/components/KaydetButonu";

export const dynamic = "force-dynamic";
// "Şimdi güncelle" Kaya'nın PDF'ini indirip okur (birkaç saniye sürebilir)
export const maxDuration = 60;

const gun = (d: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export default async function FiyatListesiSayfasi({ params, searchParams }: { params: { id: string }; searchParams?: { yenile?: string } }) {
  const [liste, urunler, kurlar] = await Promise.all([
    prisma.fiyatListesi.findUnique({
      where: { id: params.id },
      include: { kalemler: { orderBy: { sira: "asc" }, include: { urun: { select: { gorselId: true } } } } },
    }),
    prisma.urun.findMany({
      orderBy: { ad: "asc" },
      select: {
        id: true,
        ad: true,
        kod: true,
        birim: true,
        aciklama: true,
        listeFiyati: true,
        paraBirimi: true,
        gorselId: true,
        marka: { select: { ad: true } },
      },
    }),
    getTcmbKurlari(),
  ]);
  if (!liste) notFound();

  const dugme = "focus-ring text-sm font-medium border px-4 py-2 rounded-md transition-colors";

  // Otomatik güncellenen liste (Kaya İklimlendirme): ürünler düzenlenmez, gönderirken seçilir
  if (liste.kaynak) {
    return (
      <div className="max-w-5xl">
        <Link href="/panel/fiyat-listeleri" className="focus-ring text-sm text-metin/60 hover:text-metin inline-block mb-6">
          ← Fiyat listelerine dön
        </Link>
        <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-1">Fiyat Listesi · Otomatik</p>
        <h1 className="font-display text-2xl font-semibold text-metin mb-6">{liste.baslik}</h1>
        <KayaFiyatListesi
          liste={{
            id: liste.id,
            baslik: liste.baslik,
            aciklama: liste.aciklama ?? "",
            notlar: liste.notlar ?? "",
            duzen: liste.duzen,
            fiyatBaslik: liste.fiyatBaslik ?? "Nakit",
            fiyat2Baslik: liste.fiyat2Baslik ?? "Kart",
            paraBirimi: liste.paraBirimi,
          }}
          durum={kaynakDurumOku(liste.kaynakDurum)}
          satirlar={liste.kalemler.map((k) => ({ id: k.id, bolum: k.bolum, ad: k.ad, aciklama: k.aciklama, fiyat: k.fiyat, fiyat2: k.fiyat2 }))}
        />
      </div>
    );
  }

  const hazir = HAZIR_LISTELER.find((h) => h.baslik === liste.baslik) ?? null;
  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <Link href="/panel/fiyat-listeleri" className="focus-ring text-sm text-metin/60 hover:text-metin">
          ← Fiyat listelerine dön
        </Link>
        <div className="flex flex-wrap gap-2">
          <a href={`/api/fiyat-listesi/${liste.id}/pdf`} target="_blank" rel="noopener" className={`${dugme} border-hat bg-white text-metin/70 hover:border-soguk`}>
            📄 PDF Görüntüle
          </a>
          <a href={`/api/fiyat-listesi/${liste.id}/pdf?indir=1`} className={`${dugme} bg-soguk text-white border-soguk hover:bg-soguk-dim`}>
            ⬇ PDF İndir
          </a>
        </div>
      </div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-1">Fiyat Listesi</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-1">{liste.baslik}</h1>
      <p className="text-xs text-metin/50 mb-6">PDF her zaman son kaydedilen hâli gösterir; değişiklik yaptıysanız önce kaydedin.</p>
      {hazir && (
        <form action={hazirListeTamamla} className="bg-soguk-light/40 border border-soguk/30 rounded-lg px-4 py-3 mb-6 flex flex-wrap items-center justify-between gap-3">
          <input type="hidden" name="kod" value={hazir.kod} />
          <p className="text-xs text-metin/70 max-w-xl">
            Hazır listeden eklendi. Boş kalan grup, ürün adı, marka, ürün kodu ve takılabilir genişlik / yükseklik bilgilerini tek tıkla doldurabilirsiniz. Fiyatlara ve sizin yazdıklarınıza dokunulmaz. Kaydedilmemiş değişikliğiniz varsa önce kaydedin.
          </p>
          <KaydetButonu basari={null} bekleme="Tamamlanıyor…">
            Eksik bilgileri tamamla
          </KaydetButonu>
        </form>
      )}

      {/* key: "Eksik bilgileri tamamla" sonrası düzenleyici sunucudaki yeni bilgilerle yeniden açılır.
          Normal kaydetmede değişmez (zam sonrası "Geri al" kaybolmasın). */}
      <FiyatListesiDuzenleyici
        key={String(searchParams?.yenile ?? "")}
        ayarlar={{
          id: liste.id,
          baslik: liste.baslik,
          aciklama: liste.aciklama ?? "",
          paraBirimi: liste.paraBirimi,
          kdvDahil: liste.kdvDahil,
          iskontoYuzde: liste.iskontoYuzde,
          iskontoKapsam: liste.iskontoKapsam,
          fiyatGoster: liste.fiyatGoster,
          duzen: liste.duzen,
          fiyatBaslik: liste.fiyatBaslik ?? "",
          fiyat2Baslik: liste.fiyat2Baslik ?? "",
          gecerlilikTarihi: gun(liste.gecerlilikTarihi),
          notlar: liste.notlar ?? "",
        }}
        kalemler={liste.kalemler.map((k) => ({
          bolum: k.bolum,
          urunId: k.urunId,
          ad: k.ad,
          kod: k.kod,
          marka: k.marka,
          aciklama: k.aciklama,
          birim: k.birim,
          fiyat: k.fiyat,
          fiyat2: k.fiyat2,
          gorselId: k.gorselId,
          urunGorselId: k.urun?.gorselId ?? null,
        }))}
        urunler={urunler.map((u) => ({
          id: u.id,
          ad: u.ad,
          kod: u.kod,
          marka: u.marka?.ad ?? null,
          birim: u.birim,
          aciklama: u.aciklama,
          listeFiyati: u.listeFiyati,
          paraBirimi: u.paraBirimi,
          gorselId: u.gorselId,
        }))}
        kurlar={kurlar ? { tarih: kurlar.tarih, USD: kurlar.USD, EUR: kurlar.EUR } : null}
      />
    </div>
  );
}
