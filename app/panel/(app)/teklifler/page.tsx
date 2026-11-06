import { prisma } from "@/lib/prisma";
import { GERCEK_MUSTERI, MUSTERISIZ_ID, musterisizMi, musteriEtiketi } from "@/lib/musterisiz";
import { teklifSil } from "@/lib/actions";
import TeklifDurumSecici from "@/components/TeklifDurumSecici";
import SilButon from "@/components/SilButon";
import TeklifOnizleButon from "@/components/TeklifOnizleButon";
import HizliAramaListesi from "@/components/HizliAramaListesi";
import Link from "next/link";
import { redirect } from "next/navigation";
import { teklifToplamlari, ilkHazirlanmaTarihi, tarihYaz } from "@/lib/teklif-hesap";
import { RED_NEDENLERI, redNedeniAdi, DURUM_FILTRELERI } from "@/lib/teklif-durum";

function paraFormat(n: number, paraBirimi: string = "TRY") {
  return n.toLocaleString("tr-TR", { style: "currency", currency: paraBirimi });
}

function teklifNoFormat(no: number) {
  return `TKL-${String(no).padStart(4, "0")}`;
}

// ---- Liste görünümü yardımcıları ----
const DURUM_RENGI: Record<string, string> = { BEKLEMEDE: "#E0A43A", ONAYLANDI: "#2E9E68", REDDEDILDI: "#E8734A" };
const etiket = "text-[11px] font-bold px-1.5 py-px rounded border";
const ikonDugme =
  "focus-ring w-8 h-8 grid place-items-center rounded-lg border border-hat bg-white text-metin/50 hover:text-soguk-dim hover:border-soguk transition-colors";

function Ikon({ d }: { d: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

// "Ersin Sekmen" → "ES"
function basHarfler(ad: string) {
  const p = ad.trim().split(/\s+/).filter(Boolean);
  if (!p.length || ad === "—") return "?";
  return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : "")).toLocaleUpperCase("tr-TR");
}

// Para birimine göre toplamlar: "$318.400 · €96.750"
function toplamYaz(liste: { toplam: number; paraBirimi: string }[]) {
  const m = new Map<string, number>();
  for (const x of liste) m.set(x.paraBirimi, (m.get(x.paraBirimi) ?? 0) + x.toplam);
  return [...m.entries()].map(([pb, n]) => n.toLocaleString("tr-TR", { style: "currency", currency: pb, maximumFractionDigits: 0 })).join(" · ") || "—";
}

