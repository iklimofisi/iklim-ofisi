-- =============================================================================
-- 2026-11-22 · SATINALMA SİPARİŞİNİ TEDARİKÇİYE GÖNDERME (e-posta / WhatsApp)
-- Yalnız EKLER. Hiçbir kayıt silinmez, değiştirilmez. Tekrar çalıştırılabilir.
-- Neon SQL Editor'da, git push'tan ÖNCE çalıştırın.
-- =============================================================================

-- Tedarikçi e-posta adresi
ALTER TABLE "Tedarikci" ADD COLUMN IF NOT EXISTS "email" TEXT;

-- Satınalma siparişi: PDF linki ve son gönderim bilgisi
ALTER TABLE "SatinalmaSiparisi" ADD COLUMN IF NOT EXISTS "paylasimAnahtari" TEXT;
ALTER TABLE "SatinalmaSiparisi" ADD COLUMN IF NOT EXISTS "sonGonderimTarihi" TIMESTAMP(3);
ALTER TABLE "SatinalmaSiparisi" ADD COLUMN IF NOT EXISTS "sonGonderimKanali" TEXT;
ALTER TABLE "SatinalmaSiparisi" ADD COLUMN IF NOT EXISTS "sonGonderimAlici" TEXT;
ALTER TABLE "SatinalmaSiparisi" ADD COLUMN IF NOT EXISTS "sonGonderenAdi" TEXT;
ALTER TABLE "SatinalmaSiparisi" ADD COLUMN IF NOT EXISTS "gonderimSayisi" INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS "SatinalmaSiparisi_paylasimAnahtari_key" ON "SatinalmaSiparisi"("paylasimAnahtari");
