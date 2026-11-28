// -----------------------------------------------------------------------------
// YÖNETİM PANELİ VERİSİ (sunucu; "use server" DEĞİLDİR)
// Özet sayfasındaki Yönetim Paneli ve PDF yönetim raporu aynı rakamları buradan alır.
// Tüm tutarlar KDV HARİÇ ve TL'dir. Dövizli siparişler kendi kuruyla (faturada farklı kur
// kullanıldıysa fatura kuruyla), satınalmalar kendi kuruyla çevrilir. Kuru olmayan eski dövizli
// kayıtlar ve açık teklifler bugünkü TCMB döviz satış kuruyla yaklaşık çevrilir (≈).
// Ciro: satış müdürü onayı almış (iptal / red olmayan) siparişler, onay tarihine göre (lib/ciro.ts).
// Personel cirosu: müşterinin firma sorumlusuna yazılır (siparişi kim açarsa açsın).
// Brüt kâr: satış − siparişe bağlı (iptal / red olmayan) satınalmalar; montaj / işçilik dahil değildir.
// -----------------------------------------------------------------------------
import { prisma } from "@/lib/prisma";
import { siparisSatisTl, ciroTarihi, CIRO_DURUM_HARIC, SORUMLUSUZ } from "@/lib/ciro";
import { sasTl, maliyeteSayilirMi } from "@/lib/satinalma-siparis";
import { teklifToplamlari } from "@/lib/teklif-hesap";
import { getTcmbKurlari, tcmbKuru } from "@/lib/kur";
import { alacakYaslandirma } from "@/lib/finans";
import { kalemAnahtari } from "@/lib/satinalma-kapsam";

const GUN = 24 * 3600 * 1000;
export const AY_ADI = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

// Türkiye saatine göre "YYYY-MM"
export const ayKodu = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit" }).format(d).slice(0, 7);
export const ayEtiketi = (ay: string) => `${AY_ADI[Number(ay.slice(5, 7)) - 1]} ${ay.slice(2, 4)}`;

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

export type DikkatSatiri = { metin: string; href: string; ciddi?: boolean };
export type SiralamaSatiri = { ad: string; ciro: number; kar: number; adet: number };

