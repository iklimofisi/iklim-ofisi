"use client";

import { useFormStatus } from "react-dom";
import { onayIste } from "@/lib/onay";

// Form gönder düğmesi; göndermeden önce onay sorar (geri alınamayan işlemler için)
export default function OnayliGonderButonu({
  onayMesaji,
  onayMetni = "Devam et",
  bekleme = "İşleniyor…",
  children,
  className = "focus-ring border border-sicak/50 text-sicak-dim bg-white px-4 py-2 rounded-md text-sm font-medium hover:bg-sicak-light transition-colors",
}: {
  onayMesaji: string;
  onayMetni?: string; // penceredeki onay düğmesinin yazısı
  bekleme?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={async (e) => {
        // Gönderimi durdur, panelin onay penceresini aç; onaylanırsa formu bu düğmeyle gönder
        e.preventDefault();
        const dugme = e.currentTarget;
        if (await onayIste(onayMesaji, { onayMetni, tehlikeli: true })) dugme.form?.requestSubmit(dugme);
      }}
      className={`${className} disabled:opacity-60 disabled:cursor-wait`}
    >
      {pending ? bekleme : children}
    </button>
  );
}
