-- =====================================================================
-- İklim Ofisi · 27.09.2026 · Teklif notlarında grup başlığı
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * "TeklifSablon" tablosuna 1 BOŞ (NULL) sütun: grupBaslik
--     (Bu sütun eski bir güncellemeyle zaten eklenmiş olabilir; o durumda
--      hiçbir şey yapmaz — "IF NOT EXISTS")
-- Hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
--
-- Nasıl çalıştırılır:
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

ALTER TABLE "TeklifSablon" ADD COLUMN IF NOT EXISTS "grupBaslik" TEXT;

-- Kontrol (isteğe bağlı): 1 satır döndürmelidir
-- SELECT column_name FROM information_schema.columns
--  WHERE table_name = 'TeklifSablon' AND column_name = 'grupBaslik';