export async function yonetimVerisi() {
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
    kullanicilar,
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
    prisma.kullanici.findMany({ select: { id: true, ad: true } }),
    prisma.siparis.findMany({
      where: {
        durum: { notIn: [...CIRO_DURUM_HARIC] },
        OR: [{ onayTarihi: { gte: onIkiAyOnce } }, { onayTarihi: null, olusturmaTarihi: { gte: onIkiAyOnce } }],
      },
      select: {
        id: true,
        durum: true,
        onayTarihi: true,
        olusturmaTarihi: true,
        tutarNet: true,
        paraBirimi: true,
        kur: true,
        faturaKur: true,
        kalemlerJson: true,
        olusturanAdi: true,
        musteri: { select: { id: true, ad: true, sorumluKullaniciId: true } },
        teklif: { select: { teklifNo: true, baslik: true, paraBirimi: true, olusturanAdi: true, kalemler: { select: { aciklama: true, adet: true, birimFiyat: true, iskontoYuzde: true } } } },
        satinalmaSiparisleri: { select: { durum: true, tutarNet: true, kur: true, paraBirimi: true, kalemler: { select: { aciklama: true, adet: true } } } },
      },
      orderBy: [{ onayTarihi: { sort: "desc", nulls: "last" } }, { olusturmaTarihi: "desc" }],
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

  const kullaniciAdi = new Map(kullanicilar.map((k) => [k.id, k.ad]));

  // --- Sipariş bazında satış / maliyet (TL, KDV hariç) ---
  const satirlar = siparisler.map((s) => {
    const { tl: satis, pb, net, yaklasik } = siparisSatisTl(s, kurlar);
    const aktifSas = s.satinalmaSiparisleri.filter((x) => maliyeteSayilirMi(x.durum));
    const maliyet = aktifSas.reduce((a, x) => a + sasTl(x), 0);
    // Satılandan fazla alım (aynı malın iki kez sipariş edilmesi)
    const satilan = new Map<string, number>();
    for (const k of satilanKalemler(s.kalemlerJson, s.teklif.kalemler)) satilan.set(kalemAnahtari(k.aciklama), (satilan.get(kalemAnahtari(k.aciklama)) ?? 0) + Number(k.adet));
    const alinan = new Map<string, number>();
    for (const x of aktifSas) for (const k of x.kalemler) alinan.set(kalemAnahtari(k.aciklama), (alinan.get(kalemAnahtari(k.aciklama)) ?? 0) + k.adet);
    const fazlaAlim = [...alinan].some(([a, adet]) => satilan.has(a) && adet > (satilan.get(a) ?? 0) + 1e-9);
    return {
      id: s.id,
      durum: s.durum,
      ay: ayKodu(ciroTarihi(s)),
      teklifNo: s.teklif.teklifNo,
      baslik: s.teklif.baslik,
      musteriAd: s.musteri.ad,
      personel: (s.musteri.sorumluKullaniciId && kullaniciAdi.get(s.musteri.sorumluKullaniciId)) || SORUMLUSUZ,
      pb,
      netDoviz: net,
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

  // Aylık seri (maliyeti girilmiş siparişlerin kârı ayrıca)
  const aylik = aylar.map((ay) => {
    const l = satirlar.filter((s) => s.ay === ay);
    const ml = l.filter((s) => s.maliyetVar);
    return {
      ay,
      ciro: l.reduce((a, s) => a + s.satis, 0),
      maliyet: l.reduce((a, s) => a + s.maliyet, 0),
      kar: ml.reduce((a, s) => a + s.kar, 0),
      karVar: ml.length > 0,
      adet: l.length,
    };
  });

  // Bu yılın ciro dağılımı: sipariş para birimine göre (TL karşılığı)
  const pbDagilim = ["TRY", "EUR", "USD", "GBP"]
    .map((pb) => ({ pb, tl: yilSiparisleri.filter((s) => s.pb === pb).reduce((a, s) => a + s.satis, 0) }))
    .filter((x) => x.tl > 0.5);

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
  const satinalma = { onay: sasSay("ONAY_BEKLIYOR"), teslim: sasSay("ONAYLANDI", "KISMEN_TESLIM"), fatura: faturaBekleyenSas };

  // Dikkat gerekenler
  const tlYaz = (n: number) => n.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
  const zararli = satirlar.filter((s) => s.maliyetVar && s.kar < 0);
  const fazlaAlimli = satirlar.filter((s) => s.fazlaAlim);
  const dikkat: DikkatSatiri[] = [];
  if (sDurum("ONAY_BEKLIYOR")) dikkat.push({ metin: `${sDurum("ONAY_BEKLIYOR")} satış siparişi satış müdürü onayı bekliyor`, href: "/panel/siparisler", ciddi: true });
  if (satinalma.onay) dikkat.push({ metin: `${satinalma.onay} satınalma siparişi onay bekliyor`, href: "/panel/satinalma/siparisler?durum=onay", ciddi: true });
  if (fazlaAlimli.length) dikkat.push({ metin: `${fazlaAlimli.length} işte satılandan fazla satınalma var (çift alım?)`, href: `/panel/siparisler/${fazlaAlimli[0].id}`, ciddi: true });
  if (zararli.length) dikkat.push({ metin: `${zararli.length} sipariş zararına görünüyor (maliyet > satış)`, href: `/panel/siparisler/${zararli[0].id}`, ciddi: true });
  if (onayliDonusmemis) dikkat.push({ metin: `${onayliDonusmemis} onaylı teklif henüz siparişe dönüştürülmedi`, href: "/panel/teklifler" });
  if (sDurum("TESLIM_EDILDI")) dikkat.push({ metin: `${sDurum("TESLIM_EDILDI")} teslim edilmiş sipariş faturalanmadı`, href: "/panel/siparisler" });
  if (faturaBekleyenSas) dikkat.push({ metin: `${faturaBekleyenSas} teslim alınmış satınalmanın alış faturası işlenmedi`, href: "/panel/satinalma/siparisler?durum=fatura" });
  if (gecikmis > 0.5) dikkat.push({ metin: `${tlYaz(gecikmis)} alacak 30 günü geçti (90+ gün: ${tlYaz(yaslandirma.toplam[3])})`, href: "/panel/cari", ciddi: yaslandirma.toplam[3] > 0.5 });
  if (takipBekleyen) dikkat.push({ metin: `${takipBekleyen} bekleyen teklif 14 gündür güncellenmedi (takip)`, href: "/panel/teklifler" });
  if (yaklasanTahsilat._count._all) dikkat.push({ metin: `15 gün içinde ${yaklasanTahsilat._count._all} vadeli tahsilat: ${tlYaz(yaklasanTahsilat._sum.tutar ?? 0)}`, href: "/panel/cari" });
  if (yaklasanOdeme._count._all) dikkat.push({ metin: `15 gün içinde ${yaklasanOdeme._count._all} vadeli ödeme: ${tlYaz(yaklasanOdeme._sum.tutar ?? 0)}`, href: "/panel/satinalma/cari" });

  // En çok ciro yapan müşteriler ve personel (bu yıl)
  const grupla = (anahtar: (s: (typeof satirlar)[number]) => string): SiralamaSatiri[] => {
    const m = new Map<string, SiralamaSatiri>();
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

  return {
    olusturma: simdi,
    kurTarihi: kurlar?.tarih ?? null,
    buAy,
    gecenAy,
    buYil,
    ciroBuAy,
    ciroGecenAy,
    ciroDegisim,
    ciroYil,
    yilSiparisSayisi: yilSiparisleri.length,
    karYil,
    marjYil,
    maliyetliSayi: maliyetliYil.length,
    acikTeklifTl,
    acikTeklifSayi: bekleyenTeklifler.length,
    kursuzTeklif,
    kazanilanSayi,
    kaybedilenSayi,
    kazanmaOrani,
    bekleyenTahsilat,
    tedarikciBorcu,
    gecikmis,
    yaslandirma: { toplam: yaslandirma.toplam, yasToplam, enBuyuk: yaslandirma.satirlar.slice(0, 5) },
    aylik,
    pbDagilim,
    hat,
    satinalma,
    dikkat,
    sonSiparisler: satirlar.slice(0, 12),
    enIyiMusteriler: grupla((s) => s.musteriAd),
    personel: grupla((s) => s.personel),
    yaklasikVar: satirlar.some((s) => s.yaklasik),
  };
}

export type YonetimVerisi = Awaited<ReturnType<typeof yonetimVerisi>>;
