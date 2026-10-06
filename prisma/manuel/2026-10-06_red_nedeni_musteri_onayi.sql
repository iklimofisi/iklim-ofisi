-- =====================================================================
-- İklim Ofisi · 06.10.2026 · Red nedeni + müşterinin linkten onayı
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * "Teklif" tablosuna 10 yeni, BOŞ başlayan sütun:
--       redNedeni, redRakip, redAciklama, redTarihi
--       musteriOnayAdi, musteriOnayNotu, musteriOnayTarihi,
--       musteriOnayRevizyon, musteriOnayTutar, musteriOnayIp
-- Mevcut hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
-- İki kez çalıştırılırsa zarar vermez ("IF NOT EXISTS").
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

ALTER TABLE "Teklif" ADD COLUMN IF NOT EXISTS "redNedeni" TEXT;
ALTER TABLE "Teklif" ADD COLUMN IF NOT EXISTS "redRakip" TEXT;
ALTER TABLE "Teklif" ADD COLUMN IF NOT EXISTS "redAciklama" TEXT;
ALTER TABLE "Teklif" ADD COLUMN IF NOT EXISTS "redTarihi" TIMESTAMP(3);
ALTER TABLE "Teklif" ADD COLUMN IF NOT EXISTS "musteriOnayAdi" TEXT;
ALTER TABLE "Teklif" ADD COLUMN IF NOT EXISTS "musteriOnayNotu" TEXT;
ALTER TABLE "Teklif" ADD COLUMN IF NOT EXISTS "musteriOnayTarihi" TIMESTAMP(3);
ALTER TABLE "Teklif" ADD COLUMN IF NOT EXISTS "musteriOnayRevizyon" INTEGER;
ALTER TABLE "Teklif" ADD COLUMN IF NOT EXISTS "musteriOnayTutar" TEXT;
ALTER TABLE "Teklif" ADD COLUMN IF NOT EXISTS "musteriOnayIp" TEXT;

-- Kontrol (isteğe bağlı): 10 satır döndürmelidir
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'Teklif' AND (column_name LIKE 'red%' OR column_name LIKE 'musteriOnay%');
