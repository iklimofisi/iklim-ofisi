"use client";

import { useEffect } from "react";

// Adres "?yazdir=1" ile açıldıysa (teklif listesindeki "Yazdır" düğmesi)
// sayfa yüklenince yazdırma penceresini kendiliğinden açar.
export default function OtomatikYazdir() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("yazdir") !== "1") return;
    url.searchParams.delete("yazdir");
    window.history.replaceState(window.history.state, "", url.href);
    // Logo ve yazı tipleri yüklensin diye kısa bekleme
    const t = window.setTimeout(() => window.print(), 600);
    return () => window.clearTimeout(t);
  }, []);
  return null;
}
