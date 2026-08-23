import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { musteriGuncelle } from "@/lib/actions";
import ZiyaretEkleFormu from "@/components/ZiyaretEkleFormu";
import ZiyaretListesi from "@/components/ZiyaretListesi";

export const dynamic = "force-dynamic";

function paraFormat(n: number, paraBirimi: string = "TRY") {
  return n.toLocaleString("tr-TR", { style: "currency", currency: paraBirimi });
}

function kalemToplam(k: { adet: number; birimFiyat: number; iskontoYuzde: number }) {
  return k.adet * k.birimFiyat * (1 - k.iskontoYuzde / 100);
}

const teklifDurumEtiket: Record<string, string> = {
  BEKLEMEDE: "Beklemede",
  ONAYLANDI: "Onaylandı",
  REDDEDILDI: "Reddedildi",
};

export default async function MusteriDetay({ params }: { params: { id: string } }) {
  const musteri = await prisma.musteri.findUnique({
    where: { id: params.id },
    include: {
      cariHareketler: { orderBy: { tarih: "desc" } },
      teklifler: { include: { kalemler: true }, orderBy: { tarih: "desc" } },
      ziyaretler: { orderBy: { tarih: "desc" } },
    },
  });

  if (!musteri) notFound();

  const bakiye = musteri.cariHareketler.reduce(
    (a, c) => a + (c.tur === "BORC" ? c.tutar : -c.tutar),
    0
  );

  return (
    <div>
      <Link href="/panel/musteriler" className="focus-ring text-sm text-metin/60 hover:text-metin mb-6 inline-block">
        ← Müşterilere dön
      </Link>

      <div className="flex items-start justify-between mb-8 gap-3">
        <div>
          <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Müşteri</p>
          <h1 className="font-display text-2xl font-semibold text-metin">{musteri.ad}</h1>
        </div>
        <div className="bg-yuzey border border-hat rounded-lg px-5 py-3 text-right shrink-0">
          <p className="text-xs text-metin/50">Cari Bakiye</p>
          <p className={`font-mono text-lg ${bakiye > 0 ? "text-sicak-dim" : "text-soguk-dim"}`}>{paraFormat(bakiye)}</p>
        </div>
      </div>

      <details className="bg-yuzey border border-hat rounded-lg mb-8">
        <summary className="cursor-pointer select-none px-5 py-3 text-sm font-medium text-metin/70">
          Müşteri Bilgilerini Düzenle
        </summary>
        <form action={musteriGuncelle} className="p-5 pt-0 space-y-3">
          <input type="hidden" name="musteriId" value={musteri.id} />
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-metin/60 mb-1">Müşteri Adı</label>
              <input name="ad" required defaultValue={musteri.ad} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-medium text-metin/60 mb-1">Telefon</label>
              <input name="telefon" defaultValue={musteri.telefon ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-medium text-metin/60 mb-1">Vergi No</label>
              <input name="vergiNo" defaultValue={musteri.vergiNo ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-medium text-metin/60 mb-1">E-posta</label>
              <input name="email" type="email" required defaultValue={musteri.email ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
            </div>
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-medium text-metin/60 mb-1">Muhasebe E-postası</label>
              <input name="muhasebeEmail" type="email" defaultValue={musteri.muhasebeEmail ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-medium text-metin/60 mb-1">Fatura Adresi</label>
              <input name="faturaAdresi" defaultValue={musteri.faturaAdresi ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
            </div>
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-medium text-metin/60 mb-1">Sevk Adresi</label>
              <input name="sevkAdresi" defaultValue={musteri.sevkAdresi ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
          <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors">
            Kaydet
          </button>
        </form>
      </details>

      <div className="grid sm:grid-cols-2 gap-6 mb-8 text-sm">
        <div className="bg-yuzey border border-hat rounded-lg p-5 space-y-1">
          <p className="text-xs text-metin/50 mb-2">İletişim</p>
          <p className="text-metin">{musteri.telefon ?? "Telefon girilmemiş"}</p>
          <p className="text-metin">{musteri.email ?? "E-posta girilmemiş"}</p>
          {musteri.muhasebeEmail && <p className="text-metin/60">Muhasebe: {musteri.muhasebeEmail}</p>}
          {musteri.vergiNo && <p className="text-metin/60">VN: {musteri.vergiNo}</p>}
        </div>
        <div className="bg-yuzey border border-hat rounded-lg p-5 space-y-1">
          <p className="text-xs text-metin/50 mb-2">Adresler</p>
          <p className="text-metin/70"><span className="text-metin/40">Fatura:</span> {musteri.faturaAdresi ?? "—"}</p>
          <p className="text-metin/70"><span className="text-metin/40">Sevk:</span> {musteri.sevkAdresi ?? "—"}</p>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-medium text-metin">Teklifler ({musteri.teklifler.length})</h2>
          <Link href={`/panel/teklifler?musteri=${musteri.id}`} className="text-xs text-soguk-dim hover:underline">
            Teklifler sayfasında filtrele →
          </Link>
        </div>
        <div className="space-y-2">
          {musteri.teklifler.map((t) => (
            <Link
              key={t.id}
              href={`/panel/teklifler/${t.id}`}
              className="focus-ring block bg-yuzey border border-hat rounded-lg p-4 hover:border-soguk transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-metin truncate">
                  <span className="font-mono text-soguk-dim">TKL-{String(t.teklifNo).padStart(4, "0")}</span>{" "}
                  {t.baslik || "(Başlıksız Teklif)"}
                </p>
                <div className="text-right shrink-0">
                  <p className="font-mono text-sm text-metin">{paraFormat(t.kalemler.reduce((a, k) => a + kalemToplam(k), 0), t.paraBirimi)}</p>
                  <p className="text-xs text-metin/50">{teklifDurumEtiket[t.durum]}</p>
                </div>
              </div>
            </Link>
          ))}
          {musteri.teklifler.length === 0 && (
            <p className="text-sm text-metin/50">Bu müşteriye henüz teklif verilmedi.</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-medium text-metin">Cari Hareketler</h2>
          <Link href={`/panel/cari?musteri=${musteri.id}`} className="text-xs text-soguk-dim hover:underline">
            Cari Hesap sayfasında görüntüle →
          </Link>
        </div>
        <div className="bg-yuzey border border-hat rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-metin/50 border-b border-hat">
                <th className="px-5 py-3 font-medium">Tarih</th>
                <th className="px-5 py-3 font-medium">Açıklama</th>
                <th className="px-5 py-3 font-medium text-right">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {musteri.cariHareketler.map((c) => (
                <tr key={c.id} className="border-b border-hat last:border-0">
                  <td className="px-5 py-3 font-mono text-metin/60 whitespace-nowrap">{c.tarih.toISOString().slice(0, 10)}</td>
                  <td className="px-5 py-3 text-metin/70">{c.aciklama}</td>
                  <td className={`px-5 py-3 text-right font-mono whitespace-nowrap ${c.tur === "BORC" ? "text-sicak-dim" : "text-soguk-dim"}`}>
                    {c.tur === "BORC" ? "+" : "-"}
                    {paraFormat(c.tutar)}
                  </td>
                </tr>
              ))}
              {musteri.cariHareketler.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-6 text-center text-metin/50">Cari hareket yok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display font-medium text-metin mb-3">Ziyaretler</h2>
        <ZiyaretEkleFormu musteriId={musteri.id} />
        <ZiyaretListesi ziyaretler={musteri.ziyaretler} />
      </div>
    </div>
  );
}
