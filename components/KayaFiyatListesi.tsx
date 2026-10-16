"use client";

import { useEffect, useMemo, useState } from "react";
import { kayaFiyatListesiGuncelle, fiyatListesiAyarKaydet, fiyatListesiSecimdenKopyala } from "@/lib/actions";
import KaydetButonu from "@/components/KaydetButonu";
import { DUZENLER, flParaYaz, FIYAT_SORUNUZ } from "@/lib/fiyat-listesi";
import type { KaynakDurum } from "@/lib/kaya-fiyat";

// -----------------------------------------------------------------------------
// OTOMATİK GÜNCELLENEN FİYAT LİSTESİ (Kaya İklimlendirme)
// Ürünler ve fiyatlar Kaya'nın PDF'inden gelir (nakit ve kart fiyatına %5 eklenmiş).
// Burada liste düzenlenmez; müşteriye gönderirken istenmeyen ürünlerin işareti
// kaldırılır ve PDF öyle alınır (kayıtlı liste değişmez). İşaretler bu tarayıcıda
// hatırlanır; Kaya listeyi güncellese de aynı ürünler işaretsiz kalır.
// -----------------------------------------------------------------------------

export type KayaSatir = { id: string; bolum: string; ad: string; aciklama: string | null; fiyat: number; fiyat2: number | null };

const sade = (m: string) =>
  m.toLocaleLowerCase("tr-TR").replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c");
const anahtar = (r: { bolum: string; ad: string }) => sade(`${r.bolum}|${r.ad}`).replace(/\s+/g, " ").trim();
const zaman = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" }).format(
        new Date(iso)
      )
    : "—";
const gun = (ymd: string | null) => (ymd ? ymd.split("-").reverse().join(".") : "—");

