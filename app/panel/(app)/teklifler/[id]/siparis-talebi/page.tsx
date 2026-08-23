import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { siparisTalebiOlustur } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function SiparisTalebi({ params }: { params: { id: string } }) {
  const teklif = await prisma.teklif.findUnique({
    where: { id: params.id },
    include: { musteri: true, kalemler: true, siparis: true },
  });

  if (!teklif) notFound();
  if (teklif.siparis) redirect(`/panel/siparisler/${teklif.siparis.id}`);

  const toplam = teklif.kalemler.reduce(
    (a, k) => a + k.adet * k.birimFiyat * (1 - k.iskontoYuzde / 100),
    0
  );
  const kdvli = teklif.kdvDahil ? toplam : toplam * (1 + teklif.kdvOrani / 100);
  const dovizMi = teklif.paraBirimi !== "TRY";

  return (
    <div className="max-w-2xl">
      <Link href={`/panel/teklifler/${teklif.id}`} className="focus-ring text-sm text-metin/60 hover:text-metin mb-6 inline-block">
        ← Teklife dön
      </Link>

      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Sipariş Talebi</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">{teklif.baslik}</h1>
      <p className="text-sm text-metin/60 mb-8">
        {teklif.musteri.ad} · {kdvli.toLocaleString("tr-TR", { style: "currency", currency: teklif.paraBirimi })}
      </p>

      <p className="text-sm text-metin/60 mb-6 bg-soguk-light text-soguk-dim rounded-md px-4 py-3">
        Bu talep gönderildikten sonra sipariş "Onay Bekliyor" durumunda olacak.
        Bir Yönetici onaylamadan sipariş aktif olmaz, cari hesaba borç
        yazılmaz ve sevkiyat başlatılamaz.
      </p>

      <form action={siparisTalebiOlustur} className="bg-yuzey border border-hat rounded-lg p-5 space-y-5">
        <input type="hidden" name="teklifId" value={teklif.id} />

        {dovizMi && (
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">
              Kur (1 {teklif.paraBirimi} = kaç TL?)
            </label>
            <input
              name="kur"
              type="number"
              step="0.0001"
              required
              placeholder="örn. 34.20"
              className="focus-ring w-full sm:w-48 border border-hat rounded-md px-3 py-2 text-sm"
            />
            <p className="text-xs text-metin/40 mt-1">
              Teklif {teklif.paraBirimi} cinsinden ama cari hesabımız TL tutuyor.
              Onaylandığında bu kurla TL'ye çevrilip cari hesaba borç olarak işlenecek.
            </p>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Sevk Adresi</label>
          <input
            name="sevkAdresi"
            required
            defaultValue={teklif.musteri.sevkAdresi ?? ""}
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
            placeholder="Ürünün gönderileceği adres"
          />
          {teklif.musteri.sevkAdresi ? (
            <p className="text-xs text-metin/40 mt-1">
              Müşteri kaydındaki sevk adresi otomatik dolduruldu, istersen değiştirebilirsin.
            </p>
          ) : (
            <p className="text-xs text-metin/40 mt-1">
              Bu müşteride kayıtlı bir sevk adresi yok, buraya gir — istersen
              Müşteriler sayfasından müşteri kaydına da ekleyebilirsin.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">
            Sözleşme / Anlaşma PDF'i
          </label>
          <input
            name="sozlesmeDosyasi"
            type="file"
            accept="application/pdf"
            required
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
          />
          <p className="text-xs text-metin/40 mt-1">
            Müşteriyle imzalanan/anlaşılan sözleşmenin PDF'i. Sipariş kaydına eklenip
            istediğin zaman görüntülenebilecek.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Ek Not (opsiyonel)</label>
          <textarea
            name="ekNot"
            rows={3}
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
            placeholder="Sözleşmeyle ilgili ek bir not eklemek istersen"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
          >
            Onaya Gönder
          </button>
        </div>
      </form>
    </div>
  );
}
