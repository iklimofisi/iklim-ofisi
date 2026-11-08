"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { sablonlariGrupla } from "@/lib/sablon";
import { sablonHizliEkle, sablonIcerikGuncelle } from "@/lib/actions";
import { bildirimGoster } from "@/lib/bildirim";

type Sablon = { id: string; baslik: string; grupBaslik: string | null; icerik: string };

// Türkçe harf ve büyük/küçük harf farkı gözetmeden karşılaştırma ("DAHIL" = "dahil", "HARIC" = "hariç")
const sade = (s: string) =>
  s
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/i̇/g, "i")
    .replace(/ç/g, "c")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/û/g, "u");
const montajGrubuMu = (grup: string) => sade(grup).includes("montaj");
const notMetni = (n: Sablon) => sade(`${n.grupBaslik ?? ""} ${n.baslik} ${n.icerik}`);
const montajHaricMi = (n: Sablon) => /haric|dahil degil|dahil olmayan/.test(notMetni(n));
const montajDahilMi = (n: Sablon) => !montajHaricMi(n) && /dahil/.test(notMetni(n));

// Teklif formunda notları GRUP GRUP seçtirir: her gruptan uygun olan bir not seçilir.
// Müşteriye yalnızca grup başlığı ("Ödeme Koşulları") ve notun metni gider;
// "(Ç-9)" gibi kodlar sadece burada, panelde görünür.
// * Seçilen not "Bu teklif için düzenle" ile YALNIZCA bu teklifte değiştirilebilir
//   (hazır not ve eski teklifler değişmez).
// * İstenirse düzenlenen metin hazır nota da kalıcı kaydedilir.
// * Yeni hazır not buradan eklenir; sayfayı yenilemeye gerek yoktur.
export default function SablonSecici({
  sablonlar,
  seciliIdler,
  varsayilanIlk = false,
  ozelNotlar = {},
}: {
  sablonlar: Sablon[];
  seciliIdler: string[];
  varsayilanIlk?: boolean; // yeni teklifte her grubun ilk notu seçili gelsin
  ozelNotlar?: Record<string, string>; // bu teklife özel düzenlenmiş metinler
}) {
  const [liste, setListe] = useState<Sablon[]>(sablonlar);
  const [ozel, setOzel] = useState<Record<string, string>>(ozelNotlar);
  // Her grubun seçimi burada tutulur (gizli alanlar ve özel metinler buna göre yazılır)
  const [secimler, setSecimler] = useState<Record<string, string[]>>(() => {
    const secili = new Set(seciliIdler);
    const ilk: Record<string, string[]> = {};
    for (const g of sablonlariGrupla(sablonlar)) {
      const gruptaki = g.notlar.filter((n) => secili.has(n.id)).map((n) => n.id);
      // Montaj notları yeni teklifte seçili gelmez (montaj dahil/hariç kullanıcı seçer)
      ilk[g.grup] = gruptaki.length > 0 ? gruptaki : varsayilanIlk && !montajGrubuMu(g.grup) ? [g.notlar[0].id] : [];
    }
    return ilk;
  });
  const [yeniGrupAcik, setYeniGrupAcik] = useState(false);

  // MONTAJ DAHİL / HARİÇ (components/MontajSecimi.tsx): "Montaj" adlı not grubunda
  // uygun notu seçer; istenirse hazır notu oluşturur. Sonuç olayın detail.sonuc alanına yazılır.
  const kokRef = useRef<HTMLDivElement>(null);
  const listeRef = useRef(liste);
  listeRef.current = liste;
  useEffect(() => {
    const form = kokRef.current?.closest("form");
    if (!form) return;
    const haricMi = montajHaricMi;
    const dahilMi = montajDahilMi;
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail as { tur?: "haric" | "dahil"; olustur?: boolean; sonuc?: string };
      if (!d || (d.tur !== "haric" && d.tur !== "dahil")) return;
      const tur = d.tur;
      const uygun = tur === "haric" ? haricMi : dahilMi;
      const ters = tur === "haric" ? dahilMi : haricMi;
      // Önce adı "Montaj" olan grupta; yoksa adında / metninde montaj geçen herhangi bir grupta ara
      const gruplar = sablonlariGrupla(listeRef.current);
      const montajNotu = (x: Sablon) => notMetni(x).includes("montaj");
      let g = gruplar.find((x) => montajGrubuMu(x.grup) && x.notlar.some(uygun));
      if (!g) g = gruplar.find((x) => x.notlar.some((n) => montajNotu(n) && uygun(n)));
      if (!g) g = gruplar.find((x) => montajGrubuMu(x.grup));
      const n = g?.notlar.find((x) => uygun(x) && (montajGrubuMu(g!.grup) || montajNotu(x)));
      if (g && n) {
        setSecimler((s) => ({ ...s, [g.grup]: [n.id] }));
        d.sonuc = n.baslik;
        return;
      }
      // Uygun not yoksa en azından ters anlamlı not seçili kalmasın
      if (g) setSecimler((s) => ({ ...s, [g.grup]: (s[g.grup] ?? []).filter((id) => !g.notlar.some((x) => x.id === id && ters(x))) }));
      if (d.olustur) {
        d.sonuc = "olusturuluyor";
        const grup = g?.grup ?? "Montaj";
        const icerik =
          tur === "haric"
            ? "Montaj, bakır boru tesisatı, test ve devreye alma fiyata dahil değildir."
            : "Montaj, bakır boru tesisatı, test ve devreye alma teklif kapsamındadır.";
        sablonHizliEkle({ baslik: `${grup} (${tur === "haric" ? "hariç" : "dahil"})`, grupBaslik: grup, icerik }).then((yeni) => {
          if (yeni) {
            notEklendi(yeni);
            bildirimGoster("Montaj notu hazır notlara eklendi ve bu teklifte seçildi.");
          }
        });
        return;
      }
      d.sonuc = "yok";
    };
    form.addEventListener("teklif-montaj-not", h);
    return () => form.removeEventListener("teklif-montaj-not", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gruplar = sablonlariGrupla(liste);
  const seciliHepsi = Object.values(secimler).flat();
  // Yalnızca seçili notların özel metinleri gönderilir
  const ozelJson = JSON.stringify(Object.fromEntries(Object.entries(ozel).filter(([id]) => seciliHepsi.includes(id))));

  const notEklendi = (yeni: Sablon) => {
    setListe((l) => [...l, yeni]);
    const grup = sablonlariGrupla([yeni])[0].grup;
    setSecimler((s) => {
      const mevcut = Object.keys(s).find((g) => g.toLocaleLowerCase("tr-TR") === grup.toLocaleLowerCase("tr-TR"));
      return { ...s, [mevcut ?? grup]: [yeni.id] };
    });
  };

  return (
    <div ref={kokRef} className="border-t border-hat pt-4 mt-4 mb-4">
      <input type="hidden" name="ozelNotlar" value={ozelJson} />
      {seciliHepsi.map((id) => (
        <input key={id} type="hidden" name="sablonIds" value={id} />
      ))}
      <p className="text-xs font-medium text-metin/60 mb-1">Teklif notları</p>
      <p className="text-[11px] text-metin/45 mb-3">
        Her gruptan uygun olanı seçin. Müşteri yalnızca grup başlığını ve metni görür; parantez içindeki kodlar görünmez. Metni yalnızca
        bu teklifte değiştirmek için &quot;Bu teklif için düzenle&quot;ye basın.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {gruplar.map((g) => (
          <GrupSatiri
            key={g.grup}
            grup={g.grup}
            notlar={g.notlar}
            secim={secimler[g.grup] ?? []}
            setSecim={(ids) => setSecimler((s) => ({ ...s, [g.grup]: ids }))}
            ozel={ozel}
            setOzel={setOzel}
            notGuncellendi={(n) => setListe((l) => l.map((x) => (x.id === n.id ? n : x)))}
            notEklendi={notEklendi}
          />
        ))}
      </div>

      <div className="mt-3">
        {yeniGrupAcik ? (
          <YeniNotFormu grupSorulsun onKapat={() => setYeniGrupAcik(false)} onEklendi={notEklendi} />
        ) : (
          <button type="button" onClick={() => setYeniGrupAcik(true)} className="focus-ring text-xs text-soguk-dim hover:underline">
            + Yeni not grubu ekle (ör. &quot;Garanti&quot;, &quot;Montaj Şartları&quot;)
          </button>
        )}
      </div>
    </div>
  );
}

function GrupSatiri({
  grup,
  notlar,
  secim,
  setSecim,
  ozel,
  setOzel,
  notGuncellendi,
  notEklendi,
}: {
  grup: string;
  notlar: Sablon[];
  secim: string[];
  setSecim: (ids: string[]) => void;
  ozel: Record<string, string>;
  setOzel: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  notGuncellendi: (n: Sablon) => void;
  notEklendi: (n: Sablon) => void;
}) {
  // Eski tekliflerde aynı gruptan birden fazla not seçilmiş olabilir: o durumda hiçbirini
  // kaybetmemek için kutucuklarla gösterilir.
  const [coklu] = useState(secim.length > 1);
  const [yeniAcik, setYeniAcik] = useState(false);

  return (
    <div className="border border-hat rounded-md p-3 bg-white">
      <p className="text-sm font-semibold text-metin mb-2">{grup}</p>
      {coklu ? (
        <div className="space-y-1">
          {notlar.map((n) => (
            <label key={n.id} className="flex items-center gap-2 text-sm text-metin/80">
              <input
                type="checkbox"
                checked={secim.includes(n.id)}
                onChange={(e) => setSecim(e.target.checked ? [...secim, n.id] : secim.filter((x) => x !== n.id))}
                className="accent-soguk"
              />
              {n.baslik}
            </label>
          ))}
        </div>
      ) : (
        <select
          value={secim[0] ?? ""}
          onChange={(e) => setSecim(e.target.value ? [e.target.value] : [])}
          aria-label={`${grup} notu`}
          className="focus-ring w-full border border-hat rounded-md px-2 py-1.5 text-sm bg-white"
        >
          <option value="">— Bu teklifte olmasın —</option>
          {notlar.map((n) => (
            <option key={n.id} value={n.id}>
              {n.baslik}
              {Object.prototype.hasOwnProperty.call(ozel, n.id) ? " ✎" : ""}
            </option>
          ))}
        </select>
      )}

      {notlar
        .filter((n) => secim.includes(n.id))
        .map((n) => (
          <NotMetni key={n.id} not={n} ozel={ozel} setOzel={setOzel} notGuncellendi={notGuncellendi} />
        ))}

      <div className="mt-2">
        {yeniAcik ? (
          <YeniNotFormu grup={grup} onKapat={() => setYeniAcik(false)} onEklendi={notEklendi} />
        ) : (
          <button type="button" onClick={() => setYeniAcik(true)} className="focus-ring text-[11px] text-soguk-dim hover:underline">
            + Bu gruba yeni hazır not ekle
          </button>
        )}
      </div>
    </div>
  );
}

// Seçili notun metni: önizleme / bu teklif için düzenleme / hazır notu güncelleme
function NotMetni({
  not,
  ozel,
  setOzel,
  notGuncellendi,
}: {
  not: Sablon;
  ozel: Record<string, string>;
  setOzel: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  notGuncellendi: (n: Sablon) => void;
}) {
  const ozelVar = Object.prototype.hasOwnProperty.call(ozel, not.id);
  const metin = ozelVar ? ozel[not.id] : not.icerik;
  const [duzenle, setDuzenle] = useState(false);
  const [pending, startTransition] = useTransition();

  const metniAyarla = (yeni: string) =>
    setOzel((o) => {
      const k = { ...o };
      if (yeni === not.icerik) delete k[not.id];
      else k[not.id] = yeni;
      return k;
    });

  const hazirNotaKaydet = () => {
    if (!metin.trim()) return;
    if (
      !window.confirm(
        `"${not.baslik}" hazır notu bu metinle değiştirilsin mi?\n\nDikkat: Bu notu kullanan ESKİ tekliflerin çıktısında da yeni metin görünür (o tekliflere özel düzenleme yapılmadıysa).`
      )
    )
      return;
    startTransition(async () => {
      const g = await sablonIcerikGuncelle(not.id, metin);
      if (g) {
        notGuncellendi(g);
        setOzel((o) => {
          const k = { ...o };
          delete k[not.id];
          return k;
        });
        bildirimGoster("Hazır not güncellendi.");
      }
    });
  };

  return (
    <div className="mt-2">
      {ozelVar && (
        <p className="text-[10px] font-semibold text-sicak-dim mb-1">✎ Bu teklife özel metin (hazır not değişmedi)</p>
      )}
      {duzenle ? (
        <textarea
          value={metin}
          onChange={(e) => metniAyarla(e.target.value)}
          rows={Math.min(10, Math.max(3, metin.split("\n").length + 1))}
          aria-label={`${not.baslik} metni`}
          className="focus-ring w-full border border-sicak/50 rounded-md px-2 py-1.5 text-xs bg-sicak-light/30"
        />
      ) : (
        metin && (
          <p className="text-[11px] text-metin/55 whitespace-pre-line line-clamp-4" title={metin}>
            {metin}
          </p>
        )
      )}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px]">
        <button type="button" onClick={() => setDuzenle((d) => !d)} className="focus-ring text-soguk-dim hover:underline">
          {duzenle ? "✓ Düzenlemeyi kapat" : "✏️ Bu teklif için düzenle"}
        </button>
        {ozelVar && (
          <>
            <button type="button" onClick={() => metniAyarla(not.icerik)} className="focus-ring text-metin/50 hover:text-metin hover:underline">
              ↺ Hazır metne dön
            </button>
            <button
              type="button"
              onClick={hazirNotaKaydet}
              disabled={pending}
              className="focus-ring text-metin/50 hover:text-sicak-dim hover:underline disabled:opacity-50"
            >
              {pending ? "Kaydediliyor…" : "💾 Hazır notu da bu metinle güncelle"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Teklif ekranından yeni hazır not ekleme (grup verilirse o gruba eklenir)
function YeniNotFormu({
  grup,
  grupSorulsun = false,
  onKapat,
  onEklendi,
}: {
  grup?: string;
  grupSorulsun?: boolean;
  onKapat: () => void;
  onEklendi: (n: Sablon) => void;
}) {
  const [grupAd, setGrupAd] = useState(grup ?? "");
  const [kod, setKod] = useState("");
  const [icerik, setIcerik] = useState("");
  const [pending, startTransition] = useTransition();
  const [hata, setHata] = useState("");

  const kaydet = () => {
    const g = grupAd.trim();
    if (!g || !icerik.trim()) {
      setHata(grupSorulsun ? "Grup adı ve metin gerekli." : "Metin gerekli.");
      return;
    }
    // Panelde görünen ad: "Grup (kod)"; kod yazılmazsa yalnızca grup adı
    const baslik = kod.trim() ? `${g} (${kod.trim()})` : g;
    startTransition(async () => {
      const yeni = await sablonHizliEkle({ baslik, grupBaslik: g, icerik });
      if (yeni) {
        onEklendi(yeni);
        bildirimGoster("Hazır not eklendi ve bu teklifte seçildi.");
        onKapat();
      } else setHata("Not eklenemedi.");
    });
  };

  const kutu = "focus-ring w-full border border-hat rounded-md px-2 py-1.5 text-xs bg-white";

  return (
    <div className="border border-soguk/30 bg-soguk-light/30 rounded-md p-2 space-y-2">
      {grupSorulsun && (
        <input value={grupAd} onChange={(e) => setGrupAd(e.target.value)} placeholder="Grup adı (müşteri görür), ör. Garanti" aria-label="Grup adı" className={kutu} />
      )}
      <input value={kod} onChange={(e) => setKod(e.target.value)} placeholder="Kısa kod (sadece panelde), ör. G-2" aria-label="Not kodu" className={kutu} />
      <textarea value={icerik} onChange={(e) => setIcerik(e.target.value)} rows={3} placeholder="Not metni" aria-label="Not metni" className={kutu} />
      {hata && <p className="text-[11px] text-red-700">{hata}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={kaydet}
          disabled={pending}
          className="focus-ring text-xs bg-soguk text-white rounded-md px-3 py-1 font-medium disabled:opacity-50"
        >
          {pending ? "Ekleniyor…" : "Hazır not olarak ekle"}
        </button>
        <button type="button" onClick={onKapat} className="focus-ring text-xs text-metin/60 hover:underline">
          Vazgeç
        </button>
      </div>
    </div>
  );
}
