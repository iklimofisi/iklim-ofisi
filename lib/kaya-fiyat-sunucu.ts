// -----------------------------------------------------------------------------
// KAYA İKLİMLENDİRME FİYAT LİSTESİ — OTOMATİK GÜNCELLEME (sunucu)
//
// Her gün (Vercel cron) ve panelde "Şimdi güncelle" ile çalışır:
//   1. kayaiklimlendirme.com/fiyat-listesi sayfasından güncel PDF bağlantısı bulunur
//   2. Bağlantı değişmediyse (Kaya yeni liste koymadıysa) yalnız "son kontrol" yazılır
//   3. Değiştiyse PDF indirilir, okunur, fiyatlara %5 eklenir ve liste yenilenir
//   4. Okuma şüpheliyse (çok az ürün / fiyat) mevcut liste KORUNUR, hata yazılır
//   5. Değişiklik ya da hata e-postayla bildirilir
// Bu dosya "use server" DEĞİLDİR; yalnız sunucu kodundan çağrılır.
// -----------------------------------------------------------------------------
import { prisma } from "@/lib/prisma";
import { epostaGonder } from "@/lib/eposta";
import {
  KAYA_KAYNAK,
  KAYA_SAYFA,
  KAYA_VARSAYILAN_BASLIK,
  pdfBaglantisiBul,
  dosyaTarihi,
  satirlariKur,
  kayaAyristir,
  zamli,
  urunAnahtari,
  kaynakDurumOku,
  type KaynakDurum,
  type MetinParcasi,
  type KayaKalem,
} from "@/lib/kaya-fiyat";

const TARAYICI = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const EN_AZ_URUN = 60; // bundan az ürün okunursa dosya biçimi değişmiş sayılır
const EN_AZ_FIYATLI_ORAN = 0.6;

export type GuncellemeSonucu =
  | { durum: "AYNI"; mesaj: string; listeId: string | null }
  | { durum: "GUNCELLENDI"; mesaj: string; listeId: string }
  | { durum: "HATA"; mesaj: string; listeId: string | null };

async function getir(url: string, ms: number) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    return await fetch(url, {
      signal: c.signal,
      cache: "no-store",
      redirect: "follow",
      headers: { "User-Agent": TARAYICI, Accept: "text/html,application/pdf,*/*" },
    });
  } finally {
    clearTimeout(t);
  }
}

// PDF → satırlar (pdf-parse, sayfa sayfa; her sayfada parçalar konuma göre satırlara dizilir)
export async function pdfSatirlari(pdf: Buffer): Promise<string[]> {
  // Paketin iç modülü doğrudan alınır: "pdf-parse" giriş dosyası paketlenince (webpack) deneme
  // moduna girip olmayan bir test PDF'ini okumaya çalışabiliyor.
  // @ts-ignore -- iç modülün ayrı tip tanımı yok; tipi aşağıda ana paketten verilir
  const ic = await import("pdf-parse/lib/pdf-parse.js");
  const pdfParse = ((ic as { default?: unknown }).default ?? ic) as typeof import("pdf-parse");
  const sayfalar: string[][] = [];
  // pdf-parse sayfa işleyicisinin sonucunu bekler (await); tip tanımı düz metin dediği için tür belirtilir
  const sayfaIsle = async (sayfa: { getTextContent: (o: object) => Promise<{ items: MetinParcasi[] }> }) => {
    const icerik = await sayfa.getTextContent({ normalizeWhitespace: false, disableCombineTextItems: false });
    const s = satirlariKur(icerik.items);
    sayfalar.push(s);
    return s.join("\n");
  };
  await pdfParse(pdf, { pagerender: sayfaIsle as unknown as (sayfa: unknown) => string });
  return sayfalar.flat();
}

type YeniKalem = { bolum: string; ad: string; aciklama: string | null; fiyat: number; fiyat2: number | null };

export function kalemlereCevir(k: KayaKalem[]): YeniKalem[] {
  return k.map((x) => ({
    bolum: x.bolum.slice(0, 120),
    ad: x.ad.slice(0, 300),
    aciklama: x.not ? x.not.slice(0, 500) : null,
    fiyat: x.nakit ? zamli(x.nakit) : 0,
    fiyat2: x.kart ? zamli(x.kart) : null,
  }));
}

