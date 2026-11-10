"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { girisZorunlu } from "@/lib/oturum";
import { islemKaydet } from "@/lib/islem-kaydi";
import { musterisizMi } from "@/lib/musterisiz";
import { musterisizKaydiHazirla } from "@/lib/musterisiz-sunucu";
import { veriOku, varsayilanVeri, ornekDaire } from "@/lib/isi-hesap/tipler";
import { aktifPompaModelleri } from "@/lib/isi-hesap/modeller-db";
import { sistemiHesapla } from "@/lib/isi-hesap/hesap";
import { ILLER } from "@/lib/isi-hesap/iklim";
import { onerileriBul, ihtiyacBul, sade, type Ihtiyac, type Oneri, type OneriAdayi } from "@/lib/isi-hesap/oneri";
import { getTcmbKurlari, type TcmbKurlari } from "@/lib/kur";

// -----------------------------------------------------------------------------
// ISI POMPASI HESABI — sunucu işlemleri
// Her işlem giriş kontrolü yapar ve İşlem Geçmişi'ne yazılır.
// -----------------------------------------------------------------------------

async function yetki(islem: string, girdi?: FormData | Record<string, unknown>) {
  const kullanici = await girisZorunlu();
  await islemKaydet(kullanici, islem, girdi);
  return kullanici;
}

const metinAl = (v: unknown, maks = 200) => (typeof v === "string" ? v.trim().slice(0, maks) : "");

function sayiAl(v: unknown, varsayilan: number | null = null): number | null {
  if (v === null || v === undefined) return varsayilan;
  const t = String(v).replace(",", ".").trim();
  if (!t) return varsayilan;
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : varsayilan;
}

// Hesabın kendisi müşterisiz teklif sistem kaydına bağlanmaz
async function musteriDogrula(id: string): Promise<string | null> {
  if (!id || musterisizMi(id)) return null;
  const m = await prisma.musteri.findUnique({ where: { id }, select: { id: true } });
  return m ? m.id : null;
}

// --- Hesaplar ---------------------------------------------------------------

export async function isiHesapOlustur(formData: FormData) {
  const kullanici = await yetki("isiHesapOlustur", formData);
  const ad = metinAl(formData.get("ad"), 200);
  if (!ad) redirect("/panel/isi-hesabi?mesaj=isi-hesap-eksik");
  const il = ILLER.some((i) => i.ad === formData.get("il")) ? String(formData.get("il")) : "İstanbul";
  const musteriId = await musteriDogrula(metinAl(formData.get("musteriId"), 40));
  const veri = varsayilanVeri(il);
  if (formData.get("sablon") === "ornek") veri.odalar = ornekDaire();
  const hesap = await prisma.isiHesap.create({
    data: {
      ad,
      il,
      musteriId,
      veri: JSON.stringify(veri),
      toplamKw: sistemiHesapla(veri).tasarimYuku / 1000,
      olusturanKullaniciId: kullanici?.id ?? null,
      olusturanAdi: kullanici?.ad ?? "",
    },
    select: { id: true },
  });
  revalidatePath("/panel/isi-hesabi");
  redirect(`/panel/isi-hesabi/${hesap.id}`);
}

export type KayitSonucu = { ok: true; zaman: string } | { ok: false; hata: string };

// Düzenleme ekranından (sayfa yenilenmeden) çağrılır
export async function isiHesapKaydet(girdi: { id: string; ad: string; musteriId: string; veri: string }): Promise<KayitSonucu> {
  const id = metinAl(girdi?.id, 40);
  const ad = metinAl(girdi?.ad, 200);
  const hamVeri = typeof girdi?.veri === "string" ? girdi.veri : "";
  await yetki("isiHesapKaydet", { id, ad, musteriId: metinAl(girdi?.musteriId, 40), veriBoyutu: hamVeri.length });
  if (!id) return { ok: false, hata: "Hesap bulunamadı." };
  if (!ad) return { ok: false, hata: "Hesap adı boş olamaz." };
  if (hamVeri.length > 600_000) return { ok: false, hata: "Hesap çok büyük (oda / eleman sayısını azaltın)." };
  const mevcut = await prisma.isiHesap.findUnique({ where: { id }, select: { id: true } });
  if (!mevcut) return { ok: false, hata: "Hesap bulunamadı (silinmiş olabilir)." };
  const veri = veriOku(hamVeri);
  const musteriId = await musteriDogrula(metinAl(girdi?.musteriId, 40));
  try {
    await prisma.isiHesap.update({
      where: { id },
      data: { ad, musteriId, il: veri.il, veri: JSON.stringify(veri), toplamKw: sistemiHesapla(veri).tasarimYuku / 1000 },
    });
  } catch (hata) {
    console.error("[isiHesapKaydet]", hata);
    return { ok: false, hata: "Kayıt sırasında hata oluştu; tekrar deneyin." };
  }
  revalidatePath("/panel/isi-hesabi");
  return { ok: true, zaman: new Date().toISOString() };
}

