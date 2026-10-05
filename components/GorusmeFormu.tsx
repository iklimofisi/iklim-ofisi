"use client";

import { useRef, useState } from "react";
import { ziyaretEkle } from "@/lib/actions";
import KaydetButonu from "@/components/KaydetButonu";
import HatirlatmaSecici from "@/components/HatirlatmaSecici";
import { GORUSME_TURLERI } from "@/lib/gorusme";

// Müşteri kartında ve teklif sayfasında açılan kısa görüşme notu formu.
// Sayfadan ayrılmadan kaydeder; kayıttan sonra form temizlenir.
export default function GorusmeFormu({
  musteriId,
  projeId,
  teklifId,
  varsayilanTur = "TELEFON",
}: {
  musteriId: string;
  projeId?: string | null;
  teklifId?: string | null;
  varsayilanTur?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [tur, setTur] = useState(varsayilanTur);
  const [sifirla, setSifirla] = useState(0);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await ziyaretEkle(fd);
        formRef.current?.reset();
        setTur(varsayilanTur);
        setSifirla((n) => n + 1);
      }}
      className="bg-yuzey border border-hat rounded-lg p-4 space-y-3"
    >
      <input type="hidden" name="musteriId" value={musteriId} />
      {projeId && <input type="hidden" name="projeId" value={projeId} />}
      {teklifId && <input type="hidden" name="teklifId" value={teklifId} />}
      <input type="hidden" name="tur" value={tur} />

      <div className="flex flex-wrap items-center gap-2">
        {GORUSME_TURLERI.map((t) => (
          <button
            key={t.kod}
            type="button"
            onClick={() => setTur(t.kod)}
            aria-pressed={tur === t.kod}
            className={`focus-ring text-xs px-3 py-1.5 rounded-full border transition-colors ${
              tur === t.kod ? "bg-soguk text-white border-soguk" : "bg-white border-hat text-metin/70 hover:border-soguk"
            }`}
          >
            {t.simge} {t.ad}
          </button>
        ))}
        <input
          name="tarih"
          type="date"
          defaultValue={new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date())}
          aria-label="Görüşme tarihi"
          suppressHydrationWarning
          className="focus-ring ml-auto border border-hat rounded-md px-2 py-1 text-xs bg-white"
        />
      </div>

      <textarea
        name="not"
        required
        rows={2}
        maxLength={5000}
        placeholder="örn. Arandı, fiyatı yüksek buldu. 2 hafta sonra tekrar aranacak."
        className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
      />

      <HatirlatmaSecici sifirla={sifirla} />

      <div className="flex justify-end">
        <KaydetButonu
          basari="Görüşme notu kaydedildi."
          className="focus-ring bg-soguk text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
        >
          Notu Kaydet
        </KaydetButonu>
      </div>
    </form>
  );
}
