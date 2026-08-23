-- CreateTable
CREATE TABLE "WebTalebi" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "telefon" TEXT,
    "email" TEXT,
    "mesaj" TEXT NOT NULL,
    "dosyaAdi" TEXT,
    "dosyaTipi" TEXT,
    "dosya" BYTEA,
    "okundu" BOOLEAN NOT NULL DEFAULT false,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebTalebi_pkey" PRIMARY KEY ("id")
);
