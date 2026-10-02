-- =====================================================================
-- İklim Ofisi · 02.10.2026 · Sözleşme taslakları
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * Yeni "Sozlesme" tablosu (onaylanan tekliften hazırlanan sözleşme taslağı)
--     Tablo zaten varsa hiçbir şey yapmaz ("IF NOT EXISTS").
-- Mevcut hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

CREATE TABLE IF NOT EXISTS "Sozlesme" (
  "id"               TEXT PRIMARY KEY,
  "teklifId"         TEXT NOT NULL,
  "baslik"           TEXT NOT NULL DEFAULT 'SATIŞ VE MONTAJ SÖZLEŞMESİ',
  "sozlesmeTarihi"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paraBirimi"       TEXT NOT NULL DEFAULT 'TRY',
  "kur"              DOUBLE PRECISION NOT NULL DEFAULT 1,
  "kdvOrani"         DOUBLE PRECISION NOT NULL DEFAULT 20,
  "kdvDahil"         BOOLEAN NOT NULL DEFAULT false,
  "birimFiyatGoster" BOOLEAN NOT NULL DEFAULT true,
  "isverenUnvan"     TEXT NOT NULL,
  "isverenAdres"     TEXT,
  "isverenVergi"     TEXT,
  "isverenTelefon"   TEXT,
  "isverenYetkili"   TEXT,
  "isinKonusu"       TEXT NOT NULL,
  "isYeri"           TEXT,
  "kalemler"         TEXT NOT NULL,
  "maddeler"         TEXT NOT NULL,
  "durum"            TEXT NOT NULL DEFAULT 'TASLAK',
  "olusturanAdi"     TEXT NOT NULL DEFAULT '',
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Sozlesme_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES "Teklif"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Sozlesme_teklifId_key" ON "Sozlesme"("teklifId");

-- Kontrol (isteğe bağlı): 1 satır döndürmelidir
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'Sozlesme';
