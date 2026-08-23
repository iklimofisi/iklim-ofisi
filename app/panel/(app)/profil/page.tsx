import { suankiKullanici } from "@/lib/oturum";
import { profilGuncelle } from "@/lib/actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: { basarili?: string; hata?: string };
}) {
  const kullanici = await suankiKullanici();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-metin">Profil Bilgilerim & Şifre Değiştir</h1>
        <p className="text-xs text-metin/60 mt-1">Tekliflerde görünen iletişim bilgilerinizi ve giriş şifrenizi buradan güncelleyebilirsiniz.</p>
      </div>

      {searchParams?.basarili && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md p-3 text-xs font-semibold">
          ✓ Profil bilgileriniz ve şifreniz başarıyla güncellendi.
        </div>
      )}

      {searchParams?.hata === "sifre-yanlis" && (
        <div className="bg-rose-50 text-rose-800 border border-rose-200 rounded-md p-3 text-xs font-semibold">
          ✕ Mevcut şifrenizi hatalı girdiniz! Şifre değiştirilemedi.
        </div>
      )}

      <form action={profilGuncelle} className="bg-yuzey border border-hat rounded-lg p-6 space-y-4 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-metin/70 mb-1">Ad Soyad *</label>
          <input
            name="ad"
            required
            defaultValue={kullanici?.ad}
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-metin/70 mb-1">E-posta Adresi (Değiştirilemez)</label>
          <input
            type="email"
            disabled
            value={kullanici?.email}
            className="w-full border border-hat rounded-md px-3 py-2 text-sm bg-slate-100 text-metin/50 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-metin/70 mb-1">Telefon Numarası (Tekliflerin Altında Görünür)</label>
          <input
            name="telefon"
            defaultValue={(kullanici as any)?.telefon ?? ""}
            placeholder="+90 (5xx) xxx xx xx"
            className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white font-mono"
          />
        </div>

        {/* ŞİFRE DEĞİŞTİRME BÖLÜMÜ */}
        <div className="border-t border-hat pt-4 mt-4 space-y-3">
          <p className="text-xs font-bold text-soguk-dim uppercase tracking-wider">Giriş Şifresini Değiştir (Opsiyonel)</p>
          <p className="text-[11px] text-metin/50">Şifrenizi değiştirmek istemiyorsanız bu alanları boş bırakabilirsiniz.</p>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Mevcut Şifreniz</label>
              <input
                name="mevcutSifre"
                type="password"
                placeholder="******"
                className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-metin/60 mb-1">Yeni Şifreniz (En az 6 karakter)</label>
              <input
                name="yeniSifre"
                type="password"
                placeholder="******"
                className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm bg-white"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-soguk-dim transition-colors"
          >
            Bilgilerimi Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}