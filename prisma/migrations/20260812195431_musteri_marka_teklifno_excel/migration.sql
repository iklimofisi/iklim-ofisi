/*
  Warnings:

  - A unique constraint covering the columns `[teklifNo]` on the table `Teklif` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Musteri" ADD COLUMN     "email" TEXT,
ADD COLUMN     "muhasebeEmail" TEXT;

-- AlterTable
ALTER TABLE "Siparis" ADD COLUMN     "sevkAdresi" TEXT;

-- AlterTable
ALTER TABLE "Teklif" ADD COLUMN     "teklifNo" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "TeklifKalem" ADD COLUMN     "markaId" TEXT;

-- CreateTable
CREATE TABLE "Marka" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "logoAdi" TEXT,
    "logoTipi" TEXT,
    "logo" BYTEA,

    CONSTRAINT "Marka_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Marka_ad_key" ON "Marka"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "Teklif_teklifNo_key" ON "Teklif"("teklifNo");

-- AddForeignKey
ALTER TABLE "TeklifKalem" ADD CONSTRAINT "TeklifKalem_markaId_fkey" FOREIGN KEY ("markaId") REFERENCES "Marka"("id") ON DELETE SET NULL ON UPDATE CASCADE;
