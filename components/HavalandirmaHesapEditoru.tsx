"use client";

import Link from "next/link";
import { useContext, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { havalandirmaHesapKaydet, havalandirmaHesapTeklifeAktar } from "@/lib/havalandirma-actions";
import { bildirimGoster } from "@/lib/bildirim";
import { SayiAlani, Alan, Kart, Ozet, Tablo, girdi, Rehber, YardimBaglami, YardimDugmesi, useYardimDurumu } from "@/components/IsiHesapEditoru";
import { yeniId } from "@/lib/isi-hesap/tipler";
import { ILLER, ilBul } from "@/lib/isi-hesap/iklim";
import { yeniMahal, yeniSantral, ornekOfis, ornekDaire, type HavalandirmaVerisi, type Mahal, type Santral, type KanalSekli, type OtoparkSistemi } from "@/lib/havalandirma/tipler";
import {
  MAHAL_TIPLERI,
  MAHAL_GRUPLARI,
  SANTRAL_TIPLERI,
  EN_KATEGORI,
  KIRLILIK,
  DAVLUMBAZ_TIPLERI,
  PISIRME_YUKLERI,
  HIZ_SINIRLARI,
  type MahalTipi,
  type SantralTipi,
  type Kategori,
  type Kirlilik,
  type Akustik,
  type DavlumbazTipi,
  type PisirmeYuku,
} from "@/lib/havalandirma/katalog";
import { havalandirmaHesapla, sy, olcuYaz, type HavalandirmaSonucu, type MahalSonucu, type SantralSonucu, type KanalAgi } from "@/lib/havalandirma/hesap";
import { otomatikSistem } from "@/lib/havalandirma/oneri";
import { kanalSemasi } from "@/lib/havalandirma/cizim";
import { cizimSvg } from "@/lib/isi-hesap/svg";

// -----------------------------------------------------------------------------
// HAVALANDIRMA HESABI — DÜZENLEME EKRANI (hesap tarayıcıda anında yapılır)
// -----------------------------------------------------------------------------

type Props = {
  hesap: { id: string; ad: string; musteriId: string; veri: HavalandirmaVerisi; teklif: { id: string; no: number } | null };
  musteriler: { id: string; ad: string }[];
};
type Sekme = "proje" | "mahaller" | "sonuclar" | "sema" | "malzeme";
const SEKMELER: [Sekme, string][] = [
  ["proje", "1 · Proje & Santraller"],
  ["mahaller", "2 · Mahaller"],
  ["sonuclar", "3 · Sonuçlar"],
  ["sema", "4 · Kanal Şeması"],
  ["malzeme", "5 · Malzeme & Teklif"],
];
const M3 = (x: number) => `${sy(x, 0)} m³/h`;
const SANTRAL_TIP_LISTESI = Object.keys(SANTRAL_TIPLERI) as SantralTipi[];
const MAHAL_TIP_LISTESI = Object.keys(MAHAL_TIPLERI) as MahalTipi[];

export default function HavalandirmaHesapEditoru({ hesap, musteriler }: Props) {
  const [ad, setAd] = useState(hesap.ad);
  const [musteriId, setMusteriId] = useState(hesap.musteriId);
  const [veri, setVeri] = useState<HavalandirmaVerisi>(hesap.veri);
  const [sekme, setSekme] = useState<Sekme>(hesap.veri.mahaller.length ? "mahaller" : "proje");
  const [seciliMahal, setSeciliMahal] = useState(hesap.veri.mahaller[0]?.id ?? "");
  const [kayitli, setKayitli] = useState(() => JSON.stringify({ ad: hesap.ad, musteriId: hesap.musteriId, veri: hesap.veri }));
  const [hata, setHata] = useState("");
  const [kaydediliyor, baslat] = useTransition();
  const [yardim, setYardim] = useYardimDurumu();
  const simdiki = JSON.stringify({ ad, musteriId, veri });
  const degisti = simdiki !== kayitli;
  const sonuc: HavalandirmaSonucu = useMemo(() => havalandirmaHesapla(veri), [veri]);

  useEffect(() => {
    const f = (e: BeforeUnloadEvent) => {
      if (!degisti) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", f);
    return () => window.removeEventListener("beforeunload", f);
  }, [degisti]);

  const guncelle = (p: Partial<HavalandirmaVerisi>) => setVeri((v) => ({ ...v, ...p }));
  const mahalGuncelle = (id: string, p: Partial<Mahal>) => setVeri((v) => ({ ...v, mahaller: v.mahaller.map((m) => (m.id === id ? { ...m, ...p } : m)) }));
  // Otomatik moddaki öneriyi elle düzenlenebilir hâle getirir (santraller ve mahal bağlantıları veriye yazılır)
  const elleyeGec = (v: HavalandirmaVerisi): HavalandirmaVerisi => (v.otoSistem ? { ...otomatikSistem(v).veri, otoSistem: false } : v);
  const santralGuncelle = (no: number, p: Partial<Santral>) => {
    if (veri.otoSistem) bildirimGoster("Santral değiştirildi: sistem seçimi elle düzenlemeye geçti.");
    setVeri((v0) => {
      const v = elleyeGec(v0);
      return { ...v, santraller: v.santraller.map((s) => (s.no === no ? { ...s, ...p } : s)) };
    });
  };
  const elleDuzenle = () => setVeri((v) => elleyeGec(v));
  const otomatigeDon = () => {
    if (!confirm("Santral / fan seçimi ve mahal bağlantıları yeniden programa bırakılsın mı? Elle yaptığınız santral ayarları silinir.")) return;
    setVeri((v) => ({ ...v, otoSistem: true, santraller: [] }));
  };

  const kaydet = (sonra?: () => void) => {
    setHata("");
    const gonderilen = simdiki;
    baslat(async () => {
      const r = await havalandirmaHesapKaydet({ id: hesap.id, ad, musteriId, veri: JSON.stringify(veri) });
      if (r.ok) {
        setKayitli(gonderilen);
        bildirimGoster("Hesap kaydedildi.");
        sonra?.();
      } else setHata(r.hata);
    });
  };
  const pdfAc = () => {
    const url = `/api/havalandirma-hesap/${hesap.id}/pdf`;
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
  const mahaleGit = (id: string) => {
    setSeciliMahal(id);
    setSekme("mahaller");
    window.scrollTo({ top: 0 });
  };

  const mahal = veri.mahaller.find((m) => m.id === seciliMahal) ?? veri.mahaller[0] ?? null;
  const mahalSonuc = mahal ? sonuc.mahaller.find((m) => m.id === mahal.id) ?? null : null;
  const uyariSayisi = sonuc.uyarilar.length + sonuc.mahaller.reduce((t, m) => t + m.uyarilar.length, 0) + sonuc.santraller.reduce((t, s) => t + s.uyarilar.length, 0);
  const isiGeri = sonuc.santraller.reduce((t, s) => t + (s.verim ? s.kis.geriKazanim : 0), 0);

  return (
    <YardimBaglami.Provider value={yardim}>
    <div className="max-w-6xl">
      <div className="sticky top-0 z-20 -mx-6 px-6 sm:-mx-10 sm:px-10 py-3 bg-zemin/95 backdrop-blur border-b border-hat mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/panel/havalandirma-hesabi" className="focus-ring text-sm text-metin/60 hover:text-metin">
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
          <Ozet ad="Dış tasarım" deger={`${sy(sonuc.disSicaklik)} / ${sy(sonuc.yazKT)} °C`} alt={`${sonuc.il} · kış / yaz`} />
          <Ozet ad="Toplam besleme" deger={M3(sonuc.toplamBesleme)} alt={`${sy(sonuc.toplamAlan)} m² · ${sonuc.mahaller.length} mahal`} vurgu />
          <Ozet ad="Toplam egzoz" deger={M3(sonuc.toplamEgzoz)} alt={sonuc.santraller.some((s) => s.yangin) ? "duman tahliyesi ayrıca" : undefined} />
          <Ozet ad="Isıtıcı / soğutucu" deger={`${sy(sonuc.toplamIsitici, 1)} / ${sy(sonuc.toplamSogutucu, 1)} kW`} alt="batarya kapasiteleri" />
          <Ozet ad="Isı geri kazanımı" deger={isiGeri ? `${sy(isiGeri, 1)} kW` : "—"} alt="kış tasarım gününde" />
          <Ozet ad="Fan gücü" deger={`${sy(sonuc.toplamFanKw, 2)} kW`} alt={`${sonuc.santraller.length} santral / fan`} />
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
            {k === "sonuclar" && uyariSayisi > 0 && <span className="ml-1.5 inline-block min-w-[1.25rem] px-1 rounded-full bg-sicak/15 text-sicak-dim text-[10px]">{uyariSayisi}</span>}
          </button>
        ))}
      </div>

      {sekme === "proje" && <ProjeSekmesi veri={veri} sonuc={sonuc} guncelle={guncelle} santralGuncelle={santralGuncelle} elleDuzenle={elleDuzenle} otomatigeDon={otomatigeDon} mahaleGit={mahaleGit} />}

      {sekme === "mahaller" && (
        <>
          <Rehber
            baslik="Mahaller nasıl girilir?"
            adimlar={[
              <><strong>Yalnız mahal tipini ve alanını girmeniz yeterli.</strong> Soldan tipi seçip &quot;+ Mahal&quot; deyin (ör. Kuaför, WC, Açık ofis), alanı (m²) yazın. Program taze hava ve egzoz debisini standarda göre hesaplar, mahalin nasıl havalandırılacağını (taze hava + egzoz, yalnız egzoz, davlumbaz, doğal…) yazar.</>,
              <><strong>Santral / fan seçimi otomatiktir:</strong> mahaller gruplanır ve her gruba uygun cihaz seçilir (kompakt ısı geri kazanım cihazı, klima santrali, konut HRV, mutfak, otopark, teknik egzoz fanı); seçimin gerekçesi yazılır. İsterseniz Proje sekmesinden elle düzenlemeye geçebilirsiniz.</>,
              <><strong>Bölge (isteğe bağlı):</strong> ayrı cihaz istenen kısımlara aynı adı yazın (ör. &quot;Daire 1&quot;, &quot;Zemin kat dükkân&quot;, &quot;1. kat ofis&quot;). Boş bırakılırsa aynı türdeki mahaller tek cihaza bağlanır.</>,
              <><strong>Kanal mesafeleri ve elle debi (isteğe bağlı):</strong> girilmezse tipik mesafelerle (önceki branşmandan 4 m, mahale 3 m) kanal ölçüsü ve fan basıncı hesaplanır. Liste sırası ana kanal üzerindeki sıradır (↑ ↓). Şartname farklı debi istiyorsa elle debi yazın.</>,
            ]}
          />
          <div className="grid lg:grid-cols-[16rem_1fr] gap-5 items-start">
            <div className="bg-yuzey border border-hat rounded-lg p-3 lg:sticky lg:top-44">
              <div className="space-y-1 mb-3">
                {veri.mahaller.map((m, i) => {
                  const ms = sonuc.mahaller.find((x) => x.id === m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSeciliMahal(m.id)}
                      className={`focus-ring w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${mahal?.id === m.id ? "bg-soguk/10 text-soguk-dim" : "hover:bg-zemin text-metin"}`}
                    >
                      <span className="flex justify-between gap-2">
                        <span className="truncate font-medium">
                          {i + 1}. {m.ad}
                        </span>
                        <span className="text-xs text-metin/50 shrink-0">{ms ? sy(Math.max(ms.besleme, ms.egzoz), 0) : "—"}</span>
                      </span>
                      <span className="block text-[11px] text-metin/45">
                        {sy(m.en * m.boy)} m² · {ms && ms.santral > 0 ? `S${ms.santral}${ms.egzozSantral > 0 && ms.egzozSantral !== ms.santral ? `/S${ms.egzozSantral}` : ""}` : "doğal"}
                        {ms && ` · B ${sy(ms.besleme, 0)} / E ${sy(ms.egzoz, 0)}`}
                        {ms && ms.uyarilar.length > 0 && <span className="text-sicak-dim"> · ⚠ {ms.uyarilar.length}</span>}
                      </span>
                    </button>
                  );
                })}
                {!veri.mahaller.length && <p className="text-xs text-metin/50 px-2 py-3">Henüz mahal yok.</p>}
              </div>
              <MahalEkle
                ekle={(tip) => {
                  const son = veri.mahaller.at(-1);
                  const santralNo = son ? son.santral : veri.santraller[0]?.no ?? 0;
                  const yeni = yeniMahal(tip, { santral: santralNo, egzozSantral: son?.egzozSantral ?? null });
                  setVeri((v) => ({ ...v, mahaller: [...v.mahaller, yeni] }));
                  setSeciliMahal(yeni.id);
                }}
              />
              {!veri.mahaller.length && (
                <div className="mt-2 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const o = ornekOfis().map((m) => ({ ...m, santral: veri.santraller[0]?.no ?? 0 }));
                      setVeri((v) => ({ ...v, mahaller: o }));
                      setSeciliMahal(o[0].id);
                    }}
                    className="focus-ring w-full text-xs border border-dashed border-hat rounded-md px-3 py-2 text-metin/60 hover:border-soguk"
                  >
                    Örnek ofis katı mahallerini ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const o = ornekDaire().map((m) => ({ ...m, santral: veri.santraller[0]?.no ?? 0 }));
                      setVeri((v) => ({ ...v, mahaller: o }));
                      setSeciliMahal(o[0].id);
                    }}
                    className="focus-ring w-full text-xs border border-dashed border-hat rounded-md px-3 py-2 text-metin/60 hover:border-soguk"
                  >
                    Örnek daire mahallerini ekle
                  </button>
                </div>
              )}
            </div>
            {mahal ? (
              <MahalDuzenleyici
                key={mahal.id}
                mahal={mahal}
                sonuc={mahalSonuc}
                veri={veri}
                hesap={sonuc}
                elleDuzenle={() => {
                  bildirimGoster("Sistem seçimi elle düzenlemeye geçti; santralleri mahal ekranından seçebilirsiniz.");
                  elleDuzenle();
                }}
                guncelle={(p) => mahalGuncelle(mahal.id, p)}
                kopyala={() => {
                  const kopya: Mahal = { ...mahal, id: yeniId(), ad: `${mahal.ad} (kopya)`.slice(0, 120) };
                  setVeri((v) => {
                    const i = v.mahaller.findIndex((m) => m.id === mahal.id);
                    const l = [...v.mahaller];
                    l.splice(i + 1, 0, kopya);
                    return { ...v, mahaller: l };
                  });
                  setSeciliMahal(kopya.id);
                }}
                sil={() => {
                  if (!confirm(`"${mahal.ad}" mahali silinsin mi?`)) return;
                  const i = veri.mahaller.findIndex((m) => m.id === mahal.id);
                  const kalan = veri.mahaller.filter((m) => m.id !== mahal.id);
                  setVeri((v) => ({ ...v, mahaller: v.mahaller.filter((m) => m.id !== mahal.id) }));
                  setSeciliMahal(kalan[Math.max(0, i - 1)]?.id ?? "");
                }}
                tasi={(yon) =>
                  setVeri((v) => {
                    const i = v.mahaller.findIndex((m) => m.id === mahal.id);
                    const j = i + yon;
                    if (j < 0 || j >= v.mahaller.length) return v;
                    const l = [...v.mahaller];
                    [l[i], l[j]] = [l[j], l[i]];
                    return { ...v, mahaller: l };
                  })
                }
              />
            ) : (
              <div className="bg-yuzey border border-hat rounded-lg p-8 text-sm text-metin/60">Soldan mahal ekleyin.</div>
            )}
          </div>
        </>
      )}

      {sekme === "sonuclar" && <SonuclarSekmesi s={sonuc} mahaleGit={mahaleGit} />}
      {sekme === "sema" && <SemaSekmesi s={sonuc} ad={ad} veri={veri} santralGuncelle={santralGuncelle} mahalGuncelle={mahalGuncelle} mahaleGit={mahaleGit} />}
      {sekme === "malzeme" && (
        <MalzemeSekmesi s={sonuc} hesapId={hesap.id} ad={ad} musteriId={musteriId} musteriler={musteriler} degisti={degisti} teklif={hesap.teklif} kaydet={() => kaydet()} kaydediliyor={kaydediliyor} />
      )}
    </div>
    </YardimBaglami.Provider>
  );
}

