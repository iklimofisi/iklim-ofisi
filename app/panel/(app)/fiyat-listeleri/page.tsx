import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fiyatListesiOlustur, fiyatListesiKopyala, fiyatListesiSil } from "@/lib/actions";
import HizliAramaListesi from "@/components/HizliAramaListesi";
import KaydetButonu from "@/components/KaydetButonu";
import SilButon from "@/components/SilButon";

export const dynamic = "force-dynamic";

const tarih = (d: Date) =>
  new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" }).format(new Date(d));

export default async function FiyatListeleriSayfasi() {
  const listeler = await prisma.fiyatListesi.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      baslik: true,
      paraBirimi: true,
      iskontoYuzde: true,
      fiyatGoster: true,
      gecerlilikTarihi: true,
      olusturanAdi: true,
      updatedAt: true,
      _count: { select: { kalemler: true } },
    },
  });

  const dugme = "focus-ring text-xs text-metin/50 hover:text-soguk-dim font-medium";

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">Fiyat Listeleri</h1>
      <p className="text-sm text-metin/60 mb-8">
        Ürün fotoğraflı, müşteriye gönderilebilir fiyat listeleri. Ürünleri katalogdan seçebilir ya da elle ekleyebilirsiniz;
        liste PDF olarak indirilir. Ürün fotoğraflarını{" "}
        <Link href="/panel/ayarlar/urunler" className="text-soguk-dim hover:underline">
          Ayarlar → Ürün Kataloğu
        </Link>{" "}
        sayfasından bir kez eklemeniz yeterli.
      </p>

      <form action={fiyatListesiOlustur} className="bg-yuzey border border-hat rounded-lg p-5 mb-8 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[16rem]">
          <label className="block text-xs font-medium text-metin/60 mb-1">Yeni fiyat listesi adı</label>
          <input
            name="baslik"
            required
            maxLength={200}
            placeholder="örn. 2026 Buderus Kombi Fiyat Listesi"
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Para birimi</label>
          <select name="paraBirimi" defaultValue="TRY" className="focus-ring border border-hat rounded-md px-3 py-2 text-sm bg-white">
            <option value="TRY">TL</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <KaydetButonu basari={null} bekleme="Oluşturuluyor…">
          + Oluştur
        </KaydetButonu>
      </form>

      <HizliAramaListesi
        yerTutucu="Hızlı ara: liste adı, hazırlayan…"
        bosMetin="Henüz fiyat listesi yok."
        birim="liste"
        satirlar={listeler.map((l) => ({
          id: l.id,
          aramaMetni: [l.baslik, l.olusturanAdi, l.paraBirimi].join(" "),
          icerik: (
            <div className="bg-yuzey border border-hat rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm hover:border-soguk transition-colors">
              <Link href={`/panel/fiyat-listeleri/${l.id}`} className="focus-ring min-w-0 flex-1">
                <p className="font-medium text-metin text-sm truncate">{l.baslik}</p>
                <p className="text-xs text-metin/50 mt-1">
                  {l._count.kalemler} ürün · {l.paraBirimi}
                  {l.iskontoYuzde > 0 && ` · %${l.iskontoYuzde.toLocaleString("tr-TR")} iskontolu`}
                  {!l.fiyatGoster && " · fiyatsız katalog"}
                  {l.gecerlilikTarihi && ` · geçerlilik ${tarih(l.gecerlilikTarihi)}`}
                  {" · "}güncelleme {tarih(l.updatedAt)}
                  {l.olusturanAdi && ` · ${l.olusturanAdi}`}
                </p>
              </Link>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a href={`/api/fiyat-listesi/${l.id}/pdf`} target="_blank" rel="noopener" className={dugme}>
                  PDF Görüntüle
                </a>
                <a href={`/api/fiyat-listesi/${l.id}/pdf?indir=1`} className={dugme}>
                  PDF İndir
                </a>
                <Link href={`/panel/fiyat-listeleri/${l.id}`} className={dugme}>
                  Düzenle
                </Link>
                <form action={fiyatListesiKopyala.bind(null, l.id)}>
                  <KaydetButonu basari={null} bekleme="…" className={dugme}>
                    Kopyala
                  </KaydetButonu>
                </form>
                <SilButon id={l.id} action={fiyatListesiSil} onayMesaji={`"${l.baslik}" fiyat listesi silinsin mi?`} />
              </div>
            </div>
          ),
        }))}
      />
    </div>
  );
}
