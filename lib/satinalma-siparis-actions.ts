"use server";

// -----------------------------------------------------------------------------
// SATINALMA SİPARİŞİ İŞLEMLERİ (Aşama 2 · satınalma zinciri)
// Tedarikçiye sipariş → onay (eşik) → mal kabul (stok girişi) → alış faturası (tedarikçi cari borcu).
// Hiçbir kayıt silinmez: sipariş ve mal kabul iptal edilir (kim, ne zaman, neden).
// Her işlem İşlem Geçmişi'ne yazılır.
// -----------------------------------------------------------------------------
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { girisZorunlu } from "@/lib/oturum";
import { islemKaydet } from "@/lib/islem-kaydi";
import { paraBirimiDogrula } from "@/lib/para";
import { tutarOku } from "@/lib/toplam-dagit";
import { birimNormal } from "@/lib/birimler";
import { kalemNet, yuvarla2, sasNo, teslimDurumu, teslimAlinan, malKabulAcikMi, sasTl } from "@/lib/satinalma-siparis";

export type SasSonuc = { hata?: string; tamam?: string; git?: string };

async function yetki(islem: string, girdi?: FormData | Record<string, unknown>) {
  const kullanici = await girisZorunlu();
  await islemKaydet(kullanici, islem, girdi);
  return kullanici;
}

