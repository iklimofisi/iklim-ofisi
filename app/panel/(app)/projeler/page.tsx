import { prisma } from "@/lib/prisma";
import { projeEkle } from "@/lib/actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

const ihaleDurumEtiket: Record<string, string> = {
  TAKIPTE: "Takipte",
  TEKLIF_VERILDI: "Teklif Verildi",
  KAZANILDI: "Kazanıldı",
  KAYBEDILDI: "Kaybedildi",
  IPTAL: "İptal",
};

const ihaleDurumRenk: Record<string, string> = {
  TAKIPTE: "bg-hat text-metin/60",
  TEKLIF_VERILDI: "bg-soguk-light text-soguk-dim",
  KAZANILDI: "bg-soguk text-white",
  KAYBEDILDI: "bg-sicak-light text-sicak-dim",
  IPTAL: "bg-hat text-metin/40",
};

function paraFormat(n: number, paraBirimi: string = "TRY") {
  return n.toLocaleString("tr-TR", { style: "currency", currency: paraBirimi });
}

export default async function ProjelerSayfasi() {
  const [projeler, musteriler] = await Promise.all([
    prisma.proje.findMany({
      include: { musteri: true, teklifler: true, ziyaretler: true },
      orderBy: { olusturmaTarihi: "desc" },
    }),
    prisma.musteri.findMany({ orderBy: { ad: "asc" } }),
  ]);

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">Proje Takibi</h1>
      <p className="text-sm text-metin/60 mb-8">
        İhale/proje bazlı fırsatları takip et — nereden geldiği, kimin
        aldığı, kaç teklif ve ziyaret yapıldığı burada. Bir teklif
        oluştururken bu projelerden birine bağlayabilirsin.
      </p>

      <form action={projeEkle} className="bg-yuzey border border-hat rounded-lg p-5 mb-10">
        <h2 className="font-display font-medium text-metin mb-4">Yeni Proje</h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Proje Adı</label>
            <input name="ad" required className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" placeholder="örn. Sancaktepe AVM İklimlendirme İhalesi" />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Konum</label>
            <input name="konum" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" placeholder="örn. Sancaktepe, İstanbul" />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">İlgili Müşteri (opsiyonel)</label>
            <select name="musteriId" defaultValue="" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
              <option value="">— Seçilmedi —</option>
              {musteriler.map((m) => (
                <option key={m.id} value={m.id}>{m.ad}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Proje Nereden Geldi</label>
            <input name="kaynak" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" placeholder="örn. mimar tavsiyesi, ihale portalı" />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">İhale Durumu</label>
            <select name="ihaleDurumu" defaultValue="TAKIPTE" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
              {Object.entries(ihaleDurumEtiket).map(([deger, etiket]) => (
                <option key={deger} value={deger}>{etiket}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">İhaleyi Kim Aldı (opsiyonel)</label>
            <input name="ihaleyiAlan" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" placeholder="örn. biz / rakip firma adı" />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Tahmini Değer</label>
            <input name="tahminiDeger" type="number" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Para Birimi</label>
            <select name="paraBirimi" defaultValue="TRY" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
              <option value="TRY">₺ TRY</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
            </select>
          </div>
        </div>
        <label className="block text-xs font-medium text-metin/60 mb-1">Notlar</label>
        <textarea name="notlar" rows={2} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm mb-4" />
        <div className="flex justify-end">
          <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors">
            Projeyi Kaydet
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {projeler.map((p) => (
          <Link
            key={p.id}
            href={`/panel/projeler/${p.id}`}
            className="focus-ring block bg-yuzey border border-hat rounded-lg p-4 hover:border-soguk transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-metin text-sm truncate">{p.ad}</p>
                <p className="text-xs text-metin/50">
                  {p.konum && `${p.konum} · `}
                  {p.musteri && `${p.musteri.ad} · `}
                  {p.teklifler.length} teklif · {p.ziyaretler.length} ziyaret
                </p>
              </div>
              <div className="text-right shrink-0">
                {p.tahminiDeger && <p className="font-mono text-sm text-metin">{paraFormat(p.tahminiDeger, p.paraBirimi)}</p>}
                <span className={`text-xs px-2 py-0.5 rounded-full ${ihaleDurumRenk[p.ihaleDurumu]}`}>
                  {ihaleDurumEtiket[p.ihaleDurumu]}
                </span>
              </div>
            </div>
          </Link>
        ))}
        {projeler.length === 0 && (
          <p className="text-sm text-metin/50">Henüz proje eklenmedi.</p>
        )}
      </div>
    </div>
  );
}
