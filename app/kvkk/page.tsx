import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSirketAyarlari } from "@/lib/sirket";
import { dilAlternatifleri, yol, type Dil } from "@/lib/dil";
import { dilAl } from "@/lib/dil-sunucu";

export const dynamic = "force-dynamic";

const META: Record<Dil, { baslik: string; aciklama: string }> = {
  tr: {
    baslik: "KVKK Aydınlatma Metni ve Çerez Bilgilendirmesi",
    aciklama:
      "İklim Ofisi Mühendislik web sitesi üzerinden paylaşılan kişisel verilerin 6698 sayılı KVKK kapsamında işlenmesine ilişkin aydınlatma metni.",
  },
  en: {
    baslik: "Privacy Notice (KVKK) and Cookie Information",
    aciklama:
      "Privacy notice on the processing of personal data shared via the İklim Ofisi Engineering website under the Turkish Personal Data Protection Law No. 6698 (KVKK).",
  },
  de: {
    baslik: "Datenschutzhinweis (KVKK) und Cookie-Informationen",
    aciklama:
      "Datenschutzhinweis zur Verarbeitung personenbezogener Daten, die über die Website von İklim Ofisi Engineering übermittelt werden, nach dem türkischen Datenschutzgesetz Nr. 6698 (KVKK).",
  },
};

export function generateMetadata(): Metadata {
  const dil = dilAl();
  return {
    title: META[dil].baslik,
    description: META[dil].aciklama,
    alternates: dilAlternatifleri(dil, "/kvkk"),
  };
}

// İngilizce / Almanca metin (Türkçe metnin çevirisi; bağlayıcı olan Türkçe metindir)
type Bolum = { baslik: string; paragraflar?: string[]; liste?: [string, string][] | string[] };
type YabanciKvkk = {
  ust: string;
  h1: string;
  giris: string;
  not: string;
  sorumluA: string;
  sorumluB: string;
  bolumler: Bolum[];
  haklarGiris: string;
  haklar: string[];
  basvuruA: string;
  basvuruEposta: string;
  basvuruB: string;
  cerezBaslik: string;
  cerez: string;
  sorularA: string;
  sorularLink: string;
  sorularB: string;
};

