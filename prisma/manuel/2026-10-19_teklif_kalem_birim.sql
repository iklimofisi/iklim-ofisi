-- =====================================================================
-- İklim Ofisi · 19.10.2026 · Teklif kalemlerine ölçü birimi
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * "TeklifKalem" tablosuna "birim" sütunu (Adet, m, m², m³, kg, Takım, Götürü…)
--   * Mevcut bütün teklif kalemleri otomatik olarak "Adet" olur (bugünkü hâliyle aynı).
-- Mevcut hiçbir tablo, sütun veya kayıt SİLİNMEZ; miktar ve fiyatlar DEĞİŞMEZ.
-- İki kez çalıştırılırsa zarar vermez ("IF NOT EXISTS").
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

ALTER TABLE "TeklifKalem" ADD COLUMN IF NOT EXISTS "birim" TEXT NOT NULL DEFAULT 'Adet';

-- Kontrol (isteğe bağlı): 1 satır döndürmelidir
-- SELECT column_name, column_default FROM information_schema.columns
--  WHERE table_name = 'TeklifKalem' AND column_name = 'birim';
