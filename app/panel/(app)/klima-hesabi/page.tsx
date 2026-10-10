import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { klimaHesapOlustur, klimaHesapKopyala, klimaHesapSil } from "@/lib/klima-hesap-actions";
import { ILLER } from "@/lib/isi-hesap/iklim";
import HizliAramaListesi from "@/components/HizliAramaListesi";
import KaydetButonu from "@/components/KaydetButonu";
import SilButon from "@/components/SilButon";
import KlimaKaynakSecici from "@/components/KlimaKaynakSecici";

export const dynamic = "force-dynamic";

const tarih = (d: Date) =>
  new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" }).format(new Date(d));
const kw = (x: number) => x.toLocaleString("tr-TR", { maximumFractionDigits: 1 });

export default async function KlimaHesaplariSayfasi() {
  const [hesaplar, musteriler, isiHesaplari] = await Promise.all([
    prisma.klimaHesap.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        ad: true,
        il: true,
        toplamKw: true,
        olusturanAdi: true,
        updatedAt: true,
        musteri: { select: { ad: true } },
        teklif: { select: { teklifNo: true } },
      },
    }),
    prisma.musteri.findMany({ orderBy: { ad: "asc" }, select: { id: true, ad: true } }),
    prisma.isiHesap.findMany({ orderBy: { updatedAt: "desc" }, select: { id: true, ad: true } }),
  ]);

  const dugme = "focus-ring text-xs text-metin/50 hover:text-soguk-dim font-medium";
  const alan = "focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white";

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">Klima & VRF Hesabı</h1>
      <p className="text-sm text-metin/60 mb-8 max-w-3xl">
        İl seçilir, odalar ve cephe bilgileri girilir; oda oda soğutma (güneş, iletim, kişi, cihaz, nem) ve ısıtma yükü, iç ünite seçimi,
        VRF / mini VRF / multi split dış ünite seçimi ve bağlantı oranı, soğutucu boru çapları, branşman kitleri, mesafe ve kot kontrolleri,
        ek gaz ve EN 378 oda kontrolü hesaplanır. Sonuçta boru şeması, PDF rapor ve teklife aktarılabilen malzeme listesi çıkar.
      </p>

      <form action={klimaHesapOlustur} className="bg-yuzey border border-hat rounded-lg p-5 mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.8fr_1.3fr_1.4fr_1.6fr_auto] items-end">
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Yeni hesap adı</label>
          <input name="ad" required maxLength={200} placeholder="örn. Bayraklı ofis – VRF" className={alan} />
        </div>
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">İl</label>
          <select name="il" defaultValue="İstanbul" className={alan}>
            {ILLER.map((i) => (
              <option key={i.ad} value={i.ad}>
                {i.ad} (yaz {i.yazKT} °C)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Müşteri (isteğe bağlı)</label>
          <select name="musteriId" defaultValue="" className={alan}>
            <option value="">— Seçilmedi —</option>
            {musteriler.map((m) => (
              <option key={m.id} value={m.id}>
                {m.ad}
              </option>
            ))}
          </select>
        </div>
        <KlimaKaynakSecici isiHesaplari={isiHesaplari} />
        <KaydetButonu basari={null} bekleme="Oluşturuluyor…">
          + Oluştur
        </KaydetButonu>
      </form>

      <HizliAramaListesi
        yerTutucu="Hızlı ara: hesap adı, müşteri, il…"
        bosMetin="Henüz klima / VRF hesabı yok."
        birim="hesap"
        satirlar={hesaplar.map((h) => ({
          id: h.id,
          aramaMetni: [h.ad, h.musteri?.ad, h.il, h.olusturanAdi].filter(Boolean).join(" "),
          icerik: (
            <div className="bg-yuzey border border-hat rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm hover:border-soguk transition-colors">
              <Link href={`/panel/klima-hesabi/${h.id}`} className="focus-ring min-w-0 flex-1">
                <p className="font-medium text-metin text-sm truncate">{h.ad}</p>
                <p className="text-xs text-metin/50 mt-1">
                  {h.musteri?.ad ? `${h.musteri.ad} · ` : ""}
                  {h.il} · {kw(h.toplamKw)} kW soğutma
                  {h.teklif && ` · Teklif #${h.teklif.teklifNo}`}
                  {" · "}güncelleme {tarih(h.updatedAt)}
                  {h.olusturanAdi && ` · ${h.olusturanAdi}`}
                </p>
              </Link>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a href={`/api/klima-hesap/${h.id}/pdf`} target="_blank" rel="noopener" className={dugme}>
                  PDF
                </a>
                <Link href={`/panel/klima-hesabi/${h.id}`} className={dugme}>
                  Düzenle
                </Link>
                <form action={klimaHesapKopyala.bind(null, h.id)}>
                  <KaydetButonu basari={null} bekleme="…" className={dugme}>
                    Kopyala
                  </KaydetButonu>
                </form>
                <SilButon id={h.id} action={klimaHesapSil} onayMesaji={`"${h.ad}" hesabı silinsin mi?`} />
              </div>
            </div>
          ),
        }))}
      />
    </div>
  );
}
