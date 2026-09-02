"use client";

import { useState } from "react";
import { satinalmaTeklifiEkle } from "@/lib/actions";

export default function TedarikciTeklifiEkleModal({
  konuBasligi,
  tedarikciler,
}: {
  konuBasligi: string;
  tedarikciler: { id: string; ad: string }[];
}) {
  const [acik, setAcik] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAcik(true)}
        className="bg-soguk text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-soguk-dim transition-colors shadow-sm"
      >
        + Bu Projeye Tedarikçi Teklifi Ekle
      </button>

      {acik && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left print:hidden">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Bu Projeye Yeni Tedarikçi Teklifi Ekle</h3>
                <p className="text-xs font-semibold text-teal-700 mt-0.5">📂 {konuBasligi}</p>
              </div>
              <button
                type="button"
                onClick={() => setAcik(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form action={satinalmaTeklifiEkle} className="space-y-4 text-xs">
              <input type="hidden" name="baslik" value={konuBasligi} />

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tedarikçi Firma Seç *</label>
                <select name="tedarikciId" required className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white font-medium">
                  <option value="">— Tedarikçi Seçin —</option>
                  {tedarikciler.map((t) => (
                    <option key={t.id} value={t.id}>{t.ad}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Para Birimi</label>
                <select name="paraBirimi" defaultValue="TRY" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white">
                  <option value="TRY">₺ TRY</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                </select>
              </div>

              {/* MALİYET PDF VE EXCEL DOSYASI YÜKLEME */}
              <div className="space-y-3 bg-slate-50 p-3 rounded-md border border-slate-200">
                <div>
                  <label className="block font-bold text-emerald-800 mb-1">📄 Tedarikçi Maliyet PDF'i</label>
                  <input name="maliyetPdf" type="file" accept=".pdf" className="w-full text-xs border border-slate-200 rounded p-1 bg-white" />
                </div>
                <div>
                  <label className="block font-bold text-blue-800 mb-1">📊 Tedarikçi Maliyet Excel'i</label>
                  <input name="maliyetExcel" type="file" accept=".xlsx,.xls" className="w-full text-xs border border-slate-200 rounded p-1 bg-white" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAcik(false)}
                  className="px-4 py-2 border border-slate-200 rounded-md font-semibold text-slate-600 hover:bg-slate-50 text-xs"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-md shadow-sm"
                >
                  Tedarikçi Teklifini Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}