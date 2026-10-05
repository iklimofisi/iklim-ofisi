import Link from "next/link";
import { ziyaretSil, ziyaretHatirlatmaTamamlandi } from "@/lib/actions";
import SilButon from "@/components/SilButon";
import KaydetButonu from "@/components/KaydetButonu";
import { gorusmeTuru, teklifNoYaz } from "@/lib/gorusme";

type ZiyaretGoruntu = {
  id: string;
  tarih: Date;
  not: string;
  hatirlatmaTarihi: Date | null;
  hatirlatmaNotu: string | null;
  hatirlatmaTamam: boolean;
  olusturanAdi: string;
  tur?: string | null;
  // Opsiyonel: bağlı proje / müşteri / teklif gösterilir
  proje?: { id: string; ad: string } | null;
  musteri?: { id: string; ad: string } | null;
  teklif?: { id: string; teklifNo: number } | null;
};

export default function ZiyaretListesi({
  ziyaretler,
  bosMetin = "Henüz görüşme / ziyaret kaydı yok.",
}: {
  ziyaretler: ZiyaretGoruntu[];
  bosMetin?: string;
}) {
  if (ziyaretler.length === 0) {
    return <p className="text-sm text-metin/50">{bosMetin}</p>;
  }

  return (
    <div className="space-y-3">
      {ziyaretler.map((z) => {
        const tur = gorusmeTuru(z.tur);
        return (
          <div key={z.id} className="bg-yuzey border border-hat rounded-lg p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-xs text-metin/50">
                <span className="inline-block mr-1.5 px-1.5 py-0.5 rounded bg-soguk-light text-soguk-dim font-medium">
                  {tur.simge} {tur.ad}
                </span>
                {z.tarih.toISOString().slice(0, 10)}
                {z.olusturanAdi && ` · ${z.olusturanAdi}`}
                {z.musteri && (
                  <>
                    {" · "}
                    <Link href={`/panel/musteriler/${z.musteri.id}`} className="text-soguk-dim hover:underline">
                      {z.musteri.ad}
                    </Link>
                  </>
                )}
                {z.proje && (
                  <>
                    {" · "}
                    <Link href={`/panel/projeler/${z.proje.id}`} className="text-soguk-dim hover:underline">
                      {z.proje.ad}
                    </Link>
                  </>
                )}
                {z.teklif && (
                  <>
                    {" · "}
                    <Link href={`/panel/teklifler/${z.teklif.id}`} className="text-soguk-dim hover:underline font-mono">
                      {teklifNoYaz(z.teklif.teklifNo)}
                    </Link>
                  </>
                )}
              </p>
              <SilButon id={z.id} action={ziyaretSil} onayMesaji="Bu görüşme kaydını silmek istediğine emin misin?" />
            </div>
            <p className="text-sm text-metin/80 whitespace-pre-line">{z.not}</p>
            {z.hatirlatmaTarihi && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <p
                  className={`text-xs inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${
                    z.hatirlatmaTamam ? "bg-hat text-metin/40" : "bg-sicak-light text-sicak-dim"
                  }`}
                >
                  ⏰ {z.hatirlatmaTarihi.toISOString().slice(0, 10)}
                  {z.hatirlatmaNotu && ` — ${z.hatirlatmaNotu}`}
                  {z.hatirlatmaTamam && " (tamamlandı)"}
                </p>
                {!z.hatirlatmaTamam && (
                  <form action={ziyaretHatirlatmaTamamlandi.bind(null, z.id)}>
                    <KaydetButonu
                      basari="Hatırlatma tamamlandı."
                      bekleme="…"
                      className="focus-ring text-[11px] border border-hat bg-white text-metin/60 px-2 py-1 rounded-full hover:border-soguk hover:text-soguk-dim transition-colors"
                    >
                      ✓ Tamamlandı
                    </KaydetButonu>
                  </form>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
