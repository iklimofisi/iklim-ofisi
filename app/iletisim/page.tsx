import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { webTalebiOlustur } from "@/lib/web-talep-actions";
import { getSirketAyarlari } from "@/lib/sirket"; // PANEL AYARLARI EKLENDİ
import Link from "next/link";
import DosyaSecici from "@/components/DosyaSecici";
import TelefonEpostaAlanlari from "@/components/TelefonEpostaAlanlari";
import { whatsappNumarasi } from "@/components/IletisimButonlari";

const HATA_MESAJI: Record<string, string> = {
  "eksik-bilgi": "Ad soyad ve proje detayı alanlarını doldurmanız gerekiyor, tekrar deneyin.",
  "iletisim-yok": "Size dönebilmemiz için telefon veya e-postadan en az birini yazın.",
  kvkk: "Formu gönderebilmek için KVKK Aydınlatma Metni'ni okuduğunuzu onaylamanız gerekiyor.",
  "dosya-boyutu": "Eklediğiniz dosya 4 MB'tan büyük. Daha küçük bir dosya ekleyin ya da dosyayı e-posta ile gönderin.",
  "dosya-turu": "Yalnızca PDF, DWG, DXF, JPG veya PNG dosyası ekleyebilirsiniz.",
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "İletişim — Ücretsiz Keşif & Teklif",
  description:
    "VRF, klima, ısıtma, havalandırma veya mutfak egzozu projeniz için İklim Ofisi ile iletişime geçin; ücretsiz keşif ve teklif isteyin.",
  alternates: { canonical: "/iletisim" },
};

export default async function Iletisim({
  searchParams,
}: {
  searchParams: { basarili?: string; hata?: string };
}) {
  // Paneldeki güncel şirket bilgilerini veritabanından çeker
  const sirket = await getSirketAyarlari();
  const wa = whatsappNumarasi(sirket.whatsapp);
  // Spam korumasında kullanılan form açılış zamanı
  const formAcilis = Date.now();

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
                  <a href={`mailto:${sirket.email}`} className="hover:underline">
                    {sirket.email}
                  </a>
                </div>
              )}
              {wa && (
                <div>
                  <span className="font-semibold text-metin">💬 WhatsApp: </span>
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {sirket.whatsapp}
                  </a>
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
            {(Object.prototype.hasOwnProperty.call(HATA_MESAJI, searchParams.hata) && HATA_MESAJI[searchParams.hata]) ||
              "Form gönderilemedi, lütfen tekrar deneyin."}
          </div>
        )}

        <form action={webTalebiOlustur} className="space-y-5">
          {/* Spam koruması: görünmez alan (gerçek ziyaretçiler görmez) + form açılış zamanı */}
          <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
            <label htmlFor="firma_web_adresi">Bu alanı boş bırakın</label>
            <input id="firma_web_adresi" name="firma_web_adresi" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <input type="hidden" name="form_acilis" value={formAcilis} />

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
          <TelefonEpostaAlanlari />
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
            <DosyaSecici />
            <p className="text-xs text-metin/40 mt-1">PDF, DWG, DXF veya görsel — en fazla 4 MB, opsiyonel.</p>
          </div>
          <label className="flex items-start gap-2.5 text-sm text-metin/70">
            <input type="checkbox" name="kvkk" required className="mt-0.5 accent-soguk w-4 h-4 shrink-0" />
            <span>
              <Link href="/kvkk" target="_blank" className="text-soguk-dim underline">
                KVKK Aydınlatma Metni
              </Link>
              &apos;ni okudum; talebime dönüş yapılabilmesi için paylaştığım bilgilerin bu metin kapsamında
              işleneceğini biliyorum.
            </span>
          </label>
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