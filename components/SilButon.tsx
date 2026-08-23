"use client";

import { useTransition } from "react";

export default function SilButon({
  id,
  action,
  onayMesaji,
}: {
  id: string;
  action: (id: string) => Promise<void>;
  onayMesaji: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(onayMesaji)) {
          startTransition(() => action(id));
        }
      }}
      className="focus-ring text-xs text-metin/40 hover:text-sicak-dim transition-colors disabled:opacity-50"
      aria-label="Sil"
      title="Sil"
    >
      {pending ? "Siliniyor…" : "Sil"}
    </button>
  );
}
