/*
  Warnings:

  - You are about to drop the column `aciklama` on the `SevkiyatKaydi` table. All the data in the column will be lost.
  - Added the required column `adet` to the `SevkiyatKaydi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teklifKalemId` to the `SevkiyatKaydi` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TedarikciHareketTuru" AS ENUM ('BORC', 'ODEME');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SiparisDurum" ADD VALUE 'ONAY_BEKLIYOR';
ALTER TYPE "SiparisDurum" ADD VALUE 'REDDEDILDI';

-- AlterTable
ALTER TABLE "CariHareket" ADD COLUMN     "odemeDetay" TEXT,
ADD COLUMN     "odemeYontemi" TEXT;

-- AlterTable
ALTER TABLE "SevkiyatKaydi" DROP COLUMN "aciklama",
ADD COLUMN     "adet" INTEGER NOT NULL,
ADD COLUMN     "not" TEXT,
ADD COLUMN     "teklifKalemId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Siparis" ADD COLUMN     "olusturanAdi" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "onayTarihi" TIMESTAMP(3),
ADD COLUMN     "onaylayanAdi" TEXT,
ADD COLUMN     "redSebebi" TEXT,
ADD COLUMN     "sozlesmeMetni" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Teklif" ADD COLUMN     "kaynakSatinalmaTeklifiId" TEXT;

-- CreateTable
CREATE TABLE "Tedarikci" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "telefon" TEXT,
    "vergiNo" TEXT,
    "adres" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tedarikci_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TedarikciHareket" (
    "id" TEXT NOT NULL,
    "tedarikciId" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aciklama" TEXT NOT NULL,
    "tur" "TedarikciHareketTuru" NOT NULL,
    "tutar" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TedarikciHareket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SatinalmaTeklifi" (
    "id" TEXT NOT NULL,
    "tedarikciId" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SatinalmaTeklifi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SatinalmaTeklifKalemi" (
    "id" TEXT NOT NULL,
    "satinalmaTeklifiId" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "adet" INTEGER NOT NULL,
    "birimFiyat" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SatinalmaTeklifKalemi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KesifFormu" (
    "id" TEXT NOT NULL,
    "musteriAdi" TEXT NOT NULL,
    "telefon" TEXT,
    "adres" TEXT,
    "alanM2" DOUBLE PRECISION,
    "mevcutSistem" TEXT,
    "notlar" TEXT NOT NULL,
    "olusturanAdi" TEXT NOT NULL DEFAULT '',
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "olusturulanTeklifId" TEXT,

    CONSTRAINT "KesifFormu_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Teklif" ADD CONSTRAINT "Teklif_kaynakSatinalmaTeklifiId_fkey" FOREIGN KEY ("kaynakSatinalmaTeklifiId") REFERENCES "SatinalmaTeklifi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SevkiyatKaydi" ADD CONSTRAINT "SevkiyatKaydi_teklifKalemId_fkey" FOREIGN KEY ("teklifKalemId") REFERENCES "TeklifKalem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TedarikciHareket" ADD CONSTRAINT "TedarikciHareket_tedarikciId_fkey" FOREIGN KEY ("tedarikciId") REFERENCES "Tedarikci"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SatinalmaTeklifi" ADD CONSTRAINT "SatinalmaTeklifi_tedarikciId_fkey" FOREIGN KEY ("tedarikciId") REFERENCES "Tedarikci"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SatinalmaTeklifKalemi" ADD CONSTRAINT "SatinalmaTeklifKalemi_satinalmaTeklifiId_fkey" FOREIGN KEY ("satinalmaTeklifiId") REFERENCES "SatinalmaTeklifi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KesifFormu" ADD CONSTRAINT "KesifFormu_olusturulanTeklifId_fkey" FOREIGN KEY ("olusturulanTeklifId") REFERENCES "Teklif"("id") ON DELETE SET NULL ON UPDATE CASCADE;
