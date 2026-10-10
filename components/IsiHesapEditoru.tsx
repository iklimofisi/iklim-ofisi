"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { isiHesapKaydet, isiHesapTeklifeAktar } from "@/lib/isi-hesap-actions";
import { bildirimGoster } from "@/lib/bildirim";
import {
  ISITICILAR,
  yeniOda,
  yeniEleman,
  ornekDaire,
  yeniId,
  pencereMi,
  varsayilanKesit,
  type HesapVerisi,
  type Oda,
  type Eleman,
  type PompaModeli,
  type Isitici,
} from "@/lib/isi-hesap/tipler";
import {
  ODA_TIPLERI,
  ELEMAN_TURLERI,
  KESITLER,
  YALITIMLAR,
  PENCERELER,
  B_KATSAYILARI,
  ISI_KOPRUSU,
  YONLER,
  KAPLAMALAR,
  YERDEN_BORULARI,
  RADYATOR_TIPLERI,
  RADYATOR_YUKSEKLIKLERI,
  type OdaTipi,
  type ElemanTuru,
  type Yon,
  type RadyatorTipi,
  type RadyatorYukseklik,
} from "@/lib/isi-hesap/katalog";
import { ILLER, ilBul } from "@/lib/isi-hesap/iklim";
import { sistemiHesapla, elemanU, sy, type HesapSonucu, type OdaSonucu } from "@/lib/isi-hesap/hesap";
import { tesisatSemasi, serimKrokisi } from "@/lib/isi-hesap/cizim";
import { cizimSvg } from "@/lib/isi-hesap/svg";

// -----------------------------------------------------------------------------
// ISI POMPASI HESABI — DÜZENLEME EKRANI
// Girdiler değiştikçe hesap tarayıcıda anında yeniden yapılır; "Kaydet" ile
// veritabanına yazılır. PDF ve teklife aktarma son kaydedilen hâli kullanır.
// -----------------------------------------------------------------------------

type Props = {
  hesap: { id: string; ad: string; musteriId: string; veri: HesapVerisi; teklif: { id: string; no: number } | null };
  musteriler: { id: string; ad: string }[];
  modeller: PompaModeli[];
};

type Sekme = "proje" | "odalar" | "sonuclar" | "sema" | "malzeme";
const SEKMELER: [Sekme, string][] = [
  ["proje", "1 · Proje & Sistem"],
  ["odalar", "2 · Odalar"],
  ["sonuclar", "3 · Sonuçlar"],
  ["sema", "4 · Şema & Krokiler"],
  ["malzeme", "5 · Malzeme & Teklif"],
];

const girdi = "focus-ring w-full border border-hat rounded-md px-2.5 py-1.5 text-sm bg-white";
const etiket = "block text-[11px] font-medium text-metin/60 mb-1";

// Ondalık virgül kabul eden sayı alanı (yazarken ara değerleri bozmaz)
function SayiAlani({
  deger,
  onChange,
  min,
  maks,
  adim = 0.1,
  bosOlabilir = false,
  yerTutucu,
  className = girdi,
  aria,
}: {
  deger: number | null;
  onChange: (n: number | null) => void;
  min?: number;
  maks?: number;
  adim?: number;
  bosOlabilir?: boolean;
  yerTutucu?: string;
  className?: string;
  aria?: string;
}) {
  const bicim = (n: number | null) => (n === null ? "" : String(Math.round(n * 1000) / 1000).replace(".", ","));
  const [metin, setMetin] = useState(bicim(deger));
  const odak = useRef(false);
  useEffect(() => {
    if (!odak.current) setMetin(bicim(deger));
  }, [deger]);
  return (
    <input
      inputMode="decimal"
      value={metin}
      placeholder={yerTutucu}
      aria-label={aria}
      className={className}
      onFocus={() => (odak.current = true)}
      onBlur={() => {
        odak.current = false;
        setMetin(bicim(deger));
      }}
      onChange={(e) => {
        const t = e.target.value;
        setMetin(t);
        const temiz = t.replace(",", ".").trim();
        if (!temiz) {
          if (bosOlabilir) onChange(null);
          return;
        }
        const n = parseFloat(temiz);
        if (!Number.isFinite(n)) return;
        let x = n;
        if (min !== undefined) x = Math.max(min, x);
        if (maks !== undefined) x = Math.min(maks, x);
        onChange(x);
      }}
      step={adim}
    />
  );
}

function Alan({ ad, children, className = "" }: { ad: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className={etiket}>{ad}</span>
      {children}
    </label>
  );
}

function Kart({ baslik, children, aciklama }: { baslik: string; children: React.ReactNode; aciklama?: string }) {
  return (
    <section className="bg-yuzey border border-hat rounded-lg p-4 sm:p-5">
      <h2 className="font-display font-semibold text-metin text-sm mb-1">{baslik}</h2>
      {aciklama && <p className="text-xs text-metin/50 mb-3">{aciklama}</p>}
      {!aciklama && <div className="mb-3" />}
      {children}
    </section>
  );
}

const W = (x: number) => `${sy(x, 0)} W`;
const KW = (x: number) => `${sy(x / 1000, 2)} kW`;

