/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Yüklenen Çek/Fatura görselleri için 10MB limit izni verildi
    },
  },
};

export default nextConfig;