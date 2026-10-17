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
  type KayaDegisiklik,
  yuzdeFark,
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
  // Aynı ad iki kez geçerse karışmasın diye anahtara sıra numarası eklenir
  const anahtarla = <T extends { bolum: string; ad: string }>(liste: T[]) => {
    const say = new Map<string, number>();
    const m = new Map<string, T>();
    for (const k of liste) {
      const a = urunAnahtari(k.bolum, k.ad);
      const n = (say.get(a) ?? 0) + 1;
      say.set(a, n);
      m.set(n > 1 ? `${a}#${n}` : a, k);
    }
    return m;
  };
  const e = anahtarla(eski);
  const y = anahtarla(yeni);
  const f = (n: number | null | undefined) => (n && n > 0 ? n : null);
  const degisiklikler: KayaDegisiklik[] = [];
  for (const [a, k] of y) {
    const o = e.get(a);
    if (!o) degisiklikler.push({ tur: "YENI", bolum: k.bolum, ad: k.ad, eski: null, eski2: null, yeni: f(k.fiyat), yeni2: f(k.fiyat2) });
    else if (f(o.fiyat) !== f(k.fiyat) || f(o.fiyat2) !== f(k.fiyat2))
      degisiklikler.push({ tur: "DEGISEN", bolum: k.bolum, ad: k.ad, eski: f(o.fiyat), eski2: f(o.fiyat2), yeni: f(k.fiyat), yeni2: f(k.fiyat2) });
  }
  for (const [a, o] of e)
    if (!y.has(a)) degisiklikler.push({ tur: "CIKAN", bolum: o.bolum, ad: o.ad, eski: f(o.fiyat), eski2: f(o.fiyat2), yeni: null, yeni2: null });
  const tl = (n: number | null) => (n ? `${n.toLocaleString("tr-TR")} TL` : "fiyat sorunuz");
  const say = (t: KayaDegisiklik["tur"]) => degisiklikler.filter((d) => d.tur === t).length;
  return {
    yeni: say("YENI"),
    cikan: say("CIKAN"),
    degisen: say("DEGISEN"),
    // kısa örnekler (eski kayıtlarla uyum için)
    ornekler: degisiklikler.slice(0, 12).map((d) =>
      d.tur === "YENI" ? `Yeni: ${d.ad} (${tl(d.yeni)})` : d.tur === "CIKAN" ? `Çıktı: ${d.ad}` : `${d.ad}: ${tl(d.eski)} → ${tl(d.yeni)}`
    ),
    degisiklikler,
  };
}

async function durumYaz(listeId: string | null, durum: KaynakDurum) {
  if (!listeId) return;
  await prisma.fiyatListesi.update({ where: { id: listeId }, data: { kaynakDurum: JSON.stringify(durum) } }).catch(() => null);
}

