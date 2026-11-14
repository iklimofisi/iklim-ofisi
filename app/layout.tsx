import type { Metadata } from "next";
import Script from "next/script"; // Google Analytics için Eklendi
import "./globals.css";

// Google Analytics Kimliği Vercel'den Otomatik Okunur
const gaId = process.env.NEXT_PUBLIC_GA_ID;

// Google Tag Manager kapsayıcısı
const GTM_ID = "GTM-TFWGDTTJ";

export const metadata: Metadata = {
  title: {
    default: "İklim Ofisi Mühendislik — İstanbul VRF, Klima & Mekanik Tesisat",
    template: "%s | İklim Ofisi Mühendislik",
  },
  description:
    "İstanbul'da konut, ofis, otel ve endüstriyel tesisler için TCL ve Mitsubishi Electric VRF sistemleri, klima ve multi klima, ısı pompası, Fraenkische yerden ısıtma, kazan dairesi yenileme, havalandırma ve mekanik tesisat. Ücretsiz keşif ve projelendirme.",
  keywords: [
    "VRF Klima",
    "İklimlendirme",
    "Mekanik Tesisat",
    "Multi Klima",
    "Isı Pompası",
    "Yerden Isıtma",
    "Fraenkische Yerden Isıtma",
    "Kazan Dairesi Yenileme",
    "Buderus Isı Pompası",
    "Endüstriyel Havalandırma",
    "TCL VRF",
    "Mitsubishi Electric VRF",
    "TCL Klima",
    "Mutfak Havalandırma",
    "AIRNEX",
    "Elektrostatik Filtre",
    "Mühendislik Keşif",
  ],
  authors: [{ name: "İklim Ofisi Mühendislik" }],
  metadataBase: new URL("https://iklimofisi.com"),
  
  // CHROME SEKMESİNDEKİ LOGO (FAVICON) BURAYA TANIMLANDI
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },

  // WHATSAPP, LINKEDIN & SOSYAL MEDYA PAYLAŞIM KARTI (OPEN GRAPH)
  openGraph: {
    title: "İklim Ofisi Mühendislik — VRF, Klima, Isı Pompası & Yerden Isıtma",
    description:
      "TCL ve Mitsubishi Electric VRF, klima ve multi klima; ısı pompası, Fraenkische yerden ısıtma ve kazan dairesi yenileme. 24 saatte ücretsiz keşif imkanı.",
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
  
  // ARAMA MOTORU DOĞRULAMA KODLARI (Google Search Console, Bing, Yandex)
  // Kodlar Vercel → Settings → Environment Variables'a yazılır; kod değişikliği gerekmez.
  // Tanımlı değilse sayfaya hiçbir şey eklenmez.
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.YANDEX_VERIFICATION ? { yandex: process.env.YANDEX_VERIFICATION } : {}),
    ...(process.env.BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } } : {}),
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
        {/* GOOGLE TAG MANAGER (JavaScript kapalı tarayıcılar için) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}

        {/* GOOGLE TAG MANAGER: dataLayer ve gtag tanımlanır, sayfa görüntüleme olayı (gtm.js) gönderilir, sonra gtm.js yüklenir */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
            (function(){
              var s = document.createElement('script');
              s.async = true;
              s.src = 'https://www.googletagmanager.com/gtm.js?id=${GTM_ID}';
              document.head.appendChild(s);
            })();
          `}
        </Script>

        {/* GOOGLE ANALYTICS (GA4) KODLARI */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}