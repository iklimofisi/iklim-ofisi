-- =====================================================================
-- İklim Ofisi · 12.10.2026 · Havalandırma hesabı (panel)
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * Yeni tablo "HavalandirmaHesap": kaydedilen havalandırma hesapları
--     (girdiler tek JSON metni olarak saklanır)
-- Mevcut hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
-- İki kez çalıştırılırsa zarar vermez ("IF NOT EXISTS").
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

CREATE TABLE IF NOT EXISTS "HavalandirmaHesap" (
  "id"                   TEXT PRIMARY KEY,
  "ad"                   TEXT NOT NULL,
  "musteriId"            TEXT,
  "il"                   TEXT NOT NULL DEFAULT 'İstanbul',
  "veri"                 TEXT NOT NULL DEFAULT '{}',
  "toplamDebi"           DOUBLE PRECISION NOT NULL DEFAULT 0,
  "teklifId"             TEXT,
  "olusturanKullaniciId" TEXT,
  "olusturanAdi"         TEXT NOT NULL DEFAULT '',
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HavalandirmaHesap_musteriId_fkey" FOREIGN KEY ("musteriId") REFERENCES "Musteri"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "HavalandirmaHesap_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES "Teklif"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "HavalandirmaHesap_musteriId_idx" ON "HavalandirmaHesap"("musteriId");

-- Kontrol (isteğe bağlı): 1 satır döndürmelidir
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'HavalandirmaHesap';
