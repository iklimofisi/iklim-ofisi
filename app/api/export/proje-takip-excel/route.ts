import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const [projeler, teklifler] = await Promise.all([
      prisma.proje.findMany({
        include: {
          musteri: true,
          teklifler: {
            include: {
              musteri: true, // DÜZELTİLDİ: musteri ilişkisi eklendi
              kalemler: true,
              olusturanKullanici: true,
            },
          },
        },
        orderBy: { olusturmaTarihi: "desc" },
      }),
      prisma.teklif.findMany({
        where: { projeId: null },
        include: {
          musteri: true,
          olusturanKullanici: true,
          kalemler: { include: { marka: true } },
        },
        orderBy: { tarih: "desc" },
      }),
    ]);

    const veriler: any[] = [];

    // 1. Projelerden Gelen Satırlar
    projeler.forEach((p) => {
      if (p.teklifler && p.teklifler.length > 0) {
        p.teklifler.forEach((t: any) => {
          const toplam = t.kalemler.reduce(
            (a: number, k: any) => a + k.adet * k.birimFiyat * (1 - (k.iskontoYuzde || 0) / 100),
            0
          );
          veriler.push({
            "Teklif ID": t.id,
            "Teklif No": `TKL-${String(t.teklifNo).padStart(4, "0")}`,
            "Teklif / Proje Adı": p.ad || t.baslik || "—",
            "Müşteri Firma": p.musteri?.ad || t.musteri?.ad || "—",
            "YETKİLİ": p.musteri?.yetkiliAdi || t.musteri?.yetkiliAdi || "—",
            "İLETİŞİM": p.musteri?.yetkiliTelefon || p.musteri?.telefon || t.musteri?.telefon || "—",
            "Hazırlayan Personel": t.olusturanKullanici?.ad || t.olusturanAdi || p.olusturanAdi || "—",
            "Tarih": t.tarih ? new Date(t.tarih).toISOString().slice(0, 10) : "",
            "Toplam Tutar": toplam.toFixed(2),
            "Para Birimi": t.paraBirimi || "TRY",
            "Marka": "—",
            "İhaleyi alan firma": p.ihaleyiAlan || t.ihaleyiAlan || "",
            "Varsa Ekap No": t.ekapNo || "",
            "Varsa İpkb no": t.ipkbNo || "",
            "Takip Notları / Görüşme Geçmişi": t.takipNotu || p.notlar || "",
          });
        });
      } else {
        veriler.push({
          "Teklif ID": "",
          "Teklif No": "— (Teklif Hazırlanmadı)",
          "Teklif / Proje Adı": p.ad || "—",
          "Müşteri Firma": p.musteri?.ad || "—",
          "YETKİLİ": p.musteri?.yetkiliAdi || "—",
          "İLETİŞİM": p.musteri?.yetkiliTelefon || p.musteri?.telefon || "—",
          "Hazırlayan Personel": p.olusturanAdi || "—",
          "Tarih": p.olusturmaTarihi ? new Date(p.olusturmaTarihi).toISOString().slice(0, 10) : "",
          "Toplam Tutar": p.tahminiDeger ? p.tahminiDeger.toFixed(2) : "0.00",
          "Para Birimi": p.paraBirimi || "TRY",
          "Marka": "—",
          "İhaleyi alan firma": p.ihaleyiAlan || "",
          "Varsa Ekap No": "",
          "Varsa İpkb no": "",
          "Takip Notları / Görüşme Geçmişi": p.notlar || "",
        });
      }
    });

    // 2. Projeye Bağlı Olmayan Bağımsız Teklifler
    teklifler.forEach((t: any) => {
      const toplam = t.kalemler.reduce(
        (a: number, k: any) => a + k.adet * k.birimFiyat * (1 - (k.iskontoYuzde || 0) / 100),
        0
      );
      veriler.push({
        "Teklif ID": t.id,
        "Teklif No": `TKL-${String(t.teklifNo).padStart(4, "0")}`,
        "Teklif / Proje Adı": t.baslik || "—",
        "Müşteri Firma": t.musteri?.ad || "—",
        "YETKİLİ": t.musteri?.yetkiliAdi || "—",
        "İLETİŞİM": t.musteri?.yetkiliTelefon || t.musteri?.telefon || "—",
        "Hazırlayan Personel": t.olusturanKullanici?.ad || t.olusturanAdi || "—",
        "Tarih": t.tarih ? new Date(t.tarih).toISOString().slice(0, 10) : "",
        "Toplam Tutar": toplam.toFixed(2),
        "Para Birimi": t.paraBirimi || "TRY",
        "Marka": "—",
        "İhaleyi alan firma": t.ihaleyiAlan || "",
        "Varsa Ekap No": t.ekapNo || "",
        "Varsa İpkb no": t.ipkbNo || "",
        "Takip Notları / Görüşme Geçmişi": t.takipNotu || "",
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(veriler);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Proje Takip");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Proje_Takip_Listesi_${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Excel indirme hatası:", error);
    return new NextResponse("Excel dosyası üretilemedi", { status: 500 });
  }
}