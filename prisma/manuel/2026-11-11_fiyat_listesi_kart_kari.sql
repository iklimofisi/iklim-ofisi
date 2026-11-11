-- =====================================================================
-- İklim Ofisi · 11.11.2026 · Fiyat listeleri: kredi kartı kârı
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * "FiyatListesi" tablosuna boş bırakılabilir 1 sütun:
--       kartKarYuzde (doluysa 3. fiyat sütunu, ör. kredi kartı fiyatı =
--                     alış fiyatı (liste − alış iskontosu) + bu kâr; boş = eskisi gibi)
--   Mevcut listelerde boş kalır; hiçbir liste ve fiyat değişmez.
-- Mevcut hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
-- İki kez çalıştırılırsa zarar vermez ("IF NOT EXISTS").
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

ALTER TABLE "FiyatListesi" ADD COLUMN IF NOT EXISTS "kartKarYuzde" DOUBLE PRECISION;

-- Kontrol (isteğe bağlı): 1 satır döndürmelidir
-- SELECT column_name FROM information_schema.columns
--  WHERE table_name = 'FiyatListesi' AND column_name = 'kartKarYuzde';
