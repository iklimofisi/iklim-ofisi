-- =====================================================================
-- İklim Ofisi · 25.10.2026 · Fiyat listeleri: alış ve satış iskontosu
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * "FiyatListesi" tablosuna boş bırakılabilir 2 sütun:
--       alisIskontoYuzde  (liste fiyatından alış iskontosu; yalnız panelde görünür)
--       satisIskontoYuzde (doluysa satış fiyatı = liste fiyatı − bu iskonto)
--   Mevcut listelerde ikisi de boş kalır; hiçbir liste değişmez.
-- Mevcut hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
-- İki kez çalıştırılırsa zarar vermez ("IF NOT EXISTS").
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

ALTER TABLE "FiyatListesi" ADD COLUMN IF NOT EXISTS "alisIskontoYuzde" DOUBLE PRECISION;
ALTER TABLE "FiyatListesi" ADD COLUMN IF NOT EXISTS "satisIskontoYuzde" DOUBLE PRECISION;

-- Kontrol (isteğe bağlı): 2 satır döndürmelidir
-- SELECT column_name FROM information_schema.columns
--  WHERE table_name = 'FiyatListesi' AND column_name IN ('alisIskontoYuzde','satisIskontoYuzde');
