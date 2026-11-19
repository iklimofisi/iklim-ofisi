"use server";

// -----------------------------------------------------------------------------
// FİYAT LİSTELERİNDE ÜRÜN ARAMA (panel → Fiyat Listeleri sayfasının üstündeki arama)
// Bütün fiyat listelerindeki ürünlerde arar; yalnız okur, hiçbir şeyi değiştirmez.
// * Türkçe karakter ve büyük/küçük harf farkı gözetilmez ("isi" → "ISI", "Isı").
// * Birden fazla kelime yazılırsa hepsini içeren ürünler gelir.
// * Model kodunda boşluk / tire farkı gözetilmez ("gb272 50" → "GB272-50").
// * Toptan (Netsa) ve Baran listelerinde alış fiyatı da döner (sayfa yalnız panelde).
// -----------------------------------------------------------------------------
import { prisma } from "@/lib/prisma";
import { girisZorunlu } from "@/lib/oturum";
import { TOPTAN_KAYNAK, BARAN_KAYNAK, toptanKaynakMi, toptanDurumOku, anahtarla } from "@/lib/toptan-fiyat";

export type FiyatAramaFiyat = { ad: string; deger: number | null };
export type FiyatAramaSonucu = {
  id: string;
  listeId: string;
  listeBaslik: string;
  listeEtiket: string; // "Toptan · Netsa", "Baran Isı", "Otomatik · Kaya" ya da ""
  bolum: string;
  ad: string;
  kod: string | null;
  marka: string | null;
  aciklama: string | null;
  birim: string;
  paraBirimi: string;
  fiyatlar: FiyatAramaFiyat[];
  alislar: FiyatAramaFiyat[]; // yalnız panelde görünen alış fiyatları
  not: string; // ör. "PDF'te %10 iskonto uygulanır"
};

const EN_FAZLA = 80;

const sade = (m: string) =>
  m
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/û/g, "u");
const bitisik = (m: string) => m.replace(/[\s\-_./]+/g, "");