export default function IsiHesapEditoru({ hesap, musteriler, modeller }: Props) {
  const [ad, setAd] = useState(hesap.ad);
  const [musteriId, setMusteriId] = useState(hesap.musteriId);
  const [veri, setVeri] = useState<HesapVerisi>(hesap.veri);
  const [sekme, setSekme] = useState<Sekme>(hesap.veri.odalar.length ? "odalar" : "proje");
  const [seciliOda, setSeciliOda] = useState<string>(hesap.veri.odalar[0]?.id ?? "");
  const [kayitli, setKayitli] = useState(() => JSON.stringify({ ad: hesap.ad, musteriId: hesap.musteriId, veri: hesap.veri }));
  const [hata, setHata] = useState("");
  const [kaydediliyor, baslat] = useTransition();

  const simdiki = JSON.stringify({ ad, musteriId, veri });
  const degisti = simdiki !== kayitli;

  const sonuc: HesapSonucu = useMemo(() => sistemiHesapla(veri, modeller), [veri, modeller]);

  // Kaydedilmemiş değişiklik varken sayfadan çıkılırsa uyar
  useEffect(() => {
    const f = (e: BeforeUnloadEvent) => {
      if (!degisti) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", f);
    return () => window.removeEventListener("beforeunload", f);
  }, [degisti]);

  const guncelle = (p: Partial<HesapVerisi>) => setVeri((v) => ({ ...v, ...p }));
  const odaGuncelle = (id: string, p: Partial<Oda>) => setVeri((v) => ({ ...v, odalar: v.odalar.map((o) => (o.id === id ? { ...o, ...p } : o)) }));
  const elemanGuncelle = (odaId: string, elId: string, p: Partial<Eleman>) =>
    setVeri((v) => ({
      ...v,
      odalar: v.odalar.map((o) => (o.id === odaId ? { ...o, elemanlar: o.elemanlar.map((e) => (e.id === elId ? { ...e, ...p } : e)) } : o)),
    }));

  const kaydet = (sonra?: () => void) => {
    setHata("");
    const gonderilen = simdiki;
    baslat(async () => {
      const r = await isiHesapKaydet({ id: hesap.id, ad, musteriId, veri: JSON.stringify(veri) });
      if (r.ok) {
        setKayitli(gonderilen);
        bildirimGoster("Hesap kaydedildi.");
        sonra?.();
      } else {
        setHata(r.hata);
      }
    });
  };

  const pdfAc = () => {
    const url = `/api/isi-hesap/${hesap.id}/pdf`;
    if (!degisti) {
      window.open(url, "_blank", "noopener");
      return;
    }
    const pencere = window.open("", "_blank");
    kaydet(() => {
      if (pencere) pencere.location.href = url;
      else window.location.href = url;
    });
  };

  const il = ilBul(veri.il);
  const oda = veri.odalar.find((o) => o.id === seciliOda) ?? veri.odalar[0] ?? null;
  const odaSonuc = oda ? sonuc.odalar.find((o) => o.id === oda.id) ?? null : null;

  return (
    <div className="max-w-6xl">
      {/* ÜST ÇUBUK */}
      <div className="sticky top-0 z-20 -mx-6 px-6 sm:-mx-10 sm:px-10 py-3 bg-zemin/95 backdrop-blur border-b border-hat mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/panel/isi-hesabi" className="focus-ring text-sm text-metin/60 hover:text-metin">
            ←
          </Link>
          <input
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            maxLength={200}
            aria-label="Hesap adı"
            className="focus-ring flex-1 min-w-[12rem] border border-hat rounded-md px-3 py-2 text-sm font-medium bg-white"
          />
          <select value={musteriId} onChange={(e) => setMusteriId(e.target.value)} aria-label="Müşteri" className="focus-ring border border-hat rounded-md px-3 py-2 text-sm bg-white max-w-[14rem]">
            <option value="">— Müşteri seçilmedi —</option>
            {musteriler.map((m) => (
              <option key={m.id} value={m.id}>
                {m.ad}
              </option>
            ))}
          </select>
          <span className={`text-xs ${degisti ? "text-sicak-dim font-medium" : "text-metin/40"}`}>{degisti ? "● Kaydedilmedi" : "✓ Kayıtlı"}</span>
          <button
            type="button"
            onClick={pdfAc}
            disabled={kaydediliyor}
            className="focus-ring text-sm font-medium border border-hat bg-white px-4 py-2 rounded-md text-metin/70 hover:border-soguk disabled:opacity-60"
          >
            📄 PDF
          </button>
          <button
            type="button"
            onClick={() => kaydet()}
            disabled={kaydediliyor || !ad.trim()}
            className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim disabled:opacity-60"
          >
            {kaydediliyor ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
        {hata && <p className="text-xs text-sicak-dim mt-2">Kaydedilemedi: {hata}</p>}
        {/* Özet */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <Ozet ad="Dış tasarım" deger={`${sy(sonuc.disSicaklik)} °C`} alt={sonuc.il} />
          <Ozet ad="Odaların ısı kaybı" deger={KW(sonuc.isiKaybi)} alt={`${sy(sonuc.toplamAlan)} m² · ${sy(sonuc.wm2, 0)} W/m²`} />
          <Ozet ad="Isı pompası yükü" deger={KW(sonuc.tasarimYuku)} alt={sonuc.sicakSuYuku ? `sıcak su dahil` : "ısıtma"} vurgu />
          <Ozet
            ad="Isı pompası gidiş"
            deger={`${sy(sonuc.pompaGidis)} °C`}
            alt={sonuc.radyatorVar && sonuc.pompaGidis === sonuc.radyatorRejimi.gidis ? "radyatör rejimi" : "yerden ısıtmaya göre"}
          />
          <Ozet
            ad="Yerden ısıtma"
            deger={sonuc.yerdenGidis !== null ? `${sy(sonuc.yerdenGidis)}/${sy(sonuc.yerdenDonusOrt ?? 0)} °C` : "—"}
            alt={sonuc.yerdenVar ? `${sonuc.kollektorler.reduce((t, k) => t + k.agiz, 0)} devre` : "yok"}
          />
          <Ozet
            ad="Önerilen model"
            deger={sonuc.secilenModel ? sonuc.secilenModel.ad : modeller.length ? "Uygun yok" : "Model yok"}
            alt={sonuc.secilenModel ? `${sy(sonuc.secilenModel.kapasiteTasarim)} kW @ ${sy(sonuc.disSicaklik)} °C` : "Modeller sayfasından ekleyin"}
          />
        </div>
      </div>

      {/* SEKMELER */}
      <div className="flex flex-wrap gap-1 mb-5 border-b border-hat" role="tablist">
        {SEKMELER.map(([k, a]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={sekme === k}
            onClick={() => setSekme(k)}
            className={`focus-ring px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              sekme === k ? "border-soguk text-soguk-dim" : "border-transparent text-metin/50 hover:text-metin"
            }`}
          >
            {a}
            {k === "sonuclar" && sonuc.uyarilar.length + sonuc.odalar.reduce((t, o) => t + o.uyarilar.length, 0) > 0 && (
              <span className="ml-1.5 inline-block min-w-[1.25rem] px-1 rounded-full bg-sicak/15 text-sicak-dim text-[10px]">
                {sonuc.uyarilar.length + sonuc.odalar.reduce((t, o) => t + o.uyarilar.length, 0)}
              </span>
            )}
          </button>
        ))}
      </div>

      {sekme === "proje" && <ProjeSekmesi veri={veri} guncelle={guncelle} modeller={modeller} sonuc={sonuc} ilSicaklik={il.disSicaklik} />}

      {sekme === "odalar" && (
        <div className="grid lg:grid-cols-[16rem_1fr] gap-5 items-start">
          {/* Oda listesi */}
          <div className="bg-yuzey border border-hat rounded-lg p-3 lg:sticky lg:top-44">
            <div className="space-y-1 mb-3">
              {veri.odalar.map((o, i) => {
                const os = sonuc.odalar.find((x) => x.id === o.id);
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSeciliOda(o.id)}
                    className={`focus-ring w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      oda?.id === o.id ? "bg-soguk/10 text-soguk-dim" : "hover:bg-zemin text-metin"
                    }`}
                  >
                    <span className="flex justify-between gap-2">
                      <span className="truncate font-medium">
                        {i + 1}. {o.ad}
                      </span>
                      <span className="text-xs text-metin/50 shrink-0">{os ? W(os.toplam) : ""}</span>
                    </span>
                    <span className="block text-[11px] text-metin/45">
                      {sy(o.en * o.boy)} m² · {ISITICILAR[o.isitici]}
                      {os && os.uyarilar.length > 0 && <span className="text-sicak-dim"> · ⚠ {os.uyarilar.length}</span>}
                    </span>
                  </button>
                );
              })}
              {!veri.odalar.length && <p className="text-xs text-metin/50 px-2 py-3">Henüz oda yok.</p>}
            </div>
            <OdaEkle
              ekle={(tip) => {
                const yeni = yeniOda(tip, { kollektor: veri.odalar.at(-1)?.kollektor ?? 1 });
                setVeri((v) => ({ ...v, odalar: [...v.odalar, yeni] }));
                setSeciliOda(yeni.id);
              }}
            />
            {!veri.odalar.length && (
              <button
                type="button"
                onClick={() => {
                  const ornek = ornekDaire();
                  setVeri((v) => ({ ...v, odalar: ornek }));
                  setSeciliOda(ornek[0].id);
                }}
                className="focus-ring mt-2 w-full text-xs border border-dashed border-hat rounded-md px-3 py-2 text-metin/60 hover:border-soguk"
              >
                Örnek daire odalarını ekle
              </button>
            )}
          </div>

          {oda ? (
            <OdaDuzenleyici
              key={oda.id}
              oda={oda}
              sonuc={odaSonuc}
              veri={veri}
              guncelle={(p) => odaGuncelle(oda.id, p)}
              elemanGuncelle={(elId, p) => elemanGuncelle(oda.id, elId, p)}
              elemanEkle={(e) => odaGuncelle(oda.id, { elemanlar: [...oda.elemanlar, e] })}
              elemanSil={(elId) => odaGuncelle(oda.id, { elemanlar: oda.elemanlar.filter((e) => e.id !== elId) })}
              kopyala={() => {
                const kopya: Oda = {
                  ...JSON.parse(JSON.stringify(oda)),
                  id: yeniId(),
                  ad: `${oda.ad} (kopya)`,
                };
                kopya.elemanlar = kopya.elemanlar.map((e) => ({ ...e, id: yeniId() }));
                setVeri((v) => {
                  const i = v.odalar.findIndex((o) => o.id === oda.id);
                  const liste = [...v.odalar];
                  liste.splice(i + 1, 0, kopya);
                  return { ...v, odalar: liste };
                });
                setSeciliOda(kopya.id);
              }}
              sil={() => {
                if (!confirm(`"${oda.ad}" odası silinsin mi?`)) return;
                const i = veri.odalar.findIndex((o) => o.id === oda.id);
                const kalan = veri.odalar.filter((o) => o.id !== oda.id);
                setVeri((v) => ({ ...v, odalar: v.odalar.filter((o) => o.id !== oda.id) }));
                setSeciliOda(kalan[Math.max(0, i - 1)]?.id ?? "");
              }}
              tasi={(yon) =>
                setVeri((v) => {
                  const i = v.odalar.findIndex((o) => o.id === oda.id);
                  const j = i + yon;
                  if (j < 0 || j >= v.odalar.length) return v;
                  const liste = [...v.odalar];
                  [liste[i], liste[j]] = [liste[j], liste[i]];
                  return { ...v, odalar: liste };
                })
              }
            />
          ) : (
            <div className="bg-yuzey border border-hat rounded-lg p-8 text-sm text-metin/60">Soldan oda ekleyin.</div>
          )}
        </div>
      )}

      {sekme === "sonuclar" && <SonuclarSekmesi sonuc={sonuc} veri={veri} />}

      {sekme === "sema" && <SemaSekmesi sonuc={sonuc} veri={veri} ad={ad} />}

      {sekme === "malzeme" && (
        <MalzemeSekmesi
          sonuc={sonuc}
          hesapId={hesap.id}
          ad={ad}
          musteriId={musteriId}
          musteriler={musteriler}
          degisti={degisti}
          teklif={hesap.teklif}
          kaydet={() => kaydet()}
          kaydediliyor={kaydediliyor}
        />
      )}
    </div>
  );
}

function Ozet({ ad, deger, alt, vurgu }: { ad: string; deger: string; alt?: string; vurgu?: boolean }) {
  return (
    <div className={`rounded-md px-3 py-2 ${vurgu ? "bg-sicak/10" : "bg-soguk/5"} min-w-0`}>
      <p className="text-[10px] uppercase tracking-wide text-metin/50 truncate">{ad}</p>
      <p className={`text-sm font-semibold truncate ${vurgu ? "text-sicak-dim" : "text-metin"}`} title={deger}>
        {deger}
      </p>
      {alt && <p className="text-[10px] text-metin/45 truncate">{alt}</p>}
    </div>
  );
}

// =============================================================================
// 1. PROJE & SİSTEM
// =============================================================================
function ProjeSekmesi({
  veri,
  guncelle,
  modeller,
  sonuc,
  ilSicaklik,
}: {
  veri: HesapVerisi;
  guncelle: (p: Partial<HesapVerisi>) => void;
  modeller: PompaModeli[];
  sonuc: HesapSonucu;
  ilSicaklik: number;
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Kart baslik="Konum ve iklim" aciklama="Dış hava tasarım sıcaklığı TS 2164 tablosundan gelir; yüksek rakımlı ilçeler için elle değiştirilebilir.">
        <div className="grid sm:grid-cols-2 gap-3">
          <Alan ad="İl">
            <select value={veri.il} onChange={(e) => guncelle({ il: e.target.value })} className={girdi}>
              {ILLER.map((i) => (
                <option key={i.ad} value={i.ad}>
                  {i.ad} ({i.disSicaklik} °C · {i.rakim} m)
                </option>
              ))}
            </select>
          </Alan>
          <Alan ad={`Dış tasarım sıcaklığı °C (boş = ${ilSicaklik} °C)`}>
            <SayiAlani deger={veri.disSicaklikElle} bosOlabilir min={-40} maks={20} onChange={(n) => guncelle({ disSicaklikElle: n })} yerTutucu={String(ilSicaklik)} />
          </Alan>
          <Alan ad="Adres / konum" className="sm:col-span-2">
            <input value={veri.adres} maxLength={300} onChange={(e) => guncelle({ adres: e.target.value })} className={girdi} placeholder="İlçe, mahalle…" />
          </Alan>
        </div>
      </Kart>

      <Kart baslik="Hesap kabulleri" aciklama="EN 12831 basitleştirilmiş yöntem. Isı pompası sürekli çalıştığı için ısınma artırımı genelde 0 alınır.">
        <div className="grid sm:grid-cols-2 gap-3">
          <Alan ad="Isı köprüsü ek U (W/m²K)">
            <select value={veri.isiKoprusu} onChange={(e) => guncelle({ isiKoprusu: Number(e.target.value) })} className={girdi}>
              {ISI_KOPRUSU.map((k) => (
                <option key={k.deger} value={k.deger}>
                  {k.ad}
                </option>
              ))}
            </select>
          </Alan>
          <Alan ad="Isınma (kesintili işletme) artırımı %">
            <SayiAlani deger={veri.isinmaArtirimi} min={0} maks={30} onChange={(n) => guncelle({ isinmaArtirimi: n ?? 0 })} />
          </Alan>
          <Alan ad="Isı pompası emniyet payı %">
            <SayiAlani deger={veri.emniyetPayi} min={0} maks={30} onChange={(n) => guncelle({ emniyetPayi: n ?? 0 })} />
          </Alan>
          <label className="flex items-center gap-2 text-sm text-metin/80 mt-5">
            <input type="checkbox" checked={veri.yonArtirimi} onChange={(e) => guncelle({ yonArtirimi: e.target.checked })} />
            Yön artırımı (K +%5, G −%5)
          </label>
        </div>
      </Kart>

      <Kart baslik="Radyatör rejimi" aciklama="Isı pompasında 45/35 – 50/40 °C önerilir; sıcaklık düştükçe radyatör boyu uzar, verim artar.">
        <div className="grid grid-cols-2 gap-3">
          <Alan ad="Gidiş °C">
            <SayiAlani deger={veri.radyatorGidis} min={30} maks={80} onChange={(n) => n !== null && guncelle({ radyatorGidis: n })} />
          </Alan>
          <Alan ad="Dönüş °C">
            <SayiAlani deger={veri.radyatorDonus} min={25} maks={75} onChange={(n) => n !== null && guncelle({ radyatorDonus: n })} />
          </Alan>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            [45, 35],
            [50, 40],
            [55, 45],
            [70, 55],
          ].map(([g, d]) => (
            <button
              key={g}
              type="button"
              onClick={() => guncelle({ radyatorGidis: g, radyatorDonus: d })}
              className={`focus-ring text-xs px-2.5 py-1 rounded-md border ${
                veri.radyatorGidis === g && veri.radyatorDonus === d ? "border-soguk bg-soguk/10 text-soguk-dim" : "border-hat text-metin/60 hover:border-soguk"
              }`}
            >
              {g}/{d} °C
            </button>
          ))}
        </div>
      </Kart>

      <Kart baslik="Yerden ısıtma (Fraenkische)" aciklama="Otomatik modda gidiş, en zorlu odayı karşılayacak kadar yükseltilir (en çok 55 °C). Sabit modda ısı pompası verimi için hedefte kalır.">
        <div className="grid sm:grid-cols-3 gap-3">
          <Alan ad="Hedef gidiş °C">
            <SayiAlani deger={veri.yerdenHedefGidis} min={27} maks={55} onChange={(n) => n !== null && guncelle({ yerdenHedefGidis: n })} />
          </Alan>
          <Alan ad="Gidiş sıcaklığı" className="sm:col-span-2">
            <select value={veri.yerdenGidisModu} onChange={(e) => guncelle({ yerdenGidisModu: e.target.value as HesapVerisi["yerdenGidisModu"] })} className={girdi}>
              <option value="OTOMATIK">Otomatik — gerekirse en zorlu odaya göre yükselt</option>
              <option value="SABIT">Sabit — hedefte kalsın, eksik takviye radyatörle</option>
            </select>
          </Alan>
          <Alan ad="Gidiş-dönüş farkı σ (K)">
            <SayiAlani deger={veri.yerdenSigma} min={3} maks={10} onChange={(n) => n !== null && guncelle({ yerdenSigma: n })} />
          </Alan>
          <Alan ad="Boru">
            <select value={veri.yerdenBoru} onChange={(e) => guncelle({ yerdenBoru: e.target.value })} className={girdi}>
              {YERDEN_BORULARI.map((b) => (
                <option key={b.anahtar} value={b.anahtar}>
                  {b.ad} (devre ≤ {b.maksDevre} m)
                </option>
              ))}
            </select>
          </Alan>
          <Alan ad="En sık aralık">
            <select value={veri.yerdenMinAralik} onChange={(e) => guncelle({ yerdenMinAralik: Number(e.target.value), yerdenMaksAralik: Math.max(Number(e.target.value), veri.yerdenMaksAralik) })} className={girdi}>
              {[0.1, 0.15, 0.2].map((t) => (
                <option key={t} value={t}>
                  {t * 100} cm
                </option>
              ))}
            </select>
          </Alan>
          <Alan ad="En seyrek aralık">
            <select value={veri.yerdenMaksAralik} onChange={(e) => guncelle({ yerdenMaksAralik: Math.max(veri.yerdenMinAralik, Number(e.target.value)) })} className={girdi}>
              {[0.15, 0.2, 0.25, 0.3].map((t) => (
                <option key={t} value={t}>
                  {t * 100} cm
                </option>
              ))}
            </select>
          </Alan>
          <Alan ad="Boru üstü şap (cm)">
            <SayiAlani deger={veri.sapUstu * 100} min={3} maks={8} onChange={(n) => n !== null && guncelle({ sapUstu: n / 100 })} />
          </Alan>
          <Alan ad="Şap ısı iletkenliği λ (W/mK)">
            <SayiAlani deger={veri.sapLambda} min={0.8} maks={2} onChange={(n) => n !== null && guncelle({ sapLambda: n })} />
          </Alan>
        </div>
      </Kart>

      <Kart baslik="Kullanım sıcak suyu">
        <label className="flex items-center gap-2 text-sm text-metin/80 mb-3">
          <input type="checkbox" checked={veri.sicakSu} onChange={(e) => guncelle({ sicakSu: e.target.checked })} />
          Isı pompası boyleri de ısıtacak
        </label>
        {veri.sicakSu && (
          <div className="grid grid-cols-2 gap-3">
            <Alan ad="Kişi sayısı">
              <SayiAlani deger={veri.kisiSayisi} min={1} maks={50} adim={1} onChange={(n) => n !== null && guncelle({ kisiSayisi: Math.round(n) })} />
            </Alan>
            <Alan ad="Boyler sıcaklığı °C">
              <SayiAlani deger={veri.sicakSuSicaklik} min={40} maks={65} onChange={(n) => n !== null && guncelle({ sicakSuSicaklik: n })} />
            </Alan>
          </div>
        )}
      </Kart>

      <Kart baslik="Isı pompası ve hidrolik" aciklama="Monoenerjetik: en soğuk günlerde elektrikli ısıtıcı destekler (daha küçük cihaz). Monovalent: cihaz tek başına yeter.">
        <div className="grid sm:grid-cols-2 gap-3">
          <Alan ad="İşletme">
            <select value={veri.isletme} onChange={(e) => guncelle({ isletme: e.target.value as HesapVerisi["isletme"] })} className={girdi}>
              <option value="MONOENERJETIK">Monoenerjetik (ısı pompası + elektrikli ısıtıcı)</option>
              <option value="MONOVALENT">Monovalent (yalnız ısı pompası)</option>
            </select>
          </Alan>
          {veri.isletme === "MONOENERJETIK" && (
            <Alan ad="Hedef denge noktası °C">
              <SayiAlani deger={veri.bivalentNokta} min={-25} maks={5} onChange={(n) => n !== null && guncelle({ bivalentNokta: n })} />
            </Alan>
          )}
          <Alan ad="Isı pompası modeli">
            <select value={veri.modelId} onChange={(e) => guncelle({ modelId: e.target.value })} className={girdi}>
              <option value="">Otomatik öneri (en küçük uygun)</option>
              {modeller.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.marka} {m.model} ({sy(m.kapA7W35)} kW)
                </option>
              ))}
            </select>
          </Alan>
          <Alan ad="Tampon tank">
            <select value={veri.tampon} onChange={(e) => guncelle({ tampon: e.target.value as HesapVerisi["tampon"] })} className={girdi}>
              <option value="OTOMATIK">Otomatik ({Math.round(sonuc.tampon.gerekli)} L üstü standart)</option>
              <option value="ELLE">Elle hacim</option>
              <option value="YOK">Yok</option>
            </select>
          </Alan>
          {veri.tampon === "ELLE" && (
            <Alan ad="Tampon hacmi (L)">
              <SayiAlani deger={veri.tamponElle} min={0} maks={5000} adim={10} onChange={(n) => n !== null && guncelle({ tamponElle: n })} />
            </Alan>
          )}
          <Alan ad="Ana hat uzunluğu, tek yön (m)">
            <SayiAlani deger={veri.anaHatUzunluk} min={0} maks={300} onChange={(n) => n !== null && guncelle({ anaHatUzunluk: n })} />
          </Alan>
          <Alan ad="Tesisat statik yüksekliği (m)">
            <SayiAlani deger={veri.statikYukseklik} min={0} maks={60} onChange={(n) => n !== null && guncelle({ statikYukseklik: n })} />
          </Alan>
        </div>
        {!modeller.length && (
          <p className="text-xs text-metin/50 mt-3">
            Kayıtlı model yok; hesap gerekli kW değerini verir.{" "}
            <Link href="/panel/isi-hesabi/modeller" className="text-soguk-dim hover:underline">
              Model ekle →
            </Link>
          </p>
        )}
      </Kart>
    </div>
  );
}