// =============================================================================
// 1. PROJE & SANTRALLER
// =============================================================================
function ProjeSekmesi({
  veri,
  sonuc,
  guncelle,
  santralGuncelle,
  elleDuzenle,
  otomatigeDon,
  mahaleGit,
}: {
  veri: HavalandirmaVerisi;
  sonuc: HavalandirmaSonucu;
  guncelle: (p: Partial<HavalandirmaVerisi>) => void;
  santralGuncelle: (no: number, p: Partial<Santral>) => void;
  elleDuzenle: () => void;
  otomatigeDon: () => void;
  mahaleGit: (id: string) => void;
}) {
  const il = ilBul(veri.il);
  const kat = EN_KATEGORI[veri.kategori];
  return (
    <>
      <Rehber
        baslik="Bu hesap nasıl yapılır? (sırayla)"
        adimlar={[
          <><strong>1 · Proje & Santraller</strong> (bu sekme): ili seçin; diğer değerler hazır gelir (TS EN 16798-1 Kategori II). Santral / fan seçimini program yapar — aşağıda seçilen cihazları ve gerekçelerini görürsünüz.</>,
          <><strong>2 · Mahaller</strong>: yalnız mahal tipini ve alanını girin (ör. Kuaför 60 m², WC). Taze hava / egzoz debisi, mahalin nasıl havalandırılacağı ve bağlanacağı cihaz otomatik belirlenir.</>,
          <><strong>3 · Sonuçlar</strong>: mahal debileri, santral seçimi, ısı geri kazanımı, batarya kapasiteleri, kanal ölçüleri, fan basıncı ve gücü (SFP). <strong>4 · Kanal Şeması</strong>: tek hat kanal şeması (ölçülere tıklayıp değiştirebilirsiniz). <strong>5 · Malzeme & Teklif</strong>: malzeme listesi ve teklif taslağı.</>,
          <>Klima / VRF hesabı yapılmış bir projeyi buraya aktarabilirsiniz (yeni hesap açarken &quot;Klima / VRF hesabındaki odalarla&quot; seçeneği); odalar yeniden girilmez.</>,
        ]}
      />
      <div className="grid lg:grid-cols-2 gap-5">
        <Kart baslik="Konum ve iklim" aciklama="Kış ve yaz dış tasarım sıcaklıkları il tablosundan gelir; ısıtıcı / soğutucu batarya ve ısı geri kazanımı bunlara göre hesaplanır.">
          <div className="grid sm:grid-cols-2 gap-3">
            <Alan ad="İl" ipucu="Dış tasarım sıcaklıkları ve rakım (hava yoğunluğu) bu ilden gelir.">
              <select value={veri.il} onChange={(e) => guncelle({ il: e.target.value })} className={girdi}>
                {ILLER.map((i) => (
                  <option key={i.ad} value={i.ad}>
                    {i.ad} (kış {i.disSicaklik} °C · yaz {i.yazKT}/{i.yazYT} °C)
                  </option>
                ))}
              </select>
            </Alan>
            <Alan ad="Adres / konum" ipucu="Yalnız rapora yazılır.">
              <input value={veri.adres} maxLength={300} onChange={(e) => guncelle({ adres: e.target.value })} className={girdi} />
            </Alan>
            <Alan ad={`Kış dış tasarım °C (boş = ${il.disSicaklik})`} ipucu="Isıtıcı batarya ve donma koruması bu sıcaklığa göre hesaplanır. Normalde boş bırakın.">
              <SayiAlani deger={veri.disSicaklikElle} bosOlabilir min={-40} maks={20} yerTutucu={String(il.disSicaklik)} onChange={(n) => guncelle({ disSicaklikElle: n })} />
            </Alan>
            <Alan ad={`Yaz kuru termometre °C (boş = ${il.yazKT})`} ipucu="Soğutucu batarya bu sıcaklığa göre hesaplanır.">
              <SayiAlani deger={veri.yazKTElle} bosOlabilir min={20} maks={50} yerTutucu={String(il.yazKT)} onChange={(n) => guncelle({ yazKTElle: n })} />
            </Alan>
            <Alan ad={`Yaz yaş termometre °C (boş = ${il.yazYT})`} ipucu="Dış havanın nemi; soğutucu bataryanın gizli (nem alma) yükü buna göre bulunur.">
              <SayiAlani deger={veri.yazYTElle} bosOlabilir min={10} maks={35} yerTutucu={String(il.yazYT)} onChange={(n) => guncelle({ yazYTElle: n })} />
            </Alan>
          </div>
        </Kart>

        <Kart baslik="Taze hava yöntemi" aciklama="Mahallere verilecek en az dış hava miktarı bu standarda göre bulunur.">
          <div className="grid sm:grid-cols-2 gap-3">
            <Alan ad="Standart" ipucu="Türkiye'de TS EN 16798-1 kullanılır (AB). ASHRAE 62.1 yabancı yatırımlı / LEED projelerinde istenir.">
              <select value={veri.yontem} onChange={(e) => guncelle({ yontem: e.target.value as HavalandirmaVerisi["yontem"] })} className={girdi}>
                <option value="EN16798">TS EN 16798-1 (Avrupa)</option>
                <option value="ASHRAE">ASHRAE 62.1 (ABD)</option>
              </select>
            </Alan>
            {veri.yontem === "EN16798" ? (
              <>
                <Alan ad="Kategori" ipucu="I: yüksek beklenti (hastane, hassas kişiler) · II: normal, yeni binalar (çoğu proje) · III: mevcut binalar.">
                  <select value={veri.kategori} onChange={(e) => guncelle({ kategori: e.target.value as Kategori })} className={girdi}>
                    {(Object.keys(EN_KATEGORI) as Kategori[]).map((k) => (
                      <option key={k} value={k}>
                        {EN_KATEGORI[k].ad}
                      </option>
                    ))}
                  </select>
                </Alan>
                <Alan ad="Bina malzemesi kirliliği" className="sm:col-span-2" ipucu="Yapı malzemelerinin ve mobilyanın havaya verdiği kirleticiler. Yeni bina, standart malzeme: düşük kirletici.">
                  <select value={veri.kirlilik} onChange={(e) => guncelle({ kirlilik: e.target.value as Kirlilik })} className={girdi}>
                    {(Object.keys(KIRLILIK) as Kirlilik[]).map((k) => (
                      <option key={k} value={k}>
                        {KIRLILIK[k]}
                      </option>
                    ))}
                  </select>
                </Alan>
                <p className="sm:col-span-2 text-[11px] text-metin/55">
                  Bu seçimle: kişi başı <strong>{kat.kisi} l/s</strong> + alan başı <strong>{sy(kat.alan[veri.kirlilik], 2)} l/s·m²</strong> (ör. 20 m² ofiste 2 kişi: {sy((2 * kat.kisi + 20 * kat.alan[veri.kirlilik]) * 3.6, 0)} m³/h). Konutta en az {sy(kat.konutAlan, 2)} l/s·m².
                </p>
              </>
            ) : (
              <Alan ad="Hava dağıtım etkinliği Ez" ipucu="Tavandan soğuk hava / tavandan besleme + tavandan emiş (soğutma): 1,0 · tavandan sıcak hava ve tavandan emiş: 0,8 · döşemeden deplasman: 1,2.">
                <SayiAlani deger={veri.ez} min={0.5} maks={1.2} onChange={(n) => n !== null && guncelle({ ez: n })} />
              </Alan>
            )}
          </div>
        </Kart>

        <Kart baslik="İç koşullar ve su rejimleri" aciklama="Egzoz havasının sıcaklığı (ısı geri kazanımına girer) ve batarya su debileri için.">
          <div className="grid sm:grid-cols-3 gap-3">
            <Alan ad="İç sıcaklık kış °C" ipucu="Egzoz havası sıcaklığı (kışın eşanjöre giren sıcak hava).">
              <SayiAlani deger={veri.icKis} min={10} maks={30} onChange={(n) => n !== null && guncelle({ icKis: n })} />
            </Alan>
            <Alan ad="İç sıcaklık yaz °C">
              <SayiAlani deger={veri.icYaz} min={18} maks={32} onChange={(n) => n !== null && guncelle({ icYaz: n })} />
            </Alan>
            <Alan ad="İç nem yaz %">
              <SayiAlani deger={veri.icNem} min={30} maks={70} onChange={(n) => n !== null && guncelle({ icNem: n })} />
            </Alan>
            <Alan ad="Isıtma suyu gidiş °C" ipucu="Kazan 80/60 · yoğuşmalı kazan 70/50 · ısı pompası 45/40.">
              <SayiAlani deger={veri.isitmaRejimi[0]} min={20} maks={95} onChange={(n) => n !== null && guncelle({ isitmaRejimi: [n, Math.min(n - 2, veri.isitmaRejimi[1])] })} />
            </Alan>
            <Alan ad="Isıtma suyu dönüş °C">
              <SayiAlani deger={veri.isitmaRejimi[1]} min={15} maks={93} onChange={(n) => n !== null && guncelle({ isitmaRejimi: [veri.isitmaRejimi[0], Math.min(n, veri.isitmaRejimi[0] - 2)] })} />
            </Alan>
            <span />
            <Alan ad="Soğutma suyu gidiş °C" ipucu="Chiller 7/12 · ısı pompası 7/12 ya da 10/15.">
              <SayiAlani deger={veri.sogutmaRejimi[0]} min={2} maks={20} onChange={(n) => n !== null && guncelle({ sogutmaRejimi: [n, Math.max(n + 2, veri.sogutmaRejimi[1])] })} />
            </Alan>
            <Alan ad="Soğutma suyu dönüş °C">
              <SayiAlani deger={veri.sogutmaRejimi[1]} min={4} maks={25} onChange={(n) => n !== null && guncelle({ sogutmaRejimi: [veri.sogutmaRejimi[0], Math.max(n, veri.sogutmaRejimi[0] + 2)] })} />
            </Alan>
          </div>
        </Kart>

        <Kart baslik="Kanal kabulleri" aciklama="Dikdörtgen kanal yüksekliği asma tavan boşluğuna sığmalıdır; program genişliği buna göre büyütür.">
          <div className="grid sm:grid-cols-2 gap-3">
            <Alan ad="En çok kanal yüksekliği (mm)" ipucu="Asma tavan boşluğu − 50…100 mm (askı, izolasyon). Genelde 300–400 mm. Santral bazında ayrıca değiştirilebilir.">
              <SayiAlani deger={veri.kanalYukseklikMaks} min={150} maks={1500} adim={50} onChange={(n) => n !== null && guncelle({ kanalYukseklikMaks: Math.round(n / 50) * 50 })} />
            </Alan>
          </div>
          <div className="text-[11px] text-metin/55 mt-2 space-y-0.5">
            {(Object.keys(HIZ_SINIRLARI) as Akustik[]).map((a) => (
              <p key={a}>
                <strong>{HIZ_SINIRLARI[a].ad}</strong>: ana kanal ≤ {HIZ_SINIRLARI[a].ana} m/s · branşman ≤ {HIZ_SINIRLARI[a].brans} m/s · menfez başına ≈ {HIZ_SINIRLARI[a].menfezDebi} m³/h
              </p>
            ))}
          </div>
        </Kart>

        <div className="lg:col-span-2">
          {veri.otoSistem ? (
            <OtoSantralKarti sonuc={sonuc} elleDuzenle={elleDuzenle} mahaleGit={mahaleGit} />
          ) : (
          <Kart baslik="Santraller ve fanlar (elle)" aciklama="Ana kanal: santralden ilk branşmana kanal uzunluğu (besleme ve egzoz için). Isı geri kazanım verimi boşsa tipin tipik değeri kullanılır; seçilen cihazın kataloğundaki değeri yazabilirsiniz.">
            <SantralYardimi />
            <div className="space-y-3">
              {veri.santraller.map((s) => {
                const t = SANTRAL_TIPLERI[s.tip];
                const ss = sonuc.santraller.find((x) => x.no === s.no);
                const bagli = veri.mahaller.filter((m) => m.santral === s.no || m.egzozSantral === s.no).length;
                return (
                  <div key={s.no} className="border border-hat rounded-md p-3 bg-zemin/40">
                    <div className="flex flex-wrap items-end gap-3">
                      <span className="text-xs font-semibold text-soguk-dim pb-2 w-8">S{s.no}</span>
                      <Alan ad="Ad" className="w-40">
                        <input value={s.ad} maxLength={60} onChange={(e) => santralGuncelle(s.no, { ad: e.target.value })} className={girdi} />
                      </Alan>
                      <Alan ad="Tip" className="w-72">
                        <select
                          value={s.tip}
                          onChange={(e) => {
                            const yeni = yeniSantral(s.no, e.target.value as SantralTipi);
                            santralGuncelle(s.no, { ...yeni, ad: s.ad, anaHat: s.anaHat });
                          }}
                          className={girdi}
                        >
                          {SANTRAL_TIP_LISTESI.map((k) => (
                            <option key={k} value={k}>
                              {SANTRAL_TIPLERI[k].ad}
                            </option>
                          ))}
                        </select>
                      </Alan>
                      <Alan ad="Ana kanal (m)" className="w-24">
                        <SayiAlani deger={s.anaHat} min={0} maks={300} onChange={(n) => n !== null && santralGuncelle(s.no, { anaHat: n })} />
                      </Alan>
                      <Alan ad="Kanal" className="w-32">
                        <select value={s.kanalSekli} onChange={(e) => santralGuncelle(s.no, { kanalSekli: e.target.value as KanalSekli })} className={girdi}>
                          <option value="DIKDORTGEN">Dikdörtgen</option>
                          <option value="DAIRESEL">Dairesel (spiro)</option>
                        </select>
                      </Alan>
                      <Alan ad="Ses / hız sınıfı" className="w-44">
                        <select value={s.akustik} onChange={(e) => santralGuncelle(s.no, { akustik: e.target.value as Akustik | "OTO" })} className={girdi}>
                          <option value="OTO">Otomatik (mahallere göre)</option>
                          {(Object.keys(HIZ_SINIRLARI) as Akustik[]).map((a) => (
                            <option key={a} value={a}>
                              {HIZ_SINIRLARI[a].ad.split(" (")[0]}
                            </option>
                          ))}
                        </select>
                      </Alan>
                      <button
                        type="button"
                        onClick={() => {
                          if (!confirm(`${s.ad} silinsin mi? Bu santrale bağlı mahaller "santral yok" olur.`)) return;
                          guncelle({
                            santraller: veri.santraller.filter((x) => x.no !== s.no),
                            mahaller: veri.mahaller.map((m) => ({ ...m, santral: m.santral === s.no ? 0 : m.santral, egzozSantral: m.egzozSantral === s.no ? null : m.egzozSantral })),
                          });
                        }}
                        className="focus-ring text-xs text-metin/40 hover:text-sicak-dim pb-2 ml-auto"
                      >
                        Santrali sil
                      </button>
                    </div>
                    <div className="flex flex-wrap items-start gap-3 mt-3">
                      {t.hr && (
                        <Alan ad={`Isı geri kazanım verimi % (boş = ${t.verim})`} className="w-48" ipucu="EN 308 kuru verim. ErP: en az %73 (ara akışkanlı %68).">
                          <SayiAlani deger={s.verimElle} bosOlabilir min={30} maks={95} yerTutucu={String(t.verim)} onChange={(n) => santralGuncelle(s.no, { verimElle: n })} />
                        </Alan>
                      )}
                      {t.besleme && s.tip !== "OTOPARK" && (
                        <>
                          <label className="flex items-center gap-2 text-sm text-metin/80 pt-6">
                            <input type="checkbox" checked={s.isitici} onChange={(e) => santralGuncelle(s.no, { isitici: e.target.checked })} />
                            Isıtıcı batarya
                          </label>
                          <label className="flex items-center gap-2 text-sm text-metin/80 pt-6">
                            <input type="checkbox" checked={s.sogutucu} onChange={(e) => santralGuncelle(s.no, { sogutucu: e.target.checked })} />
                            Soğutucu batarya
                          </label>
                          <Alan ad="Besleme kış °C" className="w-28" ipucu="Nötr havalandırma 20–22 °C; ısıtma radyatör / klima ile yapılıyorsa nötr verin.">
                            <SayiAlani deger={s.beslemeKis} min={10} maks={40} onChange={(n) => n !== null && santralGuncelle(s.no, { beslemeKis: n })} />
                          </Alan>
                          <Alan ad="Besleme yaz °C" className="w-28" ipucu="Nötr 18–20 °C; santral iklimlendirme de yapıyorsa 14–16 °C.">
                            <SayiAlani deger={s.beslemeYaz} min={12} maks={26} onChange={(n) => n !== null && santralGuncelle(s.no, { beslemeYaz: n })} />
                          </Alan>
                        </>
                      )}
                      <label className="flex items-center gap-2 text-sm text-metin/80 pt-6" title="Mahal branşmanlarına sabit (CAV) ya da değişken (VAV) debi regülatörü konur; uç kayıp 50 Pa artar.">
                        <input type="checkbox" checked={s.regulator} onChange={(e) => santralGuncelle(s.no, { regulator: e.target.checked })} />
                        Debi regülatörü (CAV / VAV)
                      </label>
                      <Alan ad="Yangın damperi (kritik hatta adet)" className="w-44" ipucu="Yangın bölmesi geçişlerinde; kritik hattaki adet basınç kaybına eklenir, toplam adet malzeme listesine girer.">
                        <SayiAlani deger={s.yanginDamperi} min={0} maks={20} adim={1} onChange={(n) => n !== null && santralGuncelle(s.no, { yanginDamperi: Math.round(n) })} />
                      </Alan>
                      {s.tip === "OTOPARK" && (
                        <Alan ad="Otopark sistemi" className="w-56">
                          <select value={s.otoparkSistemi} onChange={(e) => santralGuncelle(s.no, { otoparkSistemi: e.target.value as OtoparkSistemi })} className={girdi}>
                            <option value="JETFAN">Jet fan (kanalsız, impuls)</option>
                            <option value="KANALLI">Kanallı (egzoz kanalı + menfez)</option>
                          </select>
                        </Alan>
                      )}
                      <Alan ad={`Kanal yüksekliği mm (boş = ${veri.kanalYukseklikMaks})`} className="w-44">
                        <SayiAlani deger={s.kanalYukseklik} bosOlabilir min={150} maks={1500} adim={50} yerTutucu={String(veri.kanalYukseklikMaks)} onChange={(n) => santralGuncelle(s.no, { kanalYukseklik: n === null ? null : Math.round(n / 50) * 50 })} />
                      </Alan>
                    </div>
                    <p className="text-[11px] text-metin/50 mt-2">
                      {t.aciklama} · bağlı mahal: {bagli}
                      {ss && ss.besleme + ss.egzoz > 0 && ` · besleme ${M3(ss.besleme)} / egzoz ${M3(ss.egzoz)}`}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {SANTRAL_TIP_LISTESI.map((t) => (
                <button
                  key={t}
                  type="button"
                  title={SANTRAL_TIPLERI[t].aciklama}
                  onClick={() => {
                    const no = Math.max(0, ...veri.santraller.map((s) => s.no)) + 1;
                    if (no > 30) return;
                    guncelle({ santraller: [...veri.santraller, yeniSantral(no, t)] });
                  }}
                  className="focus-ring text-xs border border-dashed border-hat rounded-md px-2.5 py-1 text-metin/60 hover:border-soguk hover:text-soguk-dim"
                >
                  + {SANTRAL_TIPLERI[t].ad.split(" — ")[0].split(" (")[0]}
                  {t === "AHU_PLAKA" ? " (plakalı)" : t === "AHU_ROTOR" ? " (rotorlu)" : t === "AHU_ARA" ? " (ara akışkanlı)" : ""}
                </button>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-hat flex flex-wrap items-center gap-3">
              <button type="button" onClick={otomatigeDon} className="focus-ring text-xs border border-soguk/50 text-soguk-dim rounded-md px-3 py-1.5 hover:bg-soguk/5">
                ↺ Santral seçimini yeniden programa bırak
              </button>
              <span className="text-[11px] text-metin/50">Mahallere göre cihazları program seçer ve gerekçesini yazar.</span>
            </div>
          </Kart>
          )}
        </div>
      </div>
    </>
  );
}

// Otomatik modda seçilen santral / fanlar ve gerekçeleri
function OtoSantralKarti({ sonuc, elleDuzenle, mahaleGit }: { sonuc: HavalandirmaSonucu; elleDuzenle: () => void; mahaleGit: (id: string) => void }) {
  const dogal = sonuc.mahaller.filter((m) => m.santral === 0 && m.egzozSantral === 0);
  return (
    <Kart
      baslik="Santral ve fan seçimi — otomatik"
      aciklama="Program mahal tiplerine bakarak her mahalin nasıl havalandırılacağını belirler, mahalleri gruplar ve her gruba uygun cihazı seçer. Mahal eklediğinizde ya da değiştirdiğinizde seçim kendiliğinden güncellenir."
    >
      {!sonuc.santraller.length && <p className="text-sm text-metin/55">Mahal girdikçe cihazlar burada görünecek.</p>}
      <div className="space-y-3">
        {sonuc.santraller.map((x) => (
          <div key={x.no} className="border border-hat rounded-md p-3 bg-zemin/40">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-metin">
                <span className="text-soguk-dim">S{x.no}</span> · {x.ad} <span className="font-normal text-metin/55">— {x.tipAdi}</span>
              </p>
              <p className="text-xs text-metin/60">
                {x.besleme > 0.5 && `besleme ${M3(x.besleme)}`}
                {x.besleme > 0.5 && x.egzoz > 0.5 && " · "}
                {x.egzoz > 0.5 && `egzoz ${M3(x.egzoz)}`}
                {x.yangin > 0 && ` · duman ${M3(x.yangin)}`}
              </p>
            </div>
            <p className="text-[12px] text-metin/70 mt-1">{x.secim}</p>
            {x.gerekce && <p className="text-[12px] text-metin/60 leading-relaxed mt-1.5"><strong className="text-metin/70">Neden?</strong> {x.gerekce}</p>}
            <p className="text-[11px] text-metin/50 mt-1.5">
              Bağlı mahaller:{" "}
              {x.mahaller.map((id, i) => {
                const m = sonuc.mahaller.find((y) => y.id === id);
                return (
                  <span key={id}>
                    {i > 0 && ", "}
                    <button type="button" onClick={() => mahaleGit(id)} className="focus-ring text-soguk-dim hover:underline">
                      {m?.ad ?? "?"}
                    </button>
                  </span>
                );
              })}
            </p>
          </div>
        ))}
        {dogal.length > 0 && (
          <p className="text-[12px] text-metin/60">
            Fan gerektirmeyen (doğal havalandırmalı) mahaller: {dogal.map((m) => m.ad).join(", ")}.
          </p>
        )}
      </div>
      <div className="mt-4 pt-3 border-t border-hat flex flex-wrap items-center gap-3">
        <button type="button" onClick={elleDuzenle} className="focus-ring text-xs border border-hat rounded-md px-3 py-1.5 text-metin/70 hover:border-soguk">
          Elle düzenle
        </button>
        <span className="text-[11px] text-metin/50">Cihaz tipini, verimi, bataryaları, kanal tipini ya da mahal bağlantılarını değiştirmek isterseniz. Bu seçim başlangıç olarak kopyalanır.</span>
      </div>
    </Kart>
  );
}

function SantralYardimi() {
  const acik = useContext(YardimBaglami);
  if (!acik) return null;
  return (
    <div className="text-[12px] leading-relaxed text-metin/65 bg-zemin/60 border border-hat rounded-md px-3 py-2 mb-3 space-y-1.5">
      <p>
        <strong>Isı geri kazanımlı santral</strong>: ofis, mağaza, okul, otel gibi binaların ana cihazı. Plakalı: taze ve egzoz havası karışmaz (hastane, kokulu egzoz). Rotorlu: nemi de geri kazanır, verimi yüksek, donmaz; WC / mutfak egzozu bağlanmaz. Ara akışkanlı: besleme ve egzoz santralleri ayrı yerlerdeyse.
      </p>
      <p>
        <strong>Kompakt ısı geri kazanım cihazı</strong>: 250–2.500 m³/h; dükkân, kuaför, küçük ofis, klinik, restoran salonu gibi tek bölümlü işletmelerde santral yerine asma tavana asılır (makine dairesi gerekmez).
      </p>
      <p>
        <strong>Konut HRV</strong>: dairelerde tavana asılan küçük cihaz; kuru odalara (salon, yatak) taze hava verir, ıslak hacimlerden (mutfak, banyo, WC) emer. Debiler otomatik dengelenir.
      </p>
      <p>
        <strong>Egzoz fanı</strong>: WC, otopark dışı teknik mahal, depo gibi yalnız egzoz gereken yerler; mahalde &quot;Egzoz santrali&quot; olarak seçin. <strong>Mutfak</strong>: davlumbaz egzozu + %85 telafi havası; yağlı kanal ayrı ve yüksek hızlıdır. <strong>Otopark</strong>: normal egzoz + yangında duman tahliyesi (iki hızlı, F300 fanlar).
      </p>
    </div>
  );
}

function MahalTipSecici({ deger, onChange, aria }: { deger: MahalTipi; onChange: (t: MahalTipi) => void; aria?: string }) {
  return (
    <select value={deger} onChange={(e) => onChange(e.target.value as MahalTipi)} aria-label={aria} className={girdi}>
      {MAHAL_GRUPLARI.map((g) => (
        <optgroup key={g} label={g}>
          {MAHAL_TIP_LISTESI.filter((k) => MAHAL_TIPLERI[k].grup === g).map((k) => (
            <option key={k} value={k}>
              {MAHAL_TIPLERI[k].ad}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

function MahalEkle({ ekle }: { ekle: (t: MahalTipi) => void }) {
  const [tip, setTip] = useState<MahalTipi>("OFIS_ACIK");
  return (
    <div className="flex gap-1.5">
      <MahalTipSecici deger={tip} onChange={setTip} aria="Eklenecek mahal tipi" />
      <button type="button" onClick={() => ekle(tip)} className="focus-ring shrink-0 bg-soguk text-white px-3 rounded-md text-sm font-medium hover:bg-soguk-dim">
        + Mahal
      </button>
    </div>
  );
}

// =============================================================================
// 2. MAHAL DÜZENLEYİCİ
// =============================================================================
function MahalDuzenleyici({
  mahal: m,
  sonuc,
  veri,
  hesap,
  elleDuzenle,
  guncelle,
  kopyala,
  sil,
  tasi,
}: {
  mahal: Mahal;
  sonuc: MahalSonucu | null;
  veri: HavalandirmaVerisi;
  hesap: HavalandirmaSonucu;
  elleDuzenle: () => void;
  guncelle: (p: Partial<Mahal>) => void;
  kopyala: () => void;
  sil: () => void;
  tasi: (yon: -1 | 1) => void;
}) {
  const t = MAHAL_TIPLERI[m.tip] as (typeof MAHAL_TIPLERI)[MahalTipi] & { yogunluk?: number; ach?: number; not?: string };
  const y = t.yontem;
  const alan = m.en * m.boy;
  const kisiOto = t.yogunluk ? Math.max(1, Math.round(alan / t.yogunluk)) : 0;
  return (
    <div className="space-y-4">
      <Kart baslik="Mahal">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Alan ad="Ad" className="sm:col-span-2">
            <input value={m.ad} maxLength={120} onChange={(e) => guncelle({ ad: e.target.value })} className={girdi} />
          </Alan>
          <Alan ad="Mahal tipi" className="sm:col-span-2" ipucu="Debi yöntemi tipe göre değişir; tipi değiştirince aşağıdaki alanlar da değişir.">
            <MahalTipSecici deger={m.tip} onChange={(tip) => guncelle({ tip, ad: m.ad === MAHAL_TIPLERI[m.tip].ad ? MAHAL_TIPLERI[tip].ad : m.ad })} />
          </Alan>
          <Alan ad="Alan (m²)" ipucu="Alanı doğrudan yazabilirsiniz (boy sabit kalır, en buna göre ayarlanır) ya da en × boy girin.">
            <SayiAlani deger={Math.round(alan * 100) / 100} min={0.5} maks={50000} onChange={(n) => n !== null && n > 0 && guncelle({ en: Math.round((n / Math.max(0.3, m.boy)) * 1000) / 1000 })} />
          </Alan>
          <Alan ad="En (m)">
            <SayiAlani deger={m.en} min={0.3} maks={500} onChange={(n) => n !== null && guncelle({ en: n })} />
          </Alan>
          <Alan ad="Boy (m)">
            <SayiAlani deger={m.boy} min={0.3} maks={500} onChange={(n) => n !== null && guncelle({ boy: n })} />
          </Alan>
          <Alan ad="Yükseklik (m)" ipucu="Döşemeden tavana net yükseklik; hava değişim sayısı hacme göre bulunur.">
            <SayiAlani deger={m.yukseklik} min={1.8} maks={30} onChange={(n) => n !== null && guncelle({ yukseklik: n })} />
          </Alan>
          <div className="text-xs text-metin/55 pt-5">{sy(alan * m.yukseklik, 0)} m³ hacim</div>

          {(y === "KISI_ALAN" || y === "KONUT_KURU") && (
            <Alan ad={`Kişi sayısı (0 = ${kisiOto}, tip yoğunluğu)`} ipucu={t.yogunluk ? `Bu tipte kişi başı ${t.yogunluk} m² kabul edilir. Gerçek kişi / koltuk sayısı biliniyorsa yazın.` : undefined}>
              <SayiAlani deger={m.kisi} min={0} maks={5000} adim={1} onChange={(n) => n !== null && guncelle({ kisi: Math.round(n) })} />
            </Alan>
          )}
          {y === "ARMATUR" && (
            <Alan ad="Armatür sayısı" ipucu="WC: klozet + pisuvar · duş: duş başlığı. Her biri için sürekli egzoz verilir.">
              <SayiAlani deger={m.armatur} min={1} maks={200} adim={1} onChange={(n) => n !== null && guncelle({ armatur: Math.max(1, Math.round(n)) })} />
            </Alan>
          )}
          {y === "MUTFAK" && (
            <>
              <Alan ad="Davlumbaz tipi" ipucu="Duvara dayalı kanopi en verimlisidir; ada tipi daha çok egzoz ister.">
                <select value={m.davlumbazTip} onChange={(e) => guncelle({ davlumbazTip: e.target.value as DavlumbazTipi })} className={girdi}>
                  {(Object.keys(DAVLUMBAZ_TIPLERI) as DavlumbazTipi[]).map((k) => (
                    <option key={k} value={k}>
                      {DAVLUMBAZ_TIPLERI[k].ad}
                    </option>
                  ))}
                </select>
              </Alan>
              <Alan ad="Pişirme yükü" className="sm:col-span-2" ipucu="Davlumbazın altındaki en ağır cihaza göre seçin.">
                <select value={m.pisirmeYuku} onChange={(e) => guncelle({ pisirmeYuku: e.target.value as PisirmeYuku })} className={girdi}>
                  {(Object.keys(PISIRME_YUKLERI) as PisirmeYuku[]).map((k) => (
                    <option key={k} value={k}>
                      {PISIRME_YUKLERI[k]}
                    </option>
                  ))}
                </select>
              </Alan>
              <Alan ad="Davlumbaz uzunluğu (m)" ipucu="Toplam davlumbaz boyu; cihaz sırasından her yanda 15 cm taşmalı.">
                <SayiAlani deger={m.davlumbazM} min={0.5} maks={60} onChange={(n) => n !== null && guncelle({ davlumbazM: n })} />
              </Alan>
            </>
          )}
          {y === "TEKNIK_ISI" && (
            <>
              <Alan ad="Mahaldeki ısı yükü (kW)" ipucu="Trafo kayıpları, pano, UPS, jeneratör gövde ısısı… Cihaz kataloğundan alın.">
                <SayiAlani deger={m.isiKw} min={0} maks={2000} onChange={(n) => n !== null && guncelle({ isiKw: n })} />
              </Alan>
              <Alan ad="İzin verilen en yüksek iç sıcaklık °C" ipucu="Dış hava ile bu sıcaklık arasındaki farkla debi bulunur (en az 5 K).">
                <SayiAlani deger={m.tMaks} min={20} maks={60} onChange={(n) => n !== null && guncelle({ tMaks: n })} />
              </Alan>
            </>
          )}
          {y === "KAZAN" && (
            <Alan ad="Toplam brülör gücü (kW)" ipucu="Yanma havası ve mahal havalandırması bu güce göre bulunur.">
              <SayiAlani deger={m.kazanKw} min={0} maks={20000} onChange={(n) => n !== null && guncelle({ kazanKw: n })} />
            </Alan>
          )}
          {y === "HAVA_DEGISIMI" && (
            <Alan ad={`Hava değişim sayısı 1/h (boş = ${t.ach ?? 2})`}>
              <SayiAlani deger={m.ach} bosOlabilir min={0.2} maks={60} yerTutucu={String(t.ach ?? 2)} onChange={(n) => guncelle({ ach: n })} />
            </Alan>
          )}
        </div>
      </Kart>

      <SistemKarti mahal={m} sonuc={sonuc} hesap={hesap} veri={veri} elleDuzenle={elleDuzenle} guncelle={guncelle} />

      {!veri.otoSistem && (
      <Kart baslik="Santral bağlantısı (elle)">
        <div className="grid sm:grid-cols-2 gap-3">
          <Alan ad="Santral (besleme)" ipucu="Bu mahale taze havayı veren santral. Yalnız egzoz olan mahallerde egzozu atan santral / fan.">
            <select value={m.santral} onChange={(e) => guncelle({ santral: Number(e.target.value) })} className={girdi}>
              <option value={0}>— Yok (bağlı değil) —</option>
              {veri.santraller.map((s) => (
                <option key={s.no} value={s.no}>
                  S{s.no} · {s.ad}
                </option>
              ))}
            </select>
          </Alan>
          <Alan ad="Egzoz santrali" ipucu="Egzozu başka bir cihaz atıyorsa seçin (ör. WC egzozu ayrı fanla, rotorlu santrale bağlanmaz).">
            <select value={m.egzozSantral ?? ""} onChange={(e) => guncelle({ egzozSantral: e.target.value === "" ? null : Number(e.target.value) })} className={girdi}>
              <option value="">Besleme santraliyle aynı</option>
              <option value={0}>— Yok (egzoz kanala bağlanmaz) —</option>
              {veri.santraller.map((s) => (
                <option key={s.no} value={s.no}>
                  S{s.no} · {s.ad}
                </option>
              ))}
            </select>
          </Alan>
        </div>
      </Kart>
      )}

      <details className="bg-yuzey border border-hat rounded-lg p-4 group" open={m.hatMesafe !== 4 || m.bransMesafe !== 3 || m.besElle !== null || m.egzElle !== null}>
        <summary className="cursor-pointer text-sm font-semibold text-metin select-none">
          Kanal mesafeleri ve elle debi <span className="text-xs font-normal text-metin/50">(isteğe bağlı — girilmezse tipik değerler: 4 m / 3 m, debi hesaptan)</span>
        </summary>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          <Alan ad="Önceki branşmandan ana kanal (m)" ipucu="Listede bir önceki mahalin branşmanından bu mahalin branşmanına ana kanal uzunluğu. İlk mahalde santralin ana kanalına eklenmez.">
            <SayiAlani deger={m.hatMesafe} min={0} maks={300} onChange={(n) => n !== null && guncelle({ hatMesafe: n })} />
          </Alan>
          <Alan ad="Branşmandan mahale (m)" ipucu="Ana kanaldaki ayrılmadan mahaldeki menfeze kadar kanal / flex uzunluğu.">
            <SayiAlani deger={m.bransMesafe} min={0} maks={200} onChange={(n) => n !== null && guncelle({ bransMesafe: n })} />
          </Alan>
          <Alan ad="Elle besleme m³/h (boş = hesap)" ipucu="Şartnamede ya da kullanıcı isteğiyle farklı bir debi varsa.">
            <SayiAlani deger={m.besElle} bosOlabilir min={0} maks={500000} yerTutucu={sonuc ? sy(sonuc.besleme - sonuc.dengeEk, 0) : ""} onChange={(n) => guncelle({ besElle: n })} />
          </Alan>
          <Alan ad="Elle egzoz m³/h (boş = hesap)">
            <SayiAlani deger={m.egzElle} bosOlabilir min={0} maks={500000} yerTutucu={sonuc ? sy(sonuc.egzoz - sonuc.dengeEkE, 0) : ""} onChange={(n) => guncelle({ egzElle: n })} />
          </Alan>
        </div>
      </details>

      <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => tasi(-1)} className="focus-ring text-xs border border-hat rounded-md px-2.5 py-1 text-metin/60 hover:border-soguk">
            ↑ Yukarı
          </button>
          <button type="button" onClick={() => tasi(1)} className="focus-ring text-xs border border-hat rounded-md px-2.5 py-1 text-metin/60 hover:border-soguk">
            ↓ Aşağı
          </button>
          <button type="button" onClick={kopyala} className="focus-ring text-xs border border-hat rounded-md px-2.5 py-1 text-metin/60 hover:border-soguk">
            Kopyala
          </button>
          <button type="button" onClick={sil} className="focus-ring text-xs text-metin/40 hover:text-sicak-dim ml-auto">
            Mahali sil
          </button>
      </div>

      {sonuc && (
        <div className="bg-soguk/5 border border-soguk/30 rounded-lg p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <Ozet ad="Besleme" deger={M3(sonuc.besleme)} alt={sonuc.dengeEk > 1 ? `+${sy(sonuc.dengeEk, 0)} denge` : undefined} vurgu />
            <Ozet ad="Egzoz" deger={M3(sonuc.egzoz)} alt={sonuc.yangin ? `duman ${M3(sonuc.yangin)}` : sonuc.dengeEkE > 1 ? `+${sy(sonuc.dengeEkE, 0)} denge` : undefined} />
            <Ozet ad="Hava değişimi" deger={`${sy(sonuc.ach, 1)} 1/h`} alt={`${sonuc.kisi ? sonuc.kisi + " kişi" : ""}`} />
            <Ozet ad="Basınç" deger={sonuc.basinc === "POZITIF" ? "Pozitif" : sonuc.basinc === "NEGATIF" ? "Negatif" : "Dengeli"} alt={sonuc.basinc === "NEGATIF" ? "koku dışarı çıkmaz" : sonuc.basinc === "POZITIF" ? "fazla hava dışarı akar" : undefined} />
          </div>
          <p className="text-xs text-metin/75 leading-relaxed">{sonuc.aciklama}</p>
          <p className="text-[11px] text-metin/55 mt-1">
            {sonuc.menfezB > 0 && `Besleme uç eleman: ${sonuc.menfezB} adet · `}
            {sonuc.menfezE > 0 && `Egzoz uç eleman: ${sonuc.menfezE} adet · `}
            {sonuc.transferCm2 > 0 && `Geçiş havası (kapı menfezi / kapı altı boşluğu) ≥ ${sy(sonuc.transferCm2, 0)} cm² · `}
            {sonuc.jetFan > 0 && `Jet fan ≈ ${sonuc.jetFan} · CO sensörü ≈ ${sonuc.coSensoru}`}
          </p>
          {sonuc.uyarilar.length > 0 && (
            <ul className="text-xs text-sicak-dim space-y-1 mt-2">
              {sonuc.uyarilar.map((u, i) => (
                <li key={i}>⚠ {u}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// Mahalin nasıl havalandırıldığı ve hangi cihaza bağlandığı (otomatik modda program seçer)
function SistemKarti({
  mahal: m,
  sonuc,
  hesap,
  veri,
  elleDuzenle,
  guncelle,
}: {
  mahal: Mahal;
  sonuc: MahalSonucu | null;
  hesap: HavalandirmaSonucu;
  veri: HavalandirmaVerisi;
  elleDuzenle: () => void;
  guncelle: (p: Partial<Mahal>) => void;
}) {
  const [gerekceAcik, setGerekceAcik] = useState(false);
  // Elle modda programın bu mahal için önereceği cihaz (karşılaştırma için)
  const oneri = useMemo(() => {
    if (veri.otoSistem) return null;
    const o = otomatikSistem(veri);
    const b = o.veri.mahaller.find((x) => x.id === m.id);
    const s = b ? o.veri.santraller.find((x) => x.no === b.santral) : undefined;
    return s ? SANTRAL_TIPLERI[s.tip].ad : "Doğal havalandırma (fan yok)";
  }, [veri, m.id]);
  if (!sonuc) return null;
  const sB = hesap.santraller.find((x) => x.no === sonuc.santral);
  const sE = sonuc.egzozSantral !== sonuc.santral ? hesap.santraller.find((x) => x.no === sonuc.egzozSantral) : undefined;
  const cihaz = (x: SantralSonucu) => `S${x.no} · ${x.ad} — ${x.tipAdi}`;
  return (
    <div className="bg-yuzey border border-soguk/40 rounded-lg p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <h3 className="font-display font-semibold text-metin text-sm">
          Havalandırma sistemi <span className="text-xs font-normal text-metin/50">{veri.otoSistem ? "(program seçti)" : "(elle)"}</span>
        </h3>
        {veri.otoSistem && (
          <button type="button" onClick={elleDuzenle} className="focus-ring text-[11px] border border-hat rounded-md px-2 py-1 text-metin/60 hover:border-soguk" title="Santralleri ve mahal bağlantılarını kendiniz seçmek için">
            Santrali elle seç
          </button>
        )}
      </div>
      <p className="text-[13px] text-metin/80 leading-relaxed">{sonuc.sistemNotu}</p>
      <div className="mt-3 text-[13px] space-y-1">
        {sB ? (
          <p>
            <span className="text-metin/50">{sE ? "Besleme: " : "Bağlı cihaz: "}</span>
            <strong className="text-soguk-dim">{cihaz(sB)}</strong>
          </p>
        ) : (
          <p className="text-metin/60">{sonuc.besleme > 0.5 ? "Besleme: doğal (menfez / panjur), fan yok" : "Mekanik besleme yok"}</p>
        )}
        {sE && (
          <p>
            <span className="text-metin/50">Egzoz: </span>
            <strong className="text-soguk-dim">{cihaz(sE)}</strong>
          </p>
        )}
      </div>
      {veri.otoSistem && sB?.gerekce && (
        <div className="mt-2">
          <button type="button" onClick={() => setGerekceAcik((a) => !a)} className="focus-ring text-[11px] text-soguk-dim hover:underline">
            {gerekceAcik ? "▾" : "▸"} Neden bu cihaz?
          </button>
          {gerekceAcik && <p className="text-[12px] text-metin/65 leading-relaxed mt-1">{sB.gerekce}</p>}
        </div>
      )}
      {veri.otoSistem ? (
        <div className="mt-3 max-w-xs">
          <Alan ad="Bölge (isteğe bağlı)" ipucu="Ayrı cihaz istenen kısımlara aynı adı yazın: “Daire 1”, “Zemin kat dükkân”… Aynı bölgedeki mahaller aynı cihaza bağlanır.">
            <input value={m.bolge} maxLength={40} placeholder="ör. Daire 1" onChange={(e) => guncelle({ bolge: e.target.value })} className={girdi} />
          </Alan>
        </div>
      ) : (
        oneri && <p className="text-[11px] text-metin/50 mt-2">Program önerisi: {oneri}</p>
      )}
    </div>
  );
}

// =============================================================================
// 3. SONUÇLAR
// =============================================================================
function SonuclarSekmesi({ s, mahaleGit }: { s: HavalandirmaSonucu; mahaleGit: (id: string) => void }) {
  return (
    <div className="space-y-5">
      {s.uyarilar.length > 0 && (
        <ul className="text-xs text-sicak-dim bg-sicak/5 border border-sicak/30 rounded-lg p-3 space-y-1">
          {s.uyarilar.map((u, i) => (
            <li key={i}>⚠ {u}</li>
          ))}
        </ul>
      )}
      <Kart baslik="Mahal debileri" aciklama="Denge payı (*): santralde egzoz beslemeden fazlaysa kuru mahallere ek besleme verilir (hava ıslak hacimlere kapı menfezinden akar); konut cihazında ıslak hacimlerin egzozu beslemeye eşitlenir.">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-metin/50 border-b border-hat">
                <th className="py-1.5 pr-2 font-medium">Mahal</th>
                <th className="py-1.5 pr-2 font-medium">Tip</th>
                <th className="py-1.5 pr-2 font-medium text-right">m²</th>
                <th className="py-1.5 pr-2 font-medium text-right">Kişi</th>
                <th className="py-1.5 pr-2 font-medium text-right">Besleme</th>
                <th className="py-1.5 pr-2 font-medium text-right">Egzoz</th>
                <th className="py-1.5 pr-2 font-medium text-right">1/h</th>
                <th className="py-1.5 pr-2 font-medium">Basınç</th>
                <th className="py-1.5 font-medium">S (B/E)</th>
              </tr>
            </thead>
            <tbody>
              {s.mahaller.map((m) => (
                <tr key={m.id} className="border-b border-hat/60">
                  <td className="py-1.5 pr-2">
                    <button type="button" onClick={() => mahaleGit(m.id)} className="focus-ring text-soguk-dim hover:underline text-left">
                      {m.ad}
                    </button>
                    {m.uyarilar.length > 0 && <span className="text-sicak-dim"> ⚠</span>}
                  </td>
                  <td className="py-1.5 pr-2 text-metin/60">{m.tipAdi}</td>
                  <td className="py-1.5 pr-2 text-right">{sy(m.alan)}</td>
                  <td className="py-1.5 pr-2 text-right">{m.kisi || "—"}</td>
                  <td className="py-1.5 pr-2 text-right">
                    {m.besleme ? sy(m.besleme, 0) : "—"}
                    {m.dengeEk > 1 && "*"}
                  </td>
                  <td className="py-1.5 pr-2 text-right">
                    {m.egzoz ? sy(m.egzoz, 0) : "—"}
                    {m.dengeEkE > 1 && "*"}
                  </td>
                  <td className="py-1.5 pr-2 text-right">{sy(m.ach, 1)}</td>
                  <td className="py-1.5 pr-2 text-metin/60">{m.basinc === "POZITIF" ? "+" : m.basinc === "NEGATIF" ? "−" : "0"}</td>
                  <td className="py-1.5 text-metin/60">
                    {m.santral || "—"} / {m.egzozSantral || "—"}
                  </td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-1.5 pr-2">Toplam</td>
                <td />
                <td className="py-1.5 pr-2 text-right">{sy(s.toplamAlan)}</td>
                <td />
                <td className="py-1.5 pr-2 text-right">{sy(s.toplamBesleme, 0)}</td>
                <td className="py-1.5 pr-2 text-right">{sy(s.toplamEgzoz, 0)}</td>
                <td colSpan={3} />
              </tr>
            </tbody>
          </table>
        </div>
        {!s.mahaller.length && <p className="text-sm text-metin/50">Mahal yok.</p>}
      </Kart>
      {s.santraller.map((x) => (
        <SantralKarti key={x.no} x={x} s={s} />
      ))}
    </div>
  );
}

function SantralKarti({ x, s }: { x: SantralSonucu; s: HavalandirmaSonucu }) {
  const mahalAdi = (id: string | null) => s.mahaller.find((m) => m.id === id)?.ad ?? "—";
  return (
    <Kart baslik={`${x.ad} — ${x.tipAdi}`}>
      <p className="text-sm text-metin font-medium mb-1">{x.secim}</p>
      {x.gerekce && <p className="text-[12px] text-metin/60 leading-relaxed mb-3">{x.gerekce}</p>}
      {!x.gerekce && <div className="mb-2" />}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        <Ozet ad="Besleme" deger={M3(x.besleme)} alt={`kademe ${sy(x.nominal, 0)}`} vurgu />
        <Ozet ad="Egzoz" deger={M3(x.egzoz)} alt={x.yangin ? `duman ${M3(x.yangin)}` : undefined} />
        <Ozet ad="Isı geri kazanımı" deger={x.verim ? `%${sy(x.verimEtkin, 0)}` : "—"} alt={x.verim ? `tasarım %${sy(x.verim, 0)}` : undefined} />
        <Ozet ad="Isıtıcı" deger={x.kis.isitici + x.kis.onIsitici > 0 ? `${sy(x.kis.isitici + x.kis.onIsitici, 1)} kW` : "—"} alt={x.kis.onIsitici > 0 ? `ön ısıtıcı ${sy(x.kis.onIsitici, 1)}` : undefined} />
        <Ozet ad="Soğutucu" deger={x.yaz.sogutucu > 0 ? `${sy(x.yaz.sogutucu, 1)} kW` : "—"} alt={x.suSogutucu ? `${sy(x.suSogutucu, 0)} L/h su` : undefined} />
        <Ozet ad="SFP" deger={`${sy(x.sfp, 0)}`} alt={`W/(m³/s) · ${x.sfpSinif}`} />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Tablo
            basliklar={["Değer", "Sonuç"]}
            satirlar={[
              ...(x.verim ? [["Isı geri kazanımı", `kış ${sy(x.kis.geriKazanim, 1)} kW · yaz ${sy(x.yaz.geriKazanim, 1)} kW`]] : []),
              ...(x.besleme > 0 && (x.kis.isitici > 0 || x.kis.onIsitici > 0 || x.verim > 0) ? [["Kış hava yolu", `${sy(x.kis.dis)} °C${x.kis.onIsitici > 0 ? " → ön ısıtıcı" : ""} → eşanjör sonrası ${sy(x.kis.hrSonrasi, 1)} °C → besleme ${sy(x.kis.hedef)} °C`]] : []),
              ...(x.besleme > 0 && (x.yaz.sogutucu > 0 || x.verim > 0) ? [["Yaz hava yolu", `${sy(x.yaz.disKT)} °C → eşanjör sonrası ${sy(x.yaz.hrSonrasi, 1)} °C → besleme ${sy(x.yaz.hedef)} °C`]] : []),
              ...(x.yaz.sogutucu > 0 ? [["Soğutucu yük", `duyulur ${sy(x.yaz.duyulur, 1)} + gizli ${sy(x.yaz.gizli, 1)} kW`]] : []),
              ...(x.suIsitici ? [["Isıtma suyu", `${sy(x.suIsitici, 0)} L/h`]] : []),
              ...(x.suSogutucu ? [["Soğutma suyu", `${sy(x.suSogutucu, 0)} L/h`]] : []),
              ...(x.fanB ? [["Besleme fanı", `${sy(x.fanB.dis, 0)} Pa dış + ${sy(x.fanB.toplam - x.fanB.dis, 0)} Pa iç = ${sy(x.fanB.toplam, 0)} Pa · ${sy(x.fanB.kw, 2)} kW · SFP ${sy(x.fanB.sfp, 0)} (${x.fanB.sinif})`]] : []),
              ...(x.fanE ? [["Egzoz fanı", `${sy(x.fanE.dis, 0)} Pa dış + ${sy(x.fanE.toplam - x.fanE.dis, 0)} Pa iç = ${sy(x.fanE.toplam, 0)} Pa · ${sy(x.fanE.kw, 2)} kW · SFP ${sy(x.fanE.sfp, 0)} (${x.fanE.sinif})`]] : []),
              ["Santral kesiti", `≈ ${sy(x.kesitM2, 2)} m² (2,5 m/s yüz hızı)`],
              ...(x.jetFan ? [["Jet fan / CO sensörü", `${x.jetFan} / ${x.coSensoru} adet (ön tahmin)`]] : []),
            ]}
          />
          {(x.icB.length > 0 || x.icE.length > 0) && (
            <Tablo
              basliklar={["Santral içi kayıp", "Besleme Pa", "Egzoz Pa"]}
              sagdan={[1, 2]}
              satirlar={[...new Set([...x.icB.map((a) => a[0]), ...x.icE.map((a) => a[0])])].map((ad) => [
                ad,
                x.icB.find((a) => a[0] === ad) ? sy(x.icB.find((a) => a[0] === ad)![1], 0) : "—",
                x.icE.find((a) => a[0] === ad) ? sy(x.icE.find((a) => a[0] === ad)![1], 0) : "—",
              ])}
            />
          )}
        </div>
        <div className="space-y-3">
          {[x.agB, x.agE].map(
            (ag) =>
              ag && (
                <div key={ag.tur}>
                  <p className="text-xs font-semibold text-soguk-dim mb-1">
                    {ag.tur === "BESLEME" ? "Besleme" : "Egzoz"} kanalları · kritik hat: {mahalAdi(ag.kritikMahal)} — kanal {sy(ag.kritikKanal, 0)} + uç {sy(ag.kritikUc, 0)} + damper / susturucu {sy(ag.ek, 0)} = {sy(ag.dis, 0)} Pa
                  </p>
                  <Tablo
                    basliklar={["Parça", "Ölçü", "m³/h", "m/s", "Pa/m", "m", "Pa"]}
                    sagdan={[2, 3, 4, 5, 6]}
                    satirlar={ag.parcalar.map((p) => [p.ad, olcuYaz(p), sy(p.debi, 0), sy(p.hiz, 1), sy(p.r, 2), sy(p.uzunluk), sy(p.toplam, 1)])}
                  />
                </div>
              )
          )}
          {!x.agB && !x.agE && <p className="text-xs text-metin/50">Bu santrale kanalla bağlı mahal yok.</p>}
        </div>
      </div>
      {x.uyarilar.length > 0 && (
        <ul className="text-xs text-sicak-dim space-y-1 mt-3">
          {x.uyarilar.map((u, i) => (
            <li key={i}>⚠ {u}</li>
          ))}
        </ul>
      )}
    </Kart>
  );
}

// =============================================================================
// 4. KANAL ŞEMASI
// =============================================================================
type DuzenHedef = { anahtar: string; ad: string; aciklama: string; deger: number; min: number; maks: number; mahalId: string | null; x: number; y: number };

function SemaSekmesi({
  s,
  ad,
  veri,
  santralGuncelle,
  mahalGuncelle,
  mahaleGit,
}: {
  s: HavalandirmaSonucu;
  ad: string;
  veri: HavalandirmaVerisi;
  santralGuncelle: (no: number, p: Partial<Santral>) => void;
  mahalGuncelle: (id: string, p: Partial<Mahal>) => void;
  mahaleGit: (id: string) => void;
}) {
  const [duzen, setDuzen] = useState<DuzenHedef | null>(null);
  const [metin, setMetin] = useState("");
  const kap = useRef<HTMLDivElement>(null);
  const baslik = ad || "Havalandırma projesi";
  const cizimler = useMemo(
    () =>
      s.santraller
        .filter((x) => x.agB || x.agE)
        .map((x) => ({ x, svg: cizimSvg(kanalSemasi(x, s.mahaller, baslik), `${x.ad} kanal şeması`) })),
    [s, baslik]
  );
  // Şemada görünen gövde uzunluğu (araya santrale bağlı olmayan mahal girerse onların mesafesi de eklenir)
  const parcaUzunlugu = (anahtar: string) => {
    for (const x of s.santraller)
      for (const ag of [x.agB, x.agE] as (KanalAgi | null)[]) {
        const p = ag?.parcalar.find((q) => q.etiket === anahtar);
        if (p) return p.uzunluk;
      }
    return null;
  };

  const hedef = (anahtar: string): Omit<DuzenHedef, "x" | "y" | "anahtar"> | null => {
    const [tur, id] = anahtar.split("|");
    if (tur === "anaHat") {
      const st = (veri.otoSistem ? s.santralVerisi : veri.santraller).find((x) => String(x.no) === id);
      if (!st) return null;
      return { ad: `${st.ad} — ana kanal (m)`, aciklama: "Santralden ilk branşmana kanal uzunluğu (besleme ve egzoz ana kanalı için ortak).", deger: st.anaHat, min: 0, maks: 300, mahalId: null };
    }
    const m = veri.mahaller.find((o) => o.id === id);
    if (!m) return null;
    if (tur === "hat") {
      const L = parcaUzunlugu(anahtar) ?? m.hatMesafe;
      return { ad: `${m.ad} — önceki branşmandan ana kanal (m)`, aciklama: "Bir önceki branşmandan bu mahalin branşmanına ana kanal uzunluğu.", deger: L, min: 0, maks: 300, mahalId: id };
    }
    if (tur === "brans") return { ad: `${m.ad} — branşmandan mahale (m)`, aciklama: "Ana kanaldaki ayrılmadan mahaldeki menfeze kanal uzunluğu.", deger: m.bransMesafe, min: 0, maks: 200, mahalId: id };
    return null;
  };

  const uygula = () => {
    if (!duzen) return;
    const n = parseFloat(metin.replace(",", ".").trim());
    if (!Number.isFinite(n)) return;
    const x = Math.round(Math.min(duzen.maks, Math.max(duzen.min, n)) * 100) / 100;
    const [tur, id] = duzen.anahtar.split("|");
    if (tur === "anaHat") santralGuncelle(Number(id), { anaHat: x });
    else if (tur === "hat") {
      const m = veri.mahaller.find((o) => o.id === id);
      // Aradaki (bu ağa bağlı olmayan) mahallerin mesafesi korunur, fark bu mahale yazılır
      if (m) mahalGuncelle(id, { hatMesafe: Math.round(Math.min(300, Math.max(0, m.hatMesafe + (x - duzen.deger))) * 100) / 100 });
    } else if (tur === "brans") mahalGuncelle(id, { bransMesafe: x });
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
      mahaleGit(git);
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

  if (!cizimler.length) return <p className="text-sm text-metin/50">Santrale bağlı mahal yok; önce Mahaller sekmesinde mahalleri bir santrale bağlayın.</p>;
  return (
    <div className="space-y-5">
      <style>{`.sema-kap .dz{cursor:pointer;text-decoration:underline;text-decoration-style:dotted}.sema-kap .dz:hover{fill:#d9480f}.sema-kap .dz-git{cursor:pointer}.sema-kap .dz-git:hover{fill:#1864ab;text-decoration:underline}`}</style>
      <Rehber
        baslik="Kanal şeması"
        adimlar={[
          <>Her santral için tek hat şema: <span className="text-[#1971c2] font-semibold">mavi</span> besleme, <span className="text-[#d9480f] font-semibold">turuncu</span> egzoz. Her parçada kanal ölçüsü (Ø ya da en × yükseklik mm), debi, hız ve uzunluk yazar.</>,
          <><strong>Koyu mavi ölçüler tıklanabilir:</strong> üzerine tıklayıp yeni uzunluğu yazın (Enter). Değer mahalin / santralin girdisine yazılır; Mahaller sekmesindeki alan da değişir, kanal ölçüleri ve fan basıncı yeniden hesaplanır.</>,
          <>Mahal adına tıklarsanız o mahalin ekranı açılır. ★ kritik hat: fanın yenmesi gereken en yüksek basınç kaybı bu mahale giden yoldadır; balans damperleri diğer hatlarda kısılır.</>,
        ]}
      />
      <div ref={kap} className="sema-kap relative space-y-5" onClick={tikla}>
        {cizimler.map(({ x, svg }) => (
          <div key={x.no} className="bg-white border border-hat rounded-lg p-2 overflow-x-auto">
            <div className="min-w-[44rem]" dangerouslySetInnerHTML={{ __html: svg }} />
          </div>
        ))}
        {duzen && (
          <div className="absolute z-30 w-[280px] bg-white border border-soguk rounded-lg shadow-lg p-3" style={{ left: duzen.x, top: duzen.y }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={duzen.ad}>
            <p className="text-xs font-semibold text-metin mb-1">{duzen.ad}</p>
            <p className="text-[11px] text-metin/55 mb-2">{duzen.aciklama}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                uygula();
              }}
              className="flex gap-2"
            >
              <input autoFocus inputMode="decimal" value={metin} onChange={(e) => setMetin(e.target.value)} onKeyDown={(e) => e.key === "Escape" && setDuzen(null)} aria-label={duzen.ad} className={`${girdi} flex-1`} />
              <button type="submit" className="focus-ring bg-soguk text-white px-3 rounded-md text-sm font-medium hover:bg-soguk-dim">
                Tamam
              </button>
            </form>
            <div className="flex justify-between mt-2">
              <button type="button" onClick={() => setDuzen(null)} className="focus-ring text-[11px] text-metin/50 hover:text-metin">
                Vazgeç (Esc)
              </button>
              {duzen.mahalId && (
                <button type="button" onClick={() => mahaleGit(duzen.mahalId!)} className="focus-ring text-[11px] text-soguk-dim hover:underline">
                  Mahali aç →
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
  s: HavalandirmaSonucu;
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
        aciklama="Hesaptan otomatik çıkar (santral / fanlar, kanal m² ve sac kalınlığı, spiro kanal, izolasyon, menfez, damper, susturucu, otopark ve mutfak ekipmanı, test-ayar). Teklife aktarıldıktan sonra teklif ekranında fiyat girilir ve kalem eklenip silinebilir. Metrajlar tahminidir; keşifte kontrol edin."
      >
        {bolumler.map((b) => (
          <div key={b} className="mb-4 last:mb-0">
            <p className="text-xs font-semibold text-soguk-dim uppercase tracking-wide mb-1">{b}</p>
            <Tablo basliklar={["Malzeme", "Miktar", "Birim"]} sagdan={[1]} satirlar={s.malzemeler.filter((m) => m.bolum === b).map((m) => [m.aciklama, sy(m.adet, 2), m.birim])} />
          </div>
        ))}
        {!bolumler.length && <p className="text-sm text-metin/50">Santrale bağlı mahal yok.</p>}
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
          <form action={havalandirmaHesapTeklifeAktar} onSubmit={() => setAktariliyor(true)} className="space-y-3">
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
              <input name="baslik" required maxLength={200} defaultValue={`Havalandırma sistemi — ${ad}`} className={girdi} />
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
