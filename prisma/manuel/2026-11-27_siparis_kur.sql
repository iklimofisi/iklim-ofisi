-- 2026-11-27: Sipariş kur dönüşümü (TCMB / elle kur, fatura kur farkı) ve dövizli alış faturası
-- Yalnız ekleyici; tekrar çalıştırılabilir. git push ÖNCESİ Neon SQL Editor içinde çalıştırın.

ALTER TABLE "Siparis" ADD COLUMN IF NOT EXISTS "kurKaynagi" TEXT;
ALTER TABLE "Siparis" ADD COLUMN IF NOT EXISTS "kurTarihi" TEXT;
ALTER TABLE "Siparis" ADD COLUMN IF NOT EXISTS "faturaKur" DOUBLE PRECISION;

ALTER TABLE "CariHareket" ADD COLUMN IF NOT EXISTS "siparisId" TEXT;
CREATE INDEX IF NOT EXISTS "CariHareket_siparisId_idx" ON "CariHareket"("siparisId");

ALTER TABLE "TedarikciHareket" ADD COLUMN IF NOT EXISTS "paraBirimi" TEXT;
ALTER TABLE "TedarikciHareket" ADD COLUMN IF NOT EXISTS "dovizTutar" DOUBLE PRECISION;
ALTER TABLE "TedarikciHareket" ADD COLUMN IF NOT EXISTS "kur" DOUBLE PRECISION;
