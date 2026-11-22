import { sasBelgesi } from "@/lib/satinalma-siparis-belge";

// Tedarikçiye WhatsApp'tan giden link: satınalma siparişinin PDF'i.
// Giriş gerekmez; link 24 karakterlik tahmin edilemez bir anahtar içerir.
// Belgede yalnız tedarikçiyi ilgilendiren bilgiler vardır (müşteri / satış fiyatı yok).
// İptal edilen ya da reddedilen siparişin linki çalışmaz.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(_req: Request, { params }: { params: { anahtar: string } }) {
  const b = await sasBelgesi({ anahtar: params.anahtar });
  if (!b) return new Response("Belge bulunamadı.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  if (b.durum === "IPTAL" || b.durum === "REDDEDILDI")
    return new Response("Bu sipariş iptal edilmiştir.", { status: 410, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  return new Response(new Uint8Array(b.pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${b.dosyaAdi}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
