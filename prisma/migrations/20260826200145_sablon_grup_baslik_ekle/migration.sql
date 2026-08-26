-- CreateEnum
CREATE TYPE "StokHareketTuru" AS ENUM ('GIRIS', 'CIKIS', 'DUZELTME');

-- CreateEnum
CREATE TYPE "SeriNoDurum" AS ENUM ('DEPODA', 'REZERVE', 'SATILDI', 'SERVISDE');

-- AlterTable
ALTER TABLE "CariHareket" ADD COLUMN     "banka" TEXT,
ADD COLUMN     "cekNo" TEXT,
ADD COLUMN     "evrakDosya" BYTEA,
ADD COLUMN     "evrakDosyaAdi" TEXT,
ADD COLUMN     "evrakDosyaTipi" TEXT,
ADD COLUMN     "vadeTarihi" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Kullanici" ADD COLUMN     "telefon" TEXT;

-- AlterTable
ALTER TABLE "Musteri" ADD COLUMN     "yetkiliAdi" TEXT,
ADD COLUMN     "yetkiliEmail" TEXT,
ADD COLUMN     "yetkiliTelefon" TEXT;

-- AlterTable
ALTER TABLE "SatinalmaTeklifKalemi" ALTER COLUMN "adet" SET DEFAULT 1,
ALTER COLUMN "adet" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "SevkiyatKaydi" ALTER COLUMN "adet" SET DEFAULT 1,
ALTER COLUMN "adet" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Siparis" ADD COLUMN     "olusturanKullaniciId" TEXT;

-- AlterTable
ALTER TABLE "TedarikciHareket" ADD COLUMN     "banka" TEXT,
ADD COLUMN     "cekNo" TEXT,
ADD COLUMN     "evrakDosya" BYTEA,
ADD COLUMN     "evrakDosyaAdi" TEXT,
ADD COLUMN     "evrakDosyaTipi" TEXT,
ADD COLUMN     "vadeTarihi" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Teklif" ADD COLUMN     "olusturanKullaniciId" TEXT;

-- AlterTable
ALTER TABLE "TeklifKalem" ADD COLUMN     "bolum" TEXT DEFAULT 'Genel Kalemler',
ALTER COLUMN "adet" SET DEFAULT 1,
ALTER COLUMN "adet" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "birimFiyat" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "TeklifSablon" ADD COLUMN     "grupBaslik" TEXT;

-- AlterTable
ALTER TABLE "TeslimKaydi" ALTER COLUMN "adet" SET DEFAULT 1,
ALTER COLUMN "adet" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Urun" ADD COLUMN     "depoKonumu" TEXT,
ADD COLUMN     "ekGiderler" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "hedefKarMarjiYuzde" DOUBLE PRECISION NOT NULL DEFAULT 20,
ADD COLUMN     "maliyetFiyati" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "maliyetParaBirimi" TEXT NOT NULL DEFAULT 'TRY',
ADD COLUMN     "stokMiktari" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "listeFiyati" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "SirketAyarlari" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "unvan" TEXT NOT NULL DEFAULT 'İklim Ofisi Mühendislik A.Ş.',
    "slogan" TEXT DEFAULT 'İklimlendirme & VRF Sistem Çözümleri',
    "adres" TEXT DEFAULT 'Atatürk Mah. Sanayi Cad. No:142/A, Ümraniye / İstanbul',
    "telefon" TEXT DEFAULT '+90 (216) 450 00 00',
    "email" TEXT DEFAULT 'info@iklimofisi.com',
    "web" TEXT DEFAULT 'www.iklimofisi.com',
    "vergiDairesi" TEXT,
    "vergiNo" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SirketAyarlari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StokHareket" (
    "id" TEXT NOT NULL,
    "urunId" TEXT NOT NULL,
    "tur" "StokHareketTuru" NOT NULL,
    "miktar" DOUBLE PRECISION NOT NULL,
    "birimMaliyet" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aciklama" TEXT NOT NULL,
    "referansNo" TEXT,
    "olusturanAdi" TEXT NOT NULL DEFAULT '',
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StokHareket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Depo" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "kod" TEXT,
    "adres" TEXT,

    CONSTRAINT "Depo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepoStok" (
    "id" TEXT NOT NULL,
    "depoId" TEXT NOT NULL,
    "urunId" TEXT NOT NULL,
    "fizikselMiktar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rezerveMiktar" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "DepoStok_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UrunSeriNo" (
    "id" TEXT NOT NULL,
    "urunId" TEXT NOT NULL,
    "seriNo" TEXT NOT NULL,
    "depoId" TEXT,
    "durum" "SeriNoDurum" NOT NULL DEFAULT 'DEPODA',
    "musteriAdi" TEXT,
    "garantiBaslangic" TIMESTAMP(3),
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UrunSeriNo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Depo_kod_key" ON "Depo"("kod");

-- CreateIndex
CREATE UNIQUE INDEX "DepoStok_depoId_urunId_key" ON "DepoStok"("depoId", "urunId");

-- CreateIndex
CREATE UNIQUE INDEX "UrunSeriNo_seriNo_key" ON "UrunSeriNo"("seriNo");

-- AddForeignKey
ALTER TABLE "Teklif" ADD CONSTRAINT "Teklif_olusturanKullaniciId_fkey" FOREIGN KEY ("olusturanKullaniciId") REFERENCES "Kullanici"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siparis" ADD CONSTRAINT "Siparis_olusturanKullaniciId_fkey" FOREIGN KEY ("olusturanKullaniciId") REFERENCES "Kullanici"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokHareket" ADD CONSTRAINT "StokHareket_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "Urun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepoStok" ADD CONSTRAINT "DepoStok_depoId_fkey" FOREIGN KEY ("depoId") REFERENCES "Depo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepoStok" ADD CONSTRAINT "DepoStok_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "Urun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UrunSeriNo" ADD CONSTRAINT "UrunSeriNo_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "Urun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
