-- =============================================================================
-- 2026-11-24 (b) · FİYAT LİSTESİ LİNKİNDE ÜRÜN SEÇİMİ
-- Linkte gösterilmeyecek ürünler. Yalnız EKLER; hiçbir kayıt silinmez, değiştirilmez.
-- Tekrar çalıştırılabilir. Neon SQL Editor'da, git push'tan ÖNCE çalıştırın.
-- =============================================================================

ALTER TABLE "FiyatListesiPaylasim" ADD COLUMN IF NOT EXISTS "haric" TEXT;
