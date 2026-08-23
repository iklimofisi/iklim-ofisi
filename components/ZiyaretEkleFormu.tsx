"use client";

import { useState } from "react";
import { ziyaretEkle } from "@/lib/actions";

export default function ZiyaretEkleFormu({
  musteriId,
  projeId,
}: {
  musteriId?: string;
  projeId?: string;
}) {
  const [hatirlatmaAcik, setHatirlatmaAcik] = useState(false);

  return (
    <form action={ziyaretEkle} className="bg-yuzey border border-hat rounded-lg p-5 mb-6">
      {musteriId && <input type="hidden" name="musteriId" value={musteriId} />}
      {projeId && <input type="hidden" name="projeId" value={projeId} />}

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Ziyaret Tarihi</label>
          <input
            name="tarih"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      <label className="block text-xs font-medium text-metin/60 mb-1">Ziyaret Notu</label>
      <textarea
        name="not"
        required
        rows={3}
        placeholder="Görüşme özeti, konuşulanlar, izlenimler..."
        className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm mb-3"
      />

      <label className="flex items-center gap-2 text-sm text-metin/80 mb-3">
        <input
          type="checkbox"
          checked={hatirlatmaAcik}
          onChange={(e) => setHatirlatmaAcik(e.target.checked)}
          className="accent-soguk"
        />
        Belirli bir tarihte hatırlatma kur
      </label>

      {hatirlatmaAcik && (
        <div className="grid sm:grid-cols-2 gap-3 mb-3 bg-sicak-light rounded-md p-3">
          <div>
            <label className="block text-xs font-medium text-sicak-dim mb-1">Hatırlatma Tarihi</label>
            <input
              name="hatirlatmaTarihi"
              type="date"
              required={hatirlatmaAcik}
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-sicak-dim mb-1">Hatırlatma Notu (opsiyonel)</label>
            <input
              name="hatirlatmaNotu"
              placeholder="örn. teklif takibi için ara"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
        >
          Ziyareti Kaydet
        </button>
      </div>
    </form>
  );
}
