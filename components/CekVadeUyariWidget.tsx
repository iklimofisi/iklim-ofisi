import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CekVadeUyariWidget() {
  const bugun = new Date();
  const yediGunSonra = new Date();
  yediGunSonra.setDate(bugun.getDate() + 15); // Önümüzdeki 15 gün içindeki vadelere bakar

  // 1. Yaklaşan Müşteri Çek Tahsilatları
  const yaklasanTahsilatlar = await prisma.cariHareket.findMany({
    where: {
      vadeTarihi: { gte: bugun, lte: yediGunSonra },
    },
    include: { musteri: true },
    orderBy: { vadeTarihi: "asc" },
  });

  // 2. Yaklaşan Tedarikçi Çek Ödemelerimiz
  const yaklasanOdemeler = await prisma.tedarikciHareket.findMany({
    where: {
      vadeTarihi: { gte: bugun, lte: yediGunSonra },
    },
    include: { tedarikci: true },
    orderBy: { vadeTarihi: "asc" },
  });

  if (yaklasanTahsilatlar.length === 0 && yaklasanOdemeler.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6 shadow-sm">
      <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2 mb-3">
        🔔 Akıllı Muhasebe Uyarısı: Yaklaşan Çek & Vade İşlemleri
      </h3>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Tahsilat Uyarısı */}
        {yaklasanTahsilatlar.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-emerald-800">📥 Alınan Çek Tahsilatları ({yaklasanTahsilatlar.length}):</p>
            {yaklasanTahsilatlar.map((t) => (
              <div key={t.id} className="bg-white p-2.5 rounded border border-emerald-200 text-xs flex justify-between items-center">
                <div>
                  <p className="font-bold text-metin">{t.musteri.ad}</p>
                  <p className="text-metin/60">{t.banka} - Çek No: {t.cekNo || "—"}</p>
                  <p className="text-emerald-700 font-semibold mt-0.5">Vade: {t.vadeTarihi?.toISOString().slice(0, 10)}</p>
                </div>
                <span className="font-mono font-bold text-sm text-emerald-600">{t.tutar.toLocaleString("tr-TR")} ₺</span>
              </div>
            ))}
          </div>
        )}

        {/* Ödeme Uyarısı */}
        {yaklasanOdemeler.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-rose-800">📤 Ödenecek Çeklerimiz ({yaklasanOdemeler.length}):</p>
            {yaklasanOdemeler.map((o) => (
              <div key={o.id} className="bg-white p-2.5 rounded border border-rose-200 text-xs flex justify-between items-center">
                <div>
                  <p className="font-bold text-metin">{o.tedarikci.ad}</p>
                  <p className="text-metin/60">{o.banka} - Çek No: {o.cekNo || "—"}</p>
                  <p className="text-rose-700 font-semibold mt-0.5">Vade: {o.vadeTarihi?.toISOString().slice(0, 10)}</p>
                </div>
                <span className="font-mono font-bold text-sm text-rose-600">{o.tutar.toLocaleString("tr-TR")} ₺</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}