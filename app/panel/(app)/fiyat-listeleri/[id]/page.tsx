import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTcmbKurlari } from "@/lib/kur";
import FiyatListesiDuzenleyici from "@/components/FiyatListesiDuzenleyici";
import KayaFiyatListesi from "@/components/KayaFiyatListesi";
import ToptanFiyatListesi from "@/components/ToptanFiyatListesi";
import { BARAN_KAYNAK, toptanKaynakMi, toptanDurumOku, toptanNotGruplari, anahtarla } from "@/lib/toptan-fiyat";
import { kaynakDurumOku, KAYA_ZAM_YUZDE } from "@/lib/kaya-fiyat";
import { HAZIR_LISTELER, hazirAlisFiyatlari } from "@/lib/hazir-listeler";
import { hazirListeTamamla, hazirListeFiyatGeriYukle } from "@/lib/actions";
import OnayliGonderButonu from "@/components/OnayliGonderButonu";
import FiyatListesiSecim from "@/components/FiyatListesiSecim";
import KaydetButonu from "@/components/KaydetButonu";
import FiyatUrunArama, { type AramaSatiri } from "@/components/FiyatUrunArama";
import { sayfaYetkisi } from "@/lib/oturum";
import { maliyetGorur, yazabilir, saltOkunurMu } from "@/lib/roller";
import { getSirketAyarlari } from "@/lib/sirket";
import { FIYAT_LINK_TABANI, haricOku } from "@/lib/fiyat-paylasim";
import { secimAnahtari, flParaYaz } from "@/lib/fiyat-listesi";
import FiyatListesiLinkleri from "@/components/FiyatListesiLinkleri";

export const dynamic = "force-dynamic";
// "Şimdi güncelle" Kaya'nın PDF'ini indirip okur (birkaç saniye sürebilir)
export const maxDuration = 60;

