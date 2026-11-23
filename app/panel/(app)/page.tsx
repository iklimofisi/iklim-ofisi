import { prisma } from "@/lib/prisma";
import { GERCEK_MUSTERI } from "@/lib/musterisiz";
import Link from "next/link";
import { teklifToplamlari, tarihYaz } from "@/lib/teklif-hesap";
import { siparisNetTutari } from "@/lib/siparis-tutari";
import SatisPaneli, { DONEMLER, type Donem } from "@/components/SatisPaneli";
import { sayfaYetkisi } from "@/lib/oturum";
import { gorebilir } from "@/lib/roller";

export const dynamic = "force-dynamic";

function paraFormat(n: number, paraBirimi: string = "TRY") {
  return n.toLocaleString("tr-TR", { style: "currency", currency: paraBirimi });
}

export default async function PanelOzet({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const giren = await sayfaYetkisi("ozet");
  // Özet, kullanıcının rolüne göre: her kutu yalnız o bölümü görebilene gösterilir
  const gor = {
    crm: gorebilir(giren.rol, "crm"),
    teklif: gorebilir(giren.rol, "teklif"),
    musteri: gorebilir(giren.rol, "musteri"),
    siparis: gorebilir(giren.rol, "siparis"),
    satinalma: gorebilir(giren.rol, "satinalma"),
    finans: gorebilir(giren.rol, "finans"),
  };
  const yetkiYok = searchParams?.yetki === "yok";
  const donemGirdi = searchParams?.donem;
  const donemKodu = Array.isArray(donemGirdi) ? donemGirdi[0] : donemGirdi;
  const donem: Donem = DONEMLER.some((d) => d.kod === donemKodu) ? (donemKodu as Donem) : "3ay";

  const ayBasi = new Date();
  ayBasi.setDate(1);
  ayBasi.setHours(0, 0, 0, 0);

  const bugunSonu = new Date();
  bugunSonu.setHours(23, 59, 59, 999);

  const [
    musteriSayisi,
    bekleyenTeklif,
    onayBekleyenSiparis,
    cariHareketler,
    musteriler,
    sonTeklifler,
    buAyOnaylananSiparisler,
    sonTalepler,
    gelenHatirlatmalar,
    satinalmaDurumlari,
  ] = await Promise.all([
    prisma.musteri.count({ where: GERCEK_MUSTERI }),
    prisma.teklif.count({ where: { durum: "BEKLEMEDE", arsivTarihi: null } }),
    prisma.siparis.count({ where: { durum: "ONAY_BEKLIYOR" } }),
    // İptal edilen finansal hareketler bakiyelere girmez
    prisma.cariHareket.findMany({ where: { iptalTarihi: null } }),
    prisma.musteri.findMany({ where: GERCEK_MUSTERI, include: { cariHareketler: { where: { iptalTarihi: null } } } }),
    prisma.teklif.findMany({
      where: { arsivTarihi: null },
      include: { musteri: true, kalemler: true },
      orderBy: { tarih: "desc" },
      take: 5,
    }),
    prisma.siparis.findMany({
      where: { onayTarihi: { gte: ayBasi }, durum: { notIn: ["REDDEDILDI", "IPTAL"] } },
      include: { teklif: { include: { kalemler: true } } },
    }),
    prisma.webTalebi.findMany({ where: { okundu: false }, orderBy: { tarih: "desc" }, take: 3 }),
    prisma.ziyaret.findMany({
      where: { hatirlatmaTamam: false, hatirlatmaTarihi: { lte: bugunSonu, not: null } },
      include: { musteri: true, proje: true },
      orderBy: { hatirlatmaTarihi: "asc" },
      take: 5,
    }),
    // Satınalma özeti (tablo henüz yoksa boş)
    gor.satinalma
      ? prisma.satinalmaSiparisi.groupBy({ by: ["durum"], _count: { _all: true } }).catch(() => [] as { durum: string; _count: { _all: number } }[])
      : Promise.resolve([] as { durum: string; _count: { _all: number } }[]),
  ]);
  const sasSay = (...d: string[]) => satinalmaDurumlari.filter((x) => d.includes(x.durum)).reduce((a, x) => a + x._count._all, 0);

  const toplamBorc = cariHareketler.filter((c) => c.tur === "BORC").reduce((a, c) => a + c.tutar, 0);
  const toplamAlacak = cariHareketler.filter((c) => c.tur === "ALACAK").reduce((a, c) => a + c.tutar, 0);
  const bekleyenTahsilat = toplamBorc - toplamAlacak;

  const buAyCiro = buAyOnaylananSiparisler.reduce((a, s) => {
    // Siparişin dondurulmuş tutarı (teklif sonradan değişse de ciro değişmez)
    const toplam = siparisNetTutari(s);
    const kdvli = s.teklif.kdvDahil ? toplam : toplam * (1 + s.teklif.kdvOrani / 100);
    const tl = (s.paraBirimi ?? s.teklif.paraBirimi) === "TRY" ? kdvli : kdvli * s.kur;
    return a + tl;
  }, 0);

  const enBorcluMusteriler = musteriler
    .map((m) => ({
      ad: m.ad,
      id: m.id,
      bakiye: m.cariHareketler.reduce((a, c) => a + (c.tur === "BORC" ? c.tutar : -c.tutar), 0),
    }))
    .filter((m) => m.bakiye > 0)
    .sort((a, b) => b.bakiye - a.bakiye)
    .slice(0, 5);

  const kartlar: { baslik: string; deger: string; vurgu?: boolean; href?: string }[] = [
    ...(gor.musteri ? [{ baslik: "Müşteri Sayısı", deger: musteriSayisi.toString() }] : []),
    ...(gor.finans
      ? [
          { baslik: "Bu Ay Onaylanan Sipariş Cirosu", deger: paraFormat(buAyCiro) },
          { baslik: "Bekleyen Tahsilat", deger: paraFormat(bekleyenTahsilat), vurgu: bekleyenTahsilat > 0 },
        ]
      : []),
    ...(gor.teklif ? [{ baslik: "Teklif Bekleyen", deger: bekleyenTeklif.toString() }] : []),
    ...(gor.satinalma
      ? [
          { baslik: "Onay Bekleyen Satınalma", deger: sasSay("ONAY_BEKLIYOR").toString(), vurgu: sasSay("ONAY_BEKLIYOR") > 0, href: "/panel/satinalma/siparisler" },
          { baslik: "Teslim Bekleyen Satınalma", deger: sasSay("ONAYLANDI", "KISMEN_TESLIM").toString(), href: "/panel/satinalma/siparisler" },
        ]
      : []),
  ];

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-8">Genel Özet</h1>

      {yetkiYok && (
        <p className="bg-sicak-light border border-sicak/30 text-sicak-dim text-sm rounded-lg p-4 mb-4">
          Açmak istediğiniz sayfa için yetkiniz yok. Gerekirse admin ile görüşün.
        </p>
      )}

      {gor.siparis && onayBekleyenSiparis > 0 && (
        <Link
          href="/panel/siparisler"
          className="focus-ring block bg-sicak-light border border-sicak/30 rounded-lg p-4 mb-4 hover:border-sicak transition-colors"
        >
          <p className="text-sm text-sicak-dim font-medium">
            {onayBekleyenSiparis} sipariş onay bekliyor →
          </p>
        </Link>
      )}

      {gor.crm && gelenHatirlatmalar.length > 0 && (
        <div className="bg-sicak-light border border-sicak/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-sicak-dim font-medium mb-2">
            ⏰ {gelenHatirlatmalar.length} hatırlatma bugün veya öncesi için
          </p>
          <div className="space-y-1.5">
            {gelenHatirlatmalar.map((h) => (
              <Link
                key={h.id}
                href={h.musteri ? `/panel/musteriler/${h.musteri.id}` : h.proje ? `/panel/projeler/${h.proje.id}` : "/panel/ziyaretler"}
                className="focus-ring flex items-center justify-between text-xs text-metin/70 hover:text-sicak-dim"
              >
                <span>{h.hatirlatmaNotu || h.not}</span>
                <span className="shrink-0 ml-2 font-mono">{h.hatirlatmaTarihi!.toISOString().slice(0, 10)}</span>
              </Link>
            ))}
          </div>
          <Link href="/panel/ziyaretler" className="text-xs text-soguk-dim hover:underline mt-2 inline-block">
            Tümünü gör →
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kartlar.map((k) => {
          const ic = (
            <>
              <p className="text-xs text-metin/55 mb-2">{k.baslik}</p>
              <p className={`font-mono text-xl font-medium ${k.vurgu ? "text-sicak-dim" : "text-metin"}`}>{k.deger}</p>
            </>
          );
          return k.href ? (
            <Link key={k.baslik} href={k.href} className="focus-ring block bg-yuzey border border-hat rounded-lg p-5 hover:border-soguk transition-colors">
              {ic}
            </Link>
          ) : (
            <div key={k.baslik} className="bg-yuzey border border-hat rounded-lg p-5">
              {ic}
            </div>
          );
        })}
      </div>

      {gor.crm && <SatisPaneli donem={donem} />}

      <div className="grid sm:grid-cols-2 gap-6">
        {gor.teklif && (
        <div className="bg-yuzey border border-hat rounded-lg p-5">
          <h2 className="font-display font-medium text-metin mb-4">Son Teklifler</h2>
          {sonTeklifler.length === 0 && (
            <p className="text-sm text-metin/50">Henüz teklif yok.</p>
          )}
          <div className="space-y-3">
            {sonTeklifler.map((t) => {
              // İskonto dahil, KDV hariç net tutar (Teklifler listesiyle aynı hesap)
              const toplam = teklifToplamlari(t).araToplam;
              return (
                <Link
                  key={t.id}
                  href={`/panel/teklifler/${t.id}`}
                  className="focus-ring flex items-center justify-between text-sm border-b border-hat last:border-0 pb-3 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-metin">{t.baslik || "(Başlıksız Teklif)"}</p>
                    <p className="text-metin/50 text-xs">
                      {t.musteri.ad} · {tarihYaz(t.tarih)}
                      {t.revizyonNo > 1 && ` · Rev. ${t.revizyonNo}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-metin">{paraFormat(toplam, t.paraBirimi)}</p>
                    <p className="text-[10px] text-metin/40">KDV hariç</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        t.durum === "ONAYLANDI"
                          ? "bg-soguk-light text-soguk-dim"
                          : t.durum === "REDDEDILDI"
                          ? "bg-sicak-light text-sicak-dim"
                          : "bg-hat text-metin/60"
                      }`}
                    >
                      {t.durum === "ONAYLANDI" ? "Onaylandı" : t.durum === "REDDEDILDI" ? "Reddedildi" : "Beklemede"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        )}

        {(gor.finans || gor.crm) && (
        <div className="bg-yuzey border border-hat rounded-lg p-5">
          {gor.finans && (
          <>
          <h2 className="font-display font-medium text-metin mb-4">En Yüksek Bakiyeli Müşteriler</h2>
          {enBorcluMusteriler.length === 0 && (
            <p className="text-sm text-metin/50">Bekleyen tahsilat yok.</p>
          )}
          <div className="space-y-3">
            {enBorcluMusteriler.map((m) => (
              <Link
                key={m.id}
                href={`/panel/musteriler/${m.id}`}
                className="focus-ring flex items-center justify-between text-sm border-b border-hat last:border-0 pb-3 last:pb-0"
              >
                <p className="text-metin">{m.ad}</p>
                <p className="font-mono text-sicak-dim">{paraFormat(m.bakiye)}</p>
              </Link>
            ))}
          </div>
          </>
          )}

          {gor.crm && sonTalepler.length > 0 && (
            <div className={gor.finans ? "mt-6 pt-5 border-t border-hat" : ""}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-medium text-sm text-metin">Okunmamış Web Talepleri</h3>
                <Link href="/panel/talepler" className="text-xs text-soguk-dim hover:underline">
                  Tümünü gör →
                </Link>
              </div>
              <div className="space-y-2">
                {sonTalepler.map((t) => (
                  <p key={t.id} className="text-xs text-metin/60">
                    <span className="text-metin font-medium">{t.ad}</span> · {t.tarih.toISOString().slice(0, 10)}
                  </p>
                ))}
              </div>
            </div>
          )}
          {!gor.finans && sonTalepler.length === 0 && <p className="text-sm text-metin/50">Okunmamış web talebi yok.</p>}
        </div>
        )}
      </div>
    </div>
  );
}
