import { prisma } from "@/lib/prisma";
import { teklifSil } from "@/lib/actions";
import TeklifDurumSecici from "@/components/TeklifDurumSecici";
import SilButon from "@/components/SilButon";
import TeklifOnizleButon from "@/components/TeklifOnizleButon";
import HizliAramaListesi from "@/components/HizliAramaListesi";
import Link from "next/link";
import { redirect } from "next/navigation";
import { teklifToplamlari, ilkHazirlanmaTarihi, tarihYaz } from "@/lib/teklif-hesap";
import { RED_NEDENLERI, redNedeniAdi, DURUM_FILTRELERI, durumFiltresi } from "@/lib/teklif-durum";

function paraFormat(n: number, paraBirimi: string = "TRY") {
  return n.toLocaleString("tr-TR", { style: "currency", currency: paraBirimi });
}

function teklifNoFormat(no: number) {
  return `TKL-${String(no).padStart(4, "0")}`;
}

export default async function TekliflerSayfasi({
  searchParams,
}: {
  searchParams: {
    musteri?: string;
    hazirlayan?: string;
    baslangic?: string;
    bitis?: string;
    min?: string;
    max?: string;
    proje?: string;
    no?: string;
    durum?: string;
    seciliProjeId?: string;
    seciliMusteriId?: string; // Yeni Eklenen Müşteri ID'si
    basarili?: string;
  };
}) {
  // Eski bağlantılar (projeden "yeni teklif", hızlı müşteri ekleme) artık yeni teklif sayfasına gider
  if (searchParams.seciliProjeId || searchParams.seciliMusteriId) {
    const q = new URLSearchParams(
      Object.entries(searchParams).filter(([, v]) => typeof v === "string" && v) as [string, string][]
    ).toString();
    redirect(`/panel/teklifler/yeni?${q}`);
  }

  const [musteriler, tumTeklifler, kullanicilar] = await Promise.all([
    prisma.musteri.findMany({ orderBy: { ad: "asc" }, select: { id: true, ad: true } }),
    prisma.teklif.findMany({
      where: {
        ...(searchParams.musteri ? { musteriId: searchParams.musteri } : {}),
        ...(searchParams.hazirlayan ? { olusturanKullaniciId: searchParams.hazirlayan } : {}),
        ...(searchParams.proje ? { baslik: { contains: searchParams.proje, mode: "insensitive" } } : {}),
        ...(searchParams.no ? { teklifNo: Number(searchParams.no) || -1 } : {}),
        ...durumFiltresi(searchParams.durum),
        ...(searchParams.baslangic || searchParams.bitis
          ? {
              tarih: {
                ...(searchParams.baslangic ? { gte: new Date(searchParams.baslangic) } : {}),
                ...(searchParams.bitis ? { lte: new Date(searchParams.bitis + "T23:59:59") } : {}),
              },
            }
          : {}),
      },
      include: {
        musteri: true,
        kalemler: true,
        siparis: true,
        olusturanKullanici: true,
        revizyonlar: { select: { tarih: true } },
        proje: { select: { ad: true } },
        yetkili: { select: { ad: true } },
      },
      orderBy: { tarih: "desc" },
    }),
    prisma.kullanici.findMany({ select: { id: true, ad: true }, orderBy: { ad: "asc" } }),
  ]);

  const min = searchParams.min ? Number(searchParams.min) : null;
  const max = searchParams.max ? Number(searchParams.max) : null;

  const teklifler = tumTeklifler.filter((t) => {
    if (min === null && max === null) return true;
    const toplam = teklifToplamlari(t).araToplam; // KDV hariç net (listede gösterilenle aynı)
    if (min !== null && toplam < min) return false;
    if (max !== null && toplam > max) return false;
    return true;
  });

  // "s" (sayfa) ve "ara" (hızlı arama) listenin kendi parametreleridir; filtre sayılmaz
  const filtreler = Object.entries(searchParams).filter(([k, v]) => v && !["s", "ara", "mesaj", "basarili"].includes(k)) as [string, string][];
  const filtreVar = filtreler.length > 0;
  const disaAktarQuery = new URLSearchParams(filtreler).toString();

  // Kaybedilen tekliflerin nedenleri (filtreye uyan teklifler içinden)
  const redler = teklifler.filter((t) => t.durum === "REDDEDILDI" && t.redNedeni);
  const redDagilimi = RED_NEDENLERI.map((n) => ({ ...n, adet: redler.filter((t) => t.redNedeni === n.kod).length })).filter((n) => n.adet > 0);
  const rakipler = Array.from(
    redler.reduce((m, t) => (t.redRakip ? m.set(t.redRakip.trim(), (m.get(t.redRakip.trim()) ?? 0) + 1) : m), new Map<string, number>())
  ).sort((a, b) => b[1] - a[1]);
  const musteriOnaylari = teklifler.filter((t) => t.musteriOnayTarihi).length;


  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
          <h1 className="font-display text-2xl font-semibold text-metin">Teklifler</h1>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/export/teklifler${disaAktarQuery ? `?${disaAktarQuery}` : ""}`}
            className="focus-ring text-sm font-medium text-metin/70 border border-hat px-4 py-2 rounded-md hover:border-soguk hover:text-soguk-dim transition-colors"
          >
            Excel&apos;e Aktar
          </a>
          <Link
            href="/panel/teklifler/yeni"
            className="focus-ring bg-soguk text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-soguk-dim transition-colors"
          >
            + Yeni Teklif
          </Link>
        </div>
      </div>


      {/* KAYBEDİLEN TEKLİFLERİN NEDENLERİ */}
      {redDagilimi.length > 0 && (
        <details className="bg-yuzey border border-hat rounded-lg mb-4">
          <summary className="cursor-pointer select-none px-5 py-3 text-sm font-medium text-metin/70">
            📉 Kaybedilen teklifler: neden? <span className="text-metin/40">({redler.length} teklif{filtreVar ? ", filtreye göre" : ""})</span>
            {musteriOnaylari > 0 && <span className="ml-3 text-emerald-700">· ✅ {musteriOnaylari} teklif müşteri tarafından linkten onaylandı</span>}
          </summary>
          <div className="px-5 pb-5 grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              {redDagilimi.map((n) => (
                <div key={n.kod}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-metin/80">{n.ad}</span>
                    <span className="font-mono text-metin/60">
                      {n.adet} · %{Math.round((n.adet / redler.length) * 100)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-zemin overflow-hidden">
                    <div className="h-full bg-sicak rounded-full" style={{ width: `${(n.adet / redler.length) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-metin/60 mb-2">İşi alan firmalar</p>
              {rakipler.length === 0 ? (
                <p className="text-xs text-metin/40">Henüz rakip firma yazılmamış.</p>
              ) : (
                <ul className="text-xs space-y-1">
                  {rakipler.slice(0, 8).map(([ad, adet]) => (
                    <li key={ad} className="flex justify-between border-b border-hat/60 py-1">
                      <span className="text-metin/80">{ad}</span>
                      <span className="font-mono text-metin/60">{adet}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-[11px] text-metin/40 mt-3">Teklif durumunu &quot;Reddedildi&quot; yaparken seçilen nedenlerden hesaplanır.</p>
            </div>
          </div>
        </details>
      )}

      {/* TEKLİFLER LİSTESİ — yazdıkça anında süzülür */}
      <HizliAramaListesi
        yerTutucu="Hızlı ara: proje / teklif adı, müşteri, teklif no, hazırlayan, yetkili…"
        bosMetin={filtreVar ? "Bu filtreye uyan teklif yok." : "Henüz teklif yok."}
        birim="teklif"
        araAlan={
          <details className="bg-yuzey border border-hat rounded-lg mb-4" open={filtreVar}>
            <summary className="cursor-pointer select-none px-5 py-3 text-sm font-medium text-metin/70">
              Gelişmiş filtre (tarih, tutar, hazırlayan…) {filtreVar && <span className="text-soguk-dim">(aktif)</span>}
            </summary>
            <form method="get" className="p-5 pt-0 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">Teklif No</label>
                <input name="no" type="number" defaultValue={searchParams.no ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white" placeholder="örn. 12" />
              </div>
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">Müşteri</label>
                <select name="musteri" defaultValue={searchParams.musteri ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">Tümü</option>
                  {musteriler.map((m) => (
                    <option key={m.id} value={m.id}>{m.ad}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-soguk-dim mb-1">Teklif Durumu</label>
                <select name="durum" defaultValue={searchParams.durum ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">Tümü</option>
                  {DURUM_FILTRELERI.map((d) => (
                    <option key={d.kod} value={d.kod}>{d.ad}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-soguk-dim mb-1">Hazırlayan Personel</label>
                <select name="hazirlayan" defaultValue={searchParams.hazirlayan ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">Tümü</option>
                  {kullanicilar.map((k) => (
                    <option key={k.id} value={k.id}>{k.ad}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">Proje Adı</label>
                <input name="proje" defaultValue={searchParams.proje ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white" placeholder="ara..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">Başlangıç Tarihi</label>
                <input name="baslangic" type="date" defaultValue={searchParams.baslangic ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">Bitiş Tarihi</label>
                <input name="bitis" type="date" defaultValue={searchParams.bitis ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-metin/60 mb-1">Min (KDV hariç)</label>
                  <input name="min" type="number" defaultValue={searchParams.min ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-metin/60 mb-1">Max (KDV hariç)</label>
                  <input name="max" type="number" defaultValue={searchParams.max ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white" />
                </div>
              </div>
              <div className="sm:col-span-2 lg:col-span-4 flex gap-3">
                <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors">
                  Filtrele
                </button>
                {filtreVar && (
                  <Link href="/panel/teklifler" className="focus-ring text-sm text-metin/60 hover:text-metin px-2 py-2">
                    Filtreyi temizle
                  </Link>
                )}
              </div>
            </form>
          </details>
        }
        satirlar={teklifler.map((t) => {
          const toplam = teklifToplamlari(t).araToplam;
          const ilkTarih = ilkHazirlanmaTarihi(t);
          const hazirlayanPersonel = t.olusturanKullanici?.ad || t.olusturanAdi || "—";
          const aramaMetni = [
            teklifNoFormat(t.teklifNo),
            String(t.teklifNo),
            t.baslik,
            t.musteri.ad,
            t.proje?.ad,
            hazirlayanPersonel,
            t.yetkili?.ad || t.musteri.yetkiliAdi,
            t.durum === "REDDEDILDI" ? redNedeniAdi(t.redNedeni) : null,
            t.durum === "REDDEDILDI" ? t.redRakip : null,
          ]
            .filter(Boolean)
            .join(" ");

          return {
            id: t.id,
            aramaMetni,
            icerik: (
              <div className="bg-yuzey border border-hat rounded-lg p-4 flex items-center justify-between gap-3 shadow-sm hover:border-soguk transition-colors">
                <Link href={`/panel/teklifler/${t.id}`} className="focus-ring min-w-0 flex-1">
                  <p className="font-medium text-metin text-sm hover:text-soguk-dim transition-colors truncate">
                    <span className="font-mono text-soguk-dim font-bold">{teklifNoFormat(t.teklifNo)}</span>{" "}
                    {t.baslik || "(Başlıksız Teklif)"}
                  </p>
                  <div className="text-xs text-metin/60 flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                    <span className="font-semibold text-metin">{t.musteri.ad}</span>
                    {t.proje && <span className="text-metin/50">· 📁 {t.proje.ad}</span>}
                    <span>·</span>
                    <span title="İlk hazırlanma tarihi">{tarihYaz(ilkTarih)}</span>
                    {t.revizyonNo > 1 && <span title="Son revizyon tarihi">(rev. {tarihYaz(t.tarih)})</span>}
                    <span>·</span>
                    <span>{t.kalemler.length} kalem</span>
                    {t.revizyonNo > 1 && <span>· Rev. {t.revizyonNo}</span>}

                    <span className="bg-soguk-light/40 text-soguk-dim px-2 py-0.5 rounded font-bold text-[11px] border border-soguk/20">
                      👤 Hazırlayan: {hazirlayanPersonel}
                    </span>

                    {t.siparis && <span className="text-emerald-700 font-bold">· Siparişe dönüştürüldü</span>}
                    {t.durum === "ONAYLANDI" && t.musteriOnayTarihi && (
                      <span className="text-emerald-700 font-semibold">· ✅ Müşteri linkten onayladı</span>
                    )}
                    {t.durum === "REDDEDILDI" && t.redNedeni && (
                      <span className="text-sicak-dim font-semibold">
                        · ❌ {redNedeniAdi(t.redNedeni)}
                        {t.redRakip && ` (${t.redRakip})`}
                      </span>
                    )}
                    {t.kopyaKaynakTeklifNo && (
                      <span className="text-metin/40 italic">· TKL-{String(t.kopyaKaynakTeklifNo).padStart(4, "0")} kopyası</span>
                    )}
                  </div>
                </Link>
                <div className="text-right flex flex-wrap items-center justify-end gap-x-3 gap-y-1 shrink-0">
                  <div>
                    <p className="font-mono text-metin font-bold">{paraFormat(toplam, t.paraBirimi)}</p>
                    <p className="text-[10px] text-metin/40">KDV hariç</p>
                  </div>
                  <TeklifDurumSecici teklifId={t.id} mevcutDurum={t.durum} />
                  <TeklifOnizleButon teklifId={t.id} baslik={`${teklifNoFormat(t.teklifNo)} ${t.baslik || ""}`.trim()} />
                  <a
                    href={`/panel/teklifler/${t.id}?yazdir=1`}
                    target="_blank"
                    rel="noopener"
                    className="focus-ring text-xs text-metin/40 hover:text-soguk-dim font-medium"
                  >
                    Yazdır
                  </a>
                  <Link href={`/panel/teklifler/${t.id}/duzenle`} className="focus-ring text-xs text-metin/40 hover:text-soguk-dim font-medium">
                    Düzenle
                  </Link>
                  <Link href={`/panel/teklifler/${t.id}/kopyala`} className="focus-ring text-xs text-metin/40 hover:text-soguk-dim font-medium">
                    Kopyala
                  </Link>
                  <SilButon id={t.id} action={teklifSil} onayMesaji="Bu teklifi silmek istediğine emin misin?" />
                </div>
              </div>
            ),
          };
        })}
      />
    </div>
  );
}