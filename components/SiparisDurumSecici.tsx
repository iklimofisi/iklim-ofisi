"use client";

import { useTransition } from "react";
import { siparisDurumGuncelle } from "@/lib/actions";

export default function SiparisDurumSecici({
  siparisId,
  mevcutDurum,
}: {
  siparisId: string;
  mevcutDurum: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      {mevcutDurum !== "HAZIRLANIYOR" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (confirm("Durumu 'Hazırlanıyor'a geri almak istediğine emin misin?")) {
              startTransition(() => siparisDurumGuncelle(siparisId, "HAZIRLANIYOR"));
            }
          }}
          className="focus-ring text-xs text-metin/50 hover:text-metin border border-hat rounded-md px-3 py-1.5"
        >
          Hazırlanıyor'a Al
        </button>
      )}
      {mevcutDurum !== "IPTAL" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (confirm("Bu siparişi iptal etmek istediğine emin misin?")) {
              startTransition(() => siparisDurumGuncelle(siparisId, "IPTAL"));
            }
          }}
          className="focus-ring text-xs text-sicak-dim hover:underline"
        >
          İptal Et
        </button>
      )}
    </div>
  );
}
