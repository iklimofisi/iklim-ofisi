-- =====================================================================
-- İklim Ofisi · 05.10.2026 · Hatırlatma e-postası: kaydı giren kullanıcı
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * "Ziyaret" tablosuna 1 yeni sütun: "olusturanKullaniciId"
--     (görüşme notunu panelde kimin girdiği; hatırlatma e-postası ona gider)
-- Mevcut hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
-- İki kez çalıştırılırsa zarar vermez ("IF NOT EXISTS").
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

ALTER TABLE "Ziyaret" ADD COLUMN IF NOT EXISTS "olusturanKullaniciId" TEXT;
