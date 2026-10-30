-- =====================================================================
-- İklim Ofisi · 30.10.2026 · Tedarikçi teklifi kalemlerinde ürün grubu (bölüm)
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * "SatinalmaTeklifKalemi" tablosuna 1 BOŞ (NULL) sütun: bolum
--     (TCL teklif PDF'inden okunan kalemlerin ürün grubu, ör. "Heat-Pump Dış
--      Üniteler". Müşteri teklifine bölüm olarak geçer. Mevcut kayıtlarda boş
--      kalır; onlar eskisi gibi çalışmaya devam eder.)
-- Hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

ALTER TABLE "SatinalmaTeklifKalemi" ADD COLUMN IF NOT EXISTS "bolum" TEXT;

-- Kontrol (isteğe bağlı): 1 satır döndürmelidir
-- SELECT column_name FROM information_schema.columns
--  WHERE table_name = 'SatinalmaTeklifKalemi' AND column_name = 'bolum';
