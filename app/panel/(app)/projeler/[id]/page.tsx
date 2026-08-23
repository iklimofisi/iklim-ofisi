import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { projeGuncelle, projeSil } from "@/lib/actions";
import SilButon from "@/components/SilButon";
import ZiyaretEkleFormu from "@/components/ZiyaretEkleFormu";
import ZiyaretListesi from "@/components/ZiyaretListesi";

export const dynamic = "force-dynamic";

const ihaleDurumEtiket: Record<string, string> = {
  TAKIPTE: "Takipte",
  TEKLIF_VERILDI: "Teklif Verildi",
  KAZANILDI: "Kazanıldı",
  KAYBEDILDI: "Kaybedildi",
  IPTAL: "İptal",
};

function paraFormat(n: number, paraBirimi: string = "TRY") {
  return n.toLocaleString("tr-TR", { style: "currency", currency: paraBirimi });
}

export default async function ProjeDetay({ params }: { params: { id: string } }) {
  const [proje, musteriler] = await Promise.all([
    prisma.proje.findUnique({
      where: { id: params.id },
      include: {
        musteri: true,
        teklifler: { include: { musteri: true, kalemler: true }, orderBy: { tarih: "desc" } },
        ziyaretler: { orderBy: { tarih: "desc" } },
      },
    }),
    prisma.musteri.findMany({ orderBy: { ad: "asc" } }),
  ]);

  if (!proje) notFound();

  return (
    <div>
      <Link href="/panel/projeler" className="focus-ring text-sm text-metin/60 hover:text-metin mb-6 inline-block">
        ← Projelere dön
      </Link>

      <div className="flex items-start justify-between mb-8 gap-3">
        <div>
          <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Proje</p>
          <h1 className="font-display text-2xl font-semibold text-metin">{proje.ad}</h1>
        </div>
        <SilButon id={proje.id} action={projeSil} onayMesaji="Bu projeyi silmek istediğine emin misin?" />
      </div>

      <details className="bg-yuzey border border-hat rounded-lg mb-8">
        <summary className="cursor-pointer select-none px-5 py-3 text-sm font-medium text-metin/70">
          Proje Bilgilerini Düzenle
        </summary>
        <form action={projeGuncelle} className="p-5 pt-0 space-y-3">
          <input type="hidden" name="projeId" value={proje.id} />
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Proje Adı</label>
              <input name="ad" required defaultValue={proje.ad} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Konum</label>
              <input name="konum" defaultValue={proje.konum ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">İlgili Müşteri</label>
              <select name="musteriId" defaultValue={proje.musteriId ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
                <option value="">— Seçilmedi —</option>
                {musteriler.map((m) => (
                  <option key={m.id} value={m.id}>{m.ad}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Proje Nereden Geldi</label>
              <input name="kaynak" defaultValue={proje.kaynak ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">İhale Durumu</label>
              <select name="ihaleDurumu" defaultValue={proje.ihaleDurumu} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
                {Object.entries(ihaleDurumEtiket).map(([deger, etiket]) => (
                  <option key={deger} value={deger}>{etiket}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">İhaleyi Kim Aldı</label>
              <input name="ihaleyiAlan" defaultValue={proje.ihaleyiAlan ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Tahmini Değer</label>
              <input name="tahminiDeger" type="number" defaultValue={proje.tahminiDeger ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Para Birimi</label>
              <select name="paraBirimi" defaultValue={proje.paraBirimi} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
                <option value="TRY">₺ TRY</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Notlar</label>
            <textarea name="notlar" rows={3} defaultValue={proje.notlar ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors">
            Kaydet
          </button>
        </form>
      </details>

      <div className="grid sm:grid-cols-2 gap-6 mb-8 text-sm">
        <div className="bg-yuzey border border-hat rounded-lg p-5 space-y-1">
          <p className="text-xs text-metin/50 mb-2">Proje Bilgisi</p>
          <p className="text-metin/70"><span className="text-metin/40">Konum:</span> {proje.konum ?? "—"}</p>
          <p className="text-metin/70"><span className="text-metin/40">Müşteri:</span> {proje.musteri ? (
            <Link href={`/panel/musteriler/${proje.musteri.id}`} className="text-soguk-dim hover:underline">{proje.musteri.ad}</Link>
          ) : "—"}</p>
          <p className="text-metin/70"><span className="text-metin/40">Kaynak:</span> {proje.kaynak ?? "—"}</p>
        </div>
        <div className="bg-yuzey border border-hat rounded-lg p-5 space-y-1">
          <p className="text-xs text-metin/50 mb-2">İhale Durumu</p>
          <p className="text-metin">{ihaleDurumEtiket[proje.ihaleDurumu]}</p>
          <p className="text-metin/70"><span className="text-metin/40">İhaleyi Alan:</span> {proje.ihaleyiAlan ?? "—"}</p>
          {proje.tahminiDeger && (
            <p className="text-metin/70"><span className="text-metin/40">Tahmini Değer:</span> {paraFormat(proje.tahminiDeger, proje.paraBirimi)}</p>
          )}
        </div>
      </div>

      {proje.notlar && (
        <div className="bg-yuzey border border-hat rounded-lg p-5 mb-8">
          <p className="text-xs text-metin/50 mb-2">Notlar</p>
          <p className="text-sm text-metin/70 whitespace-pre-line">{proje.notlar}</p>
        </div>
      )}

      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-medium text-metin">Teklifler ({proje.teklifler.length})</h2>
          <Link href={`/panel/teklifler?proje=${encodeURIComponent(proje.ad)}`} className="text-xs text-soguk-dim hover:underline">
            Yeni teklif oluştururken bu projeye bağla →
          </Link>
        </div>
        <div className="space-y-2">
          {proje.teklifler.map((t) => {
            const toplam = t.kalemler.reduce((a, k) => a + k.adet * k.birimFiyat * (1 - k.iskontoYuzde / 100), 0);
            return (
              <Link key={t.id} href={`/panel/teklifler/${t.id}`} className="focus-ring block bg-yuzey border border-hat rounded-lg p-4 hover:border-soguk transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-metin truncate">
                    <span className="font-mono text-soguk-dim">TKL-{String(t.teklifNo).padStart(4, "0")}</span> {t.baslik}
                  </p>
                  <p className="font-mono text-sm text-metin shrink-0">{paraFormat(toplam, t.paraBirimi)}</p>
                </div>
              </Link>
            );
          })}
          {proje.teklifler.length === 0 && (
            <p className="text-sm text-metin/50">Bu projeye henüz teklif bağlanmadı.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display font-medium text-metin mb-3">Ziyaretler</h2>
        <ZiyaretEkleFormu projeId={proje.id} />
        <ZiyaretListesi ziyaretler={proje.ziyaretler} />
      </div>
    </div>
  );
}
