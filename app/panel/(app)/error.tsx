"use client";

// Panel hata ekranı: bir işlem ya da sayfa hata verince (ör. rolün yetkisi olmayan bir
// işlem denendiğinde) kullanıcı boş / İngilizce hata sayfası yerine bunu görür.
// Canlıda Next.js hata metnini gizler; bu yüzden genel bir açıklama gösterilir.
import Link from "next/link";

export default function PanelHata({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const yetki = /yetki/i.test(error?.message ?? "");
  return (
    <div className="max-w-xl bg-sicak-light border border-sicak/30 rounded-lg p-6">
      <p className="font-display text-lg font-semibold text-sicak-dim mb-2">İşlem tamamlanamadı</p>
      <p className="text-sm text-metin/70 mb-4">
        {yetki
          ? error.message
          : "Bu işlem için yetkiniz olmayabilir ya da geçici bir hata oluştu. Kayıtlarınız değişmedi. Sayfayı yenileyip tekrar deneyin; sorun sürerse admin ile görüşün."}
      </p>
      {error?.digest && <p className="text-[11px] text-metin/40 mb-4 font-mono">Hata kodu: {error.digest}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => reset()} className="focus-ring text-sm font-medium bg-soguk text-white rounded-md px-4 py-2 hover:bg-soguk-dim">
          Tekrar dene
        </button>
        <Link href="/panel" className="focus-ring text-sm font-medium border border-hat bg-white rounded-md px-4 py-2 text-metin/70 hover:border-soguk">
          Özete dön
        </Link>
      </div>
    </div>
  );
}
