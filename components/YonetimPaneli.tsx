import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { siparisNetTutari } from "@/lib/siparis-tutari";
import { sasTl, maliyeteSayilirMi } from "@/lib/satinalma-siparis";
import { teklifToplamlari } from "@/lib/teklif-hesap";
import { getTcmbKurlari, tcmbKuru } from "@/lib/kur";
import { alacakYaslandirma, YAS_DILIMLERI } from "@/lib/finans";
import { kalemAnahtari } from "@/lib/satinalma-kapsam";

// -----------------------------------------------------------------------------
// YÖNETİM PANELİ (Özet sayfasının üstü; yalnız Admin ve Yönetici)
// Tüm tutarlar KDV HARİÇ ve TL'dir. Dövizli siparişler kendi kuruyla (faturada farklı kur
// kullanıldıysa fatura kuruyla), satınalmalar kendi kuruyla çevrilir. Kuru olmayan eski dövizli
// kayıtlar ve açık teklifler bugünkü TCMB döviz satış kuruyla yaklaşık çevrilir (≈).
// Ciro: admin onayı almış (iptal / red olmayan) siparişler, onay tarihine göre.
// Brüt kâr: satış − siparişe bağlı (iptal / red olmayan) satınalmalar; montaj / işçilik dahil değildir.
// -----------------------------------------------------------------------------

const GUN = 24 * 3600 * 1000;
const tl = (n: number) => n.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const kisa = (n: number) => {
  const m = Math.abs(n);
  if (m >= 1e6) return `${(n / 1e6).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} Mn`;
  if (m >= 1e3) return `${(n / 1e3).toLocaleString("tr-TR", { maximumFractionDigits: 0 })} B`;
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
};
const yuzde = (n: number) => `%${n.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`;

