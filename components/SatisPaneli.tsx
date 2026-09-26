import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { teklifToplamlari } from "@/lib/teklif-hesap";
import { paraFormat } from "@/lib/para";

// -----------------------------------------------------------------------------
// SATIŞ PANELİ (Özet sayfasında)
// Tutarlar KDV hariçtir ve para birimleri birbirine ÇEVRİLMEZ: TL, € ve $ ayrı
// ayrı toplanır (kur bilgisi olmadan toplamak yanıltıcı olur).
// -----------------------------------------------------------------------------

export type Donem = "ay" | "3ay" | "yil";
export const DONEMLER: { kod: Donem; ad: string }[] = [
  { kod: "ay", ad: "Bu ay" },
  { kod: "3ay", ad: "Son 3 ay" },
  { kod: "yil", ad: "Bu yıl" },
];

const TAKIP_GUN = 14; // bu kadar gündür güncellenmeyen bekleyen teklif "takip bekliyor" sayılır

function trBugun() {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date())
    .split("-");
  return { yil: Number(p[0]), ay: Number(p[1]) };
}

function donemBaslangici(donem: Donem): Date {
  const { yil, ay } = trBugun();
  if (donem === "ay") return new Date(`${yil}-${String(ay).padStart(2, "0")}-01T00:00:00+03:00`);
  if (donem === "yil") return new Date(`${yil}-01-01T00:00:00+03:00`);
  return new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
}

type ParaToplam = Record<string, number>;
function paraEkle(t: ParaToplam, pb: string, tutar: number) {
  t[pb] = (t[pb] ?? 0) + tutar;
}
function paraYaz(t: ParaToplam) {
  const sira = ["TRY", "EUR", "USD"];
  const anahtarlar = Object.keys(t)
    .filter((k) => Math.abs(t[k]) > 0.004)
    .sort((a, b) => (sira.indexOf(a) === -1 ? 99 : sira.indexOf(a)) - (sira.indexOf(b) === -1 ? 99 : sira.indexOf(b)));
  if (anahtarlar.length === 0) return ["—"];
  return anahtarlar.map((k) => paraFormat(t[k], k));
}

type Kisi = {
  ad: string;
  teklif: number;
  onay: number;
  red: number;
  acik: number;
  ziyaret: number;
  onayTutar: ParaToplam;
};

const PROJE_ASAMALARI: { kod: string; ad: string; renk: string }[] = [
  { kod: "TAKIPTE", ad: "Takipte", renk: "bg-metin/30" },
  { kod: "TEKLIF_VERILDI", ad: "Teklif verildi", renk: "bg-soguk/60" },
  { kod: "KAZANILDI", ad: "Kazanıldı", renk: "bg-soguk" },
  { kod: "KAYBEDILDI", ad: "Kaybedildi", renk: "bg-sicak/70" },
  { kod: "IPTAL", ad: "İptal", renk: "bg-hat" },
];

