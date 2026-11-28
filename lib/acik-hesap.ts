// -----------------------------------------------------------------------------
// AÇIK HESAP (fatura bazında kalan): bir carinin borç kayıtlarına (fatura / sipariş borcu)
// ödemeler dağıtılır. Fatura numarası yazılmış ödeme önce o faturayı kapatır; artanı ve
// numarasız ödemeler en eski vadeli (vade yoksa en eski tarihli) borçtan başlayarak kapatır.
// Sonuç: her borç kaydının kalan tutarı (TL). İptal edilmiş kayıtlar hesaba girmez.
// -----------------------------------------------------------------------------
export type AcikHesapKaydi = {
  id: string;
  cari: string; // müşteri ya da tedarikçi id
  borc: boolean; // true: borç (fatura); false: ödeme / tahsilat
  tutar: number;
  tarih: Date;
  vadeTarihi: Date | null;
  belgeNo?: string | null; // fatura no
  iptal?: boolean;
};

const yuvarla = (n: number) => Math.round(n * 100) / 100;
const anahtar = (s?: string | null) => (s ?? "").trim().toLocaleUpperCase("tr-TR");

export function acikHesap(kayitlar: AcikHesapKaydi[]): Map<string, number> {
  const kalan = new Map<string, number>();
  const gruplar = new Map<string, AcikHesapKaydi[]>();
  for (const k of kayitlar) {
    if (k.iptal || !(k.tutar > 0)) continue;
    const g = gruplar.get(k.cari);
    if (g) g.push(k);
    else gruplar.set(k.cari, [k]);
  }
  for (const liste of gruplar.values()) {
    const borclar = liste
      .filter((k) => k.borc)
      .sort((a, b) => (a.vadeTarihi ?? a.tarih).getTime() - (b.vadeTarihi ?? b.tarih).getTime() || a.tarih.getTime() - b.tarih.getTime());
    for (const b of borclar) kalan.set(b.id, b.tutar);
    let havuz = 0;
    for (const o of liste.filter((k) => !k.borc)) {
      let tutar = o.tutar;
      const no = anahtar(o.belgeNo);
      if (no) {
        for (const b of borclar) {
          if (tutar <= 0) break;
          if (anahtar(b.belgeNo) !== no) continue;
          const dus = Math.min(tutar, kalan.get(b.id) ?? 0);
          kalan.set(b.id, (kalan.get(b.id) ?? 0) - dus);
          tutar -= dus;
        }
      }
      havuz += tutar;
    }
    for (const b of borclar) {
      if (havuz <= 0) break;
      const dus = Math.min(havuz, kalan.get(b.id) ?? 0);
      kalan.set(b.id, (kalan.get(b.id) ?? 0) - dus);
      havuz -= dus;
    }
  }
  for (const [id, v] of kalan) kalan.set(id, v < 0.005 ? 0 : yuvarla(v));
  return kalan;
}

// Form ön doldurma için TL tutar yazımı (örn. 48.000,00)
export const tutarYazisi = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
