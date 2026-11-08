"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MontajKalemi } from "@/lib/montaj";

// -----------------------------------------------------------------------------
// TEKLİF FORMU · MONTAJ DAHİL / HARİÇ
// * Hariç: "Montaj" not grubundan "hariç" notu seçilir (yoksa tek tıkla hazır not
//   oluşturulur); teklifte montaj bölümü varsa kaldırılabilir.
// * Dahil: "dahil" notu seçilir ve montaj teklife bölüm olarak eklenir. Kullanıcı
//   seçer: montaj listesinden kalem kalem (ya da tek satır toplam) veya kendi
//   yazdığı tek satır.
// Kalem ve not bileşenleriyle aynı formdaki olaylar üzerinden konuşur:
//   teklif-kalem-ekle {bolum, kalemler, degistir}  · teklif-bolumler {liste}
//   teklif-bolum-sil {bolum}  · teklif-montaj-not {tur, olustur?, sonuc}
// -----------------------------------------------------------------------------

type Durum = "" | "haric" | "dahil";
type Kur = { tarih: string; USD: number; EUR: number } | null;

const GRUPLAR: [string, string][] = [
  ["DU", "Dış ünite montajı"],
  ["IU", "İç ünite montajı"],
  ["BB", "Malzemeli bakır boru ve izolasyon"],
  ["KB", "Kablolama"],
  ["BR", "Branşman"],
  ["SA", "Soğutucu akışkan ve test"],
  ["KU", "Kumanda"],
  ["DA", "Devreye alma"],
];
const grupKodu = (kod: string) => kod.toUpperCase().replace(/^MNT-/, "").split("-")[0];
const VARSAYILAN_BOLUM = "MONTAJ-BAKIR BORU-TEST VE DEVREYE ALMA";
const SARF_ADI = "Bakır boru tesisatı sarf malzeme ve azot testi (%10)";

const sayi = (v: string) => {
  const t = v.trim().replace(/\s/g, "");
  if (!t) return 0;
  const n = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t);
  return Number.isFinite(n) ? n : 0;
};
const para = (n: number, pb: string) =>
  `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${pb === "USD" ? "$" : pb === "EUR" ? "€" : "₺"}`;
const r2 = (n: number) => Math.round(n * 100) / 100;

