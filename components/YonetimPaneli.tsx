import Link from "next/link";
import { yonetimVerisi, ayEtiketi, AY_ADI } from "@/lib/yonetim-verisi";
import { YAS_DILIMLERI } from "@/lib/finans";

// -----------------------------------------------------------------------------
// YÖNETİM PANELİ (Özet sayfasının üstü; yalnız Admin ve Yönetici)
// Rakamlar lib/yonetim-verisi.ts'ten gelir (PDF raporu da aynı veriyi kullanır).
// Grafikler sunucuda SVG olarak çizilir (ek kütüphane yok).
// -----------------------------------------------------------------------------

const tl = (n: number) => n.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const kisa = (n: number) => {
  const m = Math.abs(n);
  if (m >= 1e6) return `${(n / 1e6).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} Mn`;
  if (m >= 1e3) return `${(n / 1e3).toLocaleString("tr-TR", { maximumFractionDigits: 0 })} B`;
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
};
const yuzde = (n: number) => `${n < 0 ? "-" : ""}%${Math.abs(n).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`;

// Renkler (panel teması + grafik renkleri)
const R = {
  soguk: "#0E7C86",
  sogukAcik: "#5FB8BE",
  sicak: "#E8734A",
  yesil: "#16A34A",
  sari: "#F59E0B",
  kirmizi: "#B91C1C",
  mor: "#7C3AED",
  mavi: "#2563EB",
  gri: "#CBD5E1",
  hat: "#D7E0E1",
  yazi: "#89909a",
};
const YAS_RENK = [R.soguk, R.sari, R.sicak, R.kirmizi];
const PB_RENK: Record<string, string> = { TRY: R.soguk, EUR: R.mavi, USD: R.yesil, GBP: R.mor };
const HAT_RENK = [R.gri, R.mor, R.sari, R.mavi, R.soguk, R.sicak];

// Halka (donut) grafik
function Halka({ dilimler, orta, alt, boyut = 120 }: { dilimler: { deger: number; renk: string; ad: string }[]; orta: string; alt?: string; boyut?: number }) {
  const toplam = dilimler.reduce((a, d) => a + Math.max(0, d.deger), 0);
  const r = 42;
  const cevre = 2 * Math.PI * r;
  let bas = 0;
  return (
    <svg viewBox="0 0 120 120" width={boyut} height={boyut} role="img" aria-label={orta}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="#EEF2F3" strokeWidth="14" />
      {toplam > 0 &&
        dilimler.map((d) => {
          const pay = Math.max(0, d.deger) / toplam;
          const el = (
            <circle
              key={d.ad}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={d.renk}
              strokeWidth="14"
              strokeDasharray={`${pay * cevre} ${cevre}`}
              strokeDashoffset={-bas * cevre}
              transform="rotate(-90 60 60)"
            >
              <title>{`${d.ad}: ${yuzde(pay * 100)}`}</title>
            </circle>
          );
          bas += pay;
          return el;
        })}
      <text x="60" y={alt ? 60 : 65} textAnchor="middle" fontSize="17" fontWeight="700" fill="#12212B">
        {orta}
      </text>
      {alt && (
        <text x="60" y="76" textAnchor="middle" fontSize="9" fill={R.yazi}>
          {alt}
        </text>
      )}
    </svg>
  );
}

// Küçük eğilim çizgisi
function Kivrim({ degerler, renk }: { degerler: number[]; renk: string }) {
  const w = 110;
  const h = 30;
  const max = Math.max(1, ...degerler);
  const adim = w / Math.max(1, degerler.length - 1);
  const noktalar = degerler.map((v, i) => `${(i * adim).toFixed(1)},${(h - 2 - (v / max) * (h - 6)).toFixed(1)}`);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden>
      <polygon points={`0,${h} ${noktalar.join(" ")} ${w},${h}`} fill={renk} opacity="0.12" />
      <polyline points={noktalar.join(" ")} fill="none" stroke={renk} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={(degerler.length - 1) * adim} cy={h - 2 - (degerler[degerler.length - 1] / max) * (h - 6)} r="2.5" fill={renk} />
    </svg>
  );
}

