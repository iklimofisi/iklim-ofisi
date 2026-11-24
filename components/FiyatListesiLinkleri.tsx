"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fiyatListesiLinkOlustur, fiyatListesiLinkIptal, fiyatListesiLinkUrunleri } from "@/lib/fiyat-paylasim-actions";
import KaydetButonu from "@/components/KaydetButonu";
import { bildirimGoster } from "@/lib/bildirim";
import { onayIste, uyariGoster } from "@/lib/onay";
import { whatsappLinki } from "@/lib/gorusme";

// Fiyat listesi sayfasında "Müşteri linkleri" bölümü.
// Her kişiye ayrı link: kim kaç kez açtı görülür, istenen kişinin linki tek başına iptal edilir.
// Link listenin O ANKİ hâlini gösterir: fiyat kaydedildiği an müşteri de yeni fiyatı görür.
export type FiyatLinki = {
  id: string;
  alici: string;
  link: string;
  olusturma: string;
  olusturanAdi: string;
  goruntulenme: number;
  sonGoruntulenme: string | null;
  haric: string[]; // bu linkte gösterilmeyen ürünlerin anahtarları
};

export type LinkUrunu = { anahtar: string; bolum: string; ad: string; kod: string | null };

const sade = (m: string) =>
  m.toLocaleLowerCase("tr-TR").replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c");

