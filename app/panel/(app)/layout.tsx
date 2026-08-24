import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cikisYap } from "@/lib/auth-actions";
import { suankiKullanici } from "@/lib/oturum";
import { prisma } from "@/lib/prisma";
import PanelMobilMenu from "@/components/PanelMobilMenu";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// "Profilim & Şifre" MENÜ DİZİSİNE EKLENDİ
const menuTemel = [
  { href: "/panel", label: "Özet" },
  { href: "/panel/stok", label: "Stok & Envanter" },
  { href: "/panel/genel-cari", label: "Genel Finans & Çekler" },
  { href: "/panel/talepler", label: "Web Talepleri" },
  { href: "/panel/musteriler", label: "Müşteriler" },
  { href: "/panel/projeler", label: "Projeler" },
  { href: "/panel/ziyaretler", label: "Ziyaretler" },
  { href: "/panel/teklifler", label: "Teklifler" },
  { href: "/panel/kesif", label: "Keşif" },
  { href: "/panel/siparisler", label: "Siparişler" },
  { href: "/panel/cari", label: "Cari Hesap" },
  { href: "/panel/satinalma", label: "Satınalma" },
  { href: "/panel/ayarlar", label: "Ayarlar" },
  { href: "/panel/profil", label: "Profilim & Şifre" }, // <--- MENÜYE EKLENDİ
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const kullanici = await suankiKullanici();
  if (!kullanici) redirect("/panel/giris");

  const bugun = new Date();
  bugun.setHours(23, 59, 59, 999);

  // CANLI UYARI ROZET SAYILARI
  const [okunmamisTalep, bekleyenHatirlatma, yeniKesifSayisi, takiptekiProjeSayisi] = await Promise.all([
    prisma.webTalebi.count({ where: { okundu: false } }),
    prisma.ziyaret.count({ where: { hatirlatmaTamam: false, hatirlatmaTarihi: { lte: bugun, not: null } } }),
    prisma.kesifFormu.count({ where: { olusturulanTeklifId: null } }),
    prisma.proje.count({ where: { ihaleDurumu: "TAKIPTE" } }),
  ]);

  const rozetler: Record<string, number> = {
    "/panel/talepler": okunmamisTalep,
    "/panel/ziyaretler": bekleyenHatirlatma,
    "/panel/kesif": yeniKesifSayisi,
    "/panel/projeler": takiptekiProjeSayisi,
  };

  const menu =
    kullanici.rol === "ADMIN"
      ? [...menuTemel, { href: "/panel/kullanicilar", label: "Kullanıcılar" }]
      : menuTemel;

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-zemin">
      <PanelMobilMenu menu={menu} rozetler={rozetler} />
      <aside className="w-56 shrink-0 border-r border-hat bg-yuzey hidden sm:flex flex-col print:hidden">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-hat">
          <Link href="/" className="flex items-center gap-2 focus-ring">
            <Image src="/logo-icon.png" alt="İklim Ofisi" width={24} height={24} />
            <span className="font-display font-semibold text-metin">
              İklim <span className="text-soguk">Ofisi</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          {menu.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="focus-ring flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-metin/75 hover:bg-soguk-light hover:text-soguk-dim transition-colors"
            >
              {m.label}
              {rozetler[m.href] && rozetler[m.href] > 0 ? (
                <span className="text-xs bg-sicak text-white rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {rozetler[m.href]}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        {/* SOL EN ALT KULLANICI BİLGİSİ VE PROFİLİM LİNKİ */}
        <div className="p-4 border-t border-hat space-y-2">
          <Link href="/panel/profil" className="block group">
            <p className="text-xs font-bold text-metin group-hover:text-soguk-dim transition-colors">
              {kullanici.ad} <span className="text-metin/30">· {kullanici.rol === "ADMIN" ? "Yönetici" : "Satış"}</span>
            </p>
            <p className="text-[10px] text-soguk-dim font-semibold group-hover:underline">⚙️ Profilim & Şifre Değiştir</p>
          </Link>

          <Link href="/" className="block text-xs text-metin/50 hover:text-metin focus-ring pt-1">
            ← Siteye dön
          </Link>
          <form action={cikisYap}>
            <button type="submit" className="text-xs text-metin/50 hover:text-sicak-dim focus-ring">
              Çıkış yap
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 px-6 sm:px-10 py-10 max-w-5xl print:p-0 print:max-w-none">{children}</main>
    </div>
  );
}