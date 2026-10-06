-- =====================================================================
-- İklim Ofisi · 06.10.2026 · Fotoğraflı fiyat listeleri
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * "Urun" tablosuna 1 yeni, BOŞ başlayan sütun: "gorselId" (ürün fotoğrafı)
--   * Yeni tablolar: "Gorsel" (fotoğraflar), "FiyatListesi", "FiyatListesiKalem"
-- Mevcut hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
-- İki kez çalıştırılırsa zarar vermez ("IF NOT EXISTS").
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

ALTER TABLE "Urun" ADD COLUMN IF NOT EXISTS "gorselId" TEXT;

CREATE TABLE IF NOT EXISTS "Gorsel" (
  "id"        TEXT PRIMARY KEY,
  "veri"      BYTEA NOT NULL,
  "tip"       TEXT NOT NULL DEFAULT 'image/jpeg',
  "genislik"  INTEGER NOT NULL DEFAULT 0,
  "yukseklik" INTEGER NOT NULL DEFAULT 0,
  "boyut"     INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "FiyatListesi" (
  "id"               TEXT PRIMARY KEY,
  "baslik"           TEXT NOT NULL,
  "aciklama"         TEXT,
  "paraBirimi"       TEXT NOT NULL DEFAULT 'TRY',
  "kdvDahil"         BOOLEAN NOT NULL DEFAULT false,
  "iskontoYuzde"     DOUBLE PRECISION NOT NULL DEFAULT 0,
  "fiyatGoster"      BOOLEAN NOT NULL DEFAULT true,
  "duzen"            TEXT NOT NULL DEFAULT 'KART',
  "gecerlilikTarihi" TIMESTAMP(3),
  "notlar"           TEXT,
  "olusturanAdi"     TEXT NOT NULL DEFAULT '',
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "FiyatListesiKalem" (
  "id"       TEXT PRIMARY KEY,
  "listeId"  TEXT NOT NULL,
  "sira"     INTEGER NOT NULL DEFAULT 0,
  "bolum"    TEXT NOT NULL DEFAULT '',
  "urunId"   TEXT,
  "ad"       TEXT NOT NULL,
  "kod"      TEXT,
  "marka"    TEXT,
  "aciklama" TEXT,
  "birim"    TEXT NOT NULL DEFAULT 'Adet',
  "fiyat"    DOUBLE PRECISION NOT NULL DEFAULT 0,
  "gorselId" TEXT,
  CONSTRAINT "FiyatListesiKalem_listeId_fkey" FOREIGN KEY ("listeId") REFERENCES "FiyatListesi"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "FiyatListesiKalem_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "Urun"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "FiyatListesiKalem_listeId_idx" ON "FiyatListesiKalem"("listeId");

-- Kontrol (isteğe bağlı): 3 satır döndürmelidir
-- SELECT table_name FROM information_schema.tables WHERE table_name IN ('Gorsel','FiyatListesi','FiyatListesiKalem');
