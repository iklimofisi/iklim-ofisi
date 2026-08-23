/*
  Warnings:

  - You are about to drop the column `sozlesmeMetni` on the `Siparis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SatinalmaTeklifi" ADD COLUMN     "paraBirimi" TEXT NOT NULL DEFAULT 'TRY';

-- AlterTable
ALTER TABLE "Siparis" DROP COLUMN "sozlesmeMetni",
ADD COLUMN     "ekNot" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "kur" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "sozlesmeDosya" BYTEA,
ADD COLUMN     "sozlesmeDosyaAdi" TEXT,
ADD COLUMN     "sozlesmeDosyaTipi" TEXT;
