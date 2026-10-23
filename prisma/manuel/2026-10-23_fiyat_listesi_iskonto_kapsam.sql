-- =====================================================================
-- İklim Ofisi · 23.10.2026 · Fiyat listeleri: iskontonun uygulanacağı fiyat
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * "FiyatListesi" tablosuna "iskontoKapsam" sütunu
--       HEPSI  = iskonto tüm fiyatlara (bugünkü davranış, mevcut listeler böyle kalır)
--       FIYAT1 = yalnız 1. fiyat sütununa (ör. Liste Fiyatı)
--       FIYAT2 = yalnız 2. fiyat sütununa (ör. Satış Fiyatı)
-- Mevcut hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
-- İki kez çalıştırılırsa zarar vermez ("IF NOT EXISTS").
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

ALTER TABLE "FiyatListesi" ADD COLUMN IF NOT EXISTS "iskontoKapsam" TEXT NOT NULL DEFAULT 'HEPSI';

-- Kontrol (isteğe bağlı): 1 satır döndürmelidir
-- SELECT column_name, column_default FROM information_schema.columns
--  WHERE table_name = 'FiyatListesi' AND column_name = 'iskontoKapsam';
