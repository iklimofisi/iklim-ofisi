import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const taban = "https://iklimofisi.com";
  const sayfalar = ["", "/hizmetler", "/hesaplama", "/hakkimizda", "/iletisim"];

  return sayfalar.map((yol) => ({
    url: `${taban}${yol}`,
    lastModified: new Date(),
  }));
}
