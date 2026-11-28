import { prisma } from "@/lib/prisma";
import Link from "next/link";
import HizliAramaListesi from "@/components/HizliAramaListesi";
import { sayfaYetkisi } from "@/lib/oturum";

import type { SiparisDurum } from "@prisma/client";

export const dynamic = "force-dynamic";

const durumEtiket: Record<string, string> = {
  ONAY_BEKLIYOR: "Onay Bekliyor",
  HAZIRLANIYOR: "Hazırlanıyor",
  KISMEN_SEVK_EDILDI: "Kısmen Sevk Edildi",
  SEVK_EDILDI: "Sevk Edildi",
  KISMEN_TESLIM_EDILDI: "Kısmen Teslim Edildi",
  TESLIM_EDILDI: "Teslim Edildi",
  FATURALANDI: "Faturalandı",
  IPTAL: "İptal",
  REDDEDILDI: "Reddedildi",
};

const durumRenk: Record<string, string> = {
  ONAY_BEKLIYOR: "bg-sicak-light text-sicak-dim",
  HAZIRLANIYOR: "bg-hat text-metin/60",
  KISMEN_SEVK_EDILDI: "bg-sicak-light text-sicak-dim",
  SEVK_EDILDI: "bg-soguk-light text-soguk-dim",
  KISMEN_TESLIM_EDILDI: "bg-sicak-light text-sicak-dim",
  TESLIM_EDILDI: "bg-soguk-light text-soguk-dim",
  FATURALANDI: "bg-soguk text-white",
  IPTAL: "bg-hat text-metin/40",
  REDDEDILDI: "bg-hat text-metin/40",
};

// Süzgeç sekmeleri (satınalma siparişleri listesiyle aynı mantık)
const SUZGECLER: { kod: string; ad: string; durumlar?: SiparisDurum[] }[] = [
  { kod: "acik", ad: "Açık", durumlar: ["ONAY_BEKLIYOR", "HAZIRLANIYOR", "KISMEN_SEVK_EDILDI", "SEVK_EDILDI", "KISMEN_TESLIM_EDILDI", "TESLIM_EDILDI"] },
  { kod: "onay", ad: "Onay bekleyen", durumlar: ["ONAY_BEKLIYOR"] },
  { kod: "hazir", ad: "Hazırlanıyor", durumlar: ["HAZIRLANIYOR"] },
  { kod: "sevk", ad: "Sevk / teslim sürecinde", durumlar: ["KISMEN_SEVK_EDILDI", "SEVK_EDILDI", "KISMEN_TESLIM_EDILDI"] },
  { kod: "faturasiz", ad: "Teslim edildi, faturasız", durumlar: ["TESLIM_EDILDI"] },
  { kod: "fatura", ad: "Faturalanan", durumlar: ["FATURALANDI"] },
  { kod: "iptal", ad: "İptal / red", durumlar: ["IPTAL", "REDDEDILDI"] },
  { kod: "tum", ad: "Tümü" },
];

