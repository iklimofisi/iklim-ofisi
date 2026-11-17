import { useEffect, useRef } from "react";

// Panelde sağ üstte kısa bildirim göstermek için (yalnızca tarayıcı tarafında çağrılır).
// Bildirimi <KayitBildirimi /> (panel yerleşiminde) yakalar ve gösterir.
export const BILDIRIM_OLAYI = "panel-bildirim";

// hata: true → kırmızı ve daha uzun süre görünür (ör. "Excel dosyası okunamadı")
export function bildirimGoster(metin: string, secenek?: { hata?: boolean }) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BILDIRIM_OLAYI, { detail: secenek?.hata ? { metin, hata: true } : metin }));
}

// useTransition ile çalışan butonlar için: işlem bitince (bekleme true → false) bildirim göster
export function useBitinceBildir(bekliyor: boolean, metin: string | null) {
  const onceki = useRef(false);
  useEffect(() => {
    if (onceki.current && !bekliyor && metin) bildirimGoster(metin);
    onceki.current = bekliyor;
  }, [bekliyor, metin]);
}
