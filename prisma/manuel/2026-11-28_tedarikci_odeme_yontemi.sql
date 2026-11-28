-- 2026-11-28 · Tedarikçi ödemesinde ödeme şekli (havale/EFT, nakit, kredi kartı, çek, senet)
-- Yalnız EKLER ve boş alanları doldurur; hiçbir kayıt silinmez. Push ETMEDEN ÖNCE Neon SQL Editor içinde çalıştırın.
-- Birden çok kez çalıştırmak zararsızdır.

-- 1) Tedarikçi hareketine ödeme şekli sütunu
ALTER TABLE "TedarikciHareket" ADD COLUMN IF NOT EXISTS "odemeYontemi" TEXT;

-- 2) Eski tedarikçi ödemeleri: çek bilgisi (vade / çek no) olanlar çek, açıklamasında havale/EFT geçenler havale
UPDATE "TedarikciHareket" SET "odemeYontemi" = 'CEK'
WHERE "tur" = 'ODEME' AND "odemeYontemi" IS NULL AND ("vadeTarihi" IS NOT NULL OR "cekNo" IS NOT NULL);
UPDATE "TedarikciHareket" SET "odemeYontemi" = 'HAVALE'
WHERE "tur" = 'ODEME' AND "odemeYontemi" IS NULL AND ("aciklama" ILIKE '%havale%' OR "aciklama" ILIKE '%eft%');

-- 3) Müşteri tahsilatlarında eski yazımları kodlara çevir (EFT/Havale -> HAVALE vb.)
UPDATE "CariHareket" SET "odemeYontemi" = CASE "odemeYontemi"
  WHEN 'EFT/Havale' THEN 'HAVALE' WHEN 'Havale/EFT' THEN 'HAVALE' WHEN 'Çek' THEN 'CEK'
  WHEN 'Senet' THEN 'SENET' WHEN 'Nakit' THEN 'NAKIT' WHEN 'Kredi Kartı' THEN 'KART' WHEN 'Kart' THEN 'KART'
  ELSE "odemeYontemi" END
WHERE "odemeYontemi" IN ('EFT/Havale', 'Havale/EFT', 'Çek', 'Senet', 'Nakit', 'Kredi Kartı', 'Kart');
UPDATE "CariHareket" SET "odemeYontemi" = 'CEK'
WHERE "tur" = 'ALACAK' AND "odemeYontemi" IS NULL AND ("vadeTarihi" IS NOT NULL OR "cekNo" IS NOT NULL);
