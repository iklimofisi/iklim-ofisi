import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Hakkimizda() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-3">
          Hakkımızda
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-metin mb-8">
          İklim Ofisi
        </h1>
        <p className="text-metin/70 text-lg leading-relaxed mb-6">
          İklim Ofisi, konut ve ticari alanlarda iklimlendirme projelerini
          uçtan uca yürüten bir mühendislik ve uygulama ekibidir. Keşiften
          devreye almaya, bakımdan servis desteğine kadar tüm süreçte
          müşterilerimizin yanındayız.
        </p>
        <p className="text-metin/70 text-lg leading-relaxed">
          İçeriği ihtiyacınıza göre birlikte güncelleyebiliriz — ekip, referans
          projeler, sertifikalar gibi bölümler ekleyebiliriz.
        </p>
      </main>
      <Footer />
    </>
  );
}
