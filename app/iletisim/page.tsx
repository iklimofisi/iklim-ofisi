import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { webTalebiOlustur } from "@/lib/web-talep-actions";
import { getSirketAyarlari } from "@/lib/sirket"; // PANEL AYARLARI EKLENDİ
import Link from "next/link";
import DosyaSecici from "@/components/DosyaSecici";
import TelefonEpostaAlanlari from "@/components/TelefonEpostaAlanlari";
import { whatsappNumarasi } from "@/components/IletisimButonlari";
import FormDonusumu from "@/components/FormDonusumu";
import { dilAlternatifleri, yol, type Dil } from "@/lib/dil";
import { dilAl } from "@/lib/dil-sunucu";

// İLETİŞİM SAYFASI METİNLERİ (Türkçe / English / Deutsch)
const tr = {
  metaBaslik: "İletişim — Ücretsiz Keşif & Teklif",
  metaAciklama:
    "VRF, klima, ısıtma, havalandırma veya mutfak egzozu projeniz için İklim Ofisi ile iletişime geçin; ücretsiz keşif ve teklif isteyin.",
  hata: {
    "eksik-bilgi": "Ad soyad ve proje detayı alanlarını doldurmanız gerekiyor, tekrar deneyin.",
    "iletisim-yok": "Size dönebilmemiz için telefon veya e-postadan en az birini yazın.",
    kvkk: "Formu gönderebilmek için KVKK Aydınlatma Metni'ni okuduğunuzu onaylamanız gerekiyor.",
    "dosya-boyutu": "Eklediğiniz dosya 4 MB'tan büyük. Daha küçük bir dosya ekleyin ya da dosyayı e-posta ile gönderin.",
    "dosya-turu": "Yalnızca PDF, DWG, DXF, JPG veya PNG dosyası ekleyebilirsiniz.",
  } as Record<string, string>,
  hataGenel: "Form gönderilemedi, lütfen tekrar deneyin.",
  ust: "İletişim",
  h1: "Projenizi konuşalım.",
  giris:
    "VRF, klima, ısıtma veya havalandırma projeniz için elinizde bir proje dosyası (teknik çizim, keşif raporu, teklif şartnamesi vb.) varsa aşağıya ekleyebilirsiniz. Elinizde bir dosya yoksa sorun değil — mesaj kutusuna ihtiyacınızı yazmanız yeterli, sizin için ücretsiz keşif planlayalım.",
  adres: "📍 Adresimiz:",
  telefon: "📞 Telefon: ",
  eposta: "✉️ E-posta: ",
  vergi: "🏛️ Vergi Bilgisi: ",
  basarili: "Talebiniz alındı, en kısa sürede sizinle iletişime geçeceğiz.",
  gizliAlan: "Bu alanı boş bırakın",
  adSoyad: "Ad Soyad",
  adOrnek: "Adınız Soyadınız",
  projeDetayi: "Proje Detayı",
  mesajOrnek: "Ne tür bir çözüm arıyorsunuz? (örn. 800 m² depo için VRF sistemi ihtiyacımız var / elimde proje dosyası yok, keşif istiyorum)",
  dosya: "Proje Dosyası (opsiyonel)",
  dosyaNot: "PDF, DWG, DXF veya görsel — en fazla 4 MB, opsiyonel.",
  kvkkLink: "KVKK Aydınlatma Metni",
  kvkkMetin: "'ni okudum; talebime dönüş yapılabilmesi için paylaştığım bilgilerin bu metin kapsamında işleneceğini biliyorum.",
  gonder: "Gönder",
};

type Metin = typeof tr;

const en: Metin = {
  metaBaslik: "Contact — Free Site Survey & Quote",
  metaAciklama:
    "Contact İklim Ofisi about your VRF, air conditioning, heating, ventilation or kitchen exhaust project and request a free site survey and quote.",
  hata: {
    "eksik-bilgi": "Please fill in your name and the project details, then try again.",
    "iletisim-yok": "Please enter at least a phone number or an e-mail address so that we can get back to you.",
    kvkk: "To send the form, please confirm that you have read the Privacy Notice (KVKK).",
    "dosya-boyutu": "The attached file is larger than 4 MB. Please attach a smaller file or send it by e-mail.",
    "dosya-turu": "You can only attach PDF, DWG, DXF, JPG or PNG files.",
  },
  hataGenel: "The form could not be sent, please try again.",
  ust: "Contact",
  h1: "Let's talk about your project.",
  giris:
    "If you have a project file for your VRF, air conditioning, heating or ventilation project (technical drawing, survey report, tender specification, etc.), you can attach it below. If you don't have a file, that's fine — just describe what you need in the message box and we will arrange a free site survey for you.",
  adres: "📍 Our Address:",
  telefon: "📞 Phone: ",
  eposta: "✉️ E-mail: ",
  vergi: "🏛️ Tax Information: ",
  basarili: "Your request has been received; we will get in touch with you as soon as possible.",
  gizliAlan: "Leave this field empty",
  adSoyad: "Full Name",
  adOrnek: "Your name and surname",
  projeDetayi: "Project Details",
  mesajOrnek: "What kind of solution are you looking for? (e.g. we need a VRF system for an 800 m² warehouse / I have no project file and would like a site survey)",
  dosya: "Project File (optional)",
  dosyaNot: "PDF, DWG, DXF or image — max. 4 MB, optional.",
  kvkkLink: "Privacy Notice (KVKK)",
  kvkkMetin: " — I have read it and understand that the information I share will be processed under this notice so that my request can be answered.",
  gonder: "Send",
};

