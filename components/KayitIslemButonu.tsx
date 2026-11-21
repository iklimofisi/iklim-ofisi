"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { onayIste } from "@/lib/onay";
import { bildirimGoster } from "@/lib/bildirim";
import type { IslemSonucu } from "@/lib/actions";

// -----------------------------------------------------------------------------
// KAYIT GÜVENCESİ DÜĞMESİ (iptal et / arşivle / arşivden çıkar / sil)
// Kayıtlar silinmez: finansal hareket ve sipariş iptal edilir (neden yazılması zorunlu),
// teklif arşive kaldırılır. İşlemin sonucu (yapıldı ya da neden yapılamadığı) sağ üstte
// bildirim olarak görünür.
// nedenIste: düğmeye basınca küçük bir "iptal nedeni" kutusu açılır.
// -----------------------------------------------------------------------------
export default function KayitIslemButonu({
  id,
  action,
  etiket,
  onayMesaji,
  onayBasligi = "Onay",
  nedenIste = false,
  tehlikeli = false,
  className,
  icerik,
  sonraGit,
}: {
  id: string;
  action: (id: string, neden: string) => Promise<IslemSonucu | void>;
  etiket: string;
  onayMesaji: string;
  onayBasligi?: string;
  nedenIste?: boolean;
  tehlikeli?: boolean;
  className?: string;
  icerik?: React.ReactNode; // düğmenin içinde yazı yerine (ör. ikon); etiket yine onay düğmesinde ve ipucunda kullanılır
  sonraGit?: string; // işlem başarılıysa bu sayfaya gidilir (ör. silinen kaydın detay sayfasından listeye)
}) {
  const router = useRouter();
  const [bekliyor, setBekliyor] = useState(false);
  const [acik, setAcik] = useState(false);
  const [neden, setNeden] = useState("");

  const calistir = async (n: string) => {
    if (bekliyor) return;
    setBekliyor(true);
    try {
      const r = await action(id, n);
      if (r?.hata) bildirimGoster(r.hata, { hata: true });
      else {
        if (r?.tamam) bildirimGoster(r.tamam);
        setAcik(false);
        setNeden("");
        if (sonraGit) router.push(sonraGit);
        else router.refresh();
      }
    } catch {
      bildirimGoster("İşlem yapılamadı; sayfayı yenileyip tekrar deneyin.", { hata: true });
    } finally {
      setBekliyor(false);
    }
  };

  const sinif = className ?? "focus-ring text-xs text-metin/50 hover:text-sicak-dim transition-colors disabled:opacity-50";

  if (nedenIste && acik)
    return (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        <input
          autoFocus
          value={neden}
          onChange={(e) => setNeden(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setAcik(false);
            if (e.key === "Enter") {
              e.preventDefault();
              if (neden.trim()) calistir(neden.trim());
            }
          }}
          maxLength={500}
          placeholder="İptal nedeni (zorunlu)"
          aria-label="İptal nedeni"
          className="focus-ring border border-hat rounded px-2 py-1 text-xs bg-white w-48"
        />
        <button
          type="button"
          disabled={bekliyor || !neden.trim()}
          onClick={() => calistir(neden.trim())}
          className="focus-ring text-xs font-semibold text-white bg-sicak-dim rounded px-2 py-1 disabled:opacity-40"
        >
          {bekliyor ? "…" : etiket}
        </button>
        <button type="button" onClick={() => setAcik(false)} className="focus-ring text-xs text-metin/50 hover:text-metin">
          Vazgeç
        </button>
      </span>
    );

  return (
    <button
      type="button"
      disabled={bekliyor}
      onClick={async () => {
        if (nedenIste) {
          setAcik(true);
          return;
        }
        if (await onayIste(onayMesaji, { baslik: onayBasligi, onayMetni: etiket, tehlikeli })) calistir("");
      }}
      className={sinif}
      title={icerik ? etiket : nedenIste ? onayMesaji : undefined}
      aria-label={icerik ? etiket : undefined}
    >
      {bekliyor ? "…" : icerik ?? etiket}
    </button>
  );
}
