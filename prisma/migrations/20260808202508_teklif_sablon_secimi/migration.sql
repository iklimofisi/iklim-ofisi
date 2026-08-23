-- CreateTable
CREATE TABLE "_TeklifSablonSecimi" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TeklifSablonSecimi_AB_unique" ON "_TeklifSablonSecimi"("A", "B");

-- CreateIndex
CREATE INDEX "_TeklifSablonSecimi_B_index" ON "_TeklifSablonSecimi"("B");

-- AddForeignKey
ALTER TABLE "_TeklifSablonSecimi" ADD CONSTRAINT "_TeklifSablonSecimi_A_fkey" FOREIGN KEY ("A") REFERENCES "Teklif"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeklifSablonSecimi" ADD CONSTRAINT "_TeklifSablonSecimi_B_fkey" FOREIGN KEY ("B") REFERENCES "TeklifSablon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
