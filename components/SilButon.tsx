"use client";

import { useTransition } from "react";
import { useBitinceBildir } from "@/lib/bildirim";

export default function SilButon({
  id,
  action,
  onayMesaji,
  ikonSinifi,
}: {
  id: string;
  action: (id: string) => Promise<void>;
  onayMesaji: string;
  ikonSinifi?: string; // doluysa çöp kutusu ikonu olarak çıkar
}) {
  const [pending, startTransition] = useTransition();
  useBitinceBildir(pending, "Silindi.");

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(onayMesaji)) {
          startTransition(() => action(id));
        }
      }}
      className={ikonSinifi ?? "focus-ring text-xs text-metin/40 hover:text-sicak-dim transition-colors disabled:opacity-50"}
      aria-label="Sil"
      title="Sil"
    >
      {ikonSinifi ? (
        pending ? (
          "…"
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
          </svg>
        )
      ) : pending ? (
        "Siliniyor…"
      ) : (
        "Sil"
      )}
    </button>
  );
}
