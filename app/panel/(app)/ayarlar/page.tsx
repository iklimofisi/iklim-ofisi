import { prisma } from "@/lib/prisma";
import { sablonEkle, sablonGuncelle, sablonSil, sirketAyarlariGuncelle } from "@/lib/actions";
import { getSirketAyarlari } from "@/lib/sirket";
import { suankiKullanici } from "@/lib/oturum"; // YETKİ KONTROLÜ İÇİN EKLENDİ
import { redirect } from "next/navigation";
import SilButon from "@/components/SilButon";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AyarlarSayfasi() {
  const kullanici = await suankiKullanici();

  // YÖNETİCİ DEĞİLSE AYARLAR SAYFASINA ERİŞEMEZ
  if (!kullanici || kullanici.rol !== "ADMIN") {
    redirect("/panel?hata=yetkisiz-erisim");
  }

  const [sablonlar, sirket] = await Promise.all([
    prisma.teklifSablon.findMany({ orderBy: { sira: "asc" } }),
    getSirketAyarlari(),
  ]);

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">Ayarlar</h1>
      <p className="text-sm text-metin/60 mb-2">
        Buradaki başlık/metinler her teklif çıktısının (PDF) altında otomatik
        görünür. "Sıra" sayısı küçük olan üstte çıkar.
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
            <button
              type="submit"
              className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
            >
              Şirket Bilgilerini Kaydet
            </button>
          </div>
        </form>
      </div>

      {/* ORİJİNAL TEKLİF ŞABLONLARI FORMU (HİÇ DOKUNULMADI) */}
      <div className="bg-yuzey border border-hat rounded-lg p-5 mb-8">
        <h2 className="font-display font-medium text-metin mb-4">Yeni Bölüm Ekle</h2>
        <form action={sablonEkle} className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <input
              name="baslik"
              required
              placeholder="Başlık (örn. Ürün Teslimi)"
              className="focus-ring flex-1 min-w-[220px] border border-hat rounded-md px-3 py-2 text-sm"
            />
            <input
              name="sira"
              type="number"
              defaultValue={sablonlar.length}
              placeholder="Sıra"
              className="focus-ring w-24 border border-hat rounded-md px-3 py-2 text-sm"
            />
          </div>
          <textarea
            name="icerik"
            rows={3}
            required
            placeholder="Açıklama metni"
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
          >
            Ekle
          </button>
        </form>
      </div>

      {/* MEVCUT ŞABLON KARTLARI VE SİL BUTONLARI (ORİJİNAL KORUNDU) */}
      <div className="space-y-4">
        {sablonlar.map((s) => (
          <div key={s.id} className="bg-yuzey border border-hat rounded-lg p-5">
            <form action={sablonGuncelle} className="space-y-3">
              <input type="hidden" name="id" value={s.id} />
              <div className="flex flex-wrap gap-3">
                <input
                  name="baslik"
                  defaultValue={s.baslik}
                  required
                  className="focus-ring flex-1 min-w-[220px] border border-hat rounded-md px-3 py-2 text-sm font-medium"
                />
                <input
                  name="sira"
                  type="number"
                  defaultValue={s.sira}
                  className="focus-ring w-24 border border-hat rounded-md px-3 py-2 text-sm"
                />
              </div>
              <textarea
                name="icerik"
                defaultValue={s.icerik}
                rows={3}
                required
                className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm"
              />
              <div className="flex items-center justify-between pt-1">
                <button
                  type="submit"
                  className="focus-ring text-sm text-soguk-dim font-medium hover:underline"
                >
                  Güncelle
                </button>
                <SilButon id={s.id} action={sablonSil} onayMesaji="Bu bölümü silmek istediğine emin misin?" />
              </div>
            </form>
          </div>
        ))}
        {sablonlar.length === 0 && (
          <p className="text-sm text-metin/50">Henüz bölüm eklenmedi.</p>
        )}
      </div>
    </div>
  );
}