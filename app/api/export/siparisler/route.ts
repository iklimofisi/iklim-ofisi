import { prisma } from "@/lib/prisma";
import { suankiKullanici } from "@/lib/oturum";
import { csvOlustur, csvYaniti } from "@/lib/csv";

const durumEtiket: Record<string, string> = {
  ONAY_BEKLIYOR: "Onay Bekliyor",
  HAZIRLANIYOR: "Hazırlanıyor",
  KISMEN_SEVK_EDILDI: "Kısmen Sevk Edildi",
  SEVK_EDILDI: "Sevk Edildi",
  KISMEN_TESLIM_EDILDI: "Kısmen Teslim Edildi",
  TESLIM_EDILDI: "Teslim Edildi",
  FATURALANDI: "Faturalandı",
  IPTAL: "İptal",
  REDDEDILDI: "Reddedildi",
};

export async function GET() {
  const kullanici = await suankiKullanici();
  if (!kullanici) return new Response("Yetkisiz", { status: 401 });

  const siparisler = await prisma.siparis.findMany({
    include: {
      musteri: true,
      teklif: { include: { kalemler: true } },
      sevkiyatlar: true,
    },
    orderBy: { olusturmaTarihi: "desc" },
  });

  const satirlar: unknown[][] = [];
  for (const s of siparisler) {
    for (const k of s.teklif.kalemler) {
      const sevkEdilen = s.sevkiyatlar.filter((sv) => sv.teklifKalemId === k.id).reduce((a, sv) => a + sv.adet, 0);
      satirlar.push([
        `TKL-${String(s.teklif.teklifNo).padStart(4, "0")}`,
        s.teklif.baslik,
        s.musteri.ad,
        durumEtiket[s.durum] ?? s.durum,
        k.aciklama,
        k.adet,
        sevkEdilen,
        k.adet - sevkEdilen,
        s.olusturmaTarihi.toISOString().slice(0, 10),
        s.faturaNo ?? "",
      ]);
    }
  }

  const csv = csvOlustur(
    [
      "Teklif No",
      "Proje Adı",
      "Müşteri",
      "Sipariş Durumu",
      "Ürün",
      "Toplam Adet",
      "Sevk Edilen",
      "Kalan",
      "Sipariş Tarihi",
      "Fatura No",
    ],
    satirlar
  );

  return csvYaniti(`siparisler-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
