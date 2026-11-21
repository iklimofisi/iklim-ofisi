"use server";

// -----------------------------------------------------------------------------
// TCL / VIESSMANN / BOSCH (NETİSA) / MITSUBISHI HEAVY (FORM MHI) TEKLİF PDF'İNDEN TEDARİKÇİ (SATINALMA) TEKLİFİ
// PDF'in biçimi kendiliğinden tanınır (Viessmann, Form MHI, Bosch/Netisa ya da TCL teklifi).
// Yazı katmanı olmayan PDF'te (ör. "Microsoft Print to PDF" ile basılmış Netisa teklifi)
// sayfalar tarayıcıda görüntüden okunur (OCR) ve okunan metin "ocrMetni" alanıyla gelir.
//   tclTeklifPdfOku    : yüklenen PDF'i okur, önizleme için döner (veritabanına YAZMAZ)
//   tclSatinalmaKaydet : PDF'i yeniden okuyup satınalma teklifi olarak kaydeder
//                        (ürün grupları bölüm olarak, PDF maliyet dosyası olarak saklanır)
//   satinalmaIskontoKaydet : satınalma teklifinin alış iskontosunu (%) değiştirir
// Kâr eklenip müşteri teklifine dönüştürme satınalma teklifi sayfasından yapılır.
// -----------------------------------------------------------------------------
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { islemZorunlu } from "@/lib/oturum";
import { islemKaydet } from "@/lib/islem-kaydi";
import type { PdfSayfa } from "@/lib/netsa-ayikla";
import { tclTeklifAyikla, tclKalemAciklamasi, type TclSonuc } from "@/lib/tcl-teklif-ayikla";
import { viessmannTeklifAyikla, viessmannTeklifiMi } from "@/lib/viessmann-teklif-ayikla";
import { netisaTeklifAyikla, netisaTeklifiMi } from "@/lib/netisa-teklif-ayikla";
import { mhiTeklifAyikla, mhiTeklifiMi } from "@/lib/mhi-teklif-ayikla";

const EN_BUYUK = 10 * 1024 * 1024;
const OCR_EN_UZUN = 200_000; // tarayıcıda okunan metin (karakter)
// Yazı katmanı olmayan PDF: istemci bu işareti görünce sayfaları görüntüden okur (OCR) ve tekrar gönderir
const METINSIZ = "METINSIZ";

// Metin parçalarından satırlar (aynı yükseklikteki parçalar soldan sağa birleştirilir)
function sayfaMetni(sayfalar: PdfSayfa[]): string {
  return sayfalar
    .map((s) => {
      const og = s.items.filter((i) => i.s && i.s.trim()).sort((a, b) => a.y - b.y || a.x - b.x);
      const satir: (typeof og)[] = [];
      for (const i of og) {
        const g = satir[satir.length - 1];
        if (g && Math.abs(i.y - g[0].y) <= 2.5) g.push(i);
        else satir.push([i]);
      }
      return satir.map((g) => g.sort((a, b) => a.x - b.x).map((i) => i.s.trim()).join(" ")).join("\n");
    })
    .join("\n\f\n");
}

// "35", "%35", "37,5" → 0 < x < 100; boş ya da geçersizse null (iskonto yok)
function iskontoOku(v: FormDataEntryValue | null): number | null {
  const t = String(v ?? "").trim().replace("%", "").replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) && n > 0 && n < 100 ? Math.round(n * 100) / 100 : null;
}

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

async function dosyayiOku(
  dosya: FormDataEntryValue | null,
  ocrHam?: FormDataEntryValue | null
): Promise<{ pdf: Buffer; ad: string; tip: string; sonuc: TclSonuc } | { hata: string; ad: string }> {
  const ad = dosya && typeof dosya === "object" && "name" in dosya ? String((dosya as File).name).slice(0, 200) : "";
  if (!dosya || typeof dosya === "string" || dosya.size === 0) return { hata: "PDF dosyası seçilmedi.", ad };
  if (dosya.size > EN_BUYUK) return { hata: "Dosya çok büyük (10 MB üstü).", ad };
  try {
    const pdf = Buffer.from(await dosya.arrayBuffer());
    if (pdf.subarray(0, 5).toString("latin1") !== "%PDF-") return { hata: "Dosya PDF değil.", ad };
    const sayfalar = await pdfSayfalari(pdf);
    const yaziVar = sayfalar.reduce((a, s) => a + s.items.reduce((b, i) => b + i.s.trim().length, 0), 0) >= 40;
    let sonuc: TclSonuc;
    if (!yaziVar) {
      // Yazı katmanı yok: tarayıcıda okunan metin (OCR) gelmediyse istemciden istenir
      const ocr = typeof ocrHam === "string" ? ocrHam.slice(0, OCR_EN_UZUN) : "";
      if (!ocr.trim()) return { hata: METINSIZ, ad };
      if (!netisaTeklifiMi(ocr))
        return { hata: "Bu PDF'te yazı katmanı yok ve görüntüden okunan metinde tanınan bir teklif biçimi bulunamadı (Bosch/Netisa teklifi bekleniyordu).", ad };
      sonuc = netisaTeklifAyikla(ocr, true);
    } else {
      const metin = sayfaMetni(sayfalar);
      sonuc = viessmannTeklifiMi(sayfalar)
        ? { ...viessmannTeklifAyikla(sayfalar), firma: "VIESSMANN" }
        : mhiTeklifiMi(sayfalar)
          ? mhiTeklifAyikla(sayfalar)
          : netisaTeklifiMi(metin)
          ? netisaTeklifAyikla(metin)
          : { ...tclTeklifAyikla(sayfalar), firma: "TCL" };
    }
    if (!sonuc.kalemler.length) return { hata: sonuc.uyarilar[0] ?? "Teklifte ürün satırı bulunamadı.", ad };
    return { pdf, ad, tip: dosya.type || "application/pdf", sonuc };
  } catch (e) {
    return { hata: `PDF okunamadı: ${e instanceof Error ? e.message : String(e)}`, ad };
  }
}