// =============================================================================
// 2. ODA DÜZENLEME
// =============================================================================
function OdaEkle({ ekle }: { ekle: (tip: OdaTipi) => void }) {
  const [tip, setTip] = useState<OdaTipi>("YATAK");
  return (
    <div className="flex gap-2">
      <select value={tip} onChange={(e) => setTip(e.target.value as OdaTipi)} className={`${girdi} flex-1`} aria-label="Oda tipi">
        {(Object.keys(ODA_TIPLERI) as OdaTipi[]).map((t) => (
          <option key={t} value={t}>
            {ODA_TIPLERI[t].ad}
          </option>
        ))}
      </select>
      <button type="button" onClick={() => ekle(tip)} className="focus-ring bg-soguk text-white px-3 rounded-md text-sm font-medium hover:bg-soguk-dim">
        + Oda
      </button>
    </div>
  );
}

const ELEMAN_DUGMELERI: [ElemanTuru, string][] = [
  ["DIS_DUVAR", "+ Dış duvar"],
  ["PENCERE", "+ Pencere"],
  ["DIS_KAPI", "+ Dış kapı"],
  ["CATI", "+ Çatı"],
  ["DOSEME_TOPRAK", "+ Toprak döşeme"],
  ["DOSEME_DIS", "+ Dışa açık döşeme"],
  ["ISITILMAYAN", "+ Isıtılmayan komşu"],
  ["DUVAR_TOPRAK", "+ Bodrum duvarı"],
  ["KOMSU", "+ Komşu hacim"],
];

