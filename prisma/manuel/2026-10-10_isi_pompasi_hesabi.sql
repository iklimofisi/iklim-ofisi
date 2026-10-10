-- =====================================================================
-- İklim Ofisi · 10.10.2026 · Isı pompası hesabı (panel)
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * Yeni tablo "IsiPompasiModeli": ısı pompası model kataloğu
--     (kapasite noktaları; hesapta model önerisi için)
--   * Yeni tablo "IsiHesap": kaydedilen ısı pompası / radyatör /
--     yerden ısıtma hesapları (girdiler tek JSON metni olarak saklanır)
-- Mevcut hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
-- İki kez çalıştırılırsa zarar vermez ("IF NOT EXISTS").
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

CREATE TABLE IF NOT EXISTS "IsiPompasiModeli" (
  "id"             TEXT PRIMARY KEY,
  "marka"          TEXT NOT NULL,
  "model"          TEXT NOT NULL,
  "kapA7W35"       DOUBLE PRECISION NOT NULL DEFAULT 0,
  "kapAm7W35"      DOUBLE PRECISION NOT NULL DEFAULT 0,
  "kapAm7W55"      DOUBLE PRECISION NOT NULL DEFAULT 0,
  "kapAm15W35"     DOUBLE PRECISION,
  "minDisSicaklik" DOUBLE PRECISION NOT NULL DEFAULT -20,
  "maksCikis"      DOUBLE PRECISION NOT NULL DEFAULT 60,
  "yedekIsiticiKw" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "urunId"         TEXT,
  "aciklama"       TEXT,
  "aktif"          BOOLEAN NOT NULL DEFAULT true,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IsiPompasiModeli_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "Urun"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "IsiHesap" (
  "id"                   TEXT PRIMARY KEY,
  "ad"                   TEXT NOT NULL,
  "musteriId"            TEXT,
  "il"                   TEXT NOT NULL DEFAULT 'İstanbul',
  "veri"                 TEXT NOT NULL DEFAULT '{}',
  "toplamKw"             DOUBLE PRECISION NOT NULL DEFAULT 0,
  "teklifId"             TEXT,
  "olusturanKullaniciId" TEXT,
  "olusturanAdi"         TEXT NOT NULL DEFAULT '',
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IsiHesap_musteriId_fkey" FOREIGN KEY ("musteriId") REFERENCES "Musteri"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "IsiHesap_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES "Teklif"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "IsiHesap_musteriId_idx" ON "IsiHesap"("musteriId");

-- Kontrol (isteğe bağlı): 2 satır döndürmelidir
-- SELECT table_name FROM information_schema.tables WHERE table_name IN ('IsiPompasiModeli','IsiHesap');
