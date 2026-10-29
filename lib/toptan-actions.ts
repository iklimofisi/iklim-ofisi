"use server";

// -----------------------------------------------------------------------------
// İKLİMOFİSİ TOPTAN FİYAT LİSTESİ — sunucu işlemleri
//   toptanListeOlustur : boş toptan listeyi oluşturur (bir kez)
//   toptanPdfOku       : yüklenen tek bir Netsa PDF'ini okur (veritabanına YAZMAZ; önizleme için)
//   toptanListeUygula  : okunan markaları listeye işler (yalnız yüklenen markalar değişir)
//   toptanKarKaydet    : kâr oranlarını / yuvarlamayı değiştirip satış fiyatlarını yeniden hesaplar
// -----------------------------------------------------------------------------
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { girisZorunlu } from "@/lib/oturum";
import { islemKaydet } from "@/lib/islem-kaydi";
import { yuvarlamaGecerli } from "@/lib/fiyat-listesi";
import { netsaAyikla, type NetsaSonuc, type PdfSayfa } from "@/lib/netsa-ayikla";
import {
  TOPTAN_KAYNAK,
  TOPTAN_BASLIK,
  bosToptanDurum,
  toptanDurumOku,
  toptanMarkaAdi,
  netsaUrunleriOku,
  netsaNotlariOku,
  karOku,
  markaSirala,
  toptanDegisiklikler,
  toptanKalemleri,
  anahtarla,
  type ToptanDurum,
} from "@/lib/toptan-fiyat";

const EN_AZ_URUN = 10; // bir markada bundan az ürün okunursa dosya biçimi değişmiş sayılır
const TOPTAN_MARKALAR_SINIRI = 10; // tek seferde işlenecek en fazla liste

async function yetki(islem: string, girdi?: FormData | Record<string, unknown>) {
  const kullanici = await girisZorunlu();
  await islemKaydet(kullanici, islem, girdi);
  return kullanici;
}

const yollariYenile = (id: string) => {
  revalidatePath("/panel/fiyat-listeleri");
  revalidatePath(`/panel/fiyat-listeleri/${id}`);
};

