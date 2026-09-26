import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { suankiKullanici } from "@/lib/oturum";

export const dynamic = "force-dynamic";

// İşlem adlarının Türkçe karşılıkları
const ISLEM_ADI: Record<string, string> = {
  girisBasarili: "Panele giriş yaptı",
  girisBasarisiz: "Hatalı giriş denemesi",
  musteriEkle: "Müşteri ekledi",
  musteriGuncelle: "Müşteri güncelledi",
  musteriSil: "Müşteri sildi",
  hizliMusteriEkle: "Hızlı müşteri ekledi",
  musteriYetkiliEkle: "Müşteri yetkilisi ekledi",
  musteriYetkiliGuncelle: "Müşteri yetkilisi güncelledi",
  musteriYetkiliSil: "Müşteri yetkilisi sildi",
  teklifEkle: "Teklif oluşturdu",
  teklifGuncelle: "Teklif güncelledi (revizyon)",
  teklifDurumGuncelle: "Teklif durumu değiştirdi",
  teklifSil: "Teklif sildi",
  teklifTakipNotuGuncelle: "Teklif takip notu yazdı",
  teklifMusteriyeEpostaGonder: "Teklifi müşteriye e-postaladı",
  tekliflerExcelImport: "Excel'den teklif aktardı",
  maliyetDosyaYukle: "Maliyet dosyası yükledi",
  cariHareketEkle: "Cari hareket ekledi",
  cariHareketSil: "Cari hareket sildi",
  tedarikciEkle: "Tedarikçi ekledi",
  tedarikciHareketEkle: "Tedarikçi hareketi ekledi",
  tedarikciHareketSil: "Tedarikçi hareketi sildi",
  satinalmaTeklifiEkle: "Satınalma teklifi ekledi",
  satinalmaTeklifiSil: "Satınalma teklifi sildi",
  satinalmaTeklifiniDonustur: "Satınalma teklifini satış teklifine çevirdi",
  stokGirisiEkle: "Stok girişi yaptı",
  urunStokVeMaliyetGuncelle: "Ürün stok/maliyet güncelledi",
  sirketAyarlariGuncelle: "Şirket bilgilerini güncelledi",
  sablonEkle: "Teklif şablonu ekledi",
  sablonGuncelle: "Teklif şablonu güncelledi",
  sablonSil: "Teklif şablonu sildi",
  kullaniciEkle: "Kullanıcı ekledi",
  kullaniciSil: "Kullanıcı sildi",
  kullaniciSifreSifirla: "Kullanıcı şifresi sıfırladı",
  profilGuncelle: "Profilini güncelledi",
  siparisTalebiOlustur: "Sipariş talebi oluşturdu",
  siparisOlustur: "Teklifi siparişe çevirdi",
  siparisOnayla: "Siparişi onayladı",
  siparisReddet: "Siparişi reddetti",
  siparisDurumGuncelle: "Sipariş durumu değiştirdi",
  siparisSil: "Sipariş sildi",
  siparisFaturaGuncelle: "Sipariş fatura bilgisi girdi",
  sevkiyatEkle: "Sevkiyat kaydı ekledi",
  sevkiyatSil: "Sevkiyat kaydı sildi",
  teslimKaydiEkle: "Teslim kaydı ekledi",
  teslimKaydiSil: "Teslim kaydı sildi",
  kesifEkle: "Keşif formu ekledi",
  kesifSil: "Keşif formu sildi",
  kesifiTeklifeDonustur: "Keşfi teklife çevirdi",
  webTalebiOkunduIsaretle: "Web talebini okundu yaptı",
  webTalebiSil: "Web talebi sildi",
  markaEkle: "Marka ekledi",
  markaSil: "Marka sildi",
  urunEkle: "Ürün ekledi",
  urunSil: "Ürün sildi",
  urunlerTumunuSil: "TÜM ürünleri silmeyi denedi",
  urunlerExcelIceAktar: "Excel'den ürün aktardı",
  projeEkle: "Proje ekledi",
  projeGuncelle: "Proje güncelledi",
  projeSil: "Proje sildi",
  projeTakipNotuGuncelle: "Proje takip notu yazdı",
  ziyaretEkle: "Ziyaret kaydı ekledi",
  ziyaretHatirlatmaTamamlandi: "Hatırlatmayı tamamladı",
  ziyaretSil: "Ziyaret kaydı sildi",
};

