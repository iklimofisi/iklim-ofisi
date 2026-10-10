import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isiPompasiModeliKaydet, isiPompasiModeliSil } from "@/lib/isi-hesap-actions";
import KaydetButonu from "@/components/KaydetButonu";
import SilButon from "@/components/SilButon";

export const dynamic = "force-dynamic";

type Model = {
  id: string;
  marka: string;
  model: string;
  kapA7W35: number;
  kapAm7W35: number;
  kapAm7W55: number;
  kapAm15W35: number | null;
  minDisSicaklik: number;
  maksCikis: number;
  yedekIsiticiKw: number;
  urunId: string | null;
  aciklama: string | null;
  aktif: boolean;
};

const s = (x: number | null | undefined) => (x === null || x === undefined ? "" : String(x).replace(".", ","));
const alan = "focus-ring w-full border border-hat rounded-md px-2.5 py-1.5 text-sm bg-white";
const etiket = "block text-[11px] font-medium text-metin/60 mb-1";

function ModelFormu({ m, urunler }: { m?: Model; urunler: { id: string; ad: string; kod: string | null }[] }) {
  return (
    <form action={isiPompasiModeliKaydet} className="grid gap-3 sm:grid-cols-4">
      {m && <input type="hidden" name="id" value={m.id} />}
      <label>
        <span className={etiket}>Marka *</span>
        <input name="marka" required maxLength={80} defaultValue={m?.marka ?? ""} placeholder="Buderus" className={alan} />
      </label>
      <label className="sm:col-span-2">
        <span className={etiket}>Model *</span>
        <input name="model" required maxLength={120} defaultValue={m?.model ?? ""} placeholder="Logatherm WLW… 8 kW" className={alan} />
      </label>
      <label>
        <span className={etiket}>Durum</span>
        <select name="aktif" defaultValue={m && !m.aktif ? "hayir" : "evet"} className={alan}>
          <option value="evet">Öneride kullan</option>
          <option value="hayir">Pasif</option>
        </select>
      </label>
      <label>
        <span className={etiket}>A7/W35 kapasite (kW) *</span>
        <input name="kapA7W35" required inputMode="decimal" defaultValue={s(m?.kapA7W35)} className={alan} />
      </label>
      <label>
        <span className={etiket}>A-7/W35 kapasite (kW) *</span>
        <input name="kapAm7W35" required inputMode="decimal" defaultValue={s(m?.kapAm7W35)} className={alan} />
      </label>
      <label>
        <span className={etiket}>A-7/W55 kapasite (kW) *</span>
        <input name="kapAm7W55" required inputMode="decimal" defaultValue={s(m?.kapAm7W55)} className={alan} />
      </label>
      <label>
        <span className={etiket}>A-15/W35 kapasite (kW)</span>
        <input name="kapAm15W35" inputMode="decimal" defaultValue={s(m?.kapAm15W35)} placeholder="biliniyorsa" className={alan} />
      </label>
      <label>
        <span className={etiket}>Çalışma alt sınırı (°C)</span>
        <input name="minDisSicaklik" inputMode="decimal" defaultValue={s(m?.minDisSicaklik ?? -20)} className={alan} />
      </label>
      <label>
        <span className={etiket}>En yüksek çıkış suyu (°C)</span>
        <input name="maksCikis" inputMode="decimal" defaultValue={s(m?.maksCikis ?? 60)} className={alan} />
      </label>
      <label>
        <span className={etiket}>Dahili elektrikli ısıtıcı (kW)</span>
        <input name="yedekIsiticiKw" inputMode="decimal" defaultValue={s(m?.yedekIsiticiKw ?? 0)} className={alan} />
      </label>
      <label>
        <span className={etiket}>Ürün kataloğu karşılığı (teklif fiyatı)</span>
        <select name="urunId" defaultValue={m?.urunId ?? ""} className={alan}>
          <option value="">— Bağlı değil —</option>
          {urunler.map((u) => (
            <option key={u.id} value={u.id}>
              {u.kod ? `${u.kod} · ` : ""}
              {u.ad}
            </option>
          ))}
        </select>
      </label>
      <label className="sm:col-span-3">
        <span className={etiket}>Not</span>
        <input name="aciklama" maxLength={500} defaultValue={m?.aciklama ?? ""} placeholder="örn. monoblok, R290, 1 faz" className={alan} />
      </label>
      <div className="flex items-end">
        <KaydetButonu basari={null}>{m ? "Kaydet" : "+ Model ekle"}</KaydetButonu>
      </div>
    </form>
  );
}

