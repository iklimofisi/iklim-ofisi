"use client";

import { useTransition } from "react";
import { useBitinceBildir } from "@/lib/bildirim";
import { onayIste } from "@/lib/onay";
import { siparisDurumGuncelle } from "@/lib/actions";

export default function SiparisDurumSecici({
  siparisId,
  mevcutDurum,
}: {
  siparisId: string;
  mevcutDurum: string;
}) {
  const [pending, startTransition] = useTransition();
  useBitinceBildir(pending, "Sipariş durumu güncellendi.");

  return (
    <div className="flex items-center gap-2">
      {mevcutDurum !== "HAZIRLANIYOR" && (
        <button
          type="button"
          disabled={pending}
          onClick={async () => {
            if (await onayIste("Sipariş durumu 'Hazırlanıyor'a geri alınsın mı?", { onayMetni: "Hazırlanıyor'a al" })) {
              startTransition(() => siparisDurumGuncelle(siparisId, "HAZIRLANIYOR"));
            }
          }}
          className="focus-ring text-xs text-metin/50 hover:text-metin border border-hat rounded-md px-3 py-1.5"
        >
          Hazırlanıyor'a Al
        </button>
      )}
      {/* İptal: sipariş sayfasının üstündeki "Siparişi iptal et" (yalnız satış müdürü, neden zorunlu) */}
    </div>
  );
}
