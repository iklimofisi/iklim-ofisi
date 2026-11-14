"use client";

import { useEffect } from "react";

// -----------------------------------------------------------------------------
// GOOGLE ADS FORM DÖNÜŞÜMÜ
// İletişim formu kaydedilip "?basarili=true&talep=<id>" sayfasına dönülünce
// "Potansiyel müşteri formu gönderimi" dönüşümü bir kez gönderilir.
// Sayfa yenilenirse aynı talep tekrar sayılmaz (tarayıcıda işaretlenir; ayrıca
// talep kimliği transaction_id olarak gider, Google da tekrarı ayıklar).
// gtag_report_conversion app/layout.tsx'te tanımlıdır; yüklenmesi biraz
// gecikebileceği için en çok ~10 sn beklenir.
// -----------------------------------------------------------------------------

type Pencere = Window & { gtag_report_conversion?: (url?: string, talepId?: string) => boolean };

export default function FormDonusumu({ talepId }: { talepId: string }) {
  useEffect(() => {
    if (!talepId) return;
    const anahtar = `ads-donusum:${talepId}`;
    try {
      if (window.sessionStorage.getItem(anahtar)) return;
    } catch {
      // Tarayıcı depolaması kapalıysa yine de gönderilir (Google transaction_id ile tekrarı ayıklar)
    }
    let deneme = 0;
    let zamanlayici: ReturnType<typeof setTimeout> | undefined;
    const gonder = () => {
      const w = window as Pencere;
      if (typeof w.gtag_report_conversion === "function") {
        w.gtag_report_conversion(undefined, talepId);
        try {
          window.sessionStorage.setItem(anahtar, "1");
        } catch {
          // önemsiz
        }
        return;
      }
      if (deneme++ < 40) zamanlayici = setTimeout(gonder, 250);
    };
    gonder();
    return () => {
      if (zamanlayici) clearTimeout(zamanlayici);
    };
  }, [talepId]);
  return null;
}