const gun = (d: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");
// Liste içi ürün aramasında fiyat: 0 / boş = "Fiyat sorunuz"
const sayi = (n: number | null | undefined) => (n && n > 0 ? n : null);

export default async function FiyatListesiSayfasi({ params, searchParams }: { params: { id: string }; searchParams?: { yenile?: string } }) {
  const giren = await sayfaYetkisi("fiyat");
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

  // Satış personeli listeleri yalnız görür (arama + PDF); düzenleyici ve alış fiyatları gösterilmez
  const salt = !yazabilir(giren.rol, "fiyat");
  const alisGoster = maliyetGorur(giren.rol);

  // MÜŞTERİ LİNKLERİ (iklimofisi.com/f/...): her açılışta listenin son kaydedilen hâli görünür.
  // Tablo henüz yoksa (SQL çalışmadıysa) liste boş gelir, sayfa açılır.
  const [paylasimlar, sirket] = await Promise.all([
    prisma.fiyatListesiPaylasim
      .findMany({ where: { listeId: liste.id, iptalTarihi: null }, orderBy: { createdAt: "desc" } })
      .catch(() => []),
    getSirketAyarlari(),
  ]);
  const saatli = (d: Date) =>
    new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" }).format(d);
  const linkKutusu = (
    <FiyatListesiLinkleri
      listeId={liste.id}
      baslik={liste.baslik}
      firma={sirket.unvan}
      izin={!saltOkunurMu(giren.rol)}
      urunler={Array.from(
        new Map(liste.kalemler.map((k) => [secimAnahtari(k), { anahtar: secimAnahtari(k), bolum: k.bolum, ad: k.ad, kod: k.kod }])).values()
      )}
      linkler={paylasimlar.map((p) => ({
        id: p.id,
        alici: p.alici,
        link: FIYAT_LINK_TABANI + p.anahtar,
        olusturma: saatli(p.createdAt),
        olusturanAdi: p.olusturanAdi,
        goruntulenme: p.goruntulenme,
        sonGoruntulenme: p.sonGoruntulenme ? saatli(p.sonGoruntulenme) : null,
        haric: [...haricOku(p.haric)],
      }))}
    />
  );
  const saltGorunum = (etiket: string, satirlar: AramaSatiri[], not = "") => (
    <div className="max-w-5xl">
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
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-1">{etiket}</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-1">{liste.baslik}</h1>
      <p className="text-xs text-metin/50 mb-6">Bu listeyi yalnız görüntüleyebilirsiniz: ürün aramak için aşağıdaki kutuyu, listenin tamamı için PDF&apos;i kullanın.</p>
      {linkKutusu}
      <FiyatUrunArama satirlar={alisGoster ? satirlar : satirlar.map((s) => ({ ...s, alislar: [] }))} paraBirimi={liste.paraBirimi} not={not} />
    </div>
  );

  // İklimOfisi Toptan listesi (Netsa PDF'lerinden) ve Baran Isı listesi (HTML dosyasından):
  // alış fiyatları yalnız burada görünür
  if (toptanKaynakMi(liste.kaynak)) {
    const baran = liste.kaynak === BARAN_KAYNAK;
    const durum = toptanDurumOku(liste.kaynakDurum, liste.kaynak);
    const alislar = new Map(anahtarla(durum.markalar.flatMap((m) => m.urunler)).map((x) => [x.anahtar, x.deger]));
    const satirlar = anahtarla(liste.kalemler).map(({ anahtar, deger: k }) => ({
      id: k.id,
      bolum: k.bolum,
      ad: k.ad,
      kod: k.kod,
      marka: k.marka ?? "",
      aciklama: k.aciklama,
      fiyat: k.fiyat,
      fiyat2: k.fiyat2,
      alis: alislar.get(anahtar)?.alis ?? null,
      alis2: alislar.get(anahtar)?.alis2 ?? null,
    }));
    const fb = liste.fiyatBaslik ?? "Nakit";
    const fb2 = liste.fiyat2Baslik ?? "Kredi Kartı";
    const aramaSatirlari: AramaSatiri[] = satirlar.map((r) => ({
      id: r.id,
      bolum: r.bolum,
      ad: r.ad,
      kod: r.kod,
      marka: r.marka || null,
      aciklama: r.aciklama,
      fiyatlar: [{ ad: fb, deger: sayi(r.fiyat) }, ...(r.fiyat2 !== null || r.alis2 ? [{ ad: fb2, deger: sayi(r.fiyat2) }] : [])],
      alislar: [
        ...(r.alis !== null ? [{ ad: "Alış nakit", deger: sayi(r.alis) }] : []),
        ...(r.alis2 ? [{ ad: "Alış kart", deger: sayi(r.alis2) }] : []),
      ],
    }));
    if (salt) return saltGorunum(baran ? "Fiyat Listesi · Baran Isı" : "Fiyat Listesi · Toptan (Netsa)", aramaSatirlari);
    return (
      <div className="max-w-5xl">
        <Link href="/panel/fiyat-listeleri" className="focus-ring text-sm text-metin/60 hover:text-metin inline-block mb-6">
          ← Fiyat listelerine dön
        </Link>
        <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-1">{baran ? "Fiyat Listesi · Baran Isı" : "Fiyat Listesi · Toptan (Netsa)"}</p>
        <h1 className="font-display text-2xl font-semibold text-metin mb-6">{liste.baslik}</h1>
        {linkKutusu}
        <FiyatUrunArama satirlar={aramaSatirlari} paraBirimi={liste.paraBirimi} />
        <ToptanFiyatListesi
          liste={{
            id: liste.id,
            baslik: liste.baslik,
            aciklama: liste.aciklama ?? "",
            notlar: liste.notlar ?? "",
            duzen: liste.duzen,
            fiyatBaslik: liste.fiyatBaslik ?? "Nakit",
            fiyat2Baslik: liste.fiyat2Baslik ?? "Kredi Kartı",
            paraBirimi: liste.paraBirimi,
          }}
          durum={durum}
          satirlar={satirlar}
          notGruplari={toptanNotGruplari(durum)}
          kaynak={baran ? "BARAN" : "NETSA"}
        />
      </div>
    );
  }

  // Otomatik güncellenen liste (Kaya İklimlendirme): ürünler düzenlenmez, gönderirken seçilir
  if (liste.kaynak) {
    const kayaSatirlari: AramaSatiri[] = liste.kalemler.map((k) => ({
      id: k.id,
      bolum: k.bolum,
      ad: k.ad,
      kod: k.kod,
      marka: k.marka,
      aciklama: k.aciklama,
      fiyatlar: [
        { ad: liste.fiyatBaslik ?? "Nakit", deger: sayi(k.fiyat) },
        ...(k.fiyat2 !== null ? [{ ad: liste.fiyat2Baslik ?? "Kart", deger: sayi(k.fiyat2) }] : []),
      ],
      // Alış = Kaya'nın kendi fiyatı (listedeki fiyattan %5 geri alınır; Kaya sayfasındakiyle aynı hesap)
      alislar: [
        ...(sayi(k.fiyat) ? [{ ad: "Alış nakit", deger: Math.round(k.fiyat / (1 + KAYA_ZAM_YUZDE / 100)) }] : []),
        ...(sayi(k.fiyat2) ? [{ ad: "Alış kart", deger: Math.round((k.fiyat2 as number) / (1 + KAYA_ZAM_YUZDE / 100)) }] : []),
      ],
    }));
    if (salt) return saltGorunum("Fiyat Listesi · Otomatik", kayaSatirlari);
    return (
      <div className="max-w-5xl">
        <Link href="/panel/fiyat-listeleri" className="focus-ring text-sm text-metin/60 hover:text-metin inline-block mb-6">
          ← Fiyat listelerine dön
        </Link>
        <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-1">Fiyat Listesi · Otomatik</p>
        <h1 className="font-display text-2xl font-semibold text-metin mb-6">{liste.baslik}</h1>
        {linkKutusu}
        <FiyatUrunArama paraBirimi={liste.paraBirimi} satirlar={kayaSatirlari} />
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
  // Liste içi arama: fiyat sütunları listenin kendi başlıklarıyla; alış iskontosu girildiyse alış fiyatı da
  const alisY = liste.alisIskontoYuzde !== null && liste.alisIskontoYuzde > 0 ? Math.min(100, liste.alisIskontoYuzde) : null;
  // Niva gibi hazır listelerde ürün koduna göre bayi alış fiyatı (alış iskontosu girilmemişse)
  const kodAlislari = alisY === null ? hazirAlisFiyatlari(hazir) : null;
  const aramaSatirlari: AramaSatiri[] = liste.kalemler.map((k) => ({
    id: k.id,
    bolum: k.bolum,
    ad: k.ad,
    kod: k.kod,
    marka: k.marka,
    aciklama: k.aciklama,
    fiyatlar: [
      { ad: liste.fiyatBaslik || "Fiyat", deger: sayi(k.fiyat) },
      ...(liste.fiyat2Baslik ? [{ ad: liste.fiyat2Baslik, deger: sayi(k.fiyat2) }] : []),
      ...(liste.fiyat2Baslik && liste.fiyat3Baslik ? [{ ad: liste.fiyat3Baslik, deger: sayi(k.fiyat3) }] : []),
    ],
    alislar:
      alisY !== null && k.fiyat > 0
        ? [{ ad: `Alış (−%${alisY.toLocaleString("tr-TR")})`, deger: Math.round(k.fiyat * (1 - alisY / 100) * 100) / 100 }]
        : kodAlislari && k.kod && kodAlislari[k.kod.trim()]
          ? [{ ad: "Alış", deger: kodAlislari[k.kod.trim()] }]
          : [],
  }));
  // ALIŞ / SATIŞ TABLOSU (yalnız panel, maliyet görebilenlere): alış iskontosu girilmiş ya da
  // hazır listesinde alış tanımlı listelerde (Niva, Montaj) her ürünün alışı, satışı ve kârı
  const sonFiyat = (k: (typeof liste.kalemler)[number]) => (liste.fiyat2Baslik && k.fiyat2 !== null && k.fiyat2 > 0 ? k.fiyat2 : k.fiyat);
  const alisSatirlari = liste.kalemler
    .map((k) => {
      const alis =
        alisY !== null && k.fiyat > 0
          ? Math.round(k.fiyat * (1 - alisY / 100) * 100) / 100
          : kodAlislari && k.kod && kodAlislari[k.kod.trim()]
            ? kodAlislari[k.kod.trim()]
            : null;
      return { k, alis, satis: sonFiyat(k) };
    })
    .filter((r) => r.alis !== null && r.alis > 0);
  const alisTablosu =
    alisGoster && alisSatirlari.length > 0 ? (
      <details className="mb-6 bg-amber-50/40 border border-amber-200 rounded-lg print:hidden">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-metin">
          💰 Alış fiyatları ve kâr <span className="font-normal text-metin/60">· {alisSatirlari.length} ürün · yalnız panelde, PDF&apos;e ve müşteri linkine girmez</span>
        </summary>
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-metin/50 border-b border-amber-200">
                <th className="py-2 pr-3 font-medium">Ürün</th>
                <th className="py-2 px-2 font-medium text-right whitespace-nowrap">Alış</th>
                <th className="py-2 px-2 font-medium text-right whitespace-nowrap">{(liste.fiyat2Baslik || liste.fiyatBaslik || "Satış").trim()}</th>
                <th className="py-2 pl-2 font-medium text-right whitespace-nowrap">Kâr</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {alisSatirlari.map(({ k, alis, satis }, i) => {
                const kar = satis > 0 && alis ? satis - alis : null;
                return (
                  <tr key={`${k.id}-${i}`}>
                    <td className="py-1.5 pr-3 text-metin/80">
                      {k.bolum && <span className="text-metin/40">{k.bolum} · </span>}
                      {k.ad}
                      {k.kod && <span className="text-metin/40 font-mono"> · {k.kod}</span>}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono whitespace-nowrap">{flParaYaz(alis as number, liste.paraBirimi)}</td>
                    <td className="py-1.5 px-2 text-right font-mono whitespace-nowrap">{satis > 0 ? flParaYaz(satis, liste.paraBirimi) : "—"}</td>
                    <td className={`py-1.5 pl-2 text-right font-mono whitespace-nowrap ${kar !== null && kar < 0 ? "text-red-700" : "text-emerald-700"}`}>
                      {kar !== null ? `${flParaYaz(kar, liste.paraBirimi)} · %${((kar / (alis as number)) * 100).toFixed(1).replace(".", ",")}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-[11px] text-metin/45 mt-2">
            {alisY !== null
              ? `Alış = liste fiyatı − %${alisY.toLocaleString("tr-TR")} alış iskontosu.`
              : "Alış, hazır listedeki tedarikçi / taşeron fiyatıdır; satış fiyatını değiştirseniz de alış aynı kalır."}{" "}
            Kâr, alışa göre yüzdedir.
          </p>
        </div>
      </details>
    ) : null;

  if (salt)
    return saltGorunum("Fiyat Listesi", aramaSatirlari, liste.iskontoYuzde > 0 ? `PDF'te %${liste.iskontoYuzde.toLocaleString("tr-TR")} iskonto uygulanır.` : "");
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
      {linkKutusu}
      <FiyatUrunArama
        satirlar={aramaSatirlari}
        paraBirimi={liste.paraBirimi}
        not={liste.iskontoYuzde > 0 ? `PDF'te %${liste.iskontoYuzde.toLocaleString("tr-TR")} iskonto uygulanır.` : ""}
      />
      {alisTablosu}
      {hazir && hazir.bolumler.some((b) => b.kalemler.some((k) => k.genislik)) && (
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
      {hazir && (
        <form action={hazirListeFiyatGeriYukle} className="border border-hat rounded-lg px-4 py-3 -mt-3 mb-6 flex flex-wrap items-center justify-between gap-3">
          <input type="hidden" name="kod" value={hazir.kod} />
          <p className="text-xs text-metin/70 max-w-xl">
            Toplu zam / indirim yüzünden fiyatlar bozulduysa: Liste Fiyatı ve Satış Fiyatı ilk hâline döner
            {liste.satisIskontoYuzde !== null ? " (satış fiyatı güncel satış iskontosuyla hesaplanır)" : hazir.fiyat2Baslik ? " (Satış = alış + %15)" : ""}. Ürün adları, açıklamalar,
            fotoğraflar ve sizin eklediğiniz başka ürünler değişmez.
          </p>
          <OnayliGonderButonu
            bekleme="Geri yükleniyor…"
            onayMesaji="Bu listedeki hazır ürünlerin Liste Fiyatı ve Satış Fiyatı ilk hâline döndürülecek. Elle değiştirdiğiniz fiyatlar da eski hâline döner. Devam edilsin mi?"
          >
            ↺ Fiyatları ilk hâline döndür
          </OnayliGonderButonu>
        </form>
      )}

      <FiyatListesiSecim
        listeId={liste.id}
        paraBirimi={liste.paraBirimi}
        fiyatBaslik={liste.fiyatBaslik ?? ""}
        fiyat2Baslik={liste.fiyat2Baslik ?? ""}
        fiyat3Baslik={liste.fiyat3Baslik ?? ""}
        satisIskontoYuzde={liste.satisIskontoYuzde}
        kartKarYuzde={liste.kartKarYuzde}
        satirlar={liste.kalemler.map((k) => ({ id: k.id, bolum: k.bolum, ad: k.ad, kod: k.kod, fiyat: k.fiyat, fiyat2: k.fiyat2, fiyat3: k.fiyat3 }))}
      />

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
          alisIskontoYuzde: liste.alisIskontoYuzde,
          satisIskontoYuzde: liste.satisIskontoYuzde,
          kartKarYuzde: liste.kartKarYuzde,
          yuvarlamaAdim: liste.yuvarlamaAdim,
          fiyatGoster: liste.fiyatGoster,
          duzen: liste.duzen,
          fiyatBaslik: liste.fiyatBaslik ?? "",
          fiyat2Baslik: liste.fiyat2Baslik ?? "",
          fiyat3Baslik: liste.fiyat3Baslik ?? "",
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
          fiyat3: k.fiyat3,
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
        kodAlislari={kodAlislari}
      />
    </div>
  );
}
