import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "İklim Ofisi Mühendislik — VRF & Mekanik Tesisat Çözümleri",
    template: "%s | İklim Ofisi Mühendislik",
  },
  description:
    "Konut, ofis, otel ve endüstriyel tesislerde VRF merkezi iklimlendirme, ısı pompası, havalandırma ve mekanik tesisat çözümleri. Ücretsiz keşif ve projelendirme.",
  keywords: [
    "VRF Klima",
    "İklimlendirme",
    "Mekanik Tesisat",
    "Isı Pompası",
    "Endüstriyel Havalandırma",
    "Bosch VRF",
    "Daikin Klima",
    "Mühendislik Keşif",
  ],
  authors: [{ name: "İklim Ofisi Mühendislik" }],
  metadataBase: new URL("https://iklimofisi.com"),
  
  // WHATSAPP, LINKEDIN & SOSYAL MEDYA PAYLAŞIM KARTI (OPEN GRAPH)
  openGraph: {
    title: "İklim Ofisi Mühendislik — VRF & Mekanik Tesisat Çözümleri",
    description:
      "Konut ve endüstriyel projeleriniz için A+++ verimli iklimlendirme ve havalandırma sistemleri. 24 saatte ücretsiz keşif imkanı.",
    url: "https://iklimofisi.com",
    siteName: "İklim Ofisi Mühendislik",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "/og-image.png", // public/og-image.png dosyasından çekilir
        width: 1200,
        height: 630,
        alt: "İklim Ofisi Mühendislik",
      },
    ],
  },
  
  // GOOGLE ROBOTS İZİNLERİ
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className="bg-slate-50 text-slate-800 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}