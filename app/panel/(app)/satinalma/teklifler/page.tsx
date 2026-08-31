import { prisma } from "@/lib/prisma";
import { satinalmaTeklifiEkle, satinalmaTeklifiSil, maliyetDosyaYukle } from "@/lib/actions";
import SilButon from "@/components/SilButon";
import Link from "next/link";

export const dynamic = "force-dynamic";

function paraFormat(n: number, pb: string = "TRY") {
  const sembol = pb === "EUR" ? "€" : pb === "USD" ? "$" : "₺";
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + sembol;
}

export default async function SatinalmaTekliflerPage() {
  const [tedarikciler, satinalmaTeklifleri, projeler, satisTeklifleri] = await Promise.all([
    prisma.tedarikci.findMany({ orderBy: { ad: "asc" } }),
    prisma.satinalmaTeklifi.findMany({
      include: { tedarikci: true, proje: true, kalemler: true },
      orderBy: { tarih: "desc" },
    }),
    prisma.proje.findMany({ orderBy: { ad: "asc" } }),
    prisma.teklif.findMany({
      include: { musteri: true, olusturanKullanici: true, kalemler: true },
      orderBy: { tarih: "desc" },
    }),
  ]);

  // TEDARİKÇİ TEKLİFLERİNİ PROJE / KONU BAŞLIĞINA GÖRE GRUPLA
  const gruplanmisSatinalma = satinalmaTeklifleri.reduce((acc, st) => {
    const konu = st.proje?.ad || st.baslik || "Genel Satınalma Talepleri";
    if (!acc[konu]) acc[konu] = [];
    acc[konu].push(st);
    return acc;
  }, {} as Record<string, typeof satinalmaTeklifleri>);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/panel/satinalma" className="focus-ring text-xs text-metin/60 hover:text-metin mb-2 inline-block">
            ← Satınalmaya dön
          </Link>
          <h1 className="font-display text-2xl font-bold text-metin">Gelen Tedarikçi Teklifleri & İhale Kıyaslama</h1>
          <p className="text-xs text-metin/60 mt-1">Bir proje için aldığınız tüm tedarikçi fiyatlarını yan yana kıyaslayabilir, maliyet dosyalarını açabilirsiniz.</p>
        </div>
      </div>

      {/* 1. YENİ TEDARİKÇİ TEKLİFİ GİRİŞ FORMU */}
      <form action={satinalmaTeklifiEkle} className="bg-yuzey border border-hat rounded-lg p-5 space-y-4 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-soguk-dim border-b border-hat pb-2">
          + Yeni Tedarikçi Teklifi Girişi (İhale Karşılaştırma Kartı)
        </h2>

        <div className="grid sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Proje / Satınalma Konusu *</label>
            <input name="baslik" required placeholder="Örn: Sancaktepe AVM VRF Alımı" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white font-medium" />
          </div>

          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Tedarikçi Firma *</label>
            <select name="tedarikciId" required className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white font-medium">
              <option value="">— Tedarikçi Seçin —</option>
              {tedarikciler.map((t) => (
                <option key={t.id} value={t.id}>{t.ad}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">İlişkili Proje (Opsiyonel)</label>
            <select name="projeId" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
              <option value="">— Proje Bağlantısı Yok —</option>
              {projeler.map((p) => (
                <option key={p.id} value={p.id}>{p.ad}</option>
              ))}
            </select>
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

        {/* MALİYET PDF VE EXCEL DOSYASI YÜKLEME ALANLARI */}
        <div className="grid sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-md border border-hat">
          <div>
            <label className="block text-xs font-semibold text-emerald-800 mb-1">📄 Tedarikçi Maliyet PDF'i</label>
            <input name="maliyetPdf" type="file" accept=".pdf" className="focus-ring w-full text-xs border border-hat rounded p-1 bg-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-blue-800 mb-1">📊 Tedarikçi Maliyet Excel'i</label>
            <input name="maliyetExcel" type="file" accept=".xlsx,.xls" className="focus-ring w-full text-xs border border-hat rounded p-1 bg-white" />
          </div>
        </div>

        <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors">
          Tedarikçi Teklifini Kaydet
        </button>
      </form>

      {/* 2. PROJE BAZLI ÇOKLU İHALE VE TEDARİKÇİ KIYASLAMA KARTLARI */}
      <div className="space-y-6">
        <h2 className="text-sm font-bold text-metin border-b border-hat pb-2">
          📊 Proje ve Konu Bazlı Alınan Tedarikçi Teklifleri ({Object.keys(gruplanmisSatinalma).length} Konu)
        </h2>

        {Object.entries(gruplanmisSatinalma).map(([konuBasligi, teklifListesi]) => (
          <div key={konuBasligi} className="bg-yuzey border border-hat rounded-lg overflow-hidden shadow-sm space-y-2">
            <div className="p-3.5 border-b border-hat bg-slate-100/90 font-bold text-sm text-soguk-dim flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span>📂 Konu / Proje:</span>
                <strong className="text-metin font-bold text-base">{konuBasligi}</strong>
              </span>
              <span className="text-xs bg-soguk-light text-soguk-dim px-2.5 py-1 rounded font-bold border border-soguk/20">
                {teklifListesi.length} Tedarikçiden Teklif Alındı
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-hat text-metin/70 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-4">Tedarikçi Firma</th>
                    <th className="py-2.5 px-4">Tarih</th>
                    <th className="py-2.5 px-4 text-right">Gelen Toplam Tutar</th>
                    <th className="py-2.5 px-4 text-center">Maliyet PDF</th>
                    <th className="py-2.5 px-4 text-center">Maliyet Excel</th>
                    <th className="py-2.5 px-4 text-center">Seç & Satış Teklifine Dönüştür</th>
                    <th className="py-2.5 px-4 text-center">Sil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hat bg-white">
                  {teklifListesi.map((st) => {
                    const toplam = st.kalemler.reduce((a, k) => a + k.adet * k.birimFiyat, 0);

                    return (
                      <tr key={st.id} className="hover:bg-amber-50/40">
                        <td className="py-3 px-4 font-bold text-metin text-sm">
                          🚚 {st.tedarikci.ad}
                        </td>

                        <td className="py-3 px-4 font-mono text-metin/60">
                          {st.tarih.toISOString().slice(0, 10)}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-sm text-metin">
                          {toplam > 0 ? paraFormat(toplam, st.paraBirimi) : "—"}
                        </td>

                        {/* MALİYET PDF */}
                        <td className="py-3 px-4 text-center">
                          {st.maliyetPdfAdi ? (
                            <a
                              href={`/api/maliyet-pdf/${st.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded border border-emerald-300 font-bold hover:bg-emerald-100 shadow-sm"
                            >
                              📄 Maliyet PDF Gör
                            </a>
                          ) : (
                            <span className="text-metin/30">—</span>
                          )}
                        </td>

                        {/* MALİYET EXCEL */}
                        <td className="py-3 px-4 text-center">
                          {st.maliyetExcelAdi ? (
                            <a
                              href={`/api/maliyet-excel/${st.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-800 px-2.5 py-1 rounded border border-blue-300 font-bold hover:bg-blue-100 shadow-sm"
                            >
                              📊 Maliyet Excel İndir
                            </a>
                          ) : (
                            <span className="text-metin/30">—</span>
                          )}
                        </td>

                        {/* SEÇİLEN TEDARİKÇİ TEKLİFİNİ MÜŞTERİ SATIŞ TEKLİFİNE DÖNÜŞTÜR */}
                        <td className="py-3 px-4 text-center">
                          <Link
                            href={`/panel/satinalma/teklifler/${st.id}/donustur`}
                            className="text-xs bg-soguk text-white px-3 py-1.5 rounded font-bold hover:bg-soguk-dim inline-block shadow-sm"
                          >
                            Teklife Dönüştür →
                          </Link>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <SilButon id={st.id} action={satinalmaTeklifiSil} onayMesaji="Bu tedarikçi teklifini silmek istediğinize emin misiniz?" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {Object.keys(gruplanmisSatinalma).length === 0 && (
          <p className="text-xs text-metin/50 py-6 text-center bg-yuzey border border-hat rounded-lg">
            Henüz girilmiş bir tedarikçi teklifi bulunmuyor. Yukarıdaki formdan ekleyebilirsiniz.
          </p>
        )}
      </div>
    </div>
  );
}