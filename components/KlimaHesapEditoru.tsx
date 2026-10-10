"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { klimaHesapKaydet, klimaHesapTeklifeAktar } from "@/lib/klima-hesap-actions";
import { bildirimGoster } from "@/lib/bildirim";
import { SayiAlani, Alan, Kart, Ozet, ElemanSatiri, Tablo, ELEMAN_DUGMELERI, girdi } from "@/components/IsiHesapEditoru";
import { yeniEleman, pencereMi, yeniId } from "@/lib/isi-hesap/tipler";
import { ODA_TIPLERI, ISI_KOPRUSU, type OdaTipi, type Yon } from "@/lib/isi-hesap/katalog";
import { ILLER, ilBul } from "@/lib/isi-hesap/iklim";
import { klimaOdasi, ornekKlimaDairesi, yeniSistem, type KlimaVerisi, type KlimaOda, type Sistem } from "@/lib/klima-hesap/tipler";
import { GOLGELER, IC_UNITE_TIPLERI, KULLANIMLAR, SISTEM_TIPLERI, AKISKANLAR, borAdi, type IcUniteTipi, type SistemTipi, type Kullanim, type Akiskan } from "@/lib/klima-hesap/katalog";
import { klimaHesapla, sy, type KlimaSonucu, type KlimaOdaSonucu } from "@/lib/klima-hesap/hesap";
import { boruSemasi } from "@/lib/klima-hesap/cizim";
import { cizimSvg } from "@/lib/isi-hesap/svg";
import type { Eleman } from "@/lib/isi-hesap/tipler";

// -----------------------------------------------------------------------------
// KLİMA / VRF HESABI — DÜZENLEME EKRANI (hesap tarayıcıda anında yapılır)
// -----------------------------------------------------------------------------

type Props = {
  hesap: { id: string; ad: string; musteriId: string; veri: KlimaVerisi; teklif: { id: string; no: number } | null };
  musteriler: { id: string; ad: string }[];
};
type Sekme = "proje" | "odalar" | "sonuclar" | "sema" | "malzeme";
const SEKMELER: [Sekme, string][] = [
  ["proje", "1 · Proje & Sistemler"],
  ["odalar", "2 · Odalar"],
  ["sonuclar", "3 · Sonuçlar"],
  ["sema", "4 · Boru Şemaları"],
  ["malzeme", "5 · Malzeme & Teklif"],
];
const W = (x: number) => `${sy(x, 0)} W`;
const KW = (x: number) => `${sy(x / 1000, 2)} kW`;