async function bildir(konu: string, satirlar: string[], ekHtml = "") {
  await epostaGonder({
    konu,
    icerikHtml: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:16px;color:#334155">
      <h2 style="color:#0f766e;margin:0 0 12px">${konu.replace(/</g, "&lt;")}</h2>
      ${satirlar.filter(Boolean).map((s) => `<p style="margin:4px 0;font-size:13px">${s.replace(/</g, "&lt;")}</p>`).join("")}
      ${ekHtml}
      <p style="margin-top:18px"><a href="https://iklimofisi.com/panel/fiyat-listeleri" style="background:#0f766e;color:#fff;padding:9px 16px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:bold">Fiyat listelerini aç</a></p>
    </div>`,
  }).catch(() => null);
}

// otomatik: sabah kontrolü (Vercel cron). Yalnız o zaman "değişiklik yok" e-postası gider.
export async function kayaListesiniGuncelle(opt: { zorla?: boolean; tetikleyen: string; otomatik?: boolean }): Promise<GuncellemeSonucu> {
  const simdi = new Date().toISOString();
  const liste = await prisma.fiyatListesi.findFirst({
    where: { kaynak: KAYA_KAYNAK },
    orderBy: { createdAt: "asc" },
    include: { kalemler: { orderBy: { sira: "asc" }, select: { bolum: true, ad: true, aciklama: true, fiyat: true, fiyat2: true } } },
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
    await degisiklikYokBildir(durum, opt, false);
    await durumYaz(liste.id, durum);
    return { durum: "AYNI", mesaj: "Kaya yeni liste yayınlamamış; fiyatlarda değişiklik yok.", listeId: liste.id };
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

  // 4) Değişiklik var mı?
  const yeni = kalemlereCevir(a.kalemler);
  const ozet = degisiklikOzeti(liste?.kalemler ?? [], yeni);
  const fiyatDegisti = ozet.degisiklikler.length > 0;
  const fiyatSorunuz = yeni.filter((k) => !k.fiyat && !k.fiyat2).length;
  const listeTarihi = a.gecerlilik ?? dosyaTarihi(pdfUrl) ?? durum.listeTarihi;
  const yeniDosya = durum.pdfUrl !== pdfUrl;

  // Fiyatlar aynı: kayıtlı ürünlere dokunulmaz (sıra ve açıklamalar da aynıysa), yalnız durum yazılır
  const ayniIcerik =
    !!liste &&
    !fiyatDegisti &&
    liste.kalemler.length === yeni.length &&
    liste.kalemler.every((k, i) => urunAnahtari(k.bolum, k.ad) === urunAnahtari(yeni[i].bolum, yeni[i].ad) && (k.aciklama ?? null) === (yeni[i].aciklama ?? null));
  if (liste && !fiyatDegisti) {
    durum.pdfUrl = pdfUrl;
    durum.pdfAdi = decodeURIComponent(pdfUrl.split("/").pop() || "");
    durum.listeTarihi = listeTarihi;
    durum.urunSayisi = yeni.length;
    durum.fiyatSorunuz = fiyatSorunuz;
    durum.hata = null;
    durum.atlanan = a.atlanan.slice(0, 40);
    if (!ayniIcerik) {
      // Fiyat aynı ama sıra / not değişmiş: ürünler sessizce yenilenir, fiyat değişikliği sayılmaz
      durum.sonGuncelleme = simdi;
      await prisma.$transaction([
        prisma.fiyatListesiKalem.deleteMany({ where: { listeId: liste.id } }),
        prisma.fiyatListesiKalem.createMany({
          data: yeni.map((k, sira) => ({ listeId: liste.id, sira, bolum: k.bolum, ad: k.ad, aciklama: k.aciklama, birim: "Adet", fiyat: k.fiyat, fiyat2: k.fiyat2 })),
        }),
        prisma.fiyatListesi.update({ where: { id: liste.id }, data: { kaynakDurum: JSON.stringify(durum) } }),
      ]);
    }
    await degisiklikYokBildir(durum, opt, yeniDosya);
    await durumYaz(liste.id, durum);
    return {
      durum: "AYNI",
      mesaj: yeniDosya ? "Kaya yeni liste dosyası yayınlamış ama fiyatlar aynı; değişiklik yok." : "Kaya'nın listesi okundu; fiyatlarda değişiklik yok.",
      listeId: liste.id,
    };
  }

  // 5) Fiyatlar değişti (ya da liste ilk kez oluşuyor): ürünler tek seferde yenilenir; yarım kalmaz
  const yeniDurum: KaynakDurum = {
    ...durum,
    pdfUrl,
    pdfAdi: decodeURIComponent(pdfUrl.split("/").pop() || ""),
    listeTarihi,
    sonKontrol: simdi,
    sonGuncelleme: simdi,
    urunSayisi: yeni.length,
    fiyatSorunuz,
    ozet: liste ? { yeni: ozet.yeni, cikan: ozet.cikan, degisen: ozet.degisen, ornekler: ozet.ornekler } : null,
    hata: null,
    atlanan: a.atlanan.slice(0, 40),
    degisiklikler: liste ? ozet.degisiklikler : [],
    degisiklikTarihi: liste ? simdi : null,
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
        veri: JSON.stringify({ pdfUrl, urunSayisi: yeni.length, yeni: ozet.yeni, cikan: ozet.cikan, degisen: ozet.degisen, ornekler: ozet.ornekler }),
      },
    })
    .catch(() => null);

  const tarihMetni = listeTarihi ? listeTarihi.split("-").reverse().join(".") : "-";
  if (liste)
    await bildir(
      `Kaya fiyat listesi değişti (${ozet.degisen} fiyat değişti · ${ozet.yeni} yeni · ${ozet.cikan} çıkan)`,
      [
        `Kaya'nın ${tarihMetni} tarihli yeni listesi okundu; fiyat listemiz güncellendi (${yeni.length} ürün, nakit ve kart fiyatlarına %5 eklendi).`,
        `Aşağıdaki fiyatlar %5 eklenmiş, müşteriye giden fiyatlardır.`,
      ],
      degisiklikTablosu(ozet.degisiklikler)
    );
  else
    await bildir("Kaya fiyat listesi oluşturuldu", [
      `Kaya liste tarihi: ${tarihMetni} · ${yeni.length} ürün (${fiyatSorunuz} ürün "fiyat sorunuz").`,
      `Nakit ve kart fiyatlarına %5 eklendi. Bundan sonra her sabah kontrol edilir; fiyat değişince değişen ürünlerin tam listesi e-postayla gelir.`,
    ]);
  return {
    durum: "GUNCELLENDI",
    mesaj: liste
      ? `Liste güncellendi: ${yeni.length} ürün · ${ozet.degisen} fiyat değişti · ${ozet.yeni} yeni · ${ozet.cikan} çıkan.`
      : `Liste oluşturuldu: ${yeni.length} ürün.`,
    listeId,
  };
}

