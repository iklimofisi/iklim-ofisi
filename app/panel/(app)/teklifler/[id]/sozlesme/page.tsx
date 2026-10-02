import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sozlesmeOlustur, sozlesmeKaydet, sozlesmeKalemleriYenile, sozlesmeSil } from "@/lib/actions";
import { sablonlariGrupla } from "@/lib/sablon";
import { suankiKullanici } from "@/lib/oturum";
import {
  kalemleriOku,
  maddeleriOku,
  sozlesmeHesap,
  paraYaz,
  paraSembolu,
  sozlesmedeGereksizMi,
  sozlesmeNo,
  tekliftenKalemler,
} from "@/lib/sozlesme";
import KaydetButonu from "@/components/KaydetButonu";
import SozlesmeMaddeleri from "@/components/SozlesmeMaddeleri";
import SilButon from "@/components/SilButon";

export const dynamic = "force-dynamic";

const girdi = "focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white";
const etiket = "block text-xs font-medium text-metin/60 mb-1";

const tarihGirdisi = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

export default async function SozlesmeSayfasi({ params }: { params: { id: string } }) {
  const [teklif, sozlesme, kullanici] = await Promise.all([
    prisma.teklif.findUnique({
      where: { id: params.id },
      include: {
        musteri: true,
        kalemler: { orderBy: [{ sira: "asc" }, { id: "asc" }] },
        sablonlar: { orderBy: { sira: "asc" } },
      },
    }),
    prisma.sozlesme.findUnique({ where: { teklifId: params.id } }),
    suankiKullanici(),
  ]);
  if (!teklif) notFound();

  const tklNo = `TKL-${String(teklif.teklifNo).padStart(4, "0")}`;
  const ust = (
    <div className="mb-6">
      <Link href={`/panel/teklifler/${teklif.id}`} className="focus-ring text-sm text-metin/60 hover:text-metin">
        ← {tklNo} teklifine dön
      </Link>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mt-4 mb-1">Sözleşme Taslağı</p>
      <h1 className="font-display text-2xl font-semibold text-metin">
        {teklif.musteri.ad} — {teklif.baslik || tklNo}
      </h1>
    </div>
  );

  // ---------------------------------------------------------------------------
  // HENÜZ SÖZLEŞME YOK → OLUŞTURMA
  // ---------------------------------------------------------------------------
  if (!sozlesme) {
    const gruplar = sablonlariGrupla(teklif.sablonlar);
    return (
      <div className="max-w-3xl">
        {ust}
        {teklif.durum !== "ONAYLANDI" && (
          <p className="text-sm bg-sicak-light text-sicak-dim rounded-md px-4 py-3 mb-6">
            Bu teklif henüz &quot;Onaylandı&quot; durumunda değil. Yine de sözleşme taslağı hazırlayabilirsiniz.
          </p>
        )}
        <form action={sozlesmeOlustur} className="bg-yuzey border border-hat rounded-lg p-6 space-y-6">
          <input type="hidden" name="teklifId" value={teklif.id} />
          <p className="text-sm text-metin/70">
            Teklifteki müşteri bilgileri, kalemler ve fiyatlar sözleşmeye kopyalanır. Sonraki ekranda hepsini düzenleyebilirsiniz.
          </p>

          <div>
            <p className="text-sm font-semibold text-metin mb-1">Sözleşme bedeli hangi para biriminde olsun?</p>
            <p className="text-xs text-metin/60 mb-3">
              Teklif {teklif.paraBirimi} cinsinden. Sözleşmeyi başka para biriminde yapacaksanız kuru yazın; tüm birim fiyatlar bu kurla
              çevrilir (ör. teklif € ve sözleşme TL ise 1 € = kaç TL).
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={etiket}>Sözleşme para birimi</label>
                <select name="paraBirimi" defaultValue={teklif.paraBirimi} className={girdi}>
                  <option value="TRY">TL</option>
                  <option value="EUR">€ EUR</option>
                  <option value="USD">$ USD</option>
                </select>
              </div>
              <div>
                <label className={etiket}>Kur (1 {paraSembolu(teklif.paraBirimi)} = ?) — aynı para biriminde boş bırakın</label>
                <input name="kur" inputMode="decimal" placeholder="Örn: 38,45" className={`${girdi} font-mono`} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-metin mb-1">Hangi teklif notları sözleşmeye madde olarak girsin?</p>
            <p className="text-xs text-metin/60 mb-3">
              Kur, döviz çevirisi ve teklif geçerlilik süresiyle ilgili notlar sözleşmede çoğu zaman gereksizdir; bunlar işaretsiz
              gelir. Seçtiklerinizi sonraki ekranda yine düzenleyebilirsiniz. Ayrıca standart maddeler (yükümlülükler, kabul,
              mücbir sebep, yetkili mahkeme, yürürlük) otomatik eklenir.
            </p>
            {gruplar.length === 0 ? (
              <p className="text-xs text-metin/50">Bu teklifte not yok.</p>
            ) : (
              <div className="space-y-2">
                {gruplar.map((g) => {
                  const icerik = g.notlar.map((n) => n.icerik).join(" ");
                  const gereksiz = sozlesmedeGereksizMi(`${g.grup} ${icerik}`, true);
                  return (
                    <label key={g.grup} className="flex items-start gap-3 bg-white border border-hat rounded-md p-3 cursor-pointer">
                      <input type="checkbox" name="not" value={g.grup} defaultChecked={!gereksiz} className="mt-1 accent-soguk" />
                      <span>
                        <span className="block text-sm font-semibold text-metin">{g.grup}</span>
                        <span className="block text-xs text-metin/60 line-clamp-2">{icerik}</span>
                        {gereksiz && (
                          <span className="block text-[11px] text-sicak-dim mt-1">
                            Kur, döviz veya teklif geçerlilik ifadesi içerdiği için işaretsiz geldi. Sözleşmeyi döviz cinsinden
                            yapacaksanız işaretleyebilirsiniz.
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <KaydetButonu basari={null} bekleme="Hazırlanıyor…">
            Sözleşme Taslağını Oluştur
          </KaydetButonu>
        </form>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // SÖZLEŞME VAR → DÜZENLEME
  // ---------------------------------------------------------------------------
  const kalemler = kalemleriOku(sozlesme.kalemler);
  const maddeler = maddeleriOku(sozlesme.maddeler);
  const h = sozlesmeHesap({ kalemler, kur: sozlesme.kur, kdvOrani: sozlesme.kdvOrani, kdvDahil: sozlesme.kdvDahil });
  const pbFarkli = sozlesme.paraBirimi !== teklif.paraBirimi;

  // Teklif sözleşme oluşturulduktan sonra değiştiyse uyar
  const guncelTeklifKalemleri = JSON.stringify(tekliftenKalemler(teklif.kalemler));
  const teklifDegisti = guncelTeklifKalemleri !== JSON.stringify(kalemler);

  return (
    <div className="max-w-4xl">
      {ust}

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Link
          href={`/panel/teklifler/${teklif.id}/sozlesme/yazdir`}
          className="focus-ring bg-metin text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-soguk-dim transition-colors"
        >
          📄 Sözleşmeyi Görüntüle / Yazdır
        </Link>
        <span className="text-xs text-metin/50">
          {sozlesmeNo(teklif.teklifNo, sozlesme.createdAt)} · Değişiklikleri önce aşağıdan kaydedin.
        </span>
      </div>

      {teklifDegisti && (
        <form action={sozlesmeKalemleriYenile} className="mb-6 text-sm bg-sicak-light text-sicak-dim rounded-md px-4 py-3 flex flex-wrap items-center gap-3">
          <input type="hidden" name="teklifId" value={teklif.id} />
          <span className="flex-1">Teklifin kalemleri, sözleşme hazırlandıktan sonra değişmiş. Sözleşmede hâlâ eski kalemler var.</span>
          <KaydetButonu basari={null} className="focus-ring bg-sicak-dim text-white px-4 py-1.5 rounded-md text-xs font-semibold">
            Kalemleri tekliften yeniden al
          </KaydetButonu>
        </form>
      )}

      <form action={sozlesmeKaydet} className="space-y-6">
        <input type="hidden" name="sozlesmeId" value={sozlesme.id} />
        <input type="hidden" name="teklifId" value={teklif.id} />

        {/* GENEL */}
        <section className="bg-yuzey border border-hat rounded-lg p-5 space-y-3">
          <h2 className="font-display font-medium text-metin">Genel</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className={etiket}>Sözleşme başlığı</label>
              <input name="baslik" defaultValue={sozlesme.baslik} className={girdi} />
            </div>
            <div>
              <label className={etiket}>Sözleşme tarihi</label>
              <input type="date" name="sozlesmeTarihi" defaultValue={tarihGirdisi(sozlesme.sozlesmeTarihi)} className={girdi} />
            </div>
          </div>
          <div>
            <label className={etiket}>Madde 2 — Sözleşmenin konusu</label>
            <textarea name="isinKonusu" rows={3} defaultValue={sozlesme.isinKonusu} className={girdi} />
          </div>
          <div>
            <label className={etiket}>İşin yapılacağı yer (adres)</label>
            <input name="isYeri" defaultValue={sozlesme.isYeri ?? ""} className={girdi} />
          </div>
        </section>

        {/* İŞVEREN */}
        <section className="bg-yuzey border border-hat rounded-lg p-5 space-y-3">
          <h2 className="font-display font-medium text-metin">Madde 1 — İşveren (müşteri) bilgileri</h2>
          <p className="text-xs text-metin/60">
            Müşteri kaydından kopyalandı; yalnızca bu sözleşmede değişir. Yüklenici bilgileri Ayarlar → Şirket Bilgileri&apos;nden gelir.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className={etiket}>Unvan</label>
              <input name="isverenUnvan" defaultValue={sozlesme.isverenUnvan} className={girdi} />
            </div>
            <div className="sm:col-span-2">
              <label className={etiket}>Adres</label>
              <input name="isverenAdres" defaultValue={sozlesme.isverenAdres ?? ""} className={girdi} />
            </div>
            <div>
              <label className={etiket}>Vergi dairesi / no</label>
              <input name="isverenVergi" defaultValue={sozlesme.isverenVergi ?? ""} placeholder="Örn: Kadıköy VD / 1234567890" className={girdi} />
            </div>
            <div>
              <label className={etiket}>Telefon</label>
              <input name="isverenTelefon" defaultValue={sozlesme.isverenTelefon ?? ""} className={girdi} />
            </div>
            <div>
              <label className={etiket}>İmza yetkilisi</label>
              <input name="isverenYetkili" defaultValue={sozlesme.isverenYetkili ?? ""} className={girdi} />
            </div>
          </div>
        </section>

        {/* BEDEL */}
        <section className="bg-yuzey border border-hat rounded-lg p-5 space-y-3">
          <h2 className="font-display font-medium text-metin">Madde 3 — Kapsam ve sözleşme bedeli</h2>
          <div className="grid sm:grid-cols-4 gap-3">
            <div>
              <label className={etiket}>Para birimi</label>
              <select name="paraBirimi" defaultValue={sozlesme.paraBirimi} className={girdi}>
                <option value="TRY">TL</option>
                <option value="EUR">€ EUR</option>
                <option value="USD">$ USD</option>
              </select>
            </div>
            <div>
              <label className={etiket}>Kur (1 {paraSembolu(teklif.paraBirimi)} = ?)</label>
              <input name="kur" inputMode="decimal" defaultValue={String(sozlesme.kur).replace(".", ",")} className={`${girdi} font-mono`} />
            </div>
            <div>
              <label className={etiket}>KDV oranı (%)</label>
              <input name="kdvOrani" inputMode="decimal" defaultValue={String(sozlesme.kdvOrani).replace(".", ",")} className={`${girdi} font-mono`} />
            </div>
            <div>
              <label className={etiket}>Fiyatlar</label>
              <select name="kdvDahil" defaultValue={sozlesme.kdvDahil ? "evet" : "hayir"} className={girdi}>
                <option value="hayir">KDV hariç</option>
                <option value="evet">KDV dahil</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-metin/80">
            <input type="checkbox" name="birimFiyatGoster" value="evet" defaultChecked={sozlesme.birimFiyatGoster} className="accent-soguk" />
            Sözleşmede birim fiyatları göster (işaretsizse kalemler ve toplam bedel yazar)
          </label>
          {pbFarkli && sozlesme.kur === 1 && (
            <p className="text-xs bg-sicak-light text-sicak-dim rounded px-3 py-2">
              Teklif {teklif.paraBirimi}, sözleşme {sozlesme.paraBirimi} ama kur 1. Kuru yazıp kaydedin.
            </p>
          )}

          <div className="border border-hat rounded-md overflow-hidden bg-white">
            <table className="w-full text-xs tabular-nums">
              <thead className="bg-zemin text-metin/60">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Kalem</th>
                  <th className="text-right px-3 py-2 font-medium">Adet</th>
                  <th className="text-right px-3 py-2 font-medium whitespace-nowrap">Birim ({paraSembolu(sozlesme.paraBirimi)})</th>
                  <th className="text-right px-3 py-2 font-medium">Tutar</th>
                </tr>
              </thead>
              <tbody>
                {h.satirlar.map((k, i) => (
                  <tr key={i} className="border-t border-hat">
                    <td className="px-3 py-1.5">{k.aciklama}</td>
                    <td className="px-3 py-1.5 text-right">{k.adet}</td>
                    <td className="px-3 py-1.5 text-right whitespace-nowrap">{paraYaz(k.birim, sozlesme.paraBirimi)}</td>
                    <td className="px-3 py-1.5 text-right whitespace-nowrap">{paraYaz(k.tutar, sozlesme.paraBirimi)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-hat px-3 py-2 text-right text-sm space-y-0.5">
              <p className="text-metin/70">Toplam (KDV hariç): {paraYaz(h.araToplam, sozlesme.paraBirimi)}</p>
              <p className="text-metin/70">KDV (%{sozlesme.kdvOrani}): {paraYaz(h.kdv, sozlesme.paraBirimi)}</p>
              <p className="font-bold text-metin">Genel Toplam (KDV dahil): {paraYaz(h.genelToplam, sozlesme.paraBirimi)}</p>
            </div>
          </div>
          <p className="text-[11px] text-metin/50">
            Kalemler tekliften kopyalandı. Kalem değiştirmek için teklifi düzenleyip burada &quot;Kalemleri tekliften yeniden al&quot;ı
            kullanın. Para birimi / kur değişikliği kaydedince tutarlar yeniden hesaplanır.
          </p>
        </section>

        {/* MADDELER */}
        <section className="bg-yuzey border border-hat rounded-lg p-5 space-y-3">
          <h2 className="font-display font-medium text-metin">Madde 4 ve sonrası — Sözleşme şartları</h2>
          <p className="text-xs text-metin/60">
            Teklif notlarınızdan ve standart maddelerden oluşturuldu. Metinleri istediğiniz gibi değiştirin; örneğin döviz yerine
            çevrilmiş tutarı ve kesin ödeme planını yazın.
          </p>
          <SozlesmeMaddeleri baslangic={maddeler} />
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 sticky bottom-0 bg-zemin/95 py-3 border-t border-hat">
          {kullanici?.rol === "ADMIN" ? (
            <span className="flex items-center gap-2 text-xs text-metin/50">
              Taslağı sil:
              <SilButon id={sozlesme.id} action={sozlesmeSil} onayMesaji="Sözleşme taslağı silinsin mi? (Kopyası işlem geçmişinde saklanır.)" />
            </span>
          ) : (
            <span />
          )}
          <KaydetButonu basari={null}>Sözleşmeyi Kaydet</KaydetButonu>
        </div>
      </form>
    </div>
  );
}
