import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { girisZorunlu } from "@/lib/oturum";
import NotFormu from "@/components/NotFormu";
import NotKarti, { type NotKartVerisi } from "@/components/NotKarti";
import { trSimdi, alicilariOku } from "@/lib/notlar";

// -----------------------------------------------------------------------------
// NOTLAR & HATIRLATMALAR
// Herkese açık notları bütün kullanıcılar, gizli notları yalnız yazan görür.
// -----------------------------------------------------------------------------
export const dynamic = "force-dynamic";

const SEKMELER = [
  { kod: "hepsi", ad: "Açık notlar" },
  { kod: "benim", ad: "Benim notlarım" },
  { kod: "hatirlatma", ad: "Hatırlatmalar" },
  { kod: "tamamlanan", ad: "Tamamlananlar" },
] as const;

const sade = (s: string) =>
  s.toLocaleLowerCase("tr-TR").replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c");

export default async function NotlarSayfasi({ searchParams }: { searchParams: { g?: string; q?: string } }) {
  const ben = await girisZorunlu();
  const sekme = SEKMELER.some((s) => s.kod === searchParams.g) ? searchParams.g! : "hepsi";
  const ara = (searchParams.q ?? "").trim().slice(0, 100);
  const { gun: bugun } = trSimdi();
  const yarin = trSimdi(new Date(Date.now() + 86400000)).gun;

  const kullanicilar = await prisma.kullanici.findMany({ select: { id: true, ad: true, email: true }, orderBy: { ad: "asc" } });

  let kayitlar: Awaited<ReturnType<typeof prisma.panelNotu.findMany>> = [];
  let tabloYok = false;
  try {
    kayitlar = await prisma.panelNotu.findMany({
      // Gizli notlar yalnız yazanına gelir
      where: { OR: [{ gizli: false }, { olusturanId: ben.id }] },
      orderBy: [{ sabit: "desc" }, { updatedAt: "desc" }],
      take: 1000,
    });
  } catch {
    tabloYok = true; // veritabanı güncellemesi (SQL) henüz yapılmamış
  }

  const notlar: NotKartVerisi[] = kayitlar.map((n) => ({
    id: n.id,
    baslik: n.baslik,
    icerik: n.icerik,
    gizli: n.gizli,
    sabit: n.sabit,
    tamamlandi: n.tamamlandi,
    olusturanId: n.olusturanId,
    olusturanAdi: n.olusturanAdi,
    hatirlatmaGunu: n.hatirlatmaGunu,
    hatirlatmaSaati: n.hatirlatmaSaati,
    alicilar: alicilariOku(n.hatirlatmaAlicilar),
    gonderildi: n.hatirlatmaGonderildi ? n.hatirlatmaGonderildi.toISOString() : null,
    guncelleme: n.updatedAt.toISOString(),
  }));

  // Bugün ve geciken hatırlatmalar (bana ait ya da bana gidenler)
  const banaIlgili = (n: NotKartVerisi) => n.olusturanId === ben.id || (!n.gizli && n.alicilar.includes(ben.id));
  const acil = notlar
    .filter((n) => !n.tamamlandi && n.hatirlatmaGunu && n.hatirlatmaGunu <= bugun && banaIlgili(n))
    .sort((a, b) => (a.hatirlatmaGunu! < b.hatirlatmaGunu! ? -1 : 1));

  const kelimeler = sade(ara).split(/\s+/).filter(Boolean);
  const eslesir = (n: NotKartVerisi) => !kelimeler.length || kelimeler.every((k) => sade(`${n.baslik ?? ""} ${n.icerik} ${n.olusturanAdi}`).includes(k));
  const liste = notlar
    .filter((n) =>
      sekme === "tamamlanan"
        ? n.tamamlandi
        : sekme === "benim"
          ? n.olusturanId === ben.id && !n.tamamlandi
          : sekme === "hatirlatma"
            ? !!n.hatirlatmaGunu && !n.tamamlandi
            : !n.tamamlandi
    )
    .filter(eslesir)
    .sort((a, b) =>
      sekme === "hatirlatma" ? ((a.hatirlatmaGunu ?? "") + (a.hatirlatmaSaati ?? "") < (b.hatirlatmaGunu ?? "") + (b.hatirlatmaSaati ?? "") ? -1 : 1) : 0
    );
  const sayi = (kod: string) =>
    notlar.filter((n) =>
      kod === "tamamlanan" ? n.tamamlandi : kod === "benim" ? n.olusturanId === ben.id && !n.tamamlandi : kod === "hatirlatma" ? !!n.hatirlatmaGunu && !n.tamamlandi : !n.tamamlandi
    ).length;

  const kartProps = { kullanicilar, benId: ben.id, bugun, yarin };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-1">Ofis</p>
        <h1 className="font-display text-2xl font-semibold text-metin">Notlar & Hatırlatmalar</h1>
        <p className="text-sm text-metin/55 mt-1">
          Herkese açık notları bütün kullanıcılar görür; 🔒 gizli notları yalnız siz görürsünüz. Hatırlatma maili seçilen gün sabah 08:00&apos;de gider.
        </p>
      </div>

      {tabloYok && (
        <div className="bg-sicak-light text-sicak-dim border border-sicak/40 rounded-md p-4 text-sm">
          Notlar tablosu veritabanında henüz yok. Neon SQL Editor&apos;da <code>prisma/manuel/2026-10-19_notlar_hatirlatmalar.sql</code> dosyasını çalıştırın.
        </div>
      )}

      {acil.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display font-medium text-metin">⏰ Bugün ve geciken hatırlatmalar ({acil.length})</h2>
          <div className="grid gap-3">
            {acil.map((n) => (
              <NotKarti key={`a-${n.id}`} not={n} {...kartProps} />
            ))}
          </div>
        </section>
      )}

      <details className="bg-yuzey border border-hat rounded-lg p-5 group" open={!notlar.length}>
        <summary className="cursor-pointer font-display font-medium text-metin list-none flex items-center justify-between">
          <span>+ Yeni not / hatırlatma</span>
          <span className="text-xs text-metin/45 group-open:hidden">açmak için tıklayın</span>
        </summary>
        <div className="mt-4">
          <NotFormu kullanicilar={kullanicilar} benId={ben.id} yarin={yarin} />
        </div>
      </details>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-1.5">
          {SEKMELER.map((s) => (
            <Link
              key={s.kod}
              href={`/panel/notlar?g=${s.kod}${ara ? `&q=${encodeURIComponent(ara)}` : ""}`}
              className={`focus-ring rounded-md px-3 py-1.5 text-sm border ${
                sekme === s.kod ? "bg-soguk text-white border-soguk" : "bg-yuzey text-metin/70 border-hat hover:border-soguk"
              }`}
            >
              {s.ad} <span className="opacity-70">({sayi(s.kod)})</span>
            </Link>
          ))}
        </nav>
        <form className="flex gap-2">
          <input type="hidden" name="g" value={sekme} />
          <input name="q" defaultValue={ara} placeholder="Notlarda ara…" className="focus-ring border border-hat rounded-md px-3 py-1.5 text-sm bg-white w-48" />
          <button type="submit" className="focus-ring text-sm border border-hat rounded-md px-3 py-1.5 bg-yuzey hover:border-soguk">
            Ara
          </button>
        </form>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {liste.map((n) => (
          <NotKarti key={n.id} not={n} {...kartProps} />
        ))}
      </div>
      {!liste.length && !tabloYok && (
        <p className="text-sm text-metin/50 bg-yuzey border border-hat rounded-lg p-6 text-center">
          {ara ? "Aramaya uyan not yok." : sekme === "tamamlanan" ? "Tamamlanan not yok." : "Henüz not yok. Yukarıdan ilk notunuzu ekleyin."}
        </p>
      )}
    </div>
  );
}
