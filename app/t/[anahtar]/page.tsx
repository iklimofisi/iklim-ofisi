import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import { paylasilanTeklif, onizlemeBotuMu, goruntulenmeKaydet, hazirlayanaBildir, htmlGuvenli } from "@/lib/teklif-paylasim";
import { teklifLinktenOnayla } from "@/lib/teklif-onay";
import { getSirketAyarlari } from "@/lib/sirket";
import { musteriToplami, musteriTeklifTarihi } from "@/lib/teklif-hesap";
import { ISTIRAK_METNI } from "@/lib/kurumsal";
import { whatsappLinki } from "@/lib/gorusme";

// -----------------------------------------------------------------------------
// MÜŞTERİNİN AÇTIĞI TEKLİF SAYFASI (WhatsApp ile gönderilen gizli link)
// Kısa özet + teklifin PDF'i (e-postadaki PDF ile aynı). Arama motorlarına kapalı.
// Teklif sonradan düzenlenirse link her zaman GÜNCEL hâlini gösterir.
// -----------------------------------------------------------------------------

export const dynamic = "force-dynamic";

const teklifKodu = (no: number) => `TKL-${String(no).padStart(4, "0")}`;

export async function generateMetadata({ params }: { params: { anahtar: string } }): Promise<Metadata> {
  const sonuc = await paylasilanTeklif(params.anahtar);
  const baslik = sonuc ? `Fiyat Teklifi ${teklifKodu(sonuc.teklif.teklifNo)}` : "Teklif bulunamadı";
  return {
    title: { absolute: `${baslik} · İklim Ofisi` },
    description: "İklim Ofisi Mühendislik fiyat teklifi",
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
    // WhatsApp önizlemesinde firma/fiyat bilgisi görünmesin
    openGraph: { title: `${baslik} · İklim Ofisi`, description: "Teklifi görüntülemek için dokunun.", images: ["/og-image.png"] },
  };
}

const paraYaz = (n: number, pb: string) =>
  `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${pb === "EUR" ? "€" : pb === "USD" ? "$" : "TL"}`;

const tarihYaz = (d: Date) =>
  new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" }).format(new Date(d));

const saatliTarih = (d: Date) =>
  new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  }).format(new Date(d));