// metinsiz: PDF'te yazı katmanı yok; istemci sayfaları görüntüden okuyup (OCR) "ocrMetni" ile tekrar gönderir
export type TclOkumaSonucu = { basarili: true; dosya: string; sonuc: TclSonuc } | { basarili: false; dosya: string; hata: string; metinsiz?: boolean };

export async function tclTeklifPdfOku(formData: FormData): Promise<TclOkumaSonucu> {
  await islemZorunlu();
  const r = await dosyayiOku(formData.get("pdf"), formData.get("ocrMetni"));
  if ("hata" in r)
    return r.hata === METINSIZ
      ? { basarili: false, dosya: r.ad, hata: "PDF'te yazı katmanı yok; sayfalar görüntüden okunacak.", metinsiz: true }
      : { basarili: false, dosya: r.ad, hata: r.hata };
  return { basarili: true, dosya: r.ad, sonuc: r.sonuc };
}

export async function tclSatinalmaKaydet(formData: FormData) {
  const kullanici = await islemZorunlu();
  const baslik = String(formData.get("baslik") ?? "").trim().slice(0, 300);
  const tedarikciId = String(formData.get("tedarikciId") ?? "");
  // Hata olursa kullanıcı yüklemeyi yaptığı sayfaya döner
  const geri = formData.get("sonra") === "teklif" ? "/panel/teklifler/yeni" : "/panel/satinalma/teklifler";
  if (!baslik || !tedarikciId) redirect(`${geri}?mesaj=tcl-teklif-eksik`);
  const tedarikci = await prisma.tedarikci.findUnique({ where: { id: tedarikciId }, select: { id: true } });
  if (!tedarikci) redirect(`${geri}?mesaj=tcl-teklif-eksik`);

  const r = await dosyayiOku(formData.get("pdf"), formData.get("ocrMetni"));
  if ("hata" in r) {
    await islemKaydet(kullanici, "tclSatinalmaKaydet", { baslik, hata: r.hata, dosya: r.ad });
    redirect(`${geri}?mesaj=tcl-teklif-okunamadi`);
  }
  const { sonuc } = r;
  const alisIskontoYuzde = iskontoOku(formData.get("alisIskontoYuzde"));
  const st = await prisma.satinalmaTeklifi.create({
    data: {
      tedarikciId,
      baslik,
      paraBirimi: sonuc.paraBirimi,
      // PDF'teki fiyatlar liste fiyatıdır; kalemlerde liste fiyatı saklanır, net alış iskontoyla hesaplanır
      alisIskontoYuzde,
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
    alisIskontoYuzde,
  });
  revalidatePath("/panel/satinalma/teklifler");
  // Yeni Teklif sayfasından yüklendiyse doğrudan dolu teklif formuna dönülür
  if (formData.get("sonra") === "teklif") {
    const marj = Number(String(formData.get("marj") ?? "").replace(",", "."));
    const m = Number.isFinite(marj) && marj >= 0 && marj <= 1000 ? marj : 0;
    redirect(`/panel/teklifler/yeni?satinalma=${encodeURIComponent(st.id)}&marj=${m}`);
  }
  redirect(`/panel/satinalma/teklifler/${st.id}?mesaj=tcl-teklif-okundu`);
}

// Satınalma teklifinin alış iskontosu (liste fiyatlarından düşülecek %). Kalemler değişmez.
export async function satinalmaIskontoKaydet(formData: FormData) {
  const kullanici = await islemZorunlu();
  const id = String(formData.get("satinalmaTeklifiId") ?? "");
  const st = id ? await prisma.satinalmaTeklifi.findUnique({ where: { id }, select: { id: true, alisIskontoYuzde: true } }) : null;
  if (!st) redirect("/panel/satinalma/teklifler");
  const alisIskontoYuzde = iskontoOku(formData.get("alisIskontoYuzde"));
  await prisma.satinalmaTeklifi.update({ where: { id: st.id }, data: { alisIskontoYuzde } });
  await islemKaydet(kullanici, "satinalmaIskontoKaydet", { satinalmaTeklifiId: st.id, eski: st.alisIskontoYuzde, yeni: alisIskontoYuzde });
  revalidatePath("/panel/satinalma/teklifler");
  revalidatePath(`/panel/satinalma/teklifler/${st.id}`);
  redirect(`/panel/satinalma/teklifler/${st.id}?mesaj=satinalma-iskonto-kaydedildi`);
}
