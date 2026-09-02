import { prisma } from "@/lib/prisma";
import { satinalmaTeklifiEkle, satinalmaTeklifiSil, maliyetDosyaYukle } from "@/lib/actions";
import TedarikciTeklifiEkleModal from "@/components/TedarikciTeklifiEkleModal"; // YENİ MODAL
import SilButon from "@/components/SilButon";
import Link from "next/link";

export const dynamic = "force-dynamic";

function paraFormat(n: number, pb: string = "TRY") {
  const sembol = pb === "EUR" ? "€" : pb === "USD" ? "$" : "₺";
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + sembol;
}

export default async function SatinalmaTekliflerPage() {
  const [tedarikciler, satinalmaTeklifleri, satisTeklifleri] = await Promise.all([
    prisma.tedarikci.findMany({ orderBy: { ad: "asc" } }),
    prisma.satinalmaTeklifi.findMany({
      include: { tedarikci: true, kalemler: true },
      orderBy: { tarih: "desc" },
    }),
    prisma.teklif.findMany({
      include: { musteri: true, olusturanKullanici: true, kalemler: true, proje: true },
      orderBy: { tarih: "desc" },
    }),
  ]);

  // TÜM SATIŞ TEKLİFLERİNİ VE TEDARİKÇİ TEKLİFLERİNİ PROJE/KONU BAŞLIĞINA GÖRE BİRLEŞTİRİP GRUPLA
  const tumKonular: {
    [konu: string]: {
      satisTeklifi?: (typeof satisTeklifleri)[0];
      satinalmaTeklifleri: typeof satinalmaTeklifleri;
    };
  } = {};

  // 1. Satış Tekliflerini Konu Listesine Ekle
  satisTeklifleri.forEach((st) => {
    const konu = st.proje?.ad || st.baslik || "Genel Satış Teklifleri";
    if (!tumKonular[konu]) {
      tumKonular[konu] = { satinalmaTeklifleri: [] };
    }
    tumKonular[konu].satisTeklifi = st;
  });

  // 2. Tedarikçi Tekliflerini Aynı Konu Listesine Ekle
  satinalmaTeklifleri.forEach((sat) => {
    const konu = sat.baslik || "Genel Satınalma Talepleri";
    if (!tumKonular[konu]) {
      tumKonular[konu] = { satinalmaTeklifleri: [] };
    }
    tumKonular[konu].satinalmaTeklifleri.push(sat);
  });

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

      {/* 1. YENİ TEDARİKÇİ TEKLİFİ / PROJE GİRİŞ FORMU */}
      <form action={satinalmaTeklifiEkle} className="bg-yuzey border border-hat rounded-lg p-5 space-y-4 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-soguk-dim border-b border-hat pb-2">
          + Yeni Proje / İhale İçin Tedarikçi Teklifi Girişi
        </h2>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Proje / Satınalma Konusu *</label>
            <input name="baslik" required placeholder="Örn: TEKİRDAĞ NKÜ PROJESİ" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white font-medium" />
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
          📊 Proje / İhale Bazlı Satış ve Tedarikçi Teklifleri ({Object.keys(tumKonular).length} Konu)
        </h2>

        {Object.entries(tumKonular).map(([konuBasligi, veri]) => {
          const satisTeklifi = veri.satisTeklifi;
          const satinalmaListesi = veri.satinalmaTeklifleri;

          return (
            <div key={konuBasligi} className="bg-yuzey border border-hat rounded-lg overflow-hidden shadow-sm space-y-2">
              
              {/* KART BAŞLIĞI VE ÇOKLU TEDARİKÇİ EKLEME BUTONU */}
              <div className="p-3.5 border-b border-hat bg-slate-100/90 font-bold text-sm text-soguk-dim flex flex-wrap justify-between items-center gap-2">
                <span className="flex items-center gap-2">
                  <span>📂 Konu / Proje:</span>
                  <strong className="text-metin font-bold text-base">{konuBasligi}</strong>
                </span>

                {/* BU PROJEYE İKİNCİ / ÜÇÜNCÜ TEDARİKÇİ TEKLİFİ EKLEME MODAL BUTONU */}
                <TedarikciTeklifiEkleModal konuBasligi={konuBasligi} tedarikciler={tedarikciler} />
              </div>

              {/* A. MÜŞTERİYE VERİLEN SATIŞ TEKLİFİ (VARSA EN ÜSTTE GÖRÜNÜR) */}
              {satisTeklifi && (
                <div className="p-3 bg-teal-50/50 border-b border-teal-200/80 flex flex-wrap justify-between items-center text-xs gap-3">
                  <div>
                    <span className="font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded text-[10px] mr-2">
                      MÜŞTERİ SATIŞ TEKLİFİ
                    </span>
                    <Link href={`/panel/teklifler/${satisTeklifi.id}`} className="font-bold text-metin hover:underline">
                      TKL-{String(satisTeklifi.teklifNo).padStart(4, "0")} — {satisTeklifi.musteri.ad}
                    </Link>
                    <span className="text-metin/50 ml-2">({satisTeklifi.tarih.toISOString().slice(0, 10)})</span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Satış Teklifi Maliyet PDF */}
                    {satisTeklifi.maliyetPdfAdi ? (
                      <a href={`/api/maliyet-pdf/${satisTeklifi.id}`} target="_blank" rel="noopener noreferrer" className="text-emerald-800 font-bold underline">
                        📄 Maliyet PDF Gör
                      </a>
                    ) : (
                      <form action={maliyetDosyaYukle} className="inline-flex items-center gap-1">
                        <input type="hidden" name="teklifId" value={satisTeklifi.id} />
                        <input type="file" name="maliyetPdf" accept=".pdf" required className="w-28 text-[9px] border border-hat rounded p-0.5 bg-white" />
                        <button type="submit" className="bg-soguk text-white text-[9px] font-bold px-1.5 py-0.5 rounded">PDF Yükle</button>
                      </form>
                    )}

                    {/* Satış Teklifi Maliyet Excel */}
                    {satisTeklifi.maliyetExcelAdi ? (
                      <a href={`/api/maliyet-excel/${satisTeklifi.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-800 font-bold underline">
                        📊 Maliyet Excel İndir
                      </a>
                    ) : (
                      <form action={maliyetDosyaYukle} className="inline-flex items-center gap-1">
                        <input type="hidden" name="teklifId" value={satisTeklifi.id} />
                        <input type="file" name="maliyetExcel" accept=".xlsx,.xls" required className="w-28 text-[9px] border border-hat rounded p-0.5 bg-white" />
                        <button type="submit" className="bg-soguk text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Excel Yükle</button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* B. TEDARİKÇİLERDEN ALINAN MALİYET TEKLİFLERİ TABLOSU */}
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
                    {satinalmaListesi.map((st) => {
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
                              <form action={maliyetDosyaYukle} className="inline-flex items-center gap-1">
                                <input type="hidden" name="satinalmaTeklifiId" value={st.id} />
                                <input type="file" name="maliyetPdf" accept=".pdf" required className="w-32 text-[9px] border border-hat rounded p-0.5 bg-white" />
                                <button type="submit" className="bg-soguk text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Yükle</button>
                              </form>
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
                              <form action={maliyetDosyaYukle} className="inline-flex items-center gap-1">
                                <input type="hidden" name="satinalmaTeklifiId" value={st.id} />
                                <input type="file" name="maliyetExcel" accept=".xlsx,.xls" required className="w-32 text-[9px] border border-hat rounded p-0.5 bg-white" />
                                <button type="submit" className="bg-soguk text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Yükle</button>
                              </form>
                            )}
                          </td>

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

                    {satinalmaListesi.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-metin/50">
                          Bu proje için henüz tedarikçi teklifi eklenmedi. Sağ üstteki <b>"+ Bu Projeye Tedarikçi Teklifi Ekle"</b> butonundan ekleyebilirsiniz.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}