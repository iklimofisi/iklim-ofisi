import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  siparisFaturaGuncelle,
  sevkiyatEkle,
  sevkiyatSil,
  siparisSil,
  teslimKaydiEkle,
  teslimKaydiSil,
} from "@/lib/actions";
import { suankiKullanici } from "@/lib/oturum";
import SiparisDurumSecici from "@/components/SiparisDurumSecici";
import SiparisOnayReddet from "@/components/SiparisOnayReddet";
import SiparisSureciGostergesi from "@/components/SiparisSureciGostergesi";
import SilButon from "@/components/SilButon";
import YazdirButon from "@/components/YazdirButon";

export const dynamic = "force-dynamic";

function paraFormat(n: number, paraBirimi: string) {
  return n.toLocaleString("tr-TR", { style: "currency", currency: paraBirimi });
}

export default async function SiparisDetay({ params }: { params: { id: string } }) {
  const [siparis, giren] = await Promise.all([
    prisma.siparis.findUnique({
      where: { id: params.id },
      include: {
        musteri: true,
        teklif: { include: { kalemler: true } },
        sevkiyatlar: { include: { teklifKalem: true }, orderBy: { tarih: "desc" } },
        teslimler: { include: { teklifKalem: true }, orderBy: { tarih: "desc" } },
      },
    }),
    suankiKullanici(),
  ]);

  if (!siparis) notFound();

  const toplam = siparis.teklif.kalemler.reduce(
    (a, k) => a + k.adet * k.birimFiyat * (1 - k.iskontoYuzde / 100),
    0
  );
  const isAdmin = giren?.rol === "ADMIN";
  const aktifMi = siparis.durum !== "ONAY_BEKLIYOR" && siparis.durum !== "REDDEDILDI";

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
          {aktifMi && <SiparisDurumSecici siparisId={siparis.id} mevcutDurum={siparis.durum} />}
          <YazdirButon />
          <SilButon id={siparis.id} action={siparisSil} onayMesaji="Bu siparişi silmek istediğine emin misin? (Cari hesaba işlenmiş borç kaydı otomatik silinmez, gerekirse cari hesaptan ayrıca sil.)" />
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
                  <td className="py-2 text-right font-mono">{k.adet}</td>
                  <td className="py-2 text-right font-mono">{sevk}</td>
                  <td className="py-2 text-right font-mono">{k.adet - sevk}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <SiparisSureciGostergesi durum={siparis.durum} />

      {siparis.durum === "ONAY_BEKLIYOR" && (
        <div className="bg-sicak-light border border-sicak/30 rounded-lg p-5 mb-8">
          <p className="text-sm text-sicak-dim font-medium mb-1">Bu sipariş henüz onaylanmadı.</p>
          <p className="text-sm text-metin/60 mb-4">
            {siparis.olusturanAdi && `${siparis.olusturanAdi} tarafından talep edildi. `}
            Onaylanana kadar cari hesaba işlenmez ve sevkiyat başlatılamaz.
          </p>
          {isAdmin ? (
            <SiparisOnayReddet siparisId={siparis.id} />
          ) : (
            <p className="text-sm text-metin/50">Bu talebi sadece bir Yönetici onaylayabilir.</p>
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
          <p className="font-mono text-xl text-metin">{paraFormat(toplam, siparis.teklif.paraBirimi)}</p>
          {siparis.teklif.paraBirimi !== "TRY" && (
            <p className="text-xs text-metin/50 mt-1">
              Kur: 1 {siparis.teklif.paraBirimi} = {siparis.kur} TL · TL karşılığı ≈{" "}
              {paraFormat(toplam * siparis.kur, "TRY")}
            </p>
          )}
        </div>
        <div className="bg-yuzey border border-hat rounded-lg p-5">
          <p className="text-xs text-metin/50 mb-1">Sevk Adresi</p>
          <p className="text-sm text-metin">{siparis.sevkAdresi ?? siparis.musteri.sevkAdresi ?? "Sevk adresi girilmemiş."}</p>
        </div>
      </div>

      {aktifMi && (
        <>
          <div className="bg-yuzey border border-hat rounded-lg p-5 mb-8">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display font-medium text-metin">Fatura Bilgisi</h2>
              {siparis.durum === "FATURALANDI" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-soguk-light text-soguk-dim">Faturalandı</span>
              )}
            </div>
            <p className="text-sm text-metin/60 mb-4">
              Fatura no ve tarihini girip kaydettiğinde sipariş otomatik "Faturalandı" durumuna geçer.
            </p>
            <form action={siparisFaturaGuncelle} className="flex flex-wrap items-end gap-3 print:hidden">
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
              <button
                type="submit"
                className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
              >
                Kaydet
              </button>
            </form>
          </div>

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
                        {sevkEdilen}/{k.adet} sevk edildi
                        {kalan > 0 ? ` · ${kalan} kaldı` : " · tamamlandı"}
                      </p>
                    </div>
                    {kalan > 0 && (
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
                        <button
                          type="submit"
                          className="focus-ring text-sm text-soguk-dim font-medium hover:underline"
                        >
                          Sevk Et
                        </button>
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
                      <SilButon id={s.id} action={sevkiyatSil} onayMesaji="Bu sevkiyat kaydını silmek istediğine emin misin?" />
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
                        {teslimEdilen}/{k.adet} teslim edildi
                        {teslimEdilen < k.adet ? "" : " · tamamlandı"}
                      </p>
                    </div>
                    {teslimEdilebilir > 0 ? (
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
                        <button
                          type="submit"
                          className="focus-ring text-sm text-soguk-dim font-medium hover:underline"
                        >
                          Teslim Kaydet
                        </button>
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
                      <SilButon id={t.id} action={teslimKaydiSil} onayMesaji="Bu teslim kaydını silmek istediğine emin misin?" />
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