// Toptan listeyi açar; zaten varsa ona gider (ikinci liste oluşmaz)
export async function toptanListeOlustur() {
  const giren = await girisZorunlu();
  const mevcut = await prisma.fiyatListesi.findFirst({ where: { kaynak: TOPTAN_KAYNAK }, orderBy: { createdAt: "asc" }, select: { id: true } });
  if (mevcut) redirect(`/panel/fiyat-listeleri/${mevcut.id}`);
  await islemKaydet(giren, "toptanListeOlustur", {});
  const l = await prisma.fiyatListesi.create({
    data: {
      baslik: TOPTAN_BASLIK,
      paraBirimi: "TRY",
      kdvDahil: true,
      fiyatGoster: true,
      duzen: "TABLO",
      fiyatBaslik: "Nakit",
      fiyat2Baslik: "Kredi Kartı",
      kaynak: TOPTAN_KAYNAK,
      kaynakDurum: JSON.stringify(bosToptanDurum()),
      olusturanAdi: giren?.ad ?? "",
    },
    select: { id: true },
  });
  revalidatePath("/panel/fiyat-listeleri");
  redirect(`/panel/fiyat-listeleri/${l.id}`);
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
  // pdf-parse sayfaları sırayla işler ve sayfa işleyicisini bekler (await)
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

export type ToptanOkumaSonucu = { basarili: true; dosya: string; sonuc: NetsaSonuc } | { basarili: false; dosya: string; hata: string };

// Tek PDF okur (her dosya ayrı çağrılır: Vercel'de bir istek en fazla ~4,5 MB olabilir)
export async function toptanPdfOku(formData: FormData): Promise<ToptanOkumaSonucu> {
  await girisZorunlu();
  const dosya = formData.get("pdf");
  const ad = dosya && typeof dosya === "object" && "name" in dosya ? String((dosya as File).name).slice(0, 200) : "";
  if (!dosya || typeof dosya === "string" || dosya.size === 0) return { basarili: false, dosya: ad, hata: "Dosya seçilmedi." };
  if (dosya.size > 10 * 1024 * 1024) return { basarili: false, dosya: ad, hata: "Dosya çok büyük (10 MB üstü)." };
  try {
    const pdf = Buffer.from(await dosya.arrayBuffer());
    if (pdf.subarray(0, 5).toString("latin1") !== "%PDF-") return { basarili: false, dosya: ad, hata: "Dosya PDF değil." };
    const sonuc = netsaAyikla(await pdfSayfalari(pdf));
    const marka = toptanMarkaAdi(sonuc.marka);
    if (!marka) return { basarili: false, dosya: ad, hata: "Netsa Sakura, Bosch ya da Carrier fiyat listesi olarak tanınmadı." };
    if (sonuc.urunler.length < EN_AZ_URUN)
      return {
        basarili: false,
        dosya: ad,
        hata: `${marka} listesinden yalnız ${sonuc.urunler.length} ürün okunabildi. PDF'in biçimi değişmiş olabilir; liste güncellenmedi.`,
      };
    return { basarili: true, dosya: ad, sonuc: { ...sonuc, marka } };
  } catch (e) {
    return { basarili: false, dosya: ad, hata: `PDF okunamadı: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// Satırları durumdan yeniden yazar (tek seferde; yarım kalmaz). Satıra eklenmiş fotoğraf korunur.
async function listeyiYaz(listeId: string, durum: ToptanDurum) {
  const eski = await prisma.fiyatListesi.findUnique({
    where: { id: listeId },
    select: { kalemler: { orderBy: { sira: "asc" }, select: { marka: true, kod: true, ad: true, gorselId: true } } },
  });
  const gorseller = new Map(anahtarla(eski?.kalemler ?? []).map((x) => [x.anahtar, x.deger.gorselId]));
  const yeni = anahtarla(toptanKalemleri(durum));
  await prisma.$transaction([
    prisma.fiyatListesiKalem.deleteMany({ where: { listeId } }),
    prisma.fiyatListesiKalem.createMany({
      data: yeni.map(({ anahtar, deger: k }, sira) => ({
        listeId,
        sira,
        bolum: k.bolum,
        ad: k.ad,
        kod: k.kod,
        marka: k.marka,
        aciklama: k.aciklama,
        birim: "Adet",
        fiyat: k.fiyat,
        fiyat2: k.fiyat2,
        gorselId: gorseller.get(anahtar) ?? null,
      })),
    }),
    prisma.fiyatListesi.update({ where: { id: listeId }, data: { kaynakDurum: JSON.stringify(durum), updatedAt: new Date() } }),
  ]);
}

async function toptanListeGetir(listeId: string) {
  const l = await prisma.fiyatListesi.findUnique({ where: { id: listeId }, select: { id: true, kaynak: true, kaynakDurum: true } });
  return l && l.kaynak === TOPTAN_KAYNAK ? l : null;
}

// Formdaki / istekteki marka kâr oranları. Listede bulunan her markanın kârı girilmiş olmalı.
function karlariOku(ham: Record<string, unknown>, markalar: string[]): { kar: Record<string, number> } | { hata: string } {
  const kar: Record<string, number> = {};
  for (const m of markalar) {
    const n = karOku(ham[m]);
    if (n === null) return { hata: `${m} için kâr oranı girilmedi (0 ile 500 arası bir yüzde yazın).` };
    kar[m] = n;
  }
  return { kar };
}

export type ToptanIslemSonucu = { basarili: boolean; mesaj: string };

// Okunan PDF'leri listeye işler. Yalnız yüklenen markaların ürünleri değişir; diğer markalara dokunulmaz.
export async function toptanListeUygula(girdi: {
  listeId: string;
  markalar: { dosya: string; sonuc: NetsaSonuc }[];
  kar: Record<string, string | number>;
  yuvarlama: number | string;
}): Promise<ToptanIslemSonucu> {
  const listeId = String(girdi?.listeId ?? "");
  const gelen = Array.isArray(girdi?.markalar) ? girdi.markalar.slice(0, TOPTAN_MARKALAR_SINIRI) : [];
  await yetki("toptanListeUygula", {
    listeId,
    markalar: gelen.map((m) => `${m?.sonuc?.marka} ${m?.sonuc?.tarih} (${Array.isArray(m?.sonuc?.urunler) ? m.sonuc.urunler.length : 0} ürün)`),
    kar: girdi?.kar,
    yuvarlama: girdi?.yuvarlama,
  });
  const liste = await toptanListeGetir(listeId);
  if (!liste) return { basarili: false, mesaj: "Toptan fiyat listesi bulunamadı." };

  const durum = toptanDurumOku(liste.kaynakDurum);
  const simdi = new Date().toISOString();
  const yeniMarkalar = new Map<string, ToptanDurum["markalar"][number]>();
  for (const m of gelen) {
    const marka = toptanMarkaAdi(m?.sonuc?.marka);
    if (!marka) return { basarili: false, mesaj: "Tanınmayan marka listesi gönderildi." };
    const urunler = netsaUrunleriOku(m.sonuc.urunler, marka);
    if (urunler.length < EN_AZ_URUN) return { basarili: false, mesaj: `${marka} listesinde yeterli ürün yok (${urunler.length}); liste güncellenmedi.` };
    yeniMarkalar.set(marka, {
      marka,
      tarih: String(m.sonuc.tarih ?? "").slice(0, 20),
      dosya: String(m.dosya ?? "").slice(0, 200),
      yuklenme: simdi,
      urunler,
      notlar: netsaNotlariOku(m.sonuc.notlar),
    });
  }
  if (!yeniMarkalar.size) return { basarili: false, mesaj: "Yüklenecek liste yok." };

  const markalar = markaSirala([...durum.markalar.filter((m) => !yeniMarkalar.has(m.marka)), ...yeniMarkalar.values()]);
  const k = karlariOku((girdi.kar ?? {}) as Record<string, unknown>, markalar.map((m) => m.marka));
  if ("hata" in k) return { basarili: false, mesaj: k.hata };

  // Değişiklikler (alış fiyatına göre) yalnız yüklenen markalar için
  const degisiklikler = [...yeniMarkalar.values()].flatMap((y) => toptanDegisiklikler(durum.markalar.find((m) => m.marka === y.marka)?.urunler ?? [], y.urunler));
  const ilkKez = !durum.markalar.length;
  const yeniDurum: ToptanDurum = {
    markalar,
    kar: { ...durum.kar, ...k.kar },
    yuvarlama: yuvarlamaGecerli(girdi.yuvarlama),
    sonGuncelleme: simdi,
    degisiklikler: ilkKez ? [] : degisiklikler,
    degisiklikTarihi: ilkKez ? null : simdi,
  };
  await listeyiYaz(liste.id, yeniDurum);
  yollariYenile(liste.id);
  const say = (t: string) => degisiklikler.filter((d) => d.tur === t).length;
  const adlar = [...yeniMarkalar.values()].map((m) => `${m.marka} (${m.tarih || "tarihsiz"})`).join(", ");
  return {
    basarili: true,
    mesaj: ilkKez
      ? `Liste oluşturuldu: ${adlar} · ${toptanKalemleri(yeniDurum).length} ürün.`
      : `Liste güncellendi: ${adlar} · ${say("DEGISEN")} ürünün fiyatı değişti · ${say("YENI")} yeni · ${say("CIKAN")} çıkan.`,
  };
}

// Kâr oranları / yuvarlama değişince satış fiyatları kayıtlı alış fiyatlarından yeniden hesaplanır
export async function toptanKarKaydet(formData: FormData) {
  await yetki("toptanKarKaydet", formData);
  const listeId = String(formData.get("listeId") ?? "");
  const liste = await toptanListeGetir(listeId);
  if (!liste) redirect("/panel/fiyat-listeleri");
  const durum = toptanDurumOku(liste.kaynakDurum);
  const ham: Record<string, unknown> = {};
  for (const m of durum.markalar) ham[m.marka] = formData.get(`kar_${m.marka}`);
  const k = karlariOku(ham, durum.markalar.map((m) => m.marka));
  if ("hata" in k) redirect(`/panel/fiyat-listeleri/${liste.id}?mesaj=toptan-kar-eksik`);
  durum.kar = { ...durum.kar, ...k.kar };
  durum.yuvarlama = yuvarlamaGecerli(formData.get("yuvarlama"));
  await listeyiYaz(liste.id, durum);
  yollariYenile(liste.id);
  redirect(`/panel/fiyat-listeleri/${liste.id}?mesaj=toptan-kar-kaydedildi`);
}
