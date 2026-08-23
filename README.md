# İklim Ofisi

Kurumsal web sitesi + proje takibi / teklif / keşif / sipariş / satınalma / cari hesap paneli.
Çoklu kullanıcı girişi ve rol bazlı yetkilendirme ile korunuyor.

## Kurulum

### 1) Bilgisayarında kur
```
npm install
```

### 2) `.env` dosyası — yeni değişken yok

### 3) Veritabanını güncelle
```
npx prisma migrate dev --name proje-ziyaret-toplu-fiyat
```

### 4) Demo verileri tekrar yükle (veritabanını sıfırladıysan)
```
npm run prisma:seed
```

### 5) Çalıştır
```
npm run dev
```

## Bu güncellemede eklenenler

### Proje Takibi (Panel → Projeler)
İhale/proje bazlı fırsatları takip ediyorsun: proje nereden geldi,
konumu, ilgili müşteri, ihale durumu (Takipte/Teklif Verildi/Kazanıldı/
Kaybedildi/İptal), ihaleyi kimin aldığı, tahmini değer. Teklif
oluştururken bir projeye bağlayabiliyorsun — proje detayında o projeye
bağlı tüm teklifler görünüyor.

### Ziyaret Modülü (Panel → Ziyaretler)
Müşteri veya proje bazlı, tarihli ziyaret notları. İstersen belirli bir
tarihe **hatırlatma** kuruyorsun (örn. "3 gün sonra teklif sonucu için
ara") — bu hatırlatmalar hem Ziyaretler sayfasında hem Panel Özet'te
hem de sol menüde kırmızı rozetle beliriyor, tarihi geldiğinde/geçtiğinde
görünür kalıyor ta ki "Tamamlandı" demene kadar. Bildirim/e-posta
gitmiyor (böyle bir altyapı yok) ama panele her girişinde bunu göreceksin.

### Toplu fiyat ayarı (teklif hazırlarken)
Teklif kalemleri listesinin üstünde "Tüm Birim Fiyatlara Uygula (%)"
kutusu var. Pozitif sayı (örn. 15) tüm dolu birim fiyatları o oranda
artırır (örn. ihale için liste fiyatı üzerine marj), negatif sayı
(örn. -10) iskonto olarak düşürür — tek tıkla tüm kalemlere uygulanır,
kaydetmeden önce istediğin satırı elle de düzeltebilirsin.

### Birim fiyat gizle/göster
Teklif oluştururken/düzenlerken bir seçenek var: "PDF çıktısında birim
fiyat ve iskonto sütunlarını gizle". İşaretlersen, o teklifin PDF'inde
müşteri sadece kalem toplamını görür, birim fiyatı ve iskonto oranını
görmez — her müşteriye birim fiyat gösterilmeyeceği durumlar için.

### Küçük bir düzeltme (kendi bulduğum)
Teklif düzenlerken, eğer o teklife bağlı bir sipariş içinde teslim
edilmiş kalemler varsa, düzenleme sırasında veritabanı hatası
verebilirdi (teslim kayıtları temizlenmiyordu). Bunu da düzelttim.

## Roller
Yönetici: her şeyi görür, kullanıcı ekler/siler/şifre sıfırlar, sipariş
onaylar/reddeder. Satış: teklif/müşteri/proje/ziyaret/sipariş talebi/
cari/keşif/satınalma üzerinde çalışır, Kullanıcılar sayfasını ve onay
yetkisini göremez.

## Hâlâ eksik olan, bilerek bırakılanlar
- E-fatura/e-arşiv entegrasyonu
- Stok/envanter düşümü
- E-posta ile şifre sıfırlama
- Hatırlatmalar için e-posta/SMS bildirimi (şu an sadece panelde görünüyor)
- Gerçek proje fotoğrafları, referanslar, gerçek telefon numarası

PDF çıktısında tarih/URL satırı görünüyorsa: tarayıcının kendi yazdırma
ayarından geliyor — Yazdır penceresinde "Daha fazla ayar" → "Üstbilgi ve
altbilgi" kutusunun işaretini kaldır.

## Önemli: alan adı
`app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts` içinde `iklimofisi.com`
yer tutucu — gerçek alan adını aldığında bul-değiştir yap.