const YABANCI: Record<"en" | "de", YabanciKvkk> = {
  en: {
    ust: "Legal Information",
    h1: "Privacy Notice (KVKK)",
    giris:
      "Pursuant to Article 10 of the Turkish Personal Data Protection Law No. 6698 (\"KVKK\"), we would like to inform you about how the personal data you share with us via our website is processed.",
    not: "This is a translation for information purposes; the Turkish version is legally binding.",
    sorumluA: "Your personal data is processed by",
    sorumluB: "as the data controller.",
    bolumler: [
      {
        baslik: "2. Personal Data Processed",
        liste: [
          ["Identity and contact details:", "name and surname, telephone number, e-mail address."],
          ["Request details:", "the message you write in the contact form and, optionally, the project files you upload (drawings, survey reports, specifications, images, etc.)."],
          ["Transaction security data:", "technical records kept by the hosting infrastructure for the secure operation of the site (IP address, browser information, access time)."],
        ],
      },
      {
        baslik: "3. Purposes of Processing",
        liste: [
          "Responding to your site survey, quotation and information requests,",
          "Technical evaluation, site survey planning and preparation of quotations for your project,",
          "Keeping records of the request process and managing customer relations,",
          "Fulfilling legal obligations and ensuring information security.",
        ],
      },
      {
        baslik: "4. Legal Basis and Method of Collection",
        paragraflar: [
          "Your personal data is collected electronically via the contact form on our website and processed on the legal grounds of KVKK Article 5/2-(c) \"being directly related to the conclusion or performance of a contract\", 5/2-(ç) \"fulfilment of a legal obligation\" and 5/2-(f) \"the legitimate interest of the data controller, provided that it does not harm the fundamental rights and freedoms of the data subject\".",
        ],
      },
      {
        baslik: "5. Transfer of Personal Data",
        paragraflar: [
          "Your personal data may be transferred, only for the above purposes and to the extent necessary, to our business partners and suppliers involved in fulfilling your request, to authorised public institutions and organisations, and to the information technology providers we use (web hosting, database and e-mail services), in accordance with the conditions in KVKK Articles 8 and 9. The servers of these service providers may be located abroad.",
        ],
      },
      {
        baslik: "6. Retention Period",
        paragraflar: [
          "Your data is stored for as long as required by the purpose of processing and for the limitation periods stipulated in the relevant legislation; at the end of this period it is deleted, destroyed or anonymised.",
        ],
      },
    ],
    haklarGiris: "Under Article 11 of the Law, by applying to the data controller you have the right to:",
    haklar: [
      "Learn whether your personal data is processed and, if so, request information about it,",
      "Learn the purpose of processing and whether it is used in accordance with that purpose,",
      "Know the third parties to whom it is transferred in Türkiye or abroad,",
      "Request correction if it is incomplete or incorrectly processed,",
      "Request its deletion or destruction under the conditions of KVKK Article 7,",
      "Request that correction and deletion operations be notified to the third parties to whom the data was transferred,",
      "Object to a result against you arising from analysis exclusively by automated systems,",
      "Request compensation for damages if you suffer damage due to unlawful processing.",
    ],
    basvuruA: "You can submit your applications",
    basvuruEposta: "by e-mail to",
    basvuruB: "or in writing to our address above. Applications are concluded free of charge within 30 days at the latest.",
    cerezBaslik: "8. Cookies",
    cerez:
      "Our site uses basic cookies necessary for it to function properly. Google Analytics may be used to understand visit statistics; this service collects page views and device information as anonymous statistics. You can delete or block cookies at any time in your browser settings.",
    sorularA: "For any questions, you can use our",
    sorularLink: "contact page",
    sorularB: ".",
  },
  de: {
    ust: "Rechtliche Hinweise",
    h1: "Datenschutzhinweis (KVKK)",
    giris:
      "Gemäß Artikel 10 des türkischen Gesetzes Nr. 6698 zum Schutz personenbezogener Daten („KVKK“) möchten wir Sie darüber informieren, wie die personenbezogenen Daten verarbeitet werden, die Sie uns über unsere Website übermitteln.",
    not: "Dies ist eine Übersetzung zu Informationszwecken; rechtlich verbindlich ist die türkische Fassung.",
    sorumluA: "Ihre personenbezogenen Daten werden von",
    sorumluB: "als Verantwortlichem verarbeitet.",
    bolumler: [
      {
        baslik: "2. Verarbeitete personenbezogene Daten",
        liste: [
          ["Identitäts- und Kontaktdaten:", "Vor- und Nachname, Telefonnummer, E-Mail-Adresse."],
          ["Anfragedaten:", "die Nachricht, die Sie in das Kontaktformular schreiben, und optional hochgeladene Projektdateien (Zeichnungen, Besichtigungsberichte, Leistungsbeschreibungen, Bilder usw.)."],
          ["Daten zur Vorgangssicherheit:", "technische Protokolle, die die Hosting-Infrastruktur für den sicheren Betrieb der Website speichert (IP-Adresse, Browserinformationen, Zugriffszeit)."],
        ],
      },
      {
        baslik: "3. Zwecke der Verarbeitung",
        liste: [
          "Beantwortung Ihrer Anfragen zu Besichtigung, Angebot und Information,",
          "Technische Bewertung, Planung der Besichtigung und Erstellung von Angeboten für Ihr Projekt,",
          "Dokumentation des Anfrageprozesses und Pflege der Kundenbeziehungen,",
          "Erfüllung rechtlicher Pflichten und Gewährleistung der Informationssicherheit.",
        ],
      },
      {
        baslik: "4. Rechtsgrundlage und Art der Erhebung",
        paragraflar: [
          "Ihre personenbezogenen Daten werden elektronisch über das Kontaktformular auf unserer Website erhoben und auf Grundlage von KVKK Artikel 5/2-(c) „unmittelbarer Zusammenhang mit dem Abschluss oder der Erfüllung eines Vertrags“, 5/2-(ç) „Erfüllung einer rechtlichen Verpflichtung“ und 5/2-(f) „berechtigtes Interesse des Verantwortlichen, sofern die Grundrechte und Grundfreiheiten der betroffenen Person nicht beeinträchtigt werden“ verarbeitet.",
        ],
      },
      {
        baslik: "5. Übermittlung personenbezogener Daten",
        paragraflar: [
          "Ihre personenbezogenen Daten können ausschließlich zu den oben genannten Zwecken und im erforderlichen Umfang an unsere an der Bearbeitung Ihrer Anfrage beteiligten Geschäftspartner und Lieferanten, an zuständige Behörden sowie an von uns beauftragte IT-Dienstleister (Webhosting, Datenbank und E-Mail-Dienste) gemäß den Bedingungen der Artikel 8 und 9 KVKK übermittelt werden. Die Server dieser Dienstleister können sich im Ausland befinden.",
        ],
      },
      {
        baslik: "6. Speicherdauer",
        paragraflar: [
          "Ihre Daten werden so lange gespeichert, wie es der Verarbeitungszweck erfordert, sowie für die in den einschlägigen Vorschriften vorgesehenen Verjährungsfristen; nach Ablauf werden sie gelöscht, vernichtet oder anonymisiert.",
        ],
      },
    ],
    haklarGiris: "Gemäß Artikel 11 des Gesetzes haben Sie das Recht, beim Verantwortlichen",
    haklar: [
      "zu erfahren, ob Ihre personenbezogenen Daten verarbeitet werden, und gegebenenfalls Auskunft darüber zu verlangen,",
      "den Zweck der Verarbeitung zu erfahren und ob die Daten zweckentsprechend verwendet werden,",
      "die Dritten im In- oder Ausland zu kennen, an die die Daten übermittelt werden,",
      "die Berichtigung unvollständig oder unrichtig verarbeiteter Daten zu verlangen,",
      "die Löschung oder Vernichtung unter den Bedingungen von Artikel 7 KVKK zu verlangen,",
      "zu verlangen, dass Berichtigungen und Löschungen den Dritten mitgeteilt werden, an die die Daten übermittelt wurden,",
      "einem Ergebnis zu Ihrem Nachteil zu widersprechen, das ausschließlich durch automatisierte Analyse entsteht,",
      "bei einem Schaden durch rechtswidrige Verarbeitung Schadenersatz zu verlangen.",
    ],
    basvuruA: "Ihre Anträge können Sie",
    basvuruEposta: "per E-Mail an",
    basvuruB: "oder schriftlich an unsere oben genannte Adresse richten. Anträge werden spätestens innerhalb von 30 Tagen kostenlos bearbeitet.",
    cerezBaslik: "8. Cookies",
    cerez:
      "Unsere Website verwendet grundlegende Cookies, die für ihren ordnungsgemäßen Betrieb erforderlich sind. Zur Auswertung von Besuchsstatistiken kann Google Analytics genutzt werden; dieser Dienst erfasst Seitenaufrufe und Geräteinformationen als anonyme Statistik. Sie können Cookies jederzeit in Ihren Browsereinstellungen löschen oder blockieren.",
    sorularA: "Bei Fragen nutzen Sie bitte unsere",
    sorularLink: "Kontaktseite",
    sorularB: ".",
  },
};

