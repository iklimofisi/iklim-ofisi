import { prisma } from "@/lib/prisma";
import { GERCEK_MUSTERI } from "@/lib/musterisiz";
import { musteriEkle, musteriSil } from "@/lib/actions"; // DÜZELTİLDİ: musteriEkle eklendi
import KayitIslemButonu from "@/components/KayitIslemButonu";
import HizliAramaListesi from "@/components/HizliAramaListesi";
import KaydetButonu from "@/components/KaydetButonu";
import Link from "next/link";
import { sayfaYetkisi } from "@/lib/oturum";

export const dynamic = "force-dynamic";

export default async function MusterilerPage() {
  const giren = await sayfaYetkisi("musteri");
  const [musteriler, kullanicilar] = await Promise.all([
    prisma.musteri.findMany({
      where: GERCEK_MUSTERI,
      orderBy: { ad: "asc" },
      include: { yetkililer: { select: { ad: true, telefon: true, email: true } } },
    }),
    prisma.kullanici.findMany({ select: { id: true, ad: true }, orderBy: { ad: "asc" } }),
  ]);
  const kullaniciAdi = new Map(kullanicilar.map((k) => [k.id, k.ad]));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-metin mb-6">Müşteriler</h1>

      {/* YENİ MÜŞTERİ EKLEME FORMU — kapalı durur, listeyi aşağı itmez */}
      <details className="group bg-yuzey border border-hat rounded-lg mb-6">
        <summary className="cursor-pointer select-none list-none px-5 py-3 text-sm font-semibold text-soguk-dim flex items-center justify-between">
          <span>+ Yeni Müşteri Ekle</span>
          <span className="text-metin/40 text-xs group-open:hidden">formu aç ▾</span>
          <span className="text-metin/40 text-xs hidden group-open:inline">kapat ▴</span>
        </summary>
      <form action={musteriEkle} className="px-5 pb-5">

        {/* 1. SATIR: FİRMA ADI VE YETKİLİ BİLGİLERİ */}
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Firma / Müşteri Adı *</label>
            <input
              name="ad"
              required
              placeholder="Firma veya Kişi unvanı"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Müşteri Yetkilisi Ad Soyad</label>
            <input
              name="yetkiliAdi"
              placeholder="Örn: Ahmet Yılmaz"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white font-medium text-soguk-dim"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Yetkili Telefon</label>
            <input
              name="yetkiliTelefon"
              placeholder="05xx xxx xx xx"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
        </div>

        {/* 2. SATIR: İLETİŞİM BİLGİLERİ */}
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Yetkili E-posta</label>
            <input
              name="yetkiliEmail"
              type="email"
              placeholder="ahmet@firma.com"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Firma Santral Tel</label>
            <input
              name="telefon"
              placeholder="0216 xxx xx xx"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Vergi No / TC</label>
            <input
              name="vergiNo"
              placeholder="Opsiyonel"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
        </div>

        {/* 3. SATIR: E-POSTALAR */}
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Firma E-posta</label>
            <input
              name="email"
              type="email"
              placeholder="info@firma.com"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Muhasebe E-postası</label>
            <input
              name="muhasebeEmail"
              type="email"
              placeholder="muhasebe@firma.com (opsiyonel)"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
        </div>

        {/* 4. SATIR: ADRESLER */}
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Fatura Adresi</label>
            <input
              name="faturaAdresi"
              placeholder="Fatura kesilecek adres"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Sevk Adresi</label>
            <input
              name="sevkAdresi"
              placeholder="Ürünün gönderileceği adres"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
        </div>

        {giren.rol === "ADMIN" && (
        <div className="mb-3 max-w-sm">
          <label className="block text-xs font-medium text-metin/60 mb-1">Firma sorumlusu (cirosu bu kişiye yazılır)</label>
          <select name="sorumluKullaniciId" defaultValue={giren.id} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white">
            <option value="">— Atanmamış —</option>
            {kullanicilar.map((k) => (
              <option key={k.id} value={k.id}>
                {k.ad}
              </option>
            ))}
          </select>
        </div>
        )}

        <KaydetButonu basari="Müşteri eklendi.">Müşteri Ekle</KaydetButonu>
      </form>
      </details>

      {/* MÜŞTERİ LİSTESİ — yazdıkça anında süzülür */}
      <HizliAramaListesi
        yerTutucu="Hızlı ara: firma, yetkili, telefon, e-posta, vergi no…"
        bosMetin="Henüz kayıtlı müşteri yok."
        birim="müşteri"
        bosluk="space-y-2"
        baslik={
          <div className="hidden md:grid grid-cols-[2fr_1.5fr_1.2fr_1.5fr_1fr_auto] gap-3 px-4 pb-1 text-xs text-metin/50 font-semibold">
            <span>Firma / Müşteri Adı</span>
            <span>Müşteri Yetkilisi</span>
            <span>Telefon</span>
            <span>E-posta</span>
            <span>Sorumlu</span>
            <span className="w-36" />
          </div>
        }
        satirlar={musteriler.map((m) => ({
          id: m.id,
          aramaMetni: [
            m.ad,
            m.yetkiliAdi,
            m.yetkiliTelefon,
            m.yetkiliEmail,
            m.telefon,
            m.email,
            m.muhasebeEmail,
            m.vergiNo,
            m.sorumluKullaniciId ? kullaniciAdi.get(m.sorumluKullaniciId) : "",
            ...m.yetkililer.flatMap((y) => [y.ad, y.telefon, y.email]),
          ]
            .filter(Boolean)
            .join(" "),
          icerik: (
            <div className="bg-yuzey border border-hat rounded-lg px-4 py-3 grid md:grid-cols-[2fr_1.5fr_1.2fr_1.5fr_1fr_auto] gap-x-3 gap-y-1 items-center text-sm hover:border-soguk transition-colors">
              <Link href={`/panel/musteriler/${m.id}`} className="font-semibold text-metin hover:text-soguk-dim truncate">
                {m.ad}
              </Link>
              <div className="text-metin font-medium min-w-0">
                {m.yetkiliAdi ? (
                  <>
                    <div className="truncate">{m.yetkiliAdi}</div>
                    {m.yetkiliTelefon && <div className="text-xs text-metin/50 font-normal">{m.yetkiliTelefon}</div>}
                  </>
                ) : (
                  <span className="text-metin/30">—</span>
                )}
                {m.yetkililer.length > 0 && (
                  <div className="text-[11px] text-metin/45 font-normal">+{m.yetkililer.length} yetkili</div>
                )}
              </div>
              <span className="text-metin/70 truncate">{m.telefon || m.yetkiliTelefon || "—"}</span>
              <span className="text-metin/70 truncate">{m.email || m.yetkiliEmail || "—"}</span>
              <span className={`truncate text-xs ${m.sorumluKullaniciId ? "text-metin/70" : "text-sicak-dim"}`} title="Firma sorumlusu">
                {(m.sorumluKullaniciId && kullaniciAdi.get(m.sorumluKullaniciId)) || "atanmamış"}
              </span>
              <div className="flex items-center justify-end gap-4 w-36 whitespace-nowrap">
                <Link href={`/panel/musteriler/${m.id}`} className="text-xs font-medium text-soguk-dim hover:underline">
                  Görüntüle →
                </Link>
                <KayitIslemButonu
                  id={m.id}
                  action={musteriSil}
                  etiket="Sil"
                  onayBasligi="Silme onayı"
                  onayMesaji="Yalnız hiç teklifi, siparişi, cari hareketi ve görüşmesi olmayan müşteri silinir; kaydı olan müşteri korunur."
                  tehlikeli
                />
              </div>
            </div>
          ),
        }))}
      />
    </div>
  );
}