function OdaDuzenleyici({
  oda,
  sonuc,
  veri,
  guncelle,
  elemanGuncelle,
  elemanEkle,
  elemanSil,
  kopyala,
  sil,
  tasi,
}: {
  oda: Oda;
  sonuc: OdaSonucu | null;
  veri: HesapVerisi;
  guncelle: (p: Partial<Oda>) => void;
  elemanGuncelle: (id: string, p: Partial<Eleman>) => void;
  elemanEkle: (e: Eleman) => void;
  elemanSil: (id: string) => void;
  kopyala: () => void;
  sil: () => void;
  tasi: (yon: -1 | 1) => void;
}) {
  const yerden = oda.isitici === "YERDEN" || oda.isitici === "YERDEN_RADYATOR";
  const radyatorlu = oda.isitici === "RADYATOR" || oda.isitici === "YERDEN_RADYATOR" || (sonuc?.radyator?.parcalar.length ?? 0) > 0;
  const kucukDugme = "focus-ring text-xs border border-hat rounded-md px-2.5 py-1 text-metin/60 hover:border-soguk";
  return (
    <div className="space-y-4 min-w-0">
      <Kart baslik="Oda bilgileri">
        <div className="grid sm:grid-cols-4 gap-3">
          <Alan ad="Oda adı" className="sm:col-span-2">
            <input value={oda.ad} maxLength={80} onChange={(e) => guncelle({ ad: e.target.value })} className={girdi} />
          </Alan>
          <Alan ad="Oda tipi">
            <select
              value={oda.tip}
              onChange={(e) => {
                const t = e.target.value as OdaTipi;
                guncelle({ tip: t, sicaklik: ODA_TIPLERI[t].sicaklik, havaDegisim: ODA_TIPLERI[t].havaDegisim });
              }}
              className={girdi}
            >
              {(Object.keys(ODA_TIPLERI) as OdaTipi[]).map((t) => (
                <option key={t} value={t}>
                  {ODA_TIPLERI[t].ad}
                </option>
              ))}
            </select>
          </Alan>
          <Alan ad="İç sıcaklık °C">
            <SayiAlani deger={oda.sicaklik} min={5} maks={30} onChange={(n) => n !== null && guncelle({ sicaklik: n })} />
          </Alan>
          <Alan ad="En (m)">
            <SayiAlani deger={oda.en} min={0.3} maks={100} onChange={(n) => n !== null && guncelle({ en: n })} />
          </Alan>
          <Alan ad="Boy (m)">
            <SayiAlani deger={oda.boy} min={0.3} maks={100} onChange={(n) => n !== null && guncelle({ boy: n })} />
          </Alan>
          <Alan ad="Tavan yüksekliği (m)">
            <SayiAlani deger={oda.yukseklik} min={1.8} maks={15} onChange={(n) => n !== null && guncelle({ yukseklik: n })} />
          </Alan>
          <Alan ad="Hava değişimi n (1/h)">
            <SayiAlani deger={oda.havaDegisim} min={0} maks={10} onChange={(n) => n !== null && guncelle({ havaDegisim: n })} />
          </Alan>
          <Alan ad="Isıtıcı" className="sm:col-span-2">
            <select value={oda.isitici} onChange={(e) => guncelle({ isitici: e.target.value as Isitici })} className={girdi}>
              {(Object.keys(ISITICILAR) as Isitici[]).map((k) => (
                <option key={k} value={k}>
                  {ISITICILAR[k]}
                </option>
              ))}
            </select>
          </Alan>
          <div className="sm:col-span-2 flex flex-wrap items-end gap-2">
            <button type="button" onClick={() => tasi(-1)} className={kucukDugme} aria-label="Yukarı taşı">
              ↑
            </button>
            <button type="button" onClick={() => tasi(1)} className={kucukDugme} aria-label="Aşağı taşı">
              ↓
            </button>
            <button type="button" onClick={kopyala} className={kucukDugme}>
              Kopyala
            </button>
            <button type="button" onClick={sil} className={`${kucukDugme} hover:border-sicak hover:text-sicak-dim`}>
              Odayı sil
            </button>
          </div>
        </div>

        {radyatorlu && (
          <div className="grid sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-hat">
            <Alan ad="Radyatör tipi">
              <select value={oda.radyatorTip} onChange={(e) => guncelle({ radyatorTip: e.target.value as RadyatorTipi })} className={girdi}>
                {(Object.keys(RADYATOR_TIPLERI) as RadyatorTipi[]).map((t) => (
                  <option key={t} value={t}>
                    {RADYATOR_TIPLERI[t].ad}
                  </option>
                ))}
              </select>
            </Alan>
            <Alan ad="Radyatör yüksekliği (mm)">
              <select value={oda.radyatorYukseklik} onChange={(e) => guncelle({ radyatorYukseklik: Number(e.target.value) as RadyatorYukseklik })} className={girdi}>
                {RADYATOR_YUKSEKLIKLERI.map((h) => (
                  <option key={h} value={h}>
                    {h} mm
                  </option>
                ))}
              </select>
            </Alan>
            <Alan ad="Parça sayısı">
              <select value={oda.radyatorParca} onChange={(e) => guncelle({ radyatorParca: Number(e.target.value) })} className={girdi}>
                <option value={0}>Otomatik</option>
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} parça
                  </option>
                ))}
              </select>
            </Alan>
          </div>
        )}

        {yerden && (
          <div className="grid sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-hat">
            <Alan ad="Zemin kaplaması">
              <select value={oda.kaplama} onChange={(e) => guncelle({ kaplama: e.target.value })} className={girdi}>
                {KAPLAMALAR.map((k) => (
                  <option key={k.anahtar} value={k.anahtar}>
                    {k.ad} (R {sy(k.r, 2)})
                  </option>
                ))}
              </select>
            </Alan>
            <Alan ad="Boru aralığı">
              <select value={oda.aralik} onChange={(e) => guncelle({ aralik: Number(e.target.value) })} className={girdi}>
                <option value={0}>Otomatik</option>
                {[0.1, 0.15, 0.2, 0.25, 0.3].map((t) => (
                  <option key={t} value={t}>
                    {t * 100} cm
                  </option>
                ))}
              </select>
            </Alan>
            <Alan ad="Serim deseni">
              <select value={oda.desen} onChange={(e) => guncelle({ desen: e.target.value as Oda["desen"] })} className={girdi}>
                <option value="SALYANGOZ">Salyangoz (spiral) — eşit yüzey sıcaklığı</option>
                <option value="SERPANTIN">Serpantin</option>
              </select>
            </Alan>
            <Alan ad="Kollektör no">
              <SayiAlani deger={oda.kollektor} min={1} maks={9} adim={1} onChange={(n) => n !== null && guncelle({ kollektor: Math.round(n) })} />
            </Alan>
            <Alan ad="Kollektöre uzaklık (m)">
              <SayiAlani deger={oda.kollektorMesafe} min={0} maks={60} onChange={(n) => n !== null && guncelle({ kollektorMesafe: n })} />
            </Alan>
            <Alan ad="Boru döşenmeyen alan (m²)">
              <SayiAlani deger={oda.haricAlan} min={0} maks={10000} onChange={(n) => n !== null && guncelle({ haricAlan: n })} />
            </Alan>
          </div>
        )}
      </Kart>

      <Kart
        baslik="Yapı elemanları"
        aciklama="Dış duvar uzunluğu girilir; aynı yöndeki pencere / kapı alanı duvardan otomatik düşülür. Yalıtım kalınlığı girilince U değeri hesaplanır; biliniyorsa U elle yazılabilir."
      >
        <div className="space-y-2">
          {oda.elemanlar.map((e) => (
            <ElemanSatiri
              key={e.id}
              e={e}
              oda={oda}
              kayip={sonuc?.elemanlar.find((x) => x.id === e.id)}
              guncelle={(p) => elemanGuncelle(e.id, p)}
              sil={() => elemanSil(e.id)}
            />
          ))}
          {!oda.elemanlar.length && <p className="text-xs text-metin/50">Bu odada henüz dışa / ısıtılmayan hacme bakan eleman yok (iç oda ise yalnızca havalandırma kaybı hesaplanır).</p>}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {ELEMAN_DUGMELERI.map(([tur, a]) => (
            <button
              key={tur}
              type="button"
              onClick={() => {
                const varsayilanYon = (oda.elemanlar.find((x) => x.tur === "DIS_DUVAR")?.yon || "K") as Yon;
                elemanEkle(
                  yeniEleman(tur, {
                    yon: tur === "DIS_DUVAR" || pencereMi(tur) ? varsayilanYon : "",
                    en: tur === "DIS_DUVAR" ? oda.en : pencereMi(tur) ? 1.2 : oda.en,
                    doseme: tur === "DOSEME_TOPRAK" || tur === "DOSEME_DIS",
                    odaAlani: tur === "CATI" || tur === "DOSEME_TOPRAK" || tur === "DOSEME_DIS" || tur === "ISITILMAYAN",
                  })
                );
              }}
              className="focus-ring text-xs border border-dashed border-hat rounded-md px-2.5 py-1 text-metin/60 hover:border-soguk hover:text-soguk-dim"
            >
              {a}
            </button>
          ))}
        </div>
      </Kart>

      {sonuc && <OdaSonucKarti s={sonuc} veri={veri} />}
    </div>
  );
}

