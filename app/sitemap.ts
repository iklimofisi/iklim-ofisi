import type { MetadataRoute } from "next";
import { MAKALELER, makaleIsoTarihi } from "./blog/data";

// Not: "/referanslar" sayfası içerik eklenene kadar Google'a kapalı olduğu için listede yok.
export default function sitemap(): MetadataRoute.Sitemap {
  const taban = "https://iklimofisi.com";
  const sayfalar: { yol: string; oncelik: number }[] = [
    { yol: "", oncelik: 1 },
    { yol: "/hizmetler", oncelik: 0.9 },
    { yol: "/urunler", oncelik: 0.9 },
    { yol: "/tcl-vrf", oncelik: 0.9 },
    { yol: "/airnex", oncelik: 0.8 },
    { yol: "/buderus", oncelik: 0.8 },
    { yol: "/ayen", oncelik: 0.8 },
    { yol: "/hava-perdesi", oncelik: 0.8 },
    { yol: "/iletisim", oncelik: 0.8 },
    { yol: "/hakkimizda", oncelik: 0.6 },
    { yol: "/hesaplama", oncelik: 0.6 },
    { yol: "/blog", oncelik: 0.6 },
    { yol: "/kvkk", oncelik: 0.2 },
  ];

  // Her sayfa Türkçe, İngilizce (/en) ve Almanca (/de) olarak listelenir; dil karşılıkları (hreflang) eklenir
  const diller = (yolu: string) => ({
    languages: { "tr-TR": `${taban}${yolu}`, en: `${taban}/en${yolu}`, de: `${taban}/de${yolu}` },
  });
  const ucDil = (yolu: string, oncelik: number, ek: { lastModified?: string } = {}) =>
    ["", "/en", "/de"].map((onEk) => ({
      url: `${taban}${onEk}${yolu}`,
      priority: onEk ? Math.round(oncelik * 0.8 * 10) / 10 : oncelik,
      alternates: diller(yolu),
      ...ek,
    }));

  return [
    ...sayfalar.flatMap((s) => ucDil(s.yol, s.oncelik)),
    ...MAKALELER.flatMap((m) => {
      const tarih = makaleIsoTarihi(m.guncelleme ?? m.tarih);
      return ucDil(`/blog/${m.slug}`, 0.5, tarih ? { lastModified: tarih } : {});
    }),
  ];
}
