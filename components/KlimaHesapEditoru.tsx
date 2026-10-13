"use client";

import Link from "next/link";
import { useContext, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { klimaHesapKaydet, klimaHesapTeklifeAktar } from "@/lib/klima-hesap-actions";
import { bildirimGoster } from "@/lib/bildirim";
import { SayiAlani, Alan, Kart, Ozet, ElemanSatiri, Tablo, ELEMAN_DUGMELERI, girdi, Rehber, YardimBaglami, YardimDugmesi, useYardimDurumu } from "@/components/IsiHesapEditoru";
import { yeniEleman, pencereMi, yeniId } from "@/lib/isi-hesap/tipler";
import { ODA_TIPLERI, ISI_KOPRUSU, type Yon } from "@/lib/isi-hesap/katalog";
import { ILLER, ilBul } from "@/lib/isi-hesap/iklim";
import { KANAL_TURLERI, type KanalTuru } from "@/lib/klima-hesap/tipler";
import { klimaOdasi, ornekKlimaDairesi, yeniSistem, mekanVarsayilanlari, type KlimaVerisi, type KlimaOda, type Sistem, type UniteSecimi, type HrvTipi } from "@/lib/klima-hesap/tipler";
import { GOLGELER, IC_UNITE_TIPLERI, SISTEM_TIPLERI, AKISKANLAR, VRF_TIPLERI, borAdi, type IcUniteTipi, type SistemTipi, type Akiskan } from "@/lib/klima-hesap/katalog";
import { MEKANLAR, MEKAN_GRUPLARI, TAVAN_TIPLERI, TAZE_HAVA_DUZENLERI, type MekanTipi, type TavanTipi, type TazeHavaDuzeni } from "@/lib/klima-hesap/mekanlar";
import { kapasiteListesi, yukseklikteKapasiteler, uygunsuzluk } from "@/lib/klima-hesap/oneri";
import { klimaHesapla, sy, type KlimaSonucu, type KlimaOdaSonucu } from "@/lib/klima-hesap/hesap";
import { boruSemasi, kotSemasi, katAdi } from "@/lib/klima-hesap/cizim";
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
  const [yardim, setYardim] = useYardimDurumu();
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
    <YardimBaglami.Provider value={yardim}>
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
          <YardimDugmesi acik={yardim} degistir={setYardim} />
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
        <>
        <Rehber
          baslik="Odalar nasıl girilir?"
          adimlar={[
            <>Klimalanacak <strong>her mahali ayrı</strong> ekleyin: soldan <strong>mekân tipini</strong> seçip &quot;+ Oda&quot;. Mekân tipi kişi yoğunluğunu, aydınlatma ve cihaz yükünü, taze hava ihtiyacını, iç sıcaklığı ve tavan tipini otomatik doldurur.</>,
            <><strong>Ölçüler:</strong> en × boy (m) ve tavan yüksekliği. Yükseklik iç ünite seçimini doğrudan etkiler (üretici tablolarına göre): 4 yön kaset standart ayarda 2,7–3,2 m, yüksek tavan ayarında 3,5 m (≥ 9 kW büyük gövde 4,5 m) tavana kadar; tavan askılı ≈3,8 m. 4,5 m üstünde havayı yaşam bölgesine indirmek için yüksek statik basınçlı kanallı + uzun atışlı jet nozul (ya da tekstil kanal) önerilir.</>,
            <><strong>Kişi / aydınlatma / cihaz:</strong> biliniyorsa gerçek değeri yazın (ör. sunucu odasında cihaz gücü, restoranda kişi sayısı). Alanı değiştirdikten sonra &quot;Mekâna göre doldur&quot; ile bu değerleri yeni alana göre yeniden hesaplatabilirsiniz.</>,
            <><strong>Tavan / taze hava / gürültü:</strong> açık tavanda kaset tij ve açık montaj kasasıyla, kanallı görünür dekoratif ya da tekstil kanalla kullanılır (kanal türü ünite basıncını değiştirir); mekanik taze hava varsa dış hava yükü hesaba eklenir; gürültüye duyarlı mekânda (yatak, toplantı, otel) sessiz tipler öne alınır.</>,
            <><strong>İç ünite:</strong> &quot;Otomatik&quot; bırakın; sistem tipi, adedi ve kapasiteyi seçip gerekçesini öneri kartında yazar. Kendiniz bir tip seçerseniz uygun değilse uyarır. Adet ve kapasiteyi de elle sabitleyebilirsiniz.</>,
            <><strong>Yapı elemanları:</strong> dış duvar, pencere (yönüyle — güneş yükü buna göre hesaplanır), çatı ve sıcak komşu hacimler. İki klimalı oda arasındaki iç duvarı girmeyin.</>,
            <><strong>Boru mesafeleri</strong> (VRF / multi): oda listesi sırası ana hat üzerindeki sıradır. Her odaya önceki branşmandan ana hat uzunluğunu ve branşmandan iç üniteye mesafeyi yazın; kat kotu dikey mesafe kontrolü içindir.</>,
          ]}
        />
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
                      {katAdi(o.kot, veri.katYuksekligi) ? ` · ${katAdi(o.kot, veri.katYuksekligi)}` : ""}
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
                yeni.ad = MEKANLAR[tip].ad;
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
        </>
      )}

      {sekme === "sonuclar" && <SonuclarSekmesi s={sonuc} veri={veri} />}
      {sekme === "sema" && (
        <SemaSekmesi
          s={sonuc}
          ad={ad}
          veri={veri}
          guncelle={guncelle}
          odaGuncelle={odaGuncelle}
          odayaGit={(id) => {
            setSeciliOda(id);
            setSekme("odalar");
            window.scrollTo({ top: 0 });
          }}
        />
      )}
      {sekme === "malzeme" && (
        <MalzemeSekmesi s={sonuc} hesapId={hesap.id} ad={ad} musteriId={musteriId} musteriler={musteriler} degisti={degisti} teklif={hesap.teklif} kaydet={() => kaydet()} kaydediliyor={kaydediliyor} />
      )}
    </div>
    </YardimBaglami.Provider>
  );
}