const metin = (fd: FormData, ad: string, sinir = 300) => String(fd.get(ad) ?? "").trim().slice(0, sinir);
const tarihOku = (s: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

function yenile(id?: string, siparisId?: string | null) {
  revalidatePath("/panel/satinalma/siparisler");
  if (id) revalidatePath(`/panel/satinalma/siparisler/${id}`);
  if (siparisId) revalidatePath(`/panel/siparisler/${siparisId}`);
  revalidatePath("/panel/satinalma/cari");
  revalidatePath("/panel");
}

// Onay eşiği (TL, KDV hariç). Sütun henüz yoksa (SQL çalışmadıysa) boş sayılır.
async function onayEsigi(): Promise<number | null> {
  const a = await prisma.sirketAyarlari.findUnique({ where: { id: "default" }, select: { satinalmaOnayEsigi: true } }).catch(() => null);
  return a?.satinalmaOnayEsigi ?? null;
}

// Onaylı siparişin durumunu teslim alınan miktarlara göre günceller
async function teslimDurumunuGuncelle(id: string) {
  const s = await prisma.satinalmaSiparisi.findUnique({
    where: { id },
    select: {
      durum: true,
      kalemler: { select: { adet: true, malKabulKalemleri: { select: { miktar: true, malKabul: { select: { iptalTarihi: true } } } } } },
    },
  });
  if (!s || !["ONAYLANDI", "KISMEN_TESLIM", "TESLIM_ALINDI"].includes(s.durum)) return;
  const yeni = teslimDurumu(s.kalemler.map((k) => ({ adet: k.adet, alinan: teslimAlinan(k) })));
  if (yeni !== s.durum) await prisma.satinalmaSiparisi.update({ where: { id }, data: { durum: yeni } });
}

// --- SİPARİŞ AÇMA ---------------------------------------------------------------
export async function satinalmaSiparisiOlustur(fd: FormData): Promise<SasSonuc> {
  const giren = await yetki("satinalmaSiparisiOlustur", fd);
  const tedarikciId = metin(fd, "tedarikciId", 100);
  const baslik = metin(fd, "baslik", 200);
  const paraBirimi = paraBirimiDogrula(fd.get("paraBirimi"));
  const kurHam = tutarOku(metin(fd, "kur", 30));
  const kur = paraBirimi === "TRY" ? 1 : kurHam ?? 0;
  const siparisId = metin(fd, "siparisId", 100) || null;
  const projeId = metin(fd, "projeId", 100) || null;
  const satinalmaTeklifiId = metin(fd, "satinalmaTeklifiId", 100) || null;
  const beklenen = metin(fd, "beklenenTeslimTarihi", 10);
  const notlar = metin(fd, "notlar", 2000) || null;

  if (!tedarikciId) return { hata: "Tedarikçi seçin." };
  if (!baslik) return { hata: "Sipariş başlığını yazın." };
  if (paraBirimi !== "TRY" && !(kur > 0)) return { hata: `1 ${paraBirimi} kaç TL? Kuru yazın.` };
  const beklenenTarih = beklenen ? tarihOku(beklenen) : null;
  if (beklenen && !beklenenTarih) return { hata: "Beklenen teslim tarihi anlaşılamadı." };

  // Kalemler
  const kodlar = fd.getAll("kalemKod").map((x) => String(x).trim().slice(0, 100));
  const aciklamalar = fd.getAll("kalemAciklama").map((x) => String(x).trim().slice(0, 500));
  const adetler = fd.getAll("kalemAdet").map((x) => String(x));
  const birimler = fd.getAll("kalemBirim").map((x) => String(x));
  const fiyatlar = fd.getAll("kalemFiyat").map((x) => String(x));
  const iskontolar = fd.getAll("kalemIskonto").map((x) => String(x));
  const bolumler = fd.getAll("kalemBolum").map((x) => String(x).trim().slice(0, 200));
  const kalemler: { sira: number; bolum: string | null; kod: string | null; aciklama: string; adet: number; birim: string; birimFiyat: number; iskontoYuzde: number }[] = [];
  for (let i = 0; i < aciklamalar.length; i++) {
    const aciklama = aciklamalar[i];
    if (!aciklama) continue;
    const adet = tutarOku(adetler[i] ?? "");
    const fiyat = tutarOku(fiyatlar[i] ?? "");
    const isk = (iskontolar[i] ?? "").trim() ? tutarOku(iskontolar[i]) : 0;
    if (!adet || adet <= 0) return { hata: `"${aciklama.slice(0, 40)}" kaleminin adedi geçersiz.` };
    if (!fiyat || fiyat <= 0) return { hata: `"${aciklama.slice(0, 40)}" kaleminin birim fiyatı yok. Satınalma siparişinde her kalemin fiyatı olmalı.` };
    if (isk === null || isk < 0 || isk >= 100) return { hata: `"${aciklama.slice(0, 40)}" kaleminin iskontosu geçersiz (0–99).` };
    kalemler.push({
      sira: kalemler.length,
      bolum: bolumler[i] || null,
      kod: kodlar[i] || null,
      aciklama,
      adet,
      birim: birimNormal(birimler[i] || "Adet") || "Adet",
      birimFiyat: fiyat,
      iskontoYuzde: isk,
    });
  }
  if (!kalemler.length) return { hata: "En az bir kalem yazın." };
  if (kalemler.length > 500) return { hata: "Bir siparişte en fazla 500 kalem olabilir." };

  // Bağlantıların doğrulanması
  const tedarikci = await prisma.tedarikci.findUnique({ where: { id: tedarikciId }, select: { id: true } });
  if (!tedarikci) return { hata: "Tedarikçi bulunamadı." };
  if (siparisId) {
    const s = await prisma.siparis.findUnique({ where: { id: siparisId }, select: { durum: true } });
    if (!s) return { hata: "Bağlanacak satış siparişi bulunamadı." };
    if (s.durum === "IPTAL" || s.durum === "REDDEDILDI") return { hata: "İptal / reddedilmiş satış siparişine satınalma bağlanamaz." };
  }
  if (projeId && !(await prisma.proje.findUnique({ where: { id: projeId }, select: { id: true } }))) return { hata: "Proje bulunamadı." };
  if (satinalmaTeklifiId) {
    const st = await prisma.satinalmaTeklifi.findUnique({ where: { id: satinalmaTeklifiId }, select: { tedarikciId: true } });
    if (!st) return { hata: "Kaynak tedarikçi teklifi bulunamadı." };
    if (st.tedarikciId !== tedarikciId) return { hata: "Kaynak tedarikçi teklifi başka bir tedarikçiye ait." };
  }

  // Ürün koduyla stok kartı eşleşmesi (mal kabulde stoğa girer)
  const kodListesi = [...new Set(kalemler.map((k) => k.kod).filter((k): k is string => !!k))];
  const urunler = kodListesi.length ? await prisma.urun.findMany({ where: { kod: { in: kodListesi } }, select: { id: true, kod: true } }) : [];
  const urunMap = new Map(urunler.map((u) => [u.kod, u.id]));

  const tutarNet = yuvarla2(kalemler.reduce((a, k) => a + kalemNet(k), 0));
  const tl = sasTl({ tutarNet, kur, paraBirimi });
  const esik = await onayEsigi();
  const yonetici = giren.rol === "ADMIN";
  const otomatik = yonetici || (esik != null && tl <= esik);

  const yeni = await prisma.satinalmaSiparisi.create({
    data: {
      tedarikciId,
      satinalmaTeklifiId,
      siparisId,
      projeId,
      baslik,
      paraBirimi,
      kur,
      tutarNet,
      durum: otomatik ? "ONAYLANDI" : "ONAY_BEKLIYOR",
      beklenenTeslimTarihi: beklenenTarih,
      notlar,
      olusturanAdi: giren.ad,
      onaylayanAdi: otomatik ? (yonetici ? giren.ad : "Otomatik (onay eşiğinin altında)") : null,
      onayTarihi: otomatik ? new Date() : null,
      kalemler: { create: kalemler.map((k) => ({ ...k, urunId: (k.kod && urunMap.get(k.kod)) || null })) },
    },
    select: { id: true, no: true },
  });
  yenile(yeni.id, siparisId);
  return {
    tamam: otomatik ? `${sasNo(yeni.no)} açıldı ve onaylandı.` : `${sasNo(yeni.no)} açıldı; tutar onay eşiğinin üstünde olduğu için yönetici onayı bekliyor.`,
    git: `/panel/satinalma/siparisler/${yeni.id}`,
  };
}

// --- ONAY / RED -------------------------------------------------------------------
export async function satinalmaSiparisiOnayla(id: string): Promise<SasSonuc> {
  const giren = await yetki("satinalmaSiparisiOnayla", { satinalmaSiparisiId: id });
  if (giren.rol !== "ADMIN") return { hata: "Satınalma siparişini yalnız yönetici onaylayabilir." };
  const s = await prisma.satinalmaSiparisi.findUnique({ where: { id }, select: { durum: true, siparisId: true } });
  if (!s) return { hata: "Sipariş bulunamadı." };
  if (s.durum !== "ONAY_BEKLIYOR") return { hata: "Bu sipariş onay beklemiyor." };
  await prisma.satinalmaSiparisi.update({ where: { id }, data: { durum: "ONAYLANDI", onaylayanAdi: giren.ad, onayTarihi: new Date() } });
  yenile(id, s.siparisId);
  return { tamam: "Sipariş onaylandı." };
}

export async function satinalmaSiparisiReddet(id: string, neden: string): Promise<SasSonuc> {
  const giren = await yetki("satinalmaSiparisiReddet", { satinalmaSiparisiId: id, neden });
  if (giren.rol !== "ADMIN") return { hata: "Satınalma siparişini yalnız yönetici reddedebilir." };
  const nedenTemiz = String(neden ?? "").trim().slice(0, 500);
  if (!nedenTemiz) return { hata: "Red nedenini yazın." };
  const s = await prisma.satinalmaSiparisi.findUnique({ where: { id }, select: { durum: true, siparisId: true } });
  if (!s) return { hata: "Sipariş bulunamadı." };
  if (s.durum !== "ONAY_BEKLIYOR") return { hata: "Bu sipariş onay beklemiyor." };
  await prisma.satinalmaSiparisi.update({ where: { id }, data: { durum: "REDDEDILDI", redNedeni: nedenTemiz, onaylayanAdi: giren.ad, onayTarihi: new Date() } });
  yenile(id, s.siparisId);
  return { tamam: "Sipariş reddedildi." };
}

// --- İPTAL (silinmez) -------------------------------------------------------------
export async function satinalmaSiparisiIptal(id: string, neden: string): Promise<SasSonuc> {
  const giren = await yetki("satinalmaSiparisiIptal", { satinalmaSiparisiId: id, neden });
  if (giren.rol !== "ADMIN") return { hata: "Satınalma siparişini yalnız yönetici iptal edebilir." };
  const nedenTemiz = String(neden ?? "").trim().slice(0, 500);
  if (!nedenTemiz) return { hata: "İptal nedenini yazın." };
  const s = await prisma.satinalmaSiparisi.findUnique({
    where: { id },
    select: {
      durum: true,
      siparisId: true,
      malKabuller: { where: { iptalTarihi: null }, select: { id: true } },
      faturalar: { where: { iptalTarihi: null }, select: { id: true } },
    },
  });
  if (!s) return { hata: "Sipariş bulunamadı." };
  if (s.durum === "IPTAL") return { tamam: "Sipariş zaten iptal edilmiş." };
  if (s.malKabuller.length) return { hata: "Bu siparişte teslim alınmış mal var. Önce mal kabul kayıtlarını iptal edin." };
  await prisma.satinalmaSiparisi.update({ where: { id }, data: { durum: "IPTAL", iptalTarihi: new Date(), iptalEdenAdi: giren.ad, iptalNedeni: nedenTemiz } });
  yenile(id, s.siparisId);
  return {
    tamam: s.faturalar.length
      ? "Sipariş iptal edildi. Bağlı alış faturası var: gerekiyorsa Tedarikçi Cari'den ayrıca iptal edin."
      : "Sipariş iptal edildi.",
  };
}

// --- SATIŞ SİPARİŞİNE BAĞLAMA ---------------------------------------------------------
export async function satinalmaSiparisiBagla(fd: FormData): Promise<SasSonuc> {
  await yetki("satinalmaSiparisiBagla", fd);
  const id = metin(fd, "satinalmaSiparisiId", 100);
  const siparisId = metin(fd, "siparisId", 100) || null;
  const s = id ? await prisma.satinalmaSiparisi.findUnique({ where: { id }, select: { siparisId: true } }) : null;
  if (!s) return { hata: "Satınalma siparişi bulunamadı." };
  if (siparisId) {
    const sat = await prisma.siparis.findUnique({ where: { id: siparisId }, select: { durum: true } });
    if (!sat) return { hata: "Satış siparişi bulunamadı." };
    if (sat.durum === "IPTAL" || sat.durum === "REDDEDILDI") return { hata: "İptal / reddedilmiş satış siparişine bağlanamaz." };
  }
  await prisma.satinalmaSiparisi.update({ where: { id }, data: { siparisId } });
  yenile(id, siparisId);
  if (s.siparisId && s.siparisId !== siparisId) revalidatePath(`/panel/siparisler/${s.siparisId}`);
  return { tamam: siparisId ? "Satış siparişine bağlandı." : "Satış siparişi bağlantısı kaldırıldı." };
}

// --- MAL KABUL ------------------------------------------------------------------------
export async function malKabulEkle(fd: FormData): Promise<SasSonuc> {
  const giren = await yetki("malKabulEkle", fd);
  const id = metin(fd, "satinalmaSiparisiId", 100);
  const tarihHam = metin(fd, "tarih", 10);
  const tarih = tarihHam ? tarihOku(tarihHam) : new Date();
  if (!tarih) return { hata: "Teslim tarihi anlaşılamadı." };
  const irsaliyeNo = metin(fd, "irsaliyeNo", 100) || null;
  const not = metin(fd, "not", 1000) || null;

  const s = id
    ? await prisma.satinalmaSiparisi.findUnique({
        where: { id },
        select: {
          no: true,
          durum: true,
          siparisId: true,
          kur: true,
          paraBirimi: true,
          kalemler: {
            select: {
              id: true,
              aciklama: true,
              adet: true,
              birimFiyat: true,
              iskontoYuzde: true,
              urunId: true,
              malKabulKalemleri: { select: { miktar: true, malKabul: { select: { iptalTarihi: true } } } },
            },
          },
        },
      })
    : null;
  if (!s) return { hata: "Sipariş bulunamadı." };
  if (!malKabulAcikMi(s.durum)) return { hata: "Yalnız onaylı ve teslimi tamamlanmamış siparişte mal kabul yapılır." };

  const satirlar: { kalemId: string; miktar: number; urunId: string | null; birimMaliyetTl: number }[] = [];
  for (const k of s.kalemler) {
    const ham = String(fd.get(`miktar_${k.id}`) ?? "").trim();
    if (!ham) continue;
    const miktar = tutarOku(ham);
    if (miktar === null || miktar < 0) return { hata: `"${k.aciklama.slice(0, 40)}" için miktar anlaşılamadı.` };
    if (miktar === 0) continue;
    const kalan = k.adet - teslimAlinan(k);
    if (miktar > kalan + 1e-9) return { hata: `"${k.aciklama.slice(0, 40)}": kalan ${kalan} iken ${miktar} teslim alınamaz.` };
    const netBirim = k.birimFiyat * (1 - k.iskontoYuzde / 100);
    satirlar.push({ kalemId: k.id, miktar, urunId: k.urunId, birimMaliyetTl: yuvarla2(s.paraBirimi === "TRY" ? netBirim : netBirim * s.kur) });
  }
  if (!satirlar.length) return { hata: "Teslim alınan miktarı en az bir kaleme yazın." };

  const referans = sasNo(s.no);
  await prisma.$transaction(async (tx) => {
    await tx.malKabul.create({
      data: {
        satinalmaSiparisiId: id,
        tarih,
        irsaliyeNo,
        not,
        olusturanAdi: giren.ad,
        kalemler: { create: satirlar.map((r) => ({ kalemId: r.kalemId, miktar: r.miktar })) },
      },
    });
    // Stok kartı eşleşen kalemler stoğa girer (hareket kaydıyla)
    for (const r of satirlar) {
      if (!r.urunId) continue;
      await tx.stokHareket.create({
        data: {
          urunId: r.urunId,
          tur: "GIRIS",
          miktar: r.miktar,
          birimMaliyet: r.birimMaliyetTl,
          aciklama: `${referans} mal kabul${irsaliyeNo ? ` · İrsaliye ${irsaliyeNo}` : ""}`,
          referansNo: referans,
          olusturanAdi: giren.ad,
          tarih,
        },
      });
      await tx.urun.update({ where: { id: r.urunId }, data: { stokMiktari: { increment: r.miktar } } });
    }
  });
  await teslimDurumunuGuncelle(id);
  yenile(id, s.siparisId);
  revalidatePath("/panel/stok");
  const stoga = satirlar.filter((r) => r.urunId).length;
  return { tamam: `Mal kabul kaydedildi${stoga ? `; ${stoga} kalem stoğa girdi` : ""}.` };
}

export async function malKabulIptal(malKabulId: string, neden: string): Promise<SasSonuc> {
  const giren = await yetki("malKabulIptal", { malKabulId, neden });
  if (giren.rol !== "ADMIN") return { hata: "Mal kabulü yalnız yönetici iptal edebilir." };
  const nedenTemiz = String(neden ?? "").trim().slice(0, 500);
  if (!nedenTemiz) return { hata: "İptal nedenini yazın." };
  const m = await prisma.malKabul.findUnique({
    where: { id: malKabulId },
    select: {
      iptalTarihi: true,
      satinalmaSiparisiId: true,
      satinalmaSiparisi: { select: { no: true, siparisId: true } },
      kalemler: { select: { miktar: true, kalem: { select: { urunId: true } } } },
    },
  });
  if (!m) return { hata: "Mal kabul kaydı bulunamadı." };
  if (m.iptalTarihi) return { tamam: "Mal kabul zaten iptal edilmiş." };
  const referans = sasNo(m.satinalmaSiparisi.no);
  await prisma.$transaction(async (tx) => {
    await tx.malKabul.update({ where: { id: malKabulId }, data: { iptalTarihi: new Date(), iptalEdenAdi: giren.ad, iptalNedeni: nedenTemiz } });
    // Stoğa girmiş miktar düzeltme hareketiyle geri alınır
    for (const k of m.kalemler) {
      if (!k.kalem.urunId) continue;
      await tx.stokHareket.create({
        data: {
          urunId: k.kalem.urunId,
          tur: "DUZELTME",
          miktar: -k.miktar,
          aciklama: `${referans} mal kabul iptali · ${nedenTemiz}`.slice(0, 500),
          referansNo: referans,
          olusturanAdi: giren.ad,
        },
      });
      await tx.urun.update({ where: { id: k.kalem.urunId }, data: { stokMiktari: { decrement: k.miktar } } });
    }
  });
  await teslimDurumunuGuncelle(m.satinalmaSiparisiId);
  yenile(m.satinalmaSiparisiId, m.satinalmaSiparisi.siparisId);
  revalidatePath("/panel/stok");
  return { tamam: "Mal kabul iptal edildi; stoğa girmiş miktar geri alındı." };
}

// --- ALIŞ FATURASI (tedarikçi cari borcu) -------------------------------------------------
export async function alisFaturasiEkle(fd: FormData): Promise<SasSonuc> {
  const giren = await yetki("alisFaturasiEkle", fd);
  const id = metin(fd, "satinalmaSiparisiId", 100);
  const faturaNo = metin(fd, "faturaNo", 100);
  const tutar = tutarOku(metin(fd, "tutar", 30));
  const tarihHam = metin(fd, "tarih", 10);
  const vadeHam = metin(fd, "vadeTarihi", 10);
  const tarih = tarihHam ? tarihOku(tarihHam) : new Date();
  const vade = vadeHam ? tarihOku(vadeHam) : null;
  const dosya = fd.get("evrak") as File | null;

  if (!faturaNo) return { hata: "Fatura numarasını yazın." };
  if (!tutar || tutar <= 0) return { hata: "Fatura tutarını (TL, KDV dahil) yazın." };
  if (!tarih) return { hata: "Fatura tarihi anlaşılamadı." };
  if (vadeHam && !vade) return { hata: "Vade tarihi anlaşılamadı." };
  if (dosya && dosya.size > 8 * 1024 * 1024) return { hata: "Fatura dosyası 8 MB'tan büyük olamaz." };

  const s = id ? await prisma.satinalmaSiparisi.findUnique({ where: { id }, select: { no: true, baslik: true, tedarikciId: true, durum: true, siparisId: true } }) : null;
  if (!s) return { hata: "Sipariş bulunamadı." };
  if (s.durum === "IPTAL" || s.durum === "REDDEDILDI" || s.durum === "ONAY_BEKLIYOR") return { hata: "Fatura yalnız onaylı siparişe bağlanır." };
  const ayni = await prisma.tedarikciHareket.findFirst({
    where: { tedarikciId: s.tedarikciId, faturaNo: { equals: faturaNo, mode: "insensitive" }, iptalTarihi: null },
    select: { id: true },
  });
  if (ayni) return { hata: `${faturaNo} numaralı fatura bu tedarikçiye zaten işlenmiş.` };

  const evrak = dosya && dosya.size > 0 ? { evrakDosya: Buffer.from(await dosya.arrayBuffer()), evrakDosyaAdi: dosya.name, evrakDosyaTipi: dosya.type || "application/pdf" } : {};
  await prisma.tedarikciHareket.create({
    data: {
      tedarikciId: s.tedarikciId,
      tur: "BORC",
      tutar: yuvarla2(tutar),
      tarih,
      vadeTarihi: vade,
      aciklama: `Alış faturası ${faturaNo} · ${sasNo(s.no)} ${s.baslik}`.slice(0, 300),
      faturaNo,
      satinalmaSiparisiId: id,
      ...evrak,
    },
  });
  void giren;
  yenile(id, s.siparisId);
  revalidatePath("/panel/genel-cari");
  return { tamam: "Alış faturası tedarikçi cari hesabına borç olarak işlendi." };
}

// --- ONAY EŞİĞİ (yönetici) ------------------------------------------------------------------
export async function satinalmaOnayEsigiKaydet(fd: FormData): Promise<SasSonuc> {
  const giren = await yetki("satinalmaOnayEsigiKaydet", fd);
  if (giren.rol !== "ADMIN") return { hata: "Onay eşiğini yalnız yönetici değiştirebilir." };
  const ham = metin(fd, "esik", 30);
  const esik = ham ? tutarOku(ham) : null;
  if (ham && (esik === null || esik < 0)) return { hata: "Eşik tutarı anlaşılamadı." };
  await prisma.sirketAyarlari.upsert({
    where: { id: "default" },
    update: { satinalmaOnayEsigi: esik },
    create: { id: "default", satinalmaOnayEsigi: esik },
  });
  revalidatePath("/panel/satinalma/siparisler");
  return { tamam: esik == null ? "Eşik kaldırıldı: yöneticinin açtıkları dışındaki siparişler onay bekler." : "Onay eşiği kaydedildi." };
}
