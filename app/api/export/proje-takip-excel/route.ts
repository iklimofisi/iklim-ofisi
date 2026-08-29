import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  const teklifler = await prisma.teklif.findMany({
    include: {
      musteri: true,
      olusturanKullanici: true,
      kalemler: true,
    },
    orderBy: { tarih: "desc" },
  });

  const veriler = teklifler.map((t) => {
    const toplam = t.kalemler.reduce(
      (a, k) => a + k.adet * k.birimFiyat * (1 - k.iskontoYuzde / 100),
      0
    );

    return {
      "Teklif ID": t.id,
      "Teklif No": `TKL-${String(t.teklifNo).padStart(4, "0")}`,
      "Teklif / Proje Adı": t.baslik || "—",
      "Müşteri Firma": t.musteri.ad,
      "Hazırlayan Personel": t.olusturanKullanici?.ad || t.olusturanAdi || "—",
      "Tarih": t.tarih.toISOString().slice(0, 10),
      "Toplam Tutar": toplam.toFixed(2),
      "Para Birimi": t.paraBirimi,
      "Durum": t.durum, // BEKLEMEDE, ONAYLANDI, REDDEDILDI
      "Takip Notları / Görüşme Geçmişi": t.takipNotu || "",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(veriler);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Proje Takip");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Proje_Takip_Listesi_${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}