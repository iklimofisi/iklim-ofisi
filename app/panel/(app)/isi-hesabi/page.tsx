import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isiHesapOlustur, isiHesapKopyala, isiHesapSil } from "@/lib/isi-hesap-actions";
import { ILLER } from "@/lib/isi-hesap/iklim";
import HizliAramaListesi from "@/components/HizliAramaListesi";
import KaydetButonu from "@/components/KaydetButonu";
import SilButon from "@/components/SilButon";

export const dynamic = "force-dynamic";

const tarih = (d: Date) =>
  new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" }).format(new Date(d));
const kw = (x: number) => x.toLocaleString("tr-TR", { maximumFractionDigits: 1 });

export default async function IsiHesaplariSayfasi() {
  const [hesaplar, musteriler, modelSayisi] = await Promise.all([
    prisma.isiHesap.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        ad: true,
        il: true,
        toplamKw: true,
        olusturanAdi: true,
        updatedAt: true,
        teklifId: true,
        musteri: { select: { ad: true } },
        teklif: { select: { teklifNo: true } },
      },
    }),
    prisma.musteri.findMany({ orderBy: { ad: "asc" }, select: { id: true, ad: true } }),
    prisma.isiPompasiModeli.count({ where: { aktif: true } }),
  ]);

  const dugme = "focus-ring text-xs text-metin/50 hover:text-soguk-dim font-medium";
  const alan = "focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white";

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
        <h1 className="font-display text-2xl font-semibold text-metin">Isı Pompası Hesabı</h1>
        <Link href="/panel/isi-hesabi/modeller" className="focus-ring text-sm font-medium border border-hat bg-white px-4 py-2 rounded-md text-metin/70 hover:border-soguk">
          ⚙ Isı pompası modelleri ({modelSayisi})
        </Link>
      </div>
      <p className="text-sm text-metin/60 mb-8 max-w-3xl">
        İl seçilir, odalar ve duvar / pencere / çatı bilgileri girilir; oda oda ısı kaybı (EN 12831), radyatör boyları (TS EN 442),
        yerden ısıtma boru aralığı ve devreleri (EN 1264), ısı pompası kapasitesi, boyler, tampon ve genleşme tankı hesaplanır.
        Sonuçta tesisat prensip şeması, serim krokileri, PDF rapor ve teklife aktarılabilen malzeme listesi çıkar.
        {modelSayisi === 0 && (
          <>
            {" "}
            <strong className="text-metin">Model önerisi için önce </strong>
            <Link href="/panel/isi-hesabi/modeller" className="text-soguk-dim hover:underline">
              ısı pompası modellerini
            </Link>{" "}
            tanımlayın.
          </>
        )}
      </p>

      <form action={isiHesapOlustur} className="bg-yuzey border border-hat rounded-lg p-5 mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.8fr_1.3fr_1.4fr_1.3fr_auto] items-end">
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Yeni hesap adı</label>
          <input name="ad" required maxLength={200} placeholder="örn. Ahmet Bey villa – ısı pompası" className={alan} />
        </div>
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">İl</label>
          <select name="il" defaultValue="İstanbul" className={alan}>
            {ILLER.map((i) => (
              <option key={i.ad} value={i.ad}>
                {i.ad} ({i.disSicaklik} °C)
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
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Başlangıç</label>
          <select name="sablon" defaultValue="ornek" className={alan}>
            <option value="ornek">Örnek daire odalarıyla</option>
            <option value="bos">Boş</option>
          </select>
        </div>
        <KaydetButonu basari={null} bekleme="Oluşturuluyor…">
          + Oluştur
        </KaydetButonu>
      </form>

      <HizliAramaListesi
        yerTutucu="Hızlı ara: hesap adı, müşteri, il…"
        bosMetin="Henüz ısı pompası hesabı yok."
        birim="hesap"
        satirlar={hesaplar.map((h) => ({
          id: h.id,
          aramaMetni: [h.ad, h.musteri?.ad, h.il, h.olusturanAdi].filter(Boolean).join(" "),
          icerik: (
            <div className="bg-yuzey border border-hat rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm hover:border-soguk transition-colors">
              <Link href={`/panel/isi-hesabi/${h.id}`} className="focus-ring min-w-0 flex-1">
                <p className="font-medium text-metin text-sm truncate">{h.ad}</p>
                <p className="text-xs text-metin/50 mt-1">
                  {h.musteri?.ad ? `${h.musteri.ad} · ` : ""}
                  {h.il} · {kw(h.toplamKw)} kW
                  {h.teklif && ` · Teklif #${h.teklif.teklifNo}`}
                  {" · "}güncelleme {tarih(h.updatedAt)}
                  {h.olusturanAdi && ` · ${h.olusturanAdi}`}
                </p>
              </Link>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a href={`/api/isi-hesap/${h.id}/pdf`} target="_blank" rel="noopener" className={dugme}>
                  PDF
                </a>
                <Link href={`/panel/isi-hesabi/${h.id}`} className={dugme}>
                  Düzenle
                </Link>
                <form action={isiHesapKopyala.bind(null, h.id)}>
                  <KaydetButonu basari={null} bekleme="…" className={dugme}>
                    Kopyala
                  </KaydetButonu>
                </form>
                <SilButon id={h.id} action={isiHesapSil} onayMesaji={`"${h.ad}" hesabı silinsin mi?`} />
              </div>
            </div>
          ),
        }))}
      />
    </div>
  );
}
