import { getSirketAyarlari } from "@/lib/sirket";
import { sirketAyarlariGuncelle } from "@/lib/actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SirketAyarlariPage() {
  const sirket = await getSirketAyarlari();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/panel/ayarlar" className="text-xs text-metin/50 hover:underline">
          ← Ayarlara Dön
        </Link>
        <span className="text-metin/30">/</span>
        <h1 className="font-display text-xl font-semibold text-metin">Şirket Bilgileri & Adres Ayarları</h1>
      </div>

      <form action={sirketAyarlariGuncelle} className="bg-yuzey border border-hat rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-metin/70 mb-1">Şirket Unvanı *</label>
          <input
            name="unvan"
            required
            defaultValue={sirket.unvan}
            placeholder="Örn: İklim Ofisi Mühendislik A.Ş."
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-metin/70 mb-1">Slogan / Faaliyet Alanı</label>
          <input
            name="slogan"
            defaultValue={sirket.slogan ?? ""}
            placeholder="Örn: İklimlendirme & VRF Sistem Çözümleri"
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-metin/70 mb-1">Şirket Adresi (Tekliflerde Görünür) *</label>
          <textarea
            name="adres"
            rows={3}
            required
            defaultValue={sirket.adres ?? ""}
            placeholder="Şirketinizin açık adresi..."
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-metin/70 mb-1">Telefon / Santral</label>
            <input
              name="telefon"
              defaultValue={sirket.telefon ?? ""}
              placeholder="+90 (216) 450 00 00"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-metin/70 mb-1">E-posta Adresi</label>
            <input
              name="email"
              type="email"
              defaultValue={sirket.email ?? ""}
              placeholder="info@iklimofisi.com"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 border-t border-hat pt-4">
          <div>
            <label className="block text-xs font-semibold text-metin/70 mb-1">Web Sitesi</label>
            <input
              name="web"
              defaultValue={sirket.web ?? ""}
              placeholder="www.iklimofisi.com"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-metin/70 mb-1">Vergi Dairesi</label>
            <input
              name="vergiDairesi"
              defaultValue={sirket.vergiDairesi ?? ""}
              placeholder="Ümraniye V.D."
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-metin/70 mb-1">Vergi Numarası</label>
            <input
              name="vergiNo"
              defaultValue={sirket.vergiNo ?? ""}
              placeholder="1234567890"
              className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-hat">
          <button
            type="submit"
            className="focus-ring bg-soguk text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
          >
            Şirket Bilgilerini Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}