export function degisiklikOzeti(eski: { bolum: string; ad: string; fiyat: number; fiyat2: number | null }[], yeni: YeniKalem[]) {
  const e = new Map(eski.map((k) => [urunAnahtari(k.bolum, k.ad), k]));
  const y = new Map(yeni.map((k) => [urunAnahtari(k.bolum, k.ad), k]));
  let yeniSayi = 0;
  let degisen = 0;
  const ornekler: string[] = [];
  const tl = (n: number | null) => (n ? `${n.toLocaleString("tr-TR")} TL` : "fiyat sorunuz");
  for (const [a, k] of y) {
    const o = e.get(a);
    if (!o) {
      yeniSayi++;
      if (ornekler.length < 12) ornekler.push(`Yeni: ${k.ad} (${tl(k.fiyat)})`);
    } else if (o.fiyat !== k.fiyat || (o.fiyat2 ?? null) !== (k.fiyat2 ?? null)) {
      degisen++;
      if (ornekler.length < 12) ornekler.push(`${k.ad}: ${tl(o.fiyat)} → ${tl(k.fiyat)}`);
    }
  }
  const cikan = [...e.keys()].filter((a) => !y.has(a)).length;
  return { yeni: yeniSayi, cikan, degisen, ornekler };
}

async function durumYaz(listeId: string | null, durum: KaynakDurum) {
  if (!listeId) return;
  await prisma.fiyatListesi.update({ where: { id: listeId }, data: { kaynakDurum: JSON.stringify(durum) } }).catch(() => null);
}

