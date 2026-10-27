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
      { source: "/", has: tclklima, destination: "https://iklimofisi.com/tcl-vrf", permanent: true },
      { source: "/:yol*", has: tclklima, destination: "https://iklimofisi.com/:yol*", permanent: true },
    ];
  },
};

export default nextConfig;
