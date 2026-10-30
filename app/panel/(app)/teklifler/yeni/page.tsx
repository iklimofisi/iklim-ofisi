import { prisma } from "@/lib/prisma";
import { GERCEK_MUSTERI } from "@/lib/musterisiz";
import { teklifEkle } from "@/lib/actions";
import TeklifKalemleri from "@/components/TeklifKalemleri";
import { getTcmbKurlari } from "@/lib/kur";
import HizliMusteriEkleModal from "@/components/HizliMusteriEkleModal"; // HIZLI MÜŞTERİ MODALI
import MusteriYetkiliSecici from "@/components/MusteriYetkiliSecici";
import SablonSecici from "@/components/SablonSecici";
import KaydetButonu from "@/components/KaydetButonu";
import Link from "next/link";
import { donusumKalemleri } from "@/lib/satinalma-hesap";
import type { Satir } from "@/components/TeklifKalemleri";
import TclTeklifYukle from "@/components/TclTeklifYukle";

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
    satinalma?: string; // Tedarikçi (satınalma) teklifinden: kalemler kâr eklenerek forma gelir
    marj?: string; // kâr %
  };
}) {
  const [musteriler, sablonlar, markalar, urunler, projeler, kurlar, tedarikciler, konuKayitlari] = await Promise.all([
    prisma.musteri.findMany({ where: GERCEK_MUSTERI,
      orderBy: { ad: "asc" },
      include: { yetkililer: { orderBy: { ad: "asc" }, select: { id: true, ad: true, unvan: true } } },
    }),
    prisma.teklifSablon.findMany({ orderBy: { sira: "asc" } }),
    prisma.marka.findMany({ select: { id: true, ad: true }, orderBy: { ad: "asc" } }),
    prisma.urun.findMany({ orderBy: { ad: "asc" } }),
    prisma.proje.findMany({ orderBy: { ad: "asc" } }),
    getTcmbKurlari(), // para birimi değişince fiyat çevirme için (alınamazsa null)
    // TCL teklif PDF'inden doldurma kutusu için
    prisma.tedarikci.findMany({ orderBy: { ad: "asc" }, select: { id: true, ad: true } }),
    prisma.satinalmaTeklifi.findMany({ select: { baslik: true }, distinct: ["baslik"], orderBy: { baslik: "asc" } }),
  ]);

  // --- Tedarikçi teklifinden aktarma (ör. TCL teklif PDF'i): kalemler bölümleriyle, kâr eklenmiş fiyatla gelir ---
  const satinalma = searchParams.satinalma
    ? await prisma.satinalmaTeklifi.findUnique({
        where: { id: searchParams.satinalma },
        include: { tedarikci: { select: { ad: true } }, kalemler: { orderBy: { id: "asc" } } },
      })
    : null;
  const marjHam = Number(String(searchParams.marj ?? "").replace(",", "."));
  const marj = Number.isFinite(marjHam) && marjHam > -100 && marjHam <= 1000 ? marjHam : 0;
  let aktarimKalemleri: Satir[] | undefined;
  let aktarimFiyatsiz = false;
  if (satinalma) {
    const d = donusumKalemleri(satinalma, marj);
    aktarimFiyatsiz = d.fiyatsizVar;
    // TCL ürünleri (tedarikçi adı ya da TCL model kodu) panelde TCL markasıyla gelir
    const tclMi = /tcl/i.test(satinalma.tedarikci.ad) || satinalma.kalemler.some((k) => /^TMV-/i.test(k.aciklama));
    const tclMarka = tclMi ? markalar.find((m) => m.ad.trim().toLocaleUpperCase("tr-TR") === "TCL") : undefined;
    aktarimKalemleri = d.kalemler.map((k, i) => ({
      key: `aktarim-${i}`,
      bolum: k.bolum || "Genel Kalemler",
      aciklama: k.aciklama,
      adet: k.adet,
      birimFiyat: Math.round(k.birimFiyat * 100) / 100,
      iskontoYuzde: 0,
      markaId: tclMarka?.id ?? null,
    }));
  }

  const varsayilanBaslik = searchParams.proje || satinalma?.baslik || "";
  const varsayilanMusteriId = searchParams.seciliMusteriId || searchParams.musteri || "";
  const varsayilanProjeId =
    searchParams.seciliProjeId ||
    (satinalma ? projeler.find((p) => p.ad.trim().toLocaleLowerCase("tr-TR") === satinalma.baslik.trim().toLocaleLowerCase("tr-TR"))?.id ?? "" : "");

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

      {/* TCL TEKLİF PDF'İNDEN DOLDUR: PDF + iskonto + kâr → satınalma teklifi kaydedilir, form dolu açılır */}
      {!satinalma && (
        <details className="group bg-soguk-light/30 border border-soguk/40 rounded-lg p-4 mb-5">
          <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-soguk-dim">📄 TCL teklif PDF&apos;inden doldur</span>
            <span className="text-xs text-metin/50 group-open:hidden">Aç</span>
            <span className="text-xs text-metin/50 hidden group-open:inline">Kapat</span>
          </summary>
          <p className="text-xs text-metin/60 mt-2 mb-3">
            PDF&apos;i seçin, alış iskontosu ve kâr oranını yazın: kalemler ürün gruplarıyla, iskonto düşülüp kâr eklenmiş fiyatla aşağıdaki forma
            gelir. Tedarikçi teklifi Satınalma bölümüne de kaydedilir.
          </p>
          <TclTeklifYukle tedarikciler={tedarikciler} konular={konuKayitlari.map((k) => k.baslik).filter(Boolean)} teklifeAktar />
        </details>
      )}

      {satinalma && (
        <div className="bg-soguk-light/40 border border-soguk/30 rounded-md p-3 text-xs text-metin/80 mb-4">
          <strong className="text-soguk-dim">{satinalma.tedarikci.ad}</strong> teklifinden aktarıldı ({satinalma.baslik}):{" "}
          {aktarimKalemleri?.length ?? 0} kalem,{" "}
          {satinalma.alisIskontoYuzde ? (
            <>
              liste fiyatlarından <strong>%{satinalma.alisIskontoYuzde.toLocaleString("tr-TR")} alış iskontosu</strong> düşüldü ve{" "}
            </>
          ) : null}
          fiyatlara <strong>%{marj.toLocaleString("tr-TR")} kâr</strong> eklendi. Müşteriyi, notları ve
          fiyatları kontrol edip &quot;Teklifi Kaydet&quot;e basın.
          {aktarimFiyatsiz && " Tedarikçi birim fiyat vermediği için toplam kalemlere paylaştırıldı ve PDF'te kalem fiyatları gizlendi."}
        </div>
      )}

      {/* YENİ TEKLİF FORMU */}
      <form action={teklifEkle} className="bg-yuzey border border-hat rounded-lg p-5">
        {satinalma && <input type="hidden" name="kaynakSatinalmaTeklifiId" value={satinalma.id} />}
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
            <select name="paraBirimi" defaultValue={satinalma?.paraBirimi ?? "TRY"} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
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
          baslangic={aktarimKalemleri}
          paraBirimi={satinalma?.paraBirimi ?? "TRY"}
          kurlar={kurlar}
          markalar={markalar.map((m) => ({ id: m.id, ad: m.ad }))}
          urunler={urunler.map((u) => ({
            id: u.id,
            kod: u.kod,
            ad: u.ad,
            markaId: u.markaId,
            birimFiyat: u.listeFiyati,
            paraBirimi: u.paraBirimi,
            birim: u.birim,
          }))}
        />

        <label className="flex items-center gap-2 text-sm text-metin/80 mb-4 bg-soguk-light/20 p-2.5 rounded border border-hat">
          <input type="checkbox" name="birimFiyatGoster" value="hayir" defaultChecked={aktarimFiyatsiz} className="accent-soguk" />
          <span className="font-semibold text-metin">PDF çıktısında tüm kalem fiyatlarını gizle</span>
          <span className="text-xs text-metin/60">(Müşteri kalem fiyatlarını göremez, sadece dip toplam görünür)</span>
        </label>

        <SablonSecici sablonlar={sablonlar} seciliIdler={[]} varsayilanIlk />

        <div className="flex items-center justify-end border-t border-hat pt-4">
          <KaydetButonu basari={null}>Teklifi Kaydet</KaydetButonu>
        </div>
      </form>

    </div>
  );
}