async function bildir(konu: string, satirlar: string[]) {
  await epostaGonder({
    konu,
    icerikHtml: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:16px;color:#334155">
      <h2 style="color:#0f766e;margin:0 0 12px">${konu.replace(/</g, "&lt;")}</h2>
      ${satirlar.map((s) => `<p style="margin:4px 0;font-size:13px">${s.replace(/</g, "&lt;")}</p>`).join("")}
      <p style="margin-top:18px"><a href="https://iklimofisi.com/panel/fiyat-listeleri" style="background:#0f766e;color:#fff;padding:9px 16px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:bold">Fiyat listelerini aç</a></p>
    </div>`,
  }).catch(() => null);
}

export async function kayaListesiniGuncelle(opt: { zorla?: boolean; tetikleyen: string }): Promise<GuncellemeSonucu> {
  const simdi = new Date().toISOString();
  const liste = await prisma.fiyatListesi.findFirst({
    where: { kaynak: KAYA_KAYNAK },
    orderBy: { createdAt: "asc" },
    include: { kalemler: { select: { bolum: true, ad: true, fiyat: true, fiyat2: true } } },
  });
  const durum = kaynakDurumOku(liste?.kaynakDurum);
  durum.sonKontrol = simdi;

  const hata = async (mesaj: string): Promise<GuncellemeSonucu> => {
    const ilkKez = durum.hata?.mesaj !== mesaj; // aynı hata her gün e-posta yağdırmasın
    durum.hata = { mesaj, zaman: simdi };
    await durumYaz(liste?.id ?? null, durum);
    if (ilkKez)
      await bildir("Kaya fiyat listesi GÜNCELLENEMEDİ", [
        mesaj,
        liste ? "Mevcut liste olduğu gibi korundu; müşteriye eski fiyatlar gider." : "Liste henüz oluşturulamadı.",
        `Çalıştıran: ${opt.tetikleyen}`,
      ]);
    return { durum: "HATA", mesaj, listeId: liste?.id ?? null };
  };

  // 1) Sayfadan PDF bağlantısı
  let pdfUrl: string | null;
  try {
    const r = await getir(KAYA_SAYFA, 20000);
    if (!r.ok) return hata(`Kaya fiyat listesi sayfası açılamadı (HTTP ${r.status}).`);
    pdfUrl = pdfBaglantisiBul(await r.text(), r.url || KAYA_SAYFA);
  } catch (e) {
    return hata(`Kaya fiyat listesi sayfasına ulaşılamadı: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (!pdfUrl) return hata("Kaya sayfasında 'Kaya İklimlendirme' fiyat listesi PDF'i bulunamadı (sayfa düzeni değişmiş olabilir).");

  // 2) Kaya yeni liste koymadıysa bir şey yapılmaz
  if (!opt.zorla && liste && durum.pdfUrl === pdfUrl && !durum.hata) {
    await durumYaz(liste.id, durum);
    return { durum: "AYNI", mesaj: "Kaya yeni liste yayınlamamış; liste günceldir.", listeId: liste.id };
  }

  // 3) PDF'i indir ve oku
  let satirlar: string[];
  try {
    const r = await getir(pdfUrl, 40000);
    if (!r.ok) return hata(`PDF indirilemedi (HTTP ${r.status}): ${pdfUrl}`);
    const pdf = Buffer.from(await r.arrayBuffer());
    if (pdf.length > 25 * 1024 * 1024) return hata("PDF çok büyük (25 MB üstü).");
    if (pdf.subarray(0, 5).toString("latin1") !== "%PDF-") return hata("İndirilen dosya PDF değil.");
    satirlar = await pdfSatirlari(pdf);
  } catch (e) {
    return hata(`PDF okunamadı: ${e instanceof Error ? e.message : String(e)}`);
  }
  const a = kayaAyristir(satirlar);
  const fiyatli = a.kalemler.filter((k) => k.nakit || k.kart).length;
  if (a.kalemler.length < EN_AZ_URUN || fiyatli < a.kalemler.length * EN_AZ_FIYATLI_ORAN)
    return hata(
      `PDF beklenen biçimde okunamadı (${a.kalemler.length} ürün, ${fiyatli} fiyatlı). Kaya dosya düzenini değiştirmiş olabilir; liste güncellenmedi.`
    );

  // 4) Listeyi yenile (ürünler tek seferde değişir; yarım kalmaz)
  const yeni = kalemlereCevir(a.kalemler);
  const ozet = degisiklikOzeti(liste?.kalemler ?? [], yeni);
  const yeniDurum: KaynakDurum = {
    pdfUrl,
    pdfAdi: decodeURIComponent(pdfUrl.split("/").pop() || ""),
    listeTarihi: a.gecerlilik ?? dosyaTarihi(pdfUrl),
    sonKontrol: simdi,
    sonGuncelleme: simdi,
    urunSayisi: yeni.length,
    fiyatSorunuz: yeni.filter((k) => !k.fiyat && !k.fiyat2).length,
    ozet: liste ? ozet : null,
    hata: null,
    atlanan: a.atlanan.slice(0, 40),
  };
  let listeId: string;
  if (liste) {
    listeId = liste.id;
    await prisma.$transaction([
      prisma.fiyatListesiKalem.deleteMany({ where: { listeId } }),
      prisma.fiyatListesiKalem.createMany({
        data: yeni.map((k, sira) => ({ listeId, sira, bolum: k.bolum, ad: k.ad, aciklama: k.aciklama, birim: "Adet", fiyat: k.fiyat, fiyat2: k.fiyat2 })),
      }),
      prisma.fiyatListesi.update({ where: { id: listeId }, data: { kaynakDurum: JSON.stringify(yeniDurum), updatedAt: new Date() } }),
    ]);
  } else {
    const l = await prisma.fiyatListesi.create({
      data: {
        baslik: KAYA_VARSAYILAN_BASLIK,
        paraBirimi: "TRY",
        kdvDahil: true,
        fiyatGoster: true,
        duzen: "TABLO",
        fiyatBaslik: "Nakit",
        fiyat2Baslik: "Kart",
        kaynak: KAYA_KAYNAK,
        kaynakDurum: JSON.stringify(yeniDurum),
        olusturanAdi: "Otomatik (Kaya İklimlendirme)",
        kalemler: { create: yeni.map((k, sira) => ({ sira, bolum: k.bolum, ad: k.ad, aciklama: k.aciklama, birim: "Adet", fiyat: k.fiyat, fiyat2: k.fiyat2 })) },
      },
      select: { id: true },
    });
    listeId = l.id;
  }
  await prisma.islemKaydi
    .create({
      data: {
        kullaniciAd: opt.tetikleyen,
        islem: "kayaFiyatListesiGuncellendi",
        hedefId: listeId,
        veri: JSON.stringify({ pdfUrl, urunSayisi: yeni.length, ...ozet }),
      },
    })
    .catch(() => null);

  const tarihMetni = yeniDurum.listeTarihi ? yeniDurum.listeTarihi.split("-").reverse().join(".") : "-";
  await bildir(liste ? "Kaya fiyat listesi güncellendi" : "Kaya fiyat listesi oluşturuldu", [
    `Kaya liste tarihi: ${tarihMetni} · ${yeni.length} ürün (${yeniDurum.fiyatSorunuz} ürün "fiyat sorunuz").`,
    ...(liste ? [`Fiyatı değişen: ${ozet.degisen} · yeni ürün: ${ozet.yeni} · listeden çıkan: ${ozet.cikan}.`, ...ozet.ornekler] : []),
    `Nakit ve kart fiyatlarına %5 eklendi.`,
  ]);
  return {
    durum: "GUNCELLENDI",
    mesaj: liste
      ? `Liste güncellendi: ${yeni.length} ürün · ${ozet.degisen} fiyat değişti · ${ozet.yeni} yeni · ${ozet.cikan} çıkan.`
      : `Liste oluşturuldu: ${yeni.length} ürün.`,
    listeId,
  };
}
