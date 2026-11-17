"use client";

import { useTransition } from "react";
import { siparisOlustur } from "@/lib/actions";
import { useBitinceBildir } from "@/lib/bildirim";
import { onayIste } from "@/lib/onay";

export default function SipariseDonusturButon({ teklifId }: { teklifId: string }) {
  const [pending, startTransition] = useTransition();
  useBitinceBildir(pending, "Sipariş oluşturuldu.");

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        if (await onayIste("Bu teklif siparişe dönüştürülsün mü?", { onayMetni: "Siparişe dönüştür" })) {
          startTransition(() => siparisOlustur(teklifId));
        }
      }}
      className="focus-ring text-sm bg-metin text-zemin px-4 py-2 rounded-md font-medium hover:bg-soguk-dim transition-colors disabled:opacity-50"
    >
      {pending ? "Oluşturuluyor…" : "Siparişe Dönüştür"}
    </button>
  );
}
