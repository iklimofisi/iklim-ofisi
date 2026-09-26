import type { MetadataRoute } from "next";
import { MAKALELER } from "./blog/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const taban = "https://iklimofisi.com";
  const sayfalar = [
    "",
    "/hizmetler",
    "/urunler",
    "/airnex",
    "/hakkimizda",
    "/referanslar",
    "/hesaplama",
    "/blog",
    "/iletisim",
  ];

  return [
    ...sayfalar.map((yol) => ({
      url: `${taban}${yol}`,
      lastModified: new Date(),
    })),
    ...MAKALELER.map((m) => ({
      url: `${taban}/blog/${m.slug}`,
      lastModified: new Date(),
    })),
  ];
}
