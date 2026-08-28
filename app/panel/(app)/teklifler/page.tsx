import { prisma } from "@/lib/prisma";
import { teklifEkle, teklifSil } from "@/lib/actions";
import TeklifKalemleri from "@/components/TeklifKalemleri";
import TeklifDurumSecici from "@/components/TeklifDurumSecici";
import SilButon from "@/components/SilButon";
import Link from "next/link";

function paraFormat(n: number, paraBirimi: string = "TRY") {
  return n.toLocaleString("tr-TR", { style: "currency", currency: paraBirimi });
}

function kalemToplam(k: { adet: number; birimFiyat: number; iskontoYuzde: number }) {
  return k.adet * k.birimFiyat * (1 - k.iskontoYuzde / 100);
}

function teklifNoFormat(no: number) {
  return `TKL-${String(no).padStart(4, "0")}`;
}

export default async function TekliflerSayfasi({
  searchParams,
}: {
  searchParams: { musteri?: string; hazirlayan?: string; baslangic?: string; bitis?: string; min?: string; max?: string; proje?: string; no?: string };
}) {
  const [musteriler, tumTeklifler, sablonlar, markalar, urunler, projeler, kullanicilar] = await Promise.all([
    prisma.musteri.findMany({ orderBy: { ad: "asc" } }),
    prisma.teklif.findMany({
      where: {
        ...(searchParams.musteri ? { musteriId: searchParams.musteri } : {}),
        // HAZIRLAYAN PERSONEL FİLTRESİ
        ...(searchParams.hazirlayan ? { olusturanKullaniciId: searchParams.hazirlayan } : {}),
        ...(searchParams.proje ? { baslik: { contains: searchParams.proje, mode: "insensitive" } } : {}),
        ...(searchParams.no ? { teklifNo: Number(searchParams.no) || -1 } : {}),
        ...(searchParams.baslangic || searchParams.bitis
          ? {
              tarih: {
                ...(searchParams.baslangic ? { gte: new Date(searchParams.baslangic) } : {}),
                ...(searchParams.bitis ? { lte: new Date(searchParams.bitis + "T23:59:59") } : {}),
              },
            }
          : {}),
      },
      include: { musteri: true, kalemler: true, siparis: true, olusturanKullanici: true },
      orderBy: { tarih: "desc" },
    }),
    prisma.teklifSablon.findMany({ orderBy: { sira: "asc" } }),
    prisma.marka.findMany({ select: { id: true, ad: true }, orderBy: { ad: "asc" } }),
    prisma.urun.findMany({ orderBy: { ad: "asc" } }),
    prisma.proje.findMany({ orderBy: { ad: "asc" } }),
    prisma.kullanici.findMany({ select: { id: true, ad: true }, orderBy: { ad: "asc" } }), // KULLANICILAR ÇEKİLDİ
  ]);

  const min = searchParams.min ? Number(searchParams.min) : null;
  const max = searchParams.max ? Number(searchParams.max) : null;

  const teklifler = tumTeklifler.filter((t) => {
    if (min === null && max === null) return true;
    const toplam = t.kalemler.reduce((a, k) => a + kalemToplam(k), 0);
    if (min !== null && toplam < min) return false;
    if (max !== null && toplam > max) return false;
    return true;
  });

  const filtreVar = Object.values(searchParams).some(Boolean);
  const disaAktarQuery = new URLSearchParams(
    Object.entries(searchParams).filter(([, v]) => v) as [string, string][]
  ).toString();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
          <h1 className="font-display text-2xl font-semibold text-metin">Teklifler</h1>
        </div>
        <a
          href={`/api/export/teklifler${disaAktarQuery ? `?${disaAktarQuery}` : ""}`}
          className="focus-ring text-sm font-medium text-metin/70 border border-hat px-4 py-2 rounded-md hover:border-soguk hover:text-soguk-dim transition-colors"
        >
          Excel'e Aktar
        </a>
      </div>

      {/* YENİ TEKLİF FORMU */}
      <form action={teklifEkle} className="bg-yuzey border border-hat rounded-lg p-5 mb-10">
        <h2 className="font-display font-medium text-metin mb-4">Yeni Teklif</h2>

        {musteriler.length === 0 ? (
          <p className="text-sm text-metin/50 mb-4">
            Önce Müşteriler sayfasından en az bir müşteri eklemelisin.
          </p>
        ) : (
          <>
            <label className="block text-xs font-medium text-metin/60 mb-1">Teklif / Proje Adı</label>
            <input
              name="baslik"
              required
              placeholder="örn. Merkez Ofis VRF Klima Sistemi"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm mb-5"
            />

            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">Müşteri</label>
                <select
                  name="musteriId"
                  required
                  className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
                >
                  {musteriler.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.ad}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">Proje (opsiyonel)</label>
                <select name="projeId" defaultValue="" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">— Proje bağlantısı yok —</option>
                  {projeler.map((p) => (
                    <option key={p.id} value={p.id}>{p.ad}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-4 gap-3 mb-5">
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">Para Birimi</label>
                <select name="paraBirimi" defaultValue="TRY" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
                  <option value="TRY">₺ TRY</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">KDV Durumu</label>
                <select name="kdvDurumu" defaultValue="haric" className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
                  <option value="haric">Fiyatlara KDV Hariç</option>
                  <option value="dahil">Fiyatlara KDV Dahil</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">KDV Oranı (%)</label>
                <input
                  name="kdvOrani"
                  type="number"
                  defaultValue={20}
                  className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-metin/60 mb-1">Geçerlilik (gün)</label>
                <input
                  name="gecerlilikGunu"
                  type="number"
                  defaultValue={15}
                  className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
                />
              </div>
            </div>

            <TeklifKalemleri
              markalar={markalar.map((m) => ({ id: m.id, ad: m.ad }))}
              urunler={urunler.map((u) => ({
                id: u.id,
                kod: u.kod,
                ad: u.ad,
                markaId: u.markaId,
                birimFiyat: u.listeFiyati,
                paraBirimi: u.paraBirimi,
              }))}
            />

            <label className="flex items-center gap-2 text-sm text-metin/80 mb-4 bg-soguk-light/20 p-2.5 rounded border border-hat">
              <input type="checkbox" name="birimFiyatGoster" value="hayir" className="accent-soguk" />
              <span className="font-semibold text-metin">PDF çıktısında tüm kalem fiyatlarını gizle</span>
              <span className="text-xs text-metin/60">(Müşteri kalem fiyatlarını göremez, sadece dip toplam görünür)</span>
            </label>

            {sablonlar.length > 0 && (
              <div className="border-t border-hat pt-4 mt-4 mb-4">
                <p className="text-xs font-medium text-metin/60 mb-2">
                  Bu teklifte hangi bölümler görünsün?
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {sablonlar.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-sm text-metin/80">
                      <input type="checkbox" name="sablonIds" value={s.id} defaultChecked className="accent-soguk" />
                      {s.baslik}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end border-t border-hat pt-4">
              <button
                type="submit"
                className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
              >
                Teklifi Kaydet
              </button>
            </div>
          </>
        )}
      </form>

      {/* FİLTRELEME EKRANI (HAZIRLAYAN PERSONEL FİLTRESİ EKLENDİ) */}
      <details className="bg-yuzey border border-hat rounded-lg mb-6" open={filtreVar}>
        <summary className="cursor-pointer select-none px-5 py-3 text-sm font-medium text-metin/70">
          Filtrele {filtreVar && <span className="text-soguk-dim">(aktif)</span>}
        </summary>
        <form method="get" className="p-5 pt-0 grid sm:grid-cols-7 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Teklif No</label>
            <input name="no" type="number" defaultValue={searchParams.no ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white" placeholder="örn. 12" />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Müşteri</label>
            <select name="musteri" defaultValue={searchParams.musteri ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
              <option value="">Tümü</option>
              {musteriler.map((m) => (
                <option key={m.id} value={m.id}>{m.ad}</option>
              ))}
            </select>
          </div>

          {/* DÜZELTİLDİ: HAZIRLAYAN PERSONEL FİLTRESİ EKLENDİ */}
          <div>
            <label className="block text-xs font-semibold text-soguk-dim mb-1">Hazırlayan Personel</label>
            <select name="hazirlayan" defaultValue={searchParams.hazirlayan ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
              <option value="">Tümü</option>
              {kullanicilar.map((k) => (
                <option key={k.id} value={k.id}>{k.ad}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Proje Adı</label>
            <input name="proje" defaultValue={searchParams.proje ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white" placeholder="ara..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Başlangıç Tarihi</label>
            <input name="baslangic" type="date" defaultValue={searchParams.baslangic ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Bitiş Tarihi</label>
            <input name="bitis" type="date" defaultValue={searchParams.bitis ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Min Tutar</label>
              <input name="min" type="number" defaultValue={searchParams.min ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Max Tutar</label>
              <input name="max" type="number" defaultValue={searchParams.max ?? ""} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white" />
            </div>
          </div>
          <div className="sm:col-span-7 flex gap-3">
            <button type="submit" className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors">
              Filtrele
            </button>
            {filtreVar && (
              <Link href="/panel/teklifler" className="focus-ring text-sm text-metin/60 hover:text-metin px-2 py-2">
                Filtreyi temizle
              </Link>
            )}
          </div>
        </form>
      </details>

      {/* TEKLİFLER LİSTESİ */}
      <div className="space-y-3">
        {teklifler.map((t) => {
          const toplam = t.kalemler.reduce((a, k) => a + kalemToplam(k), 0);
          const hazirlayanPersonel = t.olusturanKullanici?.ad || t.olusturanAdi || "—";

          return (
            <div key={t.id} className="bg-yuzey border border-hat rounded-lg p-4 flex items-center justify-between gap-3 shadow-sm hover:border-soguk transition-colors">
              <Link href={`/panel/teklifler/${t.id}`} className="focus-ring min-w-0 flex-1">
                <p className="font-medium text-metin text-sm hover:text-soguk-dim transition-colors truncate">
                  <span className="font-mono text-soguk-dim font-bold">{teklifNoFormat(t.teklifNo)}</span>{" "}
                  {t.baslik || "(Başlıksız Teklif)"}
                </p>
                <div className="text-xs text-metin/60 flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                  <span className="font-semibold text-metin">{t.musteri.ad}</span>
                  <span>·</span>
                  <span>{t.tarih.toISOString().slice(0, 10)}</span>
                  <span>·</span>
                  <span>{t.kalemler.length} kalem</span>
                  {t.revizyonNo > 1 && <span>· Rev. {t.revizyonNo}</span>}
                  
                  <span className="bg-soguk-light/40 text-soguk-dim px-2 py-0.5 rounded font-bold text-[11px] border border-soguk/20">
                    👤 Hazırlayan: {hazirlayanPersonel}
                  </span>

                  {t.siparis && <span className="text-emerald-700 font-bold">· Siparişe dönüştürüldü</span>}
                </div>
              </Link>
              <div className="text-right flex items-center gap-3 shrink-0">
                <p className="font-mono text-metin font-bold">{paraFormat(toplam, t.paraBirimi)}</p>
                <TeklifDurumSecici teklifId={t.id} mevcutDurum={t.durum} />
                <Link href={`/panel/teklifler/${t.id}/duzenle`} className="focus-ring text-xs text-metin/60 hover:text-soguk-dim font-medium">
                  Düzenle
                </Link>
                <SilButon id={t.id} action={teklifSil} onayMesaji="Bu teklifi silmek istediğine emin misin?" />
              </div>
            </div>
          );
        })}
        {teklifler.length === 0 && (
          <p className="text-sm text-metin/50">{filtreVar ? "Bu filtreye uyan teklif yok." : "Henüz teklif yok."}</p>
        )}
      </div>
    </div>
  );
}