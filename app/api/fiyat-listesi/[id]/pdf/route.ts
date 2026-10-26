import { NextRequest } from "next/server";
import { suankiKullanici } from "@/lib/oturum";
import { prisma } from "@/lib/prisma";
import { getSirketAyarlari } from "@/lib/sirket";
import { fiyatListesiPdfOlustur, type PdfGorsel } from "@/lib/fiyat-listesi-pdf";
import { notEtiketsiz, secimAciklamasi } from "@/lib/fiyat-listesi";

// Fotoğraflı fiyat listesi PDF'i (panel). ?indir=1 → dosya olarak indirir.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const dosyaAdi = (t: string) =>
  (t
    .replace(/[ğĞ]/g, "g")
    .replace(/[üÜ]/g, "u")
    .replace(/[şŞ]/g, "s")
    .replace(/[ıİ]/g, "i")
    .replace(/[öÖ]/g, "o")
    .replace(/[çÇ]/g, "c")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "Fiyat-Listesi") + ".pdf";

// GET: listenin tamamı. POST (form): "haric" alanlarındaki ürünler çıkarılarak (müşteriye
// gönderirken bazı ürünleri listeden çıkarmak için; kayıtlı liste DEĞİŞMEZ).
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return pdfYanit(params.id, new Set(), req.nextUrl.searchParams.get("indir") === "1");
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let haric = new Set<string>();
  let indir = false;
  try {
    const fd = await req.formData();
    haric = new Set((fd.getAll("haric") as string[]).filter((x) => typeof x === "string" && x).slice(0, 5000));
    indir = fd.get("indir") === "1";
  } catch {
    /* form okunamazsa liste tam basılır */
  }
  return pdfYanit(params.id, haric, indir);
}

async function pdfYanit(id: string, haric: Set<string>, indir: boolean) {
  if (!(await suankiKullanici())) return new Response("Yetkisiz", { status: 401 });

  const liste = await prisma.fiyatListesi.findUnique({
    where: { id },
    include: { kalemler: { orderBy: { sira: "asc" }, include: { urun: { select: { gorselId: true } } } } },
  });
  if (!liste) return new Response("Fiyat listesi bulunamadı", { status: 404 });

  const kalemler = liste.kalemler
    .filter((k) => !haric.has(k.id))
    .map((k) => ({
      bolum: k.bolum,
      ad: k.ad,
      kod: k.kod,
      marka: k.marka,
      aciklama: k.aciklama,
      birim: k.birim,
      fiyat: k.fiyat,
      fiyat2: k.fiyat2,
      fiyat3: k.fiyat3,
      gorselId: k.gorselId || k.urun?.gorselId || null,
    }));
  const idler = Array.from(new Set(kalemler.map((k) => k.gorselId).filter(Boolean))) as string[];
  // Tablo görünümünde de bölüm fotoğrafı gösterilir (satırlarda fotoğraf yoksa hiç okunmaz)
  const kayitlar = idler.length
    ? await prisma.gorsel.findMany({ where: { id: { in: idler } }, select: { id: true, veri: true, genislik: true, yukseklik: true } })
    : [];
  const gorseller = new Map<string, PdfGorsel>(
    kayitlar.map((g) => [g.id, { veri: new Uint8Array(g.veri), genislik: g.genislik, yukseklik: g.yukseklik }])
  );

  // Hazır listeden eklenmiş ve notları değiştirilmemiş listede (notlar ürüne bağlı etiketler
  // gelmeden önce eklendiyse) hazır listenin etiketli notları kullanılır: PDF'te yalnız
  // seçilen ürünlerle ilgili notlar çıkar. Notlar elle değiştirildiyse kayıtlı notlar kullanılır.
  let notlar = liste.notlar;
  if (notlar) {
    const { HAZIR_LISTELER } = await import("@/lib/hazir-listeler");
    const kayitli = notlar.replace(/\r\n/g, "\n").trim();
    const h = HAZIR_LISTELER.find((x) => x.baslik === liste.baslik && x.notlar && notEtiketsiz(x.notlar).trim() === kayitli && x.notlar.trim() !== kayitli);
    if (h) notlar = h.notlar;
  }

  // Ürün seçerek alınan PDF'te başlık altındaki açıklama yalnız seçilen ürünlerin bölümlerini sayar
  // (listenin tamamı basılıyorsa kayıtlı açıklama olduğu gibi kalır)
  const aciklama = liste.aciklama && kalemler.length > 0 && kalemler.length < liste.kalemler.length ? secimAciklamasi(kalemler) || liste.aciklama : liste.aciklama;

  const sirket = await getSirketAyarlari();
  const pdf = fiyatListesiPdfOlustur({ ...liste, aciklama, notlar }, kalemler, gorseller, sirket);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${indir ? "attachment" : "inline"}; filename="${dosyaAdi(liste.baslik)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
