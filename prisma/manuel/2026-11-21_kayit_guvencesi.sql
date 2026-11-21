-- =====================================================================
-- İklim Ofisi · 21.11.2026 · Kayıt güvencesi (1. aşama)
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * "CariHareket" ve "TedarikciHareket": iptalTarihi, iptalEdenAdi, iptalNedeni
--       (finansal hareket artık silinmez; iptal edilen hareket bakiyeden düşer)
--   * "Teklif": arsivTarihi, arsivleyenAdi (teklif silinmez, arşive kaldırılır)
--   * "Siparis": tutarNet, paraBirimi, teklifRevizyonNo, kalemlerJson
--       (siparişin dondurulmuş tutarı) ve iptalTarihi, iptalEdenAdi, iptalNedeni
--   * Mevcut siparişlerin dondurulmuş tutarı, bağlı teklifin BUGÜNKÜ
--     kalemlerinden bir kez doldurulur (yalnızca boş olanlar; sonra hiç değişmez).
-- Mevcut hiçbir tablo, sütun veya kayıt SİLİNMEZ; mevcut hiçbir değer DEĞİŞMEZ
-- (yalnızca yeni eklenen boş sütunlar doldurulur).
-- İki kez çalıştırılırsa zarar vermez ("IF NOT EXISTS", "IS NULL" koşulu).
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

ALTER TABLE "CariHareket" ADD COLUMN IF NOT EXISTS "iptalTarihi" TIMESTAMP(3);
ALTER TABLE "CariHareket" ADD COLUMN IF NOT EXISTS "iptalEdenAdi" TEXT;
ALTER TABLE "CariHareket" ADD COLUMN IF NOT EXISTS "iptalNedeni" TEXT;

ALTER TABLE "TedarikciHareket" ADD COLUMN IF NOT EXISTS "iptalTarihi" TIMESTAMP(3);
ALTER TABLE "TedarikciHareket" ADD COLUMN IF NOT EXISTS "iptalEdenAdi" TEXT;
ALTER TABLE "TedarikciHareket" ADD COLUMN IF NOT EXISTS "iptalNedeni" TEXT;

ALTER TABLE "Teklif" ADD COLUMN IF NOT EXISTS "arsivTarihi" TIMESTAMP(3);
ALTER TABLE "Teklif" ADD COLUMN IF NOT EXISTS "arsivleyenAdi" TEXT;

ALTER TABLE "Siparis" ADD COLUMN IF NOT EXISTS "tutarNet" DOUBLE PRECISION;
ALTER TABLE "Siparis" ADD COLUMN IF NOT EXISTS "paraBirimi" TEXT;
ALTER TABLE "Siparis" ADD COLUMN IF NOT EXISTS "teklifRevizyonNo" INTEGER;
ALTER TABLE "Siparis" ADD COLUMN IF NOT EXISTS "kalemlerJson" TEXT;
ALTER TABLE "Siparis" ADD COLUMN IF NOT EXISTS "iptalTarihi" TIMESTAMP(3);
ALTER TABLE "Siparis" ADD COLUMN IF NOT EXISTS "iptalEdenAdi" TEXT;
ALTER TABLE "Siparis" ADD COLUMN IF NOT EXISTS "iptalNedeni" TEXT;

-- Mevcut siparişlerin dondurulmuş tutarı (yalnız henüz boş olanlar)
UPDATE "Siparis" s
SET "paraBirimi" = t."paraBirimi",
    "teklifRevizyonNo" = t."revizyonNo",
    "tutarNet" = ROUND(CAST((
      SELECT COALESCE(SUM(k."adet" * k."birimFiyat" * (1 - k."iskontoYuzde" / 100)), 0)
      FROM "TeklifKalem" k WHERE k."teklifId" = t."id"
    ) AS NUMERIC), 2),
    "kalemlerJson" = (
      SELECT COALESCE(json_agg(json_build_object(
        'bolum', k."bolum", 'aciklama', k."aciklama", 'adet', k."adet", 'birim', k."birim",
        'birimFiyat', k."birimFiyat", 'iskontoYuzde', k."iskontoYuzde"
      ) ORDER BY k."sira", k."id"), '[]'::json)::text
      FROM "TeklifKalem" k WHERE k."teklifId" = t."id"
    )
FROM "Teklif" t
WHERE s."teklifId" = t."id" AND s."tutarNet" IS NULL;

-- Kontrol (isteğe bağlı):
-- SELECT COUNT(*) AS toplam, COUNT("tutarNet") AS dondurulan FROM "Siparis";
-- İki sayı eşit olmalıdır.