export default async function IsiPompasiModelleriSayfasi() {
  const [modeller, urunler] = await Promise.all([
    prisma.isiPompasiModeli.findMany({ orderBy: [{ marka: "asc" }, { kapA7W35: "asc" }] }),
    prisma.urun.findMany({ orderBy: { ad: "asc" }, select: { id: true, ad: true, kod: true } }),
  ]);
  const sy = (x: number | null) => (x === null ? "—" : x.toLocaleString("tr-TR", { maximumFractionDigits: 2 }));

  return (
    <div>
      <Link href="/panel/isi-hesabi" className="focus-ring text-sm text-metin/60 hover:text-metin">
        ← Isı pompası hesaplarına dön
      </Link>
      <h1 className="font-display text-2xl font-semibold text-metin mt-4 mb-2">Isı Pompası Modelleri</h1>
      <p className="text-sm text-metin/60 mb-6 max-w-3xl">
        Hesap, tasarım dış sıcaklığı ve gidiş suyu sıcaklığındaki kapasiteyi bu değerlerden ara değerle bulur ve en küçük uygun modeli önerir.
        Değerleri üreticinin teknik veri tablosundan (EN 14511 kapasite, kompresör tam yükte) girin. Buderus ve çalıştığınız diğer markaları
        ekleyebilirsiniz; ürün kataloğuna bağlanan model teklife fiyatıyla aktarılır.
      </p>

      <section className="bg-yuzey border border-hat rounded-lg p-5 mb-8">
        <h2 className="font-display font-semibold text-metin text-sm mb-3">Yeni model</h2>
        <ModelFormu urunler={urunler} />
      </section>

      <div className="space-y-3">
        {modeller.map((m) => (
          <details key={m.id} className="bg-yuzey border border-hat rounded-lg group">
            <summary className="cursor-pointer list-none p-4 flex flex-wrap items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="font-medium text-metin text-sm">
                  {m.marka} {m.model}
                </span>
                {!m.aktif && <span className="ml-2 text-[10px] uppercase bg-hat text-metin/60 rounded px-1.5 py-0.5">pasif</span>}
                <span className="block text-xs text-metin/50 mt-1">
                  A7/W35 {sy(m.kapA7W35)} kW · A-7/W35 {sy(m.kapAm7W35)} kW · A-7/W55 {sy(m.kapAm7W55)} kW · A-15/W35 {sy(m.kapAm15W35)} kW · alt sınır{" "}
                  {sy(m.minDisSicaklik)} °C · maks. {sy(m.maksCikis)} °C
                </span>
              </span>
              <span className="text-xs text-metin/50">
                <span className="group-open:hidden">Düzenle ▾</span>
                <span className="hidden group-open:inline">Kapat ▴</span>
              </span>
            </summary>
            <div className="px-4 pb-4 border-t border-hat pt-4">
              <ModelFormu m={m} urunler={urunler} />
              <div className="mt-4 pt-3 border-t border-hat flex justify-end">
                <SilButon id={m.id} action={isiPompasiModeliSil} onayMesaji={`"${m.marka} ${m.model}" modeli silinsin mi?`} />
              </div>
            </div>
          </details>
        ))}
        {!modeller.length && <p className="text-sm text-metin/50">Henüz model yok.</p>}
      </div>
    </div>
  );
}
