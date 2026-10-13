import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { GERCEK_MUSTERI } from "@/lib/musterisiz";
import { havalandirmaHesapOlustur, havalandirmaHesapKopyala, havalandirmaHesapSil } from "@/lib/havalandirma-actions";
import { ILLER } from "@/lib/isi-hesap/iklim";
import HizliAramaListesi from "@/components/HizliAramaListesi";
import KaydetButonu from "@/components/KaydetButonu";
import SilButon from "@/components/SilButon";
import HavalandirmaKaynakSecici from "@/components/HavalandirmaKaynakSecici";

export const dynamic = "force-dynamic";

const tarih = (d: Date) =>
  new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" }).format(new Date(d));
const m3 = (x: number) => x.toLocaleString("tr-TR", { maximumFractionDigits: 0 });

export default async function HavalandirmaHesaplariSayfasi() {
  const [hesaplar, musteriler, klimaHesaplari] = await Promise.all([
    prisma.havalandirmaHesap.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        ad: true,
        il: true,
        toplamDebi: true,
        olusturanAdi: true,
        updatedAt: true,
        musteri: { select: { ad: true } },
        teklif: { select: { teklifNo: true } },
      },
    }),
    prisma.musteri.findMany({ where: GERCEK_MUSTERI, orderBy: { ad: "asc" }, select: { id: true, ad: true } }),
    prisma.klimaHesap.findMany({ orderBy: { updatedAt: "desc" }, select: { id: true, ad: true } }),
  ]);

  const dugme = "focus-ring text-xs text-metin/50 hover:text-soguk-dim font-medium";
  const alan = "focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white";

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">Havalandırma Hesabı</h1>
      <p className="text-sm text-metin/60 mb-8 max-w-3xl">
        Mahaller (ofis, mağaza, restoran, okul, konut, WC, mutfak, otopark, teknik mahal…) girilir; TS EN 16798-1 ya da ASHRAE 62.1&apos;e göre taze
        hava ve egzoz debileri, santral dengesi, ısı geri kazanımı, ısıtıcı / soğutucu batarya kapasiteleri, kanal ölçüleri, basınç kayıpları, fan
        basıncı ve gücü (SFP) hesaplanır. Sonuçta tek hat kanal şeması, PDF rapor ve teklife aktarılabilen malzeme listesi çıkar.
      </p>

      <form action={havalandirmaHesapOlustur} className="bg-yuzey border border-hat rounded-lg p-5 mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.8fr_1.3fr_1.4fr_1.6fr_auto] items-end">
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Yeni hesap adı</label>
          <input name="ad" required maxLength={200} placeholder="örn. Bayraklı ofis – havalandırma" className={alan} />
        </div>
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">İl</label>
          <select name="il" defaultValue="İstanbul" className={alan}>
            {ILLER.map((i) => (
              <option key={i.ad} value={i.ad}>
                {i.ad} (kış {i.disSicaklik} / yaz {i.yazKT} °C)
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
        <HavalandirmaKaynakSecici klimaHesaplari={klimaHesaplari} />
        <KaydetButonu basari={null} bekleme="Oluşturuluyor…">
          + Oluştur
        </KaydetButonu>
      </form>

      <HizliAramaListesi
        yerTutucu="Hızlı ara: hesap adı, müşteri, il…"
        bosMetin="Henüz havalandırma hesabı yok."
        birim="hesap"
        satirlar={hesaplar.map((h) => ({
          id: h.id,
          aramaMetni: [h.ad, h.musteri?.ad, h.il, h.olusturanAdi].filter(Boolean).join(" "),
          icerik: (
            <div className="bg-yuzey border border-hat rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm hover:border-soguk transition-colors">
              <Link href={`/panel/havalandirma-hesabi/${h.id}`} className="focus-ring min-w-0 flex-1">
                <p className="font-medium text-metin text-sm truncate">{h.ad}</p>
                <p className="text-xs text-metin/50 mt-1">
                  {h.musteri?.ad ? `${h.musteri.ad} · ` : ""}
                  {h.il} · {m3(h.toplamDebi)} m³/h besleme
                  {h.teklif && ` · Teklif #${h.teklif.teklifNo}`}
                  {" · "}güncelleme {tarih(h.updatedAt)}
                  {h.olusturanAdi && ` · ${h.olusturanAdi}`}
                </p>
              </Link>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a href={`/api/havalandirma-hesap/${h.id}/pdf`} target="_blank" rel="noopener" className={dugme}>
                  PDF
                </a>
                <Link href={`/panel/havalandirma-hesabi/${h.id}`} className={dugme}>
                  Düzenle
                </Link>
                <form action={havalandirmaHesapKopyala.bind(null, h.id)}>
                  <KaydetButonu basari={null} bekleme="…" className={dugme}>
                    Kopyala
                  </KaydetButonu>
                </form>
                <SilButon id={h.id} action={havalandirmaHesapSil} onayMesaji={`"${h.ad}" hesabı silinsin mi?`} />
              </div>
            </div>
          ),
        }))}
      />
    </div>
  );
}
