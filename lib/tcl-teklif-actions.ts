"use server";

// -----------------------------------------------------------------------------
// TCL TEKLİF PDF'İNDEN TEDARİKÇİ (SATINALMA) TEKLİFİ
//   tclTeklifPdfOku    : yüklenen PDF'i okur, önizleme için döner (veritabanına YAZMAZ)
//   tclSatinalmaKaydet : PDF'i yeniden okuyup satınalma teklifi olarak kaydeder
//                        (ürün grupları bölüm olarak, PDF maliyet dosyası olarak saklanır)
// Kâr eklenip müşteri teklifine dönüştürme satınalma teklifi sayfasından yapılır.
// -----------------------------------------------------------------------------
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { girisZorunlu } from "@/lib/oturum";
import { islemKaydet } from "@/lib/islem-kaydi";
import type { PdfSayfa } from "@/lib/netsa-ayikla";
import { tclTeklifAyikla, tclKalemAciklamasi, type TclSonuc } from "@/lib/tcl-teklif-ayikla";

const EN_BUYUK = 10 * 1024 * 1024;

// PDF → sayfalar (metin parçaları konumlarıyla; y sayfanın üstünden)
async function pdfSayfalari(pdf: Buffer): Promise<PdfSayfa[]> {
  // Paketin iç modülü doğrudan alınır (giriş dosyası paketlenince deneme moduna girebiliyor; bkz. kaya-fiyat-sunucu)
  // @ts-ignore -- iç modülün ayrı tip tanımı yok; tipi aşağıda ana paketten verilir
  const ic = await import("pdf-parse/lib/pdf-parse.js");
  const pdfParse = ((ic as { default?: unknown }).default ?? ic) as typeof import("pdf-parse");
  const sayfalar: PdfSayfa[] = [];
  type Parca = { str: string; transform: number[]; width: number };
  type Sayfa = {
    getViewport: (olcek: number) => { width: number; height: number };
    getTextContent: (o: object) => Promise<{ items: Parca[] }>;
  };
  const sayfaIsle = async (sayfa: Sayfa) => {
    const vp = sayfa.getViewport(1);
    const icerik = await sayfa.getTextContent({ normalizeWhitespace: true });
    sayfalar.push({
      w: vp.width,
      h: vp.height,
      items: icerik.items.map((i) => ({ s: i.str, x: Math.round(i.transform[4]), y: Math.round(vp.height - i.transform[5]), w: Math.round(i.width) })),
    });
    return "";
  };
  await pdfParse(pdf, { pagerender: sayfaIsle as unknown as (sayfa: unknown) => string });
  return sayfalar;
}

async function dosyayiOku(dosya: FormDataEntryValue | null): Promise<{ pdf: Buffer; ad: string; tip: string; sonuc: TclSonuc } | { hata: string; ad: string }> {
  const ad = dosya && typeof dosya === "object" && "name" in dosya ? String((dosya as File).name).slice(0, 200) : "";
  if (!dosya || typeof dosya === "string" || dosya.size === 0) return { hata: "PDF dosyası seçilmedi.", ad };
  if (dosya.size > EN_BUYUK) return { hata: "Dosya çok büyük (10 MB üstü).", ad };
  try {
    const pdf = Buffer.from(await dosya.arrayBuffer());
    if (pdf.subarray(0, 5).toString("latin1") !== "%PDF-") return { hata: "Dosya PDF değil.", ad };
    const sonuc = tclTeklifAyikla(await pdfSayfalari(pdf));
    if (!sonuc.kalemler.length) return { hata: sonuc.uyarilar[0] ?? "Teklifte ürün satırı bulunamadı.", ad };
    return { pdf, ad, tip: dosya.type || "application/pdf", sonuc };
  } catch (e) {
    return { hata: `PDF okunamadı: ${e instanceof Error ? e.message : String(e)}`, ad };
  }
}

export type TclOkumaSonucu = { basarili: true; dosya: string; sonuc: TclSonuc } | { basarili: false; dosya: string; hata: string };

export async function tclTeklifPdfOku(formData: FormData): Promise<TclOkumaSonucu> {
  await girisZorunlu();
  const r = await dosyayiOku(formData.get("pdf"));
  return "hata" in r ? { basarili: false, dosya: r.ad, hata: r.hata } : { basarili: true, dosya: r.ad, sonuc: r.sonuc };
}

export async function tclSatinalmaKaydet(formData: FormData) {
  const kullanici = await girisZorunlu();
  const baslik = String(formData.get("baslik") ?? "").trim().slice(0, 300);
  const tedarikciId = String(formData.get("tedarikciId") ?? "");
  if (!baslik || !tedarikciId) redirect("/panel/satinalma/teklifler?mesaj=tcl-teklif-eksik");
  const tedarikci = await prisma.tedarikci.findUnique({ where: { id: tedarikciId }, select: { id: true } });
  if (!tedarikci) redirect("/panel/satinalma/teklifler?mesaj=tcl-teklif-eksik");

  const r = await dosyayiOku(formData.get("pdf"));
  if ("hata" in r) {
    await islemKaydet(kullanici, "tclSatinalmaKaydet", { baslik, hata: r.hata, dosya: r.ad });
    redirect("/panel/satinalma/teklifler?mesaj=tcl-teklif-okunamadi");
  }
  const { sonuc } = r;
  const st = await prisma.satinalmaTeklifi.create({
    data: {
      tedarikciId,
      baslik,
      paraBirimi: sonuc.paraBirimi,
      maliyetPdf: r.pdf,
      maliyetPdfAdi: r.ad || "tedarikci-teklifi.pdf",
      maliyetPdfTipi: r.tip,
      // Birim fiyatsız teklifte toplam Net Tutar'dan gelir (kâr eklenirken kalemlere paylaştırılır)
      toplamTutar: sonuc.fiyatsiz && sonuc.netTutar ? sonuc.netTutar : null,
      kalemler: {
        create: sonuc.kalemler.map((k) => ({
          bolum: k.bolum.slice(0, 200),
          aciklama: tclKalemAciklamasi(k),
          adet: k.adet,
          birimFiyat: k.birimFiyat > 0 ? k.birimFiyat : 0,
        })),
      },
    },
    select: { id: true },
  });
  await islemKaydet(kullanici, "tclSatinalmaKaydet", {
    satinalmaTeklifiId: st.id,
    baslik,
    dosya: r.ad,
    kalemSayisi: sonuc.kalemler.length,
    netTutar: sonuc.netTutar,
    paraBirimi: sonuc.paraBirimi,
  });
  revalidatePath("/panel/satinalma/teklifler");
  redirect(`/panel/satinalma/teklifler/${st.id}?mesaj=tcl-teklif-okundu`);
}