// =============================================================================
// 1. PROJE & SİSTEMLER
// =============================================================================
function ProjeSekmesi({ veri, guncelle }: { veri: KlimaVerisi; guncelle: (p: Partial<KlimaVerisi>) => void }) {
  const il = ilBul(veri.il);
  const sistemGuncelle = (no: number, p: Partial<Sistem>) => guncelle({ sistemler: veri.sistemler.map((s) => (s.no === no ? { ...s, ...p } : s)) });
  return (
    <>
    <Rehber
      baslik="Bu hesap nasıl yapılır? (sırayla)"
      adimlar={[
        <><strong>1 · Proje & Sistemler</strong> (bu sekme): ili seçin, kabulleri kontrol edin ve aşağıdan <strong>sistem ekleyin</strong> (VRF, mini VRF, multi split…). Her bağımsız dış ünite bir sistemdir. Hiç sistem eklemezseniz bütün odalar bağımsız split klima olarak hesaplanır.</>,
        <><strong>2 · Odalar</strong>: mahalleri mekân tipiyle ekleyin, ölçü ve yapı elemanlarını girin, her odayı bir sisteme bağlayın. İç ünite tipi otomatik önerilir.</>,
        <><strong>3 · Sonuçlar</strong>: oda yükleri, iç üniteler, dış ünite seçimi, boru çapları, branşmanlar, mesafe ve gaz miktarı kontrolleri.</>,
        <><strong>4 · Boru Şemaları</strong>: her sistemin soğutucu boru şeması. <strong>5 · Malzeme & Teklif</strong>: malzeme listesi ve teklif taslağı.</>,
        <>Isı pompası hesabı yapılmış bir projeyi klima hesabına aktarabilirsiniz (yeni hesap açarken &quot;Isı pompası hesabındaki odalarla&quot; seçeneği); odalar ve duvarlar yeniden girilmez.</>,
      ]}
    />
    <div className="grid lg:grid-cols-2 gap-5">
      <Kart baslik="Konum ve iklim" aciklama="Yaz (kuru / yaş termometre) ve kış dış tasarım sıcaklıkları il tablosundan gelir; gerekirse elle değiştirin.">
        <div className="grid sm:grid-cols-2 gap-3">
          <Alan ad="İl" ipucu="Yaz ve kış tasarım sıcaklıkları bu ilden gelir.">
            <select value={veri.il} onChange={(e) => guncelle({ il: e.target.value })} className={girdi}>
              {ILLER.map((i) => (
                <option key={i.ad} value={i.ad}>
                  {i.ad} (yaz {i.yazKT}/{i.yazYT} °C · kış {i.disSicaklik} °C)
                </option>
              ))}
            </select>
          </Alan>
          <Alan ad="Adres / konum" ipucu="Yalnız rapora yazılır.">
            <input value={veri.adres} maxLength={300} onChange={(e) => guncelle({ adres: e.target.value })} className={girdi} />
          </Alan>
          <Alan ad={`Yaz kuru termometre °C (boş = ${il.yazKT})`} ipucu="En sıcak gündeki dış hava sıcaklığı. Normalde boş bırakın.">
            <SayiAlani deger={veri.yazKTElle} bosOlabilir min={20} maks={50} yerTutucu={String(il.yazKT)} onChange={(n) => guncelle({ yazKTElle: n })} />
          </Alan>
          <Alan ad={`Yaz yaş termometre °C (boş = ${il.yazYT})`} ipucu="Dış havanın nemini gösterir (sahil illerinde yüksek). Normalde boş bırakın.">
            <SayiAlani deger={veri.yazYTElle} bosOlabilir min={10} maks={35} yerTutucu={String(il.yazYT)} onChange={(n) => guncelle({ yazYTElle: n })} />
          </Alan>
          <Alan ad={`Kış dış tasarım °C (boş = ${il.disSicaklik})`} ipucu="Isıtma kontrolü için en soğuk gün sıcaklığı.">
            <SayiAlani deger={veri.disSicaklikElle} bosOlabilir min={-40} maks={20} yerTutucu={String(il.disSicaklik)} onChange={(n) => guncelle({ disSicaklikElle: n })} />
          </Alan>
          <Alan ad="İç bağıl nem (yaz) %" ipucu="Konfor için %50. Daha düşük yazmak nem alma yükünü artırır.">
            <SayiAlani deger={veri.icNem} min={30} maks={70} onChange={(n) => n !== null && guncelle({ icNem: n })} />
          </Alan>
        </div>
      </Kart>

      <Kart baslik="Hesap kabulleri">
        <div className="grid sm:grid-cols-2 gap-3">
          <Alan ad="Isı geri kazanım cihazı (HRV) tipi" ipucu="Odalarda taze hava HRV seçilirse kullanılır. Entalpi tipi yazın nemi de geri kazanır (nemli iller için iyi).">
            <select value={veri.hrvTipi} onChange={(e) => guncelle({ hrvTipi: e.target.value as HrvTipi })} className={girdi}>
              <option value="PLAKALI">Plakalı eşanjör (duyulur %75)</option>
              <option value="ENTALPI">Entalpi eşanjörü (duyulur %70, nem %60)</option>
            </select>
          </Alan>
          <Alan ad="Soğutucu akışkan" ipucu="Cihazın gazı. Ek gaz miktarı ve EN 378 küçük oda kontrolü buna göre yapılır (VRF genelde R410A, split genelde R32).">
            <select value={veri.akiskan} onChange={(e) => guncelle({ akiskan: e.target.value as Akiskan })} className={girdi}>
              {(Object.keys(AKISKANLAR) as Akiskan[]).map((k) => (
                <option key={k} value={k}>
                  {AKISKANLAR[k].ad}
                </option>
              ))}
            </select>
          </Alan>
          <Alan ad="İç ünite emniyet payı %" ipucu="İç ünite seçiminde yüke eklenen pay; genelde %10.">
            <SayiAlani deger={veri.emniyetPayi} min={0} maks={40} onChange={(n) => guncelle({ emniyetPayi: n ?? 0 })} />
          </Alan>
          <Alan ad="Dış ünite eşzamanlılık %" ipucu="Bütün odaların aynı anda en yüksek yükte olmama payı. Konut 80–90 · ofis 90–100 · tek mekân 100.">
            <SayiAlani deger={veri.eszamanlilik} min={50} maks={100} onChange={(n) => n !== null && guncelle({ eszamanlilik: n })} />
          </Alan>
          <Alan ad="Kat yüksekliği (m)" ipucu="Döşemeden döşemeye kat yüksekliği. Odada kat seçince kot = kat × bu değer yazılır; şemalarda kat adı buna göre gösterilir.">
            <SayiAlani deger={veri.katYuksekligi} min={2.4} maks={8} onChange={(n) => n !== null && guncelle({ katYuksekligi: n })} />
          </Alan>
          <Alan ad="Isı köprüsü ek U" ipucu="Mantolu yeni bina 0,05 · normal 0,10 · yalıtımsız 0,15.">
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
        <p className="text-[11px] text-metin/50 mt-2">&quot;Isıtmada da kullanılacak&quot; işaretliyse dış ünite kış tasarım sıcaklığındaki ısıtma kapasitesine göre de kontrol edilir.</p>
      </Kart>

      <div className="lg:col-span-2">
        <Kart baslik="Sistemler" aciklama="Her oda bir sisteme bağlanır (ya da bağımsız split klima olur). Ana hat: dış üniteden ilk branşmana boru uzunluğu. Dış ünite kotu: zemine göre (çatıda ise bina yüksekliği).">
          <SistemYardimi />
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
                <div className="flex gap-1 pb-0.5">
                  <button
                    type="button"
                    title="Dış ünite zeminde (kot 0)"
                    onClick={() => sistemGuncelle(s.no, { disKot: 0 })}
                    className="focus-ring text-[11px] border border-hat rounded px-2 py-1 text-metin/60 hover:border-soguk"
                  >
                    Zemin
                  </button>
                  <button
                    type="button"
                    title="Dış ünite çatıda: bu sisteme bağlı en üst odanın kotu + 1 kat"
                    onClick={() => {
                      const kotlar = veri.odalar.filter((o) => o.klima && o.sistem === s.no).map((o) => o.kot);
                      sistemGuncelle(s.no, { disKot: Math.round(((kotlar.length ? Math.max(...kotlar) : 0) + veri.katYuksekligi) * 100) / 100 });
                    }}
                    className="focus-ring text-[11px] border border-hat rounded px-2 py-1 text-metin/60 hover:border-soguk"
                  >
                    Çatı
                  </button>
                </div>
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
    </>
  );
}

