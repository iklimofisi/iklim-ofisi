-- =====================================================================
-- İklim Ofisi · 26.09.2026 · Müşteri yetkilileri + teklif kopyalama
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * 1 yeni tablo: "MusteriYetkili"
--   * "Teklif" tablosuna 3 yeni BOŞ (NULL) sütun: yetkiliId, kopyaKaynakTeklifId, kopyaKaynakTeklifNo
--   * 1 indeks, 2 yabancı anahtar
-- Hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
-- "IF NOT EXISTS" kontrolleri sayesinde iki kez çalıştırılsa bile zarar vermez.
--
-- Nasıl çalıştırılır (ikisinden biri):
--   A) Neon paneli → SQL Editor → bu dosyanın tamamını yapıştır → Run
--   B) Proje klasöründe: npx prisma db execute --file prisma/manuel/2026-09-26_musteri_yetkili_ve_teklif_kopya.sql --schema prisma/schema.prisma
-- =====================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS "MusteriYetkili" (
    "id" TEXT NOT NULL,
    "musteriId" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "unvan" TEXT,
    "telefon" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MusteriYetkili_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MusteriYetkili_musteriId_idx" ON "MusteriYetkili"("musteriId");

ALTER TABLE "Teklif" ADD COLUMN IF NOT EXISTS "yetkiliId" TEXT;
ALTER TABLE "Teklif" ADD COLUMN IF NOT EXISTS "kopyaKaynakTeklifId" TEXT;
ALTER TABLE "Teklif" ADD COLUMN IF NOT EXISTS "kopyaKaynakTeklifNo" INTEGER;

DO $$
BEGIN
    -- Müşteri silinirse ona ait ek yetkililer de silinir (müşteri silme zaten yalnızca yöneticide)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MusteriYetkili_musteriId_fkey') THEN
        ALTER TABLE "MusteriYetkili"
            ADD CONSTRAINT "MusteriYetkili_musteriId_fkey"
            FOREIGN KEY ("musteriId") REFERENCES "Musteri"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Yetkili silinirse teklif SİLİNMEZ; teklifin yetkili alanı boşalır (ana yetkiliye döner)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Teklif_yetkiliId_fkey') THEN
        ALTER TABLE "Teklif"
            ADD CONSTRAINT "Teklif_yetkiliId_fkey"
            FOREIGN KEY ("yetkiliId") REFERENCES "MusteriYetkili"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

COMMIT;

-- Kontrol (isteğe bağlı): aşağıdaki sorgu 3 satır döndürmelidir
-- SELECT column_name FROM information_schema.columns
--  WHERE table_name = 'Teklif' AND column_name IN ('yetkiliId','kopyaKaynakTeklifId','kopyaKaynakTeklifNo');
