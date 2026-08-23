import { NextResponse } from "next/server";
import { suankiKullanici } from "@/lib/oturum";

export async function GET() {
  const kullanici = await suankiKullanici();
  if (!kullanici) return new NextResponse("Yetkisiz", { status: 401 });

  const XLSX = await import("xlsx");

  const veri = [
    { "Kod": "RXYQ8T", "Ürün Adı": "VRF Dış Ünite 8HP", "Marka": "Daikin", "Birim": "Adet", "Fiyat": 185000, "Para Birimi": "TRY" },
    { "Kod": "FXFQ50", "Ürün Adı": "VRF İç Ünite 4 Yön Kaset 50", "Marka": "Daikin", "Birim": "Adet", "Fiyat": 24500, "Para Birimi": "TRY" },
    { "Kod": "", "Ürün Adı": "Bakır Boru Tesisatı (metre)", "Marka": "", "Birim": "Metre", "Fiyat": 620, "Para Birimi": "TRY" },
  ];

  const sayfa = XLSX.utils.json_to_sheet(veri);
  sayfa["!cols"] = [{ wch: 14 }, { wch: 32 }, { wch: 16 }, { wch: 10 }, { wch: 12 }, { wch: 12 }];

  const kitap = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(kitap, sayfa, "Ürünler");

  const buffer = XLSX.write(kitap, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="urun-sablonu.xlsx"',
    },
  });
}
