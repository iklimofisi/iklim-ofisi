-- =====================================================================
-- İklim Ofisi · 15.11.2026 · Teklif: bölüm bazında birim fiyat gizleme
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * "Teklif" tablosuna boş bırakılabilir 1 sütun:
--       fiyatGizliBolumler (PDF'te birim fiyatı gizlenen bölüm adları, JSON dizi;
--                           boş = hiçbir bölümde gizleme yok)
--   Mevcut tekliflerde boş kalır; hiçbir teklif, kalem veya fiyat değişmez.
-- Mevcut hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
-- İki kez çalıştırılırsa zarar vermez ("IF NOT EXISTS").
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

ALTER TABLE "Teklif" ADD COLUMN IF NOT EXISTS "fiyatGizliBolumler" TEXT;

-- Kontrol (isteğe bağlı): 1 satır döndürmelidir
-- SELECT column_name FROM information_schema.columns
--  WHERE table_name = 'Teklif' AND column_name = 'fiyatGizliBolumler';
