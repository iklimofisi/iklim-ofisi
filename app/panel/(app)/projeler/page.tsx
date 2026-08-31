import { prisma } from "@/lib/prisma";
import { projeEkle, projeSil } from "@/lib/actions";
import HizliMusteriEkleModal from "@/components/HizliMusteriEkleModal"; // MODAL İMPORT
import SilButon from "@/components/SilButon";
import Link from "next/link";

export const dynamic = "force-dynamic";

function paraFormat(n: number, pb: string = "TRY") {
  const sembol = pb === "EUR" ? "€" : pb === "USD" ? "$" : "₺";
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + sembol;
}

const ihaleDurumEtiket: Record<string, string> = {
  TAKIPTE: "Takipte",
  TEKLIF_VERILDI: "Teklif Verildi",
  KAZANILDI: "Kazanıldı",
  KAYBEDILDI: "Kaybedildi",
  IPTAL: "İptal",
};

export default async function ProjelerPage({
  searchParams,
}: {
  searchParams?: { seciliMusteriId?: string; basarili?: string };
}) {
  const [projeler, musteriler] = await Promise.all([
    prisma.proje.findMany({
      include: {
        musteri: true,
        teklifler: true,
        ziyaretler: true,
      },
      orderBy: { olusturmaTarihi: "desc" },
    }),
    prisma.musteri.findMany({ orderBy: { ad: "asc" } }),
  ]);

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">Proje Takibi</h1>
      <p className="text-sm text-metin/60 mb-8">
        İhale/proje bazlı fırsatları takip et — nereden geldiği, kimin aldığı, kaç teklif ve ziyaret yapıldığı burada. Bir teklif oluştururken bu projelerden birine bağlayabilirsin.
      </p>

      {/* YENİ MÜŞTERİ BİLDİRİMİ */}
      {searchParams?.basarili === "musteri-eklendi" && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md p-3 text-xs font-semibold mb-4">
          ✓ Yeni müşteri eklendi ve aşağıda otomatik seçildi!
        </div>
      )}

      {/* YENİ PROJE FORMU */}
      <form action={projeEkle} className="bg-yuzey border border-hat rounded-lg p-5 mb-10">
        <h2 className="font-display font-medium text-metin mb-4">Yeni Proje</h2>

        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Proje Adı *</label>
            <input
              name="ad"
              required
              placeholder="örn. Sancaktepe AVM İklimlendirme İhalesi"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Konum</label>
            <input
              name="konum"
              placeholder="örn. Sancaktepe, İstanbul"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          {/* MÜŞTERİ SEÇİMİ VE HIZLI MÜŞTERİ EKLEME MODALI */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-metin/60">İlgili Müşteri (opsiyonel)</label>
              <HizliMusteriEkleModal yonlendirPath="/panel/projeler" />
            </div>
            <select
              name="musteriId"
              defaultValue={searchParams?.seciliMusteriId ?? ""}
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white font-medium"
            >
              <option value="">— Seçilmedi —</option>
              {musteriler.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.ad}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Proje Nereden Geldi</label>
            <input
              name="kaynak"
              placeholder="örn. mimar tavsiyesi, ihale portalı"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">İhale Durumu</label>
            <select
              name="ihaleDurumu"
              defaultValue="TAKIPTE"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white font-medium"
            >
              <option value="TAKIPTE">Takipte</option>
              <option value="TEKLIF_VERILDI">Teklif Verildi</option>
              <option value="KAZANILDI">Kazanıldı</option>
              <option value="KAYBEDILDI">Kaybedildi</option>
              <option value="IPTAL">İptal</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">İhaleyi Kim Aldı (opsiyonel)</label>
            <input
              name="ihaleyiAlan"
              placeholder="örn. biz / rakip firma adı"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Tahmini Değer</label>
            <input
              name="tahminiDeger"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white font-mono"
            />
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

        <div className="mb-4">
          <label className="block text-xs font-medium text-metin/60 mb-1">Notlar</label>
          <textarea
            name="notlar"
            rows={3}
            placeholder="Proje ile ilgili notlar..."
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
          >
            Projeyi Kaydet
          </button>
        </div>
      </form>

      {/* PROJELER LİSTESİ */}
      <div className="space-y-3">
        {projeler.map((p) => (
          <div key={p.id} className="bg-yuzey border border-hat rounded-lg p-4 flex items-center justify-between gap-3 shadow-sm hover:border-soguk transition-colors">
            <Link href={`/panel/projeler/${p.id}`} className="focus-ring min-w-0 flex-1">
              <p className="font-semibold text-metin text-sm hover:text-soguk-dim transition-colors truncate">
                {p.ad}
              </p>
              <p className="text-xs text-metin/50 mt-0.5">
                {p.konum || "Konum belirtilmedi"}
                {p.musteri && ` · ${p.musteri.ad}`}
                {` · ${p.teklifler.length} teklif`}
                {` · ${p.ziyaretler.length} ziyaret`}
                {p.tahminiDeger && ` · Tahmini: ${paraFormat(p.tahminiDeger, p.paraBirimi)}`}
              </p>
            </Link>

            <div className="flex items-center gap-3 shrink-0">
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                p.ihaleDurumu === 'KAZANILDI' ? 'bg-emerald-100 text-emerald-800' :
                p.ihaleDurumu === 'KAYBEDILDI' || p.ihaleDurumu === 'IPTAL' ? 'bg-rose-100 text-rose-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {ihaleDurumEtiket[p.ihaleDurumu] || p.ihaleDurumu}
              </span>

              <SilButon id={p.id} action={projeSil} onayMesaji="Bu projeyi silmek istediğinize emin misiniz?" />
            </div>
          </div>
        ))}

        {projeler.length === 0 && (
          <p className="text-sm text-metin/50 py-4 text-center">Henüz kayıtlı proje yok.</p>
        )}
      </div>
    </div>
  );
}