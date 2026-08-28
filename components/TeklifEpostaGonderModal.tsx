"use client";

import { useState } from "react";
import { teklifMusteriyeEpostaGonder } from "@/lib/actions";

export default function TeklifEpostaGonderModal({
  teklifId,
  aliciEmail,
  hitapAd,
  teklifNo,
  hazirlayanAd,
  hazirlayanEmail,
}: {
  teklifId: string;
  aliciEmail: string;
  hitapAd: string;
  teklifNo: number;
  hazirlayanAd: string;
  hazirlayanEmail: string;
}) {
  const [acik, setAcik] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAcik(true)}
        className="focus-ring text-sm font-semibold bg-soguk text-white px-4 py-2 rounded-md hover:bg-soguk-dim transition-colors flex items-center gap-1.5 shadow-sm"
      >
        ✉️ Müşteriye Mail Gönder
      </button>

      {acik && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Teklifi Müşteriye E-Posta İle Gönder</h3>
                <p className="text-xs text-slate-500">TKL-{String(teklifNo).padStart(4, "0")} numaralı teklif iletilecektir.</p>
              </div>
              <button onClick={() => setAcik(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
            </div>

            <form action={teklifMusteriyeEpostaGonder} className="space-y-4 text-xs">
              <input type="hidden" name="teklifId" value={teklifId} />

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase">Gönderen (Oturum Açan Personel)</p>
                <p className="font-bold text-slate-900">{hazirlayanAd} <span className="text-slate-500 font-normal">({hazirlayanEmail})</span></p>
                <p className="text-[10px] text-teal-700 font-medium">ℹ️ Müşteri yanıtla (reply) yaptığında doğrudan senin e-postana düşecektir.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Müşteri / Alıcı E-Posta Adresi *</label>
                <input
                  name="aliciEmail"
                  type="email"
                  required
                  defaultValue={aliciEmail}
                  placeholder="ornek@musteri.com"
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">E-Posta Konusu</label>
                <input
                  name="epostaKonu"
                  required
                  defaultValue={`İklim Ofisi - Fiyat Teklifi (TKL-${String(teklifNo).padStart(4, "0")})`}
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ek Not / Açıklama (Opsiyonel)</label>
                <textarea
                  name="ekNot"
                  rows={3}
                  placeholder={`Sayın ${hitapAd}, görüşmemize istinaden teklifimiz ektedir...`}
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAcik(false)}
                  className="px-4 py-2 border border-slate-200 rounded-md font-semibold text-slate-600 hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-md shadow-sm"
                >
                  ✉️ E-Postayı Şimdi Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}