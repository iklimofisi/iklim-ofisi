"use client";

import { useState, useTransition } from "react";
import { urunlerExcelIceAktar } from "@/lib/actions";

export default function UrunExcelYukle() {
  const [pending, startTransition] = useTransition();
  const [sonuc, setSonuc] = useState<{ tur: "basarili" | "hata"; mesaj: string } | null>(null);

  return (
    <div className="bg-yuzey border border-hat rounded-lg p-5 mb-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-display font-medium text-metin mb-1">Excel'den Toplu Yükle</h2>
          <p className="text-sm text-metin/60">
            Sütun başlıkları: <span className="font-mono text-xs bg-hat px-1.5 py-0.5 rounded">Kod</span>{" "}
            <span className="font-mono text-xs bg-hat px-1.5 py-0.5 rounded">Ürün Adı</span>{" "}
            <span className="font-mono text-xs bg-hat px-1.5 py-0.5 rounded">Marka</span>{" "}
            <span className="font-mono text-xs bg-hat px-1.5 py-0.5 rounded">Birim</span>{" "}
            <span className="font-mono text-xs bg-hat px-1.5 py-0.5 rounded">Fiyat</span>{" "}
            <span className="font-mono text-xs bg-hat px-1.5 py-0.5 rounded">Para Birimi</span>
            . Marka sütunundaki isim, Markalar sayfasındaki isimle birebir
            eşleşmezse ürün markasız eklenir — sorun değil, sonradan tek tek
            düzenlenebilir. <strong className="text-metin">Aynı Kod'a sahip bir
            ürünü tekrar yüklersen, yeni kayıt oluşturmak yerine mevcut
            ürünün fiyatını günceller</strong> — güncel fiyat listesini
            periyodik olarak tekrar yükleyebilirsin.
          </p>
        </div>
        <a
          href="/api/export/urun-sablonu"
          className="focus-ring shrink-0 text-sm font-medium text-soguk-dim hover:underline whitespace-nowrap"
        >
          Şablonu İndir
        </a>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSonuc(null);
          const formData = new FormData(e.currentTarget);
          startTransition(async () => {
            const cevap = await urunlerExcelIceAktar(formData);
            if (cevap.basarili) {
              const parcalar: string[] = [];
              if (cevap.eklenen > 0) parcalar.push(`${cevap.eklenen} yeni ürün eklendi`);
              if (cevap.guncellenen > 0) parcalar.push(`${cevap.guncellenen} mevcut ürünün fiyatı güncellendi`);
              if (cevap.atlanan > 0) parcalar.push(`${cevap.atlanan} satır (adı veya fiyatı eksik olduğu için) atlandı`);
              setSonuc({ tur: "basarili", mesaj: parcalar.join(", ") + "." });
              e.currentTarget.reset();
            } else {
              setSonuc({ tur: "hata", mesaj: cevap.hata });
            }
          });
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <input
          name="dosya"
          type="file"
          accept=".xlsx,.xls,.csv"
          required
          className="focus-ring flex-1 min-w-[220px] border border-hat rounded-md px-3 py-2 text-sm bg-white"
        />
        <button
          type="submit"
          disabled={pending}
          className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors disabled:opacity-50"
        >
          {pending ? "Yükleniyor…" : "İçe Aktar"}
        </button>
      </form>

      {sonuc && (
        <p className={`text-sm mt-3 ${sonuc.tur === "basarili" ? "text-soguk-dim" : "text-sicak-dim"}`}>
          {sonuc.mesaj}
        </p>
      )}
    </div>
  );
}
