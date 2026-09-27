"use client";

import { useFormStatus } from "react-dom";

// Form gönderilirken "Kaydediliyor…" gösterir ve ikinci tıklamayı engeller.
export default function KaydetButonu({
  children,
  bekleme = "Kaydediliyor…",
  className = "focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors",
}: {
  children: React.ReactNode;
  bekleme?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${className} disabled:opacity-60 disabled:cursor-wait`}>
      {pending ? bekleme : children}
    </button>
  );
}