export default async function YonetimPaneli() {
  const v = await yonetimVerisi();
  const kart = "bg-yuzey border border-hat rounded-xl p-4 shadow-sm";
  const son6 = v.aylik.slice(-6);

  const kpiler: { baslik: string; deger: string; alt?: string; renk: string; ikon: string; degerRenk?: string; href?: string; ek?: React.ReactNode }[] = [
    {
      baslik: "Bu ay ciro",
      deger: tl(v.ciroBuAy),
      alt: v.ciroDegisim == null ? `Geçen ay: ${tl(v.ciroGecenAy)}` : `Geçen aya göre ${v.ciroDegisim >= 0 ? "▲" : "▼"} ${yuzde(Math.abs(v.ciroDegisim))}`,
      renk: R.soguk,
      ikon: "📈",
      degerRenk: undefined,
      href: "/panel/siparisler",
      ek: <Kivrim degerler={son6.map((a) => a.ciro)} renk={R.soguk} />,
    },
    {
      baslik: `${v.buYil} ciro`,
      deger: tl(v.ciroYil),
      alt: `${v.yilSiparisSayisi} onaylı sipariş`,
      renk: R.mavi,
      ikon: "🏆",
      href: "/panel/siparisler/raporlar",
      ek: <Kivrim degerler={v.aylik.map((a) => a.ciro)} renk={R.mavi} />,
    },
    {
      baslik: `${v.buYil} brüt kâr`,
      deger: v.maliyetliSayi ? tl(v.karYil) : "—",
      alt: v.maliyetliSayi ? `Marj ${v.marjYil == null ? "—" : yuzde(v.marjYil)} · ${v.maliyetliSayi}/${v.yilSiparisSayisi} siparişte maliyet var` : "Satınalma bağlanmış sipariş yok",
      renk: v.karYil < 0 ? R.kirmizi : R.yesil,
      ikon: "💰",
      degerRenk: v.karYil < 0 ? "text-red-700" : "text-emerald-700",
      ek: <Kivrim degerler={v.aylik.map((a) => Math.max(0, a.kar))} renk={R.yesil} />,
    },
    {
      baslik: "Açık teklif hacmi",
      deger: `≈ ${tl(v.acikTeklifTl)}`,
      alt: `${v.acikTeklifSayi} teklif bekliyor${v.kursuzTeklif ? ` · ${v.kursuzTeklif} kursuz` : ""}`,
      renk: R.mor,
      ikon: "📋",
      href: "/panel/teklifler",
    },
    {
      baslik: "Teklif kazanma (90 gün)",
      deger: v.kazanmaOrani == null ? "—" : yuzde(v.kazanmaOrani),
      alt: `${v.kazanilanSayi} onay · ${v.kaybedilenSayi} red`,
      renk: R.sari,
      ikon: "🎯",
    },
    {
      baslik: "Bekleyen tahsilat",
      deger: tl(v.bekleyenTahsilat),
      alt: v.gecikmis > 0.5 ? `30 gün üstü: ${tl(v.gecikmis)}` : "Gecikmiş alacak yok",
      renk: R.sicak,
      ikon: "🧾",
      degerRenk: v.bekleyenTahsilat > 0 ? "text-sicak-dim" : undefined,
      href: "/panel/cari",
    },
    { baslik: "Tedarikçilere borç", deger: tl(v.tedarikciBorcu), alt: "Alış faturaları − ödemeler", renk: R.kirmizi, ikon: "🏭", href: "/panel/satinalma/cari" },
    {
      baslik: "Net: alacak − borç",
      deger: tl(v.bekleyenTahsilat - v.tedarikciBorcu),
      alt: "Müşteri alacağı − tedarikçi borcu",
      renk: v.bekleyenTahsilat - v.tedarikciBorcu < 0 ? R.kirmizi : R.yesil,
      ikon: "⚖️",
      degerRenk: v.bekleyenTahsilat - v.tedarikciBorcu < 0 ? "text-red-700" : "text-emerald-700",
    },
  ];

  // Ana grafik ölçüleri
  const G = { w: 660, h: 230, sol: 50, sag: 8, alt: 28, ust: 12 };
  const ic = { w: G.w - G.sol - G.sag, h: G.h - G.alt - G.ust };
  const grafikMax = Math.max(1, ...v.aylik.map((a) => Math.max(a.ciro, a.maliyet, a.kar)));
  const grupW = ic.w / 12;
  const barW = Math.min(15, grupW / 3);
  const yO = (x: number) => G.ust + ic.h - (Math.max(0, x) / grafikMax) * ic.h;
  const izgara = [0, 0.25, 0.5, 0.75, 1].map((o) => grafikMax * o);
  const karNoktalari = v.aylik.map((a, i) => ({ x: G.sol + i * grupW + grupW / 2, y: yO(a.kar), a }));

  const hatMax = Math.max(1, ...v.hat.map((h) => h.sayi));
  const pbToplam = v.pbDagilim.reduce((a, x) => a + x.tl, 0);

  return (
    <section className="mb-8" aria-label="Yönetim paneli">
      {/* BAŞLIK */}
      <div className="rounded-xl mb-4 px-5 py-4 text-white shadow-sm" style={{ background: "linear-gradient(120deg, #0B646C 0%, #0E7C86 55%, #2A9DA6 100%)" }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/70">Yönetim Paneli</p>
            <p className="font-display text-lg font-semibold">
              {AY_ADI[Number(v.buAy.slice(5, 7)) - 1]} {v.buAy.slice(0, 4)} · bu ay {tl(v.ciroBuAy)} ciro
            </p>
            <p className="text-[11px] text-white/70 mt-0.5">
              Tutarlar KDV hariç, TL. Döviz kayıtları kendi kuruyla{v.yaklasikVar ? "; kuru olmayan eski kayıtlar bugünkü TCMB kuruyla (≈)" : ""}.
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="/api/rapor/yonetim"
              target="_blank"
              rel="noopener"
              className="focus-ring text-sm bg-white/15 hover:bg-white/25 border border-white/30 px-3 py-2 rounded-md font-medium"
            >
              📄 PDF görüntüle
            </a>
            <a href="/api/rapor/yonetim?indir=1" className="focus-ring text-sm bg-white text-soguk-dim hover:bg-white/90 px-3 py-2 rounded-md font-semibold">
              ⬇ PDF indir
            </a>
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {kpiler.map((k) => {
          const icerik = (
            <>
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-medium text-metin/60">{k.baslik}</p>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0" style={{ background: `${k.renk}1A` }} aria-hidden>
                  {k.ikon}
                </span>
              </div>
              <p className={`font-mono text-lg sm:text-xl font-semibold mt-1 ${k.degerRenk ?? "text-metin"}`}>{k.deger}</p>
              {k.alt && <p className="text-[11px] text-metin/50 mt-0.5">{k.alt}</p>}
              {k.ek && <div className="mt-2 hidden sm:block">{k.ek}</div>}
            </>
          );
          const stil = { borderTopColor: k.renk, borderTopWidth: 4 };
          return k.href ? (
            <Link key={k.baslik} href={k.href} className={`focus-ring block ${kart} hover:shadow-md transition-shadow`} style={stil}>
              {icerik}
            </Link>
          ) : (
            <div key={k.baslik} className={kart} style={stil}>
              {icerik}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* AYLIK CİRO / MALİYET / KÂR */}
        <div className={`${kart} lg:col-span-2`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h3 className="font-display font-medium text-sm text-metin">Son 12 ay: ciro, maliyet ve brüt kâr</h3>
            <div className="flex items-center gap-3 text-[11px] text-metin/60">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: R.soguk }} /> Ciro
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: R.sicak }} /> Maliyet
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-0.5" style={{ background: R.yesil }} /> Brüt kâr
              </span>
            </div>
          </div>
          <svg viewBox={`0 0 ${G.w} ${G.h}`} className="w-full h-auto" role="img" aria-label="Son 12 ayın cirosu, maliyeti ve brüt kârı">
            <defs>
              <linearGradient id="yp-ciro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2A9DA6" />
                <stop offset="100%" stopColor={R.soguk} />
              </linearGradient>
              <linearGradient id="yp-maliyet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F29A78" />
                <stop offset="100%" stopColor={R.sicak} />
              </linearGradient>
            </defs>
            {izgara.map((x, i) => (
              <g key={i}>
                <line x1={G.sol} x2={G.w - G.sag} y1={yO(x)} y2={yO(x)} stroke={R.hat} strokeWidth={i === 0 ? 1 : 0.6} strokeDasharray={i === 0 ? undefined : "3 3"} />
                <text x={G.sol - 6} y={yO(x) + 3} fontSize="9" textAnchor="end" fill={R.yazi}>
                  {kisa(x)}
                </text>
              </g>
            ))}
            {v.aylik.map((a, i) => {
              const x0 = G.sol + i * grupW + grupW / 2;
              const buAyMi = a.ay === v.buAy;
              return (
                <g key={a.ay}>
                  {buAyMi && <rect x={x0 - grupW / 2 + 2} y={G.ust} width={grupW - 4} height={ic.h} fill="#E4F3F2" rx="4" />}
                  <rect x={x0 - barW - 1} y={yO(a.ciro)} width={barW} height={Math.max(0, G.ust + ic.h - yO(a.ciro))} rx="3" fill="url(#yp-ciro)">
                    <title>{`${ayEtiketi(a.ay)} · Ciro ${tl(a.ciro)} · ${a.adet} sipariş`}</title>
                  </rect>
                  <rect x={x0 + 1} y={yO(a.maliyet)} width={barW} height={Math.max(0, G.ust + ic.h - yO(a.maliyet))} rx="3" fill="url(#yp-maliyet)">
                    <title>{`${ayEtiketi(a.ay)} · Maliyet ${tl(a.maliyet)}`}</title>
                  </rect>
                  <text x={x0} y={G.h - 12} fontSize="9" textAnchor="middle" fill={buAyMi ? "#0B646C" : R.yazi} fontWeight={buAyMi ? 700 : 400}>
                    {AY_ADI[Number(a.ay.slice(5, 7)) - 1]}
                  </text>
                  {(a.ay.endsWith("-01") || i === 0) && (
                    <text x={x0} y={G.h - 2} fontSize="8" textAnchor="middle" fill="#a0a6aa">
                      {a.ay.slice(0, 4)}
                    </text>
                  )}
                </g>
              );
            })}
            <polyline points={karNoktalari.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={R.yesil} strokeWidth="2" strokeLinejoin="round" />
            {karNoktalari.map((p) => (
              <circle key={p.a.ay} cx={p.x} cy={p.y} r={p.a.karVar ? 3 : 2} fill={p.a.kar < 0 ? R.kirmizi : R.yesil} stroke="#fff" strokeWidth="1">
                <title>{`${ayEtiketi(p.a.ay)} · Brüt kâr ${p.a.karVar ? tl(p.a.kar) : "maliyet girilmedi"}`}</title>
              </circle>
            ))}
          </svg>
          <p className="text-[10px] text-metin/40 mt-1">Üzerine gelince tutar görünür. Maliyet: siparişlere bağlanan satınalmalar (montaj / işçilik hariç). Kâr çizgisi eksi aylarda sıfırda gösterilir (nokta kırmızı).</p>
        </div>

        {/* TEKLİF HALKASI + DÖVİZ DAĞILIMI */}
        <div className={kart}>
          <h3 className="font-display font-medium text-sm text-metin mb-2">Teklif sonuçları (90 gün)</h3>
          <div className="flex items-center gap-4">
            <Halka
              orta={v.kazanmaOrani == null ? "—" : yuzde(v.kazanmaOrani)}
              alt="kazanma"
              dilimler={[
                { ad: "Onaylanan", deger: v.kazanilanSayi, renk: R.yesil },
                { ad: "Reddedilen", deger: v.kaybedilenSayi, renk: R.sicak },
              ]}
            />
            <ul className="text-xs space-y-1.5">
              <li className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: R.yesil }} /> Onaylanan <b className="font-mono ml-1">{v.kazanilanSayi}</b>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: R.sicak }} /> Reddedilen <b className="font-mono ml-1">{v.kaybedilenSayi}</b>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: R.gri }} /> Bekleyen <b className="font-mono ml-1">{v.acikTeklifSayi}</b>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-hat">
            <p className="text-xs font-medium text-metin/70 mb-2">{v.buYil} ciro — sipariş para birimi</p>
            {pbToplam <= 0 ? (
              <p className="text-xs text-metin/50">Bu yıl onaylı sipariş yok.</p>
            ) : (
              <>
                <div className="flex h-3 rounded-full overflow-hidden mb-2">
                  {v.pbDagilim.map((x) => (
                    <div key={x.pb} title={`${x.pb}: ${tl(x.tl)}`} style={{ width: `${(x.tl / pbToplam) * 100}%`, background: PB_RENK[x.pb] ?? R.gri }} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-metin/70">
                  {v.pbDagilim.map((x) => (
                    <span key={x.pb} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm" style={{ background: PB_RENK[x.pb] ?? R.gri }} />
                      {x.pb} {yuzde((x.tl / pbToplam) * 100)}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* İŞ HATTI */}
        <div className={kart}>
          <h3 className="font-display font-medium text-sm text-metin mb-3">İş hattı</h3>
          <ul className="space-y-2.5">
            {v.hat.map((h, i) => (
              <li key={h.ad}>
                <Link href={h.href} className="focus-ring block group">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-metin/70 group-hover:text-soguk-dim">{h.ad}</span>
                    <span className="font-mono font-semibold text-metin">{h.sayi}</span>
                  </div>
                  <div className="h-2 bg-zemin rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(h.sayi ? 4 : 0, (h.sayi / hatMax) * 100)}%`, background: HAT_RENK[i] }} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t border-hat grid grid-cols-3 gap-2 text-center">
            {[
              { ad: "Satınalma onayı", sayi: v.satinalma.onay, href: "/panel/satinalma/siparisler?durum=onay", renk: R.sari },
              { ad: "Teslim bekleyen", sayi: v.satinalma.teslim, href: "/panel/satinalma/siparisler", renk: R.mavi },
              { ad: "Alış faturası bekleyen", sayi: v.satinalma.fatura, href: "/panel/satinalma/siparisler?durum=fatura", renk: R.sicak },
            ].map((x) => (
              <Link key={x.ad} href={x.href} className="focus-ring rounded-lg py-1.5 hover:opacity-80" style={{ background: `${x.renk}14` }}>
                <p className="font-mono text-base font-bold" style={{ color: x.sayi ? x.renk : "#9aa3a8" }}>
                  {x.sayi}
                </p>
                <p className="text-[10px] text-metin/60 leading-tight px-1">{x.ad}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* DİKKAT GEREKENLER */}
        <div className={kart}>
          <h3 className="font-display font-medium text-sm text-metin mb-3">Dikkat gerekenler</h3>
          {v.dikkat.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-3">
              <span className="text-lg">✓</span> Bekleyen onay, gecikmiş alacak ya da sorunlu sipariş yok.
            </div>
          ) : (
            <ul className="space-y-1.5">
              {v.dikkat.map((d) => (
                <li key={d.metin}>
                  <Link
                    href={d.href}
                    className={`focus-ring flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs border ${
                      d.ciddi ? "bg-red-50 border-red-200 text-red-900 hover:bg-red-100" : "bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden>{d.ciddi ? "⚠" : "•"}</span>
                      {d.metin}
                    </span>
                    <span className="opacity-50 shrink-0">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ALACAK YAŞLANDIRMA */}
        <div className={kart}>
          <h3 className="font-display font-medium text-sm text-metin mb-2">Alacak yaşlandırma</h3>
          {v.yaslandirma.yasToplam <= 0.5 ? (
            <p className="text-sm text-metin/50">Açık alacak yok.</p>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <Halka
                  boyut={110}
                  orta={kisa(v.yaslandirma.yasToplam)}
                  alt="TL alacak"
                  dilimler={v.yaslandirma.toplam.map((x, i) => ({ ad: YAS_DILIMLERI[i], deger: x, renk: YAS_RENK[i] }))}
                />
                <ul className="space-y-1 text-xs flex-1">
                  {v.yaslandirma.toplam.map((x, i) => (
                    <li key={i} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-metin/70">
                        <span className="inline-block w-2 h-2 rounded-sm" style={{ background: YAS_RENK[i] }} />
                        {YAS_DILIMLERI[i]}
                      </span>
                      <span className="font-mono">{kisa(x)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {v.yaslandirma.enBuyuk.length > 0 && (
                <div className="mt-3 pt-2 border-t border-hat">
                  <p className="text-[11px] text-metin/50 mb-1">En büyük alacaklar</p>
                  {v.yaslandirma.enBuyuk.slice(0, 3).map((s) => (
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
        {v.sonSiparisler.length === 0 ? (
          <p className="text-sm text-metin/50">Onaylanmış sipariş yok.</p>
        ) : (
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="text-left text-[11px] text-metin/50 border-b border-hat">
                <th className="py-1.5 font-medium">Sipariş</th>
                <th className="py-1.5 font-medium">Müşteri</th>
                <th className="py-1.5 font-medium text-right">Satış</th>
                <th className="py-1.5 font-medium text-right">Maliyet</th>
                <th className="py-1.5 font-medium text-right">Brüt kâr</th>
                <th className="py-1.5 font-medium w-36">Marj</th>
              </tr>
            </thead>
            <tbody>
              {v.sonSiparisler.slice(0, 10).map((s) => {
                const marj = s.satis > 0 && s.maliyetVar ? (s.kar / s.satis) * 100 : null;
                const marjRenk = marj == null ? R.gri : marj < 0 ? R.kirmizi : marj < 10 ? R.sari : R.yesil;
                return (
                  <tr key={s.id} className="border-b border-hat last:border-0">
                    <td className="py-1.5">
                      <Link href={`/panel/siparisler/${s.id}`} className="text-soguk-dim hover:underline font-mono text-xs">
                        TKL-{String(s.teklifNo).padStart(4, "0")}
                      </Link>{" "}
                      <span className="text-metin/60 text-xs">{s.baslik}</span>
                      {s.fazlaAlim && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold">çift alım?</span>}
                    </td>
                    <td className="py-1.5 text-metin/70 text-xs">{s.musteriAd}</td>
                    <td className="py-1.5 text-right font-mono">
                      {s.yaklasik ? "≈ " : ""}
                      {tl(s.satis)}
                      {s.pb !== "TRY" && <span className="block text-[10px] text-metin/40">{s.pb}</span>}
                    </td>
                    <td className="py-1.5 text-right font-mono text-metin/70">{s.maliyetVar ? tl(s.maliyet) : <span className="text-metin/30 text-xs">girilmedi</span>}</td>
                    <td className={`py-1.5 text-right font-mono font-semibold ${!s.maliyetVar ? "text-metin/30" : s.kar < 0 ? "text-red-700" : "text-emerald-700"}`}>
                      {s.maliyetVar ? tl(s.kar) : "—"}
                    </td>
                    <td className="py-1.5 pl-3">
                      {marj == null ? (
                        <span className="text-metin/30 text-xs">—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-zemin rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.abs(marj))}%`, background: marjRenk }} />
                          </div>
                          <span className="font-mono text-[11px] w-12 text-right" style={{ color: marjRenk }}>
                            {yuzde(marj)}
                          </span>
                        </div>
                      )}
                    </td>
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
          { baslik: `${v.buYil} en çok ciro yapan müşteriler`, liste: v.enIyiMusteriler, renkler: [R.soguk, R.sogukAcik, R.mavi, R.mor, R.gri] },
          { baslik: `${v.buYil} personel cirosu (firma sorumlusu)`, liste: v.personel, renkler: [R.sicak, R.sari, R.yesil, R.mavi, R.gri] },
        ].map((b) => {
          const enCok = Math.max(1, ...b.liste.map((x) => x.ciro));
          return (
            <div key={b.baslik} className={kart}>
              <h3 className="font-display font-medium text-sm text-metin mb-3">{b.baslik}</h3>
              {b.liste.length === 0 ? (
                <p className="text-sm text-metin/50">Bu yıl onaylı sipariş yok.</p>
              ) : (
                <ul className="space-y-2.5">
                  {b.liste.map((x, i) => (
                    <li key={x.ad}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-metin truncate mr-2 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center shrink-0" style={{ background: b.renkler[i] }}>
                            {i + 1}
                          </span>
                          {x.ad} <span className="text-metin/40">· {x.adet} sipariş</span>
                        </span>
                        <span className="font-mono shrink-0">{tl(x.ciro)}</span>
                      </div>
                      <div className="h-2 bg-zemin rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(x.ciro / enCok) * 100}%`, background: b.renkler[i] }} />
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
