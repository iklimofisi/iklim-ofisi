import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fiyatListesiOlustur, fiyatListesiKopyala, fiyatListesiSil, kayaFiyatListesiGuncelle, hazirListeEkle, hazirListeTamamla } from "@/lib/actions";
import { HAZIR_LISTELER } from "@/lib/hazir-listeler";
import { kaynakDurumOku, kayaDurumOzeti } from "@/lib/kaya-fiyat";
import HizliAramaListesi from "@/components/HizliAramaListesi";
import KaydetButonu from "@/components/KaydetButonu";
import SilButon from "@/components/SilButon";

export const dynamic = "force-dynamic";
// Kaya listesini ilk kez getirmek PDF indirip okumayı gerektirir
export const maxDuration = 60;

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
      kaynak: true,
      kaynakDurum: true,
      _count: { select: { kalemler: true } },
    },
  });
  // Otomatik liste en üstte
  listeler.sort((a, b) => Number(Boolean(b.kaynak)) - Number(Boolean(a.kaynak)));
  const kayaVar = listeler.some((l) => l.kaynak === "KAYA");

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

      {/* HAZIR LİSTELER: tedarikçi listelerinden hazırlanmış, fotoğraflı listeler (tek tıkla eklenir) */}
      <div className="bg-yuzey border border-hat rounded-lg p-5 mb-8">
        <p className="font-display font-medium text-metin mb-1">Hazır listeler</p>
        <p className="text-xs text-metin/55 mb-3">Tedarikçi listelerinden fotoğraflarıyla hazırlandı. Eklenince normal liste gibi düzenlenir ve PDF alınır.</p>
        <div className="flex flex-col gap-2">
          {HAZIR_LISTELER.map((h) => {
            const ekli = listeler.find((l) => l.baslik === h.baslik);
            const urunSayisi = h.bolumler.reduce((a, b) => a + b.kalemler.length, 0);
            return (
              <div key={h.kod} className="flex flex-wrap items-center justify-between gap-3 border border-hat rounded-md px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-metin">{h.baslik}</p>
                  <p className="text-[11px] text-metin/50">
                    {urunSayisi} ürün · {h.bolumler.length} bölüm · {h.kaynakAciklama}
                  </p>
                </div>
                {ekli ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <form action={hazirListeTamamla} title="Boş kalan grup, ürün adı, marka, ürün kodu ve açıklama alanlarını doldurur. Fiyatlara ve sizin yazdıklarınıza dokunmaz.">
                      <input type="hidden" name="kod" value={h.kod} />
                      <KaydetButonu basari={null} bekleme="Tamamlanıyor…">
                        Eksik bilgileri tamamla
                      </KaydetButonu>
                    </form>
                    <Link href={`/panel/fiyat-listeleri/${ekli.id}`} className="focus-ring text-sm font-medium text-soguk-dim hover:underline">
                      Eklendi · Aç →
                    </Link>
                  </div>
                ) : (
                  <form action={hazirListeEkle}>
                    <input type="hidden" name="kod" value={h.kod} />
                    <KaydetButonu basari={null} bekleme="Ekleniyor…">
                      + Listeyi ekle
                    </KaydetButonu>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {!kayaVar && (
        <div className="bg-soguk-light/40 border border-soguk/30 rounded-lg p-5 mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            <p className="font-medium text-metin">↻ Kaya İklimlendirme fiyat listesi (otomatik)</p>
            <p className="text-xs text-metin/60 mt-0.5">
              Kaya&apos;nın sitesindeki fiyat listesi okunur, nakit ve kart fiyatlarına %5 eklenerek bizim formatımızda burada tutulur ve Kaya
              güncelledikçe kendiliğinden yenilenir.
            </p>
          </div>
          <form action={kayaFiyatListesiGuncelle}>
            <KaydetButonu basari={null} bekleme="Kaya'dan okunuyor…">
              Listeyi getir
            </KaydetButonu>
          </form>
        </div>
      )}

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
                <p className="font-medium text-metin text-sm truncate">
                  {l.kaynak && (
                    <span className="mr-2 inline-block rounded bg-soguk-light text-soguk-dim border border-soguk/30 px-1.5 text-[10px] font-semibold align-middle">
                      ↻ OTOMATİK · KAYA +%5
                    </span>
                  )}
                  {l.baslik}
                </p>
                {l.kaynak && (() => {
                  const o = kayaDurumOzeti(kaynakDurumOku(l.kaynakDurum));
                  const renk = { yesil: "text-emerald-700", turuncu: "text-amber-700", sari: "text-amber-700", kirmizi: "text-sicak-dim" }[o.renk];
                  const isaret = { yesil: "✓", turuncu: "●", sari: "!", kirmizi: "⚠" }[o.renk];
                  return (
                    <p className="text-[11px] mt-0.5 text-metin/50 whitespace-normal">
                      <span className={`font-semibold ${renk}`}>
                        {isaret} {o.baslik}
                      </span>{" "}
                      · {o.detay}
                    </p>
                  );
                })()}
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
