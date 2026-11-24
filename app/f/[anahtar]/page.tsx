import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { LogoIsaret } from "@/components/Logo";
import { paylasilanFiyatListesi, fiyatLinkiGoruntulendi } from "@/lib/fiyat-paylasim";
import { onizlemeBotuMu } from "@/lib/teklif-paylasim";
import { getSirketAyarlari } from "@/lib/sirket";
import { ISTIRAK_METNI } from "@/lib/kurumsal";
import { whatsappLinki } from "@/lib/gorusme";

// -----------------------------------------------------------------------------
// MÜŞTERİNİN AÇTIĞI FİYAT LİSTESİ SAYFASI (WhatsApp / e-posta ile gönderilen gizli link)
// PDF her açılışta listenin O ANKİ fiyatlarıyla üretilir: panelde kaydedilen fiyat anında
// görünür. Alış fiyatı, kâr vb. iç bilgi yoktur. Arama motorlarına kapalıdır.
// -----------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { anahtar: string } }): Promise<Metadata> {
  const sonuc = await paylasilanFiyatListesi(params.anahtar);
  const baslik = sonuc ? sonuc.liste.baslik : "Fiyat listesi bulunamadı";
  return {
    title: { absolute: `${baslik} · İklim Ofisi` },
    description: "İklim Ofisi güncel fiyat listesi",
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
    // WhatsApp önizlemesinde fiyat görünmesin
    openGraph: { title: `${baslik} · İklim Ofisi`, description: "Güncel fiyat listesini görüntülemek için dokunun.", images: ["/og-image.png"] },
  };
}

const saatliTarih = (d: Date) =>
  new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  }).format(new Date(d));

const tarihYaz = (d: Date) =>
  new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" }).format(new Date(d));

export default async function FiyatListesiLinki({ params }: { params: { anahtar: string } }) {
  const sonuc = await paylasilanFiyatListesi(params.anahtar);

  if (!sonuc) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md text-center bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <LogoIsaret boyut={44} baslik="İklim Ofisi" className="mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-slate-800 mb-2">Bu fiyat listesi linki artık geçerli değil</h1>
          <p className="text-sm text-slate-500">Link iptal edilmiş veya hatalı olabilir. Güncel fiyat listesi için lütfen bizimle iletişime geçin.</p>
          <a href="https://iklimofisi.com/iletisim" className="inline-block mt-5 text-sm font-medium text-teal-700 hover:underline">
            İletişim →
          </a>
        </div>
      </main>
    );
  }

  const { liste, paylasimId } = sonuc;
  // Panel kullanıcıları ve link önizleme botları açılış sayılmaz
  const panelden = Boolean(cookies().get("oturum")?.value);
  if (!panelden && !onizlemeBotuMu(headers().get("user-agent"))) await fiyatLinkiGoruntulendi(paylasimId);

  const sirket = await getSirketAyarlari();
  const pdfYolu = `/f/${params.anahtar}/pdf`;
  const whatsapp = sirket.whatsapp ? whatsappLinki(sirket.whatsapp, `Merhaba, "${liste.baslik}" fiyat listeniz hakkında bilgi almak istiyorum.`) : null;

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <LogoIsaret boyut={40} baslik={sirket.unvan} className="shrink-0" />
          <div className="min-w-0">
            <p className="font-bold text-slate-800 leading-tight">{sirket.unvan}</p>
            {ISTIRAK_METNI && <p className="text-[11px] text-slate-500">{ISTIRAK_METNI}</p>}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <p className="text-xs font-semibold tracking-widest text-teal-700 uppercase mb-1">Fiyat Listesi</p>
            <h1 className="text-xl font-semibold text-slate-800">{liste.baslik}</h1>
            {liste.aciklama && <p className="text-sm text-slate-500 mt-1 whitespace-pre-line">{liste.aciklama}</p>}
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 text-sm text-teal-900">
              <p className="font-semibold">Bu liste her zaman günceldir.</p>
              <p className="text-teal-800/80 mt-0.5">
                Fiyatlar değiştikçe bu link kendiliğinden yenilenir; her açtığınızda son fiyatları görürsünüz.
              </p>
              <p className="text-xs text-teal-800/70 mt-2">
                Son güncelleme: {saatliTarih(liste.updatedAt)} · {liste._count.kalemler} ürün
                {liste.gecerlilikTarihi && ` · Geçerlilik: ${tarihYaz(liste.gecerlilikTarihi)}`}
              </p>
            </div>
            <a
              href={pdfYolu}
              target="_blank"
              rel="noopener"
              className="flex items-center justify-center gap-2 w-full bg-teal-700 text-white font-semibold rounded-lg py-3.5 hover:bg-teal-800 transition-colors"
            >
              📄 Fiyat Listesini Görüntüle (PDF)
            </a>
            <a href={`${pdfYolu}?indir=1`} className="block text-center text-sm text-teal-700 hover:underline">
              PDF olarak indir
            </a>
          </div>
          <div className="px-6 pb-6 text-sm text-slate-600 space-y-2">
            <p className="text-slate-500">Sipariş ve sorularınız için:</p>
            <div className="flex flex-wrap gap-2">
              {whatsapp && (
                <a href={whatsapp} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 bg-[#1fa855] text-white rounded-md px-4 py-2 font-medium hover:bg-[#178a45]">
                  💬 WhatsApp
                </a>
              )}
              {sirket.telefon && (
                <a href={`tel:${sirket.telefon.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 border border-slate-300 rounded-md px-4 py-2 hover:border-teal-600">
                  📞 {sirket.telefon}
                </a>
              )}
              {sirket.email && (
                <a href={`mailto:${sirket.email}`} className="inline-flex items-center gap-1.5 border border-slate-300 rounded-md px-4 py-2 hover:border-teal-600">
                  ✉️ {sirket.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
