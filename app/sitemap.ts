import type { MetadataRoute } from "next";
import { MAKALELER, makaleIsoTarihi } from "./blog/data";

// Not: "/referanslar" sayfası içerik eklenene kadar Google'a kapalı olduğu için listede yok.
export default function sitemap(): MetadataRoute.Sitemap {
  const taban = "https://iklimofisi.com";
  const sayfalar: { yol: string; oncelik: number }[] = [
    { yol: "", oncelik: 1 },
    { yol: "/hizmetler", oncelik: 0.9 },
    { yol: "/urunler", oncelik: 0.9 },
    { yol: "/airnex", oncelik: 0.8 },
    { yol: "/verta", oncelik: 0.8 },
    { yol: "/buderus", oncelik: 0.8 },
    { yol: "/iletisim", oncelik: 0.8 },
    { yol: "/hakkimizda", oncelik: 0.6 },
    { yol: "/hesaplama", oncelik: 0.6 },
    { yol: "/blog", oncelik: 0.6 },
    { yol: "/kvkk", oncelik: 0.2 },
  ];

  return [
    ...sayfalar.map((s) => ({ url: `${taban}${s.yol}`, priority: s.oncelik })),
    ...MAKALELER.map((m) => {
      const tarih = makaleIsoTarihi(m.tarih);
      return {
        url: `${taban}/blog/${m.slug}`,
        priority: 0.5,
        ...(tarih ? { lastModified: tarih } : {}),
      };
    }),
  ];
}
