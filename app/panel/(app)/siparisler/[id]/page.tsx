import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  siparisFaturaGuncelle,
  sevkiyatEkle,
  sevkiyatSil,
  siparisIptal,
  siparisSil,
  teslimKaydiEkle,
  teslimKaydiSil,
} from "@/lib/actions";
import { suankiKullanici, sayfaYetkisi } from "@/lib/oturum";
import { maliyetGorur } from "@/lib/roller";
import SiparisDurumSecici from "@/components/SiparisDurumSecici";
import SiparisOnayReddet from "@/components/SiparisOnayReddet";
import SiparisSureciGostergesi from "@/components/SiparisSureciGostergesi";
import SilButon from "@/components/SilButon";
import KayitIslemButonu from "@/components/KayitIslemButonu";
import { siparisNetTutari } from "@/lib/siparis-tutari";
import { SAS_DURUM_ETIKET, sasNo, sasTl, maliyeteSayilirMi } from "@/lib/satinalma-siparis";
import YazdirButon from "@/components/YazdirButon";
import KaydetButonu from "@/components/KaydetButonu";
import { miktarYaz } from "@/lib/birimler";
import SonucluForm from "@/components/SonucluForm";
import { getTcmbKurlari, tcmbKuru, kurKaynagiOku, KUR_KAYNAGI_ETIKET } from "@/lib/kur";

export const dynamic = "force-dynamic";

function paraFormat(n: number, paraBirimi: string) {
  return n.toLocaleString("tr-TR", { style: "currency", currency: paraBirimi });
}

