-- =====================================================================
-- İklim Ofisi · 25.10.2026 · Fiyat listeleri: 3. fiyat sütunu (ör. Kredi Kartı 9 Taksit)
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * "FiyatListesi" tablosuna boş bırakılabilir "fiyat3Baslik" sütunu
--   * "FiyatListesiKalem" tablosuna boş bırakılabilir "fiyat3" sütunu
--   Mevcut listelerde ikisi de boş kalır; hiçbir liste değişmez.
-- Mevcut hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
-- İki kez çalıştırılırsa zarar vermez ("IF NOT EXISTS").
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

ALTER TABLE "FiyatListesi" ADD COLUMN IF NOT EXISTS "fiyat3Baslik" TEXT;
ALTER TABLE "FiyatListesiKalem" ADD COLUMN IF NOT EXISTS "fiyat3" DOUBLE PRECISION;

-- Kontrol (isteğe bağlı): 2 satır döndürmelidir
-- SELECT table_name, column_name FROM information_schema.columns
--  WHERE (table_name = 'FiyatListesi' AND column_name = 'fiyat3Baslik')
--     OR (table_name = 'FiyatListesiKalem' AND column_name = 'fiyat3');
