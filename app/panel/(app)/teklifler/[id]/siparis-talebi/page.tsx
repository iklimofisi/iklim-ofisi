import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { siparisTalebiOlustur } from "@/lib/actions";
import SonucluForm from "@/components/SonucluForm";
import KurKaynagiSecimi from "@/components/KurKaynagiSecimi";
import { getTcmbKurlari, tcmbKuru } from "@/lib/kur";
import { musterisizMi } from "@/lib/musterisiz";
import { sayfaYetkisi } from "@/lib/oturum";
import { siparisKapaliMi } from "@/lib/siparis-durum";

export const dynamic = "force-dynamic";

export default async function SiparisTalebi({ params }: { params: { id: string } }) {
  await sayfaYetkisi("teklif");
  const teklif = await prisma.teklif.findUnique({
    where: { id: params.id },
    include: { musteri: true, kalemler: true, siparis: true },
  });

  if (!teklif) notFound();
  // Süren sipariş varsa ona gidilir; iptal / red edilmiş eski sipariş yeni talep gönderilince kaldırılır
  const eskiKapali = teklif.siparis && siparisKapaliMi(teklif.siparis.durum) ? teklif.siparis : null;
  if (teklif.siparis && !eskiKapali) redirect(`/panel/siparisler/${teklif.siparis.id}`);
  // Müşterisiz teklif önce müşteriye bağlanmalı (sipariş ve cari müşteriye yazılır)
  if (musterisizMi(teklif.musteriId)) redirect(`/panel/teklifler/${teklif.id}?mesaj=musterisiz-siparis`);

  const toplam = teklif.kalemler.reduce(
    (a, k) => a + k.adet * k.birimFiyat * (1 - k.iskontoYuzde / 100),
    0
  );
  const kdvli = teklif.kdvDahil ? toplam : toplam * (1 + teklif.kdvOrani / 100);
  const dovizMi = teklif.paraBirimi !== "TRY";
  const kurlar = dovizMi ? await getTcmbKurlari() : null;
  // Müşteri teklifin bu revizyonunu linkten onayladıysa sözleşme PDF'i gerekmez
  const linktenOnay =
    !!teklif.musteriOnayTarihi && !!teklif.musteriOnayAdi && (teklif.musteriOnayRevizyon == null || teklif.musteriOnayRevizyon === teklif.revizyonNo);
  const eskiOnay = !!teklif.musteriOnayTarihi && !linktenOnay;
  const saatli = (d: Date) =>
    d.toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });

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
        Bir Admin onaylamadan sipariş aktif olmaz, cari hesaba borç
        yazılmaz ve sevkiyat başlatılamaz.
      </p>

      {eskiKapali && (
        <p className="text-sm mb-6 bg-amber-50 border border-amber-200 text-amber-900 rounded-md px-4 py-3">
          Bu teklifin {eskiKapali.durum === "IPTAL" ? "iptal edilmiş" : "reddedilmiş"} eski bir siparişi var. Yeni talep gönderilince
          eski kayıt kaldırılır (tam kopyası İşlem Geçmişi&apos;nde saklanır; iptal edilmiş cari kayıtları silinmez).
        </p>
      )}

      <SonucluForm action={siparisTalebiOlustur} className="bg-yuzey border border-hat rounded-lg p-5 space-y-5">
        <input type="hidden" name="teklifId" value={teklif.id} />

        {dovizMi && (
          <KurKaynagiSecimi
            pb={teklif.paraBirimi}
            doviz={tcmbKuru(kurlar, teklif.paraBirimi, "TCMB_DOVIZ")}
            efektif={tcmbKuru(kurlar, teklif.paraBirimi, "TCMB_EFEKTIF")}
            tarih={kurlar?.tarih}
          />
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

        {linktenOnay && teklif.musteriOnayTarihi && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-md px-4 py-3 text-sm text-emerald-900">
            <p className="font-semibold">✓ Müşteri bu teklifi linkten onayladı — sözleşme gerekmez.</p>
            <p className="text-xs mt-1">
              Onaylayan: <b>{teklif.musteriOnayAdi}</b> · {saatli(teklif.musteriOnayTarihi)}
              {teklif.musteriOnayRevizyon ? ` · Rev. ${teklif.musteriOnayRevizyon}` : ""}
              {teklif.musteriOnayTutar ? ` · ${teklif.musteriOnayTutar}` : ""}
            </p>
            <p className="text-xs mt-1 text-emerald-800">
              Dosya seçmezsen teklif PDF&apos;i, en altına bu onay kaydı (onaylayan, tarih, tutar, IP) yazılarak sipariş belgesi olarak eklenir.
            </p>
          </div>
        )}
        {eskiOnay && (
          <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-xs text-amber-900">
            Müşteri Rev. {teklif.musteriOnayRevizyon} sürümünü linkten onaylamıştı, teklif sonra değişti (şu an Rev. {teklif.revizyonNo}). Sözleşme PDF&apos;i
            ekleyin ya da teklifi &quot;Beklemede&quot;ye alıp linkten yeniden onaylatın.
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">
            Sözleşme / Anlaşma PDF&apos;i{linktenOnay ? " (isteğe bağlı)" : ""}
          </label>
          <input
            name="sozlesmeDosyasi"
            type="file"
            accept="application/pdf"
            required={!linktenOnay}
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
          />
          <p className="text-xs text-metin/40 mt-1">
            {linktenOnay
              ? "Ayrıca imzalı bir sözleşme varsa ekleyebilirsin; o zaman onaylı teklif PDF'i yerine bu dosya saklanır."
              : "Müşteriyle imzalanan / anlaşılan sözleşmenin PDF'i. Sözleşme hazırlamadıysan teklifi müşteriye link (WhatsApp / e-posta) ile gönderip onaylatırsan bu alan gerekmez."}
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
            className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors disabled:opacity-60"
          >
            Onaya Gönder
          </button>
        </div>
      </SonucluForm>
    </div>
  );
}
