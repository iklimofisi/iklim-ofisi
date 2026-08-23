"use client";

import { useState } from "react";
import { cariHareketEkle } from "@/lib/actions";

const yontemler = [
  { deger: "CEK", etiket: "Çek", detayEtiket: "Çekin tahsil tarihi", placeholder: "örn. 15.09.2026" },
  { deger: "NAKIT", etiket: "Nakit", detayEtiket: "Hangi banka hesabımıza yattı", placeholder: "örn. İş Bankası - Şirket Hesabı" },
  { deger: "KART", etiket: "Kart", detayEtiket: "Hangi POS ile tahsil edildi", placeholder: "örn. Garanti POS" },
  { deger: "HAVALE", etiket: "Havale/EFT", detayEtiket: "Hangi banka hesabımıza yattı", placeholder: "örn. Garanti Bankası - Şirket Hesabı" },
] as const;

export default function OdemeAlModal({
  musteriler,
  seciliMusteriId,
}: {
  musteriler: { id: string; ad: string }[];
  seciliMusteriId?: string;
}) {
  const [acik, setAcik] = useState(false);
  const [yontem, setYontem] = useState<(typeof yontemler)[number]["deger"]>("HAVALE");

  const secilenYontem = yontemler.find((y) => y.deger === yontem)!;

  return (
    <>
      <button
        type="button"
        onClick={() => setAcik(true)}
        className="focus-ring bg-soguk text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
      >
        Ödeme Al
      </button>

      {acik && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-metin/40" onClick={() => setAcik(false)} />
          <div className="relative bg-yuzey border border-hat rounded-lg p-6 w-full max-w-md">
            <h2 className="font-display font-medium text-metin mb-4">Ödeme Al</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                await cariHareketEkle(formData);
                setAcik(false);
              }}
              className="space-y-4"
            >
              <input type="hidden" name="tur" value="ALACAK" />
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">Müşteri</label>
                <select
                  name="musteriId"
                  required
                  defaultValue={seciliMusteriId}
                  className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
                >
                  {musteriler.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.ad}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">Tutar</label>
                <input
                  name="tutar"
                  type="number"
                  required
                  className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">Ödeme Yöntemi</label>
                <select
                  name="odemeYontemi"
                  value={yontem}
                  onChange={(e) => setYontem(e.target.value as typeof yontem)}
                  className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
                >
                  {yontemler.map((y) => (
                    <option key={y.deger} value={y.deger}>
                      {y.etiket}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">{secilenYontem.detayEtiket}</label>
                <input
                  name="odemeDetay"
                  required
                  placeholder={secilenYontem.placeholder}
                  className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">Açıklama</label>
                <input
                  name="aciklama"
                  required
                  defaultValue={`${secilenYontem.etiket} ile ödeme alındı`}
                  className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAcik(false)}
                  className="focus-ring text-sm text-metin/60 px-4 py-2"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
