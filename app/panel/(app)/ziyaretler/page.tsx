import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { ziyaretHatirlatmaTamamlandi } from "@/lib/actions";
import { suankiKullanici } from "@/lib/oturum";
import ZiyaretKayitFormu from "@/components/ZiyaretKayitFormu";
import ZiyaretListesi from "@/components/ZiyaretListesi";

export const dynamic = "force-dynamic";

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const GUNLER = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

const GUN_RE = /^\d{4}-\d{2}-\d{2}$/;
const AY_RE = /^\d{4}-\d{2}$/;

type Filtre = {
  musteri?: string;
  proje?: string;
  yapan?: string;
  bas?: string;
  bit?: string;
  durum?: string;
  q?: string;
};

type Arama = Filtre & {
  ay?: string;
  gun?: string;
  yeniMusteri?: string;
  yeniProje?: string;
  eklendi?: string;
};

// Türkiye saatine göre bugünün tarihi (YYYY-MM-DD)
function bugunTR() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date());
}

function gunAnahtari(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function ZiyaretlerSayfasi({ searchParams = {} }: { searchParams?: Arama }) {
  const bugun = bugunTR();

  // --- Parametreleri doğrula ---
  const f: Filtre = {
    musteri: searchParams.musteri || undefined,
    proje: searchParams.proje || undefined,
    yapan: searchParams.yapan || undefined,
    bas: searchParams.bas && GUN_RE.test(searchParams.bas) ? searchParams.bas : undefined,
    bit: searchParams.bit && GUN_RE.test(searchParams.bit) ? searchParams.bit : undefined,
    durum: ["bekleyen", "tamam", "yok"].includes(searchParams.durum ?? "") ? searchParams.durum : undefined,
    q: searchParams.q?.trim() || undefined,
  };
  const seciliGun = searchParams.gun && GUN_RE.test(searchParams.gun) ? searchParams.gun : bugun;
  const ay = searchParams.ay && AY_RE.test(searchParams.ay) ? searchParams.ay : seciliGun.slice(0, 7);
  const [yil, ayNo] = ay.split("-").map(Number);

  // --- Filtre koşulu (tarih aralığı hariç; takvim ay bazında çalışır) ---
  const where: Prisma.ZiyaretWhereInput = {
    // Müşteri filtresi: doğrudan müşteriye bağlı VEYA müşterinin projesine bağlı ziyaretler
    ...(f.musteri ? { OR: [{ musteriId: f.musteri }, { proje: { musteriId: f.musteri } }] } : {}),
    ...(f.proje ? { projeId: f.proje } : {}),
    ...(f.yapan ? { olusturanAdi: f.yapan } : {}),
    ...(f.q ? { not: { contains: f.q, mode: "insensitive" as const } } : {}),
    ...(f.durum === "bekleyen"
      ? { hatirlatmaTarihi: { not: null }, hatirlatmaTamam: false }
      : f.durum === "tamam"
      ? { hatirlatmaTarihi: { not: null }, hatirlatmaTamam: true }
      : f.durum === "yok"
      ? { hatirlatmaTarihi: null }
      : {}),
  };

  const [kullanici, ziyaretler, musteriler, projeler, kullanicilar, yapanlar, bekleyenHatirlatmalar] = await Promise.all([
    suankiKullanici(),
    prisma.ziyaret.findMany({
      where,
      include: {
        musteri: { select: { id: true, ad: true } },
        proje: { select: { id: true, ad: true } },
      },
      orderBy: { tarih: "desc" },
    }),
    prisma.musteri.findMany({ orderBy: { ad: "asc" }, select: { id: true, ad: true } }),
    prisma.proje.findMany({ orderBy: { ad: "asc" }, select: { id: true, ad: true, musteriId: true } }),
    prisma.kullanici.findMany({ orderBy: { ad: "asc" }, select: { ad: true } }),
    prisma.ziyaret.findMany({ distinct: ["olusturanAdi"], select: { olusturanAdi: true } }),
    prisma.ziyaret.findMany({
      where: { hatirlatmaTamam: false, hatirlatmaTarihi: { not: null, lte: new Date(`${bugun}T23:59:59.999Z`) } },
      include: { musteri: { select: { id: true, ad: true } }, proje: { select: { id: true, ad: true } } },
      orderBy: { hatirlatmaTarihi: "asc" },
    }),
  ]);

  // --- Liste: tarih aralığı da uygulanır ---
  const liste = ziyaretler.filter((z) => {
    const g = gunAnahtari(z.tarih);
    if (f.bas && g < f.bas) return false;
    if (f.bit && g > f.bit) return false;
    return true;
  });

  // --- Takvim verisi ---
  const gunlereGore = new Map<string, typeof ziyaretler>();
  const hatirlatmaGunleri = new Map<string, number>();
  for (const z of ziyaretler) {
    const g = gunAnahtari(z.tarih);
    gunlereGore.set(g, [...(gunlereGore.get(g) ?? []), z]);
    if (z.hatirlatmaTarihi && !z.hatirlatmaTamam) {
      const h = gunAnahtari(z.hatirlatmaTarihi);
      hatirlatmaGunleri.set(h, (hatirlatmaGunleri.get(h) ?? 0) + 1);
    }
  }

  const ayinIlkGunu = new Date(Date.UTC(yil, ayNo - 1, 1));
  const aydakiGunSayisi = new Date(Date.UTC(yil, ayNo, 0)).getUTCDate();
  const bosluk = (ayinIlkGunu.getUTCDay() + 6) % 7; // Pazartesi = 0
  const hucreler: (string | null)[] = [
    ...Array.from({ length: bosluk }, () => null),
    ...Array.from({ length: aydakiGunSayisi }, (_, i) => `${ay}-${String(i + 1).padStart(2, "0")}`),
  ];
  while (hucreler.length % 7 !== 0) hucreler.push(null);

  const oncekiAy = new Date(Date.UTC(yil, ayNo - 2, 1)).toISOString().slice(0, 7);
  const sonrakiAy = new Date(Date.UTC(yil, ayNo, 1)).toISOString().slice(0, 7);
  const buAydakiZiyaret = [...gunlereGore.entries()].filter(([g]) => g.startsWith(ay)).reduce((a, [, z]) => a + z.length, 0);

  const seciliGunZiyaretleri = gunlereGore.get(seciliGun) ?? [];

  // Mevcut filtreleri koruyarak link üret
  function url(ek: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const tum: Record<string, string | undefined> = { ...f, ay, gun: seciliGun, ...ek };
    for (const [k, v] of Object.entries(tum)) if (v) p.set(k, v);
    return `/panel/ziyaretler?${p.toString()}`;
  }

  // "Ziyareti yapan" seçenekleri: kullanıcılar + geçmiş kayıtlardaki isimler
  const kisiler = Array.from(
    new Set([kullanici?.ad ?? "", ...kullanicilar.map((k) => k.ad), ...yapanlar.map((y) => y.olusturanAdi)].filter(Boolean))
  );
  const filtreVar = Object.values(f).some(Boolean);
  const formAcik = Boolean(searchParams.yeniMusteri || searchParams.yeniProje);

  const gunBasligi = new Date(`${seciliGun}T00:00:00Z`).toLocaleDateString("tr-TR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-8">Ziyaretler</h1>

      {searchParams.eklendi && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md p-3 text-xs font-semibold mb-6">
          ✓ Ziyaret kaydedildi. Takvimde işaretlendi.
        </div>
      )}

      {/* YENİ ZİYARET */}
      <details id="ziyaret-ekle" open={formAcik || ziyaretler.length === 0} className="bg-yuzey border border-hat rounded-lg mb-8 scroll-mt-6">
        <summary className="cursor-pointer select-none px-5 py-3 text-sm font-semibold text-soguk-dim">+ Yeni Ziyaret Ekle</summary>
        <ZiyaretKayitFormu
          musteriler={musteriler}
          projeler={projeler}
          kisiler={kisiler}
          varsayilanYapan={kullanici?.ad ?? kisiler[0] ?? ""}
          varsayilanMusteriId={searchParams.yeniMusteri ?? ""}
          varsayilanProjeId={searchParams.yeniProje ?? ""}
          bugun={bugun}
        />
      </details>

      {/* HATIRLATMALAR */}
      {bekleyenHatirlatmalar.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-medium text-sicak-dim mb-3">⏰ Hatırlatmalar ({bekleyenHatirlatmalar.length})</h2>
          <div className="space-y-2">
            {bekleyenHatirlatmalar.map((z) => (
              <div key={z.id} className="bg-sicak-light border border-sicak/30 rounded-lg p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-metin">{z.hatirlatmaNotu || z.not}</p>
                  <p className="text-xs text-metin/50">
                    {gunAnahtari(z.hatirlatmaTarihi!)}
                    {z.olusturanAdi && ` · ${z.olusturanAdi}`}
                    {z.musteri && (
                      <> · <Link href={`/panel/musteriler/${z.musteri.id}`} className="text-soguk-dim hover:underline">{z.musteri.ad}</Link></>
                    )}
                    {z.proje && (
                      <> · <Link href={`/panel/projeler/${z.proje.id}`} className="text-soguk-dim hover:underline">{z.proje.ad}</Link></>
                    )}
                  </p>
                </div>
                <form action={ziyaretHatirlatmaTamamlandi.bind(null, z.id)}>
                  <button type="submit" className="focus-ring shrink-0 text-xs bg-soguk text-white px-3 py-1.5 rounded-md font-medium hover:bg-soguk-dim transition-colors">
                    Tamamlandı
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAKVİM + SEÇİLİ GÜN */}
      <div className="grid lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-3 bg-yuzey border border-hat rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <Link href={url({ ay: oncekiAy })} className="focus-ring text-sm px-3 py-1 rounded-md border border-hat hover:border-soguk" aria-label="Önceki ay">
              ‹
            </Link>
            <div className="text-center">
              <p className="font-display font-semibold text-metin">
                {AYLAR[ayNo - 1]} {yil}
              </p>
              <p className="text-[11px] text-metin/50">
                {buAydakiZiyaret} ziyaret{filtreVar && " (filtreli)"}
              </p>
            </div>
            <Link href={url({ ay: sonrakiAy })} className="focus-ring text-sm px-3 py-1 rounded-md border border-hat hover:border-soguk" aria-label="Sonraki ay">
              ›
            </Link>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-metin/50 mb-1">
            {GUNLER.map((g) => (
              <div key={g}>{g}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {hucreler.map((g, i) => {
              if (!g) return <div key={`b${i}`} />;
              const adet = gunlereGore.get(g)?.length ?? 0;
              const hatirlatma = hatirlatmaGunleri.get(g) ?? 0;
              const secili = g === seciliGun;
              const bugunMu = g === bugun;
              return (
                <Link
                  key={g}
                  href={url({ gun: g, ay })}
                  className={`focus-ring relative h-14 sm:h-16 rounded-md border p-1 flex flex-col items-center justify-start text-xs transition-colors ${
                    secili
                      ? "border-soguk bg-soguk text-white"
                      : adet > 0
                      ? "border-soguk/40 bg-soguk-light hover:border-soguk"
                      : "border-hat hover:border-soguk/50"
                  }`}
                  title={`${g}: ${adet} ziyaret${hatirlatma ? `, ${hatirlatma} hatırlatma` : ""}`}
                >
                  <span className={`font-mono ${bugunMu && !secili ? "font-bold text-soguk-dim underline" : ""}`}>
                    {Number(g.slice(8))}
                  </span>
                  {adet > 0 && (
                    <span
                      className={`mt-1 min-w-[1.25rem] px-1 rounded-full text-[10px] font-bold ${
                        secili ? "bg-white text-soguk-dim" : "bg-soguk text-white"
                      }`}
                    >
                      {adet}
                    </span>
                  )}
                  {hatirlatma > 0 && <span className="absolute top-0.5 right-1 text-[10px]" aria-label="Hatırlatma">⏰</span>}
                </Link>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] text-metin/50">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-soguk-light border border-soguk/40" /> Ziyaret yapılan gün
            </span>
            <span>⏰ Hatırlatma</span>
            <Link href={url({ gun: bugun, ay: bugun.slice(0, 7) })} className="text-soguk-dim hover:underline ml-auto">
              Bugüne dön
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2 bg-yuzey border border-hat rounded-lg p-4">
          <p className="text-xs text-metin/50 uppercase tracking-wider font-semibold mb-1">Seçili Gün</p>
          <h2 className="font-display font-semibold text-metin mb-4 capitalize">{gunBasligi}</h2>
          {seciliGunZiyaretleri.length === 0 ? (
            <p className="text-sm text-metin/50">Bu gün kayıtlı ziyaret yok{filtreVar && " (filtreye uyan)"}.</p>
          ) : (
            <div className="space-y-3">
              {seciliGunZiyaretleri.map((z) => (
                <div key={z.id} className="border-l-2 border-soguk pl-3">
                  <p className="text-sm font-semibold text-metin">{z.olusturanAdi || "—"}</p>
                  <p className="text-xs text-metin/60">
                    {z.musteri ? (
                      <Link href={`/panel/musteriler/${z.musteri.id}`} className="text-soguk-dim hover:underline">
                        {z.musteri.ad}
                      </Link>
                    ) : (
                      "Müşteri yok"
                    )}
                    {z.proje && (
                      <>
                        {" · "}
                        <Link href={`/panel/projeler/${z.proje.id}`} className="text-soguk-dim hover:underline">
                          {z.proje.ad}
                        </Link>
                      </>
                    )}
                  </p>
                  <p className="text-sm text-metin/80 whitespace-pre-line mt-1">{z.not}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FİLTRELER */}
      <details className="bg-yuzey border border-hat rounded-lg mb-6" open={filtreVar}>
        <summary className="cursor-pointer select-none px-5 py-3 text-sm font-medium text-metin/70">
          Filtrele {filtreVar && <span className="text-soguk-dim">(aktif)</span>}
        </summary>
        <form method="get" className="p-5 pt-0 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <input type="hidden" name="ay" value={ay} />
          <input type="hidden" name="gun" value={seciliGun} />
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Müşteri</label>
            <select name="musteri" defaultValue={f.musteri ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
              <option value="">Tümü</option>
              {musteriler.map((m) => (
                <option key={m.id} value={m.id}>{m.ad}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Proje</label>
            <select name="proje" defaultValue={f.proje ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
              <option value="">Tümü</option>
              {projeler.map((p) => (
                <option key={p.id} value={p.id}>{p.ad}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Ziyareti Yapan</label>
            <select name="yapan" defaultValue={f.yapan ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
              <option value="">Tümü</option>
              {kisiler.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Hatırlatma Durumu</label>
            <select name="durum" defaultValue={f.durum ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
              <option value="">Tümü</option>
              <option value="bekleyen">Hatırlatması bekleyen</option>
              <option value="tamam">Hatırlatması tamamlanan</option>
              <option value="yok">Hatırlatmasız</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Başlangıç Tarihi</label>
            <input name="bas" type="date" defaultValue={f.bas ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Bitiş Tarihi</label>
            <input name="bit" type="date" defaultValue={f.bit ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-metin/60 mb-1">Notlarda Ara</label>
            <input name="q" defaultValue={f.q ?? ""} placeholder="örn. keşif, fiyat, VRF..." className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white" />
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex gap-3">
            <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors">
              Filtrele
            </button>
            {filtreVar && (
              <Link href={`/panel/ziyaretler?ay=${ay}&gun=${seciliGun}`} className="focus-ring text-sm text-metin/60 hover:text-metin px-2 py-2">
                Filtreyi temizle
              </Link>
            )}
          </div>
        </form>
      </details>

      {/* LİSTE */}
      <h2 className="font-display font-medium text-metin mb-3">
        {filtreVar ? "Filtrelenen Ziyaretler" : "Tüm Ziyaretler"} ({liste.length})
      </h2>
      {liste.length === 0 ? (
        <p className="text-sm text-metin/50">{filtreVar ? "Bu filtreye uyan ziyaret yok." : "Henüz ziyaret kaydı yok."}</p>
      ) : (
        <ZiyaretListesi ziyaretler={liste} />
      )}
    </div>
  );
}
