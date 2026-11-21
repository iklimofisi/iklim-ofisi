// -----------------------------------------------------------------------------
// FİNANS HESAPLARI (Aşama 3): ay sınırları, dönem kilidi, aylık özet, alacak yaşlandırma
// Yalnız sunucu kodu kullanır ("use server" DEĞİLDİR: dışarıdan çağrılamaz).
// Tüm tutarlar TL, KDV hariç (cari bakiyeler KDV dahil TL'dir, kayıtlar öyle tutulur).
// Ay sınırları Türkiye saatine göredir (UTC+3).
// -----------------------------------------------------------------------------
import { prisma } from "@/lib/prisma";
import { siparisNetTutari } from "@/lib/siparis-tutari";
import { sasTl, maliyeteSayilirMi } from "@/lib/satinalma-siparis";

const TR_FARK = 3 * 3600 * 1000;

// "2026-11" → Türkiye saatine göre ayın başı ve sonraki ayın başı (UTC Date)
export function aySiniri(donem: string): { bas: Date; son: Date } {
  const [y, m] = donem.split("-").map(Number);
  return { bas: new Date(Date.UTC(y, m - 1, 1) - TR_FARK), son: new Date(Date.UTC(y, m, 1) - TR_FARK) };
}

// Tarihin Türkiye saatine göre dönemi: "2026-11"
export function donemAnahtari(d: Date): string {
  const t = new Date(d.getTime() + TR_FARK);
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}`;
}

export const gecerliDonem = (v: unknown) => (typeof v === "string" && /^20\d\d-(0[1-9]|1[0-2])$/.test(v) ? v : null);

// Önceki n ay (bu ay dahil, eskiden yeniye)
export function sonAylar(donem: string, n: number): string[] {
  const [y, m] = donem.split("-").map(Number);
  const liste: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    liste.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return liste;
}

const AY_ADLARI = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
export const donemAdi = (donem: string) => {
  const [y, m] = donem.split("-").map(Number);
  return `${AY_ADLARI[m - 1]} ${y}`;
};

// --- DÖNEM KİLİDİ -------------------------------------------------------------------
// Tablo henüz yoksa (SQL çalışmadıysa) hiçbir dönem kilitli sayılmaz.
export async function donemKilitliMi(tarih: Date): Promise<boolean> {
  const k = await prisma.donemKapanis.findUnique({ where: { donem: donemAnahtari(tarih) }, select: { acikMi: true } }).catch(() => null);
  return !!k && !k.acikMi;
}

export const KILIT_MESAJI = (tarih: Date) =>
  `${donemAdi(donemAnahtari(tarih))} kapatıldı; bu aya kayıt eklenemez ya da iptal edilemez. Düzeltmeyi açık aya ters kayıtla yapın (gerekirse yönetici dönemi yeniden açar).`;

// --- AYLIK ÖZET ------------------------------------------------------------------------
export type AylikOzet = {
  donem: string;
  ciro: number; // onaylanan satış siparişleri (TL, KDV hariç)
  siparisSayisi: number;
  maliyetliSiparisSayisi: number; // satınalması bağlanmış sipariş sayısı
  maliyetliCiro: number; // satınalması bağlanmış siparişlerin cirosu
  maliyet: number; // bu siparişlere bağlı satınalmalar (TL, KDV hariç)
  brutKar: number; // maliyetliCiro − maliyet
  tahsilat: number; // müşteri cari ALACAK hareketleri (TL)
  musteriBorclandirma: number; // müşteri cari BORÇ hareketleri (TL)
  aliFaturalari: number; // tedarikçi BORÇ hareketleri (TL)
  tedarikciOdemeleri: number; // tedarikçi ÖDEME hareketleri (TL)
  satinalmaTutari: number; // ay içinde açılan satınalma siparişleri (TL, KDV hariç)
  teklifSayisi: number;
  kazanilanTeklif: number;
  kaybedilenTeklif: number;
  alacakBakiyesi: number; // ay sonu itibarıyla toplam müşteri bakiyesi (TL)
  borcBakiyesi: number; // ay sonu itibarıyla toplam tedarikçi bakiyesi (TL)
};

const toplamTl = (s: { paraBirimi: string | null; kur: number; tutarNet: number | null; teklif: { paraBirimi: string; kalemler: { adet: number; birimFiyat: number; iskontoYuzde: number }[] } }) => {
  const net = siparisNetTutari(s);
  return (s.paraBirimi ?? s.teklif.paraBirimi) === "TRY" ? net : net * s.kur;
};

export async function aylikOzet(donem: string): Promise<AylikOzet> {
  const { bas, son } = aySiniri(donem);
  const aralik = { gte: bas, lt: son };

  const [siparisler, cari, tedarikci, satinalmalar, teklifler, cariBakiye, tedBakiye] = await Promise.all([
    // Onay tarihi (yoksa açılış tarihi) bu ayda olan, iptal / red olmayan siparişler
    prisma.siparis.findMany({
      where: {
        durum: { notIn: ["IPTAL", "REDDEDILDI", "ONAY_BEKLIYOR"] },
        OR: [{ onayTarihi: aralik }, { onayTarihi: null, olusturmaTarihi: aralik }],
      },
      select: {
        paraBirimi: true,
        kur: true,
        tutarNet: true,
        teklif: { select: { paraBirimi: true, kalemler: { select: { adet: true, birimFiyat: true, iskontoYuzde: true } } } },
        satinalmaSiparisleri: { select: { durum: true, tutarNet: true, kur: true, paraBirimi: true } },
      },
    }),
    prisma.cariHareket.groupBy({ by: ["tur"], where: { iptalTarihi: null, tarih: aralik }, _sum: { tutar: true } }),
    prisma.tedarikciHareket.groupBy({ by: ["tur"], where: { iptalTarihi: null, tarih: aralik }, _sum: { tutar: true } }),
    prisma.satinalmaSiparisi
      .findMany({ where: { olusturmaTarihi: aralik, durum: { notIn: ["IPTAL", "REDDEDILDI"] } }, select: { tutarNet: true, kur: true, paraBirimi: true } })
      .catch(() => [] as { tutarNet: number; kur: number; paraBirimi: string }[]),
    prisma.teklif.groupBy({ by: ["durum"], where: { arsivTarihi: null, tarih: aralik }, _count: { _all: true } }),
    prisma.cariHareket.groupBy({ by: ["tur"], where: { iptalTarihi: null, tarih: { lt: son } }, _sum: { tutar: true } }),
    prisma.tedarikciHareket.groupBy({ by: ["tur"], where: { iptalTarihi: null, tarih: { lt: son } }, _sum: { tutar: true } }),
  ]);

  let ciro = 0;
  let maliyetliCiro = 0;
  let maliyet = 0;
  let maliyetliSiparisSayisi = 0;
  for (const s of siparisler) {
    const tl = toplamTl(s);
    ciro += tl;
    const bagli = s.satinalmaSiparisleri.filter((x) => maliyeteSayilirMi(x.durum));
    if (bagli.length) {
      maliyetliSiparisSayisi++;
      maliyetliCiro += tl;
      maliyet += bagli.reduce((a, x) => a + sasTl(x), 0);
    }
  }
  const tur = (g: { tur: string; _sum: { tutar: number | null } }[], t: string) => g.find((x) => x.tur === t)?._sum.tutar ?? 0;
  const teklifSay = (d?: string) => teklifler.filter((x) => !d || x.durum === d).reduce((a, x) => a + x._count._all, 0);
  const yuv = (n: number) => Math.round(n * 100) / 100;

  return {
    donem,
    ciro: yuv(ciro),
    siparisSayisi: siparisler.length,
    maliyetliSiparisSayisi,
    maliyetliCiro: yuv(maliyetliCiro),
    maliyet: yuv(maliyet),
    brutKar: yuv(maliyetliCiro - maliyet),
    tahsilat: yuv(tur(cari, "ALACAK")),
    musteriBorclandirma: yuv(tur(cari, "BORC")),
    aliFaturalari: yuv(tur(tedarikci, "BORC")),
    tedarikciOdemeleri: yuv(tur(tedarikci, "ODEME")),
    satinalmaTutari: yuv(satinalmalar.reduce((a, x) => a + sasTl(x), 0)),
    teklifSayisi: teklifSay(),
    kazanilanTeklif: teklifSay("ONAYLANDI"),
    kaybedilenTeklif: teklifSay("REDDEDILDI"),
    alacakBakiyesi: yuv(tur(cariBakiye, "BORC") - tur(cariBakiye, "ALACAK")),
    borcBakiyesi: yuv(tur(tedBakiye, "BORC") - tur(tedBakiye, "ODEME")),
  };
}

// --- ALACAK YAŞLANDIRMA ----------------------------------------------------------------
// Her müşteride tahsilatlar en eski borçtan başlayarak düşülür (FIFO); kapanmamış borçlar
// tarihine (vadesi varsa vadesine) göre yaşlandırılır. Tarih: verilen gün itibarıyla.
export const YAS_DILIMLERI = ["0–30 gün", "31–60 gün", "61–90 gün", "90+ gün"] as const;
export type YasSatiri = { musteriId: string; ad: string; bakiye: number; dilimler: [number, number, number, number]; enEski: Date | null };

export async function alacakYaslandirma(itibariyle: Date): Promise<{ satirlar: YasSatiri[]; toplam: YasSatiri["dilimler"]; fazlaTahsilat: number }> {
  const hareketler = await prisma.cariHareket.findMany({
    where: { iptalTarihi: null, tarih: { lt: itibariyle } },
    select: { musteriId: true, tur: true, tutar: true, tarih: true, vadeTarihi: true, musteri: { select: { ad: true } } },
    orderBy: [{ tarih: "asc" }, { id: "asc" }],
  });
  const gruplar = new Map<string, { ad: string; borclar: { tutar: number; tarih: Date }[]; odenen: number }>();
  for (const h of hareketler) {
    const g = gruplar.get(h.musteriId) ?? { ad: h.musteri.ad, borclar: [], odenen: 0 };
    if (h.tur === "BORC") g.borclar.push({ tutar: h.tutar, tarih: h.vadeTarihi && h.vadeTarihi > h.tarih ? h.vadeTarihi : h.tarih });
    else g.odenen += h.tutar;
    gruplar.set(h.musteriId, g);
  }
  const gun = 24 * 3600 * 1000;
  const satirlar: YasSatiri[] = [];
  const toplam: YasSatiri["dilimler"] = [0, 0, 0, 0];
  let fazlaTahsilat = 0;
  for (const [musteriId, g] of gruplar) {
    let kalanOdeme = g.odenen;
    const dilimler: YasSatiri["dilimler"] = [0, 0, 0, 0];
    let enEski: Date | null = null;
    for (const b of g.borclar) {
      const dusulen = Math.min(kalanOdeme, b.tutar);
      kalanOdeme -= dusulen;
      const acik = b.tutar - dusulen;
      if (acik <= 0.005) continue;
      const yas = Math.floor((itibariyle.getTime() - b.tarih.getTime()) / gun);
      const i = yas <= 30 ? 0 : yas <= 60 ? 1 : yas <= 90 ? 2 : 3;
      dilimler[i] += acik;
      if (!enEski || b.tarih < enEski) enEski = b.tarih;
    }
    if (kalanOdeme > 0.005) fazlaTahsilat += kalanOdeme;
    const bakiye = dilimler.reduce((a, x) => a + x, 0);
    if (bakiye <= 0.005) continue;
    dilimler.forEach((x, i) => (toplam[i] += x));
    satirlar.push({ musteriId, ad: g.ad, bakiye, dilimler, enEski });
  }
  satirlar.sort((a, b) => b.bakiye - a.bakiye);
  return { satirlar, toplam, fazlaTahsilat };
}
