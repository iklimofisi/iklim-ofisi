import { ornekMusteriler, ornekTeklifler, ornekCariHareketler } from "@/lib/types";

function paraFormat(n: number) {
  return n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

export default function PanelOzet() {
  const bekleyenTeklif = ornekTeklifler.filter((t) => t.durum === "Beklemede").length;
  const toplamBorc = ornekCariHareketler
    .filter((c) => c.tur === "Borç")
    .reduce((a, c) => a + c.tutar, 0);
  const toplamAlacak = ornekCariHareketler
    .filter((c) => c.tur === "Alacak")
    .reduce((a, c) => a + c.tutar, 0);

  const kartlar = [
    { baslik: "Müşteri Sayısı", deger: ornekMusteriler.length.toString() },
    { baslik: "Bekleyen Teklif", deger: bekleyenTeklif.toString() },
    { baslik: "Toplam Bakiye", deger: paraFormat(toplamBorc - toplamAlacak) },
  ];

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-8">Genel Özet</h1>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {kartlar.map((k) => (
          <div key={k.baslik} className="bg-yuzey border border-hat rounded-lg p-5">
            <p className="text-xs text-metin/55 mb-2">{k.baslik}</p>
            <p className="font-mono text-2xl font-medium text-metin">{k.deger}</p>
          </div>
        ))}
      </div>

      <div className="bg-yuzey border border-hat rounded-lg p-5">
        <h2 className="font-display font-medium text-metin mb-4">Son Teklifler</h2>
        <div className="space-y-3">
          {ornekTeklifler.map((t) => {
            const musteri = ornekMusteriler.find((m) => m.id === t.musteriId);
            const toplam = t.kalemler.reduce((a, k) => a + k.adet * k.birimFiyat, 0);
            return (
              <div key={t.id} className="flex items-center justify-between text-sm border-b border-hat last:border-0 pb-3 last:pb-0">
                <div>
                  <p className="font-medium text-metin">{musteri?.ad}</p>
                  <p className="text-metin/50 text-xs">{t.tarih}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-metin">{paraFormat(toplam)}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      t.durum === "Onaylandı"
                        ? "bg-soguk-light text-soguk-dim"
                        : t.durum === "Reddedildi"
                        ? "bg-sicak-light text-sicak-dim"
                        : "bg-hat text-metin/60"
                    }`}
                  >
                    {t.durum}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
