import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { suankiKullanici } from "@/lib/oturum";
import { csvOlustur, csvYaniti } from "@/lib/csv";
import { aylikOzet, alacakYaslandirma, aySiniri, donemAnahtari, donemAdi, gecerliDonem, YAS_DILIMLERI, type AylikOzet } from "@/lib/finans";

// Yatırımcı raporu (aylık) — Excel'de açılan CSV (noktalı virgül ayraçlı, Türkçe ondalık)
// Kapalı ayda kapanış anındaki rakamlar verilir.
const sayi = (n: number) => n.toFixed(2).replace(".", ",");

export async function GET(req: NextRequest) {
  if (!(await suankiKullanici())) return new Response("Yetkisiz", { status: 401 });
  const ay = gecerliDonem(req.nextUrl.searchParams.get("ay")) ?? donemAnahtari(new Date());

  const kapanis = await prisma.donemKapanis.findUnique({ where: { donem: ay } }).catch(() => null);
  let o: AylikOzet | null = null;
  if (kapanis && !kapanis.acikMi && kapanis.ozetJson) {
    try {
      o = JSON.parse(kapanis.ozetJson) as AylikOzet;
    } catch {
      o = null;
    }
  }
  if (!o) o = await aylikOzet(ay);

  const { son } = aySiniri(ay);
  const itibariyle = son < new Date() ? son : new Date();
  const yas = await alacakYaslandirma(itibariyle);

  const satirlar: unknown[][] = [
    ["Dönem", donemAdi(ay)],
    ["Durum", kapanis && !kapanis.acikMi ? `Kapalı (${kapanis.kapatanAdi}, ${kapanis.kapanisTarihi.toLocaleDateString("tr-TR")})` : "Açık (canlı rakamlar)"],
    [],
    ["Ciro (TL, KDV hariç)", sayi(o.ciro)],
    ["Onaylanan sipariş sayısı", o.siparisSayisi],
    ["Maliyeti bağlı sipariş sayısı", o.maliyetliSiparisSayisi],
    ["Maliyeti bağlı siparişlerin cirosu", sayi(o.maliyetliCiro)],
    ["Bu siparişlerin satınalma maliyeti", sayi(o.maliyet)],
    ["Brüt kâr", sayi(o.brutKar)],
    ["Tahsilat (TL)", sayi(o.tahsilat)],
    ["Müşterilere yazılan borç (TL)", sayi(o.musteriBorclandirma)],
    ["Alış faturaları (TL)", sayi(o.aliFaturalari)],
    ["Tedarikçi ödemeleri (TL)", sayi(o.tedarikciOdemeleri)],
    ["Verilen satınalma siparişleri (TL, KDV hariç)", sayi(o.satinalmaTutari)],
    ["Müşteri alacağı, ay sonu (TL)", sayi(o.alacakBakiyesi)],
    ["Tedarikçi borcu, ay sonu (TL)", sayi(o.borcBakiyesi)],
    ["Teklif sayısı", o.teklifSayisi],
    ["Kazanılan teklif", o.kazanilanTeklif],
    ["Kaybedilen teklif", o.kaybedilenTeklif],
    [],
    [`Alacak yaşlandırma (${itibariyle.toLocaleDateString("tr-TR")} itibarıyla)`],
    ["Müşteri", "Bakiye", ...YAS_DILIMLERI],
    ...yas.satirlar.map((s) => [s.ad, sayi(s.bakiye), ...s.dilimler.map(sayi)]),
    ["TOPLAM", sayi(yas.toplam.reduce((a, x) => a + x, 0)), ...yas.toplam.map(sayi)],
  ];

  return csvYaniti(`yatirimci-raporu-${ay}.csv`, csvOlustur(["Kalem", "Değer"], satirlar));
}