export default function KlimaHesapEditoru({ hesap, musteriler }: Props) {
  const [ad, setAd] = useState(hesap.ad);
  const [musteriId, setMusteriId] = useState(hesap.musteriId);
  const [veri, setVeri] = useState<KlimaVerisi>(hesap.veri);
  const [sekme, setSekme] = useState<Sekme>(hesap.veri.odalar.length ? "odalar" : "proje");
  const [seciliOda, setSeciliOda] = useState(hesap.veri.odalar[0]?.id ?? "");
  const [kayitli, setKayitli] = useState(() => JSON.stringify({ ad: hesap.ad, musteriId: hesap.musteriId, veri: hesap.veri }));
  const [hata, setHata] = useState("");
  const [kaydediliyor, baslat] = useTransition();
  const simdiki = JSON.stringify({ ad, musteriId, veri });
  const degisti = simdiki !== kayitli;
  const sonuc: KlimaSonucu = useMemo(() => klimaHesapla(veri), [veri]);

  useEffect(() => {
    const f = (e: BeforeUnloadEvent) => {
      if (!degisti) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", f);
    return () => window.removeEventListener("beforeunload", f);
  }, [degisti]);

  const guncelle = (p: Partial<KlimaVerisi>) => setVeri((v) => ({ ...v, ...p }));
  const odaGuncelle = (id: string, p: Partial<KlimaOda>) => setVeri((v) => ({ ...v, odalar: v.odalar.map((o) => (o.id === id ? { ...o, ...p } : o)) }));
  const elemanGuncelle = (odaId: string, elId: string, p: Partial<Eleman>) =>
    setVeri((v) => ({ ...v, odalar: v.odalar.map((o) => (o.id === odaId ? { ...o, elemanlar: o.elemanlar.map((e) => (e.id === elId ? { ...e, ...p } : e)) } : o)) }));

  const kaydet = (sonra?: () => void) => {
    setHata("");
    const gonderilen = simdiki;
    baslat(async () => {
      const r = await klimaHesapKaydet({ id: hesap.id, ad, musteriId, veri: JSON.stringify(veri) });
      if (r.ok) {
        setKayitli(gonderilen);
        bildirimGoster("Hesap kaydedildi.");
        sonra?.();
      } else setHata(r.hata);
    });
  };
  const pdfAc = () => {
    const url = `/api/klima-hesap/${hesap.id}/pdf`;
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

  const oda = veri.odalar.find((o) => o.id === seciliOda) ?? veri.odalar[0] ?? null;
  const odaSonuc = oda ? sonuc.odalar.find((o) => o.id === oda.id) ?? null : null;
  const uyariSayisi = sonuc.uyarilar.length + sonuc.odalar.reduce((t, o) => t + o.uyarilar.length, 0) + sonuc.sistemler.reduce((t, s) => t + s.uyarilar.length, 0);
  const klimaAlan = sonuc.odalar.filter((o) => o.klima).reduce((t, o) => t + o.alan, 0);
  const disToplam = sonuc.sistemler.reduce((t, s) => t + (s.disKw ?? 0), 0);

  return (
    <div className="max-w-6xl">
      <div className="sticky top-0 z-20 -mx-6 px-6 sm:-mx-10 sm:px-10 py-3 bg-zemin/95 backdrop-blur border-b border-hat mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/panel/klima-hesabi" className="focus-ring text-sm text-metin/60 hover:text-metin">
            ←
          </Link>
          <input value={ad} onChange={(e) => setAd(e.target.value)} maxLength={200} aria-label="Hesap adı" className="focus-ring flex-1 min-w-[12rem] border border-hat rounded-md px-3 py-2 text-sm font-medium bg-white" />
          <select value={musteriId} onChange={(e) => setMusteriId(e.target.value)} aria-label="Müşteri" className="focus-ring border border-hat rounded-md px-3 py-2 text-sm bg-white max-w-[14rem]">
            <option value="">— Müşteri seçilmedi —</option>
            {musteriler.map((m) => (
              <option key={m.id} value={m.id}>
                {m.ad}
              </option>
            ))}
          </select>
          <span className={`text-xs ${degisti ? "text-sicak-dim font-medium" : "text-metin/40"}`}>{degisti ? "● Kaydedilmedi" : "✓ Kayıtlı"}</span>
          <button type="button" onClick={pdfAc} disabled={kaydediliyor} className="focus-ring text-sm font-medium border border-hat bg-white px-4 py-2 rounded-md text-metin/70 hover:border-soguk disabled:opacity-60">
            📄 PDF
          </button>
          <button type="button" onClick={() => kaydet()} disabled={kaydediliyor || !ad.trim()} className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim disabled:opacity-60">
            {kaydediliyor ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
        {hata && <p className="text-xs text-sicak-dim mt-2">Kaydedilemedi: {hata}</p>}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <Ozet ad="Yaz tasarım" deger={`${sy(sonuc.yazKT)} / ${sy(sonuc.yazYT)} °C`} alt={`${sonuc.il} · KT / YT`} />
          <Ozet ad="Kış tasarım" deger={`${sy(sonuc.disSicaklik)} °C`} alt={veri.isitmaDa ? "ısıtma kontrol ediliyor" : "yalnız soğutma"} />
          <Ozet ad="Soğutma yükü" deger={KW(sonuc.toplamSogutma)} alt={`${sy(klimaAlan)} m² · ${sy(klimaAlan ? sonuc.toplamSogutma / klimaAlan : 0, 0)} W/m²`} vurgu />
          <Ozet ad="Isıtma yükü" deger={veri.isitmaDa ? KW(sonuc.toplamIsitma) : "—"} />
          <Ozet ad="Dış üniteler" deger={sonuc.sistemler.length ? `${sy(disToplam)} kW` : "—"} alt={`${sonuc.sistemler.length} sistem + ${sonuc.splitler.length} split`} />
          <Ozet ad="İç ünite" deger={String(sonuc.sistemler.reduce((t, s) => t + s.uniteler.length, 0) + sonuc.splitler.reduce((t, o) => t + (o.unite?.adet ?? 0), 0))} alt="adet" />
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-5 border-b border-hat" role="tablist">
        {SEKMELER.map(([k, a]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={sekme === k}
            onClick={() => setSekme(k)}
            className={`focus-ring px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${sekme === k ? "border-soguk text-soguk-dim" : "border-transparent text-metin/50 hover:text-metin"}`}
          >
            {a}
            {k === "sonuclar" && uyariSayisi > 0 && (
              <span className="ml-1.5 inline-block min-w-[1.25rem] px-1 rounded-full bg-sicak/15 text-sicak-dim text-[10px]">{uyariSayisi}</span>
            )}
          </button>
        ))}
      </div>

      {sekme === "proje" && <ProjeSekmesi veri={veri} guncelle={guncelle} />}

      {sekme === "odalar" && (
        <div className="grid lg:grid-cols-[16rem_1fr] gap-5 items-start">
          <div className="bg-yuzey border border-hat rounded-lg p-3 lg:sticky lg:top-44">
            <div className="space-y-1 mb-3">
              {veri.odalar.map((o, i) => {
                const os = sonuc.odalar.find((x) => x.id === o.id);
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSeciliOda(o.id)}
                    className={`focus-ring w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${oda?.id === o.id ? "bg-soguk/10 text-soguk-dim" : "hover:bg-zemin text-metin"}`}
                  >
                    <span className="flex justify-between gap-2">
                      <span className="truncate font-medium">
                        {i + 1}. {o.ad}
                      </span>
                      <span className="text-xs text-metin/50 shrink-0">{os && o.klima ? W(os.sogutma) : "—"}</span>
                    </span>
                    <span className="block text-[11px] text-metin/45">
                      {sy(o.en * o.boy)} m² · {o.klima ? (o.sistem > 0 ? `Sistem ${o.sistem}` : "Split") : "klimasız"}
                      {os?.unite && ` · ${os.unite.adet > 1 ? os.unite.adet + "×" : ""}${sy(os.unite.kw)} kW`}
                      {os && os.uyarilar.length > 0 && <span className="text-sicak-dim"> · ⚠ {os.uyarilar.length}</span>}
                    </span>
                  </button>
                );
              })}
              {!veri.odalar.length && <p className="text-xs text-metin/50 px-2 py-3">Henüz oda yok.</p>}
            </div>
            <OdaEkleKlima
              ekle={(tip) => {
                const son = veri.odalar.at(-1);
                const yeni = klimaOdasi(tip, { sistem: son ? son.sistem : veri.sistemler[0]?.no ?? 0, kot: son?.kot ?? 0 });
                setVeri((v) => ({ ...v, odalar: [...v.odalar, yeni] }));
                setSeciliOda(yeni.id);
              }}
            />
            {!veri.odalar.length && (
              <button
                type="button"
                onClick={() => {
                  const ornek = ornekKlimaDairesi();
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
                const kopya: KlimaOda = { ...JSON.parse(JSON.stringify(oda)), id: yeniId(), ad: `${oda.ad} (kopya)` };
                kopya.elemanlar = kopya.elemanlar.map((e) => ({ ...e, id: yeniId() }));
                setVeri((v) => {
                  const i = v.odalar.findIndex((o) => o.id === oda.id);
                  const l = [...v.odalar];
                  l.splice(i + 1, 0, kopya);
                  return { ...v, odalar: l };
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
                  const l = [...v.odalar];
                  [l[i], l[j]] = [l[j], l[i]];
                  return { ...v, odalar: l };
                })
              }
            />
          ) : (
            <div className="bg-yuzey border border-hat rounded-lg p-8 text-sm text-metin/60">Soldan oda ekleyin.</div>
          )}
        </div>
      )}

      {sekme === "sonuclar" && <SonuclarSekmesi s={sonuc} veri={veri} />}
      {sekme === "sema" && <SemaSekmesi s={sonuc} ad={ad} />}
      {sekme === "malzeme" && (
        <MalzemeSekmesi s={sonuc} hesapId={hesap.id} ad={ad} musteriId={musteriId} musteriler={musteriler} degisti={degisti} teklif={hesap.teklif} kaydet={() => kaydet()} kaydediliyor={kaydediliyor} />
      )}
    </div>
  );
}

// =============================================================================
// 1. PROJE & SİSTEMLER
// =============================================================================
function ProjeSekmesi({ veri, guncelle }: { veri: KlimaVerisi; guncelle: (p: Partial<KlimaVerisi>) => void }) {
  const il = ilBul(veri.il);
  const sistemGuncelle = (no: number, p: Partial<Sistem>) => guncelle({ sistemler: veri.sistemler.map((s) => (s.no === no ? { ...s, ...p } : s)) });
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Kart baslik="Konum ve iklim" aciklama="Yaz (kuru / yaş termometre) ve kış dış tasarım sıcaklıkları il tablosundan gelir; gerekirse elle değiştirin.">
        <div className="grid sm:grid-cols-2 gap-3">
          <Alan ad="İl">
            <select value={veri.il} onChange={(e) => guncelle({ il: e.target.value })} className={girdi}>
              {ILLER.map((i) => (
                <option key={i.ad} value={i.ad}>
                  {i.ad} (yaz {i.yazKT}/{i.yazYT} °C · kış {i.disSicaklik} °C)
                </option>
              ))}
            </select>
          </Alan>
          <Alan ad="Adres / konum">
            <input value={veri.adres} maxLength={300} onChange={(e) => guncelle({ adres: e.target.value })} className={girdi} />
          </Alan>
          <Alan ad={`Yaz kuru termometre °C (boş = ${il.yazKT})`}>
            <SayiAlani deger={veri.yazKTElle} bosOlabilir min={20} maks={50} yerTutucu={String(il.yazKT)} onChange={(n) => guncelle({ yazKTElle: n })} />
          </Alan>
          <Alan ad={`Yaz yaş termometre °C (boş = ${il.yazYT})`}>
            <SayiAlani deger={veri.yazYTElle} bosOlabilir min={10} maks={35} yerTutucu={String(il.yazYT)} onChange={(n) => guncelle({ yazYTElle: n })} />
          </Alan>
          <Alan ad={`Kış dış tasarım °C (boş = ${il.disSicaklik})`}>
            <SayiAlani deger={veri.disSicaklikElle} bosOlabilir min={-40} maks={20} yerTutucu={String(il.disSicaklik)} onChange={(n) => guncelle({ disSicaklikElle: n })} />
          </Alan>
          <Alan ad="İç bağıl nem (yaz) %">
            <SayiAlani deger={veri.icNem} min={30} maks={70} onChange={(n) => n !== null && guncelle({ icNem: n })} />
          </Alan>
        </div>
      </Kart>

      <Kart baslik="Hesap kabulleri">
        <div className="grid sm:grid-cols-2 gap-3">
          <Alan ad="Kullanım (kişi ısısı, aydınlatma)">
            <select value={veri.kullanim} onChange={(e) => guncelle({ kullanim: e.target.value as Kullanim })} className={girdi}>
              {(Object.keys(KULLANIMLAR) as Kullanim[]).map((k) => (
                <option key={k} value={k}>
                  {KULLANIMLAR[k].ad}
                </option>
              ))}
            </select>
          </Alan>
          <Alan ad="Soğutucu akışkan">
            <select value={veri.akiskan} onChange={(e) => guncelle({ akiskan: e.target.value as Akiskan })} className={girdi}>
              {(Object.keys(AKISKANLAR) as Akiskan[]).map((k) => (
                <option key={k} value={k}>
                  {AKISKANLAR[k].ad}
                </option>
              ))}
            </select>
          </Alan>
          <Alan ad="İç ünite emniyet payı %">
            <SayiAlani deger={veri.emniyetPayi} min={0} maks={40} onChange={(n) => guncelle({ emniyetPayi: n ?? 0 })} />
          </Alan>
          <Alan ad="Dış ünite eşzamanlılık %">
            <SayiAlani deger={veri.eszamanlilik} min={50} maks={100} onChange={(n) => n !== null && guncelle({ eszamanlilik: n })} />
          </Alan>
          <Alan ad="Isı köprüsü ek U">
            <select value={veri.isiKoprusu} onChange={(e) => guncelle({ isiKoprusu: Number(e.target.value) })} className={girdi}>
              {ISI_KOPRUSU.map((k) => (
                <option key={k.deger} value={k.deger}>
                  {k.ad}
                </option>
              ))}
            </select>
          </Alan>
          <label className="flex items-center gap-2 text-sm text-metin/80 mt-5">
            <input type="checkbox" checked={veri.isitmaDa} onChange={(e) => guncelle({ isitmaDa: e.target.checked })} />
            Klimalar ısıtmada da kullanılacak
          </label>
        </div>
      </Kart>

      <div className="lg:col-span-2">
        <Kart baslik="Sistemler" aciklama="Her oda bir sisteme bağlanır (ya da bağımsız split klima olur). Ana hat: dış üniteden ilk branşmana boru uzunluğu. Dış ünite kotu: zemine göre (çatıda ise bina yüksekliği).">
          <div className="space-y-3">
            {veri.sistemler.map((s) => (
              <div key={s.no} className="border border-hat rounded-md p-3 bg-zemin/40 flex flex-wrap items-end gap-3">
                <span className="text-xs font-semibold text-soguk-dim pb-2 w-8">S{s.no}</span>
                <Alan ad="Ad" className="w-40">
                  <input value={s.ad} maxLength={60} onChange={(e) => sistemGuncelle(s.no, { ad: e.target.value })} className={girdi} />
                </Alan>
                <Alan ad="Tip" className="w-36">
                  <select value={s.tip} onChange={(e) => sistemGuncelle(s.no, { tip: e.target.value as SistemTipi })} className={girdi}>
                    {(Object.keys(SISTEM_TIPLERI) as SistemTipi[]).map((t) => (
                      <option key={t} value={t}>
                        {SISTEM_TIPLERI[t].ad}
                      </option>
                    ))}
                  </select>
                </Alan>
                {s.tip !== "MULTI" && (
                  <Alan ad="Ana hat (m)" className="w-24">
                    <SayiAlani deger={s.anaHat} min={0} maks={500} onChange={(n) => n !== null && sistemGuncelle(s.no, { anaHat: n })} />
                  </Alan>
                )}
                <Alan ad="Dış ünite kotu (m)" className="w-28">
                  <SayiAlani deger={s.disKot} min={-50} maks={300} onChange={(n) => n !== null && sistemGuncelle(s.no, { disKot: n })} />
                </Alan>
                <Alan ad="Dış ünite kW (boş = oto)" className="w-32">
                  <SayiAlani deger={s.disKwElle || null} bosOlabilir min={0} maks={500} onChange={(n) => sistemGuncelle(s.no, { disKwElle: n ?? 0 })} />
                </Alan>
                <Alan ad="Fabrika şarjı kg (biliniyorsa)" className="w-36">
                  <SayiAlani deger={s.fabrikaSarj} bosOlabilir min={0} maks={200} onChange={(n) => sistemGuncelle(s.no, { fabrikaSarj: n })} />
                </Alan>
                <Alan ad={`En çok oran % (boş = ${SISTEM_TIPLERI[s.tip].oranMaks})`} className="w-36">
                  <SayiAlani deger={s.oranMaks} bosOlabilir min={50} maks={200} onChange={(n) => sistemGuncelle(s.no, { oranMaks: n })} />
                </Alan>
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm(`${s.ad} silinsin mi? Bu sisteme bağlı odalar bağımsız split olur.`)) return;
                    guncelle({ sistemler: veri.sistemler.filter((x) => x.no !== s.no), odalar: veri.odalar.map((o) => (o.sistem === s.no ? { ...o, sistem: 0 } : o)) });
                  }}
                  className="focus-ring text-xs text-metin/40 hover:text-sicak-dim pb-2 ml-auto"
                >
                  Sistemi sil
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {(Object.keys(SISTEM_TIPLERI) as SistemTipi[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  const no = Math.max(0, ...veri.sistemler.map((s) => s.no)) + 1;
                  if (no > 20) return;
                  guncelle({ sistemler: [...veri.sistemler, yeniSistem(no, t)] });
                }}
                className="focus-ring text-xs border border-dashed border-hat rounded-md px-2.5 py-1 text-metin/60 hover:border-soguk hover:text-soguk-dim"
              >
                + {SISTEM_TIPLERI[t].ad}
              </button>
            ))}
          </div>
        </Kart>
      </div>
    </div>
  );
}

