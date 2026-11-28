import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { suankiKullanici, sayfaYetkisi } from "@/lib/oturum";
import { paraFormat } from "@/lib/para";
import { finansYetkilisiMi } from "@/lib/roller";
import { aylikOzet, alacakYaslandirma, aySiniri, donemAnahtari, donemAdi, gecerliDonem, sonAylar, YAS_DILIMLERI, type AylikOzet } from "@/lib/finans";
import { donemKapat, donemAc } from "@/lib/finans-actions";
import KayitIslemButonu from "@/components/KayitIslemButonu";
import YazdirButon from "@/components/YazdirButon";
import SayfaSekmeleri from "@/components/SayfaSekmeleri";
import { raporSekmeleri } from "@/lib/rapor-sekmeleri";

export const dynamic = "force-dynamic";

// -----------------------------------------------------------------------------
// YATIRIMCI RAPORU (aylık)
// Kapalı ayların rakamları kapanış anında saklanan özetten gelir (resmî rakam);
// açık ayınki canlı hesaplanır. ?ay=2026-11
// -----------------------------------------------------------------------------
const tl = (n: number) => paraFormat(n, "TRY");
const yuzde = (pay: number, payda: number) => (payda > 0 ? `%${((pay / payda) * 100).toFixed(1).replace(".", ",")}` : "—");

function ozetOku(json: string | null): AylikOzet | null {
  if (!json) return null;
  try {
    const o = JSON.parse(json);
    return o && typeof o.ciro === "number" ? (o as AylikOzet) : null;
  } catch {
    return null;
  }
}

