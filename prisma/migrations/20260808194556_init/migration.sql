-- CreateEnum
CREATE TYPE "TeklifDurum" AS ENUM ('BEKLEMEDE', 'ONAYLANDI', 'REDDEDILDI');

-- CreateEnum
CREATE TYPE "CariTur" AS ENUM ('BORC', 'ALACAK');

-- CreateTable
CREATE TABLE "Musteri" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "telefon" TEXT,
    "vergiNo" TEXT,
    "adres" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Musteri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teklif" (
    "id" TEXT NOT NULL,
    "musteriId" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durum" "TeklifDurum" NOT NULL DEFAULT 'BEKLEMEDE',

    CONSTRAINT "Teklif_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeklifKalem" (
    "id" TEXT NOT NULL,
    "teklifId" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "adet" INTEGER NOT NULL,
    "birimFiyat" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TeklifKalem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CariHareket" (
    "id" TEXT NOT NULL,
    "musteriId" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aciklama" TEXT NOT NULL,
    "tur" "CariTur" NOT NULL,
    "tutar" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CariHareket_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Teklif" ADD CONSTRAINT "Teklif_musteriId_fkey" FOREIGN KEY ("musteriId") REFERENCES "Musteri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeklifKalem" ADD CONSTRAINT "TeklifKalem_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES "Teklif"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CariHareket" ADD CONSTRAINT "CariHareket_musteriId_fkey" FOREIGN KEY ("musteriId") REFERENCES "Musteri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
