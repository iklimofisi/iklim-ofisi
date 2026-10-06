"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useBitinceBildir } from "@/lib/bildirim";
import { teklifDurumGuncelle, teklifReddet } from "@/lib/actions";
import { RED_NEDENLERI } from "@/lib/teklif-durum";

const durumlar = [
  { deger: "BEKLEMEDE", etiket: "Beklemede" },
  { deger: "ONAYLANDI", etiket: "Onaylandı" },
  { deger: "REDDEDILDI", etiket: "Reddedildi" },
] as const;

type Durum = (typeof durumlar)[number]["deger"];

// Teklif durumu seçici. "Reddedildi" seçilince neden soran küçük bir pencere açılır;
// vazgeçilirse durum değişmez.
export default function TeklifDurumSecici({
  teklifId,
  mevcutDurum,
}: {
  teklifId: string;
  mevcutDurum: string;
}) {
  const [pending, startTransition] = useTransition();
  const [deger, setDeger] = useState(mevcutDurum);
  const [redAcik, setRedAcik] = useState(false);
  const [neden, setNeden] = useState("");
  const [rakip, setRakip] = useState("");
  const [aciklama, setAciklama] = useState("");
  useBitinceBildir(pending, "Teklif durumu güncellendi.");

  const reddet = () => {
    if (!neden) return;
    setRedAcik(false);
    setDeger("REDDEDILDI");
    startTransition(() => teklifReddet(teklifId, { neden, rakip, aciklama }));
  };

  return (
    <>
      <select
        value={deger}
        disabled={pending}
        aria-label="Teklif durumu"
        onChange={(e) => {
          const yeni = e.target.value as Durum;
          if (yeni === "REDDEDILDI") {
            setNeden("");
            setRakip("");
            setAciklama("");
            setRedAcik(true);
            return; // nedeni seçilince kaydedilir
          }
          setDeger(yeni);
          startTransition(() => teklifDurumGuncelle(teklifId, yeni));
        }}
        className="focus-ring text-xs border border-hat rounded-md px-2 py-1 bg-white text-metin/70"
      >
        {durumlar.map((d) => (
          <option key={d.deger} value={d.deger}>
            {d.etiket}
          </option>
        ))}
      </select>

      {redAcik &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Red nedeni"
            className="fixed inset-0 z-50 bg-metin/50 flex items-center justify-center p-4"
            onClick={() => setRedAcik(false)}
          >
            <div className="bg-yuzey rounded-lg shadow-2xl w-full max-w-md p-5 text-left" onClick={(e) => e.stopPropagation()}>
              <h2 className="font-display font-semibold text-metin mb-1">Teklif neden kaybedildi?</h2>
              <p className="text-xs text-metin/50 mb-4">Kaydedince teklif &quot;Reddedildi&quot; olur. Nedenler teklif listesinde özetlenir.</p>

              <div className="space-y-1.5 mb-4">
                {RED_NEDENLERI.map((n) => (
                  <label
                    key={n.kod}
                    className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md border cursor-pointer transition-colors ${
                      neden === n.kod ? "border-sicak bg-sicak-light text-metin" : "border-hat hover:border-sicak/50 text-metin/80"
                    }`}
                  >
                    <input type="radio" name={`red-${teklifId}`} value={n.kod} checked={neden === n.kod} onChange={() => setNeden(n.kod)} className="accent-sicak" />
                    {n.ad}
                  </label>
                ))}
              </div>

              <label className="block text-xs font-medium text-metin/60 mb-1">İşi alan firma (biliniyorsa)</label>
              <input
                value={rakip}
                onChange={(e) => setRakip(e.target.value)}
                maxLength={200}
                placeholder="örn. X Mühendislik"
                className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm mb-3"
              />
              <label className="block text-xs font-medium text-metin/60 mb-1">Açıklama (opsiyonel)</label>
              <textarea
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                maxLength={2000}
                rows={2}
                placeholder="örn. Rakip fiyatı %12 düşük, marka olarak Daikin istendi"
                className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm mb-4"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRedAcik(false)}
                  className="focus-ring text-sm px-4 py-2 rounded-md border border-hat text-metin/70 hover:border-soguk"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={reddet}
                  disabled={!neden}
                  className="focus-ring text-sm px-4 py-2 rounded-md bg-sicak-dim text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Reddedildi olarak kaydet
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
