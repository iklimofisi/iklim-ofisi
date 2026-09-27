export interface Makale {
  slug: string;
  baslik: string;
  kategori: string;
  tarih: string;
  okumaSuresi: string;
  ozet: string;
  icerikHtml: string;
}

export const MAKALELER: Makale[] = [
  {
    slug: "endustriyel-mutfak-havalandirma-elektrostatik-filtre",
    baslik: "Endüstriyel Mutfak Havalandırmasında Elektrostatik Filtrasyon: AIRNEX",
    kategori: "MUTFAK HAVALANDIRMA",
    tarih: "26 Eylül 2026",
    okumaSuresi: "4 dk okuma",
    ozet: "Restoran ve endüstriyel mutfak egzozlarında yağ aerosolleri, duman ve ince partiküllerin kontrolü için elektrostatik hücreli aspiratörler nasıl çalışır, proje için hangi bilgiler gerekir?",
    icerikHtml: `
      <h2>Mutfak Egzozunda Asıl Sorun: Yağ Aerosolleri ve Duman</h2>
      <p>Izgara, fritöz ve ocak gibi pişirme ekipmanları; egzoz havasına yağ damlacıkları, duman ve ince partiküller bırakır. Bu kirleticiler kanal içinde birikir, çevreye rahatsızlık verir ve bakım maliyetlerini artırır.</p>

      <h2>AIRNEX Elektrostatik Hücreli Aspiratör Nasıl Çalışır?</h2>
      <p>AIRNEX sisteminde hava dört kademeden geçer: <strong>Ön filtre</strong> büyük yağ damlacıklarını ve kaba partikülleri tutar; <strong>iyonizasyon</strong> bölümünde ince partiküller elektriksel olarak yüklenir; <strong>toplama hücresinde</strong> yüklü partiküller kolektör plakalarına çekilerek tutulur; filtrelenmiş hava ise <strong>sistem fanı</strong> üzerinden egzoza gönderilir.</p>

      <h2>Koku Kontrolü Hakkında</h2>
      <p>Elektrostatik filtrasyon esas olarak partikül fazındaki kirleticilere yöneliktir. Gaz fazındaki koku bileşenleri için gerektiğinde aktif karbon, UV veya başka uygun bir kademe ayrıca projelendirilir.</p>

      <h2>Proje İçin Hangi Bilgiler Gerekir?</h2>
      <p>Doğru seçim için hava debisi (m³/h), toplam basınç (Pa), kanal ölçüsü, egzoz sıcaklığı, pişirme/proses tipi ve günlük çalışma süresi bilgileri gerekir. Mühendislerimiz bu verilerle cihaz boyutlandırmasını yapar ve davlumbazdan fana kadar tüm hattı projelendirir.</p>
    `,
  },
  {
    slug: "vrf-rehberi-mitsubishi-electric-ve-tcl",
    baslik: "VRF İklimlendirme Rehberi: Mitsubishi Electric ve TCL VRF Teknolojileri",
    kategori: "VRF MERKEZİ SİSTEM",
    tarih: "01 Eylül 2026",
    okumaSuresi: "5 dk okuma",
    ozet: "Otel, plaza ve konut projelerinde iklimlendirme maliyetini düşüren Mitsubishi Electric City Multi ve TCL TMV serisi VRF sistemlerinin mühendislik bakışıyla değerlendirmesi.",
    icerikHtml: `
      <h2>VRF / VRV İklimlendirme Nedir?</h2>
      <p>VRF (Variable Refrigerant Flow) sistemler, değişken debili soğutucu akışkan teknolojisiyle tek bir dış ünite grubuna onlarca iç ünite bağlayarak her odayı bağımsız iklimlendirmenizi sağlar.</p>

      <h2>Mitsubishi Electric City Multi VRF Üstünlükleri</h2>
      <p>Mitsubishi Electric VRF sistemleri, Inverter kompresör yapısı ve yüksek COP/EER verimlilik değerleri ile öne çıkar. Düşük dış hava sıcaklıklarında dahi yüksek ısıtma performansı sunan Zubadan teknolojisi, otel ve plaza projelerinde güçlü bir konfor sağlar.</p>

      <h2>TCL TMV Serisi VRF Sistemleri</h2>
      <p>TCL'in yeni nesil TMV serisi VRF sistemleri, Inverter kompresör ve akıllı kontrol altyapısıyla ofis, mağaza, otel ve konut projelerinde yüksek verim ile rekabetçi yatırım maliyetini bir arada sunar. Geniş iç ünite seçenekleri sayesinde farklı mahal tiplerine esnek çözüm üretir.</p>

      <h2>Projenizde Hangi Sistemi Seçmelisiniz?</h2>
      <p>Mühendis kadromuz; binanızın cephe yönü, cam alanları ve kullanım amacına göre m² bazlı ısı kazancı/kaybı hesabı yaparak Mitsubishi Electric veya TCL VRF sistemlerinden projenize ve bütçenize en uygun olanı projelendirir.</p>
    `,
  },
  {
    slug: "buderus-ile-merkezi-ve-bireysel-isitma",
    baslik: "Buderus Isıtma Teknolojileri: Kaskad Kazan ve Isı Pompası Verimliliği",
    kategori: "ISITMA & KASKAD",
    tarih: "28 Ağustos 2026",
    okumaSuresi: "4 dk okuma",
    ozet: "Buderus duvar tipi yoğuşmalı kaskad kazanlar ve ısı pompası sistemleri ile binalarda doğalgaz ve elektrik tüketimini %35 oranında düşürme yöntemleri.",
    icerikHtml: `
      <h2>Isıtmada Alman Mühendisliği: Buderus</h2>
      <p>Buderus, 280 yılı aşan döküm ve iklimlendirme tecrübesiyle merkezi ve bireysel ısıtma sistemlerinde dünya standardıdır. Özel alüminyum-silisyum döküm eşanjör yapısı sayesinde kireçlenmeye ve korozyona karşı maksimum dayanıklılık sağlar.</p>

      <h2>Buderus Yoğuşmalı Kaskad Kazan Sistemleri</h2>
      <p>Büyük binalarda ve sitelerde tek bir dev kazan yerine, birden fazla Buderus duvar tipi yoğuşmalı kazanın paralel çalıştırıldığı kaskad sistemler tercih edilir. Bina ısı ihtiyacına göre kazanlar sırayla devreye girerek gereksiz gaz tüketimini önler.</p>

      <h2>Buderus Hava Kaynaklı Isı Pompaları</h2>
      <p>Müstakil villa ve konutlarda fosil yakıtlara bağımlılığı bitiren Buderus ısı pompaları, dış havadaki ücretsiz ısı enerjisini çekerek yerden ısıtma ve kullanım sıcak suyu üretir.</p>
    `,
  },
  {
    slug: "endustriyel-havalandirma-ve-isi-geri-kazanim",
    baslik: "Endüstriyel Tesislerde Isı Geri Kazanımlı Havalandırma (İGK) Tesisatı",
    kategori: "HAVALANDIRMA",
    tarih: "20 Ağustos 2026",
    okumaSuresi: "6 dk okuma",
    ozet: "Fabrika, AVM ve kapalı otoparklarda taze hava sağlarken içerideki sıcaklığı kaybetmeyen Isı Geri Kazanım Santralleri (AHU) ve spiro kanal tasarımı.",
    icerikHtml: `
      <h2>Neden Isı Geri Kazanım Santrali Kullanılmalı?</h2>
      <p>Kapalı mekanlardaki kirli havayı dışarı atarken, içeri alınan taze havayı dışarı atılan havanın ısısıyla ısıtıp/soğutan cihazlara Isı Geri Kazanım (İGK) santrali denir. Bu sistem klima ve ısıtma yükünüzü %70 oranında azaltır.</p>

      <h2>Klima Santralleri (AHU) ve Spiro Kanal İmalatı</h2>
      <p>Endüstriyel tesislerde hava debisi (m³/h) ve anemometre basınç kayıpları AutoCAD ortamında hesaplanarak sızdırmaz spiro dairesel kanallar ile dağıtılır.</p>
    `,
  },
  {
    slug: "klima-kapasite-hesabi-ve-inverter-teknolojisi",
    baslik: "Doğru Klima Seçimi: Isı Kazancı Hesabı ve Inverter Kompresör Avantajları",
    kategori: "REHBER",
    tarih: "12 Ağustos 2026",
    okumaSuresi: "3 dk okuma",
    ozet: "Sadece metrekareye göre klima seçerken yapılan hatalar, cam yüzey faktörü ve Mitsubishi Electric / TCL Inverter teknolojisinin elektrik faturasına etkisi.",
    icerikHtml: `
      <h2>Metrekareye Göre Klima Seçimi Neden Hatalıdır?</h2>
      <p>Aynı metrekareye sahip çatı katı bir oda ile zemin kat ara oda arasında %50 ısı yükü farkı vardır. Cam alanı, binanın yalıtımı ve cephe yönü hesaplanmadan alınan klimalar ya yetersiz kalır ya da gereksiz fazla elektrik tüketir.</p>

      <h2>Inverter Kompresör Nasıl Tasarruf Sağlar?</h2>
      <p>Eski tip klimalar sürekli dur-kalk yaparak yüksek demeraj akımı çeker. Mitsubishi Electric ve TCL Inverter klimalar ise ortam sıcaklığına göre devrini ayarlayarak kesintisiz ve A+++ verimle çalışır.</p>
    `,
  },
];
// "26 Eylül 2026" → 2026-09-26 (site haritası ve Google makale bilgisi için)
const AYLAR = ["ocak", "şubat", "mart", "nisan", "mayıs", "haziran", "temmuz", "ağustos", "eylül", "ekim", "kasım", "aralık"];
export function makaleIsoTarihi(tarih: string): string | null {
  const m = tarih.trim().match(/^(\d{1,2})\s+(\S+)\s+(\d{4})$/);
  if (!m) return null;
  const ay = AYLAR.indexOf(m[2].toLocaleLowerCase("tr-TR")) + 1;
  if (ay === 0) return null;
  return `${m[3]}-${String(ay).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}