function ElemanSatiri({
  e,
  oda,
  kayip,
  guncelle,
  sil,
}: {
  e: Eleman;
  oda: Oda;
  kayip?: { alan: number; kayip: number; dosemeYerden: boolean };
  guncelle: (p: Partial<Eleman>) => void;
  sil: () => void;
}) {
  const tanim = ELEMAN_TURLERI[e.tur];
  const pencere = pencereMi(e.tur);
  const kesitler = KESITLER.filter((k) => k.turler.includes(e.tur));
  const yatayOlabilir = !pencere && e.tur !== "DIS_DUVAR";
  const u = elemanU({ ...e, uElle: null });
  return (
    <div className="border border-hat rounded-md p-2.5 bg-zemin/40">
      <div className="flex flex-wrap items-end gap-2">
        <Alan ad="Eleman" className="w-48">
          <select
            value={e.tur}
            onChange={(ev) => {
              const tur = ev.target.value as ElemanTuru;
              guncelle({ tur, kesit: varsayilanKesit(tur), doseme: tur === "DOSEME_TOPRAK" || tur === "DOSEME_DIS" ? true : tur === "ISITILMAYAN" || tur === "KOMSU" ? e.doseme : false });
            }}
            className={girdi}
          >
            {(Object.keys(ELEMAN_TURLERI) as ElemanTuru[]).map((t) => (
              <option key={t} value={t}>
                {ELEMAN_TURLERI[t].ad}
              </option>
            ))}
          </select>
        </Alan>
        {(tanim.sinif === "DIS" && (e.tur === "DIS_DUVAR" || pencere)) && (
          <Alan ad="Yön" className="w-28">
            <select value={e.yon} onChange={(ev) => guncelle({ yon: ev.target.value as Yon })} className={girdi}>
              {(Object.keys(YONLER) as Yon[]).map((y) => (
                <option key={y} value={y}>
                  {YONLER[y].ad}
                </option>
              ))}
            </select>
          </Alan>
        )}
        {yatayOlabilir && (
          <label className="flex items-center gap-1.5 text-xs text-metin/70 pb-2">
            <input type="checkbox" checked={e.odaAlani} onChange={(ev) => guncelle({ odaAlani: ev.target.checked })} />
            Oda alanı ({sy(oda.en * oda.boy)} m²)
          </label>
        )}
        {!e.odaAlani && (
          <>
            <Alan ad={e.tur === "DIS_DUVAR" ? "Uzunluk (m)" : "En (m)"} className="w-24">
              <SayiAlani deger={e.en} min={0} maks={200} onChange={(n) => n !== null && guncelle({ en: n })} />
            </Alan>
            <Alan ad={pencere ? "Yükseklik (m)" : "Yükseklik (m, boş=oda)"} className="w-28">
              <SayiAlani deger={e.boy || null} bosOlabilir min={0} maks={50} yerTutucu={sy(oda.yukseklik, 2)} onChange={(n) => guncelle({ boy: n ?? 0 })} />
            </Alan>
            {pencere && (
              <Alan ad="Adet" className="w-16">
                <SayiAlani deger={e.adet} min={0} maks={100} adim={1} onChange={(n) => n !== null && guncelle({ adet: Math.round(n) })} />
              </Alan>
            )}
          </>
        )}
        <Alan ad={pencere ? "Doğrama / cam" : "Kesit"} className="w-64 flex-1 min-w-[15rem]">
          <select value={e.kesit} onChange={(ev) => guncelle({ kesit: ev.target.value })} className={girdi}>
            {pencere
              ? PENCERELER.map((p) => (
                  <option key={p.anahtar} value={p.anahtar}>
                    {p.ad} (U {sy(p.u, 1)})
                  </option>
                ))
              : kesitler.map((k) => (
                  <option key={k.anahtar} value={k.anahtar}>
                    {k.ad}
                  </option>
                ))}
          </select>
        </Alan>
        {!pencere && (
          <>
            <Alan ad="Yalıtım" className="w-36">
              <select value={e.yalitim} onChange={(ev) => guncelle({ yalitim: ev.target.value })} className={girdi}>
                {YALITIMLAR.map((y) => (
                  <option key={y.anahtar} value={y.anahtar}>
                    {y.ad}
                  </option>
                ))}
              </select>
            </Alan>
            <Alan ad="Kalınlık (cm)" className="w-20">
              <SayiAlani deger={e.yalitimCm} min={0} maks={50} onChange={(n) => n !== null && guncelle({ yalitimCm: n })} />
            </Alan>
          </>
        )}
        <Alan ad="U elle (W/m²K)" className="w-24">
          <SayiAlani deger={e.uElle} bosOlabilir min={0.05} maks={10} yerTutucu={sy(u, 2)} onChange={(n) => guncelle({ uElle: n })} />
        </Alan>
        {tanim.sinif === "ISITILMAYAN" && (
          <Alan ad="Komşu hacim" className="w-56">
            <select value={e.bAnahtar} onChange={(ev) => guncelle({ bAnahtar: ev.target.value })} className={girdi}>
              {B_KATSAYILARI.map((b) => (
                <option key={b.anahtar} value={b.anahtar}>
                  {b.ad} (b {sy(b.b, 1)})
                </option>
              ))}
            </select>
          </Alan>
        )}
        {tanim.sinif === "KOMSU" && (
          <Alan ad="Komşu sıcaklığı °C" className="w-28">
            <SayiAlani deger={e.komsuSicaklik} min={-30} maks={40} onChange={(n) => n !== null && guncelle({ komsuSicaklik: n })} />
          </Alan>
        )}
        {(e.tur === "ISITILMAYAN" || e.tur === "KOMSU") && e.odaAlani && (
          <label className="flex items-center gap-1.5 text-xs text-metin/70 pb-2" title="İşaretliyse bu eleman odanın döşemesidir (altı ısıtılmayan / komşu)">
            <input type="checkbox" checked={e.doseme} onChange={(ev) => guncelle({ doseme: ev.target.checked })} />
            Döşeme
          </label>
        )}
        <div className="ml-auto text-right pb-1.5">
          <p className="text-[11px] text-metin/45">{kayip ? `${sy(kayip.alan, 2)} m²` : ""}</p>
          <p className="text-sm font-semibold text-metin">{kayip ? (kayip.dosemeYerden ? "alt kayıpta" : W(kayip.kayip)) : ""}</p>
        </div>
        <button type="button" onClick={sil} className="focus-ring text-xs text-metin/40 hover:text-sicak-dim pb-2" aria-label="Elemanı sil" title="Sil">
          ✕
        </button>
      </div>
      <div className="mt-1.5">
        <input
          value={e.aciklama}
          maxLength={120}
          onChange={(ev) => guncelle({ aciklama: ev.target.value })}
          placeholder="Not (isteğe bağlı): örn. balkon kapısı, kuzey cephe"
          className="focus-ring w-full border-0 border-b border-transparent hover:border-hat focus:border-soguk bg-transparent px-0.5 py-0.5 text-xs text-metin/70"
        />
      </div>
    </div>
  );
}