const SAYFA_BOYUTU = 50;

const zamanBicimi = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

function veriAc(metin: string | null): Record<string, unknown> | null {
  if (!metin) return null;
  try {
    const v = JSON.parse(metin);
    return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

// İşlemin ilgili olduğu kayda bağlantı (silinen kayıtlar için bağlantı verilmez)
function kayitBaglantisi(islem: string, veri: Record<string, unknown> | null): { href: string; etiket: string } | null {
  if (!veri || islem.endsWith("Sil")) return null;
  const s = (a: string) => (typeof veri[a] === "string" && veri[a] ? (veri[a] as string) : null);
  if (s("teklifId")) return { href: `/panel/teklifler/${s("teklifId")}`, etiket: "Teklife git" };
  if (s("siparisId")) return { href: `/panel/siparisler/${s("siparisId")}`, etiket: "Siparişe git" };
  if (s("projeId") && islem.startsWith("proje")) return { href: `/panel/projeler/${s("projeId")}`, etiket: "Projeye git" };
  if (s("musteriId")) return { href: `/panel/musteriler/${s("musteriId")}`, etiket: "Müşteriye git" };
  if (s("projeId")) return { href: `/panel/projeler/${s("projeId")}`, etiket: "Projeye git" };
  return null;
}

// Kayıttaki formdan birkaç okunabilir bilgi (başlık, ad, tutar...) çıkarır
function kisaOzet(veri: Record<string, unknown> | null): string {
  if (!veri) return "";
  const kaynak = (veri.silinenKayit as Record<string, unknown> | undefined) ?? veri;
  const parcalar: string[] = [];
  for (const a of ["baslik", "ad", "musteriAdi", "aciklama", "durum", "tutar", "email", "not"]) {
    const v = kaynak[a];
    if ((typeof v === "string" && v.trim()) || typeof v === "number") {
      const metin = String(v);
      parcalar.push(metin.length > 60 ? metin.slice(0, 60) + "…" : metin);
    }
    if (parcalar.length >= 2) break;
  }
  if (typeof kaynak.teklifNo === "number") parcalar.unshift(`TKL-${String(kaynak.teklifNo).padStart(4, "0")}`);
  return parcalar.join(" · ");
}

function trGunBaslangici(tarih: string, gunSonu = false) {
  // YYYY-MM-DD → Türkiye saatiyle gün başı / gün sonu (UTC+3)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tarih)) return undefined;
  const d = new Date(`${tarih}T${gunSonu ? "23:59:59.999" : "00:00:00.000"}+03:00`);
  return isNaN(d.getTime()) ? undefined : d;
}

export default async function IslemGecmisiSayfasi({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const giren = await suankiKullanici();
  if (!giren || giren.rol !== "ADMIN") redirect("/panel");

  // Adres çubuğunda aynı parametre iki kez yazılsa bile ilkini al
  const tek = (a: string) => {
    const v = searchParams[a];
    return (Array.isArray(v) ? v[0] : v) ?? "";
  };
  const kisi = tek("kisi");
  const islem = tek("islem");
  const tur = tek("tur"); // "silme" | "giris" | ""
  const bas = tek("bas");
  const bit = tek("bit");
  const hedef = tek("hedef").trim();
  const sayfa = Math.max(1, parseInt(tek("sayfa") || "1", 10) || 1);

  const basTarih = trGunBaslangici(bas);
  const bitTarih = trGunBaslangici(bit, true);

  const where = {
    ...(kisi ? { kullaniciId: kisi } : {}),
    ...(islem ? { islem } : tur === "silme" ? { islem: { endsWith: "Sil" } } : tur === "giris" ? { islem: { startsWith: "giris" } } : {}),
    ...(basTarih || bitTarih ? { createdAt: { ...(basTarih ? { gte: basTarih } : {}), ...(bitTarih ? { lte: bitTarih } : {}) } } : {}),
    ...(hedef ? { OR: [{ hedefId: hedef }, { veri: { contains: hedef } }] } : {}),
  };

  let kayitlar: {
    id: string;
    createdAt: Date;
    kullaniciId: string | null;
    kullaniciAd: string | null;
    islem: string;
    hedefId: string | null;
    veri: string | null;
  }[] = [];
  let toplam = 0;
  let tabloYok = false;

  try {
    [kayitlar, toplam] = await Promise.all([
      prisma.islemKaydi.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (sayfa - 1) * SAYFA_BOYUTU,
        take: SAYFA_BOYUTU,
      }),
      prisma.islemKaydi.count({ where }),
    ]);
  } catch {
    tabloYok = true;
  }

  const kullanicilar = await prisma.kullanici.findMany({ orderBy: { ad: "asc" }, select: { id: true, ad: true } });
  const sayfaSayisi = Math.max(1, Math.ceil(toplam / SAYFA_BOYUTU));

  const sorgu = (ek: Record<string, string | number>) => {
    const p = new URLSearchParams();
    const tum = { kisi, islem, tur, bas, bit, hedef, ...ek } as Record<string, string | number>;
    for (const [a, v] of Object.entries(tum)) if (v !== "" && v !== undefined && !(a === "sayfa" && v === 1)) p.set(a, String(v));
    const q = p.toString();
    return q ? `/panel/islem-gecmisi?${q}` : "/panel/islem-gecmisi";
  };

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel · Yönetici</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">İşlem Geçmişi</h1>
      <p className="text-sm text-metin/60 mb-6">
        Panelde kim, ne zaman, hangi işlemi yaptı. Silinen kayıtların silinmeden önceki hâli de burada saklanır —
        yanlışlıkla silinen bir bilgiyi buradan bulup geri girebilirsiniz.
      </p>

      {tabloYok && (
        <div className="bg-sicak-light text-sicak-dim rounded-md px-4 py-3 mb-6 text-sm">
          İşlem geçmişi tablosu veritabanında henüz yok. Neon SQL Editor&apos;de
          <b> prisma/manuel/2026-09-27_islem_kaydi_ve_whatsapp.sql</b> dosyasını çalıştırın; sonrasında yapılan işlemler
          burada görünmeye başlar.
        </div>
      )}

      {/* Filtreler */}
      <form method="get" className="bg-yuzey border border-hat rounded-lg p-4 mb-6 grid sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Kişi</label>
          <select name="kisi" defaultValue={kisi} className="focus-ring w-full border border-hat rounded-md px-2 py-2 text-sm bg-white">
            <option value="">Herkes</option>
            {kullanicilar.map((k) => (
              <option key={k.id} value={k.id}>
                {k.ad}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Tür</label>
          <select name="tur" defaultValue={tur} className="focus-ring w-full border border-hat rounded-md px-2 py-2 text-sm bg-white">
            <option value="">Tüm işlemler</option>
            <option value="silme">Yalnızca silmeler</option>
            <option value="giris">Giriş denemeleri</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">İşlem</label>
          <select name="islem" defaultValue={islem} className="focus-ring w-full border border-hat rounded-md px-2 py-2 text-sm bg-white">
            <option value="">Hepsi</option>
            {Object.entries(ISLEM_ADI)
              .sort((a, b) => a[1].localeCompare(b[1], "tr"))
              .map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Başlangıç</label>
          <input type="date" name="bas" defaultValue={bas} className="focus-ring w-full border border-hat rounded-md px-2 py-2 text-sm bg-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Bitiş</label>
          <input type="date" name="bit" defaultValue={bit} className="focus-ring w-full border border-hat rounded-md px-2 py-2 text-sm bg-white" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="focus-ring flex-1 bg-soguk text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim">
            Filtrele
          </button>
          <Link href="/panel/islem-gecmisi" className="focus-ring px-3 py-2 rounded-md text-sm border border-hat text-metin/70 hover:bg-zemin">
            Temizle
          </Link>
        </div>
        {hedef && <input type="hidden" name="hedef" value={hedef} />}
      </form>

      {hedef && (
        <p className="text-xs text-metin/60 mb-4">
          Yalnızca <span className="font-mono">{hedef}</span> kaydıyla ilgili işlemler gösteriliyor ·{" "}
          <Link href={sorgu({ hedef: "", sayfa: 1 })} className="text-soguk-dim underline">
            tümünü göster
          </Link>
        </p>
      )}

      <p className="text-xs text-metin/50 mb-2">{toplam.toLocaleString("tr-TR")} kayıt</p>

      <div className="bg-yuzey border border-hat rounded-lg divide-y divide-hat">
        {kayitlar.length === 0 && !tabloYok && <p className="px-5 py-8 text-sm text-metin/50 text-center">Kayıt bulunamadı.</p>}
        {kayitlar.map((k) => {
          const veri = veriAc(k.veri);
          const baglanti = kayitBaglantisi(k.islem, veri);
          const silme = k.islem.endsWith("Sil");
          const hatali = k.islem === "girisBasarisiz";
          const ozet = kisaOzet(veri);
          return (
            <details key={k.id} className="group px-5 py-3">
              <summary className="flex flex-wrap items-center gap-x-4 gap-y-1 cursor-pointer list-none">
                <span className="text-xs text-metin/50 font-mono w-32 shrink-0">{zamanBicimi.format(k.createdAt)}</span>
                <span className="text-sm font-medium text-metin w-36 shrink-0 truncate">{k.kullaniciAd ?? "—"}</span>
                <span
                  className={`text-sm ${silme ? "text-sicak-dim font-semibold" : hatali ? "text-sicak-dim" : "text-metin/80"}`}
                >
                  {ISLEM_ADI[k.islem] ?? k.islem}
                </span>
                {ozet && <span className="text-xs text-metin/50 truncate max-w-xs">{ozet}</span>}
                <span className="ml-auto flex items-center gap-3 text-xs">
                  {baglanti && (
                    <Link href={baglanti.href} className="text-soguk-dim hover:underline">
                      {baglanti.etiket} →
                    </Link>
                  )}
                  {k.hedefId && (
                    <Link href={sorgu({ hedef: k.hedefId, sayfa: 1 })} className="text-metin/40 hover:text-metin hover:underline">
                      bu kaydın geçmişi
                    </Link>
                  )}
                  <span className="text-metin/30 group-open:rotate-90 transition-transform">▸</span>
                </span>
              </summary>
              <pre className="mt-3 text-[11px] leading-relaxed bg-zemin border border-hat rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-all max-h-96">
                {veri ? JSON.stringify(veri, null, 2) : k.veri ?? "—"}
              </pre>
            </details>
          );
        })}
      </div>

      {sayfaSayisi > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          {sayfa > 1 ? (
            <Link href={sorgu({ sayfa: sayfa - 1 })} className="text-soguk-dim hover:underline">
              ← Daha yeni
            </Link>
          ) : (
            <span />
          )}
          <span className="text-metin/50 text-xs">
            Sayfa {sayfa} / {sayfaSayisi}
          </span>
          {sayfa < sayfaSayisi ? (
            <Link href={sorgu({ sayfa: sayfa + 1 })} className="text-soguk-dim hover:underline">
              Daha eski →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