export default async function TeklifLinki({
  params,
  searchParams = {},
}: {
  params: { anahtar: string };
  searchParams?: { onay?: string };
}) {
  const sonuc = await paylasilanTeklif(params.anahtar);

  if (!sonuc) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md text-center bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <Image src="/logo-icon.png" alt="İklim Ofisi" width={48} height={48} className="mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-slate-800 mb-2">Bu teklif linki artık geçerli değil</h1>
          <p className="text-sm text-slate-500">
            Link iptal edilmiş veya hatalı olabilir. Güncel teklif için lütfen bizimle iletişime geçin.
          </p>
          <a href="https://iklimofisi.com/iletisim" className="inline-block mt-5 text-sm font-medium text-teal-700 hover:underline">
            İletişim →
          </a>
        </div>
      </main>
    );
  }

  const { teklif, paylasimId } = sonuc;
  if (!teklif) notFound();

  // Panel kullanıcıları, link önizleme botları ve onaydan sonraki dönüş görüntülenme sayılmaz.
  // Müşteri ilk kez (ya da 12 saatten uzun aradan sonra) açtıysa hazırlayana e-posta gider.
  const panelden = Boolean(cookies().get("oturum")?.value);
  if (!panelden && !searchParams.onay && !onizlemeBotuMu(headers().get("user-agent"))) {
    const g = await goruntulenmeKaydet(paylasimId);
    if (g.bildir) {
      const yetkili = teklif.yetkili?.ad || teklif.musteri.yetkiliAdi;
      const yetkiliTel = teklif.yetkili ? teklif.yetkili.telefon : teklif.musteri.yetkiliTelefon;
      await hazirlayanaBildir(
        teklif,
        `👁 ${teklifKodu(teklif.teklifNo)} müşteri tarafından açıldı · ${teklif.musteri.ad}`,
        `<p style="font-size:15px"><b>${htmlGuvenli(teklif.musteri.ad)}</b> teklif linkini şimdi açtı${g.sayi > 1 ? ` (toplam ${g.sayi}. açılış)` : ""}.</p>
         ${yetkili ? `<p>Yetkili: <b>${htmlGuvenli(yetkili)}</b>${yetkiliTel ? ` · <a href="tel:${htmlGuvenli(yetkiliTel.replace(/[^\d+]/g, ""))}">${htmlGuvenli(yetkiliTel)}</a>` : ""}</p>` : ""}
         <p style="color:#0f766e">Aramak için iyi bir zaman olabilir.</p>`
      );
    }
  }

  const sirket = await getSirketAyarlari();
  const toplam = musteriToplami(teklif);
  const tarih = musteriTeklifTarihi(teklif);
  const hitap = teklif.yetkili?.ad || teklif.musteri.yetkiliAdi || teklif.musteri.ad;
  const hazirlayan = teklif.olusturanKullanici?.ad || teklif.olusturanAdi || sirket.unvan;
  const telefon = teklif.olusturanKullanici?.telefon || sirket.telefon;
  const eposta = teklif.olusturanKullanici?.email || sirket.email;
  const pdfYolu = `/t/${params.anahtar}/pdf`;
  const kod = teklifKodu(teklif.teklifNo);
  const whatsapp = sirket.whatsapp
    ? whatsappLinki(sirket.whatsapp, `Merhaba, ${kod} numaralı teklifiniz hakkında bilgi almak istiyorum.`)
    : null;

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Image src="/logo-icon.png" alt={sirket.unvan} width={44} height={44} />
          <div className="min-w-0">
            <p className="font-bold text-slate-800 leading-tight">{sirket.unvan}</p>
            <p className="text-[11px] text-slate-500">{ISTIRAK_METNI}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <p className="text-xs font-semibold tracking-widest text-teal-700 uppercase mb-1">Fiyat Teklifi</p>
            <h1 className="text-xl font-semibold text-slate-800">{teklif.baslik || kod}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {kod}
              {teklif.revizyonNo > 1 && ` · Rev. ${teklif.revizyonNo}`} · {tarihYaz(tarih)}
            </p>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-700">
              Sayın <b>{hitap}</b>,<br />
              {teklif.musteri.ad !== hitap && (
                <>
                  <span className="text-slate-500">{teklif.musteri.ad}</span>
                  <br />
                </>
              )}
              hazırladığımız fiyat teklifini aşağıdaki düğmeden görüntüleyip indirebilirsiniz.
            </p>

            {teklif.proje && (
              <p className="text-sm text-slate-600">
                <span className="text-slate-400">Proje:</span> {teklif.proje.ad}
              </p>
            )}

            <div className="bg-teal-50 border border-teal-100 rounded-lg p-4">
              <p className="text-xs text-teal-800/70 mb-0.5">Genel Toplam</p>
              <p className="text-2xl font-bold text-teal-800">
                {paraYaz(toplam.tutar, teklif.paraBirimi)} <span className="text-sm font-medium">{toplam.ek}</span>
              </p>
              {teklif.gecerlilikGunu > 0 && (
                <p className="text-xs text-teal-800/70 mt-1">Teklif {teklif.gecerlilikGunu} gün süreyle geçerlidir.</p>
              )}
            </div>

            <a
              href={pdfYolu}
              target="_blank"
              rel="noopener"
              className="flex items-center justify-center gap-2 w-full bg-teal-700 text-white font-semibold rounded-lg py-3.5 hover:bg-teal-800 transition-colors"
            >
              📄 Teklifi Görüntüle (PDF)
            </a>
            <a
              href={pdfYolu}
              download={`Teklif-${kod}.pdf`}
              className="block text-center text-sm text-teal-700 hover:underline"
            >
              PDF olarak indir
            </a>
          </div>

          {/* ONAY */}
          <div id="onay" className="px-6 pb-6 scroll-mt-6">
            {teklif.durum === "ONAYLANDI" ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-900">
                <p className="font-semibold">✅ Bu teklif onaylanmıştır.</p>
                {teklif.musteriOnayAdi && teklif.musteriOnayTarihi && (
                  <p className="mt-1">
                    Onaylayan: <b>{teklif.musteriOnayAdi}</b> · {saatliTarih(teklif.musteriOnayTarihi)}
                  </p>
                )}
                {searchParams.onay === "tamam" && (
                  <p className="mt-2">Teşekkür ederiz. Onayınız bize iletildi; en kısa sürede sizinle iletişime geçeceğiz.</p>
                )}
              </div>
            ) : teklif.durum === "BEKLEMEDE" ? (
              <details open={searchParams.onay === "eksik"} className="group border border-slate-200 rounded-lg">
                <summary className="cursor-pointer select-none list-none flex items-center justify-center gap-2 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg">
                  ✔ Teklifi onaylamak istiyorum
                </summary>
                <form action={teklifLinktenOnayla} className="p-4 pt-1 space-y-3">
                  <input type="hidden" name="anahtar" value={params.anahtar} />
                  {/* bot tuzağı: insanlar görmez */}
                  <input type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                  {searchParams.onay === "eksik" && (
                    <p className="text-sm text-red-700 bg-red-50 rounded-md px-3 py-2">Lütfen adınızı soyadınızı yazın ve onay kutusunu işaretleyin.</p>
                  )}
                  <div>
                    <label htmlFor="onaylayan" className="block text-xs font-medium text-slate-500 mb-1">
                      Adınız Soyadınız *
                    </label>
                    <input
                      id="onaylayan"
                      name="onaylayan"
                      required
                      minLength={3}
                      maxLength={120}
                      defaultValue={teklif.yetkili?.ad || teklif.musteri.yetkiliAdi || ""}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="onayNotu" className="block text-xs font-medium text-slate-500 mb-1">
                      Notunuz (opsiyonel)
                    </label>
                    <textarea
                      id="onayNotu"
                      name="onayNotu"
                      rows={2}
                      maxLength={1000}
                      placeholder="örn. Montaj için uygun tarih, fatura bilgisi…"
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <label className="flex items-start gap-2 text-sm text-slate-700">
                    <input type="checkbox" name="kabul" value="evet" required className="mt-1 accent-emerald-600" />
                    <span>
                      {kod} numaralı, <b>{paraYaz(toplam.tutar, teklif.paraBirimi)} {toplam.ek}</b> tutarındaki teklifi okudum ve
                      onaylıyorum.
                    </span>
                  </label>
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 text-white font-semibold rounded-lg py-3 hover:bg-emerald-700 transition-colors"
                  >
                    Teklifi Onayla
                  </button>
                  <p className="text-[11px] text-slate-400">
                    Onayınız teklifi hazırlayan kişiye iletilir. Sözleşme ve sipariş detayları için sizinle ayrıca iletişime geçilir.
                  </p>
                </form>
              </details>
            ) : null}
            {searchParams.onay === "durum" && teklif.durum !== "ONAYLANDI" && (
              <p className="text-sm text-slate-500 mt-2">Bu teklif artık onaya açık değil. Lütfen bizimle iletişime geçin.</p>
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 text-sm">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Sorularınız için</p>
            <p className="font-semibold text-slate-800">{hazirlayan}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {telefon && (
                <a
                  href={`tel:${telefon.replace(/[^\d+]/g, "")}`}
                  className="text-sm border border-slate-300 bg-white rounded-full px-4 py-1.5 hover:border-teal-600"
                >
                  📞 {telefon}
                </a>
              )}
              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener"
                  className="text-sm border border-green-600 text-green-700 bg-white rounded-full px-4 py-1.5 hover:bg-green-50"
                >
                  💬 WhatsApp
                </a>
              )}
              {eposta && (
                <a
                  href={`mailto:${eposta}?subject=${encodeURIComponent(kod)}`}
                  className="text-sm border border-slate-300 bg-white rounded-full px-4 py-1.5 hover:border-teal-600"
                >
                  ✉️ E-posta
                </a>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-6">
          Bu sayfa yalnızca size gönderilen bağlantı ile açılır. · <a href="https://iklimofisi.com" className="hover:underline">iklimofisi.com</a>
        </p>
      </div>
    </main>
  );
}