export default function KayaFiyatListesi({
  liste,
  durum,
  satirlar,
}: {
  liste: { id: string; baslik: string; aciklama: string; notlar: string; duzen: string; fiyatBaslik: string; fiyat2Baslik: string; paraBirimi: string };
  durum: KaynakDurum;
  satirlar: KayaSatir[];
}) {
  const depo = `kaya-liste-haric:${liste.id}`;
  const [haric, setHaric] = useState<Set<string>>(new Set());
  const [ara, setAra] = useState("");
  const [yuklendi, setYuklendi] = useState(false);

  // Gönderimden çıkarılan ürünler bu tarayıcıda hatırlanır (ürün adına göre; liste yenilense de geçerli)
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

  const gruplar = useMemo(() => {
    const m = new Map<string, KayaSatir[]>();
    for (const r of satirlar) {
      const b = r.bolum || "Diğer";
      if (!m.has(b)) m.set(b, []);
      m.get(b)!.push(r);
    }
    return [...m.entries()];
  }, [satirlar]);

  const kelimeler = sade(ara).split(/\s+/).filter(Boolean);
  const gorunur = (r: KayaSatir) => !kelimeler.length || kelimeler.every((k) => sade(`${r.bolum} ${r.ad}`).includes(k));
  const secili = (r: KayaSatir) => !haric.has(anahtar(r));
  const seciliSayi = satirlar.filter(secili).length;
  const haricIdler = satirlar.filter((r) => !secili(r)).map((r) => r.id);

  const degistir = (rows: KayaSatir[], sec: boolean) =>
    setHaric((h) => {
      const y = new Set(h);
      for (const r of rows) {
        if (sec) y.delete(anahtar(r));
        else y.add(anahtar(r));
      }
      return y;
    });

  const fiyat = (n: number | null) => (n && n > 0 ? flParaYaz(n, liste.paraBirimi) : <span className="text-metin/45 font-sans text-xs">{FIYAT_SORUNUZ}</span>);
  const kutu = "focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white";
  const etiket = "block text-xs font-medium text-metin/60 mb-1";
  const haricInputlari = haricIdler.map((id) => <input key={id} type="hidden" name="haric" value={id} />);

  return (
    <div className="space-y-6">
      {/* KAYNAK BİLGİSİ */}
      <section className="bg-yuzey border border-hat rounded-lg p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 text-sm">
            <p className="font-display font-medium text-metin">↻ Otomatik güncellenen liste</p>
            <p className="text-xs text-metin/60">
              Kaynak: Kaya İklimlendirme fiyat listesi · <strong>nakit ve kart fiyatlarına %5 eklendi</strong> · &quot;Fiyat isteyiniz&quot; ürünlerde{" "}
              &quot;{FIYAT_SORUNUZ}&quot; yazar. Bu bilgiler yalnız panelde görünür; PDF&apos;te Kaya adı geçmez.
            </p>
            <p className="text-xs text-metin/60">
              Kaya liste tarihi: <strong className="text-metin">{gun(durum.listeTarihi)}</strong> · Son güncelleme: {zaman(durum.sonGuncelleme)} · Son kontrol:{" "}
              {zaman(durum.sonKontrol)} · {durum.urunSayisi} ürün{durum.fiyatSorunuz ? ` (${durum.fiyatSorunuz} fiyat sorunuz)` : ""}
            </p>
            <p className="text-[11px] text-metin/45">Her sabah Kaya&apos;nın sitesi kontrol edilir; yeni liste yayınlandıysa fiyatlar kendiliğinden yenilenir ve e-posta gelir.</p>
          </div>
          <form action={kayaFiyatListesiGuncelle}>
            <KaydetButonu basari={null} bekleme="Kaya'dan okunuyor…" className="focus-ring text-sm font-medium border border-soguk text-soguk-dim px-4 py-2 rounded-md hover:bg-soguk-light">
              ↻ Şimdi güncelle
            </KaydetButonu>
          </form>
        </div>
        {durum.hata && (
          <div className="mt-3 bg-sicak-light text-sicak-dim border border-sicak/40 rounded-md p-3 text-xs">
            <strong>Son güncelleme denemesi başarısız ({zaman(durum.hata.zaman)}):</strong> {durum.hata.mesaj} Mevcut liste korunuyor.
          </div>
        )}
        {durum.ozet && (durum.ozet.degisen > 0 || durum.ozet.yeni > 0 || durum.ozet.cikan > 0) && (
          <details className="mt-3 text-xs text-metin/70">
            <summary className="cursor-pointer">
              Son güncellemede: {durum.ozet.degisen} fiyat değişti · {durum.ozet.yeni} yeni ürün · {durum.ozet.cikan} ürün çıktı
            </summary>
            <ul className="mt-2 space-y-0.5 list-disc pl-5">
              {durum.ozet.ornekler.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </details>
        )}
        {durum.atlanan.length > 0 && (
          <details className="mt-2 text-[11px] text-metin/50">
            <summary className="cursor-pointer">Kaya PDF&apos;inde ürün olarak okunmayan {durum.atlanan.length} satır (kontrol için)</summary>
            <ul className="mt-1 space-y-0.5 list-disc pl-5">
              {durum.atlanan.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </details>
        )}
      </section>

      {/* GÖNDERİM */}
      <section className="bg-yuzey border border-hat rounded-lg p-5 space-y-4">
        <div>
          <h2 className="font-display font-medium text-metin">Müşteriye göndermek için PDF</h2>
          <p className="text-xs text-metin/55 mt-0.5">
            Göndermek istemediğiniz ürünlerin işaretini kaldırın; PDF yalnız işaretli ürünlerle çıkar. Kayıtlı liste değişmez, işaretler bu tarayıcıda
            hatırlanır.
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
            <KaydetButonu
              basari={null}
              bekleme="Kopyalanıyor…"
              className="focus-ring text-sm font-medium border border-hat bg-white text-metin/70 px-4 py-2 rounded-md hover:border-soguk"
            >
              ✎ İşaretlilerden düzenlenebilir kopya
            </KaydetButonu>
          </form>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <input value={ara} onChange={(e) => setAra(e.target.value)} placeholder="Ürün ya da bölüm ara…" className="focus-ring border border-hat rounded-md px-3 py-1.5 text-sm bg-white w-64" />
          <button type="button" onClick={() => degistir(satirlar, true)} className="focus-ring text-soguk-dim hover:underline">
            Tümünü işaretle
          </button>
          <button type="button" onClick={() => degistir(satirlar, false)} className="focus-ring text-metin/60 hover:underline">
            Tüm işaretleri kaldır
          </button>
          <span className="text-metin/55">
            {seciliSayi} / {satirlar.length} ürün PDF&apos;e girecek
          </span>
        </div>

        <div className="border border-hat rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zemin text-[11px] uppercase tracking-wider text-metin/55">
              <tr>
                <th className="w-10 py-2" />
                <th className="text-left py-2 px-2 font-semibold">Ürün</th>
                <th className="text-right py-2 px-3 font-semibold whitespace-nowrap">{liste.fiyatBaslik || "Nakit"}</th>
                <th className="text-right py-2 px-3 font-semibold whitespace-nowrap">{liste.fiyat2Baslik || "Kart"}</th>
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
                    <td colSpan={3} className="py-1.5 px-2 text-xs font-semibold text-soguk-dim uppercase tracking-wide">
                      {bolum} <span className="font-normal normal-case text-metin/50">({sec}/{gor.length})</span>
                    </td>
                  </tr>
                  {gor.map((r) => {
                    const s = secili(r);
                    return (
                      <tr key={r.id} className={`border-t border-hat/60 ${s ? "" : "opacity-45"}`}>
                        <td className="py-1.5 text-center">
                          <input type="checkbox" aria-label={r.ad} checked={s} onChange={(e) => degistir([r], e.target.checked)} className="accent-soguk" />
                        </td>
                        <td className="py-1.5 px-2">
                          <span className={s ? "text-metin" : "line-through text-metin/60"}>{r.ad}</span>
                          {r.aciklama && <span className="block text-[11px] text-metin/50">{r.aciklama}</span>}
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono whitespace-nowrap">{fiyat(r.fiyat)}</td>
                        <td className="py-1.5 px-3 text-right font-mono whitespace-nowrap">{fiyat(r.fiyat2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              );
            })}
          </table>
          {!satirlar.length && <p className="text-sm text-metin/50 p-4">Listede ürün yok. &quot;Şimdi güncelle&quot; ile Kaya&apos;dan okuyun.</p>}
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
            <label className={etiket}>Liste sonu notları (opsiyonel) — ödeme, teslim, geçerlilik koşulları</label>
            <textarea name="notlar" rows={3} maxLength={5000} defaultValue={liste.notlar} className={kutu} />
          </div>
          <KaydetButonu basari={null}>Ayarları Kaydet</KaydetButonu>
        </form>
      </details>
    </div>
  );
}
