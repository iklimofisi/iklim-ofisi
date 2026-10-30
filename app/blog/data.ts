export interface Makale {
  slug: string;
  baslik: string;
  kategori: string;
  tarih: string;
  okumaSuresi: string;
  ozet: string;
  icerikHtml: string;
  gorsel: string; // kapak fotoğrafı (public/ altından)
  gorselAlt: string;
  gorselSigdir?: boolean; // beyaz zeminli ürün fotoğrafı: kırpmadan sığdır
  guncelleme?: string; // içerik sonradan önemli ölçüde güncellendiyse ("30 Ekim 2026")
}

// Paylaşım görseli (1200x630, logo + başlık): public/og/blog/<slug>.jpg
export const makaleOgGorseli = (slug: string) => `/og/blog/${slug}.jpg`;

export const MAKALELER: Makale[] = [
  {
    slug: "tcl-mini-vrf-nedir-villa-ve-kucuk-ofis",
    baslik: "TCL Mini VRF Nedir? Villa, Dubleks ve Küçük Ofisler İçin Rehber",
    kategori: "TCL VRF",
    tarih: "30 Ekim 2026",
    okumaSuresi: "5 dk okuma",
    gorsel: "/tcl/tcl-mini-vrf.jpg",
    gorselAlt: "TCL Mini VRF tam DC inverter dış ünitesi",
    gorselSigdir: true,
    ozet: "TCL Mini VRF nedir, split ve multi split klimadan farkı ne? 8–28 kW kapasite, tek ve üç fazlı modeller, SEER/SCOP değerleri, çalışma sıcaklıkları ve villa, dubleks, küçük ofis projelerinde doğru kapasite seçimi.",
    icerikHtml: `
      <h2>Mini VRF Nedir?</h2>
      <p>Mini VRF, büyük binalarda kullanılan VRF teknolojisinin daha küçük projeler için tasarlanmış hâlidir. Tek bir dış üniteye birden fazla iç ünite bağlanır; sistem her odaya ihtiyacı kadar soğutucu akışkan göndererek odaları bağımsız olarak ısıtır ve soğutur. Böylece bir villanın veya küçük bir ofisin bütün odaları tek bir dış üniteyle, cepheye sıra sıra klima dış ünitesi asmadan iklimlendirilir.</p>

      <h2>TCL Mini VRF Serisi</h2>
      <p>TCL Mini VRF, tam DC inverter ikiz rotary kompresörlü dış ünitelerden oluşur ve <strong>8 kW ile 28 kW</strong> arasında 9 kapasitede üretilir:</p>
      <ul>
        <li><strong>Tek fazlı (220–240 V):</strong> 8,0 – 9,0 – 12,1 – 14,0 – 15,5 kW soğutma kapasiteli modeller</li>
        <li><strong>Üç fazlı:</strong> 18,0 – 22,4 – 25,2 – 28,0 kW soğutma kapasiteli modeller</li>
      </ul>
      <p>Tek fazlı modeller, üç fazlı elektrik aboneliği olmayan konutlarda büyük kolaylık sağlar. Katalog değerlerine göre sezonsal soğutma verimi (SEER) modele göre 5,4 ile 7,0, sezonsal ısıtma verimi (SCOP) 3,8 ile 4,4 arasındadır.</p>

      <h2>Çalışma Sıcaklık Aralığı</h2>
      <ul>
        <li><strong>Soğutma:</strong> -15 °C ile 55 °C dış hava sıcaklığı arasında</li>
        <li><strong>Isıtma:</strong> -20 °C ile 24 °C dış hava sıcaklığı arasında</li>
      </ul>
      <p>Bu aralık, İstanbul ve benzeri iklimlerde Mini VRF'nin yalnız yazın değil, kışın da ısıtmada kullanılabilmesini sağlar.</p>

      <h2>Split, Multi Split ve Mini VRF Farkı</h2>
      <h3>Split klima</h3>
      <p>Her iç ünitenin kendi dış ünitesi vardır. Bir veya iki oda için en ekonomik çözümdür; ancak oda sayısı arttıkça cephede çok sayıda dış ünite olur.</p>
      <h3>Multi split</h3>
      <p>Bir dış üniteye birkaç iç ünite bağlanır. Bağlanabilecek iç ünite sayısı ve boru mesafeleri sınırlıdır; küçük daireler için uygundur.</p>
      <h3>Mini VRF</h3>
      <p>Multi splite göre genellikle daha fazla iç ünite bağlanabilir, daha uzun boru mesafelerine izin verir ve kapasiteyi her odanın anlık ihtiyacına göre daha hassas ayarlar. Projeye göre kaset, kanallı (gizli tavan) ve duvar tipi gibi farklı iç ünite tipleri bir arada kullanılabilir; dış üniteye uygun iç ünite seçeneklerini keşifte modele göre belirliyoruz. Villa, dubleks ve çok odalı ofislerde hem görünüm hem de konfor açısından daha esnek bir çözümdür.</p>

      <h2>Hangi Projelere Uygun?</h2>
      <ul>
        <li><strong>Villa ve dubleksler:</strong> Tüm odalar tek dış üniteyle, cephede tek dış ünite</li>
        <li><strong>Küçük ofisler ve muayenehaneler:</strong> Odaların bağımsız kontrolü, düzenli kullanım saatleri</li>
        <li><strong>Mağaza ve kafeler:</strong> Asma tavanda kaset veya kanallı üniteler ile görünmez montaj</li>
        <li><strong>Klinikler:</strong> Her odanın farklı sıcaklıkta tutulabilmesi</li>
      </ul>
      <p>Daha büyük binalarda (plaza, otel, çok katlı ofis) ise 8–32 HP dış ünite modülleri birleştirilerek 128 HP'ye kadar çıkılabilen TCL TMV6+ Super Serisi kullanılır.</p>

      <h2>Kapasite Nasıl Seçilir?</h2>
      <p>Mini VRF kapasitesi, her odanın ayrı ayrı hesaplanan ısı kazancı ve kaybına göre belirlenir. Oda kapasiteleri toplanır, ardından odaların aynı anda çalışma oranı (eş zamanlılık) dikkate alınarak dış ünite seçilir. Cephe yönü, cam oranı, yalıtım ve kullanım yoğunluğu sonucu doğrudan etkiler; bu yüzden "metrekareye göre" seçim çoğu zaman yanıltıcıdır. Kabaca bir fikir için <a href="/hesaplama">kapasite hesaplama</a> aracımızı kullanabilirsiniz.</p>

      <h2>İklim Ofisi ile TCL Mini VRF</h2>
      <p>Keşifte odalarınızı tek tek inceleyip kapasite hesabını yapıyor, dış ünite yerini ve boru güzergâhını belirliyor; satış, montaj ve devreye almayı tek elden yürütüyoruz. Tüm modeller ve teknik tablolar için <a href="/tcl-vrf#mini-vrf">TCL VRF sistemleri</a> sayfamıza bakabilir, <a href="/blog/vrf-mi-split-klima-mi">VRF mi, split klima mı?</a> yazımızda iki sistemin karşılaştırmasını okuyabilirsiniz. Projeniz için <a href="/iletisim">ücretsiz keşif</a> isteyin.</p>
    `,
  },
  {
    slug: "tcl-vrf-nedir-tmv6-super-serisi",
    baslik: "TCL VRF Nedir? TMV6+ Super Serisi Hakkında Bilmeniz Gerekenler",
    kategori: "TCL VRF",
    tarih: "25 Ekim 2026",
    okumaSuresi: "6 dk okuma",
    gorsel: "/tcl/tcl-dis-28-32hp.jpg",
    gorselAlt: "TCL TMV6+ Super Serisi VRF dış ünitesi",
    gorselSigdir: true,
    ozet: "TCL TMV6+ Super Serisi VRF sistemlerinin kapasite aralığı, verim değerleri, çalışma sıcaklıkları, boru uzunlukları, iç ünite seçenekleri ve hangi projelere uygun olduğu.",
    icerikHtml: `
      <h2>TCL VRF Nedir?</h2>
      <p>TCL VRF, bir dış ünite grubuna çok sayıda iç ünitenin bağlandığı merkezi klima sistemidir. VRF (Variable Refrigerant Flow, değişken soğutucu akışkan debisi) teknolojisinde sistem, her odaya o anki ihtiyacı kadar soğutucu akışkan gönderir. Böylece her mahal kendi termostatıyla bağımsız olarak ısıtılır ya da soğutulur; az kullanılan odalar için boşuna enerji harcanmaz.</p>
      <p>TCL'in güncel VRF serisi <strong>TMV6+ Super</strong>, tam DC inverter kompresör ve fan motorlarıyla çalışır. Seri; ofis, otel, mağaza, restoran, plaza ve konut projeleri için geliştirilmiştir.</p>

      <h2>Kapasite: Tek Ünite 32 HP, Kombinasyonla 128 HP</h2>
      <p>TMV6+ Super Serisinde 8 HP'den 32 HP'ye kadar 13 farklı dış ünite modülü bulunur. Tek bir dış ünite en fazla 32 HP'dir; daha büyük projelerde modüller birleştirilerek (kombinasyon) 128 HP'ye kadar çıkılır. Bu sayede küçük bir ofis katından büyük bir otele kadar aynı ürün ailesiyle çözüm üretilebilir.</p>
      <p>Daha küçük projeler için <strong>TCL Mini VRF</strong> serisi 8–28 kW kapasite aralığında üretilir. 8–16 kW modeller tek fazlı (220–240 V), 18–28 kW modeller üç fazlı beslemeyle çalışır. Villa, dubleks, küçük ofis ve klinik gibi projelerde sık tercih edilir.</p>

      <h2>Verim Değerleri</h2>
      <p>Katalog değerlerine göre TMV6+ Super Serisinde sezonsal soğutma verimi (SEER) 7,35'e, sezonsal ısıtma verimi (SCOP) 4,50'ye kadar çıkar. Sezonsal değerler, cihazın yıl boyunca farklı dış sıcaklıklarda ve kısmi yükte çalıştığı durumu yansıttığı için işletme maliyetini anlamakta tek noktadaki COP/EER değerinden daha anlamlıdır.</p>

      <h2>Çalışma Sıcaklık Aralığı</h2>
      <ul>
        <li><strong>Soğutma:</strong> -15 °C ile 56 °C dış hava sıcaklığı arasında</li>
        <li><strong>Isıtma:</strong> -30 °C ile 28 °C dış hava sıcaklığı arasında</li>
      </ul>
      <p>Düşük dış sıcaklıkta ısıtma performansını korumak için çift entalpili (buhar enjeksiyonlu) ısıtma teknolojisi kullanılır. Bu, kışın ısıtmanın da VRF ile yapılmak istendiği projelerde önemlidir.</p>

      <h2>Boru Uzunlukları ve Yerleşim Esnekliği</h2>
      <p>VRF projelerinde dış ünitenin nereye konulabileceğini boru limitleri belirler. TMV6+ Super Serisinde:</p>
      <ul>
        <li>Toplam boru uzunluğu 1.100 m'ye kadar,</li>
        <li>En uzak iç üniteye gerçek boru uzunluğu 220 m (eşdeğer 240 m),</li>
        <li>Dış ünite üstteyken seviye farkı 100 m, alttayken 110 m,</li>
        <li>İç üniteler arası seviye farkı 40 m'dir.</li>
      </ul>
      <p>Dış ünite fanı 130 Pa'ya kadar dış statik basınç sağlayabildiği için cihaz kapalı teknik hacimlere veya ara katlara da yerleştirilebilir; sıcak hava kanalla dışarı atılır.</p>

      <h2>Öne Çıkan Teknolojiler</h2>
      <ul>
        <li><strong>DC inverter scroll kompresör:</strong> Kademesiz frekans kontrolü ile kapasite ihtiyaca göre ayarlanır.</li>
        <li><strong>6 aşamalı yağ dönüşü:</strong> Uzun boru hatlarında kompresör yağının geri dönmesini güvence altına alır.</li>
        <li><strong>Üçlü yedekleme:</strong> Kompresör, modül ve sensör yedek çalışması sayesinde tek bir arıza tüm sistemi durdurmaz.</li>
        <li><strong>Polaritesiz haberleşme:</strong> İç ve dış ünite haberleşme kablosunda artı/eksi ayrımı olmadığı için montaj hatası riski azalır.</li>
      </ul>

      <h2>İç Ünite Seçenekleri</h2>
      <p>TCL VRF sistemine 9 kategoride 100'den fazla iç ünite modeli bağlanabilir. En sık kullanılanlar:</p>
      <ul>
        <li><strong>Kaset tipi (360°, kompakt, tek ve iki yönlü):</strong> Asma tavanlı ofis, mağaza ve restoranlar</li>
        <li><strong>Kanallı tip (ince, orta/yüksek ve ultra yüksek statik basınçlı):</strong> Otel odaları, toplantı salonları, gizli montaj istenen mekânlar</li>
        <li><strong>Duvar tipi ve yer/tavan tipi:</strong> Asma tavanı olmayan odalar</li>
        <li><strong>Taze havalı tip:</strong> Dış havayı şartlandırarak içeri veren üniteler</li>
      </ul>

      <h2>Kontrol ve Uzaktan Yönetim</h2>
      <p>Her iç ünite kablolu ya da kablosuz kumandayla ayrı ayrı yönetilebilir. Merkezi dokunmatik kumandalar ile tüm bina tek noktadan izlenir; WiFi modülü ve Tsmart uygulamasıyla sistem telefondan da kontrol edilebilir.</p>

      <h2>TCL VRF Hangi Projelere Uygun?</h2>
      <p>Çok odalı ve odaların farklı saatlerde kullanıldığı her yapıda VRF avantaj sağlar: ofis katları, plazalar, oteller, klinikler, okullar, mağazalar ve villalar. Cephede çok sayıda split dış ünite istenmeyen binalarda da tek dış ünite grubu ile temiz bir görünüm elde edilir.</p>

      <h2>İklim Ofisi ile TCL VRF Projesi</h2>
      <p>Doğru VRF sistemi, doğru ısı yükü hesabıyla başlar. Mühendislerimiz keşif sırasında binanızı inceler, mahal mahal ısı kazancı ve kaybı hesabı yapar, dış ünite yerini ve boru güzergâhını belirler; ardından satış, montaj ve devreye almayı tek elden yürütür. Model ve teknik tablolar için <a href="/tcl-vrf">TCL VRF sistemleri</a> sayfamıza bakabilir, projeniz için <a href="/iletisim">ücretsiz keşif</a> isteyebilirsiniz.</p>
    `,
  },
  {
    slug: "vrf-mi-split-klima-mi",
    baslik: "VRF mi, Split Klima mı? Binanız İçin Doğru Sistemi Seçmek",
    kategori: "REHBER",
    tarih: "25 Ekim 2026",
    okumaSuresi: "5 dk okuma",
    gorsel: "/slider/slider-tcl-kaset.jpg",
    gorselAlt: "Asma tavana monte edilmiş kaset tipi VRF iç ünitesi",
    ozet: "Split klima ile VRF sistemi arasındaki farklar: ilk yatırım, işletme verimi, cephe görünümü, bağımsız kontrol ve bakım. Hangi binada hangi sistemin daha doğru olduğu.",
    icerikHtml: `
      <h2>İki Sistem Nasıl Çalışır?</h2>
      <p><strong>Split klimada</strong> her iç ünitenin kendine ait bir dış ünitesi vardır. Beş odayı klimalandırmak için genellikle beş dış ünite gerekir (multi split sistemlerde bir dış üniteye birkaç iç ünite bağlanabilir, ancak bağlanabilen ünite sayısı sınırlıdır).</p>
      <p><strong>VRF sistemde</strong> ise bir dış ünite grubu, soğutucu akışkan boruları üzerinden onlarca iç üniteyi besler. Sistem her odaya ihtiyacı kadar soğutucu akışkan gönderir ve odalar bağımsız olarak kontrol edilir.</p>

      <h2>Karşılaştırma: 7 Kritere Göre</h2>
      <h3>1. İlk yatırım maliyeti</h3>
      <p>Bir veya birkaç oda için split klima belirgin şekilde daha ekonomiktir. Oda sayısı arttıkça aradaki fark kapanır; çok odalı yapılarda VRF'nin daha az dış ünite, daha kısa elektrik hattı ve tek bir kontrol altyapısı sunması toplam maliyeti dengeler.</p>
      <h3>2. İşletme verimi</h3>
      <p>Binalar yılın büyük bölümünü kısmi yükte geçirir: bazı odalar boş, bazıları güneş alıyor, bazıları gölgede. VRF sistemleri bu kısmi yük koşullarında kapasitesini kademesiz ayarlayarak yüksek verimle çalışır. Çok odalı bir yapıda yıllık enerji tüketimi genellikle split sistemlere göre daha düşüktür.</p>
      <h3>3. Cephe ve çatı görünümü</h3>
      <p>Split sistemde her oda için cepheye bir dış ünite asılır. Plaza, otel ya da site yönetimlerinin cephe kısıtlaması olduğu binalarda bu çoğu zaman mümkün değildir. VRF'de dış üniteler çatıda veya bir teknik alanda toplu olarak durur.</p>
      <h3>4. Boru mesafesi</h3>
      <p>Split klimalarda iç ve dış ünite arasındaki boru mesafesi kısadır. VRF sistemlerde ise yüzlerce metrelik boru hatlarıyla dış ünite binanın en uygun noktasına konulabilir.</p>
      <h3>5. Kontrol ve yönetim</h3>
      <p>VRF'de tüm iç üniteler merkezi kumandadan veya bina otomasyonundan izlenir; çalışma saatleri, sıcaklık sınırları ve arıza kayıtları tek ekranda görülür. Ofis ve otellerde bu, enerji tasarrufu ve bakım kolaylığı açısından önemli bir avantajdır.</p>
      <h3>6. Arıza durumunda etki</h3>
      <p>Split sistemde bir cihazın arızası yalnızca o odayı etkiler. VRF'de kaliteli sistemler kompresör ve modül yedeklemesiyle çalışmaya devam edebilir; yine de sistemin doğru projelendirilmesi ve periyodik bakımı daha da önemli hale gelir.</p>
      <h3>7. Tüketim paylaşımı</h3>
      <p>Bağımsız dairelerden oluşan bir binada ortak bir VRF sistemi kurulacaksa, her bölümün tüketiminin nasıl paylaştırılacağı baştan planlanmalıdır. Ayrı mülkiyetli küçük birimlerde çoğu zaman her bölüm için ayrı sistem daha pratiktir.</p>

      <h2>Hangi Durumda Hangisi?</h2>
      <ul>
        <li><strong>Split klima:</strong> 1–3 odalı daire, küçük dükkân, tek bir toplantı odası gibi az sayıda mahal.</li>
        <li><strong>Mini VRF:</strong> Villa, dubleks, küçük ofis ve klinikler; tek bir dış ünitenin birkaç iç üniteyi beslediği orta ölçekli projeler.</li>
        <li><strong>VRF:</strong> Ofis katları, plazalar, oteller, okullar, AVM'ler ve cephe kısıtı olan her çok odalı bina.</li>
      </ul>

      <h2>Karar Vermeden Önce</h2>
      <p>Doğru seçim; mahal sayısına, kullanım saatlerine, dış ünite için ayrılabilecek alana ve bütçeye birlikte bakılarak yapılır. Küçük odalara yerleştirilecek iç ünitelerde soğutucu akışkan miktarı ilgili standartlara göre ayrıca kontrol edilmelidir. Bu kontrolleri keşif sırasında yapıyor, gerekirse iki sistem için ayrı teklif hazırlayarak karşılaştırmanızı kolaylaştırıyoruz.</p>
      <p>VRF tarafında güncel bir örnek için <a href="/tcl-vrf">TCL VRF sistemleri</a> sayfamıza bakabilir, odalarınızın kabaca kapasite ihtiyacını <a href="/hesaplama">kapasite hesaplama</a> aracımızla görebilirsiniz.</p>
    `,
  },
  {
    slug: "vrf-klima-maliyetini-belirleyen-etkenler",
    baslik: "VRF Klima Maliyetini Neler Belirler? Teklif Almadan Önce Bilinmesi Gerekenler",
    kategori: "VRF MERKEZİ SİSTEM",
    tarih: "25 Ekim 2026",
    okumaSuresi: "5 dk okuma",
    gorsel: "/hizmetler/hizmet-vrf.jpg",
    gorselAlt: "Bina çatısına yerleştirilmiş VRF dış üniteleri",
    ozet: "VRF sistem fiyatını kapasite, iç ünite tipi, boru güzergâhı, dış ünite yeri, kontrol sistemi ve taze hava ihtiyacı belirler. Metrekare başına fiyatın neden yanıltıcı olduğu ve doğru teklif için gereken bilgiler.",
    icerikHtml: `
      <h2>Neden Tek Bir "VRF Fiyatı" Yok?</h2>
      <p>VRF sistemi hazır bir ürün değil, binaya göre tasarlanan bir tesisattır. Aynı metrekaredeki iki ofisin VRF maliyeti; cephe yönüne, cam oranına, kullanım yoğunluğuna, iç ünite tipine ve dış ünitenin nereye konulabileceğine göre önemli ölçüde değişir. Bu yüzden "metrekare başına VRF fiyatı" ancak kaba bir fikir verir. Aşağıda maliyeti belirleyen başlıca etkenleri sıraladık.</p>

      <h2>1. Toplam Kapasite</h2>
      <p>Maliyetin en büyük kalemi dış ünite kapasitesidir ve bu kapasite ısı yükü hesabıyla belirlenir. Hesapsız, "garanti olsun" diye büyük seçilen sistem hem yatırımı hem de işletme maliyetini artırır. Doğru hesap; mahal mahal ısı kazancı ve kaybını, aynı anda çalışma oranını (eş zamanlılık) ve dış tasarım sıcaklıklarını dikkate alır.</p>

      <h2>2. İç Ünite Sayısı ve Tipi</h2>
      <p>Duvar tipi iç üniteler genellikle en ekonomik seçenektir. Kaset tipler asma tavan gerektirir. Kanallı tipler en estetik çözümü sunar ancak hava kanalı, menfez ve plenum gibi ek imalatlar getirir. İç ünite sayısı arttıkça boru, branşman ve kablolama da artar.</p>

      <h2>3. Boru Güzergâhı ve Uzunluğu</h2>
      <p>Bakır boru, izolasyon, branşman (refnet) parçaları ve askı malzemeleri metrajla artar. Dış ünitenin iç ünitelere uzak olması, kat geçişleri ve şaft durumu işçiliği doğrudan etkiler.</p>

      <h2>4. Dış Ünite Yeri</h2>
      <p>Dış ünitenin çatıya vinçle çıkarılması, çelik taşıyıcı konstrüksiyon, titreşim takozları veya ses perdesi gerekmesi maliyete eklenir. Kapalı bir teknik hacme konulacaksa sıcak havanın kanalla atılması gerekir.</p>

      <h2>5. Kontrol Sistemi</h2>
      <p>Her odada basit bir kablolu kumanda yeterli olabilir; ofis ve otellerde ise merkezi dokunmatik kumanda, zaman programı, uzaktan erişim veya bina otomasyon (BMS) entegrasyonu istenir. Bu tercihler sistemin konforunu ve tasarruf potansiyelini artırır, maliyete de yansır.</p>

      <h2>6. Drenaj ve Elektrik Altyapısı</h2>
      <p>Her iç ünitenin yoğuşma suyunun eğimli bir hatla tahliye edilmesi gerekir; uygun drenaj noktası yoksa pompa veya ek hat yapılır. Dış ünitelerin besleme hattı ve sigorta panosu da projeye dahildir.</p>

      <h2>7. Taze Hava İhtiyacı</h2>
      <p>VRF iç üniteleri ortam havasını şartlandırır, taze hava getirmez. Ofis, toplantı salonu ve sınıf gibi kalabalık mekânlarda ısı geri kazanımlı havalandırma (İGK) cihazı veya taze havalı iç ünite gerekir. Bu kalem baştan teklife eklenmezse sonradan sürpriz maliyet çıkarır.</p>

      <h2>İşletme Maliyetini de Hesaba Katın</h2>
      <p>Satın alma fiyatı kadar yıllık elektrik tüketimi de önemlidir. Teklifleri karşılaştırırken cihazların sezonsal verim değerlerine (SEER, SCOP) bakın; yüksek verimli bir sistem ilk yatırımdaki farkı birkaç yıl içinde geri kazandırabilir.</p>

      <h2>Doğru Teklif İçin Gerekenler</h2>
      <ul>
        <li>Mimari proje veya kat planı (yoksa yerinde ölçü alıyoruz)</li>
        <li>Mekânların kullanım amacı ve yaklaşık kişi sayısı</li>
        <li>Kat yüksekliği ve asma tavan durumu</li>
        <li>Dış ünite için düşünülen alan (çatı, balkon, teknik hacim)</li>
        <li>Isıtmanın da VRF ile yapılıp yapılmayacağı</li>
      </ul>
      <p>Bu bilgilerle mühendislerimiz kapasite hesabını yapar ve kalem kalem şeffaf bir teklif hazırlar. TCL VRF modelleri için <a href="/tcl-vrf">TCL VRF sistemleri</a> sayfamıza bakabilir, <a href="/iletisim">ücretsiz keşif</a> için bize ulaşabilirsiniz.</p>
    `,
  },
  {
    slug: "hava-perdesi-nedir-nasil-secilir",
    baslik: "Hava Perdesi Nedir, Ne İşe Yarar, Nasıl Seçilir?",
    kategori: "HAVA PERDESİ",
    tarih: "25 Ekim 2026",
    guncelleme: "30 Ekim 2026",
    okumaSuresi: "5 dk okuma",
    gorsel: "/hava-perdesi/olefini-kapi.jpg",
    gorselAlt: "Ahşap giriş kapısı üzerine monte edilmiş hava perdesi",
    ozet: "Hava perdesi ne işe yarar, nasıl çalışır, nerelerde kullanılır? Enerji tasarrufu, girişte konfor ve doğru model seçimi: kapı genişliği, montaj yüksekliği, ısıtıcılı veya ısıtıcısız tercih ve montajda dikkat edilecekler.",
    icerikHtml: `
      <h2>Hava Perdesi Nedir?</h2>
      <p>Hava perdesi, kapının üst kısmına monte edilen ve aşağıya doğru güçlü, düzgün bir hava akımı üfleyen cihazdır. Bu hava akımı kapı açıkken iç ve dış ortam arasında görünmez bir bariyer oluşturur. Böylece kışın ısıtılmış, yazın soğutulmuş hava içeride kalır.</p>

      <h2>Hava Perdesi Ne İşe Yarar?</h2>
      <p>Kısaca: kapı açıkken içerideki ısıtılmış ya da soğutulmuş havanın dışarı kaçmasını, dışarıdaki soğuk veya sıcak havanın içeri dolmasını azaltır. Bunun sağladığı faydalar şunlardır:</p>
      <ul>
        <li><strong>Enerji tasarrufu:</strong> Kapıdan kaçan şartlandırılmış hava azaldığı için klima ve ısıtma sistemi daha az çalışır. Gün boyu kapısı açılıp kapanan işletmelerde fark belirgindir.</li>
        <li><strong>Girişte konfor:</strong> Kapı önündeki soğuk hava akımı ve cereyan azalır; kasa, danışma ve karşılama alanında çalışanlar rahat eder.</li>
        <li><strong>Kapıyı açık tutabilme:</strong> Mağaza ve restoranlar kapılarını açık tutabilir; müşteri girişi kolaylaşır, içerideki iklimlendirme bozulmaz.</li>
        <li><strong>Kışın girişi ısıtma:</strong> Isıtıcılı hava perdeleri kapı önüne sıcak bir hava bariyeri oluşturur; giriş bölümü için ayrı bir ısıtıcıya gerek kalmayabilir.</li>
        <li><strong>Dış ortamın etkisini azaltma:</strong> Hava akımı; dışarıdan gelen tozun, egzoz kokusunun ve uçan haşerelerin içeri girmesini azaltmaya yardımcı olur.</li>
      </ul>

      <h2>Nerelerde Kullanılır?</h2>
      <ul>
        <li><strong>Ticari girişler:</strong> Mağaza, market, eczane, banka, kafe ve restoranlar</li>
        <li><strong>Otel ve AVM girişleri:</strong> Yoğun insan trafiği olan, kapısı sık açılan alanlar</li>
        <li><strong>Ofis ve konut girişleri:</strong> Bina lobileri ve ana girişler</li>
        <li><strong>Endüstriyel kapılar:</strong> Depo, atölye, fabrika ve hangar kapıları; yüksek kapılar için endüstriyel seriler kullanılır</li>
      </ul>

      <h2>Doğru Hava Perdesi Nasıl Seçilir?</h2>
      <h3>1. Kapı genişliği</h3>
      <p>Hava perdesinin boyu kapı genişliğine eşit ya da biraz fazla olmalıdır. Hava akımı kapının tamamını kapsamazsa kenarlardan hava kaçar. Geniş kapılarda birden fazla cihaz yan yana monte edilir.</p>
      <h3>2. Montaj yüksekliği</h3>
      <p>Cihazın kapı üstünde takılacağı yükseklik, seçilecek serinin en önemli belirleyicisidir. Hava akımının zemine kadar etkili ulaşması gerekir. Örneğin Niva hava perdelerinin ısıtıcısız modellerinde genel tip Linda serisi 3 m'ye, ticari Life serisi 4 m'ye, endüstriyel Lena serisi 6 m'ye, Turbo serisi 12 m'ye kadar montaj yüksekliği için uygundur.</p>
      <h3>3. Isıtıcılı mı, ısıtıcısız mı?</h3>
      <p>Mekân zaten klima veya kaloriferle iyi ısıtılıyorsa ısıtıcısız model yeterli olabilir. Kışın giriş bölümünün de ısınması isteniyorsa ısıtıcılı model seçilir. Isıtıcılı modeller daha yüksek elektrik gücü çeker; sigorta ve kablo kesiti buna göre kontrol edilmelidir.</p>
      <h3>4. Montaj tipi</h3>
      <p>Kapı üstünde yeterli alan varsa duvara monte modeller kullanılır. Asma tavanlı mağazalarda tavana gömme (kaset) hava perdeleri görünmez bir çözüm sunar. Kapı üstünde hiç yer yoksa dikey montajlı modeller kapının yanına yerleştirilir.</p>

      <h2>Montajda Dikkat Edilecekler</h2>
      <ul>
        <li>Cihaz kapıya olabildiğince yakın ve kapının tam üstüne monte edilmelidir.</li>
        <li>Hava çıkış yönü hafifçe dışarı doğru ayarlanarak bariyer güçlendirilir.</li>
        <li>Sürekli rüzgâr alan cephelerde tek başına hava perdesi yetersiz kalabilir; rüzgârlık veya çift kapı ile birlikte düşünülmelidir.</li>
        <li>Modele göre, kapı açıldığında cihazın otomatik devreye girmesi için kapı switch'i bağlantısı yapılabilir; bu, gereksiz çalışmayı önler.</li>
      </ul>

      <h2>Niva ve Olefini Hava Perdeleri</h2>
      <p>İklim Ofisi olarak Niva ve Olefini marka hava perdelerinin satışını ve montajını yapıyoruz. Niva; genel, ticari, tavana gömme, endüstriyel ve dikey tipte geniş bir seri yelpazesi sunar. Olefini ise şık tasarımı ve dijital kontrol paneliyle mağaza, otel ve restoran girişlerinde dekorasyonla uyumlu bir seçenektir.</p>
      <p>Seri ve ölçüler için <a href="/hava-perdesi">hava perdesi</a> sayfamıza bakabilirsiniz. Kapı genişliğini, montaj yüksekliğini ve ısıtıcılı/ısıtıcısız tercihinizi paylaşırsanız size uygun modelle <a href="/iletisim">teklif</a> hazırlayalım.</p>
    `,
  },
  {
    slug: "aluminyum-radyator-mu-celik-panel-radyator-mu",
    baslik: "Alüminyum Radyatör mü, Çelik Panel Radyatör mü? Farklar ve Doğru Seçim",
    kategori: "ISITMA",
    tarih: "25 Ekim 2026",
    okumaSuresi: "5 dk okuma",
    gorsel: "/ayen/ayen-slider.jpg",
    gorselAlt: "Ahşap desenli Ayen alüminyum radyatör",
    ozet: "Alüminyum ve çelik panel radyatörlerin ısınma hızı, ağırlık, görünüm, su kalitesi ve maliyet açısından karşılaştırması; dilim sayısının nasıl hesaplandığı ve hangi durumda hangisinin tercih edilmesi gerektiği.",
    icerikHtml: `
      <h2>İki Radyatör Tipi Arasındaki Temel Fark</h2>
      <p><strong>Çelik panel radyatörler</strong> sac levhaların preslenip kaynaklanmasıyla üretilir ve Türkiye'de konutlarda en yaygın kullanılan radyatör tipidir. <strong>Alüminyum radyatörler</strong> ise ekstrüzyon veya döküm yöntemiyle üretilen dilimlerin birleştirilmesiyle oluşur. Malzeme ve üretim farkı; ısınma hızını, ağırlığı, görünümü ve kullanım koşullarını doğrudan etkiler.</p>

      <h2>Karşılaştırma</h2>
      <h3>Isınma hızı</h3>
      <p>Alüminyumun ısı iletimi çeliğe göre çok yüksektir ve alüminyum radyatörlerin su hacmi düşüktür. Bu yüzden alüminyum radyatör çalışmaya başladıktan kısa süre sonra ısı vermeye başlar ve termostatik vanaların ayarına hızlı tepki verir. Çelik panel radyatör daha fazla su taşıdığı için daha yavaş ısınır, kapatıldıktan sonra da ısısını biraz daha uzun korur.</p>
      <h3>Ağırlık ve montaj</h3>
      <p>Alüminyum radyatörler hafiftir; taşıma ve montajları kolaydır, duvara daha az yük bindirir.</p>
      <h3>Boyut esnekliği</h3>
      <p>Alüminyum radyatörün boyu dilim sayısıyla belirlenir; ihtiyaca göre dilim eklenip çıkarılabilir. Çelik panel radyatörler belirli standart boy ve yüksekliklerde üretilir.</p>
      <h3>Görünüm</h3>
      <p>Alüminyum radyatörler farklı dilim tasarımları, renkler, ahşap ve metal desenlerle dekoratif seçenekler sunar. Çelik panel radyatör sade ve standart bir görünüme sahiptir.</p>
      <h3>Su kalitesi</h3>
      <p>Alüminyum radyatör kullanılan tesisatlarda tesisat suyunun pH değeri üreticinin belirttiği aralıkta tutulmalı, gerekirse uygun inhibitör kullanılmalıdır. Bu, hem radyatörün hem de kazanın ömrü için önemlidir. Tesisatı yapan ekibin bu konuya dikkat etmesi gerekir.</p>
      <h3>Maliyet</h3>
      <p>Aynı ısıl güç için çelik panel radyatör genellikle daha ekonomiktir. Alüminyum radyatörde fark; hızlı ısınma, uzun ömür, hafiflik ve tasarım seçenekleriyle karşılanır.</p>

      <h2>Kaç Dilim Gerekir?</h2>
      <p>Radyatör seçimi her zaman oda bazında ısı kaybı hesabıyla başlar. Hesaplanan ısı kaybı, seçilen modelin dilim başına ısıl gücüne bölünerek dilim sayısı bulunur. Örneğin 1.500 W ısı kaybı olan bir oda için, dilim başına 151 W veren 600 mm yüksekliğinde bir model seçildiğinde yaklaşık 10 dilim gerekir.</p>
      <p>Kataloglardaki dilim güçleri belirli bir su sıcaklığı farkına göre verilir (çoğunlukla Δt 60, yani 90/70 °C su ve 20 °C oda). Yoğuşmalı kazan veya ısı pompası gibi daha düşük su sıcaklığında çalışan sistemlerde radyatörün verdiği ısı azalır; dilim sayısı bu düşük sıcaklığa göre hesaplanmalıdır.</p>

      <h2>Hangi Durumda Hangisi?</h2>
      <ul>
        <li><strong>Alüminyum radyatör:</strong> Hızlı ısınma istenen, termostatik vanayla oda oda kontrol yapılan, dekoratif görünümün önemli olduğu konut, villa, ofis ve oteller.</li>
        <li><strong>Çelik panel radyatör:</strong> Bütçenin öncelikli olduğu, standart görünümün yeterli olduğu projeler.</li>
      </ul>

      <h2>Ayen Alüminyum Radyatörler</h2>
      <p>İklim Ofisi olarak Ayen alüminyum radyatör ve havlupanların satışını ve montajını yapıyoruz. Ayen radyatörler %98 alüminyum alaşımdan üretilir, EN 442 ve TSE belgelidir; her radyatör 15 bar sızdırmazlık testinden geçer. 9 panel radyatör ve 9 havlupan serisi, 30 renk seçeneğiyle sunulur.</p>
      <p>Model, ölçü ve renk seçenekleri için <a href="/ayen">Ayen alüminyum radyatör</a> sayfamıza bakabilir, odalarınızın ısı ihtiyacını kabaca görmek için <a href="/hesaplama">kapasite hesaplama</a> aracımızı kullanabilirsiniz. Kesin dilim sayısı için <a href="/iletisim">keşif</a> isteyin.</p>
    `,
  },
  {
    slug: "endustriyel-mutfak-havalandirma-elektrostatik-filtre",
    baslik: "Endüstriyel Mutfak Havalandırmasında Elektrostatik Filtrasyon: AIRNEX",
    kategori: "MUTFAK HAVALANDIRMA",
    tarih: "26 Eylül 2026",
    okumaSuresi: "4 dk okuma",
    gorsel: "/airnex/airnex-mutfak.jpg",
    gorselAlt: "Endüstriyel mutfakta AIRNEX elektrostatik filtreli ünite",
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
    baslik: "VRF İklimlendirme Rehberi: TCL ve Mitsubishi Electric VRF Teknolojileri",
    kategori: "VRF MERKEZİ SİSTEM",
    tarih: "01 Eylül 2026",
    okumaSuresi: "5 dk okuma",
    gorsel: "/urunler/urun-vrf.jpg",
    gorselAlt: "TCL VRF dış ünitesi",
    ozet: "Otel, plaza ve konut projelerinde iklimlendirme maliyetini düşüren TCL TMV serisi ve Mitsubishi Electric City Multi VRF sistemlerinin mühendislik bakışıyla değerlendirmesi.",
    icerikHtml: `
      <h2>VRF / VRV İklimlendirme Nedir?</h2>
      <p>VRF (Variable Refrigerant Flow) sistemler, değişken debili soğutucu akışkan teknolojisiyle tek bir dış ünite grubuna onlarca iç ünite bağlayarak her odayı bağımsız iklimlendirmenizi sağlar.</p>

      <h2>TCL TMV Serisi VRF Sistemleri</h2>
      <p>TCL'in yeni nesil TMV serisi VRF sistemleri, Inverter kompresör ve akıllı kontrol altyapısıyla ofis, mağaza, otel ve konut projelerinde yüksek verim ile rekabetçi yatırım maliyetini bir arada sunar. Geniş iç ünite seçenekleri sayesinde farklı mahal tiplerine esnek çözüm üretir. Model ve teknik veriler için <a href="/tcl-vrf">TCL VRF sistemleri</a> sayfamıza bakabilirsiniz.</p>

      <h2>Mitsubishi Electric City Multi VRF Üstünlükleri</h2>
      <p>Mitsubishi Electric VRF sistemleri, Inverter kompresör yapısı ve yüksek COP/EER verimlilik değerleri ile öne çıkar. Düşük dış hava sıcaklıklarında dahi yüksek ısıtma performansı sunan Zubadan teknolojisi, otel ve plaza projelerinde güçlü bir konfor sağlar.</p>

      <h2>Projenizde Hangi Sistemi Seçmelisiniz?</h2>
      <p>Mühendis kadromuz; binanızın cephe yönü, cam alanları ve kullanım amacına göre m² bazlı ısı kazancı/kaybı hesabı yaparak TCL veya Mitsubishi Electric VRF sistemlerinden projenize ve bütçenize en uygun olanı projelendirir.</p>
    `,
  },
  {
    slug: "buderus-ile-merkezi-ve-bireysel-isitma",
    baslik: "Kaskad Kazan Nedir? Buderus Yoğuşmalı Kazanlarla Merkezi Isıtma Rehberi",
    kategori: "ISITMA & KASKAD",
    tarih: "28 Ağustos 2026",
    guncelleme: "30 Ekim 2026",
    okumaSuresi: "6 dk okuma",
    gorsel: "/buderus/gb272-slider.jpg",
    gorselAlt: "Duvara monte Buderus Logamax plus GB272 yoğuşmalı kazan",
    ozet: "Kaskad kazan nedir, tek büyük kazana göre avantajları nelerdir? Buderus Logamax plus GB272 yoğuşmalı kazanla 49 kW'tan 2.400 kW'a kaskad sistem kurulumu, kapasite seçimi ve kazan dairesinde dikkat edilecekler.",
    icerikHtml: `
      <h2>Kaskad Kazan Nedir?</h2>
      <p>Kaskad kazan sistemi, bir binanın ısıtma ihtiyacının tek bir büyük kazan yerine <strong>birden fazla kazanın birlikte çalışmasıyla</strong> karşılanmasıdır. Kazanlar ortak bir kumanda altında toplanır; ısı ihtiyacı azken yalnız bir veya iki kazan çalışır, hava soğudukça ve ihtiyaç arttıkça sırayla diğer kazanlar devreye girer.</p>
      <p>Apartman, site, otel, okul, hastane, ofis binası gibi merkezi ısıtma yapılan yapılarda kaskad sistemler giderek tek büyük kazanın yerini alıyor. Bunun nedeni basit: bir bina yılın çok küçük bir bölümünde tam kapasite ısıya ihtiyaç duyar; geri kalan zamanın büyük kısmını kısmi yükte geçirir.</p>

      <h2>Tek Büyük Kazan mı, Kaskad mı?</h2>
      <h3>1. Kısmi yükte verim</h3>
      <p>Tek büyük kazan, ilkbahar ve sonbahar gibi düşük ihtiyaç dönemlerinde kapasitesinin çok altında çalışmak zorunda kalır. Kaskad sistemde ise o an gereken kadar kazan çalışır; her kazan kendi verimli aralığında kalır. Buderus Logamax plus GB272'nin 1:6 modülasyon oranı da her kazanın kapasitesini anlık ihtiyaca göre ayrıca ayarlamasını sağlar.</p>
      <h3>2. Yedeklilik</h3>
      <p>Tek kazanlı bir sistemde kazan arızalanırsa bina ısıtmasız kalır. Kaskad sistemde bir kazan arıza veya bakım nedeniyle devre dışıyken diğer kazanlar çalışmaya devam ederek ısıtmayı sürdürebilir.</p>
      <h3>3. Yer ve taşıma kolaylığı</h3>
      <p>Duvar tipi kazanlar kompakttır; dar merdivenlerden ve kapılardan rahatça taşınır. GB272 ile dar veya alçak tavanlı kazan dairelerinde bile 2 m²'den az alanda 900 kW kurulu güç sağlanabilir. Kazanlar duvara asılabilir ya da yer montaj kitiyle zemine yan yana dizilebilir.</p>
      <h3>4. Aşamalı yatırım ve genişleme</h3>
      <p>Bina büyüdüğünde veya yeni bir blok eklendiğinde sisteme kazan eklemek mümkündür. Eski bir merkezi sistemin yenilenmesinde de mevcut kazan dairesine uyum sağlamak kolaylaşır.</p>

      <h2>Yoğuşmalı Kazan Neden Daha Verimli?</h2>
      <p>Doğal gaz yandığında oluşan baca gazının içinde su buharı vardır. Klasik kazanlarda bu buhar bacadan atılır ve içindeki ısı kaybolur. <strong>Yoğuşmalı kazan</strong> ise baca gazını soğutarak bu buharı yoğuşturur ve açığa çıkan gizli ısıyı da tesisat suyuna aktarır. Bu yüzden yoğuşmalı kazanların verimi, alt ısıl değere göre %100'ün üzerine çıkar.</p>
      <p>Yoğuşmanın gerçekleşmesi için kazana dönen suyun soğuk olması gerekir. Dönüş suyu sıcaklığı ne kadar düşükse kazan o kadar verimli çalışır. Buderus GB272'nin norm kullanma verimi 40/30 °C işletmede %109,7–110,6, 75/60 °C işletmede %106–107,3 aralığındadır (alt ısıl değere göre). Bu nedenle yoğuşmalı kazanlı tesisatlarda radyatörlerin ve yerden ısıtmanın düşük su sıcaklığına göre boyutlandırılması verimi doğrudan artırır.</p>

      <h2>Buderus Logamax plus GB272 ile Kaskad</h2>
      <p>Buderus Logamax plus GB272, konutlar, kamu ve ticari binalar için geliştirilmiş duvar tipi gaz yoğuşmalı kazandır:</p>
      <ul>
        <li><strong>Kapasiteler:</strong> 49, 69, 100, 125 ve 150 kW</li>
        <li><strong>Kaskad:</strong> 16 kazana kadar, toplamda 2.400 kW</li>
        <li><strong>Gidiş suyu:</strong> tam kapasitede 85 °C'ye kadar</li>
        <li><strong>Emisyon:</strong> NOx sınıf 6</li>
        <li><strong>Eşanjör:</strong> yüzey kaplamalı ALU plus alüminyum ısı eşanjörü</li>
        <li><strong>Yakıt:</strong> doğal gaz ve propan</li>
        <li><strong>Kontrol:</strong> Logamatic BC30 kumanda; Logamatic 5000 ile Modbus TCP/IP, 0–10 V BMS sinyali ve uzaktan erişim</li>
      </ul>
      <p>125 ve 150 kW modellerde kaskad baca gazı klapesi kazanla birlikte gelir. Kazanlar yan yana bitişik dizilebildiği için kaskad grubu kazan dairesinde az yer kaplar.</p>

      <h2>Kapasite Nasıl Belirlenir?</h2>
      <p>Kazan seçiminin ilk adımı binanın <strong>ısı kaybı hesabıdır</strong>. Hesap; dış duvar, çatı, döşeme ve pencere alanlarını, yalıtım durumunu ve binanın bulunduğu ilin dış tasarım sıcaklığını dikkate alır. Sıcak su da kazandan hazırlanacaksa (boyler) bu ihtiyaç ayrıca eklenir.</p>
      <p>Toplam kapasite belirlendikten sonra kazan sayısına karar verilir. Örneğin 300 kW ihtiyacı olan bir bina 2 × 150 kW veya 3 × 100 kW kaskadla karşılanabilir. Daha çok sayıda küçük kazan, düşük yükte daha hassas çalışma ve daha iyi yedeklilik sağlar; daha az sayıda büyük kazan ise ilk yatırımı ve bağlantı sayısını azaltır. Doğru dengeyi binanın kullanım profiline göre kuruyoruz.</p>

      <h2>Kazan Dairesinde Dikkat Edilecekler</h2>
      <ul>
        <li><strong>Hidrolik ayırma:</strong> Kaskad sistemlerde kazan devresi ile bina devresi genellikle denge kabı (hidrolik ayırıcı) veya plakalı eşanjörle ayrılır; böylece her kazan doğru debiyle çalışır.</li>
        <li><strong>Baca:</strong> Kaskad baca sistemi kazan sayısına ve kapasitesine göre boyutlandırılmalıdır.</li>
        <li><strong>Yoğuşma suyu:</strong> Yoğuşmalı kazanlar çalışırken yoğuşma suyu oluşur (GB272'de modele göre saatte 6–16 litreye kadar); uygun bir gidere bağlanmalıdır.</li>
        <li><strong>Tesisat suyu:</strong> Eski tesisatlarda sistem temizlenmeli ve su kalitesi üreticinin belirttiği değerlerde tutulmalıdır.</li>
        <li><strong>Otomasyon:</strong> Dış hava sıcaklığına göre çalışma (dış hava kompanzasyonu) ve bina otomasyonu bağlantısı işletme maliyetini düşürür.</li>
      </ul>

      <h2>İklim Ofisi ile Buderus Kazan Projesi</h2>
      <p>Isı kaybı hesabından kaskad tasarımına, kazan dairesi projesinden montaj ve devreye almaya kadar Buderus kazan projelerini tek elden yürütüyoruz. Model, teknik tablolar ve katalog için <a href="/buderus">Buderus kazan</a> sayfamıza bakabilirsiniz. Radyatör seçiminde düşük su sıcaklığının etkisini <a href="/blog/aluminyum-radyator-mu-celik-panel-radyator-mu">alüminyum ve çelik panel radyatör karşılaştırmamızda</a> anlattık. Binanız için <a href="/iletisim">keşif ve teklif</a> isteyebilirsiniz.</p>
    `,
  },
  {
    slug: "endustriyel-havalandirma-ve-isi-geri-kazanim",
    baslik: "Endüstriyel Tesislerde Isı Geri Kazanımlı Havalandırma (İGK) Tesisatı",
    kategori: "HAVALANDIRMA",
    tarih: "20 Ağustos 2026",
    okumaSuresi: "6 dk okuma",
    gorsel: "/urunler/urun-havalandirma.jpg",
    gorselAlt: "Isı geri kazanımlı havalandırma cihazının kesit görünümü",
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
    gorsel: "/slider/slider-mitsubishi-duvar.jpg",
    gorselAlt: "Oturma odasında duvar tipi klima",
    ozet: "Sadece metrekareye göre klima seçerken yapılan hatalar, cam yüzey faktörü ve TCL / Mitsubishi Electric Inverter teknolojisinin elektrik faturasına etkisi.",
    icerikHtml: `
      <h2>Metrekareye Göre Klima Seçimi Neden Hatalıdır?</h2>
      <p>Aynı metrekareye sahip çatı katı bir oda ile zemin kat ara oda arasında %50 ısı yükü farkı vardır. Cam alanı, binanın yalıtımı ve cephe yönü hesaplanmadan alınan klimalar ya yetersiz kalır ya da gereksiz fazla elektrik tüketir.</p>

      <h2>Inverter Kompresör Nasıl Tasarruf Sağlar?</h2>
      <p>Eski tip klimalar sürekli dur-kalk yaparak yüksek demeraj akımı çeker. TCL ve Mitsubishi Electric Inverter klimalar ise ortam sıcaklığına göre devrini ayarlayarak kesintisiz ve A+++ verimle çalışır.</p>
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
