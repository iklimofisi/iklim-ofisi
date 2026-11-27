// -----------------------------------------------------------------------------
// SATIŞ SİPARİŞİ ↔ SATINALMA KAPSAMI (sunucu; "use server" DEĞİLDİR)
// Bir satış siparişinin kalemlerinden ne kadarı için satınalma siparişi açıldı?
// Eşleşme kalem açıklamasıyla yapılır (satış siparişinden açılan satınalmada açıklama aynen gelir).
// İptal / red edilmiş satınalmalar sayılmaz. Satılandan fazla alım uyarısı ve "kalan adet" ön dolumu buradan gelir.
// -----------------------------------------------------------------------------
import { prisma } from "@/lib/prisma";

export const kalemAnahtari = (s: string) => s.toLocaleLowerCase("tr-TR").replace(/\s+/g, " ").trim();

export type KapsamSatiri = { aciklama: string; birim: string; bolum: string | null; satilan: number; siparisEdilen: number };

function satilanKalemler(s: { kalemlerJson: string | null; teklif: { kalemler: { aciklama: string; adet: number; birim: string; bolum: string | null }[] } }) {
  let liste: { aciklama: string; adet: number; birim?: string | null; bolum?: string | null }[] = s.teklif.kalemler;
  if (s.kalemlerJson) {
    try {
      const j = JSON.parse(s.kalemlerJson);
      if (Array.isArray(j) && j.length) liste = j;
    } catch {
      /* bozuk kayıt: teklifin kalemleri */
    }
  }
  return liste.filter((k) => k && typeof k.aciklama === "string" && k.aciklama.trim() && Number(k.adet) > 0);
}

// haricId: düzenlenen / yeni açılan satınalma hariç tutulur
export async function siparisAlimKapsami(siparisId: string, haricId?: string) {
  const s = await prisma.siparis.findUnique({
    where: { id: siparisId },
    select: {
      kalemlerJson: true,
      teklif: { select: { kalemler: { orderBy: [{ sira: "asc" }, { id: "asc" }], select: { aciklama: true, adet: true, birim: true, bolum: true } } } },
      satinalmaSiparisleri: {
        where: { durum: { notIn: ["IPTAL", "REDDEDILDI"] }, ...(haricId ? { id: { not: haricId } } : {}) },
        orderBy: { no: "asc" },
        select: { id: true, no: true, paraBirimi: true, tutarNet: true, durum: true, tedarikci: { select: { ad: true } }, kalemler: { select: { aciklama: true, adet: true } } },
      },
    },
  });
  if (!s) return null;
  const satirlar = new Map<string, KapsamSatiri>();
  for (const k of satilanKalemler(s)) {
    const a = kalemAnahtari(k.aciklama);
    const v = satirlar.get(a);
    if (v) v.satilan += Number(k.adet);
    else satirlar.set(a, { aciklama: k.aciklama, birim: k.birim ?? "Adet", bolum: k.bolum ?? null, satilan: Number(k.adet), siparisEdilen: 0 });
  }
  for (const sas of s.satinalmaSiparisleri) {
    for (const k of sas.kalemler) {
      const v = satirlar.get(kalemAnahtari(k.aciklama));
      if (v) v.siparisEdilen += k.adet;
    }
  }
  const liste = [...satirlar.values()];
  return {
    satirlar: liste,
    fazlalar: liste.filter((x) => x.siparisEdilen > x.satilan + 1e-9),
    oncekiler: s.satinalmaSiparisleri,
  };
}
