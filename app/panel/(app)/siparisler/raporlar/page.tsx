import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatTL(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺";
}

export default async function CiroRaporlariPage() {
  const siparisler = await prisma.siparis.findMany({
    include: {
      teklif: { include: { kalemler: true } },
      musteri: true,
      olusturanKullanici: true,
    },
    where: {
      durum: { notIn: ["IPTAL", "REDDEDILDI"] },
    },
  });

  // Personel Bazlı Ciro Hesaplama Engine
  const personelCiro: { [key: string]: { ad: string; email: string; ciro: number; siparisAdet: number } } = {};

  siparisler.forEach((s) => {
    const personelAd = s.olusturanKullanici?.ad || s.olusturanAdi || "Bilinmeyen Personel";
    const email = s.olusturanKullanici?.email || "—";
    const tutar = s.teklif.kalemler.reduce((acc, k) => acc + k.adet * k.birimFiyat * (1 - k.iskontoYuzde / 100), 0);
    const tlTutar = s.teklif.paraBirimi === "TRY" ? tutar : tutar * s.kur;

    if (!personelCiro[personelAd]) {
      personelCiro[personelAd] = { ad: personelAd, email, ciro: 0, siparisAdet: 0 };
    }

    personelCiro[personelAd].ciro += tlTutar;
    personelCiro[personelAd].siparisAdet += 1;
  });

  const genelToplamCiro = Object.values(personelCiro).reduce((a, b) => a + b.ciro, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-metin">📈 Ciro & Personel Performans Raporu</h1>
          <p className="text-xs text-metin/60 mt-1">Hangi personelin ne kadar satış yaptığı ve şirket cirosuna katkısı.</p>
        </div>
        <Link href="/panel/siparisler" className="text-xs bg-soguk-light text-soguk-dim px-3 py-1.5 rounded font-medium hover:underline">
          ← Siparişlere Dön
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-yuzey border border-hat p-5 rounded-lg shadow-sm">
          <p className="text-xs text-metin/60 mb-1 font-semibold uppercase">Toplam Onaylı Sipariş</p>
          <p className="text-3xl font-bold text-metin">{siparisler.length} Adet</p>
        </div>

        <div className="bg-yuzey border border-hat p-5 rounded-lg shadow-sm">
          <p className="text-xs text-metin/60 mb-1 font-semibold uppercase">Toplam Onaylı Ciro (TL Karşılığı)</p>
          <p className="text-3xl font-bold text-emerald-600">{formatTL(genelToplamCiro)}</p>
        </div>
      </div>

      {/* PERSONEL CİRO TABLOSU */}
      <div className="bg-yuzey border border-hat rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-hat text-xs text-metin/60 font-semibold">
              <th className="py-3 px-4">Satış Temsilcisi / Personel</th>
              <th className="py-3 px-4 text-center">Sipariş Sayısı</th>
              <th className="py-3 px-4 text-right">Yaptığı Ciro (TL)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hat">
            {Object.values(personelCiro).map((p) => (
              <tr key={p.ad} className="hover:bg-slate-50/50">
                <td className="py-3 px-4">
                  <div className="font-bold text-metin">{p.ad}</div>
                  <div className="text-xs text-metin/50">{p.email}</div>
                </td>
                <td className="py-3 px-4 text-center font-mono font-semibold">{p.siparisAdet} Adet</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-base text-emerald-600">
                  {formatTL(p.ciro)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}