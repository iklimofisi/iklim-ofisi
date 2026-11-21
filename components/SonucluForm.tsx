"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { bildirimGoster } from "@/lib/bildirim";

// -----------------------------------------------------------------------------
// SONUÇ DÖNDÜREN FORM: sunucu işlemi { hata } dönerse form temizlenmeden hata gösterilir;
// { tamam } dönerse bildirim çıkar, sayfa yenilenir (git verilmişse o sayfaya gidilir).
// Gönder düğmesi formun içinde <button type="submit"> olarak verilir; gönderim sırasında
// formdaki tüm düğmeler kilitlenir (çift kayıt olmaz).
// -----------------------------------------------------------------------------
export default function SonucluForm({
  action,
  children,
  className,
  temizle = false,
}: {
  action: (fd: FormData) => Promise<{ hata?: string; tamam?: string; git?: string } | void>;
  children: React.ReactNode;
  className?: string;
  temizle?: boolean; // başarılı olunca formu boşalt
}) {
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const [bekliyor, setBekliyor] = useState(false);
  const [hata, setHata] = useState("");

  return (
    <form
      ref={ref}
      className={className}
      onSubmit={async (e) => {
        e.preventDefault();
        if (bekliyor) return;
        setBekliyor(true);
        setHata("");
        try {
          const r = await action(new FormData(e.currentTarget));
          if (r?.hata) {
            setHata(r.hata);
            bildirimGoster(r.hata, { hata: true });
            return;
          }
          if (r?.tamam) bildirimGoster(r.tamam);
          if (temizle) ref.current?.reset();
          if (r?.git) router.push(r.git);
          else router.refresh();
        } catch {
          setHata("İşlem yapılamadı; sayfayı yenileyip tekrar deneyin.");
          bildirimGoster("İşlem yapılamadı; sayfayı yenileyip tekrar deneyin.", { hata: true });
        } finally {
          setBekliyor(false);
        }
      }}
    >
      <fieldset disabled={bekliyor} className="contents">
        {children}
      </fieldset>
      {hata && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mt-3">{hata}</p>}
    </form>
  );
}
