import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KapasiteHesaplayici from "@/components/KapasiteHesaplayici";
import { dilAlternatifleri, type Dil } from "@/lib/dil";
import { dilAl } from "@/lib/dil-sunucu";

export const dynamic = "force-dynamic";

const META: Record<Dil, { baslik: string; aciklama: string }> = {
  tr: {
    baslik: "Klima Kapasite Hesaplama",
    aciklama: "Mekanınız için gereken klima / VRF kapasitesini hızlıca hesaplayın, ardından ücretsiz keşif ile netleştirelim.",
  },
  en: {
    baslik: "Air Conditioning Capacity Calculator",
    aciklama: "Quickly calculate the air conditioning / VRF capacity your space needs, then let us confirm it with a free site survey.",
  },
  de: {
    baslik: "Klima-Leistungsrechner",
    aciklama: "Berechnen Sie schnell die benötigte Klima- / VRF-Leistung für Ihren Raum – anschließend bestätigen wir sie bei einer kostenlosen Besichtigung.",
  },
};

export function generateMetadata(): Metadata {
  const dil = dilAl();
  return {
    title: META[dil].baslik,
    description: META[dil].aciklama,
    alternates: dilAlternatifleri(dil, "/hesaplama"),
  };
}

export default function HesaplamaPage() {
  const dil = dilAl();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white flex flex-col justify-between">
      <Header />
      
      <main className="py-12 md:py-20 flex-1">
        <div className="max-w-5xl mx-auto px-6">
          <KapasiteHesaplayici dil={dil} />
        </div>
      </main>

      <Footer />
    </div>
  );
}