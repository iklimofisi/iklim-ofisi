"use client";

import { useState, useTransition } from "react";
import { projeTakipNotuGuncelle } from "@/lib/actions";

export default function TakipNotuEditor({
  id,
  varsayilanNot,
  tip = "TEKLIF",
}: {
  id: string;
  varsayilanNot: string;
  tip?: "PROJE" | "TEKLIF";
}) {
  const [not, setNot] = useState(varsayilanNot || "");
  const [kaydedildi, setKaydedildi] = useState(false);
  const [modalAcik, setModalAcik] = useState(false);
  const [isPending, startTransition] = useTransition();

  const kaydet = (yeniNot: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("tip", tip);
      formData.append("takipNotu", yeniNot);
      await projeTakipNotuGuncelle(formData);

      setKaydedildi(true);
      setTimeout(() => setKaydedildi(false), 3000);
    });
  };

  return (
    <div className="flex items-center gap-1.5 w-full">
      <input
        type="text"
        value={not}
        onChange={(e) => setNot(e.target.value)}
        placeholder={tip === "PROJE" ? "Proje/Fırsat notu..." : "Teklif takip notu..."}
        className="w-full border border-hat rounded px-2 py-1 text-xs bg-slate-50 focus:bg-white focus:border-soguk text-metin font-medium"
      />

      <button
        type="button"
        disabled={isPending}
        onClick={() => kaydet(not)}
        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all shrink-0 ${
          kaydedildi
            ? "bg-emerald-600 text-white shadow"
            : "bg-soguk text-white hover:bg-soguk-dim"
        }`}
      >
        {isPending ? "..." : kaydedildi ? "✓ Kaydedildi!" : "Kaydet"}
      </button>

      <button
        type="button"
        onClick={() => setModalAcik(true)}
        className="p-1 text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 border border-hat rounded text-xs shrink-0"
        title="Notun Tamamını Büyük Pencerede Oku & Düzenle"
      >
        👁️
      </button>

      {modalAcik && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                👁️ Proje / Fırsat Görüşme Geçmişi
              </h3>
              <button
                type="button"
                onClick={() => setModalAcik(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600">
                Görüşme Notları & Fırsat Takip Geçmişi
              </label>
              <textarea
                rows={6}
                value={not}
                onChange={(e) => setNot(e.target.value)}
                placeholder="Müşteriyle yapılan görüşmeleri ve ihale takip notlarını buraya yazabilirsiniz..."
                className="w-full border border-hat rounded-md p-3 text-xs bg-slate-50 focus:bg-white leading-relaxed text-slate-800 font-medium"
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              {kaydedildi ? (
                <span className="text-xs font-bold text-emerald-600">
                  ✓ Not veritabanına başarıyla kaydedildi!
                </span>
              ) : <span />}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalAcik(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Kapat
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => kaydet(not)}
                  className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded shadow-sm"
                >
                  {isPending ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}