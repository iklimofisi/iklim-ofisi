import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

function paraFormat(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺";
}

export default async function GenelCariPage() {
  const [musteriHareketleri, tedarikciHareketleri] = await Promise.all([
    prisma.cariHareket.findMany({
      include: { musteri: true },
      orderBy: { tarih: "desc" },
    }),
    prisma.tedarikciHareket.findMany({
      include: { tedarikci: true },
      orderBy: { tarih: "desc" },
    }),
  ]);

  // Alacak Çeklerimiz (Müşteriden Alınan)
  const alacakCekleri = musteriHareketleri.filter((h) => h.vadeTarihi && h.tur === "ALACAK");
  // Borç Çeklerimiz (Tedarikçiye Verilen)
  const borcCekleri = tedarikciHareketleri.filter((h) => h.vadeTarihi && h.tur === "ODEME");

  // Toplam Hesaplamaları
  const toplamMusteriAlacagi = musteriHareketleri.reduce((a, h) => a + (h.tur === "BORC" ? h.tutar : -h.tutar), 0);
  const toplamTedarikciBorcu = tedarikciHareketleri.reduce((a, h) => a + (h.tur === "BORC" ? h.tutar : -h.tutar), 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-1">Konsolide Finans</p>
        <h1 className="font-display text-2xl font-bold text-metin">Genel Finans, Satış / Satınalma & Çek Takip Ekranı</h1>
        <p className="text-xs text-metin/60 mt-1">Tüm müşteri satışları, tedarikçi satınalmaları ve çek vadeleri tek bir ekranda.</p>
      </div>

      {/* FINANS ÖZET KARTLARI */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-yuzey border border-hat p-4 rounded-lg">
          <p className="text-xs font-semibold text-emerald-800 uppercase mb-1">Müşterilerden Toplam Alacak</p>
          <p className="text-xl font-bold text-emerald-700 font-mono">{paraFormat(toplamMusteriAlacagi)}</p>
        </div>

        <div className="bg-yuzey border border-hat p-4 rounded-lg">
          <p className="text-xs font-semibold text-rose-800 uppercase mb-1">Tedarikçilere Toplam Borç</p>
          <p className="text-xl font-bold text-rose-700 font-mono">{paraFormat(toplamTedarikciBorcu)}</p>
        </div>

        <div className="bg-yuzey border border-hat p-4 rounded-lg">
          <p className="text-xs font-semibold text-blue-800 uppercase mb-1">Bekleyen Alacak Çekleri</p>
          <p className="text-xl font-bold text-blue-700 font-mono">
            {paraFormat(alacakCekleri.reduce((a, b) => a + b.tutar, 0))}
          </p>
          <p className="text-[10px] text-metin/50">{alacakCekleri.length} Adet Çek</p>
        </div>

        <div className="bg-yuzey border border-hat p-4 rounded-lg">
          <p className="text-xs font-semibold text-amber-800 uppercase mb-1">Verilen Borç Çeklerimiz</p>
          <p className="text-xl font-bold text-amber-700 font-mono">
            {paraFormat(borcCekleri.reduce((a, b) => a + b.tutar, 0))}
          </p>
          <p className="text-[10px] text-metin/50">{borcCekleri.length} Adet Çek</p>
        </div>
      </div>

      {/* ÇEK VADE TAKİP TABLOSU */}
      <div className="bg-yuzey border border-hat rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b border-hat bg-slate-50 font-bold text-sm text-metin">
          💳 Tüm Çek ve Senet Vade Takip Tablosu
        </div>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-100/80 border-b border-hat text-metin/60 font-semibold">
              <th className="py-3 px-4">Vade Tarihi</th>
              <th className="py-3 px-4">Taraf (Müşteri / Tedarikçi)</th>
              <th className="py-3 px-4">Çek Tipi</th>
              <th className="py-3 px-4">Banka & Çek No</th>
              <th className="py-3 px-4 text-center">Evrak / Çek</th>
              <th className="py-3 px-4 text-right">Tutar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hat">
            {/* Alacak Çekleri */}
            {alacakCekleri.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-rose-700 font-mono">
                  📅 {c.vadeTarihi?.toISOString().slice(0, 10)}
                </td>
                <td className="py-3 px-4 font-bold text-metin">{c.musteri.ad}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    📥 MÜŞTERİ ÇEKİ (ALACAK)
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-metin/70">
                  {c.banka || "—"} - No: {c.cekNo || "—"}
                </td>
                <td className="py-3 px-4 text-center">
                  {c.evrakDosyaAdi ? (
                    <a href={`/api/cari-evrak/${c.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-semibold">
                      📄 Çek Gör
                    </a>
                  ) : "—"}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">{paraFormat(c.tutar)}</td>
              </tr>
            ))}

            {/* Borç Çekleri */}
            {borcCekleri.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-rose-700 font-mono">
                  📅 {b.vadeTarihi?.toISOString().slice(0, 10)}
                </td>
                <td className="py-3 px-4 font-bold text-metin">{b.tedarikci.ad}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    📤 VERİLEN ÇEKİMİZ (BORÇ)
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-metin/70">
                  {b.banka || "—"} - No: {b.cekNo || "—"}
                </td>
                <td className="py-3 px-4 text-center">
                  {b.evrakDosyaAdi ? (
                    <a href={`/api/cari-evrak/${b.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-semibold">
                      📄 Çek Gör
                    </a>
                  ) : "—"}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">{paraFormat(b.tutar)}</td>
              </tr>
            ))}

            {alacakCekleri.length === 0 && borcCekleri.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-metin/50">Vadesi girilmiş bekleyen çek bulunamadı.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}