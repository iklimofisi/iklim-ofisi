import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { suankiKullanici, sayfaYetkisi } from "@/lib/oturum";
import { getTcmbKurlari } from "@/lib/kur";
import { paraFormat } from "@/lib/para";
import { satinalmaSiparisiOlustur, satinalmaOnayEsigiKaydet } from "@/lib/satinalma-siparis-actions";
import { SAS_DURUM_ETIKET, SAS_DURUM_RENK, sasNo, sasTl, teslimAlinan, maliyeteSayilirMi } from "@/lib/satinalma-siparis";
import SonucluForm from "@/components/SonucluForm";
import SatinalmaSiparisKalemleri, { type BaslangicKalemi } from "@/components/SatinalmaSiparisKalemleri";
import KurAlani from "@/components/KurAlani";

export const dynamic = "force-dynamic";

// -----------------------------------------------------------------------------
// SATINALMA SİPARİŞLERİ (tedarikçiye verilen siparişler)
// ?teklif=<tedarikçi teklifi>  → form o teklifin kalemleriyle dolu açılır
// ?siparis=<satış siparişi>    → form o satış siparişine bağlı açılır
// ?durum=acik|onay|teslim|iptal → liste süzgeci
// -----------------------------------------------------------------------------
const SUZGECLER: { anahtar: string; etiket: string; durumlar?: string[] }[] = [
  { anahtar: "acik", etiket: "Açık", durumlar: ["ONAY_BEKLIYOR", "ONAYLANDI", "KISMEN_TESLIM"] },
  { anahtar: "onay", etiket: "Onay bekleyen", durumlar: ["ONAY_BEKLIYOR"] },
  { anahtar: "teslim", etiket: "Teslim alınan", durumlar: ["TESLIM_ALINDI"] },
  { anahtar: "iptal", etiket: "İptal / red", durumlar: ["IPTAL", "REDDEDILDI"] },
  { anahtar: "tum", etiket: "Tümü" },
];

const teklifNoYaz = (n: number) => `TKL-${String(n).padStart(4, "0")}`;