function SistemYardimi() {
  const acik = useContext(YardimBaglami);
  if (!acik) return null;
  return (
    <div className="text-[12px] leading-relaxed text-metin/65 bg-zemin/60 border border-hat rounded-md px-3 py-2 mb-3 space-y-1.5">
      <p>
        <strong>Hangi sistem?</strong> <em>Split</em>: her odaya ayrı dış ünite (sistem eklemeden, odada &quot;Bağımsız split&quot;). <em>Multi split</em>: tek dış üniteye
        2–5 iç ünite, her biri dış üniteden ayrı boruyla. <em>Mini VRF</em>: küçük ofis / villa, tek fazlı, ~8–16 kW. <em>VRF</em>: büyük binalar, tek boru hattı üzerinde
        branşmanlarla çok sayıda iç ünite. <em>VRF ısı geri kazanımlı (3 borulu)</em>: aynı anda bir mahal soğuturken diğeri ısıtabilir (otel, sunucu odası + ofis,
        cepheleri farklı binalar); her odaya BS kutusu konur.
      </p>
      <p>
        <strong>Alanlar:</strong> <em>Ana hat</em>: dış üniteden ilk branşmana boru boyu (tek yön). <em>Dış ünite kotu</em>: zemine göre yükseklik (çatıdaysa bina yüksekliği,
        bodrumdaysa eksi). <em>Dış ünite kW</em>: boş bırakılırsa en küçük uygun kademe seçilir; belirli bir cihaz kullanılacaksa yazın. <em>Fabrika şarjı</em>: dış ünitenin
        etiketindeki gaz miktarı (EN 378 kontrolü için). <em>En çok oran</em>: iç ünite toplamının dış üniteye oranı sınırı; üretici tablosu farklıysa yazın.
      </p>
    </div>
  );
}

