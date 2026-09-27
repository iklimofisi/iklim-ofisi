"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { bildirimGoster } from "@/lib/bildirim";

// Form gönderilirken "Kaydediliyor…" gösterir ve ikinci tıklamayı engeller.
// İşlem bitince sağ üstte "✓ Kaydedildi." bildirimi çıkar.
export default function KaydetButonu({
  children,
  bekleme = "Kaydediliyor…",
  basari = "Kaydedildi.",
  className = "focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors",
}: {
  children: React.ReactNode;
  bekleme?: string;
  basari?: string | null; // null: bildirim gösterme
  className?: string;
}) {
  const { pending } = useFormStatus();
  const oncekiBekleme = useRef(false);

  useEffect(() => {
    if (oncekiBekleme.current && !pending && basari) bildirimGoster(basari);
    oncekiBekleme.current = pending;
  }, [pending, basari]);

  return (
    <button type="submit" disabled={pending} className={`${className} disabled:opacity-60 disabled:cursor-wait`}>
      {pending ? bekleme : children}
    </button>
  );
}
