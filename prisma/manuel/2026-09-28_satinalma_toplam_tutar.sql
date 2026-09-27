-- =====================================================================
-- İklim Ofisi · 28.09.2026 · Tedarikçi teklifinde elle girilen dip toplam
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * "SatinalmaTeklifi" tablosuna 1 BOŞ (NULL) sütun: toplamTutar
--     (Tedarikçi birim fiyat vermeyip sadece toplam verdiğinde kullanılır.
--      Mevcut kayıtlarda boş kalır; onların toplamı eskisi gibi
--      kalemlerden hesaplanmaya devam eder.)
-- Hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

ALTER TABLE "SatinalmaTeklifi" ADD COLUMN IF NOT EXISTS "toplamTutar" DOUBLE PRECISION;

-- Kontrol (isteğe bağlı): 1 satır döndürmelidir
-- SELECT column_name FROM information_schema.columns
--  WHERE table_name = 'SatinalmaTeklifi' AND column_name = 'toplamTutar';