// "Değişiklik yok" e-postası (yalnız sabah otomatik kontrolünde; sıklık panelden seçilir)
const trBugun = (d = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(d); // YYYY-MM-DD
const trHaftaGunu = (d = new Date()) => new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Europe/Istanbul" }).format(d);
const trZaman = (iso: string) =>
  new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" }).format(
    new Date(iso)
  );
async function degisiklikYokBildir(durum: KaynakDurum, opt: { otomatik?: boolean }, yeniDosya: boolean) {
  if (!opt.otomatik) return; // elle "Şimdi güncelle" sonucu zaten ekranda görünür
  if (durum.bildirim === "KAPALI") return;
  if (durum.bildirim === "HAFTALIK" && trHaftaGunu() !== "Mon") return;
  const bugun = trBugun();
  if (durum.sonDegisiklikYokMail === bugun) return;
  durum.sonDegisiklikYokMail = bugun;
  const listeTarihi = durum.listeTarihi ? durum.listeTarihi.split("-").reverse().join(".") : "—";
  await bildir("Kaya fiyat listesi kontrol edildi — fiyat değişikliği yok", [
    yeniDosya
      ? `Kaya yeni bir liste dosyası yayınlamış (${listeTarihi}) ama fiyatlar aynı.`
      : `Kaya'nın listesi değişmedi; hâlâ ${listeTarihi} tarihli.`,
    `Kontrol zamanı: ${durum.sonKontrol ? trZaman(durum.sonKontrol) : "—"} · ${durum.urunSayisi} ürün.`,
    durum.degisiklikTarihi
      ? `Son fiyat değişikliği: ${trZaman(durum.degisiklikTarihi)}.`
      : durum.sonGuncelleme
        ? `Liste ${trZaman(durum.sonGuncelleme)} tarihinde oluşturulduğundan beri fiyat değişmedi.`
        : "",
    durum.bildirim === "HAFTALIK"
      ? "Bu e-posta haftada bir (pazartesi) gelir; fiyat değişince ayrıca hemen bildirilir."
      : "Bu e-posta her sabah gelir; sıklığını Fiyat Listeleri → Kaya listesi → ayarlardan değiştirebilirsiniz.",
  ]);
}

// Değişen / yeni / çıkan ürünlerin TAM listesi (e-posta için HTML tablo)
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function degisiklikTablosu(d: KayaDegisiklik[]) {
  if (!d.length) return "";
  const tl = (n: number | null) => (n ? `${n.toLocaleString("tr-TR")} TL` : "fiyat sorunuz");
  const fark = (e: number | null, y: number | null) => {
    const f = yuzdeFark(e, y);
    if (f === null) return "";
    const renk = f > 0 ? "#b45309" : "#0f766e";
    return ` <span style="color:${renk};font-weight:bold">(${f > 0 ? "+" : ""}${f.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}%)</span>`;
  };
  const td = "padding:5px 8px;border-bottom:1px solid #e2e8f0;font-size:12px;vertical-align:top";
  const grup = (baslik: string, satirlar: KayaDegisiklik[], hucre: (x: KayaDegisiklik) => string) =>
    satirlar.length
      ? `<h3 style="font-size:14px;margin:18px 0 6px;color:#0f172a">${baslik} (${satirlar.length})</h3>
<table style="border-collapse:collapse;width:100%"><tr style="background:#f1f5f9"><th style="${td};text-align:left">Ürün</th><th style="${td};text-align:right">Nakit</th><th style="${td};text-align:right">Kart</th></tr>
${satirlar.map((x) => `<tr><td style="${td}">${esc(x.ad)}<br><span style="color:#94a3b8;font-size:11px">${esc(x.bolum)}</span></td>${hucre(x)}</tr>`).join("\n")}</table>`
      : "";
  return [
    grup("Fiyatı değişen ürünler", d.filter((x) => x.tur === "DEGISEN"), (x) =>
      [
        [x.eski, x.yeni],
        [x.eski2, x.yeni2],
      ]
        .map(([e, y]) =>
          e === y
            ? `<td style="${td};text-align:right;white-space:nowrap">${tl(y)}</td>`
            : `<td style="${td};text-align:right;white-space:nowrap"><span style="color:#94a3b8;text-decoration:line-through">${tl(e)}</span><br><b>${tl(y)}</b>${fark(e, y)}</td>`
        )
        .join("")
    ),
    grup("Yeni eklenen ürünler", d.filter((x) => x.tur === "YENI"), (x) =>
      [x.yeni, x.yeni2].map((n) => `<td style="${td};text-align:right;white-space:nowrap">${tl(n)}</td>`).join("")
    ),
    grup("Listeden çıkan ürünler", d.filter((x) => x.tur === "CIKAN"), (x) =>
      [x.eski, x.eski2].map((n) => `<td style="${td};text-align:right;white-space:nowrap;color:#94a3b8">${tl(n)}</td>`).join("")
    ),
  ].join("");
}

