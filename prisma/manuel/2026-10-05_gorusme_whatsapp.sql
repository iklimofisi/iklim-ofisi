-- =====================================================================
-- İklim Ofisi · 05.10.2026 · Görüşme türü / teklif bağlantısı + WhatsApp linki
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * "Ziyaret" tablosuna 2 yeni sütun:
--       - "tur"      : görüşme türü (mevcut kayıtlar 'ZIYARET' olur)
--       - "teklifId" : görüşmenin ilgili olduğu teklif (boş olabilir)
--   * Yeni "TeklifPaylasim" tablosu (müşteriye gönderilen gizli teklif linki)
-- Mevcut hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
-- İki kez çalıştırılırsa zarar vermez ("IF NOT EXISTS").
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

ALTER TABLE "Ziyaret" ADD COLUMN IF NOT EXISTS "tur" TEXT NOT NULL DEFAULT 'ZIYARET';
ALTER TABLE "Ziyaret" ADD COLUMN IF NOT EXISTS "teklifId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Ziyaret_teklifId_fkey') THEN
    ALTER TABLE "Ziyaret"
      ADD CONSTRAINT "Ziyaret_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES "Teklif"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Ziyaret_teklifId_idx" ON "Ziyaret"("teklifId");

CREATE TABLE IF NOT EXISTS "TeklifPaylasim" (
  "id"              TEXT PRIMARY KEY,
  "teklifId"        TEXT NOT NULL,
  "anahtar"         TEXT NOT NULL,
  "olusturanAdi"    TEXT NOT NULL DEFAULT '',
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "goruntulenme"    INTEGER NOT NULL DEFAULT 0,
  "sonGoruntulenme" TIMESTAMP(3),
  CONSTRAINT "TeklifPaylasim_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES "Teklif"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "TeklifPaylasim_teklifId_key" ON "TeklifPaylasim"("teklifId");
CREATE UNIQUE INDEX IF NOT EXISTS "TeklifPaylasim_anahtar_key" ON "TeklifPaylasim"("anahtar");

-- Kontrol (isteğe bağlı): 'tur' ve 'teklifId' satırlarını döndürmelidir
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'Ziyaret' AND column_name IN ('tur','teklifId');
