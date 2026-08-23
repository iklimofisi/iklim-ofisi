import { ziyaretSil } from "@/lib/actions";
import SilButon from "@/components/SilButon";

type ZiyaretGoruntu = {
  id: string;
  tarih: Date;
  not: string;
  hatirlatmaTarihi: Date | null;
  hatirlatmaNotu: string | null;
  hatirlatmaTamam: boolean;
  olusturanAdi: string;
};

export default function ZiyaretListesi({ ziyaretler }: { ziyaretler: ZiyaretGoruntu[] }) {
  if (ziyaretler.length === 0) {
    return <p className="text-sm text-metin/50">Henüz ziyaret kaydı yok.</p>;
  }

  return (
    <div className="space-y-3">
      {ziyaretler.map((z) => (
        <div key={z.id} className="bg-yuzey border border-hat rounded-lg p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-xs text-metin/50">
              {z.tarih.toISOString().slice(0, 10)}
              {z.olusturanAdi && ` · ${z.olusturanAdi}`}
            </p>
            <SilButon id={z.id} action={ziyaretSil} onayMesaji="Bu ziyaret kaydını silmek istediğine emin misin?" />
          </div>
          <p className="text-sm text-metin/80 whitespace-pre-line">{z.not}</p>
          {z.hatirlatmaTarihi && (
            <p className={`text-xs mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${
              z.hatirlatmaTamam ? "bg-hat text-metin/40" : "bg-sicak-light text-sicak-dim"
            }`}>
              ⏰ {z.hatirlatmaTarihi.toISOString().slice(0, 10)}
              {z.hatirlatmaNotu && ` — ${z.hatirlatmaNotu}`}
              {z.hatirlatmaTamam && " (tamamlandı)"}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