export default async function SiparisDetay({ params }: { params: { id: string } }) {
  await sayfaYetkisi("siparis");
  const [siparis, giren] = await Promise.all([
    prisma.siparis.findUnique({
      where: { id: params.id },
      include: {
        musteri: true,
        teklif: { include: { kalemler: { orderBy: [{ sira: "asc" }, { id: "asc" }] } } },
        sevkiyatlar: { include: { teklifKalem: true }, orderBy: { tarih: "desc" } },
        teslimler: { include: { teklifKalem: true }, orderBy: { tarih: "desc" } },
        satinalmaSiparisleri: {
          select: { id: true, no: true, baslik: true, durum: true, tutarNet: true, kur: true, paraBirimi: true, tedarikci: { select: { ad: true } } },
          orderBy: { no: "asc" },
        },
      },
    }),
    suankiKullanici(),
  ]);

  if (!siparis) notFound();

  // Sipariş tutarı: sipariş açılırken/onaylanırken dondurulan tutar (eski siparişlerde teklifin kalemleri)
  const toplam = siparisNetTutari(siparis);
  const pb = siparis.paraBirimi ?? siparis.teklif.paraBirimi;
  const teklifDegisti = siparis.teklifRevizyonNo != null && siparis.teklif.revizyonNo > siparis.teklifRevizyonNo;
  // Gerçek maliyet: bu siparişe bağlı (iptal / red olmayan) satınalma siparişlerinin TL karşılığı, KDV hariç
  const satisTl = pb === "TRY" ? toplam : toplam * (siparis.faturaKur ?? siparis.kur);
  const maliyetTl = siparis.satinalmaSiparisleri.filter((x) => maliyeteSayilirMi(x.durum)).reduce((a, x) => a + sasTl(x), 0);
  const brutKar = satisTl - maliyetTl;
  const isAdmin = giren?.rol === "ADMIN";
  const maliyetGor = maliyetGorur(giren?.rol); // satış personeli maliyet / kâr görmez
  const aktifMi = siparis.durum !== "ONAY_BEKLIYOR" && siparis.durum !== "REDDEDILDI";
  // "Hazırlanıyor'a al" yalnız sevk / teslim aşamasındaki siparişte çalışır
  const geriAlinabilir = ["KISMEN_SEVK_EDILDI", "SEVK_EDILDI", "KISMEN_TESLIM_EDILDI", "TESLIM_EDILDI"].includes(siparis.durum);
  const kapali = siparis.durum === "IPTAL" || siparis.durum === "REDDEDILDI";

  // Dövizli sipariş: onay / fatura için önerilen kur (TCMB ya da talepte yazılan elle kur)
  const dovizli = pb !== "TRY";
  const kaynak = kurKaynagiOku(siparis.kurKaynagi);
  const faturaKurGerekli = dovizli && siparis.durum !== "IPTAL" && siparis.faturaKur == null;
  const kurlar = dovizli && (siparis.durum === "ONAY_BEKLIYOR" || faturaKurGerekli) ? await getTcmbKurlari() : null;
  const kdvliDoviz = siparis.teklif.kdvDahil ? toplam : toplam * (1 + siparis.teklif.kdvOrani / 100);
  const onayKuruOnerisi = !dovizli ? null : kaynak === "ELLE" ? siparis.kur : tcmbKuru(kurlar, pb, kaynak);
  const onayKurNotu = !dovizli
    ? undefined
    : kaynak === "ELLE"
      ? "Talepte elle yazılan kur."
      : onayKuruOnerisi
        ? `${KUR_KAYNAGI_ETIKET[kaynak]} · ${kurlar?.tarih ?? "son"} bülteni. Değiştirirsen kur "elle" olarak kaydedilir.`
        : "TCMB kuruna şu an ulaşılamadı; kuru yazın.";
  const faturaKuruOnerisi = faturaKurGerekli ? tcmbKuru(kurlar, pb, "TCMB_DOVIZ") : null;

  return (
    <div>
      <Link href="/panel/siparisler" className="focus-ring text-sm text-metin/60 hover:text-metin mb-6 inline-block">
        ← Siparişlere dön
      </Link>

      <div className="flex items-start justify-between mb-2 gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Sipariş</p>
          <h1 className="font-display text-2xl font-semibold text-metin">{siparis.teklif.baslik || "(Başlıksız Teklif)"}</h1>
          <p className="text-sm text-metin/60 mt-1">
            {siparis.musteri.ad} · Kaynak teklif:{" "}
            <Link href={`/panel/teklifler/${siparis.teklifId}`} className="text-soguk-dim hover:underline">
              görüntüle
            </Link>{" "}
            · Cari hesap:{" "}
            <Link href={`/panel/cari?musteri=${siparis.musteriId}`} className="text-soguk-dim hover:underline">
              görüntüle
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 print:hidden">
          {geriAlinabilir && <SiparisDurumSecici siparisId={siparis.id} mevcutDurum={siparis.durum} />}
          <YazdirButon />
          {isAdmin && kapali && (
            <KayitIslemButonu
              id={siparis.id}
              action={siparisSil}
              etiket="Siparişi sil"
              onayBasligi="Silme onayı"
              onayMesaji="İptal / red edilmiş sipariş kalıcı silinir; tam kopyası İşlem Geçmişi'nde saklanır. İptal edilmiş cari kayıtları silinmez. Sonra teklif yeniden siparişe dönüştürülebilir."
              tehlikeli
              sonraGit={`/panel/teklifler/${siparis.teklifId}`}
            />
          )}
          {isAdmin && !kapali && (
            <KayitIslemButonu
              id={siparis.id}
              action={siparisIptal}
              etiket="Siparişi iptal et"
              onayMesaji="Sipariş silinmez; iptal edilir ve kaydı kimin, ne zaman, neden iptal ettiğiyle saklanır."
              nedenIste
            />
          )}
        </div>
      </div>

      <div className="hidden print:block mb-8">
        <h2 className="font-display font-medium text-metin mb-3">Kalem Özeti (Ürün · Toplam · Sevk Edilen · Kalan)</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-metin/50 border-b border-hat">
              <th className="py-2 font-medium">Ürün</th>
              <th className="py-2 font-medium text-right">Toplam</th>
              <th className="py-2 font-medium text-right">Sevk Edilen</th>
              <th className="py-2 font-medium text-right">Kalan</th>
            </tr>
          </thead>
          <tbody>
            {siparis.teklif.kalemler.map((k) => {
              const sevk = siparis.sevkiyatlar.filter((s) => s.teklifKalemId === k.id).reduce((a, s) => a + s.adet, 0);
              return (
                <tr key={k.id} className="border-b border-hat last:border-0">
                  <td className="py-2 text-metin">{k.aciklama}</td>
                  <td className="py-2 text-right font-mono whitespace-nowrap">{miktarYaz(k.adet, k.birim)}</td>
                  <td className="py-2 text-right font-mono">{sevk}</td>
                  <td className="py-2 text-right font-mono whitespace-nowrap">{miktarYaz(k.adet - sevk, k.birim)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <SiparisSureciGostergesi durum={siparis.durum} />

      {siparis.durum === "IPTAL" && (
        <div className="bg-hat rounded-lg p-5 mb-8">
          <p className="text-sm font-medium text-metin mb-1">Bu sipariş iptal edildi.</p>
          <p className="text-sm text-metin/60">
            {siparis.iptalTarihi ? siparis.iptalTarihi.toLocaleDateString("tr-TR") : ""}
            {siparis.iptalEdenAdi ? ` · ${siparis.iptalEdenAdi}` : ""}
            {siparis.iptalNedeni ? ` · Neden: ${siparis.iptalNedeni}` : ""}
          </p>
        </div>
      )}

      {teklifDegisti && (
        <div className="bg-sicak-light border border-sicak/30 rounded-lg p-4 mb-8 print:hidden">
          <p className="text-sm text-sicak-dim">
            Kaynak teklif sipariş açıldıktan sonra değiştirildi (sipariş Rev. {siparis.teklifRevizyonNo}, teklif şu an Rev. {siparis.teklif.revizyonNo}).
            Sipariş tutarı, açıldığı andaki tutarla sabit kalır.
          </p>
        </div>
      )}

      {siparis.durum === "ONAY_BEKLIYOR" && (
        <div className="bg-sicak-light border border-sicak/30 rounded-lg p-5 mb-8">
          <p className="text-sm text-sicak-dim font-medium mb-1">Bu sipariş henüz onaylanmadı.</p>
          <p className="text-sm text-metin/60 mb-4">
            {siparis.olusturanAdi && `${siparis.olusturanAdi} tarafından talep edildi. `}
            Onaylanana kadar cari hesaba işlenmez ve sevkiyat başlatılamaz.
          </p>
          {isAdmin ? (
            <SiparisOnayReddet
              siparisId={siparis.id}
              pb={pb}
              dovizKdvli={Math.round(kdvliDoviz * 100) / 100}
              onerilenKur={onayKuruOnerisi}
              kurNotu={onayKurNotu}
            />
          ) : (
            <p className="text-sm text-metin/50">Bu talebi sadece bir Admin onaylayabilir.</p>
          )}
        </div>
      )}

      {siparis.durum === "REDDEDILDI" && (
        <div className="bg-hat rounded-lg p-5 mb-8">
          <p className="text-sm font-medium text-metin mb-1">Bu sipariş talebi reddedildi.</p>
          {siparis.redSebebi && <p className="text-sm text-metin/60">Sebep: {siparis.redSebebi}</p>}
        </div>
      )}

      <div className="bg-yuzey border border-hat rounded-lg p-5 mb-8">
        <h2 className="font-display font-medium text-metin mb-3">Sözleşme</h2>
        {siparis.sozlesmeDosyaAdi ? (
          <a
            href={`/api/siparis/${siparis.id}/sozlesme`}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex items-center gap-2 text-sm text-soguk-dim hover:underline"
          >
            📄 {siparis.sozlesmeDosyaAdi} — görüntüle/indir
          </a>
        ) : (
          <p className="text-sm text-metin/50">Yüklenmiş bir sözleşme PDF'i yok.</p>
        )}
        {siparis.ekNot && (
          <p className="text-sm text-metin/60 whitespace-pre-line mt-3 pt-3 border-t border-hat">{siparis.ekNot}</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-yuzey border border-hat rounded-lg p-5">
          <p className="text-xs text-metin/50 mb-1">Sipariş Tutarı</p>
          <p className="font-mono text-xl text-metin">{paraFormat(toplam, pb)}</p>
          {pb !== "TRY" && (
            <div className="text-xs text-metin/50 mt-1 space-y-0.5">
              {!siparis.onayTarihi && siparis.kurKaynagi !== "ELLE" && siparis.kur === 1 ? (
                <p>Kur: onay günü {KUR_KAYNAGI_ETIKET[kaynak]} kuru kullanılacak.</p>
              ) : (
              <p>
                {siparis.onayTarihi ? "Onay kuru" : "Ön kur (kesin kur onayda)"}: 1 {pb} = {siparis.kur.toLocaleString("tr-TR", { maximumFractionDigits: 6 })} TL
                {siparis.kurKaynagi ? ` · ${KUR_KAYNAGI_ETIKET[siparis.kurKaynagi] ?? siparis.kurKaynagi}` : ""}
                {siparis.kurTarihi ? ` (${siparis.kurTarihi} bülteni)` : ""}
              </p>
              )}
              {(siparis.onayTarihi || siparis.kurKaynagi === "ELLE" || siparis.kur !== 1) && (
                <p>TL karşılığı (KDV hariç) ≈ {paraFormat(toplam * (siparis.faturaKur ?? siparis.kur), "TRY")}</p>
              )}
              {siparis.faturaKur != null && (
                <p>Fatura kuru: 1 {pb} = {siparis.faturaKur.toLocaleString("tr-TR", { maximumFractionDigits: 6 })} TL</p>
              )}
            </div>
          )}
        </div>
        <div className="bg-yuzey border border-hat rounded-lg p-5">
          <p className="text-xs text-metin/50 mb-1">Sevk Adresi</p>
          <p className="text-sm text-metin">{siparis.sevkAdresi ?? siparis.musteri.sevkAdresi ?? "Sevk adresi girilmemiş."}</p>
        </div>
      </div>

      {/* GERÇEK MALİYET (satınalma siparişlerinden) — satış rolüne gösterilmez */}
      {maliyetGor && (
      <div className="bg-yuzey border border-hat rounded-lg p-5 mb-8 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h2 className="font-display font-medium text-metin">Maliyet & Brüt Kâr</h2>
          {siparis.durum !== "IPTAL" && siparis.durum !== "REDDEDILDI" && (
            <Link href={`/panel/satinalma/siparisler?siparis=${siparis.id}#yeni`} className="focus-ring text-xs font-medium text-soguk-dim hover:underline">
              + Bu iş için satınalma siparişi aç
            </Link>
          )}
        </div>
        {siparis.satinalmaSiparisleri.length === 0 ? (
          <p className="text-sm text-metin/50">Bu siparişe bağlı satınalma siparişi yok; gerçek maliyet henüz hesaplanamıyor.</p>
        ) : (
          <>
            <ul className="text-sm divide-y divide-hat mb-3">
              {siparis.satinalmaSiparisleri.map((x) => (
                <li key={x.id} className={`flex flex-wrap items-center justify-between gap-2 py-1.5 ${maliyeteSayilirMi(x.durum) ? "" : "text-metin/40 line-through"}`}>
                  <span>
                    <Link href={`/panel/satinalma/siparisler/${x.id}`} className="font-mono text-soguk-dim hover:underline">
                      {sasNo(x.no)}
                    </Link>{" "}
                    · {x.tedarikci.ad} · {x.baslik} <span className="text-xs text-metin/50">({SAS_DURUM_ETIKET[x.durum] ?? x.durum})</span>
                  </span>
                  <span className="font-mono whitespace-nowrap">
                    {paraFormat(x.tutarNet, x.paraBirimi)}
                    {x.paraBirimi !== "TRY" && <span className="text-xs text-metin/50"> ≈ {paraFormat(sasTl(x), "TRY")}</span>}
                  </span>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-3 gap-3 text-sm border-t border-hat pt-3">
              <div>
                <p className="text-xs text-metin/50">Satış (TL, KDV hariç)</p>
                <p className="font-mono">{paraFormat(satisTl, "TRY")}</p>
              </div>
              <div>
                <p className="text-xs text-metin/50">Maliyet (TL, KDV hariç)</p>
                <p className="font-mono">{paraFormat(maliyetTl, "TRY")}</p>
              </div>
              <div>
                <p className="text-xs text-metin/50">Brüt kâr</p>
                <p className={`font-mono font-semibold ${brutKar < 0 ? "text-red-700" : "text-emerald-700"}`}>
                  {paraFormat(brutKar, "TRY")}
                  {satisTl > 0 && <span className="text-xs font-normal"> · %{((brutKar / satisTl) * 100).toFixed(1).replace(".", ",")}</span>}
                </p>
              </div>
            </div>
            <p className="text-[11px] text-metin/40 mt-2">Döviz tutarları siparişlerin açıldığı günkü kurla TL&apos;ye çevrilir. Montaj / işçilik gibi satınalma dışı giderler dahil değildir.</p>
          </>
        )}
      </div>
      )}

      {aktifMi && (
        <>
          {siparis.durum !== "IPTAL" && (
          <div className="bg-yuzey border border-hat rounded-lg p-5 mb-8">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display font-medium text-metin">Fatura Bilgisi</h2>
              {siparis.durum === "FATURALANDI" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-soguk-light text-soguk-dim">Faturalandı</span>
              )}
            </div>
            <p className="text-sm text-metin/60 mb-4">
              Fatura no ve tarihini girip kaydettiğinde sipariş otomatik &quot;Faturalandı&quot; durumuna geçer.
              {faturaKurGerekli &&
                ` Faturayı onay kurundan (${siparis.kur.toLocaleString("tr-TR", { maximumFractionDigits: 6 })}) farklı bir kurla kestiysen fatura kurunu yaz; fark cari hesaba "kur farkı" olarak bir kez işlenir. Boş bırakırsan kur farkı işlenmez.`}
            </p>
            <SonucluForm action={siparisFaturaGuncelle} className="flex flex-wrap items-end gap-3 print:hidden">
              <input type="hidden" name="siparisId" value={siparis.id} />
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">Fatura No</label>
                <input
                  name="faturaNo"
                  required
                  defaultValue={siparis.faturaNo ?? ""}
                  className="focus-ring border border-hat rounded-md px-3 py-2 text-sm"
                  placeholder="örn. EFT2026000123"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">Fatura Tarihi</label>
                <input
                  name="faturaTarihi"
                  type="date"
                  defaultValue={siparis.faturaTarihi ? siparis.faturaTarihi.toISOString().slice(0, 10) : ""}
                  className="focus-ring border border-hat rounded-md px-3 py-2 text-sm"
                />
              </div>
              {faturaKurGerekli && (
                <div>
                  <label className="block text-xs font-medium text-metin/60 mb-1">Fatura kuru (1 {pb} = ? TL, ops.)</label>
                  <input
                    name="faturaKur"
                    inputMode="decimal"
                    placeholder={faturaKuruOnerisi ? String(faturaKuruOnerisi).replace(".", ",") : "örn. 50,75"}
                    className="focus-ring w-40 border border-hat rounded-md px-3 py-2 text-sm font-mono"
                  />
                  {faturaKuruOnerisi && <p className="text-[11px] text-metin/40 mt-1">Bugün TCMB döviz satış: {String(faturaKuruOnerisi).replace(".", ",")}</p>}
                </div>
              )}
              <button
                type="submit"
                className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors disabled:opacity-60"
              >
                Kaydet
              </button>
            </SonucluForm>
          </div>
          )}

          <div className="bg-yuzey border border-hat rounded-lg p-5 mb-8">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display font-medium text-metin">Kalem Bazlı Sevkiyat</h2>
              {(siparis.durum === "SEVK_EDILDI" || siparis.durum === "KISMEN_SEVK_EDILDI") && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-soguk-light text-soguk-dim">
                  {siparis.durum === "SEVK_EDILDI" ? "Sevk Edildi" : "Kısmen Sevk Edildi"}
                </span>
              )}
            </div>
            <p className="text-sm text-metin/60 mb-4">
              Toplam sevk edilen adet, siparişin toplam adedine ulaşana kadar durum
              "Kısmen Sevk Edildi" olarak kalır — tamamlanınca otomatik "Sevk Edildi" olur.
            </p>
            <div className="space-y-5">
              {siparis.teklif.kalemler.map((k) => {
                const sevkEdilen = siparis.sevkiyatlar
                  .filter((s) => s.teklifKalemId === k.id)
                  .reduce((a, s) => a + s.adet, 0);
                const kalan = k.adet - sevkEdilen;
                return (
                  <div key={k.id} className="border-b border-hat last:border-0 pb-5 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-metin">{k.aciklama}</p>
                      <p className="text-xs text-metin/50">
                        {sevkEdilen}/{k.adet} {k.birim} sevk edildi
                        {kalan > 0 ? ` · ${kalan} kaldı` : " · tamamlandı"}
                      </p>
                    </div>
                    {kalan > 0 && !kapali && (
                      <form action={sevkiyatEkle} className="flex flex-wrap gap-2 print:hidden">
                        <input type="hidden" name="siparisId" value={siparis.id} />
                        <input type="hidden" name="teklifKalemId" value={k.id} />
                        <input
                          name="adet"
                          type="number"
                          min={1}
                          max={kalan}
                          defaultValue={kalan}
                          className="focus-ring w-24 border border-hat rounded-md px-3 py-1.5 text-sm"
                        />
                        <input
                          name="not"
                          placeholder="not (opsiyonel, örn. kargo takip no)"
                          className="focus-ring flex-1 min-w-[160px] border border-hat rounded-md px-3 py-1.5 text-sm"
                        />
                        <KaydetButonu basari="Sevkiyat kaydedildi."
                          className="focus-ring text-sm text-soguk-dim font-medium hover:underline"
                        >
                          Sevk Et
                        </KaydetButonu>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>

            {siparis.sevkiyatlar.length > 0 && (
              <div className="mt-6 pt-5 border-t border-hat">
                <p className="text-xs font-medium text-metin/50 mb-3">Sevkiyat Geçmişi</p>
                <div className="space-y-2">
                  {siparis.sevkiyatlar.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-metin">{s.adet}x {s.teklifKalem.aciklama}{s.not && ` — ${s.not}`}</p>
                        <p className="text-xs text-metin/50">{s.tarih.toISOString().slice(0, 10)}</p>
                      </div>
                      {isAdmin && <SilButon id={s.id} action={sevkiyatSil} onayMesaji="Bu sevkiyat kaydını silmek istediğinize emin misiniz?" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-yuzey border border-hat rounded-lg p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display font-medium text-metin">Kalem Bazlı Teslim</h2>
              {(siparis.durum === "TESLIM_EDILDI" || siparis.durum === "KISMEN_TESLIM_EDILDI") && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-soguk-light text-soguk-dim">
                  {siparis.durum === "TESLIM_EDILDI" ? "Teslim Edildi" : "Kısmen Teslim Edildi"}
                </span>
              )}
            </div>
            <p className="text-sm text-metin/60 mb-4">
              Sevk edilen adet kadar teslim kaydı girebilirsin, istersen imzalı
              teslim tutanağı/irsaliye ekleyebilirsin. Toplam teslim, sipariş
              adedine ulaşana kadar "Kısmen Teslim Edildi" olarak kalır.
            </p>
            <div className="space-y-5">
              {siparis.teklif.kalemler.map((k) => {
                const sevkEdilen = siparis.sevkiyatlar
                  .filter((s) => s.teklifKalemId === k.id)
                  .reduce((a, s) => a + s.adet, 0);
                const teslimEdilen = siparis.teslimler
                  .filter((t) => t.teklifKalemId === k.id)
                  .reduce((a, t) => a + t.adet, 0);
                const teslimEdilebilir = sevkEdilen - teslimEdilen;
                return (
                  <div key={k.id} className="border-b border-hat last:border-0 pb-5 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-metin">{k.aciklama}</p>
                      <p className="text-xs text-metin/50">
                        {teslimEdilen}/{k.adet} {k.birim} teslim edildi
                        {teslimEdilen < k.adet ? "" : " · tamamlandı"}
                      </p>
                    </div>
                    {kapali ? null : teslimEdilebilir > 0 ? (
                      <form action={teslimKaydiEkle} className="flex flex-wrap items-end gap-2 print:hidden">
                        <input type="hidden" name="siparisId" value={siparis.id} />
                        <input type="hidden" name="teklifKalemId" value={k.id} />
                        <input
                          name="adet"
                          type="number"
                          min={1}
                          max={teslimEdilebilir}
                          defaultValue={teslimEdilebilir}
                          className="focus-ring w-24 border border-hat rounded-md px-3 py-1.5 text-sm"
                        />
                        <input
                          name="evrak"
                          type="file"
                          accept="application/pdf,image/*"
                          className="focus-ring flex-1 min-w-[160px] border border-hat rounded-md px-3 py-1.5 text-sm bg-white"
                        />
                        <input
                          name="not"
                          placeholder="not (opsiyonel)"
                          className="focus-ring flex-1 min-w-[140px] border border-hat rounded-md px-3 py-1.5 text-sm"
                        />
                        <KaydetButonu basari="Teslim kaydedildi."
                          className="focus-ring text-sm text-soguk-dim font-medium hover:underline"
                        >
                          Teslim Kaydet
                        </KaydetButonu>
                      </form>
                    ) : (
                      teslimEdilen < k.adet && (
                        <p className="text-xs text-metin/40">
                          Bu kalemden henüz sevk edilmemiş {k.adet - sevkEdilen} adet var — önce sevk etmen gerekiyor.
                        </p>
                      )
                    )}
                  </div>
                );
              })}
            </div>

            {siparis.teslimler.length > 0 && (
              <div className="mt-6 pt-5 border-t border-hat">
                <p className="text-xs font-medium text-metin/50 mb-3">Teslim Geçmişi</p>
                <div className="space-y-2">
                  {siparis.teslimler.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-metin">
                          {t.adet}x {t.teklifKalem.aciklama}{t.not && ` — ${t.not}`}
                        </p>
                        <p className="text-xs text-metin/50 flex items-center gap-2">
                          {t.tarih.toISOString().slice(0, 10)}
                          {t.evrakAdi && (
                            <a
                              href={`/api/teslim/${t.id}/evrak`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="focus-ring text-soguk-dim hover:underline"
                            >
                              📄 {t.evrakAdi}
                            </a>
                          )}
                        </p>
                      </div>
                      {isAdmin && <SilButon id={t.id} action={teslimKaydiSil} onayMesaji="Bu teslim kaydını silmek istediğinize emin misiniz?" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
