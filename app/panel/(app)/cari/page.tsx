import { prisma } from "@/lib/prisma";
import { cariHareketEkle, cariHareketSil } from "@/lib/actions";
import CariFiltre from "@/components/CariFiltre";
import SilButon from "@/components/SilButon";
import OdemeAlModal from "@/components/OdemeAlModal";

export const dynamic = "force-dynamic";

function paraFormat(n: number) {
  return n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

export default async function CariSayfasi({
  searchParams,
}: {
  searchParams: { musteri?: string };
}) {
  const seciliMusteri = searchParams?.musteri ?? "hepsi";

  const bugun = new Date();
  const onBesGunSonra = new Date();
  onBesGunSonra.setDate(bugun.getDate() + 15);

  const [musteriler, hareketler, yaklasanCekler] = await Promise.all([
    prisma.musteri.findMany({ orderBy: { ad: "asc" } }),
    prisma.cariHareket.findMany({
      where: seciliMusteri === "hepsi" ? {} : { musteriId: seciliMusteri },
      include: { musteri: true },
      orderBy: { tarih: "desc" },
    }),
    // Vadesi önümüzdeki 15 gün içinde olan Çekler
    prisma.cariHareket.findMany({
      where: {
        vadeTarihi: { gte: bugun, lte: onBesGunSonra },
      },
      include: { musteri: true },
      orderBy: { vadeTarihi: "asc" },
    }),
  ]);

  const bakiye = hareketler.reduce((a, c) => a + (c.tur === "BORC" ? c.tutar : -c.tutar), 0);

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-6">Cari Hesap</h1>

      {/* 🔔 YAKLAŞAN ÇEK VE VADE UYARISI (Sadece Yaklaşan Çek Varsa Görünür) */}
      {yaklasanCekler.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6 shadow-sm space-y-2">
          <h3 className="font-bold text-amber-900 text-xs flex items-center gap-2">
            🚨 Akıllı Muhasebe Uyarısı: Önümüzdeki 15 Gün İçinde Vadesi Gelen Çekler ({yaklasanCekler.length} Adet)
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {yaklasanCekler.map((c) => (
              <div key={c.id} className="bg-white p-2.5 rounded border border-amber-200 text-xs space-y-1">
                <div className="flex justify-between font-bold text-metin">
                  <span>{c.musteri.ad}</span>
                  <span className="text-amber-800">{paraFormat(c.tutar)}</span>
                </div>
                <p className="text-metin/60">{c.banka || "Banka Belirtilmedi"} - Çek No: {c.cekNo || "—"}</p>
                <p className="font-semibold text-rose-700">📅 Vade: {c.vadeTarihi?.toISOString().slice(0, 10)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ÜST BİLGİ VE FİLTRELER (ORİJİNAL KODUN) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <CariFiltre
          musteriler={musteriler.map((m) => ({ id: m.id, ad: m.ad }))}
          secili={seciliMusteri}
        />
        <div className="flex items-center gap-3">
          <div className="bg-yuzey border border-hat rounded-lg px-5 py-3">
            <span className="text-xs text-metin/50 mr-3">Bakiye</span>
            <span className={`font-mono text-lg ${bakiye > 0 ? "text-sicak-dim" : "text-soguk-dim"}`}>
              {paraFormat(bakiye)}
            </span>
          </div>
          <OdemeAlModal
            musteriler={musteriler.map((m) => ({ id: m.id, ad: m.ad }))}
            seciliMusteriId={seciliMusteri !== "hepsi" ? seciliMusteri : undefined}
          />
        </div>
      </div>

      {/* YENİ CARİ HAREKET FORMU (ÇEK VADE VE EVRAK YÜKLEME EKLENDİ) */}
      <form action={cariHareketEkle} className="bg-yuzey border border-hat rounded-lg p-5 mb-8 space-y-4">
        <div className="grid sm:grid-cols-4 gap-3">
          <div className="min-w-[180px]">
            <label className="block text-xs font-medium text-metin/60 mb-1">Müşteri *</label>
            <select name="musteriId" required className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
              {musteriler.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.ad}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">İşlem Türü *</label>
            <select name="tur" required className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
              <option value="BORC">Borç (Satış / Fatura Kesildi)</option>
              <option value="ALACAK">Alacak (Tahsilat / Çek Alındı)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Ödeme Yöntemi</label>
            <select name="odemeYontemi" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
              <option value="EFT/Havale">EFT / Havale</option>
              <option value="Çek">Çek</option>
              <option value="Senet">Senet</option>
              <option value="Nakit">Nakit</option>
              <option value="Kredi Kartı">Kredi Kartı</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Tutar (TL) *</label>
            <input name="tutar" type="text" inputMode="decimal" required className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm font-mono" placeholder="0,00" />
          </div>
        </div>

        {/* ÇEK VADE - BANKA VE EVRAK DOSYASI (PDF/GÖRSEL) YÜKLEME ALANLARI */}
        <div className="grid sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-md border border-hat">
          <div>
            <label className="block text-xs font-semibold text-rose-800 mb-1">Çek / Senet Vade Tarihi</label>
            <input name="vadeTarihi" type="date" className="focus-ring w-full border border-hat rounded-md px-2 py-1.5 text-xs bg-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-metin/70 mb-1">Banka Adı</label>
            <input name="banka" placeholder="Örn: Garanti BBVA" className="focus-ring w-full border border-hat rounded-md px-2 py-1.5 text-xs bg-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-metin/70 mb-1">Çek No / Seri No</label>
            <input name="cekNo" placeholder="Örn: 987456" className="focus-ring w-full border border-hat rounded-md px-2 py-1.5 text-xs bg-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-blue-800 mb-1">📷 Fatura / Dekont / Çek Görseli</label>
            <input name="evrak" type="file" accept=".pdf,.jpg,.jpeg,.png" className="focus-ring w-full text-xs border border-hat rounded-md p-1 bg-white" />
          </div>
        </div>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-metin/60 mb-1">Açıklama *</label>
            <input name="aciklama" required className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" placeholder="Fatura No, çek detayları vb." />
          </div>
          <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors shrink-0">
            Ekle
          </button>
        </div>
      </form>

      {/* CARİ HAREKETLER TABLOSU */}
      <div className="bg-yuzey border border-hat rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-metin/50 border-b border-hat bg-soguk-light/20">
              <th className="px-4 py-3 font-medium">Tarih</th>
              <th className="px-4 py-3 font-medium">Müşteri</th>
              <th className="px-4 py-3 font-medium">Açıklama</th>
              <th className="px-4 py-3 font-medium">Vade / Çek Bilgisi</th>
              <th className="px-4 py-3 font-medium text-center">Evrak / Çek</th>
              <th className="px-4 py-3 font-medium text-right">Tutar</th>
              <th className="px-4 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {hareketler.map((c) => (
              <tr key={c.id} className="border-b border-hat last:border-0 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-mono text-metin/60 text-xs">{c.tarih.toISOString().slice(0, 10)}</td>
                <td className="px-4 py-3 text-metin font-semibold">{c.musteri.ad}</td>
                <td className="px-4 py-3 text-metin/70 text-xs">
                  {c.aciklama}
                  {c.odemeYontemi && <span className="block text-[10px] font-bold text-soguk-dim">Yöntem: {c.odemeYontemi}</span>}
                  {c.odemeDetay && <span className="block text-[10px] text-metin/50">{c.odemeDetay}</span>}
                </td>

                {/* ÇEK VADE BİLGİSİ */}
                <td className="px-4 py-3 text-xs">
                  {(c as any).vadeTarihi ? (
                    <div>
                      <span className="font-bold text-rose-700">Vade: {(c as any).vadeTarihi.toISOString().slice(0, 10)}</span>
                      {(c as any).cekNo && <div className="text-[10px] text-metin/50">{(c as any).banka} - No: {(c as any).cekNo}</div>}
                    </div>
                  ) : (
                    <span className="text-metin/30">—</span>
                  )}
                </td>

                {/* YÜKLENEN EVRAK / ÇEK GÖRSELİ LİNKİ */}
                <td className="px-4 py-3 text-center">
                  {(c as any).evrakDosyaAdi ? (
                    <a
                      href={`/api/cari-evrak/${c.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200 font-semibold hover:bg-blue-100"
                    >
                      📄 Çek / Evrak Gör
                    </a>
                  ) : (
                    <span className="text-metin/30">—</span>
                  )}
                </td>

                <td className={`px-4 py-3 text-right font-mono font-bold ${c.tur === "BORC" ? "text-sicak-dim" : "text-soguk-dim"}`}>
                  {c.tur === "BORC" ? "+" : "-"}
                  {paraFormat(c.tutar)}
                </td>

                <td className="px-4 py-3 text-right">
                  <SilButon id={c.id} action={cariHareketSil} onayMesaji="Bu hareketi silmek istediğine emin misin?" />
                </td>
              </tr>
            ))}
            {hareketler.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-metin/50">
                  Hareket bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}