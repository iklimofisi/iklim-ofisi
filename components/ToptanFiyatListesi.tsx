"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { fiyatListesiAyarKaydet, fiyatListesiSecimdenKopyala } from "@/lib/actions";
import { toptanPdfOku, toptanListeUygula, toptanKarKaydet } from "@/lib/toptan-actions";
import KaydetButonu from "@/components/KaydetButonu";
import { bildirimGoster } from "@/lib/bildirim";
import { DUZENLER, YUVARLAMALAR, flParaYaz, FIYAT_SORUNUZ } from "@/lib/fiyat-listesi";
import { yuzdeFark } from "@/lib/kaya-fiyat";
import {
  TOPTAN_MARKALAR,
  toptanAnahtar,
  toptanDegisiklikler,
  toptanSatis,
  karOku,
  markaSirala,
  type ToptanDurum,
  type ToptanDegisiklik,
} from "@/lib/toptan-fiyat";
import type { NetsaSonuc } from "@/lib/netsa-ayikla";

// -----------------------------------------------------------------------------
// İKLİMOFİSİ TOPTAN FİYAT LİSTESİ (Netsa: Sakura, Bosch, Carrier — tek liste)
// Her ay Netsa'nın PDF'leri buradan yüklenir; okunan fiyatlar ALIŞ fiyatımızdır ve
// yalnız bu sayfada görünür. Müşteriye giden PDF'te yalnız satış fiyatı (alış + kâr %) çıkar.
// -----------------------------------------------------------------------------

export type ToptanSatir = {
  id: string;
  bolum: string;
  ad: string;
  kod: string | null;
  marka: string;
  aciklama: string | null;
  fiyat: number;
  fiyat2: number | null;
  alis: number | null;
  alis2: number | null;
};

type Okunan = { dosya: string; sonuc: NetsaSonuc };

const sade = (m: string) =>
  m.toLocaleLowerCase("tr-TR").replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c");
const zaman = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" }).format(
        new Date(iso)
      )
    : "—";
const yuzdeYaz = (f: number) => `%${Math.abs(f).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`;

