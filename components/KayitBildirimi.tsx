"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Panelde kaydet/sil sonrası sağ üstte görünen kısa bildirim.
// Sunucu işlemi "?mesaj=..." ile yönlendirir; bildirim birkaç saniye görünür,
// sonra adres çubuğundaki mesaj temizlenir (sayfa yenilenince tekrar çıkmaz).
const MESAJLAR: Record<string, string> = {
  "sablon-eklendi": "Teklif notu eklendi.",
  "sablon-guncellendi": "Teklif notu kaydedildi.",
  "sablon-silindi": "Teklif notu silindi.",
  "sirket-kaydedildi": "Şirket bilgileri kaydedildi.",
  kaydedildi: "Kaydedildi.",
};

export default function KayitBildirimi() {
  const params = useSearchParams();
  const router = useRouter();
  const yol = usePathname();
  const kod = params.get("mesaj");
  const [metin, setMetin] = useState<string | null>(null);

  useEffect(() => {
    if (!kod) return;
    setMetin(MESAJLAR[kod] ?? MESAJLAR.kaydedildi);
    // Adres çubuğundan mesajı kaldır (diğer parametreler kalır)
    const kalan = new URLSearchParams(params.toString());
    kalan.delete("mesaj");
    const q = kalan.toString();
    router.replace(`${yol}${q ? `?${q}` : ""}${typeof window !== "undefined" ? window.location.hash : ""}`, { scroll: false });
  }, [kod, params, router, yol]);

  // Bildirim 3,5 saniye sonra kendiliğinden kapanır
  useEffect(() => {
    if (!metin) return;
    const t = setTimeout(() => setMetin(null), 3500);
    return () => clearTimeout(t);
  }, [metin]);

  if (!metin) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-soguk text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg print:hidden"
    >
      <span aria-hidden>✓</span>
      {metin}
      <button type="button" onClick={() => setMetin(null)} className="ml-2 text-white/70 hover:text-white" aria-label="Kapat">
        ×
      </button>
    </div>
  );
}
