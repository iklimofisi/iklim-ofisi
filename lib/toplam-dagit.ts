// -----------------------------------------------------------------------------
// PAZARLIK SONRASI TOPLAMA GÖRE BİRİM FİYAT DAĞITIMI
// Örnek: teklif 7.130 € çıktı, masada 7.000 € anlaşıldı. Tüm birim fiyatlar
// aynı oranda düşürülür, kuruşa kadar yuvarlanır ve kalan kuruş farkı tek bir
// satırda kapatılır. Böylece müşteriye giden belgede
//   (birim fiyat × adet) satırlarının toplamı = tam olarak 7.000,00 €
// olur; sözleşmeye doğrudan girebilir.
//
// Müşteri belgesinde zaten iskontolu (net) birim fiyat görünür. Bu yüzden
// dağıtımdan sonra iskonto birim fiyata katılır ve iskonto %0 yapılır; müşteri
// açısından hiçbir şey değişmez, sadece rakamlar temiz olur.
// -----------------------------------------------------------------------------

export type DagitimSatiri = { adet: number; birimFiyat: number; iskontoYuzde: number };

export type DagitimSonucu =
  | { ok: false; hata: string }
  | {
      ok: true;
      satirlar: { birimFiyat: number; iskontoYuzde: number }[]; // girişle aynı sırada
      eskiToplam: number;
      yeniToplam: number;
      oranYuzde: number; // + artış, − indirim
      kalanFark: number; // 0 değilse tam tutturulamadı (ör. hiç 1 adetlik satır yok)
    };

// "7.000", "7000", "7.000,50", "7000,5", "7 000 €" → sayı
export function tutarOku(ham: string): number | null {
  let s = (ham ?? "").replace(/[\s€$₺]/g, "").replace(/TL$/i, "");
  if (!s) return null;
  if (s.includes(",") && s.includes(".")) {
    // İki ayraç da varsa sondaki ondalıktır: "7.000,50" ya da "7,000.50"
    s = s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (s.includes(",")) s = s.replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const kurus = (x: number) => Math.round(x * 100);

// Küsuratlı adette (ör. 12,5 m) satır tutarının tam kuruş çıkması için birim
// fiyatın hangi adımda yuvarlanacağı: 12,5 adet → 2 kuruşun katları.
function satirAdimi(adet: number, adim: number) {
  for (let s = adim; s <= adim * 100; s += adim) {
    const x = adet * s;
    if (Math.abs(x - Math.round(x)) < 1e-9) return s;
  }
  return adim;
}

export function toplamaGoreDagit(
  girdi: DagitimSatiri[],
  hedef: number,
  tamSayi = false // true: birim fiyatlar tam sayıya (kuruşsuz) yuvarlanır
): DagitimSonucu {
  if (!(hedef > 0)) return { ok: false, hata: "Geçerli bir toplam yazın." };

  const net = girdi.map((s) => s.adet * s.birimFiyat * (1 - (s.iskontoYuzde || 0) / 100));
  const eskiToplam = net.reduce((a, b) => a + b, 0);

  // Sadece fiyatı ve adedi olan satırlar ölçeklenir; diğerleri (0 fiyat vb.) aynen kalır
  const olcekli = girdi.map((s, i) => s.adet > 0 && net[i] > 0);
  const sabit = net.reduce((a, n, i) => (olcekli[i] ? a : a + n), 0);
  const olcekliToplam = eskiToplam - sabit;
  if (olcekliToplam <= 0) return { ok: false, hata: "Fiyatı girilmiş kalem yok." };
  if (hedef <= sabit) return { ok: false, hata: "Bu toplam çok düşük." };

  const k = (hedef - sabit) / olcekliToplam;
  const adim = tamSayi ? 100 : 1; // kuruş cinsinden yuvarlama adımı

  // Yeni net birim fiyatlar (kuruş cinsinden tam sayı)
  const birimKurus = girdi.map((s, i) => {
    if (!olcekli[i]) return null;
    const netBirim = s.birimFiyat * (1 - (s.iskontoYuzde || 0) / 100) * k;
    const st = satirAdimi(s.adet, adim);
    return Math.max(st, Math.round((netBirim * 100) / st) * st);
  });

  // Belgelerdeki hesapla aynı: Σ adet × birim fiyat (satır bazında yuvarlamadan)
  const toplamKurus = () =>
    Math.round(
      girdi.reduce((a, s, i) => {
        const b = birimKurus[i];
        return a + (b === null ? net[i] * 100 : s.adet * b);
      }, 0)
    );

  // Kalan kuruş farkını tek satırda kapat: önce adedi en küçük (tercihen 1),
  // eşitlikte tutarı en büyük satır. Tam bölünmezse kuruş adımına düş.
  let fark = kurus(hedef) - toplamKurus();
  if (fark !== 0) {
    const adaylar = girdi
      .map((s, i) => ({ i, adet: s.adet, tutar: net[i] }))
      .filter((a) => olcekli[a.i] && Number.isInteger(a.adet))
      .sort((a, b) => a.adet - b.adet || b.tutar - a.tutar);

    const dene = (adimKurus: number) => {
      for (const a of adaylar) {
        if (fark % (a.adet * adimKurus) !== 0) continue;
        const yeni = birimKurus[a.i]! + fark / a.adet;
        if (yeni <= 0) continue;
        birimKurus[a.i] = yeni;
        fark = 0;
        return true;
      }
      return false;
    };

    if (!dene(adim) && !(tamSayi && dene(1)) && adaylar.length) {
      // Tam tutmuyor (ör. bütün satırlar 3 adetlik): en yakın değere getir
      const a = adaylar[0];
      const d = Math.trunc(fark / a.adet);
      if (d !== 0 && birimKurus[a.i]! + d > 0) {
        birimKurus[a.i] = birimKurus[a.i]! + d;
        fark = kurus(hedef) - toplamKurus();
      }
    }
  }

  const satirlar = girdi.map((s, i) => {
    const b = birimKurus[i];
    return b === null ? { birimFiyat: s.birimFiyat, iskontoYuzde: s.iskontoYuzde } : { birimFiyat: b / 100, iskontoYuzde: 0 };
  });
  const yeniToplam = toplamKurus() / 100;

  return {
    ok: true,
    satirlar,
    eskiToplam,
    yeniToplam,
    oranYuzde: (k - 1) * 100,
    kalanFark: Math.round((hedef - yeniToplam) * 100) / 100,
  };
}
