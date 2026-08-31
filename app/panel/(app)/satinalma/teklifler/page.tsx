import { prisma } from "@/lib/prisma";
import { satinalmaTeklifiEkle, maliyetDosyaYukle } from "@/lib/actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SatinalmaTekliflerPage() {
  const [tedarikciler, satinalmaTeklifleri, satisTeklifleri] = await Promise.all([
    prisma.tedarikci.findMany({ orderBy: { ad: "asc" } }),
    prisma.satinalmaTeklifi.findMany({
      include: { tedarikci: true, kalemler: true },
      orderBy: { tarih: "desc" },
    }),
    prisma.teklif.findMany({
      include: { musteri: true, olusturanKullanici: true, kalemler: true },
      orderBy: { tarih: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/panel/satinalma" className="focus-ring text-xs text-metin/60 hover:text-metin mb-2 inline-block">
            ← Satınalmaya dön
          </Link>
          <h1 className="font-display text-2xl font-bold text-metin">Gelen Teklifler & Maliyet Dosya Kasası</h1>
          <p className="text-xs text-metin/60 mt-1">Ortakların incelemesi için tekliflere ait Maliyet Excel'i ve Maliyet PDF'lerini buradan yönetebilirsiniz.</p>
        </div>
      </div>

      {/* 1. GELEN TEDARİKÇİ TEKLİFİ EKLEME FORMU */}
      <form action={satinalmaTeklifiEkle} className="bg-yuzey border border-hat rounded-lg p-5 space-y-4 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-soguk-dim border-b border-hat pb-2">
          + Yeni Tedarikçi Teklifi Girişi
        </h2>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Tedarikçi Seç *</label>
            <select name="tedarikciId" required className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
              <option value="">— Tedarikçi Seçin —</option>
              {tedarikciler.map((t) => (
                <option key={t.id} value={t.id}>{t.ad}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Teklif / Proje Adı *</label>
            <input name="baslik" required placeholder="Örn: VRF Dış Ünite İhale Fiyatı" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white font-medium" />
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

        <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors">
          Tedarikçi Teklifini Ekle
        </button>
      </form>

      {/* 2. TEKLİFLER VE MALİYET DOSYALARI TABLOSU */}
      <div className="bg-yuzey border border-hat rounded-lg overflow-hidden shadow-sm space-y-2">
        <div className="p-4 border-b border-hat bg-slate-50 font-bold text-sm text-metin flex justify-between items-center">
          <span>📑 Teklifler, Maliyet PDF & Maliyet Excel Dosyası Yükleme Kasası</span>
          <span className="text-xs text-metin/50 font-normal">Ortaklar için maliyet dosyaları erişilebilir durumdadır.</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-hat text-metin/70 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Teklif / Proje Adı</th>
                <th className="py-3 px-4">Müşteri / Tedarikçi</th>
                <th className="py-3 px-4">Hazırlayan</th>
                <th className="py-3 px-4 text-center">Maliyet PDF</th>
                <th className="py-3 px-4 text-center">Maliyet Excel</th>
                <th className="py-3 px-4 text-center">Teklife Dönüştür</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hat bg-white">
              {/* SATIŞ TEKLİFLERİ */}
              {satisTeklifleri.map((t) => (
                <tr key={`st-${t.id}`} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4">
                    <div className="font-bold text-metin text-sm">
                      <Link href={`/panel/teklifler/${t.id}`} className="hover:text-soguk-dim">
                        TKL-{String(t.teklifNo).padStart(4, "0")} — {t.baslik || "(Başlıksız Teklif)"}
                      </Link>
                    </div>
                    <div className="text-[10px] text-metin/50">{t.tarih.toISOString().slice(0, 10)}</div>
                  </td>

                  <td className="py-3 px-4 font-semibold text-metin/80">
                    🏢 {t.musteri.ad}
                  </td>

                  <td className="py-3 px-4 font-semibold text-soguk-dim">
                    👤 {t.olusturanKullanici?.ad || t.olusturanAdi || "—"}
                  </td>

                  {/* MALİYET PDF YÜKLE / AÇ (DÜZELTİLDİ) */}
                  <td className="py-3 px-4 text-center">
                    {t.maliyetPdfAdi ? (
                      <a
                        href={`/api/maliyet-pdf/${t.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded border border-emerald-300 font-bold hover:bg-emerald-100 shadow-sm"
                      >
                        📄 Maliyet PDF Gör
                      </a>
                    ) : (
                      <form action={maliyetDosyaYukle} className="inline-flex items-center gap-1">
                        <input type="hidden" name="teklifId" value={t.id} />
                        <input type="file" name="maliyetPdf" accept=".pdf" required className="w-36 text-[10px] text-metin/60 border border-hat rounded p-1" />
                        <button type="submit" className="bg-soguk text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-soguk-dim">Yükle</button>
                      </form>
                    )}
                  </td>

                  {/* MALİYET EXCEL YÜKLE / İNDİR (DÜZELTİLDİ) */}
                  <td className="py-3 px-4 text-center">
                    {t.maliyetExcelAdi ? (
                      <a
                        href={`/api/maliyet-excel/${t.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-800 px-2.5 py-1 rounded border border-blue-300 font-bold hover:bg-blue-100 shadow-sm"
                      >
                        📊 Maliyet Excel İndir
                      </a>
                    ) : (
                      <form action={maliyetDosyaYukle} className="inline-flex items-center gap-1">
                        <input type="hidden" name="teklifId" value={t.id} />
                        <input type="file" name="maliyetExcel" accept=".xlsx,.xls" required className="w-36 text-[10px] text-metin/60 border border-hat rounded p-1" />
                        <button type="submit" className="bg-soguk text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-soguk-dim">Yükle</button>
                      </form>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      Aktif Satış Teklifi
                    </span>
                  </td>
                </tr>
              ))}

              {/* GELEN TEDARİKÇİ TEKLİFLERİ */}
              {satinalmaTeklifleri.map((st) => (
                <tr key={`sat-${st.id}`} className="hover:bg-slate-50/60 bg-amber-50/20">
                  <td className="py-3 px-4 font-bold text-metin">
                    {st.baslik}
                    <div className="text-[10px] font-normal text-metin/50">Gelen Tedarikçi Fiyatı</div>
                  </td>

                  <td className="py-3 px-4 font-semibold text-amber-900">
                    🚚 {st.tedarikci.ad}
                  </td>

                  <td className="py-3 px-4 text-metin/50">—</td>

                  {/* MALİYET PDF YÜKLE / AÇ (DÜZELTİLDİ) */}
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
                      <form action={maliyetDosyaYukle} className="inline-flex items-center gap-1">
                        <input type="hidden" name="satinalmaTeklifiId" value={st.id} />
                        <input type="file" name="maliyetPdf" accept=".pdf" required className="w-36 text-[10px] text-metin/60 border border-hat rounded p-1" />
                        <button type="submit" className="bg-soguk text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-soguk-dim">Yükle</button>
                      </form>
                    )}
                  </td>

                  {/* MALİYET EXCEL YÜKLE / İNDİR (DÜZELTİLDİ) */}
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
                      <form action={maliyetDosyaYukle} className="inline-flex items-center gap-1">
                        <input type="hidden" name="satinalmaTeklifiId" value={st.id} />
                        <input type="file" name="maliyetExcel" accept=".xlsx,.xls" required className="w-36 text-[10px] text-metin/60 border border-hat rounded p-1" />
                        <button type="submit" className="bg-soguk text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-soguk-dim">Yükle</button>
                      </form>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/panel/satinalma/teklifler/${st.id}/donustur`}
                      className="text-xs bg-soguk text-white px-3 py-1 rounded font-bold hover:bg-soguk-dim inline-block shadow-sm"
                    >
                      Teklife Dönüştür →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}