// ÜRÜN SEÇİMİ: işareti kaldırılan ürün linkte görünmez (form "haric" alanlarıyla gönderilir)
function UrunSecimi({ urunler, haric, setHaric }: { urunler: LinkUrunu[]; haric: Set<string>; setHaric: (h: Set<string>) => void }) {
  const [ara, setAra] = useState("");
  const gruplar = useMemo(() => {
    const m = new Map<string, LinkUrunu[]>();
    for (const u of urunler) {
      const b = u.bolum || "Diğer";
      if (!m.has(b)) m.set(b, []);
      m.get(b)!.push(u);
    }
    return [...m.entries()];
  }, [urunler]);
  const kelimeler = sade(ara).split(/\s+/).filter(Boolean);
  const gorunur = (u: LinkUrunu) => !kelimeler.length || kelimeler.every((k) => sade(`${u.bolum} ${u.ad} ${u.kod ?? ""}`).includes(k));
  const degistir = (liste: LinkUrunu[], sec: boolean) => {
    const y = new Set(haric);
    for (const u of liste) {
      if (sec) y.delete(u.anahtar);
      else y.add(u.anahtar);
    }
    setHaric(y);
  };
  const seciliSayi = urunler.filter((u) => !haric.has(u.anahtar)).length;
  return (
    <div className="border border-hat rounded-md bg-white">
      <div className="flex flex-wrap items-center gap-2 p-2 border-b border-hat">
        <input
          value={ara}
          onChange={(e) => setAra(e.target.value)}
          placeholder="Ürün ara…"
          className="focus-ring flex-1 min-w-[150px] border border-hat rounded-md px-2.5 py-1.5 text-xs"
        />
        <button type="button" onClick={() => degistir(urunler.filter(gorunur), true)} className="focus-ring text-xs text-soguk-dim hover:underline">
          {kelimeler.length ? "Bulunanları seç" : "Tümünü seç"}
        </button>
        <button type="button" onClick={() => degistir(urunler.filter(gorunur), false)} className="focus-ring text-xs text-sicak-dim hover:underline">
          {kelimeler.length ? "Bulunanları kaldır" : "Hiçbirini seçme"}
        </button>
        <span className="text-xs text-metin/55 ml-auto">
          {seciliSayi} / {urunler.length} ürün linkte
        </span>
      </div>
      <div className="max-h-72 overflow-y-auto p-2 space-y-2">
        {gruplar.map(([bolum, liste]) => {
          const gor = liste.filter(gorunur);
          if (!gor.length) return null;
          const hepsi = gor.every((u) => !haric.has(u.anahtar));
          return (
            <div key={bolum}>
              <label className="flex items-center gap-2 text-xs font-semibold text-metin/70 bg-zemin rounded px-2 py-1">
                <input type="checkbox" checked={hepsi} onChange={(e) => degistir(gor, e.target.checked)} className="accent-soguk" />
                {bolum}
              </label>
              <div className="pl-5 pt-1 grid sm:grid-cols-2 gap-x-4 gap-y-0.5">
                {gor.map((u) => (
                  <label key={u.anahtar} className="flex items-start gap-2 text-xs text-metin/80 py-0.5">
                    <input type="checkbox" checked={!haric.has(u.anahtar)} onChange={(e) => degistir([u], e.target.checked)} className="accent-soguk mt-0.5" />
                    <span>
                      {u.ad}
                      {u.kod && <span className="text-metin/40 font-mono"> · {u.kod}</span>}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const haricInputlari = (h: Set<string>) => [...h].map((a) => <input key={a} type="hidden" name="haric" value={a} />);

// Var olan linkte ürünleri değiştir (adres aynı kalır). Seçici yalnız açılınca yüklenir.
function LinkUrunDuzenle({ l, urunler }: { l: FiyatLinki; urunler: LinkUrunu[] }) {
  const [acik, setAcik] = useState(false);
  const [haric, setHaric] = useState<Set<string>>(() => new Set(l.haric));
  if (!acik)
    return (
      <button type="button" onClick={() => setAcik(true)} className="focus-ring text-xs text-soguk-dim px-2 py-1.5 hover:underline">
        Ürünleri seç
      </button>
    );
  return (
    <form action={fiyatListesiLinkUrunleri} className="basis-full space-y-2 pt-1">
      <input type="hidden" name="id" value={l.id} />
      {haricInputlari(haric)}
      <UrunSecimi urunler={urunler} haric={haric} setHaric={setHaric} />
      <div className="flex items-center gap-3">
        <KaydetButonu basari={null} bekleme="Kaydediliyor…" className="focus-ring bg-soguk text-white px-4 py-1.5 rounded-md text-xs font-medium hover:bg-soguk-dim">
          Seçimi kaydet
        </KaydetButonu>
        <button type="button" onClick={() => setAcik(false)} className="focus-ring text-xs text-metin/55 hover:underline">
          Vazgeç
        </button>
      </div>
    </form>
  );
}

// Yeni link formu: ürün seçimi isteğe bağlı; "Ürün seçerek PDF al" kutusundaki işaretlerle başlar
function YeniLinkFormu({ listeId, urunler }: { listeId: string; urunler: LinkUrunu[] }) {
  const [secimAcik, setSecimAcik] = useState(false);
  const [haric, setHaric] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(`liste-haric:${listeId}`) || "[]");
      if (Array.isArray(v)) {
        const mevcut = new Set(urunler.map((u) => u.anahtar));
        setHaric(new Set(v.filter((x): x is string => typeof x === "string" && mevcut.has(x))));
      }
    } catch {
      /* tarayıcı deposu yoksa tüm ürünlerle başlar */
    }
  }, [listeId, urunler]);
  const gizli = urunler.filter((u) => haric.has(u.anahtar)).length;
  return (
    <form action={fiyatListesiLinkOlustur} className="space-y-2 mb-2">
      <input type="hidden" name="listeId" value={listeId} />
      {haricInputlari(haric)}
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-metin/60 mb-1">Kime gönderilecek?</label>
          <input name="alici" maxLength={120} placeholder="örn. ABC Yapı · Ahmet Bey" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white" />
        </div>
        <button type="button" onClick={() => setSecimAcik((x) => !x)} className="focus-ring text-sm border border-hat bg-white px-3 py-2 rounded-md hover:border-soguk">
          ☑ {gizli ? `${urunler.length - gizli} / ${urunler.length} ürün` : "Tüm ürünler"} ▾
        </button>
        <KaydetButonu
          basari={null}
          bekleme="Oluşturuluyor…"
          className="focus-ring bg-soguk text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
        >
          + Link oluştur
        </KaydetButonu>
      </div>
      {secimAcik && (
        <>
          <p className="text-[11px] text-metin/55">Göndermek istemediğiniz ürünlerin işaretini kaldırın; o ürünler bu linkte hiç görünmez.</p>
          <UrunSecimi urunler={urunler} haric={haric} setHaric={setHaric} />
        </>
      )}
    </form>
  );
}

function LinkSatiri({ l, baslik, firma, urunler, izin }: { l: FiyatLinki; baslik: string; firma: string; urunler: LinkUrunu[]; izin: boolean }) {
  const iptalOnaylandi = useRef(false);
  const mesaj = `Merhaba${l.alici ? ` ${l.alici}` : ""},\n\n${firma} güncel "${baslik}" fiyat listemizi aşağıdaki bağlantıdan inceleyebilirsiniz. Bu link her zaman güncel fiyatları gösterir:\n${l.link}\n\nİyi çalışmalar dileriz.`;
  const kopyala = async () => {
    try {
      await navigator.clipboard.writeText(l.link);
      bildirimGoster("Link kopyalandı.");
    } catch {
      await uyariGoster("Link otomatik kopyalanamadı. Aşağıdaki linki seçip kopyalayın (Ctrl+C).", { baslik: "Fiyat listesi linki", kutuMetni: l.link });
    }
  };
  return (
    <li className="py-3 space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-metin">
          {l.alici || "(isimsiz link)"}{" "}
          <span className="text-xs font-normal text-metin/50">
            · {l.haric.length ? `${urunler.filter((u) => !l.haric.includes(u.anahtar)).length} / ${urunler.length} ürün` : "tüm ürünler"}
          </span>
        </p>
        <p className="text-[11px] text-metin/50">
          {l.olusturma}
          {l.olusturanAdi && ` · ${l.olusturanAdi}`} ·{" "}
          {l.goruntulenme > 0 ? (
            <span className="text-emerald-700 font-medium">
              👁 {l.goruntulenme} kez açıldı{l.sonGoruntulenme && ` (son: ${l.sonGoruntulenme})`}
            </span>
          ) : (
            "henüz açılmadı"
          )}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <input readOnly value={l.link} onFocus={(e) => e.target.select()} className="focus-ring flex-1 min-w-[200px] border border-hat rounded-md px-3 py-1.5 text-xs font-mono bg-zemin" />
        <button type="button" onClick={kopyala} className="focus-ring text-xs border border-hat bg-white px-3 py-1.5 rounded-md hover:border-soguk">
          Kopyala
        </button>
        <a href={l.link} target="_blank" rel="noopener" className="focus-ring text-xs border border-hat bg-white px-3 py-1.5 rounded-md hover:border-soguk">
          Önizle
        </a>
        <a
          href={whatsappLinki("", mesaj)}
          target="_blank"
          rel="noopener"
          className="focus-ring text-xs bg-[#1fa855] text-white px-3 py-1.5 rounded-md font-medium hover:bg-[#178a45]"
        >
          💬 WhatsApp
        </a>
        {izin && <LinkUrunDuzenle l={l} urunler={urunler} />}
        {izin && (
        <form
          action={fiyatListesiLinkIptal}
          onSubmit={async (e) => {
            if (iptalOnaylandi.current) {
              iptalOnaylandi.current = false;
              return;
            }
            e.preventDefault();
            const form = e.currentTarget;
            if (
              await onayIste(`${l.alici || "Bu kişi"} listeyi artık açamaz. Gerekirse yeni link oluşturabilirsiniz.`, {
                baslik: "Link iptal edilsin mi?",
                onayMetni: "Linki iptal et",
                tehlikeli: true,
              })
            ) {
              iptalOnaylandi.current = true;
              form.requestSubmit();
            }
          }}
        >
          <input type="hidden" name="id" value={l.id} />
          <KaydetButonu basari={null} bekleme="İptal ediliyor…" className="focus-ring text-xs text-red-700 px-2 py-1.5 hover:underline">
            İptal et
          </KaydetButonu>
        </form>
        )}
      </div>
    </li>
  );
}

export default function FiyatListesiLinkleri({
  listeId,
  baslik,
  firma,
  linkler,
  urunler,
  izin,
}: {
  listeId: string;
  baslik: string;
  firma: string;
  linkler: FiyatLinki[];
  urunler: LinkUrunu[];
  izin: boolean; // link oluşturma / iptal yetkisi
}) {
  return (
    <details id="musteri-linkleri" open={linkler.length > 0} className="mb-6 bg-yuzey border border-hat rounded-lg scroll-mt-6 print:hidden">
      <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-metin">
        🔗 Müşteri linkleri{linkler.length > 0 && <span className="font-normal text-metin/60"> · {linkler.length} aktif link</span>}
      </summary>
      <div className="px-4 pb-4">
        <p className="text-xs text-metin/60 mb-3">
          Müşteriye bu listenin linkini gönderin. Link her açıldığında listenin <b>son kaydedilen</b> fiyatlarıyla PDF açılır; burada fiyatı
          değiştirip kaydettiğiniz an müşteri de yeni fiyatı görür. Alış fiyatı ve kâr linkte yoktur. Her kişiye ayrı link verin: kimin
          açtığını görür, istediğiniz kişinin linkini tek başına iptal edersiniz. &quot;☑ Tüm ürünler&quot; düğmesiyle bazı ürünleri linkten
          çıkarabilirsiniz; sonradan &quot;Ürünleri seç&quot; ile değiştirirseniz link adresi aynı kalır.
        </p>
        {izin && <YeniLinkFormu listeId={listeId} urunler={urunler} />}
        {linkler.length > 0 ? (
          <ul className="divide-y divide-hat">
            {linkler.map((l) => (
              <LinkSatiri key={l.id} l={l} baslik={baslik} firma={firma} urunler={urunler} izin={izin} />
            ))}
          </ul>
        ) : (
          <p className="text-xs text-metin/45">Bu liste için henüz link yok.</p>
        )}
      </div>
    </details>
  );
}
