-- =====================================================================
-- İklim Ofisi · 16.10.2026 · Fiyat listeleri: iki fiyat sütunu ve otomatik liste
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * "FiyatListesi" tablosuna boş bırakılabilir 4 sütun:
--       fiyatBaslik, fiyat2Baslik (ör. "Nakit" / "Kart"),
--       kaynak (otomatik güncellenen liste: "KAYA"), kaynakDurum (güncelleme bilgisi)
--   * "FiyatListesiKalem" tablosuna boş bırakılabilir "fiyat2" sütunu (ikinci fiyat)
-- Mevcut hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
-- İki kez çalıştırılırsa zarar vermez ("IF NOT EXISTS").
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

ALTER TABLE "FiyatListesi" ADD COLUMN IF NOT EXISTS "fiyatBaslik" TEXT;
ALTER TABLE "FiyatListesi" ADD COLUMN IF NOT EXISTS "fiyat2Baslik" TEXT;
ALTER TABLE "FiyatListesi" ADD COLUMN IF NOT EXISTS "kaynak" TEXT;
ALTER TABLE "FiyatListesi" ADD COLUMN IF NOT EXISTS "kaynakDurum" TEXT;
ALTER TABLE "FiyatListesiKalem" ADD COLUMN IF NOT EXISTS "fiyat2" DOUBLE PRECISION;

-- Kontrol (isteğe bağlı): 5 satır döndürmelidir
-- SELECT table_name, column_name FROM information_schema.columns
--  WHERE (table_name = 'FiyatListesi' AND column_name IN ('fiyatBaslik','fiyat2Baslik','kaynak','kaynakDurum'))
--     OR (table_name = 'FiyatListesiKalem' AND column_name = 'fiyat2');
