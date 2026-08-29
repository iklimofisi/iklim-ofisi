import { prisma } from "@/lib/prisma";
import { teklifTakipNotuGuncelle, tekliflerExcelImport } from "@/lib/actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

function paraFormat(n: number, pb: string = "TRY") {
  const sembol = pb === "EUR" ? "€" : pb === "USD" ? "$" : "₺";
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + sembol;
}

export default async function ProjeTakipPage() {
  const [teklifler, kullanicilar] = await Promise.all([
    prisma.teklif.findMany({
      include: {
        musteri: true,
        olusturanKullanici: true,
        kalemler: true,
      },
      orderBy: { tarih: "desc" },
    }),
    prisma.kullanici.findMany({ select: { id: true, ad: true }, orderBy: { ad: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-1">CRM / Satış Takip</p>
          <h1 className="font-display text-2xl font-bold text-metin">📊 Proje Takip & Excel Izgarası</h1>
        </div>

        {/* EXCEL İNDİR VE YÜKLE AKSİYONLARI */}
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/api/export/proje-takip-excel"
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            📥 Excel Listesini İndir (.XLSX)
          </a>

          <form action={tekliflerExcelImport} className="flex items-center gap-2 bg-yuzey border border-hat p-1.5 rounded-md">
            <input
              type="file"
              name="dosya"
              accept=".xlsx,.xls"
              required
              className="text-xs text-metin/70 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-soguk-light file:text-soguk-dim hover:file:bg-soguk/20"
            />
            <button
              type="submit"
              className="bg-soguk text-white px-3 py-1 rounded text-xs font-bold hover:bg-soguk-dim transition-colors shrink-0"
            >
              📤 Excel'i Yükle & Toplu Güncelle
            </button>
          </form>
        </div>
      </div>

      {/* EXCEL GÖRÜNÜMLÜ CANLI TABLO */}
      <div className="bg-yuzey border border-hat rounded-lg overflow-hidden shadow-sm">
        <div className="p-3 border-b border-hat bg-slate-100/80 font-bold text-xs text-metin flex justify-between items-center">
          <span>📊 Tüm Verilen Teklifler ve Satış Temsilcisi Takip Notları</span>
          <span className="text-[11px] text-metin/50 font-normal">Notları doğrudan yazıp 'Kaydet'e basabilirsiniz.</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-200/70 border-b border-hat text-metin/70 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3 border-r border-hat w-24">Teklif No</th>
                <th className="py-2.5 px-3 border-r border-hat w-1/4">Teklif / Proje Adı</th>
                <th className="py-2.5 px-3 border-r border-hat">Müşteri Firma</th>
                <th className="py-2.5 px-3 border-r border-hat w-28">Hazırlayan</th>
                <th className="py-2.5 px-3 border-r border-hat w-24 text-center">Tarih</th>
                <th className="py-2.5 px-3 border-r border-hat w-28 text-right">Tutar</th>
                <th className="py-2.5 px-3 border-r border-hat w-24 text-center">Durum</th>
                <th className="py-2.5 px-3 w-1/3">Takip Notları / Görüşme Geçmişi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hat bg-white">
              {teklifler.map((t) => {
                const toplam = t.kalemler.reduce(
                  (a, k) => a + k.adet * k.birimFiyat * (1 - k.iskontoYuzde / 100),
                  0
                );
                const hazirlayan = t.olusturanKullanici?.ad || t.olusturanAdi || "—";

                return (
                  <tr key={t.id} className="hover:bg-amber-50/40 transition-colors">
                    {/* Teklif No */}
                    <td className="py-2 px-3 border-r border-hat font-mono font-bold text-soguk-dim">
                      <Link href={`/panel/teklifler/${t.id}`} className="hover:underline">
                        TKL-{String(t.teklifNo).padStart(4, "0")}
                      </Link>
                    </td>

                    {/* Proje Adı */}
                    <td className="py-2 px-3 border-r border-hat font-semibold text-metin">
                      <Link href={`/panel/teklifler/${t.id}`} className="hover:text-soguk-dim">
                        {t.baslik || "(Başlıksız Teklif)"}
                      </Link>
                    </td>

                    {/* Müşteri Firma */}
                    <td className="py-2 px-3 border-r border-hat text-metin/80 font-medium">
                      {t.musteri.ad}
                    </td>

                    {/* Hazırlayan */}
                    <td className="py-2 px-3 border-r border-hat text-metin/70 font-semibold">
                      👤 {hazirlayan}
                    </td>

                    {/* Tarih */}
                    <td className="py-2 px-3 border-r border-hat text-center font-mono text-metin/60">
                      {t.tarih.toISOString().slice(0, 10)}
                    </td>

                    {/* Tutar */}
                    <td className="py-2 px-3 border-r border-hat text-right font-mono font-bold text-metin">
                      {paraFormat(toplam, t.paraBirimi)}
                    </td>

                    {/* Durum */}
                    <td className="py-2 px-3 border-r border-hat text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.durum === "ONAYLANDI"
                            ? "bg-emerald-100 text-emerald-800"
                            : t.durum === "REDDEDILDI"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {t.durum}
                      </span>
                    </td>

                    {/* TAKİP NOTU CANLI EDİTÖR FORMU */}
                    <td className="py-1 px-2">
                      <form action={teklifTakipNotuGuncelle} className="flex gap-2 items-center">
                        <input type="hidden" name="teklifId" value={t.id} />
                        <input
                          name="takipNotu"
                          defaultValue={t.takipNotu ?? ""}
                          placeholder="Takip notu giriniz (örn. Pazartesi aranacak...)"
                          className="w-full border border-hat rounded px-2 py-1 text-xs bg-slate-50 focus:bg-white focus:border-soguk text-metin font-medium"
                        />
                        <button
                          type="submit"
                          className="bg-soguk text-white px-2.5 py-1 rounded text-[11px] font-bold hover:bg-soguk-dim transition-colors shrink-0"
                        >
                          Kaydet
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}

              {teklifler.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-metin/50">
                    Henüz kayıtlı teklif bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}