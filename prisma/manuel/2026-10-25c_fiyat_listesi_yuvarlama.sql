-- =====================================================================
-- İklim Ofisi · 25.10.2026 · Fiyat listeleri: iskontolu fiyat yuvarlaması
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * "FiyatListesi" tablosuna boş bırakılabilir 1 sütun:
--       yuvarlamaAdim (PDF'te liste iskontosu uygulanan fiyatların yuvarlanacağı
--                      adım: 1, 5, 10, 50 veya 100; boş = yuvarlama yok)
--   Mevcut listelerde boş kalır; hiçbir liste ve fiyat değişmez.
-- Mevcut hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
-- İki kez çalıştırılırsa zarar vermez ("IF NOT EXISTS").
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

ALTER TABLE "FiyatListesi" ADD COLUMN IF NOT EXISTS "yuvarlamaAdim" INTEGER;

-- Kontrol (isteğe bağlı): 1 satır döndürmelidir
-- SELECT column_name FROM information_schema.columns
--  WHERE table_name = 'FiyatListesi' AND column_name = 'yuvarlamaAdim';