export default async function SatisPaneli({ donem }: { donem: Donem }) {
  const bas = donemBaslangici(donem);
  const takipSiniri = new Date(Date.now() - TAKIP_GUN * 24 * 60 * 60 * 1000);

  const kalemSec = { select: { adet: true, birimFiyat: true, iskontoYuzde: true } } as const;

  const [donemTeklifleri, acikTeklifler, donemZiyaretleri, projeAsamalari] = await Promise.all([
    prisma.teklif.findMany({
      // İlk hazırlanma tarihi = ilkTarih, tarih ve revizyon tarihlerinin en erkeni.
      // Hepsi dönem içindeyse teklif bu dönemde hazırlanmıştır.
      where: { ilkTarih: { gte: bas }, tarih: { gte: bas }, revizyonlar: { every: { tarih: { gte: bas } } } },
      select: {
        durum: true,
        paraBirimi: true,
        kdvDahil: true,
        kdvOrani: true,
        olusturanAdi: true,
        olusturanKullanici: { select: { ad: true } },
        kalemler: kalemSec,
      },
    }),
    prisma.teklif.findMany({
      where: { durum: "BEKLEMEDE" },
      select: {
        id: true,
        teklifNo: true,
        baslik: true,
        tarih: true,
        paraBirimi: true,
        kdvDahil: true,
        kdvOrani: true,
        takipNotu: true,
        olusturanAdi: true,
        olusturanKullanici: { select: { ad: true } },
        musteri: { select: { id: true, ad: true } },
        kalemler: kalemSec,
      },
      orderBy: { tarih: "asc" },
    }),
    prisma.ziyaret.findMany({ where: { tarih: { gte: bas } }, select: { olusturanAdi: true } }),
    prisma.proje.groupBy({ by: ["ihaleDurumu"], _count: { _all: true } }),
  ]);

  // --- Kişi bazında tablo ---
  const kisiler = new Map<string, Kisi>();
  const kisi = (ad: string | null | undefined) => {
    const a = (ad ?? "").trim() || "Belirtilmemiş";
    if (!kisiler.has(a)) kisiler.set(a, { ad: a, teklif: 0, onay: 0, red: 0, acik: 0, ziyaret: 0, onayTutar: {} });
    return kisiler.get(a)!;
  };

  const onaylananTutar: ParaToplam = {};
  let donemOnay = 0;
  let donemRed = 0;
  for (const t of donemTeklifleri) {
    const k = kisi(t.olusturanKullanici?.ad || t.olusturanAdi);
    k.teklif++;
    if (t.durum === "ONAYLANDI") {
      const tutar = teklifToplamlari(t).araToplam;
      k.onay++;
      donemOnay++;
      paraEkle(k.onayTutar, t.paraBirimi, tutar);
      paraEkle(onaylananTutar, t.paraBirimi, tutar);
    } else if (t.durum === "REDDEDILDI") {
      k.red++;
      donemRed++;
    }
  }

  const acikHacim: ParaToplam = {};
  for (const t of acikTeklifler) {
    kisi(t.olusturanKullanici?.ad || t.olusturanAdi).acik++;
    paraEkle(acikHacim, t.paraBirimi, teklifToplamlari(t).araToplam);
  }
  for (const z of donemZiyaretleri) kisi(z.olusturanAdi).ziyaret++;

  const kisiListesi = [...kisiler.values()]
    .filter((k) => k.teklif || k.acik || k.ziyaret)
    .sort((a, b) => b.onay - a.onay || b.teklif - a.teklif || b.ziyaret - a.ziyaret);

  const sonuclanan = donemOnay + donemRed;
  const kazanmaOrani = sonuclanan > 0 ? Math.round((donemOnay / sonuclanan) * 100) : null;

  // --- Takip bekleyen teklifler (en eski güncellenen önce) ---
  const takipBekleyen = acikTeklifler.filter((t) => t.tarih < takipSiniri).slice(0, 8);
  const gunFarki = (d: Date) => Math.floor((Date.now() - new Date(d).getTime()) / (24 * 60 * 60 * 1000));

  // --- Proje hunisi ---
  const asamaSayisi = (kod: string) => projeAsamalari.find((p) => p.ihaleDurumu === kod)?._count._all ?? 0;
  const toplamProje = PROJE_ASAMALARI.reduce((a, p) => a + asamaSayisi(p.kod), 0);

  const kartlar = [
    { baslik: "Dönemde hazırlanan teklif", deger: [String(donemTeklifleri.length)], alt: `${donemOnay} onay · ${donemRed} ret` },
    {
      baslik: "Kazanma oranı",
      deger: [kazanmaOrani === null ? "—" : `%${kazanmaOrani}`],
      alt: sonuclanan > 0 ? `sonuçlanan ${sonuclanan} tekliften` : "henüz sonuçlanan teklif yok",
    },
    { baslik: "Onaylanan tutar (KDV hariç)", deger: paraYaz(onaylananTutar), alt: "dönemde hazırlanıp onaylanan" },
    { baslik: "Bekleyen teklif hacmi (KDV hariç)", deger: paraYaz(acikHacim), alt: `${acikTeklifler.length} açık teklif` },
  ];

  return (
    <section className="mb-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-metin">Satış Paneli</h2>
          <p className="text-xs text-metin/50">Tutarlar KDV hariçtir; TL, € ve $ ayrı gösterilir.</p>
        </div>
        <div className="flex rounded-md border border-hat overflow-hidden text-xs">
          {DONEMLER.map((d) => (
            <Link
              key={d.kod}
              href={d.kod === "3ay" ? "/panel" : `/panel?donem=${d.kod}`}
              className={`focus-ring px-3 py-1.5 ${d.kod === donem ? "bg-soguk text-white" : "bg-yuzey text-metin/70 hover:bg-zemin"}`}
            >
              {d.ad}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {kartlar.map((k) => (
          <div key={k.baslik} className="bg-yuzey border border-hat rounded-lg p-5">
            <p className="text-xs text-metin/55 mb-2">{k.baslik}</p>
            {k.deger.map((d) => (
              <p key={d} className="font-mono text-lg font-medium text-metin leading-snug">
                {d}
              </p>
            ))}
            <p className="text-[11px] text-metin/40 mt-1">{k.alt}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Kişi bazında */}
        <div className="lg:col-span-3 bg-yuzey border border-hat rounded-lg p-5 overflow-x-auto">
          <h3 className="font-display font-medium text-metin mb-3">Kişi Bazında</h3>
          {kisiListesi.length === 0 ? (
            <p className="text-sm text-metin/50">Bu dönemde kayıt yok.</p>
          ) : (
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-left text-[11px] text-metin/50 border-b border-hat">
                  <th className="py-2 font-medium">Kişi</th>
                  <th className="py-2 font-medium text-right">Teklif</th>
                  <th className="py-2 font-medium text-right">Onay</th>
                  <th className="py-2 font-medium text-right">Ret</th>
                  <th className="py-2 font-medium text-right">Kazanma</th>
                  <th className="py-2 font-medium text-right">Açık</th>
                  <th className="py-2 font-medium text-right">Ziyaret</th>
                </tr>
              </thead>
              <tbody>
                {kisiListesi.map((k) => {
                  const s = k.onay + k.red;
                  return (
                    <tr key={k.ad} className="border-b border-hat last:border-0 align-top">
                      <td className="py-2">
                        <p className="text-metin font-medium">{k.ad}</p>
                        {k.onay > 0 && <p className="text-[11px] text-metin/45 font-mono">{paraYaz(k.onayTutar).join(" · ")}</p>}
                      </td>
                      <td className="py-2 text-right font-mono">{k.teklif}</td>
                      <td className="py-2 text-right font-mono text-soguk-dim">{k.onay}</td>
                      <td className="py-2 text-right font-mono text-sicak-dim">{k.red}</td>
                      <td className="py-2 text-right font-mono">{s > 0 ? `%${Math.round((k.onay / s) * 100)}` : "—"}</td>
                      <td className="py-2 text-right font-mono">{k.acik}</td>
                      <td className="py-2 text-right font-mono">{k.ziyaret}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <p className="text-[11px] text-metin/40 mt-3">
            Teklif / Onay / Ret / Ziyaret seçili döneme aittir; Açık = şu an beklemede olan teklifler. Kazanma = onay ÷
            (onay + ret).
          </p>
        </div>

        {/* Proje hunisi */}
        <div className="lg:col-span-2 bg-yuzey border border-hat rounded-lg p-5">
          <h3 className="font-display font-medium text-metin mb-3">Proje Durumları</h3>
          {toplamProje === 0 ? (
            <p className="text-sm text-metin/50">Henüz proje yok.</p>
          ) : (
            <div className="space-y-2.5">
              {PROJE_ASAMALARI.map((p) => {
                const n = asamaSayisi(p.kod);
                return (
                  <div key={p.kod}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-metin/70">{p.ad}</span>
                      <span className="font-mono text-metin">{n}</span>
                    </div>
                    <div className="h-2 bg-zemin rounded-full overflow-hidden">
                      <div className={`h-full ${p.renk} rounded-full`} style={{ width: `${toplamProje ? (n / toplamProje) * 100 : 0}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Link href="/panel/projeler" className="text-xs text-soguk-dim hover:underline mt-4 inline-block">
            Projelere git →
          </Link>
        </div>
      </div>

      {/* Takip bekleyen teklifler */}
      <div className="bg-yuzey border border-hat rounded-lg p-5 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-medium text-metin">
            Takip Bekleyen Teklifler{" "}
            <span className="text-xs text-metin/45 font-normal">({TAKIP_GUN}+ gündür güncellenmeyen, beklemedeki)</span>
          </h3>
          <Link href="/panel/proje-takip" className="text-xs text-soguk-dim hover:underline">
            Proje takibe git →
          </Link>
        </div>
        {takipBekleyen.length === 0 ? (
          <p className="text-sm text-metin/50">Takip bekleyen teklif yok. 👍</p>
        ) : (
          <div className="divide-y divide-hat">
            {takipBekleyen.map((t) => (
              <Link
                key={t.id}
                href={`/panel/teklifler/${t.id}`}
                className="focus-ring flex flex-wrap items-center gap-x-4 gap-y-0.5 py-2 text-sm hover:bg-zemin -mx-2 px-2 rounded"
              >
                <span className="font-mono text-xs text-metin/50 w-20 shrink-0">TKL-{String(t.teklifNo).padStart(4, "0")}</span>
                <span className="flex-1 min-w-[10rem]">
                  <span className="text-metin font-medium">{t.musteri.ad}</span>
                  <span className="text-metin/50"> · {t.baslik || "(Başlıksız)"}</span>
                  {t.takipNotu && <span className="block text-[11px] text-metin/45 truncate">📝 {t.takipNotu}</span>}
                </span>
                <span className="text-xs text-metin/50">{t.olusturanKullanici?.ad || t.olusturanAdi || "—"}</span>
                <span className="font-mono text-xs text-metin w-32 text-right">
                  {paraFormat(teklifToplamlari(t).araToplam, t.paraBirimi)}
                </span>
                <span className="text-xs font-semibold text-sicak-dim w-16 text-right">{gunFarki(t.tarih)} gün</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
