import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { suankiKullanici, sayfaYetkisi } from "@/lib/oturum";
import { paraFormat } from "@/lib/para";
import { miktarYaz } from "@/lib/birimler";
import {
  satinalmaSiparisiOnayla,
  satinalmaSiparisiReddet,
  satinalmaSiparisiIptal,
  satinalmaSiparisiBagla,
  malKabulEkle,
  malKabulIptal,
  alisFaturasiEkle,
  satinalmaSiparisiKurGuncelle,
} from "@/lib/satinalma-siparis-actions";
import KurAlani from "@/components/KurAlani";
import AlisFaturasiTutar from "@/components/AlisFaturasiTutar";
import { SAS_DURUM_ETIKET, SAS_DURUM_RENK, sasNo, sasTl, kalemNet, teslimAlinan, malKabulAcikMi } from "@/lib/satinalma-siparis";
import SonucluForm from "@/components/SonucluForm";
import KayitIslemButonu from "@/components/KayitIslemButonu";
import SatinalmaGonder from "@/components/SatinalmaGonder";
import { getSirketAyarlari } from "@/lib/sirket";
import { TEDARIKCI_LINK_TABANI } from "@/lib/satinalma-siparis-belge";
import { getTcmbKurlari } from "@/lib/kur";

export const dynamic = "force-dynamic";

const teklifNoYaz = (n: number) => `TKL-${String(n).padStart(4, "0")}`;
const tarihYaz = (d: Date | null | undefined) => (d ? d.toLocaleDateString("tr-TR") : "—");
const bugunIso = () => new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10); // Türkiye saati

