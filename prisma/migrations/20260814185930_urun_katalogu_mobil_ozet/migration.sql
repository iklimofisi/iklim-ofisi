-- CreateTable
CREATE TABLE "Urun" (
    "id" TEXT NOT NULL,
    "kod" TEXT,
    "ad" TEXT NOT NULL,
    "markaId" TEXT,
    "birim" TEXT NOT NULL DEFAULT 'Adet',
    "listeFiyati" DOUBLE PRECISION NOT NULL,
    "paraBirimi" TEXT NOT NULL DEFAULT 'TRY',
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Urun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Urun_kod_key" ON "Urun"("kod");

-- AddForeignKey
ALTER TABLE "Urun" ADD CONSTRAINT "Urun_markaId_fkey" FOREIGN KEY ("markaId") REFERENCES "Marka"("id") ON DELETE SET NULL ON UPDATE CASCADE;
