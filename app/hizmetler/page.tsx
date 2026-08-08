import Header from "@/components/Header";
import Footer from "@/components/Footer";

const hizmetler = [
  {
    no: "01",
    baslik: "Klima Montaj & Bakım",
    aciklama:
      "Split, multi-split ve VRF sistemlerde keşif, montaj ve yıllık bakım anlaşmaları. Marka bağımsız servis desteği.",
  },
  {
    no: "02",
    baslik: "Endüstriyel Soğutma",
    aciklama:
      "Soğuk hava deposu, üretim hattı ve depo soğutma projelerinde mühendislik, kurulum ve devreye alma.",
  },
  {
    no: "03",
    baslik: "Havalandırma Sistemleri",
    aciklama:
      "Isı geri kazanımlı havalandırma tasarımı, kanal işleri ve hava debisi optimizasyonu.",
  },
  {
    no: "04",
    baslik: "Proje & Danışmanlık",
    aciklama:
      "Yeni yapılarda mekanik tesisat projelendirme ve enerji verimliliği danışmanlığı.",
  },
];

export default function Hizmetler() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-16">
        <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-3">
          Hizmetlerimiz
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-metin mb-12">
          Tasarımdan devreye almaya, tüm süreç bizde.
        </h1>
        <div className="divide-y divide-hat border-t border-hat">
          {hizmetler.map((h) => (
            <div key={h.no} className="py-8 grid sm:grid-cols-[80px_1fr] gap-4">
              <span className="font-mono text-sicak text-sm">{h.no}</span>
              <div>
                <h2 className="font-display font-medium text-lg text-metin mb-2">{h.baslik}</h2>
                <p className="text-metin/65 max-w-2xl leading-relaxed">{h.aciklama}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
