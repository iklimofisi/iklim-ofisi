import { Manrope } from "next/font/google";

// -----------------------------------------------------------------------------
// İKLİM OFİSİ LOGOSU (HAT) — tek kaynak
// İşaret: "io" harflerini tek çizgiyle çizen tesisat hattı; nokta bakır.
// Sitedeki ve paneldeki bütün logolar buradan gelir. Eski logo dosyaları
// (public/logo-icon.png, logo-full.png) silinmedi; gerekirse geri dönülebilir.
// -----------------------------------------------------------------------------

const manrope = Manrope({ subsets: ["latin", "latin-ext"], weight: ["500", "800"], display: "swap" });

export const LOGO_RENK = { orman: "#183A32", bakir: "#C8743A", bakirAcik: "#D98A4E", nane: "#A8CBB7", keten: "#F3F0E8" };

// Yalnız işaret. boyut = yükseklik (px). ters: koyu zemin için beyaz çizgi.
export function LogoIsaret({ boyut = 40, ters = false, className = "", baslik }: { boyut?: number; ters?: boolean; className?: string; baslik?: string }) {
  const genislik = Math.round((boyut * 84) / 76);
  // Küçük boyutta çizgi bir tık kalınlaşır (16–24 px'te de net okunsun)
  const kalin = boyut <= 28;
  return (
    <svg
      width={genislik}
      height={boyut}
      viewBox="10 6 84 76"
      className={className}
      role={baslik ? "img" : undefined}
      aria-label={baslik}
      aria-hidden={baslik ? undefined : true}
    >
      <circle cx="20" cy="17" r={kalin ? 7.5 : 6.5} fill={ters ? LOGO_RENK.bakirAcik : LOGO_RENK.bakir} />
      <path
        d="M20 32V58A16 16 0 0 0 36 74H64A22 22 0 1 0 43.3 59.5"
        fill="none"
        stroke={ters ? "#FFFFFF" : LOGO_RENK.orman}
        strokeWidth={kalin ? 11 : 9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// İşaret + "iklim ofisi" yazısı (+ isteğe bağlı "MEKANİK MÜHENDİSLİK")
export function LogoTam({
  boyut = 40,
  ters = false,
  altYazi = true,
  className = "",
}: {
  boyut?: number;
  ters?: boolean;
  altYazi?: boolean;
  className?: string;
}) {
  const yaziBoyu = Math.round(boyut * 0.62);
  return (
    <span className={`inline-flex items-center ${manrope.className} ${className}`} style={{ gap: Math.round(boyut * 0.28) }}>
      <LogoIsaret boyut={boyut} ters={ters} />
      <span className="flex flex-col" style={{ lineHeight: 1 }}>
        <span style={{ fontSize: yaziBoyu, letterSpacing: "-0.03em", color: ters ? "#FFFFFF" : LOGO_RENK.orman, whiteSpace: "nowrap" }}>
          <span style={{ fontWeight: 800 }}>iklim</span> <span style={{ fontWeight: 500 }}>ofisi</span>
        </span>
        {altYazi && (
          <span
            style={{
              fontSize: Math.max(8, Math.round(boyut * 0.2)),
              fontWeight: 800,
              letterSpacing: "0.26em",
              color: ters ? LOGO_RENK.bakirAcik : LOGO_RENK.bakir,
              marginTop: Math.round(boyut * 0.12),
              whiteSpace: "nowrap",
            }}
          >
            MEKANİK MÜHENDİSLİK
          </span>
        )}
      </span>
    </span>
  );
}
