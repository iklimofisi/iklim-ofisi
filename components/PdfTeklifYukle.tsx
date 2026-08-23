"use client";

import { useState, useTransition } from "react";
import { satinalmaPdfAyikla, type AyiklananKalem } from "@/lib/pdf-ayikla";
import { satinalmaTeklifiEkle } from "@/lib/actions";
import TeklifKalemleri from "@/components/TeklifKalemleri";

export default function PdfTeklifYukle({
  tedarikciler,
}: {
  tedarikciler: { id: string; ad: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [hata, setHata] = useState<string | null>(null);
  const [sonuc, setSonuc] = useState<{ paraBirimi: "TRY" | "USD" | "EUR"; kalemler: AyiklananKalem[] } | null>(null);
  const [dosyaAdi, setDosyaAdi] = useState<string>("");

  function ayikla(formData: FormData) {
    setHata(null);
    startTransition(async () => {
      const sonucu = await satinalmaPdfAyikla(formData);
      if (!sonucu.basarili) {
        setHata(sonucu.hata ?? "Bilinmeyen hata.");
        return;
      }
      setSonuc({ paraBirimi: sonucu.paraBirimi ?? "TRY", kalemler: sonucu.kalemler ?? [] });
    });
  }

  if (sonuc) {
    return (
      <div className="bg-yuzey border border-hat rounded-lg p-5 mb-10">
        <h2 className="font-display font-medium text-metin mb-1">PDF'den Ayıklanan Teklif</h2>
        <p className="text-sm text-metin/60 mb-4">
          "{dosyaAdi}" dosyasından çıkarılanlar aşağıda — kaydetmeden önce kontrol et, gerekirse düzelt.
        </p>
        <form action={satinalmaTeklifiEkle}>
          <label className="block text-xs font-medium text-metin/60 mb-1">Başlık</label>
          <input
            name="baslik"
            required
            defaultValue={dosyaAdi.replace(/\.pdf$/i, "")}
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm mb-4"
          />
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Tedarikçi</label>
              <select name="tedarikciId" required className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm">
                {tedarikciler.map((t) => (
                  <option key={t.id} value={t.id}>{t.ad}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Para Birimi (otomatik algılandı)</label>
              <select name="paraBirimi" defaultValue={sonuc.paraBirimi} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm">
                <option value="TRY">₺ TRY</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div>
          </div>

          <TeklifKalemleri
            baslangic={sonuc.kalemler.map((k, i) => ({ key: i, aciklama: k.aciklama, adet: k.adet, birimFiyat: k.birimFiyat }))}
          />

          <div className="flex items-center justify-between border-t border-hat pt-4">
            <button
              type="button"
              onClick={() => setSonuc(null)}
              className="focus-ring text-sm text-metin/50 hover:text-metin"
            >
              Vazgeç, baştan yükle
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
    );
  }

  return (
    <div className="bg-yuzey border border-hat rounded-lg p-5 mb-10">
      <h2 className="font-display font-medium text-metin mb-1">PDF'den Teklif Yükle</h2>
      <p className="text-sm text-metin/60 mb-4">
        Tedarikçiden gelen teklif PDF'ini seç, sistem kalemleri ve para
        birimini otomatik ayıklasın.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const dosya = fd.get("pdf") as File | null;
          setDosyaAdi(dosya?.name ?? "");
          ayikla(fd);
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <div className="flex-1 min-w-[220px]">
          <input
            name="pdf"
            type="file"
            accept="application/pdf"
            required
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors disabled:opacity-50"
        >
          {pending ? "Okunuyor ve analiz ediliyor…" : "PDF'den Ayıkla"}
        </button>
      </form>
      {hata && <p className="text-sm text-sicak-dim mt-3">{hata}</p>}
    </div>
  );
}