export default function MontajSecimi({ kalemler, kurlar }: { kalemler: MontajKalemi[]; kurlar: Kur }) {
  const kok = useRef<HTMLDivElement>(null);
  const form = () => kok.current?.closest("form") ?? null;
  const yay = <T extends object>(ad: string, detail: T) => {
    form()?.dispatchEvent(new CustomEvent(ad, { detail }));
    return detail;
  };

  const [durum, setDurum] = useState<Durum>("");
  const [notMesaji, setNotMesaji] = useState<{ tip: "ok" | "yok"; metin: string } | null>(null);
  const [montajBolumleri, setMontajBolumleri] = useState<string[]>([]);
  const [yontem, setYontem] = useState<"liste" | "elle">("liste");
  const [mesaj, setMesaj] = useState<string | null>(null);

  // Teklifin para birimi (formdaki seçim) ve montaj fiyatlarının çevrileceği kur
  const [teklifPb, setTeklifPb] = useState("TRY");
  useEffect(() => {
    const sec = form()?.querySelector<HTMLSelectElement>('select[name="paraBirimi"]');
    if (!sec) return;
    const f = () => setTeklifPb(sec.value);
    f();
    sec.addEventListener("change", f);
    return () => sec.removeEventListener("change", f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const kaynakPb = kalemler[0]?.paraBirimi ?? "USD";
  const tl = (pb: string) => (pb === "TRY" ? 1 : kurlar ? (pb === "USD" ? kurlar.USD : pb === "EUR" ? kurlar.EUR : 0) : 0);
  const otomatikKur = tl(kaynakPb) && tl(teklifPb) ? tl(kaynakPb) / tl(teklifPb) : 0;
  const [kurMetin, setKurMetin] = useState("");
  useEffect(() => {
    setKurMetin(kaynakPb === teklifPb ? "1" : otomatikKur ? String(Number(otomatikKur.toPrecision(6))).replace(".", ",") : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teklifPb, kaynakPb]);
  const kur = kaynakPb === teklifPb ? 1 : sayi(kurMetin);

  // Liste yöntemi
  const [miktar, setMiktar] = useState<Record<string, string>>({});
  const [bolumAdi, setBolumAdi] = useState(VARSAYILAN_BOLUM);
  const [tekSatir, setTekSatir] = useState(true);
  const [sarf, setSarf] = useState(true);
  // Elle yöntem
  const [elle, setElle] = useState({ aciklama: VARSAYILAN_BOLUM, adet: "1", birim: "Adet", fiyat: "" });

  const gruplu = useMemo(() => {
    const m = new Map<string, MontajKalemi[]>();
    for (const k of kalemler) {
      const g = grupKodu(k.kod);
      if (!m.has(g)) m.set(g, []);
      m.get(g)!.push(k);
    }
    const sira = GRUPLAR.map(([g]) => g);
    return [...m.entries()]
      .sort((a, b) => (sira.indexOf(a[0]) + 1 || 99) - (sira.indexOf(b[0]) + 1 || 99))
      .map(([g, l]) => ({ g, ad: GRUPLAR.find((x) => x[0] === g)?.[1] ?? "Diğer", l: l.sort((a, b) => a.kod.localeCompare(b.kod, "tr")) }));
  }, [kalemler]);

  const secilenler = kalemler.filter((k) => sayi(miktar[k.kod] ?? "") > 0);
  const bakirToplam = secilenler.filter((k) => grupKodu(k.kod) === "BB").reduce((a, k) => a + k.fiyat * sayi(miktar[k.kod]), 0);
  const sarfTutar = sarf ? bakirToplam * 0.1 : 0;
  const kaynakToplam = secilenler.reduce((a, k) => a + k.fiyat * sayi(miktar[k.kod]), 0) + sarfTutar;

  // Montaj bölümleri (hariç seçilince kaldırmak için)
  const bolumleriOku = () => {
    const d = yay("teklif-bolumler", { liste: [] as string[] });
    setMontajBolumleri(d.liste.filter((b) => /montaj/i.test(b.toLocaleLowerCase("tr-TR"))));
  };

  const notSec = (tur: "haric" | "dahil", olustur = false) => {
    const d = yay("teklif-montaj-not", { tur, olustur, sonuc: "" as string });
    if (d.sonuc === "yok") setNotMesaji({ tip: "yok", metin: `Notlarda "Montaj" grubunda ${tur === "haric" ? "hariç" : "dahil"} notu yok.` });
    else if (d.sonuc === "olusturuluyor") setNotMesaji({ tip: "ok", metin: "Hazır not oluşturuluyor ve seçiliyor…" });
    else if (d.sonuc) setNotMesaji({ tip: "ok", metin: `Notlarda "${d.sonuc}" seçildi.` });
    else setNotMesaji(null);
  };

  const durumSec = (d: Durum) => {
    setDurum(d);
    setMesaj(null);
    setNotMesaji(null);
    if (d === "haric" || d === "dahil") notSec(d);
    if (d === "haric") bolumleriOku();
  };

  const ekle = (bolum: string, satirlar: { aciklama: string; adet: number; birim: string; birimFiyat: number }[]) => {
    const b = bolum.trim() || VARSAYILAN_BOLUM;
    yay("teklif-kalem-ekle", { bolum: b, kalemler: satirlar, degistir: true });
    setMesaj(`"${b}" bölümü teklife eklendi (aynı adlı bölüm varsa yenilendi). Kalemleri yukarıdan kontrol edin.`);
  };

  const listedenEkle = () => {
    if (!secilenler.length) return setMesaj("Önce en az bir kalemin miktarını yazın.");
    if (!(kur > 0)) return setMesaj("Geçerli bir kur yazın.");
    if (tekSatir) {
      ekle(bolumAdi, [{ aciklama: bolumAdi.trim() || VARSAYILAN_BOLUM, adet: 1, birim: "Adet", birimFiyat: r2(kaynakToplam * kur) }]);
    } else {
      const satirlar = secilenler.map((k) => ({ aciklama: k.ad, adet: sayi(miktar[k.kod]), birim: k.birim, birimFiyat: r2(k.fiyat * kur) }));
      if (sarfTutar > 0) satirlar.push({ aciklama: SARF_ADI, adet: 1, birim: "Adet", birimFiyat: r2(sarfTutar * kur) });
      ekle(bolumAdi, satirlar);
    }
  };

  const elleEkle = () => {
    const f = sayi(elle.fiyat);
    if (!elle.aciklama.trim()) return setMesaj("Açıklama yazın.");
    if (!(f > 0)) return setMesaj("Fiyat yazın.");
    ekle(bolumAdi, [{ aciklama: elle.aciklama.trim(), adet: sayi(elle.adet) || 1, birim: elle.birim || "Adet", birimFiyat: f }]);
  };

  const kutu = "focus-ring border border-hat rounded-md px-2 py-1.5 text-sm bg-white";
  const secenek = (d: Durum, ad: string, alt: string) => (
    <label className={`flex-1 min-w-[10rem] flex items-start gap-2 cursor-pointer rounded-md border px-3 py-2 ${durum === d ? "border-soguk bg-soguk-light/40" : "border-hat bg-white"}`}>
      <input type="radio" name="montajSecimi" checked={durum === d} onChange={() => durumSec(d)} className="accent-soguk mt-1" />
      <span>
        <span className="block text-sm font-semibold text-metin">{ad}</span>
        <span className="block text-[11px] text-metin/55">{alt}</span>
      </span>
    </label>
  );

  return (
    <div
      ref={kok}
      className="border border-hat rounded-lg p-4 mb-4 bg-zemin/40"
      // Bu kutudaki kutucuklarda Enter teklif formunu göndermesin
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") e.preventDefault();
      }}
    >
      <p className="text-sm font-semibold text-metin mb-2">Montaj</p>
      <div className="flex flex-wrap gap-2">
        {secenek("", "Belirtme", "montajla ilgili hiçbir şey eklenmez")}
        {secenek("haric", "Montaj hariç", "notlarda “montaj hariç” seçilir")}
        {secenek("dahil", "Montaj dahil", "montaj teklife bölüm olarak eklenir")}
      </div>

      {notMesaji && (
        <div className={`mt-3 text-xs rounded-md px-3 py-2 border ${notMesaji.tip === "ok" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-300 text-amber-900"}`}>
          {notMesaji.metin}
          {notMesaji.tip === "yok" && (durum === "haric" || durum === "dahil") && (
            <button type="button" onClick={() => notSec(durum, true)} className="focus-ring ml-2 underline font-semibold">
              “Montaj ({durum === "haric" ? "hariç" : "dahil"})” hazır notunu oluştur ve seç
            </button>
          )}
        </div>
      )}

      {durum === "haric" && montajBolumleri.length > 0 && (
        <div className="mt-3 text-xs bg-white border border-hat rounded-md px-3 py-2 space-y-1">
          <p className="text-metin/70">Teklifte montaj bölümü var:</p>
          {montajBolumleri.map((b) => (
            <div key={b} className="flex items-center justify-between gap-2">
              <span className="font-semibold text-metin">{b}</span>
              <button
                type="button"
                onClick={() => {
                  yay("teklif-bolum-sil", { bolum: b });
                  setMontajBolumleri((l) => l.filter((x) => x !== b));
                }}
                className="focus-ring text-sicak-dim hover:underline"
              >
                Bölümü kaldır
              </button>
            </div>
          ))}
        </div>
      )}

      {durum === "dahil" && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="montajYontem" checked={yontem === "liste"} onChange={() => setYontem("liste")} className="accent-soguk" />
              Montaj listemizden seç
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="montajYontem" checked={yontem === "elle"} onChange={() => setYontem("elle")} className="accent-soguk" />
              Kendim yazayım (tek satır)
            </label>
          </div>

          <div className="grid sm:grid-cols-[1fr_auto] gap-2 items-end">
            <label className="text-xs text-metin/60">
              Bölüm adı (teklifte başlık olarak görünür)
              <input value={bolumAdi} onChange={(e) => setBolumAdi(e.target.value)} className={`${kutu} w-full mt-1`} />
            </label>
          </div>

          {yontem === "liste" ? (
            kalemler.length === 0 ? (
              <p className="text-xs text-amber-800">Montaj listesi bulunamadı. Ürün Kataloğu’na MNT- kodlu montaj kalemlerini yükleyin.</p>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto border border-hat rounded-md bg-white">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-zemin text-[10px] uppercase tracking-wider text-metin/50">
                      <tr>
                        <th className="text-left px-3 py-1.5">Kalem</th>
                        <th className="text-right px-2 py-1.5">Birim fiyat</th>
                        <th className="text-right px-3 py-1.5 w-28">Miktar</th>
                      </tr>
                    </thead>
                    {gruplu.map(({ g, ad, l }) => (
                      <tbody key={g}>
                        <tr className="bg-soguk-light/40">
                          <td colSpan={3} className="px-3 py-1 font-semibold text-soguk-dim">
                            {ad}
                          </td>
                        </tr>
                        {l.map((k) => (
                          <tr key={k.kod} className={`border-t border-hat/60 ${sayi(miktar[k.kod] ?? "") > 0 ? "bg-emerald-50/60" : ""}`}>
                            <td className="px-3 py-1">{k.ad}</td>
                            <td className="px-2 py-1 text-right font-mono whitespace-nowrap">
                              {para(k.fiyat, k.paraBirimi)} / {k.birim}
                            </td>
                            <td className="px-3 py-1 text-right">
                              <input
                                inputMode="decimal"
                                value={miktar[k.kod] ?? ""}
                                onChange={(e) => setMiktar((m) => ({ ...m, [k.kod]: e.target.value }))}
                                placeholder="0"
                                aria-label={`${k.ad} miktarı`}
                                className="focus-ring w-20 border border-hat rounded px-2 py-1 text-right text-xs"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    ))}
                  </table>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={sarf} onChange={(e) => setSarf(e.target.checked)} className="accent-soguk" />
                    Bakır boru sarf malzeme + azot testi (%10)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={tekSatir} onChange={(e) => setTekSatir(e.target.checked)} className="accent-soguk" />
                    Teklifte tek satır toplam göster (kalem kalem değil)
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs bg-white border border-hat rounded-md px-3 py-2">
                  <span>
                    Toplam: <strong>{para(kaynakToplam, kaynakPb)}</strong>
                    {sarfTutar > 0 && <span className="text-metin/50"> (sarf %10: {para(sarfTutar, kaynakPb)})</span>}
                  </span>
                  {kaynakPb !== teklifPb && (
                    <span className="flex items-center gap-1">
                      1 {kaynakPb} =
                      <input value={kurMetin} onChange={(e) => setKurMetin(e.target.value)} inputMode="decimal" aria-label="Kur" className="focus-ring w-24 border border-hat rounded px-2 py-1 text-right" />
                      {teklifPb}
                      {kurlar && <span className="text-metin/45">(TCMB {kurlar.tarih})</span>}
                    </span>
                  )}
                  {kaynakPb !== teklifPb && kur > 0 && (
                    <span>
                      → <strong>{para(kaynakToplam * kur, teklifPb)}</strong>
                    </span>
                  )}
                  <button type="button" onClick={listedenEkle} className="focus-ring ml-auto bg-soguk text-white rounded-md px-4 py-1.5 text-sm font-medium hover:bg-soguk-dim">
                    Teklife ekle
                  </button>
                </div>
              </>
            )
          ) : (
            <div className="grid sm:grid-cols-[1fr_80px_100px_130px_auto] gap-2 items-end text-xs text-metin/60">
              <label>
                Açıklama
                <input value={elle.aciklama} onChange={(e) => setElle((s) => ({ ...s, aciklama: e.target.value }))} className={`${kutu} w-full mt-1`} />
              </label>
              <label>
                Miktar
                <input value={elle.adet} onChange={(e) => setElle((s) => ({ ...s, adet: e.target.value }))} inputMode="decimal" className={`${kutu} w-full mt-1 text-right`} />
              </label>
              <label>
                Birim
                <input value={elle.birim} onChange={(e) => setElle((s) => ({ ...s, birim: e.target.value }))} className={`${kutu} w-full mt-1`} />
              </label>
              <label>
                Birim fiyat ({teklifPb})
                <input value={elle.fiyat} onChange={(e) => setElle((s) => ({ ...s, fiyat: e.target.value }))} inputMode="decimal" placeholder="örn. 650" className={`${kutu} w-full mt-1 text-right`} />
              </label>
              <button type="button" onClick={elleEkle} className="focus-ring bg-soguk text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-soguk-dim">
                Teklife ekle
              </button>
            </div>
          )}
        </div>
      )}

      {mesaj && <p className="mt-3 text-xs text-soguk-dim">{mesaj}</p>}
    </div>
  );
}
