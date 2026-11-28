"use client";

import { useState } from "react";
import { siparisOnayla, siparisReddet } from "@/lib/actions";
import SonucluForm from "@/components/SonucluForm";
import { kurOku } from "@/lib/kur-oku";

// -----------------------------------------------------------------------------
// SİPARİŞ ONAY / RED (yalnız satış müdürü). Onayda sipariş tutarı müşterinin cari hesabına borç yazılır.
// Dövizli siparişte kur kutusu gelir: talepte seçilen kaynağa göre önerilen kur (TCMB ya da elle)
// dolu gelir, istenirse değiştirilir; altta cariye yazılacak TL tutarı görünür.
// -----------------------------------------------------------------------------
const para = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SiparisOnayReddet({
  siparisId,
  pb = "TRY",
  dovizKdvli = 0,
  onerilenKur,
  kurNotu,
}: {
  siparisId: string;
  pb?: string;
  dovizKdvli?: number; // KDV dahil sipariş tutarı (teklif para biriminde)
  onerilenKur?: number | null;
  kurNotu?: string;
}) {
  const dovizli = pb !== "TRY";
  const [kur, setKur] = useState(onerilenKur ? String(onerilenKur).replace(".", ",") : "");
  const [redFormuAcik, setRedFormuAcik] = useState(false);
  const kurSayi = kurOku(kur) ?? 0;

  return (
    <div className="space-y-3">
      <SonucluForm action={siparisOnayla} className="space-y-3">
        <input type="hidden" name="siparisId" value={siparisId} />
        {dovizli && (
          <div className="bg-yuzey border border-hat rounded-md p-3">
            <label className="block text-xs font-medium text-metin/60 mb-1">Onay kuru (1 {pb} = ? TL)</label>
            <input
              name="kur"
              inputMode="decimal"
              required
              value={kur}
              onChange={(e) => setKur(e.target.value)}
              className="focus-ring w-40 border border-hat rounded-md px-3 py-2 text-sm font-mono"
            />
            {kurNotu && <p className="text-[11px] text-metin/50 mt-1">{kurNotu}</p>}
            <p className="text-xs text-metin/70 mt-2">
              Cariye yazılacak borç: {para(dovizKdvli)} {pb} × {kur || "?"} ={" "}
              <strong className="font-mono">{kurSayi > 0 ? `${para(dovizKdvli * kurSayi)} TL` : "—"}</strong> (KDV dahil)
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors disabled:opacity-50"
          >
            Onayla ve cariye işle
          </button>
          <button
            type="button"
            onClick={() => setRedFormuAcik((v) => !v)}
            className="focus-ring border border-hat px-5 py-2 rounded-md text-sm font-medium text-metin/70 hover:border-sicak hover:text-sicak-dim transition-colors"
          >
            Reddet
          </button>
        </div>
      </SonucluForm>

      {redFormuAcik && (
        <SonucluForm action={siparisReddet} className="flex flex-wrap gap-3 items-start">
          <input type="hidden" name="siparisId" value={siparisId} />
          <input
            name="redSebebi"
            required
            placeholder="Red sebebi (örn. bütçe uygun değil)"
            className="focus-ring flex-1 min-w-[220px] border border-hat rounded-md px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="focus-ring bg-sicak text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-sicak-dim transition-colors disabled:opacity-50"
          >
            Reddi Onayla
          </button>
        </SonucluForm>
      )}
    </div>
  );
}