// =============================================================================
// 2. ODA
// =============================================================================
function MekanSecici({ deger, onChange, aria }: { deger: MekanTipi; onChange: (m: MekanTipi) => void; aria?: string }) {
  return (
    <select value={deger} onChange={(e) => onChange(e.target.value as MekanTipi)} className={girdi} aria-label={aria}>
      {MEKAN_GRUPLARI.map((g) => (
        <optgroup key={g} label={g}>
          {(Object.keys(MEKANLAR) as MekanTipi[])
            .filter((k) => MEKANLAR[k].grup === g)
            .map((k) => (
              <option key={k} value={k}>
                {MEKANLAR[k].ad}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
}

function OdaEkleKlima({ ekle }: { ekle: (t: MekanTipi) => void }) {
  const [mekan, setMekan] = useState<MekanTipi>("KONUT_YATAK");
  return (
    <div className="flex gap-2">
      <div className="flex-1 min-w-0">
        <MekanSecici deger={mekan} onChange={setMekan} aria="Mekân tipi" />
      </div>
      <button type="button" onClick={() => ekle(mekan)} className="focus-ring bg-soguk text-white px-3 rounded-md text-sm font-medium hover:bg-soguk-dim">
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
  const sTuru = sistem ? sistem.tip : "SPLIT";
  const tipListesi = (Object.keys(IC_UNITE_TIPLERI) as IcUniteTipi[]).filter((t) => t !== "TAZE_HAVA" && kapasiteListesi(t, sTuru).length > 0);
  const gecerliTip: IcUniteTipi = sonuc?.oneri?.tip ?? (oda.uniteTipi === "OTOMATIK" ? "DUVAR" : oda.uniteTipi);
  const katNo = (() => {
    const n = Math.round(oda.kot / veri.katYuksekligi);
    return Math.abs(oda.kot - n * veri.katYuksekligi) < 0.01 && n >= -3 && n <= 30 ? n : null;
  })();
  const kapasiteler = yukseklikteKapasiteler(gecerliTip, sTuru, oda.yukseklik).length ? yukseklikteKapasiteler(gecerliTip, sTuru, oda.yukseklik) : kapasiteListesi(gecerliTip, sTuru);
  const oneri = sonuc?.oneri ?? null;
  const kanalliMi = oneri ? oneri.esp !== null : false;
  const mekanUygula = () => {
    const d = mekanVarsayilanlari(oda.mekan, oda.en * oda.boy);
    guncelle({ kisi: d.kisi, aydinlatma: d.aydinlatma, cihaz: d.cihaz });
  };
  return (
    <div className="space-y-4 min-w-0">
      <Kart baslik="Oda bilgileri">
        <div className="grid sm:grid-cols-4 gap-3">
          <Alan ad="Oda adı" className="sm:col-span-2" ipucu="Raporda ve boru şemasında görünür.">
            <input value={oda.ad} maxLength={80} onChange={(e) => guncelle({ ad: e.target.value })} className={girdi} />
          </Alan>
          <Alan ad="Mekân tipi" ipucu="Değiştirince kişi, aydınlatma, cihaz, sıcaklık, taze hava ve tavan değerleri o mekâna göre yeniden dolar.">
            <MekanSecici
              deger={oda.mekan}
              onChange={(m) => {
                const mk = MEKANLAR[m];
                const d = mekanVarsayilanlari(m, oda.en * oda.boy);
                guncelle({
                  mekan: m,
                  tip: mk.odaTipi,
                  havaDegisim: ODA_TIPLERI[mk.odaTipi].havaDegisim,
                  sicaklik: d.sicaklik,
                  sogutmaSicaklik: d.sogutmaSicaklik,
                  kisi: d.kisi,
                  aydinlatma: d.aydinlatma,
                  cihaz: d.cihaz,
                  tazeHava: d.tazeHava,
                  sessiz: d.sessiz,
                  tavanTipi: d.tavanTipi,
                });
              }}
            />
          </Alan>
          <label className="flex items-center gap-2 text-sm text-metin/80 mt-5">
            <input type="checkbox" checked={oda.klima} onChange={(e) => guncelle({ klima: e.target.checked })} />
            Bu oda klimalanacak
          </label>
          <Alan ad="En (m)" ipucu="İç ölçü.">
            <SayiAlani deger={oda.en} min={0.3} maks={100} onChange={(n) => n !== null && guncelle({ en: n })} />
          </Alan>
          <Alan ad="Boy (m)" ipucu="L odayı eşdeğer dikdörtgene çevirin.">
            <SayiAlani deger={oda.boy} min={0.3} maks={100} onChange={(n) => n !== null && guncelle({ boy: n })} />
          </Alan>
          <Alan ad="Tavan yüksekliği (m)" ipucu="Döşemeden tavana (asma tavan varsa asma tavana). Ünite tipini belirler.">
            <SayiAlani deger={oda.yukseklik} min={1.8} maks={15} onChange={(n) => n !== null && guncelle({ yukseklik: n })} />
          </Alan>
          <Alan ad="Hava değişimi n (1/h)" ipucu="Pencere / kapı sızıntısı. Değiştirmeyin; taze hava ayrıca hesaplanır.">
            <SayiAlani deger={oda.havaDegisim} min={0} maks={10} onChange={(n) => n !== null && guncelle({ havaDegisim: n })} />
          </Alan>
          <Alan ad="Yaz iç sıcaklık °C" ipucu="Konfor 24–26 · sunucu odası 22–24.">
            <SayiAlani deger={oda.sogutmaSicaklik} min={18} maks={30} onChange={(n) => n !== null && guncelle({ sogutmaSicaklik: n })} />
          </Alan>
          <Alan ad="Kış iç sıcaklık °C" ipucu="Isıtma kontrolü için.">
            <SayiAlani deger={oda.sicaklik} min={5} maks={30} onChange={(n) => n !== null && guncelle({ sicaklik: n })} />
          </Alan>
          <Alan ad="Kişi sayısı" ipucu="Aynı anda bulunan en çok kişi (restoran: masa sandalye sayısı).">
            <SayiAlani deger={oda.kisi} min={0} maks={500} adim={1} onChange={(n) => n !== null && guncelle({ kisi: Math.round(n) })} />
          </Alan>
          <Alan ad="Aydınlatma (W/m²)" ipucu="LED ofis 8–10 · mağaza 15–25 · konut 5.">
            <SayiAlani deger={oda.aydinlatma} min={0} maks={60} onChange={(n) => n !== null && guncelle({ aydinlatma: n })} />
          </Alan>
          <Alan ad="Cihazlar (W)" ipucu="Odadaki cihazların toplam gücü: bilgisayar ~150, TV ~100, sunucu kabini 3000–10000, ticari ocak / fırın çok yüksek.">
            <SayiAlani deger={oda.cihaz} min={0} maks={500000} adim={10} onChange={(n) => n !== null && guncelle({ cihaz: n })} />
          </Alan>
          <Alan ad="Tavan" ipucu="Açık tavanda kaset tij ile asılıp açık montaj kasasıyla, kanallı görünür dekoratif / tekstil kanalla kullanılır.">
            <select value={oda.tavanTipi} onChange={(e) => guncelle({ tavanTipi: e.target.value as TavanTipi })} className={girdi}>
              {(Object.keys(TAVAN_TIPLERI) as TavanTipi[]).map((k) => (
                <option key={k} value={k}>
                  {TAVAN_TIPLERI[k]}
                </option>
              ))}
            </select>
          </Alan>
          <Alan
            ad="Taze hava"
            className="sm:col-span-2"
            ipucu="Mekanik: taze hava fanı / santral dış havayı odaya basıyor, yükü klimaya biner. HRV: ısı geri kazanımlı cihaz, yükün çoğu geri kazanılır. Doğal: yalnız pencere."
          >
            <select value={oda.tazeHava} onChange={(e) => guncelle({ tazeHava: e.target.value as TazeHavaDuzeni })} className={girdi}>
              {(Object.keys(TAZE_HAVA_DUZENLERI) as TazeHavaDuzeni[]).map((k) => (
                <option key={k} value={k}>
                  {TAZE_HAVA_DUZENLERI[k]}
                </option>
              ))}
            </select>
          </Alan>
          <label className="flex items-center gap-2 text-sm text-metin/80 mt-5">
            <input type="checkbox" checked={oda.sessiz} onChange={(e) => guncelle({ sessiz: e.target.checked })} />
            Gürültüye duyarlı
          </label>
          <Alan ad="Pencere gölgelemesi" className="sm:col-span-2" ipucu="Camdan giren güneş ısısını azaltır; dış panjur / güneş kırıcı en etkilidir.">
            <select value={oda.golge} onChange={(e) => guncelle({ golge: e.target.value })} className={girdi}>
              {GOLGELER.map((g) => (
                <option key={g.anahtar} value={g.anahtar}>
                  {g.ad}
                </option>
              ))}
            </select>
          </Alan>
          <div className="flex flex-wrap items-end gap-2">
            <button type="button" onClick={mekanUygula} className={kucuk} title="Kişi, aydınlatma ve cihaz değerlerini mekân tipine ve alana göre yeniden doldur">
              Mekâna göre doldur
            </button>
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
            <Alan ad="Sistem" ipucu="Odanın bağlanacağı dış ünite. Bağımsız split: kendi dış ünitesi olur.">
              <select value={oda.sistem} onChange={(e) => guncelle({ sistem: Number(e.target.value) })} className={girdi}>
                <option value={0}>Bağımsız split klima</option>
                {veri.sistemler.map((s) => (
                  <option key={s.no} value={s.no}>
                    S{s.no} · {s.ad} ({SISTEM_TIPLERI[s.tip].ad})
                  </option>
                ))}
              </select>
            </Alan>
            <Alan
              ad="İç ünite tipi"
              ipucu={
                <>
                  <strong>{IC_UNITE_TIPLERI[gecerliTip].kisa}:</strong> {IC_UNITE_TIPLERI[gecerliTip].aciklama} &quot;uygun değil&quot; yazan tipler bu mekâna uymaz.
                </>
              }
            >
              <select value={oda.uniteTipi} onChange={(e) => guncelle({ uniteTipi: e.target.value as UniteSecimi, uniteKw: 0 })} className={girdi}>
                <option value="OTOMATIK">Otomatik{oneri ? ` (öneri: ${IC_UNITE_TIPLERI[oneri.onerilen].kisa})` : ""}</option>
                {tipListesi.map((t) => (
                  <option key={t} value={t}>
                    {IC_UNITE_TIPLERI[t].ad}
                    {uygunsuzluk(t, oda, sTuru) ? " — uygun değil" : ""}
                  </option>
                ))}
              </select>
            </Alan>
            <Alan ad="Adet (boş = otomatik)" ipucu="Boşsa yük ve kapsama alanına göre hesaplanır.">
              <SayiAlani deger={oda.uniteAdet || null} bosOlabilir min={1} maks={30} adim={1} yerTutucu={oneri ? String(oneri.adet) : "oto"} onChange={(n) => guncelle({ uniteAdet: n === null ? 0 : Math.round(n) })} />
            </Alan>
            <Alan ad="Kapasite (kW)" ipucu="Tek ünitenin gücü; otomatikte gereken en küçük kademe seçilir.">
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
              <Alan ad={sistem ? "Dış üniteden iç üniteye boru (m)" : "Split boru uzunluğu (m)"} className="sm:col-span-2" ipucu="Bakır boru güzergâh uzunluğu (tek yön); ek gaz ve kapasite kaybı buna göre.">
                <SayiAlani deger={oda.bransMesafe} min={0} maks={100} onChange={(n) => n !== null && guncelle({ bransMesafe: n })} />
              </Alan>
            ) : (
              <>
                <Alan ad="Önceki branşmandan ana hat (m)" ipucu="Listedeki bir önceki odanın branşmanından bu odanın branşmanına boru boyu.">
                  <SayiAlani deger={oda.hatMesafe} min={0} maks={300} onChange={(n) => n !== null && guncelle({ hatMesafe: n })} />
                </Alan>
                <Alan ad="Branşmandan iç üniteye (m)" ipucu="Y branşmandan iç üniteye boru; genelde 40 m'yi geçmemeli.">
                  <SayiAlani deger={oda.bransMesafe} min={0} maks={100} onChange={(n) => n !== null && guncelle({ bransMesafe: n })} />
                </Alan>
              </>
            )}
            <Alan ad="Kat" ipucu={`Seçince kot = kat × ${sy(veri.katYuksekligi)} m yazılır (kat yüksekliği Proje sekmesinde).`}>
              <select
                value={katNo === null ? "ELLE" : String(katNo)}
                onChange={(e) => e.target.value !== "ELLE" && guncelle({ kot: Math.round(Number(e.target.value) * veri.katYuksekligi * 100) / 100 })}
                className={girdi}
              >
                {katNo === null && <option value="ELLE">Elle kot ({sy(oda.kot)} m)</option>}
                {Array.from({ length: 34 }, (_, i) => i - 3).map((n) => (
                  <option key={n} value={n}>
                    {n === 0 ? "Zemin kat" : n > 0 ? `${n}. kat` : `${-n}. bodrum`} ({sy(n * veri.katYuksekligi)} m)
                  </option>
                ))}
              </select>
            </Alan>
            <Alan ad="Kat kotu (m, zemin = 0)" ipucu="Kat döşemesinin zeminden yüksekliği; ara kat / asma kat gibi durumlarda elle yazın. Kot farkı kontrolleri bundan yapılır.">
              <SayiAlani deger={oda.kot} min={-50} maks={300} onChange={(n) => n !== null && guncelle({ kot: n })} />
            </Alan>
            {kanalliMi && (
              <>
                <Alan ad="En uzak menfeze kanal (m, boş = oto)" ipucu="Kanallı ünitenin en uzak menfezine kanal boyu; statik basınç (Pa) buna göre çıkar.">
                  <SayiAlani deger={oda.kanalUzunluk || null} bosOlabilir min={0} maks={200} yerTutucu={oneri?.kanal ? String(oneri.kanal) : "oto"} onChange={(n) => guncelle({ kanalUzunluk: n ?? 0 })} />
                </Alan>
                <Alan ad="Filtre" ipucu="Hastane / temiz alan için F7; fan basıncını ≈100 Pa artırır.">
                  <select value={oda.filtre} onChange={(e) => guncelle({ filtre: e.target.value as KlimaOda["filtre"] })} className={girdi}>
                    <option value="STANDART">Standart (ünite filtresi)</option>
                    <option value="F7">İnce filtre (F7) +≈100 Pa</option>
                  </select>
                </Alan>
                <Alan
                  ad="Kanal türü"
                  ipucu="Otomatik: asma tavan varsa gizli, yoksa görünür dekoratif kanal. Tekstil kanal ≈120 Pa kanal içi basınç ister; jet nozul yüksek tavanda atışa göre 30–150 Pa."
                >
                  <select value={oda.kanalTuru} onChange={(e) => guncelle({ kanalTuru: e.target.value as KanalTuru })} className={girdi}>
                    {(Object.keys(KANAL_TURLERI) as KanalTuru[]).map((k) => (
                      <option key={k} value={k}>
                        {KANAL_TURLERI[k]}
                      </option>
                    ))}
                  </select>
                </Alan>
              </>
            )}
          </div>
        )}
        {oda.klima && oneri && <OneriKarti oneri={oneri} sistemTipi={sTuru} />}
        {oda.klima && sistem && sistem.tip !== "MULTI" && (
          <p className="text-[11px] text-metin/45 mt-2">
            Odalar listedeki sırayla ana hat üzerinde dizilir (ilk oda ilk branşmanda). Sırayı soldaki ↑ ↓ düğmeleriyle değiştirin; ilk odanın ana hat mesafesi kullanılmaz.
          </p>
        )}
      </Kart>

      <Kart
        baslik="Yapı elemanları"
        aciklama="Duvar, pencere (yönüyle), çatı ve komşu hacimler. Güneş yükü pencere yönüne göre hesaplanır: batı ve güneybatı pencereler en yüksek yükü getirir. Dış duvar için uzunluk yazılır; aynı yöndeki pencere alanı duvardan düşülür. İki klimalı oda arasındaki iç duvarı girmeyin."
      >
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
          {sonuc.uyarilar.filter((u) => !sonuc.oneri?.uyarilar.includes(u)).length > 0 && (
            <ul className="text-xs text-sicak-dim space-y-1 mt-2">
              {sonuc.uyarilar.filter((u) => !sonuc.oneri?.uyarilar.includes(u)).map((u, i) => (
                <li key={i}>⚠ {u}</li>
              ))}
            </ul>
          )}
        </Kart>
      )}
    </div>
  );
}

function OneriKarti({ oneri, sistemTipi }: { oneri: NonNullable<KlimaOdaSonucu["oneri"]>; sistemTipi: SistemTipi | "SPLIT" }) {
  const u = IC_UNITE_TIPLERI[oneri.tip];
  const vrf = (VRF_TIPLERI as readonly string[]).includes(sistemTipi);
  return (
    <div className={`mt-4 rounded-lg border p-4 ${oneri.uyarilar.length ? "border-sicak/40 bg-sicak/5" : "border-soguk/30 bg-soguk/5"}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-metin">
          {oneri.elle ? "Seçilen" : "Önerilen"} iç ünite: {oneri.adet} × {u.ad} {sy(oneri.kw)} kW
        </p>
        <p className="text-xs text-metin/55">
          {u.ses[0]}–{u.ses[1]} dB(A) · atış ≈ {u.atis} m{oneri.esp !== null ? ` · dış statik basınç ≈ ${oneri.esp} Pa` : ""} · hava ≈ {sy(oneri.havaDebisi, 0)} m³/h
          {!vrf && sistemTipi !== "MULTI" ? " · bağımsız split" : ""}
        </p>
      </div>
      <p className="text-[11px] text-metin/60 mb-2">
        <strong>Bu ünite nedir?</strong> {u.aciklama}
      </p>
      <ul className="text-xs text-metin/75 space-y-1">
        {oneri.gerekce.map((g, i) => (
          <li key={i}>✓ {g}</li>
        ))}
      </ul>
      {oneri.uyarilar.length > 0 && (
        <ul className="text-xs text-sicak-dim space-y-1 mt-2">
          {oneri.uyarilar.map((g, i) => (
            <li key={i}>⚠ {g}</li>
          ))}
        </ul>
      )}
      {oneri.ekler.length > 0 && (
        <ul className="text-xs text-soguk-dim space-y-1 mt-2">
          {oneri.ekler.map((g, i) => (
            <li key={i}>＋ {g}</li>
          ))}
        </ul>
      )}
      {oneri.alternatifler.length > 0 && (
        <p className="text-[11px] text-metin/50 mt-2">Uygun diğer tipler: {oneri.alternatifler.map((t) => IC_UNITE_TIPLERI[t].kisa).join(", ")}</p>
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
      <Rehber
        baslik="Sonuçlar nasıl okunur?"
        adimlar={[
          <><strong>Uyarılar</strong>: önce bunları okuyun; çoğu bir sınırın aşıldığını (boru mesafesi, kot farkı, bağlantı oranı, gaz miktarı) ve ne yapılacağını yazar.</>,
          <><strong>Oda yükleri</strong>: duyulur (sıcaklık) + gizli (nem) = soğutma yükü. Konutta 80–130 W/m², ofiste 100–150 W/m², restoran / spor salonunda daha yüksek olması normaldir.</>,
          <><strong>Sistem tabloları</strong>: dış ünite kademesi, bağlantı oranı (%50–130 aralığı normal), dış sıcaklık ve boru uzunluğuna göre düzeltilmiş gerçek kapasite, boru çapları (gaz / sıvı, 3 borulu sistemde basma da), branşman kitleri ve ek gaz.</>,
          <><strong>EN 378</strong>: küçük bir odada olası gaz kaçağında izin verilen miktar aşılıyorsa önlem (kaçak dedektörü, havalandırma ya da odayı ayrı sisteme alma) yazılır.</>,
        ]}
      />
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
          basliklar={["Oda", "Mekân", "m²", "Tavan m", "Duyulur W", "Gizli W", "Soğutma W", "W/m²", "Isıtma W", "İç ünite", "Sistem"]}
          sagdan={[2, 3, 4, 5, 6, 7, 8]}
          satirlar={[
            ...s.odalar
              .filter((o) => o.klima)
              .map((o) => [
                o.ad,
                o.mekanAd,
                sy(o.alan),
                sy(o.yukseklik, 1),
                sy(o.duyulur, 0),
                sy(o.gizli, 0),
                sy(o.sogutma, 0),
                sy(o.wm2, 0),
                veri.isitmaDa ? sy(o.isitma, 0) : "—",
                o.unite ? `${o.unite.adet > 1 ? o.unite.adet + " × " : ""}${o.unite.ad}` : "—",
                o.sistem ? `S${o.sistem}` : "Split",
              ]),
            ["Toplam", "", sy(s.odalar.filter((o) => o.klima).reduce((t, o) => t + o.alan, 0)), "", "", "", sy(s.toplamSogutma, 0), "", veri.isitmaDa ? sy(s.toplamIsitma, 0) : "—", "", ""],
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
          <Tablo
            basliklar={x.tip === "VRF_HR" ? ["Hat", "m", "kW", "Emme gazı", "Basma gazı", "Sıvı"] : ["Hat", "m", "kW", "Gaz", "Sıvı"]}
            sagdan={[1, 2]}
            satirlar={x.parcalar.map((p) =>
              x.tip === "VRF_HR" ? [p.ad, sy(p.uzunluk), sy(p.kw), borAdi(p.gaz), p.basma ? borAdi(p.basma) : "— (BS sonrası 2 boru)", borAdi(p.sivi)] : [p.ad, sy(p.uzunluk), sy(p.kw), borAdi(p.gaz), borAdi(p.sivi)]
            )}
          />
          {x.bsKutulari.length > 0 && (
            <p className="text-xs text-metin/60 mt-2">BS kutuları: {x.bsKutulari.map((b) => `${b.oda} (${sy(b.kw)} kW)`).join(", ")}</p>
          )}
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
type DuzenHedef = { anahtar: string; ad: string; aciklama: string; deger: number; min: number; maks: number; odaId: string | null; x: number; y: number };

function SemaSekmesi({
  s,
  ad,
  veri,
  guncelle,
  odaGuncelle,
  odayaGit,
}: {
  s: KlimaSonucu;
  ad: string;
  veri: KlimaVerisi;
  guncelle: (p: Partial<KlimaVerisi>) => void;
  odaGuncelle: (id: string, p: Partial<KlimaOda>) => void;
  odayaGit: (id: string) => void;
}) {
  const [duzen, setDuzen] = useState<DuzenHedef | null>(null);
  const [metin, setMetin] = useState("");
  const kap = useRef<HTMLDivElement>(null);
  const baslik = ad || "Klima / VRF projesi";
  const cizimler = useMemo(
    () =>
      s.sistemler.map((x) => ({
        x,
        boru: cizimSvg(boruSemasi(x, baslik, veri.katYuksekligi), `${x.ad} boru şeması`),
        kot: cizimSvg(kotSemasi(x, baslik, veri.katYuksekligi), `${x.ad} düşey şema`),
      })),
    [s, baslik, veri.katYuksekligi]
  );

  // Tıklanan ölçünün hangi girdiye bağlı olduğu
  const hedef = (anahtar: string): Omit<DuzenHedef, "x" | "y" | "anahtar"> | null => {
    const [tur, id] = anahtar.split("|");
    if (tur === "anaHat" || tur === "disKot") {
      const sis = veri.sistemler.find((x) => String(x.no) === id);
      if (!sis) return null;
      return tur === "anaHat"
        ? { ad: `${sis.ad} — ana hat (m)`, aciklama: "Dış üniteden ilk branşmana boru uzunluğu (tek yön).", deger: sis.anaHat, min: 0, maks: 500, odaId: null }
        : { ad: `${sis.ad} — dış ünite kotu (m)`, aciklama: "Zemine göre yükseklik: çatıdaysa bina yüksekliği, bodrumdaysa eksi.", deger: sis.disKot, min: -50, maks: 300, odaId: null };
    }
    const oda = veri.odalar.find((o) => o.id === id);
    if (!oda) return null;
    const multi = veri.sistemler.find((x) => x.no === oda.sistem)?.tip === "MULTI";
    if (tur === "hat") return { ad: `${oda.ad} — önceki branşmandan ana hat (m)`, aciklama: "Listede bir önceki odanın branşmanından bu odanın branşmanına gövde borusu.", deger: oda.hatMesafe, min: 0, maks: 300, odaId: id };
    if (tur === "brans")
      return {
        ad: `${oda.ad} — ${multi ? "dış üniteden iç üniteye" : "branşmandan iç üniteye"} (m)`,
        aciklama: multi ? "Multi split'te her iç ünite dış üniteden ayrı hatla bağlanır." : "Y branşman kitinden iç üniteye boru uzunluğu.",
        deger: oda.bransMesafe,
        min: 0,
        maks: 100,
        odaId: id,
      };
    if (tur === "kot") return { ad: `${oda.ad} — kat kotu (m)`, aciklama: `Zemin = 0. Kat yüksekliği ${sy(veri.katYuksekligi)} m (ör. 2. kat = ${sy(2 * veri.katYuksekligi)} m).`, deger: oda.kot, min: -50, maks: 300, odaId: id };
    return null;
  };

  const uygula = () => {
    if (!duzen) return;
    const n = parseFloat(metin.replace(",", ".").trim());
    if (!Number.isFinite(n)) return;
    const x = Math.round(Math.min(duzen.maks, Math.max(duzen.min, n)) * 100) / 100;
    const [tur, id] = duzen.anahtar.split("|");
    if (tur === "anaHat") guncelle({ sistemler: veri.sistemler.map((v) => (String(v.no) === id ? { ...v, anaHat: x } : v)) });
    else if (tur === "disKot") guncelle({ sistemler: veri.sistemler.map((v) => (String(v.no) === id ? { ...v, disKot: x } : v)) });
    else if (tur === "hat") odaGuncelle(id, { hatMesafe: x });
    else if (tur === "brans") odaGuncelle(id, { bransMesafe: x });
    else if (tur === "kot") odaGuncelle(id, { kot: x });
    setDuzen(null);
  };

  const tikla = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = (e.target as Element).closest("[data-dz],[data-git]");
    if (!el || !kap.current) {
      setDuzen(null);
      return;
    }
    const git = el.getAttribute("data-git");
    if (git) {
      odayaGit(git);
      return;
    }
    const anahtar = el.getAttribute("data-dz") ?? "";
    const b = hedef(anahtar);
    if (!b) return;
    const r = el.getBoundingClientRect();
    const k = kap.current.getBoundingClientRect();
    setDuzen({ ...b, anahtar, x: Math.max(0, Math.min(r.left - k.left, k.width - 290)), y: r.bottom - k.top + 6 });
    setMetin(String(b.deger).replace(".", ","));
  };

  if (!cizimler.length) return <p className="text-sm text-metin/50">Sisteme bağlı oda yok (yalnız bağımsız split klimalar için boru şeması çizilmez).</p>;
  return (
    <div className="space-y-5">
      <style>{`.sema-kap .dz{cursor:pointer;text-decoration:underline;text-decoration-style:dotted}.sema-kap .dz:hover{fill:#d9480f}.sema-kap .dz-git{cursor:pointer}.sema-kap .dz-git:hover{fill:#1864ab;text-decoration:underline}`}</style>
      <Rehber
        baslik="Boru şeması ve düşey şema"
        adimlar={[
          <>Her VRF / multi sistem için iki çizim çıkar: <strong>boru şeması</strong> (dış ünite, ana hat, branşman kitleri B1, B2…, her parçanın çapı ve uzunluğu) ve <strong>düşey şema</strong> (dış ünite ve iç ünitelerin hangi katta olduğu, kot farkları ve sınırları).</>,
          <><strong>Mavi yazılı ölçüler tıklanabilir:</strong> üzerine tıklayıp yeni değeri yazın (Enter). Değer odanın / sistemin girdisine yazılır; Odalar sekmesindeki alan da aynı anda değişir, çaplar ve kontroller yeniden hesaplanır.</>,
          <>Oda adına tıklarsanız o odanın düzenleme ekranı açılır. Odaların ana hat üzerindeki sırası Odalar sekmesindeki listenin sırasıdır (↑ ↓ ile değişir).</>,
          <>Düşey şemadaki ölçü okları: <span className="text-[#2b8a3e] font-semibold">yeşil</span> sınır içinde, <span className="text-[#c92a2a] font-semibold">kırmızı</span> sınır aşılmış (dış ünite – iç ünite ve iç üniteler arası kot farkı).</>,
        ]}
      />
      <div ref={kap} className="sema-kap relative space-y-5" onClick={tikla}>
        {cizimler.map(({ x, boru, kot }) => (
          <div key={x.no} className="space-y-3">
            <div className="bg-white border border-hat rounded-lg p-2 overflow-x-auto">
              <div className="min-w-[44rem]" dangerouslySetInnerHTML={{ __html: boru }} />
            </div>
            <div className="bg-white border border-hat rounded-lg p-2 overflow-x-auto">
              <div className="min-w-[44rem]" dangerouslySetInnerHTML={{ __html: kot }} />
            </div>
            <div className="bg-yuzey border border-hat rounded-lg p-3">
              <p className="text-xs font-semibold text-metin mb-2">{x.ad} — kontroller</p>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
                {x.kontroller.map((k, i) => (
                  <p key={i} className={k.uygun ? "text-metin/70" : "text-sicak-dim font-medium"}>
                    {k.uygun ? "✓" : "✕"} {k.ad}: {k.deger} <span className="text-metin/45">(sınır {k.sinir})</span>
                  </p>
                ))}
              </div>
              {x.uyarilar.length > 0 && (
                <ul className="text-xs text-sicak-dim space-y-1 mt-2">
                  {x.uyarilar.map((u, i) => (
                    <li key={i}>⚠ {u}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
        {duzen && (
          <div
            className="absolute z-30 w-[280px] bg-white border border-soguk rounded-lg shadow-lg p-3"
            style={{ left: duzen.x, top: duzen.y }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={duzen.ad}
          >
            <p className="text-xs font-semibold text-metin mb-1">{duzen.ad}</p>
            <p className="text-[11px] text-metin/55 mb-2">{duzen.aciklama}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                uygula();
              }}
              className="flex gap-2"
            >
              <input
                autoFocus
                inputMode="decimal"
                value={metin}
                onChange={(e) => setMetin(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setDuzen(null)}
                aria-label={duzen.ad}
                className={`${girdi} flex-1`}
              />
              <button type="submit" className="focus-ring bg-soguk text-white px-3 rounded-md text-sm font-medium hover:bg-soguk-dim">
                Tamam
              </button>
            </form>
            <div className="flex justify-between mt-2">
              <button type="button" onClick={() => setDuzen(null)} className="focus-ring text-[11px] text-metin/50 hover:text-metin">
                Vazgeç (Esc)
              </button>
              {duzen.odaId && (
                <button type="button" onClick={() => odayaGit(duzen.odaId!)} className="focus-ring text-[11px] text-soguk-dim hover:underline">
                  Odayı aç →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
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
      <Kart
        baslik="Malzeme listesi"
        aciklama="Hesaptan otomatik çıkar (iç / dış üniteler, bakır boru çap çap metraj, branşman, gaz, drenaj, kablo, kanal ve menfezler). Teklife aktarıldıktan sonra teklif ekranında fiyat girilir ve kalem eklenip silinebilir. Metrajlar tahminidir; keşifte kontrol edin."
      >
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
                <option value="musterisiz">◌ Müşterisiz teklif (müşteri sonra bağlanır)</option>
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
