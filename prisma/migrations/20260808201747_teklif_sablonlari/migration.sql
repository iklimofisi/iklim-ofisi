-- CreateTable
CREATE TABLE "TeklifSablon" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "sira" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TeklifSablon_pkey" PRIMARY KEY ("id")
);