const de: Metin = {
  metaBaslik: "Kontakt — Kostenlose Besichtigung & Angebot",
  metaAciklama:
    "Kontaktieren Sie İklim Ofisi zu Ihrem VRF-, Klima-, Heizungs-, Lüftungs- oder Küchenabluftprojekt und fordern Sie eine kostenlose Besichtigung und ein Angebot an.",
  hata: {
    "eksik-bilgi": "Bitte füllen Sie Name und Projektdetails aus und versuchen Sie es erneut.",
    "iletisim-yok": "Bitte geben Sie mindestens eine Telefonnummer oder eine E-Mail-Adresse an, damit wir uns bei Ihnen melden können.",
    kvkk: "Um das Formular zu senden, bestätigen Sie bitte, dass Sie den Datenschutzhinweis (KVKK) gelesen haben.",
    "dosya-boyutu": "Die angehängte Datei ist größer als 4 MB. Bitte hängen Sie eine kleinere Datei an oder senden Sie sie per E-Mail.",
    "dosya-turu": "Sie können nur PDF-, DWG-, DXF-, JPG- oder PNG-Dateien anhängen.",
  },
  hataGenel: "Das Formular konnte nicht gesendet werden, bitte versuchen Sie es erneut.",
  ust: "Kontakt",
  h1: "Sprechen wir über Ihr Projekt.",
  giris:
    "Wenn Sie für Ihr VRF-, Klima-, Heizungs- oder Lüftungsprojekt eine Projektdatei haben (technische Zeichnung, Besichtigungsbericht, Leistungsbeschreibung usw.), können Sie diese unten anhängen. Haben Sie keine Datei, ist das kein Problem – beschreiben Sie einfach Ihren Bedarf im Nachrichtenfeld, und wir planen eine kostenlose Besichtigung für Sie.",
  adres: "📍 Unsere Adresse:",
  telefon: "📞 Telefon: ",
  eposta: "✉️ E-Mail: ",
  vergi: "🏛️ Steuerdaten: ",
  basarili: "Ihre Anfrage ist eingegangen; wir melden uns so schnell wie möglich bei Ihnen.",
  gizliAlan: "Dieses Feld leer lassen",
  adSoyad: "Vor- und Nachname",
  adOrnek: "Ihr Vor- und Nachname",
  projeDetayi: "Projektdetails",
  mesajOrnek: "Welche Lösung suchen Sie? (z. B. wir benötigen ein VRF-System für ein 800-m²-Lager / ich habe keine Projektdatei und wünsche eine Besichtigung)",
  dosya: "Projektdatei (optional)",
  dosyaNot: "PDF, DWG, DXF oder Bild — max. 4 MB, optional.",
  kvkkLink: "Datenschutzhinweis (KVKK)",
  kvkkMetin: " – ich habe ihn gelesen und weiß, dass meine Angaben zur Beantwortung meiner Anfrage gemäß diesem Hinweis verarbeitet werden.",
  gonder: "Senden",
};

const METIN: Record<Dil, Metin> = { tr, en, de };

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const dil = dilAl();
  const t = METIN[dil];
  return {
    title: t.metaBaslik,
    description: t.metaAciklama,
    alternates: dilAlternatifleri(dil, "/iletisim"),
  };
}

