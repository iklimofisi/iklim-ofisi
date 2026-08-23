import { prisma } from "@/lib/prisma";
import { webTalebiOkunduIsaretle, webTalebiSil } from "@/lib/actions";
import SilButon from "@/components/SilButon";

export const dynamic = "force-dynamic";

export default async function TaleplerSayfasi() {
  const talepler = await prisma.webTalebi.findMany({ orderBy: { tarih: "desc" } });
  const okunmamis = talepler.filter((t) => !t.okundu).length;

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">Web Talepleri</h1>
      <p className="text-sm text-metin/60 mb-8">
        Kurumsal sitedeki İletişim formundan gelen talepler burada listelenir
        {okunmamis > 0 && <span className="text-sicak-dim"> — {okunmamis} okunmamış talep var</span>}.
      </p>

      <div className="space-y-3">
        {talepler.map((t) => (
          <div
            key={t.id}
            className={`bg-yuzey border rounded-lg p-5 ${t.okundu ? "border-hat" : "border-soguk"}`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-medium text-metin flex items-center gap-2">
                  {t.ad}
                  {!t.okundu && <span className="w-2 h-2 rounded-full bg-soguk" />}
                </p>
                <p className="text-xs text-metin/50">
                  {t.tarih.toISOString().slice(0, 10)}
                  {t.telefon && ` · ${t.telefon}`}
                  {t.email && ` · ${t.email}`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {!t.okundu && (
                  <form action={webTalebiOkunduIsaretle.bind(null, t.id)}>
                    <button type="submit" className="focus-ring text-xs text-soguk-dim hover:underline">
                      Okundu işaretle
                    </button>
                  </form>
                )}
                <SilButon id={t.id} action={webTalebiSil} onayMesaji="Bu talebi silmek istediğine emin misin?" />
              </div>
            </div>
            <p className="text-sm text-metin/70 whitespace-pre-line mb-3">{t.mesaj}</p>
            {t.dosyaAdi && (
              <a
                href={`/api/talep/${t.id}/dosya`}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring inline-flex items-center gap-2 text-sm text-soguk-dim hover:underline"
              >
                📎 {t.dosyaAdi} — görüntüle/indir
              </a>
            )}
          </div>
        ))}
        {talepler.length === 0 && (
          <p className="text-sm text-metin/50">Henüz web sitesinden gelen bir talep yok.</p>
        )}
      </div>
    </div>
  );
}