export async function isiHesapKopyala(id: string) {
  const kullanici = await yetki("isiHesapKopyala", { id });
  const kaynak = await prisma.isiHesap.findUnique({ where: { id } });
  if (!kaynak) return;
  const yeni = await prisma.isiHesap.create({
    data: {
      ad: `${kaynak.ad} (kopya)`.slice(0, 200),
      il: kaynak.il,
      musteriId: kaynak.musteriId,
      veri: kaynak.veri,
      toplamKw: kaynak.toplamKw,
      olusturanKullaniciId: kullanici?.id ?? null,
      olusturanAdi: kullanici?.ad ?? "",
    },
    select: { id: true },
  });
  revalidatePath("/panel/isi-hesabi");
  redirect(`/panel/isi-hesabi/${yeni.id}?mesaj=isi-hesap-kopyalandi`);
}

export async function isiHesapSil(id: string) {
  await yetki("isiHesapSil", { id });
  await prisma.isiHesap.delete({ where: { id } });
  revalidatePath("/panel/isi-hesabi");
}

// --- Malzeme için ürün önerisi (Ürün Kataloğu + fiyat listeleri) -------------

// Öneri havuzu: katalogdaki ürünler ve tüm fiyat listelerinin satırları
async function oneriHavuzu(): Promise<OneriAdayi[]> {
  const [urunler, satirlar] = await Promise.all([
    prisma.urun.findMany({
      select: { id: true, kod: true, ad: true, listeFiyati: true, paraBirimi: true, marka: { select: { ad: true } } },
    }),
    prisma.fiyatListesiKalem.findMany({
      select: {
        id: true,
        ad: true,
        kod: true,
        marka: true,
        fiyat: true,
        urunId: true,
        liste: { select: { baslik: true, paraBirimi: true, kdvDahil: true } },
      },
    }),
  ]);
  return [
    ...urunler.map(
      (u): OneriAdayi => ({
        kaynak: "URUN",
        id: u.id,
        ad: u.ad,
        kod: u.kod || null,
        marka: u.marka?.ad ?? null,
        fiyat: Number.isFinite(u.listeFiyati) && u.listeFiyati > 0 ? u.listeFiyati : 0,
        paraBirimi: u.paraBirimi || "TRY",
        kdvDahil: false,
        listeAdi: null,
        urunId: u.id,
      })
    ),
    ...satirlar.map(
      (s): OneriAdayi => ({
        kaynak: "LISTE",
        id: s.id,
        ad: s.ad,
        kod: s.kod || null,
        marka: s.marka || null,
        fiyat: Number.isFinite(s.fiyat) && s.fiyat > 0 ? s.fiyat : 0,
        paraBirimi: s.liste.paraBirimi || "TRY",
        kdvDahil: s.liste.kdvDahil,
        listeAdi: s.liste.baslik,
        urunId: s.urunId,
      })
    ),
  ];
}

export type OneriSonucu =
  | { ok: true; satirlar: { aciklama: string; ihtiyac: Ihtiyac | null; oneriler: Oneri[] }[]; kurlar: TcmbKurlari | null }
  | { ok: false; hata: string };