export default async function SiparislerSayfasi({ searchParams }: { searchParams?: { durum?: string } }) {
  await sayfaYetkisi("siparis");
  const suzgec = SUZGECLER.find((s) => s.kod === searchParams?.durum) ?? SUZGECLER[0];
  const [siparisler, sayilar] = await Promise.all([
    prisma.siparis.findMany({
      where: suzgec.durumlar ? { durum: { in: suzgec.durumlar } } : {},
      include: {
        musteri: true,
        teklif: { include: { kalemler: true } },
        sevkiyatlar: true,
      },
      orderBy: { olusturmaTarihi: "desc" },
    }),
    prisma.siparis.groupBy({ by: ["durum"], _count: { _all: true } }),
  ]);
  const say = (s: (typeof SUZGECLER)[number]) =>
    sayilar.filter((x) => !s.durumlar || s.durumlar.includes(x.durum)).reduce((a, x) => a + x._count._all, 0);

  const onayBekleyenler = siparisler.filter((s) => s.durum === "ONAY_BEKLIYOR");
  const digerleri = siparisler.filter((s) => s.durum !== "ONAY_BEKLIYOR");

  function sevkOzeti(s: (typeof siparisler)[number]) {
    const toplamKalemAdedi = s.teklif.kalemler.reduce((a, k) => a + k.adet, 0);
    const sevkAdedi = s.sevkiyatlar.reduce((a, sv) => a + sv.adet, 0);
    if (sevkAdedi === 0) return "Sevkiyat başlamadı";
    if (sevkAdedi >= toplamKalemAdedi) return "Tüm ürünler sevk edildi";
    return `${sevkAdedi}/${toplamKalemAdedi} adet sevk edildi`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
          <h1 className="font-display text-2xl font-semibold text-metin">Siparişler</h1>
        </div>
        <a
          href="/api/export/siparisler"
          className="focus-ring text-sm font-medium text-metin/70 border border-hat px-4 py-2 rounded-md hover:border-soguk hover:text-soguk-dim transition-colors"
        >
          Excel'e Aktar
        </a>
      </div>

      {/* SÜZGEÇ */}
      <div className="flex flex-wrap gap-2 mb-4">
        {SUZGECLER.map((s) => (
          <Link
            key={s.kod}
            href={`/panel/siparisler?durum=${s.kod}`}
            className={`focus-ring text-xs px-3 py-1.5 rounded-full border ${s.kod === suzgec.kod ? "bg-soguk text-white border-soguk" : "border-hat text-metin/70 hover:bg-hat"}`}
          >
            {s.ad} <span className="opacity-60">({say(s)})</span>
          </Link>
        ))}
      </div>

      {onayBekleyenler.length > 0 && (
        <p className="text-sm font-medium text-sicak-dim mb-3">
          {onayBekleyenler.length} sipariş onay bekliyor — listenin en üstünde turuncu olarak görünür.
        </p>
      )}

      {/* SİPARİŞ LİSTESİ — onay bekleyenler üstte; yazdıkça anında süzülür */}
      <HizliAramaListesi
        yerTutucu="Hızlı ara: teklif / proje adı, müşteri, teklif no, fatura no, durum…"
        birim="sipariş"
        bosMetin={suzgec.kod === "acik" || suzgec.kod === "tum" ? 'Henüz sipariş yok. Onaylanan bir teklifin detayında "Siparişe Dönüştür" butonuyla buraya taşıyabilirsin.' : "Bu süzgeçte sipariş yok."}
        satirlar={[...onayBekleyenler, ...digerleri].map((s) => ({
          id: s.id,
          aramaMetni: [
            s.teklif.baslik,
            s.musteri.ad,
            `TKL-${String(s.teklif.teklifNo).padStart(4, "0")}`,
            String(s.teklif.teklifNo),
            s.faturaNo,
            s.olusturanAdi,
            durumEtiket[s.durum],
          ]
            .filter(Boolean)
            .join(" "),
          icerik:
            s.durum === "ONAY_BEKLIYOR" ? (
              <Link
                href={`/panel/siparisler/${s.id}`}
                className="focus-ring flex items-center justify-between gap-3 bg-sicak-light border border-sicak/30 rounded-lg p-4 hover:border-sicak transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-metin text-sm truncate">{s.teklif.baslik || "(Başlıksız Teklif)"}</p>
                  <p className="text-xs text-metin/60">
                    {s.musteri.ad} · {s.olusturanAdi && `${s.olusturanAdi} tarafından talep edildi · `}
                    {s.olusturmaTarihi.toISOString().slice(0, 10)}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 font-semibold ${durumRenk[s.durum]}`}>
                  {durumEtiket[s.durum]}
                </span>
              </Link>
            ) : (
              <div className="bg-yuzey border border-hat rounded-lg p-4 flex items-center justify-between gap-3">
                <Link href={`/panel/siparisler/${s.id}`} className="focus-ring min-w-0">
                  <p className="font-medium text-metin text-sm hover:text-soguk-dim transition-colors truncate">
                    {s.teklif.baslik || "(Başlıksız Teklif)"}
                  </p>
                  <p className="text-xs text-metin/50">
                    {s.musteri.ad} · {s.olusturmaTarihi.toISOString().slice(0, 10)}
                    {s.faturaNo && ` · Fatura: ${s.faturaNo}`} · {sevkOzeti(s)}
                  </p>
                </Link>
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${durumRenk[s.durum]}`}>
                  {durumEtiket[s.durum]}
                </span>
              </div>
            ),
        }))}
      />
    </div>
  );
}
