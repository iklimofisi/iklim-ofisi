import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { suankiKullanici, sayfaYetkisi } from "@/lib/oturum";
import { kullaniciEkle, kullaniciSil, kullaniciRolGuncelle } from "@/lib/actions";
import { ROLLER, ROL_ETIKET, BOLUM_ETIKET, gorebilir, yazabilir } from "@/lib/roller";
import SilButon from "@/components/SilButon";
import SifreSifirlaFormu from "@/components/SifreSifirlaFormu";
import KaydetButonu from "@/components/KaydetButonu";

export const dynamic = "force-dynamic";

export default async function KullanicilarSayfasi() {
  await sayfaYetkisi("yonetim");
  const giren = await suankiKullanici();
  if (!giren || giren.rol !== "ADMIN") redirect("/panel");

  const kullanicilar = await prisma.kullanici.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">Kullanıcılar</h1>
      <p className="text-sm text-metin/60 mb-4">
        Buradan eklediğin herkes kendi e-posta/şifresiyle panele girer ve yalnız rolünün izin verdiği bölümleri görür.
        Satış personeli satınalma maliyetlerini, alış fiyatlarını ve kârı görmez. Onaylar, iptaller ve silmeler yine yalnız satış müdüründedir.
      </p>

      {/* ROL YETKİ TABLOSU (lib/roller.ts'ten üretilir; tablo ile sistem hep aynıdır) */}
      <details className="bg-yuzey border border-hat rounded-lg mb-8">
        <summary className="cursor-pointer select-none px-5 py-3 text-sm font-medium text-metin/70">Rollerin yetkileri (tablo)</summary>
        <div className="overflow-x-auto px-5 pb-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-metin/50 border-b border-hat">
                <th className="py-2 pr-3 font-medium">Bölüm</th>
                {ROLLER.map((r) => (
                  <th key={r} className="py-2 px-2 font-medium text-center whitespace-nowrap">
                    {ROL_ETIKET[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hat">
              {BOLUM_ETIKET.map(([b, etiket]) => (
                <tr key={b}>
                  <td className="py-1.5 pr-3 text-metin/80">{etiket}</td>
                  {ROLLER.map((r) => (
                    <td key={r} className="py-1.5 px-2 text-center whitespace-nowrap">
                      {yazabilir(r, b) ? (
                        <span className="text-emerald-700 font-medium">✎ düzenler</span>
                      ) : gorebilir(r, b) ? (
                        <span className="text-soguk-dim">👁 görür</span>
                      ) : (
                        <span className="text-metin/30">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11px] text-metin/45 mt-2">Özet, notlar ve profil herkese açıktır. Rol değişikliği kullanıcının bir sonraki sayfa açışında geçerli olur.</p>
        </div>
      </details>

      <form action={kullaniciEkle} className="bg-yuzey border border-hat rounded-lg p-5 mb-8 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-metin/60 mb-1">Ad Soyad</label>
          <input name="ad" required className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-metin/60 mb-1">E-posta</label>
          <input name="email" type="email" required className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-metin/60 mb-1">Şifre (en az 6 karakter)</label>
          <input name="sifre" type="password" required minLength={6} className="focus-ring w-full border border-hat rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-metin/60 mb-1">Rol</label>
          <select name="rol" defaultValue="SATIS" className="focus-ring border border-hat rounded-md px-3 py-2 text-sm">
            {ROLLER.map((r) => (
              <option key={r} value={r}>
                {ROL_ETIKET[r]}
              </option>
            ))}
          </select>
        </div>
        <KaydetButonu basari="Eklendi."
          className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
        >
          Ekle
        </KaydetButonu>
      </form>

      <div className="bg-yuzey border border-hat rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-metin/50 border-b border-hat">
              <th className="px-5 py-3 font-medium">Ad</th>
              <th className="px-5 py-3 font-medium">E-posta</th>
              <th className="px-5 py-3 font-medium">Rol</th>
              <th className="px-5 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {kullanicilar.map((k) => (
              <tr key={k.id} className="border-b border-hat last:border-0">
                <td className="px-5 py-3 text-metin">{k.ad}</td>
                <td className="px-5 py-3 font-mono text-metin/70">{k.email}</td>
                <td className="px-5 py-3 text-metin/60">
                  {k.id === giren.id ? (
                    ROL_ETIKET[k.rol] ?? k.rol
                  ) : (
                    <form action={kullaniciRolGuncelle} className="flex items-center gap-1.5">
                      <input type="hidden" name="kullaniciId" value={k.id} />
                      <select name="rol" defaultValue={k.rol} aria-label={`${k.ad} rolü`} className="focus-ring border border-hat rounded px-2 py-1 text-xs bg-white">
                        {ROLLER.map((r) => (
                          <option key={r} value={r}>
                            {ROL_ETIKET[r]}
                          </option>
                        ))}
                      </select>
                      <KaydetButonu basari="Rol güncellendi." className="focus-ring text-xs border border-hat rounded px-2 py-1 hover:bg-hat">
                        Kaydet
                      </KaydetButonu>
                    </form>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <SifreSifirlaFormu kullaniciId={k.id} />
                    {k.id !== giren.id && (
                      <SilButon id={k.id} action={kullaniciSil} onayMesaji={`${k.ad} adlı kullanıcıyı silmek istediğinize emin misiniz?`} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