// Düzenleme ekranının Malzeme sekmesinden çağrılır (yalnız okur, hiçbir şey kaydetmez)
export async function isiHesapOnerileri(malzemeler: { aciklama: string; urunId?: string | null }[]): Promise<OneriSonucu> {
  await girisZorunlu();
  if (!Array.isArray(malzemeler) || malzemeler.length > 400) return { ok: false, hata: "Malzeme listesi okunamadı." };
  const liste = malzemeler.map((m) => ({ aciklama: metinAl(m?.aciklama, 500), urunId: metinAl(m?.urunId, 40) || null }));
  try {
    const [havuz, kurlar] = await Promise.all([oneriHavuzu(), getTcmbKurlari()]);
    const sonuc = onerileriBul(liste, havuz);
    return { ok: true, satirlar: sonuc.map((s, i) => ({ aciklama: liste[i].aciklama, ...s })), kurlar };
  } catch (hata) {
    console.error("[isiHesapOnerileri]", hata);
    return { ok: false, hata: "Ürün önerileri alınamadı; sayfayı yenileyip tekrar deneyin." };
  }
}

// Teklife aktarılan önerilen ürünün fiyatı teklifin para birimine çevrilir (TCMB efektif satış).
// KDV dahil listelerden gelen fiyat KDV hariç yapılır (%20). Çevrilemezse null.
function teklifFiyati(o: OneriAdayi, paraBirimi: string, kurlar: TcmbKurlari | null): number | null {
  if (!(o.fiyat > 0)) return 0;
  const net = o.kdvDahil ? o.fiyat / 1.2 : o.fiyat;
  const tl = (pb: string): number | null => (pb === "TRY" ? 1 : kurlar ? ((kurlar as Record<string, unknown>)[pb] as number | undefined) ?? null : null);
  if (o.paraBirimi === paraBirimi) return Math.round(net * 100) / 100;
  const k1 = tl(o.paraBirimi);
  const k2 = tl(paraBirimi);
  if (!k1 || !k2) return null;
  return Math.round(((net * k1) / k2) * 100) / 100;
}

