// -----------------------------------------------------------------------------
// SATINALMA SİPARİŞİ BELGESİ (sunucu): siparişi okuyup tedarikçiye giden PDF'i üretir.
// "use server" DEĞİLDİR: dışarıdan çağrılamaz; panel PDF adresi, tedarikçi linki ve
// e-posta gönderimi kullanır.
// -----------------------------------------------------------------------------
import { prisma } from "@/lib/prisma";
import { getSirketAyarlari } from "@/lib/sirket";
import { satinalmaSiparisPdf } from "@/lib/satinalma-siparis-pdf";
import { sasNo } from "@/lib/satinalma-siparis";

export const TEDARIKCI_LINK_TABANI = "https://iklimofisi.com/api/tedarikci-siparis/";
const ANAHTAR_RE = /^[A-Za-z0-9_-]{20,40}$/;

const ALANLAR = {
  id: true,
  no: true,
  baslik: true,
  durum: true,
  paraBirimi: true,
  kur: true,
  kurKaynagi: true,
  kurTarihi: true,
  sevkAdresi: true,
  siparis: { select: { sevkAdresi: true } },
  olusturmaTarihi: true,
  beklenenTeslimTarihi: true,
  notlar: true,
  olusturanAdi: true,
  tedarikci: { select: { ad: true, telefon: true, vergiNo: true, adres: true, email: true } },
  kalemler: {
    select: { kod: true, aciklama: true, adet: true, birim: true, birimFiyat: true, iskontoYuzde: true },
    orderBy: [{ sira: "asc" as const }, { id: "asc" as const }],
  },
};

export async function sasBelgesi(kimlik: { id: string } | { anahtar: string }) {
  if ("anahtar" in kimlik && !ANAHTAR_RE.test(kimlik.anahtar)) return null;
  const s = await prisma.satinalmaSiparisi.findUnique({
    where: "id" in kimlik ? { id: kimlik.id } : { paylasimAnahtari: kimlik.anahtar },
    select: ALANLAR,
  });
  if (!s) return null;
  const sirket = await getSirketAyarlari();
  // Sevk adresi: siparişte yazılan; yoksa bağlı satış siparişinin sevk adresi
  const veri = { ...s, sevkAdresi: s.sevkAdresi || s.siparis?.sevkAdresi || null };
  return { durum: s.durum, no: s.no, dosyaAdi: `Satinalma-Siparisi-${sasNo(s.no)}.pdf`, pdf: satinalmaSiparisPdf(veri, sirket) };
}
