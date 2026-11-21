-- =============================================================================
-- 2026-11-21 · SATINALMA ZİNCİRİ (Aşama 2): satınalma siparişi, mal kabul, alış faturası eşleşmesi
-- Yalnız EKLER (yeni tablo / yeni sütun). Hiçbir kayıt silinmez, değiştirilmez.
-- Tekrar çalıştırılabilir (IF NOT EXISTS). Neon SQL Editor'da, git push'tan ÖNCE çalıştırın.
-- =============================================================================

-- Şirket ayarı: satınalma siparişi onay eşiği (TL, KDV hariç)
ALTER TABLE "SirketAyarlari" ADD COLUMN IF NOT EXISTS "satinalmaOnayEsigi" DOUBLE PRECISION;

-- Satınalma siparişi
CREATE TABLE IF NOT EXISTS "SatinalmaSiparisi" (
    "id" TEXT NOT NULL,
    "no" SERIAL NOT NULL,
    "tedarikciId" TEXT NOT NULL,
    "satinalmaTeklifiId" TEXT,
    "siparisId" TEXT,
    "projeId" TEXT,
    "baslik" TEXT NOT NULL,
    "paraBirimi" TEXT NOT NULL DEFAULT 'TRY',
    "kur" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "tutarNet" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "durum" TEXT NOT NULL DEFAULT 'ONAY_BEKLIYOR',
    "beklenenTeslimTarihi" TIMESTAMP(3),
    "notlar" TEXT,
    "olusturanAdi" TEXT NOT NULL DEFAULT '',
    "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onaylayanAdi" TEXT,
    "onayTarihi" TIMESTAMP(3),
    "redNedeni" TEXT,
    "iptalTarihi" TIMESTAMP(3),
    "iptalEdenAdi" TEXT,
    "iptalNedeni" TEXT,
    CONSTRAINT "SatinalmaSiparisi_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SatinalmaSiparisi_no_key" ON "SatinalmaSiparisi"("no");
CREATE INDEX IF NOT EXISTS "SatinalmaSiparisi_tedarikciId_idx" ON "SatinalmaSiparisi"("tedarikciId");
CREATE INDEX IF NOT EXISTS "SatinalmaSiparisi_siparisId_idx" ON "SatinalmaSiparisi"("siparisId");

-- Satınalma siparişi kalemleri
CREATE TABLE IF NOT EXISTS "SatinalmaSiparisKalemi" (
    "id" TEXT NOT NULL,
    "satinalmaSiparisiId" TEXT NOT NULL,
    "sira" INTEGER NOT NULL DEFAULT 0,
    "bolum" TEXT,
    "kod" TEXT,
    "urunId" TEXT,
    "aciklama" TEXT NOT NULL,
    "adet" DOUBLE PRECISION NOT NULL,
    "birim" TEXT NOT NULL DEFAULT 'Adet',
    "birimFiyat" DOUBLE PRECISION NOT NULL,
    "iskontoYuzde" DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT "SatinalmaSiparisKalemi_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "SatinalmaSiparisKalemi_satinalmaSiparisiId_idx" ON "SatinalmaSiparisKalemi"("satinalmaSiparisiId");

-- Mal kabul (teslim alma) ve kalemleri
CREATE TABLE IF NOT EXISTS "MalKabul" (
    "id" TEXT NOT NULL,
    "satinalmaSiparisiId" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "irsaliyeNo" TEXT,
    "not" TEXT,
    "olusturanAdi" TEXT NOT NULL DEFAULT '',
    "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "iptalTarihi" TIMESTAMP(3),
    "iptalEdenAdi" TEXT,
    "iptalNedeni" TEXT,
    CONSTRAINT "MalKabul_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "MalKabul_satinalmaSiparisiId_idx" ON "MalKabul"("satinalmaSiparisiId");

CREATE TABLE IF NOT EXISTS "MalKabulKalemi" (
    "id" TEXT NOT NULL,
    "malKabulId" TEXT NOT NULL,
    "kalemId" TEXT NOT NULL,
    "miktar" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "MalKabulKalemi_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "MalKabulKalemi_malKabulId_idx" ON "MalKabulKalemi"("malKabulId");
CREATE INDEX IF NOT EXISTS "MalKabulKalemi_kalemId_idx" ON "MalKabulKalemi"("kalemId");

-- Tedarikçi hareketi: alış faturası no ve bağlı satınalma siparişi
ALTER TABLE "TedarikciHareket" ADD COLUMN IF NOT EXISTS "faturaNo" TEXT;
ALTER TABLE "TedarikciHareket" ADD COLUMN IF NOT EXISTS "satinalmaSiparisiId" TEXT;

-- Yabancı anahtarlar (yoksa eklenir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SatinalmaSiparisi_tedarikciId_fkey') THEN
    ALTER TABLE "SatinalmaSiparisi" ADD CONSTRAINT "SatinalmaSiparisi_tedarikciId_fkey" FOREIGN KEY ("tedarikciId") REFERENCES "Tedarikci"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SatinalmaSiparisi_satinalmaTeklifiId_fkey') THEN
    ALTER TABLE "SatinalmaSiparisi" ADD CONSTRAINT "SatinalmaSiparisi_satinalmaTeklifiId_fkey" FOREIGN KEY ("satinalmaTeklifiId") REFERENCES "SatinalmaTeklifi"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SatinalmaSiparisi_siparisId_fkey') THEN
    ALTER TABLE "SatinalmaSiparisi" ADD CONSTRAINT "SatinalmaSiparisi_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES "Siparis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SatinalmaSiparisi_projeId_fkey') THEN
    ALTER TABLE "SatinalmaSiparisi" ADD CONSTRAINT "SatinalmaSiparisi_projeId_fkey" FOREIGN KEY ("projeId") REFERENCES "Proje"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SatinalmaSiparisKalemi_satinalmaSiparisiId_fkey') THEN
    ALTER TABLE "SatinalmaSiparisKalemi" ADD CONSTRAINT "SatinalmaSiparisKalemi_satinalmaSiparisiId_fkey" FOREIGN KEY ("satinalmaSiparisiId") REFERENCES "SatinalmaSiparisi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SatinalmaSiparisKalemi_urunId_fkey') THEN
    ALTER TABLE "SatinalmaSiparisKalemi" ADD CONSTRAINT "SatinalmaSiparisKalemi_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "Urun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MalKabul_satinalmaSiparisiId_fkey') THEN
    ALTER TABLE "MalKabul" ADD CONSTRAINT "MalKabul_satinalmaSiparisiId_fkey" FOREIGN KEY ("satinalmaSiparisiId") REFERENCES "SatinalmaSiparisi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MalKabulKalemi_malKabulId_fkey') THEN
    ALTER TABLE "MalKabulKalemi" ADD CONSTRAINT "MalKabulKalemi_malKabulId_fkey" FOREIGN KEY ("malKabulId") REFERENCES "MalKabul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MalKabulKalemi_kalemId_fkey') THEN
    ALTER TABLE "MalKabulKalemi" ADD CONSTRAINT "MalKabulKalemi_kalemId_fkey" FOREIGN KEY ("kalemId") REFERENCES "SatinalmaSiparisKalemi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TedarikciHareket_satinalmaSiparisiId_fkey') THEN
    ALTER TABLE "TedarikciHareket" ADD CONSTRAINT "TedarikciHareket_satinalmaSiparisiId_fkey" FOREIGN KEY ("satinalmaSiparisiId") REFERENCES "SatinalmaSiparisi"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