// Hesabın malzeme listesinden yeni teklif taslağı oluşturur (fiyatlar teklifte girilir)
export async function isiHesapTeklifeAktar(formData: FormData) {
  const kullanici = await yetki("isiHesapTeklifeAktar", formData);
  const hesapId = metinAl(formData.get("hesapId"), 40);
  const musteriHam = metinAl(formData.get("musteriId"), 40);
  // "Müşterisiz teklif" seçilebilir; teklif daha sonra teklif sayfasından müşteriye bağlanır
  if (musterisizMi(musteriHam)) await musterisizKaydiHazirla();
  const musteriId = musterisizMi(musteriHam) ? musteriHam : await musteriDogrula(musteriHam);
  const baslik = metinAl(formData.get("baslik"), 200);
  if (!hesapId) return;
  if (!musteriId || !baslik) redirect(`/panel/isi-hesabi/${hesapId}?mesaj=isi-hesap-teklif-eksik`);
  const hesap = await prisma.isiHesap.findUnique({ where: { id: hesapId } });
  if (!hesap) redirect("/panel/isi-hesabi");

  const veri = veriOku(hesap.veri);
  const sonuc = sistemiHesapla(veri, await aktifPompaModelleri());
  if (!sonuc.malzemeler.length) redirect(`/panel/isi-hesabi/${hesapId}?mesaj=isi-hesap-teklif-eksik`);

  // Isı pompası ürün kataloğuna bağlıysa fiyatı ve markası teklife gelir
  const urunIdleri = Array.from(new Set(sonuc.malzemeler.map((m) => m.urunId).filter(Boolean))) as string[];
  const urunler = urunIdleri.length
    ? await prisma.urun.findMany({ where: { id: { in: urunIdleri } }, select: { id: true, listeFiyati: true, paraBirimi: true, markaId: true } })
    : [];
  const urunMap = new Map(urunler.map((u) => [u.id, u]));

  // Malzeme sekmesinde seçilen önerilen ürünler: [{ i: sıra, a: malzeme açıklaması, s: "URUN:id" | "LISTE:id" | "" }]
  // Yalnız aynı sıradaki açıklama tutuyorsa kullanılır (hesap değiştiyse eski seçim uygulanmaz).
  // "BOS": teklif yalnız bölüm başlıklarıyla açılır (her bölümde bir boş satır), kalemleri kullanıcı doldurur
  const bos = formData.get("aktarim") === "BOS";
  const secilen = new Map<number, OneriAdayi>();
  try {
    const ham = bos ? [] : JSON.parse(String(formData.get("secimler") ?? "[]"));
    const istek = (Array.isArray(ham) ? ham : [])
      .slice(0, 400)
      .map((x) => ({ i: Number(x?.i), a: metinAl(x?.a, 500), s: metinAl(x?.s, 60) }))
      .filter((x) => Number.isInteger(x.i) && x.i >= 0 && x.i < sonuc.malzemeler.length && x.s && x.a === sonuc.malzemeler[x.i].aciklama.slice(0, 500));
    if (istek.length) {
      const havuz = await oneriHavuzu();
      const bul = new Map(havuz.map((a) => [`${a.kaynak}:${a.id}`, a]));
      for (const x of istek) {
        const a = bul.get(x.s);
        if (a) secilen.set(x.i, a);
      }
    }
  } catch {
    // Seçim okunamazsa teklif eski hâliyle (genel açıklamalarla) oluşturulur
  }

  // Teklifin para birimi: seçilen ısı pompasının (yoksa seçilen ürünlerde en çok geçen) para birimi
  const fiyatlilar = [...secilen.values()].filter((a) => a.fiyat > 0);
  const sayac = new Map<string, number>();
  for (const a of fiyatlilar) sayac.set(a.paraBirimi, (sayac.get(a.paraBirimi) ?? 0) + 1);
  const pompaSecimi = sonuc.malzemeler.findIndex((m) => !!m.urunId || ihtiyacBul(m)?.tur === "ISI_POMPASI");
  const pompaUrunu = pompaSecimi >= 0 ? secilen.get(pompaSecimi) : undefined;
  const paraBirimi =
    (pompaUrunu && pompaUrunu.fiyat > 0 ? pompaUrunu.paraBirimi : null) ??
    ([...sayac.entries()].sort((x, y) => y[1] - x[1])[0]?.[0] ||
      urunler[0]?.paraBirimi ||
      "TRY");
  const kurlar =
    fiyatlilar.some((a) => a.paraBirimi !== paraBirimi) || urunler.some((u) => u.paraBirimi !== paraBirimi) ? await getTcmbKurlari() : null;

  // Marka adı → panel markası (teklifte marka sütunu / logosu için)
  const markalar = secilen.size ? await prisma.marka.findMany({ select: { id: true, ad: true } }) : [];
  const markaBul = (ad: string | null) => (ad ? markalar.find((x) => sade(x.ad) === sade(ad))?.id ?? null : null);
  const urunMarka = new Map<string, string | null>();
  const secilenUrunIdleri = [...secilen.values()].map((a) => a.urunId).filter((x): x is string => !!x);
  if (secilenUrunIdleri.length) {
    for (const u of await prisma.urun.findMany({ where: { id: { in: secilenUrunIdleri } }, select: { id: true, markaId: true } })) urunMarka.set(u.id, u.markaId);
  }
  const para = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const kalemler = sonuc.malzemeler.map((m, sira) => {
    const birim = (m.birim || "Adet").slice(0, 20);
    const o = secilen.get(sira);
    if (o) {
      const markaId = (o.urunId ? urunMarka.get(o.urunId) : null) ?? markaBul(o.marka);
      const adSade = sade(o.ad);
      const markaEk = !markaId && o.marka && !adSade.includes(sade(o.marka)) ? `${o.marka} ` : "";
      const kodEk = o.kod && !adSade.includes(sade(o.kod)) ? ` — ${o.kod}` : "";
      const fiyat = teklifFiyati(o, paraBirimi, kurlar);
      const fiyatNotu = fiyat === null ? ` [liste fiyatı: ${para(o.fiyat)} ${o.paraBirimi}${o.kdvDahil ? " KDV dahil" : ""}]` : "";
      return {
        bolum: m.bolum,
        aciklama: `${markaEk}${o.ad}${kodEk}${fiyatNotu}`.slice(0, 500),
        adet: m.adet,
        birim,
        birimFiyat: fiyat ?? 0,
        markaId,
        sira,
      };
    }
    const u = m.urunId ? urunMap.get(m.urunId) : undefined;
    return {
      bolum: m.bolum,
      aciklama: m.aciklama.slice(0, 500),
      adet: m.adet,
      birim,
      birimFiyat: u ? teklifFiyati({ kaynak: "URUN", id: u.id, ad: "", kod: null, marka: null, fiyat: u.listeFiyati, paraBirimi: u.paraBirimi, kdvDahil: false, listeAdi: null, urunId: u.id }, paraBirimi, kurlar) ?? 0 : 0,
      markaId: u?.markaId ?? null,
      sira,
    };
  });

  const simdi = new Date();
  const teklif = await prisma.teklif.create({
    data: {
      baslik,
      musteriId,
      paraBirimi,
      olusturanKullaniciId: kullanici?.id || null,
      olusturanAdi: kullanici?.ad ?? "",
      tarih: simdi,
      ilkTarih: simdi,
      kalemler: {
        create: bos
          ? [...new Set(sonuc.malzemeler.map((m) => m.bolum))].map((bolum, sira) => ({
              bolum,
              aciklama: "",
              adet: 1,
              birim: "Adet",
              birimFiyat: 0,
              markaId: null,
              sira,
            }))
          : kalemler,
      },
    },
    select: { id: true },
  });
  await prisma.isiHesap.update({ where: { id: hesapId }, data: { teklifId: teklif.id, ...(musteriId && !musterisizMi(musteriId) ? { musteriId } : {}) } });
  revalidatePath("/panel/teklifler");
  revalidatePath("/panel/isi-hesabi");
  redirect(`/panel/teklifler/${teklif.id}/duzenle?mesaj=isi-hesap-teklif`);
}