export default function ToptanFiyatListesi({
  liste,
  durum,
  satirlar,
  grupNotlari,
}: {
  liste: { id: string; baslik: string; aciklama: string; notlar: string; duzen: string; fiyatBaslik: string; fiyat2Baslik: string; paraBirimi: string };
  durum: ToptanDurum;
  satirlar: ToptanSatir[];
  grupNotlari: { grup: string; notlar: string; bolum?: boolean }[];
}) {
  const router = useRouter();
  const tl = (n: number | null | undefined) => (n && n > 0 ? flParaYaz(n, liste.paraBirimi) : FIYAT_SORUNUZ);

  // ---------------- PDF YÜKLEME ----------------
  const dosyaRef = useRef<HTMLInputElement>(null);
  const [okunanlar, setOkunanlar] = useState<Okunan[]>([]);
  const [okumaHatalari, setOkumaHatalari] = useState<{ dosya: string; hata: string }[]>([]);
  const [okunuyor, setOkunuyor] = useState<string | null>(null);
  const [karlar, setKarlar] = useState<Record<string, string>>(() =>
    Object.fromEntries(TOPTAN_MARKALAR.map((m) => [m, durum.kar[m] !== undefined ? String(durum.kar[m]).replace(".", ",") : ""]))
  );
  const [yuvarlama, setYuvarlama] = useState(String(durum.yuvarlama));
  const [uygulaHata, setUygulaHata] = useState<string | null>(null);
  const [uygulaniyor, baslat] = useTransition();

  async function dosyalariOku(dosyalar: FileList | null) {
    if (!dosyalar?.length) return;
    setUygulaHata(null);
    const hatalar: { dosya: string; hata: string }[] = [];
    let yeni = [...okunanlar];
    // Her PDF ayrı istekle okunur (sunucuya giden istek boyutu sınırlı)
    for (const f of Array.from(dosyalar)) {
      setOkunuyor(f.name);
      const fd = new FormData();
      fd.append("pdf", f);
      try {
        const r = await toptanPdfOku(fd);
        if (r.basarili) yeni = [...yeni.filter((o) => o.sonuc.marka !== r.sonuc.marka), { dosya: r.dosya, sonuc: r.sonuc }];
        else hatalar.push({ dosya: r.dosya || f.name, hata: r.hata });
      } catch (e) {
        hatalar.push({ dosya: f.name, hata: e instanceof Error ? e.message : "Okunamadı (bağlantı hatası olabilir)." });
      }
    }
    setOkunuyor(null);
    setOkunanlar(markaSirala(yeni.map((o) => ({ ...o, marka: o.sonuc.marka }))).map(({ dosya, sonuc }) => ({ dosya, sonuc })));
    setOkumaHatalari(hatalar);
    if (dosyaRef.current) dosyaRef.current.value = "";
  }

  // Önizleme: yüklenen her marka için mevcut listeye göre değişiklikler (alış fiyatı)
  const onizleme = useMemo(
    () =>
      okunanlar.map((o) => {
        const eski = durum.markalar.find((m) => m.marka === o.sonuc.marka);
        const d = toptanDegisiklikler(eski?.urunler ?? [], o.sonuc.urunler);
        return { ...o, eski, degisiklikler: eski ? d : [] };
      }),
    [okunanlar, durum.markalar]
  );
  // Kârı girilmesi gereken markalar: listede kalacak tüm markalar
  const kalacakMarkalar = markaSirala([
    ...durum.markalar.map((m) => ({ marka: m.marka })),
    ...okunanlar.filter((o) => !durum.markalar.some((m) => m.marka === o.sonuc.marka)).map((o) => ({ marka: o.sonuc.marka })),
  ]).map((m) => m.marka);
  const eksikKar = kalacakMarkalar.filter((m) => karOku(karlar[m]) === null);

  function uygula() {
    setUygulaHata(null);
    baslat(async () => {
      try {
        const r = await toptanListeUygula({ listeId: liste.id, markalar: okunanlar, kar: karlar, yuvarlama });
        if (r.basarili) {
          setOkunanlar([]);
          setOkumaHatalari([]);
          bildirimGoster(r.mesaj);
          router.refresh();
        } else setUygulaHata(r.mesaj);
      } catch (e) {
        setUygulaHata(e instanceof Error ? e.message : "Liste güncellenemedi.");
      }
    });
  }

  // ---------------- GÖNDERİM (ürün seçimi) ----------------
  const depo = `toptan-liste-haric:${liste.id}`;
  const [haric, setHaric] = useState<Set<string>>(new Set());
  const [ara, setAra] = useState("");
  const [yuklendi, setYuklendi] = useState(false);
  const [yalnizDegisen, setYalnizDegisen] = useState(false);
  const [alisGoster, setAlisGoster] = useState(true);

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(depo) || "[]");
      if (Array.isArray(v)) setHaric(new Set(v.filter((x) => typeof x === "string")));
    } catch {
      /* tarayıcı deposu yoksa boş başlar */
    }
    setYuklendi(true);
  }, [depo]);
  useEffect(() => {
    if (!yuklendi) return;
    try {
      localStorage.setItem(depo, JSON.stringify([...haric]));
    } catch {
      /* yazılamazsa yalnız bu oturumda geçerli */
    }
  }, [haric, depo, yuklendi]);

  const anahtar = (r: { marka: string | null; kod: string | null; ad: string }) => toptanAnahtar(r);
  const degisim = useMemo(() => {
    const m = new Map<string, ToptanDegisiklik>();
    for (const d of durum.degisiklikler) if (d.tur !== "CIKAN") m.set(anahtar({ marka: d.marka, kod: d.kod || null, ad: d.ad }), d);
    return m;
  }, [durum.degisiklikler]);
  const cikanlar = durum.degisiklikler.filter((d) => d.tur === "CIKAN");
  const degisiklikGunu = durum.degisiklikTarihi ? zaman(durum.degisiklikTarihi).slice(0, 10) : "";

  const gruplar = useMemo(() => {
    const m = new Map<string, ToptanSatir[]>();
    for (const r of satirlar) {
      const b = r.bolum || "Diğer";
      if (!m.has(b)) m.set(b, []);
      m.get(b)!.push(r);
    }
    return [...m.entries()];
  }, [satirlar]);

  const kelimeler = sade(ara).split(/\s+/).filter(Boolean);
  const gorunur = (r: ToptanSatir) =>
    (!yalnizDegisen || degisim.has(anahtar(r))) && (!kelimeler.length || kelimeler.every((k) => sade(`${r.bolum} ${r.ad} ${r.kod ?? ""}`).includes(k)));
  const secili = (r: ToptanSatir) => !haric.has(anahtar(r));
  const seciliSayi = satirlar.filter(secili).length;
  const haricIdler = satirlar.filter((r) => !secili(r)).map((r) => r.id);
  const degistir = (rows: ToptanSatir[], sec: boolean) =>
    setHaric((h) => {
      const y = new Set(h);
      for (const r of rows) {
        if (sec) y.delete(anahtar(r));
        else y.add(anahtar(r));
      }
      return y;
    });
  const haricInputlari = haricIdler.map((id) => <input key={id} type="hidden" name="haric" value={id} />);

  const fiyatHucre = (n: number | null, d: ToptanDegisiklik | undefined, eskiAlis: number | null, kar: number) => {
    const deger = n && n > 0 ? flParaYaz(n, liste.paraBirimi) : <span className="text-metin/45 font-sans text-xs">{FIYAT_SORUNUZ}</span>;
    if (!d || d.tur !== "DEGISEN" || !eskiAlis || !n) return deger;
    const eski = toptanSatis(eskiAlis, kar, durum.yuvarlama);
    if (eski === n) return deger;
    const f = yuzdeFark(eski, n);
    return (
      <span className="inline-flex flex-col items-end leading-tight">
        <span className="text-[11px] text-metin/40 line-through">{flParaYaz(eski, liste.paraBirimi)}</span>
        <span className="font-semibold">
          {deger}
          {f !== null && (
            <span className={`ml-1 font-sans text-[10px] font-bold ${f > 0 ? "text-amber-700" : "text-emerald-700"}`}>
              {f > 0 ? "▲" : "▼"} {yuzdeYaz(f)}
            </span>
          )}
        </span>
      </span>
    );
  };

  const kutu = "focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white";
  const etiket = "block text-xs font-medium text-metin/60 mb-1";
  const kucukKutu = "focus-ring w-24 border border-hat rounded-md px-2 py-1.5 text-sm bg-white text-right";
  const toplamUrun = durum.markalar.reduce((a, m) => a + m.urunler.length, 0);

  return (
    <div className="space-y-6">
      {/* DURUM */}
      <section className="bg-yuzey border border-hat rounded-lg p-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="text-sm space-y-1">
            <p className="font-display font-medium text-metin">Netsa listelerinden hazırlanan toptan liste</p>
            <p className="text-xs text-metin/60">
              Netsa PDF&apos;indeki nakit ve kredi kartı fiyatları <strong>alış fiyatınızdır</strong>; yalnız bu sayfada görünür. Müşteriye giden PDF&apos;te
              yalnız satış fiyatı (alış + kâr %) çıkar; Netsa adı ve bayi bilgileri geçmez.
            </p>
            <p className="text-xs text-metin/60">
              {toplamUrun} ürün · son güncelleme {zaman(durum.sonGuncelleme)}
            </p>
          </div>
        </div>
        {durum.markalar.length > 0 ? (
          <div className="grid sm:grid-cols-3 gap-2">
            {durum.markalar.map((m) => (
              <div key={m.marka} className="border border-hat rounded-md px-3 py-2 text-xs bg-white">
                <p className="font-semibold text-metin text-sm">{m.marka}</p>
                <p className="text-metin/60">
                  Liste tarihi <strong className="text-metin">{m.tarih || "—"}</strong> · {m.urunler.length} ürün
                </p>
                <p className="text-metin/60">
                  Kâr <strong className="text-metin">%{(durum.kar[m.marka] ?? 0).toLocaleString("tr-TR")}</strong> · yüklendi {zaman(m.yuklenme)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-metin/60">Henüz liste yüklenmedi. Aşağıdan Netsa&apos;nın Sakura, Bosch ve Carrier PDF&apos;lerini yükleyin.</p>
        )}
        {cikanlar.length > 0 && (
          <details className="text-xs text-metin/70">
            <summary className="cursor-pointer">
              {degisiklikGunu} güncellemesinde listeden çıkan {cikanlar.length} ürün
            </summary>
            <ul className="mt-2 space-y-0.5 list-disc pl-5">
              {cikanlar.map((o, i) => (
                <li key={i}>
                  {o.marka} · {o.ad} {o.kod && <span className="text-metin/45">({o.kod})</span>}
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      {/* PDF YÜKLEME */}
      <section className="bg-yuzey border border-hat rounded-lg p-5 space-y-4">
        <div>
          <h2 className="font-display font-medium text-metin">Yeni ay listelerini yükle</h2>
          <p className="text-xs text-metin/55 mt-0.5">
            Netsa&apos;nın Sakura, Bosch ve Carrier PDF&apos;lerini seçin (birini ya da üçünü birden). Önce önizleme çıkar; &quot;Listeyi güncelle&quot;ye basmadan
            hiçbir şey değişmez. Yalnız yüklediğiniz markaların ürünleri yenilenir.
          </p>
        </div>
        <input
          ref={dosyaRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          disabled={!!okunuyor || uygulaniyor}
          onChange={(e) => dosyalariOku(e.target.files)}
          className="block text-sm text-metin/70 file:mr-3 file:rounded-md file:border file:border-soguk file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-soguk-dim hover:file:bg-soguk-light"
        />
        {okunuyor && <p className="text-sm text-soguk-dim">Okunuyor: {okunuyor}…</p>}
        {okumaHatalari.map((h, i) => (
          <p key={i} className="text-sm bg-sicak-light border border-sicak/40 text-sicak-dim rounded-md px-3 py-2">
            ⚠ {h.dosya}: {h.hata}
          </p>
        ))}

        {onizleme.length > 0 && (
          <div className="space-y-3">
            {onizleme.map((o) => {
              const say = (t: ToptanDegisiklik["tur"]) => o.degisiklikler.filter((d) => d.tur === t).length;
              const kar = karOku(karlar[o.sonuc.marka]);
              return (
                <div key={o.sonuc.marka} className="border border-hat rounded-md p-3 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm">
                      <strong>{o.sonuc.marka}</strong> · {o.sonuc.tarih || "tarih okunamadı"} · {o.sonuc.urunler.length} ürün
                      <span className="text-metin/45 text-xs"> ({o.dosya})</span>
                    </p>
                    <button type="button" onClick={() => setOkunanlar((l) => l.filter((x) => x.sonuc.marka !== o.sonuc.marka))} className="focus-ring text-xs text-metin/50 hover:text-sicak-dim">
                      Çıkar
                    </button>
                  </div>
                  <p className="text-xs text-metin/60 mt-1">
                    {o.eski
                      ? `Mevcut liste (${o.eski.tarih || "—"}, ${o.eski.urunler.length} ürün) ile karşılaştırma: ${say("DEGISEN")} ürünün fiyatı değişti · ${say("YENI")} yeni · ${say("CIKAN")} çıkan.`
                      : "Bu marka listede ilk kez yer alacak."}
                    {o.eski && o.eski.tarih === o.sonuc.tarih && " Dikkat: liste tarihi mevcut listeyle aynı."}
                  </p>
                  {o.sonuc.uyarilar.length > 0 && (
                    <ul className="mt-1 text-xs text-amber-800 list-disc pl-5">
                      {o.sonuc.uyarilar.map((u, i) => (
                        <li key={i}>{u}</li>
                      ))}
                    </ul>
                  )}
                  {o.degisiklikler.length > 0 && (
                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer text-soguk-dim">Değişiklikleri göster</summary>
                      <table className="w-full mt-2">
                        <thead className="text-[10px] uppercase tracking-wider text-metin/50">
                          <tr>
                            <th className="text-left py-1">Ürün</th>
                            <th className="text-right py-1 px-2">Alış nakit</th>
                            <th className="text-right py-1 px-2">Alış K.Kartı</th>
                            <th className="text-right py-1 px-2">Yeni satış nakit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {o.degisiklikler.map((d, i) => {
                            const f = yuzdeFark(d.eski, d.yeni);
                            return (
                              <tr key={i} className="border-t border-hat/60 align-top">
                                <td className="py-1">
                                  <span className={`mr-1 rounded px-1 text-[10px] font-semibold ${d.tur === "YENI" ? "bg-emerald-100 text-emerald-800" : d.tur === "CIKAN" ? "bg-sicak-light text-sicak-dim" : "bg-amber-100 text-amber-800"}`}>
                                    {d.tur === "YENI" ? "YENİ" : d.tur === "CIKAN" ? "ÇIKAN" : "DEĞİŞTİ"}
                                  </span>
                                  {d.ad} {d.kod && <span className="text-metin/45">({d.kod})</span>}
                                </td>
                                <td className="py-1 px-2 text-right font-mono whitespace-nowrap">
                                  {d.tur === "DEGISEN" && <span className="text-metin/40 line-through mr-1">{tl(d.eski)}</span>}
                                  {d.tur === "CIKAN" ? tl(d.eski) : tl(d.yeni)}
                                  {f !== null && d.tur === "DEGISEN" && <span className={`ml-1 font-sans font-bold ${f > 0 ? "text-amber-700" : "text-emerald-700"}`}>{f > 0 ? "▲" : "▼"} {yuzdeYaz(f)}</span>}
                                </td>
                                <td className="py-1 px-2 text-right font-mono whitespace-nowrap">
                                  {d.tur === "DEGISEN" && <span className="text-metin/40 line-through mr-1">{tl(d.eski2)}</span>}
                                  {d.tur === "CIKAN" ? tl(d.eski2) : tl(d.yeni2)}
                                </td>
                                <td className="py-1 px-2 text-right font-mono whitespace-nowrap">
                                  {d.tur !== "CIKAN" && d.yeni && kar !== null ? tl(toptanSatis(d.yeni, kar, Number(yuvarlama))) : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </details>
                  )}
                </div>
              );
            })}

            <div className="border border-soguk/30 bg-soguk-light/30 rounded-md p-3 space-y-3">
              <p className="text-xs text-metin/70">
                Satış fiyatı = alış fiyatı + kâr %. Nakit ve kredi kartı fiyatına aynı kâr uygulanır. Kâr oranları sonradan da değiştirilebilir.
              </p>
              <div className="flex flex-wrap items-end gap-4">
                {kalacakMarkalar.map((m) => (
                  <label key={m} className="text-xs text-metin/60">
                    <span className="block mb-1 font-medium">{m} kâr %</span>
                    <input
                      value={karlar[m] ?? ""}
                      onChange={(e) => setKarlar((k) => ({ ...k, [m]: e.target.value }))}
                      inputMode="decimal"
                      placeholder="örn. 15"
                      className={`${kucukKutu} ${karOku(karlar[m]) === null ? "border-sicak/60" : ""}`}
                    />
                  </label>
                ))}
                <label className="text-xs text-metin/60">
                  <span className="block mb-1 font-medium">Yuvarlama</span>
                  <select value={yuvarlama} onChange={(e) => setYuvarlama(e.target.value)} className="focus-ring border border-hat rounded-md px-2 py-1.5 text-sm bg-white">
                    {YUVARLAMALAR.map((y) => (
                      <option key={y.adim} value={y.adim}>
                        {y.adim === 0 ? "Tam liraya" : y.ad}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={uygula}
                  disabled={uygulaniyor || !!okunuyor || eksikKar.length > 0}
                  className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim disabled:opacity-50"
                >
                  {uygulaniyor ? "Güncelleniyor…" : "Listeyi güncelle"}
                </button>
              </div>
              {eksikKar.length > 0 && <p className="text-xs text-sicak-dim">Kâr oranı girilmeyen marka: {eksikKar.join(", ")}.</p>}
              {uygulaHata && <p className="text-sm bg-sicak-light border border-sicak/40 text-sicak-dim rounded-md px-3 py-2">⚠ {uygulaHata}</p>}
            </div>
          </div>
        )}
      </section>

      {/* KÂR ORANLARI (PDF yüklemeden) */}
      {durum.markalar.length > 0 && (
        <section className="bg-yuzey border border-hat rounded-lg p-5">
          <h2 className="font-display font-medium text-metin">Kâr oranları</h2>
          <p className="text-xs text-metin/55 mt-0.5 mb-3">Değiştirip kaydedince satış fiyatları kayıtlı alış fiyatlarından yeniden hesaplanır.</p>
          <form key={`${JSON.stringify(durum.kar)}|${durum.yuvarlama}`} action={toptanKarKaydet} className="flex flex-wrap items-end gap-4">
            <input type="hidden" name="listeId" value={liste.id} />
            {durum.markalar.map((m) => (
              <label key={m.marka} className="text-xs text-metin/60">
                <span className="block mb-1 font-medium">{m.marka} kâr %</span>
                <input
                  name={`kar_${m.marka}`}
                  required
                  inputMode="decimal"
                  defaultValue={durum.kar[m.marka] !== undefined ? String(durum.kar[m.marka]).replace(".", ",") : ""}
                  className={kucukKutu}
                />
              </label>
            ))}
            <label className="text-xs text-metin/60">
              <span className="block mb-1 font-medium">Yuvarlama</span>
              <select name="yuvarlama" defaultValue={String(durum.yuvarlama)} className="focus-ring border border-hat rounded-md px-2 py-1.5 text-sm bg-white">
                {YUVARLAMALAR.map((y) => (
                  <option key={y.adim} value={y.adim}>
                    {y.adim === 0 ? "Tam liraya" : y.ad}
                  </option>
                ))}
              </select>
            </label>
            <KaydetButonu basari={null} bekleme="Hesaplanıyor…">
              Fiyatları yeniden hesapla
            </KaydetButonu>
          </form>
        </section>
      )}

      {/* GÖNDERİM */}
      <section className="bg-yuzey border border-hat rounded-lg p-5 space-y-4">
        <div>
          <h2 className="font-display font-medium text-metin">Müşteriye göndermek için PDF</h2>
          <p className="text-xs text-metin/55 mt-0.5">
            Göndermek istemediğiniz ürünlerin işaretini kaldırın; PDF yalnız işaretli ürünlerle ve yalnız satış fiyatlarıyla çıkar. Alış fiyatları PDF&apos;e
            girmez. İşaretler bu tarayıcıda hatırlanır.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form action={`/api/fiyat-listesi/${liste.id}/pdf`} method="post" target="_blank">
            {haricInputlari}
            <button type="submit" disabled={!seciliSayi} className="focus-ring text-sm font-medium border border-hat bg-white text-metin/70 px-4 py-2 rounded-md hover:border-soguk disabled:opacity-40">
              📄 PDF Görüntüle
            </button>
          </form>
          <form action={`/api/fiyat-listesi/${liste.id}/pdf`} method="post">
            {haricInputlari}
            <input type="hidden" name="indir" value="1" />
            <button type="submit" disabled={!seciliSayi} className="focus-ring text-sm font-medium bg-soguk text-white px-4 py-2 rounded-md hover:bg-soguk-dim disabled:opacity-40">
              ⬇ PDF İndir ({seciliSayi} ürün)
            </button>
          </form>
          <form action={fiyatListesiSecimdenKopyala}>
            <input type="hidden" name="listeId" value={liste.id} />
            {haricInputlari}
            <KaydetButonu basari={null} bekleme="Kopyalanıyor…" className="focus-ring text-sm font-medium border border-hat bg-white text-metin/70 px-4 py-2 rounded-md hover:border-soguk">
              ✎ İşaretlilerden düzenlenebilir kopya
            </KaydetButonu>
          </form>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <input value={ara} onChange={(e) => setAra(e.target.value)} placeholder="Ürün, model kodu ya da bölüm ara…" className="focus-ring border border-hat rounded-md px-3 py-1.5 text-sm bg-white w-64" />
          <button type="button" onClick={() => degistir(satirlar, true)} className="focus-ring text-soguk-dim hover:underline">
            Tümünü işaretle
          </button>
          <button type="button" onClick={() => degistir(satirlar, false)} className="focus-ring text-metin/60 hover:underline">
            Tüm işaretleri kaldır
          </button>
          <span className="text-metin/55">
            {seciliSayi} / {satirlar.length} ürün PDF&apos;e girecek
          </span>
          <label className="inline-flex items-center gap-1.5 text-metin/60 cursor-pointer">
            <input type="checkbox" checked={alisGoster} onChange={(e) => setAlisGoster(e.target.checked)} className="accent-soguk" />
            Alış fiyatlarını göster
          </label>
          {degisim.size > 0 && (
            <label className="inline-flex items-center gap-1.5 text-amber-800 cursor-pointer">
              <input type="checkbox" checked={yalnizDegisen} onChange={(e) => setYalnizDegisen(e.target.checked)} className="accent-amber-600" />
              Yalnız {degisiklikGunu} tarihinde değişen {degisim.size} ürünü göster
            </label>
          )}
        </div>

        <div className="border border-hat rounded-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zemin text-[11px] uppercase tracking-wider text-metin/55">
              <tr>
                <th className="w-10 py-2" />
                <th className="text-left py-2 px-2 font-semibold">Ürün</th>
                {alisGoster && <th className="text-right py-2 px-3 font-semibold whitespace-nowrap text-metin/40">Alış (Nakit / K.Kartı)</th>}
                <th className="text-right py-2 px-3 font-semibold whitespace-nowrap">{liste.fiyatBaslik || "Nakit"}</th>
                <th className="text-right py-2 px-3 font-semibold whitespace-nowrap">{liste.fiyat2Baslik || "Kredi Kartı"}</th>
              </tr>
            </thead>
            {gruplar.map(([bolum, rows]) => {
              const gor = rows.filter(gorunur);
              if (!gor.length) return null;
              const sec = gor.filter(secili).length;
              return (
                <tbody key={bolum}>
                  <tr className="bg-soguk-light/50 border-t border-hat">
                    <td className="py-1.5 text-center">
                      <input
                        type="checkbox"
                        aria-label={`${bolum} bölümünün tamamı`}
                        checked={sec === gor.length}
                        ref={(el) => {
                          if (el) el.indeterminate = sec > 0 && sec < gor.length;
                        }}
                        onChange={(e) => degistir(gor, e.target.checked)}
                        className="accent-soguk"
                      />
                    </td>
                    <td colSpan={alisGoster ? 4 : 3} className="py-1.5 px-2 text-xs font-semibold text-soguk-dim uppercase tracking-wide">
                      {bolum} <span className="font-normal normal-case text-metin/50">({sec}/{gor.length})</span>
                    </td>
                  </tr>
                  {gor.map((r) => {
                    const s = secili(r);
                    const d = degisim.get(anahtar(r));
                    const kar = durum.kar[r.marka] ?? 0;
                    return (
                      <tr key={r.id} className={`border-t border-hat/60 ${s ? "" : "opacity-45"}`}>
                        <td className="py-1.5 text-center">
                          <input type="checkbox" aria-label={r.ad} checked={s} onChange={(e) => degistir([r], e.target.checked)} className="accent-soguk" />
                        </td>
                        <td className="py-1.5 px-2">
                          <span className={s ? "text-metin" : "line-through text-metin/60"}>{r.ad}</span>
                          {d && (
                            <span
                              title={`${degisiklikGunu} güncellemesinde`}
                              className={`ml-2 inline-block rounded px-1.5 text-[10px] font-semibold align-middle ${
                                d.tur === "YENI" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {d.tur === "YENI" ? "YENİ ÜRÜN" : "FİYAT DEĞİŞTİ"}
                            </span>
                          )}
                          {r.kod && <span className="block text-[11px] text-metin/55 font-mono">{r.kod}</span>}
                          {r.aciklama && <span className="block text-[11px] text-metin/50">{r.aciklama}</span>}
                        </td>
                        {alisGoster && (
                          <td className="py-1.5 px-3 text-right font-mono whitespace-nowrap text-[12px] text-metin/45">
                            {tl(r.alis)}
                            <br />
                            {tl(r.alis2)}
                            <span className="block font-sans text-[10px]">kâr %{kar.toLocaleString("tr-TR")}</span>
                          </td>
                        )}
                        <td className="py-1.5 px-3 text-right font-mono whitespace-nowrap">{fiyatHucre(r.fiyat, d, d?.eski ?? null, kar)}</td>
                        <td className="py-1.5 px-3 text-right font-mono whitespace-nowrap">{fiyatHucre(r.fiyat2, d, d?.eski2 ?? null, kar)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              );
            })}
          </table>
          {!satirlar.length && <p className="text-sm text-metin/50 p-4">Listede ürün yok. Yukarıdan Netsa PDF&apos;lerini yükleyin.</p>}
        </div>
      </section>

      {/* GÖRÜNÜM AYARLARI */}
      <details className="bg-yuzey border border-hat rounded-lg p-5">
        <summary className="cursor-pointer font-display font-medium text-metin">PDF başlığı, açıklama ve notlar</summary>
        <form action={fiyatListesiAyarKaydet} className="space-y-3 mt-4">
          <input type="hidden" name="listeId" value={liste.id} />
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className={etiket}>Liste adı (PDF başlığı) *</label>
              <input name="baslik" required maxLength={200} defaultValue={liste.baslik} className={kutu} />
            </div>
            <div>
              <label className={etiket}>Görünüm</label>
              <select name="duzen" defaultValue={liste.duzen} className={kutu}>
                {DUZENLER.map((d) => (
                  <option key={d.kod} value={d.kod}>
                    {d.ad}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={etiket}>Açıklama (başlığın altında görünür, opsiyonel)</label>
            <textarea name="aciklama" rows={2} maxLength={3000} defaultValue={liste.aciklama} className={kutu} />
          </div>
          <div>
            <label className={etiket}>Kendi notlarınız (opsiyonel) — ödeme, teslim, geçerlilik koşulları; PDF&apos;in sonunda genel notlar olarak çıkar</label>
            <textarea name="notlar" rows={3} maxLength={5000} defaultValue={liste.notlar} className={kutu} />
          </div>
          <KaydetButonu basari={null}>Ayarları Kaydet</KaydetButonu>
        </form>
        {grupNotlari.length > 0 && (
          <details className="mt-4 text-xs text-metin/65">
            <summary className="cursor-pointer">PDF&apos;lerden alınan ürün grubu notları (her yüklemede yenilenir)</summary>
            <p className="mt-2 text-[11px] text-metin/45">
              Netsa PDF&apos;indeki gibi: bölüme ait not o bölümün tablosunun hemen altında, sayfanın notları da ürün grubunun son bölümünün altında
              çıkar. PDF&apos;e yalnız seçtiğiniz ürünlerin notları girer.
            </p>
            {grupNotlari.map((m) => (
              <div key={`${m.bolum ? "b" : "g"}:${m.grup}`} className={m.bolum ? "mt-2 pl-4" : "mt-3"}>
                <p className={m.bolum ? "text-metin/80" : "font-semibold text-metin"}>{m.bolum ? `${m.grup} (bölümün altında)` : `${m.grup} (grubun sonunda)`}</p>
                <ul className="mt-1 space-y-1 list-disc pl-5">
                  {m.notlar.split("\n").map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            ))}
          </details>
        )}
      </details>
    </div>
  );
}
