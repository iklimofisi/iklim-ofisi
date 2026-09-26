import { prisma } from "@/lib/prisma";
import { webTalebiOkunduIsaretle, webTalebiSil } from "@/lib/actions";
import SilButon from "@/components/SilButon";
import Link from "next/link";
import { MusteriListesiSaglayici, TalepDonustur } from "@/components/TalepDonusturFormu";

// Telefonu karşılaştırmak için son 10 hane (0532..., +90532... aynı sayılır)
const telAnahtar = (t: string | null | undefined) => {
  const r = (t ?? "").replace(/\D/g, "");
  return r.length >= 10 ? r.slice(-10) : "";
};
const epostaAnahtar = (e: string | null | undefined) => (e ?? "").trim().toLocaleLowerCase("tr-TR");

export const dynamic = "force-dynamic";

export default async function TaleplerSayfasi({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const [talepler, musteriler] = await Promise.all([
    // Dosya içeriği (dosya) listede gerekmediği için çekilmez; indirme ayrı adresten yapılır
    prisma.webTalebi.findMany({
      orderBy: { tarih: "desc" },
      select: { id: true, ad: true, telefon: true, email: true, mesaj: true, dosyaAdi: true, okundu: true, tarih: true },
    }),
    prisma.musteri.findMany({
      orderBy: { ad: "asc" },
      select: {
        id: true,
        ad: true,
        telefon: true,
        email: true,
        yetkiliTelefon: true,
        yetkiliEmail: true,
        yetkililer: { select: { telefon: true, email: true } },
      },
    }),
  ]);
  const okunmamis = talepler.filter((t) => !t.okundu).length;

  // Daha önce müşteriye/projeye dönüştürülen talepler (işlem geçmişinden)
  type Donusum = { musteriId?: string; projeId?: string | null; kim: string | null; ne: Date };
  const donusumler = new Map<string, Donusum>();
  try {
    const kayitlar = await prisma.islemKaydi.findMany({
      where: { islem: "webTalebiDonusturuldu", hedefId: { in: talepler.map((t) => t.id) } },
      orderBy: { createdAt: "desc" },
      select: { hedefId: true, veri: true, kullaniciAd: true, createdAt: true },
    });
    for (const k of kayitlar) {
      if (!k.hedefId || donusumler.has(k.hedefId)) continue;
      let v: { musteriId?: string; projeId?: string | null } = {};
      try {
        v = JSON.parse(k.veri ?? "{}");
      } catch {
        v = {};
      }
      donusumler.set(k.hedefId, { musteriId: v.musteriId, projeId: v.projeId, kim: k.kullaniciAd, ne: k.createdAt });
    }
  } catch {
    // İşlem geçmişi tablosu yoksa bu bilgi gösterilmez; sayfa yine çalışır
  }

  // Aynı telefon / e-posta ile kayıtlı müşteriyi öner (anahtarlar bir kez hazırlanır)
  const telIndeks = new Map<string, string>();
  const epostaIndeks = new Map<string, string>();
  for (const m of musteriler) {
    for (const t of [m.telefon, m.yetkiliTelefon, ...m.yetkililer.map((y) => y.telefon)]) {
      const k = telAnahtar(t);
      if (k && !telIndeks.has(k)) telIndeks.set(k, m.id);
    }
    for (const e of [m.email, m.yetkiliEmail, ...m.yetkililer.map((y) => y.email)]) {
      const k = epostaAnahtar(e);
      if (k && !epostaIndeks.has(k)) epostaIndeks.set(k, m.id);
    }
  }
  const onerilenMusteri = (t: { telefon: string | null; email: string | null }) =>
    telIndeks.get(telAnahtar(t.telefon)) ?? epostaIndeks.get(epostaAnahtar(t.email)) ?? null;
  const musteriSecenekleri = musteriler.map((m) => ({ id: m.id, ad: m.ad }));
  const oneriler = new Map(talepler.map((t) => [t.id, onerilenMusteri(t)]));
  const musteriAdi = (id?: string) => musteriler.find((m) => m.id === id)?.ad;

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">Web Talepleri</h1>
      <p className="text-sm text-metin/60 mb-8">
        Kurumsal sitedeki İletişim formundan gelen talepler burada listelenir
        {okunmamis > 0 && <span className="text-sicak-dim"> — {okunmamis} okunmamış talep var</span>}.
      </p>

      {searchParams?.zaten && (
        <div className="bg-sicak-light text-sicak-dim rounded-md px-4 py-3 mb-4 text-sm">
          Bu talep daha önce dönüştürülmüş; yeni kayıt oluşturulmadı.
        </div>
      )}

      <MusteriListesiSaglayici musteriler={musteriSecenekleri}>
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

            {donusumler.has(t.id) ? (
              <div className="mt-3 pt-3 border-t border-hat text-xs text-metin/60 flex flex-wrap gap-x-4 gap-y-1">
                <span className="text-soguk-dim font-semibold">✓ Dönüştürüldü</span>
                {donusumler.get(t.id)!.musteriId && (
                  <Link href={`/panel/musteriler/${donusumler.get(t.id)!.musteriId}`} className="text-soguk-dim hover:underline">
                    Müşteri: {musteriAdi(donusumler.get(t.id)!.musteriId) ?? "görüntüle"} →
                  </Link>
                )}
                {donusumler.get(t.id)!.projeId && (
                  <Link href={`/panel/projeler/${donusumler.get(t.id)!.projeId}`} className="text-soguk-dim hover:underline">
                    Projeye git →
                  </Link>
                )}
                {donusumler.get(t.id)!.kim && <span>{donusumler.get(t.id)!.kim}</span>}
              </div>
            ) : (
              <TalepDonustur
                talep={{ id: t.id, ad: t.ad, telefon: t.telefon, email: t.email }}
                onerilenMusteriId={oneriler.get(t.id) ?? null}
              />
            )}
          </div>
        ))}
        {talepler.length === 0 && (
          <p className="text-sm text-metin/50">Henüz web sitesinden gelen bir talep yok.</p>
        )}
      </div>
      </MusteriListesiSaglayici>
    </div>
  );
}
