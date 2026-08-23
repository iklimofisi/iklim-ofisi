-- CreateEnum
CREATE TYPE "ProjeIhaleDurumu" AS ENUM ('TAKIPTE', 'TEKLIF_VERILDI', 'KAZANILDI', 'KAYBEDILDI', 'IPTAL');

-- AlterTable
ALTER TABLE "Teklif" ADD COLUMN     "birimFiyatGoster" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "projeId" TEXT;

-- CreateTable
CREATE TABLE "Proje" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "konum" TEXT,
    "musteriId" TEXT,
    "kaynak" TEXT,
    "ihaleDurumu" "ProjeIhaleDurumu" NOT NULL DEFAULT 'TAKIPTE',
    "ihaleyiAlan" TEXT,
    "tahminiDeger" DOUBLE PRECISION,
    "paraBirimi" TEXT NOT NULL DEFAULT 'TRY',
    "notlar" TEXT,
    "olusturanAdi" TEXT NOT NULL DEFAULT '',
    "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ziyaret" (
    "id" TEXT NOT NULL,
    "musteriId" TEXT,
    "projeId" TEXT,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "not" TEXT NOT NULL,
    "hatirlatmaTarihi" TIMESTAMP(3),
    "hatirlatmaNotu" TEXT,
    "hatirlatmaTamam" BOOLEAN NOT NULL DEFAULT false,
    "olusturanAdi" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Ziyaret_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Teklif" ADD CONSTRAINT "Teklif_projeId_fkey" FOREIGN KEY ("projeId") REFERENCES "Proje"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proje" ADD CONSTRAINT "Proje_musteriId_fkey" FOREIGN KEY ("musteriId") REFERENCES "Musteri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ziyaret" ADD CONSTRAINT "Ziyaret_musteriId_fkey" FOREIGN KEY ("musteriId") REFERENCES "Musteri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ziyaret" ADD CONSTRAINT "Ziyaret_projeId_fkey" FOREIGN KEY ("projeId") REFERENCES "Proje"("id") ON DELETE SET NULL ON UPDATE CASCADE;
