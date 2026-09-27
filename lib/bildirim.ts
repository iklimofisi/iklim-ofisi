import { useEffect, useRef } from "react";

// Panelde sağ üstte kısa bildirim göstermek için (yalnızca tarayıcı tarafında çağrılır).
// Bildirimi <KayitBildirimi /> (panel yerleşiminde) yakalar ve gösterir.
export const BILDIRIM_OLAYI = "panel-bildirim";

export function bildirimGoster(metin: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BILDIRIM_OLAYI, { detail: metin }));
}

// useTransition ile çalışan butonlar için: işlem bitince (bekleme true → false) bildirim göster
export function useBitinceBildir(bekliyor: boolean, metin: string | null) {
  const onceki = useRef(false);
  useEffect(() => {
    if (onceki.current && !bekliyor && metin) bildirimGoster(metin);
    onceki.current = bekliyor;
  }, [bekliyor, metin]);
}
