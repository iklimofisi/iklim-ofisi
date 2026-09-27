"use client";

import { useTransition } from "react";
import { siparisOlustur } from "@/lib/actions";
import { useBitinceBildir } from "@/lib/bildirim";

export default function SipariseDonusturButon({ teklifId }: { teklifId: string }) {
  const [pending, startTransition] = useTransition();
  useBitinceBildir(pending, "Sipariş oluşturuldu.");

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Bu teklifi siparişe dönüştürmek istediğine emin misin?")) {
          startTransition(() => siparisOlustur(teklifId));
        }
      }}
      className="focus-ring text-sm bg-metin text-zemin px-4 py-2 rounded-md font-medium hover:bg-soguk-dim transition-colors disabled:opacity-50"
    >
      {pending ? "Oluşturuluyor…" : "Siparişe Dönüştür"}
    </button>
  );
}