export async function fiyatListelerindeAra(sorguHam: string): Promise<{ sonuclar: FiyatAramaSonucu[]; toplam: number }> {
  await girisZorunlu();
  const sorgu = sade(String(sorguHam ?? "").slice(0, 100)).trim();
  const kelimeler = sorgu.split(/\s+/).filter(Boolean);
  const sorguBitisik = bitisik(sorgu);
  if (sorguBitisik.length < 2) return { sonuclar: [], toplam: 0 };

  const [listeler, kalemler] = await Promise.all([
    prisma.fiyatListesi.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        baslik: true,
        paraBirimi: true,
        kaynak: true,
        fiyatBaslik: true,
        fiyat2Baslik: true,
        fiyat3Baslik: true,
        iskontoYuzde: true,
        alisIskontoYuzde: true,
      },
    }),
    prisma.fiyatListesiKalem.findMany({
      orderBy: [{ listeId: "asc" }, { sira: "asc" }],
      select: { id: true, listeId: true, bolum: true, ad: true, kod: true, marka: true, aciklama: true, birim: true, fiyat: true, fiyat2: true, fiyat3: true },
    }),
  ]);

  // Eşleşenler (liste sırası: otomatik listeler önce, sonra en son güncellenen)
  const listeSira = new Map(
    [...listeler].sort((a, b) => Number(Boolean(b.kaynak)) - Number(Boolean(a.kaynak))).map((l, i) => [l.id, i])
  );
  type Bulunan = { k: (typeof kalemler)[number]; puan: number };
  const bulunan: Bulunan[] = [];
  for (const k of kalemler) {
    const kod = k.kod ? sade(k.kod) : "";
    const metin = sade(`${k.ad} ${kod} ${k.marka ?? ""} ${k.bolum}`);
    const uyar = kelimeler.every((w) => metin.includes(w)) || (sorguBitisik.length >= 3 && bitisik(metin).includes(sorguBitisik));
    if (!uyar) continue;
    const kodB = bitisik(kod);
    const puan = kodB && kodB === sorguBitisik ? 0 : kodB && kodB.startsWith(sorguBitisik) ? 1 : sade(k.ad).startsWith(kelimeler[0]) ? 2 : 3;
    bulunan.push({ k, puan });
  }
  bulunan.sort((a, b) => a.puan - b.puan || (listeSira.get(a.k.listeId) ?? 0) - (listeSira.get(b.k.listeId) ?? 0));
  const secilen = bulunan.slice(0, EN_FAZLA);

  // Toptan / Baran listelerinde alış fiyatları: liste sayfasındaki eşleştirmenin aynısı
  const alisHaritasi = new Map<string, Map<string, { alis: number; alis2: number }>>();
  const kalemAnahtari = new Map<string, string>();
  const toptanIdler = new Set(
    secilen.map((b) => b.k.listeId).filter((id) => toptanKaynakMi(listeler.find((l) => l.id === id)?.kaynak))
  );
  if (toptanIdler.size) {
    const durumlar = await prisma.fiyatListesi.findMany({ where: { id: { in: [...toptanIdler] } }, select: { id: true, kaynak: true, kaynakDurum: true } });
    for (const d of durumlar) {
      const durum = toptanDurumOku(d.kaynakDurum, d.kaynak);
      alisHaritasi.set(
        d.id,
        new Map(anahtarla(durum.markalar.flatMap((m) => m.urunler)).map((x) => [x.anahtar, { alis: x.deger.alis, alis2: x.deger.alis2 }]))
      );
      const satirlar = kalemler.filter((k) => k.listeId === d.id).map((k) => ({ ...k, marka: k.marka ?? "" }));
      for (const x of anahtarla(satirlar)) kalemAnahtari.set(x.deger.id, x.anahtar);
    }
  }

  const sayi = (n: number | null | undefined) => (n && n > 0 ? n : null);
  const sonuclar: FiyatAramaSonucu[] = secilen.map(({ k }) => {
    const l = listeler.find((x) => x.id === k.listeId)!;
    const toptan = toptanKaynakMi(l.kaynak);
    const fiyatlar: FiyatAramaFiyat[] = [{ ad: l.fiyatBaslik || (toptan ? "Nakit" : "Fiyat"), deger: sayi(k.fiyat) }];
    if (l.fiyat2Baslik || (toptan && k.fiyat2 !== null)) fiyatlar.push({ ad: l.fiyat2Baslik || "Kredi Kartı", deger: sayi(k.fiyat2) });
    if (l.fiyat2Baslik && l.fiyat3Baslik) fiyatlar.push({ ad: l.fiyat3Baslik, deger: sayi(k.fiyat3) });
    const alislar: FiyatAramaFiyat[] = [];
    if (toptan) {
      const a = alisHaritasi.get(l.id)?.get(kalemAnahtari.get(k.id) ?? "");
      if (a) {
        alislar.push({ ad: "Alış nakit", deger: sayi(a.alis) });
        if (a.alis2) alislar.push({ ad: "Alış kart", deger: sayi(a.alis2) });
      }
    } else if (l.alisIskontoYuzde !== null && l.alisIskontoYuzde > 0 && k.fiyat > 0) {
      alislar.push({ ad: `Alış (−%${l.alisIskontoYuzde.toLocaleString("tr-TR")})`, deger: Math.round(k.fiyat * (1 - Math.min(100, l.alisIskontoYuzde) / 100) * 100) / 100 });
    }
    return {
      id: k.id,
      listeId: l.id,
      listeBaslik: l.baslik,
      listeEtiket: l.kaynak === TOPTAN_KAYNAK ? "Toptan · Netsa" : l.kaynak === BARAN_KAYNAK ? "Baran Isı" : l.kaynak ? "Otomatik · Kaya" : "",
      bolum: k.bolum,
      ad: k.ad,
      kod: k.kod,
      marka: k.marka,
      aciklama: k.aciklama,
      birim: k.birim,
      paraBirimi: l.paraBirimi,
      fiyatlar,
      alislar,
      not: !toptan && !l.kaynak && l.iskontoYuzde > 0 ? `PDF'te %${l.iskontoYuzde.toLocaleString("tr-TR")} iskonto uygulanır` : "",
    };
  });
  return { sonuclar, toplam: bulunan.length };
}
