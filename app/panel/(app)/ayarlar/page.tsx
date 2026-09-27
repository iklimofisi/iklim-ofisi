import { prisma } from "@/lib/prisma";
import { sablonEkle, sablonGuncelle, sablonSil, sirketAyarlariGuncelle, epostaTestiGonder } from "@/lib/actions";
import { epostaAyarOzeti } from "@/lib/eposta";
import { getSirketAyarlari } from "@/lib/sirket";
import { suankiKullanici } from "@/lib/oturum"; // YETKİ KONTROLÜ İÇİN EKLENDİ
import { redirect } from "next/navigation";
import SilButon from "@/components/SilButon";
import KaydetButonu from "@/components/KaydetButonu";
import { sablonGrubu, sablonlariGrupla } from "@/lib/sablon";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AyarlarSayfasi() {
  const kullanici = await suankiKullanici();

  // YÖNETİCİ DEĞİLSE AYARLAR SAYFASINA ERİŞEMEZ
  if (!kullanici || kullanici.rol !== "ADMIN") {
    redirect("/panel?hata=yetkisiz-erisim");
  }

  const [sablonlar, sirket, sonEpostalar] = await Promise.all([
    prisma.teklifSablon.findMany({ orderBy: { sira: "asc" } }),
    getSirketAyarlari(),
    // Son e-posta gönderim denemeleri (başarılı / başarısız)
    prisma.islemKaydi
      .findMany({
        where: { islem: { in: ["eposta", "epostaHatasi"] } },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, createdAt: true, islem: true, veri: true },
      })
      .catch(() => []),
  ]);
  const epostaAyar = epostaAyarOzeti();
  const smtpTamam = !!(epostaAyar.host && epostaAyar.user && epostaAyar.sifreVar);
  const epostaSatirlari = sonEpostalar.map((k) => {
    let v: { konu?: string; alici?: string; hata?: string } = {};
    try {
      v = JSON.parse(k.veri ?? "{}");
    } catch {}
    return { id: k.id, zaman: k.createdAt, basarili: k.islem === "eposta", ...v };
  });
  const zamanYaz = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const gruplar = sablonlariGrupla(sablonlar);

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">Ayarlar</h1>
      <p className="text-sm text-metin/60 mb-2">
        Aşağıdaki <a href="#teklif-notlari" className="text-soguk-dim hover:underline">teklif notları</a>, teklif
        hazırlarken grup grup seçilir ve teklif çıktısının altında görünür.
      </p>
      <p className="text-sm text-metin/60 mb-2">
        <Link href="/panel/ayarlar/markalar" className="text-soguk-dim hover:underline">
          Markalar →
        </Link>{" "}
        sayfasından teklif kalemlerinde seçilebilecek ürün markalarını ve
        logolarını yönetebilirsin.
      </p>
      <p className="text-sm text-metin/60 mb-8">
        <Link href="/panel/ayarlar/urunler" className="text-soguk-dim hover:underline">
          Ürün Kataloğu →
        </Link>{" "}
        sayfasından liste fiyatlarını (örn. VRF ürünleri) sisteme yükle,
        teklif hazırlarken kalemleri tek tıkla oradan seç.
      </p>

      {/* YENİ: ŞİRKET BİLGİLERİ VE ADRES AYARLARI KUTUSU */}
      <div className="bg-yuzey border border-hat rounded-lg p-5 mb-8">
        <h2 className="font-display font-medium text-metin mb-1">
          🏢 Şirket Bilgileri & Adres Ayarları
        </h2>
        <p className="text-xs text-metin/60 mb-4">
          Buradaki bilgiler hem **Teklif Çıktılarında (PDF)** hem de **Kurumsal İletişim Sayfasında** otomatik görünür.
        </p>

        <form action={sirketAyarlariGuncelle} className="space-y-3">
          <input type="hidden" name="donus" value="/panel/ayarlar" />
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Şirket Unvanı *</label>
              <input
                name="unvan"
                required
                defaultValue={sirket.unvan}
                placeholder="Örn: İklim Ofisi Mühendislik A.Ş."
                className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Slogan / Alt Başlık</label>
              <input
                name="slogan"
                defaultValue={sirket.slogan ?? ""}
                placeholder="Örn: İklimlendirme & VRF Sistem Çözümleri"
                className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">Şirket Açık Adresi *</label>
            <textarea
              name="adres"
              rows={2}
              required
              defaultValue={sirket.adres ?? ""}
              placeholder="Şirketinizin açık adresi..."
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Telefon / Santral</label>
              <input
                name="telefon"
                defaultValue={sirket.telefon ?? ""}
                placeholder="+90 (216) 450 00 00"
                className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">E-posta Adresi</label>
              <input
                name="email"
                type="email"
                defaultValue={sirket.email ?? ""}
                placeholder="info@iklimofisi.com"
                className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Web Sitesi</label>
              <input
                name="web"
                defaultValue={sirket.web ?? ""}
                placeholder="www.iklimofisi.com"
                className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-metin/60 mb-1">WhatsApp Numarası (sitede buton olarak görünür)</label>
            <input
              name="whatsapp"
              defaultValue={sirket.whatsapp ?? ""}
              placeholder="Örn: 0532 123 45 67 — boş bırakılırsa WhatsApp butonu çıkmaz"
              className="focus-ring w-full sm:w-1/2 border border-hat rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-hat">
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Vergi Dairesi</label>
              <input
                name="vergiDairesi"
                defaultValue={sirket.vergiDairesi ?? ""}
                placeholder="Ümraniye V.D."
                className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Vergi Numarası</label>
              <input
                name="vergiNo"
                defaultValue={sirket.vergiNo ?? ""}
                placeholder="1234567890"
                className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <KaydetButonu basari={null}>Şirket Bilgilerini Kaydet</KaydetButonu>
          </div>
        </form>
      </div>

      {/* TEKLİF NOTLARI — GRUPLU */}
      {/* E-POSTA DURUMU: web talebi / keşif / teklif e-postaları gidiyor mu? */}
      <div id="eposta" className="bg-yuzey border border-hat rounded-lg p-5 mb-8 scroll-mt-6">
        <h2 className="font-display font-medium text-metin mb-1">✉️ E-posta Durumu</h2>
        <p className="text-xs text-metin/60 mb-4">
          Web sitesinden gelen talepler ve keşif bildirimleri aşağıdaki adrese e-posta olarak gönderilir. Talepler e-posta
          gitmese bile her zaman <Link href="/panel/talepler" className="text-soguk-dim hover:underline">Web Talepleri</Link>{" "}
          sayfasına kaydedilir.
        </p>

        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
          <div>
            <dt className="text-xs text-metin/50">Bildirimlerin gittiği adres</dt>
            <dd className="font-medium text-metin">{epostaAyar.bildirimAdresi}</dd>
          </div>
          <div>
            <dt className="text-xs text-metin/50">Gönderen hesap (SMTP)</dt>
            <dd className="font-medium text-metin">
              {smtpTamam ? (
                <>
                  {epostaAyar.user} <span className="text-metin/50 font-normal">· {epostaAyar.host}:{epostaAyar.port}</span>
                </>
              ) : (
                <span className="text-red-700">
                  Eksik ayar: {[!epostaAyar.host && "SMTP_HOST", !epostaAyar.user && "SMTP_USER", !epostaAyar.sifreVar && "SMTP_PASS"]
                    .filter(Boolean)
                    .join(", ")}{" "}
                  (Vercel → Settings → Environment Variables)
                </span>
              )}
            </dd>
          </div>
        </dl>

        <form action={epostaTestiGonder} className="mb-4">
          <KaydetButonu basari={null} bekleme="Gönderiliyor…">
            Deneme e-postası gönder
          </KaydetButonu>
          <span className="text-xs text-metin/50 ml-3">{epostaAyar.bildirimAdresi} adresine bir deneme e-postası gider.</span>
        </form>

        <p className="text-xs font-semibold text-metin/70 mb-2">Son gönderimler</p>
        {epostaSatirlari.length === 0 ? (
          <p className="text-xs text-metin/50">
            Henüz kayıt yok. (Bu liste bu güncellemeden sonra gönderilen e-postalarla dolmaya başlar.)
          </p>
        ) : (
          <ul className="divide-y divide-hat border border-hat rounded-md bg-white text-xs">
            {epostaSatirlari.map((e) => (
              <li key={e.id} className="px-3 py-2 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <span className={`font-bold ${e.basarili ? "text-emerald-700" : "text-red-700"}`}>
                  {e.basarili ? "✓ Gönderildi" : "✕ Gönderilemedi"}
                </span>
                <span className="font-mono text-metin/50">{zamanYaz.format(e.zaman)}</span>
                <span className="text-metin truncate max-w-xs">{e.konu}</span>
                <span className="text-metin/50">→ {e.alici}</span>
                {!e.basarili && e.hata && <span className="basis-full text-red-700">Neden: {e.hata}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div id="teklif-notlari" className="scroll-mt-6">
        <h2 className="font-display text-lg font-semibold text-metin mb-1">Teklif Notları</h2>
        <p className="text-xs text-metin/60 mb-4">
          <b>Not adı</b> yalnızca panelde görünür; kendi kodlarınızı yazabilirsiniz (örn. &quot;Ödeme Koşulları (Ç-9)&quot;).{" "}
          <b>Grup başlığı</b> müşteriye giden başlıktır (örn. &quot;Ödeme Koşulları&quot;). Aynı grup başlığına sahip notlar
          bir arada durur; teklif hazırlarken her gruptan uygun olanı seçersiniz. Grup başlığını boş bırakırsanız, not
          adının sonundaki parantezli kod atılarak otomatik oluşturulur.
        </p>
      </div>

      <datalist id="sablon-gruplari">
        {gruplar.map((g) => (
          <option key={g.grup} value={g.grup} />
        ))}
      </datalist>

      <div className="bg-yuzey border border-hat rounded-lg p-5 mb-8">
        <h3 className="font-display font-medium text-metin mb-4">Yeni Not Ekle</h3>
        <form action={sablonEkle} className="space-y-3">
          <div className="grid sm:grid-cols-[1fr_1fr_6rem] gap-3">
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Not adı (panelde görünür) *</label>
              <input
                name="baslik"
                required
                placeholder="örn. Ödeme Koşulları (Ç-9)"
                className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Grup başlığı (müşteriye görünür)</label>
              <input
                name="grupBaslik"
                list="sablon-gruplari"
                placeholder="örn. Ödeme Koşulları"
                className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Sıra</label>
              <input
                name="sira"
                type="number"
                defaultValue={sablonlar.length}
                className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
          <textarea
            name="icerik"
            rows={3}
            required
            placeholder="Müşteriye gidecek metin"
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
          />
          <KaydetButonu basari={null} bekleme="Ekleniyor…">Notu Ekle</KaydetButonu>
        </form>
      </div>

      <div className="space-y-8">
        {gruplar.map((g) => (
          <section key={g.grup}>
            <h3 className="font-display font-semibold text-metin mb-3 flex items-center gap-2">
              {g.grup}
              <span className="text-xs font-normal text-metin/45">
                ({g.notlar.length} not · müşteriye bu başlık görünür)
              </span>
            </h3>
            <div className="space-y-3">
              {g.notlar.map((s) => (
                <div key={s.id} id={`sablon-${s.id}`} className="bg-yuzey border border-hat rounded-lg p-5 scroll-mt-6">
                  <form action={sablonGuncelle} className="space-y-3">
                    <input type="hidden" name="id" value={s.id} />
                    <div className="grid sm:grid-cols-[1fr_1fr_6rem] gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-metin/50 mb-1">Not adı (panelde)</label>
                        <input
                          name="baslik"
                          defaultValue={s.baslik}
                          required
                          className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-metin/50 mb-1">Grup başlığı (müşteriye)</label>
                        <input
                          name="grupBaslik"
                          list="sablon-gruplari"
                          defaultValue={sablonGrubu(s)}
                          className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-metin/50 mb-1">Sıra</label>
                        <input
                          name="sira"
                          type="number"
                          defaultValue={s.sira}
                          className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <textarea
                      name="icerik"
                      defaultValue={s.icerik}
                      rows={3}
                      required
                      className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
                    />
                    <div className="flex items-center justify-between pt-1">
                      <KaydetButonu basari={null} className="focus-ring bg-soguk/10 text-soguk-dim px-4 py-1.5 rounded-md text-sm font-medium hover:bg-soguk/20 transition-colors">
                        Kaydet
                      </KaydetButonu>
                      <SilButon
                        id={s.id}
                        action={sablonSil}
                        onayMesaji="Bu notu silmek istediğine emin misin? Bu notun seçili olduğu eski tekliflerden de kalkar."
                      />
                    </div>
                  </form>
                </div>
              ))}
            </div>
          </section>
        ))}
        {sablonlar.length === 0 && <p className="text-sm text-metin/50">Henüz teklif notu eklenmedi.</p>}
      </div>
    </div>
  );
}