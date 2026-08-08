import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TemperatureGauge from "@/components/TemperatureGauge";
import Link from "next/link";

const hizmetler = [
  {
    baslik: "Klima Montaj & Bakım",
    aciklama: "Konut ve ofisler için split, multi-split ve VRF sistem kurulumu ile periyodik bakım.",
  },
  {
    baslik: "Endüstriyel Soğutma",
    aciklama: "Depo, üretim tesisi ve soğuk hava deposu projelerinde uçtan uca soğutma çözümleri.",
  },
  {
    baslik: "Havalandırma Sistemleri",
    aciklama: "Isı geri kazanımlı havalandırma tasarımı, kanal döşeme ve devreye alma.",
  },
];

export default function AnaSayfa() {
  return (
    <>
      <Header />
      <main>
        <section className="max-w-6xl mx-auto px-6 pt-16 sm:pt-24 pb-16 grid sm:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-4">
              -5°C ile +35°C arası
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.1] text-metin">
              Her ortam için doğru sıcaklığı kuruyoruz.
            </h1>
            <p className="mt-6 text-metin/70 text-lg max-w-md">
              İklim Ofisi; konut, ofis ve endüstriyel tesislerde klima, soğutma ve
              havalandırma projelerini anahtar teslim yürütür.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="/iletisim"
                className="focus-ring bg-soguk text-white px-6 py-3 rounded-md font-medium hover:bg-soguk-dim transition-colors"
              >
                Teklif İsteyin
              </Link>
              <Link
                href="/hizmetler"
                className="focus-ring border border-hat px-6 py-3 rounded-md font-medium text-metin hover:border-soguk transition-colors"
              >
                Hizmetlerimiz
              </Link>
            </div>
          </div>
          <div className="flex justify-center sm:justify-end">
            <TemperatureGauge />
          </div>
        </section>

        <section className="bg-yuzey border-y border-hat">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <h2 className="font-display text-2xl font-semibold text-metin mb-10">
              Hizmetlerimiz
            </h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {hizmetler.map((h) => (
                <div key={h.baslik}>
                  <h3 className="font-display font-medium text-metin mb-2">{h.baslik}</h3>
                  <p className="text-sm text-metin/65 leading-relaxed">{h.aciklama}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-metin">
            Projeniz için hızlı ve net bir teklif alın.
          </h2>
          <Link
            href="/iletisim"
            className="focus-ring inline-block mt-6 bg-metin text-zemin px-6 py-3 rounded-md font-medium hover:bg-soguk-dim transition-colors"
          >
            Bize Ulaşın
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
