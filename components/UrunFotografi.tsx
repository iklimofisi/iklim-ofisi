"use client";

import { useState, useTransition } from "react";
import { urunGorselAyarla } from "@/lib/actions";
import { fotografYukle } from "@/lib/gorsel-yukle";
import { bildirimGoster } from "@/lib/bildirim";

// Ürün kataloğunda küçük fotoğraf kutusu: tıklayınca fotoğraf seçilir ve hemen kaydedilir.
export default function UrunFotografi({ urunId, gorselId, ad }: { urunId: string; gorselId: string | null; ad: string }) {
  const [id, setId] = useState(gorselId);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [pending, startTransition] = useTransition();

  const sec = async (dosya: File | undefined) => {
    if (!dosya) return;
    setYukleniyor(true);
    try {
      const g = await fotografYukle(dosya);
      startTransition(async () => {
        await urunGorselAyarla(urunId, g.id);
        setId(g.id);
        bildirimGoster("Ürün fotoğrafı kaydedildi.");
      });
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Fotoğraf yüklenemedi");
    } finally {
      setYukleniyor(false);
    }
  };

  const mesgul = yukleniyor || pending;

  return (
    <span className="relative group inline-block">
      <label
        title={id ? "Fotoğrafı değiştir" : "Fotoğraf ekle"}
        className={`focus-ring w-10 h-10 rounded border flex items-center justify-center overflow-hidden cursor-pointer text-[10px] ${
          id ? "border-hat bg-white" : "border-dashed border-metin/30 text-metin/40 hover:border-soguk hover:text-soguk-dim"
        }`}
      >
        {mesgul ? (
          "…"
        ) : id ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/gorsel/${id}`} alt={ad} className="w-full h-full object-contain" />
        ) : (
          "+ foto"
        )}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={mesgul}
          aria-label={`${ad} fotoğrafı`}
          onChange={(e) => {
            sec(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      {id && !mesgul && (
        <button
          type="button"
          title="Fotoğrafı kaldır"
          aria-label="Fotoğrafı kaldır"
          onClick={() => {
            if (!window.confirm("Ürün fotoğrafı kaldırılsın mı?")) return;
            startTransition(async () => {
              await urunGorselAyarla(urunId, null);
              setId(null);
            });
          }}
          className="absolute -top-1.5 -right-1.5 hidden group-hover:flex w-4 h-4 rounded-full bg-sicak-dim text-white text-[10px] leading-none items-center justify-center"
        >
          ×
        </button>
      )}
    </span>
  );
}
