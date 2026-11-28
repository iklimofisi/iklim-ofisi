import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { sayfaYetkisi } from "@/lib/oturum";
import { getTcmbKurlari } from "@/lib/kur";
import { siparisSatisTl, ciroTarihi, CIRO_DURUM_HARIC, SORUMLUSUZ } from "@/lib/ciro";
import { sasTl, maliyeteSayilirMi } from "@/lib/satinalma-siparis";
import SayfaSekmeleri from "@/components/SayfaSekmeleri";
import { raporSekmeleri } from "@/lib/rapor-sekmeleri";

export const dynamic = "force-dynamic";

// -----------------------------------------------------------------------------
// CİRO & PERSONEL RAPORU (Finans → Raporlar)
// Ciro tanımı lib/ciro.ts: onaylı (iptal / red olmayan) siparişlerin KDV hariç TL tutarı, onay tarihine göre.
// Personel cirosu müşterinin FİRMA SORUMLUSUNA yazılır (siparişi kim açarsa açsın).
// Brüt kâr yalnız satınalma bağlanmış siparişlerde (montaj / işçilik dahil değil).
// ?donem=ay | yil | 12ay | tum
// -----------------------------------------------------------------------------
const tl = (n: number) => n.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const yuzde = (n: number) => `${n < 0 ? "-" : ""}%${Math.abs(n).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`;

const DONEMLER = [
  { kod: "ay", ad: "Bu ay" },
  { kod: "yil", ad: "Bu yıl" },
  { kod: "12ay", ad: "Son 12 ay" },
  { kod: "tum", ad: "Tümü" },
] as const;

function donemBaslangici(kod: string): Date | null {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit" }).format(new Date()).split("-");
  if (kod === "ay") return new Date(`${p[0]}-${p[1]}-01T00:00:00+03:00`);
  if (kod === "yil") return new Date(`${p[0]}-01-01T00:00:00+03:00`);
  if (kod === "12ay") return new Date(Date.now() - 365 * 24 * 3600 * 1000);
  return null;
}

type Satir = { anahtar: string; ad: string; siparis: number; musteriler: Set<string>; ciro: number; maliyetliCiro: number; maliyet: number };

