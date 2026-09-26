import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSirketAyarlari } from "@/lib/sirket";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni ve Çerez Bilgilendirmesi",
  description:
    "İklim Ofisi Mühendislik web sitesi üzerinden paylaşılan kişisel verilerin 6698 sayılı KVKK kapsamında işlenmesine ilişkin aydınlatma metni.",
  alternates: { canonical: "/kvkk" },
};

function Baslik({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-lg font-semibold text-metin mt-10 mb-3">{children}</h2>;
}

export default async function KvkkSayfasi() {
  const sirket = await getSirketAyarlari();

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
