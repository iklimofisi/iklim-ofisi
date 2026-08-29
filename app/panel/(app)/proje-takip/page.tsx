import { prisma } from "@/lib/prisma";
import { tekliflerExcelImport } from "@/lib/actions";
import TakipNotuEditor from "@/components/TakipNotuEditor";
import Link from "next/link";

export const dynamic = "force-dynamic";

function paraFormat(n: number, pb: string = "TRY") {
  const sembol = pb === "EUR" ? "€" : pb === "USD" ? "$" : "₺";
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + sembol;
}

export default async function ProjeTakipPage() {
  const [teklifler] = await Promise.all([
    prisma.teklif.findMany({
      include: {
        musteri: true,
        proje: true,
        olusturanKullanici: true,
        kalemler: { include: { marka: true } },
      },
      orderBy: { tarih: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-1">CRM / Satış Takip</p>
          <h1 className="font-display text-2xl font-bold text-metin">📊 Proje Takip & Genişletilmiş Excel Izgarası</h1>
        </div>

        {/* EXCEL İNDİR VE YÜKLE */}
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

      {/* 15 SÜTUNLU GENİŞLETİLMİŞ EXCEL TABLOSU */}
      <div className="bg-yuzey border border-hat rounded-lg overflow-hidden shadow-sm">
        <div className="p-3 border-b border-hat bg-slate-100/80 font-bold text-xs text-metin flex justify-between items-center">
          <span>📊 Genişletilmiş Proje Takip ve İhale Detay Tablosu</span>
          <span className="text-[11px] text-metin/50 font-normal">👁️ Notları okumak için göz simgesine tıklayabilirsiniz.</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-200/80 border-b border-hat text-metin/70 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3 border-r border-hat">Teklif No</th>
                <th className="py-2.5 px-3 border-r border-hat">Teklif / Proje Adı</th>
                <th className="py-2.5 px-3 border-r border-hat">Müşteri Firma</th>
                <th className="py-2.5 px-3 border-r border-hat">YETKİLİ</th>
                <th className="py-2.5 px-3 border-r border-hat">İLETİŞİM</th>
                <th className="py-2.5 px-3 border-r border-hat">Hazırlayan Personel</th>
                <th className="py-2.5 px-3 border-r border-hat text-center">Tarih</th>
                <th className="py-2.5 px-3 border-r border-hat text-right">Toplam Tutar</th>
                <th className="py-2.5 px-3 border-r border-hat text-center">Para Birimi</th>
                <th className="py-2.5 px-3 border-r border-hat">Marka</th>
                <th className="py-2.5 px-3 border-r border-hat">İhaleyi Alan Firma</th>
                <th className="py-2.5 px-3 border-r border-hat">Varsa Ekap No</th>
                <th className="py-2.5 px-3 border-r border-hat">Varsa İpkb No</th>
                <th className="py-2.5 px-3 min-w-[280px]">Takip Notları / Görüşme Geçmişi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hat bg-white">
              {teklifler.map((t) => {
                const toplam = t.kalemler.reduce(
                  (a, k) => a + k.adet * k.birimFiyat * (1 - (k.iskontoYuzde || 0) / 100),
                  0
                );
                const hazirlayan = t.olusturanKullanici?.ad || t.olusturanAdi || "—";
                const markalar = Array.from(
                  new Set(t.kalemler.map((k) => k.marka?.ad).filter(Boolean))
                ).join(", ");

                const yetkiliAd = t.musteri?.yetkiliAdi || "—";
                const iletisim = t.musteri?.yetkiliTelefon || t.musteri?.telefon || t.musteri?.email || "—";

                return (
                  <tr key={t.id} className="hover:bg-amber-50/40 transition-colors">
                    {/* Teklif No */}
                    <td className="py-2 px-3 border-r border-hat font-mono font-bold text-soguk-dim">
                      <Link href={`/panel/teklifler/${t.id}`} className="hover:underline">
                        TKL-{String(t.teklifNo).padStart(4, "0")}
                      </Link>
                    </td>

                    {/* Teklif / Proje Adı */}
                    <td className="py-2 px-3 border-r border-hat font-semibold text-metin">
                      <Link href={`/panel/teklifler/${t.id}`} className="hover:text-soguk-dim">
                        {t.baslik || "(Başlıksız Teklif)"}
                      </Link>
                    </td>

                    {/* Müşteri Firma */}
                    <td className="py-2 px-3 border-r border-hat text-metin/80 font-medium">
                      {t.musteri.ad}
                    </td>

                    {/* YETKİLİ */}
                    <td className="py-2 px-3 border-r border-hat text-soguk-dim font-semibold">
                      👤 {yetkiliAd}
                    </td>

                    {/* İLETİŞİM */}
                    <td className="py-2 px-3 border-r border-hat text-metin/70 font-mono">
                      {iletisim}
                    </td>

                    {/* Hazırlayan Personel */}
                    <td className="py-2 px-3 border-r border-hat text-metin/70 font-semibold">
                      {hazirlayan}
                    </td>

                    {/* Tarih */}
                    <td className="py-2 px-3 border-r border-hat text-center font-mono text-metin/60">
                      {t.tarih.toISOString().slice(0, 10)}
                    </td>

                    {/* Toplam Tutar */}
                    <td className="py-2 px-3 border-r border-hat text-right font-mono font-bold text-metin">
                      {paraFormat(toplam, t.paraBirimi)}
                    </td>

                    {/* Para Birimi */}
                    <td className="py-2 px-3 border-r border-hat text-center font-bold text-metin/70">
                      {t.paraBirimi}
                    </td>

                    {/* Marka */}
                    <td className="py-2 px-3 border-r border-hat text-metin/80 font-medium">
                      {markalar || "—"}
                    </td>

                    {/* İhaleyi Alan Firma */}
                    <td className="py-2 px-3 border-r border-hat text-metin/70">
                      {t.ihaleyiAlan || t.proje?.ihaleyiAlan || "—"}
                    </td>

                    {/* Varsa Ekap No */}
                    <td className="py-2 px-3 border-r border-hat font-mono text-metin/60">
                      {t.ekapNo || "—"}
                    </td>

                    {/* Varsa İpkb No */}
                    <td className="py-2 px-3 border-r border-hat font-mono text-metin/60">
                      {t.ipkbNo || "—"}
                    </td>

                    {/* TAKİP NOTU EDİTÖRÜ */}
                    <td className="py-1 px-2 min-w-[280px]">
                      <TakipNotuEditor teklifId={t.id} varsayilanNot={t.takipNotu ?? ""} />
                    </td>
                  </tr>
                );
              })}

              {teklifler.length === 0 && (
                <tr>
                  <td colSpan={14} className="py-8 text-center text-metin/50">
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