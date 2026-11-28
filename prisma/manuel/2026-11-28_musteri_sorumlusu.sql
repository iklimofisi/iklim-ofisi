-- 2026-11-28: Firma sorumlusu (müşterinin cirosu bu personele yazılır)
-- Yalnız ekleyici; tekrar çalıştırılabilir. git push ÖNCESİ Neon SQL Editor içinde çalıştırın.

ALTER TABLE "Musteri" ADD COLUMN IF NOT EXISTS "sorumluKullaniciId" TEXT;
CREATE INDEX IF NOT EXISTS "Musteri_sorumluKullaniciId_idx" ON "Musteri"("sorumluKullaniciId");

-- Başlangıç ataması: sorumlusu boş müşteriye, o müşteriye en çok teklif hazırlamış (hâlâ kayıtlı) kullanıcı atanır.
-- Dolu olanlara dokunulmaz; sonradan müşteri kartından değiştirilebilir.
UPDATE "Musteri" m
SET "sorumluKullaniciId" = x.kid
FROM (
  SELECT DISTINCT ON (t."musteriId") t."musteriId" AS mid, t."olusturanKullaniciId" AS kid
  FROM "Teklif" t
  JOIN "Kullanici" k ON k.id = t."olusturanKullaniciId"
  GROUP BY t."musteriId", t."olusturanKullaniciId"
  ORDER BY t."musteriId", COUNT(*) DESC, MAX(t.tarih) DESC
) x
WHERE m.id = x.mid AND m."sorumluKullaniciId" IS NULL;
