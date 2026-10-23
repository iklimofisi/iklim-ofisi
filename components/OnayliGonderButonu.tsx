"use client";

import { useFormStatus } from "react-dom";

// Form gönder düğmesi; göndermeden önce onay sorar (geri alınamayan işlemler için)
export default function OnayliGonderButonu({
  onayMesaji,
  bekleme = "İşleniyor…",
  children,
  className = "focus-ring border border-sicak/50 text-sicak-dim bg-white px-4 py-2 rounded-md text-sm font-medium hover:bg-sicak-light transition-colors",
}: {
  onayMesaji: string;
  bekleme?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm(onayMesaji)) e.preventDefault();
      }}
      className={`${className} disabled:opacity-60 disabled:cursor-wait`}
    >
      {pending ? bekleme : children}
    </button>
  );
}
