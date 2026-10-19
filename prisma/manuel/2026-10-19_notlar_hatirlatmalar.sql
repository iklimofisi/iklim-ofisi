-- =====================================================================
-- İklim Ofisi · 19.10.2026 · Notlar & Hatırlatmalar sayfası
--
-- BU BETİK YALNIZCA EKLEME YAPAR:
--   * Yeni "PanelNotu" tablosu (notlar, gizli/açık, hatırlatma günü-saati, alıcılar)
-- Mevcut hiçbir tablo, sütun veya kayıt SİLİNMEZ ya da DEĞİŞTİRİLMEZ.
-- İki kez çalıştırılırsa zarar vermez ("IF NOT EXISTS").
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

CREATE TABLE IF NOT EXISTS "PanelNotu" (
    "id" TEXT NOT NULL,
    "baslik" TEXT,
    "icerik" TEXT NOT NULL,
    "gizli" BOOLEAN NOT NULL DEFAULT false,
    "sabit" BOOLEAN NOT NULL DEFAULT false,
    "tamamlandi" BOOLEAN NOT NULL DEFAULT false,
    "olusturanId" TEXT NOT NULL,
    "olusturanAdi" TEXT NOT NULL DEFAULT '',
    "hatirlatmaGunu" TEXT,
    "hatirlatmaSaati" TEXT,
    "hatirlatmaAlicilar" TEXT,
    "hatirlatmaGonderildi" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PanelNotu_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PanelNotu_olusturanId_idx" ON "PanelNotu"("olusturanId");
CREATE INDEX IF NOT EXISTS "PanelNotu_hatirlatmaGunu_idx" ON "PanelNotu"("hatirlatmaGunu");

-- Kontrol (isteğe bağlı): 14 satır döndürmelidir
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'PanelNotu';
