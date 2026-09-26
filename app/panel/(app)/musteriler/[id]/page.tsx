import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { musteriGuncelle, musteriYetkiliEkle, musteriYetkiliGuncelle, musteriYetkiliSil } from "@/lib/actions";
import ZiyaretListesi from "@/components/ZiyaretListesi";
import SilButon from "@/components/SilButon";
import { teklifToplamlari, tarihYaz } from "@/lib/teklif-hesap";

export const dynamic = "force-dynamic";

function paraFormat(n: number, paraBirimi: string = "TRY") {
  return n.toLocaleString("tr-TR", { style: "currency", currency: paraBirimi });
}

const ihaleDurumEtiket: Record<string, string> = {
  TAKIPTE: "Takipte",
  TEKLIF_VERILDI: "Teklif Verildi",
  KAZANILDI: "Kazanıldı",
  KAYBEDILDI: "Kaybedildi",
  IPTAL: "İptal",
};

function ihaleRozetRenk(durum: string) {
  if (durum === "KAZANILDI") return "bg-emerald-100 text-emerald-800";
  if (durum === "KAYBEDILDI" || durum === "IPTAL") return "bg-rose-100 text-rose-800";
  return "bg-amber-100 text-amber-800";
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
      ziyaretler: { orderBy: { tarih: "desc" }, include: { proje: { select: { id: true, ad: true } } } },
      yetkililer: { orderBy: { ad: "asc" } },
      // Projeler ekranındaki bilgiler: durum, konum, kaynak, değer, bağlı teklifler ve ziyaretler
      projeler: {
        orderBy: { olusturmaTarihi: "desc" },
        include: {
          teklifler: { include: { kalemler: true }, orderBy: { tarih: "desc" } },
          _count: { select: { ziyaretler: true } },
        },
      },
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
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-metin/60 mb-1">Müşteri Yetkilisi Ad Soyad</label>
              <input name="yetkiliAdi" defaultValue={musteri.yetkiliAdi ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-medium text-metin/60 mb-1">Yetkili Telefon</label>
              <input name="yetkiliTelefon" defaultValue={musteri.yetkiliTelefon ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
            </div>
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-medium text-metin/60 mb-1">Yetkili E-posta</label>
              <input name="yetkiliEmail" type="email" defaultValue={musteri.yetkiliEmail ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
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
          {musteri.yetkiliAdi && (
            <p className="text-metin font-medium">
              {musteri.yetkiliAdi}
              {musteri.yetkiliTelefon && <span className="text-metin/50 font-normal"> · {musteri.yetkiliTelefon}</span>}
            </p>
          )}
          {musteri.yetkiliEmail && <p className="text-metin/70">{musteri.yetkiliEmail}</p>}
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

      {/* YETKİLİLER */}
      <div id="yetkililer" className="mb-10 scroll-mt-6">
        <h2 className="font-display font-medium text-metin mb-3">
          Yetkililer ({musteri.yetkililer.length + (musteri.yetkiliAdi ? 1 : 0)})
        </h2>
        <div className="space-y-2 mb-3">
          {musteri.yetkiliAdi && (
            <div className="bg-yuzey border border-hat rounded-lg p-4 text-sm flex flex-wrap items-center justify-between gap-2">
              <p className="text-metin">
                <span className="font-medium">{musteri.yetkiliAdi}</span>
                <span className="ml-2 text-[11px] bg-soguk-light text-soguk-dim px-2 py-0.5 rounded-full">Ana yetkili</span>
                {musteri.yetkiliTelefon && <span className="text-metin/50"> · {musteri.yetkiliTelefon}</span>}
                {musteri.yetkiliEmail && <span className="text-metin/50"> · {musteri.yetkiliEmail}</span>}
              </p>
              <p className="text-xs text-metin/40">Yukarıdaki &quot;Müşteri Bilgilerini Düzenle&quot; bölümünden değiştirilir</p>
            </div>
          )}
          {musteri.yetkililer.map((y) => (
            <details key={y.id} className="bg-yuzey border border-hat rounded-lg text-sm">
              <summary className="cursor-pointer select-none p-4 flex flex-wrap items-center justify-between gap-2">
                <span className="text-metin">
                  <span className="font-medium">{y.ad}</span>
                  {y.unvan && <span className="text-metin/60"> · {y.unvan}</span>}
                  {y.telefon && <span className="text-metin/50"> · {y.telefon}</span>}
                  {y.email && <span className="text-metin/50"> · {y.email}</span>}
                </span>
                <span className="text-xs text-soguk-dim">Düzenle</span>
              </summary>
              <div className="px-4 pb-4 flex flex-wrap items-end gap-3">
                <form action={musteriYetkiliGuncelle} className="flex flex-wrap items-end gap-3 flex-1">
                  <input type="hidden" name="yetkiliId" value={y.id} />
                  <input name="ad" required defaultValue={y.ad} placeholder="Ad Soyad" className="focus-ring flex-1 min-w-[150px] border border-hat rounded-md px-3 py-2 text-sm" />
                  <input name="unvan" defaultValue={y.unvan ?? ""} placeholder="Ünvan / Görev" className="focus-ring flex-1 min-w-[130px] border border-hat rounded-md px-3 py-2 text-sm" />
                  <input name="telefon" defaultValue={y.telefon ?? ""} placeholder="Telefon" className="focus-ring flex-1 min-w-[130px] border border-hat rounded-md px-3 py-2 text-sm" />
                  <input name="email" type="email" defaultValue={y.email ?? ""} placeholder="E-posta" className="focus-ring flex-1 min-w-[180px] border border-hat rounded-md px-3 py-2 text-sm" />
                  <button type="submit" className="focus-ring bg-soguk text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors">
                    Kaydet
                  </button>
                </form>
                <SilButon
                  id={y.id}
                  action={musteriYetkiliSil}
                  onayMesaji="Bu yetkiliyi silmek istediğine emin misin? Bu yetkiliye hazırlanan teklifler silinmez; müşterinin ana yetkilisine döner."
                />
              </div>
            </details>
          ))}
          {!musteri.yetkiliAdi && musteri.yetkililer.length === 0 && (
            <p className="text-sm text-metin/50">Henüz yetkili eklenmedi.</p>
          )}
        </div>
        <form action={musteriYetkiliEkle} className="bg-yuzey border border-dashed border-hat rounded-lg p-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="musteriId" value={musteri.id} />
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-metin/60 mb-1">Yeni Yetkili Ad Soyad *</label>
            <input name="ad" required className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="block text-xs font-medium text-metin/60 mb-1">Ünvan / Görev</label>
            <input name="unvan" placeholder="örn. Satınalma Müdürü" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="block text-xs font-medium text-metin/60 mb-1">Telefon</label>
            <input name="telefon" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-metin/60 mb-1">E-posta</label>
            <input name="email" type="email" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="focus-ring bg-soguk text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors">
            + Yetkili Ekle
          </button>
        </form>
      </div>

      {/* PROJELER (Projeler ekranındaki bu müşteriye ait bilgiler) */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-medium text-metin">Projeler ({musteri.projeler.length})</h2>
          <Link href={`/panel/projeler?seciliMusteriId=${musteri.id}`} className="text-xs text-soguk-dim hover:underline">
            + Bu müşteriye yeni proje →
          </Link>
        </div>
        <div className="space-y-2">
          {musteri.projeler.map((p) => {
            const sonTeklif = p.teklifler[0];
            return (
              <div key={p.id} className="bg-yuzey border border-hat rounded-lg p-4 hover:border-soguk transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/panel/projeler/${p.id}`} className="focus-ring font-semibold text-sm text-metin hover:text-soguk-dim">
                      {p.ad}
                    </Link>
                    <p className="text-xs text-metin/50 mt-0.5">
                      {p.konum || "Konum belirtilmedi"}
                      {p.kaynak && ` · Kaynak: ${p.kaynak}`}
                      {` · ${p.teklifler.length} teklif · ${p._count.ziyaretler} ziyaret`}
                      {` · ${tarihYaz(p.olusturmaTarihi)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {p.tahminiDeger != null && (
                      <span className="font-mono text-xs text-amber-700 font-semibold">
                        Tahmini: {paraFormat(p.tahminiDeger, p.paraBirimi)}
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${ihaleRozetRenk(p.ihaleDurumu)}`}>
                      {ihaleDurumEtiket[p.ihaleDurumu] || p.ihaleDurumu}
                    </span>
                  </div>
                </div>
                {(p.ihaleyiAlan || sonTeklif || p.notlar) && (
                  <div className="mt-2 pt-2 border-t border-hat text-xs text-metin/60 space-y-1">
                    {p.ihaleyiAlan && <p>İhaleyi alan: <span className="text-metin">{p.ihaleyiAlan}</span></p>}
                    {sonTeklif && (
                      <p>
                        Son teklif:{" "}
                        <Link href={`/panel/teklifler/${sonTeklif.id}`} className="text-soguk-dim hover:underline font-mono">
                          TKL-{String(sonTeklif.teklifNo).padStart(4, "0")}
                        </Link>{" "}
                        · {paraFormat(teklifToplamlari(sonTeklif).araToplam, sonTeklif.paraBirimi)} (KDV hariç) ·{" "}
                        {teklifDurumEtiket[sonTeklif.durum]}
                      </p>
                    )}
                    {p.notlar && <p className="whitespace-pre-line line-clamp-3">📝 {p.notlar}</p>}
                  </div>
                )}
              </div>
            );
          })}
          {musteri.projeler.length === 0 && (
            <p className="text-sm text-metin/50">Bu müşteriye bağlı proje yok.</p>
          )}
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
                  <p className="font-mono text-sm text-metin">{paraFormat(teklifToplamlari(t).araToplam, t.paraBirimi)}</p>
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-medium text-metin">Ziyaretler ({musteri.ziyaretler.length})</h2>
          <Link
            href={`/panel/ziyaretler?yeniMusteri=${musteri.id}#ziyaret-ekle`}
            className="focus-ring text-xs bg-soguk text-white px-3 py-1.5 rounded-md font-medium hover:bg-soguk-dim transition-colors"
          >
            + Ziyaret Ekle
          </Link>
        </div>
        <ZiyaretListesi ziyaretler={musteri.ziyaretler} />
      </div>
    </div>
  );
}