function Baslik({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-lg font-semibold text-metin mt-10 mb-3">{children}</h2>;
}

export default async function KvkkSayfasi() {
  const sirket = await getSirketAyarlari();
  const dil = dilAl();

  if (dil !== "tr") {
    const t = YABANCI[dil];
    return (
      <>
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-16 text-sm leading-relaxed text-metin/80">
          <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-3">{t.ust}</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-metin mb-4">{t.h1}</h1>
          <p className="text-metin/60 mb-3">{t.giris}</p>
          <p className="text-xs text-metin/50 italic mb-8">{t.not}</p>

          <Baslik>{dil === "en" ? "1. Data Controller" : "1. Verantwortlicher"}</Baslik>
          <p>
            {t.sorumluA} <b>{sirket.unvan}</b>
            {sirket.adres ? <> ({sirket.adres})</> : null} {t.sorumluB}
          </p>

          {t.bolumler.map((b) => (
            <div key={b.baslik}>
              <Baslik>{b.baslik}</Baslik>
              {b.paragraflar?.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {b.liste && (
                <ul className="list-disc pl-5 space-y-1">
                  {b.liste.map((m) =>
                    Array.isArray(m) ? (
                      <li key={m[0]}>
                        <b>{m[0]}</b> {m[1]}
                      </li>
                    ) : (
                      <li key={m}>{m}</li>
                    )
                  )}
                </ul>
              )}
            </div>
          ))}

          <Baslik>{dil === "en" ? "7. Your Rights (KVKK Article 11)" : "7. Ihre Rechte (Artikel 11 KVKK)"}</Baslik>
          <p className="mb-2">{t.haklarGiris}</p>
          <ul className="list-disc pl-5 space-y-1">
            {t.haklar.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          <p className="mt-3">
            {t.basvuruA}
            {sirket.email ? (
              <>
                {" "}
                {t.basvuruEposta}{" "}
                <a href={`mailto:${sirket.email}`} className="text-soguk-dim underline">
                  {sirket.email}
                </a>
              </>
            ) : null}{" "}
            {t.basvuruB}
          </p>

          <Baslik>{t.cerezBaslik}</Baslik>
          <p>{t.cerez}</p>

          <div className="mt-12 pt-6 border-t border-hat text-xs text-metin/50">
            {t.sorularA}{" "}
            <Link href={yol(dil, "/iletisim")} className="text-soguk-dim underline">
              {t.sorularLink}
            </Link>
            {t.sorularB}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16 text-sm leading-relaxed text-metin/80">
        <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-3">Yasal Bilgilendirme</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-metin mb-4">
          KVKK Aydınlatma Metni
        </h1>
        <p className="text-metin/60 mb-8">
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) madde 10 uyarınca, web sitemiz
          üzerinden bizimle paylaştığınız kişisel verilerin nasıl işlendiği hakkında sizi bilgilendirmek isteriz.
        </p>

        <Baslik>1. Veri Sorumlusu</Baslik>
        <p>
          Kişisel verileriniz, veri sorumlusu sıfatıyla <b>{sirket.unvan}</b>
          {sirket.adres ? <> ({sirket.adres})</> : null} tarafından işlenmektedir.
        </p>

        <Baslik>2. İşlenen Kişisel Veriler</Baslik>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <b>Kimlik ve iletişim bilgileri:</b> ad soyad, telefon numarası, e-posta adresi.
          </li>
          <li>
            <b>Talep bilgileri:</b> iletişim formuna yazdığınız mesaj ve isteğe bağlı olarak yüklediğiniz proje
            dosyaları (çizim, keşif raporu, şartname, görsel vb.).
          </li>
          <li>
            <b>İşlem güvenliği bilgileri:</b> sitenin güvenli çalışması için barındırma altyapısının tuttuğu teknik
            kayıtlar (IP adresi, tarayıcı bilgisi, erişim zamanı).
          </li>
        </ul>

        <Baslik>3. İşleme Amaçları</Baslik>
        <ul className="list-disc pl-5 space-y-1">
          <li>Keşif, teklif ve bilgi taleplerinize dönüş yapılması,</li>
          <li>Projeniz için teknik değerlendirme, keşif planlaması ve teklif hazırlanması,</li>
          <li>Talep sürecine ilişkin kayıtların tutulması ve müşteri ilişkilerinin yürütülmesi,</li>
          <li>Hukuki yükümlülüklerin yerine getirilmesi ve bilgi güvenliğinin sağlanması.</li>
        </ul>

        <Baslik>4. Hukuki Sebep ve Toplama Yöntemi</Baslik>
        <p>
          Kişisel verileriniz, web sitemizdeki iletişim formu aracılığıyla elektronik ortamda toplanmakta; KVKK
          madde 5/2-(c) &quot;bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması&quot;, 5/2-(ç)
          &quot;hukuki yükümlülüğün yerine getirilmesi&quot; ve 5/2-(f) &quot;ilgili kişinin temel hak ve
          özgürlüklerine zarar vermemek kaydıyla veri sorumlusunun meşru menfaati&quot; hukuki sebeplerine dayanılarak
          işlenmektedir.
        </p>

        <Baslik>5. Kişisel Verilerin Aktarılması</Baslik>
        <p>
          Kişisel verileriniz yalnızca yukarıdaki amaçlar için ve gerekli olduğu ölçüde; talebinizin
          karşılanmasında yer alan iş ortaklarımıza ve tedarikçilerimize, yetkili kamu kurum ve kuruluşlarına ve
          hizmet aldığımız bilgi teknolojileri sağlayıcılarına (web barındırma, veri tabanı ve e-posta hizmetleri)
          KVKK madde 8 ve 9&apos;daki şartlara uygun olarak aktarılabilir. Bu hizmet sağlayıcıların sunucuları yurt
          dışında bulunabilir.
        </p>

        <Baslik>6. Saklama Süresi</Baslik>
        <p>
          Verileriniz, işleme amacının gerektirdiği süre ve ilgili mevzuatta öngörülen zamanaşımı süreleri boyunca
          saklanır; sürenin sonunda silinir, yok edilir veya anonim hâle getirilir.
        </p>

        <Baslik>7. Haklarınız (KVKK Madde 11)</Baslik>
        <p className="mb-2">Kanun&apos;un 11. maddesi uyarınca veri sorumlusuna başvurarak;</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse buna ilişkin bilgi talep etme,</li>
          <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
          <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
          <li>Eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme,</li>
          <li>KVKK madde 7&apos;deki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
          <li>Düzeltme ve silme işlemlerinin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
          <li>
            Münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz
            etme,
          </li>
          <li>Kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
        </ul>
        <p className="mt-3">
          haklarına sahipsiniz. Başvurularınızı
          {sirket.email ? (
            <>
              {" "}
              <a href={`mailto:${sirket.email}`} className="text-soguk-dim underline">
                {sirket.email}
              </a>{" "}
              adresine e-posta ile veya
            </>
          ) : null}{" "}
          yukarıdaki adresimize yazılı olarak iletebilirsiniz. Başvurular en geç 30 gün içinde ücretsiz olarak
          sonuçlandırılır.
        </p>

        <Baslik>8. Çerezler</Baslik>
        <p>
          Sitemiz, düzgün çalışması için gerekli temel çerezleri kullanır. Ziyaret istatistiklerini anlamak amacıyla
          Google Analytics hizmetinden yararlanılabilir; bu hizmet, sayfa görüntüleme ve cihaz bilgilerini anonim
          istatistik olarak toplar. Çerezleri tarayıcınızın ayarlarından dilediğiniz zaman silebilir veya
          engelleyebilirsiniz.
        </p>

        <div className="mt-12 pt-6 border-t border-hat text-xs text-metin/50">
          Sorularınız için{" "}
          <Link href="/iletisim" className="text-soguk-dim underline">
            iletişim sayfamızı
          </Link>{" "}
          kullanabilirsiniz.
        </div>
      </main>
      <Footer />
    </>
  );
}