// Türkiye saatine göre "YYYY-MM"
const ayKodu = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit" }).format(d).slice(0, 7);
const AY_ADI = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function sonOnIkiAy(): string[] {
  const [y, m] = ayKodu(new Date()).split("-").map(Number);
  const liste: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const t = new Date(Date.UTC(y, m - 1 - i, 15));
    liste.push(`${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return liste;
}

type SatilanKalem = { aciklama: string; adet: number };
function satilanKalemler(kalemlerJson: string | null, teklifKalemleri: SatilanKalem[]): SatilanKalem[] {
  if (kalemlerJson) {
    try {
      const j = JSON.parse(kalemlerJson);
      if (Array.isArray(j) && j.length) return j.filter((k) => k && typeof k.aciklama === "string");
    } catch {
      /* teklifin kalemleri */
    }
  }
  return teklifKalemleri;
}

export default async function YonetimPaneli() {
  const simdi = new Date();
  const aylar = sonOnIkiAy();
  const buAy = aylar[11];
  const gecenAy = aylar[10];
  const buYil = buAy.slice(0, 4);
  const onIkiAyOnce = new Date(simdi.getTime() - 400 * GUN);
  const doksanGunOnce = new Date(simdi.getTime() - 90 * GUN);
  const ondortGunOnce = new Date(simdi.getTime() - 14 * GUN);
  const onbesGunSonra = new Date(simdi.getTime() + 15 * GUN);

  const [
    kurlar,
    siparisler,
    acikSiparisler,
    bekleyenTeklifler,
    kazanilanSayi,
    kaybedilenSayi,
    onayliDonusmemis,
    takipBekleyen,
    sasDurumlari,
    faturaBekleyenSas,
    cariToplam,
    tedarikciToplam,
    yaslandirma,
    yaklasanTahsilat,
    yaklasanOdeme,
  ] = await Promise.all([
    getTcmbKurlari(),
    prisma.siparis.findMany({
      where: { onayTarihi: { gte: onIkiAyOnce }, durum: { notIn: ["IPTAL", "REDDEDILDI", "ONAY_BEKLIYOR"] } },
      select: {
        id: true,
        durum: true,
        onayTarihi: true,
        tutarNet: true,
        paraBirimi: true,
        kur: true,
        faturaKur: true,
        kalemlerJson: true,
        olusturanAdi: true,
        musteri: { select: { id: true, ad: true } },
        teklif: { select: { teklifNo: true, baslik: true, paraBirimi: true, olusturanAdi: true, kalemler: { select: { aciklama: true, adet: true, birimFiyat: true, iskontoYuzde: true } } } },
        satinalmaSiparisleri: { select: { durum: true, tutarNet: true, kur: true, paraBirimi: true, kalemler: { select: { aciklama: true, adet: true } } } },
      },
      orderBy: { onayTarihi: "desc" },
    }),
    prisma.siparis.groupBy({ by: ["durum"], _count: { _all: true }, where: { durum: { notIn: ["IPTAL", "REDDEDILDI"] } } }),
    prisma.teklif.findMany({
      where: { durum: "BEKLEMEDE", arsivTarihi: null },
      select: { paraBirimi: true, kdvDahil: true, kdvOrani: true, kalemler: { select: { adet: true, birimFiyat: true, iskontoYuzde: true } } },
    }),
    prisma.teklif.count({ where: { durum: "ONAYLANDI", tarih: { gte: doksanGunOnce } } }),
    prisma.teklif.count({ where: { durum: "REDDEDILDI", tarih: { gte: doksanGunOnce } } }),
    prisma.teklif.count({
      where: { durum: "ONAYLANDI", arsivTarihi: null, OR: [{ siparis: { is: null } }, { siparis: { is: { durum: { in: ["IPTAL", "REDDEDILDI"] } } } }] },
    }),
    prisma.teklif.count({ where: { durum: "BEKLEMEDE", arsivTarihi: null, tarih: { lt: ondortGunOnce } } }),
    prisma.satinalmaSiparisi.groupBy({ by: ["durum"], _count: { _all: true } }),
    prisma.satinalmaSiparisi.count({ where: { durum: { in: ["KISMEN_TESLIM", "TESLIM_ALINDI"] }, faturalar: { none: { iptalTarihi: null } } } }),
    prisma.cariHareket.groupBy({ by: ["tur"], _sum: { tutar: true }, where: { iptalTarihi: null } }),
    prisma.tedarikciHareket.groupBy({ by: ["tur"], _sum: { tutar: true }, where: { iptalTarihi: null } }),
    alacakYaslandirma(simdi),
    prisma.cariHareket.aggregate({ _sum: { tutar: true }, _count: { _all: true }, where: { iptalTarihi: null, tur: "ALACAK", vadeTarihi: { gte: simdi, lte: onbesGunSonra } } }),
    prisma.tedarikciHareket.aggregate({ _sum: { tutar: true }, _count: { _all: true }, where: { iptalTarihi: null, tur: "ODEME", vadeTarihi: { gte: simdi, lte: onbesGunSonra } } }),
  ]);

  // --- Sipariş bazında satış / maliyet (TL, KDV hariç) ---
  const satirlar = siparisler.map((s) => {
    const pb = s.paraBirimi ?? s.teklif.paraBirimi;
    const net = siparisNetTutari({ tutarNet: s.tutarNet, teklif: { kalemler: s.teklif.kalemler } });
    const kayitliKur = s.faturaKur ?? s.kur;
    let yaklasik = false;
    let kur = 1;
    if (pb !== "TRY") {
      if (kayitliKur && kayitliKur !== 1) kur = kayitliKur;
      else {
        kur = tcmbKuru(kurlar, pb, "TCMB_DOVIZ") ?? 0;
        yaklasik = true;
      }
    }
    const satis = net * kur;
    const aktifSas = s.satinalmaSiparisleri.filter((x) => maliyeteSayilirMi(x.durum));
    const maliyet = aktifSas.reduce((a, x) => a + sasTl(x), 0);
    // Satılandan fazla alım (aynı malın iki kez sipariş edilmesi)
    const satilan = new Map<string, number>();
    for (const k of satilanKalemler(s.kalemlerJson, s.teklif.kalemler)) satilan.set(kalemAnahtari(k.aciklama), (satilan.get(kalemAnahtari(k.aciklama)) ?? 0) + Number(k.adet));
    const alinan = new Map<string, number>();
    for (const x of aktifSas) for (const k of x.kalemler) alinan.set(kalemAnahtari(k.aciklama), (alinan.get(kalemAnahtari(k.aciklama)) ?? 0) + k.adet);
    const fazlaAlim = [...alinan].some(([a, adet]) => satilan.has(a) && adet > (satilan.get(a) ?? 0) + 1e-9);
    return {
      ...s,
      ay: s.onayTarihi ? ayKodu(s.onayTarihi) : "",
      pb,
      satis,
      maliyet,
      maliyetVar: aktifSas.length > 0,
      kar: satis - maliyet,
      yaklasik,
      fazlaAlim,
    };
  });

  const ayToplam = (ay: string) => satirlar.filter((s) => s.ay === ay).reduce((a, s) => a + s.satis, 0);
  const ciroBuAy = ayToplam(buAy);
  const ciroGecenAy = ayToplam(gecenAy);
  const ciroDegisim = ciroGecenAy > 0 ? ((ciroBuAy - ciroGecenAy) / ciroGecenAy) * 100 : null;
  const yilSiparisleri = satirlar.filter((s) => s.ay.startsWith(buYil));
  const ciroYil = yilSiparisleri.reduce((a, s) => a + s.satis, 0);
  const maliyetliYil = yilSiparisleri.filter((s) => s.maliyetVar);
  const karYil = maliyetliYil.reduce((a, s) => a + s.kar, 0);
  const karSatisYil = maliyetliYil.reduce((a, s) => a + s.satis, 0);
  const marjYil = karSatisYil > 0 ? (karYil / karSatisYil) * 100 : null;
  const yaklasikVar = satirlar.some((s) => s.yaklasik);

  // Aylık grafik
  const aylik = aylar.map((ay) => {
    const l = satirlar.filter((s) => s.ay === ay);
    return { ay, ciro: l.reduce((a, s) => a + s.satis, 0), maliyet: l.reduce((a, s) => a + s.maliyet, 0), adet: l.length };
  });
  const grafikMax = Math.max(1, ...aylik.map((a) => Math.max(a.ciro, a.maliyet)));

  // Açık teklif hacmi (bugünkü kurla yaklaşık)
  let acikTeklifTl = 0;
  let kursuzTeklif = 0;
  for (const t of bekleyenTeklifler) {
    const net = teklifToplamlari({ kalemler: t.kalemler, kdvDahil: t.kdvDahil, kdvOrani: t.kdvOrani }).araToplam;
    if (t.paraBirimi === "TRY") acikTeklifTl += net;
    else {
      const k = tcmbKuru(kurlar, t.paraBirimi, "TCMB_DOVIZ");
      if (k) acikTeklifTl += net * k;
      else kursuzTeklif++;
    }
  }
  const kazanmaOrani = kazanilanSayi + kaybedilenSayi > 0 ? (kazanilanSayi / (kazanilanSayi + kaybedilenSayi)) * 100 : null;

  // Cari
  const cariBorc = cariToplam.find((c) => c.tur === "BORC")?._sum.tutar ?? 0;
  const cariAlacak = cariToplam.find((c) => c.tur === "ALACAK")?._sum.tutar ?? 0;
  const bekleyenTahsilat = cariBorc - cariAlacak;
  const tedBorc = tedarikciToplam.find((c) => c.tur === "BORC")?._sum.tutar ?? 0;
  const tedOdeme = tedarikciToplam.find((c) => c.tur === "ODEME")?._sum.tutar ?? 0;
  const tedarikciBorcu = tedBorc - tedOdeme;
  const yasToplam = yaslandirma.toplam.reduce((a, x) => a + x, 0);
  const gecikmis = yaslandirma.toplam[1] + yaslandirma.toplam[2] + yaslandirma.toplam[3];

  // Sipariş hattı
  const sDurum = (...d: string[]) => acikSiparisler.filter((x) => d.includes(x.durum)).reduce((a, x) => a + x._count._all, 0);
  const sasSay = (...d: string[]) => sasDurumlari.filter((x) => d.includes(x.durum)).reduce((a, x) => a + x._count._all, 0);
  const hat: { ad: string; sayi: number; href: string }[] = [
    { ad: "Açık teklif", sayi: bekleyenTeklifler.length, href: "/panel/teklifler" },
    { ad: "Onaylı, siparişe dönmemiş", sayi: onayliDonusmemis, href: "/panel/teklifler" },
    { ad: "Sipariş onay bekliyor", sayi: sDurum("ONAY_BEKLIYOR"), href: "/panel/siparisler" },
    { ad: "Hazırlanıyor", sayi: sDurum("HAZIRLANIYOR"), href: "/panel/siparisler" },
    { ad: "Sevk sürecinde", sayi: sDurum("KISMEN_SEVK_EDILDI", "SEVK_EDILDI", "KISMEN_TESLIM_EDILDI"), href: "/panel/siparisler" },
    { ad: "Teslim edildi, faturasız", sayi: sDurum("TESLIM_EDILDI"), href: "/panel/siparisler" },
  ];
  const hatMax = Math.max(1, ...hat.map((h) => h.sayi));

  // Dikkat gerekenler
  const zararli = satirlar.filter((s) => s.maliyetVar && s.kar < 0);
  const fazlaAlimli = satirlar.filter((s) => s.fazlaAlim);
  const dikkat: { metin: string; href: string; ciddi?: boolean }[] = [];
  if (sDurum("ONAY_BEKLIYOR")) dikkat.push({ metin: `${sDurum("ONAY_BEKLIYOR")} satış siparişi admin onayı bekliyor`, href: "/panel/siparisler", ciddi: true });
  if (sasSay("ONAY_BEKLIYOR")) dikkat.push({ metin: `${sasSay("ONAY_BEKLIYOR")} satınalma siparişi onay bekliyor`, href: "/panel/satinalma/siparisler?durum=onay", ciddi: true });
  if (fazlaAlimli.length) dikkat.push({ metin: `${fazlaAlimli.length} işte satılandan fazla satınalma var (çift alım?)`, href: `/panel/siparisler/${fazlaAlimli[0].id}`, ciddi: true });
  if (zararli.length) dikkat.push({ metin: `${zararli.length} sipariş zararına görünüyor (maliyet > satış)`, href: `/panel/siparisler/${zararli[0].id}`, ciddi: true });
  if (onayliDonusmemis) dikkat.push({ metin: `${onayliDonusmemis} onaylı teklif henüz siparişe dönüştürülmedi`, href: "/panel/teklifler" });
  if (sDurum("TESLIM_EDILDI")) dikkat.push({ metin: `${sDurum("TESLIM_EDILDI")} teslim edilmiş sipariş faturalanmadı`, href: "/panel/siparisler" });
  if (faturaBekleyenSas) dikkat.push({ metin: `${faturaBekleyenSas} teslim alınmış satınalmanın alış faturası işlenmedi`, href: "/panel/satinalma/siparisler?durum=fatura" });
  if (gecikmis > 0.5) dikkat.push({ metin: `${tl(gecikmis)} alacak 30 günü geçti (90+ gün: ${tl(yaslandirma.toplam[3])})`, href: "/panel/cari", ciddi: yaslandirma.toplam[3] > 0.5 });
  if (takipBekleyen) dikkat.push({ metin: `${takipBekleyen} bekleyen teklif 14 gündür güncellenmedi (takip)`, href: "/panel/teklifler" });
  if (yaklasanTahsilat._count._all) dikkat.push({ metin: `15 gün içinde ${yaklasanTahsilat._count._all} vadeli tahsilat: ${tl(yaklasanTahsilat._sum.tutar ?? 0)}`, href: "/panel/cari" });
  if (yaklasanOdeme._count._all) dikkat.push({ metin: `15 gün içinde ${yaklasanOdeme._count._all} vadeli ödeme: ${tl(yaklasanOdeme._sum.tutar ?? 0)}`, href: "/panel/satinalma/cari" });

  // En çok ciro yapan müşteriler ve personel (bu yıl)
  const grupla = (anahtar: (s: (typeof satirlar)[number]) => string) => {
    const m = new Map<string, { ad: string; ciro: number; kar: number; adet: number; href?: string }>();
    for (const s of yilSiparisleri) {
      const k = anahtar(s) || "—";
      const v = m.get(k) ?? { ad: k, ciro: 0, kar: 0, adet: 0 };
      v.ciro += s.satis;
      v.kar += s.maliyetVar ? s.kar : 0;
      v.adet++;
      m.set(k, v);
    }
    return [...m.values()].sort((a, b) => b.ciro - a.ciro).slice(0, 5);
  };
  const enIyiMusteriler = grupla((s) => s.musteri.ad);
  const personel = grupla((s) => s.teklif.olusturanAdi || s.olusturanAdi);
  const sonSiparisler = satirlar.slice(0, 10);

  const kart = "bg-yuzey border border-hat rounded-lg p-4";
  const kpiler: { baslik: string; deger: string; alt?: string; renk?: string; href?: string }[] = [
    {
      baslik: "Bu ay ciro",
      deger: tl(ciroBuAy),
      alt: ciroDegisim == null ? `Geçen ay: ${tl(ciroGecenAy)}` : `Geçen aya göre ${ciroDegisim >= 0 ? "▲" : "▼"} ${yuzde(Math.abs(ciroDegisim))}`,
      renk: ciroDegisim != null && ciroDegisim < 0 ? "text-sicak-dim" : undefined,
      href: "/panel/siparisler",
    },
    { baslik: `${buYil} ciro`, deger: tl(ciroYil), alt: `${yilSiparisleri.length} onaylı sipariş`, href: "/panel/siparisler/raporlar" },
    {
      baslik: `${buYil} brüt kâr`,
      deger: maliyetliYil.length ? tl(karYil) : "—",
      alt: maliyetliYil.length ? `Marj ${marjYil == null ? "—" : yuzde(marjYil)} · ${maliyetliYil.length}/${yilSiparisleri.length} siparişte maliyet var` : "Satınalma bağlanmış sipariş yok",
      renk: karYil < 0 ? "text-sicak-dim" : "text-emerald-700",
    },
    {
      baslik: "Açık teklif hacmi",
      deger: `≈ ${tl(acikTeklifTl)}`,
      alt: `${bekleyenTeklifler.length} teklif bekliyor${kursuzTeklif ? ` · ${kursuzTeklif} kursuz` : ""}`,
      href: "/panel/teklifler",
    },
    {
      baslik: "Teklif kazanma oranı (90 gün)",
      deger: kazanmaOrani == null ? "—" : yuzde(kazanmaOrani),
      alt: `${kazanilanSayi} onay · ${kaybedilenSayi} red`,
    },
    {
      baslik: "Bekleyen tahsilat",
      deger: tl(bekleyenTahsilat),
      alt: gecikmis > 0.5 ? `30 gün üstü: ${tl(gecikmis)}` : "Gecikmiş alacak yok",
      renk: bekleyenTahsilat > 0 ? "text-sicak-dim" : undefined,
      href: "/panel/cari",
    },
    { baslik: "Tedarikçilere borç", deger: tl(tedarikciBorcu), alt: "Alış faturaları − ödemeler", href: "/panel/satinalma/cari" },
    {
      baslik: "Net alacak − borç",
      deger: tl(bekleyenTahsilat - tedarikciBorcu),
      alt: "Müşteri alacağı − tedarikçi borcu",
      renk: bekleyenTahsilat - tedarikciBorcu < 0 ? "text-sicak-dim" : "text-emerald-700",
    },
  ];

  // Grafik ölçüleri
  const G = { w: 640, h: 210, sol: 46, alt: 26, ust: 10 };
  const ic = { w: G.w - G.sol - 6, h: G.h - G.alt - G.ust };
  const grupW = ic.w / 12;
  const barW = Math.min(16, grupW / 3);
  const yOlcek = (v: number) => G.ust + ic.h - (v / grafikMax) * ic.h;
  const izgara = [0, 0.25, 0.5, 0.75, 1].map((o) => grafikMax * o);

  return (
    <section className="mb-8" aria-label="Yönetim paneli">
      <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
        <h2 className="font-display text-lg font-semibold text-metin">Yönetim Paneli</h2>
        <p className="text-[11px] text-metin/50">
          Tutarlar KDV hariç, TL. Döviz kayıtları kendi kuruyla çevrilir{yaklasikVar ? "; kuru olmayan eski kayıtlar bugünkü TCMB kuruyla (≈)" : ""}.
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {kpiler.map((k) => {
          const icerik = (
            <>
              <p className="text-[11px] text-metin/55 mb-1">{k.baslik}</p>
              <p className={`font-mono text-lg sm:text-xl font-semibold ${k.renk ?? "text-metin"}`}>{k.deger}</p>
              {k.alt && <p className="text-[11px] text-metin/50 mt-1">{k.alt}</p>}
            </>
          );
          return k.href ? (
            <Link key={k.baslik} href={k.href} className={`focus-ring block ${kart} hover:border-soguk transition-colors`}>
              {icerik}
            </Link>
          ) : (
            <div key={k.baslik} className={kart}>
              {icerik}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* AYLIK CİRO / MALİYET */}
        <div className={`${kart} lg:col-span-2`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h3 className="font-display font-medium text-sm text-metin">Son 12 ay: ciro ve satınalma maliyeti</h3>
            <div className="flex items-center gap-3 text-[11px] text-metin/60">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-soguk" /> Ciro
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-sicak" /> Maliyet
              </span>
            </div>
          </div>
          <svg viewBox={`0 0 ${G.w} ${G.h}`} className="w-full h-auto" role="img" aria-label="Son 12 ayın aylık cirosu ve maliyeti">
            {izgara.map((v, i) => (
              <g key={i}>
                <line x1={G.sol} x2={G.w - 6} y1={yOlcek(v)} y2={yOlcek(v)} stroke="#D7E0E1" strokeWidth={i === 0 ? 1 : 0.6} />
                <text x={G.sol - 6} y={yOlcek(v) + 3} fontSize="9" textAnchor="end" fill="#89909a">
                  {kisa(v)}
                </text>
              </g>
            ))}
            {aylik.map((a, i) => {
              const x0 = G.sol + i * grupW + grupW / 2;
              const [yy, mm] = a.ay.split("-");
              return (
                <g key={a.ay}>
                  <rect x={x0 - barW - 1} y={yOlcek(a.ciro)} width={barW} height={Math.max(0, G.ust + ic.h - yOlcek(a.ciro))} rx="2" fill="#0E7C86">
                    <title>{`${AY_ADI[Number(mm) - 1]} ${yy} · Ciro ${tl(a.ciro)} · ${a.adet} sipariş`}</title>
                  </rect>
                  <rect x={x0 + 1} y={yOlcek(a.maliyet)} width={barW} height={Math.max(0, G.ust + ic.h - yOlcek(a.maliyet))} rx="2" fill="#E8734A">
                    <title>{`${AY_ADI[Number(mm) - 1]} ${yy} · Maliyet ${tl(a.maliyet)}`}</title>
                  </rect>
                  <text x={x0} y={G.h - 10} fontSize="9" textAnchor="middle" fill={a.ay === buAy ? "#0B646C" : "#89909a"} fontWeight={a.ay === buAy ? 700 : 400}>
                    {AY_ADI[Number(mm) - 1]}
                  </text>
                  {mm === "01" && (
                    <text x={x0} y={G.h - 1} fontSize="8" textAnchor="middle" fill="#a0a6aa">
                      {yy}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          <p className="text-[10px] text-metin/40 mt-1">Çubukların üzerine gelince tutar görünür. Maliyet: siparişlere bağlanan satınalmalar (montaj / işçilik hariç).</p>
        </div>

        {/* İŞ HATTI */}
        <div className={kart}>
          <h3 className="font-display font-medium text-sm text-metin mb-3">İş hattı</h3>
          <ul className="space-y-2">
            {hat.map((h) => (
              <li key={h.ad}>
                <Link href={h.href} className="focus-ring block group">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-metin/70 group-hover:text-soguk-dim">{h.ad}</span>
                    <span className="font-mono font-semibold text-metin">{h.sayi}</span>
                  </div>
                  <div className="h-1.5 bg-zemin rounded-full overflow-hidden">
                    <div className="h-full bg-soguk/70 rounded-full" style={{ width: `${(h.sayi / hatMax) * 100}%` }} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t border-hat grid grid-cols-3 gap-2 text-center">
            <Link href="/panel/satinalma/siparisler?durum=onay" className="focus-ring rounded-md hover:bg-zemin py-1">
              <p className="font-mono text-base font-semibold text-metin">{sasSay("ONAY_BEKLIYOR")}</p>
              <p className="text-[10px] text-metin/50">Satınalma onayı</p>
            </Link>
            <Link href="/panel/satinalma/siparisler" className="focus-ring rounded-md hover:bg-zemin py-1">
              <p className="font-mono text-base font-semibold text-metin">{sasSay("ONAYLANDI", "KISMEN_TESLIM")}</p>
              <p className="text-[10px] text-metin/50">Teslim bekleyen</p>
            </Link>
            <Link href="/panel/satinalma/siparisler?durum=fatura" className="focus-ring rounded-md hover:bg-zemin py-1">
              <p className="font-mono text-base font-semibold text-metin">{faturaBekleyenSas}</p>
              <p className="text-[10px] text-metin/50">Alış faturası bekleyen</p>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* DİKKAT GEREKENLER */}
        <div className={`${kart} lg:col-span-2`}>
          <h3 className="font-display font-medium text-sm text-metin mb-3">Dikkat gerekenler</h3>
          {dikkat.length === 0 ? (
            <p className="text-sm text-emerald-700">✓ Bekleyen onay, gecikmiş alacak ya da sorunlu sipariş yok.</p>
          ) : (
            <ul className="divide-y divide-hat">
              {dikkat.map((d) => (
                <li key={d.metin}>
                  <Link href={d.href} className="focus-ring flex items-center justify-between gap-3 py-2 text-sm hover:text-soguk-dim">
                    <span className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${d.ciddi ? "bg-sicak" : "bg-amber-400"}`} />
                      {d.metin}
                    </span>
                    <span className="text-metin/40 shrink-0">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ALACAK YAŞLANDIRMA */}
        <div className={kart}>
          <h3 className="font-display font-medium text-sm text-metin mb-3">Alacak yaşlandırma</h3>
          {yasToplam <= 0.5 ? (
            <p className="text-sm text-metin/50">Açık alacak yok.</p>
          ) : (
            <>
              <div className="flex h-3 rounded-full overflow-hidden mb-3 bg-zemin">
                {yaslandirma.toplam.map((v, i) =>
                  v > 0 ? (
                    <div
                      key={i}
                      title={`${YAS_DILIMLERI[i]}: ${tl(v)}`}
                      className={["bg-soguk", "bg-amber-400", "bg-sicak", "bg-red-700"][i]}
                      style={{ width: `${(v / yasToplam) * 100}%` }}
                    />
                  ) : null
                )}
              </div>
              <ul className="space-y-1 text-xs">
                {yaslandirma.toplam.map((v, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-metin/70">
                      <span className={`inline-block w-2 h-2 rounded-sm ${["bg-soguk", "bg-amber-400", "bg-sicak", "bg-red-700"][i]}`} />
                      {YAS_DILIMLERI[i]}
                    </span>
                    <span className="font-mono">{tl(v)}</span>
                  </li>
                ))}
              </ul>
              {yaslandirma.satirlar.length > 0 && (
                <div className="mt-3 pt-2 border-t border-hat">
                  <p className="text-[11px] text-metin/50 mb-1">En büyük alacaklar</p>
                  {yaslandirma.satirlar.slice(0, 3).map((s) => (
                    <Link key={s.musteriId} href={`/panel/musteriler/${s.musteriId}`} className="focus-ring flex justify-between text-xs py-0.5 hover:text-soguk-dim">
                      <span className="truncate mr-2">{s.ad}</span>
                      <span className="font-mono shrink-0">{tl(s.bakiye)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* SİPARİŞ KÂRLILIĞI */}
      <div className={`${kart} mb-4 overflow-x-auto`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-medium text-sm text-metin">Son siparişlerin kârlılığı</h3>
          <Link href="/panel/siparisler" className="text-xs text-soguk-dim hover:underline">
            Tüm siparişler →
          </Link>
        </div>
        {sonSiparisler.length === 0 ? (
          <p className="text-sm text-metin/50">Onaylanmış sipariş yok.</p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-[11px] text-metin/50 border-b border-hat">
                <th className="py-1.5 font-medium">Sipariş</th>
                <th className="py-1.5 font-medium">Müşteri</th>
                <th className="py-1.5 font-medium text-right">Satış</th>
                <th className="py-1.5 font-medium text-right">Maliyet</th>
                <th className="py-1.5 font-medium text-right">Brüt kâr</th>
                <th className="py-1.5 font-medium text-right">Marj</th>
              </tr>
            </thead>
            <tbody>
              {sonSiparisler.map((s) => {
                const marj = s.satis > 0 && s.maliyetVar ? (s.kar / s.satis) * 100 : null;
                return (
                  <tr key={s.id} className="border-b border-hat last:border-0">
                    <td className="py-1.5">
                      <Link href={`/panel/siparisler/${s.id}`} className="text-soguk-dim hover:underline">
                        TKL-{String(s.teklif.teklifNo).padStart(4, "0")}
                      </Link>{" "}
                      <span className="text-metin/60 text-xs">{s.teklif.baslik}</span>
                      {s.fazlaAlim && <span className="ml-1 text-[10px] text-sicak-dim font-semibold">çift alım?</span>}
                    </td>
                    <td className="py-1.5 text-metin/70 text-xs">{s.musteri.ad}</td>
                    <td className="py-1.5 text-right font-mono">
                      {s.yaklasik ? "≈ " : ""}
                      {tl(s.satis)}
                      {s.pb !== "TRY" && <span className="block text-[10px] text-metin/40">{s.pb}</span>}
                    </td>
                    <td className="py-1.5 text-right font-mono text-metin/70">{s.maliyetVar ? tl(s.maliyet) : <span className="text-metin/30 text-xs">girilmedi</span>}</td>
                    <td className={`py-1.5 text-right font-mono font-semibold ${!s.maliyetVar ? "text-metin/30" : s.kar < 0 ? "text-sicak-dim" : "text-emerald-700"}`}>
                      {s.maliyetVar ? tl(s.kar) : "—"}
                    </td>
                    <td className={`py-1.5 text-right font-mono text-xs ${marj != null && marj < 0 ? "text-sicak-dim" : "text-metin/70"}`}>{marj == null ? "—" : yuzde(marj)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MÜŞTERİ VE PERSONEL */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { baslik: `${buYil} en çok ciro yapan müşteriler`, liste: enIyiMusteriler },
          { baslik: `${buYil} personel (teklifi hazırlayan)`, liste: personel },
        ].map((b) => {
          const enCok = Math.max(1, ...b.liste.map((x) => x.ciro));
          return (
            <div key={b.baslik} className={kart}>
              <h3 className="font-display font-medium text-sm text-metin mb-3">{b.baslik}</h3>
              {b.liste.length === 0 ? (
                <p className="text-sm text-metin/50">Bu yıl onaylı sipariş yok.</p>
              ) : (
                <ul className="space-y-2">
                  {b.liste.map((x) => (
                    <li key={x.ad}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-metin truncate mr-2">
                          {x.ad} <span className="text-metin/40">· {x.adet} sipariş</span>
                        </span>
                        <span className="font-mono shrink-0">{tl(x.ciro)}</span>
                      </div>
                      <div className="h-1.5 bg-zemin rounded-full overflow-hidden">
                        <div className="h-full bg-soguk/70 rounded-full" style={{ width: `${(x.ciro / enCok) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