export default async function Iletisim({
  searchParams,
}: {
  searchParams: { basarili?: string; hata?: string; talep?: string };
}) {
  // Paneldeki güncel şirket bilgilerini veritabanından çeker
  const sirket = await getSirketAyarlari();
  const dil = dilAl();
  const t = METIN[dil];
  const wa = whatsappNumarasi(sirket.whatsapp);
  // Spam korumasında kullanılan form açılış zamanı
  const formAcilis = Date.now();

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-3">
          {t.ust}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-metin mb-4">
          {t.h1}
        </h1>
        <p className="text-metin/60 mb-8">
          {t.giris}
        </p>

        {/* PANELDEN DİNAMİK GELEN ŞİRKET BİLGİLERİ KARTI */}
        <div className="bg-soguk-light/30 border border-hat rounded-lg p-6 mb-10 text-sm space-y-3">
          <h2 className="font-display font-semibold text-base text-metin">
            {sirket.unvan}
          </h2>
          {sirket.slogan && dil === "tr" && (
            <p className="text-xs text-soguk-dim font-medium">{sirket.slogan}</p>
          )}

          <div className="grid sm:grid-cols-2 gap-4 pt-2 text-xs text-metin/80">
            {sirket.adres && (
              <div>
                <span className="font-semibold text-metin block mb-0.5">{t.adres}</span>
                <span>{sirket.adres}</span>
              </div>
            )}
            <div className="space-y-1">
              {sirket.telefon && (
                <div>
                  <span className="font-semibold text-metin">{t.telefon}</span>
                  <span>{sirket.telefon}</span>
                </div>
              )}
              {sirket.email && (
                <div>
                  <span className="font-semibold text-metin">{t.eposta}</span>
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
                  <span className="font-semibold text-metin">{t.vergi}</span>
                  <span>{sirket.vergiDairesi} - {sirket.vergiNo}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {searchParams?.basarili && (
          <div className="bg-soguk-light text-soguk-dim rounded-md px-4 py-3 mb-6 text-sm">
            {t.basarili}
          </div>
        )}
        {/* Google Ads: "Potansiyel müşteri formu gönderimi" dönüşümü (yalnız kaydedilen talepte, bir kez) */}
        {searchParams?.basarili && searchParams?.talep && <FormDonusumu talepId={String(searchParams.talep).slice(0, 40)} />}
        {searchParams?.hata && (
          <div className="bg-sicak-light text-sicak-dim rounded-md px-4 py-3 mb-6 text-sm">
            {(Object.prototype.hasOwnProperty.call(t.hata, searchParams.hata) && t.hata[searchParams.hata]) ||
              t.hataGenel}
          </div>
        )}

        <form action={webTalebiOlustur} className="space-y-5">
          {/* Spam koruması: görünmez alan (gerçek ziyaretçiler görmez) + form açılış zamanı */}
          <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
            {/* Ad, tarayıcının otomatik doldurmasına (şirket / adres / web) benzememeli */}
            <label htmlFor="hp_k7">{t.gizliAlan}</label>
            <input id="hp_k7" name="hp_k7" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <input type="hidden" name="form_acilis" value={formAcilis} />
          {/* Form dili: teşekkür / hata sayfası aynı dilde açılsın, talepte dil görünsün */}
          {dil !== "tr" && <input type="hidden" name="dil" value={dil} />}

          <div>
            <label className="block text-sm font-medium text-metin mb-1" htmlFor="ad">
              {t.adSoyad}
            </label>
            <input
              id="ad"
              name="ad"
              required
              className="focus-ring w-full border border-hat rounded-md px-4 py-2.5 bg-yuzey"
              placeholder={t.adOrnek}
            />
          </div>
          <TelefonEpostaAlanlari dil={dil} />
          <div>
            <label className="block text-sm font-medium text-metin mb-1" htmlFor="mesaj">
              {t.projeDetayi}
            </label>
            <textarea
              id="mesaj"
              name="mesaj"
              required
              rows={5}
              className="focus-ring w-full border border-hat rounded-md px-4 py-2.5 bg-yuzey"
              placeholder={t.mesajOrnek}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-metin mb-1" htmlFor="dosya">
              {t.dosya}
            </label>
            <DosyaSecici dil={dil} />
            <p className="text-xs text-metin/40 mt-1">{t.dosyaNot}</p>
          </div>
          <label className="flex items-start gap-2.5 text-sm text-metin/70">
            <input type="checkbox" name="kvkk" required className="mt-0.5 accent-soguk w-4 h-4 shrink-0" />
            <span>
              <Link href={yol(dil, "/kvkk")} target="_blank" className="text-soguk-dim underline">
                {t.kvkkLink}
              </Link>
              {t.kvkkMetin}
            </span>
          </label>
          <button
            type="submit"
            className="focus-ring bg-soguk text-white px-6 py-3 rounded-md font-medium hover:bg-soguk-dim transition-colors"
          >
            {t.gonder}
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}