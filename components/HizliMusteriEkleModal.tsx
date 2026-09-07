"use client";

import { useState } from "react";
import { hizliMusteriEkle } from "@/lib/actions";

export default function HizliMusteriEkleModal() {
  const [acik, setAcik] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAcik(true)}
        className="text-xs font-bold text-soguk-dim hover:underline flex items-center gap-1"
      >
        ✨ + Yeni Müşteri Ekle
      </button>

      {acik && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left print:hidden">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Hızlı Yeni Müşteri Ekle</h3>
                <p className="text-xs text-slate-500">Eklediğiniz müşteri otomatik seçilecek ve Müşteriler sayfasına kaydedilecektir.</p>
              </div>
              <button
                type="button"
                onClick={() => setAcik(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form action={hizliMusteriEkle} className="space-y-3">
              {/* 1. SATIR */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Firma / Müşteri Unvanı *</label>
                  <input
                    name="ad"
                    required
                    placeholder="Firma unvanı"
                    className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs bg-slate-50 focus:bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-teal-700 mb-1">Müşteri Yetkilisi Ad Soyad</label>
                  <input
                    name="yetkiliAdi"
                    placeholder="Örn: Ahmet Yılmaz"
                    className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs bg-slate-50 focus:bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Yetkili Telefon</label>
                  <input
                    name="yetkiliTelefon"
                    placeholder="05xx xxx xx xx"
                    className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* 2. SATIR */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Yetkili E-posta</label>
                  <input
                    name="yetkiliEmail"
                    type="email"
                    placeholder="ahmet@firma.com"
                    className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Firma Santral Tel</label>
                  <input
                    name="telefon"
                    placeholder="0216 xxx xx xx"
                    className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vergi No / TC</label>
                  <input
                    name="vergiNo"
                    placeholder="Vergi No"
                    className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* 3. SATIR */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Firma E-posta</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="info@firma.com"
                    className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Muhasebe E-postası</label>
                  <input
                    name="muhasebeEmail"
                    type="email"
                    placeholder="muhasebe@firma.com"
                    className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* 4. SATIR */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fatura Adresi</label>
                  <textarea
                    name="faturaAdresi"
                    rows={2}
                    placeholder="Fatura adresi"
                    className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sevk Adresi</label>
                  <textarea
                    name="sevkAdresi"
                    rows={2}
                    placeholder="Sevk adresi"
                    className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
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
                  Müşteriyi Kaydet ve Teklife Dön
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}