export default async function CiroRaporlariPage({ searchParams }: { searchParams?: { donem?: string } }) {
  const giren = await sayfaYetkisi("finans");
  const donem = DONEMLER.find((d) => d.kod === searchParams?.donem)?.kod ?? "yil";
  const bas = donemBaslangici(donem);

  const [siparisler, kullanicilar, kurlar] = await Promise.all([
    prisma.siparis.findMany({
      where: {
        durum: { notIn: [...CIRO_DURUM_HARIC] },
        ...(bas ? { OR: [{ onayTarihi: { gte: bas } }, { onayTarihi: null, olusturmaTarihi: { gte: bas } }] } : {}),
      },
      select: {
        id: true,
        onayTarihi: true,
        olusturmaTarihi: true,
        tutarNet: true,
        paraBirimi: true,
        kur: true,
        faturaKur: true,
        musteri: { select: { id: true, ad: true, sorumluKullaniciId: true } },
        teklif: { select: { paraBirimi: true, kalemler: { select: { adet: true, birimFiyat: true, iskontoYuzde: true } } } },
        satinalmaSiparisleri: { select: { durum: true, tutarNet: true, kur: true, paraBirimi: true } },
      },
    }),
    prisma.kullanici.findMany({ select: { id: true, ad: true } }),
    getTcmbKurlari(),
  ]);
  const kullanici = new Map(kullanicilar.map((k) => [k.id, k]));

  const personel = new Map<string, Satir>();
  const musteriler = new Map<string, Satir & { sorumlu: string }>();
  let toplam = 0;
  let siparisSayisi = 0;
  let yaklasikVar = false;
  for (const s of siparisler) {
    if (bas && ciroTarihi(s) < bas) continue;
    siparisSayisi++;
    const { tl: satis, yaklasik } = siparisSatisTl(s, kurlar);
    if (yaklasik) yaklasikVar = true;
    const bagli = s.satinalmaSiparisleri.filter((x) => maliyeteSayilirMi(x.durum));
    const maliyet = bagli.reduce((a, x) => a + sasTl(x), 0);
    const sid = s.musteri.sorumluKullaniciId && kullanici.has(s.musteri.sorumluKullaniciId) ? s.musteri.sorumluKullaniciId : "";
    const sorumluAd = sid ? kullanici.get(sid)!.ad : SORUMLUSUZ;
    toplam += satis;

    const p = personel.get(sid) ?? { anahtar: sid, ad: sorumluAd, siparis: 0, musteriler: new Set<string>(), ciro: 0, maliyetliCiro: 0, maliyet: 0 };
    p.siparis++;
    p.musteriler.add(s.musteri.id);
    p.ciro += satis;
    if (bagli.length) {
      p.maliyetliCiro += satis;
      p.maliyet += maliyet;
    }
    personel.set(sid, p);

    const m = musteriler.get(s.musteri.id) ?? { anahtar: s.musteri.id, ad: s.musteri.ad, sorumlu: sorumluAd, siparis: 0, musteriler: new Set<string>(), ciro: 0, maliyetliCiro: 0, maliyet: 0 };
    m.siparis++;
    m.ciro += satis;
    if (bagli.length) {
      m.maliyetliCiro += satis;
      m.maliyet += maliyet;
    }
    musteriler.set(s.musteri.id, m);
  }
  const personelListe = [...personel.values()].sort((a, b) => b.ciro - a.ciro);
  const musteriListe = [...musteriler.values()].sort((a, b) => b.ciro - a.ciro).slice(0, 30);
  const enCok = Math.max(1, ...personelListe.map((p) => p.ciro));
  const kar = (x: Satir) => (x.maliyetliCiro > 0 ? x.maliyetliCiro - x.maliyet : null);
  const sorumsuzVar = personel.has("");

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Finans</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-4">Raporlar</h1>
      <SayfaSekmeleri etiket="Rapor sayfaları" aktif="ciro" sekmeler={raporSekmeleri(giren.rol)} />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-metin/60 max-w-3xl">
          Personel cirosu müşterinin <b>firma sorumlusuna</b> yazılır; siparişi kimin açtığı önemli değildir. Firma sorumlusu müşteri kartından
          (Admin) atanır. Tutarlar KDV hariç, TL.
        </p>
        <div className="flex gap-1">
          {DONEMLER.map((d) => (
            <Link
              key={d.kod}
              href={`/panel/siparisler/raporlar?donem=${d.kod}`}
              className={`focus-ring text-xs px-3 py-1.5 rounded-full border ${d.kod === donem ? "bg-soguk text-white border-soguk" : "border-hat text-metin/70 hover:bg-hat"}`}
            >
              {d.ad}
            </Link>
          ))}
        </div>
      </div>

      {sorumsuzVar && (
        <p className="text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-md px-3 py-2 mb-4">
          Bazı müşterilerin firma sorumlusu atanmamış; onların cirosu “{SORUMLUSUZ}” satırında. Müşteri kartından sorumlu atanınca rapor kendiliğinden düzelir.
        </p>
      )}

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-yuzey border border-hat rounded-lg p-4" style={{ borderTopColor: "#0E7C86", borderTopWidth: 4 }}>
          <p className="text-[11px] text-metin/60">Onaylı sipariş</p>
          <p className="font-mono text-xl font-semibold text-metin">{siparisSayisi}</p>
        </div>
        <div className="bg-yuzey border border-hat rounded-lg p-4" style={{ borderTopColor: "#2563EB", borderTopWidth: 4 }}>
          <p className="text-[11px] text-metin/60">Ciro (KDV hariç)</p>
          <p className="font-mono text-xl font-semibold text-metin">{tl(toplam)}</p>
          {yaklasikVar && <p className="text-[10px] text-metin/40">Kuru olmayan eski dövizli kayıtlar bugünkü TCMB kuruyla (≈)</p>}
        </div>
        <div className="bg-yuzey border border-hat rounded-lg p-4" style={{ borderTopColor: "#16A34A", borderTopWidth: 4 }}>
          <p className="text-[11px] text-metin/60">Ciro yapan firma sorumlusu</p>
          <p className="font-mono text-xl font-semibold text-metin">{personelListe.filter((p) => p.anahtar).length}</p>
        </div>
      </div>

      {/* PERSONEL */}
      <div className="bg-yuzey border border-hat rounded-lg overflow-x-auto mb-6">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-xs text-metin/50 border-b border-hat bg-zemin">
              <th className="px-4 py-2.5 font-medium">Firma sorumlusu</th>
              <th className="px-4 py-2.5 font-medium text-right">Müşteri</th>
              <th className="px-4 py-2.5 font-medium text-right">Sipariş</th>
              <th className="px-4 py-2.5 font-medium text-right">Ciro</th>
              <th className="px-4 py-2.5 font-medium w-40">Pay</th>
              <th className="px-4 py-2.5 font-medium text-right">Brüt kâr*</th>
            </tr>
          </thead>
          <tbody>
            {personelListe.map((p) => {
              const k = kar(p);
              return (
                <tr key={p.anahtar || "yok"} className="border-b border-hat last:border-0">
                  <td className={`px-4 py-2.5 font-semibold ${p.anahtar ? "text-metin" : "text-sicak-dim"}`}>{p.ad}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{p.musteriler.size}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{p.siparis}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold">{tl(p.ciro)}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-zemin rounded-full overflow-hidden">
                        <div className="h-full bg-soguk rounded-full" style={{ width: `${(p.ciro / enCok) * 100}%` }} />
                      </div>
                      <span className="font-mono text-[11px] text-metin/60 w-12 text-right">{toplam > 0 ? yuzde((p.ciro / toplam) * 100) : "—"}</span>
                    </div>
                  </td>
                  <td className={`px-4 py-2.5 text-right font-mono ${k == null ? "text-metin/30" : k < 0 ? "text-red-700" : "text-emerald-700"}`}>
                    {k == null ? "—" : tl(k)}
                  </td>
                </tr>
              );
            })}
            {personelListe.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-metin/50">
                  Bu dönemde onaylı sipariş yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <p className="text-[10px] text-metin/40 px-4 py-2">* Yalnız satınalma bağlanmış siparişlerde: ciro − satınalma (montaj / işçilik dahil değil).</p>
      </div>

      {/* MÜŞTERİ */}
      <h2 className="font-display font-medium text-metin mb-2">Müşteri bazında ciro</h2>
      <div className="bg-yuzey border border-hat rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-xs text-metin/50 border-b border-hat bg-zemin">
              <th className="px-4 py-2.5 font-medium">Müşteri</th>
              <th className="px-4 py-2.5 font-medium">Firma sorumlusu</th>
              <th className="px-4 py-2.5 font-medium text-right">Sipariş</th>
              <th className="px-4 py-2.5 font-medium text-right">Ciro</th>
              <th className="px-4 py-2.5 font-medium text-right">Brüt kâr*</th>
            </tr>
          </thead>
          <tbody>
            {musteriListe.map((m) => {
              const k = kar(m);
              return (
                <tr key={m.anahtar} className="border-b border-hat last:border-0">
                  <td className="px-4 py-2">
                    <Link href={`/panel/musteriler/${m.anahtar}`} className="text-soguk-dim hover:underline">
                      {m.ad}
                    </Link>
                  </td>
                  <td className={`px-4 py-2 text-xs ${m.sorumlu === SORUMLUSUZ ? "text-sicak-dim" : "text-metin/70"}`}>{m.sorumlu}</td>
                  <td className="px-4 py-2 text-right font-mono">{m.siparis}</td>
                  <td className="px-4 py-2 text-right font-mono">{tl(m.ciro)}</td>
                  <td className={`px-4 py-2 text-right font-mono ${k == null ? "text-metin/30" : k < 0 ? "text-red-700" : "text-emerald-700"}`}>{k == null ? "—" : tl(k)}</td>
                </tr>
              );
            })}
            {musteriListe.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-metin/50">
                  Bu dönemde onaylı sipariş yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