// --- Isı pompası model kataloğu --------------------------------------------

export async function isiPompasiModeliKaydet(formData: FormData) {
  await yetki("isiPompasiModeliKaydet", formData);
  const id = metinAl(formData.get("id"), 40);
  const marka = metinAl(formData.get("marka"), 80);
  const model = metinAl(formData.get("model"), 120);
  const a7 = sayiAl(formData.get("kapA7W35"));
  const m7 = sayiAl(formData.get("kapAm7W35"));
  const m755 = sayiAl(formData.get("kapAm7W55"));
  const m15 = sayiAl(formData.get("kapAm15W35"));
  const gecerli = (x: number | null, min: number, maks: number) => x !== null && x >= min && x <= maks;
  if (!marka || !model || !gecerli(a7, 0.5, 500) || !gecerli(m7, 0.3, 500) || !gecerli(m755, 0.3, 500) || (m15 !== null && !gecerli(m15, 0.1, 500))) {
    redirect("/panel/isi-hesabi/modeller?mesaj=isi-modeli-eksik");
  }
  const urunHam = metinAl(formData.get("urunId"), 40);
  const urunId = urunHam ? (await prisma.urun.findUnique({ where: { id: urunHam }, select: { id: true } }))?.id ?? null : null;
  const veri = {
    marka,
    model,
    kapA7W35: a7!,
    kapAm7W35: m7!,
    kapAm7W55: m755!,
    kapAm15W35: m15,
    minDisSicaklik: Math.min(15, Math.max(-40, sayiAl(formData.get("minDisSicaklik"), -20)!)),
    maksCikis: Math.min(90, Math.max(30, sayiAl(formData.get("maksCikis"), 60)!)),
    yedekIsiticiKw: Math.min(100, Math.max(0, sayiAl(formData.get("yedekIsiticiKw"), 0)!)),
    urunId,
    aciklama: metinAl(formData.get("aciklama"), 500) || null,
    aktif: formData.get("aktif") !== "hayir",
  };
  if (id) await prisma.isiPompasiModeli.update({ where: { id }, data: veri });
  else await prisma.isiPompasiModeli.create({ data: veri });
  revalidatePath("/panel/isi-hesabi/modeller");
  redirect("/panel/isi-hesabi/modeller?mesaj=kaydedildi");
}

export async function isiPompasiModeliSil(id: string) {
  await yetki("isiPompasiModeliSil", { id });
  await prisma.isiPompasiModeli.delete({ where: { id } });
  revalidatePath("/panel/isi-hesabi/modeller");
}
