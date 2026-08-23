import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { suankiKullanici } from "@/lib/oturum";
import { kullaniciEkle, kullaniciSil } from "@/lib/actions";
import SilButon from "@/components/SilButon";
import SifreSifirlaFormu from "@/components/SifreSifirlaFormu";

export const dynamic = "force-dynamic";

export default async function KullanicilarSayfasi() {
  const giren = await suankiKullanici();
  if (!giren || giren.rol !== "ADMIN") redirect("/panel");

  const kullanicilar = await prisma.kullanici.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-soguk-dim uppercase mb-2">Panel</p>
      <h1 className="font-display text-2xl font-semibold text-metin mb-2">Kullanıcılar</h1>
      <p className="text-sm text-metin/60 mb-8">
        Buradan eklediğin herkes kendi e-posta/şifresiyle panele girip
        teklif/müşteri/sipariş üzerinde çalışabilir. Sadece "Yönetici" rolü
        bu sayfayı ve kullanıcı ekleme/silmeyi görebilir.
      </p>

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
            <option value="SATIS">Satış</option>
            <option value="ADMIN">Yönetici</option>
          </select>
        </div>
        <button
          type="submit"
          className="focus-ring bg-soguk text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-soguk-dim transition-colors"
        >
          Ekle
        </button>
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
                <td className="px-5 py-3 text-metin/60">{k.rol === "ADMIN" ? "Yönetici" : "Satış"}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <SifreSifirlaFormu kullaniciId={k.id} />
                    {k.id !== giren.id && (
                      <SilButon id={k.id} action={kullaniciSil} onayMesaji={`${k.ad} adlı kullanıcıyı silmek istediğine emin misin?`} />
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
