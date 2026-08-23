import { prisma } from "@/lib/prisma";
import Link from "next/link";

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

export default async function SiparislerSayfasi() {
  const siparisler = await prisma.siparis.findMany({
    include: {
      musteri: true,
      teklif: { include: { kalemler: true } },
      sevkiyatlar: true,
    },
    orderBy: { olusturmaTarihi: "desc" },
  });

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

      {onayBekleyenler.length > 0 && (
        <div className="mb-10">
          <h2 className="font-display font-medium text-metin mb-3">
            Onay Bekleyenler <span className="text-sicak-dim">({onayBekleyenler.length})</span>
          </h2>
          <div className="space-y-3">
            {onayBekleyenler.map((s) => (
              <Link
                key={s.id}
                href={`/panel/siparisler/${s.id}`}
                className="focus-ring block bg-sicak-light border border-sicak/30 rounded-lg p-4 hover:border-sicak transition-colors"
              >
                <p className="font-medium text-metin text-sm">{s.teklif.baslik || "(Başlıksız Teklif)"}</p>
                <p className="text-xs text-metin/60">
                  {s.musteri.ad} · {s.olusturanAdi && `${s.olusturanAdi} tarafından talep edildi · `}
                  {s.olusturmaTarihi.toISOString().slice(0, 10)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {digerleri.map((s) => (
          <div key={s.id} className="bg-yuzey border border-hat rounded-lg p-4 flex items-center justify-between gap-3">
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
        ))}
        {digerleri.length === 0 && onayBekleyenler.length === 0 && (
          <p className="text-sm text-metin/50">
            Henüz sipariş yok. Onaylanan bir teklifin detayında "Siparişe Dönüştür"
            butonuyla buraya taşıyabilirsin.
          </p>
        )}
      </div>
    </div>
  );
}
