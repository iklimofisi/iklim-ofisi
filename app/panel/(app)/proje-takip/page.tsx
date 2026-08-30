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
  const [projeler, bagimsizTeklifler] = await Promise.all([
    prisma.proje.findMany({
      include: {
        musteri: true,
        teklifler: {
          include: {
            kalemler: { include: { marka: true } },
            olusturanKullanici: true,
          },
        },
      },
      orderBy: { olusturmaTarihi: "desc" },
    }),
    prisma.teklif.findMany({
      where: { projeId: null },
      include: {
        musteri: true,
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
          <h1 className="font-display text-2xl font-bold text-metin">📊 Proje Takip & Fırsat Izgarası</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/panel/projeler"
            className="bg-soguk text-white px-3.5 py-2 rounded-md text-xs font-bold hover:bg-soguk-dim transition-colors shadow-sm"
          >
            + Yeni Proje / Fırsat Ekle
          </Link>

          <a
            href="/api/export/proje-takip-excel"
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
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
              📤 Excel'i Yükle & Güncelle
            </button>
          </form>
        </div>
      </div>

      {/* BİRLEŞİK PROJE VE TEKLİF TABLOSU */}
      <div className="bg-yuzey border border-hat rounded-lg overflow-hidden shadow-sm">
        <div className="p-3 border-b border-hat bg-slate-100/80 font-bold text-xs text-metin flex justify-between items-center">
          <span>📊 Tüm İhale / Proje Fırsatları ve Teklif Takip Notları</span>
          <span className="text-[11px] text-metin/50 font-normal">👁️ Notları okumak için göz simgesine tıklayabilirsiniz.</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-200/80 border-b border-hat text-metin/70 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3 border-r border-hat">Teklif / Proje Durumu</th>
                <th className="py-2.5 px-3 border-r border-hat">Teklif No</th>
                <th className="py-2.5 px-3 border-r border-hat">Proje / İhale Adı</th>
                <th className="py-2.5 px-3 border-r border-hat">Müşteri Firma</th>
                <th className="py-2.5 px-3 border-r border-hat">YETKİLİ</th>
                <th className="py-2.5 px-3 border-r border-hat">İLETİŞİM</th>
                <th className="py-2.5 px-3 border-r border-hat">Hazırlayan / Sorumlu</th>
                <th className="py-2.5 px-3 border-r border-hat text-center">Tarih</th>
                <th className="py-2.5 px-3 border-r border-hat text-right">Tutar / Tahmini Değer</th>
                <th className="py-2.5 px-3 border-r border-hat">İhaleyi Alan Firma</th>
                <th className="py-2.5 px-3 min-w-[280px]">Takip Notları / Görüşme Geçmişi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hat bg-white">
              
              {/* 1. PROJELER (TEKLİFİ OLAN VEYA OLMAYAN HEDEF FIRSATLAR) */}
              {projeler.map((p) => {
                const varOlanTeklif = p.teklifler && p.teklifler.length > 0 ? p.teklifler[0] : null;

                if (varOlanTeklif) {
                  const toplam = varOlanTeklif.kalemler.reduce((a, k) => a + k.adet * k.birimFiyat * (1 - (k.iskontoYuzde || 0) / 100), 0);
                  const hazirlayan = varOlanTeklif.olusturanKullanici?.ad || varOlanTeklif.olusturanAdi || p.olusturanAdi || "—";

                  return (
                    <tr key={`p-t-${p.id}`} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-2 px-3 border-r border-hat font-bold">
                        <Link href={`/panel/teklifler/${varOlanTeklif.id}`} className="text-soguk-dim hover:underline">
                          TEKLİF VERİLDİ →
                        </Link>
                      </td>
                      <td className="py-2 px-3 border-r border-hat font-mono font-bold text-soguk-dim">
                        TKL-{String(varOlanTeklif.teklifNo).padStart(4, "0")}
                      </td>
                      <td className="py-2 px-3 border-r border-hat font-bold text-metin">{p.ad}</td>
                      <td className="py-2 px-3 border-r border-hat font-medium text-metin/80">{p.musteri?.ad || "—"}</td>
                      <td className="py-2 px-3 border-r border-hat text-soguk-dim font-semibold">👤 {p.musteri?.yetkiliAdi || "—"}</td>
                      <td className="py-2 px-3 border-r border-hat font-mono text-metin/70">{p.musteri?.yetkiliTelefon || p.musteri?.telefon || "—"}</td>
                      <td className="py-2 px-3 border-r border-hat font-semibold text-metin/70">{hazirlayan}</td>
                      <td className="py-2 px-3 border-r border-hat text-center font-mono text-metin/60">{varOlanTeklif.tarih.toISOString().slice(0, 10)}</td>
                      <td className="py-2 px-3 border-r border-hat text-right font-mono font-bold text-metin">{paraFormat(toplam, varOlanTeklif.paraBirimi)}</td>
                      <td className="py-2 px-3 border-r border-hat text-metin/70">{p.ihaleyiAlan || varOlanTeklif.ihaleyiAlan || "—"}</td>
                      <td className="py-1 px-2">
                        <TakipNotuEditor id={varOlanTeklif.id} varsayilanNot={varOlanTeklif.takipNotu || p.notlar || ""} tip="TEKLIF" />
                      </td>
                    </tr>
                  );
                } else {
                  {/* TEKLİFİ HENÜZ HAZIRLANMAMIŞ PROJE FIRSATI */}
                  return (
                    <tr key={`p-${p.id}`} className="bg-slate-50/70 hover:bg-slate-100/80 transition-colors">
                      <td className="py-2 px-3 border-r border-hat">
                        <Link
                          href={`/panel/teklifler?proje=${encodeURIComponent(p.ad)}`}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[10px] font-bold inline-block shadow-sm"
                        >
                          + Teklif Hazırla
                        </Link>
                      </td>
                      <td className="py-2 px-3 border-r border-hat font-mono text-metin/40 italic">— (Teklif Yok)</td>
                      <td className="py-2 px-3 border-r border-hat font-bold text-metin">{p.ad}</td>
                      <td className="py-2 px-3 border-r border-hat text-metin/80 font-medium">{p.musteri?.ad || "—"}</td>
                      <td className="py-2 px-3 border-r border-hat text-metin/60">👤 {p.musteri?.yetkiliAdi || "—"}</td>
                      <td className="py-2 px-3 border-r border-hat font-mono text-metin/60">{p.musteri?.yetkiliTelefon || p.musteri?.telefon || "—"}</td>
                      <td className="py-2 px-3 border-r border-hat text-metin/60">{p.olusturanAdi || "—"}</td>
                      <td className="py-2 px-3 border-r border-hat text-center font-mono text-metin/60">{p.olusturmaTarihi.toISOString().slice(0, 10)}</td>
                      <td className="py-2 px-3 border-r border-hat text-right font-mono font-bold text-amber-700">
                        {p.tahminiDeger ? paraFormat(p.tahminiDeger, p.paraBirimi) : "—"}
                      </td>
                      <td className="py-2 px-3 border-r border-hat text-metin/70">{p.ihaleyiAlan || "—"}</td>
                      
                      {/* BURA PROJE İÇİN NOT EDİTÖRÜDÜR */}
                      <td className="py-1 px-2">
                        <TakipNotuEditor id={p.id} varsayilanNot={p.notlar || ""} tip="PROJE" />
                      </td>
                    </tr>
                  );
                }
              })}

              {/* 2. BAĞIMSIZ TEKLİFLER */}
              {bagimsizTeklifler.map((t) => {
                const toplam = t.kalemler.reduce((a, k) => a + k.adet * k.birimFiyat * (1 - (k.iskontoYuzde || 0) / 100), 0);
                const hazirlayan = t.olusturanKullanici?.ad || t.olusturanAdi || "—";

                return (
                  <tr key={`t-${t.id}`} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-2 px-3 border-r border-hat font-bold text-metin/60 text-[11px]">TEKLİF</td>
                    <td className="py-2 px-3 border-r border-hat font-mono font-bold text-soguk-dim">
                      <Link href={`/panel/teklifler/${t.id}`} className="hover:underline">
                        TKL-{String(t.teklifNo).padStart(4, "0")}
                      </Link>
                    </td>
                    <td className="py-2 px-3 border-r border-hat font-semibold text-metin">{t.baslik || "(Başlıksız)"}</td>
                    <td className="py-2 px-3 border-r border-hat text-metin/80 font-medium">{t.musteri.ad}</td>
                    <td className="py-2 px-3 border-r border-hat text-soguk-dim font-semibold">👤 {t.musteri?.yetkiliAdi || "—"}</td>
                    <td className="py-2 px-3 border-r border-hat font-mono text-metin/70">{t.musteri?.yetkiliTelefon || t.musteri?.telefon || "—"}</td>
                    <td className="py-2 px-3 border-r border-hat text-metin/70 font-semibold">{hazirlayan}</td>
                    <td className="py-2 px-3 border-r border-hat text-center font-mono text-metin/60">{t.tarih.toISOString().slice(0, 10)}</td>
                    <td className="py-2 px-3 border-r border-hat text-right font-mono font-bold text-metin">{paraFormat(toplam, t.paraBirimi)}</td>
                    <td className="py-2 px-3 border-r border-hat text-metin/70">{t.ihaleyiAlan || "—"}</td>
                    <td className="py-1 px-2">
                      <TakipNotuEditor id={t.id} varsayilanNot={t.takipNotu || ""} tip="TEKLIF" />
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