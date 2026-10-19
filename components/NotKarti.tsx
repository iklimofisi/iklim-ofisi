"use client";

import { useState } from "react";
import NotFormu from "@/components/NotFormu";
import SilButon from "@/components/SilButon";
import { notDurum, notSil } from "@/lib/not-actions";
import { hatirlatmaYaz } from "@/lib/notlar";

export type NotKartVerisi = {
  id: string;
  baslik: string | null;
  icerik: string;
  gizli: boolean;
  sabit: boolean;
  tamamlandi: boolean;
  olusturanId: string;
  olusturanAdi: string;
  hatirlatmaGunu: string | null;
  hatirlatmaSaati: string | null;
  alicilar: string[];
  gonderildi: string | null; // ISO
  guncelleme: string; // ISO
};

const zaman = (iso: string) =>
  new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" }).format(
    new Date(iso)
  );

export default function NotKarti({
  not,
  kullanicilar,
  benId,
  bugun,
  yarin,
}: {
  not: NotKartVerisi;
  kullanicilar: { id: string; ad: string; email: string }[];
  benId: string;
  bugun: string;
  yarin: string;
}) {
  const [duzenle, setDuzenle] = useState(false);
  const benim = not.olusturanId === benId;
  const adlar = new Map(kullanicilar.map((k) => [k.id, k.ad]));
  const aliciMetni = (() => {
    if (!not.hatirlatmaGunu) return "";
    const idler = not.gizli || !not.alicilar.length ? [not.olusturanId] : not.alicilar;
    if (idler.length === 1 && idler[0] === not.olusturanId) return benim ? "sadece size" : `sadece ${not.olusturanAdi}`;
    if (kullanicilar.length > 1 && idler.length >= kullanicilar.length) return "herkese";
    return idler.map((i) => (i === benId ? "siz" : adlar.get(i) ?? "?")).join(", ");
  })();
  const gecikti = !not.tamamlandi && not.hatirlatmaGunu && not.hatirlatmaGunu < bugun;
  const bugunMu = not.hatirlatmaGunu === bugun;

  if (duzenle && benim)
    return (
      <div className="bg-yuzey border-2 border-soguk/50 rounded-lg p-5 sm:col-span-2">
        <p className="font-display font-medium text-metin mb-3">Notu düzenle</p>
        <NotFormu
          not={{
            id: not.id,
            baslik: not.baslik,
            icerik: not.icerik,
            gizli: not.gizli,
            sabit: not.sabit,
            hatirlatmaGunu: not.hatirlatmaGunu,
            hatirlatmaSaati: not.hatirlatmaSaati,
            alicilar: not.alicilar,
          }}
          kullanicilar={kullanicilar}
          benId={benId}
          yarin={yarin}
          onIptal={() => setDuzenle(false)}
        />
      </div>
    );

  const kenar = not.tamamlandi ? "border-hat opacity-70" : gecikti ? "border-sicak/50" : bugunMu ? "border-amber-300" : not.sabit ? "border-soguk/40" : "border-hat";
  const durumDugmesi = (islem: string, etiket: string) => (
    <form action={notDurum}>
      <input type="hidden" name="id" value={not.id} />
      <input type="hidden" name="islem" value={islem} />
      <button type="submit" className="focus-ring text-xs text-metin/55 hover:text-soguk-dim">
        {etiket}
      </button>
    </form>
  );

  return (
    <article className={`bg-yuzey border rounded-lg p-4 shadow-sm ${kenar}`}>
      <div className="flex flex-wrap items-center gap-1.5 mb-2 text-[11px] font-semibold">
        {not.sabit && <span className="rounded bg-soguk-light text-soguk-dim px-1.5 py-0.5">📌 Sabit</span>}
        {not.gizli ? (
          <span className="rounded bg-metin/10 text-metin/70 px-1.5 py-0.5">🔒 Gizli · yalnız siz</span>
        ) : (
          <span className="rounded bg-emerald-50 text-emerald-800 px-1.5 py-0.5">👥 Herkese açık</span>
        )}
        {not.tamamlandi && <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5">✓ Tamamlandı</span>}
      </div>
      {not.baslik && <h3 className={`font-display font-medium text-metin ${not.tamamlandi ? "line-through" : ""}`}>{not.baslik}</h3>}
      <p className="text-sm text-metin/80 whitespace-pre-wrap break-words mt-1">{not.icerik}</p>

      {not.hatirlatmaGunu && (
        <div
          className={`mt-3 rounded-md px-3 py-2 text-xs ${
            not.tamamlandi ? "bg-zemin text-metin/55" : gecikti ? "bg-sicak-light text-sicak-dim" : bugunMu ? "bg-amber-50 text-amber-900" : "bg-soguk-light/60 text-soguk-dim"
          }`}
        >
          <p className="font-semibold">
            ⏰ {hatirlatmaYaz(not.hatirlatmaGunu, not.hatirlatmaSaati)}
            {!not.tamamlandi && (gecikti ? " · gecikti" : bugunMu ? " · bugün" : "")}
          </p>
          <p className="mt-0.5 opacity-90">
            Mail: {aliciMetni}
            {" · "}
            {not.gonderildi
              ? `✓ gönderildi (${zaman(not.gonderildi)})`
              : not.tamamlandi
                ? "gönderilmeyecek (tamamlandı)"
                : gecikti
                  ? "henüz gitmedi; bir sonraki sabah kontrolünde gider"
                  : "o sabah 08:00'de gidecek"}
          </p>
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-hat/70 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-metin/45">
          {not.olusturanAdi || "—"} · {zaman(not.guncelleme)}
        </p>
        {benim && (
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setDuzenle(true)} className="focus-ring text-xs text-soguk-dim hover:underline">
              Düzenle
            </button>
            {not.tamamlandi ? durumDugmesi("geriAl", "↺ Geri al") : durumDugmesi("tamamla", "✓ Tamamlandı")}
            {not.sabit ? durumDugmesi("coz", "Sabitten çıkar") : durumDugmesi("sabitle", "📌 Sabitle")}
            <SilButon id={not.id} action={notSil} onayMesaji="Bu not silinsin mi? Geri alınamaz." />
          </div>
        )}
      </div>
    </article>
  );
}