export default async function SatinalmaSiparisDetay({ params }: { params: { id: string } }) {
  await sayfaYetkisi("satinalma");
  const [s, giren] = await Promise.all([
    prisma.satinalmaSiparisi.findUnique({
      where: { id: params.id },
      include: {
        tedarikci: { select: { id: true, ad: true, telefon: true, vergiNo: true, adres: true, email: true } },
        satinalmaTeklifi: { select: { id: true, baslik: true } },
        proje: { select: { id: true, ad: true } },
        siparis: { select: { id: true, durum: true, teklif: { select: { teklifNo: true, baslik: true } }, musteri: { select: { ad: true } } } },
        kalemler: {
          orderBy: [{ sira: "asc" }, { id: "asc" }],
          include: {
            urun: { select: { id: true, kod: true, ad: true } },
            malKabulKalemleri: { select: { miktar: true, malKabul: { select: { iptalTarihi: true } } } },
          },
        },
        malKabuller: { orderBy: { tarih: "desc" }, include: { kalemler: { include: { kalem: { select: { aciklama: true, birim: true } } } } } },
        faturalar: { orderBy: { tarih: "desc" }, select: { id: true, tarih: true, faturaNo: true, tutar: true, vadeTarihi: true, iptalTarihi: true, iptalNedeni: true, evrakDosyaAdi: true, paraBirimi: true, dovizTutar: true, kur: true } },
      },
    }),
    suankiKullanici(),
  ]);
  if (!s) notFound();
  const kurlar = s.paraBirimi !== "TRY" ? await getTcmbKurlari() : null;

  const yonetici = giren?.rol === "ADMIN";
  const pb = s.paraBirimi;
  const tl = sasTl(s);
  const kalemler = s.kalemler.map((k) => {
    const alinan = teslimAlinan(k);
    return { ...k, alinan, kalan: Math.max(0, Math.round((k.adet - alinan) * 1e6) / 1e6), net: kalemNet(k) };
  });
  const faturaToplam = s.faturalar.filter((f) => !f.iptalTarihi).reduce((a, f) => a + f.tutar, 0);
  const malKabulAcik = malKabulAcikMi(s.durum);
  const iptalEdilebilir = yonetici && s.durum !== "IPTAL" && s.durum !== "REDDEDILDI";
  const faturaAcik = ["ONAYLANDI", "KISMEN_TESLIM", "TESLIM_ALINDI"].includes(s.durum);

  const sirket = await getSirketAyarlari();
  const gonderilebilir = ["ONAYLANDI", "KISMEN_TESLIM", "TESLIM_ALINDI"].includes(s.durum);
  const saatli = (d: Date) => d.toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });

  const satisSiparisleri = await prisma.siparis.findMany({
    where: { OR: [{ durum: { notIn: ["IPTAL", "REDDEDILDI"] } }, ...(s.siparisId ? [{ id: s.siparisId }] : [])] },
    select: { id: true, teklif: { select: { teklifNo: true, baslik: true } }, musteri: { select: { ad: true } } },
    orderBy: { olusturmaTarihi: "desc" },
    take: 300,
  });

  const kutu = "focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white";

  return (
    <div>
      <Link href="/panel/satinalma/siparisler" className="focus-ring text-sm text-metin/60 hover:text-metin mb-6 inline-block print:hidden">
        ← Satınalma siparişleri
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Satınalma siparişi · {sasNo(s.no)}</p>
          <h1 className="font-display text-2xl font-semibold text-metin">{s.baslik}</h1>
          <p className="text-sm text-metin/60 mt-1">
            {s.tedarikci.ad}
            {s.tedarikci.telefon && ` · ${s.tedarikci.telefon}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <span className={`text-xs px-2.5 py-1 rounded-full border ${SAS_DURUM_RENK[s.durum] ?? ""}`}>{SAS_DURUM_ETIKET[s.durum] ?? s.durum}</span>
          {yonetici && s.durum === "ONAY_BEKLIYOR" && (
            <>
              <KayitIslemButonu
                id={s.id}
                action={satinalmaSiparisiOnayla}
                etiket="Onayla"
                onayBasligi="Sipariş onayı"
                onayMesaji={`${sasNo(s.no)} onaylansın mı? Tutar: ${paraFormat(s.tutarNet, pb)} (KDV hariç).`}
                className="focus-ring text-sm font-medium text-white bg-soguk hover:bg-soguk-dim rounded-md px-4 py-2 disabled:opacity-50"
              />
              <KayitIslemButonu id={s.id} action={satinalmaSiparisiReddet} etiket="Reddet" onayMesaji="Red nedeni kaydedilir." nedenIste nedenEtiketi="Red nedeni" />
            </>
          )}
          {iptalEdilebilir && (
            <KayitIslemButonu
              id={s.id}
              action={satinalmaSiparisiIptal}
              etiket="Siparişi iptal et"
              onayMesaji="Sipariş silinmez; iptal edilir ve kim, ne zaman, neden iptal ettiği saklanır."
              nedenIste
            />
          )}
        </div>
      </div>

      {s.durum === "ONAY_BEKLIYOR" && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4 mb-6 text-sm">
          Bu sipariş admin onayı bekliyor. Onaylanana kadar mal kabul yapılamaz ve fatura bağlanamaz.
          {!yonetici && " Onayı yalnız bir admin verebilir."}
        </div>
      )}
      {s.durum === "REDDEDILDI" && (
        <div className="bg-hat rounded-lg p-4 mb-6 text-sm">
          <b>Reddedildi</b> · {tarihYaz(s.onayTarihi)} · {s.onaylayanAdi}
          {s.redNedeni && ` · Neden: ${s.redNedeni}`}
        </div>
      )}
      {s.durum === "IPTAL" && (
        <div className="bg-hat rounded-lg p-4 mb-6 text-sm">
          <b>İptal edildi</b> · {tarihYaz(s.iptalTarihi)} · {s.iptalEdenAdi}
          {s.iptalNedeni && ` · Neden: ${s.iptalNedeni}`}
        </div>
      )}

      {/* TEDARİKÇİYE GÖNDER (kanalı kullanıcı seçer) */}
      <section className="bg-yuzey border border-hat rounded-lg p-5 mb-8 print:hidden">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <h2 className="font-display font-medium text-metin">Tedarikçiye gönder</h2>
          {s.sonGonderimTarihi && (
            <p className="text-xs text-emerald-700">
              ✓ Son gönderim: {s.sonGonderimKanali === "WHATSAPP" ? "WhatsApp" : "E-posta"} · {s.sonGonderimAlici} · {saatli(s.sonGonderimTarihi)}
              {s.sonGonderenAdi && ` · ${s.sonGonderenAdi}`}
              {s.gonderimSayisi > 1 && ` (${s.gonderimSayisi}. gönderim)`}
            </p>
          )}
        </div>
        {gonderilebilir ? (
          <SatinalmaGonder
            id={s.id}
            no={sasNo(s.no)}
            tedarikciAd={s.tedarikci.ad}
            email={s.tedarikci.email ?? ""}
            telefon={s.tedarikci.telefon ?? ""}
            firma={sirket.unvan}
            gonderenAd={giren?.ad ?? ""}
            mevcutLink={s.paylasimAnahtari ? TEDARIKCI_LINK_TABANI + s.paylasimAnahtari : null}
          />
        ) : (
          <p className="text-sm text-metin/60">
            {s.durum === "ONAY_BEKLIYOR" ? "Sipariş onaylanınca tedarikçiye e-posta ya da WhatsApp ile gönderilebilir." : "İptal / reddedilmiş sipariş gönderilemez."}{" "}
            <a href={`/api/satinalma-siparis/${s.id}/pdf`} target="_blank" rel="noreferrer" className="text-soguk-dim hover:underline">
              📄 PDF&apos;i gör
            </a>
          </p>
        )}
      </section>

      {/* ÖZET */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-yuzey border border-hat rounded-lg p-4">
          <p className="text-xs text-metin/50 mb-1">Sipariş tutarı (KDV hariç)</p>
          <p className="font-mono text-xl text-metin">{paraFormat(s.tutarNet, pb)}</p>
          {pb !== "TRY" && (
            <p className="text-xs text-metin/50 mt-1">
              Kur {String(s.kur).replace(".", ",")} · ≈ {paraFormat(tl, "TRY")}
            </p>
          )}
        </div>
        <div className="bg-yuzey border border-hat rounded-lg p-4">
          <p className="text-xs text-metin/50 mb-1">Bağlı alış faturaları (TL)</p>
          <p className="font-mono text-xl text-metin">{paraFormat(faturaToplam, "TRY")}</p>
          <p className="text-xs text-metin/50 mt-1">Sipariş ≈ {paraFormat(tl, "TRY")} + KDV</p>
        </div>
        <div className="bg-yuzey border border-hat rounded-lg p-4 text-sm space-y-1">
          <p>
            <span className="text-metin/50">Açan:</span> {s.olusturanAdi || "—"} · {tarihYaz(s.olusturmaTarihi)}
          </p>
          <p>
            <span className="text-metin/50">Onay:</span> {s.durum === "ONAY_BEKLIYOR" ? "bekliyor" : s.onaylayanAdi ? `${s.onaylayanAdi} · ${tarihYaz(s.onayTarihi)}` : "—"}
          </p>
          <p>
            <span className="text-metin/50">Beklenen teslim:</span> {tarihYaz(s.beklenenTeslimTarihi)}
          </p>
        </div>
        <div className="bg-yuzey border border-hat rounded-lg p-4 text-sm space-y-1">
          <p>
            <span className="text-metin/50">Kaynak teklif:</span>{" "}
            {s.satinalmaTeklifi ? (
              <Link href={`/panel/satinalma/teklifler/${s.satinalmaTeklifi.id}`} className="text-soguk-dim hover:underline">
                {s.satinalmaTeklifi.baslik}
              </Link>
            ) : (
              "—"
            )}
          </p>
          <p>
            <span className="text-metin/50">Proje:</span>{" "}
            {s.proje ? (
              <Link href={`/panel/projeler/${s.proje.id}`} className="text-soguk-dim hover:underline">
                {s.proje.ad}
              </Link>
            ) : (
              "—"
            )}
          </p>
          <p>
            <span className="text-metin/50">Satış siparişi:</span>{" "}
            {s.siparis ? (
              <Link href={`/panel/siparisler/${s.siparis.id}`} className="text-soguk-dim hover:underline">
                {teklifNoYaz(s.siparis.teklif.teklifNo)} · {s.siparis.musteri.ad}
              </Link>
            ) : (
              "—"
            )}
          </p>
        </div>
      </div>

      {/* TL KARŞILIĞI: dövizli siparişin kuru (TCMB döviz / efektif ya da elle) */}
      {pb !== "TRY" && s.durum !== "IPTAL" && s.durum !== "REDDEDILDI" && (yonetici || s.durum === "ONAY_BEKLIYOR") && (
        <section className="bg-yuzey border border-hat rounded-lg p-5 mb-8 print:hidden">
          <h2 className="font-display font-medium text-metin mb-1">TL karşılığı (kur)</h2>
          <p className="text-xs text-metin/50 mb-3">
            Siparişin TL karşılığı (maliyet, kâr, onay eşiği) ve bundan sonraki mal kabullerin stok maliyeti bu kurla hesaplanır. Şu an kayıtlı kur:{" "}
            <span className="font-mono">{s.kur.toLocaleString("tr-TR", { maximumFractionDigits: 6 })}</span> ≈ {paraFormat(tl, "TRY")}. Tedarikçi cari
            hesabına yazılan tutar ise alış faturasındaki kurla belirlenir.
          </p>
          <SonucluForm action={satinalmaSiparisiKurGuncelle} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="satinalmaSiparisiId" value={s.id} />
            <KurAlani sabitPb={pb} kurlar={kurlar} baslangicKur={s.kur} tutar={s.tutarNet} />
            <button type="submit" className="focus-ring bg-soguk text-white text-sm px-4 py-2 rounded-md font-medium hover:bg-soguk-dim">
              Kuru kaydet
            </button>
          </SonucluForm>
        </section>
      )}

      {s.notlar && <p className="text-sm text-metin/70 whitespace-pre-line bg-yuzey border border-hat rounded-lg p-4 mb-8">{s.notlar}</p>}

      {/* KALEMLER */}
      <h2 className="font-display font-medium text-metin mb-3">Kalemler</h2>
      <div className="bg-yuzey border border-hat rounded-lg overflow-x-auto mb-8">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="text-left text-xs text-metin/50 border-b border-hat">
              <th className="px-4 py-2.5 font-medium">Kod</th>
              <th className="px-4 py-2.5 font-medium">Açıklama</th>
              <th className="px-4 py-2.5 font-medium text-right">Miktar</th>
              <th className="px-4 py-2.5 font-medium text-right">Birim fiyat</th>
              <th className="px-4 py-2.5 font-medium text-right">İsk.</th>
              <th className="px-4 py-2.5 font-medium text-right">Tutar</th>
              <th className="px-4 py-2.5 font-medium text-right">Teslim alınan</th>
              <th className="px-4 py-2.5 font-medium text-right">Kalan</th>
            </tr>
          </thead>
          <tbody>
            {kalemler.map((k) => (
              <tr key={k.id} className="border-b border-hat last:border-0">
                <td className="px-4 py-2.5 font-mono text-xs whitespace-nowrap">
                  {k.kod || "—"}
                  {k.urun && (
                    <span className="block text-[10px] text-emerald-700" title={`Stok kartı: ${k.urun.ad}`}>
                      stok kartı ✓
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {k.aciklama}
                  {k.bolum && <span className="block text-[11px] text-metin/40">{k.bolum}</span>}
                </td>
                <td className="px-4 py-2.5 text-right font-mono whitespace-nowrap">{miktarYaz(k.adet, k.birim)}</td>
                <td className="px-4 py-2.5 text-right font-mono whitespace-nowrap">{paraFormat(k.birimFiyat, pb)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-xs">{k.iskontoYuzde ? `%${k.iskontoYuzde}` : "—"}</td>
                <td className="px-4 py-2.5 text-right font-mono whitespace-nowrap">{paraFormat(k.net, pb)}</td>
                <td className="px-4 py-2.5 text-right font-mono">{k.alinan || "—"}</td>
                <td className={`px-4 py-2.5 text-right font-mono ${k.kalan > 0 ? "text-sicak-dim" : "text-emerald-700"}`}>{k.kalan > 0 ? k.kalan : "✓"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8 print:hidden">
        {/* MAL KABUL */}
        <section className="bg-yuzey border border-hat rounded-lg p-5">
          <h2 className="font-display font-medium text-metin mb-1">Mal kabul</h2>
          <p className="text-xs text-metin/50 mb-4">Teslim alınan miktarları yazın. Ürün kodu stok kartıyla eşleşen kalemler stoğa girer.</p>
          {malKabulAcik ? (
            <SonucluForm action={malKabulEkle} temizle className="space-y-3">
              <input type="hidden" name="satinalmaSiparisiId" value={s.id} />
              <div className="space-y-2">
                {kalemler
                  .filter((k) => k.kalan > 0)
                  .map((k) => (
                    <div key={k.id} className="grid grid-cols-[1fr_96px] gap-2 items-center">
                      <label htmlFor={`m_${k.id}`} className="text-sm text-metin/80">
                        {k.aciklama}
                        <span className="block text-[11px] text-metin/50">Kalan: {miktarYaz(k.kalan, k.birim)}</span>
                      </label>
                      <input id={`m_${k.id}`} name={`miktar_${k.id}`} inputMode="decimal" placeholder="0" className="focus-ring border border-hat rounded-md px-2 py-1.5 text-sm text-right font-mono bg-white" />
                    </div>
                  ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-metin/60 mb-1">Teslim tarihi</label>
                  <input type="date" name="tarih" defaultValue={bugunIso()} className={kutu} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-metin/60 mb-1">İrsaliye no</label>
                  <input name="irsaliyeNo" maxLength={100} className={kutu} />
                </div>
              </div>
              <input name="not" maxLength={1000} placeholder="Not (hasar, eksik vb.)" className={kutu} />
              <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim disabled:opacity-60">
                Mal kabulü kaydet
              </button>
            </SonucluForm>
          ) : (
            <p className="text-sm text-metin/50">
              {s.durum === "TESLIM_ALINDI" ? "Bütün kalemler teslim alındı." : "Mal kabul yalnız onaylı siparişte yapılır."}
            </p>
          )}

          {s.malKabuller.length > 0 && (
            <div className="mt-5 pt-4 border-t border-hat space-y-3">
              {s.malKabuller.map((m) => (
                <div key={m.id} className={`text-sm ${m.iptalTarihi ? "text-metin/40" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className={m.iptalTarihi ? "line-through" : "font-medium"}>
                      {tarihYaz(m.tarih)}
                      {m.irsaliyeNo && ` · İrsaliye ${m.irsaliyeNo}`} · {m.olusturanAdi}
                    </p>
                    {yonetici && !m.iptalTarihi && (
                      <KayitIslemButonu
                        id={m.id}
                        action={malKabulIptal}
                        etiket="İptal et"
                        onayMesaji="Mal kabul iptal edilir; stoğa girmiş miktar düzeltme hareketiyle geri alınır."
                        nedenIste
                      />
                    )}
                  </div>
                  <ul className="text-xs text-metin/60 mt-0.5">
                    {m.kalemler.map((mk) => (
                      <li key={mk.id}>
                        {miktarYaz(mk.miktar, mk.kalem.birim)} · {mk.kalem.aciklama}
                      </li>
                    ))}
                  </ul>
                  {m.not && <p className="text-xs text-metin/50">Not: {m.not}</p>}
                  {m.iptalTarihi && (
                    <p className="text-xs">
                      İptal: {tarihYaz(m.iptalTarihi)} · {m.iptalEdenAdi} · {m.iptalNedeni}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ALIŞ FATURASI */}
        <section className="bg-yuzey border border-hat rounded-lg p-5">
          <h2 className="font-display font-medium text-metin mb-1">Alış faturası</h2>
          <p className="text-xs text-metin/50 mb-4">
            Tedarikçinin faturası buraya işlenince{" "}
            <Link href={`/panel/satinalma/cari?tedarikci=${s.tedarikci.id}`} className="text-soguk-dim hover:underline">
              tedarikçi cari hesabına
            </Link>{" "}
            borç olarak yazılır ve bu siparişe bağlanır.
          </p>
          {faturaAcik ? (
            <SonucluForm action={alisFaturasiEkle} temizle className="space-y-3">
              <input type="hidden" name="satinalmaSiparisiId" value={s.id} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-metin/60 mb-1">Fatura no</label>
                  <input name="faturaNo" required maxLength={100} className={kutu} />
                </div>
                {s.paraBirimi === "TRY" ? (
                  <div>
                    <label className="block text-xs font-medium text-metin/60 mb-1">Tutar (TL, KDV dahil)</label>
                    <input name="tutar" required inputMode="decimal" className={`${kutu} font-mono text-right`} />
                  </div>
                ) : (
                  <AlisFaturasiTutar pb={s.paraBirimi} kurlar={kurlar} kutu={kutu} />
                )}
                <div>
                  <label className="block text-xs font-medium text-metin/60 mb-1">Fatura tarihi</label>
                  <input type="date" name="tarih" defaultValue={bugunIso()} className={kutu} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-metin/60 mb-1">Vade (ops.)</label>
                  <input type="date" name="vadeTarihi" className={kutu} />
                </div>
              </div>
              <input type="file" name="evrak" accept="application/pdf,image/*" className="text-xs" />
              <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim disabled:opacity-60">
                Faturayı işle
              </button>
            </SonucluForm>
          ) : (
            <p className="text-sm text-metin/50">Fatura yalnız onaylı siparişe bağlanır.</p>
          )}

          {s.faturalar.length > 0 && (
            <div className="mt-5 pt-4 border-t border-hat space-y-2">
              {s.faturalar.map((f) => (
                <div key={f.id} className={`flex items-start justify-between gap-2 text-sm ${f.iptalTarihi ? "text-metin/40" : ""}`}>
                  <p className={f.iptalTarihi ? "line-through" : ""}>
                    {f.faturaNo ?? "—"} · {tarihYaz(f.tarih)}
                    {f.vadeTarihi && ` · vade ${tarihYaz(f.vadeTarihi)}`}
                    {f.evrakDosyaAdi && (
                      <a href={`/api/cari-evrak/${f.id}`} target="_blank" rel="noreferrer" className="ml-1 text-soguk-dim hover:underline" title="Fatura dosyası">
                        📎
                      </a>
                    )}
                    {f.iptalTarihi && <span className="block text-xs no-underline">İptal: {f.iptalNedeni}</span>}
                  </p>
                  <span className="font-mono whitespace-nowrap">
                    {paraFormat(f.tutar, "TRY")}
                    {f.dovizTutar != null && f.paraBirimi && f.kur != null && (
                      <span className="block text-[11px] text-metin/50 text-right">
                        {paraFormat(f.dovizTutar, f.paraBirimi)} × {f.kur.toLocaleString("tr-TR", { maximumFractionDigits: 6 })}
                      </span>
                    )}
                  </span>
                </div>
              ))}
              <p className="text-xs text-metin/50 pt-1">Faturayı düzeltmek / iptal etmek için tedarikçi cari hesabını kullanın (yalnız admin).</p>
            </div>
          )}
        </section>
      </div>

      {/* SATIŞ SİPARİŞİ BAĞLANTISI */}
      {s.durum !== "IPTAL" && s.durum !== "REDDEDILDI" && (
        <SonucluForm action={satinalmaSiparisiBagla} className="bg-yuzey border border-hat rounded-lg p-5 flex flex-wrap items-end gap-3 print:hidden">
          <input type="hidden" name="satinalmaSiparisiId" value={s.id} />
          <div className="flex-1 min-w-[260px]">
            <label className="block text-xs font-medium text-metin/60 mb-1">Bu alımın maliyeti hangi satış siparişine yazılsın?</label>
            <select name="siparisId" defaultValue={s.siparisId ?? ""} className={kutu}>
              <option value="">— Bağlı değil (stok / genel alım) —</option>
              {satisSiparisleri.map((o) => (
                <option key={o.id} value={o.id}>
                  {teklifNoYaz(o.teklif.teklifNo)} · {o.teklif.baslik || "(başlıksız)"} · {o.musteri.ad}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="focus-ring border border-hat px-4 py-2 rounded-md text-sm font-medium hover:bg-hat disabled:opacity-60">
            Kaydet
          </button>
        </SonucluForm>
      )}
    </div>
  );
}
