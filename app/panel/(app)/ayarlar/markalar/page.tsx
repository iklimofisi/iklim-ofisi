import { prisma } from "@/lib/prisma";
import { markaEkle, markaSil } from "@/lib/actions";
import SilButon from "@/components/SilButon";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MarkalarSayfasi() {
  const markalar = await prisma.marka.findMany({ orderBy: { ad: "asc" } });

  return (
    <div>
      <Link href="/panel/ayarlar" className="focus-ring text-sm text-metin/60 hover:text-metin mb-6 inline-block">
        ← Ayarlara dön
      </Link>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">Markalar</h1>
      <p className="text-sm text-metin/60 mb-8">
        Buraya eklediğin markalar, teklif oluştururken her kalem için
        seçilebilir olur. Bir kalemde marka seçersen, logosu teklif PDF'inde
        o kalemin yanında görünür. Marka seçmezsen PDF'te logo alanı boş
        kalır.
      </p>

      <form action={markaEkle} className="bg-yuzey border border-hat rounded-lg p-5 mb-8 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-metin/60 mb-1">Marka Adı</label>
          <input name="ad" required className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" placeholder="örn. Daikin" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-metin/60 mb-1">Logo (PNG/JPG/SVG, opsiyonel)</label>
          <input name="logo" type="file" accept="image/*" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white" />
        </div>
        <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors">
          Ekle
        </button>
      </form>

      <div className="bg-yuzey border border-hat rounded-lg divide-y divide-hat">
        {markalar.map((m) => (
          <div key={m.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {m.logo ? (
                <Image src={`/api/marka/${m.id}/logo`} alt={m.ad} width={32} height={32} className="object-contain" unoptimized />
              ) : (
                <div className="w-8 h-8 rounded bg-hat" />
              )}
              <span className="text-sm text-metin">{m.ad}</span>
            </div>
            <SilButon id={m.id} action={markaSil} onayMesaji={`${m.ad} markasını silmek istediğine emin misin?`} />
          </div>
        ))}
        {markalar.length === 0 && (
          <p className="p-4 text-sm text-metin/50">Henüz marka eklenmedi.</p>
        )}
      </div>
    </div>
  );
}
