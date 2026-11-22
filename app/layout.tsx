import type { Metadata } from "next";
import Script from "next/script"; // Google Analytics için Eklendi
import "./globals.css";
import { HTML_DIL, OG_DIL, type Dil } from "@/lib/dil";
import { dilAl } from "@/lib/dil-sunucu";

// Google Analytics Kimliği Vercel'den Otomatik Okunur
const gaId = process.env.NEXT_PUBLIC_GA_ID;

// Google Tag Manager kapsayıcısı
const GTM_ID = "GTM-TFWGDTTJ";

// Google Ads hesabı ve "Potansiyel müşteri formu gönderimi" dönüşümü
const ADS_ID = "AW-18517752349";
const ADS_FORM_DONUSUMU = "AW-18517752349/w_SNCLKpybgdEJ30-f1E";

// Microsoft Clarity projesi (ziyaretçi ısı haritası / oturum kaydı).
// Yönetim paneli (/panel) kaydedilmez: müşteri, fiyat ve teklif bilgileri Clarity'ye gitmesin.
const CLARITY_ID = "zdojkwvtd3";

// Dile göre site geneli başlık ve açıklama (sayfalar kendi başlıklarını ekler)
const GENEL: Record<Dil, { baslik: string; aciklama: string; ogBaslik: string; ogAciklama: string }> = {
  tr: {
    baslik: "İklim Ofisi Mekanik Mühendislik — İstanbul VRF, Klima & Isı Pompası",
    aciklama:
      "İstanbul'da konut, ofis, otel ve endüstriyel tesisler için TCL ve Mitsubishi Electric VRF sistemleri, klima ve multi klima, ısı pompası, Fraenkische yerden ısıtma, kazan dairesi yenileme, havalandırma ve mekanik tesisat. Ücretsiz keşif ve projelendirme.",
    ogBaslik: "İklim Ofisi Mekanik Mühendislik — VRF, Klima, Isı Pompası & Yerden Isıtma",
    ogAciklama:
      "TCL ve Mitsubishi Electric VRF, klima ve multi klima; ısı pompası, Fraenkische yerden ısıtma ve kazan dairesi yenileme. 24 saatte ücretsiz keşif imkanı.",
  },
  en: {
    baslik: "İklim Ofisi Engineering — Istanbul VRF, Air Conditioning & Mechanical Installation",
    aciklama:
      "TCL and Mitsubishi Electric VRF systems, air conditioners and multi-split systems, heat pumps, Fraenkische underfloor heating, boiler room renovation, ventilation and mechanical installation for homes, offices, hotels and industrial facilities in Istanbul. Free site survey and engineering design.",
    ogBaslik: "İklim Ofisi Engineering — VRF, Air Conditioning, Heat Pumps & Underfloor Heating",
    ogAciklama:
      "TCL and Mitsubishi Electric VRF, air conditioners and multi-split systems; heat pumps, Fraenkische underfloor heating and boiler room renovation. Free site survey within 24 hours.",
  },
  de: {
    baslik: "İklim Ofisi Engineering — VRF, Klimatechnik & Haustechnik in Istanbul",
    aciklama:
      "TCL- und Mitsubishi-Electric-VRF-Systeme, Klima- und Multisplit-Anlagen, Wärmepumpen, Fraenkische Fußbodenheizung, Heizraumsanierung, Lüftung und Haustechnik für Wohnungen, Büros, Hotels und Industrieanlagen in Istanbul. Kostenlose Vor-Ort-Besichtigung und Planung.",
    ogBaslik: "İklim Ofisi Engineering — VRF, Klimaanlagen, Wärmepumpen & Fußbodenheizung",
    ogAciklama:
      "TCL- und Mitsubishi-Electric-VRF, Klima- und Multisplit-Anlagen; Wärmepumpen, Fraenkische Fußbodenheizung und Heizraumsanierung. Kostenlose Besichtigung innerhalb von 24 Stunden.",
  },
};

export function generateMetadata(): Metadata {
  const dil = dilAl();
  const g = GENEL[dil];
  return { ...metadata, title: { default: g.baslik, template: dil === "tr" ? "%s | İklim Ofisi Mekanik Mühendislik" : "%s | İklim Ofisi Engineering" }, description: g.aciklama, openGraph: { ...metadata.openGraph, title: g.ogBaslik, description: g.ogAciklama, locale: OG_DIL[dil], ...(dil === "tr" ? {} : { url: `https://iklimofisi.com/${dil}` }) } };
}

const metadata: Metadata = {
  title: {
    default: "İklim Ofisi Mekanik Mühendislik — İstanbul VRF, Klima & Isı Pompası",
    template: "%s | İklim Ofisi Mekanik Mühendislik",
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
  authors: [{ name: "İklim Ofisi Mekanik Mühendislik" }],
  metadataBase: new URL("https://iklimofisi.com"),
  
  // CHROME SEKMESİNDEKİ LOGO (FAVICON) BURAYA TANIMLANDI
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },

  // WHATSAPP, LINKEDIN & SOSYAL MEDYA PAYLAŞIM KARTI (OPEN GRAPH)
  openGraph: {
    title: "İklim Ofisi Mekanik Mühendislik — VRF, Klima, Isı Pompası & Yerden Isıtma",
    description:
      "TCL ve Mitsubishi Electric VRF, klima ve multi klima; ısı pompası, Fraenkische yerden ısıtma ve kazan dairesi yenileme. 24 saatte ücretsiz keşif imkanı.",
    url: "https://iklimofisi.com",
    siteName: "İklim Ofisi Mekanik Mühendislik",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "/og-image.png", // public/og-image.png dosyasından çekilir
        width: 1200,
        height: 630,
        alt: "İklim Ofisi Mekanik Mühendislik",
      },
    ],
  },
  
  // ARAMA MOTORU DOĞRULAMA KODLARI (Google Search Console, Bing, Yandex)
  // Kodlar Vercel → Settings → Environment Variables'a yazılır; kod değişikliği gerekmez.
  // Tanımlı değilse sayfaya hiçbir şey eklenmez.
  verification: {
    // Değer yanlışlıkla "google-site-verification=..." diye girilmişse ön ek atılır (meta etikette yalnız kod olmalı)
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION.trim().replace(/^google-site-verification=/i, "") }
      : {}),
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
  const dil = dilAl();
  return (
    <html lang={HTML_DIL[dil]} className="scroll-smooth">
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

        {/* MICROSOFT CLARITY: yalnız sitenin herkese açık sayfalarında (panelde yüklenmez) */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            if (window.location.pathname.indexOf('/panel') !== 0) {
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_ID}");
            }
          `}
        </Script>

        {/* GOOGLE ADS: etiket (gtag.js) + form dönüşümü fonksiyonu.
            gtag_report_conversion() iletişim formu başarıyla gönderilince çağrılır (components/FormDonusumu.tsx). */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`} strategy="afterInteractive" />
        <Script id="google-ads" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            window.gtag = window.gtag || function(){dataLayer.push(arguments);};
            gtag('js', new Date());
            gtag('config', '${ADS_ID}');
            window.gtag_report_conversion = function (url, talepId) {
              var callback = function () {
                if (typeof(url) != 'undefined') {
                  window.location = url;
                }
              };
              gtag('event', 'conversion', {
                  'send_to': '${ADS_FORM_DONUSUMU}',
                  'transaction_id': talepId || '',
                  'event_callback': callback
              });
              return false;
            };
          `}
        </Script>

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