export default async function SatinalmaSiparisleriSayfasi({ searchParams }: { searchParams?: { teklif?: string; siparis?: string; durum?: string; yeni?: string } }) {
  await sayfaYetkisi("satinalma");
  const giren = await suankiKullanici();
  const yonetici = giren?.rol === "ADMIN";
  const suzgec = SUZGECLER.find((s) => s.anahtar === searchParams?.durum) ?? SUZGECLER[0];

  const [siparisler, tedarikciler, satisSiparisleri, projeler, ayar, kurlar, kaynakTeklif, kaynakSiparis] = await Promise.all([
    prisma.satinalmaSiparisi.findMany({
      where: suzgec.durumlar ? { durum: { in: suzgec.durumlar } } : {},
      include: {
        tedarikci: { select: { ad: true } },
        siparis: { select: { id: true, teklif: { select: { teklifNo: true, baslik: true } }, musteri: { select: { ad: true } } } },
        kalemler: { select: { adet: true, malKabulKalemleri: { select: { miktar: true, malKabul: { select: { iptalTarihi: true } } } } } },
        faturalar: { where: { iptalTarihi: null }, select: { tutar: true } },
      },
      orderBy: { no: "desc" },
      take: 300,
    }),
    prisma.tedarikci.findMany({ select: { id: true, ad: true }, orderBy: { ad: "asc" } }),
    prisma.siparis.findMany({
      where: { durum: { notIn: ["IPTAL", "REDDEDILDI"] } },
      select: { id: true, teklif: { select: { teklifNo: true, baslik: true } }, musteri: { select: { ad: true } } },
      orderBy: { olusturmaTarihi: "desc" },
      take: 300,
    }),
    prisma.proje.findMany({ select: { id: true, ad: true }, orderBy: { olusturmaTarihi: "desc" }, take: 300 }),
    prisma.sirketAyarlari.findUnique({ where: { id: "default" }, select: { satinalmaOnayEsigi: true } }).catch(() => null),
    getTcmbKurlari(),
    searchParams?.teklif
      ? prisma.satinalmaTeklifi.findUnique({ where: { id: searchParams.teklif }, include: { kalemler: true, tedarikci: { select: { ad: true } } } })
      : null,
    searchParams?.siparis
      ? prisma.siparis.findUnique({
          where: { id: searchParams.siparis },
          select: {
            id: true,
            paraBirimi: true,
            kalemlerJson: true,
            teklif: {
              select: {
                baslik: true,
                projeId: true,
                paraBirimi: true,
                kalemler: { orderBy: [{ sira: "asc" }, { id: "asc" }], select: { bolum: true, aciklama: true, adet: true, birim: true } },
              },
            },
          },
        })
      : null,
  ]);

  const esik = ayar?.satinalmaOnayEsigi ?? null;
  const formAcik = !!(kaynakTeklif || kaynakSiparis || searchParams?.yeni);

  // Tedarikçi teklifinden gelen kalemler (alış iskontosu kalemlere iskonto olarak geçer)
  const baslangicKalemleri: BaslangicKalemi[] | undefined = kaynakTeklif?.kalemler.length
    ? kaynakTeklif.kalemler.map((k) => ({
        aciklama: k.aciklama,
        adet: k.adet,
        birimFiyat: k.birimFiyat,
        iskontoYuzde: kaynakTeklif.alisIskontoYuzde ?? 0,
        bolum: k.bolum,
      }))
    : undefined;
  // Satış siparişinden açılırken: siparişin (dondurulmuş) kalemleri adet ve birimiyle gelir; alış fiyatı
  // satış fiyatından farklı olduğu için fiyatlar boş gelir (her kalemin alış fiyatı yazılmadan sipariş açılmaz).
  // İşçilik / montaj gibi tedarikçiden alınmayan satırlar formda silinir.
  const siparisKalemleri = (() => {
    if (!kaynakSiparis || kaynakTeklif) return undefined;
    let liste: { bolum?: string | null; aciklama: string; adet: number; birim?: string | null }[] = kaynakSiparis.teklif.kalemler;
    if (kaynakSiparis.kalemlerJson) {
      try {
        const j = JSON.parse(kaynakSiparis.kalemlerJson);
        if (Array.isArray(j) && j.length) liste = j;
      } catch {
        /* bozuk kayıt: teklifin kalemleri kullanılır */
      }
    }
    return liste
      .filter((k) => k && typeof k.aciklama === "string" && k.aciklama.trim() && Number(k.adet) > 0)
      .slice(0, 500)
      .map((k) => ({ aciklama: k.aciklama, adet: Number(k.adet), birim: k.birim ?? "Adet", birimFiyat: 0, bolum: k.bolum ?? null }));
  })();
  const baslangicPb = kaynakTeklif?.paraBirimi ?? kaynakSiparis?.paraBirimi ?? kaynakSiparis?.teklif.paraBirimi ?? "TRY";

  const kutu = "focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white";

  return (
    <div>
      <Link href="/panel/satinalma" className="focus-ring text-sm text-metin/60 hover:text-metin mb-6 inline-block">
        ← Satınalma
      </Link>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Satınalma</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">Satınalma Siparişleri</h1>
      <p className="text-sm text-metin/60 mb-6 max-w-3xl">
        Tedarikçiye verilen siparişler. Sipariş onaylanınca teslim alınan mal &quot;Mal kabul&quot; ile işlenir (ürün kodu stok kartıyla eşleşen kalemler
        stoğa girer), tedarikçinin faturası siparişe bağlanarak tedarikçi cari hesabına borç yazılır. Satış siparişine bağlanan satınalmalar o
        siparişin gerçek maliyetini ve brüt kârını gösterir. Kayıtlar silinmez, iptal edilir.
      </p>

      {/* YENİ SİPARİŞ */}
      <details open={formAcik} id="yeni" className="bg-yuzey border border-hat rounded-lg mb-8 group">
        <summary className="cursor-pointer select-none px-5 py-4 text-sm font-semibold text-metin flex items-center justify-between">
          + Yeni satınalma siparişi
          {kaynakTeklif && <span className="text-xs font-normal text-metin/60">Kaynak: {kaynakTeklif.tedarikci.ad} · {kaynakTeklif.baslik}</span>}
        </summary>
        <SonucluForm action={satinalmaSiparisiOlustur} className="px-5 pb-5 space-y-4">
          {kaynakTeklif && <input type="hidden" name="satinalmaTeklifiId" value={kaynakTeklif.id} />}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-metin/60 mb-1">Başlık</label>
              <input
                name="baslik"
                required
                maxLength={200}
                defaultValue={kaynakTeklif?.baslik ?? kaynakSiparis?.teklif.baslik ?? ""}
                placeholder="Örn: Villa projesi dış üniteler"
                className={kutu}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Tedarikçi</label>
              <select name="tedarikciId" required defaultValue={kaynakTeklif?.tedarikciId ?? ""} className={kutu}>
                <option value="">Seçin…</option>
                {tedarikciler.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.ad}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">Para birimi</label>
                <select name="paraBirimi" defaultValue={baslangicPb} className={kutu}>
                  <option value="TRY">TRY</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <KurAlani baslangicPb={baslangicPb} kurlar={kurlar ? { USD: kurlar.doviz?.USD ?? kurlar.USD, EUR: kurlar.doviz?.EUR ?? kurlar.EUR } : null} />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-metin/60 mb-1">Satış siparişi (maliyetin yazılacağı iş · isteğe bağlı)</label>
              <select name="siparisId" defaultValue={kaynakSiparis?.id ?? ""} className={kutu}>
                <option value="">— Bağlı değil (stok / genel alım) —</option>
                {satisSiparisleri.map((s) => (
                  <option key={s.id} value={s.id}>
                    {teklifNoYaz(s.teklif.teklifNo)} · {s.teklif.baslik || "(başlıksız)"} · {s.musteri.ad}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Proje (isteğe bağlı)</label>
              <select name="projeId" defaultValue={kaynakSiparis?.teklif.projeId ?? ""} className={kutu}>
                <option value="">—</option>
                {projeler.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.ad}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Beklenen teslim tarihi</label>
              <input type="date" name="beklenenTeslimTarihi" className={kutu} />
            </div>
          </div>

          {siparisKalemleri?.length ? (
            <p className="text-xs text-metin/60 bg-soguk-light border border-soguk/20 rounded-md px-3 py-2">
              Satış siparişinin {siparisKalemleri.length} kalemi adet ve birimiyle getirildi. Her kalemin <strong>alış fiyatını</strong> yazın; tedarikçiden
              alınmayan satırları (işçilik, montaj vb.) silin.
            </p>
          ) : null}
          <SatinalmaSiparisKalemleri baslangic={baslangicKalemleri ?? siparisKalemleri} />

          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Not (ödeme / teslim şartları)</label>
            <textarea name="notlar" rows={2} maxLength={2000} className={kutu} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-metin/50">
              {esik != null
                ? `Onay eşiği: ${paraFormat(esik, "TRY")} (KDV hariç). Üstündeki siparişler admin onayı bekler.`
                : "Onay eşiği tanımlı değil: admin'in açtıkları dışındaki siparişler admin onayı bekler."}
            </p>
            <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors disabled:opacity-60">
              Siparişi aç
            </button>
          </div>
        </SonucluForm>
      </details>

      {/* SÜZGEÇ */}
      <div className="flex flex-wrap gap-2 mb-4">
        {SUZGECLER.map((s) => (
          <Link
            key={s.anahtar}
            href={`/panel/satinalma/siparisler?durum=${s.anahtar}`}
            className={`focus-ring text-xs px-3 py-1.5 rounded-full border ${s.anahtar === suzgec.anahtar ? "bg-soguk text-white border-soguk" : "border-hat text-metin/70 hover:bg-hat"}`}
          >
            {s.etiket}
          </Link>
        ))}
      </div>

      {/* LİSTE */}
      <div className="bg-yuzey border border-hat rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="text-left text-xs text-metin/50 border-b border-hat">
              <th className="px-4 py-3 font-medium">No</th>
              <th className="px-4 py-3 font-medium">Tarih</th>
              <th className="px-4 py-3 font-medium">Tedarikçi · Başlık</th>
              <th className="px-4 py-3 font-medium">Satış siparişi</th>
              <th className="px-4 py-3 font-medium text-right">Tutar (KDV hariç)</th>
              <th className="px-4 py-3 font-medium text-right">Teslim</th>
              <th className="px-4 py-3 font-medium text-right">Fatura (TL)</th>
              <th className="px-4 py-3 font-medium">Durum</th>
            </tr>
          </thead>
          <tbody>
            {siparisler.map((s) => {
              const adet = s.kalemler.reduce((a, k) => a + k.adet, 0);
              const alinan = s.kalemler.reduce((a, k) => a + teslimAlinan(k), 0);
              const fatura = s.faturalar.reduce((a, f) => a + f.tutar, 0);
              const iptal = !maliyeteSayilirMi(s.durum);
              return (
                <tr key={s.id} className={`border-b border-hat last:border-0 ${iptal ? "text-metin/40" : ""}`}>
                  <td className="px-4 py-3 font-mono whitespace-nowrap">
                    <Link href={`/panel/satinalma/siparisler/${s.id}`} className="text-soguk-dim hover:underline">
                      {sasNo(s.no)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{s.olusturmaTarihi.toLocaleDateString("tr-TR")}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{s.tedarikci.ad}</p>
                    <p className="text-xs text-metin/50">{s.baslik}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {s.siparis ? (
                      <Link href={`/panel/siparisler/${s.siparis.id}`} className="text-soguk-dim hover:underline">
                        {teklifNoYaz(s.siparis.teklif.teklifNo)} · {s.siparis.musteri.ad}
                      </Link>
                    ) : (
                      <span className="text-metin/40">—</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono whitespace-nowrap ${iptal ? "line-through" : ""}`}>
                    {paraFormat(s.tutarNet, s.paraBirimi)}
                    {s.paraBirimi !== "TRY" && <span className="block text-[11px] text-metin/50">≈ {paraFormat(sasTl(s), "TRY")}</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs whitespace-nowrap">{adet > 0 ? `%${Math.round((alinan / adet) * 100)}` : "—"}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs whitespace-nowrap">{fatura > 0 ? paraFormat(fatura, "TRY") : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full border whitespace-nowrap ${SAS_DURUM_RENK[s.durum] ?? ""}`}>{SAS_DURUM_ETIKET[s.durum] ?? s.durum}</span>
                  </td>
                </tr>
              );
            })}
            {siparisler.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-metin/50">
                  Bu süzgeçte satınalma siparişi yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ONAY EŞİĞİ (admin) */}
      {yonetici && (
        <SonucluForm action={satinalmaOnayEsigiKaydet} className="mt-8 bg-yuzey border border-hat rounded-lg p-5 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Onay eşiği (TL, KDV hariç)</label>
            <input
              name="esik"
              inputMode="decimal"
              defaultValue={esik != null ? String(esik).replace(".", ",") : ""}
              placeholder="Boş = her sipariş onaya düşer"
              className="focus-ring w-56 border border-hat rounded-md px-3 py-2 text-sm font-mono"
            />
          </div>
          <button type="submit" className="focus-ring border border-hat px-4 py-2 rounded-md text-sm font-medium hover:bg-hat disabled:opacity-60">
            Eşiği kaydet
          </button>
          <p className="text-xs text-metin/50 basis-full">
            Personelin açtığı ve TL karşılığı bu tutarı aşmayan siparişler kendiliğinden onaylanır; aşanlar admin onayına düşer. Admin'in
            açtığı siparişler doğrudan onaylıdır.
          </p>
        </SonucluForm>
      )}
    </div>
  );
}
