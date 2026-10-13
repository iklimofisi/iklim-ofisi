-- =====================================================================
-- İklim Ofisi · 13.10.2026 · Müşterisiz teklif
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * "Teklif" tablosuna boş bırakılabilir "muhatap" sütunu (müşterisiz
--     teklifte PDF'te müşteri adı yerine yazılan serbest metin)
--   * "Musteri" tablosuna sabit kimlikli sistem kaydı: "Müşterisiz teklif"
--     (müşteri listelerinde ve cari hesapta görünmez)
-- Mevcut hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
-- İki kez çalıştırılırsa zarar vermez ("IF NOT EXISTS" / "ON CONFLICT DO NOTHING").
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

ALTER TABLE "Teklif" ADD COLUMN IF NOT EXISTS "muhatap" TEXT;

INSERT INTO "Musteri" ("id", "ad", "createdAt")
VALUES ('musterisiz', 'Müşterisiz teklif', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Kontrol (isteğe bağlı): 1 satır döndürmelidir
-- SELECT "id", "ad" FROM "Musteri" WHERE "id" = 'musterisiz';
