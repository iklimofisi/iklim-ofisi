import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/panel", "/panel/", "/t/"],
    },
    sitemap: "https://iklimofisi.com/sitemap.xml",
  };
}
