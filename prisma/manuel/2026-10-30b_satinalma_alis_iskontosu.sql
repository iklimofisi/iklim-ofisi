-- =====================================================================
-- İklim Ofisi · 30.10.2026 · Tedarikçi teklifinde alış iskontosu
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * "SatinalmaTeklifi" tablosuna 1 BOŞ (NULL) sütun: alisIskontoYuzde
--     (TCL gibi liste fiyatı veren tedarikçilerde bize özel iskonto oranı.
--      Net alış = liste fiyatı × (1 − iskonto). Mevcut kayıtlarda boş kalır;
--      onlar eskisi gibi çalışmaya devam eder.)
-- Hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

ALTER TABLE "SatinalmaTeklifi" ADD COLUMN IF NOT EXISTS "alisIskontoYuzde" DOUBLE PRECISION;

-- Kontrol (isteğe bağlı): 1 satır döndürmelidir
-- SELECT column_name FROM information_schema.columns
--  WHERE table_name = 'SatinalmaTeklifi' AND column_name = 'alisIskontoYuzde';