function OdaSonucKarti({ s, veri }: { s: OdaSonucu; veri: HesapVerisi }) {
  const r = s.radyator;
  const y = s.yerden;
  return (
    <Kart baslik={`${s.ad} — sonuç`}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <Ozet ad="İletim kaybı" deger={W(s.iletim)} />
        <Ozet ad="Havalandırma" deger={W(s.havalandirma)} />
        <Ozet ad="Oda ısı yükü" deger={W(s.toplam)} vurgu />
        <Ozet ad="Özgül yük" deger={`${sy(s.wm2, 0)} W/m²`} />
      </div>
      {y && (
        <div className="text-sm text-metin/80 space-y-1 mb-3">
          <p>
            <strong>Yerden ısıtma:</strong> {Math.round(y.aralik * 100)} cm aralık · {y.devreSayisi} devre × {sy(y.devreBoyu, 0)} m · istenen {sy(y.gerekenAkis, 0)} / sağlanan{" "}
            {sy(y.akis, 0)} W/m² · yüzey {sy(y.yuzey)} °C · dönüş {sy(y.donus)} °C · {sy(y.debi / 0.994, 0)} L/h · {sy(y.basincKaybi, 0)} mbar
          </p>
          {y.altKayip > 0 && <p className="text-xs text-metin/55">Boru altından kaçan ısı: {W(y.altKayip)} (ısı pompası yüküne eklendi)</p>}
        </div>
      )}
      {r && r.parcalar.length > 0 && (
        <p className="text-sm text-metin/80 mb-3">
          <strong>{r.takviye ? "Takviye radyatör" : "Radyatör"}:</strong>{" "}
          {r.parcalar.length > 1 ? `${r.parcalar.length} × ` : ""}
          {RADYATOR_TIPLERI[r.parcalar[0].tip].ad} {r.parcalar[0].yukseklik}×{r.parcalar[0].boy} mm → {W(r.toplamGuc)} ({veri.radyatorGidis}/{veri.radyatorDonus} °C'de 1 m = {sy(r.w1000, 0)} W, %
          {sy(r.fazlalik, 0)} fazla)
        </p>
      )}
      {s.uyarilar.length > 0 && (
        <ul className="text-xs text-sicak-dim space-y-1">
          {s.uyarilar.map((u, i) => (
            <li key={i}>⚠ {u}</li>
          ))}
        </ul>
      )}
    </Kart>
  );
}

