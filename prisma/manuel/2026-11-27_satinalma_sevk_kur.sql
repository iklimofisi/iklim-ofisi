-- 2026-11-27: Satınalma siparişine sevk (teslim) adresi ve kur kaynağı
-- Yalnız ekleyici; tekrar çalıştırılabilir. git push ÖNCESİ Neon SQL Editor içinde çalıştırın.

ALTER TABLE "SatinalmaSiparisi" ADD COLUMN IF NOT EXISTS "sevkAdresi" TEXT;
ALTER TABLE "SatinalmaSiparisi" ADD COLUMN IF NOT EXISTS "kurKaynagi" TEXT;
ALTER TABLE "SatinalmaSiparisi" ADD COLUMN IF NOT EXISTS "kurTarihi" TEXT;
