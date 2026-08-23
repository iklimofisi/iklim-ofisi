/*
  Warnings:

  - You are about to drop the column `teslimEvraki` on the `Siparis` table. All the data in the column will be lost.
  - You are about to drop the column `teslimEvrakiAdi` on the `Siparis` table. All the data in the column will be lost.
  - You are about to drop the column `teslimEvrakiTipi` on the `Siparis` table. All the data in the column will be lost.
  - You are about to drop the column `teslimTarihi` on the `Siparis` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SiparisDurum" ADD VALUE 'KISMEN_SEVK_EDILDI';
ALTER TYPE "SiparisDurum" ADD VALUE 'KISMEN_TESLIM_EDILDI';

-- AlterTable
ALTER TABLE "Siparis" DROP COLUMN "teslimEvraki",
DROP COLUMN "teslimEvrakiAdi",
DROP COLUMN "teslimEvrakiTipi",
DROP COLUMN "teslimTarihi";

-- CreateTable
CREATE TABLE "TeslimKaydi" (
    "id" TEXT NOT NULL,
    "siparisId" TEXT NOT NULL,
    "teklifKalemId" TEXT NOT NULL,
    "adet" INTEGER NOT NULL,
    "not" TEXT,
    "evrakAdi" TEXT,
    "evrakTipi" TEXT,
    "evrak" BYTEA,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeslimKaydi_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TeslimKaydi" ADD CONSTRAINT "TeslimKaydi_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES "Siparis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeslimKaydi" ADD CONSTRAINT "TeslimKaydi_teklifKalemId_fkey" FOREIGN KEY ("teklifKalemId") REFERENCES "TeklifKalem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
