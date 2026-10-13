"use client";

import { useState, type ReactNode } from "react";
import { MUSTERISIZ_ID } from "@/lib/musterisiz";

export type MusteriSecenek = {
  id: string;
  ad: string;
  yetkiliAdi: string | null; // Ana yetkili (Müşteri kartındaki)
  yetkililer: { id: string; ad: string; unvan: string | null }[];
};

// Teklif formlarında: Müşteri seçilince o müşterinin yetkilileri listelenir.
// "yetkiliId" boş gönderilirse teklif müşterinin ana yetkilisine hitap eder.
// "Müşterisiz teklif" seçilirse yetkili yerine serbest "muhatap" alanı çıkar
// (PDF'te müşteri adı yerine yazılır); teklif sonra müşteriye bağlanabilir.
export default function MusteriYetkiliSecici({
  musteriler,
  varsayilanMusteriId = "",
  varsayilanYetkiliId = "",
  varsayilanMuhatap = "",
  musteriEtiketSag,
}: {
  musteriler: MusteriSecenek[];
  varsayilanMusteriId?: string;
  varsayilanYetkiliId?: string;
  varsayilanMuhatap?: string;
  musteriEtiketSag?: ReactNode;
}) {
  const [musteriId, setMusteriId] = useState(varsayilanMusteriId);
  const [yetkiliId, setYetkiliId] = useState(varsayilanYetkiliId);
  const musterisiz = musteriId === MUSTERISIZ_ID;

  const secili = musteriler.find((m) => m.id === musteriId);
  const yetkililer = secili?.yetkililer ?? [];

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-metin/60">Müşteri *</label>
          {musteriEtiketSag}
        </div>
        <select
          name="musteriId"
          required
          value={musteriId}
          onChange={(e) => {
            setMusteriId(e.target.value);
            setYetkiliId(""); // Müşteri değişince yetkili seçimi sıfırlanır
          }}
          className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white font-medium"
        >
          <option value="">— Müşteri Seçin —</option>
          <option value={MUSTERISIZ_ID}>◌ Müşterisiz teklif (müşteri sonra bağlanır)</option>
          {musteriler.map((m) => (
            <option key={m.id} value={m.id}>
              {m.ad}
            </option>
          ))}
        </select>
      </div>

      {musterisiz ? (
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Muhatap (isteğe bağlı)</label>
          <input
            name="muhatap"
            maxLength={200}
            defaultValue={varsayilanMuhatap}
            placeholder="örn. Ahmet Bey · ABC İnşaat"
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
          />
          <input type="hidden" name="yetkiliId" value="" />
          <p className="text-[11px] text-metin/50 mt-1">PDF&apos;te müşteri adı yerine yazılır; boşsa &quot;Sayın Yetkili&quot;. Müşteri belli olunca teklif sayfasından &quot;Müşteriye bağla&quot;.</p>
        </div>
      ) : (
      <div>
        <label className="block text-xs font-medium text-metin/60 mb-1">Müşteri Yetkilisi</label>
        <select
          name="yetkiliId"
          value={yetkiliId}
          onChange={(e) => setYetkiliId(e.target.value)}
          disabled={!secili}
          className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white disabled:bg-slate-50 disabled:text-metin/40"
        >
          <option value="">
            {!secili
              ? "— Önce müşteri seçin —"
              : secili.yetkiliAdi
              ? `${secili.yetkiliAdi} (ana yetkili)`
              : "— Ana yetkili tanımlı değil —"}
          </option>
          {yetkililer.map((y) => (
            <option key={y.id} value={y.id}>
              {y.ad}
              {y.unvan ? ` · ${y.unvan}` : ""}
            </option>
          ))}
        </select>
        {secili && (
          <a
            href={`/panel/musteriler/${secili.id}#yetkililer`}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-soguk-dim hover:underline mt-1 inline-block"
          >
            + Bu müşteriye yetkili ekle
          </a>
        )}
      </div>
      )}
    </>
  );
}
