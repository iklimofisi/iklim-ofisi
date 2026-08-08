import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Iletisim() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-3">
          İletişim
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-metin mb-8">
          Projenizi konuşalım.
        </h1>
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-metin mb-1" htmlFor="ad">
              Ad Soyad
            </label>
            <input
              id="ad"
              name="ad"
              className="focus-ring w-full border border-hat rounded-md px-4 py-2.5 bg-yuzey"
              placeholder="Adınız Soyadınız"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-metin mb-1" htmlFor="telefon">
              Telefon
            </label>
            <input
              id="telefon"
              name="telefon"
              className="focus-ring w-full border border-hat rounded-md px-4 py-2.5 bg-yuzey"
              placeholder="05xx xxx xx xx"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-metin mb-1" htmlFor="mesaj">
              Proje Detayı
            </label>
            <textarea
              id="mesaj"
              name="mesaj"
              rows={5}
              className="focus-ring w-full border border-hat rounded-md px-4 py-2.5 bg-yuzey"
              placeholder="Ne tür bir çözüm arıyorsunuz?"
            />
          </div>
          <button
            type="submit"
            className="focus-ring bg-soguk text-white px-6 py-3 rounded-md font-medium hover:bg-soguk-dim transition-colors"
          >
            Gönder
          </button>
          <p className="text-xs text-metin/50">
            Not: Bu form şu an gönderim işlemine bağlı değil — bir sonraki adımda
            e-posta veya panele düşecek şekilde bağlayacağız.
          </p>
        </form>
      </main>
      <Footer />
    </>
  );
}
