-- =====================================================================
-- İklim Ofisi · 09.10.2026 · Teklife özel not metinleri
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * "Teklif" tablosuna 1 yeni, BOŞ başlayan sütun: "ozelNotlar"
--     (teklif ekranında düzenlenen not metinleri; hazır notlar değişmez)
-- Mevcut hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
-- İki kez çalıştırılırsa zarar vermez ("IF NOT EXISTS").
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

ALTER TABLE "Teklif" ADD COLUMN IF NOT EXISTS "ozelNotlar" TEXT;