// Türkiye saatine göre gün (YYYY-AA-GG) ve listede gün başlıkları
const TZ = "Europe/Istanbul";
const gunAnahtari = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(d));
function grupAdiOlustur(simdi: Date) {
  const bugun = gunAnahtari(simdi);
  const dun = gunAnahtari(new Date(simdi.getTime() - 86400000));
  return (d: Date) => {
    const g = gunAnahtari(d);
    const gunAy = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, day: "numeric", month: "long" }).format(new Date(d));
    if (g === bugun) return `Bugün · ${gunAy}`;
    if (g === dun) return `Dün · ${gunAy}`;
    const fark = (Date.parse(bugun) - Date.parse(g)) / 86400000;
    if (fark > 0 && fark < 7) return `${gunAy} ${new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, weekday: "long" }).format(new Date(d))}`;
    return new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, month: "long", year: "numeric" }).format(new Date(d));
  };
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
    prisma.musteri.findMany({ where: GERCEK_MUSTERI, orderBy: { ad: "asc" }, select: { id: true, ad: true } }),
    prisma.teklif.findMany({
      where: {
        ...(searchParams.musteri ? { musteriId: searchParams.musteri } : {}),
        ...(searchParams.hazirlayan ? { olusturanKullaniciId: searchParams.hazirlayan } : {}),
        ...(searchParams.proje ? { baslik: { contains: searchParams.proje, mode: "insensitive" } } : {}),
        ...(searchParams.no ? { teklifNo: Number(searchParams.no) || -1 } : {}),
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

  // Durum dışındaki filtrelere uyan teklifler (özet kutuları ve durum düğmelerinin sayıları buradan)
  const aralik = tumTeklifler.filter((t) => {
    if (min === null && max === null) return true;
    const toplam = teklifToplamlari(t).araToplam; // KDV hariç net (listede gösterilenle aynı)
    if (min !== null && toplam < min) return false;
    if (max !== null && toplam > max) return false;
    return true;
  });
  // Durum filtresi (lib/teklif-durum durumFiltresi ile aynı anlam): listede yalnız seçilen durum
  const durumKodu = searchParams.durum ?? "";
  const durumUyar = (t: (typeof aralik)[number]) =>
    durumKodu === "BEKLEMEDE" || durumKodu === "ONAYLANDI" || durumKodu === "REDDEDILDI"
      ? t.durum === durumKodu
      : durumKodu === "LINK_ONAY"
        ? t.durum === "ONAYLANDI" && !!t.musteriOnayTarihi
        : true;
  const teklifler = aralik.filter(durumUyar);

  // ÖZET KUTULARI (durum dışındaki filtrelere göre)
  const simdi = new Date();
  const grupAdi = grupAdiOlustur(simdi);
  const tutarli = (l: typeof aralik) => l.map((t) => ({ toplam: teklifToplamlari(t).araToplam, paraBirimi: t.paraBirimi }));
  const bekleyen = aralik.filter((t) => t.durum === "BEKLEMEDE");
  const onaylanan = aralik.filter((t) => t.durum === "ONAYLANDI");
  const kaybedilen = aralik.filter((t) => t.durum === "REDDEDILDI");
  const buAy = gunAnahtari(simdi).slice(0, 7);
  const buAyHazirlanan = aralik.filter((t) => gunAnahtari(ilkHazirlanmaTarihi(t)).slice(0, 7) === buAy).length;
  const sonuclanan = onaylanan.length + kaybedilen.length;
  const enCokNeden = RED_NEDENLERI.map((n) => ({ ad: n.ad, adet: kaybedilen.filter((t) => t.redNedeni === n.kod).length }))
    .filter((n) => n.adet > 0)
    .sort((a, b) => b.adet - a.adet)[0];

  // "s" (sayfa) ve "ara" (hızlı arama) listenin kendi parametreleridir; filtre sayılmaz
  const filtreler = Object.entries(searchParams).filter(([k, v]) => v && !["s", "ara", "mesaj", "basarili"].includes(k)) as [string, string][];
  const filtreVar = filtreler.length > 0;
  const disaAktarQuery = new URLSearchParams(filtreler).toString();
  // Durum düğmeleri: diğer filtreler korunur, yalnız durum değişir
  const durumsuz = filtreler.filter(([k]) => k !== "durum");
  const digerFiltreVar = durumsuz.length > 0;
  const durumAdresi = (kod: string) => {
    const q = new URLSearchParams(durumsuz);
    if (kod) q.set("durum", kod);
    const s = q.toString();
    return `/panel/teklifler${s ? `?${s}` : ""}`;
  };
  const durumDugmeleri = [
    { kod: "", ad: "Tümü", adet: aralik.length },
    { kod: "BEKLEMEDE", ad: "Beklemede", adet: bekleyen.length },
    { kod: "ONAYLANDI", ad: "Onaylandı", adet: onaylanan.length },
    { kod: "REDDEDILDI", ad: "Reddedildi", adet: kaybedilen.length },
  ];
  const ozetKutulari = [
    { ad: "Beklemede", renk: DURUM_RENGI.BEKLEMEDE, deger: `${bekleyen.length} teklif`, alt: toplamYaz(tutarli(bekleyen)), kod: "BEKLEMEDE" },
    { ad: "Onaylanan", renk: DURUM_RENGI.ONAYLANDI, deger: `${onaylanan.length} teklif`, alt: toplamYaz(tutarli(onaylanan)), kod: "ONAYLANDI" },
    {
      ad: "Kaybedilen",
      renk: DURUM_RENGI.REDDEDILDI,
      deger: `${kaybedilen.length} teklif`,
      alt: enCokNeden ? `en çok: ${enCokNeden.ad} (${enCokNeden.adet})` : toplamYaz(tutarli(kaybedilen)),
      kod: "REDDEDILDI",
    },
    {
      ad: "Bu ay hazırlanan",
      renk: "#0E7C86",
      deger: `${buAyHazirlanan} teklif`,
      alt: sonuclanan ? `kazanma oranı %${Math.round((onaylanan.length / sonuclanan) * 100)} (${onaylanan.length}/${sonuclanan} sonuçlanan)` : "henüz sonuçlanan teklif yok",
      kod: null,
    },
  ];

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


      {/* ÖZET KUTULARI (tıklayınca o duruma süzülür) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {ozetKutulari.map((k) => {
          const ic = (
            <>
              <span aria-hidden className="absolute left-0 inset-y-0 w-1" style={{ background: k.renk }} />
              <span className="flex justify-between text-xs font-semibold text-metin/60">
                {k.ad}
                {digerFiltreVar && <span className="font-normal text-metin/40">filtreye göre</span>}
              </span>
              <span className="block font-display text-2xl font-extrabold tracking-tight text-metin mt-1">{k.deger}</span>
              <span className="block font-mono text-[11px] text-metin/50 mt-0.5 truncate" title={k.alt}>
                {k.alt}
              </span>
            </>
          );
          const sinif = "relative block bg-yuzey border border-hat rounded-xl pl-4 pr-3 py-3 overflow-hidden";
          return k.kod ? (
            <Link key={k.ad} href={durumAdresi(k.kod)} className={`focus-ring ${sinif} hover:border-soguk transition-colors`}>
              {ic}
            </Link>
          ) : (
            <div key={k.ad} className={sinif}>
              {ic}
            </div>
          );
        })}
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
          <>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {durumDugmeleri.map((d) => {
              const secili = durumKodu === d.kod;
              return (
                <Link
                  key={d.kod || "tumu"}
                  href={durumAdresi(d.kod)}
                  aria-current={secili ? "page" : undefined}
                  className={`focus-ring inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                    secili ? "bg-metin border-metin text-white" : "bg-white border-hat text-metin/70 hover:border-soguk"
                  }`}
                >
                  {d.kod && <span aria-hidden className="w-2 h-2 rounded-full" style={{ background: DURUM_RENGI[d.kod] }} />}
                  {d.ad}
                  <span className={`font-mono text-xs ${secili ? "text-white/70" : "text-metin/40"}`}>{d.adet}</span>
                </Link>
              );
            })}
            {durumKodu === "LINK_ONAY" && (
              <span className="inline-flex items-center rounded-full border border-metin bg-metin text-white px-3.5 py-1.5 text-sm font-semibold">
                Onaylandı (müşteri linkten) <span className="font-mono text-xs text-white/70 ml-1.5">{teklifler.length}</span>
              </span>
            )}
          </div>
          <details className="bg-yuzey border border-hat rounded-lg mb-4" open={digerFiltreVar}>
            <summary className="cursor-pointer select-none px-5 py-3 text-sm font-medium text-metin/70">
              Gelişmiş filtre (tarih, tutar, hazırlayan…) {digerFiltreVar && <span className="text-soguk-dim">(aktif)</span>}
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
                  <option value={MUSTERISIZ_ID}>◌ Müşterisiz teklifler</option>
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
          </>
        }
        satirlar={teklifler.map((t) => {
          const toplam = teklifToplamlari(t).araToplam;
          const ilkTarih = ilkHazirlanmaTarihi(t);
          const hazirlayanPersonel = t.olusturanKullanici?.ad || t.olusturanAdi || "—";
          const aramaMetni = [
            teklifNoFormat(t.teklifNo),
            String(t.teklifNo),
            t.baslik,
            musteriEtiketi(t.musteriId, t.musteri.ad, t.muhatap),
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
            grup: grupAdi(t.tarih),
            icerik: (
              <div className="relative bg-yuzey border border-hat rounded-xl flex overflow-hidden shadow-sm hover:border-soguk hover:shadow-md transition-all">
                {/* Durum rengi: turuncu beklemede, yeşil onaylandı, kırmızı reddedildi */}
                <span aria-hidden className="absolute left-0 inset-y-0 w-[5px]" style={{ background: DURUM_RENGI[t.durum] ?? "#D7E0E1" }} />
                <div className="flex-1 min-w-0 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pl-5 pr-4 py-3.5">
                  <Link href={`/panel/teklifler/${t.id}`} className="focus-ring min-w-0 flex-1 flex items-center gap-3.5 group">
                    <span
                      className="hidden sm:grid w-10 h-10 shrink-0 rounded-full bg-soguk-light text-soguk-dim border border-soguk/20 place-items-center text-xs font-extrabold"
                      title={`Hazırlayan: ${hazirlayanPersonel}`}
                    >
                      {basHarfler(hazirlayanPersonel)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[11px] font-bold text-soguk-dim bg-soguk-light rounded px-1.5 py-0.5 shrink-0">
                          {teklifNoFormat(t.teklifNo)}
                        </span>
                        <span className="font-semibold text-metin text-[15px] truncate group-hover:text-soguk-dim transition-colors">
                          {t.baslik || "(Başlıksız Teklif)"}
                        </span>
                      </span>
                      <span className="text-xs text-metin/60 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                        {musterisizMi(t.musteriId) ? (
                          <span className="font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5" title="Müşteri henüz bağlanmadı">
                            {musteriEtiketi(t.musteriId, t.musteri.ad, t.muhatap)}
                          </span>
                        ) : (
                          <span className="font-bold text-metin">{t.musteri.ad}</span>
                        )}
                        {t.proje && <span className="text-metin/50">📁 {t.proje.ad}</span>}
                        <span title="İlk hazırlanma tarihi">
                          {tarihYaz(ilkTarih)}
                          {t.revizyonNo > 1 && <span className="text-metin/45" title="Son revizyon tarihi"> (rev. {tarihYaz(t.tarih)})</span>}
                        </span>
                        <span>{t.kalemler.length} kalem</span>
                        <span className="sm:hidden">👤 {hazirlayanPersonel}</span>
                        {t.revizyonNo > 1 && <span className={`${etiket} text-amber-800 bg-amber-50 border-amber-200`}>Rev. {t.revizyonNo}</span>}
                        {t.siparis && <span className={`${etiket} text-emerald-800 bg-emerald-50 border-emerald-200`}>Siparişe dönüştü</span>}
                        {t.durum === "ONAYLANDI" && t.musteriOnayTarihi && (
                          <span className={`${etiket} text-emerald-800 bg-emerald-50 border-emerald-200`}>✓ Müşteri linkten onayladı</span>
                        )}
                        {t.durum === "REDDEDILDI" && t.redNedeni && (
                          <span className={`${etiket} text-sicak-dim bg-sicak-light border-sicak/30`}>
                            ✕ {redNedeniAdi(t.redNedeni)}
                            {t.redRakip && ` (${t.redRakip})`}
                          </span>
                        )}
                        {t.kopyaKaynakTeklifNo && (
                          <span className={`${etiket} text-metin/50 bg-zemin border-hat font-medium`}>
                            TKL-{String(t.kopyaKaynakTeklifNo).padStart(4, "0")} kopyası
                          </span>
                        )}
                      </span>
                    </span>
                  </Link>
                  <div className="flex flex-wrap items-center justify-end gap-3 shrink-0">
                    <div className="text-right min-w-[7.5rem]">
                      <p className="font-mono text-metin font-bold text-base leading-tight">{paraFormat(toplam, t.paraBirimi)}</p>
                      <p className="text-[10px] text-metin/40">KDV hariç</p>
                    </div>
                    <TeklifDurumSecici teklifId={t.id} mevcutDurum={t.durum} renkli />
                    <div className="flex items-center gap-1">
                      <TeklifOnizleButon teklifId={t.id} baslik={`${teklifNoFormat(t.teklifNo)} ${t.baslik || ""}`.trim()} ikonSinifi={ikonDugme} />
                      <a href={`/panel/teklifler/${t.id}?yazdir=1`} target="_blank" rel="noopener" className={ikonDugme} title="Yazdır" aria-label="Yazdır">
                        <Ikon d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
                      </a>
                      <Link href={`/panel/teklifler/${t.id}/duzenle`} className={ikonDugme} title="Düzenle" aria-label="Düzenle">
                        <Ikon d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                      </Link>
                      <Link href={`/panel/teklifler/${t.id}/kopyala`} className={ikonDugme} title="Kopyala" aria-label="Kopyala">
                        <Ikon d="M9 9h13v13H9zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </Link>
                      <SilButon
                        id={t.id}
                        action={teklifSil}
                        onayMesaji="Bu teklifi silmek istediğine emin misin?"
                        ikonSinifi={`${ikonDugme} hover:!text-sicak-dim hover:!border-sicak/50 disabled:opacity-50`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ),
          };
        })}
      />
    </div>
  );
}