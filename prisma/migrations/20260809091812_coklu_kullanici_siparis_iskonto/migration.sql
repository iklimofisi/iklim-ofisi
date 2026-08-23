/*
  Warnings:

  - You are about to drop the column `adres` on the `Musteri` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "KullaniciRol" AS ENUM ('ADMIN', 'SATIS');

-- CreateEnum
CREATE TYPE "SiparisDurum" AS ENUM ('HAZIRLANIYOR', 'SEVK_EDILDI', 'TESLIM_EDILDI', 'FATURALANDI', 'IPTAL');

-- AlterTable
ALTER TABLE "Musteri" DROP COLUMN "adres",
ADD COLUMN     "faturaAdresi" TEXT,
ADD COLUMN     "sevkAdresi" TEXT;

-- AlterTable
ALTER TABLE "Teklif" ADD COLUMN     "olusturanAdi" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "revizyonNo" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "TeklifKalem" ADD COLUMN     "iskontoYuzde" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Kullanici" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sifreHash" TEXT NOT NULL,
    "rol" "KullaniciRol" NOT NULL DEFAULT 'SATIS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kullanici_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "token" TEXT NOT NULL,
    "kullaniciId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "TeklifRevizyon" (
    "id" TEXT NOT NULL,
    "teklifId" TEXT NOT NULL,
    "revizyonNo" INTEGER NOT NULL,
    "veriJson" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeklifRevizyon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Siparis" (
    "id" TEXT NOT NULL,
    "teklifId" TEXT NOT NULL,
    "musteriId" TEXT NOT NULL,
    "durum" "SiparisDurum" NOT NULL DEFAULT 'HAZIRLANIYOR',
    "faturaNo" TEXT,
    "faturaTarihi" TIMESTAMP(3),
    "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Siparis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SevkiyatKaydi" (
    "id" TEXT NOT NULL,
    "siparisId" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SevkiyatKaydi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kullanici_email_key" ON "Kullanici"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Siparis_teklifId_key" ON "Siparis"("teklifId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_kullaniciId_fkey" FOREIGN KEY ("kullaniciId") REFERENCES "Kullanici"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeklifRevizyon" ADD CONSTRAINT "TeklifRevizyon_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES "Teklif"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siparis" ADD CONSTRAINT "Siparis_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES "Teklif"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siparis" ADD CONSTRAINT "Siparis_musteriId_fkey" FOREIGN KEY ("musteriId") REFERENCES "Musteri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SevkiyatKaydi" ADD CONSTRAINT "SevkiyatKaydi_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES "Siparis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