export default async function RaporSayfasi({ searchParams }: { searchParams?: { ay?: string } }) {
  await sayfaYetkisi("finans");
  const giren = await suankiKullanici();
  const buAy = donemAnahtari(new Date());
  const ay = gecerliDonem(searchParams?.ay) ?? buAy;
  const aylar = sonAylar(ay, 6);
  const oncekiAy = sonAylar(ay, 2)[0];
  const sonraki = (() => {
    const [y, m] = ay.split("-").map(Number);
    const d = new Date(Date.UTC(y, m, 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  })();

  const kapanislar = await prisma.donemKapanis.findMany({ where: { donem: { in: aylar } } }).catch(() => []);
  const kapanisMap = new Map(kapanislar.map((k) => [k.donem, k]));
  const resmi = (d: string) => {
    const k = kapanisMap.get(d);
    return k && !k.acikMi ? ozetOku(k.ozetJson) : null;
  };

  // Trend: kapalı aylar saklanan özetten, diğerleri canlı
  const ozetler = await Promise.all(aylar.map(async (d) => resmi(d) ?? (await aylikOzet(d))));
  const o = ozetler[ozetler.length - 1];
  const kapanis = kapanisMap.get(ay);
  const kapali = !!kapanis && !kapanis.acikMi;

  const { son } = aySiniri(ay);
  const itibariyle = son < new Date() ? son : new Date();
  const yas = await alacakYaslandirma(itibariyle);
  const yasToplam = yas.toplam.reduce((a, x) => a + x, 0);

  const finansci = finansYetkilisiMi(giren?.rol);
  const yonetici = giren?.rol === "ADMIN";

  const kart = (baslik: string, deger: string, alt?: string) => (
    <div className="bg-yuzey border border-hat rounded-lg p-4">
      <p className="text-xs text-metin/50 mb-1">{baslik}</p>
      <p className="font-mono text-lg text-metin">{deger}</p>
      {alt && <p className="text-[11px] text-metin/50 mt-1">{alt}</p>}
    </div>
  );

  return (
    <div>
      <div className="print:hidden">
        <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Finans</p>
        <h1 className="font-display text-2xl font-semibold text-metin mb-4">Raporlar</h1>
        <SayfaSekmeleri etiket="Rapor sayfaları" aktif="aylik" sekmeler={raporSekmeleri(giren?.rol)} />
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-xl font-semibold text-metin">Aylık rapor · {donemAdi(ay)}</h2>
          <p className="text-sm text-metin/60 mt-1">
            {kapali
              ? `Kapalı dönem · ${kapanis!.kapatanAdi} · ${kapanis!.kapanisTarihi.toLocaleDateString("tr-TR")} (rakamlar kapanış anındaki değerlerdir)`
              : ay === buAy
                ? "Açık dönem · rakamlar canlıdır, ay kapanınca sabitlenir"
                : "Açık dönem · bu ay henüz kapatılmadı, rakamlar canlıdır"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Link href={`/panel/rapor?ay=${oncekiAy}`} className="focus-ring text-sm border border-hat rounded-md px-3 py-1.5 hover:bg-hat">
            ← {donemAdi(oncekiAy)}
          </Link>
          {ay < buAy && (
            <Link href={`/panel/rapor?ay=${sonraki}`} className="focus-ring text-sm border border-hat rounded-md px-3 py-1.5 hover:bg-hat">
              {donemAdi(sonraki)} →
            </Link>
          )}
          <a href={`/api/export/rapor?ay=${ay}`} className="focus-ring text-sm border border-hat rounded-md px-3 py-1.5 hover:bg-hat">
            Excel (CSV)
          </a>
          <YazdirButon />
        </div>
      </div>

      {/* DÖNEM KAPANIŞI */}
      {(finansci || kapanis) && (
        <div className="bg-yuzey border border-hat rounded-lg p-4 mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <p className="text-sm text-metin/70">
            {kapali ? (
              <>🔒 {donemAdi(ay)} kapalı: bu aya tarihli cari / tedarikçi hareketi ve alış faturası eklenemez, iptal edilemez.</>
            ) : kapanis?.acikMi ? (
              <>
                🔓 Yeniden açıldı · {kapanis.acanAdi} · {kapanis.acilisTarihi?.toLocaleDateString("tr-TR")} · Neden: {kapanis.acilisNedeni}
              </>
            ) : (
              <>Ay kapanınca bu ayın finansal kayıtları kilitlenir ve rakamlar yönetim raporu için sabitlenir.</>
            )}
          </p>
          {finansci && !kapali && ay <= buAy && (
            <KayitIslemButonu
              id={ay}
              action={donemKapat}
              etiket={`${donemAdi(ay)} dönemini kapat`}
              onayBasligi="Ay kapanışı"
              onayMesaji={`${donemAdi(ay)} kapatılsın mı? Bu aya tarihli finansal kayıtlar kilitlenir; rakamlar rapor için saklanır. Yeniden açmayı yalnız satış müdürü yapabilir.`}
              className="focus-ring text-sm font-medium text-white bg-soguk hover:bg-soguk-dim rounded-md px-4 py-2 disabled:opacity-50"
            />
          )}
          {yonetici && kapali && (
            <KayitIslemButonu id={ay} action={donemAc} etiket="Dönemi yeniden aç" onayMesaji="Açma nedeni kaydedilir." nedenIste nedenEtiketi="Açma nedeni" />
          )}
        </div>
      )}

      {/* ANA RAKAMLAR */}
      <h2 className="font-display font-medium text-metin mb-3">Ayın rakamları</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kart("Ciro (onaylanan siparişler)", tl(o.ciro), `${o.siparisSayisi} sipariş · TL, KDV hariç`)}
        {kart(
          "Brüt kâr (maliyeti bağlı siparişler)",
          tl(o.brutKar),
          o.maliyetliSiparisSayisi
            ? `${o.maliyetliSiparisSayisi}/${o.siparisSayisi} siparişin maliyeti bağlı · marj ${yuzde(o.brutKar, o.maliyetliCiro)}`
            : "Bu ay satınalması bağlanmış sipariş yok"
        )}
        {kart("Tahsilat", tl(o.tahsilat), `Müşterilere borç yazılan: ${tl(o.musteriBorclandirma)}`)}
        {kart("Tedarikçi ödemeleri", tl(o.tedarikciOdemeleri), `Alış faturaları: ${tl(o.aliFaturalari)}`)}
        {kart("Müşteri alacağı (ay sonu)", tl(o.alacakBakiyesi), "Cari bakiye, KDV dahil")}
        {kart("Tedarikçi borcu (ay sonu)", tl(o.borcBakiyesi), "Cari bakiye, KDV dahil")}
        {kart("Verilen satınalma siparişleri", tl(o.satinalmaTutari), "TL, KDV hariç")}
        {kart("Teklifler", `${o.teklifSayisi}`, `Kazanılan ${o.kazanilanTeklif} · kaybedilen ${o.kaybedilenTeklif}`)}
      </div>

      {/* SON 6 AY */}
      <h2 className="font-display font-medium text-metin mb-3">Son 6 ay</h2>
      <div className="bg-yuzey border border-hat rounded-lg overflow-x-auto mb-8">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="text-left text-xs text-metin/50 border-b border-hat">
              <th className="px-4 py-2.5 font-medium">Ay</th>
              <th className="px-4 py-2.5 font-medium text-right">Ciro</th>
              <th className="px-4 py-2.5 font-medium text-right">Brüt kâr</th>
              <th className="px-4 py-2.5 font-medium text-right">Tahsilat</th>
              <th className="px-4 py-2.5 font-medium text-right">Alış faturaları</th>
              <th className="px-4 py-2.5 font-medium text-right">Tedarikçi ödemesi</th>
              <th className="px-4 py-2.5 font-medium text-right">Alacak (ay sonu)</th>
              <th className="px-4 py-2.5 font-medium text-center">Dönem</th>
            </tr>
          </thead>
          <tbody>
            {ozetler.map((x) => {
              const k = kapanisMap.get(x.donem);
              const enBuyuk = Math.max(...ozetler.map((z) => z.ciro), 1);
              return (
                <tr key={x.donem} className={`border-b border-hat last:border-0 ${x.donem === ay ? "bg-soguk-light/40" : ""}`}>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <Link href={`/panel/rapor?ay=${x.donem}`} className="text-soguk-dim hover:underline">
                      {donemAdi(x.donem)}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono whitespace-nowrap">
                    {tl(x.ciro)}
                    <span className="block h-1 mt-1 bg-soguk/60 rounded ml-auto" style={{ width: `${Math.round((x.ciro / enBuyuk) * 100)}%` }} />
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono whitespace-nowrap">{x.maliyetliSiparisSayisi ? tl(x.brutKar) : "—"}</td>
                  <td className="px-4 py-2.5 text-right font-mono whitespace-nowrap">{tl(x.tahsilat)}</td>
                  <td className="px-4 py-2.5 text-right font-mono whitespace-nowrap">{tl(x.aliFaturalari)}</td>
                  <td className="px-4 py-2.5 text-right font-mono whitespace-nowrap">{tl(x.tedarikciOdemeleri)}</td>
                  <td className="px-4 py-2.5 text-right font-mono whitespace-nowrap">{tl(x.alacakBakiyesi)}</td>
                  <td className="px-4 py-2.5 text-center text-xs">{k && !k.acikMi ? "🔒 kapalı" : "açık"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ALACAK YAŞLANDIRMA */}
      <h2 className="font-display font-medium text-metin mb-1">Alacak yaşlandırma</h2>
      <p className="text-xs text-metin/50 mb-3">
        {itibariyle.toLocaleDateString("tr-TR")} itibarıyla. Tahsilatlar en eski borçtan düşülür; kalan borçlar tarihine (vadesi varsa vadesine) göre yaşlandırılır.
      </p>
      <div className="bg-yuzey border border-hat rounded-lg overflow-x-auto mb-4">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-xs text-metin/50 border-b border-hat">
              <th className="px-4 py-2.5 font-medium">Müşteri</th>
              <th className="px-4 py-2.5 font-medium text-right">Bakiye</th>
              {YAS_DILIMLERI.map((d) => (
                <th key={d} className="px-4 py-2.5 font-medium text-right">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {yas.satirlar.slice(0, 50).map((s) => (
              <tr key={s.musteriId} className="border-b border-hat last:border-0">
                <td className="px-4 py-2 print:py-1">
                  <Link href={`/panel/musteriler/${s.musteriId}`} className="text-soguk-dim hover:underline">
                    {s.ad}
                  </Link>
                </td>
                <td className="px-4 py-2 text-right font-mono whitespace-nowrap">{tl(s.bakiye)}</td>
                {s.dilimler.map((x, i) => (
                  <td key={i} className={`px-4 py-2 text-right font-mono whitespace-nowrap ${x > 0 && i >= 2 ? "text-sicak-dim font-semibold" : x > 0 ? "" : "text-metin/30"}`}>
                    {x > 0 ? tl(x) : "—"}
                  </td>
                ))}
              </tr>
            ))}
            {yas.satirlar.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-metin/50">
                  Açık müşteri alacağı yok.
                </td>
              </tr>
            )}
          </tbody>
          {yas.satirlar.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-hat font-semibold">
                <td className="px-4 py-2.5">Toplam{yas.satirlar.length > 50 ? ` (${yas.satirlar.length} müşteri; ilk 50 gösteriliyor)` : ""}</td>
                <td className="px-4 py-2.5 text-right font-mono whitespace-nowrap">{tl(yasToplam)}</td>
                {yas.toplam.map((x, i) => (
                  <td key={i} className="px-4 py-2.5 text-right font-mono whitespace-nowrap">
                    {tl(x)}
                    <span className="block text-[10px] font-normal text-metin/50">{yuzde(x, yasToplam)}</span>
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {yas.fazlaTahsilat > 0.005 && <p className="text-xs text-metin/50 mb-8">Borcundan fazla ödeme yapan müşterilerin alacak (avans) toplamı: {tl(yas.fazlaTahsilat)}</p>}

      <div className="text-[11px] text-metin/50 space-y-1 mt-8 border-t border-hat pt-4">
        <p>
          <b>Ciro:</b> ay içinde onaylanan (iptal / red olmayan) satış siparişlerinin, siparişte sabitlenen KDV hariç tutarı; döviz tutarlar sipariş kuruyla TL&apos;ye
          çevrilir.
        </p>
        <p>
          <b>Brüt kâr:</b> yalnız satınalma siparişi bağlanmış satış siparişleri için ciro − satınalma tutarı (KDV hariç). Montaj, işçilik ve genel giderler dahil değildir.
        </p>
        <p>
          <b>Tahsilat / ödemeler / bakiyeler:</b> iptal edilmemiş cari ve tedarikçi hareketleri (TL, kayıtlarda olduğu gibi KDV dahil).
        </p>
      </div>
    </div>
  );
}
