-- =============================================================================
-- 2026-11-21 · ROLLER + FİNANS (Aşama 3): yeni kullanıcı rolleri, cari harekette döviz bilgisi,
-- ay kapanışı (dönem kilidi)
-- Yalnız EKLER. Hiçbir kayıt silinmez, değiştirilmez. Tekrar çalıştırılabilir.
-- Neon SQL Editor'da, git push'tan ÖNCE çalıştırın.
-- =============================================================================

-- Yeni roller (mevcut kullanıcıların rolü değişmez)
ALTER TYPE "KullaniciRol" ADD VALUE IF NOT EXISTS 'SATINALMA';
ALTER TYPE "KullaniciRol" ADD VALUE IF NOT EXISTS 'MUHASEBE';
ALTER TYPE "KullaniciRol" ADD VALUE IF NOT EXISTS 'YATIRIMCI';

-- Cari harekette döviz bilgisi (tutar yine TL; boş = TL işlem)
ALTER TABLE "CariHareket" ADD COLUMN IF NOT EXISTS "paraBirimi" TEXT;
ALTER TABLE "CariHareket" ADD COLUMN IF NOT EXISTS "dovizTutar" DOUBLE PRECISION;
ALTER TABLE "CariHareket" ADD COLUMN IF NOT EXISTS "kur" DOUBLE PRECISION;

-- Ay kapanışı
CREATE TABLE IF NOT EXISTS "DonemKapanis" (
    "id" TEXT NOT NULL,
    "donem" TEXT NOT NULL,
    "kapatanAdi" TEXT NOT NULL,
    "kapanisTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ozetJson" TEXT,
    "acikMi" BOOLEAN NOT NULL DEFAULT false,
    "acanAdi" TEXT,
    "acilisTarihi" TIMESTAMP(3),
    "acilisNedeni" TEXT,
    CONSTRAINT "DonemKapanis_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "DonemKapanis_donem_key" ON "DonemKapanis"("donem");
