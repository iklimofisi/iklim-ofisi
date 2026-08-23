import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { suankiKullanici } from "@/lib/oturum";
import { csvOlustur, csvYaniti } from "@/lib/csv";

const durumEtiket: Record<string, string> = {
  BEKLEMEDE: "Beklemede",
  ONAYLANDI: "Onaylandı",
  REDDEDILDI: "Reddedildi",
};

function kalemToplam(k: { adet: number; birimFiyat: number; iskontoYuzde: number }) {
  return k.adet * k.birimFiyat * (1 - k.iskontoYuzde / 100);
}

export async function GET(req: NextRequest) {
  const kullanici = await suankiKullanici();
  if (!kullanici) return new Response("Yetkisiz", { status: 401 });

  const sp = req.nextUrl.searchParams;
  const musteri = sp.get("musteri");
  const proje = sp.get("proje");
  const no = sp.get("no");
  const baslangic = sp.get("baslangic");
  const bitis = sp.get("bitis");
  const min = sp.get("min") ? Number(sp.get("min")) : null;
  const max = sp.get("max") ? Number(sp.get("max")) : null;

  const teklifler = await prisma.teklif.findMany({
    where: {
      ...(musteri ? { musteriId: musteri } : {}),
      ...(proje ? { baslik: { contains: proje, mode: "insensitive" } } : {}),
      ...(no ? { teklifNo: Number(no) || -1 } : {}),
      ...(baslangic || bitis
        ? {
            tarih: {
              ...(baslangic ? { gte: new Date(baslangic) } : {}),
              ...(bitis ? { lte: new Date(bitis + "T23:59:59") } : {}),
            },
          }
        : {}),
    },
    include: { musteri: true, kalemler: true },
    orderBy: { tarih: "desc" },
  });

  const satirlar = teklifler
    .map((t) => {
      const toplam = t.kalemler.reduce((a, k) => a + kalemToplam(k), 0);
      return { t, toplam };
    })
    .filter(({ toplam }) => (min === null || toplam >= min) && (max === null || toplam <= max))
    .map(({ t, toplam }) => [
      `TKL-${String(t.teklifNo).padStart(4, "0")}`,
      t.baslik,
      t.musteri.ad,
      t.tarih.toISOString().slice(0, 10),
      durumEtiket[t.durum] ?? t.durum,
      t.paraBirimi,
      toplam.toFixed(2),
    ]);

  const csv = csvOlustur(
    ["Teklif No", "Proje Adı", "Müşteri", "Tarih", "Durum", "Para Birimi", "Toplam Tutar"],
    satirlar
  );

  return csvYaniti(`teklifler-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