// =============================================================================
// 2. ODA
// =============================================================================
function OdaEkleKlima({ ekle }: { ekle: (t: OdaTipi) => void }) {
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
  oda: KlimaOda;
  sonuc: KlimaOdaSonucu | null;
  veri: KlimaVerisi;
  guncelle: (p: Partial<KlimaOda>) => void;
  elemanGuncelle: (id: string, p: Partial<Eleman>) => void;
  elemanEkle: (e: Eleman) => void;
  elemanSil: (id: string) => void;
  kopyala: () => void;
  sil: () => void;
  tasi: (y: -1 | 1) => void;
}) {
  const sistem = veri.sistemler.find((s) => s.no === oda.sistem);
  const kucuk = "focus-ring text-xs border border-hat rounded-md px-2.5 py-1 text-metin/60 hover:border-soguk";
  const tipListesi = (Object.keys(IC_UNITE_TIPLERI) as IcUniteTipi[]).filter((t) => !sistem || sistem.tip === "MULTI" || IC_UNITE_TIPLERI[t].vrf.length > 0);
  const kapasiteler = sistem && sistem.tip !== "MULTI" ? IC_UNITE_TIPLERI[oda.uniteTipi].vrf : IC_UNITE_TIPLERI[oda.uniteTipi].split;
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
                const d = klimaOdasi(t);
                guncelle({ tip: t, sicaklik: d.sicaklik, havaDegisim: d.havaDegisim, kisi: d.kisi, cihaz: d.cihaz });
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
          <label className="flex items-center gap-2 text-sm text-metin/80 mt-5">
            <input type="checkbox" checked={oda.klima} onChange={(e) => guncelle({ klima: e.target.checked })} />
            Bu oda klimalanacak
          </label>
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
          <Alan ad="Yaz iç sıcaklık °C">
            <SayiAlani deger={oda.sogutmaSicaklik} min={18} maks={30} onChange={(n) => n !== null && guncelle({ sogutmaSicaklik: n })} />
          </Alan>
          <Alan ad="Kış iç sıcaklık °C">
            <SayiAlani deger={oda.sicaklik} min={5} maks={30} onChange={(n) => n !== null && guncelle({ sicaklik: n })} />
          </Alan>
          <Alan ad="Kişi sayısı">
            <SayiAlani deger={oda.kisi} min={0} maks={500} adim={1} onChange={(n) => n !== null && guncelle({ kisi: Math.round(n) })} />
          </Alan>
          <Alan ad="Aydınlatma (W/m²)">
            <SayiAlani deger={oda.aydinlatma} min={0} maks={60} onChange={(n) => n !== null && guncelle({ aydinlatma: n })} />
          </Alan>
          <Alan ad="Cihazlar (W)">
            <SayiAlani deger={oda.cihaz} min={0} maks={100000} adim={10} onChange={(n) => n !== null && guncelle({ cihaz: n })} />
          </Alan>
          <Alan ad="Pencere gölgelemesi" className="sm:col-span-2">
            <select value={oda.golge} onChange={(e) => guncelle({ golge: e.target.value })} className={girdi}>
              {GOLGELER.map((g) => (
                <option key={g.anahtar} value={g.anahtar}>
                  {g.ad}
                </option>
              ))}
            </select>
          </Alan>
          <div className="flex flex-wrap items-end gap-2">
            <button type="button" onClick={() => tasi(-1)} className={kucuk} aria-label="Yukarı taşı" title="Sırayı değiştir (ana hat üzerindeki sıra)">
              ↑
            </button>
            <button type="button" onClick={() => tasi(1)} className={kucuk} aria-label="Aşağı taşı">
              ↓
            </button>
            <button type="button" onClick={kopyala} className={kucuk}>
              Kopyala
            </button>
            <button type="button" onClick={sil} className={`${kucuk} hover:border-sicak hover:text-sicak-dim`}>
              Sil
            </button>
          </div>
        </div>

        {oda.klima && (
          <div className="grid sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-hat">
            <Alan ad="Sistem">
              <select value={oda.sistem} onChange={(e) => guncelle({ sistem: Number(e.target.value) })} className={girdi}>
                <option value={0}>Bağımsız split klima</option>
                {veri.sistemler.map((s) => (
                  <option key={s.no} value={s.no}>
                    S{s.no} · {s.ad} ({SISTEM_TIPLERI[s.tip].ad})
                  </option>
                ))}
              </select>
            </Alan>
            <Alan ad="İç ünite tipi">
              <select value={oda.uniteTipi} onChange={(e) => guncelle({ uniteTipi: e.target.value as IcUniteTipi, uniteKw: 0 })} className={girdi}>
                {tipListesi.map((t) => (
                  <option key={t} value={t}>
                    {IC_UNITE_TIPLERI[t].ad}
                  </option>
                ))}
              </select>
            </Alan>
            <Alan ad="Adet">
              <SayiAlani deger={oda.uniteAdet} min={1} maks={20} adim={1} onChange={(n) => n !== null && guncelle({ uniteAdet: Math.round(n) })} />
            </Alan>
            <Alan ad="Kapasite (kW)">
              <select value={oda.uniteKw} onChange={(e) => guncelle({ uniteKw: Number(e.target.value) })} className={girdi}>
                <option value={0}>Otomatik</option>
                {kapasiteler.map((k) => (
                  <option key={k} value={k}>
                    {sy(k)} kW
                  </option>
                ))}
              </select>
            </Alan>
            {(!sistem || sistem.tip === "MULTI") ? (
              <Alan ad={sistem ? "Dış üniteden iç üniteye boru (m)" : "Split boru uzunluğu (m)"} className="sm:col-span-2">
                <SayiAlani deger={oda.bransMesafe} min={0} maks={100} onChange={(n) => n !== null && guncelle({ bransMesafe: n })} />
              </Alan>
            ) : (
              <>
                <Alan ad="Önceki branşmandan ana hat (m)">
                  <SayiAlani deger={oda.hatMesafe} min={0} maks={300} onChange={(n) => n !== null && guncelle({ hatMesafe: n })} />
                </Alan>
                <Alan ad="Branşmandan iç üniteye (m)">
                  <SayiAlani deger={oda.bransMesafe} min={0} maks={100} onChange={(n) => n !== null && guncelle({ bransMesafe: n })} />
                </Alan>
              </>
            )}
            <Alan ad="Kat kotu (m, zemin = 0)">
              <SayiAlani deger={oda.kot} min={-50} maks={300} onChange={(n) => n !== null && guncelle({ kot: n })} />
            </Alan>
          </div>
        )}
        {oda.klima && sistem && sistem.tip !== "MULTI" && (
          <p className="text-[11px] text-metin/45 mt-2">
            Odalar listedeki sırayla ana hat üzerinde dizilir (ilk oda ilk branşmanda). Sırayı soldaki ↑ ↓ düğmeleriyle değiştirin; ilk odanın ana hat mesafesi kullanılmaz.
          </p>
        )}
      </Kart>

      <Kart baslik="Yapı elemanları" aciklama="Duvar, pencere (yönüyle), çatı ve komşu hacimler. Güneş yükü pencere yönüne göre hesaplanır.">
        <div className="space-y-2">
          {oda.elemanlar.map((e) => (
            <ElemanSatiri key={e.id} e={e} oda={oda} guncelle={(p) => elemanGuncelle(e.id, p)} sil={() => elemanSil(e.id)} />
          ))}
          {!oda.elemanlar.length && <p className="text-xs text-metin/50">Dışa bakan eleman yok (iç oda).</p>}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {ELEMAN_DUGMELERI.map(([tur, a]) => (
            <button
              key={tur}
              type="button"
              onClick={() => {
                const yon = (oda.elemanlar.find((x) => x.tur === "DIS_DUVAR")?.yon || "K") as Yon;
                elemanEkle(
                  yeniEleman(tur, {
                    yon: tur === "DIS_DUVAR" || pencereMi(tur) ? yon : "",
                    en: pencereMi(tur) ? 1.2 : oda.en,
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

      {sonuc && sonuc.klima && (
        <Kart baslik={`${sonuc.ad} — sonuç`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <Ozet ad="Duyulur" deger={W(sonuc.duyulur)} />
            <Ozet ad="Gizli (nem)" deger={W(sonuc.gizli)} />
            <Ozet ad="Soğutma yükü" deger={W(sonuc.sogutma)} alt={`${sy(sonuc.wm2, 0)} W/m²`} vurgu />
            <Ozet ad="Isıtma yükü" deger={veri.isitmaDa ? W(sonuc.isitma) : "—"} />
          </div>
          <Tablo basliklar={["Kalem", "Duyulur W", "Gizli W"]} sagdan={[1, 2]} satirlar={sonuc.kalemler.map((k) => [k.ad, sy(k.duyulur, 0), k.gizli ? sy(k.gizli, 0) : "—"])} />
          {sonuc.unite && (
            <p className="text-sm text-metin/80 mt-3">
              <strong>İç ünite:</strong> {sonuc.unite.adet > 1 ? `${sonuc.unite.adet} × ` : ""}
              {sonuc.unite.ad} — gereken {W(sonuc.gerekenSogutma)} (emniyet payı dahil)
            </p>
          )}
          {sonuc.uyarilar.length > 0 && (
            <ul className="text-xs text-sicak-dim space-y-1 mt-2">
              {sonuc.uyarilar.map((u, i) => (
                <li key={i}>⚠ {u}</li>
              ))}
            </ul>
          )}
        </Kart>
      )}
    </div>
  );
}

// =============================================================================
// 3. SONUÇLAR
// =============================================================================
function SonuclarSekmesi({ s, veri }: { s: KlimaSonucu; veri: KlimaVerisi }) {
  const uyarilar = [...s.uyarilar, ...s.odalar.flatMap((o) => o.uyarilar.map((u) => `${o.ad}: ${u}`)), ...s.sistemler.flatMap((x) => x.uyarilar.map((u) => `${x.ad}: ${u}`))];
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
      <Kart baslik="Oda yükleri ve iç üniteler">
        <Tablo
          basliklar={["Oda", "m²", "Duyulur W", "Gizli W", "Soğutma W", "W/m²", "Isıtma W", "İç ünite", "Sistem"]}
          sagdan={[1, 2, 3, 4, 5, 6]}
          satirlar={[
            ...s.odalar
              .filter((o) => o.klima)
              .map((o) => [
                o.ad,
                sy(o.alan),
                sy(o.duyulur, 0),
                sy(o.gizli, 0),
                sy(o.sogutma, 0),
                sy(o.wm2, 0),
                veri.isitmaDa ? sy(o.isitma, 0) : "—",
                o.unite ? `${o.unite.adet > 1 ? o.unite.adet + " × " : ""}${o.unite.ad}` : "—",
                o.sistem ? `S${o.sistem}` : "Split",
              ]),
            ["Toplam", sy(s.odalar.filter((o) => o.klima).reduce((t, o) => t + o.alan, 0)), "", "", sy(s.toplamSogutma, 0), "", veri.isitmaDa ? sy(s.toplamIsitma, 0) : "—", "", ""],
          ]}
        />
      </Kart>
      {s.sistemler.map((x) => (
        <Kart key={x.no} baslik={`${x.ad} — ${x.tipAdi}`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <Ozet ad="Dış ünite" deger={x.disKw ? `${sy(x.disKw)} kW` : "Seçilemedi"} alt={x.disIsitmaKw ? `ısıtma ${sy(x.disIsitmaKw)} kW` : undefined} vurgu />
            <Ozet ad="İç ünite toplamı" deger={`${sy(x.icToplamKw)} kW`} alt={`${x.uniteler.length} adet`} />
            <Ozet ad="Bağlantı oranı" deger={x.oran !== null ? `%${sy(x.oran, 0)}` : "—"} />
            <Ozet ad="Yük (soğ. / ısıt.)" deger={`${sy(x.sogutmaYuku)} / ${veri.isitmaDa ? sy(x.isitmaYuku) : "—"} kW`} />
            <Ozet ad="Gerçek kapasite" deger={x.sogutmaDuzeltilmis !== null ? `${sy(x.sogutmaDuzeltilmis)} kW` : "—"} alt={x.isitmaDuzeltilmis !== null && veri.isitmaDa ? `ısıtma ${sy(x.isitmaDuzeltilmis)} kW @ ${sy(s.disSicaklik)} °C` : undefined} />
            <Ozet ad="Toplam boru" deger={`${sy(x.toplamBoru)} m`} alt={`en uzak ${sy(x.enUzak)} m`} />
            <Ozet ad="Ek gaz" deger={`${sy(x.ekGaz, 2)} kg`} alt={`toplam ~${sy(x.toplamSarj, 1)} kg`} />
            <Ozet ad="Branşman" deger={String(x.bransmanlar.length)} />
          </div>
          <Tablo basliklar={["Hat", "m", "kW", "Gaz", "Sıvı"]} sagdan={[1, 2]} satirlar={x.parcalar.map((p) => [p.ad, sy(p.uzunluk), sy(p.kw), borAdi(p.gaz), borAdi(p.sivi)])} />
          <div className="mt-3">
            <Tablo
              basliklar={["Kontrol", "Değer", "Sınır", "Sonuç"]}
              sagdan={[1, 2]}
              satirlar={[
                ...x.kontroller.map((k) => [k.ad, k.deger, k.sinir, k.uygun ? "✓" : "✕ uygun değil"]),
                ...x.en378.map((e) => [`EN 378 — ${e.oda}`, `${sy(x.toplamSarj, 2)} kg`, `${sy(e.sinir, 2)} kg`, e.asiyor ? "⚠ önlem gerekli" : "✓"]),
              ]}
            />
          </div>
        </Kart>
      ))}
    </div>
  );
}

// =============================================================================
// 4. BORU ŞEMALARI
// =============================================================================
function SemaSekmesi({ s, ad }: { s: KlimaSonucu; ad: string }) {
  const svgler = useMemo(() => s.sistemler.map((x) => ({ no: x.no, svg: cizimSvg(boruSemasi(x, ad || "Klima / VRF projesi"), `${x.ad} boru şeması`) })), [s, ad]);
  if (!svgler.length) return <p className="text-sm text-metin/50">Sisteme bağlı oda yok (yalnız bağımsız split klimalar için boru şeması çizilmez).</p>;
  return (
    <div className="space-y-5">
      {svgler.map((x) => (
        <div key={x.no} className="bg-white border border-hat rounded-lg p-2 overflow-x-auto">
          <div className="min-w-[44rem]" dangerouslySetInnerHTML={{ __html: x.svg }} />
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// 5. MALZEME & TEKLİF
// =============================================================================
function MalzemeSekmesi({
  s,
  hesapId,
  ad,
  musteriId,
  musteriler,
  degisti,
  teklif,
  kaydet,
  kaydediliyor,
}: {
  s: KlimaSonucu;
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
  const bolumler = [...new Set(s.malzemeler.map((m) => m.bolum))];
  return (
    <div className="grid lg:grid-cols-[1fr_20rem] gap-5 items-start">
      <Kart baslik="Malzeme listesi" aciklama="Teklife aktarıldıktan sonra teklif ekranında fiyat girilir ve düzenlenir.">
        {bolumler.map((b) => (
          <div key={b} className="mb-4 last:mb-0">
            <p className="text-xs font-semibold text-soguk-dim uppercase tracking-wide mb-1">{b}</p>
            <Tablo basliklar={["Malzeme", "Miktar", "Birim"]} sagdan={[1]} satirlar={s.malzemeler.filter((m) => m.bolum === b).map((m) => [m.aciklama, sy(m.adet, 2), m.birim])} />
          </div>
        ))}
        {!bolumler.length && <p className="text-sm text-metin/50">Klimalanan oda yok.</p>}
      </Kart>
      <div className="bg-yuzey border border-hat rounded-lg p-4 lg:sticky lg:top-44">
        <h2 className="font-display font-semibold text-metin text-sm mb-1">Teklife aktar</h2>
        <p className="text-xs text-metin/55 mb-3">Malzeme listesiyle yeni bir teklif taslağı açılır; fiyatları teklif ekranında girersiniz.</p>
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
          <form action={klimaHesapTeklifeAktar} onSubmit={() => setAktariliyor(true)} className="space-y-3">
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
              <input name="baslik" required maxLength={200} defaultValue={`Klima / VRF sistemi — ${ad}`} className={girdi} />
            </Alan>
            <button type="submit" disabled={aktariliyor || !s.malzemeler.length} className="focus-ring w-full bg-soguk text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim disabled:opacity-60">
              {aktariliyor ? "Teklif oluşturuluyor…" : "Teklif taslağı oluştur →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
