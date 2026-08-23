import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KapasiteHesaplayici from "@/components/KapasiteHesaplayici";

export const dynamic = "force-dynamic";

export default function HesaplamaPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-700 selection:text-white flex flex-col justify-between">
      <Header />
      
      <main className="py-12 md:py-20 flex-1">
        <div className="max-w-5xl mx-auto px-6">
          <KapasiteHesaplayici />
        </div>
      </main>

      <Footer />
    </div>
  );
}