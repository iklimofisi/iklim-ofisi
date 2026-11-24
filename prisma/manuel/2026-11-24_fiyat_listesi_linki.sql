-- =============================================================================
-- 2026-11-24 · FİYAT LİSTESİ MÜŞTERİ LİNKİ (iklimofisi.com/f/...)
-- Yalnız EKLER. Hiçbir kayıt silinmez, değiştirilmez. Tekrar çalıştırılabilir.
-- Neon SQL Editor'da, git push'tan ÖNCE çalıştırın.
-- =============================================================================

CREATE TABLE IF NOT EXISTS "FiyatListesiPaylasim" (
    "id" TEXT NOT NULL,
    "listeId" TEXT NOT NULL,
    "anahtar" TEXT NOT NULL,
    "alici" TEXT NOT NULL DEFAULT '',
    "olusturanAdi" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "goruntulenme" INTEGER NOT NULL DEFAULT 0,
    "sonGoruntulenme" TIMESTAMP(3),
    "iptalTarihi" TIMESTAMP(3),
    "iptalEdenAdi" TEXT,
    CONSTRAINT "FiyatListesiPaylasim_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "FiyatListesiPaylasim_anahtar_key" ON "FiyatListesiPaylasim"("anahtar");
CREATE INDEX IF NOT EXISTS "FiyatListesiPaylasim_listeId_idx" ON "FiyatListesiPaylasim"("listeId");

-- Liste silinirse o listenin linkleri de kalkar (linkler yalnız listeye bağlıdır)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FiyatListesiPaylasim_listeId_fkey') THEN
    ALTER TABLE "FiyatListesiPaylasim"
      ADD CONSTRAINT "FiyatListesiPaylasim_listeId_fkey"
      FOREIGN KEY ("listeId") REFERENCES "FiyatListesi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
