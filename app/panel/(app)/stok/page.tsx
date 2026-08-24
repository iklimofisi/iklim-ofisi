import { prisma } from "@/lib/prisma";
import { urunStokVeMaliyetGuncelle } from "@/lib/actions";
import StokGirisFormu from "@/components/StokGirisFormu";
import Link from "next/link";

export const dynamic = "force-dynamic";

function paraFormat(n: number, pb: string = "TRY") {
  const sembol = pb === "EUR" ? "€" : pb === "USD" ? "$" : "₺";
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + sembol;
}

export default async function StokYonetimiPage() {
  const [urunler, markalar] = await Promise.all([
    prisma.urun.findMany({
      include: { marka: true },
      orderBy: { ad: "asc" },
    }),
    prisma.marka.findMany({
      select: { id: true, ad: true }, // Uyarı vermemesi için sadece id ve ad çekilir
      orderBy: { ad: "asc" },
    }),
  ]);

  // ÇOKLU DÖVİZ (TL, USD, EUR) ENVANTER MALİYET HESAPLARI
  let toplamTL = 0;
  let toplamUSD = 0;
  let toplamEUR = 0;
  let toplamStokAdedi = 0;

  urunler.forEach((u) => {
    const maliyet = (u.maliyetFiyati + u.ekGiderler) * u.stokMiktari;
    if (u.maliyetParaBirimi === "USD") toplamUSD += maliyet;
    else if (u.maliyetParaBirimi === "EUR") toplamEUR += maliyet;
    else toplamTL += maliyet;

    toplamStokAdedi += u.stokMiktari;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-1">Kurumsal ERP / Envanter</p>
          <h1 className="font-display text-2xl font-bold text-metin">Ağırlıklı Ortalama Stok & Maliyet Paneli</h1>
        </div>
        <Link href="/panel/ayarlar/urunler" className="text-xs bg-soguk-light text-soguk-dim px-3 py-2 rounded font-semibold hover:underline">
          + Ürün Kataloğunu Düzenle →
        </Link>
      </div>

      {/* 📊 ÇOKLU DÖVİZ DÜZELTİLMİŞ ENVANTER KARTLARI */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-yuzey border border-hat p-5 rounded-lg shadow-sm">
          <p className="text-xs font-semibold text-metin/60 uppercase mb-1">Gerçek Envanter Sermaye Değeri</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 font-mono">
            {toplamTL > 0 && `${paraFormat(toplamTL, "TRY")} `}
            {toplamUSD > 0 && `+ ${paraFormat(toplamUSD, "USD")} `}
            {toplamEUR > 0 && `+ ${paraFormat(toplamEUR, "EUR")}`}
            {toplamTL === 0 && toplamUSD === 0 && toplamEUR === 0 && "0,00 ₺"}
          </p>
          <p className="text-[11px] text-metin/50 mt-1">Döviz birimlerine göre ayrıştırılmış alış sermaye değerleri</p>
        </div>

        <div className="bg-yuzey border border-hat p-5 rounded-lg shadow-sm">
          <p className="text-xs font-semibold text-metin/60 uppercase mb-1">Mevcut Toplam Stok Adedi</p>
          <p className="text-3xl font-bold text-metin font-mono">{toplamStokAdedi} Adet</p>
          <p className="text-[11px] text-metin/50 mt-1">{urunler.length} Farklı ürün kalemi</p>
        </div>
      </div>

      {/* 📥 DİNAMİK STOK GİRİŞ FORMU */}
      <StokGirisFormu urunler={urunler} markalar={markalar} />

      {/* 📦 KUSURSUZ HİZALANMIŞ VE ANINDA GÜNCELLENEN STOK TABLOSU */}
      <div className="bg-yuzey border border-hat rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b border-hat bg-slate-50 font-bold text-sm text-metin flex justify-between items-center">
          <span>📦 Stok Listesi, Maliyetler ve Katalog Fiyatları</span>
          <span className="text-xs text-metin/50 font-normal">Kutulardaki değerleri değiştirip Kaydet'e basabilirsiniz.</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-hat text-metin/60 font-semibold">
                <th className="py-3 px-3 w-1/4">Ürün Adı & Kodu</th>
                <th className="py-3 px-2 w-28">Depo Konumu</th>
                <th className="py-3 px-2 text-center w-20">Stok Adedi</th>
                <th className="py-3 px-2 text-right w-24">Alış Fiyatı</th>
                <th className="py-3 px-2 text-right w-24">Ek Gider</th>
                <th className="py-3 px-2 text-right w-28">Net Birim Maliyet</th>
                <th className="py-3 px-2 text-right w-28">Katalog Fiyatı</th>
                <th className="py-3 px-2 text-right w-32">Min. Satış (%20 Kar)</th>
                <th className="py-3 px-3 text-center w-16">Kaydet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hat">
              {urunler.map((u) => {
                const birimMaliyet = u.maliyetFiyati || 0;
                const ekGider = u.ekGiderler || 0;
                const netBirimMaliyet = birimMaliyet; // Ağırlıklı ortalamaya ek gider dahildir
                const minTabanFiyat = netBirimMaliyet * (1 + (u.hedefKarMarjiYuzde || 20) / 100);

                return (
                  <tr key={`${u.id}-${u.stokMiktari}-${u.maliyetFiyati}-${u.ekGiderler}`} className="hover:bg-slate-50/50">
                    {/* Gizli HTML5 Formu */}
                    <td className="hidden">
                      <form id={`form-${u.id}`} action={urunStokVeMaliyetGuncelle}>
                        <input type="hidden" name="urunId" value={u.id} />
                      </form>
                    </td>

                    {/* Ürün Kodu & Adı */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-metin text-sm">{u.ad}</div>
                      {u.kod && <div className="text-[10px] font-mono text-metin/50">Kod: {u.kod} | Marka: {u.marka?.ad || '—'}</div>}
                    </td>

                    {/* Depo Konumu */}
                    <td className="py-3 px-2">
                      <input
                        form={`form-${u.id}`}
                        name="depoKonumu"
                        key={`depo-${u.id}-${u.depoKonumu}`}
                        defaultValue={u.depoKonumu || ""}
                        placeholder="Raf No"
                        className="w-full border border-hat rounded px-2 py-1 text-xs bg-white text-metin"
                      />
                    </td>

                    {/* Stok Miktarı */}
                    <td className="py-3 px-2 text-center">
                      <input
                        form={`form-${u.id}`}
                        name="stokMiktari"
                        key={`stok-${u.id}-${u.stokMiktari}`}
                        type="text"
                        inputMode="decimal"
                        defaultValue={u.stokMiktari}
                        className="w-16 text-center font-bold font-mono border border-hat rounded px-2 py-1 text-xs bg-white text-metin"
                      />
                    </td>

                    {/* Birim Alış Maliyeti */}
                    <td className="py-3 px-2 text-right">
                      <input
                        form={`form-${u.id}`}
                        name="maliyetFiyati"
                        key={`maliyet-${u.id}-${u.maliyetFiyati}`}
                        type="text"
                        inputMode="decimal"
                        defaultValue={u.maliyetFiyati}
                        placeholder="0,00"
                        className="w-20 text-right font-mono font-bold border border-hat rounded px-2 py-1 text-xs bg-white text-rose-800"
                      />
                    </td>

                    {/* Birim Ek Gider */}
                    <td className="py-3 px-2 text-right">
                      <input
                        form={`form-${u.id}`}
                        name="ekGiderler"
                        key={`ek-${u.id}-${u.ekGiderler}`}
                        type="text"
                        inputMode="decimal"
                        defaultValue={u.ekGiderler}
                        placeholder="0,00"
                        className="w-20 text-right font-mono border border-hat rounded px-2 py-1 text-xs bg-white text-amber-800"
                      />
                    </td>

                    {/* Net Birim Maliyet */}
                    <td className="py-3 px-2 text-right font-mono font-bold text-rose-700 bg-rose-50/30">
                      {paraFormat(netBirimMaliyet, u.maliyetParaBirimi)}
                    </td>

                    {/* Katalog Satış Fiyatı */}
                    <td className="py-3 px-2 text-right font-mono font-bold text-soguk-dim">
                      {paraFormat(u.listeFiyati, u.paraBirimi)}
                    </td>

                    {/* Önerilen Min Taban Satış Fiyatı (%20 Kar) */}
                    <td className="py-3 px-2 text-right font-mono font-bold text-emerald-700 bg-emerald-50/50">
                      {paraFormat(minTabanFiyat, u.maliyetParaBirimi || u.paraBirimi)}
                    </td>

                    {/* Kaydet Butonu */}
                    <td className="py-3 px-3 text-center">
                      <button
                        form={`form-${u.id}`}
                        type="submit"
                        className="bg-soguk text-white px-3 py-1 rounded text-xs font-bold hover:bg-soguk-dim transition-colors shadow-sm"
                      >
                        Kaydet
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}