// =============================================================================
// 3. SONUÇLAR
// =============================================================================
function Tablo({ basliklar, satirlar, sagdan = [] }: { basliklar: string[]; satirlar: (string | number)[][]; sagdan?: number[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-metin/50 border-b border-hat">
            {basliklar.map((b, i) => (
              <th key={i} className={`py-2 px-2 font-medium ${sagdan.includes(i) ? "text-right" : ""}`}>
                {b}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {satirlar.map((s, i) => (
            <tr key={i} className="border-b border-hat/60 last:border-0">
              {s.map((h, j) => (
                <td key={j} className={`py-1.5 px-2 ${sagdan.includes(j) ? "text-right tabular-nums" : ""}`}>
                  {h}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SonuclarSekmesi({ sonuc: s, veri }: { sonuc: HesapSonucu; veri: HesapVerisi }) {
  const uyarilar = [...s.uyarilar, ...s.odalar.flatMap((o) => o.uyarilar.map((u) => `${o.ad}: ${u}`))];
  return (
    <div className="space-y-5">
      {uyarilar.length > 0 && (
        <div className="bg-sicak/10 border border-sicak/30 rounded-lg p-4">
          <p className="text-sm font-semibold text-sicak-dim mb-2">Uyarılar ve öneriler</p>
          <ul className="text-sm text-metin/80 space-y-1">
            {uyarilar.map((u, i) => (
              <li key={i}>• {u}</li>
            ))}
          </ul>
        </div>
      )}
      <Kart baslik="Oda ısı kayıpları">
        <Tablo
          basliklar={["Oda", "Alan m²", "İç °C", "İletim W", "Havaland. W", "Toplam W", "W/m²", "Isıtıcı"]}
          sagdan={[1, 2, 3, 4, 5, 6]}
          satirlar={[
            ...s.odalar.map((o) => [o.ad, sy(o.alan), sy(o.sicaklik, 0), sy(o.iletim, 0), sy(o.havalandirma, 0), sy(o.toplam, 0), sy(o.wm2, 0), ISITICILAR[o.isitici]]),
            ["Toplam", sy(s.toplamAlan), "", "", "", sy(s.isiKaybi, 0), sy(s.toplamAlan ? s.isiKaybi / s.toplamAlan : 0, 0), ""],
          ]}
        />
        <p className="text-xs text-metin/50 mt-2">
          Odalar {KW(s.isiKaybi)} + yerden ısıtma alt kaybı {KW(s.altKayip)} = ısıtma {KW(s.isitmaYuku)}
          {s.sicakSuYuku > 0 && ` + kullanım suyu ${KW(s.sicakSuYuku)}`}
          {veri.emniyetPayi > 0 && ` (ısıtmaya %${veri.emniyetPayi} pay)`} → ısı pompası {KW(s.tasarimYuku)}
        </p>
      </Kart>

      {s.odalar.some((o) => o.radyator?.parcalar.length) && (
        <Kart baslik={`Radyatörler — ${sy(s.radyatorRejimi.gidis, 0)}/${sy(s.radyatorRejimi.donus, 0)} °C`}>
          <Tablo
            basliklar={["Oda", "Gereken W", "Seçim", "Verilen W", "Fazla %"]}
            sagdan={[1, 3, 4]}
            satirlar={s.odalar
              .filter((o) => o.radyator?.parcalar.length)
              .map((o) => {
                const r = o.radyator!;
                const p = r.parcalar[0];
                return [
                  o.ad + (r.takviye ? " (takviye)" : ""),
                  sy(r.gerekenGuc, 0),
                  `${r.parcalar.length > 1 ? `${r.parcalar.length} × ` : ""}${RADYATOR_TIPLERI[p.tip].kisa} ${p.yukseklik}×${p.boy} mm`,
                  sy(r.toplamGuc, 0),
                  sy(r.fazlalik, 0),
                ];
              })}
          />
        </Kart>
      )}

      {s.yerdenVar && (
        <Kart baslik={`Yerden ısıtma — gidiş ${sy(s.yerdenGidis ?? 0)} °C (tasarım odası: ${s.yerdenTasarimOdasi ?? "—"})`}>
          <Tablo
            basliklar={["Oda", "Net m²", "q ist./sağ.", "Aralık", "Devre × m", "Dönüş °C", "L/h", "mbar", "Yüzey °C", "Eksik W", "Kol."]}
            sagdan={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
            satirlar={s.odalar
              .filter((o) => o.yerden)
              .map((o) => {
                const y = o.yerden!;
                return [
                  o.ad,
                  sy(y.alan),
                  `${sy(y.gerekenAkis, 0)}/${sy(y.akis, 0)}`,
                  `${Math.round(y.aralik * 100)} cm`,
                  `${y.devreSayisi} × ${sy(y.devreBoyu, 0)}`,
                  sy(y.donus),
                  sy(y.debi / 0.994, 0),
                  sy(y.basincKaybi, 0),
                  sy(y.yuzey),
                  y.eksikGuc > 1 ? sy(y.eksikGuc, 0) : "—",
                  y.kollektor,
                ];
              })}
          />
          <div className="mt-3">
            <Tablo
              basliklar={["Kollektör", "Ağız", "Debi L/h", "Besleme", "En kötü devre", "Odalar"]}
              sagdan={[1, 2, 4]}
              satirlar={s.kollektorler.map((k) => [
                `Kollektör ${k.no}`,
                k.agiz,
                sy(k.debi, 0),
                k.boru ? `${k.boru.ad} (${sy(k.boru.hiz, 2)} m/s)` : "—",
                `${sy(k.enKotuKayip, 0)} mbar`,
                k.odalar.join(", "),
              ])}
            />
          </div>
        </Kart>
      )}

      <Kart baslik="Isı pompası seçimi" aciklama={`Kapasiteler ${sy(s.disSicaklik)} °C dış hava ve ${sy(s.pompaGidis)} °C gidiş suyunda, katalog noktalarından ara değerle hesaplanır.`}>
        {s.modeller.length ? (
          <Tablo
            basliklar={["Model", "A7/W35 kW", "Tasarımda kW", "Denge °C", "Yedek kW", "Değerlendirme"]}
            sagdan={[1, 2, 3, 4]}
            satirlar={s.modeller.map((m) => [
              (s.secilenModel?.id === m.id ? "★ " : "") + m.ad,
              sy(m.kapasiteNominal),
              sy(m.kapasiteTasarim),
              m.dengeNoktasi === null ? "—" : sy(m.dengeNoktasi),
              m.yedekGerekli > 0.05 ? sy(m.yedekGerekli) : "—",
              (m.uygun ? "✓ " : "✕ ") + m.neden,
            ])}
          />
        ) : (
          <p className="text-sm text-metin/70">
            Gerekli kapasite: <strong>{KW(s.tasarimYuku)}</strong> ({sy(s.disSicaklik)} °C / {sy(s.pompaGidis)} °C). Model önerisi için{" "}
            <Link href="/panel/isi-hesabi/modeller" className="text-soguk-dim hover:underline">
              ısı pompası modeli ekleyin
            </Link>
            .
          </p>
        )}
        <YukGrafigi s={s} />
      </Kart>

      <Kart baslik="Sistem bileşenleri">
        <Tablo
          basliklar={["Bileşen", "Seçim"]}
          satirlar={[
            ...(s.boyler ? [["Boyler", `${s.boyler.hacim} L · serpantin en az ${sy(s.boyler.serpantinM2)} m² · sıhhi genleşme ${s.boyler.genlesme} L`]] : []),
            ["Tampon tank", s.tampon.hacim > 0 ? `${Math.round(s.tampon.hacim)} L` : "Yok"],
            ["Sistem su hacmi", `~${sy(s.sistemSuHacmi, 0)} L`],
            ["Genleşme tankı", `${s.genlesme.hacim} L (gerekli ${sy(s.genlesme.gerekli)} L) · ön basınç ${sy(s.genlesme.onBasinc)} bar · dolum ${sy(s.genlesme.dolum)} bar`],
            ...(s.hatlar.pompa ? [["Isı pompası hattı", `${s.hatlar.pompa.ad} · ${sy(s.pompalar.pompaDebi, 0)} L/h · ${sy(s.hatlar.pompa.hiz, 2)} m/s`]] : []),
            ...(s.hatlar.radyator ? [["Radyatör hattı / pompa", `${s.hatlar.radyator.ad} · ${sy(s.pompalar.radyatorDebi, 0)} L/h · ~${sy(s.pompalar.radyatorBasma)} mSS`]] : []),
            ...(s.hatlar.yerden ? [["Yerden ısıtma hattı / pompa", `${s.hatlar.yerden.ad} · ${sy(s.pompalar.yerdenDebi, 0)} L/h · ~${sy(s.pompalar.yerdenBasma)} mSS`]] : []),
            ...(s.karisimVanasiKvs ? [["Karışım vanası", `3 yollu motorlu, Kvs ${sy(s.karisimVanasiKvs)}`]] : []),
          ]}
        />
      </Kart>
    </div>
  );
}

function YukGrafigi({ s }: { s: HesapSonucu }) {
  const n = s.yukEgrisi;
  if (n.length < 2) return null;
  const G = 560;
  const Y = 200;
  const sol = 36;
  const alt = 26;
  const tMin = n[0].t;
  const tMaks = n[n.length - 1].t;
  const yMaks = Math.max(1, ...n.map((x) => Math.max(x.yuk, x.kap ?? 0))) * 1.1;
  const px = (t: number) => sol + ((t - tMin) / (tMaks - tMin)) * (G - sol - 10);
  const py = (k: number) => Y - alt - (k / yMaks) * (Y - alt - 10);
  const yol = (f: (x: (typeof n)[number]) => number | null) =>
    n
      .map((x) => f(x))
      .map((v, i) => (v === null ? "" : `${i === 0 ? "M" : "L"}${px(n[i].t).toFixed(1)},${py(v).toFixed(1)}`))
      .join(" ");
  const adim = yMaks > 20 ? 5 : yMaks > 8 ? 2 : 1;
  const yCizgileri: number[] = [];
  for (let k = 0; k <= yMaks; k += adim) yCizgileri.push(k);
  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${G} ${Y}`} className="w-full max-w-2xl h-auto" role="img" aria-label="Isı yükü ve ısı pompası kapasitesi">
        {yCizgileri.map((k) => (
          <g key={k}>
            <line x1={sol} x2={G - 10} y1={py(k)} y2={py(k)} stroke="#e9ecef" />
            <text x={sol - 4} y={py(k) + 3} fontSize="9" textAnchor="end" fill="#868e96">
              {k}
            </text>
          </g>
        ))}
        {n
          .filter((x) => x.t % 2 === 0)
          .map((x) => (
            <text key={x.t} x={px(x.t)} y={Y - alt + 12} fontSize="9" textAnchor="middle" fill="#868e96">
              {x.t}
            </text>
          ))}
        <line x1={px(s.disSicaklik)} x2={px(s.disSicaklik)} y1={10} y2={Y - alt} stroke="#adb5bd" strokeDasharray="3 3" />
        <text x={px(s.disSicaklik) + 3} y={18} fontSize="9" fill="#868e96">
          tasarım {sy(s.disSicaklik)} °C
        </text>
        <path d={yol((x) => x.yuk)} fill="none" stroke="#d9480f" strokeWidth="2" />
        {s.secilenModel && <path d={yol((x) => x.kap)} fill="none" stroke="#1971c2" strokeWidth="2" />}
        <text x={G / 2} y={Y - 2} fontSize="9" textAnchor="middle" fill="#868e96">
          Dış hava sıcaklığı °C · kW
        </text>
      </svg>
      <p className="text-xs text-metin/55 mt-1">
        <span className="inline-block w-3 h-0.5 bg-[#d9480f] align-middle mr-1" /> Bina yükü + sıcak su{" "}
        {s.secilenModel && (
          <>
            <span className="inline-block w-3 h-0.5 bg-[#1971c2] align-middle ml-3 mr-1" /> {s.secilenModel.ad} kapasitesi — denge noktası{" "}
            {s.secilenModel.dengeNoktasi === null ? "—" : `${sy(s.secilenModel.dengeNoktasi)} °C`}
          </>
        )}
      </p>
    </div>
  );
}

// =============================================================================
// 4. ŞEMA VE KROKİLER
// =============================================================================
function SemaSekmesi({ sonuc, veri, ad }: { sonuc: HesapSonucu; veri: HesapVerisi; ad: string }) {
  const sema = useMemo(() => cizimSvg(tesisatSemasi(sonuc, ad || "Isı pompası projesi"), "Tesisat prensip şeması"), [sonuc, ad]);
  const krokiler = useMemo(
    () =>
      sonuc.odalar
        .map((o) => {
          const ham = veri.odalar.find((x) => x.id === o.id);
          const c = ham ? serimKrokisi(o, ham.en, ham.boy, ham.haricAlan, ham.kollektorMesafe) : null;
          return c ? { id: o.id, svg: cizimSvg(c, `${o.ad} serim krokisi`) } : null;
        })
        .filter(Boolean) as { id: string; svg: string }[],
    [sonuc, veri.odalar]
  );
  return (
    <div className="space-y-5">
      <div className="bg-white border border-hat rounded-lg p-2 overflow-x-auto">
        <div className="min-w-[56rem]" dangerouslySetInnerHTML={{ __html: sema }} />
      </div>
      {krokiler.length > 0 ? (
        <div className="grid xl:grid-cols-2 gap-4">
          {krokiler.map((k) => (
            <div key={k.id} className="bg-white border border-hat rounded-lg p-2" dangerouslySetInnerHTML={{ __html: k.svg }} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-metin/50">Yerden ısıtmalı oda olmadığı için serim krokisi yok.</p>
      )}
    </div>
  );
}

// =============================================================================
// 5. MALZEME VE TEKLİF
// =============================================================================
function MalzemeSekmesi({
  sonuc,
  hesapId,
  ad,
  musteriId,
  musteriler,
  degisti,
  teklif,
  kaydet,
  kaydediliyor,
}: {
  sonuc: HesapSonucu;
  hesapId: string;
  ad: string;
  musteriId: string;
  musteriler: { id: string; ad: string }[];
  degisti: boolean;
  teklif: { id: string; no: number } | null;
  kaydet: () => void;
  kaydediliyor: boolean;
}) {
  const [aktariliyor, setAktariliyor] = useState(false);
  const bolumler = [...new Set(sonuc.malzemeler.map((m) => m.bolum))];
  return (
    <div className="grid lg:grid-cols-[1fr_20rem] gap-5 items-start">
      <Kart baslik="Malzeme listesi" aciklama="Hesaptan otomatik çıkar; teklife aktarıldıktan sonra teklif ekranında düzenlenebilir.">
        {bolumler.map((b) => (
          <div key={b} className="mb-4 last:mb-0">
            <p className="text-xs font-semibold text-soguk-dim uppercase tracking-wide mb-1">{b}</p>
            <Tablo
              basliklar={["Malzeme", "Miktar", "Birim"]}
              sagdan={[1]}
              satirlar={sonuc.malzemeler.filter((m) => m.bolum === b).map((m) => [m.aciklama, sy(m.adet, 2), m.birim])}
            />
          </div>
        ))}
      </Kart>
      <div className="bg-yuzey border border-hat rounded-lg p-4 lg:sticky lg:top-44">
        <h2 className="font-display font-semibold text-metin text-sm mb-1">Teklife aktar</h2>
        <p className="text-xs text-metin/55 mb-3">
          Malzeme listesiyle yeni bir teklif taslağı açılır. Kataloğa bağlı ısı pompasının fiyatı otomatik gelir; diğer fiyatları teklif ekranında girersiniz.
        </p>
        {teklif && (
          <p className="text-xs mb-3">
            Bu hesaptan daha önce{" "}
            <Link href={`/panel/teklifler/${teklif.id}`} className="text-soguk-dim hover:underline font-medium">
              Teklif #{teklif.no}
            </Link>{" "}
            oluşturuldu.
          </p>
        )}
        {degisti ? (
          <div>
            <p className="text-xs text-sicak-dim mb-2">Teklife aktarmadan önce hesabı kaydedin.</p>
            <button type="button" onClick={kaydet} disabled={kaydediliyor} className="focus-ring w-full bg-soguk text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim disabled:opacity-60">
              {kaydediliyor ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        ) : (
          <form action={isiHesapTeklifeAktar} onSubmit={() => setAktariliyor(true)} className="space-y-3">
            <input type="hidden" name="hesapId" value={hesapId} />
            <Alan ad="Müşteri">
              <select name="musteriId" defaultValue={musteriId} required className={girdi}>
                <option value="">— Müşteri seçin —</option>
                {musteriler.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.ad}
                  </option>
                ))}
              </select>
            </Alan>
            <Alan ad="Teklif başlığı">
              <input name="baslik" required maxLength={200} defaultValue={`Isı pompası sistemi — ${ad}`} className={girdi} />
            </Alan>
            <button
              type="submit"
              disabled={aktariliyor || !sonuc.malzemeler.length}
              className="focus-ring w-full bg-soguk text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim disabled:opacity-60"
            >
              {aktariliyor ? "Teklif oluşturuluyor…" : "Teklif taslağı oluştur →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
