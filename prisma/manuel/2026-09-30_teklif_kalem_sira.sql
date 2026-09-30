-- =====================================================================
-- İklim Ofisi · 30.09.2026 · Teklif kalemlerinin sırası
--
-- SORUN: Teklif kalemlerinin sırası veritabanında saklanmıyordu; kalemler
-- veritabanının o anki iç düzenine göre geliyordu ve kaydettikçe sıra
-- kendiliğinden değişebiliyordu.
--
-- BU BETİK:
--   1) "TeklifKalem" tablosuna "sira" sütunu ekler (varsayılan 0).
--   2) Mevcut tekliflerde kalemlere, ŞU AN EKRANDA GÖRÜNDÜKLERİ sırayla
--      0, 1, 2… numarası verir. Yalnızca henüz sıra numarası almamış
--      (tüm kalemleri 0 olan) teklifler numaralanır; betik iki kez
--      çalıştırılsa bile yeni sistemle kaydedilmiş sıralar bozulmaz.
-- Hiçbir tablo, sütun veya kayıt SİLİNMEZ; kalemlerin açıklama, adet,
-- fiyat vb. hiçbir bilgisi DEĞİŞMEZ (yalnızca yeni "sira" sütunu dolar).
--
-- Nasıl çalıştırılır (SİTEYİ GÜNCELLEMEDEN ÖNCE):
--   Neon paneli → (ana / main dal seçili olsun) → SQL Editor →
--   bu dosyanın tamamını yapıştır → Run
-- =====================================================================

ALTER TABLE "TeklifKalem" ADD COLUMN IF NOT EXISTS "sira" INTEGER NOT NULL DEFAULT 0;

UPDATE "TeklifKalem" AS k
SET "sira" = n.sira
FROM (
  SELECT id, (ROW_NUMBER() OVER (PARTITION BY "teklifId" ORDER BY ctid) - 1)::int AS sira
  FROM "TeklifKalem"
  WHERE "teklifId" IN (
    SELECT "teklifId" FROM "TeklifKalem" GROUP BY "teklifId" HAVING MAX("sira") = 0
  )
) AS n
WHERE k.id = n.id AND k."sira" <> n.sira;

-- Kontrol (isteğe bağlı): sütun eklendi mi?
-- SELECT column_name FROM information_schema.columns
--  WHERE table_name = 'TeklifKalem' AND column_name = 'sira';
