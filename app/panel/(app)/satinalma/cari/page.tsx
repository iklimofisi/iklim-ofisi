import { prisma } from "@/lib/prisma";
import { tedarikciHareketEkle, tedarikciHareketSil } from "@/lib/actions";
import SilButon from "@/components/SilButon";
import TedarikciFiltre from "@/components/TedarikciFiltre";
import Link from "next/link";

export const dynamic = "force-dynamic";

function paraFormat(n: number) {
  return n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

export default async function TedarikciCariSayfasi({
  searchParams,
}: {
  searchParams: { tedarikci?: string };
}) {
  const secili = searchParams?.tedarikci ?? "hepsi";

  const bugun = new Date();
  const onBesGunSonra = new Date();
  onBesGunSonra.setDate(bugun.getDate() + 15);

  const [tedarikciler, hareketler, yaklasanOdemeler] = await Promise.all([
    prisma.tedarikci.findMany({ orderBy: { ad: "asc" } }),
    prisma.tedarikciHareket.findMany({
      where: secili === "hepsi" ? {} : { tedarikciId: secili },
      include: { tedarikci: true },
      orderBy: { tarih: "desc" },
    }),
    // Vadesi önümüzdeki 15 gün içinde olan Tedarikçi Çek Ödemelerimiz
    prisma.tedarikciHareket.findMany({
      where: {
        vadeTarihi: { gte: bugun, lte: onBesGunSonra },
      },
      include: { tedarikci: true },
      orderBy: { vadeTarihi: "asc" },
    }),
  ]);

  const bakiye = hareketler.reduce((a, h) => a + (h.tur === "BORC" ? h.tutar : -h.tutar), 0);

  return (
    <div>
      <Link href="/panel/satinalma" className="focus-ring text-sm text-metin/60 hover:text-metin mb-6 inline-block">
        ← Satınalmaya dön
      </Link>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">Tedarikçi Cari Hesabı & Fatura/Çek Takibi</h1>
      <p className="text-sm text-metin/60 mb-6">
        "Borç" bizim tedarikçiye borçlandığımız tutar (aldığımız mal/hizmet için kesilen fatura),
        "Ödeme" tedarikçiye yaptığımız ödeme (verilen çek/havale).
      </p>

      {/* 🚨 YAKLAŞAN TEDARİKÇİ ÇEK ÖDEMELERİ UYARI BANNERI (Sadece Yaklaşan Çek Varsa Görünür) */}
      {yaklasanOdemeler.length > 0 && (
        <div className="bg-rose-50 border border-rose-300 rounded-lg p-4 mb-6 shadow-sm space-y-2">
          <h3 className="font-bold text-rose-900 text-xs flex items-center gap-2">
            📤 Ödenecek Çek Uyarısı: Önümüzdeki 15 Gün İçinde Ödenmesi Gereken Çeklerimiz ({yaklasanOdemeler.length} Adet)
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {yaklasanOdemeler.map((o) => (
              <div key={o.id} className="bg-white p-2.5 rounded border border-rose-200 text-xs space-y-1">
                <div className="flex justify-between font-bold text-metin">
                  <span>{o.tedarikci.ad}</span>
                  <span className="text-rose-800">{paraFormat(o.tutar)}</span>
                </div>
                <p className="text-metin/60">{o.banka || "Banka Belirtilmedi"} - Çek No: {o.cekNo || "—"}</p>
                <p className="font-semibold text-rose-700">📅 Ödeme Vadesi: {o.vadeTarihi?.toISOString().slice(0, 10)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ÜST BİLGİ VE FİLTRELER (ORİJİNAL KODUN) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <TedarikciFiltre
          tedarikciler={tedarikciler.map((t) => ({ id: t.id, ad: t.ad }))}
          secili={secili}
        />
        <div className="bg-yuzey border border-hat rounded-lg px-5 py-3">
          <span className="text-xs text-metin/50 mr-3">Bakiye (bizim borcumuz)</span>
          <span className={`font-mono text-lg ${bakiye > 0 ? "text-sicak-dim" : "text-soguk-dim"}`}>
            {paraFormat(bakiye)}
          </span>
        </div>
      </div>

      {/* YENİ CARİ HAREKET FORMU (ÇEK VADE VE FATURA/DEKONT YÜKLEME EKLENDİ) */}
      <form action={tedarikciHareketEkle} className="bg-yuzey border border-hat rounded-lg p-5 mb-8 space-y-4">
        <div className="grid sm:grid-cols-4 gap-3">
          <div className="min-w-[180px]">
            <label className="block text-xs font-medium text-metin/60 mb-1">Tedarikçi *</label>
            <select name="tedarikciId" required className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
              {tedarikciler.map((t) => (
                <option key={t.id} value={t.id}>{t.ad}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">İşlem Türü *</label>
            <select name="tur" required className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
              <option value="BORC">Borç (bize kesilen fatura / mal alındı)</option>
              <option value="ODEME">Ödeme (biz ödedik / çek verdik)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Tutar (TL) *</label>
            <input name="tutar" type="text" inputMode="decimal" required className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm font-mono" placeholder="0,00" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-blue-800 mb-1">📷 Gelen Fatura / Dekont / Çek Görseli</label>
            <input name="evrak" type="file" accept=".pdf,.jpg,.jpeg,.png" className="focus-ring w-full text-xs border border-hat rounded-md p-1 bg-white" />
          </div>
        </div>

        {/* ÇEK VADE - BANKA BİLGİLERİ ALANI */}
        <div className="grid sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-md border border-hat">
          <div>
            <label className="block text-xs font-semibold text-rose-800 mb-1">Çek Ödeme Vade Tarihi</label>
            <input name="vadeTarihi" type="date" className="focus-ring w-full border border-hat rounded-md px-2 py-1.5 text-xs bg-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-metin/70 mb-1">Banka Adı</label>
            <input name="banka" placeholder="Örn: Garanti BBVA" className="focus-ring w-full border border-hat rounded-md px-2 py-1.5 text-xs bg-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-metin/70 mb-1">Verilen Çek No / Seri No</label>
            <input name="cekNo" placeholder="Örn: 456789" className="focus-ring w-full border border-hat rounded-md px-2 py-1.5 text-xs bg-white" />
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

      {/* TEDARİKÇİ CARİ HAREKETLERİ TABLOSU */}
      <div className="bg-yuzey border border-hat rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-metin/50 border-b border-hat bg-soguk-light/20">
              <th className="px-4 py-3 font-medium">Tarih</th>
              <th className="px-4 py-3 font-medium">Tedarikçi</th>
              <th className="px-4 py-3 font-medium">Açıklama</th>
              <th className="px-4 py-3 font-medium">Vade / Çek Bilgisi</th>
              <th className="px-4 py-3 font-medium text-center">Fatura / Çek</th>
              <th className="px-4 py-3 font-medium text-right">Tutar</th>
              <th className="px-4 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {hareketler.map((h) => (
              <tr key={h.id} className="border-b border-hat last:border-0 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-mono text-metin/60 text-xs">{h.tarih.toISOString().slice(0, 10)}</td>
                <td className="px-4 py-3 text-metin font-semibold">{h.tedarikci.ad}</td>
                <td className="px-4 py-3 text-metin/70 text-xs">
                  {h.aciklama}
                  <span className={`block text-[10px] font-bold ${h.tur === 'BORC' ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {h.tur === 'BORC' ? 'GELEN FATURA (BORÇ)' : 'ÖDEME YAPILDI'}
                  </span>
                </td>

                {/* ÇEK ÖDEME VADE BİLGİSİ */}
                <td className="px-4 py-3 text-xs">
                  {(h as any).vadeTarihi ? (
                    <div>
                      <span className="font-bold text-rose-700">Vade: {(h as any).vadeTarihi.toISOString().slice(0, 10)}</span>
                      {(h as any).cekNo && <div className="text-[10px] text-metin/50">{(h as any).banka} - No: {(h as any).cekNo}</div>}
                    </div>
                  ) : (
                    <span className="text-metin/30">—</span>
                  )}
                </td>

                {/* YÜKLENEN FATURA / ÇEK GÖRSELİ LİNKİ */}
                <td className="px-4 py-3 text-center">
                  {(h as any).evrakDosyaAdi ? (
                    <a
                      href={`/api/cari-evrak/${h.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200 font-semibold hover:bg-blue-100"
                    >
                      📄 Fatura / Çek Gör
                    </a>
                  ) : (
                    <span className="text-metin/30">—</span>
                  )}
                </td>

                <td className={`px-4 py-3 text-right font-mono font-bold ${h.tur === "BORC" ? "text-sicak-dim" : "text-soguk-dim"}`}>
                  {h.tur === "BORC" ? "+" : "-"}
                  {paraFormat(h.tutar)}
                </td>

                <td className="px-4 py-3 text-right">
                  <SilButon id={h.id} action={tedarikciHareketSil} onayMesaji="Bu hareketi silmek istediğine emin misin?" />
                </td>
              </tr>
            ))}
            {hareketler.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-metin/50">
                  Tedarikçi cari hareketi bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}