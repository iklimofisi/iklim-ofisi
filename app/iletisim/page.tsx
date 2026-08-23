import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { webTalebiOlustur } from "@/lib/web-talep-actions";
import { getSirketAyarlari } from "@/lib/sirket"; // PANEL AYARLARI EKLENDİ

export const dynamic = "force-dynamic";

export default async function Iletisim({
  searchParams,
}: {
  searchParams: { basarili?: string; hata?: string };
}) {
  // Paneldeki güncel şirket bilgilerini veritabanından çeker
  const sirket = await getSirketAyarlari();

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-3">
          İletişim
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-metin mb-4">
          Projenizi konuşalım.
        </h1>
        <p className="text-metin/60 mb-8">
          VRF, klima, ısıtma veya havalandırma projeniz için elinizde bir proje
          dosyası (teknik çizim, keşif raporu, teklif şartnamesi vb.) varsa
          aşağıya ekleyebilirsiniz. Elinizde bir dosya yoksa sorun değil —
          mesaj kutusuna ihtiyacınızı yazmanız yeterli, sizin için ücretsiz
          keşif planlayalım.
        </p>

        {/* PANELDEN DİNAMİK GELEN ŞİRKET BİLGİLERİ KARTI */}
        <div className="bg-soguk-light/30 border border-hat rounded-lg p-6 mb-10 text-sm space-y-3">
          <h2 className="font-display font-semibold text-base text-metin">
            {sirket.unvan}
          </h2>
          {sirket.slogan && (
            <p className="text-xs text-soguk-dim font-medium">{sirket.slogan}</p>
          )}

          <div className="grid sm:grid-cols-2 gap-4 pt-2 text-xs text-metin/80">
            {sirket.adres && (
              <div>
                <span className="font-semibold text-metin block mb-0.5">📍 Adresimiz:</span>
                <span>{sirket.adres}</span>
              </div>
            )}
            <div className="space-y-1">
              {sirket.telefon && (
                <div>
                  <span className="font-semibold text-metin">📞 Telefon: </span>
                  <span>{sirket.telefon}</span>
                </div>
              )}
              {sirket.email && (
                <div>
                  <span className="font-semibold text-metin">✉️ E-posta: </span>
                  <span>{sirket.email}</span>
                </div>
              )}
              {sirket.vergiDairesi && sirket.vergiNo && (
                <div>
                  <span className="font-semibold text-metin">🏛️ Vergi Bilgisi: </span>
                  <span>{sirket.vergiDairesi} - {sirket.vergiNo}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {searchParams?.basarili && (
          <div className="bg-soguk-light text-soguk-dim rounded-md px-4 py-3 mb-6 text-sm">
            Talebiniz alındı, en kısa sürede sizinle iletişime geçeceğiz.
          </div>
        )}
        {searchParams?.hata && (
          <div className="bg-sicak-light text-sicak-dim rounded-md px-4 py-3 mb-6 text-sm">
            Ad ve mesaj alanlarını doldurmanız gerekiyor, tekrar deneyin.
          </div>
        )}

        <form action={webTalebiOlustur} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-metin mb-1" htmlFor="ad">
              Ad Soyad
            </label>
            <input
              id="ad"
              name="ad"
              required
              className="focus-ring w-full border border-hat rounded-md px-4 py-2.5 bg-yuzey"
              placeholder="Adınız Soyadınız"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
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
              <label className="block text-sm font-medium text-metin mb-1" htmlFor="email">
                E-posta
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="focus-ring w-full border border-hat rounded-md px-4 py-2.5 bg-yuzey"
                placeholder="ornek@sirket.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-metin mb-1" htmlFor="mesaj">
              Proje Detayı
            </label>
            <textarea
              id="mesaj"
              name="mesaj"
              required
              rows={5}
              className="focus-ring w-full border border-hat rounded-md px-4 py-2.5 bg-yuzey"
              placeholder="Ne tür bir çözüm arıyorsunuz? (örn. 800 m² depo için VRF sistemi ihtiyacımız var / elimde proje dosyası yok, keşif istiyorum)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-metin mb-1" htmlFor="dosya">
              Proje Dosyası (opsiyonel)
            </label>
            <input
              id="dosya"
              name="dosya"
              type="file"
              accept=".pdf,.dwg,.jpg,.jpeg,.png"
              className="focus-ring w-full border border-hat rounded-md px-4 py-2.5 bg-yuzey text-sm"
            />
            <p className="text-xs text-metin/40 mt-1">PDF, DWG veya görsel — opsiyonel.</p>
          </div>
          <button
            type="submit"
            className="focus-ring bg-soguk text-white px-6 py-3 rounded-md font-medium hover:bg-soguk-dim transition-colors"
          >
            Gönder
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}