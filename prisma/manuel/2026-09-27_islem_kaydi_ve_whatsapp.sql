-- =====================================================================
-- İklim Ofisi · 27.09.2026 · İşlem geçmişi + WhatsApp numarası
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * 1 yeni tablo: "IslemKaydi" (kim, ne zaman, hangi işlemi yaptı)
--   * 3 indeks
--   * "SirketAyarlari" tablosuna 1 yeni BOŞ (NULL) sütun: whatsapp
-- Hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
-- "IF NOT EXISTS" kontrolleri sayesinde iki kez çalıştırılsa bile zarar vermez.
--
-- Nasıl çalıştırılır:
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS "IslemKaydi" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kullaniciId" TEXT,
    "kullaniciAd" TEXT,
    "islem" TEXT NOT NULL,
    "hedefId" TEXT,
    "veri" TEXT,
    CONSTRAINT "IslemKaydi_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IslemKaydi_createdAt_idx" ON "IslemKaydi"("createdAt");
CREATE INDEX IF NOT EXISTS "IslemKaydi_kullaniciId_idx" ON "IslemKaydi"("kullaniciId");
CREATE INDEX IF NOT EXISTS "IslemKaydi_hedefId_idx" ON "IslemKaydi"("hedefId");

ALTER TABLE "SirketAyarlari" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;

COMMIT;

-- Kontrol (isteğe bağlı): aşağıdaki sorgu 2 satır döndürmelidir
-- SELECT table_name, column_name FROM information_schema.columns
--  WHERE (table_name = 'IslemKaydi' AND column_name = 'islem')
--     OR (table_name = 'SirketAyarlari' AND column_name = 'whatsapp');
