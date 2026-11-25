/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Yüklenen Çek/Fatura görselleri için 10MB limit izni verildi
    },
  },
  // tclklima.com (ve www) → iklimofisi.com. Ana sayfa TCL VRF sayfasına, diğer adresler
  // iklimofisi.com'daki aynı sayfaya kalıcı (308) yönlendirilir.
  async redirects() {
    const tclklima = [{ type: "host", value: "(www\\.)?tclklima\\.com" }];
    return [
      // VERTA fırınlar siteden kaldırıldı: eski adresler (Google'daki kayıtlar dahil) Ürünler sayfasına gider
      { source: "/verta", destination: "/urunler", permanent: true },
      { source: "/kataloglar/verta-firin-katalogu-iklim-ofisi.pdf", destination: "/urunler", permanent: true },
      { source: "/kataloglar/verta-konveksiyonel-firin-katalog.pdf", destination: "/urunler", permanent: true },
      // "Hava perdesi nedir" yazısı Hava Perdesi sayfasıyla birleştirildi (aynı aramalar iki sayfaya bölünmesin)
      { source: "/blog/hava-perdesi-nedir-nasil-secilir", destination: "/hava-perdesi", permanent: true },
      { source: "/en/blog/hava-perdesi-nedir-nasil-secilir", destination: "/en/hava-perdesi", permanent: true },
      { source: "/de/blog/hava-perdesi-nedir-nasil-secilir", destination: "/de/hava-perdesi", permanent: true },
      { source: "/", has: tclklima, destination: "https://iklimofisi.com/tcl-vrf", permanent: true },
      { source: "/:yol*", has: tclklima, destination: "https://iklimofisi.com/:yol*", permanent: true },
    ];
  },
};

export default nextConfig;
